// Normalización de datos de lugares para el motor (Integrante 4).
// `lib/types.ts` es del Integrante 3: no se edita. El motor lee de `meta`
// (jsonb) los campos opcionales y aplica valores por omisión seguros.

import type { Budget, Place } from "../types";

/** Rango de precio usable en `meta.priceLevel`. */
export type PriceLevel = Budget;

/** Día de la semana en ISO 8601: 1 = lunes … 7 = domingo. */
export type DiaSemana = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** Tramo horario de un día: [apertura, cierre] en "HH:MM". */
export type TramoHorario = [string, string];

/**
 * Horario semanal de un lugar.
 * - Un día con valor `null` significa "cerrado ese día".
 * - Un día ausente significa "no hay dato" (no se puede afirmar nada).
 */
export type HorarioSemanal = Partial<Record<DiaSemana, TramoHorario | null>>;

/** Estado del lugar frente al público. */
export type EstadoLugar = "operativo" | "cerradoTemporalmente" | "cerradoAlPublico";

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
  /** Horario por día de la semana, si el lugar lo declara. */
  horarioSemanal: HorarioSemanal | null;
  /** Estado del lugar frente al público. */
  estado: EstadoLugar;
  /** Salvedad sobre el horario (variantes, "confirmar en el lugar", etc.). */
  horarioNota: string | null;
  /** True si el horario es válido para el día de la semana en curso. */
  cerradoHoy: boolean | null;
}

/** Convierte "HH:MM" en minutos desde medianoche. "24:00" vale 1440. */
export function hhmmToMinutes(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 24 || minutes > 59) return null;
  if (hours === 24 && minutes > 0) return null;
  return hours * 60 + minutes;
}

