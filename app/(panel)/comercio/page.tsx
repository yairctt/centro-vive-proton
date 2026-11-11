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
  type ComercioMockData,
} from "@/components/paneles";

const COMERCIOS_SELECTOR = [
  { id: "gran-cafe-de-la-parroquia", name: "Gran Café de la Parroquia (Gastronomía)" },
  { id: "mercado-de-artesanias", name: "Mercado de Artesanías (Compras)" },
  { id: "toritos-la-chata", name: "Toritos La Chata (Tradición)" },
];

export default function ComercioPage() {
  const [comercio, setComercio] = useState<ComercioMockData>(MOCK_COMERCIO);
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
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-amber-700 active:scale-95"
          >
            <span>📅</span>
            Publicar Evento
          </button>
        </div>
      </div>

      {/* Vitrina Digital Ficha */}
      <ComercioFicha comercio={comercio} onToggleOpen={handleToggleOpen} />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Visitas QR en Local"
          value={comercio.stats.totalScans}
          subtitle="Escaneos presenciales validados"
          badge="+6 hoy"
          badgeType="positive"
          icon={<span className="text-sm">📍</span>}
        />
        <KpiCard
          title="Misiones Vinculadas"
          value={comercio.stats.activeMissions}
          subtitle="Rutas que traen visitantes aquí"
          badge="Activas"
          badgeType="brand"
          icon={<span className="text-sm">🧭</span>}
        />
        <KpiCard
          title="Canjes Confirmados"
          value={comercio.stats.redemptionsConfirmed}
          subtitle="Beneficios entregados a clientes"
          badge="Efectivos"
          badgeType="warning"
          icon={<span className="text-sm">🎁</span>}
        />
        <KpiCard
          title="Canjes Pendientes"
          value={comercio.stats.pendingRedemptions}
          subtitle="Clientes esperando validación"
          badge={comercio.stats.pendingRedemptions > 0 ? "Por validar" : "Al día"}
          badgeType={comercio.stats.pendingRedemptions > 0 ? "warning" : "neutral"}
          icon={<span className="text-sm">⏳</span>}
        />
      </div>

      {/* 2 Gráficas con Recharts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ComercioHourlyChart data={comercio.hourlyVisits} />
        <ComercioConversionChart data={comercio.conversionData} />
      </div>

      {/* Promociones y Recompensas */}
      <ComercioPromos initialPromotions={comercio.promotions} />

      {/* Lista y Confirmación de Canjes */}
      <ComercioCanjesList initialRedemptions={comercio.recentRedemptions} />

      {/* Modal para publicar evento rápido */}
      <PublishEventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        defaultPlaceName={comercio.name}
      />
    </div>
  );
}
