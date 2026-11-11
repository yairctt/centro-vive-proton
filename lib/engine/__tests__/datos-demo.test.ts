// Pruebas del catálogo de demostración (Integrante 4).
import { describe, expect, it } from "vitest";

import {
  CATALOGO_AMPLIO,
  CATALOGO_DEMO,
  COMERCIOS_DEMO,
  LUGARES_DEMO,
  NEGOCIOS_DEMO,
  buscarLugarDemo,
} from "../datos-demo";
import { buildRoute } from "../route";
import { readPlaceInfo } from "../place";
import type { Place } from "../../types";

describe("catálogo de demostración", () => {
  it("tiene los 12 lugares y los 6 comercios del núcleo", () => {
    expect(LUGARES_DEMO).toHaveLength(12);
    expect(COMERCIOS_DEMO).toHaveLength(6);
    expect(CATALOGO_DEMO).toHaveLength(18);
  });

  it("no repite ids", () => {
    const ids = CATALOGO_AMPLIO.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("cada comercio tiene su ficha de negocio apuntando a su lugar", () => {
    expect(NEGOCIOS_DEMO).toHaveLength(6);
    for (const negocio of NEGOCIOS_DEMO) {
      const lugar = CATALOGO_DEMO.find((l) => l.id === negocio.placeId);
      expect(lugar, `falta el lugar ${negocio.placeId}`).toBeDefined();
      expect(negocio.active).toBe(true);
    }
  });

  it("no inventa horarios: todos quedan por verificar", () => {
    for (const lugar of CATALOGO_AMPLIO) {
      expect(lugar.hours).toBeNull();
      expect(lugar.verified).toBe(false);
      expect(lugar.meta.horarioPorVerificar).toBe(true);
    }
  });

  it("el motor lee los datos de la ficha desde meta", () => {
    const granCafe = buscarLugarDemo("gran-cafe-de-la-parroquia");
    expect(granCafe).toBeDefined();
    const info = readPlaceInfo(granCafe!);
    expect(info.avgVisitMin).toBe(20);
    expect(info.priceLevel).toBe("medio");
    expect(info.opportunity).toBe(0.4);
    // Sin horario verificado, el motor no puede afirmar que esté abierto.
    expect(info.hoursVerified).toBe(false);
  });
});

describe("el catálogo funciona con el motor", () => {
  it("genera una ruta con el catálogo de demostración", () => {
    const { stops } = buildRoute(
      CATALOGO_DEMO,
      { minutes: 120, interests: ["gastronomia", "historia"], budget: "bajo" },
      { now: new Date("2026-11-11T13:00:00") },
    );

    expect(stops.length).toBeGreaterThan(0);
    for (const parada of stops) {
      expect(parada.reason.length).toBeGreaterThan(10);
      expect(parada.place.id).toBeTruthy();
    }
  });

  it("el presupuesto descarta los comercios caros", () => {
    const catalogos: Place[] = CATALOGO_DEMO;
    const { stops } = buildRoute(
      catalogos,
      { minutes: 180, interests: ["gastronomia"], budget: "bajo" },
      { now: new Date("2026-11-11T13:00:00") },
    );

    expect(stops.map((s) => s.place.id)).not.toContain("mariscos-villa-rica-mocambo");
    expect(stops.map((s) => s.place.id)).not.toContain("plaza-andamar");
  });

  it("sin ubicación del visitante, la ruta arranca en el Zócalo", () => {
    const { stops } = buildRoute(
      CATALOGO_DEMO,
      { minutes: 120, interests: ["paseo"], budget: "medio" },
      { now: new Date("2026-11-11T13:00:00") },
    );

    // La primera parada está en el punto de referencia o muy cerca de él.
    const primera = stops[0];
    expect(primera.place.id === "zocalo" || primera.distanceM < 200).toBe(true);
  });

  it("la ruta respeta el tiempo pedido", () => {
    for (const minutos of [60, 90, 120, 180]) {
      const { stops } = buildRoute(
        CATALOGO_DEMO,
        { minutes: minutos, interests: ["paseo", "cultura"], budget: "alto" },
        { now: new Date("2026-11-11T13:00:00") },
      );

      const consumido = stops.reduce(
        (sum, s) => sum + s.etaMin + readPlaceInfo(s.place).avgVisitMin,
        0,
      );
      expect(consumido).toBeLessThanOrEqual(minutos);
    }
  });
});
