"use client";

import React from "react";
import type { ComercioMockData } from "./mock-data";

interface ComercioFichaProps {
  comercio: ComercioMockData;
  onToggleOpen?: () => void;
}

export function ComercioFicha({ comercio, onToggleOpen }: ComercioFichaProps) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
              {comercio.name}
            </h1>
            {comercio.verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800">
                <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Verificado
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                comercio.isOpen
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
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

          <div className="flex flex-wrap gap-y-1 gap-x-4 text-xs text-neutral-500 dark:text-neutral-400">
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {comercio.hours}
            </span>
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {comercio.address}
            </span>
            <span className="flex items-center gap-1 font-medium text-teal-700 dark:text-teal-400">
              🏷️ {comercio.category}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {onToggleOpen && (
            <button
              onClick={onToggleOpen}
              className="inline-flex cursor-pointer items-center rounded-xl border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
            >
              {comercio.isOpen ? "Simular cierre" : "Abrir local"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

