/**
 * GET /api/qr-tokens
 * Devuelve los lugares con su token QR activo para imprimir en /comercio/qr.
 * El comercio solo recibe los QR de sus locales; el admin, los de todos.
 *
 * Response: QrTarjeta[]  →  { place: Place; token: string }[]
 * Un token por lugar (activo y no vencido).
 */
import { NextResponse, connection } from "next/server";
import { getAdminClient } from "@/lib/db/server";
import { requireProfile } from "@/lib/db/auth";
import { toPlace } from "@/lib/db/mappers";
import type { QrTarjeta } from "@/lib/qr/types";

export async function GET(): Promise<NextResponse> {
  // Siempre dinámico: nunca se prerenderiza en el build (cacheComponents).
  await connection();

  try {
    const auth = await requireProfile(["comercio", "admin"]);
    if ("response" in auth) return auth.response;

    const supabase = getAdminClient();
    let query = supabase
      .from("qr_tokens")
      .select("token, place_id, places(*)")
      .eq("active", true)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

    if (auth.profile.role === "comercio") {
      // Lugares de los negocios de este comercio
      const { data: negocios, error: negociosError } = await supabase
        .from("businesses")
        .select("place_id")
        .eq("owner_id", auth.profile.id);
      if (negociosError) {
        return NextResponse.json({ error: negociosError.message }, { status: 500 });
      }
      const lugares = (negocios ?? []).map((n) => n.place_id as string);
      if (lugares.length === 0) return NextResponse.json([]);
      query = query.in("place_id", lugares);
    }

    const { data, error } = await query;

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
