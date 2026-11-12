"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import type { Mission, Place } from "@/lib/types";
import { CheckIcon, CompassIcon, MapPinIcon, MoonIcon, SparklesIcon, TargetIcon } from "@/components/paneles/icons";
import { CameraIcon } from "@/components/ui/icons";

type Estado =
  | { fase: "cargando" }
  | { fase: "lista"; mission: Mission; place: Place | null }
  | { fase: "aceptando"; mission: Mission; place: Place | null }
  | { fase: "aceptada"; mission: Mission; place: Place | null }
  | { fase: "error"; mensaje: string };

function Mision() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>({ fase: "cargando" });
  const [errorAceptar, setErrorAceptar] = useState<string | null>(null);
  const [aiCopy, setAiCopy] = useState<{ text: string; why: string; source: string } | null>(null);
  const [cargandoIA, setCargandoIA] = useState(false);

  useEffect(() => {
    let vigente = true;
    fetch(`/api/missions/${encodeURIComponent(id)}`, { cache: "no-store" })
      .then(async (res) => {
        const body = await res.json().catch(() => null);
        if (!res.ok || !body?.mission) throw new Error(body?.error ?? "No pudimos cargar la misión.");
        return { fase: "lista", mission: body.mission as Mission, place: (body.place ?? null) as Place | null } as const;
      })
      .catch((e: unknown) => ({ fase: "error", mensaje: e instanceof Error ? e.message : "Error de conexión." }) as const)
      .then((nuevo) => {
        if (vigente) setEstado(nuevo);
      });
    return () => {
      vigente = false;
    };
  }, [id]);

  // Consulta al endpoint de IA (DeepSeek / Gemini) para obtener la redacción dinámica
  const lugarActual = (estado.fase === "lista" || estado.fase === "aceptada") ? estado.place : null;

  useEffect(() => {
    if (!lugarActual) return;

    let cancelado = false;
    setCargandoIA(true);

    let intereses: string[] = [];
    try {
      const guardados = sessionStorage.getItem("interesesVisitante");
      if (guardados) intereses = JSON.parse(guardados);
    } catch {
      // Ignora si falla la lectura de sessionStorage
    }

    fetch("/api/ai/mission", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        placeId: lugarActual.id,
        interests: intereses,
        place: lugarActual,
      }),
    })
      .then(async (res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelado && data?.text) {
          setAiCopy(data);
        }
      })
      .catch(() => {
        // En caso de fallo de red la UI continúa con los datos base de la misión
      })
      .finally(() => {
        if (!cancelado) setCargandoIA(false);
      });

    return () => {
      cancelado = true;
    };
  }, [lugarActual]);

  const aceptar = async () => {
    if (estado.fase !== "lista") return;
    const { mission, place } = estado;
    setErrorAceptar(null);
    setEstado({ fase: "aceptando", mission, place });
    try {
      const res = await fetch("/api/missions/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missionId: mission.id }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.ok) throw new Error(body?.error ?? "No pudimos aceptar la misión.");
      setEstado({ fase: "aceptada", mission, place });
    } catch (e: unknown) {
      setErrorAceptar(e instanceof Error ? e.message : "Error de conexión.");
      setEstado({ fase: "lista", mission, place });
    }
  };

  if (estado.fase === "cargando") {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-neutral-50 p-6 dark:bg-neutral-950">
        <div className="w-full max-w-md animate-pulse space-y-4 rounded-3xl border border-neutral-200/80 bg-white p-8 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mx-auto h-6 w-32 rounded-full bg-neutral-200 dark:bg-neutral-800" />
          <div className="mx-auto h-9 w-3/4 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-16 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-24 rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-14 rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
        </div>
      </main>
    );
  }

  if (estado.fase === "error") {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-neutral-50 p-6 text-center dark:bg-neutral-950">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400">
          <CompassIcon className="h-9 w-9" />
        </div>
        <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Misión no disponible</h1>
        <p className="max-w-xs text-neutral-500 dark:text-neutral-400">{estado.mensaje}</p>
        <Link
          href="/ruta"
          className="rounded-xl bg-teal-700 px-6 py-3 font-bold text-white shadow-sm transition duration-100 hover:bg-teal-800 active:scale-[0.98]"
        >
          Volver a mi ruta
        </Link>
      </main>
    );
  }

  const { mission, place } = estado;
  const aceptada = estado.fase === "aceptada";

  return (
    <main className="flex min-h-dvh flex-col justify-center bg-neutral-50 p-6 font-sans text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <div className="mx-auto w-full max-w-md rounded-3xl border border-neutral-200/80 bg-white p-8 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <span
          className={`mb-6 inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold ${
            aceptada
              ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
              : mission.nightBonus
              ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
              : "border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300"
          }`}
        >
          {aceptada ? (
            <CheckIcon className="h-3.5 w-3.5" />
          ) : mission.nightBonus ? (
            <MoonIcon className="h-3.5 w-3.5" />
          ) : (
            <TargetIcon className="h-3.5 w-3.5" />
          )}
          {aceptada ? "Misión aceptada" : mission.nightBonus ? "Misión nocturna" : "Misión especial"}
        </span>

        <h1 className="mb-3 text-3xl leading-tight font-black">{mission.title}</h1>
        {place && (
          <p className="mb-4 inline-flex items-center justify-center gap-1.5 text-sm font-bold text-teal-700 dark:text-teal-400">
            <MapPinIcon className="h-4 w-4" />
            {place.name.replace(/^\[DEMO\]\s*/i, "").trim()}
          </p>
        )}

        <p className="mb-6 text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
          {mission.rules || mission.description || "Visita el lugar y escanea su código QR."}
        </p>

        {/* Reto redactado dinámicamente con IA */}
        {cargandoIA ? (
          <div className="mb-6 rounded-2xl border border-teal-200/80 bg-teal-50/50 p-4 text-left animate-pulse dark:border-teal-900/60 dark:bg-teal-950/30">
            <div className="flex items-center gap-2 mb-2">
              <SparklesIcon className="w-4 h-4 text-teal-600 animate-spin" />
              <span className="text-xs font-bold text-teal-800 dark:text-teal-300">
                Redactando reto personalizado con IA...
              </span>
            </div>
            <div className="h-4 bg-teal-200/60 dark:bg-teal-900/60 rounded w-5/6 mb-2"></div>
            <div className="h-3 bg-teal-200/40 dark:bg-teal-900/40 rounded w-2/3"></div>
          </div>
        ) : aiCopy ? (
          <div className="mb-6 rounded-2xl border border-teal-200/80 bg-gradient-to-br from-teal-50/70 via-sky-50/30 to-white p-5 text-left shadow-xs dark:border-teal-800/80 dark:bg-gradient-to-br dark:from-teal-950/40 dark:via-neutral-900 dark:to-neutral-900">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-teal-800 dark:text-teal-300">
                <SparklesIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                Reto Sugerido por IA
              </span>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-100/80 dark:text-teal-300 dark:bg-teal-900/60 px-2.5 py-0.5 rounded-full border border-teal-200/60 dark:border-teal-800">
                {aiCopy.source === "ia" ? "DeepSeek" : "Personalizado"}
              </span>
            </div>

            <p className="text-sm font-medium leading-relaxed text-neutral-800 dark:text-neutral-200 mb-2.5">
              {aiCopy.text}
            </p>

            {aiCopy.why && (
              <div className="border-t border-teal-100/80 dark:border-teal-900/60 pt-2 flex items-start gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                <span className="font-bold text-teal-700 dark:text-teal-400 shrink-0">¿Por qué?</span>
                <span className="leading-snug">{aiCopy.why}</span>
              </div>
            )}
          </div>
        ) : null}

        <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-950/30">
          <p className="mb-2 text-sm font-bold text-amber-800 dark:text-amber-300">Recompensa</p>
          <div className="flex items-baseline justify-center gap-2 text-4xl font-black text-amber-700 dark:text-amber-400">
            <span>+{mission.points}</span>
            <span className="text-xl">pts</span>
          </div>
        </div>

        {aceptada ? (
          <div className="space-y-3">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Al llegar{place ? ` a ${place.name.replace(/^\[DEMO\]\s*/i, "").trim()}` : ""}, busca el código QR y escanéalo para sumar tus puntos.
            </p>
            <Link
              href="/escanear"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 py-4 text-lg font-black text-white shadow-sm transition duration-100 hover:bg-teal-800 active:scale-[0.98]"
            >
              <CameraIcon className="h-5 w-5" />
              Escanear QR
            </Link>
            <Link
              href="/ruta"
              className="block w-full py-4 text-sm font-bold text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              Volver a mi ruta
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {errorAceptar && <p className="text-sm text-rose-700 dark:text-rose-300">{errorAceptar}</p>}
            <button
              type="button"
              onClick={aceptar}
              disabled={estado.fase === "aceptando"}
              className="w-full rounded-xl bg-teal-700 py-4 text-lg font-black text-white shadow-sm transition duration-100 hover:bg-teal-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {estado.fase === "aceptando" ? "Aceptando…" : "Aceptar misión"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full py-4 text-sm font-bold text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              Quizás luego
            </button>
          </div>
        )}

        <footer className="mt-8 text-center text-xs text-neutral-400 dark:text-neutral-500 pb-8">
          <p>
            Powered by <span className="font-semibold text-teal-700 dark:text-teal-400">Protón</span>
          </p>
        </footer>
      </div>
    </main>
  );
}

export default function MisionPage() {
  return (
    <Suspense fallback={<main className="min-h-dvh bg-neutral-50 dark:bg-neutral-950" />}>
      <Mision />
    </Suspense>
  );
}
