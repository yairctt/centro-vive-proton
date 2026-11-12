"use client";

import Link from "next/link";
import type { ReactNode, InputHTMLAttributes } from "react";
import { es } from "@/lib/i18n/es";

/** Marco común de las pantallas de acceso (mobile-first, 375 px). */
export function AuthShell({
  titulo,
  subtitulo,
  children,
  pie,
}: {
  titulo: string;
  subtitulo?: string;
  children: ReactNode;
  pie?: ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-4 py-10">
      <Link href="/" className="flex items-center justify-center gap-2.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 text-base font-black text-white">
          PJ
        </span>
        <span className="text-xl font-black tracking-tight">{es.appName}</span>
      </Link>

      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <h1 className="text-2xl font-black tracking-tight">{titulo}</h1>
        {subtitulo && (
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{subtitulo}</p>
        )}
        <div className="mt-6">{children}</div>
      </section>

      {pie && <div className="text-center text-sm">{pie}</div>}
    </main>
  );
}

export function Campo({
  label,
  ayuda,
  ...props
}: { label: string; ayuda?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      <input
        {...props}
        className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-base outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/30 dark:border-neutral-700 dark:bg-neutral-950"
      />
      {ayuda && <span className="mt-1 block text-xs text-neutral-500">{ayuda}</span>}
    </label>
  );
}

export function Boton({
  children,
  variante = "primario",
  ...props
}: { children: ReactNode; variante?: "primario" | "secundario" } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const estilos =
    variante === "primario"
      ? "bg-teal-700 text-white hover:bg-teal-800 disabled:bg-teal-700/60"
      : "border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-100 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800";
  return (
    <button
      {...props}
      className={`w-full rounded-xl px-4 py-3.5 text-base font-bold transition active:scale-[0.99] ${estilos}`}
    >
      {children}
    </button>
  );
}

export function Aviso({ tipo, children }: { tipo: "error" | "ok"; children: ReactNode }) {
  const estilos =
    tipo === "error"
      ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
      : "border-teal-200 bg-teal-50 text-teal-900 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-100";
  return (
    <p role={tipo === "error" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm ${estilos}`}>
      {children}
    </p>
  );
}

export function Separador() {
  return (
    <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase text-neutral-400">
      <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
      {es.auth.o}
      <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
    </div>
  );
}
