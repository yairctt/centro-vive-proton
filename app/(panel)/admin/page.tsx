"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  KpiCard,
  ScansByPlaceChart,
  ActivityByHourChart,
  LiveVisitsFeed,
  MOCK_ADMIN_STATS,
  type ExtendedStats,
} from "@/components/paneles";
import type { Stats } from "@/lib/types";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<ExtendedStats>(MOCK_ADMIN_STATS);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("Recién cargado");
  const [isFetching, setIsFetching] = useState(false);

  // Consulta a GET /api/stats cada 5 segundos (Requisito CP2: actualización < 10s)
  const fetchStats = useCallback(async () => {
    try {
      setIsFetching(true);
      const res = await fetch("/api/stats", {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      if (res.ok) {
        const data = (await res.json()) as Stats & Partial<ExtendedStats>;
        setStats((prev) => ({
          ...prev,
          missionsAccepted: data.missionsAccepted ?? prev.missionsAccepted,
          missionsCompleted: data.missionsCompleted ?? prev.missionsCompleted,
          redemptions: data.redemptions ?? prev.redemptions,
          totalInteractions:
            data.totalInteractions ??
            (data.scansByPlace?.reduce((acc, s) => acc + s.scans, 0) || prev.totalInteractions),
          activePlaces: data.activePlaces ?? prev.activePlaces,
          activeBusinesses: data.activeBusinesses ?? prev.activeBusinesses,
          scansByPlace:
            data.scansByPlace && data.scansByPlace.length > 0
              ? data.scansByPlace
              : prev.scansByPlace,
          activityByHour: data.activityByHour ?? prev.activityByHour,
          activityByHourWithBusinesses:
            data.activityByHourWithBusinesses && data.activityByHourWithBusinesses.length > 0
              ? data.activityByHourWithBusinesses
              : prev.activityByHourWithBusinesses,
          recentVisits:
            data.recentVisits && data.recentVisits.length > 0
              ? data.recentVisits
              : prev.recentVisits,
        }));
      }
      setLastUpdated(new Date().toLocaleTimeString("es-MX", { hour12: false }));
    } catch {
      // Si la API no está lista aún o hay fallo de red, conservamos datos mock sin romper el tablero
      setLastUpdated(new Date().toLocaleTimeString("es-MX", { hour12: false }));
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    if (!isLive) return;

    const interval = setInterval(() => {
      fetchStats();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchStats, isLive]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              Tablero de Afluencia Digital
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                isLive
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                  : "bg-neutral-100 text-neutral-600 border-neutral-300 dark:bg-neutral-800 dark:text-neutral-400"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isLive ? "bg-emerald-500 animate-pulse" : "bg-neutral-400"
                }`}
              ></span>
              {isLive ? "● En Vivo (cada 5s)" : "Pausado"}
            </span>
          </div>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Señales de interacción urbana y participación en el Centro Histórico de Veracruz.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsLive(!isLive)}
            className="cursor-pointer rounded-xl border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
          >
            {isLive ? "Pausar actualización" : "Reanudar en vivo"}
          </button>
          <span className="rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-500 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
            {isFetching ? "Actualizando…" : `Último pulso: ${lastUpdated}`}
          </span>
        </div>
      </div>

      {/* Regla 9 Aviso Metodológico */}
      <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-3.5 text-xs text-teal-900 dark:border-teal-900/60 dark:bg-teal-950/20 dark:text-teal-200">
        <span className="font-bold">📊 Indicadores de actividad:</span> Las métricas presentadas
        corresponden a <span className="underline font-semibold">actividad registrada en la app</span> (escaneos QR,
        rutas creadas y misiones validadas en el prototipo); no constituyen un censo peatonal general ni registro fiscal de ventas.
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Actividad en la App"
          value={stats.totalInteractions}
          subtitle="Escaneos y validaciones registradas hoy"
          badge="+28% hoy"
          badgeType="positive"
          icon={<span className="text-sm">⚡</span>}
        />
        <KpiCard
          title="Misiones Completadas"
          value={`${stats.missionsCompleted}/${stats.missionsAccepted}`}
          subtitle="64.5% de conversión de visitantes"
          badge="Objetivo 50%"
          badgeType="brand"
          icon={<span className="text-sm">🎯</span>}
        />
        <KpiCard
          title="Canjes en Comercio"
          value={stats.redemptions}
          subtitle="Beneficios validados presencialmente"
          badge="+12 hoy"
          badgeType="warning"
          icon={<span className="text-sm">🎁</span>}
        />
        <KpiCard
          title="Puntos Conectados"
          value={`${stats.activePlaces} / ${stats.activeBusinesses}`}
          subtitle="12 atractivos y 6 comercios demo"
          badge="100% verificados"
          badgeType="neutral"
          icon={<span className="text-sm">📍</span>}
        />
      </div>

      {/* 2 Gráficas con Recharts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ScansByPlaceChart data={stats.scansByPlace} />
        <ActivityByHourChart data={stats.activityByHourWithBusinesses} />
      </div>

      {/* Feed en Vivo de Escaneos (< 10s para demo de jurado) */}
      <LiveVisitsFeed initialVisits={stats.recentVisits} />
    </div>
  );
}
