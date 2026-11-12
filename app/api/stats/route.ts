/**
 * GET /api/stats
 * Agrega actividad registrada en la app para el tablero de admin.
 * Las métricas representan interacciones en la app, NO conteo de personas.
 *
 * Query: ?from=ISO8601&to=ISO8601  (opcional; defecto: últimas 24 h)
 * Response: Stats
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/db/server";
import type { Stats } from "@/lib/types";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);

  // Rango de tiempo (defecto últimas 24 h)
  const to   = searchParams.get("to")   ?? new Date().toISOString();
  const from = searchParams.get("from") ?? new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  try {
    // El cliente se crea dentro del try: si faltan las variables de entorno,
    // el error se responde como 500 en vez de tumbar el build de Next.
    const supabase = getAdminClient();

    // --- Visitas en el rango ---
    const { data: visits, error: visitsError } = await supabase
      .from("visits")
      .select("id, place_id, created_at, mission_id, points_awarded")
      .gte("created_at", from)
      .lte("created_at", to);

    if (visitsError) throw new Error(visitsError.message);

    const visitList = visits ?? [];

    // --- Misiones aceptadas ---
    const { data: accepts, error: acceptsError } = await supabase
      .from("mission_accepts")
      .select("id")
      .gte("created_at", from)
      .lte("created_at", to);

    if (acceptsError) throw new Error(acceptsError.message);

    // --- Canjes ---
    const { data: redemptions, error: redemptionsError } = await supabase
      .from("redemptions")
      .select("id")
      .gte("created_at", from)
      .lte("created_at", to);

    if (redemptionsError) throw new Error(redemptionsError.message);

    // --- Nombres de lugares (para scansByPlace) ---
    const placeIds = [...new Set(visitList.map((v) => v.place_id as string))];
    let placeNames: Record<string, string> = {};
    if (placeIds.length > 0) {
      const { data: places } = await supabase
        .from("places")
        .select("id, name")
        .in("id", placeIds);
      placeNames = Object.fromEntries(
        (places ?? []).map((p) => [p.id as string, p.name as string]),
      );
    }

    // --- scansByPlace ---
    const scanMap: Record<string, number> = {};
    for (const v of visitList) {
      const pid = v.place_id as string;
      scanMap[pid] = (scanMap[pid] ?? 0) + 1;
    }
    const scansByPlace = Object.entries(scanMap).map(([placeId, scans]) => ({
      placeId,
      placeName: placeNames[placeId] ?? placeId,
      scans,
    }));

    // --- activityByHour (zona México) ---
    const hourMap: Record<number, number> = {};
    for (let h = 0; h < 24; h++) hourMap[h] = 0;
    for (const v of visitList) {
      const dateMx = new Date(
        new Date(v.created_at as string).toLocaleString("en-US", {
          timeZone: "America/Mexico_City",
        }),
      );
      const h = dateMx.getHours();
      hourMap[h] = (hourMap[h] ?? 0) + 1;
    }
    // Comercios abiertos por hora: usando opens_at/closes_at de places
    // Para simplificar la demo, usamos el conteo de visitas como proxy
    const activityByHour = Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      count: hourMap[h] ?? 0,
    }));

    // --- misiones completadas = visitas con mission_id ---
    const missionsCompleted = visitList.filter((v) => v.mission_id !== null).length;

    // --- visitas recientes (top 10) ---
    const recentVisits = visitList
      .slice(0, 10)
      .map((v) => ({
        placeName: placeNames[v.place_id as string] ?? (v.place_id as string),
        createdAt: v.created_at as string,
      }));

    const stats: Stats = {
      missionsAccepted:  (accepts ?? []).length,
      missionsCompleted,
      redemptions:       (redemptions ?? []).length,
      scansByPlace,
      activityByHour,
      recentVisits,
    };

    return NextResponse.json(stats);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al calcular estadísticas";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
