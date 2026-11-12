/**
 * PATCH  /api/places/:id — edita un lugar del catálogo (solo admin).
 * DELETE /api/places/:id — elimina un lugar (solo admin). Ojo: borra en cascada
 *                          sus negocios, QR y visitas (FK con ON DELETE CASCADE).
 */
import { NextResponse, connection } from "next/server";
import { z } from "zod";
import { getAdminClient } from "@/lib/db/server";
import { requireProfile } from "@/lib/db/auth";
import { toPlace } from "@/lib/db/mappers";
import { lugarParcialSchema, lugarAFila, errorDeValidacion } from "@/app/api/_lib/esquemas";

const idSchema = z.guid({ message: "id de lugar inválido" });

type Ctx = { params: Promise<{ id: string }> };

async function autorizar(ctx: Ctx) {
  const auth = await requireProfile(["admin"]);
  if ("response" in auth) return { response: auth.response };

  const { id } = await ctx.params;
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) {
    return { response: NextResponse.json(errorDeValidacion(parsedId.error), { status: 400 }) };
  }
  return { id: parsedId.data, supabase: getAdminClient() };
}

export async function PATCH(request: Request, ctx: Ctx) {
  await connection();
  try {
    const auth = await autorizar(ctx);
    if ("response" in auth) return auth.response;

    const cuerpo = await request.json().catch(() => null);
    const parsed = lugarParcialSchema.safeParse(cuerpo);
    if (!parsed.success) {
      return NextResponse.json(errorDeValidacion(parsed.error), { status: 400 });
    }

    const fila = lugarAFila(parsed.data);
    if (Object.keys(fila).length === 0) {
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 });
    }

    const { data, error } = await auth.supabase
      .from("places")
      .update(fila)
      .eq("id", auth.id)
      .select("*")
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Lugar no encontrado" }, { status: 404 });
    return NextResponse.json(toPlace(data as Record<string, unknown>));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error inesperado al editar el lugar";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, ctx: Ctx) {
  await connection();
  try {
    const auth = await autorizar(ctx);
    if ("response" in auth) return auth.response;

    const { error, count } = await auth.supabase
      .from("places")
      .delete({ count: "exact" })
      .eq("id", auth.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!count) return NextResponse.json({ error: "Lugar no encontrado" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error inesperado al eliminar el lugar";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
