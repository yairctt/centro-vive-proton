"use client";

/**
 * CRUD de recompensas canjeables por puntos.
 * modo="admin": todas (elige el negocio). modo="comercio": solo las de su negocio.
 */
import React, { useCallback, useEffect, useState } from "react";
import type { Reward, Business } from "@/lib/types";
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
} from "./ui";

type RecompensaConNegocio = Reward & { businessName?: string };

interface Props {
  modo: "admin" | "comercio";
}

const FORM_VACIO = {
  titulo: "",
  condiciones: "",
  costo: "50",
  validaHasta: "",
  businessId: "",
};

export function GestionRecompensas({ modo }: Props) {
  const [recompensas, setRecompensas] = useState<RecompensaConNegocio[]>([]);
  const [negocios, setNegocios] = useState<Business[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorLista, setErrorLista] = useState<string | null>(null);

  const [editando, setEditando] = useState<RecompensaConNegocio | "nuevo" | null>(null);
  const [form, setForm] = useState(FORM_VACIO);
  const [enviando, setEnviando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setErrorLista(null);
    try {
      const [lista, misNegocios] = await Promise.all([
        fetchJson<RecompensaConNegocio[]>("/api/rewards"),
        fetchJson<Business[]>("/api/me/businesses"),
      ]);
      setRecompensas(lista);
      setNegocios(misNegocios);
    } catch (err) {
      setErrorLista(err instanceof Error ? err.message : "No se pudieron cargar las recompensas");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const abrirNuevo = () => {
    setForm({ ...FORM_VACIO, businessId: negocios[0]?.id ?? "" });
    setErrorForm(null);
    setEditando("nuevo");
  };

  const abrirEdicion = (r: RecompensaConNegocio) => {
    setForm({
      titulo: r.title,
      condiciones: r.conditions || "",
      costo: String(r.pointsCost ?? r.costPoints ?? 50),
      validaHasta: isoALocal(r.validUntil).fecha,
      businessId: r.businessId,
    });
    setErrorForm(null);
    setEditando(r);
  };

  const guardar = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setEnviando(true);
    setErrorForm(null);
    try {
      const cuerpo: Record<string, unknown> = {
        title: form.titulo,
        conditions: form.condiciones,
        costPoints: Number(form.costo) || 50,
        validUntil: form.validaHasta ? localAIso(form.validaHasta, "23:59") : null,
      };
      if (form.businessId) cuerpo.businessId = form.businessId;

      if (editando === "nuevo") {
        await fetchJson<Reward>("/api/rewards", { method: "POST", body: JSON.stringify(cuerpo) });
      } else if (editando) {
        await fetchJson<Reward>(`/api/rewards/${editando.id}`, {
          method: "PATCH",
          body: JSON.stringify(cuerpo),
        });
      }
      setEditando(null);
      await cargar();
    } catch (err) {
      setErrorForm(err instanceof Error ? err.message : "No se pudo guardar la recompensa");
    } finally {
      setEnviando(false);
    }
  };

  const eliminar = async (r: RecompensaConNegocio) => {
    try {
      await fetchJson<{ ok: boolean }>(`/api/rewards/${r.id}`, { method: "DELETE" });
      setRecompensas((prev) => prev.filter((x) => x.id !== r.id));
    } catch (err) {
      setErrorLista(err instanceof Error ? err.message : "No se pudo eliminar la recompensa");
    }
  };

  return (
    <section className="space-y-4">
      <EncabezadoSeccion
        titulo="Recompensas"
        descripcion={
          modo === "admin"
            ? "Beneficios que los visitantes canjean con sus puntos, por negocio."
            : "Beneficios que los visitantes canjean con sus puntos en tu local. El canje se confirma en caja."
        }
        textoNuevo="Nueva recompensa"
        onNuevo={abrirNuevo}
      />

      <EstadoLista
        cargando={cargando}
        error={errorLista}
        vacio={!cargando && recompensas.length === 0}
        textoVacio="No hay recompensas publicadas todavía."
      />

      <ul className="space-y-2">
        {recompensas.map((r) => (
          <li
            key={r.id}
            className="flex flex-col gap-2 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs sm:flex-row sm:items-center sm:justify-between dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-bold text-neutral-900 dark:text-white">{r.title}</p>
                <Chip tono="ambar">{r.pointsCost ?? r.costPoints} pts</Chip>
                {r.validUntil && (
                  <Chip tono={new Date(r.validUntil) < new Date() ? "neutro" : "verde"}>
                    {new Date(r.validUntil) < new Date()
                      ? "Vencida"
                      : `Hasta ${new Date(r.validUntil).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}`}
                  </Chip>
                )}
              </div>
              <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                {r.businessName || "Negocio"}
                {r.conditions ? ` · ${r.conditions}` : ""}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <BotonEditar onClick={() => abrirEdicion(r)} />
              <BotonEliminar onConfirm={() => eliminar(r)} />
            </div>
          </li>
        ))}
      </ul>

      {editando && (
        <ModalGestion
          titulo={editando === "nuevo" ? "Nueva recompensa" : "Editar recompensa"}
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
                placeholder="Ej. Café lechero 2x1"
                className={INPUT_CLS}
              />
            </Campo>

            <Campo label="Condiciones">
              <textarea
                rows={2}
                value={form.condiciones}
                onChange={(e) => setForm({ ...form, condiciones: e.target.value })}
                placeholder="Ej. Válido de lunes a jueves presentando el pasaporte digital"
                className={INPUT_CLS}
              />
            </Campo>

            <div className="grid grid-cols-2 gap-3">
              <Campo label="Costo en puntos">
                <input
                  type="number"
                  required
                  min={1}
                  value={form.costo}
                  onChange={(e) => setForm({ ...form, costo: e.target.value })}
                  className={INPUT_CLS}
                />
              </Campo>
              <Campo label="Válida hasta (opcional)">
                <input
                  type="date"
                  value={form.validaHasta}
                  onChange={(e) => setForm({ ...form, validaHasta: e.target.value })}
                  className={INPUT_CLS}
                />
              </Campo>
            </div>

            {(modo === "admin" || negocios.length > 1) && (
              <Campo label="Negocio">
                <select
                  required
                  value={form.businessId}
                  onChange={(e) => setForm({ ...form, businessId: e.target.value })}
                  className={INPUT_CLS}
                >
                  <option value="" disabled>
                    Elige un negocio…
                  </option>
                  {negocios.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name || n.id}
                    </option>
                  ))}
                </select>
              </Campo>
            )}

            <PieDeFormulario
              onCancelar={() => setEditando(null)}
              enviando={enviando}
              textoEnviar={editando === "nuevo" ? "Crear recompensa" : "Guardar cambios"}
              error={errorForm}
            />
          </form>
        </ModalGestion>
      )}
    </section>
  );
}
