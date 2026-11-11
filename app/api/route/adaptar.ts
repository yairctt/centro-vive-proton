// Adaptador de filas de Supabase para el motor (Integrante 4).
//
// `lib/db/mappers.ts` es del Integrante 3 y su contrato es el canónico.
// Este archivo no lo modifica: solo completa los huecos que hay entre sus
// mappers y las columnas que usa realmente el seed de la demo.
//
// El seed (`supabase/seed.sql`) y el mapper no coinciden al 100 %:
//   - `events` usa la columna `title`; el mapper lee `name`.
//   - `missions` usa `description` y `active`; el mapper lee `rules` y `status`.
// Con estos ajustes el motor funciona con cualquiera de las dos formas.

import { toEvent, toMission } from "@/lib/db/mappers";
import type { Event, Mission, MissionStatus } from "@/lib/types";

/** Normaliza una fila de `events` al tipo `Event`. */
export function adaptarEvento(row: Record<string, unknown>): Event {
  const evento = toEvent(row);

  // El seed guarda el título en `title`; el mapper busca `name`.
  if (!evento.name) {
    evento.name = String(row.name ?? row.title ?? "");
  }
  if (!evento.description) {
    evento.description = String(row.description ?? "");
  }

  return evento;
}

/** Normaliza una fila de `missions` al tipo `Mission`. */
export function adaptarMision(row: Record<string, unknown>): Mission {
  const mision = toMission(row);

  // El seed guarda las reglas en `description`.
  if (!mision.rules) {
    mision.rules = String(row.rules ?? row.description ?? "");
  }

  // El seed usa `active` (booleano); el mapper lee `status` (texto).
  const statusCrudo = row.status;
  const activoCrudo = row.active;
  let status: MissionStatus = mision.status;
  if (typeof statusCrudo === "string") {
    status = statusCrudo as MissionStatus;
  } else if (typeof activoCrudo === "boolean") {
    status = activoCrudo ? "activa" : "pausada";
  }

  return { ...mision, status };
}
