/**
 * GET /api/me/passport
 * Devuelve el perfil activo con sus visitas y recompensas canjeables.
 *
 * Perfil = el de la sesión (con flags.modoDemo y sin sesión: visitante-demo).
 * Response: {
 *   profile: Profile;
 *   visits: (Visit & { placeName; missionTitle })[];        // pointsAwarded recalculado
 *   rewards: (Reward & { canjeable: boolean })[];           // vigentes; canjeable = alcanzan los puntos
 *   redemptions: { id; code; rewardId; rewardTitle; costPoints; status; createdAt }[];
 * }
 */

import { NextResponse, connection } from "next/server";
import { getAdminClient } from "@/lib/db/server";
import { requireProfile } from "@/lib/db/auth";
import { toProfile, toVisit, toReward, cleanPlaceName } from "@/lib/db/mappers";
import { puntosDeVisita, unoDe, type MisionDeVisita } from "@/lib/db/puntos";

export async function GET(): Promise<NextResponse> {
  // Siempre dinámico: nunca se prerenderiza en el build (cacheComponents).
  await connection();

  try {
    const auth = await requireProfile(["visitante", "admin"]);
    if ("response" in auth) return auth.response;
    const profileId = auth.profile.id;

    // El cliente se crea dentro del try: si faltan las variables de entorno,
    // el error se responde como 500 en vez de tumbar el build de Next.
    const supabase = getAdminClient();

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
    .select("*, places(name), missions(title, points, night_bonus)")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(50);

    if (visitError) {
      return NextResponse.json({ error: visitError.message }, { status: 500 });
    }

    // Recompensas vigentes; `canjeable` indica si ya le alcanzan los puntos
    const profilePoints = Number(profileRow.points ?? 0);
    const { data: rewardRows, error: rewardError } = await supabase
      .from("rewards")
      .select("*")
      .or(`valid_until.is.null,valid_until.gt.${new Date().toISOString()}`)
      .order("cost_points", { ascending: true });

    if (rewardError) {
      return NextResponse.json({ error: rewardError.message }, { status: 500 });
    }

    // Canjes del usuario (el código se muestra al comercio para confirmarlo)
    const { data: canjeRows } = await supabase
      .from("redemptions")
      .select("id, reward_id, status, created_at, rewards(title, cost_points)")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(20);

    return NextResponse.json({
      profile: toProfile(profileRow as Record<string, unknown>),
      visits: (visitRows ?? []).map((v) => {
        const row = v as Record<string, unknown>;
        const mision = unoDe(row.missions as MisionDeVisita | MisionDeVisita[] | null);
        const lugar = unoDe(row.places as { name: string } | { name: string }[] | null);
        return {
          ...toVisit(row),
          pointsAwarded: puntosDeVisita(mision, String(row.created_at)),
          placeName: cleanPlaceName(lugar?.name ?? "Lugar del Centro"),
          missionTitle: mision?.title ?? null,
        };
      }),
      rewards: (rewardRows ?? []).map((r) => {
        const reward = toReward(r as Record<string, unknown>);
        return { ...reward, canjeable: reward.pointsCost <= profilePoints };
      }),
      redemptions: (canjeRows ?? []).map((c) => {
        const reward = unoDe(c.rewards as unknown as { title: string; cost_points: number } | null);
        const id = String(c.id);
        return {
          id,
          code: `PJ-${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`,
          rewardId: String(c.reward_id),
          rewardTitle: reward?.title ?? "Recompensa",
          costPoints: Number(reward?.cost_points ?? 0),
          status: c.status === "pendiente" ? "pendiente" : "confirmado",
          createdAt: String(c.created_at),
        };
      }),
      demo: false,
    });
  } catch {
    // Modo demo: sin base configurada se responde con los datos de `lib/mock`
    // (misma forma que la respuesta real). Los puntos de la sesión los lleva
    // el cliente (sessionStorage), así que aquí solo se avisa con `demo`.
    const { mockProfile, mockVisits, mockRewards, mockPlaces } = await import("@/lib/mock");
    return NextResponse.json({
      profile: mockProfile,
      visits: mockVisits.map((v) => ({
        ...v,
        placeName: cleanPlaceName(mockPlaces.find((p) => p.id === v.placeId)?.name ?? "Lugar del Centro"),
        missionTitle: null,
      })),
      rewards: mockRewards.map((r) => ({ ...r, canjeable: false })),
      redemptions: [],
      demo: true,
    });
  }
}

