// Tipos compartidos de Pulso Jarocho.
// Dueño: Integrante 3 (feat/backend). Los demás solo los consumen.
// Fechas en ISO 8601 (string). Coordenadas como lat/lng numéricos.

export type Role = "visitante" | "comercio" | "admin";
export type Budget = "bajo" | "medio" | "alto";

export interface Profile {
  id: string;
  alias: string;
  role: Role;
  points: number;
  createdAt: string;
}

export interface Place {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  description: string;
  /** Horario legible, p. ej. "Lun–Dom 9:00–21:00". */
  hours: string | null;
  verified: boolean;
  meta: Record<string, unknown>;
  opensAt?: string | null;
  closesAt?: string | null;
  avgVisitMin?: number | null;
  priceLevel?: Budget | string | null;
  opportunity?: number | null;
}

export interface Business {
  id: string;
  placeId: string;
  ownerId?: string | null;
  name?: string;
  contact?: string | null;
  /** Estado de participación en el programa. */
  active: boolean;
  verified?: boolean;
  meta: Record<string, unknown>;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  category: string;
  startsAt: string;
  endsAt: string | null;
  placeId: string | null;
  lat: number;
  lng: number;
  /** Fuente de la información (URL, institución, comercio…). */
  source: string;
  verified: boolean;
  meta: Record<string, unknown>;
  /** Lugar asociado al evento (opcional, incluido en respuestas con relación places(*)). */
  place?: Place | null;
}

export type MissionStatus = "activa" | "pausada" | "vencida";

export interface Mission {
  id: string;
  placeId: string;
  businessId: string | null;
  title: string;
  rules: string;
  points: number;
  validFrom: string;
  validUntil: string | null;
  status: MissionStatus;
}

export interface QrToken {
  id: string;
  token: string;
  placeId: string;
  missionId: string | null;
  expiresAt: string | null;
  used: boolean;
}

export type ValidationMethod = "qr" | "manual";

export interface Visit {
  id: string;
  profileId: string;
  placeId: string;
  missionId: string | null;
  createdAt: string;
  method: ValidationMethod;
  pointsAwarded: number;
}

export interface Reward {
  id: string;
  businessId: string;
  title: string;
  conditions: string;
  pointsCost?: number;
  costPoints?: number;
  validUntil?: string | null;
  redemptions?: number;
}

// --- Contratos de API (docs/propuesta.md, sección 11.3) ---

export interface RouteRequest {
  minutes: number;
  interests: string[];
  budget: Budget;
  lat?: number;
  lng?: number;
}

export interface RouteStop {
  place: Place;
  order: number;
  distanceM: number;
  etaMin: number;
  reason: string;
  missionId?: string;
}

export interface RouteResponse {
  stops: RouteStop[];
}

export interface Stats {
  missionsAccepted: number;
  missionsCompleted: number;
  scansByPlace: { placeId: string; placeName: string; scans: number }[];
  redemptions: number;
  /** Actividad por hora del día (0–23). */
  activityByHour: { hour: number; count: number }[];
}
