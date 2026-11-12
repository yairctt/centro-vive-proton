import React from "react";
import Image from "next/image";
import Link from "next/link";

interface PulsoLogoProps {
  /** Tamaño del logo: xs (24px), sm (36px), md (48px), lg (72px), xl (96px), 2xl (128px) */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  /** Si debe incluir el texto de la marca al lado */
  conTexto?: boolean;
  /** Subtítulo a mostrar debajo del nombre cuando conTexto es true */
  subtitulo?: string;
  /** Si debe actuar como enlace hacia la portada / */
  comoEnlace?: boolean;
  /** Clases CSS adicionales para el contenedor */
  className?: string;
  /** Variante con marco estilizado y resplandor sutil */
  resaltado?: boolean;
}

const DIMENSIONES = {
  xs: { px: 24, clases: "w-6 h-6 rounded-lg" },
  sm: { px: 36, clases: "w-9 h-9 rounded-xl" },
  md: { px: 48, clases: "w-12 h-12 rounded-xl" },
  lg: { px: 72, clases: "w-[72px] h-[72px] rounded-2xl" },
  xl: { px: 96, clases: "w-24 h-24 rounded-3xl" },
  "2xl": { px: 128, clases: "w-32 h-32 rounded-3xl" },
} as const;

export function PulsoLogo({
  size = "md",
  conTexto = false,
  subtitulo,
  comoEnlace = false,
  className = "",
  resaltado = false,
}: PulsoLogoProps) {
  const conf = DIMENSIONES[size];

  const contenido = (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Contenedor del isotipo oficial */}
      <div
        className={`relative shrink-0 overflow-hidden bg-white shadow-xs transition duration-200 ${
          conf.clases
        } ${
          resaltado
            ? "ring-4 ring-teal-500/15 shadow-md shadow-teal-900/10 border-2 border-white"
            : "border border-neutral-200/90 dark:border-neutral-700/80"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-pulso-jarocho.jpg"
          alt="Pulso Jarocho — La ciudad se activa contigo"
          width={conf.px}
          height={conf.px}
          className="h-full w-full object-cover object-center"
        />
      </div>

      {/* Texto de la marca */}
      {conTexto && (
        <div className="flex flex-col text-left">
          <span className="font-black tracking-tight text-neutral-900 dark:text-neutral-100 text-lg leading-tight">
            Pulso Jarocho
          </span>
          <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-400 leading-tight tracking-wide">
            {subtitulo ?? "Centro Histórico de Veracruz"}
          </span>
        </div>
      )}
    </div>
  );

  if (comoEnlace) {
    return (
      <Link
        href="/"
        className="inline-flex transition hover:opacity-90 active:scale-[0.98] focus-visible:outline-teal-600"
        title="Ir al inicio de Pulso Jarocho"
      >
        {contenido}
      </Link>
    );
  }

  return contenido;
}
