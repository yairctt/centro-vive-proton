"use client";

/** CRUD de misiones (solo panel admin). Los puntos se otorgan siempre en el servidor. */
import React, { useCallback, useEffect, useState } from "react";
import type { Mission, Place } from "@/lib/types";
import {
  Campo,
  Chip,
  ModalGestion,
  PieDeFormulario,
  BotonEditar,
  BotonEliminar,
  EncabezadoSeccion,
  EstadoLista,
  fetchJson,
  INPUT_CLS,
} from "./ui";

type MisionConLugar = Mission & { placeName?: string };

const FORM_VACIO = {
  titulo: "",
  descripcion: "",
  placeId: "",
  puntos: "10",
  bonoNocturno: false,
  activa: true,
};

export function GestionMisiones() {
  const [misiones, setMisiones] = useState<MisionConLugar[]>([]);
  const [lugares, setLugares] = useState<Place[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorLista, setErrorLista] = useState<string | null>(null);

  const [editando, setEditando] = useState<MisionConLugar | "nuevo" | null>(null);
  const [form, setForm] = useState(FORM_VACIO);
  const [enviando, setEnviando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setErrorLista(null);
    try {
      const [lista, catalogo] = await Promise.all([
        fetchJson<MisionConLugar[]>("/api/missions"),
        fetchJson<Place[]>("/api/places"),
      ]);
      setMisiones(lista);
      setLugares(catalogo);
    } catch (err) {
      setErrorLista(err instanceof Error ? err.message : "No se pudieron cargar las misiones");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const abrirNuevo = () => {
    setForm({ ...FORM_VACIO, placeId: lugares[0]?.id ?? "" });
    setErrorForm(null);
    setEditando("nuevo");
  };

  const abrirEdicion = (m: MisionConLugar) => {
    setForm({
      titulo: m.title,
      descripcion: m.description ?? m.rules ?? "",
      placeId: m.placeId,
      puntos: String(m.points),
      bonoNocturno: Boolean(m.nightBonus),
      activa: m.active !== false,
    });
    setErrorForm(null);
    setEditando(m);
  };

  const guardar = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setEnviando(true);
    setErrorForm(null);
    try {
      const cuerpo = {
        title: form.titulo,
        description: form.descripcion,
        placeId: form.placeId,
        points: Number(form.puntos) || 10,
        nightBonus: form.bonoNocturno,
        active: form.activa,
      };
      if (editando === "nuevo") {
        await fetchJson<Mission>("/api/missions", { method: "POST", body: JSON.stringify(cuerpo) });
      } else if (editando) {
        await fetchJson<Mission>(`/api/missions/${editando.id}`, {
          method: "PATCH",
          body: JSON.stringify(cuerpo),
        });
      }
      setEditando(null);
      await cargar();
    } catch (err) {
      setErrorForm(err instanceof Error ? err.message : "No se pudo guardar la misión");
    } finally {
      setEnviando(false);
    }
  };

  const eliminar = async (m: MisionConLugar) => {
    try {
      await fetchJson<{ ok: boolean }>(`/api/missions/${m.id}`, { method: "DELETE" });
      setMisiones((prev) => prev.filter((x) => x.id !== m.id));
    } catch (err) {
      setErrorLista(err instanceof Error ? err.message : "No se pudo eliminar la misión");
    }
  };

  return (
    <section className="space-y-4">
      <EncabezadoSeccion
        titulo="Misiones"
        descripcion="Retos que el visitante completa escaneando el QR del lugar. El bono nocturno suma extra después de las 19:00."
        textoNuevo="Nueva misión"
        onNuevo={abrirNuevo}
      />

      <EstadoLista
        cargando={cargando}
        error={errorLista}
        vacio={!cargando && misiones.length === 0}
        textoVacio="No hay misiones configuradas todavía."
      />

      <ul className="space-y-2">
        {misiones.map((m) => (
          <li
            key={m.id}
            className="flex flex-col gap-2 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs sm:flex-row sm:items-center sm:justify-between dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-bold text-neutral-900 dark:text-white">{m.title}</p>
                <Chip tono={m.active !== false ? "verde" : "neutro"}>
                  {m.active !== false ? "Activa" : "Pausada"}
                </Chip>
                {m.nightBonus && <Chip tono="ambar">Centro de noche</Chip>}
              </div>
              <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                {m.points} pts · {m.placeName || "Sin lugar"}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <BotonEditar onClick={() => abrirEdicion(m)} />
              <BotonEliminar onConfirm={() => eliminar(m)} />
            </div>
          </li>
        ))}
      </ul>

      {editando && (
        <ModalGestion
          titulo={editando === "nuevo" ? "Nueva misión" : "Editar misión"}
          onClose={() => setEditando(null)}
        >
          <form onSubmit={guardar} className="space-y-3">
            <Campo label="Título">
              <input
                type="text"
                required
                minLength={3}
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                placeholder="Ej. Prueba un torito de cacahuate"
                className={INPUT_CLS}
              />
            </Campo>

            <Campo label="Descripción">
              <textarea
                rows={2}
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                placeholder="Qué debe hacer el visitante para completarla"
                className={INPUT_CLS}
              />
            </Campo>

            <div className="grid grid-cols-2 gap-3">
              <Campo label="Lugar">
                <select
                  required
                  value={form.placeId}
                  onChange={(e) => setForm({ ...form, placeId: e.target.value })}
                  className={INPUT_CLS}
                >
                  <option value="" disabled>
                    Elige un lugar…
                  </option>
                  {lugares.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo label="Puntos">
                <input
                  type="number"
                  required
                  min={1}
                  max={1000}
                  value={form.puntos}
                  onChange={(e) => setForm({ ...form, puntos: e.target.value })}
                  className={INPUT_CLS}
                />
              </Campo>
            </div>

            <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 dark:text-neutral-300">
              <input
                type="checkbox"
                checked={form.bonoNocturno}
                onChange={(e) => setForm({ ...form, bonoNocturno: e.target.checked })}
                className="h-4 w-4 rounded border-neutral-300 text-teal-700"
              />
              Bono nocturno (puntos extra después de las 19:00)
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 dark:text-neutral-300">
              <input
                type="checkbox"
                checked={form.activa}
                onChange={(e) => setForm({ ...form, activa: e.target.checked })}
                className="h-4 w-4 rounded border-neutral-300 text-teal-700"
              />
              Misión activa (visible para los visitantes)
            </label>

            <PieDeFormulario
              onCancelar={() => setEditando(null)}
              enviando={enviando}
              textoEnviar={editando === "nuevo" ? "Crear misión" : "Guardar cambios"}
              error={errorForm}
            />
          </form>
        </ModalGestion>
      )}
    </section>
  );
}
