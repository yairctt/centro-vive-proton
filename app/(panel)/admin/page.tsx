import React from "react";
import type { Metadata } from "next";
import {
  KpiCard,
  ScansByPlaceChart,
  ActivityByHourChart,
  LiveVisitsFeed,
  MOCK_ADMIN_STATS,
} from "@/components/paneles";

export const metadata: Metadata = {
  title: "Tablero de Afluencia Digital · Pulso Jarocho",
  description: "Monitoreo en tiempo real de interacciones, misiones y escaneos en el Centro Histórico de Veracruz",
};

export default function AdminDashboardPage() {
  const stats = MOCK_ADMIN_STATS;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              Tablero de Afluencia Digital
            </h1>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
              ● En Vivo
            </span>
          </div>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Señales de interacción urbana y participación en el Centro Histórico de Veracruz.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
            📅 Hoy: Miércoles 11 Nov (Demo)
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
