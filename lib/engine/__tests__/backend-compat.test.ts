// Pruebas de compatibilidad con el backend (Integrante 4).
// Verifican que el motor lee bien las fichas como las produce el mapper
// del Integrante 3 (`lib/db/mappers.ts`).

import { describe, expect, it } from "vitest";

import { fitsBudget, readPlaceInfo } from "../place";
import { buildRoute } from "../route";
import { toPlace, toEvent } from "../../db/mappers";
import type { Place } from "../../types";

/** Fila de la tabla `places` tal como la devuelve Supabase. */
const filaPlace: Record<string, unknown> = {
  id: "zocalo",
  name: "Zócalo y Centro Histórico",
  category: "paseo",
  lat: 19.5438,
  lng: -96.9111,
  description: "El alma social de la ciudad",
  hours: "Lun-Dom 07:00-23:00",
  verified: true,
  meta: { avgVisitMin: 25, priceLevel: "bajo", opportunity: 0.3 },
  opens_at: "07:00:00",
  closes_at: "23:00:00",
  avg_visit_min: 25,
  price_level: "bajo",
  opportunity: 0.3,
};

/** Fila de la tabla `events` con su relación `places(*)`. */
function filaEvent(inicio: Date): Record<string, unknown> {
  return {
    id: "ev-1",
    name: "Danzón en la Plazuela",
    description: "Tarde de danzón",
    category: "cultura",
    starts_at: inicio.toISOString(),
    ends_at: new Date(inicio.getTime() + 3 * 3600_000).toISOString(),
    place_id: "zocalo",
    lat: 19.5438,
    lng: -96.9111,
    source: "demo",
    verified: false,
    meta: {},
    places: { ...filaPlace, id: "plazuela" },
  };
}

describe("compatibilidad con el mapper del backend", () => {
  it("lee el horario en HH:MM de la fila de la base", () => {
    const lugar = toPlace(filaPlace);
    const info = readPlaceInfo(lugar);

    expect(info.opensAt).toBe("07:00");
    expect(info.closesAt).toBe("23:00");
    expect(info.hoursVerified).toBe(true);
  });

  it("lee el tiempo de visita, el precio y la oportunidad", () => {
    const info = readPlaceInfo(toPlace(filaPlace));

    expect(info.avgVisitMin).toBe(25);
    expect(info.priceLevel).toBe("bajo");
    expect(info.opportunity).toBe(0.3);
  });

  it("el presupuesto usa el rango de precio del backend", () => {
    const info = readPlaceInfo(toPlace(filaPlace));

    expect(fitsBudget(info, "bajo")).toBe(true);
    expect(fitsBudget(info, "alto")).toBe(true);
  });

  it("un lugar sin horario verificado no se descarta por estar 'cerrado'", () => {
    const sinVerificar = toPlace({ ...filaPlace, verified: false, hours: null });
    const info = readPlaceInfo(sinVerificar);

    expect(info.hoursVerified).toBe(false);
    expect(fitsBudget(info, "bajo")).toBe(true);
  });

  it("convierte un evento del backend y lo mete en la ruta", () => {
    // El evento empieza dentro de la ventana de la ruta.
    const inicio = new Date("2026-11-11T17:00:00");
    const evento = toEvent(filaEvent(inicio));
    expect(evento.placeId).toBe("zocalo");
    expect(evento.startsAt).toBe(inicio.toISOString());

    const lugares: Place[] = [toPlace(filaPlace)];
    const { stops } = buildRoute(
      lugares,
      { minutes: 120, interests: ["paseo"], budget: "bajo" },
      { now: inicio, events: [evento] },
    );

    expect(stops.some((s) => s.eventId === "ev-1")).toBe(true);
  });
});
