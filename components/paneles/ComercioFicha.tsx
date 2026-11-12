"use client";

import React from "react";
import type { ComercioMockData } from "./mock-data";
import { CheckIcon, ClockIcon, MapPinIcon, TagIcon } from "./icons";

interface ComercioFichaProps {
  comercio: ComercioMockData;
  onToggleOpen?: () => void;
}

export function ComercioFicha({ comercio, onToggleOpen }: ComercioFichaProps) {
  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
              {comercio.name}
            </h1>
            {comercio.verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700 border border-teal-200/80 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800">
                <CheckIcon className="h-3 w-3" />
                Verificado
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                comercio.isOpen
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                  : "bg-neutral-100 text-neutral-600 border-neutral-300 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  comercio.isOpen ? "bg-emerald-500" : "bg-neutral-400"
                }`}
              ></span>
              {comercio.isOpen ? "Abierto ahora" : "Cerrado"}
            </span>
          </div>

          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {comercio.description}
          </p>

          <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-neutral-500 dark:text-neutral-400 pt-1">
            <span className="flex items-center gap-1.5">
              <ClockIcon className="h-3.5 w-3.5 text-neutral-400" />
              {comercio.hours}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPinIcon className="h-3.5 w-3.5 text-neutral-400" />
              {comercio.address}
            </span>
            <span className="flex items-center gap-1.5 font-medium text-teal-700 dark:text-teal-400">
              <TagIcon className="h-3.5 w-3.5 text-teal-600" />
              {comercio.category}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {onToggleOpen && (
            <button
              onClick={onToggleOpen}
              className="inline-flex cursor-pointer items-center rounded-xl border border-neutral-300/80 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-50 active:scale-95 transition dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
            >
              {comercio.isOpen ? "Simular cierre" : "Abrir local"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

