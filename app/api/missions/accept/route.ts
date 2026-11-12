/**
 * POST /api/missions/accept
 * Registra que un perfil acepta una misión.
 *
 * Body: { missionId: string }   ·   Perfil = el de la sesión.
 * Response: { ok: true } | { error: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminClient } from "@/lib/db/server";
import { requireProfile } from "@/lib/db/auth";

const bodySchema = z.object({
  missionId: z.guid({ message: "missionId inválido" }),
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

  const { missionId } = parsed.data;

  const auth = await requireProfile(["visitante", "admin"]);
  if ("response" in auth) return auth.response;
  const profileId = auth.profile.id;

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

  // 3. Verificar si ya aceptó esta misión
  const { data: existing } = await supabase
    .from("mission_accepts")
    .select("id")
    .eq("profile_id", profileId)
    .eq("mission_id", missionId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ ok: true, already: true });
  }

  // 4. Registrar la aceptación
  const { error: insertError } = await supabase
    .from("mission_accepts")
    .insert({ profile_id: profileId, mission_id: missionId });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
