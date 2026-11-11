"use client";

import React, { useState } from "react";
import type { ComercioMockData } from "./mock-data";

interface ComercioCanjesListProps {
  initialRedemptions: ComercioMockData["recentRedemptions"];
}

export function ComercioCanjesList({ initialRedemptions }: ComercioCanjesListProps) {
  const [redemptions, setRedemptions] = useState(initialRedemptions);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const handleConfirm = (id: string, code: string) => {
    setRedemptions((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "confirmado" as const } : r))
    );
    setFeedbackMsg(`¡Canje ${code} confirmado con éxito!`);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-4 flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            Validación de Canjes de Recompensas
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Confirma cuando un visitante presente su código digital de recompensa en el local
          </p>
        </div>

        {feedbackMsg && (
          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 animate-fade-in dark:bg-emerald-950 dark:text-emerald-300">
            ✓ {feedbackMsg}
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-neutral-200 text-neutral-400 uppercase tracking-wider dark:border-neutral-800">
              <th className="pb-3 font-semibold">Código</th>
              <th className="pb-3 font-semibold">Visitante</th>
              <th className="pb-3 font-semibold">Beneficio</th>
              <th className="pb-3 font-semibold">Puntos</th>
              <th className="pb-3 font-semibold">Hora</th>
              <th className="pb-3 text-right font-semibold">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {redemptions.map((item) => (
              <tr key={item.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40">
                <td className="py-3 font-mono font-bold text-neutral-900 dark:text-white">
                  {item.code}
                </td>
                <td className="py-3 font-medium text-neutral-700 dark:text-neutral-300">
                  {item.visitorAlias}
                </td>
                <td className="py-3 text-neutral-600 dark:text-neutral-400">
                  {item.rewardTitle}
                </td>
                <td className="py-3 font-semibold text-amber-600 dark:text-amber-400">
                  {item.costPoints} pts
                </td>
                <td className="py-3 text-neutral-400">{item.timestamp}</td>
                <td className="py-3 text-right">
                  {item.status === "pendiente" ? (
                    <button
                      onClick={() => handleConfirm(item.id, item.code)}
                      className="cursor-pointer rounded-lg bg-emerald-700 px-3 py-1 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-800 active:scale-95 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                    >
                      Confirmar canje
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                      ✓ Entregado
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

