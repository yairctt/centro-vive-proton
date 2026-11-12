// Prueba del catálogo de demostración con los eventos (Integrante 4).
import { describe, expect, it } from "vitest";

import { CATALOGO_DEMO } from "../datos-demo";
import { eventosDemo } from "../datos-eventos";
import { buildRoute } from "../route";

const DIA = new Date("2026-11-11T00:00:00-06:00");

describe("eventos de demostración", () => {
  it("son 4 eventos y todos están marcados como demo", () => {
    const eventos = eventosDemo(DIA);
    expect(eventos).toHaveLength(4);
    for (const evento of eventos) {
      expect(evento.source).toBe("demo");
      expect(evento.verified).toBe(false);
      expect(evento.meta.demo).toBe(true);
    }
  });

  it("incluye un evento nocturno para el Centro de noche", () => {
    const eventos = eventosDemo(DIA);
    const nocturnos = eventos.filter((e) => e.meta.nocturno);
    expect(nocturnos).toHaveLength(1);
  });

  it("el motor mete en la ruta el evento que cae dentro de la ventana", () => {
    const eventos = eventosDemo(DIA);
    const { stops } = buildRoute(
      CATALOGO_DEMO,
      { minutes: 180, interests: ["cultura"], budget: "alto" },
      { now: new Date("2026-11-11T09:00:00-06:00"), events: eventos },
    );

    // La ruta de la mañana (10:00) sí cabe; la de la noche (18:00) no.
    expect(stops.some((s) => s.eventId === "evento-demo-ruta-gastronomica")).toBe(true);
    expect(stops.some((s) => s.eventId === "evento-demo-nocturno")).toBe(false);
  });

  it("en una ruta nocturna aparece el evento de la noche", () => {
    const eventos = eventosDemo(DIA);
    const { stops } = buildRoute(
      CATALOGO_DEMO,
      { minutes: 180, interests: ["cultura", "paseo"], budget: "alto" },
      { now: new Date("2026-11-11T17:30:00-06:00"), events: eventos },
    );

    expect(stops.some((s) => s.eventId === "evento-demo-nocturno")).toBe(true);
  });

  it("el evento se anota en la parada del lugar donde ocurre", () => {
    const eventos = eventosDemo(DIA);
    const { stops } = buildRoute(
      CATALOGO_DEMO,
      { minutes: 180, interests: ["compras"], budget: "alto" },
      { now: new Date("2026-11-11T15:30:00-06:00"), events: eventos },
    );

    const parada = stops.find((s) => s.eventId === "evento-demo-tarde-mercado");
    expect(parada).toBeDefined();
    expect(parada!.place.id).toBe("mercado-hidalgo");
  });
});
