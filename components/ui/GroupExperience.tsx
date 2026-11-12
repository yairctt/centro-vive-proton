"use client";

import React, { useState, useEffect } from "react";
import { UsersIcon, TrophyIcon, CheckIcon, SparklesIcon, ShareIcon } from "@/components/paneles/icons";
import { obtenerGrupo, guardarGrupo, type GrupoViaje, registrarCheckinGrupo } from "@/lib/grupo";

interface GroupRouteWidgetProps {
  currentPlaceId?: string;
  currentPlaceName?: string;
  lang?: "es" | "en";
}

export function GroupRouteWidget({
  currentPlaceId = "malecon",
  currentPlaceName = "Malecón de Veracruz",
  lang = "es",
}: GroupRouteWidgetProps) {
  const [grupo, setGrupo] = useState<GrupoViaje | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    setGrupo(obtenerGrupo());
  }, []);

  if (!grupo) return null;

  const miembrosListos = grupo.miembros.filter((m) => m.checkins.includes(currentPlaceId)).length;
  const progresoPct = Math.round((miembrosListos / grupo.tamano) * 100);
  const paradaCompleta = miembrosListos === grupo.tamano;

  const simularCheckinMiembro = (miembroId: string) => {
    const updated = registrarCheckinGrupo(currentPlaceId, miembroId);
    if (updated) {
      setGrupo({ ...updated });
      if (updated.miembros.every((m) => m.checkins.includes(currentPlaceId))) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 4000);
      }
    }
  };

  const copiarCodigo = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(grupo.codigo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-teal-500/40 bg-gradient-to-br from-teal-950 via-teal-900 to-sky-950 p-4 text-white shadow-md">
      {/* Cabecera del Grupo */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-neutral-950 font-black shadow-xs">
            <UsersIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                {grupo.categoria === "grande"
                  ? (lang === "en" ? "Large Tour Contingent" : "Gran Contingente")
                  : grupo.categoria === "mediano"
                  ? (lang === "en" ? "Medium Group / Family" : "Grupo Mediano / Familia")
                  : (lang === "en" ? "Small Group / Friends" : "Grupo Pequeño")}
              </span>
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-mono font-bold text-teal-200">
                {grupo.codigo} · {grupo.tamano} pers.
              </span>
            </div>
            <h3 className="text-sm font-black text-white">{grupo.nombre}</h3>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-black text-amber-300 font-mono">
            {grupo.puntosBoteGrupal} pts
          </div>
          <div className="text-[10px] text-teal-200">
            {lang === "en" ? "Shared Pool" : "Bote grupal"}
          </div>
        </div>
      </div>

      {/* Progreso del Check-in Grupal en la Parada */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="font-bold text-teal-100">
            {lang === "en" ? "Group Check-in Progress:" : "Sello Grupal en esta parada:"}
          </span>
          <span className="font-mono font-bold text-amber-300">
            {miembrosListos}/{grupo.tamano} ({progresoPct}%)
          </span>
        </div>

        {/* Barra de progreso */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-300"
            style={{ width: `${progresoPct}%` }}
          />
        </div>

        {/* Lista interactiva de miembros y sus check-ins */}
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {grupo.miembros.map((m) => {
            const listo = m.checkins.includes(currentPlaceId);
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => simularCheckinMiembro(m.id)}
                className={`flex items-center justify-between p-2 rounded-xl border text-xs font-bold transition-all text-left ${
                  listo
                    ? "bg-emerald-950/70 border-emerald-500/60 text-emerald-200"
                    : "bg-white/10 border-white/10 text-white/80 hover:bg-white/20 cursor-pointer"
                }`}
                title={listo ? "Check-in completado" : "Haz clic para validar check-in de este miembro"}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${m.color}`}>
                    {m.alias.slice(0, 1)}
                  </span>
                  <span className="truncate">{m.alias}</span>
                </div>
                {listo ? (
                  <CheckIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <span className="text-[10px] text-amber-300 shrink-0">⏳</span>
                )}
              </button>
            );
          })}
        </div>

        {grupo.tamano > grupo.miembros.length && (
          <div className="mt-2 text-center">
            <button
              type="button"
              onClick={() => {
                grupo.miembros.forEach((m) => simularCheckinMiembro(m.id));
              }}
              className="text-[11px] font-bold text-amber-300 hover:text-white underline cursor-pointer"
            >
              {lang === "en"
                ? `Validate check-in for entire contingent (${grupo.tamano} guests)`
                : `Validar check-in de todo el contingente (${grupo.tamano} personas)`}
            </button>
          </div>
        )}
      </div>

      {/* Celebración de Sello Grupal Desbloqueado */}
      {(showCelebration || paradaCompleta) && (
        <div className="mt-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 p-2.5 text-center text-xs font-black text-neutral-950 shadow-xs animate-pulse">
          🎉 {lang === "en" ? "Group Check-in Complete! +150 Shared Points unlocked!" : "¡Sello Grupal Completo! +150 Puntos al Bote y avance a Recompensa"}
        </div>
      )}

      {/* Recompensas Grupales Activas */}
      <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-teal-200">
          <TrophyIcon className="w-3.5 h-3.5 text-amber-300" />
          <span>
            {grupo.recompensas.filter((r) => r.desbloqueada).length} {lang === "en" ? "Group Perks Available" : "Recompensas Grupales"}
          </span>
        </div>

        <button
          type="button"
          onClick={copiarCodigo}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-white transition"
        >
          <ShareIcon className="w-3 h-3" />
          <span>{copiado ? (lang === "en" ? "Code Copied!" : "¡Código Copiado!") : (lang === "en" ? "Share Group Code" : "Compartir Grupo")}</span>
        </button>
      </div>
    </div>
  );
}

/**
 * Componente para mostrar las recompensas colectivas en el Pasaporte
 */
export function GroupPassportSection({ lang = "es" }: { lang?: "es" | "en" }) {
  const [grupo, setGrupo] = useState<GrupoViaje | null>(null);

  useEffect(() => {
    setGrupo(obtenerGrupo());
  }, []);

  if (!grupo) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400 text-neutral-950 font-bold">
            <TrophyIcon className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-black text-neutral-900 dark:text-neutral-100">
              {lang === "en" ? "Group Perks & Collective Rewards" : "Recompensas de Grupo Desbloqueadas"}
            </h3>
            <p className="text-[11px] text-neutral-500">
              {lang === "en"
                ? `Group: ${grupo.nombre} (${grupo.tamano} members · ${grupo.puntosBoteGrupal} pool pts)`
                : `Grupo: ${grupo.nombre} (${grupo.tamano} personas · ${grupo.puntosBoteGrupal} pts en bote)`}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        {grupo.recompensas.map((rec) => (
          <div
            key={rec.id}
            className={`p-4 rounded-2xl border transition-all ${
              rec.desbloqueada
                ? "bg-gradient-to-r from-amber-50 to-amber-100/50 border-amber-300 dark:bg-amber-950/30 dark:border-amber-800"
                : "bg-neutral-50 border-neutral-200/80 dark:bg-neutral-900 dark:border-neutral-800 opacity-60"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-400">
                  {rec.comercio}
                </span>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white leading-tight mt-0.5">
                  {rec.titulo}
                </h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                  {rec.descripcion}
                </p>
              </div>

              {rec.desbloqueada ? (
                <div className="text-right shrink-0">
                  <span className="inline-block rounded-lg bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 shadow-2xs">
                    {lang === "en" ? "UNLOCKED" : "DISPONIBLE"}
                  </span>
                  <div className="mt-1 font-mono text-xs font-black text-amber-900 dark:text-amber-300">
                    {rec.codigoCanje}
                  </div>
                </div>
              ) : (
                <div className="text-right shrink-0 text-[10px] font-bold text-neutral-500">
                  {lang === "en" ? `Need ${rec.requisitoParadas} stops` : `Faltan paradas`}
                </div>
              )}
            </div>

            {rec.desbloqueada && (
              <div className="mt-2.5 pt-2 border-t border-amber-200/80 dark:border-amber-900/50 flex items-center justify-between text-[11px] text-amber-900 dark:text-amber-300">
                <span className="font-semibold">
                  {lang === "en" ? "Show this code to server at venue" : "Muestra este código al mesero en el comercio"}
                </span>
                <span className="font-bold">
                  {lang === "en" ? "Valid for entire table" : "Válido para toda la mesa"}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

