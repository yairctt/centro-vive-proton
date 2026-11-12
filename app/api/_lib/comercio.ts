/**
 * Helpers de propiedad para el CRUD de los paneles.
 * Un comercio solo puede tocar lo que pertenece a sus negocios (businesses.owner_id).
 */
import { getAdminClient } from "@/lib/db/server";

/** Ids de los lugares (places) de los negocios de un perfil comercio. */
export async function lugaresDelComercio(profileId: string): Promise<string[]> {
  const { data, error } = await getAdminClient()
    .from("businesses")
    .select("place_id")
    .eq("owner_id", profileId);
  if (error) throw new Error(error.message);
  return (data ?? []).map((n) => String(n.place_id));
}

/** Ids de los negocios (businesses) de un perfil comercio. */
export async function negociosDelComercio(profileId: string): Promise<string[]> {
  const { data, error } = await getAdminClient()
    .from("businesses")
    .select("id")
    .eq("owner_id", profileId);
  if (error) throw new Error(error.message);
  return (data ?? []).map((n) => String(n.id));
}
