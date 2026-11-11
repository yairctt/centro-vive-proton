// Cliente de Gemini (Integrante 4).
// Solo se usa en el servidor. Nunca decide la ruta: redacta textos.

import { GoogleGenAI } from "@google/genai";

import { aiConfig } from "./config";
import { fallbackMission, type MissionCopy } from "./fallback";
import { flags } from "../flags";
import type { Place } from "../types";

/** Datos que se le dan al modelo. Nada más: no se inventa información. */
export interface MissionContext {
  place: Place;
  interests: string[];
  /** Motivo calculado por el motor, para que el texto sea consistente. */
  reason?: string;
}

/** Arma el contenido del prompt con los datos de la ficha. */
export function buildPrompt(ctx: MissionContext): string {
  const { place, interests, reason } = ctx;
  const meta = place.meta ?? {};

  const datos: Record<string, unknown> = {
    nombre: place.name,
    categoria: place.category,
    descripcion: place.description,
    horario: place.hours ?? "no informado",
    horarioVerificado: place.verified,
  };

  for (const clave of ["avgVisitMin", "priceLevel", "opportunity", "accessible", "bajoTecho"]) {
    if (meta[clave] !== undefined) datos[clave] = meta[clave];
  }

  return [
    "Datos de la ficha (única fuente de verdad):",
    JSON.stringify(datos, null, 2),
    `Intereses del visitante: ${interests.length > 0 ? interests.join(", ") : "no indicados"}`,
    reason ? `Motivo calculado por el motor: ${reason}` : "",
    "",
    'Responde solo con JSON: {"text": "...", "why": "..."}',
  ]
    .filter(Boolean)
    .join("\n");
}

/** Extrae el JSON del modelo aunque venga envuelto en texto o en ```json. */
export function parseModelJson(raw: string): { text: string; why: string } | null {
  const limpio = raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const inicio = limpio.indexOf("{");
  const fin = limpio.lastIndexOf("}");
  if (inicio === -1 || fin === -1 || fin <= inicio) return null;

  try {
    const parsed = JSON.parse(limpio.slice(inicio, fin + 1)) as Record<string, unknown>;
    const text = typeof parsed.text === "string" ? parsed.text.trim() : "";
    const why = typeof parsed.why === "string" ? parsed.why.trim() : "";
    if (!text) return null;
    return { text, why: why || "Está cerca de tu ruta y encaja con tus intereses." };
  } catch {
    return null;
  }
}

/**
 * Pide a Gemini el texto de la misión.
 * Devuelve siempre un resultado: si falla o se pasa de tiempo, la plantilla.
 */
export async function generateMission(ctx: MissionContext): Promise<MissionCopy> {
  const respaldo = fallbackMission(ctx.place, ctx.interests);
  const apiKey = process.env.GEMINI_API_KEY;
  // Interruptor de funciones: si la IA está apagada, siempre la plantilla.
  if (!flags.ia) return respaldo;
  if (!apiKey) return respaldo;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const respuesta = await withTimeout(
      ai.models.generateContent({
        model: aiConfig.modelo,
        contents: buildPrompt(ctx),
        config: {
          systemInstruction: aiConfig.instruccion,
          temperature: 0.4,
          responseMimeType: "application/json",
        },
      }),
      aiConfig.timeoutMs,
    );

    const raw = respuesta.text ?? "";
    const parsed = parseModelJson(raw);
    if (!parsed) return respaldo;

    return { text: parsed.text, why: parsed.why, source: "ia" };
  } catch {
    // Cualquier fallo (timeout, red, clave, JSON inválido) usa la plantilla.
    return respaldo;
  }
}

/** Promesa que se resuelve al agotarse el tiempo límite. */
function withTimeout<T>(promesa: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("La IA tardó demasiado; se usa el texto de respaldo.")),
      ms,
    );
    promesa.then(
      (valor) => {
        clearTimeout(timer);
        resolve(valor);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}
