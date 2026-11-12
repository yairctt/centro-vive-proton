"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getDictionary, type Idioma } from "@/lib/i18n";
import { useIdioma } from "@/components/ui/LanguageSelector";
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

function getOpcionesPorRol(t: ReturnType<typeof getDictionary>, lang: Idioma): Record<Role, OpcionItem[]> {
  const query = lang === "en" ? "?lang=en" : "";
  return {
    visitante: [
      {
        href: `/inicio${query}`,
        label: t.menu.explorar,
        subtitulo: t.portada.menuSubtitulos.explorar,
        icon: CompassIcon,
        color: "bg-teal-700 text-white",
      },
      {
        href: `/ruta${query}`,
        label: t.menu.rutas,
        subtitulo: t.portada.menuSubtitulos.rutas,
        icon: RouteIcon,
        color: "bg-teal-600 text-white",
      },
      {
        href: `/pasaporte${query}`,
        label: t.menu.pasaporte,
        subtitulo: t.portada.menuSubtitulos.pasaporte,
        icon: CoinsIcon,
        color: "bg-amber-600 text-white",
      },
      {
        href: `/escanear${query}`,
        label: t.menu.escanear,
        subtitulo: t.portada.menuSubtitulos.escanear,
        icon: QrCodeIcon,
        color: "bg-neutral-800 text-white",
      },
    ],
    comercio: [
      {
        href: "/comercio",
        label: t.menu.panelComercio,
        subtitulo: t.portada.menuSubtitulos.panelComercio,
        icon: StoreIcon,
        color: "bg-amber-600 text-white",
      },
      {
        href: "/comercio/qr",
        label: t.menu.qrImprimibles,
        subtitulo: t.portada.menuSubtitulos.qrImprimibles,
        icon: QrCodeIcon,
        color: "bg-teal-700 text-white",
      },
    ],
    admin: [
      {
        href: "/admin",
        label: t.menu.panelAdmin,
        subtitulo: t.portada.menuSubtitulos.panelAdmin,
        icon: BarChartIcon,
        color: "bg-teal-800 text-white",
      },
      {
        href: "/comercio",
        label: t.menu.panelComercio,
        subtitulo: t.portada.menuSubtitulos.panelComercio,
        icon: StoreIcon,
        color: "bg-amber-600 text-white",
      },
      {
        href: "/comercio/qr",
        label: t.menu.qrImprimibles,
        subtitulo: t.portada.menuSubtitulos.qrImprimibles,
        icon: QrCodeIcon,
        color: "bg-neutral-800 text-white",
      },
      {
        href: `/inicio${query}`,
        label: t.menu.explorar,
        subtitulo: t.portada.menuSubtitulos.probarTurista,
        icon: CompassIcon,
        color: "bg-teal-600 text-white",
      },
    ],
  };
}

export function MenuPorRol({ lang: propLang }: { lang?: Idioma } = {}) {
  const { lang: hookLang, t } = useIdioma();
  const lang = propLang || hookLang;
  const perfil = useSesion();
  const [cerrandoInvitado, setCerrandoInvitado] = useState(false);
  const opciones = getOpcionesPorRol(t, lang);

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
        <p className="text-xs font-semibold text-neutral-500">{t.menu.cargando}</p>
      </div>
    );
  }

  // Si no hay sesión o si era una sesión de invitado (que se limpia al llegar a la portada)
  if (perfil === null || perfil.esInvitado) {
    return (
      <nav className="flex flex-col gap-3">
        <Link
          href={`/login${lang === "en" ? "?lang=en" : ""}`}
          className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-teal-600 bg-teal-700 p-4 text-white shadow-sm transition hover:bg-teal-800 active:scale-[0.99]"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-xs text-white">
              <SparklesIcon className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-base font-bold leading-tight">{t.auth.entrar}</p>
              <p className="text-xs text-teal-100 font-medium">{t.portada.menuSubtitulos.loginRoles}</p>
            </div>
          </div>
          <ChevronRightIcon className="h-5 w-5 text-white/80 transition-transform group-hover:translate-x-1" />
        </Link>

        <Link
          href={`/registro${lang === "en" ? "?lang=en" : ""}`}
          className="group flex items-center justify-between rounded-2xl border border-neutral-300 bg-white p-4 text-neutral-800 shadow-2xs transition hover:bg-neutral-50 hover:border-neutral-400 active:scale-[0.99] dark:border-neutral-700 dark:bg-neutral-800/80 dark:text-neutral-100 dark:hover:bg-neutral-800"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200">
              <UserCheckIcon className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-base font-bold leading-tight">{t.auth.crearCuenta}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">{t.portada.menuSubtitulos.crearPasaporte}</p>
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
              {t.menu.hola}, {perfil.alias}
            </p>
            <p className="text-xs text-neutral-500 font-medium">
              {perfil.esInvitado ? t.menu.invitado : t.menu.rol[perfil.role]}
              {perfil.role === "visitante" && (
                <span className="ml-1.5 font-bold text-amber-700 dark:text-amber-400">
                  · {perfil.points} {t.qr.puntos}
                </span>
              )}
            </p>
          </div>
        </div>
        <BotonSalir lang={lang} />
      </div>

      {perfil.esInvitado && (
        <Link
          href={`/registro${lang === "en" ? "?lang=en" : ""}`}
          className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-center text-xs font-bold text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100 transition hover:bg-amber-100"
        >
          {t.menu.guardarCuenta}
        </Link>
      )}

      {/* Lista de accesos por rol con estilo premium */}
      <nav className="flex flex-col gap-2.5">
        {opciones[perfil.role].map((o) => {
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
