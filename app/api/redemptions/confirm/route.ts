/**
 * POST /api/redemptions/confirm
 * Un comercio confirma el canje de una recompensa en su local.
 *
 * Body: { redemptionId: string }   ·   Comercio = el de la sesión.
 * Response: { ok: true; totalPoints: number } | { error: string }
 *
 * Reglas:
 *  - Solo rol `comercio` (de sus propios negocios) o `admin`.
 *  - Un canje se confirma una sola vez.
 *  - Los puntos del visitante se descuentan aquí, en el servidor.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminClient } from "@/lib/db/server";
import { requireProfile } from "@/lib/db/auth";

const bodySchema = z.object({
  redemptionId: z.guid({ message: "redemptionId inválido" }),
});

const PENDIENTE = "pendiente";
const CONFIRMADO = "confirmado";

export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. Validar body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 },
    );
  }
  const { redemptionId } = parsed.data;

  try {
    const supabase = getAdminClient();

    // 2. Comercio de la sesión (el admin puede confirmar cualquiera)
    const auth = await requireProfile(["comercio", "admin"]);
    if ("response" in auth) return auth.response;
    const comercio = auth.profile;

    // 3. Canje con su recompensa y el negocio dueño
    const { data: canje, error: canjeError } = await supabase
      .from("redemptions")
      .select("id, profile_id, status, rewards(id, cost_points, valid_until, businesses(owner_id))")
      .eq("id", redemptionId)
      .maybeSingle();

    if (canjeError) {
      return NextResponse.json({ error: canjeError.message }, { status: 500 });
    }
    if (!canje) {
      return NextResponse.json({ error: "Canje no encontrado" }, { status: 404 });
    }
    // En la base, `status` es texto: 'pendiente' (defecto) → 'confirmado'.
    if (canje.status !== PENDIENTE) {
      return NextResponse.json({ error: "Este canje ya fue confirmado" }, { status: 409 });
    }

    const reward = (Array.isArray(canje.rewards) ? canje.rewards[0] : canje.rewards) as
      | { cost_points: number; valid_until: string | null; businesses: unknown }
      | null;
    if (!reward) {
      return NextResponse.json({ error: "Recompensa no encontrada" }, { status: 404 });
    }

    const negocio = (Array.isArray(reward.businesses) ? reward.businesses[0] : reward.businesses) as
      | { owner_id: string | null }
      | null;
    if (comercio.role !== "admin" && (!negocio || negocio.owner_id !== comercio.id)) {
      return NextResponse.json(
        { error: "Este canje no pertenece a tu comercio" },
        { status: 403 },
      );
    }

    if (reward.valid_until && new Date(reward.valid_until) < new Date()) {
      return NextResponse.json({ error: "La recompensa ya venció" }, { status: 409 });
    }

    // 4. El visitante debe tener puntos suficientes
    const costo = Number(reward.cost_points ?? 0);
    const { data: visitante } = await supabase
      .from("profiles")
      .select("points")
      .eq("id", canje.profile_id)
      .maybeSingle();

    if (!visitante || Number(visitante.points ?? 0) < costo) {
      return NextResponse.json(
        { error: "El visitante no tiene puntos suficientes" },
        { status: 409 },
      );
    }

    // 5. Marcar como confirmado solo si sigue pendiente (evita doble canje)
    const { data: actualizado, error: updateError } = await supabase
      .from("redemptions")
      .update({ status: CONFIRMADO, confirmed_at: new Date().toISOString() })
      .eq("id", redemptionId)
      .eq("status", PENDIENTE)
      .select("id");

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    if (!actualizado || actualizado.length === 0) {
      return NextResponse.json({ error: "Este canje ya fue confirmado" }, { status: 409 });
    }

    // 6. Descontar puntos de forma atómica
    const { data: totalPoints, error: pointsError } = await supabase.rpc("increment_points", {
      profile_id: canje.profile_id,
      delta: -costo,
    });

    if (pointsError) {
      return NextResponse.json({ error: pointsError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, totalPoints: Number(totalPoints ?? 0) });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error inesperado al confirmar el canje";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
