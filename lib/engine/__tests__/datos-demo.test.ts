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
import { distanceM } from "../geo";
import { isOpenAt, readPlaceInfo } from "../place";
import type { Place } from "../../types";

// Miércoles 11 de noviembre de 2026, 13:00.
const MIERCOLES_13H = new Date("2026-11-11T13:00:00-06:00");
// Martes 10 de noviembre de 2026, 13:00.
const MARTES_13H = new Date("2026-11-10T13:00:00-06:00");
// Lunes 9 de noviembre de 2026, 13:00.
const LUNES_13H = new Date("2026-11-09T13:00:00-06:00");

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

  it("el motor lee los datos de la ficha desde meta", () => {
    const granCafe = buscarLugarDemo("gran-cafe-de-la-parroquia");
    expect(granCafe).toBeDefined();
    const info = readPlaceInfo(granCafe!, 3);
    expect(info.avgVisitMin).toBe(20);
    expect(info.priceLevel).toBe("medio");
    expect(info.opportunity).toBe(0.4);
  });

  it("los lugares con horario oficial declaran su horario semanal", () => {
    for (const lugar of CATALOGO_DEMO) {
      const info = readPlaceInfo(lugar, 3);
      if (lugar.meta.estado) continue; // cerrados: sin horario aplicable
      expect(info.horarioSemanal, `falta horario de ${lugar.id}`).not.toBeNull();
    }
  });
});

describe("coordenadas", () => {
  // El Centro Histórico de Veracruz está en ~19.20, -96.13 (OpenStreetMap).
  // Antes se usaron unas coordenadas equivocadas de la zona de Xalapa, que
  // dejaban la ruta entera a 80 km. Esta prueba lo evita.
  const ZOCALO = { lat: 19.2002, lng: -96.1385 };
  /** Distancia a pie razonable desde el Zócalo (unos 4 km). */
  const RADIO_CENTRO_M = 4000;

  it("el Zócalo es el punto de referencia y queda en el centro", () => {
    const zocalo = buscarLugarDemo("zocalo")!;

    expect(zocalo.lat).toBeCloseTo(ZOCALO.lat, 3);
    expect(zocalo.lng).toBeCloseTo(ZOCALO.lng, 3);
  });

  it("los lugares del núcleo están a menos de 4 km del Zócalo", () => {
    for (const lugar of CATALOGO_DEMO) {
      // Boca del Río y la Isla de Sacrificios quedan fuera a propósito.
      if (lugar.meta.fueraDelCentro) continue;
      const distancia = distanceM(ZOCALO, { lat: lugar.lat, lng: lugar.lng });
      expect(
        distancia,
        `${lugar.id} está a ${Math.round(distancia / 1000)} km del Zócalo`,
      ).toBeLessThan(RADIO_CENTRO_M);
    }
  });

  it("el catálogo ampliado solo tiene destinos fuera del centro marcados", () => {
    for (const lugar of CATALOGO_AMPLIO) {
      const distancia = distanceM(ZOCALO, { lat: lugar.lat, lng: lugar.lng });
      const fueraDelCentro = lugar.meta.fueraDelCentro === true;
      expect(
        distancia < RADIO_CENTRO_M || fueraDelCentro,
        `${lugar.id} está a ${Math.round(distancia / 1000)} km y no lo declara`,
      ).toBe(true);
    }
  });

  it("las distancias entre lugares del centro son caminables", () => {
    const zocalo = buscarLugarDemo("zocalo")!;
    const portales = buscarLugarDemo("portales-de-veracruz")!;

    // Entre el Zócalo y los Portales hay unos metros, no kilómetros.
    const distancia = distanceM(
      { lat: zocalo.lat, lng: zocalo.lng },
      { lat: portales.lat, lng: portales.lng },
    );
    expect(distancia).toBeLessThan(500);
  });
});

