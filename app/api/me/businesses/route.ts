/**
 * GET /api/me/businesses — negocios de la sesión actual, con su lugar.
 * comercio: los suyos. admin: todos (para los formularios de gestión).
 *
 * Response: Business[] (el campo name sale del lugar asociado).
 */
import { NextResponse, connection } from "next/server";
import { getAdminClient } from "@/lib/db/server";
import { requireProfile } from "@/lib/db/auth";
import { toBusiness } from "@/lib/db/mappers";

export async function GET() {
  await connection();
  try {
    const auth = await requireProfile(["comercio", "admin"]);
    if ("response" in auth) return auth.response;

    let query = getAdminClient().from("businesses").select("*, places(name)");
    if (auth.profile.role === "comercio") {
      query = query.eq("owner_id", auth.profile.id);
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const negocios = (data ?? [])
      .map((row) => toBusiness(row as Record<string, unknown>))
      .sort((a, b) => a.name.localeCompare(b.name, "es"));
    return NextResponse.json(negocios);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error inesperado al listar negocios";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
