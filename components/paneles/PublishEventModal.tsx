"use client";

import React, { useState } from "react";

interface PublishEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlaceName?: string;
}

export function PublishEventModal({
  isOpen,
  onClose,
  defaultPlaceName = "Gran Café de la Parroquia",
}: PublishEventModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("2026-11-11");
  const [time, setTime] = useState("19:00");
  const [category, setCategory] = useState("cultura");
  const [description, setDescription] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              Publicar Evento en la Agenda
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Quedará marcado como «por confirmar» hasta revisión del administrador
            </p>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            ✕
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
              ✓
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

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="cursor-pointer rounded-lg bg-teal-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-teal-800"
              >
                Publicar Evento
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
