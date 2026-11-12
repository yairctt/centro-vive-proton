// Puntuación de un lugar (Integrante 4).
// Función pura y explicable: la IA NO decide la ruta.

import type { Place } from "../types";
import { engineConfig, weights } from "./config";
import { distanceM, type LatLng } from "./geo";
import { abiertoDeNoche, isOpenAt, readPlaceInfo, type DiaSemana, type PlaceInfo } from "./place";
import { diaSemanaIso, minutosDelDia } from "./zona-horaria";

export interface ScoreContext {
  /** Categorías que le interesan al visitante (texto libre, se normaliza). */
  interests: string[];
  /** Momento de la ruta. */
  now: Date;
  /** Ubicación de partida; si falta, la cercanía vale un valor neutro. */
  origin?: LatLng | null;
  /** Minutos que aún quedan en el presupuesto de tiempo. */
  remainingMin: number;
}

export interface ScoreBreakdown {
  /** Puntuación total (0..~1.1 según pesos). */
  total: number;
  afinidad: number;
  cercania: number;
  disponibilidad: number;
  tiempo: number;
  oportunidad: number;
  bonoNocturno: number;
  /** Distancia al origen en metros (null si no hay origen). */
  distanceM: number | null;
  /** Si el lugar está abierto en este momento (null = se desconoce). */
  open: boolean | null;
}

/** Quita acentos y pasa a minúsculas para comparar categorías. */
export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Minutos transcurridos desde medianoche, en la zona horaria del destino
 * (Veracruz). No se usa `getHours()` porque el servidor corre en UTC.
 */
export function minutesOfDay(date: Date): number {
  return minutosDelDia(date);
}

/**
 * Día de la semana en ISO 8601: 1 = lunes … 7 = domingo, en la zona del destino.
 */
export function dayOfWeek(date: Date): DiaSemana {
  return diaSemanaIso(date);
}

/** ¿La categoría del lugar está entre los intereses del visitante? */
export function matchesInterest(place: Place, interests: string[]): boolean {
  const category = normalizeText(place.category);
  return interests.some((interest) => {
    const wanted = normalizeText(interest);
    if (!wanted) return false;
    return category === wanted || category.includes(wanted) || wanted.includes(category);
  });
}

/** Distancia al origen en metros, o null si el visitante no dio ubicación. */
function distanceToOrigin(place: Place, origin?: LatLng | null): number | null {
  if (!origin) return null;
  return distanceM(origin, { lat: place.lat, lng: place.lng });
}

/**
 * Puntúa un lugar según la fórmula acordada (CONTEXTO.md, sección 8).
 * Devuelve el desglose para poder explicar la recomendación.
 */
export function scorePlace(
  place: Place,
  ctx: ScoreContext,
  info: PlaceInfo = readPlaceInfo(place, dayOfWeek(ctx.now)),
): ScoreBreakdown {
  const ahora = minutesOfDay(ctx.now);
  const hoy = dayOfWeek(ctx.now);

  // Afinidad: 1 si la categoría interesa, 0.2 si no.
  const afinidad = matchesInterest(place, ctx.interests) ? 1 : engineConfig.afinidadFueraDeInteres;

  // Cercanía: se degrada hasta 1500 m.
  const dist = distanceToOrigin(place, ctx.origin);
  const cercania =
    dist === null
      ? engineConfig.cercaniaSinOrigen
      : 1 - Math.min(dist / engineConfig.radioCercaniaM, 1);

  // Disponibilidad: 1 si está abierto ahora, 0 si está cerrado,
  // valor neutro si no se conoce el horario.
  const abierto = isOpenAt(info, ahora, hoy);
  const disponibilidad =
    abierto === null ? engineConfig.disponibilidadDesconocida : abierto ? 1 : 0;

  // Tiempo: 1 si la visita cabe en el tiempo restante.
  const tiempo = info.avgVisitMin <= ctx.remainingMin ? 1 : 0;

  // Oportunidad: el dato crudo del lugar.
  const oportunidad = info.opportunity;

  // Bono nocturno: a partir de las 19:00 y abierto después de esa hora.
  const esNoche = ahora >= engineConfig.horaBonoNocturno * 60;
  const sigueAbierto = abiertoDeNoche(info, hoy, place.meta);
  const bonoNocturno = esNoche && sigueAbierto === true ? 1 : 0;

  const total =
    weights.afinidad * afinidad +
    weights.cercania * cercania +
    weights.disponibilidad * disponibilidad +
    weights.tiempo * tiempo +
    weights.oportunidad * oportunidad +
    weights.bonoNocturno * bonoNocturno;

  return {
    total,
    afinidad,
    cercania,
    disponibilidad,
    tiempo,
    oportunidad,
    bonoNocturno,
    distanceM: dist,
    open: abierto,
  };
}
