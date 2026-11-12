// Plantillas de respaldo (Integrante 4).
// Si Gemini no responde a tiempo o falla, estas plantillas generan el mismo
// contrato: { text, why }. Nunca deben mencionar datos que no estén en la ficha.

import type { Place } from "../types";
import { normalizaIdioma, type IdiomaIA } from "./config";

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

/** Equivalente en inglés de las categorías. */
const ETIQUETA_CATEGORIA_EN: Record<string, string> = {
  historia: "the city's history",
  gastronomia: "local food",
  cultura: "the city's culture",
  paseo: "a stroll",
  compras: "local crafts",
};

function categoriaLegible(categoria: string, idioma: IdiomaIA): string {
  const clave = categoria.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const tabla = idioma === "en" ? ETIQUETA_CATEGORIA_EN : ETIQUETA_CATEGORIA;
  return tabla[clave] ?? (idioma === "en" ? "the historic center" : "el entorno del centro");
}

/**
 * El horario solo se menciona con seguridad si el lugar lo declara verificado.
 * Si no, se marca «por confirmar»: es preferible a decir algo que puede ser falso.
 */
function fraseHorario(lugar: LugarParaTexto, idioma: IdiomaIA): string {
  if (!lugar.hours) return "";

  const meta = lugar.meta ?? {};
  const horarioVerificado = lugar.verified && meta.horarioVerificado !== false;

  // El texto del horario puede venir en español; se conserva tal cual.
  const horario = lugar.hours.trim().replace(/\.\s*$/, "");

  if (!horarioVerificado) {
    return idioma === "en"
      ? ` Opening hours: ${horario} (to be confirmed).`
      : ` Horario según la ficha: ${horario} (por confirmar).`;
  }
  return idioma === "en"
    ? ` Opening hours: ${horario}.`
    : ` Horario según la ficha: ${horario}.`;
}

/** Mismo contrato que Gemini, pero sin llamar a la red. */
export function fallbackMission(
  lugar: LugarParaTexto,
  interests: string[] = [],
  idioma?: string,
): MissionCopy {
  const idiomaElegido = normalizaIdioma(idioma);
  const tema = categoriaLegible(lugar.category, idiomaElegido);
  const interes =
    interests.length > 0
      ? idiomaElegido === "en"
        ? ` You are interested in ${interests.join(", ")}.`
        : ` Te interesan ${interests.join(", ")}.`
      : "";

  const text =
    idiomaElegido === "en"
      ? `Visit ${lugar.name} and complete the mission: explore the place and check in by scanning the QR code. ` +
        `Discover ${tema} in the historic center of Veracruz.` +
        fraseHorario(lugar, idiomaElegido)
      : `Visita ${lugar.name} y completa la misión: recorre el lugar y registra tu visita escaneando el QR. ` +
        `Descubre ${tema} en el Centro Histórico.` +
        fraseHorario(lugar, idiomaElegido);

  const why =
    idiomaElegido === "en"
      ? `${lugar.name} fits ${tema} and the visit fits the time you have.${interes}`
      : `${lugar.name} encaja con ${tema} y su visita cabe en el tiempo que elegiste.${interes}`;

  return { text, why, source: "respaldo" };
}