describe("horarios semanales", () => {
  it("el Acuario abre más tarde los fines de semana", () => {
    const acuario = buscarLugarDemo("acuario-de-veracruz")!;

    const miercoles = readPlaceInfo(acuario, 3);
    const sabado = readPlaceInfo(acuario, 6);

    expect(miercoles.horarioSemanal?.[3]).toEqual(["10:00", "19:00"]);
    expect(sabado.horarioSemanal?.[6]).toEqual(["10:00", "19:30"]);
  });

  it("el Museo Naval y el Fuerte están cerrados los lunes", () => {
    const museo = readPlaceInfo(buscarLugarDemo("museo-naval-mexico")!, 1);
    const fuerte = readPlaceInfo(buscarLugarDemo("fuerte-san-juan-de-ulua")!, 1);

    expect(museo.horarioSemanal?.[1]).toBeNull();
    expect(fuerte.horarioSemanal?.[1]).toBeNull();
    expect(museo.cerradoHoy).toBe(true);
    expect(fuerte.cerradoHoy).toBe(true);
  });

  it("el Mercado Hidalgo cierra antes los domingos", () => {
    const mercado = buscarLugarDemo("mercado-hidalgo")!;

    expect(readPlaceInfo(mercado, 6).horarioSemanal?.[6]).toEqual(["07:00", "18:00"]);
    expect(readPlaceInfo(mercado, 7).horarioSemanal?.[7]).toEqual(["07:00", "16:00"]);
  });

  it("el Tianguis solo abre fines de semana", () => {
    const tianguis = buscarLugarDemo("tianguis-de-los-lavaderos")!;

    expect(readPlaceInfo(tianguis, 3).horarioSemanal?.[3]).toBeNull();
    expect(readPlaceInfo(tianguis, 6).horarioSemanal?.[6]).toEqual(["09:00", "17:30"]);
  });

  it("los lugares abiertos 24 horas nunca se cierran", () => {
    const malecon = buscarLugarDemo("malecon")!;
    const info = readPlaceInfo(malecon, 5);

    expect(isOpenAt(info, 0, 5)).toBe(true);
    expect(isOpenAt(info, 23 * 60 + 59, 5)).toBe(true);
    expect(isOpenAt(info, 12 * 60, 5)).toBe(true);
  });

  it("un cierre a medianoche cuenta como fin del día", () => {
    // El Gran Café del Portal cierra a las 00:00 los fines de semana.
    const portal = buscarLugarDemo("gran-cafe-del-portal")!;
    const sabado = readPlaceInfo(portal, 6);

    expect(isOpenAt(sabado, 23 * 60 + 30, 6)).toBe(true);
    expect(isOpenAt(sabado, 0, 6)).toBe(false);
    expect(isOpenAt(sabado, 6 * 60, 6)).toBe(false);
  });

  it("el Baluarte y la Isla de Sacrificios quedan fuera por estar cerrados", () => {
    const baluarte = readPlaceInfo(buscarLugarDemo("baluarte-de-santiago")!, 3);
    const isla = readPlaceInfo(buscarLugarDemo("isla-de-sacrificios")!, 3);

    expect(baluarte.estado).toBe("cerradoTemporalmente");
    expect(isla.estado).toBe("cerradoAlPublico");
    expect(isOpenAt(baluarte, 12 * 60, 3)).toBe(false);
    expect(isOpenAt(isla, 12 * 60, 3)).toBe(false);
  });

  it("un lugar con horario variable no se descarta: se trata como 'no se sabe'", () => {
    // El Gran Café tiene horarios reportados que se recommends confirmar.
    const granCafe = readPlaceInfo(buscarLugarDemo("gran-cafe-de-la-parroquia")!, 3);
    expect(granCafe.hoursVerified).toBe(false);
    expect(granCafe.horarioNota).toContain("confirmar");
  });
});

describe("el catálogo funciona con el motor", () => {
  it("genera una ruta con el catálogo de demostración", () => {
    const { stops } = buildRoute(
      CATALOGO_DEMO,
      { minutes: 120, interests: ["gastronomia", "historia"], budget: "bajo" },
      { now: MIERCOLES_13H },
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
      { now: MIERCOLES_13H },
    );

    expect(stops.map((s) => s.place.id)).not.toContain("mariscos-villa-rica-mocambo");
    expect(stops.map((s) => s.place.id)).not.toContain("plaza-andamar");
  });

  it("excluye los lugares cerrados, como el Baluarte", () => {
    const { stops } = buildRoute(
      CATALOGO_DEMO,
      { minutes: 180, interests: ["historia"], budget: "alto" },
      { now: MIERCOLES_13H },
    );

    expect(stops.map((s) => s.place.id)).not.toContain("baluarte-de-santiago");
  });

  it("un museo cerrado el lunes no aparece en la ruta del lunes", () => {
    const { stops: lunes } = buildRoute(
      CATALOGO_DEMO,
      { minutes: 180, interests: ["historia", "cultura"], budget: "alto" },
      { now: LUNES_13H },
    );
    const { stops: martes } = buildRoute(
      CATALOGO_DEMO,
      { minutes: 180, interests: ["historia", "cultura"], budget: "alto" },
      { now: MARTES_13H },
    );

    expect(lunes.map((s) => s.place.id)).not.toContain("museo-naval-mexico");
    expect(martes.map((s) => s.place.id)).toContain("museo-naval-mexico");
  });

  it("sin ubicación del visitante, la ruta arranca en el Zócalo", () => {
    const { stops } = buildRoute(
      CATALOGO_DEMO,
      { minutes: 120, interests: ["paseo"], budget: "medio" },
      { now: MIERCOLES_13H },
    );

    const primera = stops[0];
    expect(primera.place.id === "zocalo" || primera.distanceM < 200).toBe(true);
  });

  it("la ruta respeta el tiempo pedido", () => {
    for (const minutos of [60, 90, 120, 180]) {
      const { stops } = buildRoute(
        CATALOGO_DEMO,
        { minutes: minutos, interests: ["paseo", "cultura"], budget: "alto" },
        { now: MIERCOLES_13H },
      );

      const consumido = stops.reduce(
        (sum, s) => sum + s.etaMin + readPlaceInfo(s.place, 3).avgVisitMin,
        0,
      );
      expect(consumido).toBeLessThanOrEqual(minutos);
    }
  });
});
