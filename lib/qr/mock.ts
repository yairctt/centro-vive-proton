import { es } from "@/lib/i18n/es";
import { mockPlaces } from "@/lib/mock";
import type { QrTarjeta, ValidateResponse } from "./types";

/**
 * Respuesta de ejemplo para cuando POST /api/visits/validate aún no existe o falla.
 * Solo para la demo: los puntos reales SIEMPRE los calcula el servidor.
 */
export function mockValidate(): ValidateResponse {
  return {
    ok: true,
    pointsAdded: 50,
    totalPoints: 150,
    missionCompleted: true,
    message: es.qr.mockMensaje,
  };
}

/**
 * Tarjetas de ejemplo para cuando GET /api/qr-tokens aún no existe o falla.
 * Los tokens empiezan con «demo-» a propósito: NO son válidos en producción
 * y las tarjetas se imprimen con la marca «DEMO».
 */
export function mockQrTarjetas(): QrTarjeta[] {
  return mockPlaces.map((place) => ({ place, token: `demo-${place.id}-0000` }));
}
