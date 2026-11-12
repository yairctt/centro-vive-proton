// Endpoint de ruta (Integrante 4, en lugar del Integrante 3 por acuerdo).
//
// POST /api/route → RouteResponse
//
// Recibe { minutes, interests[], budget, lat?, lng? } y devuelve las paradas
// ordenadas con su motivo. La ruta la decide el motor (lib/engine), no la IA:
// aquí solo se leen los datos, se validan y se le entrega al motor.
//
// Fuente de datos: la base de datos (seed del Integrante 3) es la principal.
// El catálogo de `lib/engine/datos-demo.ts` es solo el respaldo para cuando la
// base no está configurada o está vacía, y para que la demo nunca se quede
// en blanco. La respuesta indica en `origen` de dónde salieron los datos.
//
// Nota de propiedad: la carpeta `app/api/**` es del Integrante 3. Este archivo
// lo crea el Integrante 4 (que es dueño del motor) por acuerdo del equipo,
// con el fin de no bloquear el CP2. Cuando el Integrante 3 pueda tomarlo, este
// endpoint debe pasar a su rama sin cambiar el contrato.

import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminClient } from "@/lib/db/server";
import { toPlace } from "@/lib/db/mappers";
import { buildRoute } from "@/lib/engine";
import { CATALOGO_DEMO } from "@/lib/engine/datos-demo";
import { eventosDemo } from "@/lib/engine/datos-eventos";
import type { Event, Mission, Place } from "@/lib/types";
import { adaptarEvento, adaptarMision } from "./adaptar";

const cuerpoSchema = z.object({
  /** Minutos disponibles para el recorrido. */
  minutes: z.number().int().min(15).max(480),
  /** Categorías que le interesan al visitante. */
  interests: z.array(z.string().min(1)).min(1),
  /** Presupuesto: "bajo" | "medio" | "alto". */
  budget: z.enum(["bajo", "medio", "alto"]),
  /** Latitud opcional (si el visitante autoriza ubicación). */
  lat: z.number().min(-90).max(90).optional(),
  /** Longitud opcional. */
  lng: z.number().min(-180).max(180).optional(),
});

export async function POST(request: Request) {
  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ error: "Se esperaba un cuerpo JSON." }, { status: 400 });
  }

  const parseo = cuerpoSchema.safeParse(cuerpo);
  if (!parseo.success) {
    return NextResponse.json(
      { error: "Datos inválidos: revisa minutes, interests y budget." },
      { status: 400 },
    );
  }

  const { minutes, interests, budget, lat, lng } = parseo.data;
  const now = new Date();
  const finVentana = new Date(now.getTime() + minutes * 60_000).toISOString();

  let places: Place[] = [];
  let events: Event[] = [];
  let missions: Mission[] = [];
  let origen: "base" | "respaldo" = "base";

  try {
    const supabase = getAdminClient();

    const [lugares, agenda] = await Promise.all([
      supabase.from("places").select("*"),
      supabase
        .from("events")
        .select("*, places(*)")
        .gte("starts_at", now.toISOString())
        .lte("starts_at", finVentana),
    ]);

    if (lugares.error) throw lugares.error;
    if (agenda.error) throw agenda.error;

    places = (lugares.data ?? []).map(toPlace);
    events = (agenda.data ?? []).map(adaptarEvento);

    // Las misiones son un extra: si la tabla no responde, la ruta se arma igual.
    try {
      const listaMisiones = await supabase.from("missions").select("*");
      if (!listaMisiones.error) {
        missions = (listaMisiones.data ?? [])
          .map(adaptarMision)
          .filter((mision) => mision.status === "activa");
      }
    } catch {
      missions = [];
    }
  } catch {
    // Sin base de datos configurada (o caída de Supabase) la demo usa el
    // catálogo de respaldo, para que la ruta nunca se quede en blanco.
    places = CATALOGO_DEMO;
    events = eventosDemo(now);
    missions = [];
    origen = "respaldo";
  }

  // La base es la fuente principal: si responde pero no tiene lugares (por
  // ejemplo, el seed todavía no se ha corrido), se usa el catálogo de respaldo.
  if (places.length === 0 && origen === "base") {
    places = CATALOGO_DEMO;
    events = eventosDemo(now);
    missions = [];
    origen = "respaldo";
  }

  const { stops } = buildRoute(
    places,
    { minutes, interests, budget, lat, lng },
    { now, events, missions },
  );

  return NextResponse.json({ stops, origen });
}
