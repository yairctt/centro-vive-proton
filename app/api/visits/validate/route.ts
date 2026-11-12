/**
 * POST /api/visits/validate
 * Valida un token QR, registra la visita y otorga puntos al perfil.
 * Los puntos SIEMPRE se calculan en el servidor (service role).
 *
 * Body: { token: string }   ·   Perfil = el de la sesión.
 * Response: ValidateResponse
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminClient } from "@/lib/db/server";
import { requireProfile } from "@/lib/db/auth";
import type { ValidateResponse } from "@/lib/types";

const bodySchema = z.object({
  token: z.string().min(1),
});

// Puntos base por visita con QR
const BASE_POINTS = 10;
// Bonus nocturno (misión con night_bonus=true + hora >= 19:00 México)
const NIGHT_BONUS_POINTS = 5;

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

  const { token } = parsed.data;

  try {
    // Solo usuarios con sesión suman puntos (invitado o cuenta registrada).
    const auth = await requireProfile(["visitante", "admin"]);
    if ("response" in auth) return auth.response;
    const profileId = auth.profile.id;

    const supabase = getAdminClient();

  // 2. Buscar el token QR
  const { data: qrRow, error: qrError } = await supabase
    .from("qr_tokens")
    .select("id, place_id, active, expires_at")
    .eq("token", token)
    .single();

  if (qrError || !qrRow) {
    return NextResponse.json(
      { ok: false, pointsAdded: 0, totalPoints: 0, missionCompleted: false, message: "Token QR no encontrado" } satisfies ValidateResponse,
      { status: 404 },
    );
  }

  if (!qrRow.active) {
    return NextResponse.json(
      { ok: false, pointsAdded: 0, totalPoints: 0, missionCompleted: false, message: "Token QR inactivo o ya utilizado" } satisfies ValidateResponse,
      { status: 409 },
    );
  }

  if (qrRow.expires_at && new Date(qrRow.expires_at) < new Date()) {
    return NextResponse.json(
      { ok: false, pointsAdded: 0, totalPoints: 0, missionCompleted: false, message: "Token QR expirado" } satisfies ValidateResponse,
      { status: 410 },
    );
  }

  const placeId: string = qrRow.place_id as string;

  // 3. (El perfil ya viene de la sesión.)

  // 4. Verificar visita previa (un token por perfil)
  const { data: prevVisit } = await supabase
    .from("visits")
    .select("id")
    .eq("profile_id", profileId)
    .eq("place_id", placeId)
    .limit(1)
    .maybeSingle();

  if (prevVisit) {
    // Buscar puntos actuales
    const { data: prof } = await supabase
      .from("profiles")
      .select("points")
      .eq("id", profileId)
      .single();
    return NextResponse.json(
      {
        ok: false,
        pointsAdded: 0,
        totalPoints: Number(prof?.points ?? 0),
        missionCompleted: false,
        message: "Ya visitaste este lugar",
      } satisfies ValidateResponse,
      { status: 409 },
    );
  }

  // 5. Buscar misión activa para este lugar (si existe)
  const { data: missionRow } = await supabase
    .from("missions")
    .select("id, points, night_bonus")
    .eq("place_id", placeId)
    .eq("active", true)
    .order("points", { ascending: false })
    .limit(1)
    .maybeSingle();

  // 6. Calcular puntos (hora México)
  const nowMx = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" }),
  );
  const hourMx = nowMx.getHours();
  const isNight = hourMx >= 19;

  let pointsAdded = BASE_POINTS;
  if (missionRow) {
    pointsAdded = Number(missionRow.points) || BASE_POINTS;
    if (missionRow.night_bonus && isNight) {
      pointsAdded += NIGHT_BONUS_POINTS;
    }
  }

  // 7. Registrar visita
  // La tabla `visits` en Supabase no tiene `points_awarded`; guarda el token
  // usado (`qr_token_id`). Los puntos quedan en `profiles.points`.
  const { error: visitError } = await supabase.from("visits").insert({
    profile_id: profileId,
    place_id: placeId,
    mission_id: missionRow?.id ?? null,
    method: "qr",
    qr_token_id: qrRow.id,
  });

  if (visitError) {
    return NextResponse.json({ error: visitError.message }, { status: 500 });
  }

  // 8. Sumar puntos al perfil
  const { data: updatedProfile, error: pointsError } = await supabase.rpc(
    "increment_points",
    { profile_id: profileId, delta: pointsAdded },
  );

  let totalPoints = pointsAdded;
  if (pointsError) {
    // Fallback: actualizar manualmente si el RPC no existe
    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("points")
      .eq("id", profileId)
      .single();
    const current = Number(currentProfile?.points ?? 0);
    await supabase
      .from("profiles")
      .update({ points: current + pointsAdded })
      .eq("id", profileId);
    totalPoints = current + pointsAdded;
  } else {
    totalPoints = Number(updatedProfile) || pointsAdded;
  }

  // 9. Verificar si completó la misión (si había una aceptada)
  let missionCompleted = false;
  if (missionRow) {
    const { data: accepted } = await supabase
      .from("mission_accepts")
      .select("id")
      .eq("profile_id", profileId)
      .eq("mission_id", missionRow.id)
      .maybeSingle();
    missionCompleted = !!accepted;
  }

  return NextResponse.json({
    ok: true,
    pointsAdded,
    totalPoints,
    missionCompleted,
    message: missionCompleted
      ? `¡Misión completada! +${pointsAdded} puntos`
      : `¡Visita registrada! +${pointsAdded} puntos`,
  } satisfies ValidateResponse);
  } catch {
    // Sin base de datos: se responde 404 SIN cuerpo para que el cliente caiga
    // al modo demo (es la convención que espera `lib/qr/validate.ts`: un 404
    // sin JSON de error significa "el endpoint no está disponible").
    return new NextResponse(null, { status: 404 });
  }
}
