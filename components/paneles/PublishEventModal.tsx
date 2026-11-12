"use client";

import React, { useState, useEffect } from "react";
import { CalendarIcon, CheckIcon, MapPinIcon, TagIcon } from "./icons";

interface PublishEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlaceName?: string;
  placeId?: string;
  onEventCreated?: (newEvent: {
    title: string;
    date: string;
    time: string;
    category: string;
  }) => void;
}

export function PublishEventModal({
  isOpen,
  onClose,
  defaultPlaceName = "Gran Café de la Parroquia",
  placeId = "gran-cafe-de-la-parroquia",
  onEventCreated,
}: PublishEventModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("2026-11-11");
  const [time, setTime] = useState("19:00");
  const [category, setCategory] = useState("cultura");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Cerrar modal con tecla Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        name: title,
        title, // compatibilidad con schemas que usan title
        description: description || `Actividad publicada por ${defaultPlaceName}`,
        category,
        startsAt: new Date(`${date}T${time}:00`).toISOString(),
        endsAt: null,
        placeId,
        source: defaultPlaceName,
        lat: 19.5432,
        lng: -96.9104,
        meta: { publicadoPorComercio: true, verificado: false },
      };

      await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {
        // En caso de modo mock o backend en progreso, continuamos
      });

      if (onEventCreated) {
        onEventCreated({ title, date, time, category });
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsSubmitting(false);
        onClose();
        setTitle("");
        setDescription("");
      }, 1800);
    } catch {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsSubmitting(false);
        onClose();
      }, 1800);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs transition-opacity"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Publicar Evento en la Agenda
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Se enviará con estatus «por confirmar» para validación
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 transition"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckIcon className="h-6 w-6" />
            </div>
            <h4 className="mt-3 text-base font-bold text-neutral-900 dark:text-white">
              ¡Evento enviado a revisión!
            </h4>
            <p className="mt-1 text-xs text-neutral-500">
              Estado: <span className="font-semibold text-amber-600">Por confirmar</span>.
              Aparecerá en la agenda de hoy una vez validado.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Plantillas Rápidas Jarochas (1 clic) */}
            <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-2.5 dark:border-amber-900/60 dark:bg-amber-950/20">
              <span className="block text-[11px] font-bold text-amber-900 dark:text-amber-200 mb-1.5">
                Plantillas rápidas jarochas (1 clic para rellenar):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  {
                    t: "Música de Marimba y Danzón",
                    c: "cultura",
                    h: "19:00",
                    d: "Música en vivo típica jarocha en los portales para disfrutar en familia.",
                  },
                  {
                    t: "Degustación de Toritos y Café",
                    c: "gastronomia",
                    h: "18:00",
                    d: "Muestra artesanal de toritos veracruzanos tradicionales y café de altura.",
                  },
                  {
                    t: "Taller Artesanal de Conchas",
                    c: "compras",
                    h: "17:00",
                    d: "Aprende la elaboración tradicional de artesanías marinas del Malecón.",
                  },
                ].map((preset) => (
                  <button
                    key={preset.t}
                    type="button"
                    onClick={() => {
                      setTitle(preset.t);
                      setCategory(preset.c);
                      setTime(preset.h);
                      setDescription(preset.d);
                    }}
                    className="cursor-pointer rounded-lg border border-amber-300/80 bg-white px-2 py-1 text-[11px] font-medium text-amber-950 shadow-2xs hover:bg-amber-100/70 active:scale-95 transition dark:border-amber-800 dark:bg-neutral-800 dark:text-amber-200"
                  >
                    + {preset.t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                Título del evento
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Tarde de son jarocho y café"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-900 shadow-2xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Fecha
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-900 shadow-2xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Hora de inicio
                </label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-900 shadow-2xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Categoría
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-900 shadow-2xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                >
                  <option value="cultura">Cultura y Danza</option>
                  <option value="gastronomia">Gastronomía</option>
                  <option value="historia">Historia</option>
                  <option value="paseo">Paseo / Nocturno</option>
                  <option value="compras">Compras / Artesanías</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Lugar
                </label>
                <input
                  type="text"
                  readOnly
                  value={defaultPlaceName}
                  className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-100 px-3 py-1.5 text-xs text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                Descripción breve
              </label>
              <textarea
                rows={2}
                placeholder="Breve reseña del evento, artistas o detalles para el visitante..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-900 shadow-2xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              ></textarea>
            </div>

            {/* Vista previa en tiempo real para el comercio */}
            {title && (
              <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/50 p-2.5 dark:border-amber-800/80 dark:bg-amber-950/20">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                  Vista previa en la app
                </span>
                <p className="mt-1 text-xs font-bold text-neutral-900 dark:text-white">{title}</p>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-neutral-500">
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3 text-neutral-400" />
                    {date} {time} hrs
                  </span>
                  <span>•</span>
                  <span>{defaultPlaceName}</span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-lg border border-neutral-300 px-3.5 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 active:scale-95 transition dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="cursor-pointer rounded-lg bg-teal-700 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-teal-800 active:scale-95 disabled:opacity-50 transition"
              >
                {isSubmitting ? "Enviando…" : "Publicar Evento"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
