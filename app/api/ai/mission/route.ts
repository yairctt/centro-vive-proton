// Endpoint de IA (Integrante 4).
// POST /api/ai/mission → { text, why }
//
// La IA redacta con la ficha del lugar y los intereses del visitante.
// Si Gemini falla o se pasa de tiempo, se devuelve el texto de respaldo.
// Nunca devuelve un error por culpa de la IA: la demo no puede romperse aquí.

import { z } from "zod";

import { fallbackMission } from "@/lib/ai/fallback";
import { generateMission } from "@/lib/ai/gemini";
import { buscarLugarDemo } from "@/lib/engine/datos-demo";
import type { Place } from "@/lib/types";

const bodySchema = z.object({
  /** Id del lugar (obligatorio). */
  placeId: z.string().min(1),
  /** Intereses del visitante. */
  interests: z.array(z.string().min(1)).optional().default([]),
  /** Ficha del lugar; opcional para no depender del backend en la demo. */
  place: z
    .object({
      id: z.string().min(1),
      name: z.string().min(1),
      category: z.string().default(""),
      lat: z.number().default(0),
      lng: z.number().default(0),
      description: z.string().default(""),
      hours: z.string().nullable().default(null),
      verified: z.boolean().default(false),
      meta: z.record(z.string(), z.unknown()).default({}),
    })
    .optional(),
});

export async function POST(request: Request) {
  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return Response.json({ error: "Se esperaba un cuerpo JSON." }, { status: 400 });
  }

  const parseo = bodySchema.safeParse(cuerpo);
  if (!parseo.success) {
    return Response.json(
      { error: "Datos inválidos: placeId es obligatorio e interests debe ser una lista." },
      { status: 400 },
    );
  }

  const { placeId, interests, place } = parseo.data;

  const lugar = place ?? (await buscarLugar(placeId, request.url));
  if (!lugar) {
    return Response.json({ error: "No se encontró el lugar indicado." }, { status: 404 });
  }

  try {
    const copy = await generateMission({ place: lugar, interests });
    return Response.json({ text: copy.text, why: copy.why, source: copy.source });
  } catch {
    // Salvaguarda extra: si algo revienta, la plantilla responde igual.
    const respaldo = fallbackMission(lugar, interests);
    return Response.json({ text: respaldo.text, why: respaldo.why, source: respaldo.source });
  }
}

/**
 * Busca la ficha del lugar:
 * 1. En GET /api/places, que es la fuente principal (base de datos del
 *    Integrante 3).
 * 2. Si no está (base sin configurar, caída o seed sin correr), en el catálogo
 *    de respaldo de `lib/engine/datos-demo.ts`.
 * Si tampoco está ahí, quien llama puede mandar la ficha en el cuerpo.
 */
async function buscarLugar(placeId: string, urlActual: string): Promise<Place | null> {
  try {
    const origen = new URL(urlActual).origin;
    const respuesta = await fetch(`${origen}/api/places`, { cache: "no-store" });
    if (respuesta.ok) {
      const lugares = (await respuesta.json()) as Place[];
      if (Array.isArray(lugares)) {
        const encontrado = lugares.find((l) => l.id === placeId);
        if (encontrado) return encontrado;
      }
    }
  } catch {
    // Sin backend disponible: se intenta el catálogo de respaldo.
  }

  return buscarLugarDemo(placeId) ?? null;
}
