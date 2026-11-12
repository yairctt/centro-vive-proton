"use client";

import React, { useState } from "react";
import {
  KpiCard,
  ComercioFicha,
  ComercioPromos,
  ComercioCanjesList,
  ComercioHourlyChart,
  ComercioConversionChart,
  PublishEventModal,
  MOCK_COMERCIO,
  CalendarIcon,
  MapPinIcon,
  CompassIcon,
  GiftIcon,
  ClockIcon,
  SparklesIcon,
  ArrowLeftIcon,
  type ComercioMockData,
} from "@/components/paneles";

const COMERCIOS_SELECTOR = [
  { id: "gran-cafe-de-la-parroquia", name: "Gran Café de la Parroquia (Gastronomía)" },
  { id: "mercado-de-artesanias", name: "Mercado de Artesanías (Compras)" },
  { id: "toritos-la-chata", name: "Toritos La Chata (Tradición)" },
];

type ComercioViewTab = "general" | "canjes" | "promos" | "analitica";

export default function ComercioPage() {
  const [comercio, setComercio] = useState<ComercioMockData>(MOCK_COMERCIO);
  const [currentTab, setCurrentTab] = useState<ComercioViewTab>("general");
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const handleToggleOpen = () => {
    setComercio((prev) => ({ ...prev, isOpen: !prev.isOpen }));
  };

  const handleSelectComercio = (id: string) => {
    if (id === "mercado-de-artesanias") {
      setComercio({
        ...MOCK_COMERCIO,
        id: "mercado-de-artesanias",
        name: "Mercado de Artesanías del Malecón",
        category: "Artesanías y Recuerdos",
        hours: "Lun–Dom 09:00–21:00",
        address: "Paseo del Malecón s/n, Col. Centro, Veracruz",
        description: "El punto clásico para recuerdos típicos jarochos, conchas y textiles.",
        stats: {
          totalScans: 19,
          activeMissions: 1,
          redemptionsConfirmed: 6,
          pendingRedemptions: 1,
        },
      });
    } else if (id === "toritos-la-chata") {
      setComercio({
        ...MOCK_COMERCIO,
        id: "toritos-la-chata",
        name: "Toritos La Chata",
        category: "Bebida Tradicional",
        hours: "Mar–Dom 12:00–22:00",
        address: "Calle Mario Molina #142, Col. Centro, Veracruz",
        description: "Bebida artesanal veracruzana de cacahuate, jobo, guanábana y café.",
        stats: {
          totalScans: 15,
          activeMissions: 1,
          redemptionsConfirmed: 4,
          pendingRedemptions: 0,
        },
      });
    } else {
      setComercio(MOCK_COMERCIO);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with selector & action button */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <span className="text-xs font-semibold tracking-wider text-teal-800 uppercase dark:text-teal-400">
            Panel del Establecimiento
          </span>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
            Gestión y Vitrina Comercial
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Commerce Selector */}
          <select
            value={comercio.id}
            onChange={(e) => handleSelectComercio(e.target.value)}
            className="cursor-pointer rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold text-neutral-800 shadow-2xs dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
          >
            {COMERCIOS_SELECTOR.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Quick Publish Event button */}
          <button
            onClick={() => setIsEventModalOpen(true)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-amber-700 active:scale-95 transition"
          >
            <CalendarIcon className="h-4 w-4" />
            <span>Publicar Evento</span>
          </button>
        </div>
      </div>

      {/* Banner de bienvenida comercial con isotipo */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-200/90 bg-gradient-to-r from-amber-700 via-amber-800 to-amber-950 p-5 sm:p-6 text-white shadow-sm dark:border-amber-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="shrink-0 size-14 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xs bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-pulso-jarocho.jpg" alt="Pulso Jarocho" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-200">
                  Comercio Aliado
                </span>
                <span className="text-white/40">•</span>
                <span className="text-xs text-amber-100">Centro Histórico de Veracruz</span>
              </div>
              <h2 className="text-lg font-black tracking-tight text-white mt-0.5">
                {comercio.name}
              </h2>
              <p className="text-xs text-amber-100/90 mt-1 max-w-xl">
                Conecta con visitantes mediante ofertas exclusivas, eventos vivos y validación rápida de canjes en mostrador.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Guía visual paso a paso para el cajero o encargado */}
      <div className="rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-50/90 via-orange-50/50 to-amber-50/80 p-5 shadow-xs dark:border-amber-900/60 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-amber-950/30">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-600 text-xs font-black text-white shadow-2xs">
              ?
            </span>
            <h3 className="text-sm font-bold text-amber-950 dark:text-amber-200">
              ¿Cómo validar un canje en caja? (Guía rápida para el encargado)
            </h3>
          </div>
          <span className="hidden sm:inline-block rounded-full bg-amber-200/60 px-2.5 py-0.5 text-[10px] font-bold text-amber-900 dark:bg-amber-900/60 dark:text-amber-200">
            Fácil y en 3 pasos
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex items-start gap-2.5 rounded-xl bg-white/80 p-3 shadow-2xs dark:bg-neutral-900/70 border border-amber-100 dark:border-amber-900/40">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white">
              1
            </span>
            <div>
              <p className="text-xs font-bold text-neutral-900 dark:text-white">Pide el código</p>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                El visitante te muestra su cupón digital en la pantalla de su teléfono.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl bg-white/80 p-3 shadow-2xs dark:bg-neutral-900/70 border border-amber-100 dark:border-amber-900/40">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white">
              2
            </span>
            <div>
              <p className="text-xs font-bold text-neutral-900 dark:text-white">Búscalo en la lista</p>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                Usa el buscador o ve a la pestaña &ldquo;Canjes en Caja&rdquo; abajo.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl bg-white/80 p-3 shadow-2xs dark:bg-neutral-900/70 border border-amber-100 dark:border-amber-900/40">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
              3
            </span>
            <div>
              <p className="text-xs font-bold text-neutral-900 dark:text-white">Pulsa &ldquo;Confirmar&rdquo;</p>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                Entrega el beneficio y el canje queda registrado al instante.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation View Tabs for Mobile-First UX */}
      <div className="flex items-center gap-1.5 border-b border-neutral-200/80 pb-1.5 overflow-x-auto dark:border-neutral-800">
        {currentTab !== "general" && (
          <button
            type="button"
            onClick={() => setCurrentTab("general")}
            className="inline-flex cursor-pointer shrink-0 items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 shadow-2xs hover:bg-amber-100 active:scale-95 transition dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200"
            title="Regresar a la pestaña Vista General"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5 text-amber-700 dark:text-amber-300" />
            <span>Regresar a Vista General</span>
          </button>
        )}

        {[
          { id: "general", label: "Vista General" },
          {
            id: "canjes",
            label: `Canjes en Caja${comercio.stats.pendingRedemptions > 0 ? ` (${comercio.stats.pendingRedemptions})` : ""}`,
            badge: comercio.stats.pendingRedemptions > 0,
          },
          { id: "promos", label: "Vitrina & Promociones" },
          { id: "analitica", label: "Afluencia & Métricas" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id as ComercioViewTab)}
            className={`cursor-pointer whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
              currentTab === tab.id
                ? "bg-teal-700 text-white shadow-2xs dark:bg-teal-600"
                : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Vitrina Digital Ficha */}
      {(currentTab === "general" || currentTab === "promos") && (
        <ComercioFicha comercio={comercio} onToggleOpen={handleToggleOpen} />
      )}

      {/* KPI Cards Grid */}
      {(currentTab === "general" || currentTab === "analitica") && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Visitas QR en Local"
            value={comercio.stats.totalScans}
            subtitle="Escaneos presenciales validados"
            badge="+6 hoy"
            badgeType="positive"
            progressPercent={65}
            hint="Visitantes en tu local hoy"
            icon={<MapPinIcon className="h-5 w-5" />}
          />
          <KpiCard
            title="Misiones Vinculadas"
            value={comercio.stats.activeMissions}
            subtitle="Rutas que traen visitantes aquí"
            badge="Activas"
            badgeType="brand"
            progressPercent={100}
            hint="Rutas turísticas aliadas"
            icon={<CompassIcon className="h-5 w-5" />}
          />
          <KpiCard
            title="Canjes Confirmados"
            value={comercio.stats.redemptionsConfirmed}
            subtitle="Beneficios entregados a clientes"
            badge="Efectivos"
            badgeType="warning"
            progressPercent={84}
            hint="Cupones canjeados con éxito"
            icon={<GiftIcon className="h-5 w-5" />}
          />
          <KpiCard
            title="Canjes Pendientes"
            value={comercio.stats.pendingRedemptions}
            subtitle="Clientes esperando validación"
            badge={comercio.stats.pendingRedemptions > 0 ? "Por validar" : "Al día"}
            badgeType={comercio.stats.pendingRedemptions > 0 ? "warning" : "neutral"}
            hint="Revisa la lista en caja"
            icon={<ClockIcon className="h-5 w-5" />}
          />
        </div>
      )}

      {/* Tip contextual sobre el Centro de Noche */}
      {(currentTab === "general" || currentTab === "analitica") && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-orange-50/50 p-4 text-xs dark:border-amber-900/60 dark:from-amber-950/40 dark:to-orange-950/20">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-white font-bold text-xs shadow-2xs">
            <SparklesIcon className="h-4 w-4 text-white" />
          </span>
          <div className="space-y-0.5">
            <p className="font-bold text-amber-950 dark:text-amber-200">
              Consejo comercial de Pulso Jarocho:
            </p>
            <p className="text-amber-900/90 dark:text-amber-300/90 leading-relaxed text-[11px]">
              La afluencia en el Centro Histórico se concentra entre las <strong>18:00 y las 21:00 hrs</strong>. Activar una promoción especial con tu café o antojitos durante esas horas duplica los puntos para el visitante y atrae clientes que salen del Malecón.
            </p>
          </div>
        </div>
      )}

      {/* Lista y Confirmación de Canjes (Puesta arriba si se selecciona 'canjes' para prioridad operativa) */}
      {(currentTab === "general" || currentTab === "canjes") && (
        <ComercioCanjesList initialRedemptions={comercio.recentRedemptions} />
      )}

      {/* Promociones y Recompensas */}
      {(currentTab === "general" || currentTab === "promos") && (
        <ComercioPromos initialPromotions={comercio.promotions} />
      )}

      {/* 2 Gráficas con Recharts */}
      {(currentTab === "general" || currentTab === "analitica") && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-2.5">
            <ComercioHourlyChart data={comercio.hourlyVisits} />
            <div className="rounded-xl border border-teal-200/80 bg-teal-50/60 p-3 text-xs text-teal-950 dark:border-teal-900/50 dark:bg-teal-950/30 dark:text-teal-300">
              <span className="font-bold">Consejo de afluencia:</span> Tu pico de visitas registradas es a las 19:00 hrs. Tener preparado tu QR a la vista en la barra o mostrador agiliza el servicio y evita filas.
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            <ComercioConversionChart data={comercio.conversionData} />
            <div className="rounded-xl border border-blue-200/80 bg-blue-50/60 p-3 text-xs text-blue-950 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300">
              <span className="font-bold">Efectividad de tu vitrina:</span> El 76% de los turistas que incluyen tu local en su ruta se presentan físicamente. Publicar una promoción atractiva eleva los canjes en caja.
            </div>
          </div>
        </div>
      )}

      {/* Modal para publicar evento rápido */}
      <PublishEventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        defaultPlaceName={comercio.name}
      />
    </div>
  );
}

