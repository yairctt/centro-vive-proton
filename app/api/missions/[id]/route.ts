/**
 * GET /api/missions/:id
 * Devuelve una misión con su lugar, para la pantalla /mision/[id].
 *
 * Response: { mission: Mission; place: Place | null } | { error: string }
 */
import { NextResponse, connection } from "next/server";
import { z } from "zod";
import { getAdminClient } from "@/lib/db/server";
import { toPlace } from "@/lib/db/mappers";
import { adaptarMision } from "@/app/api/route/adaptar";

const idSchema = z.guid({ message: "id de misión inválido" });

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  await connection();
  const { id } = await ctx.params;

  const parsed = idSchema.safeParse(id);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "id inválido" }, { status: 400 });
  }

  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase.from("missions").select("*, places(*)").eq("id", parsed.data).maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Misión no encontrada" }, { status: 404 });

    const row = data as Record<string, unknown>;
    const placeRow = (Array.isArray(row.places) ? row.places[0] : row.places) as Record<string, unknown> | null;

    return NextResponse.json({
      mission: adaptarMision(row),
      place: placeRow ? toPlace(placeRow) : null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error inesperado al consultar la misión";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
