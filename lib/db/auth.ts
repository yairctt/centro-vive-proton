// Solo servidor. Sesión de Supabase Auth (cookies) → perfil de `profiles`.
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { getAdminClient } from "@/lib/db/server";
import { flags } from "@/lib/flags";
import type { Role } from "@/lib/types";

export interface SessionProfile {
  id: string;
  alias: string;
  role: Role;
  points: number;
  /** Entró con «Entrar como invitado» (auth anónima). */
  esInvitado: boolean;
  /** Perfil demo usado porque flags.modoDemo está encendido y no hay sesión. */
  esDemo: boolean;
}

/** Cliente de Supabase con la sesión del usuario (cookies de la petición). */
export async function getAuthClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Variables de entorno NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY son requeridas",
    );
  }
  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (lista) => {
        try {
          lista.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Desde un Server Component no se pueden escribir cookies: proxy.ts las renueva.
        }
      },
    },
  });
}

function aliasInicial(user: User): string {
  const meta = user.user_metadata as { alias?: unknown } | undefined;
  const alias = typeof meta?.alias === "string" ? meta.alias.trim() : "";
  if (alias) return alias.slice(0, 40);
  if (user.email) return user.email.split("@")[0].slice(0, 40);
  return `Invitado-${user.id.slice(0, 4).toUpperCase()}`;
}

function aSessionProfile(row: Record<string, unknown>, esInvitado: boolean, esDemo: boolean): SessionProfile {
  return {
    id: String(row.id),
    alias: String(row.alias ?? ""),
    role: (row.role as Role) ?? "visitante",
    points: Number(row.points ?? 0),
    esInvitado,
    esDemo,
  };
}

/**
 * Busca el perfil ligado a un usuario de Auth; si no existe lo crea como
 * `visitante` (los roles comercio/admin solo los asigna un admin en la base).
 */
export async function perfilDeUsuario(user: User): Promise<SessionProfile> {
  const admin = getAdminClient();
  const esInvitado = Boolean(user.is_anonymous);

  const { data: existente } = await admin
    .from("profiles")
    .select("id, alias, role, points")
    .eq("auth_id", user.id)
    .maybeSingle();
  if (existente) return aSessionProfile(existente, esInvitado, false);

  const { data: nuevo, error } = await admin
    .from("profiles")
    .insert({ auth_id: user.id, alias: aliasInicial(user), role: "visitante", points: 0 })
    .select("id, alias, role, points")
    .single();

  if (nuevo) return aSessionProfile(nuevo, esInvitado, false);

  // Dos peticiones a la vez pueden chocar con el UNIQUE de auth_id: releer.
  const { data: otraVez } = await admin
    .from("profiles")
    .select("id, alias, role, points")
    .eq("auth_id", user.id)
    .maybeSingle();
  if (otraVez) return aSessionProfile(otraVez, esInvitado, false);
  throw new Error(error?.message ?? "No se pudo crear el perfil");
}

/** Perfil demo del rol pedido (solo con flags.modoDemo). */
async function perfilDemo(role: Role): Promise<SessionProfile | null> {
  const { data } = await getAdminClient()
    .from("profiles")
    .select("id, alias, role, points")
    .eq("alias", `${role}-demo`)
    .maybeSingle();
  return data ? aSessionProfile(data, false, true) : null;
}

/** Perfil de la sesión actual, o null si no hay sesión. */
export async function getSessionProfile(): Promise<SessionProfile | null> {
  const supabase = await getAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? perfilDeUsuario(user) : null;
}

/**
 * Para route handlers: exige sesión con alguno de los roles.
 * Devuelve el perfil o una respuesta 401/403 lista para regresar.
 *
 *   const auth = await requireProfile(["comercio"]);
 *   if ("response" in auth) return auth.response;
 */
export async function requireProfile(
  roles: Role[],
): Promise<{ profile: SessionProfile } | { response: NextResponse }> {
  const profile = await getSessionProfile();

  if (!profile) {
    if (flags.modoDemo) {
      const demo = await perfilDemo(roles[0]);
      if (demo) return { profile: demo };
    }
    return {
      response: NextResponse.json({ error: "Inicia sesión para continuar" }, { status: 401 }),
    };
  }

  if (!roles.includes(profile.role)) {
    return {
      response: NextResponse.json(
        { error: "Tu cuenta no tiene permiso para esta acción" },
        { status: 403 },
      ),
    };
  }
  return { profile };
}
