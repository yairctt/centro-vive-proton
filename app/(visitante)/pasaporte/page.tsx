"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { mockProfile, mockVisits, mockPlaces, mockRewards } from "@/lib/mock";
import { puntosDemo } from "@/lib/qr/mock";
import type { Profile, Reward, Visit } from "@/lib/types";

/**
 * Pasaporte digital.
 *
 * Lee los puntos del servidor (GET /api/me/passport). Si la base de datos no
 * está disponible, la pantalla cae a los datos de demostración, y en ese caso
 * los puntos son los que el escáner haya ido sumando en esta sesión: así
 * escanear un QR y volver al pasaporte muestra el total nuevo.
 */
export default function PasaportePage() {
  const [perfil, setPerfil] = useState<Profile>(mockProfile);
  const [visitas, setVisitas] = useState<Visit[]>(mockVisits);
  const [recompensas, setRecompensas] = useState<Reward[]>(mockRewards);
  const [modoDemo, setModoDemo] = useState(false);

  useEffect(() => {
    let vigente = true;

    async function cargar() {
      try {
        const res = await fetch("/api/me/passport", { cache: "no-store" });
        if (!res.ok) throw new Error("El pasaporte no está disponible");
        const datos = await res.json();
        if (!vigente) return;
        setPerfil(datos.profile);
        setVisitas(datos.visits ?? []);
        setRecompensas(datos.rewards ?? []);

        if (datos.demo) {
          // Modo demo: los puntos los lleva el navegador, no el servidor.
          setModoDemo(true);
          setPerfil({ ...datos.profile, points: puntosDemo() });
        } else {
          setModoDemo(false);
        }
      } catch {
        // Sin servidor: se usan los datos de demo y los puntos que el escáner
        // sumó en esta sesión.
        if (!vigente) return;
        setPerfil({ ...mockProfile, points: puntosDemo() });
        setVisitas(mockVisits);
        setRecompensas(mockRewards);
        setModoDemo(true);
      }
    }

    cargar();
    return () => {
      vigente = false;
    };
  }, []);

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
            <h2 className="text-3xl font-black mt-4 mb-6 truncate">{perfil.alias}</h2>

            <div className="flex justify-between items-end">
              <div>
                <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">
                  Puntos Acumulados
                </p>
                <p className="text-5xl font-black text-yellow-400 drop-shadow-md">
                  {perfil.points}
                </p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30 text-2xl shadow-inner">
                🏆
              </div>
            </div>

            {modoDemo && (
              <p className="text-[11px] text-blue-200/90 mt-3 font-medium">
                Modo demostración: los puntos se guardan en este navegador.
              </p>
            )}
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
              Sellos de Visita ({visitas.length})
            </h3>
            <span className="text-[11px] font-semibold text-emerald-600">Verificados por QR</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {visitas.map((visit) => {
              const place = mockPlaces.find((p) => p.id === visit.placeId);
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
                    +{visit.pointsAwarded} pts
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
            {recompensas.map((reward) => (
              <div
                key={reward.id}
                className="p-4 bg-white rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="font-bold text-xs text-gray-900 leading-snug">{reward.title}</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">{reward.conditions}</p>
                </div>
                <span className="bg-amber-100 text-amber-900 font-black text-xs px-2.5 py-1 rounded-lg shrink-0">
                  {reward.pointsCost} pts
                </span>
              </div>
            ))}
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
