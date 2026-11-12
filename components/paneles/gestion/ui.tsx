"use client";

/**
 * Piezas compartidas del CRUD de los paneles (admin y comercio):
 * modal, campos de formulario, botones y helper de fetch con errores legibles.
 */
import React, { useEffect, useState } from "react";

export const INPUT_CLS =
  "mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-900 shadow-2xs focus:outline-none focus:ring-2 focus:ring-teal-500/40 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white";

export const CATEGORIAS_UI = [
  { value: "cultura", label: "Cultura y danza" },
  { value: "gastronomia", label: "Gastronomía" },
  { value: "historia", label: "Historia" },
  { value: "paseo", label: "Paseo" },
  { value: "compras", label: "Compras y artesanías" },
];

/** fetch que lanza Error con el mensaje `{ error }` del servidor. */
export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  const data = (await res.json().catch(() => null)) as { error?: string } | T | null;
  if (!res.ok) {
    const msg =
      data && typeof data === "object" && "error" in data && typeof data.error === "string"
        ? data.error
        : `Error ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

export function Campo({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">{label}</span>
      {children}
    </label>
  );
}

export function Chip({ tono, children }: { tono: "verde" | "ambar" | "neutro" | "teal"; children: React.ReactNode }) {
  const tonos = {
    verde: "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
    ambar: "bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
    neutro: "bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700",
    teal: "bg-teal-50 text-teal-800 border-teal-200/80 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${tonos[tono]}`}>
      {children}
    </span>
  );
}

export function ModalGestion({
  titulo,
  subtitulo,
  onClose,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">{titulo}</h3>
            {subtitulo && (
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{subtitulo}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function PieDeFormulario({
  onCancelar,
  enviando,
  textoEnviar,
  error,
}: {
  onCancelar: () => void;
  enviando: boolean;
  textoEnviar: string;
  error: string | null;
}) {
  return (
    <div className="pt-2">
      {error && (
        <p className="mb-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancelar}
          className="cursor-pointer rounded-lg border border-neutral-300 px-3.5 py-1.5 text-xs font-medium text-neutral-600 transition hover:bg-neutral-100 active:scale-95 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={enviando}
          className="cursor-pointer rounded-lg bg-teal-700 px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-teal-800 active:scale-95 disabled:opacity-50"
        >
          {enviando ? "Guardando…" : textoEnviar}
        </button>
      </div>
    </div>
  );
}

/** Botón de eliminar con confirmación en dos pasos (sin window.confirm). */
export function BotonEliminar({ onConfirm, disabled }: { onConfirm: () => void; disabled?: boolean }) {
  const [confirmando, setConfirmando] = useState(false);

  useEffect(() => {
    if (!confirmando) return;
    const t = setTimeout(() => setConfirmando(false), 4000);
    return () => clearTimeout(t);
  }, [confirmando]);

  if (confirmando) {
    return (
      <span className="inline-flex items-center gap-1">
        <button
          onClick={() => {
            setConfirmando(false);
            onConfirm();
          }}
          className="cursor-pointer rounded-lg bg-red-600 px-2 py-1 text-[11px] font-semibold text-white transition hover:bg-red-700 active:scale-95"
        >
          ¿Eliminar?
        </button>
        <button
          onClick={() => setConfirmando(false)}
          className="cursor-pointer rounded-lg border border-neutral-300 px-2 py-1 text-[11px] font-medium text-neutral-600 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          No
        </button>
      </span>
    );
  }
  return (
    <button
      onClick={() => setConfirmando(true)}
      disabled={disabled}
      className="cursor-pointer rounded-lg border border-red-200 px-2 py-1 text-[11px] font-medium text-red-600 transition hover:bg-red-50 active:scale-95 disabled:opacity-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/40"
    >
      Eliminar
    </button>
  );
}

export function BotonEditar({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="cursor-pointer rounded-lg border border-neutral-300 px-2 py-1 text-[11px] font-medium text-neutral-700 transition hover:bg-neutral-100 active:scale-95 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
    >
      Editar
    </button>
  );
}

export function EncabezadoSeccion({
  titulo,
  descripcion,
  textoNuevo,
  onNuevo,
}: {
  titulo: string;
  descripcion: string;
  textoNuevo: string;
  onNuevo: () => void;
}) {
  return (
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
      <div>
        <h2 className="text-lg font-black tracking-tight text-neutral-900 dark:text-white">{titulo}</h2>
        <p className="text-xs text-neutral-600 dark:text-neutral-400">{descripcion}</p>
      </div>
      <button
        onClick={onNuevo}
        className="inline-flex cursor-pointer items-center gap-1.5 self-start rounded-xl bg-teal-700 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs transition hover:bg-teal-800 active:scale-95 sm:self-auto"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        {textoNuevo}
      </button>
    </div>
  );
}

export function EstadoLista({ cargando, error, vacio, textoVacio }: { cargando: boolean; error: string | null; vacio: boolean; textoVacio: string }) {
  if (cargando) {
    return <p className="rounded-xl border border-neutral-200/80 bg-white p-4 text-xs text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">Cargando…</p>;
  }
  if (error) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
        {error}
      </p>
    );
  }
  if (vacio) {
    return <p className="rounded-xl border border-dashed border-neutral-300 bg-white p-6 text-center text-xs text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900">{textoVacio}</p>;
  }
  return null;
}

/** Fecha+hora local "YYYY-MM-DD" y "HH:MM" a partir de un ISO (para prellenar formularios). */
export function isoALocal(iso: string | null | undefined): { fecha: string; hora: string } {
  if (!iso) return { fecha: "", hora: "" };
  const d = new Date(iso);
  if (isNaN(d.getTime())) return { fecha: "", hora: "" };
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    fecha: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    hora: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

/** "YYYY-MM-DD" + "HH:MM" locales → ISO, o null si falta la fecha. */
export function localAIso(fecha: string, hora: string): string | null {
  if (!fecha) return null;
  const d = new Date(`${fecha}T${hora || "00:00"}`);
  return isNaN(d.getTime()) ? null : d.toISOString();
}
