"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import type { Mission, Place } from "@/lib/types";
import { ArrowLeftIcon, CheckIcon, CompassIcon, MapPinIcon, MoonIcon, TargetIcon } from "@/components/paneles/icons";
import { CameraIcon } from "@/components/ui/icons";
import { useIdioma, LanguageSelector } from "@/components/ui/LanguageSelector";

type Estado =
  | { fase: "cargando" }
  | { fase: "lista"; mission: Mission; place: Place | null }
  | { fase: "aceptando"; mission: Mission; place: Place | null }
  | { fase: "aceptada"; mission: Mission; place: Place | null }
  | { fase: "error"; mensaje: string };

function Mision() {
  const { lang, t } = useIdioma();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>({ fase: "cargando" });
  const [errorAceptar, setErrorAceptar] = useState<string | null>(null);

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
        <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{t.mision.noDisponibleTitulo}</h1>
        <p className="max-w-xs text-neutral-500 dark:text-neutral-400">{estado.mensaje}</p>
        <Link
          href={`/ruta${lang === "en" ? "?lang=en" : ""}`}
          className="rounded-xl bg-teal-700 px-6 py-3 font-bold text-white shadow-sm transition duration-100 hover:bg-teal-800 active:scale-[0.98]"
        >
          {t.mision.volverRuta}
        </Link>
      </main>
    );
  }

  const { mission, place } = estado;
  const aceptada = estado.fase === "aceptada";

  return (
    <main className="flex min-h-dvh flex-col justify-center bg-neutral-50 p-6 font-sans text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <div className="mx-auto w-full max-w-md rounded-3xl border border-neutral-200/80 bg-white p-8 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-900 relative">
        <div className="absolute top-6 left-6">
          <Link
            href={`/ruta${lang === "en" ? "?lang=en" : ""}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition group py-1"
            title={t.mision.volverRuta}
          >
            <ArrowLeftIcon className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">{t.mision.volverRuta}</span>
          </Link>
        </div>
        <div className="absolute top-6 right-6">
          <LanguageSelector size="sm" />
        </div>

        <span
          className={`mb-6 mt-2 inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold ${
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
          {aceptada ? t.mision.aceptada : mission.nightBonus ? t.mision.nocturna : t.mision.especial}
        </span>

        <h1 className="mb-3 text-3xl leading-tight font-black">{mission.title}</h1>
        {place && (
          <p className="mb-4 inline-flex items-center justify-center gap-1.5 text-sm font-bold text-teal-700 dark:text-teal-400">
            <MapPinIcon className="h-4 w-4" />
            {place.name.replace(/^\[DEMO\]\s*/i, "").trim()}
          </p>
        )}

        <p className="mb-8 text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
          {mission.rules || mission.description || (lang === "en" ? "Visit the place and scan its QR code." : "Visita el lugar y escanea su código QR.")}
        </p>

        <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-950/30">
          <p className="mb-2 text-sm font-bold text-amber-800 dark:text-amber-300">{t.mision.recompensa}</p>
          <div className="flex items-baseline justify-center gap-2 text-4xl font-black text-amber-700 dark:text-amber-400">
            <span>+{mission.points}</span>
            <span className="text-xl">{t.mision.pts}</span>
          </div>
        </div>

        {aceptada ? (
          <div className="space-y-3">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {place
                ? `${lang === "en" ? "Upon arrival at" : "Al llegar a"} ${place.name.replace(/^\[DEMO\]\s*/i, "").trim()}, ${lang === "en" ? "locate the QR code and scan it to claim your points." : "busca el código QR y escanéalo para sumar tus puntos."}`
                : t.mision.alLlegar}
            </p>
            <Link
              href="/escanear"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 py-4 text-lg font-black text-white shadow-sm transition duration-100 hover:bg-teal-800 active:scale-[0.98]"
            >
              <CameraIcon className="h-5 w-5" />
              {t.mision.escanearQr}
            </Link>
            <Link
              href={`/ruta${lang === "en" ? "?lang=en" : ""}`}
              className="block w-full py-4 text-sm font-bold text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              {t.mision.volverRuta}
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
              {estado.fase === "aceptando" ? t.mision.aceptando : t.mision.aceptarMision}
            </button>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined" && window.history.length > 1) {
                  router.back();
                } else {
                  router.push(`/ruta${lang === "en" ? "?lang=en" : ""}`);
                }
              }}
              className="w-full py-4 text-sm font-bold text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 cursor-pointer"
            >
              {t.mision.quizasLuego}
            </button>
          </div>
        )}

        <footer className="mt-8 text-center text-xs text-neutral-400 dark:text-neutral-500 pb-2">
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
