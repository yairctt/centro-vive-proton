"use client";

import React, { useState } from "react";
import type { ComercioMockData } from "./mock-data";
import { CheckIcon, ClockIcon, MapPinIcon, TagIcon, ShareIcon, QrCodeIcon } from "./icons";

interface ComercioFichaProps {
  comercio: ComercioMockData;
  onToggleOpen?: () => void;
}

export function ComercioFicha({ comercio, onToggleOpen }: ComercioFichaProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      {/* Banner decorativo sutil con acento cálido veracruzano */}
      <div className="h-3 w-full bg-gradient-to-r from-teal-700 via-amber-500 to-rose-600"></div>

      <div className="p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-neutral-900 sm:text-3xl dark:text-white">
                {comercio.name}
              </h1>
              {comercio.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-100/90 px-3 py-0.5 text-xs font-bold text-teal-800 border border-teal-300 dark:bg-teal-950/70 dark:text-teal-300 dark:border-teal-700">
                  <CheckIcon className="h-3.5 w-3.5" />
                  Comercio Verificado
                </span>
              )}
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-bold border ${
                  comercio.isOpen
                    ? "bg-emerald-100/90 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-700"
                    : "bg-neutral-100 text-neutral-600 border-neutral-300 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    comercio.isOpen ? "bg-emerald-500 animate-pulse" : "bg-neutral-400"
                  }`}
                ></span>
                {comercio.isOpen ? "Abierto ahora" : "Cerrado"}
              </span>
            </div>

            <p className="text-sm font-normal text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {comercio.description}
            </p>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-neutral-600 dark:text-neutral-300 pt-1">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-100/80 px-2.5 py-1 dark:bg-neutral-800">
                <ClockIcon className="h-3.5 w-3.5 text-teal-700 dark:text-teal-400" />
                <span className="font-semibold">{comercio.hours}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-100/80 px-2.5 py-1 dark:bg-neutral-800">
                <MapPinIcon className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                <span>{comercio.address}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-100/80 px-2.5 py-1 font-bold text-amber-900 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
                <TagIcon className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" />
                {comercio.category}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap md:flex-col items-center md:items-end gap-2.5 shrink-0 pt-2 md:pt-0">
            <button
              onClick={handleShare}
              title="Copiar enlace para promocionar tu comercio"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-neutral-300/80 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-50 active:scale-95 transition dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
            >
              <ShareIcon className="h-3.5 w-3.5" />
              <span>{copied ? "¡Enlace copiado!" : "Compartir vitrina"}</span>
            </button>

            {onToggleOpen && (
              <button
                onClick={onToggleOpen}
                className={`inline-flex cursor-pointer items-center rounded-xl border px-3.5 py-2 text-xs font-semibold shadow-2xs active:scale-95 transition ${
                  comercio.isOpen
                    ? "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                    : "border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                }`}
              >
                {comercio.isOpen ? "Simular local cerrado" : "Marcar abierto ahora"}
              </button>
            )}

            <div className="mt-1 flex items-center gap-1.5 rounded-lg bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-teal-800 border border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800">
              <QrCodeIcon className="h-3.5 w-3.5 text-teal-600" />
              <span>Otorga +50 pts por visita QR</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

