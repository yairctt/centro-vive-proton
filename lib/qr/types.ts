import type { Place } from "@/lib/types";

// Respuesta de POST /api/visits/validate (CONTEXTO.md, secciones 5 y 7).
// TODO(I3): este tipo aún no está en lib/types.ts. Cuando se agregue allí,
// reemplazar esta definición por: export type { ValidateResponse } from "@/lib/types";
export interface ValidateResponse {
  ok: boolean;
  pointsAdded: number;
  totalPoints: number;
  missionCompleted: boolean;
  message: string;
}

/**
 * Elemento de GET /api/qr-tokens (endpoint pendiente de I3, solo rol admin):
 * un lugar con el token activo de su QR.
 */
export interface QrTarjeta {
  place: Place;
  token: string;
}
