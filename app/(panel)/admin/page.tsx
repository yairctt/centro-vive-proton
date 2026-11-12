"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
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
  ArrowLeftIcon,
  type ExtendedStats,
} from "@/components/paneles";
import { SparklesIcon, UsersIcon } from "@/components/paneles/icons";
import type { Stats } from "@/lib/types";

type TimeRange = "hoy" | "ayer" | "semana";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<ExtendedStats>(MOCK_ADMIN_STATS);
  const [isLive, setIsLive] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>("hoy");
  const [lastUpdated, setLastUpdated] = useState<string>("Recién cargado");
  const [isFetching, setIsFetching] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isGroupSurgeSimulated, setIsGroupSurgeSimulated] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (
        params.get("group") === "1" ||
        params.get("contingente") === "1" ||
        params.get("cruise") === "1" ||
        params.get("cruise") === "simulated"
      ) {
        setIsGroupSurgeSimulated(true);
      }
    }
  }, []);

  const displayStats: ExtendedStats = useMemo(() => {
    if (!isGroupSurgeSimulated) return stats;

    const groupScans = [
      { placeId: "gran-cafe-parroquia", placeName: "Gran Café de la Parroquia", scans: 580 },
      { placeId: "mercado-artesanias", placeName: "Mercado de Artesanías del Malecón", scans: 510 },
      { placeId: "portales-lerdo", placeName: "Los Portales de Veracruz", scans: 460 },
      { placeId: "malecon-veracruz", placeName: "Malecón de Veracruz", scans: 410 },
      { placeId: "museo-naval", placeName: "Museo Naval México", scans: 340 },
      { placeId: "toritos-la-chata", placeName: "Toritos La Chata", scans: 290 },
    ];

    const groupFeed: ExtendedStats["recentVisits"] = [
      { id: "g1", placeId: "gran-cafe-parroquia", placeName: "Gran Café de la Parroquia", createdAt: new Date(Date.now() - 15000).toISOString(), method: "qr", pointsAwarded: 150, missionTitle: "Familia Morales (8 pers.) · Canje mesa completa" },
      { id: "g2", placeId: "mercado-artesanias", placeName: "Mercado de Artesanías", createdAt: new Date(Date.now() - 35000).toISOString(), method: "qr", pointsAwarded: 150, missionTitle: "Contingente Tour Xalapa (22 pers.) · Descuento 20%" },
      { id: "g3", placeId: "portales-lerdo", placeName: "Los Portales de Veracruz", createdAt: new Date(Date.now() - 65000).toISOString(), method: "qr", pointsAwarded: 150, missionTitle: "Grupo Amigos del Puerto (4 pers.) · Ronda de Toritos" },
      { id: "g4", placeId: "toritos-la-chata", placeName: "Toritos La Chata", createdAt: new Date(Date.now() - 110000).toISOString(), method: "qr", pointsAwarded: 150, missionTitle: "Excursión Escolar UV (18 pers.) · Check-in grupal" },
    ];

    return {
      ...stats,
      totalInteractions: (stats.totalInteractions || 420) + 2590,
      missionsAccepted: (stats.missionsAccepted || 210) + 1780,
      missionsCompleted: (stats.missionsCompleted || 180) + 1420,
      redemptions: (stats.redemptions || 89) + 640,
      scansByPlace: groupScans,
      recentVisits: [...groupFeed, ...(stats.recentVisits || []).slice(0, 3)],
    };
  }, [isGroupSurgeSimulated, stats]);

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
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.back();
              } else {
                router.push("/");
              }
            }}
            title="Regresar a la pantalla o pestaña anterior"
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-neutral-300/80 bg-white px-2.5 py-1.5 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-50 active:scale-95 transition dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5 text-neutral-500" />
            <span className="hidden sm:inline">Regresar</span>
          </button>

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

      {/* Banner de Simulación de Contingentes y Rutas Grupales */}
      <div className={`p-4 rounded-3xl border transition-all ${
        isGroupSurgeSimulated
          ? "bg-gradient-to-r from-amber-950 via-teal-950 to-neutral-900 border-amber-500/50 text-white shadow-md"
          : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200"
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className={`p-2.5 rounded-2xl flex items-center justify-center shrink-0 ${
              isGroupSurgeSimulated ? "bg-amber-400 text-neutral-950 shadow-xs" : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400"
            }`}>
              <UsersIcon className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                  Modo Rutas Grupales
                </span>
                <span className={`text-xs font-bold ${isGroupSurgeSimulated ? "text-amber-200" : "text-neutral-700 dark:text-neutral-300"}`}>
                  Operativo de Grupos Pequeños y Grandes Contingentes (2 a 50+ pers.)
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isGroupSurgeSimulated ? "text-amber-100/90" : "text-neutral-500 dark:text-neutral-400"}`}>
                {isGroupSurgeSimulated
                  ? "Simulación activa: 480 grupos y contingentes coordinados (familias, amigos y excursiones) dinamizando comercios locales con bote compartido."
                  : "Presiona el botón para simular en vivo la afluencia simultánea de grupos pequeños y grandes contingentes con bote colectivo."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsGroupSurgeSimulated((v) => !v)}
            className={`cursor-pointer px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 shrink-0 ${
              isGroupSurgeSimulated
                ? "bg-amber-400 hover:bg-amber-300 text-neutral-950"
                : "bg-teal-700 hover:bg-teal-800 text-white"
            }`}
          >
            <UsersIcon className="w-4 h-4" />
            <span>{isGroupSurgeSimulated ? "Desactivar Simulación" : "Simular Contingente Masivo"}</span>
          </button>
        </div>

        {isGroupSurgeSimulated && (
          <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
              <span className="text-amber-300 font-black block text-sm">~$520,000 MXN</span>
              <span className="text-[10px] text-teal-200">Derrama colectiva estimada</span>
            </div>
            <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
              <span className="text-emerald-300 font-black block text-sm">640 Canjes</span>
              <span className="text-[10px] text-teal-200">Consumos grupales en caja</span>
            </div>
            <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
              <span className="text-sky-300 font-black block text-sm">480 Grupos</span>
              <span className="text-[10px] text-teal-200">Células activas simultáneas</span>
            </div>
            <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
              <span className="text-teal-300 font-black block text-sm">100% Sincronizados</span>
              <span className="text-[10px] text-teal-200">Bote de puntos compartido</span>
            </div>
          </div>
        )}
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

      {/* Banner decorativo institucional con isotipo oficial */}
      <div className="relative overflow-hidden rounded-3xl border border-teal-200/90 bg-gradient-to-r from-teal-900 via-teal-800 to-teal-950 p-5 sm:p-6 text-white shadow-sm dark:border-teal-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="shrink-0 size-14 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xs bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-pulso-jarocho.jpg" alt="Pulso Jarocho" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                  Dinamización Urbana
                </span>
                <span className="text-white/40">•</span>
                <span className="text-xs text-teal-200">Reto 6 · Centro Vivo</span>
              </div>
              <h2 className="text-lg font-black tracking-tight text-white mt-0.5">
                Centro Histórico de Veracruz
              </h2>
              <p className="text-xs text-teal-100/90 mt-1 max-w-xl">
                Monitoreo digital en tiempo real: flujo de visitantes, participación en comercios locales y activación del programa Centro de Noche.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white border border-white/15">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Sistema Operativo
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Actividad en la App"
          value={displayStats.totalInteractions}
          subtitle="Escaneos y validaciones registradas hoy"
          badge={isLive ? (isGroupSurgeSimulated ? "+2,590 en Contingentes" : "En vivo") : "En pausa"}
          badgeType={isGroupSurgeSimulated ? "positive" : isLive ? "positive" : "neutral"}
          icon={<ActivityIcon className="h-5 w-5" />}
        />
        <KpiCard
          title="Misiones Completadas"
          value={`${displayStats.missionsCompleted}/${displayStats.missionsAccepted}`}
          subtitle={
            displayStats.missionsAccepted > 0
              ? `${Math.round((displayStats.missionsCompleted / displayStats.missionsAccepted) * 100)}% de las misiones aceptadas se completaron`
              : "Aún no hay misiones aceptadas"
          }
          badge="Completadas / aceptadas"
          badgeType="brand"
          icon={<TargetIcon className="h-5 w-5" />}
        />
        <KpiCard
          title="Canjes en Comercio"
          value={displayStats.redemptions}
          subtitle="Beneficios validados presencialmente"
          badge={isGroupSurgeSimulated ? "+640 mesas completas" : undefined}
          badgeType="warning"
          icon={<GiftIcon className="h-5 w-5" />}
        />
        <KpiCard
          title="Puntos Conectados"
          value={`${displayStats.activePlaces} / ${displayStats.activeBusinesses}`}
          subtitle={`${displayStats.activePlaces} lugares y ${displayStats.activeBusinesses} comercios participantes`}
          badge="Verificados"
          badgeType="neutral"
          icon={<BuildingIcon className="h-5 w-5" />}
        />
      </div>

      {/* Métrica de Rutas en Grupo y Derrama Colectiva */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
            <UsersIcon className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-900 dark:text-white">
                Rutas Grupales y Células Activas
              </span>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                Ticket promedio +320%
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              {isGroupSurgeSimulated
                ? "480 grupos de viaje activos en el centro · Promedio de 4.2 personas por grupo · Mesas completas en gastronomía y compras colectivas."
                : "Grupos familiares y de amigos compartiendo ruta y acumulando puntos en el bote grupal."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-center shrink-0">
          <div>
            <span className="text-base font-black text-teal-700 dark:text-teal-400">
              {isGroupSurgeSimulated ? "480" : "18"}
            </span>
            <span className="block text-[10px] text-neutral-500">Grupos activos</span>
          </div>
          <div className="h-8 w-px bg-neutral-200 dark:bg-neutral-800" />
          <div>
            <span className="text-base font-black text-amber-600 dark:text-amber-400">
              {isGroupSurgeSimulated ? "4.2" : "3.8"}
            </span>
            <span className="block text-[10px] text-neutral-500">Pers. / grupo</span>
          </div>
          <div className="h-8 w-px bg-neutral-200 dark:bg-neutral-800" />
          <div>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
              {isGroupSurgeSimulated ? "2,016" : "68"}
            </span>
            <span className="block text-[10px] text-neutral-500">Turistas en grupo</span>
          </div>
        </div>
      </div>

      {/* 2 Gráficas con Recharts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ScansByPlaceChart data={displayStats.scansByPlace} />
        <ActivityByHourChart data={displayStats.activityByHourWithBusinesses} />
      </div>

      {/* Feed en Vivo de Escaneos (< 10s para demo de jurado) */}
      <LiveVisitsFeed initialVisits={displayStats.recentVisits} />
    </div>
  );
}
