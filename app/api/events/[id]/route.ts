/**
 * PATCH  /api/events/:id — edita un evento (admin: todo; comercio: solo los de sus lugares,
 *                          y nunca el campo verified).
 * DELETE /api/events/:id — elimina un evento con las mismas reglas de propiedad.
 */
import { NextResponse, connection } from "next/server";
import { z } from "zod";
import { getAdminClient } from "@/lib/db/server";
import { requireProfile } from "@/lib/db/auth";
import { toEvent } from "@/lib/db/mappers";
import { lugaresDelComercio } from "@/app/api/_lib/comercio";
import { eventoParcialSchema, eventoAFila, errorDeValidacion } from "@/app/api/_lib/esquemas";

const idSchema = z.guid({ message: "id de evento inválido" });

type Ctx = { params: Promise<{ id: string }> };

/** Valida sesión + id y comprueba que el comercio sea dueño del lugar del evento. */
async function autorizar(ctx: Ctx) {
  const auth = await requireProfile(["comercio", "admin"]);
  if ("response" in auth) return { response: auth.response };

  const { id } = await ctx.params;
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) {
    return { response: NextResponse.json(errorDeValidacion(parsedId.error), { status: 400 }) };
  }

  const supabase = getAdminClient();
  const { data: existente, error } = await supabase
    .from("events")
    .select("id, place_id")
    .eq("id", parsedId.data)
    .maybeSingle();
  if (error) return { response: NextResponse.json({ error: error.message }, { status: 500 }) };
  if (!existente) {
    return { response: NextResponse.json({ error: "Evento no encontrado" }, { status: 404 }) };
  }

  if (auth.profile.role === "comercio") {
    const misLugares = await lugaresDelComercio(auth.profile.id);
    if (!existente.place_id || !misLugares.includes(String(existente.place_id))) {
      return {
        response: NextResponse.json(
          { error: "Solo puedes gestionar los eventos de tu comercio" },
          { status: 403 },
        ),
      };
    }
  }

  return { profile: auth.profile, id: parsedId.data, supabase };
}

export async function PATCH(request: Request, ctx: Ctx) {
  await connection();
  try {
    const auth = await autorizar(ctx);
    if ("response" in auth) return auth.response;

    const cuerpo = await request.json().catch(() => null);
    const parsed = eventoParcialSchema.safeParse(cuerpo);
    if (!parsed.success) {
      return NextResponse.json(errorDeValidacion(parsed.error), { status: 400 });
    }

    const datos = { ...parsed.data };
    if (auth.profile.role === "comercio") delete datos.verified;

    // Un comercio tampoco puede mover el evento a un lugar ajeno.
    if (auth.profile.role === "comercio" && datos.placeId) {
      const misLugares = await lugaresDelComercio(auth.profile.id);
      if (!misLugares.includes(datos.placeId)) {
        return NextResponse.json(
          { error: "Solo puedes publicar eventos en los lugares de tu comercio" },
          { status: 403 },
        );
      }
    }

    const fila = eventoAFila(datos);
    if (Object.keys(fila).length === 0) {
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 });
    }

    const { data, error } = await auth.supabase
      .from("events")
      .update(fila)
      .eq("id", auth.id)
      .select("*, places(*)")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(toEvent(data as Record<string, unknown>));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error inesperado al editar el evento";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, ctx: Ctx) {
  await connection();
  try {
    const auth = await autorizar(ctx);
    if ("response" in auth) return auth.response;

    const { error } = await auth.supabase.from("events").delete().eq("id", auth.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error inesperado al eliminar el evento";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
