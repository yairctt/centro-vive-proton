/**
 * /api/me — perfil de la sesión actual.
 *
 * GET    → { profile: SessionProfile | null }  (null = sin sesión; nunca 401)
 * PATCH  { alias } → { profile }  (cambia el alias visible del usuario)
 */
import { NextResponse, connection, type NextRequest } from "next/server";
import { z } from "zod";
import { getAdminClient } from "@/lib/db/server";
import { getSessionProfile } from "@/lib/db/auth";

export async function GET(): Promise<NextResponse> {
  await connection();
  try {
    const profile = await getSessionProfile();
    return NextResponse.json({ profile });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al consultar la sesión";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

const patchSchema = z.object({
  alias: z.string().trim().min(2, "El alias debe tener al menos 2 letras").max(40),
});

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 },
    );
  }

  try {
    const profile = await getSessionProfile();
    if (!profile) {
      return NextResponse.json({ error: "Inicia sesión para continuar" }, { status: 401 });
    }
    const { error } = await getAdminClient()
      .from("profiles")
      .update({ alias: parsed.data.alias })
      .eq("id", profile.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ profile: { ...profile, alias: parsed.data.alias } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al actualizar el perfil";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
