"use client";

/**
 * /comercio/gestion — gestión real del comercio en sesión:
 * sus eventos de la agenda y sus recompensas canjeables.
 */
import React, { useState } from "react";
import { GestionEventos } from "@/components/paneles/gestion/GestionEventos";
import { GestionRecompensas } from "@/components/paneles/gestion/GestionRecompensas";

type Pestana = "eventos" | "recompensas";

export default function ComercioGestionPage() {
  const [pestana, setPestana] = useState<Pestana>("eventos");

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-semibold tracking-wider text-amber-800 uppercase dark:text-amber-400">
          Panel del Establecimiento
        </span>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Mis eventos y recompensas</h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Publica eventos en la agenda «Hoy en el centro» y administra los beneficios que tus
          clientes canjean con puntos.
        </p>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-neutral-200/80 pb-1 dark:border-neutral-800">
        {(
          [
            { id: "eventos", label: "Mis eventos" },
            { id: "recompensas", label: "Mis recompensas" },
          ] as { id: Pestana; label: string }[]
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setPestana(t.id)}
            className={`cursor-pointer rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
              pestana === t.id
                ? "bg-teal-700 text-white shadow-2xs dark:bg-teal-600"
                : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {pestana === "eventos" && <GestionEventos modo="comercio" />}
      {pestana === "recompensas" && <GestionRecompensas modo="comercio" />}
    </div>
  );
}
