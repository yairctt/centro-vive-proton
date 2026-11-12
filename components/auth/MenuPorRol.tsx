"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { es } from "@/lib/i18n/es";
import type { Role } from "@/lib/types";
import { useSesion } from "./sesion";
import { BotonSalir } from "./BotonSalir";
import { getBrowserClient } from "@/lib/db/browser";

/** Opciones de la portada según el rol (mismas reglas que proxy.ts). */
const OPCIONES: Record<Role, { href: string; label: string }[]> = {
  visitante: [
    { href: "/inicio", label: es.menu.explorar },
    { href: "/ruta", label: es.menu.rutas },
    { href: "/pasaporte", label: es.menu.pasaporte },
    { href: "/escanear", label: es.menu.escanear },
  ],
  comercio: [
    { href: "/comercio", label: es.menu.panelComercio },
    { href: "/comercio/qr", label: es.menu.qrImprimibles },
  ],
  admin: [
    { href: "/admin", label: es.menu.panelAdmin },
    { href: "/comercio", label: es.menu.panelComercio },
    { href: "/comercio/qr", label: es.menu.qrImprimibles },
    { href: "/inicio", label: es.menu.explorar },
  ],
};

const estiloOpcion =
  "rounded-xl border border-neutral-300 px-4 py-4 text-center text-base font-medium transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900";

export function MenuPorRol() {
  const perfil = useSesion();
  const [cerrandoInvitado, setCerrandoInvitado] = useState(false);

  useEffect(() => {
    // Al iniciar o abrir la portada (/), las sesiones anónimas de invitado
    // no deben mantenerse iniciadas. Se cierran para que el usuario pueda
    // elegir cómo ingresar (como visitante, comercio o admin en /login).
    if (perfil?.esInvitado && !cerrandoInvitado) {
      setCerrandoInvitado(true);
      try {
        const supabase = getBrowserClient();
        supabase.auth.signOut().finally(() => {
          fetch("/auth/salir", { method: "POST" }).finally(() => {
            window.location.reload();
          });
        });
      } catch {
        // En caso de que no haya cliente disponible
      }
    }
  }, [perfil, cerrandoInvitado]);

  if (perfil === undefined) {
    return <p className="text-center text-sm text-neutral-500">{es.menu.cargando}</p>;
  }

  // Si no hay sesión o si era una sesión de invitado (que se limpia al llegar a la portada)
  if (perfil === null || perfil.esInvitado) {
    return (
      <nav className="flex flex-col gap-3">
        <Link href="/login" className={`${estiloOpcion} border-teal-700 bg-teal-700 font-bold text-white hover:bg-teal-800`}>
          {es.auth.entrar}
        </Link>
        <Link href="/registro" className={estiloOpcion}>
          {es.auth.crearCuenta}
        </Link>
      </nav>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-xl bg-neutral-100 px-4 py-3 dark:bg-neutral-900">
        <div>
          <p className="text-sm font-bold">
            {es.menu.hola}, {perfil.alias}
          </p>
          <p className="text-xs text-neutral-500">
            {perfil.esInvitado ? es.menu.invitado : es.menu.rol[perfil.role]}
            {perfil.role === "visitante" && ` · ${perfil.points} pts`}
          </p>
        </div>
        <BotonSalir />
      </div>

      {perfil.esInvitado && (
        <Link
          href="/registro"
          className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-center text-sm font-semibold text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100"
        >
          {es.menu.guardarCuenta}
        </Link>
      )}

      <nav className="flex flex-col gap-3">
        {OPCIONES[perfil.role].map((o) => (
          <Link key={o.href} href={o.href} className={estiloOpcion}>
            {o.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