/** Convierte minutos desde medianoche en "HH:MM". */
export function minutesToHhmm(minutes: number): string {
  const m = ((minutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
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

/** Valida y normaliza el horario semanal guardado en `meta.horarioSemanal`. */
export function readHorarioSemanal(meta: Record<string, unknown>): HorarioSemanal | null {
  const crudo = meta.horarioSemanal;
  if (!crudo || typeof crudo !== "object" || Array.isArray(crudo)) return null;

  const salida: HorarioSemanal = {};
  for (const [clave, valor] of Object.entries(crudo as Record<string, unknown>)) {
    const dia = Number(clave);
    if (!Number.isInteger(dia) || dia < 1 || dia > 7) continue;
    if (valor === null) {
      salida[dia as DiaSemana] = null;
      continue;
    }
    if (!Array.isArray(valor) || valor.length !== 2) continue;
    const [apertura, cierre] = valor as [unknown, unknown];
    if (typeof apertura !== "string" || typeof cierre !== "string") continue;
    if (hhmmToMinutes(apertura) === null || hhmmToMinutes(cierre) === null) continue;
    // Un cierre de "00:00" significa medianoche (fin del día), no las 00:00.
    const cierreNormalizado = cierre === "00:00" ? "24:00" : cierre;
    salida[dia as DiaSemana] = [apertura, cierreNormalizado];
  }

  return Object.keys(salida).length > 0 ? salida : null;
}

/**
 * Datos derivados de un lugar, con valores por omisión cuando el dato falta.
 *
 * Orden de lectura de cada campo:
 * 1. El campo directo de `Place` (lo llena el mapper del backend, I3).
 * 2. `place.meta` (jsonb: donde el seed guarda lo específico de cada lugar).
 * 3. El texto legible de `hours`, parseado.
 */
export function readPlaceInfo(place: Place, hoy: DiaSemana = 1): PlaceInfo {
  const meta = place.meta ?? {};
  const parsed = parseHoursRange(place.hours);

  const metaOpens = readString(meta, "opensAt");
  const metaCloses = readString(meta, "closesAt");
  const opensAt = place.opensAt ?? metaOpens ?? parsed?.opensAt ?? null;
  const closesAt = place.closesAt ?? metaCloses ?? parsed?.closesAt ?? null;

  const metaPrice = readString(meta, "priceLevel") as PriceLevel | null;
  const precioDirecto = place.priceLevel as PriceLevel | null | undefined;
  const precio = precioDirecto ?? metaPrice;
  const priceLevel = precio && precio in RANGO_PRECIO ? precio : null;

  const avgVisitMin = place.avgVisitMin ?? readNumber(meta, "avgVisitMin");
  const opportunity = place.opportunity ?? readNumber(meta, "opportunity");

  const horarioSemanal = readHorarioSemanal(meta);
  const estadoCrudo = readString(meta, "estado");
  const estado: EstadoLugar =
    estadoCrudo === "cerradoTemporalmente" || estadoCrudo === "cerradoAlPublico"
      ? estadoCrudo
      : "operativo";

  // ¿Está cerrado hoy? `null` = no hay dato para este día.
  let cerradoHoy: boolean | null = null;
  if (estado !== "operativo") {
    cerradoHoy = true;
  } else if (horarioSemanal) {
    const tramo = horarioSemanal[hoy];
    cerradoHoy = tramo === null ? true : tramo === undefined ? null : false;
  } else if (place.verified && opensAt !== null && closesAt !== null) {
    cerradoHoy = false;
  }

  return {
    avgVisitMin: avgVisitMin !== null && avgVisitMin > 0 ? avgVisitMin : 30,
    priceLevel,
    opportunity:
      opportunity !== null ? Math.min(1, Math.max(0, opportunity)) : 0.5,
    opensAt,
    closesAt,
    hoursVerified:
      place.verified &&
      meta.horarioVerificado !== false &&
      (horarioSemanal !== null || (opensAt !== null && closesAt !== null)),
    horarioSemanal,
    estado,
    horarioNota: readString(meta, "horarioNota"),
    cerradoHoy,
  };
}

/**
 * ¿El lugar está abierto en el momento dado?
 * `null` significa "no se sabe" (sin horario verificado para ese día).
 */
export function isOpenAt(
  info: PlaceInfo,
  minutesOfDay: number,
  hoy: DiaSemana = 1,
): boolean | null {
  if (info.estado !== "operativo") return false;

  if (info.horarioSemanal) {
    const tramo = info.horarioSemanal[hoy];
    if (tramo === null) return false;
    if (tramo === undefined) return null;
    const apertura = hhmmToMinutes(tramo[0]);
    const cierre = hhmmToMinutes(tramo[1]);
    if (apertura === null || cierre === null) return null;
    return dentroDelTramo(minutesOfDay, apertura, cierre);
  }

  if (!info.hoursVerified || !info.opensAt || !info.closesAt) return null;
  const apertura = hhmmToMinutes(info.opensAt);
  const cierre = hhmmToMinutes(info.closesAt);
  if (apertura === null || cierre === null) return null;
  return dentroDelTramo(minutesOfDay, apertura, cierre);
}

/** ¿El minuto cae dentro del tramo (soporta cierre después de medianoche)? */
function dentroDelTramo(minutos: number, apertura: number, cierre: number): boolean {
  if (apertura === cierre) return true;
  if (cierre < apertura) return minutos >= apertura || minutos < cierre;
  return minutos >= apertura && minutos < cierre;
}

/**
 * ¿El lugar sigue abierto después de las 19:00 (Centro de noche)?
 * `null` significa "no se sabe".
 *
 * Se respeta el distintivo `meta.abreDeNoche` que usa el seed del backend:
 * un lugar marcado ahí cuenta como nocturno aunque no tenga horario cerrado.
 */
export function abiertoDeNoche(
  info: PlaceInfo,
  hoy: DiaSemana = 1,
  meta?: Record<string, unknown>,
): boolean | null {
  if (info.estado !== "operativo") return false;
  if (meta?.abreDeNoche === true) return true;

  let apertura: number | null = null;
  let cierre: number | null = null;

  if (info.horarioSemanal) {
    const tramo = info.horarioSemanal[hoy];
    if (tramo === null) return false;
    if (tramo === undefined) return null;
    apertura = hhmmToMinutes(tramo[0]);
    cierre = hhmmToMinutes(tramo[1]);
  } else if (info.hoursVerified && info.opensAt && info.closesAt) {
    apertura = hhmmToMinutes(info.opensAt);
    cierre = hhmmToMinutes(info.closesAt);
  } else {
    return null;
  }

  if (apertura === null || cierre === null) return false;

  const limiteNoche = 19 * 60;
  // Un lugar que cierra después de medianoche sigue abierto de madrugada.
  if (cierre <= apertura) return true;
  return cierre > limiteNoche || apertura >= limiteNoche;
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
