"use client";

/**
 * CRUD de eventos de la agenda. modo="admin": todos los eventos y verificación.
 * modo="comercio": solo los eventos de los lugares del comercio en sesión.
 */
import React, { useCallback, useEffect, useState } from "react";
import type { Event, Place, Business } from "@/lib/types";
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
  isoALocal,
  localAIso,
  INPUT_CLS,
  CATEGORIAS_UI,
} from "./ui";

interface Props {
  modo: "admin" | "comercio";
}

interface OpcionLugar {
  id: string;
  nombre: string;
}

const FORM_VACIO = {
  titulo: "",
  placeId: "",
  fecha: "",
  horaInicio: "19:00",
  horaFin: "",
  categoria: "cultura",
  descripcion: "",
  fuente: "",
  verificado: false,
};

export function GestionEventos({ modo }: Props) {
  const [eventos, setEventos] = useState<Event[]>([]);
  const [lugares, setLugares] = useState<OpcionLugar[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorLista, setErrorLista] = useState<string | null>(null);

  const [editando, setEditando] = useState<Event | "nuevo" | null>(null);
  const [form, setForm] = useState(FORM_VACIO);
  const [enviando, setEnviando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setErrorLista(null);
    try {
      const [listaEventos, opciones] = await Promise.all([
        fetchJson<Event[]>("/api/events?when=all"),
        modo === "admin"
          ? fetchJson<Place[]>("/api/places").then((ps) =>
              ps.map((p) => ({ id: p.id, nombre: p.name })),
            )
          : fetchJson<Business[]>("/api/me/businesses").then((ns) =>
              ns.map((n) => ({ id: n.placeId, nombre: n.name })),
            ),
      ]);
      setLugares(opciones);
      const propios = new Set(opciones.map((o) => o.id));
      setEventos(
        (modo === "admin"
          ? listaEventos
          : listaEventos.filter((e) => e.placeId && propios.has(e.placeId))
        ).sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
      );
    } catch (err) {
      setErrorLista(err instanceof Error ? err.message : "No se pudo cargar la agenda");
    } finally {
      setCargando(false);
    }
  }, [modo]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const abrirNuevo = () => {
    const hoy = isoALocal(new Date().toISOString()).fecha;
    setForm({ ...FORM_VACIO, fecha: hoy, placeId: lugares[0]?.id ?? "" });
    setErrorForm(null);
    setEditando("nuevo");
  };

  const abrirEdicion = (e: Event) => {
    const inicio = isoALocal(e.startsAt);
    const fin = isoALocal(e.endsAt);
    setForm({
      titulo: e.name || e.title || "",
      placeId: e.placeId ?? "",
      fecha: inicio.fecha,
      horaInicio: inicio.hora,
      horaFin: fin.hora,
      categoria: e.category || "cultura",
      descripcion: e.description || "",
      fuente: e.source || "",
      verificado: e.verified,
    });
    setErrorForm(null);
    setEditando(e);
  };

  const guardar = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setEnviando(true);
    setErrorForm(null);
    try {
      const startsAt = localAIso(form.fecha, form.horaInicio);
      if (!startsAt) throw new Error("Falta la fecha u hora de inicio");
      const cuerpo: Record<string, unknown> = {
        title: form.titulo,
        placeId: form.placeId,
        category: form.categoria,
        startsAt,
        endsAt: form.horaFin ? localAIso(form.fecha, form.horaFin) : null,
        description: form.descripcion,
      };
      if (form.fuente) cuerpo.source = form.fuente;
      if (modo === "admin" && editando !== "nuevo") cuerpo.verified = form.verificado;

      if (editando === "nuevo") {
        await fetchJson<Event>("/api/events", { method: "POST", body: JSON.stringify(cuerpo) });
      } else if (editando) {
        await fetchJson<Event>(`/api/events/${editando.id}`, {
          method: "PATCH",
          body: JSON.stringify(cuerpo),
        });
      }
      setEditando(null);
      await cargar();
    } catch (err) {
      setErrorForm(err instanceof Error ? err.message : "No se pudo guardar el evento");
    } finally {
      setEnviando(false);
    }
  };

  const eliminar = async (e: Event) => {
    try {
      await fetchJson<{ ok: boolean }>(`/api/events/${e.id}`, { method: "DELETE" });
      setEventos((prev) => prev.filter((x) => x.id !== e.id));
    } catch (err) {
      setErrorLista(err instanceof Error ? err.message : "No se pudo eliminar el evento");
    }
  };

  const alternarVerificado = async (e: Event) => {
    try {
      const actualizado = await fetchJson<Event>(`/api/events/${e.id}`, {
        method: "PATCH",
        body: JSON.stringify({ verified: !e.verified }),
      });
      setEventos((prev) => prev.map((x) => (x.id === e.id ? { ...x, verified: actualizado.verified } : x)));
    } catch (err) {
      setErrorLista(err instanceof Error ? err.message : "No se pudo actualizar el evento");
    }
  };

  const nombreLugar = (e: Event) =>
    e.place?.name ?? lugares.find((l) => l.id === e.placeId)?.nombre ?? "Sin lugar";

  return (
    <section className="space-y-4">
      <EncabezadoSeccion
        titulo="Agenda de eventos"
        descripcion={
          modo === "admin"
            ? "Toda la agenda del centro. Los eventos nuevos entran «por confirmar» hasta que los verifiques."
            : "Los eventos de tus locales. Se publican «por confirmar» y un administrador los verifica."
        }
        textoNuevo="Nuevo evento"
        onNuevo={abrirNuevo}
      />

      <EstadoLista
        cargando={cargando}
        error={errorLista}
        vacio={!cargando && eventos.length === 0}
        textoVacio="Aún no hay eventos en la agenda. Publica el primero con «Nuevo evento»."
      />

      <ul className="space-y-2">
        {eventos.map((e) => (
          <li
            key={e.id}
            className="flex flex-col gap-2 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs sm:flex-row sm:items-center sm:justify-between dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-bold text-neutral-900 dark:text-white">
                  {e.name || e.title}
                </p>
                <Chip tono={e.verified ? "verde" : "ambar"}>
                  {e.verified ? "Verificado" : "Por confirmar"}
                </Chip>
                <Chip tono="teal">{e.category}</Chip>
              </div>
              <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                {new Date(e.startsAt).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })}
                {e.endsAt
                  ? ` – ${new Date(e.endsAt).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}`
                  : ""}
                {" · "}
                {nombreLugar(e)}
                {e.source ? ` · fuente: ${e.source}` : ""}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              {modo === "admin" && (
                <button
                  onClick={() => alternarVerificado(e)}
                  className="cursor-pointer rounded-lg border border-emerald-200 px-2 py-1 text-[11px] font-medium text-emerald-700 transition hover:bg-emerald-50 active:scale-95 dark:border-emerald-900/60 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                >
                  {e.verified ? "Quitar verificación" : "Verificar"}
                </button>
              )}
              <BotonEditar onClick={() => abrirEdicion(e)} />
              <BotonEliminar onConfirm={() => eliminar(e)} />
            </div>
          </li>
        ))}
      </ul>

      {editando && (
        <ModalGestion
          titulo={editando === "nuevo" ? "Publicar evento" : "Editar evento"}
          subtitulo={
            modo === "comercio"
              ? "Se enviará con estatus «por confirmar» para validación"
              : undefined
          }
          onClose={() => setEditando(null)}
        >
          <form onSubmit={guardar} className="space-y-3">
            <Campo label="Título del evento">
              <input
                type="text"
                required
                minLength={3}
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                placeholder="Ej. Tarde de son jarocho y café"
                className={INPUT_CLS}
              />
            </Campo>

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
                    {l.nombre}
                  </option>
                ))}
              </select>
            </Campo>

            <div className="grid grid-cols-3 gap-3">
              <Campo label="Fecha">
                <input
                  type="date"
                  required
                  value={form.fecha}
                  onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                  className={INPUT_CLS}
                />
              </Campo>
              <Campo label="Inicio">
                <input
                  type="time"
                  required
                  value={form.horaInicio}
                  onChange={(e) => setForm({ ...form, horaInicio: e.target.value })}
                  className={INPUT_CLS}
                />
              </Campo>
              <Campo label="Fin (opcional)">
                <input
                  type="time"
                  value={form.horaFin}
                  onChange={(e) => setForm({ ...form, horaFin: e.target.value })}
                  className={INPUT_CLS}
                />
              </Campo>
            </div>

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

            <Campo label="Descripción breve">
              <textarea
                rows={2}
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                placeholder="Reseña del evento, artistas o detalles para el visitante…"
                className={INPUT_CLS}
              />
            </Campo>

            {modo === "admin" && (
              <>
                <Campo label="Fuente de la información (opcional)">
                  <input
                    type="text"
                    value={form.fuente}
                    onChange={(e) => setForm({ ...form, fuente: e.target.value })}
                    placeholder="Institución, comercio o URL"
                    className={INPUT_CLS}
                  />
                </Campo>
                {editando !== "nuevo" && (
                  <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    <input
                      type="checkbox"
                      checked={form.verificado}
                      onChange={(e) => setForm({ ...form, verificado: e.target.checked })}
                      className="h-4 w-4 rounded border-neutral-300 text-teal-700"
                    />
                    Evento verificado (deja de mostrarse «por confirmar»)
                  </label>
                )}
              </>
            )}

            <PieDeFormulario
              onCancelar={() => setEditando(null)}
              enviando={enviando}
              textoEnviar={editando === "nuevo" ? "Publicar evento" : "Guardar cambios"}
              error={errorForm}
            />
          </form>
        </ModalGestion>
      )}
    </section>
  );
}
