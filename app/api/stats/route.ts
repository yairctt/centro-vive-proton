/**
 * GET /api/stats
 * Agrega actividad registrada en la app para el tablero de admin.
 * Las métricas representan interacciones en la app, NO conteo de personas.
 *
 * Query: ?from=ISO8601&to=ISO8601  (opcional; defecto: últimas 24 h)
 * Response: Stats
 */
import { NextResponse, connection } from "next/server";
import { getAdminClient } from "@/lib/db/server";
import { MOCK_ADMIN_STATS } from "@/components/paneles/mock-data";
import type { ExtendedStats } from "@/components/paneles/mock-data";

/** Calcula cuántos comercios están abiertos a una hora dada (0–23). */
function comerciosAbiertos(hora: number): number {
  // Horario típico de los 6 comercios demo del Centro Histórico de Veracruz
  if (hora >= 7 && hora < 14) return 6;
  if (hora >= 14 && hora < 17) return 4; // pausa de medio día
  if (hora >= 17 && hora < 21) return 5;
  if (hora >= 21 && hora < 23) return 2; // solo bares / cafeterías nocturnos
  return 0;
}

/** Mismas reglas de puntos que /api/visits/validate. */
const BASE_POINTS = 10;
const NIGHT_BONUS_POINTS = 5;

type MisionVisita = { title: string; points: number; night_bonus: boolean };

/** Misión ligada a una visita (join `missions(title, points)`). */
function misionDe(row: Record<string, unknown>): MisionVisita | null {
  const m = row.missions as MisionVisita | MisionVisita[] | null;
  return (Array.isArray(m) ? m[0] : m) ?? null;
}

/** Puntos de una visita: misión (o base) + bono si fue después de las 19:00 en Veracruz. */
function puntosDe(mision: MisionVisita | null, createdAt: string): number {
  if (!mision) return BASE_POINTS;
  const horaMx = new Date(
    new Date(createdAt).toLocaleString("en-US", { timeZone: "America/Mexico_City" }),
  ).getHours();
  const base = Number(mision.points) || BASE_POINTS;
  return mision.night_bonus && horaMx >= 19 ? base + NIGHT_BONUS_POINTS : base;
}

/** Convierte una fila de `visits` al formato del feed reciente. */
function toRecentVisit(row: Record<string, unknown>, idx: number) {
  const mision = misionDe(row);
  const ago = Math.round(
    (Date.now() - new Date(row.created_at as string).getTime()) / 60_000,
  );
  const agoLabel = ago < 1 ? "Ahora" : `Hace ${ago} min`;

  return {
    id: (row.id as string) ?? `v-${idx}`,
    placeId: (row.place_id as string) ?? "",
    placeName:
      (row as Record<string, unknown> & { places?: { name: string } }).places
        ?.name ?? "Lugar desconocido",
    createdAt: agoLabel,
    method: (row.method as "qr" | "manual") ?? "qr",
    // `visits` no guarda los puntos: se recalculan con las reglas de validate.
    pointsAwarded: puntosDe(mision, row.created_at as string),
    missionTitle: mision?.title,
  };
}

