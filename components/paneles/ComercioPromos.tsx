"use client";

import React, { useState } from "react";
import type { ComercioMockData } from "./mock-data";
import { CoinsIcon, PlusIcon, TagIcon } from "./icons";

interface ComercioPromosProps {
  initialPromotions: ComercioMockData["promotions"];
}

export function ComercioPromos({ initialPromotions }: ComercioPromosProps) {
  const [promos, setPromos] = useState(initialPromotions);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPoints, setNewPoints] = useState(50);
  const [newDesc, setNewDesc] = useState("");

  const togglePromo = (id: string) => {
    setPromos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
  };

  const handleAddPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newEntry = {
      id: `promo-${Date.now()}`,
      title: newTitle,
      description: newDesc || "Promoción especial para visitantes de Pulso Jarocho.",
      costPoints: Number(newPoints),
      active: true,
      validUntil: "Vigencia hoy",
      totalRedeemed: 0,
    };

    setPromos([newEntry, ...promos]);
    setNewTitle("");
    setNewDesc("");
    setShowAddForm(false);
  };

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            Promociones y Recompensas
          </h2>
          <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            Incentiva la llegada de visitantes canjeando sus puntos acumulados en el pasaporte
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-teal-800 active:scale-95 transition dark:bg-teal-600 dark:hover:bg-teal-700"
        >
          {showAddForm ? (
            "Cancelar"
          ) : (
            <>
              <PlusIcon className="h-3.5 w-3.5" />
              <span>Nueva Promoción</span>
            </>
          )}
        </button>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleAddPromo}
          className="mb-4 rounded-xl border border-teal-200/80 bg-teal-50/40 p-4 dark:border-teal-900/60 dark:bg-teal-950/20"
        >
          <div className="mb-2.5 flex items-center gap-1.5">
            <TagIcon className="h-4 w-4 text-teal-700 dark:text-teal-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
              Publicar Beneficio para el Pasaporte
            </h4>
          </div>

          {/* Plantillas Rápidas para el comerciante */}
          <div className="mb-3 rounded-lg border border-teal-200/80 bg-white/80 p-2 text-xs dark:border-teal-800 dark:bg-neutral-800/80">
            <span className="block text-[11px] font-bold text-teal-900 dark:text-teal-200 mb-1">
              Plantillas rápidas para tu negocio (1 clic):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { t: "15% de descuento en café y postres", pts: 40, d: "En consumo mínimo de $120. Válido una vez por visitante." },
                { t: "Torito de cortesía en tu consumo", pts: 60, d: "Degustación de 2 oz en el consumo de alimentos o recuerdos." },
                { t: "Recuerdo artesanal jarocho gratis", pts: 50, d: "Llavero o postal de Veracruz en compras mayores a $150." },
              ].map((tpl) => (
                <button
                  key={tpl.t}
                  type="button"
                  onClick={() => {
                    setNewTitle(tpl.t);
                    setNewPoints(tpl.pts);
                    setNewDesc(tpl.d);
                  }}
                  className="cursor-pointer rounded-md border border-teal-300 bg-teal-50 px-2 py-0.5 text-[11px] font-medium text-teal-800 hover:bg-teal-100 transition active:scale-95 dark:border-teal-700 dark:bg-teal-950 dark:text-teal-200"
                >
                  + {tpl.t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                Título del beneficio
              </label>
              <input
                type="text"
                required
                placeholder="Ej. 15% de descuento en bebidas"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-900 shadow-2xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                Costo en puntos del pasaporte
              </label>
              <input
                type="number"
                min={10}
                max={500}
                value={newPoints}
                onChange={(e) => setNewPoints(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-900 shadow-2xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                Condiciones y restricciones
              </label>
              <input
                type="text"
                placeholder="Ej. En consumo mínimo de $150. Válido una vez por visitante."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-900 shadow-2xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              className="cursor-pointer rounded-lg bg-teal-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-teal-800 active:scale-95 transition"
            >
              Guardar Promoción
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {promos.map((promo) => (
          <div
            key={promo.id}
            className={`flex flex-col justify-between gap-4 rounded-2xl border p-5 transition-all sm:flex-row sm:items-center ${
              promo.active
                ? "border-amber-200/90 bg-gradient-to-r from-amber-50/40 via-white to-amber-50/20 shadow-xs dark:border-neutral-800 dark:bg-neutral-900"
                : "border-neutral-200 bg-neutral-50/60 opacity-60 dark:border-neutral-800 dark:bg-neutral-950/40"
            }`}
          >
            <div className="space-y-1.5 max-w-xl">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  {promo.title}
                </h3>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                    promo.active
                      ? "bg-emerald-100/90 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                      : "bg-neutral-200 text-neutral-600 border-neutral-300 dark:bg-neutral-800 dark:text-neutral-400"
                  }`}
                >
                  {promo.active ? "Promoción Activa" : "Pausada"}
                </span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {promo.description}
              </p>
              <div className="flex flex-wrap items-center gap-2.5 text-xs text-neutral-500 pt-1">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-100/80 px-2 py-0.5 font-bold text-amber-900 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
                  <CoinsIcon className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" />
                  <span>{promo.costPoints} puntos del pasaporte</span>
                </span>
                <span className="text-neutral-300 dark:text-neutral-700">•</span>
                <span className="font-medium text-neutral-600 dark:text-neutral-400">
                  Canjeados: <strong>{promo.totalRedeemed} veces</strong>
                </span>
                <span className="text-neutral-300 dark:text-neutral-700">•</span>
                <span className="text-neutral-500">{promo.validUntil}</span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => togglePromo(promo.id)}
                className={`cursor-pointer rounded-xl border px-4 py-2 text-xs font-bold transition shadow-2xs active:scale-95 ${
                  promo.active
                    ? "border-amber-300 bg-white text-amber-900 hover:bg-amber-50 dark:border-amber-800 dark:bg-neutral-800 dark:text-amber-300 dark:hover:bg-amber-950/40"
                    : "border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                }`}
              >
                {promo.active ? "Pausar cupón" : "Activar cupón"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

