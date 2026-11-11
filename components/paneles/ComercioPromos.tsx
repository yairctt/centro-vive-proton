"use client";

import React, { useState } from "react";
import type { ComercioMockData } from "./mock-data";

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
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            Promociones y Recompensas
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Incentiva la llegada de visitantes canjeando sus puntos acumulados
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-700"
        >
          {showAddForm ? "Cancelar" : "+ Nueva Promoción"}
        </button>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleAddPromo}
          className="mb-4 rounded-xl border border-teal-200 bg-teal-50/50 p-4 dark:border-teal-900/60 dark:bg-teal-950/20"
        >
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
            Publicar Beneficio para el Pasaporte
          </h4>
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
              className="cursor-pointer rounded-lg bg-teal-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-teal-800"
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
            className={`flex flex-col justify-between gap-3 rounded-xl border p-4 transition-all sm:flex-row sm:items-center ${
              promo.active
                ? "border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
                : "border-neutral-200 bg-neutral-50/70 opacity-60 dark:border-neutral-800 dark:bg-neutral-950/40"
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  {promo.title}
                </h3>
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    promo.active
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                      : "bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                  }`}
                >
                  {promo.active ? "Activa" : "Pausada"}
                </span>
              </div>
              <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                {promo.description}
              </p>
              <div className="mt-2 flex items-center gap-3 text-xs text-neutral-500">
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  🪙 {promo.costPoints} puntos
                </span>
                <span>•</span>
                <span>Canjeados: {promo.totalRedeemed}</span>
                <span>•</span>
                <span>{promo.validUntil}</span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => togglePromo(promo.id)}
                className={`cursor-pointer rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                  promo.active
                    ? "border-amber-300 text-amber-800 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-950/30"
                    : "border-emerald-300 text-emerald-800 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950/30"
                }`}
              >
                {promo.active ? "Pausar" : "Reactivar"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
