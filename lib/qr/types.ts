import type { Place } from "@/lib/types";

// Respuesta de POST /api/visits/validate (CONTEXTO.md, secciones 5 y 7).
// El tipo vive en lib/types.ts (Integrante 3); aquí solo se reexporta.
export type { ValidateResponse } from "@/lib/types";

/**
 * Elemento de GET /api/qr-tokens (endpoint pendiente de I3, solo rol admin):
 * un lugar con el token activo de su QR.
 */
export interface QrTarjeta {
  place: Place;
  token: string;
}
