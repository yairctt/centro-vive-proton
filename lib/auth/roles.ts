/**
 * Reglas de acceso por rol (funciones puras: se usan en proxy.ts, en las
 * APIs y en los menús). Un solo lugar para decidir quién ve qué.
 *
 *  visitante → Explorar el centro, rutas sugeridas, misiones, pasaporte, escanear
 *  comercio  → panel de comercio y QR imprimibles de sus locales
 *  admin     → todo (tablero de afluencia + lo demás para revisar la demo)
 */
import type { Role } from "@/lib/types";

/** Pantalla de inicio de cada rol después de iniciar sesión. */
export const HOME_POR_ROL: Record<Role, string> = {
  visitante: "/inicio",
  comercio: "/comercio",
  admin: "/admin",
};

/** Rutas que no piden sesión. */
const PUBLICAS = ["/login", "/registro", "/recuperar", "/auth"];

/** Rutas protegidas y los roles que pueden entrar (el primer prefijo que coincide gana). */
const PROTEGIDAS: { prefijo: string; roles: Role[] }[] = [
  { prefijo: "/admin", roles: ["admin"] },
  { prefijo: "/comercio", roles: ["comercio", "admin"] },
  { prefijo: "/inicio", roles: ["visitante", "admin"] },
  { prefijo: "/ruta", roles: ["visitante", "admin"] },
  { prefijo: "/mision", roles: ["visitante", "admin"] },
  { prefijo: "/pasaporte", roles: ["visitante", "admin"] },
  { prefijo: "/escanear", roles: ["visitante", "admin"] },
  // /restablecer necesita sesión (la de recuperación), pero cualquier rol.
  { prefijo: "/restablecer", roles: ["visitante", "comercio", "admin"] },
];

function coincide(path: string, prefijo: string): boolean {
  return path === prefijo || path.startsWith(prefijo + "/");
}

/**
 * Qué pide una ruta:
 *  - "publica"  → nadie necesita sesión
 *  - Role[]     → sesión con alguno de esos roles
 */
export function reglaDeRuta(path: string): "publica" | Role[] {
  if (path === "/") return "publica";
  if (PUBLICAS.some((p) => coincide(path, p))) return "publica";
  const regla = PROTEGIDAS.find((r) => coincide(path, r.prefijo));
  return regla ? regla.roles : "publica";
}

/** Destino seguro tras iniciar sesión: solo rutas internas («/…», nunca «//…»). */
export function destinoSeguro(next: string | null | undefined, rol: Role): string {
  if (next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/auth")) {
    const path = next.split("?")[0];
    const regla = reglaDeRuta(path);
    if (regla === "publica" || regla.includes(rol)) return next;
  }
  return HOME_POR_ROL[rol];
}
