// Pruebas de los interruptores de función (Integrante 4).
// `lib/flags.ts` permite apagar funciones sin tocar el código; el motor
// tiene que respetarlos. Se simula el módulo para probar los dos estados.

import { describe, expect, it, vi } from "vitest";

import { buildRoute } from "../route";
import { scorePlace } from "../score";
import { CATALOGO_DEMO, buscarLugarDemo } from "../datos-demo";

const NOCHE = new Date("2026-11-11T20:00:00-06:00");
const TARDE = new Date("2026-11-11T13:00:00-06:00");

const evento = {
  id: "ev-test",
  name: "Evento de prueba",
  description: "d",
  category: "cultura",
  // 14:00 en Veracruz: cae dentro de la ventana de 120 min que acaba a las 15:00.
  startsAt: new Date("2026-11-11T14:00:00-06:00").toISOString(),
  endsAt: null,
  placeId: "zocalo",
  lat: 19.2002,
  lng: -96.1385,
  source: "demo",
  verified: false,
  meta: {},
};

describe("interruptores del motor", () => {
  it("los tres interruptores existen y son booleanos", async () => {
    const { flags } = await import("../../flags");

    expect(typeof flags.ia).toBe("boolean");
    expect(typeof flags.centroDeNoche).toBe("boolean");
    expect(typeof flags.agenda).toBe("boolean");
  });
});

describe("con los interruptores encendidos", () => {
  it("aplica el bono de Centro de noche", () => {
    const granCafe = buscarLugarDemo("gran-cafe-de-la-parroquia")!;

    const r = scorePlace(granCafe, {
      interests: ["gastronomia"],
      now: NOCHE,
      origin: null,
      remainingMin: 120,
    });

    expect(r.bonoNocturno).toBe(1);
  });

  it("incluye los eventos de la agenda en la ruta", () => {
    const { stops } = buildRoute(
      CATALOGO_DEMO,
      { minutes: 120, interests: ["paseo"], budget: "medio" },
      { now: TARDE, events: [evento] },
    );

    expect(stops.some((s) => s.eventId === "ev-test")).toBe(true);
  });
});

describe("con los interruptores apagados", () => {
  it("no aplica el bono de Centro de noche", async () => {
    vi.doMock("../../flags", () => ({
      flags: { ia: true, centroDeNoche: false, agenda: true },
    }));
    vi.resetModules();

    const score = await import("../score");
    const granCafe = buscarLugarDemo("gran-cafe-de-la-parroquia")!;

    const r = score.scorePlace(granCafe, {
      interests: ["gastronomia"],
      now: NOCHE,
      origin: null,
      remainingMin: 120,
    });

    expect(r.bonoNocturno).toBe(0);
    vi.doUnmock("../../flags");
    vi.resetModules();
  });

  it("no incluye los eventos de la agenda en la ruta", async () => {
    vi.doMock("../../flags", () => ({
      flags: { ia: true, centroDeNoche: true, agenda: false },
    }));
    vi.resetModules();

    const ruta = await import("../route");
    const { stops } = ruta.buildRoute(
      CATALOGO_DEMO,
      { minutes: 120, interests: ["paseo"], budget: "medio" },
      { now: TARDE, events: [evento] },
    );

    expect(stops.some((s) => s.eventId === "ev-test")).toBe(false);
    vi.doUnmock("../../flags");
    vi.resetModules();
  });
});
