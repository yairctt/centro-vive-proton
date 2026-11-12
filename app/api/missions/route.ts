/**
 * GET  /api/missions — lista todas las misiones con el nombre de su lugar
 *                      (solo admin: incluye las inactivas, para gestión).
 * POST /api/missions — crea una misión (solo admin; los puntos los define el servidor
 *                      al validar, aquí solo se configuran).
 */
import { NextRequest, NextResponse, connection } from "next/server";
import { getAdminClient } from "@/lib/db/server";
import { requireProfile } from "@/lib/db/auth";
import { cleanPlaceName, toMission } from "@/lib/db/mappers";
import { misionSchema, misionAFila, errorDeValidacion } from "@/app/api/_lib/esquemas";

function conLugar(row: Record<string, unknown>) {
  const placeRow = (Array.isArray(row.places) ? row.places[0] : row.places) as
    | Record<string, unknown>
    | null;
  return { ...toMission(row), placeName: placeRow ? cleanPlaceName(placeRow.name) : "" };
}

export async function GET() {
  await connection();
  try {
    const auth = await requireProfile(["admin"]);
    if ("response" in auth) return auth.response;

    const { data, error } = await getAdminClient()
      .from("missions")
      .select("*, places(name)")
      .order("title", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json((data ?? []).map((row) => conLugar(row as Record<string, unknown>)));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error inesperado al listar misiones";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await connection();
  try {
    const auth = await requireProfile(["admin"]);
    if ("response" in auth) return auth.response;

    const cuerpo = await request.json().catch(() => null);
    const parsed = misionSchema.safeParse(cuerpo);
    if (!parsed.success) {
      return NextResponse.json(errorDeValidacion(parsed.error), { status: 400 });
    }

    const { data, error } = await getAdminClient()
      .from("missions")
      .insert(misionAFila(parsed.data))
      .select("*, places(name)")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(conLugar(data as Record<string, unknown>), { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error inesperado al crear la misión";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
