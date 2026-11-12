"use client";

import Link from "next/link";
import type { ReactNode, InputHTMLAttributes } from "react";
import { es } from "@/lib/i18n/es";
import { en } from "@/lib/i18n/en";
import type { Idioma } from "@/lib/i18n";
import { PulsoLogo } from "@/components/ui/PulsoLogo";
import { ArrowLeftIcon } from "@/components/paneles/icons";

/** Marco común de las pantallas de acceso con diseño Split-Screen moderno inspirado en el boceto. */
export function AuthShell({
  titulo,
  subtitulo,
  children,
  pie,
  mostrarVolver = true,
  headerRight,
  lang = "es",
}: {
  titulo: string;
  subtitulo?: ReactNode;
  children: ReactNode;
  pie?: ReactNode;
  mostrarVolver?: boolean;
  headerRight?: ReactNode;
  lang?: Idioma;
}) {
  const dict = lang === "en" ? en : es;

  return (
    <div className="min-h-screen w-full bg-white dark:bg-neutral-950 flex flex-col lg:grid lg:grid-cols-12">
      {/* Columna Izquierda (Showcase Visual Hero al estilo del boceto) */}
      <div className="relative overflow-hidden bg-gradient-to-br from-teal-950 via-teal-900 to-sky-950 text-white p-8 lg:p-14 lg:col-span-5 xl:col-span-5 flex flex-col justify-between min-h-[320px] lg:min-h-screen">
        {/* Fondo con foto real de Veracruz y overlay degradado */}
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/faro-veracruz.jpg"
            alt="Faro Venustiano Carranza y Centro Histórico de Veracruz"
            className="w-full h-full object-cover object-center opacity-30 mix-blend-luminosity scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-teal-950 via-teal-950/85 to-sky-950/75" />
        </div>

        {/* Ondas vectoriales concéntricas estilizadas como el boceto */}
        <svg
          className="absolute right-0 top-0 h-full w-full pointer-events-none opacity-20 z-0"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 400 600"
          fill="none"
        >
          <path d="M400 50C250 50 150 180 150 350C150 480 220 580 400 600" stroke="white" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M400 120C280 120 200 220 200 360C200 460 260 540 400 560" stroke="white" strokeWidth="1.5" />
          <path d="M400 190C310 190 250 260 250 370C250 440 290 500 400 520" stroke="white" strokeWidth="1.5" />
          <circle cx="120" cy="80" r="4" fill="white" />
          <circle cx="280" cy="140" r="3" fill="white" />
        </svg>

        {/* Header superior izquierdo: Logo oficial */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3 group focus:outline-none">
            <div className="size-11 rounded-2xl overflow-hidden border border-white/30 bg-white p-0.5 shadow-md transition-transform group-hover:scale-105">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-pulso-jarocho.jpg" alt="Pulso Jarocho" className="w-full h-full object-cover rounded-xl" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-black text-lg text-white leading-tight">Pulso Jarocho</span>
              <span className="text-[11px] font-semibold text-teal-300">
                {lang === "en" ? "Historic Downtown · Veracruz" : "Centro Histórico · Veracruz"}
              </span>
            </div>
          </Link>
        </div>

        {/* Mensaje central hero del boceto */}
        <div className="relative z-10 my-8 lg:my-auto max-w-md">
          {/* Ícono de estrella/asterisco veracruzana */}
          <div className="mb-4 inline-flex items-center justify-center size-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-teal-300 shadow-sm">
            <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="2" x2="12" y2="22" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" />
            </svg>
          </div>

          <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black tracking-tight text-white leading-[1.15]">
            {dict.auth.heroHola} <br />
            <span className="text-teal-300">Pulso Jarocho!</span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-teal-100/90 leading-relaxed font-normal">
            {dict.auth.heroDesc}
          </p>

          <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-teal-200">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15">
              {dict.auth.heroBadgeLugares}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15">
              {dict.auth.heroBadgeComercios}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15">
              {dict.auth.heroBadgeCanjes}
            </span>
          </div>
        </div>

        {/* Footer inferior izquierdo */}
        <div className="relative z-10 pt-4 border-t border-white/10 text-xs text-teal-200/70 flex items-center justify-between">
          <p>© 2026 Pulso Jarocho. Reto 6 · Centro Vivo.</p>
          <span className="font-semibold text-teal-200">Powered by Protón</span>
        </div>
      </div>

      {/* Columna Derecha (Formulario y Contenido interactivo) */}
      <div className="lg:col-span-7 xl:col-span-7 flex flex-col justify-center px-6 sm:px-10 md:px-16 lg:px-14 xl:px-20 py-8 lg:py-12 bg-white dark:bg-neutral-950">
        <div className="w-full max-w-md mx-auto">
          {/* Barra superior de navegación y selector de idioma */}
          <div className="mb-6 flex items-center justify-between gap-3">
            {mostrarVolver ? (
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition py-1.5 px-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800"
                title={dict.auth.volverPortada}
              >
                <ArrowLeftIcon className="h-4 w-4 text-teal-700 dark:text-teal-400" />
                <span>{dict.auth.volverPortada}</span>
              </Link>
            ) : <div />}
            <div className="flex items-center gap-2">
              {headerRight}
              <div className="lg:hidden">
                <PulsoLogo size="xs" conTexto={false} />
              </div>
            </div>
          </div>

          {/* Marca en la parte superior del formulario al estilo del boceto */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 mb-3">
              <PulsoLogo size="sm" conTexto={false} />
              <span className="text-xl font-black tracking-tight text-neutral-900 dark:text-neutral-100">
                {es.appName}
              </span>
            </div>

            <h2 className="text-3xl font-black tracking-tight text-neutral-900 dark:text-neutral-100">
              {titulo}
            </h2>
            {subtitulo && (
              <div className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {subtitulo}
              </div>
            )}
          </div>

          {/* Formulario */}
          <div>{children}</div>

          {/* Pie */}
          {pie && (
            <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-900 text-center text-sm">
              {pie}
            </div>
          )}

          <div className="mt-6 text-center text-xs text-neutral-400 dark:text-neutral-500">
            Powered by <span className="font-semibold text-teal-700 dark:text-teal-400">Protón</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Campo({
  label,
  ayuda,
  icono,
  ...props
}: { label: string; ayuda?: string; icono?: ReactNode } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">{label}</span>
      <div className="relative flex items-center">
        {icono && (
          <div className="pointer-events-none absolute left-3.5 flex items-center justify-center text-neutral-400">
            {icono}
          </div>
        )}
        <input
          {...props}
          className={`w-full rounded-xl border border-neutral-300 bg-white py-3 text-base outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/25 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 ${
            icono ? "pl-10 pr-4" : "px-4"
          }`}
        />
      </div>
      {ayuda && <span className="mt-1 block text-xs text-neutral-500">{ayuda}</span>}
    </label>
  );
}

export function Boton({
  children,
  variante = "primario",
  icono,
  ...props
}: {
  children: ReactNode;
  variante?: "primario" | "secundario" | "invitado" | "demo" | "oscuro";
  icono?: ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  let estilos = "bg-teal-700 text-white hover:bg-teal-800 disabled:bg-teal-700/60 shadow-xs";
  if (variante === "oscuro") {
    estilos =
      "bg-neutral-900 text-white hover:bg-black disabled:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 shadow-sm";
  } else if (variante === "secundario") {
    estilos =
      "border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800 shadow-2xs";
  } else if (variante === "invitado") {
    estilos =
      "border border-teal-200 bg-teal-50 text-teal-900 hover:bg-teal-100 dark:border-teal-800 dark:bg-teal-950/50 dark:text-teal-200 shadow-2xs";
  } else if (variante === "demo") {
    estilos =
      "border border-neutral-200 bg-neutral-50 text-neutral-800 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200";
  }

  return (
    <button
      {...props}
      className={`w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-base font-bold transition active:scale-[0.99] cursor-pointer ${estilos}`}
    >
      {icono && <span className="shrink-0">{icono}</span>}
      <span>{children}</span>
    </button>
  );
}

export function Aviso({ tipo, children }: { tipo: "error" | "ok"; children: ReactNode }) {
  const estilos =
    tipo === "error"
      ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
      : "border-teal-200 bg-teal-50 text-teal-900 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-100";
  return (
    <p role={tipo === "error" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm font-medium ${estilos}`}>
      {children}
    </p>
  );
}

export function Separador({ texto }: { texto?: string }) {
  return (
    <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase text-neutral-400">
      <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
      <span>{texto ?? es.auth.o}</span>
      <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
    </div>
  );
}
