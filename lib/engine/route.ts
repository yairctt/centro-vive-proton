// Construcción de la ruta (Integrante 4).
// Funciones puras: reciben lugares, eventos y peticiones; devuelven paradas
// ordenadas con su motivo. La IA solo redacta el texto después.

import type { Event, Mission, Place, RouteRequest, RouteStop } from "../types";
import { engineConfig } from "./config";
import { distanceM, walkMinutes, type LatLng } from "./geo";
import { fitsBudget, isOpenAt, readPlaceInfo } from "./place";
import { minutesOfDay, normalizeText, scorePlace, type ScoreBreakdown } from "./score";

/** Parada del motor: una parada del contrato más el evento que la acompaña. */
export interface EngineRouteStop extends RouteStop {
  /** Evento asociado a la parada, si lo hay. */
  eventId?: string;
  /** Nombre del evento asociado. */
  eventName?: string;
  /** "lugar" o "evento". */
  kind?: "lugar" | "evento";
  /** Desglose de la puntuación, para depurar y explicar. */
  score?: ScoreBreakdown;
}

/** Respuesta del motor. Compatible con `RouteResponse` de lib/types.ts. */
export interface EngineRouteResponse {
  stops: EngineRouteStop[];
}

export interface BuildRouteOptions {
  /** Momento de la ruta (por defecto, ahora). */
  now?: Date;
  /** Misiones activas, para asociar la misión de cada parada. */
  missions?: Mission[];
  /** Eventos de la agenda ya filtrados. */
  events?: Event[];
}

/** Formatea una distancia en minutos de caminata, en español. */
function formatMinutes(min: number): string {
  const redondeado = Math.max(1, Math.round(min));
  return `${redondeado} min`;
}

