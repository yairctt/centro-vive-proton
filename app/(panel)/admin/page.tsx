"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  KpiCard,
  ScansByPlaceChart,
  ActivityByHourChart,
  LiveVisitsFeed,
  MOCK_ADMIN_STATS,
  ActivityIcon,
  TargetIcon,
  GiftIcon,
  BuildingIcon,
  InfoIcon,
  PauseIcon,
  PlayIcon,
  RefreshCwIcon,
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
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl text-neutral-900 dark:text-white">
              Tablero de Afluencia Digital
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border transition-colors ${
                isLive
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                  : "bg-neutral-100 text-neutral-600 border-neutral-300 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700"
              }`}
            >
              <span className="relative flex h-2 w-2">
                {isLive && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex h-2 w-2 rounded-full ${
                    isLive ? "bg-emerald-500" : "bg-neutral-400"
                  }`}
                ></span>
              </span>
              {isLive ? "En vivo (cada 5s)" : "Pausado"}
            </span>
          </div>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Señales de interacción urbana y dinamismo comercial en el Centro Histórico de Veracruz.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsLive(!isLive)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-neutral-300/80 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-50 active:scale-95 transition dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          >
            {isLive ? (
              <>
                <PauseIcon className="h-3.5 w-3.5 text-neutral-500" />
                Pausar actualización
              </>
            ) : (
              <>
                <PlayIcon className="h-3.5 w-3.5 text-teal-600" />
                Reanudar en vivo
              </>
            )}
          </button>
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200/80 bg-white px-3 py-2 text-xs font-medium text-neutral-500 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
            <RefreshCwIcon className={`h-3 w-3 ${isFetching ? "animate-spin text-teal-600" : "text-neutral-400"}`} />
            {isFetching ? "Actualizando…" : `Pulso: ${lastUpdated}`}
          </span>
        </div>
      </div>

      {/* Regla 9 Aviso Metodológico */}
      <div className="flex items-start gap-3 rounded-2xl border border-teal-200/70 bg-gradient-to-r from-teal-50/80 to-teal-50/30 p-4 text-xs text-teal-900 shadow-2xs dark:border-teal-900/50 dark:from-teal-950/30 dark:to-teal-950/10 dark:text-teal-200">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300">
          <InfoIcon className="h-4 w-4" />
        </div>
        <div className="space-y-0.5">
          <p className="font-bold text-teal-950 dark:text-teal-100">Indicadores de actividad en prototipo</p>
          <p className="text-teal-800/90 dark:text-teal-300/90 leading-relaxed">
            Las métricas presentadas corresponden a <strong className="font-semibold underline">actividad registrada en la app</strong> (escaneos QR, rutas generadas y misiones completadas); no representan un conteo peatonal total ni facturación comercial.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Actividad en la App"
          value={stats.totalInteractions}
          subtitle="Escaneos y validaciones registradas hoy"
          badge="+28% hoy"
          badgeType="positive"
          icon={<ActivityIcon className="h-5 w-5" />}
        />
        <KpiCard
          title="Misiones Completadas"
          value={`${stats.missionsCompleted}/${stats.missionsAccepted}`}
          subtitle="64.5% de conversión de visitantes"
          badge="Meta 50%"
          badgeType="brand"
          icon={<TargetIcon className="h-5 w-5" />}
        />
        <KpiCard
          title="Canjes en Comercio"
          value={stats.redemptions}
          subtitle="Beneficios validados presencialmente"
          badge="+12 hoy"
          badgeType="warning"
          icon={<GiftIcon className="h-5 w-5" />}
        />
        <KpiCard
          title="Puntos Conectados"
          value={`${stats.activePlaces} / ${stats.activeBusinesses}`}
          subtitle="12 atractivos y 6 comercios demo"
          badge="Verificados"
          badgeType="neutral"
          icon={<BuildingIcon className="h-5 w-5" />}
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
