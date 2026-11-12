/**
 * GET /api/qr-tokens
 * Devuelve los lugares con su token QR activo para imprimir en /admin/qr.
 *
 * Response: QrTarjeta[]  →  { place: Place; token: string }[]
 * Un token por lugar (activo y no vencido).
 */
import { NextResponse, connection } from "next/server";
import { getAdminClient } from "@/lib/db/server";
import { toPlace } from "@/lib/db/mappers";
import type { QrTarjeta } from "@/lib/qr/types";

export async function GET(): Promise<NextResponse> {
  // Siempre dinámico: nunca se prerenderiza en el build (cacheComponents).
  await connection();

  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("qr_tokens")
      .select("token, place_id, places(*)")
      .eq("active", true)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Un solo token por lugar: el primero activo que aparezca.
    const porLugar = new Map<string, QrTarjeta>();
    for (const row of data ?? []) {
      const placeRow = (Array.isArray(row.places) ? row.places[0] : row.places) as
        | Record<string, unknown>
        | null;
      if (!placeRow || porLugar.has(row.place_id as string)) continue;
      porLugar.set(row.place_id as string, {
        place: toPlace(placeRow),
        token: String(row.token),
      });
    }

    const tarjetas = [...porLugar.values()].sort((a, b) =>
      a.place.name.localeCompare(b.place.name, "es"),
    );
    return NextResponse.json(tarjetas);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error inesperado al consultar los QR";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