/** Redacta el motivo legible de una parada (CONTEXTO.md, sección 8, punto 5). */
export function buildReason(
  place: Place,
  breakdown: ScoreBreakdown,
  opts: { etaMin?: number; eventName?: string; interest?: string } = {},
): string {
  const partes: string[] = [];

  if (opts.interest) {
    partes.push(`Te interesa ${normalizeText(opts.interest)}`);
  } else {
    partes.push(`Es de ${normalizeText(place.category)}`);
  }

  if (opts.etaMin !== undefined && opts.etaMin > 0) {
    partes.push(`está a ${formatMinutes(opts.etaMin)} a pie`);
  }

  if (breakdown.open === true) {
    partes.push("está abierto ahora");
  } else if (breakdown.open === false) {
    partes.push("estará cerrado cuando llegues");
  }

  if (breakdown.oportunidad >= 0.7) {
    partes.push("necesita que le pongas un sello");
  }

  if (opts.eventName) {
    partes.push(`hay "${opts.eventName}"`);
  }

  if (breakdown.bonoNocturno > 0) {
    partes.push("cuenta con puntos extra de Centro de noche");
  }

  const texto = partes.join(", ");
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** Convierte un evento en una parada sintetizable (para mostrarlo en la ruta). */
function eventToPlace(event: Event): Place {
  return {
    id: event.placeId ?? `evento-${event.id}`,
    name: event.name,
    category: event.category,
    lat: event.lat,
    lng: event.lng,
    description: event.description,
    hours: null,
    verified: event.verified,
    meta: { esEvento: true, eventoId: event.id, startsAt: event.startsAt },
  };
}

/**
 * Construye la ruta sugerida.
 *
 * 1. Filtra por presupuesto y por lugares que ya cerraron.
 * 2. Puntúa y ordena por puntuación.
 * 3. Recorre con vecino más cercano mientras quepa en `minutes`.
 * 4. Incluye los eventos que empiezan dentro de la ventana y están a menos
 *    de 600 m de la ruta.
 * 5. Cada parada lleva su motivo legible.
 */
export function buildRoute(
  places: Place[],
  request: RouteRequest,
  options: BuildRouteOptions = {},
): EngineRouteResponse {
  const now = options.now ?? new Date();
  const minutosVentana = Math.max(0, request.minutes);
  const ahora = minutesOfDay(now);

  // Punto de partida: la ubicación del visitante si la autoriza; si no, el
  // lugar de referencia (el Zócalo), que es el corazón del Centro Histórico.
  let origin: LatLng | null =
    request.lat !== undefined && request.lng !== undefined
      ? { lat: request.lat, lng: request.lng }
      : null;

  if (!origin) {
    const referencia = places.find((lugar) => lugar.id === engineConfig.lugarReferenciaId);
    if (referencia) origin = { lat: referencia.lat, lng: referencia.lng };
  }

  const eventos = (options.events ?? []).filter((event) => {
    const inicio = Date.parse(event.startsAt);
    if (Number.isNaN(inicio)) return false;
    return inicio >= now.getTime() && inicio <= now.getTime() + minutosVentana * 60_000;
  });

  const misiones = options.missions ?? [];
  const misionPorLugar = new Map<string, string>();
  for (const mision of misiones) {
    if (mision.status !== "activa") continue;
    if (!misionPorLugar.has(mision.placeId)) misionPorLugar.set(mision.placeId, mision.id);
  }

  // 1. Filtros duros: presupuesto y lugares ya cerrados.
  const candidatos = places.filter((place) => {
    const info = readPlaceInfo(place);
    if (!fitsBudget(info, request.budget)) return false;
    if (isOpenAt(info, ahora) === false) return false;
    return true;
  });

  // 2. Puntuación con el tiempo completo disponible.
  const puntuados = candidatos.map((place) => {
    const info = readPlaceInfo(place);
    const breakdown = scorePlace(place, {
      interests: request.interests,
      now,
      origin,
      remainingMin: minutosVentana,
    }, info);
    return { place, info, breakdown };
  });

  puntuados.sort((a, b) => b.breakdown.total - a.breakdown.total);

  const selected: EngineRouteStop[] = [];
  const selectedIds = new Set<string>();
  let restante = minutosVentana;
  let actual: LatLng | null = origin;
  let minutosTranscurridos = 0;

  // 3. Recorrido: vecino más cercano con sesgo a la puntuación.
  while (selected.length < engineConfig.maxParadas && restante > 0) {
    let mejor: { place: Place; info: (typeof puntuados)[number]["info"]; breakdown: ScoreBreakdown; etaMin: number; distanceM: number } | null = null;
    let mejorCosto = Number.POSITIVE_INFINITY;

    for (const candidato of puntuados) {
      if (selectedIds.has(candidato.place.id)) continue;
      const dist = actual
        ? distanceM(actual, { lat: candidato.place.lat, lng: candidato.place.lng })
        : 0;
      const eta = walkMinutes(dist);
      if (eta + candidato.info.avgVisitMin > restante) continue;
      const costo = eta * engineConfig.penalSaltoDeRuta - candidato.breakdown.total;
      if (costo < mejorCosto) {
        mejorCosto = costo;
        mejor = {
          place: candidato.place,
          info: candidato.info,
          breakdown: candidato.breakdown,
          etaMin: eta,
          distanceM: dist,
        };
      }
    }

    if (!mejor) break;

    const { place, breakdown, etaMin, distanceM: dist } = mejor;
    const interes = request.interests.find(
      (i) => normalizeText(i) === normalizeText(place.category),
    );

    selected.push({
      place,
      order: selected.length + 1,
      distanceM: Math.round(dist),
      etaMin: Math.round(etaMin),
      reason: buildReason(place, breakdown, { etaMin, interest: interes }),
      missionId: misionPorLugar.get(place.id),
      kind: "lugar",
      score: breakdown,
    });

    selectedIds.add(place.id);
    restante -= etaMin + mejor.info.avgVisitMin;
    minutosTranscurridos += etaMin + mejor.info.avgVisitMin;
    actual = { lat: place.lat, lng: place.lng };
  }

  // 4. Eventos dentro de la ventana y a menos de 600 m de la ruta.
  const puntosRuta: LatLng[] = origin ? [origin] : [];
  for (const parada of selected) {
    puntosRuta.push({ lat: parada.place.lat, lng: parada.place.lng });
  }

  const eventosEnRuta = eventos.filter((evento) => {
    const punto = { lat: evento.lat, lng: evento.lng };
    return puntosRuta.some((p) => distanceM(p, punto) <= engineConfig.radioEventoM);
  });

  for (const evento of eventosEnRuta) {
    const parada = selected.find((p) => p.place.id === evento.placeId);
    if (parada) {
      // El evento ocurre en un lugar que ya está en la ruta: se anotan ahí.
      parada.eventId = evento.id;
      parada.eventName = evento.name;
      parada.reason = buildReason(parada.place, parada.score ?? {
        total: 0, afinidad: 0, cercania: 0, disponibilidad: 0, tiempo: 0, oportunidad: 0, bonoNocturno: 0, distanceM: null, open: null,
      }, { eventName: evento.name });
      continue;
    }

    const puntoEvento = { lat: evento.lat, lng: evento.lng };
    const puntoAnterior = actual ?? origin;
    const dist = puntoAnterior ? distanceM(puntoAnterior, puntoEvento) : 0;
    const eta = walkMinutes(dist);
    if (minutosTranscurridos + eta > minutosVentana) continue;

    const placeEvento = eventToPlace(evento);
    selected.push({
      place: placeEvento,
      order: selected.length + 1,
      distanceM: Math.round(dist),
      etaMin: Math.round(eta),
      reason: `Hay "${evento.name}" cerca de la ruta`,
      eventId: evento.id,
      eventName: evento.name,
      kind: "evento",
    });
    minutosTranscurridos += eta;
    actual = puntoEvento;
  }

  // Reordenar la numeración final por si se agregaron eventos al final.
  selected.forEach((parada, i) => {
    parada.order = i + 1;
  });

  return { stops: selected };
}
