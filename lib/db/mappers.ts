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
  const avgVisitMin = rawAvgVisitMin !== undefined && rawAvgVisitMin !== null ? Number(rawAvgVisitMin) : 30;
  const priceLevel = (rawPriceLevel ? String(rawPriceLevel) : "bajo") as Budget;
  const opportunity = rawOpportunity !== undefined && rawOpportunity !== null ? Number(rawOpportunity) : 0.5;

  if (opensAt) meta.opensAt = opensAt;
  if (closesAt) meta.closesAt = closesAt;
  meta.avgVisitMin = avgVisitMin;
  meta.priceLevel = priceLevel;
  meta.opportunity = opportunity;

  delete meta.opens_at;
  delete meta.closes_at;
  delete meta.avg_visit_min;
  delete meta.price_level;

  return {
    id: String(row.id ?? ""),
    name: String(row.name ?? ""),
    category: String(row.category ?? "historia"),
    lat: Number(row.lat ?? row.latitude ?? 0),
    lng: Number(row.lng ?? row.longitude ?? 0),
    description: String(row.description ?? ""),
    hours: row.hours ? String(row.hours) : null,
    verified: Boolean(row.verified),
    meta,
    opensAt: opensAt ?? null,
    closesAt: closesAt ?? null,
    avgVisitMin,
    priceLevel,
    opportunity,
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

  let place: Place | null = null;
  const rawPlace = row.places ?? row.place;
  if (rawPlace && typeof rawPlace === "object") {
    if (Array.isArray(rawPlace)) {
      place = rawPlace.length > 0 ? toPlace(rawPlace[0] as Record<string, unknown>) : null;
    } else {
      place = toPlace(rawPlace as Record<string, unknown>);
    }
  }

  const name = String(row.name ?? row.title ?? "");
  const lat = Number(row.lat ?? row.latitude ?? (place ? place.lat : 0));
  const lng = Number(row.lng ?? row.longitude ?? (place ? place.lng : 0));
  const endsAt = toIsoStringOrNull(row.ends_at ?? row.endsAt);

  return {
    id: String(row.id ?? ""),
    title: name,
    name,
    description: String(row.description ?? row.details ?? ""),
    category: String(row.category ?? "cultura"),
    startsAt: toIsoString(row.starts_at ?? row.startsAt),
    endsAt: endsAt ?? null,
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
  const title = String(row.title ?? "");
  const rules = String(row.rules ?? row.description ?? "");
  const validUntil = toIsoStringOrNull(row.valid_until ?? row.validUntil);
  const validFrom = toIsoString(row.valid_from ?? row.validFrom) || new Date().toISOString();

  return {
    id: String(row.id ?? ""),
    placeId: String(row.place_id ?? row.placeId ?? ""),
    businessId: row.business_id ? String(row.business_id) : (row.businessId ? String(row.businessId) : null),
    title,
    description: rules,
    rules,
    points: Number(row.points ?? 0),
    nightBonus: Boolean(row.night_bonus ?? row.nightBonus ?? false),
    active: Boolean(row.active ?? true),
    status: (row.status as MissionStatus) ?? "activa",
    validFrom,
    validUntil,
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

  const rawName = row.name ?? (row.place as Record<string, unknown>)?.name ?? (row.places as Record<string, unknown>)?.name;
  const ownerId = row.owner_id ? String(row.owner_id) : (row.ownerId ? String(row.ownerId) : null);
  const contact = row.contact ? String(row.contact) : null;

  return {
    id: String(row.id ?? ""),
    placeId: String(row.place_id ?? row.placeId ?? ""),
    ownerId,
    name: String(rawName ?? ""),
    contact,
    active: Boolean(row.active ?? true),
    verified: Boolean(row.verified ?? true),
    meta,
  };
}

/**
 * Convierte una fila de la tabla `rewards` (snake_case) al tipo `Reward` (camelCase).
 */
export function toReward(row: Record<string, unknown>): Reward {
  const cost = Number(row.cost_points ?? row.points_cost ?? row.costPoints ?? row.pointsCost ?? 0);
  const validUntil = toIsoStringOrNull(row.valid_until ?? row.validUntil);
  const redemptions = Number(row.redemptions ?? 0);

  return {
    id: String(row.id ?? ""),
    businessId: String(row.business_id ?? row.businessId ?? ""),
    title: String(row.title ?? ""),
    conditions: String(row.conditions ?? ""),
    pointsCost: cost,
    costPoints: cost,
    validUntil,
    redemptions,
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
  const used = Boolean(row.used);
  const active = Boolean(row.active ?? !used);
  return {
    id: String(row.id ?? ""),
    token: String(row.token ?? ""),
    placeId: String(row.place_id ?? row.placeId ?? ""),
    missionId: row.mission_id ? String(row.mission_id) : (row.missionId ? String(row.missionId) : null),
    expiresAt: toIsoStringOrNull(row.expires_at ?? row.expiresAt),
    used,
    active,
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
