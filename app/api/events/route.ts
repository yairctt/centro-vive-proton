import { NextRequest, NextResponse, connection } from "next/server";
import { getAdminClient } from "@/lib/db/server";
import { toEvent } from "@/lib/db/mappers";

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
  try {
    const { searchParams } = new URL(request.url);
    const when = searchParams.get("when") || "today";

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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const events = (data ?? []).map(toEvent).filter((event) => {
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error inesperado al consultar eventos";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
