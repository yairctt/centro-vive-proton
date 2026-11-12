"use client";

import Link from "next/link";
import type { ReactNode, InputHTMLAttributes } from "react";
import { es } from "@/lib/i18n/es";
import { PulsoLogo } from "@/components/ui/PulsoLogo";
import { ArrowLeftIcon } from "@/components/paneles/icons";

/** Marco común de las pantallas de acceso (mobile-first, 375 px) con identidad visual oficial. */
export function AuthShell({
  titulo,
  subtitulo,
  children,
  pie,
  mostrarVolver = true,
}: {
  titulo: string;
  subtitulo?: string;
  children: ReactNode;
  pie?: ReactNode;
  mostrarVolver?: boolean;
}) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-8 relative">
      {/* Botón superior de volver a la portada */}
      {mostrarVolver && (
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white transition group py-1 px-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
            title="Volver a la portada principal"
          >
            <ArrowLeftIcon className="h-4 w-4 text-teal-700 dark:text-teal-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>Volver a la portada</span>
          </Link>
          <span className="text-[11px] font-semibold tracking-wide text-neutral-400 uppercase">
            Pulso Jarocho
          </span>
        </div>
      )}

      {/* Cabecera con isotipo oficial */}
      <div className="mb-6 flex flex-col items-center text-center">
        <Link href="/" className="group inline-flex flex-col items-center focus:outline-none">
          <div className="transition-transform group-hover:scale-105 duration-200">
            <PulsoLogo size="lg" resaltado={true} />
          </div>
          <h2 className="mt-3 text-xl font-black tracking-tight text-neutral-900 dark:text-neutral-100">
            {es.appName}
          </h2>
          <span className="inline-block mt-0.5 text-xs font-semibold text-teal-700 dark:text-teal-400">
            Centro Histórico de Veracruz
          </span>
        </Link>
      </div>

      {/* Tarjeta contenedora con acabados elegantes */}
      <section className="rounded-3xl border border-neutral-200/90 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/90 backdrop-blur-xs">
        <div className="mb-5 border-b border-neutral-100 dark:border-neutral-800/80 pb-3">
          <h1 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-neutral-100">{titulo}</h1>
          {subtitulo && (
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 leading-snug">{subtitulo}</p>
          )}
        </div>
        <div>{children}</div>
      </section>

      {pie && <div className="mt-6 text-center text-sm">{pie}</div>}
    </main>
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
          className={`w-full rounded-xl border border-neutral-300 bg-white py-3 text-base outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/25 dark:border-neutral-700 dark:bg-neutral-950 ${
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
  variante?: "primario" | "secundario" | "invitado" | "demo";
  icono?: ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  let estilos = "bg-teal-700 text-white hover:bg-teal-800 disabled:bg-teal-700/60 shadow-xs";
  if (variante === "secundario") {
    estilos =
      "border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-100 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800 shadow-2xs";
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
