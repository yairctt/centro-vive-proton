// Plantillas de respaldo (Integrante 4).
// Si Gemini no responde a tiempo o falla, estas plantillas generan el mismo
// contrato: { text, why }. Nunca deben mencionar datos que no estén en la ficha.

import type { Place } from "../types";

export interface MissionCopy {
  /** Texto de la misión para el visitante. */
  text: string;
  /** Por qué se recomienda este lugar. */
  why: string;
  /** "ia" si lo redactó Gemini, "respaldo" si viene de la plantilla. */
  source: "ia" | "respaldo";
}

/** Ficha mínima que necesita la plantilla. */
export type LugarParaTexto = Pick<
  Place,
  "name" | "category" | "description" | "hours" | "verified"
> & { meta?: Record<string, unknown> };

const ETIQUETA_CATEGORIA: Record<string, string> = {
  historia: "la historia del centro",
  gastronomia: "la gastronomía",
  cultura: "la cultura",
  paseo: "el paseo",
  compras: "las compras",
};

function categoriaLegible(categoria: string): string {
  const clave = categoria.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return ETIQUETA_CATEGORIA[clave] ?? "el entorno del centro";
}

/**
 * El horario solo se menciona con seguridad si el lugar lo declara verificado.
 * Si no, se marca «por confirmar»: es preferible a decir algo que puede ser falso.
 */
function fraseHorario(lugar: LugarParaTexto): string {
  if (!lugar.hours) return "";

  const meta = lugar.meta ?? {};
  const horarioVerificado = lugar.verified && meta.horarioVerificado !== false;

  if (!horarioVerificado) {
    return ` Horario según la ficha: ${lugar.hours} (por confirmar).`;
  }
  return ` Horario según la ficha: ${lugar.hours}.`;
}

/** Mismo contrato que Gemini, pero sin llamar a la red. */
export function fallbackMission(
  lugar: LugarParaTexto,
  interests: string[] = [],
): MissionCopy {
  const tema = categoriaLegible(lugar.category);
  const interes = interests.length > 0 ? ` Te interesan ${interests.join(", ")}.` : "";

  const text =
    `Visita ${lugar.name} y completa la misión: recorre el lugar y registra tu visita ` +
    `escaneando el QR. Descubre ${tema} en el Centro Histórico.` +
    fraseHorario(lugar);

  const why =
    `${lugar.name} encaja con ${tema} y su visita cabe en el tiempo que elegiste.` +
    interes;

  return { text, why, source: "respaldo" };
}
