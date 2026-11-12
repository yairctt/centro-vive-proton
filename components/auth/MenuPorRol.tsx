"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { es } from "@/lib/i18n/es";
import type { Role } from "@/lib/types";
import { useSesion } from "./sesion";
import { BotonSalir } from "./BotonSalir";
import { getBrowserClient } from "@/lib/db/browser";
import {
  CompassIcon,
  CoinsIcon,
  QrCodeIcon,
  StoreIcon,
  BarChartIcon,
  SparklesIcon,
  ChevronRightIcon,
  UserCheckIcon,
} from "@/components/paneles/icons";
import { RouteIcon } from "@/components/visitante/icons";

interface OpcionItem {
  href: string;
  label: string;
  subtitulo: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

/** Opciones de la portada según el rol con iconos y subtítulos amigables. */
const OPCIONES: Record<Role, OpcionItem[]> = {
  visitante: [
    {
      href: "/inicio",
      label: es.menu.explorar,
      subtitulo: "Personaliza tu tiempo, intereses y presupuesto",
      icon: CompassIcon,
      color: "bg-teal-700 text-white",
    },
    {
      href: "/ruta",
      label: es.menu.rutas,
      subtitulo: "Tu ruta inteligente con paradas y mapas",
      icon: RouteIcon,
      color: "bg-teal-600 text-white",
    },
    {
      href: "/pasaporte",
      label: es.menu.pasaporte,
      subtitulo: "Tus sellos digitales, puntos y recompensas",
      icon: CoinsIcon,
      color: "bg-amber-600 text-white",
    },
    {
      href: "/escanear",
      label: es.menu.escanear,
      subtitulo: "Escanea el código QR en los comercios",
      icon: QrCodeIcon,
      color: "bg-neutral-800 text-white",
    },
  ],
  comercio: [
    {
      href: "/comercio",
      label: es.menu.panelComercio,
      subtitulo: "Tu vitrina comercial, promociones y canjes",
      icon: StoreIcon,
      color: "bg-amber-600 text-white",
    },
    {
      href: "/comercio/qr",
      label: es.menu.qrImprimibles,
      subtitulo: "Tokens QR para mostrar en tu mostrador",
      icon: QrCodeIcon,
      color: "bg-teal-700 text-white",
    },
  ],
  admin: [
    {
      href: "/admin",
      label: es.menu.panelAdmin,
      subtitulo: "Tablero en vivo de afluencia e impacto digital",
      icon: BarChartIcon,
      color: "bg-teal-800 text-white",
    },
    {
      href: "/comercio",
      label: es.menu.panelComercio,
      subtitulo: "Vista y gestión de comercios asociados",
      icon: StoreIcon,
      color: "bg-amber-600 text-white",
    },
    {
      href: "/comercio/qr",
      label: es.menu.qrImprimibles,
      subtitulo: "Códigos QR imprimibles para el jurado",
      icon: QrCodeIcon,
      color: "bg-neutral-800 text-white",
    },
    {
      href: "/inicio",
      label: es.menu.explorar,
      subtitulo: "Probar experiencia de turista en el centro",
      icon: CompassIcon,
      color: "bg-teal-600 text-white",
    },
  ],
};

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
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-700 border-t-transparent mb-2"></div>
        <p className="text-xs font-semibold text-neutral-500">{es.menu.cargando}</p>
      </div>
    );
  }

  // Si no hay sesión o si era una sesión de invitado (que se limpia al llegar a la portada)
  if (perfil === null || perfil.esInvitado) {
    return (
      <nav className="flex flex-col gap-3">
        <Link
          href="/login"
          className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-teal-600 bg-teal-700 p-4 text-white shadow-sm transition hover:bg-teal-800 active:scale-[0.99]"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-xs text-white">
              <SparklesIcon className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-base font-bold leading-tight">{es.auth.entrar}</p>
              <p className="text-xs text-teal-100 font-medium">Turista · Comercio · Jurado / Admin</p>
            </div>
          </div>
          <ChevronRightIcon className="h-5 w-5 text-white/80 transition-transform group-hover:translate-x-1" />
        </Link>

        <Link
          href="/registro"
          className="group flex items-center justify-between rounded-2xl border border-neutral-300 bg-white p-4 text-neutral-800 shadow-2xs transition hover:bg-neutral-50 hover:border-neutral-400 active:scale-[0.99] dark:border-neutral-700 dark:bg-neutral-800/80 dark:text-neutral-100 dark:hover:bg-neutral-800"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200">
              <UserCheckIcon className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-base font-bold leading-tight">{es.auth.crearCuenta}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Crea tu pasaporte jarocho</p>
            </div>
          </div>
          <ChevronRightIcon className="h-5 w-5 text-neutral-400 transition-transform group-hover:translate-x-1" />
        </Link>
      </nav>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Tarjeta de bienvenida de usuario */}
      <div className="flex items-center justify-between rounded-2xl border border-neutral-200/80 bg-neutral-50/80 p-3.5 dark:border-neutral-800 dark:bg-neutral-900/60">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white font-black text-sm shadow-2xs">
            {perfil.alias.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-black text-neutral-900 dark:text-neutral-100 leading-tight">
              {es.menu.hola}, {perfil.alias}
            </p>
            <p className="text-xs text-neutral-500 font-medium">
              {perfil.esInvitado ? es.menu.invitado : es.menu.rol[perfil.role]}
              {perfil.role === "visitante" && (
                <span className="ml-1.5 font-bold text-amber-700 dark:text-amber-400">
                  · {perfil.points} pts
                </span>
              )}
            </p>
          </div>
        </div>
        <BotonSalir />
      </div>

      {perfil.esInvitado && (
        <Link
          href="/registro"
          className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-center text-xs font-bold text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100 transition hover:bg-amber-100"
        >
          {es.menu.guardarCuenta}
        </Link>
      )}

      {/* Lista de accesos por rol con estilo premium */}
      <nav className="flex flex-col gap-2.5">
        {OPCIONES[perfil.role].map((o) => {
          const Icon = o.icon;
          return (
            <Link
              key={o.href}
              href={o.href}
              className="group flex items-center justify-between rounded-2xl border border-neutral-200/90 bg-white p-3.5 shadow-2xs transition hover:border-teal-500/50 hover:bg-neutral-50 hover:shadow-xs active:scale-[0.99] dark:border-neutral-800 dark:bg-neutral-800/80 dark:hover:bg-neutral-800"
            >
              <div className="flex items-center gap-3.5">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-2xs ${o.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100 leading-tight group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                    {o.label}
                  </p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium line-clamp-1">
                    {o.subtitulo}
                  </p>
                </div>
              </div>
              <ChevronRightIcon className="h-4 w-4 text-neutral-400 shrink-0 transition-transform group-hover:translate-x-1" />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
