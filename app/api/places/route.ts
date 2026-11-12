import { NextRequest, NextResponse, connection } from "next/server";
import { getAdminClient } from "@/lib/db/server";
import { requireProfile } from "@/lib/db/auth";
import { toPlace } from "@/lib/db/mappers";
import { lugarSchema, lugarAFila, errorDeValidacion } from "@/app/api/_lib/esquemas";
import { CATALOGO_DEMO } from "@/lib/engine/datos-demo";

export async function GET() {
  await connection();
  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("places")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      // Si la base no responde (red caída, proyecto mal configurado) se cae al
      // catálogo de respaldo: la demo nunca debe quedarse en blanco.
      console.error("GET /api/places:", error.message);
      return NextResponse.json(CATALOGO_DEMO);
    }

    const places = (data ?? []).map(toPlace);

    // Modo demo: sin base configurada o sin lugares cargados, se responde con
    // el catálogo de respaldo para que las pantallas nunca se queden en blanco.
    // El contrato no cambia: sigue siendo un arreglo de Place.
    if (places.length === 0) {
      return NextResponse.json(CATALOGO_DEMO);
    }

    return NextResponse.json(places);
  } catch {
    // Sin base de datos se responde con el catálogo de respaldo (modo demo).
    return NextResponse.json(CATALOGO_DEMO);
  }
}

/**
 * POST /api/places — crea un lugar del catálogo (solo admin).
 * Horarios sin confirmar deben mandarse con verified=false (regla 4 de CONTEXTO).
 */
export async function POST(request: NextRequest) {
  await connection();
  try {
    const auth = await requireProfile(["admin"]);
    if ("response" in auth) return auth.response;

    const cuerpo = await request.json().catch(() => null);
    const parsed = lugarSchema.safeParse(cuerpo);
    if (!parsed.success) {
      return NextResponse.json(errorDeValidacion(parsed.error), { status: 400 });
    }

    const { data, error } = await getAdminClient()
      .from("places")
      .insert(lugarAFila(parsed.data))
      .select("*")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(toPlace(data as Record<string, unknown>), { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error inesperado al crear el lugar";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
