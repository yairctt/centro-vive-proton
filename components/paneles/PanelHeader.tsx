"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSesion } from "@/components/auth/sesion";
import { BotonSalir } from "@/components/auth/BotonSalir";
import type { Role } from "@/lib/types";

/** Pestañas por rol (mismas reglas que proxy.ts / lib/auth/roles.ts). */
const LINKS: { href: string; label: string; icon: string; roles: Role[] }[] = [
  { href: "/admin", label: "Tablero Admin", icon: "📊", roles: ["admin"] },
  { href: "/comercio", label: "Mi Comercio", icon: "🏪", roles: ["comercio", "admin"] },
  { href: "/comercio/qr", label: "QR imprimibles", icon: "🖨️", roles: ["comercio", "admin"] },
  { href: "/", label: "Inicio", icon: "🏠", roles: ["visitante", "comercio", "admin"] },
];

export function PanelHeader() {
  const pathname = usePathname();
  const perfil = useSesion();
  // Mientras carga la sesión (o en modo demo sin sesión) se muestran todas.
  const navLinks = perfil ? LINKS.filter((l) => l.roles.includes(perfil.role)) : LINKS;

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-700 text-white shadow-xs">
            <span className="text-base font-black">PJ</span>
          </div>
          <div>
            <span className="text-base font-black tracking-tight text-neutral-900 dark:text-white">
              Pulso Jarocho
            </span>
            <span className="ml-2 hidden rounded-md bg-teal-50 px-1.5 py-0.5 text-[10px] font-semibold text-teal-800 border border-teal-200 sm:inline-block dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800">
              Centro Histórico
            </span>
          </div>
        </Link>

        {/* Navigation tabs */}
        <nav className="flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  isActive
                    ? "bg-teal-700 text-white shadow-2xs dark:bg-teal-600"
                    : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                }`}
              >
                <span>{link.icon}</span>
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            );
          })}
          {perfil && <BotonSalir />}
        </nav>
      </div>
    </header>
  );
}

