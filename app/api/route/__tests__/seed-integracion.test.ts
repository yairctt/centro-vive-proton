// Prueba de extremo a extremo con las 18 filas del seed de I3.
import { describe, expect, it } from "vitest";

import { adaptarEvento, adaptarMision } from "../adaptar";
import { buildRoute } from "@/lib/engine/route";
import { toPlace } from "@/lib/db/mappers";
import type { Place } from "@/lib/types";

const P = (id: string, name: string, category: string, lat: number, lng: number, extra: Record<string, unknown> = {}) => ({
  id, name, category, lat, lng,
  description: `Descripción de ${name}`,
  opens_at: null, closes_at: null,
  avg_visit_min: 30, price_level: "bajo", opportunity: 0.5,
  verified: false, meta: {}, ...extra,
});

// Las 12 ebemicas del seed.
const LUGARES = [
  P("001", "Zócalo de Veracruz (Plaza de Armas)", "historia", 19.2001, -96.1384),
  P("002", "Catedral de Veracruz (Nuestra Señora de la Asunción)", "historia", 19.1998, -96.1386),
  P("003", "Palacio Municipal de Veracruz", "historia", 19.2006, -96.1385),
  P("004", "Los Portales de Lerdo", "paseo", 19.2003, -96.1389),
  P("005", "Malecón de Veracruz", "paseo", 19.2025, -96.1345),
  P("006", "Faro Venustiano Carranza", "cultura", 19.2018, -96.1338),
  P("007", "Museo de la Ciudad de Veracruz", "cultura", 19.1975, -96.1378),
  P("008", "Callejón del Diamante", "paseo", 19.1989, -96.1396),
  P("009", "Gran Café del Portal", "gastronomia", 19.2002, -96.1391, { price_level: "medio" }),
  P("010", "Mercado Hidalgo", "compras", 19.1945, -96.1402, { opportunity: 0.65 }),
  P("011", "Baluarte de Santiago", "historia", 19.1956, -96.1342, { opportunity: 0.55 }),
  P("012", "Recinto de la Reforma", "historia", 19.1982, -96.1368),
];

// Los 6 comercios ficticios del seed (2 nocturnos).
const COMERCIOS = [
  P("013", "[DEMO] Antojitos La Jarocha Alegre", "gastronomia", 19.2008, -96.1378, { opportunity: 0.85, avg_visit_min: 25 }),
  P("014", "[DEMO] Café y Toritos La Bamba Nocturna", "gastronomia", 19.2012, -96.1368, { closes_at: "22:00:00", opportunity: 0.9, avg_visit_min: 35, price_level: "medio", meta: { abreDeNoche: true } }),
  P("015", "[DEMO] Mariscos El Puerto Bravo", "gastronomia", 19.2019, -96.1352, { closes_at: "22:00:00", opportunity: 0.85, avg_visit_min: 40, price_level: "medio", meta: { abreDeNoche: true } }),
  P("016", "[DEMO] Artesanías El Coral Blanco", "compras", 19.2022, -96.1358, { opportunity: 0.75, avg_visit_min: 20 }),
  P("017", "[DEMO] Guayaberas y Sombreros El Danzón", "compras", 19.1994, -96.138, { opportunity: 0.7, avg_visit_min: 25, price_level: "medio" }),
  P("018", "[DEMO] Dulcería y Nieves Doña Gloria", "gastronomia", 19.1991, -96.1387, { opportunity: 0.8, avg_visit_min: 15 }),
];

