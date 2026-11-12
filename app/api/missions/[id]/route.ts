/**
 * GET    /api/missions/:id — misión con su lugar, para la pantalla /mision/[id].
 * PATCH  /api/missions/:id — edita una misión (solo admin).
 * DELETE /api/missions/:id — elimina una misión (solo admin).
 *
 * GET Response: { mission: Mission; place: Place | null } | { error: string }
 */
import { NextResponse, connection } from "next/server";
import { z } from "zod";
import { getAdminClient } from "@/lib/db/server";
import { requireProfile } from "@/lib/db/auth";
import { toPlace, toMission } from "@/lib/db/mappers";
import { adaptarMision } from "@/app/api/route/adaptar";
import { misionParcialSchema, misionAFila, errorDeValidacion } from "@/app/api/_lib/esquemas";

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

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  await connection();
  try {
    const auth = await requireProfile(["admin"]);
    if ("response" in auth) return auth.response;

    const { id } = await ctx.params;
    const parsedId = idSchema.safeParse(id);
    if (!parsedId.success) {
      return NextResponse.json(errorDeValidacion(parsedId.error), { status: 400 });
    }

    const cuerpo = await request.json().catch(() => null);
    const parsed = misionParcialSchema.safeParse(cuerpo);
    if (!parsed.success) {
      return NextResponse.json(errorDeValidacion(parsed.error), { status: 400 });
    }

    const fila = misionAFila(parsed.data);
    if (Object.keys(fila).length === 0) {
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 });
    }

    const { data, error } = await getAdminClient()
      .from("missions")
      .update(fila)
      .eq("id", parsedId.data)
      .select("*")
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Misión no encontrada" }, { status: 404 });
    return NextResponse.json(toMission(data as Record<string, unknown>));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error inesperado al editar la misión";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  await connection();
  try {
    const auth = await requireProfile(["admin"]);
    if ("response" in auth) return auth.response;

    const { id } = await ctx.params;
    const parsedId = idSchema.safeParse(id);
    if (!parsedId.success) {
      return NextResponse.json(errorDeValidacion(parsedId.error), { status: 400 });
    }

    const { error, count } = await getAdminClient()
      .from("missions")
      .delete({ count: "exact" })
      .eq("id", parsedId.data);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!count) return NextResponse.json({ error: "Misión no encontrada" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error inesperado al eliminar la misión";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
