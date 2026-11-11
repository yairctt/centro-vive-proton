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
