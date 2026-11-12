"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChartIcon, StoreIcon, QrCodeIcon, HomeIcon } from "./icons";
import { useSesion } from "@/components/auth/sesion";
import { BotonSalir } from "@/components/auth/BotonSalir";
import type { Role } from "@/lib/types";

/** Pestañas por rol (mismas reglas que proxy.ts / lib/auth/roles.ts). */
const LINKS = [
  { href: "/admin", label: "Tablero Admin", icon: BarChartIcon, roles: ["admin"] as Role[] },
  { href: "/comercio", label: "Mi Comercio", icon: StoreIcon, roles: ["comercio", "admin"] as Role[] },
  { href: "/comercio/qr", label: "QR imprimibles", icon: QrCodeIcon, roles: ["comercio", "admin"] as Role[] },
  { href: "/", label: "Inicio", icon: HomeIcon, roles: ["visitante", "comercio", "admin"] as Role[] },
];

export function PanelHeader() {
  const pathname = usePathname();
  const perfil = useSesion();
  // Mientras carga la sesión (o en modo demo sin sesión) se muestran todas.
  const navLinks = perfil ? LINKS.filter((l) => l.roles.includes(perfil.role)) : LINKS;

  const currentRole = pathname.startsWith("/admin")
    ? { name: "Administrador", color: "bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800" }
    : pathname.startsWith("/comercio")
    ? { name: "Comercio Asociado", color: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800" }
    : null;

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/95 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/95">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-700 text-white shadow-xs transition group-hover:scale-105">
              <span className="text-sm font-black tracking-wider">PJ</span>
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-neutral-900 dark:text-white">
                Pulso Jarocho
              </span>
              <span className="ml-2 hidden rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-800 border border-teal-200 sm:inline-block dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800">
                Centro Histórico
              </span>
            </div>
          </Link>

          {currentRole && (
            <span
              className={`hidden md:inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${currentRole.color}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70"></span>
              {currentRole.name}
            </span>
          )}
        </div>

        {/* Navigation tabs */}
        <nav className="flex items-center gap-1.5" aria-label="Navegación de paneles">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                  isActive
                    ? "bg-teal-700 text-white shadow-2xs dark:bg-teal-600"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-neutral-500 dark:text-neutral-400"}`} />
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

