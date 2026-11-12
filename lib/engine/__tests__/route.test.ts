// Pruebas de la construcción de ruta (Integrante 4).
import { describe, expect, it } from "vitest";

import { buildRoute } from "../route";
import { evento, lugar, lugarClosed, lugares, panaderia, zocalo } from "./fixtures";

const MEDIODIA = new Date("2026-11-11T13:00:00-06:00");
const NOCHE = new Date("2026-11-11T20:00:00-06:00");

describe("filtros", () => {
  it("excluye los lugares que no caben en el presupuesto", () => {
    const { stops } = buildRoute(
      lugares,
      { minutes: 180, interests: ["gastronomia"], budget: "bajo" },
      { now: MEDIODIA },
    );

    expect(stops.map((s) => s.place.id)).not.toContain("restaurante-caro");
    expect(stops.map((s) => s.place.id)).toContain("panaderia");
  });

  it("excluye los lugares que ya cerraron", () => {
    const { stops } = buildRoute(
      lugares,
      { minutes: 180, interests: ["historia"], budget: "alto" },
      { now: MEDIODIA },
    );

    expect(stops.map((s) => s.place.id)).not.toContain("cerrado");
  });
});

describe("orden y tiempo", () => {
  it("ordena las paradas y numera desde 1", () => {
    const { stops } = buildRoute(
      lugares,
      { minutes: 120, interests: ["gastronomia"], budget: "bajo" },
      { now: MEDIODIA },
    );

    expect(stops.length).toBeGreaterThan(0);
    expect(stops[0].order).toBe(1);
    stops.forEach((parada, i) => expect(parada.order).toBe(i + 1));
  });

  it("respeta el tiempo total disponible", () => {
    const { stops } = buildRoute(
      lugares,
      { minutes: 60, interests: ["gastronomia"], budget: "bajo" },
      { now: MEDIODIA },
    );

    const total = stops.reduce((sum, s) => sum + s.etaMin, 0);
    expect(total).toBeLessThanOrEqual(60);
  });

  it("coloca primero el lugar que mejor puntúa", () => {
    const { stops } = buildRoute(
      [zocalo, panaderia],
      {
        minutes: 120,
        interests: ["gastronomia"],
        budget: "bajo",
        lat: 19.5438,
        lng: -96.9111,
      },
      { now: MEDIODIA },
    );

    expect(stops[0].place.id).toBe("panaderia");
  });
});

describe("motivos", () => {
  it("cada parada lleva un motivo legible en español", () => {
    const { stops } = buildRoute(
      lugares,
      { minutes: 120, interests: ["gastronomia"], budget: "bajo" },
      { now: MEDIODIA },
    );

    expect(stops.length).toBeGreaterThan(0);
    for (const parada of stops) {
      expect(parada.reason.length).toBeGreaterThan(10);
      expect(parada.reason).toMatch(/[a-záéíóúñ]/i);
    }
  });
});

describe("eventos", () => {
  it("incluye un evento que empieza dentro de la ventana y está cerca", () => {
    const ev = evento({
      id: "ev-1",
      name: "Concierto en el Zócalo",
      startsAt: new Date("2026-11-11T15:00:00-06:00").toISOString(),
      lat: 19.5440,
      lng: -96.9110,
    });

    const { stops } = buildRoute(
      lugares,
      { minutes: 180, interests: ["paseo"], budget: "bajo" },
      { now: MEDIODIA, events: [ev] },
    );

    expect(stops.some((s) => s.eventId === "ev-1")).toBe(true);
  });

  it("no incluye un evento que empieza fuera de la ventana", () => {
    const ev = evento({
      id: "ev-2",
      name: "Evento de mañana",
      startsAt: new Date("2026-11-12T09:00:00-06:00").toISOString(),
    });

    const { stops } = buildRoute(
      lugares,
      { minutes: 60, interests: ["paseo"], budget: "bajo" },
      { now: MEDIODIA, events: [ev] },
    );

    expect(stops.some((s) => s.eventId === "ev-2")).toBe(false);
  });
});

describe("bono de Centro de noche", () => {
  it("premia los lugares abiertos de noche en el motivo", () => {
    const abiertoTarde = lugar({
      id: "bar",
      name: "Bar del Malecón",
      category: "gastronomia",
      hours: "Lun-Dom 18:00-02:00",
      verified: true,
      meta: { avgVisitMin: 40, opportunity: 0.8, priceLevel: "medio" },
    });

    const { stops } = buildRoute(
      [abiertoTarde],
      { minutes: 90, interests: ["gastronomia"], budget: "medio" },
      { now: NOCHE },
    );

    expect(stops[0].score?.bonoNocturno).toBe(1);
    expect(stops[0].reason).toMatch(/noche/i);
  });
});

describe("lugares cerrados y no verificados", () => {
  it("un lugar sin horario verificado no se descarta", () => {
    const sinHorario = lugar({
      id: "sin-horario",
      name: "Puesto de la esquina",
      category: "gastronomia",
      hours: null,
      verified: false,
      meta: { avgVisitMin: 20 },
    });

    const { stops } = buildRoute(
      [sinHorario, lugarClosed],
      { minutes: 120, interests: ["gastronomia"], budget: "bajo" },
      { now: MEDIODIA },
    );

    expect(stops.map((s) => s.place.id)).toContain("sin-horario");
  });
});
