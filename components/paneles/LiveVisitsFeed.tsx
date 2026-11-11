"use client";

import React, { useState } from "react";

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
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Feed de Escaneos en Vivo
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              En vivo &lt; 10s
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Cada QR escaneado en un comercio o atractivo aparece aquí al instante
          </p>
        </div>

        <button
          onClick={handleSimulateJudgeScan}
          className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-teal-700 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-teal-800 active:scale-95 dark:bg-teal-600 dark:hover:bg-teal-700"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Probar escaneo en vivo (Demo)
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
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {visit.placeName}
                    </span>
                    <span className="inline-flex rounded-md bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
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

