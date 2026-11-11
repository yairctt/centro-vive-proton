import { es } from "@/lib/i18n/es";
import type { ValidateResponse } from "./types";

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
