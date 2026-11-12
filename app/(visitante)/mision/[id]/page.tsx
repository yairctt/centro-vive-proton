"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import type { Mission, Place } from "@/lib/types";

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
      <main className="flex min-h-dvh items-center justify-center bg-gray-900 p-6">
        <div className="w-full max-w-md animate-pulse space-y-4 rounded-[2rem] border border-gray-700 bg-gray-800 p-8">
          <div className="mx-auto h-6 w-32 rounded-full bg-gray-700" />
          <div className="mx-auto h-9 w-3/4 rounded-xl bg-gray-700" />
          <div className="h-16 rounded-xl bg-gray-700" />
          <div className="h-24 rounded-2xl bg-gray-700" />
          <div className="h-14 rounded-2xl bg-gray-700" />
        </div>
      </main>
    );
  }

  if (estado.fase === "error") {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-gray-50 p-6 text-center">
        <p className="text-4xl">🧭</p>
        <h1 className="text-xl font-bold text-gray-900">Misión no disponible</h1>
        <p className="text-gray-500">{estado.mensaje}</p>
        <Link href="/ruta" className="rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white shadow-md active:scale-95">
          Volver a mi ruta
        </Link>
      </main>
    );
  }

  const { mission, place } = estado;
  const aceptada = estado.fase === "aceptada";

  return (
    <main className="flex min-h-dvh flex-col justify-center bg-gray-900 p-6 font-sans text-white">
      <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-[2rem] border border-gray-700 bg-gray-800 p-8 text-center shadow-2xl">
        <div className="pointer-events-none absolute top-0 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-orange-500 opacity-20 blur-3xl" />

        <span
          className={`mb-6 inline-block rounded-full border px-4 py-1.5 text-xs font-black tracking-wider uppercase ${
            aceptada
              ? "border-emerald-500/30 bg-emerald-500/20 text-emerald-300"
              : "border-orange-500/30 bg-orange-500/20 text-orange-400"
          }`}
        >
          {aceptada ? "✓ Misión aceptada" : mission.nightBonus ? "🌙 Misión nocturna" : "Misión especial"}
        </span>

        <h1 className="mb-3 text-3xl leading-tight font-black">{mission.title}</h1>
        {place && <p className="mb-4 text-sm font-bold text-orange-300">📍 {place.name}</p>}

        <p className="mb-8 text-base leading-relaxed text-gray-300">
          {mission.rules || mission.description || "Visita el lugar y escanea su código QR."}
        </p>

        <div className="mb-8 rounded-2xl border border-gray-700/50 bg-gray-900/50 p-6">
          <p className="mb-2 text-sm font-bold tracking-wider text-gray-400 uppercase">Recompensa</p>
          <div className="flex items-center justify-center gap-2 text-4xl font-black text-yellow-400">
            <span>+{mission.points}</span>
            <span className="mt-2 text-xl">pts</span>
          </div>
        </div>

        {aceptada ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-300">
              Al llegar{place ? ` a ${place.name}` : ""}, busca el código QR y escanéalo para sumar tus puntos.
            </p>
            <Link
              href="/escanear"
              className="block w-full rounded-2xl bg-white py-4 text-lg font-black text-gray-900 shadow-lg shadow-white/10 transition-transform active:scale-95"
            >
              📷 Escanear QR
            </Link>
            <Link href="/ruta" className="block w-full py-4 text-sm font-bold text-gray-400 hover:text-white">
              Volver a mi ruta
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {errorAceptar && <p className="text-sm text-rose-300">{errorAceptar}</p>}
            <button
              type="button"
              onClick={aceptar}
              disabled={estado.fase === "aceptando"}
              className="w-full rounded-2xl bg-white py-4 text-lg font-black text-gray-900 shadow-lg shadow-white/10 transition-transform active:scale-95 disabled:opacity-60"
            >
              {estado.fase === "aceptando" ? "Aceptando…" : "Aceptar misión"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full py-4 text-sm font-bold text-gray-400 transition-colors hover:text-white"
            >
              Quizás luego
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default function MisionPage() {
  return (
    <Suspense fallback={<main className="min-h-dvh bg-gray-900" />}>
      <Mision />
    </Suspense>
  );
}