export async function GET() {
  try {
    // El tablero se refresca cada pocos segundos: siempre se genera en la
    // petición, nunca se prerenderiza. `connection()` lo marca como dinámico
    // (con cacheComponents de Next 16 no se usa `export const dynamic`).
    await connection();

    const supabase = getAdminClient();
    const now = new Date();
    // Medianoche en hora de Veracruz (el servidor puede estar en UTC).
    const todayStart = new Date(
      new Date(now).toLocaleString("en-US", { timeZone: "America/Mexico_City" }),
    );
    todayStart.setHours(0, 0, 0, 0);

    // Consultas paralelas para minimizar latencia
    const [visitsRes, redemptionsRes, missionsRes, placesRes] =
      await Promise.all([
        supabase
          .from("visits")
          .select("id, place_id, mission_id, created_at, method, places(name), missions(title, points, night_bonus)")
          .gte("created_at", todayStart.toISOString())
          .order("created_at", { ascending: false })
          .limit(200),

        supabase
          .from("redemptions") // canjes confirmados hoy por los comercios
          .select("id", { count: "exact", head: true })
          .eq("status", "confirmado")
          .gte("confirmed_at", todayStart.toISOString()),

        supabase
          .from("mission_accepts") // misiones aceptadas hoy
          .select("id", { count: "exact", head: true })
          .gte("created_at", todayStart.toISOString()),

        supabase.from("places").select("id, name", { count: "exact" }),
      ]);

    // Si falla alguna consulta principal, caemos al mock
    if (visitsRes.error) throw visitsRes.error;

    const visits = (visitsRes.data ?? []) as Record<string, unknown>[];

    // ── Métricas derivadas ──────────────────────────────────────────────────

    // Escaneos QR por lugar (top 12)
    const countByPlace = new Map<string, { placeName: string; scans: number }>();
    for (const v of visits) {
      const pid = (v.place_id as string) ?? "unknown";
      const pname =
        (v as Record<string, unknown> & { places?: { name: string } }).places
          ?.name ?? pid;
      const prev = countByPlace.get(pid) ?? { placeName: pname, scans: 0 };
      countByPlace.set(pid, { ...prev, scans: prev.scans + 1 });
    }
    const scansByPlace = [...countByPlace.entries()]
      .map(([placeId, v]) => ({ placeId, ...v }))
      .sort((a, b) => b.scans - a.scans)
      .slice(0, 12);

    // Actividad por hora. La hora es la de Veracruz, no la del servidor
    // (en Vercel es UTC): si no, el pico de actividad saldría corrido.
    const countByHour = new Map<number, number>();
    for (const v of visits) {
      const h = new Date(
        new Date(v.created_at as string).toLocaleString("en-US", {
          timeZone: "America/Mexico_City",
        }),
      ).getHours();
      countByHour.set(h, (countByHour.get(h) ?? 0) + 1);
    }
    const activityByHour = [...countByHour.entries()]
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => a.hour - b.hour);

    // Actividad + comercios abiertos por hora (formato para el gráfico)
    const activityByHourWithBusinesses = activityByHour.map(({ hour, count }) => ({
      hour,
      label: `${String(hour).padStart(2, "0")}:00`,
      interactions: count,
      openBusinesses: comerciosAbiertos(hour),
    }));

    // Misiones: aceptadas hoy y completadas (visitas de hoy ligadas a misión)
    const missionsAccepted = missionsRes.count ?? 0;
    const missionsCompleted = visits.filter((v) => v.mission_id != null).length;

    // Canjes confirmados hoy
    const redemptions = redemptionsRes.count ?? 0;

    // Totales de lugares activos
    const activePlaces = placesRes.count ?? MOCK_ADMIN_STATS.activePlaces;
    const activeBusinesses = MOCK_ADMIN_STATS.activeBusinesses; // fijo: 6 comercios demo

    // Feed reciente: últimas 10 visitas
    const recentVisits = visits.slice(0, 10).map(toRecentVisit);

    // Si no hay visits (seed no corrido todavía), mezclar con mock para demo
    const useMockBlend = visits.length === 0;

    const payload: ExtendedStats = useMockBlend
      ? MOCK_ADMIN_STATS
      : {
        missionsAccepted: missionsAccepted || MOCK_ADMIN_STATS.missionsAccepted,
        missionsCompleted:
          missionsCompleted || MOCK_ADMIN_STATS.missionsCompleted,
        redemptions: redemptions || MOCK_ADMIN_STATS.redemptions,
        totalInteractions: visits.length,
        activePlaces,
        activeBusinesses,
        scansByPlace:
          scansByPlace.length > 0 ? scansByPlace : MOCK_ADMIN_STATS.scansByPlace,
        activityByHour:
          activityByHour.length > 0
            ? activityByHour
            : MOCK_ADMIN_STATS.activityByHour,
        activityByHourWithBusinesses:
          activityByHourWithBusinesses.length > 0
            ? activityByHourWithBusinesses
            : MOCK_ADMIN_STATS.activityByHourWithBusinesses,
        recentVisits:
          recentVisits.length > 0 ? recentVisits : MOCK_ADMIN_STATS.recentVisits,
      };

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch {
    // DB no disponible o sin configurar → datos mock para que la demo nunca falle
    return NextResponse.json(MOCK_ADMIN_STATS, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  }
}

