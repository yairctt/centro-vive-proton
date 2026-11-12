/**
 * Reglas de puntos por visita (las mismas que aplica POST /api/visits/validate).
 * La tabla `visits` no guarda los puntos, así que el tablero y el pasaporte
 * los recalculan con esta función a partir de la misión y la hora de la visita.
 */
export const BASE_POINTS = 10;
export const NIGHT_BONUS_POINTS = 5;
export const NIGHT_FROM_HOUR = 19;

export interface MisionDeVisita {
  title: string;
  points: number;
  night_bonus: boolean;
}

/** Une el resultado de un join de Supabase (objeto o arreglo) en un objeto. */
export function unoDe<T>(x: T | T[] | null | undefined): T | null {
  return (Array.isArray(x) ? x[0] : x) ?? null;
}

/** Hora (0–23) en Veracruz de una fecha ISO; el servidor puede estar en UTC. */
export function horaMx(iso: string): number {
  return new Date(
    new Date(iso).toLocaleString("en-US", { timeZone: "America/Mexico_City" }),
  ).getHours();
}

/** Puntos de una visita: misión (o base) + bono si fue de noche en Veracruz. */
export function puntosDeVisita(mision: MisionDeVisita | null, createdAt: string): number {
  if (!mision) return BASE_POINTS;
  const base = Number(mision.points) || BASE_POINTS;
  return mision.night_bonus && horaMx(createdAt) >= NIGHT_FROM_HOUR ? base + NIGHT_BONUS_POINTS : base;
}
