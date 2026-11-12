/**
 * /api/redemptions — canjes de recompensas.
 *
 * POST  (visitante) solicita un canje → queda «pendiente» hasta que el
 *       comercio lo confirma en POST /api/redemptions/confirm.
 *   Body: { rewardId: string; profileId?: string }   (defecto: visitante-demo)
 *   Response 201: { ok: true; redemption: { id; code; status; rewardTitle; costPoints } }
 *   Los puntos NO se descuentan aquí: se descuentan al confirmar.
 *
 * GET   (comercio) lista los canjes de sus negocios, más recientes primero.
 *   Query: ?profileId=<uuid> (defecto: comercio-demo) &status=pendiente|confirmado
 *   Response: { id; code; visitorAlias; rewardTitle; costPoints; status; timestamp }[]
 */
import { NextRequest, NextResponse, connection } from "next/server";
import { z } from "zod";
import { getAdminClient } from "@/lib/db/server";

const PENDIENTE = "pendiente";

const postSchema = z.object({
  rewardId: z.guid({ message: "rewardId inválido" }),
  profileId: z.guid({ message: "profileId inválido" }).optional(),
});

const statusSchema = z.enum(["pendiente", "confirmado"]).optional();

/** Código corto y legible para mostrar en el mostrador. */
function codigoDe(id: string): string {
  return `PJ-${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

/** Une el resultado de un join de Supabase (objeto o arreglo) en un objeto. */
function uno<T>(x: T | T[] | null | undefined): T | null {
  return (Array.isArray(x) ? x[0] : x) ?? null;
}

function haceCuanto(iso: string): string {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (min < 1) return "Ahora";
  if (min < 60) return `Hace ${min} min`;
  const h = Math.round(min / 60);
  return h < 24 ? `Hace ${h} h` : `Hace ${Math.round(h / 24)} d`;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 },
    );
  }
  const { rewardId, profileId: rawProfileId } = parsed.data;

  try {
    const supabase = getAdminClient();

    // 1. Perfil del visitante (enviado o demo)
    const perfilQuery = supabase.from("profiles").select("id, points");
    const { data: visitante } = rawProfileId
      ? await perfilQuery.eq("id", rawProfileId).maybeSingle()
      : await perfilQuery.eq("alias", "visitante-demo").maybeSingle();

    if (!visitante) {
      return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
    }

    // 2. Recompensa vigente
    const { data: reward } = await supabase
      .from("rewards")
      .select("id, title, cost_points, valid_until")
      .eq("id", rewardId)
      .maybeSingle();

    if (!reward) {
      return NextResponse.json({ error: "Recompensa no encontrada" }, { status: 404 });
    }
    if (reward.valid_until && new Date(reward.valid_until) < new Date()) {
      return NextResponse.json({ error: "La recompensa ya venció" }, { status: 409 });
    }

    // 3. Puntos suficientes (se vuelven a revisar al confirmar)
    const costo = Number(reward.cost_points ?? 0);
    if (Number(visitante.points ?? 0) < costo) {
      return NextResponse.json({ error: "No tienes puntos suficientes" }, { status: 409 });
    }

    // 4. Un solo canje pendiente por recompensa: si ya existe, se devuelve
    const { data: existente } = await supabase
      .from("redemptions")
      .select("id, status")
      .eq("profile_id", visitante.id)
      .eq("reward_id", rewardId)
      .eq("status", PENDIENTE)
      .limit(1)
      .maybeSingle();

    let id = existente?.id as string | undefined;
    if (!id) {
      const { data: nuevo, error: insertError } = await supabase
        .from("redemptions")
        .insert({ profile_id: visitante.id, reward_id: rewardId, status: PENDIENTE })
        .select("id")
        .single();

      if (insertError || !nuevo) {
        return NextResponse.json(
          { error: insertError?.message ?? "No se pudo crear el canje" },
          { status: 500 },
        );
      }
      id = nuevo.id as string;
    }

    return NextResponse.json(
      {
        ok: true,
        redemption: {
          id,
          code: codigoDe(id),
          status: PENDIENTE,
          rewardTitle: String(reward.title),
          costPoints: costo,
        },
      },
      { status: existente ? 200 : 201 },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error inesperado al crear el canje";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  // Siempre dinámico: nunca se prerenderiza en el build (cacheComponents).
  await connection();

  const { searchParams } = new URL(req.url);
  const rawProfileId = searchParams.get("profileId");
  const status = statusSchema.safeParse(searchParams.get("status") ?? undefined);
  if (!status.success) {
    return NextResponse.json({ error: "status inválido" }, { status: 400 });
  }
  if (rawProfileId && !z.guid().safeParse(rawProfileId).success) {
    return NextResponse.json({ error: "profileId inválido" }, { status: 400 });
  }

  try {
    const supabase = getAdminClient();

    // 1. Comercio (enviado o demo) y verificación de rol
    const perfilQuery = supabase.from("profiles").select("id, role");
    const { data: comercio } = rawProfileId
      ? await perfilQuery.eq("id", rawProfileId).maybeSingle()
      : await perfilQuery.eq("alias", "comercio-demo").maybeSingle();

    if (!comercio) {
      return NextResponse.json({ error: "Perfil de comercio no encontrado" }, { status: 401 });
    }
    if (comercio.role !== "comercio") {
      return NextResponse.json({ error: "Solo un comercio puede ver sus canjes" }, { status: 403 });
    }

    // 2. Canjes de recompensas cuyos negocios pertenecen a este comercio
    let query = supabase
      .from("redemptions")
      .select(
        "id, status, created_at, profiles(alias), rewards!inner(title, cost_points, businesses!inner(owner_id))",
      )
      .eq("rewards.businesses.owner_id", comercio.id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (status.data) query = query.eq("status", status.data);

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const canjes = (data ?? []).map((row) => {
      const reward = uno(row.rewards as unknown as { title: string; cost_points: number } | null);
      const perfil = uno(row.profiles as unknown as { alias: string } | null);
      return {
        id: String(row.id),
        code: codigoDe(String(row.id)),
        visitorAlias: perfil?.alias || "Visitante",
        rewardTitle: reward?.title ?? "Recompensa",
        costPoints: Number(reward?.cost_points ?? 0),
        status: row.status === PENDIENTE ? "pendiente" : "confirmado",
        timestamp: haceCuanto(String(row.created_at)),
      };
    });

    return NextResponse.json(canjes);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error inesperado al consultar canjes";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
