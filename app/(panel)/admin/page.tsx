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
  DownloadIcon,
  type ExtendedStats,
} from "@/components/paneles";
import type { Stats } from "@/lib/types";

type TimeRange = "hoy" | "ayer" | "semana";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<ExtendedStats>(MOCK_ADMIN_STATS);
  const [isLive, setIsLive] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>("hoy");
  const [lastUpdated, setLastUpdated] = useState<string>("Recién cargado");
  const [isFetching, setIsFetching] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

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

  const handleExportCsv = () => {
    const csvContent = [
      ["Lugar", "Escaneos Registrados", "Porcentaje"].join(","),
      ...stats.scansByPlace.map((p) => {
        const pct = stats.totalInteractions > 0
          ? ((p.scans / stats.totalInteractions) * 100).toFixed(1)
          : "0.0";
        return `"${p.placeName}",${p.scans},${pct}%`;
      }),
      [],
      ["Métrica General", "Valor"].join(","),
      ["Interacciones Totales", stats.totalInteractions].join(","),
      ["Misiones Aceptadas", stats.missionsAccepted].join(","),
      ["Misiones Completadas", stats.missionsCompleted].join(","),
      ["Canjes en Comercio", stats.redemptions].join(","),
      ["Lugares Activos", stats.activePlaces].join(","),
      ["Comercios Activos", stats.activeBusinesses].join(","),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `pulso-jarocho-afluencia-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

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

        {/* Action Controls & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time Range Selector */}
          <div className="inline-flex rounded-xl border border-neutral-200/80 bg-neutral-100/80 p-0.5 text-xs dark:border-neutral-800 dark:bg-neutral-800/80">
            {(["hoy", "ayer", "semana"] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`cursor-pointer rounded-lg px-2.5 py-1 font-semibold transition ${
                  timeRange === range
                    ? "bg-white text-neutral-900 shadow-2xs dark:bg-neutral-900 dark:text-white"
                    : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                }`}
              >
                {range === "hoy" ? "Hoy" : range === "ayer" ? "Ayer" : "Semana"}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsLive(!isLive)}
            title={isLive ? "Pausar actualización automática" : "Reanudar actualización en vivo"}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-neutral-300/80 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-50 active:scale-95 transition dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          >
            {isLive ? (
              <>
                <PauseIcon className="h-3.5 w-3.5 text-neutral-500" />
                <span className="hidden sm:inline">Pausar</span>
              </>
            ) : (
              <>
                <PlayIcon className="h-3.5 w-3.5 text-teal-600" />
                <span className="hidden sm:inline">En vivo</span>
              </>
            )}
          </button>

          <button
            onClick={fetchStats}
            title="Actualizar datos ahora"
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-neutral-300/80 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-50 active:scale-95 transition dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
          >
            <RefreshCwIcon className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-teal-600" : "text-neutral-500"}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>

          <button
            onClick={handleExportCsv}
            title="Exportar métricas de afluencia a archivo CSV"
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-teal-800 active:scale-95 transition dark:bg-teal-600 dark:hover:bg-teal-700"
          >
            <DownloadIcon className="h-3.5 w-3.5" />
            <span>{downloadSuccess ? "¡Descargado!" : "Exportar CSV"}</span>
          </button>
        </div>
      </div>

      {/* Banner de Bienvenida y Resumen Ejecutivo Amigable */}
      <div className="rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-800 to-teal-950 p-6 text-white shadow-md">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="space-y-1.5 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-700/60 px-3 py-1 text-xs font-semibold text-teal-200 border border-teal-600/50">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Operación Activa del Centro Histórico
            </span>
            <h2 className="text-xl font-black tracking-tight sm:text-2xl text-white">
              Centro Histórico de Veracruz en Movimiento
            </h2>
            <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
              El flujo digital de visitantes está activo hoy. El <strong>Malecón</strong> y el <strong>Gran Café de la Parroquia</strong> lideran las interacciones. Recuerda que a partir de las <strong>19:00 hrs</strong> entra en vigor el <em>Bono Nocturno</em> para dinamizar los comercios que extienden su horario.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2.5 sm:flex-col sm:items-end">
            <div className="rounded-xl bg-white/10 px-3.5 py-2 backdrop-blur-xs border border-white/10 text-right">
              <span className="block text-[11px] text-teal-200">Tasa de Conversión</span>
              <span className="text-lg font-black text-white">64.5%</span>
            </div>
            <div className="rounded-xl bg-white/10 px-3.5 py-2 backdrop-blur-xs border border-white/10 text-right">
              <span className="block text-[11px] text-teal-200">Lugares con QR</span>
              <span className="text-lg font-black text-white">12 activos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Regla 9 Aviso Metodológico */}
      <div className="flex items-start gap-3 rounded-2xl border border-teal-200/80 bg-teal-50/70 p-4 text-xs text-teal-950 shadow-xs dark:border-teal-900/60 dark:bg-teal-950/30 dark:text-teal-200">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300">
          <InfoIcon className="h-4 w-4" />
        </div>
        <div className="space-y-0.5">
          <p className="font-bold text-teal-950 dark:text-teal-100 text-xs">
            Nota metodológica para jurado y administradores:
          </p>
          <p className="text-teal-800 dark:text-teal-300 leading-relaxed text-[11px]">
            Las métricas presentadas corresponden a <strong className="font-semibold underline">actividad registrada en la app</strong> (escaneos QR, rutas generadas y misiones completadas en el prototipo); no constituyen un censo peatonal general ni registro fiscal de ventas de los comercios.
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
          progressPercent={78}
          hint="Volumen diario de visitas QR"
          icon={<ActivityIcon className="h-5 w-5" />}
        />
        <KpiCard
          title="Misiones Completadas"
          value={`${stats.missionsCompleted}/${stats.missionsAccepted}`}
          subtitle="Visitantes que completaron su recorrido"
          badge="Meta 50%"
          badgeType="brand"
          progressPercent={65}
          hint="Conversión de turistas activos"
          icon={<TargetIcon className="h-5 w-5" />}
        />
        <KpiCard
          title="Canjes en Comercio"
          value={stats.redemptions}
          subtitle="Recompensas validadas presencialmente"
          badge="+12 hoy"
          badgeType="warning"
          progressPercent={42}
          hint="Beneficios entregados en caja"
          icon={<GiftIcon className="h-5 w-5" />}
        />
        <KpiCard
          title="Puntos Conectados"
          value={`${stats.activePlaces} / ${stats.activeBusinesses}`}
          subtitle="12 atractivos y 6 comercios demo"
          badge="100% listos"
          badgeType="neutral"
          hint="Red urbana verificada"
          icon={<BuildingIcon className="h-5 w-5" />}
        />
      </div>

      {/* 2 Gráficas con Recharts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-2.5">
          <ScansByPlaceChart data={stats.scansByPlace} />
          <div className="rounded-xl border border-teal-200/80 bg-teal-50/60 p-3 text-xs text-teal-950 dark:border-teal-900/50 dark:bg-teal-950/30 dark:text-teal-300">
            <span className="font-bold">Interpretación para directores:</span> El Malecón y Los Portales concentran el 62% de las visitas registradas. Programar misiones hacia el Baluarte de Santiago ayuda a redistribuir el flujo hacia comercios del sur del Centro Histórico.
          </div>
        </div>
        <div className="flex flex-col gap-2.5">
          <ActivityByHourChart data={stats.activityByHourWithBusinesses} />
          <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-3 text-xs text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
            <span className="font-bold">Oportunidad de horario nocturno (19:00+):</span> La actividad en la app se mantiene en pico mientras 4 de 6 comercios cierran. El &ldquo;Bono Nocturno&rdquo; premia a los negocios que extienden su horario para captar esta demanda.
          </div>
        </div>
      </div>

      {/* Feed en Vivo de Escaneos (< 10s para demo de jurado) */}
      <LiveVisitsFeed initialVisits={stats.recentVisits} />
    </div>
  );
}
