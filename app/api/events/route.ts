import { NextRequest, NextResponse, connection } from "next/server";
import { z } from "zod";
import { getAdminClient } from "@/lib/db/server";
import { requireProfile } from "@/lib/db/auth";
import { toEvent } from "@/lib/db/mappers";
import { eventosDemo } from "@/lib/engine/datos-eventos";
import { lugaresDelComercio } from "@/app/api/_lib/comercio";
import { eventoSchema, eventoAFila, errorDeValidacion } from "@/app/api/_lib/esquemas";
import type { Event } from "@/lib/types";

function getMexicoCityDateRange() {
  const now = new Date();

  // Fecha YYYY-MM-DD en la zona horaria America/Mexico_City
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const dateStr = formatter.format(now);

  // Obtener el offset horario actual (ej. GMT-06:00)
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Mexico_City",
    timeZoneName: "longOffset",
  }).formatToParts(now);
  const tzPart = parts.find((p) => p.type === "timeZoneName")?.value || "GMT-06:00";
  const offsetMatch = /GMT([+-]\d{2}):(\d{2})/.exec(tzPart);
  const offset = offsetMatch ? `${offsetMatch[1]}:${offsetMatch[2]}` : "-06:00";

  const startOfDay = new Date(`${dateStr}T00:00:00.000${offset}`);
  const endOfDay = new Date(`${dateStr}T23:59:59.999${offset}`);

  return { now, startOfDay, endOfDay };
}

export async function GET(request: NextRequest) {
  await connection();
  const { searchParams } = new URL(request.url);
  const when = searchParams.get("when") || "today";

  try {
    const { now, startOfDay, endOfDay } = getMexicoCityDateRange();
    const in3Hours = new Date(now.getTime() + 3 * 60 * 60 * 1000);

    const supabase = getAdminClient();
    let query = supabase
      .from("events")
      .select("*, places(*)")
      .order("starts_at", { ascending: true });

    if (when === "today") {
      query = query
        .gte("starts_at", startOfDay.toISOString())
        .lte("starts_at", endOfDay.toISOString());
    } else if (when === "now") {
      query = query.lte("starts_at", in3Hours.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      // Si la base no responde (red caída, proyecto mal configurado) se cae a
      // los eventos de respaldo: la agenda nunca debe quedarse en blanco.
      console.error("GET /api/events:", error.message);
      return NextResponse.json(eventosRespaldo(when));
    }

    const events = (data ?? []).map(toEvent).filter((event) => {
      // "all": agenda completa, para las pantallas de gestión de los paneles.
      if (when === "all") return true;

      const startMs = new Date(event.startsAt).getTime();
      if (isNaN(startMs)) return false;

      if (when === "now") {
        const nowMs = now.getTime();
        const in3hMs = in3Hours.getTime();
        const endMs = event.endsAt ? new Date(event.endsAt).getTime() : null;

        // Empieza en las próximas 3 horas
        if (startMs >= nowMs && startMs <= in3hMs) {
          return true;
        }

        // Está en curso: ya empezó y aún no termina (o empezó recientemente)
        if (startMs <= nowMs) {
          if (endMs !== null && !isNaN(endMs)) {
            return endMs >= nowMs;
          }
          // Si no tiene hora de finalización definida, considerarlo en curso si comenzó en las últimas 3 horas
          return nowMs - startMs <= 3 * 60 * 60 * 1000;
        }

        return false;
      }

      // when === "today" (o por defecto)
      return startMs >= startOfDay.getTime() && startMs <= endOfDay.getTime();
    });

    return NextResponse.json(events);
  } catch {
    // Modo demo: sin base configurada se responde con los eventos de respaldo,
    // respetando el mismo filtro por fecha que el de la base.
    return NextResponse.json(eventosRespaldo(when));
  }
}

/**
 * POST /api/events — publica un evento en la agenda (contrato sección 7).
 * comercio: solo en los lugares de sus negocios. admin: en cualquier lugar.
 * Siempre entra con verified=false («por confirmar»); un admin lo verifica después.
 */
export async function POST(request: NextRequest) {
  await connection();
  try {
    const auth = await requireProfile(["comercio", "admin"]);
    if ("response" in auth) return auth.response;

    const cuerpo = await request.json().catch(() => null);
    const parsed = eventoSchema.safeParse(cuerpo);
    if (!parsed.success) {
      return NextResponse.json(errorDeValidacion(parsed.error), { status: 400 });
    }

    if (auth.profile.role === "comercio") {
      const misLugares = await lugaresDelComercio(auth.profile.id);
      if (!misLugares.includes(parsed.data.placeId)) {
        return NextResponse.json(
          { error: "Solo puedes publicar eventos en los lugares de tu comercio" },
          { status: 403 },
        );
      }
    }

    const fila = {
      ...eventoAFila(parsed.data),
      source: parsed.data.source || auth.profile.alias || auth.profile.role,
      verified: false,
    };

    const { data, error } = await getAdminClient()
      .from("events")
      .insert(fila)
      .select("*, places(*)")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(toEvent(data as Record<string, unknown>), { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error inesperado al crear el evento";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Eventos de respaldo filtrados igual que los de la base. */
function eventosRespaldo(when: string): Event[] {
  const { now, startOfDay, endOfDay } = getMexicoCityDateRange();
  const in3Hours = new Date(now.getTime() + 3 * 60 * 60 * 1000);

  return eventosDemo(now).filter((event) => {
    if (when === "all") return true;

    const startMs = new Date(event.startsAt).getTime();
    if (isNaN(startMs)) return false;

    if (when === "now") {
      const nowMs = now.getTime();
      const in3hMs = in3Hours.getTime();
      const endMs = event.endsAt ? new Date(event.endsAt).getTime() : null;

      if (startMs >= nowMs && startMs <= in3hMs) return true;
      if (startMs <= nowMs) {
        if (endMs !== null && !isNaN(endMs)) return endMs >= nowMs;
        return nowMs - startMs <= 3 * 60 * 60 * 1000;
      }
      return false;
    }

    return startMs >= startOfDay.getTime() && startMs <= endOfDay.getTime();
  });
}
