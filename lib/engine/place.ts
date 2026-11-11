// Normalización de datos de lugares para el motor (Integrante 4).
// `lib/types.ts` es del Integrante 3: no se edita. El motor lee de `meta`
// (jsonb) los campos opcionales y aplica valores por omisión seguros.

import type { Budget, Place } from "../types";

/** Rango de precio usable en `meta.priceLevel`. */
export type PriceLevel = Budget;

const RANGO_PRECIO: Record<PriceLevel, number> = { bajo: 0, medio: 1, alto: 2 };

export interface PlaceInfo {
  /** Minutos de visita típicos. */
  avgVisitMin: number;
  /** Rango de precio si el lugar lo declara; null si no se sabe. */
  priceLevel: PriceLevel | null;
  /** Necesidad de visibilidad (0..1). */
  opportunity: number;
  /** Hora de apertura en "HH:MM"; null si no está verificada. */
  opensAt: string | null;
  /** Hora de cierre en "HH:MM"; null si no está verificada. */
  closesAt: string | null;
  /** True si el horario viene de un dato verificado. */
  hoursVerified: boolean;
}

/** Convierte "HH:MM" en minutos desde medianoche. */
export function hhmmToMinutes(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 24 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function readString(meta: Record<string, unknown>, key: string): string | null {
  const value = meta[key];
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function readNumber(meta: Record<string, unknown>, key: string): number | null {
  const value = meta[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/**
 * Extrae "9:00–21:00" de un texto de horario legible ("Lun–Dom 9:00–21:00").
 * Devuelve null si no encuentra un rango reconocible.
 */
export function parseHoursRange(hours: string | null): { opensAt: string; closesAt: string } | null {
  if (!hours) return null;
  const match = /(\d{1,2}):(\d{2})\s*[-–—a]{1,3}\s*(\d{1,2}):(\d{2})/.exec(hours);
  if (!match) return null;
  const opensAt = `${match[1].padStart(2, "0")}:${match[2]}`;
  const closesAt = `${match[3].padStart(2, "0")}:${match[4]}`;
  if (hhmmToMinutes(opensAt) === null || hhmmToMinutes(closesAt) === null) return null;
  return { opensAt, closesAt };
}

/** Datos derivados de un lugar, con valores por omisión cuando el dato falta. */
export function readPlaceInfo(place: Place): PlaceInfo {
  const meta = place.meta ?? {};
  const parsed = parseHoursRange(place.hours);

  const metaOpens = readString(meta, "opensAt");
  const metaCloses = readString(meta, "closesAt");
  const opensAt = metaOpens ?? parsed?.opensAt ?? null;
  const closesAt = metaCloses ?? parsed?.closesAt ?? null;

  const metaPrice = readString(meta, "priceLevel") as PriceLevel | null;
  const priceLevel = metaPrice && metaPrice in RANGO_PRECIO ? metaPrice : null;

  const avgVisitMin = readNumber(meta, "avgVisitMin");
  const opportunity = readNumber(meta, "opportunity");

  return {
    avgVisitMin: avgVisitMin !== null && avgVisitMin > 0 ? avgVisitMin : 30,
    priceLevel,
    opportunity:
      opportunity !== null ? Math.min(1, Math.max(0, opportunity)) : 0.5,
    opensAt,
    closesAt,
    hoursVerified: place.verified && opensAt !== null && closesAt !== null,
  };
}

/**
 * ¿El lugar está abierto en el momento dado?
 * `null` significa "no se sabe" (sin horario verificado).
 */
export function isOpenAt(
  info: PlaceInfo,
  minutesOfDay: number,
): boolean | null {
  if (!info.hoursVerified || !info.opensAt || !info.closesAt) return null;
  const opens = hhmmToMinutes(info.opensAt);
  const closes = hhmmToMinutes(info.closesAt);
  if (opens === null || closes === null) return null;
  if (opens === closes) return true;
  // Un lugar que cierra después de medianoche sigue abierto de madrugada.
  if (closes < opens) return minutesOfDay >= opens || minutesOfDay < closes;
  return minutesOfDay >= opens && minutesOfDay < closes;
}

/**
 * ¿El presupuesto del visitante admite este lugar?
 * Un lugar sin rango de precio declarado se admite siempre: no se puede
 * descartar algo cuyo precio no se conoce.
 */
export function fitsBudget(info: PlaceInfo, budget: Budget): boolean {
  if (!info.priceLevel) return true;
  return RANGO_PRECIO[info.priceLevel] <= RANGO_PRECIO[budget];
}
