import type {
  Budget,
  Business,
  Event,
  Mission,
  MissionStatus,
  Place,
  Profile,
  QrToken,
  Reward,
  Role,
  ValidationMethod,
  Visit,
} from "../types";

/**
 * Normaliza un string de hora a formato "HH:MM".
 * Ejemplo: "09:00:00" -> "09:00", "9:00" -> "09:00".
 */
export function formatTime(val: unknown): string | null {
  if (val === null || val === undefined) return null;
  const str = String(val).trim();
  if (!str) return null;
  const match = /^(\d{1,2}):(\d{2})/.exec(str);
  if (match) {
    return `${match[1].padStart(2, "0")}:${match[2]}`;
  }
  return str;
}

/**
 * Convierte un valor de fecha/timestamp a string ISO 8601 de forma segura.
 */
export function toIsoString(val: unknown): string {
  if (!val) return "";
  try {
    const d = new Date(val as string | number | Date);
    return isNaN(d.getTime()) ? String(val) : d.toISOString();
  } catch {
    return String(val);
  }
}

/**
 * Convierte un valor de fecha/timestamp a string ISO 8601 o null.
 */
export function toIsoStringOrNull(val: unknown): string | null {
  if (!val) return null;
  try {
    const d = new Date(val as string | number | Date);
    return isNaN(d.getTime()) ? String(val) : d.toISOString();
  } catch {
    return String(val);
  }
}

/**
 * Convierte una fila de la tabla `places` (snake_case) al tipo `Place` (camelCase).
 * Maneja columnas como opens_at, closes_at, avg_visit_min, price_level, opportunity
 * asegurando la conversión de tipos (numeric -> number, HH:MM:SS -> HH:MM).
 */
export function toPlace(row: Record<string, unknown>): Place {
  const rawMeta = (row.meta && typeof row.meta === "object" ? row.meta : {}) as Record<string, unknown>;
  const meta: Record<string, unknown> = { ...rawMeta };

  // Convertir llaves snake_case en meta si existen
  for (const [k, v] of Object.entries(meta)) {
    if (k.includes("_")) {
      const camel = k.replace(/_([a-z])/g, (_, l) => l.toUpperCase());
      meta[camel] = v;
    }
  }

  const rawOpensAt = row.opens_at ?? rawMeta.opens_at ?? rawMeta.opensAt;
  const rawClosesAt = row.closes_at ?? rawMeta.closes_at ?? rawMeta.closesAt;
  const rawAvgVisitMin = row.avg_visit_min ?? rawMeta.avg_visit_min ?? rawMeta.avgVisitMin;
  const rawPriceLevel = row.price_level ?? rawMeta.price_level ?? rawMeta.priceLevel;
  const rawOpportunity = row.opportunity ?? rawMeta.opportunity;

  const opensAt = formatTime(rawOpensAt);
  const closesAt = formatTime(rawClosesAt);
  const avgVisitMin = rawAvgVisitMin !== undefined && rawAvgVisitMin !== null ? Number(rawAvgVisitMin) : null;
  const priceLevel = rawPriceLevel ? (String(rawPriceLevel) as Budget) : null;
  const opportunity = rawOpportunity !== undefined && rawOpportunity !== null ? Number(rawOpportunity) : null;

  if (opensAt !== null) meta.opensAt = opensAt;
  if (closesAt !== null) meta.closesAt = closesAt;
  if (avgVisitMin !== null) meta.avgVisitMin = avgVisitMin;
  if (priceLevel !== null) meta.priceLevel = priceLevel;
  if (opportunity !== null) meta.opportunity = opportunity;

  // Limpiar llaves snake_case redundantes en meta
  delete meta.opens_at;
  delete meta.closes_at;
  delete meta.avg_visit_min;
  delete meta.price_level;

  return {
    id: String(row.id ?? ""),
    name: String(row.name ?? ""),
    category: String(row.category ?? ""),
    lat: Number(row.lat ?? row.latitude ?? 0),
    lng: Number(row.lng ?? row.longitude ?? 0),
    description: String(row.description ?? ""),
    hours: row.hours ? String(row.hours) : null,
    verified: Boolean(row.verified),
    meta,
    opensAt: opensAt ?? null,
    closesAt: closesAt ?? null,
    avgVisitMin: avgVisitMin ?? null,
    priceLevel: priceLevel ?? null,
    opportunity: opportunity ?? null,
  };
}

/**
 * Convierte una fila de la tabla `events` (snake_case) al tipo `Event` (camelCase).
 * Si la consulta incluye relación places(*), se mapea como `place`.
 */
