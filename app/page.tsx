"use client";

import Link from "next/link";
import { useIdioma, LanguageSelector } from "@/components/ui/LanguageSelector";
import { MenuPorRol } from "@/components/auth/MenuPorRol";
import { PulsoLogo } from "@/components/ui/PulsoLogo";
import { MapPinIcon, UsersIcon, ChevronRightIcon } from "@/components/paneles/icons";

export default function Home() {
  const { lang, t } = useIdioma();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-8 relative space-y-4">
      {/* Selector de Idioma en la parte superior derecha */}
      <div className="flex justify-end items-center mb-1">
        <LanguageSelector size="sm" />
      </div>

      <header className="flex flex-col items-center text-center space-y-3">
        <div className="relative">
          <PulsoLogo size="2xl" resaltado={true} className="transition-transform duration-300 hover:scale-105" />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-teal-800 text-white text-[10px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full shadow-xs border border-teal-600">
            {t.portada.retoBadge}
          </div>
        </div>

        <div className="pt-2">
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 dark:text-neutral-100">
            {t.appName}
          </h1>
          <p className="mt-1 text-sm font-semibold text-teal-700 dark:text-teal-400">
            {t.tagline}
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800/80 px-3 py-1 text-xs font-semibold text-neutral-600 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-700/80">
            <MapPinIcon className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
            <span>{t.portada.etiqueta}</span>
          </div>
        </div>
      </header>

      {/* Acceso directo a Rutas en Grupo (Pequeños y Grandes Contingentes) */}
      <Link
        href={`/inicio?mode=grupo&lang=${lang}`}
        className="group relative overflow-hidden rounded-3xl border border-amber-300/80 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 p-4 text-neutral-950 shadow-md transition-all hover:shadow-lg active:scale-[0.99] flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-neutral-950 text-amber-300 shadow-xs">
            <UsersIcon className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-neutral-950/20 text-neutral-950 px-2 py-0.5 rounded-full">
                {t.portada.grupoBadge}
              </span>
              <span className="text-[10px] font-bold text-neutral-800">
                {t.portada.grupoCapacidad}
              </span>
            </div>
            <h2 className="text-sm font-black text-neutral-950 leading-snug mt-0.5">
              {t.portada.grupoTitulo}
            </h2>
            <p className="text-[11px] text-neutral-900/90 font-medium">
              {t.portada.grupoDesc}
            </p>
          </div>
        </div>
        <ChevronRightIcon className="h-5 w-5 text-neutral-950 shrink-0 transition-transform group-hover:translate-x-1" />
      </Link>

      {/* Las opciones dependen del rol: visitante, comercio o admin. */}
      <div className="rounded-3xl border border-neutral-200/90 bg-white/95 p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/90 backdrop-blur-xs">
        <MenuPorRol lang={lang} />
      </div>

      <footer className="text-center text-xs text-neutral-400 dark:text-neutral-500 space-y-1">
        <p>{t.portada.footerTurismo}</p>
        <p className="text-[11px] font-medium text-neutral-400/90 dark:text-neutral-500/90">
          {t.portada.footerPowered} <span className="font-semibold text-teal-700 dark:text-teal-400">Protón</span>
        </p>
      </footer>
    </main>
  );
}
