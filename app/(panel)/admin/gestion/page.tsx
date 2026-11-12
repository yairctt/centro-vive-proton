"use client";

/**
 * /admin/gestion — CRUD completo del contenido de la app para el administrador:
 * lugares, eventos de la agenda, misiones y recompensas.
 */
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@/components/paneles";
import { GestionLugares } from "@/components/paneles/gestion/GestionLugares";
import { GestionEventos } from "@/components/paneles/gestion/GestionEventos";
import { GestionMisiones } from "@/components/paneles/gestion/GestionMisiones";
import { GestionRecompensas } from "@/components/paneles/gestion/GestionRecompensas";

type Pestana = "lugares" | "eventos" | "misiones" | "recompensas";

const PESTANAS: { id: Pestana; label: string }[] = [
  { id: "lugares", label: "Lugares" },
  { id: "eventos", label: "Eventos" },
  { id: "misiones", label: "Misiones" },
  { id: "recompensas", label: "Recompensas" },
];

export default function AdminGestionPage() {
  const router = useRouter();
  const [pestana, setPestana] = useState<Pestana>("lugares");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="text-xs font-semibold tracking-wider text-teal-800 uppercase dark:text-teal-400">
            Panel de Administración
          </span>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Gestión de contenido</h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Alta, edición y baja de lugares, eventos, misiones y recompensas. Los cambios se reflejan
            al momento en la app del visitante.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="inline-flex cursor-pointer shrink-0 items-center gap-1.5 self-start rounded-xl border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-50 active:scale-95 transition dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
          title="Regresar al Tablero de Afluencia"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span>Regresar al Tablero</span>
        </button>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-neutral-200/80 pb-1 dark:border-neutral-800">
        {PESTANAS.map((t) => (
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

      {pestana === "lugares" && <GestionLugares />}
      {pestana === "eventos" && <GestionEventos modo="admin" />}
      {pestana === "misiones" && <GestionMisiones />}
      {pestana === "recompensas" && <GestionRecompensas modo="admin" />}
    </div>
  );
}
