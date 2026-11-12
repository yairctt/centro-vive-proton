"use client";

import { useEffect, useState } from "react";
import { destinoSeguro } from "@/lib/auth/roles";
import type { Role } from "@/lib/types";

export interface PerfilSesion {
  id: string;
  alias: string;
  role: Role;
  points: number;
  esInvitado: boolean;
  esDemo: boolean;
}

/** Pide el perfil de la sesión a GET /api/me (lo crea si es la primera vez). */
export async function cargarPerfil(): Promise<PerfilSesion | null> {
  try {
    const res = await fetch("/api/me", { cache: "no-store" });
    if (!res.ok) return null;
    const body = (await res.json()) as { profile: PerfilSesion | null };
    return body.profile;
  } catch {
    return null;
  }
}

/**
 * Tras iniciar sesión: va a `next` si el rol puede verlo, si no a su inicio.
 * Recarga completa para que proxy.ts y el servidor vean las cookies nuevas.
 */
export async function irTrasLogin(next: string | null): Promise<void> {
  const perfil = await cargarPerfil();
  window.location.assign(destinoSeguro(next, perfil?.role ?? "visitante"));
}

/** Hook: perfil de la sesión (undefined = cargando, null = sin sesión). */
export function useSesion(): PerfilSesion | null | undefined {
  const [perfil, setPerfil] = useState<PerfilSesion | null | undefined>(undefined);
  useEffect(() => {
    let vivo = true;
    cargarPerfil().then((p) => vivo && setPerfil(p));
    return () => {
      vivo = false;
    };
  }, []);
  return perfil;
}
