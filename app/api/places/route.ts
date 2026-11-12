import { NextResponse, connection } from "next/server";
import { getAdminClient } from "@/lib/db/server";
import { toPlace } from "@/lib/db/mappers";
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
