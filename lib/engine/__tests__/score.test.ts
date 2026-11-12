// Pruebas de la puntuación del motor (Integrante 4).
import { describe, expect, it } from "vitest";

import { engineConfig, weights } from "../config";
import { matchesInterest, scorePlace } from "../score";
import { isOpenAt, readPlaceInfo } from "../place";
import { panaderia, restauranteCaro, zocalo } from "./fixtures";

// Fijamos una hora concreta para que las pruebas no dependan del reloj.
const MEDIODIA = new Date("2026-11-11T13:00:00-06:00");
const NOCHE = new Date("2026-11-11T20:00:00-06:00");

describe("afinidad", () => {
  it("da más peso a un lugar cuya categoría está en los intereses", () => {
    const conInteres = scorePlace(panaderia, {
      interests: ["gastronomia"],
      now: MEDIODIA,
      origin: { lat: 19.5438, lng: -96.9111 },
      remainingMin: 120,
    });
    const sinInteres = scorePlace(panaderia, {
      interests: ["historia"],
      now: MEDIODIA,
      origin: { lat: 19.5438, lng: -96.9111 },
      remainingMin: 120,
    });

    expect(conInteres.afinidad).toBe(1);
    expect(sinInteres.afinidad).toBe(engineConfig.afinidadFueraDeInteres);
    expect(conInteres.total).toBeGreaterThan(sinInteres.total);
  });

  it("compara categorías sin tildes ni mayúsculas", () => {
    expect(matchesInterest(panaderia, ["Gastronomía"])).toBe(true);
    expect(matchesInterest(zocalo, ["paseo"])).toBe(true);
    expect(matchesInterest(zocalo, ["compras"])).toBe(false);
  });
});

describe("cercanía", () => {
  it("penaliza a los lugares lejanos del origen", () => {
    const cerca = scorePlace(panaderia, {
      interests: ["gastronomia"],
      now: MEDIODIA,
      origin: { lat: 19.5438, lng: -96.9111 },
      remainingMin: 120,
    });
    const lejos = scorePlace(panaderia, {
      interests: ["gastronomia"],
      now: MEDIODIA,
      origin: { lat: 19.5600, lng: -96.9300 },
      remainingMin: 120,
    });

    expect(cerca.cercania).toBeGreaterThan(lejos.cercania);
    expect(lejos.cercania).toBeGreaterThanOrEqual(0);
    expect(cerca.distanceM).toBeLessThan(200);
  });

  it("usa un valor neutro cuando el visitante no da ubicación", () => {
    const sinUbicacion = scorePlace(panaderia, {
      interests: ["gastronomia"],
      now: MEDIODIA,
      origin: null,
      remainingMin: 120,
    });

    expect(sinUbicacion.distanceM).toBeNull();
    expect(sinUbicacion.cercania).toBe(engineConfig.cercaniaSinOrigen);
  });
});

describe("disponibilidad", () => {
  it("reconoce un lugar abierto y otro cerrado según su horario verificado", () => {
    const info = readPlaceInfo(panaderia);
    expect(info.hoursVerified).toBe(true);
    expect(isOpenAt(info, 13 * 60)).toBe(true);
    expect(isOpenAt(info, 21 * 60)).toBe(false);
  });

  it("devuelve null cuando el horario no está verificado", () => {
    const sinVerificar = readPlaceInfo({
      ...zocalo,
      verified: false,
      hours: "Lun-Dom 07:00-23:00",
    });
    expect(isOpenAt(sinVerificar, 13 * 60)).toBeNull();
  });
});

describe("tiempo y oportunidad", () => {
  it("pone en cero el ajuste de tiempo cuando la visita no cabe", () => {
    const cabe = scorePlace(restauranteCaro, {
      interests: ["gastronomia"],
      now: MEDIODIA,
      origin: null,
      remainingMin: 120,
    });
    const noCabe = scorePlace(restauranteCaro, {
      interests: ["gastronomia"],
      now: MEDIODIA,
      origin: null,
      remainingMin: 30,
    });

    expect(cabe.tiempo).toBe(1);
    expect(noCabe.tiempo).toBe(0);
  });

  it("usa el valor de oportunidad declarado por el lugar", () => {
    const conOportunidad = scorePlace(panaderia, {
      interests: ["gastronomia"],
      now: MEDIODIA,
      origin: null,
      remainingMin: 120,
    });
    expect(conOportunidad.oportunidad).toBe(0.9);
  });
});

describe("bono nocturno", () => {
  it("bonifica los lugares abiertos después de las 19:00", () => {
    const conBono = scorePlace(panaderia, {
      interests: ["gastronomia"],
      now: NOCHE,
      origin: null,
      remainingMin: 120,
    });
    const sinBono = scorePlace(panaderia, {
      interests: ["gastronomia"],
      now: MEDIODIA,
      origin: null,
      remainingMin: 120,
    });

    expect(conBono.bonoNocturno).toBe(1);
    expect(sinBono.bonoNocturno).toBe(0);
  });
});

describe("ponderación", () => {
  it("la puntuación total es la suma de los pesos", () => {
    const r = scorePlace(panaderia, {
      interests: ["gastronomia"],
      now: MEDIODIA,
      origin: { lat: 19.5438, lng: -96.9111 },
      remainingMin: 120,
    });

    const esperado =
      weights.afinidad * r.afinidad +
      weights.cercania * r.cercania +
      weights.disponibilidad * r.disponibilidad +
      weights.tiempo * r.tiempo +
      weights.oportunidad * r.oportunidad +
      weights.bonoNocturno * r.bonoNocturno;

    expect(r.total).toBeCloseTo(esperado, 10);
  });
});
