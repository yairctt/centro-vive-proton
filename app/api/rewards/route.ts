/**
 * GET  /api/rewards — lista recompensas con el nombre del negocio/lugar.
 *                     comercio: solo las de sus negocios. admin: todas.
 * POST /api/rewards — crea una recompensa. comercio: en su propio negocio
 *                     (si solo tiene uno, businessId es opcional). admin: en cualquiera.
 */
import { NextRequest, NextResponse, connection } from "next/server";
import { getAdminClient } from "@/lib/db/server";
import { requireProfile } from "@/lib/db/auth";
import { toReward } from "@/lib/db/mappers";
import { negociosDelComercio } from "@/app/api/_lib/comercio";
import { recompensaSchema, recompensaAFila, errorDeValidacion } from "@/app/api/_lib/esquemas";

function conNegocio(row: Record<string, unknown>) {
  const negocio = (Array.isArray(row.businesses) ? row.businesses[0] : row.businesses) as
    | Record<string, unknown>
    | null;
  const lugar = negocio
    ? ((Array.isArray(negocio.places) ? negocio.places[0] : negocio.places) as
        | Record<string, unknown>
        | null)
    : null;
  return { ...toReward(row), businessName: lugar ? String(lugar.name ?? "") : "" };
}

const SELECT = "*, businesses(id, place_id, places(name))";

export async function GET() {
  await connection();
  try {
    const auth = await requireProfile(["comercio", "admin"]);
    if ("response" in auth) return auth.response;

    let query = getAdminClient().from("rewards").select(SELECT).order("title", { ascending: true });

    if (auth.profile.role === "comercio") {
      const misNegocios = await negociosDelComercio(auth.profile.id);
      if (misNegocios.length === 0) return NextResponse.json([]);
      query = query.in("business_id", misNegocios);
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json((data ?? []).map((row) => conNegocio(row as Record<string, unknown>)));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error inesperado al listar recompensas";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await connection();
  try {
    const auth = await requireProfile(["comercio", "admin"]);
    if ("response" in auth) return auth.response;

    const cuerpo = await request.json().catch(() => null);
    const parsed = recompensaSchema.safeParse(cuerpo);
    if (!parsed.success) {
      return NextResponse.json(errorDeValidacion(parsed.error), { status: 400 });
    }
    if (parsed.data.costPoints === undefined && parsed.data.pointsCost === undefined) {
      return NextResponse.json({ error: "Falta el costo en puntos" }, { status: 400 });
    }

    let businessId = parsed.data.businessId;
    if (auth.profile.role === "comercio") {
      const misNegocios = await negociosDelComercio(auth.profile.id);
      if (misNegocios.length === 0) {
        return NextResponse.json(
          { error: "Tu perfil no tiene un negocio asignado todavía" },
          { status: 403 },
        );
      }
      if (businessId && !misNegocios.includes(businessId)) {
        return NextResponse.json(
          { error: "Solo puedes crear recompensas en tu propio negocio" },
          { status: 403 },
        );
      }
      businessId = businessId ?? misNegocios[0];
    } else if (!businessId) {
      return NextResponse.json({ error: "Falta businessId" }, { status: 400 });
    }

    const fila = { ...recompensaAFila(parsed.data), business_id: businessId };
    const { data, error } = await getAdminClient()
      .from("rewards")
      .insert(fila)
      .select(SELECT)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(conNegocio(data as Record<string, unknown>), { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error inesperado al crear la recompensa";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
