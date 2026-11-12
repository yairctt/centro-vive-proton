/**
 * Proxy (antes «middleware» en Next < 16).
 *  1. Renueva la sesión de Supabase Auth (cookies) en cada navegación.
 *  2. Separa la app por rol (reglas en lib/auth/roles.ts):
 *     sin sesión → /login?next=…   ·   rol sin permiso → su pantalla de inicio.
 * Las APIs (/api/*) no pasan por aquí: cada una valida su sesión y rol.
 */
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { HOME_POR_ROL, reglaDeRuta } from "@/lib/auth/roles";
import { flags } from "@/lib/flags";
import type { Role } from "@/lib/types";

async function rolDe(authId: string): Promise<Role> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return "visitante";
  const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data } = await admin.from("profiles").select("role").eq("auth_id", authId).maybeSingle();
  // Sin perfil todavía: se crea como visitante en la primera llamada a la API.
  return (data?.role as Role) ?? "visitante";
}

export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (lista) => {
        lista.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        lista.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // getUser() valida el token con Supabase y lo renueva si hace falta.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;
  const regla = reglaDeRuta(pathname);
  if (regla === "publica") return response;

  // Redirección que conserva las cookies renovadas.
  const redirigir = (destino: URL) => {
    const r = NextResponse.redirect(destino);
    response.cookies.getAll().forEach((c) => r.cookies.set(c));
    return r;
  };

  if (!user) {
    if (flags.modoDemo) return response;
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname + search);
    return redirigir(login);
  }

  const rol = await rolDe(user.id);
  if (!regla.includes(rol)) {
    return redirigir(new URL(HOME_POR_ROL[rol], request.url));
  }
  return response;
}

export const config = {
  matcher: [
    // Todo menos APIs, archivos de Next y archivos estáticos (con extensión).
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.[a-zA-Z0-9]+$).*)",
  ],
};
