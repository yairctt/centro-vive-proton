"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { mockPlaces, mockProfile, mockRewards, mockVisits } from "@/lib/mock";
import type { Place, Profile, Reward, Visit } from "@/lib/types";

interface Pasaporte {
  profile: Profile;
  visits: Visit[];
  rewards: Reward[];
  places: Place[];
}

const PASAPORTE_MOCK: Pasaporte = {
  profile: mockProfile,
  visits: mockVisits,
  rewards: mockRewards,
  places: mockPlaces,
};

async function cargarPasaporte(): Promise<Pasaporte> {
  const [rp, rl] = await Promise.all([
    fetch("/api/me/passport", { cache: "no-store" }),
    fetch("/api/places", { cache: "no-store" }),
  ]);
  if (!rp.ok) throw new Error("passport");
  const passport = (await rp.json()) as Omit<Pasaporte, "places">;
  const places = rl.ok ? ((await rl.json()) as Place[]) : [];
  const visits = [...passport.visits].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return { ...passport, visits, places: Array.isArray(places) ? places : [] };
}

export default function PasaportePage() {
  const [datos, setDatos] = useState<Pasaporte | null>(null);

  useEffect(() => {
    let vigente = true;
    cargarPasaporte()
      .catch(() => PASAPORTE_MOCK)
      .then((d) => {
        if (vigente) setDatos(d);
      });
    return () => {
      vigente = false;
    };
  }, []);

  if (!datos) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-6 bg-gray-50 px-6 pt-16">
        <div className="h-44 animate-pulse rounded-3xl bg-blue-200/60" />
        <div className="h-20 animate-pulse rounded-2xl bg-gray-200" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-24 animate-pulse rounded-2xl bg-gray-200" />
          <div className="h-24 animate-pulse rounded-2xl bg-gray-200" />
        </div>
      </main>
    );
  }

  const { profile, visits, rewards, places } = datos;
  const lugar = (id: string) => places.find((p) => p.id === id);

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
        <span className="text-xs bg-purple-50 text-purple-700 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
          Pasaporte Digital
        </span>
      </header>

      <div className="px-6 mb-6 max-w-lg mx-auto w-full">
        {/* Tarjeta de Identidad */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-3xl p-7 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden">
          {/* Patrón de fondo */}
          <div className="absolute -right-10 -top-10 w-40 h-40 border-[20px] border-white/10 rounded-full opacity-50 pointer-events-none"></div>

          <div className="relative z-10">
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">
              Explorador Jarocho
            </span>
            <h2 className="text-3xl font-black mt-4 mb-6 truncate">{profile.alias}</h2>

            <div className="flex justify-between items-end">
              <div>
                <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">
                  Puntos Acumulados
                </p>
                <p className="text-5xl font-black text-yellow-400 drop-shadow-md">
                  {profile.points}
                </p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30 text-2xl shadow-inner">
                🏆
              </div>
            </div>
          </div>
        </div>
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
            <h3 className="font-black text-gray-800 text-base">
              Sellos de Visita ({visits.length})
            </h3>
            <span className="text-[11px] font-semibold text-emerald-600">Verificados por QR</span>
          </div>

          {visits.length === 0 && (
            <Link
              href="/escanear"
              className="block rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center text-sm text-gray-500"
            >
              Aún no tienes sellos. <span className="font-bold text-blue-600">Escanea tu primer QR →</span>
            </Link>
          )}
          <div className="grid grid-cols-2 gap-3">
            {visits.map((visit) => {
              const place = lugar(visit.placeId);
              return (
                <div
                  key={visit.id}
                  className="p-3.5 bg-white border border-gray-100 rounded-2xl shadow-xs text-center flex flex-col items-center"
                >
                  <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center text-sm mb-2">
                    ✓
                  </div>
                  <h4 className="font-bold text-xs text-gray-900 line-clamp-1">
                    {place?.name || "Lugar del Centro"}
                  </h4>
                  <span className="text-[10px] font-bold text-blue-600 mt-0.5">
                    {visit.pointsAwarded > 0
                      ? `+${visit.pointsAwarded} pts`
                      : new Date(visit.createdAt).toLocaleString("es-MX", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                          timeZone: "America/Mexico_City",
                        })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recompensas disponibles */}
        <div>
          <h3 className="font-black text-gray-800 mb-3 text-base">Recompensas para canjear</h3>
          <div className="space-y-2.5">
            {rewards.map((reward) => {
              const alcanza = profile.points >= reward.pointsCost;
              return (
              <div
                key={reward.id}
                className="p-4 bg-white rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="font-bold text-xs text-gray-900 leading-snug">{reward.title}</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">{reward.conditions}</p>
                </div>
                <span
                  className={`font-black text-xs px-2.5 py-1 rounded-lg shrink-0 ${
                    alcanza ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"
                  }`}
                >
                  {alcanza ? "✓ " : ""}
                  {reward.pointsCost} pts
                </span>
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
