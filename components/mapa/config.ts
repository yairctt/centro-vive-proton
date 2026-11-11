import type { LatLng } from "./types";

/** Zócalo del Centro Histórico de Veracruz (centro inicial del mapa). */
export const CENTRO_VERACRUZ: LatLng = { lat: 19.1996, lng: -96.1384 };
export const ZOOM_INICIAL = 16;

export const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

export const COLORES = {
  lugar: "#0f766e",
  porConfirmar: "#78716c",
  evento: "#d97706",
  parada: "#e11d48",
  usuario: "#2563eb",
} as const;