export function toEvent(row: Record<string, unknown>): Event {
  const rawMeta = (row.meta && typeof row.meta === "object" ? row.meta : {}) as Record<string, unknown>;
  const meta: Record<string, unknown> = { ...rawMeta };

  for (const [k, v] of Object.entries(meta)) {
    if (k.includes("_")) {
      const camel = k.replace(/_([a-z])/g, (_, l) => l.toUpperCase());
      meta[camel] = v;
    }
  }

  // Soporta relación places(*) ya sea como objeto único o como arreglo de 1 elemento
  let place: Place | null = null;
  const rawPlace = row.places ?? row.place;
  if (rawPlace && typeof rawPlace === "object") {
    if (Array.isArray(rawPlace)) {
      place = rawPlace.length > 0 ? toPlace(rawPlace[0] as Record<string, unknown>) : null;
    } else {
      place = toPlace(rawPlace as Record<string, unknown>);
    }
  }

  const lat = Number(row.lat ?? row.latitude ?? (place ? place.lat : 0));
  const lng = Number(row.lng ?? row.longitude ?? (place ? place.lng : 0));

  return {
    id: String(row.id ?? ""),
    name: String(row.name ?? ""),
    description: String(row.description ?? ""),
    category: String(row.category ?? ""),
    startsAt: toIsoString(row.starts_at ?? row.startsAt),
    endsAt: toIsoStringOrNull(row.ends_at ?? row.endsAt),
    placeId: row.place_id ? String(row.place_id) : (row.placeId ? String(row.placeId) : null),
    lat,
    lng,
    source: String(row.source ?? ""),
    verified: Boolean(row.verified),
    meta,
    ...(place !== null ? { place } : {}),
  };
}

/**
 * Convierte una fila de la tabla `missions` (snake_case) al tipo `Mission` (camelCase).
 */
export function toMission(row: Record<string, unknown>): Mission {
  return {
    id: String(row.id ?? ""),
    placeId: String(row.place_id ?? row.placeId ?? ""),
    businessId: row.business_id ? String(row.business_id) : (row.businessId ? String(row.businessId) : null),
    title: String(row.title ?? ""),
    rules: String(row.rules ?? ""),
    points: Number(row.points ?? 0),
    validFrom: toIsoString(row.valid_from ?? row.validFrom),
    validUntil: toIsoStringOrNull(row.valid_until ?? row.validUntil),
    status: (row.status as MissionStatus) ?? "activa",
  };
}

/**
 * Convierte una fila de la tabla `businesses` (snake_case) al tipo `Business` (camelCase).
 */
export function toBusiness(row: Record<string, unknown>): Business {
  const rawMeta = (row.meta && typeof row.meta === "object" ? row.meta : {}) as Record<string, unknown>;
  const meta: Record<string, unknown> = { ...rawMeta };

  for (const [k, v] of Object.entries(meta)) {
    if (k.includes("_")) {
      const camel = k.replace(/_([a-z])/g, (_, l) => l.toUpperCase());
      meta[camel] = v;
    }
  }

  return {
    id: String(row.id ?? ""),
    placeId: String(row.place_id ?? row.placeId ?? ""),
    ownerId: row.owner_id ? String(row.owner_id) : (row.ownerId ? String(row.ownerId) : null),
    name: String(row.name ?? ""),
    contact: row.contact ? String(row.contact) : null,
    active: Boolean(row.active ?? true),
    verified: Boolean(row.verified),
    meta,
  };
}

/**
 * Convierte una fila de la tabla `rewards` (snake_case) al tipo `Reward` (camelCase).
 */
export function toReward(row: Record<string, unknown>): Reward {
  return {
    id: String(row.id ?? ""),
    businessId: String(row.business_id ?? row.businessId ?? ""),
    title: String(row.title ?? ""),
    conditions: String(row.conditions ?? ""),
    pointsCost: Number(row.points_cost ?? row.pointsCost ?? 0),
    validUntil: toIsoStringOrNull(row.valid_until ?? row.validUntil),
    redemptions: Number(row.redemptions ?? 0),
  };
}

/**
 * Convierte una fila de la tabla `profiles` (snake_case) al tipo `Profile` (camelCase).
 */
export function toProfile(row: Record<string, unknown>): Profile {
  return {
    id: String(row.id ?? ""),
    alias: String(row.alias ?? ""),
    role: (row.role as Role) ?? "visitante",
    points: Number(row.points ?? 0),
    createdAt: toIsoString(row.created_at ?? row.createdAt) || new Date().toISOString(),
  };
}

/**
 * Convierte una fila de la tabla `qr_tokens` (snake_case) al tipo `QrToken` (camelCase).
 */
export function toQrToken(row: Record<string, unknown>): QrToken {
  return {
    id: String(row.id ?? ""),
    token: String(row.token ?? ""),
    placeId: String(row.place_id ?? row.placeId ?? ""),
    missionId: row.mission_id ? String(row.mission_id) : (row.missionId ? String(row.missionId) : null),
    expiresAt: toIsoStringOrNull(row.expires_at ?? row.expiresAt),
    used: Boolean(row.used),
  };
}

/**
 * Convierte una fila de la tabla `visits` (snake_case) al tipo `Visit` (camelCase).
 */
export function toVisit(row: Record<string, unknown>): Visit {
  return {
    id: String(row.id ?? ""),
    profileId: String(row.profile_id ?? row.profileId ?? ""),
    placeId: String(row.place_id ?? row.placeId ?? ""),
    missionId: row.mission_id ? String(row.mission_id) : (row.missionId ? String(row.missionId) : null),
    createdAt: toIsoString(row.created_at ?? row.createdAt) || new Date().toISOString(),
    method: (row.method as ValidationMethod) ?? "qr",
    pointsAwarded: Number(row.points_awarded ?? row.pointsAwarded ?? 0),
  };
}
