"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BotonSalir } from "@/components/auth/BotonSalir";

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

type Estado = { fase: "cargando" } | { fase: "error"; mensaje: string } | { fase: "listo"; datos: Pasaporte };

export default function PasaportePage() {
  const [estado, setEstado] = useState<Estado>({ fase: "cargando" });
  const [canjeando, setCanjeando] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [esInvitado, setEsInvitado] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const res = await fetch("/api/me/passport", { cache: "no-store" });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.profile) {
        setEstado({ fase: "error", mensaje: body?.error ?? "No pudimos cargar tu pasaporte." });
        return;
      }
      setEstado({ fase: "listo", datos: body as Pasaporte });
    } catch {
      setEstado({ fase: "error", mensaje: "Sin conexión. Intenta de nuevo." });
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
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-6 text-center">
        {estado.fase === "cargando" ? (
          <p className="text-sm font-semibold text-gray-500">Cargando tu pasaporte…</p>
        ) : (
          <>
            <p className="text-base font-bold text-gray-800">{estado.mensaje}</p>
            <button
              type="button"
              onClick={() => {
                setEstado({ fase: "cargando" });
                cargar();
              }}
              className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white"
            >
              Reintentar
            </button>
          </>
        )}
      </main>
    );
  }

  const { profile, visits, rewards, redemptions } = estado.datos;
  const pendientePorReward = new Map(
    redemptions.filter((r) => r.status === "pendiente").map((r) => [r.rewardId, r.code]),
  );

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-blue-200">
      <header className="px-6 pt-8 pb-4 max-w-lg mx-auto w-full flex items-center justify-between">
        <Link
          href="/ruta"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <span>←</span>
          <span>Volver a la ruta</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-purple-50 text-purple-700 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Pasaporte Digital
          </span>
          <BotonSalir />
        </div>
      </header>

      <div className="px-6 mb-6 max-w-lg mx-auto w-full">
        {/* Tarjeta de Identidad */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-3xl p-7 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 border-[20px] border-white/10 rounded-full opacity-50 pointer-events-none"></div>

          <div className="relative z-10">
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">
              {esInvitado ? "Invitado" : "Explorador Jarocho"}
            </span>
            <h2 className="text-3xl font-black mt-4 mb-6 truncate">{profile.alias}</h2>

            <div className="flex justify-between items-end">
              <div>
                <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">
                  Puntos Acumulados
                </p>
                <p className="text-5xl font-black text-yellow-400 drop-shadow-md">{profile.points}</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30 text-2xl shadow-inner">
                🏆
              </div>
            </div>
          </div>
        </div>

        {esInvitado && (
          <Link
            href="/registro?next=/pasaporte"
            className="mt-3 block rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-center text-sm font-bold text-amber-900"
          >
            Crea tu cuenta para no perder tus puntos
          </Link>
        )}
      </div>

      <div className="px-6 flex-1 space-y-6 max-w-lg mx-auto w-full pb-8">
        {/* Acciones principales */}
        <div>
          <h3 className="font-black text-gray-800 mb-3 text-base">Acciones</h3>
          <Link
            href="/escanear"
            className="group flex items-center p-4 bg-white rounded-2xl shadow-xs border border-gray-100 active:scale-[0.98] transition-all"
          >
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl mr-3 group-active:bg-blue-100 transition-colors shrink-0">
              📷
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900 text-sm">Escanear QR de visita</p>
              <p className="text-xs text-gray-500 font-medium">Suma puntos en los comercios participantes</p>
            </div>
          </Link>
        </div>

        {/* Sellos de visitas */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-black text-gray-800 text-base">Sellos de Visita ({visits.length})</h3>
            <span className="text-[11px] font-semibold text-emerald-600">Verificados por QR</span>
          </div>

          {visits.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-gray-200 bg-white p-5 text-center text-sm text-gray-500">
              Aún no tienes sellos. Escanea el QR de un lugar del centro para ganar tu primero.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {visits.map((visit) => (
                <div
                  key={visit.id}
                  className="p-3.5 bg-white border border-gray-100 rounded-2xl shadow-xs text-center flex flex-col items-center"
                >
                  <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center text-sm mb-2">
                    ✓
                  </div>
                  <h4 className="font-bold text-xs text-gray-900 line-clamp-1">{visit.placeName}</h4>
                  <span className="text-[10px] font-bold text-blue-600 mt-0.5">+{visit.pointsAwarded} pts</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mis canjes */}
        {redemptions.length > 0 && (
          <div>
            <h3 className="font-black text-gray-800 mb-3 text-base">Mis canjes</h3>
            <div className="space-y-2.5">
              {redemptions.map((r) => (
                <div
                  key={r.id}
                  className="p-4 bg-white rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="font-bold text-xs text-gray-900 leading-snug">{r.rewardTitle}</h4>
                    <p className="font-mono text-sm font-black text-gray-800 mt-0.5">{r.code}</p>
                  </div>
                  <span
                    className={`text-[11px] font-black px-2.5 py-1 rounded-lg shrink-0 ${
                      r.status === "pendiente" ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-800"
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
          <h3 className="font-black text-gray-800 mb-3 text-base">Recompensas para canjear</h3>
          {aviso && (
            <p role="status" className="mb-3 rounded-2xl bg-blue-50 p-3 text-sm font-semibold text-blue-900">
              {aviso}
            </p>
          )}
          <div className="space-y-2.5">
            {rewards.map((reward) => {
              const codigo = pendientePorReward.get(reward.id);
              return (
                <div
                  key={reward.id}
                  className="p-4 bg-white rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="font-bold text-xs text-gray-900 leading-snug">{reward.title}</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">{reward.conditions}</p>
                    <span className="mt-1 inline-block bg-amber-100 text-amber-900 font-black text-[11px] px-2 py-0.5 rounded-lg">
                      {reward.pointsCost} pts
                    </span>
                  </div>
                  {codigo ? (
                    <span className="font-mono text-xs font-black text-amber-800 shrink-0">{codigo}</span>
                  ) : reward.canjeable ? (
                    <button
                      type="button"
                      onClick={() => canjear(reward.id)}
                      disabled={canjeando !== null}
                      className="shrink-0 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white active:scale-95 disabled:opacity-60"
                    >
                      {canjeando === reward.id ? "Canjeando…" : "Canjear"}
                    </button>
                  ) : (
                    <span className="shrink-0 text-[11px] font-semibold text-gray-400">
                      Te faltan {reward.pointsCost - profile.points} pts
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <nav className="bg-white border-t border-gray-100 p-4 pb-8 max-w-lg mx-auto w-full sticky bottom-0 z-20">
        <Link
          href="/inicio"
          className="block w-full text-center py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold active:bg-gray-200 transition-colors text-sm"
        >
          Generar Nueva Ruta
        </Link>
      </nav>
    </main>
  );
}
