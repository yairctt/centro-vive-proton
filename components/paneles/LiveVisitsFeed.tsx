"use client";

import React, { useState } from "react";
import { QrCodeIcon, PlusIcon, SparklesIcon } from "./icons";

export interface VisitItem {
  id: string;
  placeId: string;
  placeName: string;
  createdAt: string;
  method: "qr" | "manual";
  pointsAwarded: number;
  missionTitle?: string;
}

interface LiveVisitsFeedProps {
  initialVisits: VisitItem[];
}

export function LiveVisitsFeed({ initialVisits }: LiveVisitsFeedProps) {
  const [visits, setVisits] = useState<VisitItem[]>(initialVisits);
  const [simulatedCount, setSimulatedCount] = useState(0);

  // Demo helper: lets the presenter or judge inject a real-time scan to test < 10s rule
  const handleSimulateJudgeScan = () => {
    const newCount = simulatedCount + 1;
    setSimulatedCount(newCount);
    const newVisit: VisitItem = {
      id: `sim-${Date.now()}`,
      placeId: "gran-cafe-de-la-parroquia",
      placeName: "Gran Café de la Parroquia (Escaneo Demo Jurado)",
      createdAt: "¡Hace unos segundos!",
      method: "qr",
      pointsAwarded: 50,
      missionTitle: "Misión completada: Tradición y café con el jurado",
    };
    setVisits((prev) => [newVisit, ...prev]);
  };

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Feed de Escaneos en Vivo
            </h3>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              </span>
              En vivo (&lt; 10s)
            </span>
          </div>
          <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            Cada QR validado en un comercio o atractivo urbano se refleja al instante
          </p>
        </div>

        <button
          onClick={handleSimulateJudgeScan}
          className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-teal-700 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs transition hover:bg-teal-800 active:scale-95 dark:bg-teal-600 dark:hover:bg-teal-700"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          <span>Probar escaneo (Demo)</span>
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-100 dark:border-neutral-800">
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {visits.slice(0, 6).map((visit, index) => (
            <div
              key={visit.id}
              className={`flex items-center justify-between p-3.5 transition-colors ${
                index === 0 && visit.id.startsWith("sim-")
                  ? "bg-teal-50/70 animate-pulse dark:bg-teal-950/30"
                  : "hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 border border-teal-100 text-teal-700 dark:bg-teal-950/60 dark:border-teal-900/60 dark:text-teal-300">
                  <QrCodeIcon className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {visit.placeName}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                      QR validado
                    </span>
                  </div>
                  {visit.missionTitle && (
                    <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                      {visit.missionTitle}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block text-xs font-bold text-teal-700 dark:text-teal-400">
                  +{visit.pointsAwarded} pts
                </span>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                  {visit.createdAt}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

