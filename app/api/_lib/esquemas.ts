/**
 * Esquemas zod compartidos por el CRUD de los paneles (admin y comercio).
 * Entradas en camelCase (contrato de la sección 7); cada route las convierte
 * a snake_case al escribir en Supabase.
 */
import { z } from "zod";

export const CATEGORIAS = ["historia", "gastronomia", "cultura", "paseo", "compras"] as const;

const fechaIso = z
  .string()
  .refine((v) => !Number.isNaN(Date.parse(v)), { message: "fecha inválida (usa ISO 8601)" });

const hora = z
  .string()
  .regex(/^\d{1,2}:\d{2}(:\d{2})?$/, { message: "hora inválida (HH:MM)" });

// ---------------------------------------------------------------------------
// Eventos
// ---------------------------------------------------------------------------
export const eventoSchema = z
  .object({
    title: z.string().trim().min(3).max(120).optional(),
    name: z.string().trim().min(3).max(120).optional(),
    description: z.string().trim().max(500).optional(),
    category: z.enum(CATEGORIAS),
    placeId: z.guid({ message: "placeId inválido" }),
    startsAt: fechaIso,
    endsAt: fechaIso.nullish(),
    source: z.string().trim().max(120).optional(),
    meta: z.record(z.string(), z.unknown()).optional(),
  })
  .refine((d) => d.title || d.name, { message: "Falta el título del evento" });

export const eventoParcialSchema = z.object({
  title: z.string().trim().min(3).max(120).optional(),
  name: z.string().trim().min(3).max(120).optional(),
  description: z.string().trim().max(500).optional(),
  category: z.enum(CATEGORIAS).optional(),
  placeId: z.guid().optional(),
  startsAt: fechaIso.optional(),
  endsAt: fechaIso.nullish(),
  source: z.string().trim().max(120).optional(),
  verified: z.boolean().optional(), // solo admin; el route lo descarta para comercio
  meta: z.record(z.string(), z.unknown()).optional(),
});

/** Fila snake_case lista para insertar/actualizar en `events`. */
export function eventoAFila(d: z.infer<typeof eventoParcialSchema>): Record<string, unknown> {
  const fila: Record<string, unknown> = {};
  const titulo = d.title ?? d.name;
  if (titulo !== undefined) fila.title = titulo;
  if (d.category !== undefined) fila.category = d.category;
  if (d.placeId !== undefined) fila.place_id = d.placeId;
  if (d.startsAt !== undefined) fila.starts_at = new Date(d.startsAt).toISOString();
  if (d.endsAt !== undefined) fila.ends_at = d.endsAt ? new Date(d.endsAt).toISOString() : null;
  if (d.source !== undefined) fila.source = d.source;
  if (d.verified !== undefined) fila.verified = d.verified;
  // La tabla events no tiene columna description: viaja dentro de meta.
  if (d.meta !== undefined || d.description !== undefined) {
    fila.meta = { ...(d.meta ?? {}), ...(d.description !== undefined ? { description: d.description } : {}) };
  }
  return fila;
}

// ---------------------------------------------------------------------------
// Lugares
// ---------------------------------------------------------------------------
export const lugarSchema = z.object({
  name: z.string().trim().min(3).max(120),
  category: z.enum(CATEGORIAS),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  description: z.string().trim().max(500).optional(),
  opensAt: hora.nullish(),
  closesAt: hora.nullish(),
  avgVisitMin: z.number().int().min(5).max(480).optional(),
  priceLevel: z.enum(["bajo", "medio", "alto"]).optional(),
  opportunity: z.number().min(0).max(1).optional(),
  verified: z.boolean().optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
});

export const lugarParcialSchema = lugarSchema.partial();

/** Fila snake_case lista para insertar/actualizar en `places`. */
export function lugarAFila(d: z.infer<typeof lugarParcialSchema>): Record<string, unknown> {
  const fila: Record<string, unknown> = {};
  if (d.name !== undefined) fila.name = d.name;
  if (d.category !== undefined) fila.category = d.category;
  if (d.lat !== undefined) fila.lat = d.lat;
  if (d.lng !== undefined) fila.lng = d.lng;
  if (d.description !== undefined) fila.description = d.description;
  if (d.opensAt !== undefined) fila.opens_at = d.opensAt || null;
  if (d.closesAt !== undefined) fila.closes_at = d.closesAt || null;
  if (d.avgVisitMin !== undefined) fila.avg_visit_min = d.avgVisitMin;
  if (d.priceLevel !== undefined) fila.price_level = d.priceLevel;
  if (d.opportunity !== undefined) fila.opportunity = d.opportunity;
  if (d.verified !== undefined) fila.verified = d.verified;
  if (d.meta !== undefined) fila.meta = d.meta;
  return fila;
}

// ---------------------------------------------------------------------------
// Misiones
// ---------------------------------------------------------------------------
export const misionSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().max(500).optional(),
  placeId: z.guid({ message: "placeId inválido" }),
  points: z.number().int().min(1).max(1000),
  nightBonus: z.boolean().optional(),
  active: z.boolean().optional(),
});

export const misionParcialSchema = misionSchema.partial();

/** Fila snake_case lista para insertar/actualizar en `missions`. */
export function misionAFila(d: z.infer<typeof misionParcialSchema>): Record<string, unknown> {
  const fila: Record<string, unknown> = {};
  if (d.title !== undefined) fila.title = d.title;
  if (d.description !== undefined) fila.description = d.description;
  if (d.placeId !== undefined) fila.place_id = d.placeId;
  if (d.points !== undefined) fila.points = d.points;
  if (d.nightBonus !== undefined) fila.night_bonus = d.nightBonus;
  if (d.active !== undefined) fila.active = d.active;
  return fila;
}

// ---------------------------------------------------------------------------
// Recompensas
// ---------------------------------------------------------------------------
export const recompensaSchema = z.object({
  title: z.string().trim().min(3).max(120),
  conditions: z.string().trim().max(500).optional(),
  costPoints: z.number().int().min(1).max(100000).optional(),
  pointsCost: z.number().int().min(1).max(100000).optional(),
  validUntil: fechaIso.nullish(),
  businessId: z.guid().optional(),
});

export const recompensaParcialSchema = recompensaSchema.partial();

/** Fila snake_case lista para insertar/actualizar en `rewards`. */
export function recompensaAFila(d: z.infer<typeof recompensaParcialSchema>): Record<string, unknown> {
  const fila: Record<string, unknown> = {};
  if (d.title !== undefined) fila.title = d.title;
  if (d.conditions !== undefined) fila.conditions = d.conditions;
  const costo = d.costPoints ?? d.pointsCost;
  if (costo !== undefined) fila.cost_points = costo;
  if (d.validUntil !== undefined) fila.valid_until = d.validUntil ? new Date(d.validUntil).toISOString() : null;
  if (d.businessId !== undefined) fila.business_id = d.businessId;
  return fila;
}

/** Respuesta 400 homogénea para un error de zod. */
export function errorDeValidacion(error: z.ZodError) {
  return { error: error.issues[0]?.message ?? "Datos inválidos" };
}
