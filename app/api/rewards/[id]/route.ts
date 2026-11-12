/**
 * PATCH  /api/rewards/:id — edita una recompensa (admin: cualquiera; comercio: las suyas).
 * DELETE /api/rewards/:id — elimina una recompensa con las mismas reglas.
 */
import { NextResponse, connection } from "next/server";
import { z } from "zod";
import { getAdminClient } from "@/lib/db/server";
import { requireProfile } from "@/lib/db/auth";
import { toReward } from "@/lib/db/mappers";
import { negociosDelComercio } from "@/app/api/_lib/comercio";
import { recompensaParcialSchema, recompensaAFila, errorDeValidacion } from "@/app/api/_lib/esquemas";

const idSchema = z.guid({ message: "id de recompensa inválido" });

type Ctx = { params: Promise<{ id: string }> };

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
    .from("rewards")
    .select("id, business_id")
    .eq("id", parsedId.data)
    .maybeSingle();
  if (error) return { response: NextResponse.json({ error: error.message }, { status: 500 }) };
  if (!existente) {
    return { response: NextResponse.json({ error: "Recompensa no encontrada" }, { status: 404 }) };
  }

  let misNegocios: string[] | null = null;
  if (auth.profile.role === "comercio") {
    misNegocios = await negociosDelComercio(auth.profile.id);
    if (!misNegocios.includes(String(existente.business_id))) {
      return {
        response: NextResponse.json(
          { error: "Solo puedes gestionar las recompensas de tu negocio" },
          { status: 403 },
        ),
      };
    }
  }

  return { profile: auth.profile, id: parsedId.data, supabase, misNegocios };
}

export async function PATCH(request: Request, ctx: Ctx) {
  await connection();
  try {
    const auth = await autorizar(ctx);
    if ("response" in auth) return auth.response;

    const cuerpo = await request.json().catch(() => null);
    const parsed = recompensaParcialSchema.safeParse(cuerpo);
    if (!parsed.success) {
      return NextResponse.json(errorDeValidacion(parsed.error), { status: 400 });
    }

    // Un comercio no puede mover la recompensa a un negocio ajeno.
    if (auth.misNegocios && parsed.data.businessId && !auth.misNegocios.includes(parsed.data.businessId)) {
      return NextResponse.json(
        { error: "Solo puedes gestionar las recompensas de tu negocio" },
        { status: 403 },
      );
    }

    const fila = recompensaAFila(parsed.data);
    if (Object.keys(fila).length === 0) {
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 });
    }

    const { data, error } = await auth.supabase
      .from("rewards")
      .update(fila)
      .eq("id", auth.id)
      .select("*")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(toReward(data as Record<string, unknown>));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error inesperado al editar la recompensa";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, ctx: Ctx) {
  await connection();
  try {
    const auth = await autorizar(ctx);
    if ("response" in auth) return auth.response;

    const { error } = await auth.supabase.from("rewards").delete().eq("id", auth.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error inesperado al eliminar la recompensa";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
