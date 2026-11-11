// Lugares de prueba para las pruebas del motor (Integrante 4).
// No son datos reales: sirven solo para verificar el algoritmo.

import type { Event, Place } from "../../types";

export function lugar(over: Partial<Place> & { id: string }): Place {
  return {
    name: over.id,
    category: "cultura",
    lat: 19.5438,
    lng: -96.9111,
    description: "Lugar de prueba",
    hours: null,
    verified: false,
    meta: {},
    ...over,
  };
}

/** Zócalo: punto de referencia del centro. */
export const zocalo = lugar({
  id: "zocalo",
  name: "Zócalo",
  category: "paseo",
  lat: 19.5438,
  lng: -96.9111,
  hours: "Lun-Dom 07:00-23:00",
  verified: true,
  meta: { avgVisitMin: 20, opportunity: 0.4, priceLevel: "bajo" },
});

/** Panadería cerca, categoría gastronomía. */
export const panaderia = lugar({
  id: "panaderia",
  name: "Panadería del Puerto",
  category: "gastronomia",
  lat: 19.5449,
  lng: -96.9103,
  hours: "Lun-Dom 08:00-20:00",
  verified: true,
  meta: { avgVisitMin: 25, opportunity: 0.9, priceLevel: "bajo" },
});

/** Comercio caro, se excluye con presupuesto bajo. */
export const restauranteCaro = lugar({
  id: "restaurante-caro",
  name: "Restaurante de autor",
  category: "gastronomia",
  lat: 19.5451,
  lng: -96.9095,
  hours: "Lun-Dom 13:00-23:00",
  verified: true,
  meta: { avgVisitMin: 90, opportunity: 0.3, priceLevel: "alto" },
});

/** Lugar con horario verificado que cierra temprano. */
export const lugarClosed = lugar({
  id: "cerrado",
  name: "Museo del Carmen",
  category: "historia",
  lat: 19.5431,
  lng: -96.9108,
  hours: "Lun-Dom 09:00-13:00",
  verified: true,
  meta: { avgVisitMin: 30, opportunity: 0.6, priceLevel: "bajo" },
});

export const lugares = [zocalo, panaderia, restauranteCaro, lugarClosed];

/** Evento de prueba que empieza en dos horas. */
export function evento(over: Partial<Event> & { id: string }): Event {
  const startsAt = over.startsAt ?? new Date(Date.now() + 2 * 3600_000).toISOString();
  return {
    name: over.id,
    description: "Evento de prueba",
    category: "cultura",
    startsAt,
    endsAt: null,
    placeId: null,
    lat: 19.5440,
    lng: -96.9110,
    source: "prueba",
    verified: true,
    meta: {},
    ...over,
  };
}
