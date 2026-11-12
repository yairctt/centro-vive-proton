/**
 * GET /api/me/passport
 * Devuelve el perfil activo con sus visitas y recompensas canjeables.
 *
 * Query: ?profileId=<uuid>  (opcional; si se omite usa el perfil demo)
 * Response: { profile: Profile; visits: Visit[]; rewards: Reward[] }
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/db/server";
import { toProfile, toVisit, toReward } from "@/lib/db/mappers";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const supabase = getAdminClient();
  const { searchParams } = new URL(req.url);
  let profileId = searchParams.get("profileId") ?? null;

  // Si no se envía profileId, usar el perfil demo
  if (!profileId) {
    const { data: demo } = await supabase
      .from("profiles")
      .select("id")
      .eq("alias", "visitante-demo")
      .single();
    profileId = demo?.id ?? null;
  }

  if (!profileId) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  }

  // Perfil
  const { data: profileRow, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", profileId)
    .single();

  if (profileError || !profileRow) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  }

  // Visitas (más recientes primero)
  const { data: visitRows, error: visitError } = await supabase
    .from("visits")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (visitError) {
    return NextResponse.json({ error: visitError.message }, { status: 500 });
  }

  // Recompensas disponibles (no vencidas, con suficientes puntos)
  const profilePoints = Number(profileRow.points ?? 0);
  const { data: rewardRows, error: rewardError } = await supabase
    .from("rewards")
    .select("*")
    .or(`valid_until.is.null,valid_until.gt.${new Date().toISOString()}`)
    .lte("cost_points", profilePoints)
    .order("cost_points", { ascending: true });

  if (rewardError) {
    return NextResponse.json({ error: rewardError.message }, { status: 500 });
  }

  return NextResponse.json({
    profile: toProfile(profileRow as Record<string, unknown>),
    visits: (visitRows ?? []).map((v) => toVisit(v as Record<string, unknown>)),
    rewards: (rewardRows ?? []).map((r) => toReward(r as Record<string, unknown>)),
  });
}
