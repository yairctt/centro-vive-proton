import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/db/server";
import { toPlace } from "@/lib/db/mappers";

export async function GET() {
  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("places")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const places = (data ?? []).map(toPlace);
    return NextResponse.json(places);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error inesperado al consultar lugares";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
