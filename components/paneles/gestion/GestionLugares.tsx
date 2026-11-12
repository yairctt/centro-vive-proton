"use client";

/** CRUD del catálogo de lugares (solo panel admin). */
import React, { useCallback, useEffect, useState } from "react";
import type { Place } from "@/lib/types";
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
  CATEGORIAS_UI,
} from "./ui";

const FORM_VACIO = {
  nombre: "",
  categoria: "historia",
  descripcion: "",
  lat: "19.2006",
  lng: "-96.1365",
  abre: "",
  cierra: "",
  visitaMin: "30",
  precio: "bajo",
  oportunidad: "0.5",
  verificado: false,
};

export function GestionLugares() {
  const [lugares, setLugares] = useState<Place[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorLista, setErrorLista] = useState<string | null>(null);

  const [editando, setEditando] = useState<Place | "nuevo" | null>(null);
  const [form, setForm] = useState(FORM_VACIO);
  const [enviando, setEnviando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setErrorLista(null);
    try {
      setLugares(await fetchJson<Place[]>("/api/places"));
    } catch (err) {
      setErrorLista(err instanceof Error ? err.message : "No se pudo cargar el catálogo");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const abrirNuevo = () => {
    setForm(FORM_VACIO);
    setErrorForm(null);
    setEditando("nuevo");
  };

  const abrirEdicion = (p: Place) => {
    setForm({
      nombre: p.name,
      categoria: p.category || "historia",
      descripcion: p.description || "",
      lat: String(p.lat),
      lng: String(p.lng),
      abre: p.opensAt ?? "",
      cierra: p.closesAt ?? "",
      visitaMin: String(p.avgVisitMin ?? 30),
      precio: String(p.priceLevel ?? "bajo"),
      oportunidad: String(p.opportunity ?? 0.5),
      verificado: p.verified,
    });
    setErrorForm(null);
    setEditando(p);
  };

  const guardar = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setEnviando(true);
    setErrorForm(null);
    try {
      const cuerpo = {
        name: form.nombre,
        category: form.categoria,
        description: form.descripcion,
        lat: Number(form.lat),
        lng: Number(form.lng),
        opensAt: form.abre || null,
        closesAt: form.cierra || null,
        avgVisitMin: Number(form.visitaMin) || 30,
        priceLevel: form.precio,
        opportunity: Number(form.oportunidad),
        verified: form.verificado,
      };

      if (editando === "nuevo") {
        await fetchJson<Place>("/api/places", { method: "POST", body: JSON.stringify(cuerpo) });
      } else if (editando) {
        await fetchJson<Place>(`/api/places/${editando.id}`, {
          method: "PATCH",
          body: JSON.stringify(cuerpo),
        });
      }
      setEditando(null);
      await cargar();
    } catch (err) {
      setErrorForm(err instanceof Error ? err.message : "No se pudo guardar el lugar");
    } finally {
      setEnviando(false);
    }
  };

  const eliminar = async (p: Place) => {
    try {
      await fetchJson<{ ok: boolean }>(`/api/places/${p.id}`, { method: "DELETE" });
      setLugares((prev) => prev.filter((x) => x.id !== p.id));
    } catch (err) {
      setErrorLista(err instanceof Error ? err.message : "No se pudo eliminar el lugar");
    }
  };

  return (
    <section className="space-y-4">
      <EncabezadoSeccion
        titulo="Catálogo de lugares"
        descripcion="Los puntos del Centro Histórico que alimentan rutas, misiones y QR. Horario sin confirmar → deja «verificado» apagado."
        textoNuevo="Nuevo lugar"
        onNuevo={abrirNuevo}
      />

      <EstadoLista
        cargando={cargando}
        error={errorLista}
        vacio={!cargando && lugares.length === 0}
        textoVacio="No hay lugares en el catálogo todavía."
      />

      <ul className="space-y-2">
        {lugares.map((p) => (
          <li
            key={p.id}
            className="flex flex-col gap-2 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs sm:flex-row sm:items-center sm:justify-between dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-bold text-neutral-900 dark:text-white">{p.name}</p>
                <Chip tono="teal">{p.category}</Chip>
                <Chip tono={p.verified ? "verde" : "ambar"}>
                  {p.verified ? "Verificado" : "Por confirmar"}
                </Chip>
              </div>
              <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                {p.opensAt && p.closesAt ? `${p.opensAt}–${p.closesAt}` : "Horario por confirmar"}
                {" · "}visita ~{p.avgVisitMin ?? 30} min · precio {String(p.priceLevel ?? "bajo")}
                {" · "}({p.lat.toFixed(4)}, {p.lng.toFixed(4)})
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <BotonEditar onClick={() => abrirEdicion(p)} />
              <BotonEliminar onConfirm={() => eliminar(p)} />
            </div>
          </li>
        ))}
      </ul>

      {editando && (
        <ModalGestion
          titulo={editando === "nuevo" ? "Nuevo lugar" : "Editar lugar"}
          subtitulo="Al eliminar un lugar se borran también sus QR, negocios y visitas asociadas."
          onClose={() => setEditando(null)}
        >
          <form onSubmit={guardar} className="space-y-3">
            <Campo label="Nombre">
              <input
                type="text"
                required
                minLength={3}
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Ej. Plazuela de la Campana"
                className={INPUT_CLS}
              />
            </Campo>

            <div className="grid grid-cols-2 gap-3">
              <Campo label="Categoría">
                <select
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                  className={INPUT_CLS}
                >
                  {CATEGORIAS_UI.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo label="Nivel de precio">
                <select
                  value={form.precio}
                  onChange={(e) => setForm({ ...form, precio: e.target.value })}
                  className={INPUT_CLS}
                >
                  <option value="bajo">Bajo</option>
                  <option value="medio">Medio</option>
                  <option value="alto">Alto</option>
                </select>
              </Campo>
            </div>

            <Campo label="Descripción">
              <textarea
                rows={2}
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                className={INPUT_CLS}
              />
            </Campo>

            <div className="grid grid-cols-2 gap-3">
              <Campo label="Latitud">
                <input
                  type="number"
                  required
                  step="any"
                  min={-90}
                  max={90}
                  value={form.lat}
                  onChange={(e) => setForm({ ...form, lat: e.target.value })}
                  className={INPUT_CLS}
                />
              </Campo>
              <Campo label="Longitud">
                <input
                  type="number"
                  required
                  step="any"
                  min={-180}
                  max={180}
                  value={form.lng}
                  onChange={(e) => setForm({ ...form, lng: e.target.value })}
                  className={INPUT_CLS}
                />
              </Campo>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Campo label="Abre (opcional)">
                <input
                  type="time"
                  value={form.abre}
                  onChange={(e) => setForm({ ...form, abre: e.target.value })}
                  className={INPUT_CLS}
                />
              </Campo>
              <Campo label="Cierra (opcional)">
                <input
                  type="time"
                  value={form.cierra}
                  onChange={(e) => setForm({ ...form, cierra: e.target.value })}
                  className={INPUT_CLS}
                />
              </Campo>
              <Campo label="Visita (min)">
                <input
                  type="number"
                  min={5}
                  max={480}
                  value={form.visitaMin}
                  onChange={(e) => setForm({ ...form, visitaMin: e.target.value })}
                  className={INPUT_CLS}
                />
              </Campo>
            </div>

            <Campo label={`Oportunidad (necesidad de visibilidad): ${form.oportunidad}`}>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={form.oportunidad}
                onChange={(e) => setForm({ ...form, oportunidad: e.target.value })}
                className="mt-1 w-full accent-teal-700"
              />
            </Campo>

            <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 dark:text-neutral-300">
              <input
                type="checkbox"
                checked={form.verificado}
                onChange={(e) => setForm({ ...form, verificado: e.target.checked })}
                className="h-4 w-4 rounded border-neutral-300 text-teal-700"
              />
              Datos verificados (horario y ubicación confirmados)
            </label>

            <PieDeFormulario
              onCancelar={() => setEditando(null)}
              enviando={enviando}
              textoEnviar={editando === "nuevo" ? "Crear lugar" : "Guardar cambios"}
              error={errorForm}
            />
          </form>
        </ModalGestion>
      )}
    </section>
  );
}
