// Pruebas de compatibilidad con el seed real del backend (Integrante 4).
// Reproducen las filas exactas de `supabase/seed.sql` para comprobar que el
// motor las entiende: la base de datos es la fuente principal de datos.

import { describe, expect, it } from "vitest";

import { adaptarEvento, adaptarMision } from "../adaptar";
import { buildRoute } from "@/lib/engine/route";
import { readPlaceInfo } from "@/lib/engine/place";
import { scorePlace } from "@/lib/engine/score";
import { toPlace } from "@/lib/db/mappers";
import type { Place } from "@/lib/types";

// --- Filas del seed de I3 (supabase/seed.sql) ---

/** Zócalo del seed: id uuid, nombre largo, sin horario, meta vacía. */
const filaZocalo = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "Zócalo de Veracruz (Plaza de Armas)",
  category: "historia",
  lat: 19.2001,
  lng: -96.1384,
  description: "Corazón social e histórico del puerto jarocho",
  opens_at: null,
  closes_at: null,
  avg_visit_min: 30,
  price_level: "bajo",
  opportunity: 0.35,
  verified: false,
  meta: {},
};

/** Comercio nocturno del seed: meta.abreDeNoche y closes_at a las 22:00. */
const filaNocturno = {
  id: "00000000-0000-0000-0000-000000000014",
  name: "[DEMO] Café y Toritos La Bamba Nocturna",
  category: "gastronomia",
  lat: 19.2012,
  lng: -96.1368,
  description: "Bebidas espirituosas artesanales y café de especialidad",
  opens_at: null,
  closes_at: "22:00:00",
  avg_visit_min: 35,
  price_level: "medio",
  opportunity: 0.9,
  verified: false,
  meta: { abreDeNoche: true },
};

/** Evento del seed: la columna del título es `title`, no `name`. */
const filaEvento = {
  id: "eeeeeeee-0000-0000-0000-000000000001",
  place_id: "00000000-0000-0000-0000-000000000001",
  title: "Tarde de Danzón y Marimba en el Zócalo",
  category: "cultura",
  starts_at: "2026-11-11T18:00:00.000Z",
  ends_at: "2026-11-11T19:30:00.000Z",
  source: "demo",
  verified: false,
  meta: {},
  places: filaZocalo,
};

/** Misión del seed: usa `description` y `active`, no `rules` ni `status`. */
const filaMision = {
  id: "ca000000-0000-0000-0000-000000000002",
  place_id: "00000000-0000-0000-0000-000000000014",
  title: "Noche de Sabor y Torito Jarocho",
  description: "Visita La Bamba Nocturna después de las 19:00 hrs.",
  points: 80,
  night_bonus: true,
  active: true,
};

describe("adaptador de filas del backend", () => {
  it("lee el título del evento de la columna `title`", () => {
    const evento = adaptarEvento(filaEvento);

    expect(evento.name).toBe("Tarde de Danzón y Marimba en el Zócalo");
    expect(evento.placeId).toBe("00000000-0000-0000-0000-000000000001");
    expect(evento.startsAt).toBe("2026-11-11T18:00:00.000Z");
  });

  it("el evento toma las coordenadas del lugar asociado", () => {
    const evento = adaptarEvento(filaEvento);

    expect(evento.lat).toBeCloseTo(19.2001, 4);
    expect(evento.lng).toBeCloseTo(-96.1384, 4);
  });

  it("lee las reglas de la misión de la columna `description`", () => {
    const mision = adaptarMision(filaMision);

    expect(mision.rules).toContain("Bamba Nocturna");
    expect(mision.points).toBe(80);
    expect(mision.placeId).toBe("00000000-0000-0000-0000-000000000014");
  });

  it("traduce el booleano `active` al estado de la misión", () => {
    expect(adaptarMision(filaMision).status).toBe("activa");
    expect(adaptarMision({ ...filaMision, active: false }).status).toBe("pausada");
  });

  it("también acepta el esquema de `rules` y `status`", () => {
    const mision = adaptarMision({
      id: "x",
      place_id: "y",
      title: "z",
      rules: "reglas nuevas",
      points: 10,
      status: "activa",
    });

    expect(mision.rules).toBe("reglas nuevas");
    expect(mision.status).toBe("activa");
  });
});

describe("el motor entiende las filas del seed", () => {
  it("lee el tiempo de visita, el precio y la oportunidad del seed", () => {
    const info = readPlaceInfo(toPlace(filaZocalo), 3);

    expect(info.avgVisitMin).toBe(30);
    expect(info.priceLevel).toBe("bajo");
    expect(info.opportunity).toBe(0.35);
  });

  it("un lugar sin horario verificado no se descarta", () => {
    const info = readPlaceInfo(toPlace(filaZocalo), 3);

    // El seed marca todo como verified=false: el motor no puede afirmar que
    // esté abierto ni cerrado, pero tampoco lo elimina de la ruta.
    expect(info.hoursVerified).toBe(false);
    expect(info.cerradoHoy).toBeNull();
  });

  it("respeta el distintivo abreDeNoche del seed", () => {
    const lugar = toPlace(filaNocturno);
    const breakdown = scorePlace(lugar, {
      interests: ["gastronomia"],
      now: new Date("2026-11-11T20:00:00-06:00"),
      origin: null,
      remainingMin: 120,
    });

    expect(breakdown.bonoNocturno).toBe(1);
  });

  it("el Zócalo del seed se reconoce como punto de referencia", () => {
    const lugares: Place[] = [toPlace(filaZocalo)];
    const { stops } = buildRoute(
      lugares,
      { minutes: 120, interests: ["historia"], budget: "bajo" },
      { now: new Date("2026-11-11T13:00:00-06:00") },
    );

    expect(stops.length).toBeGreaterThan(0);
    // Sin origen, la primera parada está en el Zócalo o muy cerca.
    expect(stops[0].place.id === filaZocalo.id || stops[0].distanceM < 200).toBe(true);
  });

  it("construye una ruta con los lugares y eventos del seed", () => {
    const lugares: Place[] = [toPlace(filaZocalo), toPlace(filaNocturno)];
    const eventos = [adaptarEvento(filaEvento)];
    const misiones = [adaptarMision(filaMision)];

    const { stops } = buildRoute(
      lugares,
      { minutes: 120, interests: ["historia", "gastronomia"], budget: "medio" },
      { now: new Date("2026-11-11T17:00:00-06:00"), events: eventos, missions: misiones },
    );

    expect(stops.length).toBeGreaterThan(0);
    // La misión activa del seed se asocia a su parada.
    expect(stops.some((s) => s.missionId === filaMision.id)).toBe(true);
  });
});
