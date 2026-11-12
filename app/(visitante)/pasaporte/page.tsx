"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BotonSalir } from "@/components/auth/BotonSalir";
import { mockProfile, mockVisits, mockPlaces, mockRewards } from "@/lib/mock";
import { puntosDemo } from "@/lib/qr/mock";
import { CheckIcon } from "@/components/paneles/icons";
import { ArrowLeftIcon, CameraIcon, TrophyIcon } from "@/components/ui/icons";

/** Respuesta de GET /api/me/passport (datos del usuario de la sesión). */
interface Pasaporte {
  profile: { id: string; alias: string; points: number };
  visits: { id: string; placeName: string; pointsAwarded: number; missionTitle: string | null }[];
  rewards: {
    id: string;
    title: string;
    conditions: string;
    pointsCost: number;
    canjeable: boolean;
  }[];
  redemptions: {
    id: string;
    code: string;
    rewardId: string;
    rewardTitle: string;
    costPoints: number;
    status: "pendiente" | "confirmado";
  }[];
}

type Estado =
  | { fase: "cargando" }
  | { fase: "error"; mensaje: string }
  | { fase: "listo"; datos: Pasaporte; demo: boolean };

/**
 * Modo demo (sin base de datos): datos de `lib/mock` con los puntos que el
 * escáner fue sumando en este navegador.
 */
function pasaporteDemo(): Pasaporte {
  return {
    profile: { ...mockProfile, points: puntosDemo() },
    visits: mockVisits.map((v) => ({
      id: v.id,
      placeName: mockPlaces.find((p) => p.id === v.placeId)?.name ?? "Lugar del Centro",
      pointsAwarded: v.pointsAwarded,
      missionTitle: null,
    })),
    rewards: mockRewards.map((r) => ({
      id: r.id,
      title: r.title,
      conditions: r.conditions,
      pointsCost: r.pointsCost,
      canjeable: false,
    })),
    redemptions: [],
  };
}

