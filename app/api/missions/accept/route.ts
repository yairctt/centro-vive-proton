/**
 * POST /api/missions/accept
 * Registra que un perfil acepta una misión.
 *
 * Body: { missionId: string; profileId?: string }
 * Response: { ok: true } | { error: string }
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminClient } from "@/lib/db/server";

const bodySchema = z.object({
  missionId: z.string().uuid(),
  profileId: z.string().uuid().optional(),
});

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

  const { missionId, profileId: rawProfileId } = parsed.data;
  const supabase = getAdminClient();

  // 2. Verificar que la misión existe y está activa
  const { data: mission, error: missionError } = await supabase
    .from("missions")
    .select("id, active")
    .eq("id", missionId)
    .single();

  if (missionError || !mission) {
    return NextResponse.json({ error: "Misión no encontrada" }, { status: 404 });
  }

  if (!mission.active) {
    return NextResponse.json({ error: "Misión inactiva" }, { status: 409 });
  }

  // 3. Determinar perfil (enviado o perfil demo)
  let profileId = rawProfileId ?? null;
  if (!profileId) {
    const { data: demoProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("alias", "visitante-demo")
      .single();
    profileId = demoProfile?.id ?? null;
  }

  if (!profileId) {
    return NextResponse.json(
      { error: "No se encontró un perfil activo" },
      { status: 422 },
    );
  }

  // 4. Verificar si ya aceptó esta misión
  const { data: existing } = await supabase
    .from("mission_accepts")
    .select("id")
    .eq("profile_id", profileId)
    .eq("mission_id", missionId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ ok: true, already: true });
  }

  // 5. Registrar la aceptación
  const { error: insertError } = await supabase
    .from("mission_accepts")
    .insert({ profile_id: profileId, mission_id: missionId });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