describe("el seed completo de I3 genera una ruta útil", () => {
  const places: Place[] = [...LUGARES, ...COMERCIOS].map(toPlace);

  it("genera una ruta de varias paradas a la tarde", () => {
    const { stops } = buildRoute(
      places,
      { minutes: 120, interests: ["historia", "gastronomia"], budget: "bajo" },
      { now: new Date("2026-11-11T15:00:00") },
    );

    expect(stops.length).toBeGreaterThan(2);
    for (const parada of stops) {
      expect(parada.reason.length).toBeGreaterThan(10);
      expect(parada.distanceM).toBeLessThan(2000);
    }
  });

  it("en la noche entra el comercio nocturno del seed", () => {
    const { stops } = buildRoute(
      places,
      { minutes: 180, interests: ["gastronomia"], budget: "medio" },
      { now: new Date("2026-11-11T20:00:00") },
    );

    const nocturnos = stops.filter((s) => s.place.name.includes("Nocturna") || s.place.name.includes("Puerto Bravo"));
    expect(nocturnos.length).toBeGreaterThan(0);
    expect(nocturnos[0].score?.bonoNocturno).toBe(1);
  });

  it("el presupuesto bajo descarta los comercios de precio medio y alto", () => {
    const { stops } = buildRoute(
      places,
      { minutes: 180, interests: ["gastronomia", "compras"], budget: "bajo" },
      { now: new Date("2026-11-11T15:00:00") },
    );

    const ids = stops.map((s) => s.place.id);
    expect(ids).not.toContain("014");
    expect(ids).not.toContain("015");
    expect(ids).not.toContain("017");
  });

  it("los eventos del seed entran en la ruta de la tarde", () => {
    // El seed guarda los horarios en hora de Veracruz (UTC-6): las 18:00
    // locales se guardan como 00:00 UTC del día siguiente.
    const eventos = [
      adaptarEvento({
        id: "ev-001",
        place_id: "001",
        title: "Tarde de Danzón y Marimba en el Zócalo",
        category: "cultura",
        starts_at: "2026-11-12T00:00:00.000Z",
        ends_at: "2026-11-12T01:30:00.000Z",
        source: "demo",
        verified: false,
        meta: {},
        places: LUGARES[0],
      }),
    ];

    const { stops } = buildRoute(
      places,
      { minutes: 300, interests: ["historia"], budget: "bajo" },
      { now: new Date("2026-11-11T17:00:00"), events: eventos },
    );

    expect(stops.some((s) => s.eventId === "ev-001")).toBe(true);
  });

  it("las misiones del seed se asocian a sus paradas", () => {
    const misiones = [
      adaptarMision({
        id: "m-002",
        place_id: "014",
        title: "Noche de Sabor y Torito Jarocho",
        description: "Visita La Bamba Nocturna después de las 19:00 hrs.",
        points: 80,
        night_bonus: true,
        active: true,
      }),
      adaptarMision({
        id: "m-003",
        place_id: "011",
        title: "Guardián del Baluarte",
        description: "Explora el Baluarte de Santiago.",
        points: 60,
        night_bonus: false,
        active: true,
      }),
    ];

    const { stops } = buildRoute(
      places,
      { minutes: 300, interests: ["historia", "gastronomia"], budget: "medio" },
      { now: new Date("2026-11-11T20:00:00"), missions: misiones },
    );

    // La parada del lugar con misión lleva su missionId.
    expect(stops.find((s) => s.place.id === "014")?.missionId).toBe("m-002");

    // Y toda parada con missionId corresponde a una misión activa de su lugar.
    for (const parada of stops) {
      if (!parada.missionId) continue;
      const mision = misiones.find((m) => m.id === parada.missionId);
      expect(mision).toBeDefined();
      expect(mision?.placeId).toBe(parada.place.id);
    }
  });

  it("una misión inactiva no se asocia a ninguna parada", () => {
    const misiones = [
      adaptarMision({
        id: "m-003",
        place_id: "011",
        title: "Guardián del Baluarte",
        description: "Explora el Baluarte de Santiago.",
        points: 60,
        night_bonus: false,
        active: false,
      }),
    ];

    const { stops } = buildRoute(
      places,
      { minutes: 300, interests: ["historia"], budget: "medio" },
      { now: new Date("2026-11-11T20:00:00"), missions: misiones },
    );

    expect(stops.some((s) => s.missionId === "m-003")).toBe(false);
  });
});