export default function PasaportePage() {
  const [estado, setEstado] = useState<Estado>({ fase: "cargando" });
  const [canjeando, setCanjeando] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [esInvitado, setEsInvitado] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const res = await fetch("/api/me/passport", { cache: "no-store" });
      const body = await res.json().catch(() => null);
      if (res.status >= 500 || body?.demo) {
        // Sin base de datos: modo demo (los puntos los lleva el navegador).
        setEstado({ fase: "listo", datos: pasaporteDemo(), demo: true });
        return;
      }
      if (res.status === 401) {
        // Sin sesión no hay error: el pasaporte se muestra en modo demo y
        // quien quiera puede iniciar sesión desde la cabecera.
        setEstado({ fase: "listo", datos: pasaporteDemo(), demo: true });
        return;
      }
      if (!res.ok || !body?.profile) {
        setEstado({ fase: "error", mensaje: body?.error ?? "No pudimos cargar tu pasaporte." });
        return;
      }
      setEstado({ fase: "listo", datos: body as Pasaporte, demo: false });
    } catch {
      // Sin servidor: modo demo.
      setEstado({ fase: "listo", datos: pasaporteDemo(), demo: true });
    }
  }, []);

  useEffect(() => {
    cargar();
    fetch("/api/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((b) => setEsInvitado(Boolean(b?.profile?.esInvitado)))
      .catch(() => {});
  }, [cargar]);

  async function canjear(rewardId: string) {
    setAviso(null);
    setCanjeando(rewardId);
    try {
      const res = await fetch("/api/redemptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setAviso(body?.error ?? "No se pudo solicitar el canje.");
      } else {
        setAviso(`Muestra el código ${body.redemption.code} en el comercio para recibir tu recompensa.`);
        await cargar();
      }
    } catch {
      setAviso("Sin conexión. Intenta de nuevo.");
    } finally {
      setCanjeando(null);
    }
  }

  if (estado.fase !== "listo") {
    return (
      <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center justify-center gap-4 px-6 text-center">
        {estado.fase === "cargando" ? (
          <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Cargando tu pasaporte…</p>
        ) : (
          <>
            <p className="text-base font-bold text-neutral-800 dark:text-neutral-200">{estado.mensaje}</p>
            <button
              type="button"
              onClick={() => {
                setEstado({ fase: "cargando" });
                cargar();
              }}
              className="rounded-xl bg-teal-700 hover:bg-teal-800 px-6 py-3 text-sm font-bold text-white transition-colors"
            >
              Reintentar
            </button>
          </>
        )}
      </main>
    );
  }

  const { profile, visits, rewards, redemptions } = estado.datos;
  const modoDemo = estado.demo;
  const pendientePorReward = new Map(
    redemptions.filter((r) => r.status === "pendiente").map((r) => [r.rewardId, r.code]),
  );

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col font-sans selection:bg-teal-100 dark:selection:bg-teal-900">
      <header className="px-6 pt-8 pb-4 max-w-lg mx-auto w-full flex items-center justify-between">
        <Link
          href="/ruta"
          className="text-xs font-bold text-teal-700 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 flex items-center gap-1"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5" />
          <span>Volver a la ruta</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-teal-50 text-teal-800 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800 font-bold px-2.5 py-1 rounded-full">
            Pasaporte digital
          </span>
          <BotonSalir />
        </div>
      </header>

      <div className="px-6 mb-6 max-w-lg mx-auto w-full">
        {/* Tarjeta de Identidad */}
        <div className="bg-gradient-to-br from-teal-800 to-teal-950 rounded-3xl p-7 text-white shadow-md relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 border-[20px] border-white/10 rounded-full opacity-50 pointer-events-none"></div>

          <div className="relative z-10">
            <span className="bg-white/15 text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20">
              {esInvitado ? "Invitado" : "Explorador Jarocho"}
            </span>
            <h2 className="text-3xl font-black mt-4 mb-6 truncate">{profile.alias}</h2>

            <div className="flex justify-between items-end">
              <div>
                <p className="text-teal-200 text-xs font-bold mb-1">
                  Puntos acumulados
                </p>
                <p className="text-5xl font-black text-amber-300">{profile.points}</p>
              </div>
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 text-amber-300">
                <TrophyIcon className="w-7 h-7" />
              </div>
            </div>

            {modoDemo && (
              <p className="text-[11px] text-teal-200/90 mt-3 font-medium">
                Modo demostración: los puntos se guardan en este navegador.
              </p>
            )}
          </div>
        </div>

        {esInvitado && !modoDemo && (
          <Link
            href="/registro?next=/pasaporte"
            className="mt-3 block rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-center text-sm font-bold text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
          >
            Crea tu cuenta para no perder tus puntos
          </Link>
        )}
      </div>

      <div className="px-6 flex-1 space-y-6 max-w-lg mx-auto w-full pb-32">
        {/* Acciones principales */}
        <div>
          <h3 className="font-black text-neutral-800 dark:text-neutral-200 mb-3 text-base">Acciones</h3>
          <Link
            href="/escanear"
            className="group flex items-center p-4 bg-white dark:bg-neutral-900 rounded-2xl shadow-xs border border-neutral-200/80 dark:border-neutral-800 active:scale-[0.98] transition duration-100"
          >
            <div className="w-12 h-12 bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 rounded-xl flex items-center justify-center mr-3 group-active:bg-teal-100 dark:group-active:bg-teal-950/60 transition-colors shrink-0">
              <CameraIcon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">Escanear QR de visita</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Suma puntos en los comercios participantes</p>
            </div>
          </Link>
        </div>

        {/* Sellos de visitas */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-black text-neutral-800 dark:text-neutral-200 text-base">Sellos de Visita ({visits.length})</h3>
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">Verificados por QR</span>
          </div>

          {visits.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-5 text-center text-sm text-neutral-500 dark:text-neutral-400">
              Aún no tienes sellos. Escanea el QR de un lugar del centro para ganar tu primero.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {visits.map((visit) => (
                <div
                  key={visit.id}
                  className="p-3.5 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl shadow-xs text-center flex flex-col items-center"
                >
                  <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center mb-2">
                    <CheckIcon className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-xs text-neutral-900 dark:text-neutral-100 line-clamp-1">{visit.placeName}</h4>
                  <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400 mt-0.5">+{visit.pointsAwarded} pts</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mis canjes */}
        {redemptions.length > 0 && (
          <div>
            <h3 className="font-black text-neutral-800 dark:text-neutral-200 mb-3 text-base">Mis canjes</h3>
            <div className="space-y-2.5">
              {redemptions.map((r) => (
                <div
                  key={r.id}
                  className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="font-bold text-xs text-neutral-900 dark:text-neutral-100 leading-snug">{r.rewardTitle}</h4>
                    <p className="font-mono text-sm font-black text-neutral-800 dark:text-neutral-200 mt-0.5">{r.code}</p>
                  </div>
                  <span
                    className={`text-[11px] font-black px-2.5 py-1 rounded-lg border shrink-0 ${
                      r.status === "pendiente"
                        ? "bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800"
                        : "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                    }`}
                  >
                    {r.status === "pendiente" ? "Muéstralo en el comercio" : "Entregado"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recompensas */}
        <div>
          <h3 className="font-black text-neutral-800 dark:text-neutral-200 mb-3 text-base">Recompensas para canjear</h3>
          {aviso && (
            <p role="status" className="mb-3 rounded-2xl bg-teal-50 border border-teal-200 dark:bg-teal-950/40 dark:border-teal-800 p-3 text-sm font-semibold text-teal-900 dark:text-teal-200">
              {aviso}
            </p>
          )}
          <div className="space-y-2.5">
            {rewards.map((reward) => {
              const codigo = pendientePorReward.get(reward.id);
              return (
                <div
                  key={reward.id}
                  className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="font-bold text-xs text-neutral-900 dark:text-neutral-100 leading-snug">{reward.title}</h4>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">{reward.conditions}</p>
                    <span className="mt-1 inline-block bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800 font-black text-[11px] px-2 py-0.5 rounded-lg">
                      {reward.pointsCost} pts
                    </span>
                  </div>
                  {codigo ? (
                    <span className="font-mono text-xs font-black text-amber-800 dark:text-amber-300 shrink-0">{codigo}</span>
                  ) : reward.canjeable ? (
                    <button
                      type="button"
                      onClick={() => canjear(reward.id)}
                      disabled={canjeando !== null}
                      className="shrink-0 rounded-xl bg-teal-700 hover:bg-teal-800 px-4 py-2.5 text-xs font-bold text-white active:scale-[0.98] transition duration-100 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {canjeando === reward.id ? "Canjeando…" : "Canjear"}
                    </button>
                  ) : (
                    <span className="shrink-0 text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                      Te faltan {reward.pointsCost - profile.points} pts
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <nav className="bg-white dark:bg-neutral-900 border-t border-neutral-200/80 dark:border-neutral-800 p-4 pb-8 max-w-lg mx-auto w-full sticky bottom-0 z-20">
        <Link
          href="/inicio"
          className="block w-full text-center py-4 bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 rounded-xl font-bold active:bg-neutral-200 dark:active:bg-neutral-700 transition-colors text-sm"
        >
          Generar Nueva Ruta
        </Link>
      </nav>
    </main>
  );
}
