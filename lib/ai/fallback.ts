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

/** Mismo contrato que Gemini, pero sin llamar a la red. */
export function fallbackMission(
  place: Pick<Place, "name" | "category" | "description" | "hours" | "verified">,
  interests: string[] = [],
): MissionCopy {
  const tema = categoriaLegible(place.category);
  const interes = interests.length > 0 ? ` Te interesan ${interests.join(", ")}.` : "";

  const horario = place.hours
    ? ` Horario según la ficha: ${place.hours}${place.verified ? "" : " (por confirmar)"}.`
    : "";

  const text =
    `Visita ${place.name} y completa la misión: recorre el lugar y registra tu visita ` +
    `escaneando el QR. Descubre ${tema} en el Centro Histórico.${horario}`;

  const why =
    `${place.name} encaja con ${tema} y su visita cabe en el tiempo que elegiste.` +
    `${interes}`;

  return { text, why, source: "respaldo" };
}
