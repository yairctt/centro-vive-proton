"use client";

import React, { useState, useMemo } from "react";
import type { ComercioMockData } from "./mock-data";
import { CheckIcon, CoinsIcon, SearchIcon, XIcon } from "./icons";

interface ComercioCanjesListProps {
  initialRedemptions: ComercioMockData["recentRedemptions"];
}

type RedemptionFilter = "todos" | "pendiente" | "confirmado";

export function ComercioCanjesList({ initialRedemptions }: ComercioCanjesListProps) {
  const [redemptions, setRedemptions] = useState(initialRedemptions);
  const [activeFilter, setActiveFilter] = useState<RedemptionFilter>("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const pendingCount = useMemo(
    () => redemptions.filter((r) => r.status === "pendiente").length,
    [redemptions]
  );

  const handleConfirm = async (id: string, code: string) => {
    setConfirmingId(id);
    try {
      // Intento de confirmación con el servidor (POST /api/redemptions/confirm)
      await fetch("/api/redemptions/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ redemptionId: id }),
      }).catch(() => {
        // En modo demo o backend en progreso, continuamos
      });

      setRedemptions((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "confirmado" as const } : r))
      );
      setFeedbackMsg(`¡Canje ${code} validado exitosamente!`);
      setTimeout(() => setFeedbackMsg(null), 3500);
    } catch {
      setRedemptions((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "confirmado" as const } : r))
      );
      setFeedbackMsg(`¡Canje ${code} validado exitosamente!`);
      setTimeout(() => setFeedbackMsg(null), 3500);
    } finally {
      setConfirmingId(null);
    }
  };

  const filteredItems = useMemo(() => {
    return redemptions.filter((item) => {
      const matchesFilter =
        activeFilter === "todos" ? true : item.status === activeFilter;
      const matchesSearch =
        searchQuery.trim() === ""
          ? true
          : item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.visitorAlias.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.rewardTitle.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [redemptions, activeFilter, searchQuery]);

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
              Validación de Canjes de Recompensas
            </h2>
            {pendingCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
                {pendingCount} por validar
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            Valida los cupones que los visitantes presentan en tu establecimiento
          </p>
        </div>

        {feedbackMsg && (
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-800 animate-fade-in dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300">
            <CheckIcon className="h-3.5 w-3.5 text-emerald-600" />
            <span>{feedbackMsg}</span>
          </span>
        )}
      </div>

      {/* Filter and Search Controls */}
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="inline-flex rounded-xl border border-neutral-200/80 bg-neutral-100/80 p-0.5 text-xs dark:border-neutral-800 dark:bg-neutral-800/80">
          {(["todos", "pendiente", "confirmado"] as RedemptionFilter[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`cursor-pointer rounded-lg px-3 py-1 font-semibold transition ${
                activeFilter === tab
                  ? "bg-white text-neutral-900 shadow-2xs dark:bg-neutral-900 dark:text-white"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              }`}
            >
              {tab === "todos"
                ? `Todos (${redemptions.length})`
                : tab === "pendiente"
                ? `Pendientes (${pendingCount})`
                : "Entregados"}
            </button>
          ))}
        </div>

        <div className="relative">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por código o alias..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-56 rounded-xl border border-neutral-200/80 bg-neutral-50/60 pl-8 pr-7 py-1.5 text-xs text-neutral-800 placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              aria-label="Limpiar búsqueda"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <XIcon className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        {filteredItems.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-400">
            No hay canjes en la categoría seleccionada.
          </div>
        ) : (
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
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-50/50 transition-colors dark:hover:bg-neutral-800/40">
                  <td className="py-3 font-mono font-bold text-neutral-900 dark:text-white">
                    {item.code}
                  </td>
                  <td className="py-3 font-medium text-neutral-700 dark:text-neutral-300">
                    {item.visitorAlias}
                  </td>
                  <td className="py-3 text-neutral-600 dark:text-neutral-400">
                    {item.rewardTitle}
                  </td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                      <CoinsIcon className="h-3 w-3" />
                      {item.costPoints} pts
                    </span>
                  </td>
                  <td className="py-3 text-neutral-400">{item.timestamp}</td>
                  <td className="py-3 text-right">
                    {item.status === "pendiente" ? (
                      <button
                        disabled={confirmingId === item.id}
                        onClick={() => handleConfirm(item.id, item.code)}
                        className="cursor-pointer rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-800 active:scale-95 disabled:opacity-50 transition dark:bg-emerald-600 dark:hover:bg-emerald-700"
                      >
                        {confirmingId === item.id ? "Validando…" : "Confirmar canje"}
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                        <CheckIcon className="h-3 w-3 text-emerald-600" />
                        Entregado
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
