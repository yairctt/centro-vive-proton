// Eventos de respaldo para la agenda (Integrante 4).
//
// ⚠️ ESTE ARCHIVO ES EL RESPALDO, NO LA FUENTE PRINCIPAL.
// La agenda real viene de la base de datos (`GET /api/events`, tabla `events`
// sembrada por el Integrante 3). Estos eventos de muestra solo se usan cuando
// la base no responde o no tiene agenda cargada.
//
// Son eventos SIMULADOS para probar el motor: la lista de lugares del equipo
// no incluye eventos, así que estos son de muestra y están marcados como
// tales en `meta.demo = true`.
//
// Regla del proyecto: no se inventan eventos reales. Por eso cada ficha
// lleva `source: "demo"`, `verified: false` y una hora calculada a partir del
// día de la demo, no una fecha real.

import type { Event } from "../types";

/**
 * Genera los eventos de muestra para una fecha dada.
 * El día de la demo (miércoles 11 de noviembre) hay uno nocturno.
 */
export function eventosDemo(fecha: Date = new Date("2026-11-11T00:00:00")): Event[] {
  const dia = fecha.toISOString().slice(0, 10);

  const aLas = (hora: string) => new Date(`${dia}T${hora}:00`).toISOString();

  return [
    {
      id: "evento-demo-danzon",
      name: "Danzón en la Plazuela de la Campana",
      description:
        "Tarde de danzón jarocho en la plazuela, como manda la tradición. Evento de demostración.",
      category: "cultura",
      startsAt: aLas("18:00"),
      endsAt: aLas("21:00"),
      placeId: "plazuela-de-la-campana",
      lat: 19.1989,
      lng: -96.137,
      source: "demo",
      verified: false,
      meta: { demo: true, entorno: "abierta al aire libre" },
    },
    {
      id: "evento-demo-nocturno",
      name: "Noche de allé en el Malecón",
      description:
        "Encuentro musical de noche en el Malecón. Evento de demostración, pensado para el Centro de noche.",
      category: "cultura",
      startsAt: aLas("20:00"),
      endsAt: aLas("23:30"),
      placeId: "malecon",
      lat: 19.2015,
      lng: -96.1352,
      source: "demo",
      verified: false,
      meta: { demo: true, nocturno: true, centroDeNoche: true },
    },
    {
      id: "evento-demo-ruta-gastronomica",
      name: "Ruta del café y el pan dulce",
      description:
        "Recorrido gastronómico por el centro que termina en el Gran Café de la Parroquia. Evento de demostración.",
      category: "gastronomia",
      startsAt: aLas("10:00"),
      endsAt: aLas("12:00"),
      placeId: "gran-cafe-de-la-parroquia",
      lat: 19.2011,
      lng: -96.1351,
      source: "demo",
      verified: false,
      meta: { demo: true },
    },
    {
      id: "evento-demo-tarde-mercado",
      name: "Tarde de artesanías en el Mercado Hidalgo",
      description:
        "Vendedores de artesanías veracruzanas en el mercado tradicional. Evento de demostración.",
      category: "compras",
      startsAt: aLas("16:00"),
      endsAt: aLas("19:00"),
      placeId: "mercado-hidalgo",
      lat: 19.1936,
      lng: -96.1371,
      source: "demo",
      verified: false,
      meta: { demo: true },
    },
  ];
}

/** Los eventos de demostración tal cual, con la fecha de la demo. */
export const EVENTOS_DEMO: Event[] = eventosDemo();
