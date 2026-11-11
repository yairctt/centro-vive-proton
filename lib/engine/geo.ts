// Utilidades geográficas del motor (Integrante 4).
//Funciones puras: no dependen de red, base de datos ni del reloj del sistema.

import { engineConfig } from "./config";

export interface LatLng {
  lat: number;
  lng: number;
}

const RADIO_TIERRA_M = 6_371_000;

const aRadianes = (grados: number) => (grados * Math.PI) / 180;

/** Distancia en línea recta entre dos puntos, en metros (haversine). */
export function distanceM(a: LatLng, b: LatLng): number {
  const dLat = aRadianes(b.lat - a.lat);
  const dLng = aRadianes(b.lng - a.lng);
  const lat1 = aRadianes(a.lat);
  const lat2 = aRadianes(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * RADIO_TIERRA_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Minutos de caminata estimados para una distancia (≈ 80 m/min). */
export function walkMinutes(distM: number): number {
  return distM / engineConfig.velocidadCaminataMPerMin;
}
