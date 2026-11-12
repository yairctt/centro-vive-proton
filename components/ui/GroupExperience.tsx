"use client";

import React, { useState, useEffect } from "react";
import { UsersIcon, TrophyIcon, CheckIcon, SparklesIcon, ShareIcon } from "@/components/paneles/icons";
import {
  obtenerGrupo,
  guardarGrupo,
  salirDeGrupo,
  unirseAGrupoPorCodigo,
  type GrupoViaje,
  registrarCheckinGrupo,
} from "@/lib/grupo";

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
          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-white transition px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer"
        >
          <ShareIcon className="w-3 h-3" />
          <span>{copiado ? (lang === "en" ? "Code Copied!" : "¡Código Copiado!") : (lang === "en" ? `Share Code (${grupo.codigo})` : `Copiar Código (${grupo.codigo})`)}</span>
        </button>
      </div>

      <div className="mt-2 text-center text-[10px] text-teal-200/80">
        {lang === "en"
          ? "Invite others: share this code so they join your contingent from their own device."
          : "Invita a tus compañeros: comparte este código para que se unan a tu contingente desde su celular."}
      </div>
    </div>
  );
}

/**
 * Componente interactivo para unirse a un grupo grande o pequeño existente
 * al copiar/pegar un código de grupo (ej: JAROCHO-482, CONTINGENTE-24).
 */
export function JoinGroupCard({
  lang = "es",
  onGroupJoined,
  onGroupLeft,
}: {
  lang?: "es" | "en";
  onGroupJoined?: (grupo: GrupoViaje) => void;
  onGroupLeft?: () => void;
}) {
  const [grupoActivo, setGrupoActivo] = useState<GrupoViaje | null>(null);
  const [codigoInput, setCodigoInput] = useState("");
  const [aliasInput, setAliasInput] = useState(lang === "en" ? "You" : "Tú");
  const [cargando, setCargando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    setGrupoActivo(obtenerGrupo());

    const onGrupoChanged = (e: Event) => {
      const custom = e as CustomEvent<GrupoViaje | null>;
      setGrupoActivo(custom.detail ?? null);
    };
    if (typeof window !== "undefined") {
      window.addEventListener("pulso_grupo_changed", onGrupoChanged);
      return () => window.removeEventListener("pulso_grupo_changed", onGrupoChanged);
    }
  }, []);

  const handleUnirse = (codigoAUsar?: string) => {
    const cod = (codigoAUsar || codigoInput).trim();
    if (!cod) {
      setError(lang === "en" ? "Please enter or paste a group code." : "Por favor escribe o pega un código de grupo.");
      return;
    }
    setError(null);
    setCargando(true);

    setTimeout(() => {
      const g = unirseAGrupoPorCodigo(cod, aliasInput.trim() || (lang === "en" ? "You" : "Tú"));
      setGrupoActivo(g);
      setCargando(false);
      setMensajeExito(
        lang === "en"
          ? `Joined "${g.nombre}" (${g.tamano} members)!`
          : `¡Te has unido a "${g.nombre}" (${g.tamano} integrantes)!`
      );
      setCodigoInput("");
      onGroupJoined?.(g);
      setTimeout(() => setMensajeExito(null), 4000);
    }, 400);
  };

  const handlePegarPortapapeles = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (text) {
          const match = text.match(/([A-Z0-9]+-[A-Z0-9]+)/i);
          const cod = match ? match[1] : text.trim();
          setCodigoInput(cod.toUpperCase());
          handleUnirse(cod.toUpperCase());
        }
      }
    } catch {
      setError(
        lang === "en"
          ? "Clipboard read blocked by browser. Please type or paste manually into the field."
          : "El navegador bloqueó la lectura del portapapeles. Pégalo directamente en la caja de texto."
      );
    }
  };

  const handleSalir = () => {
    salirDeGrupo();
    setGrupoActivo(null);
    onGroupLeft?.();
  };

  const handleCopiarCodigo = () => {
    if (grupoActivo && typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(grupoActivo.codigo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  return (
    <div className="rounded-2xl border border-amber-300/80 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-teal-500/10 p-4 dark:border-amber-700/60 dark:bg-neutral-900 shadow-xs space-y-3">
      {/* Si el usuario ya está en un grupo */}
      {grupoActivo ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-amber-200/60 dark:border-amber-800/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-neutral-950 font-black shadow-xs">
                <UsersIcon className="h-4 w-4" />
              </span>
              <div>
                <span className="inline-block rounded-full bg-emerald-600/90 text-white text-[10px] font-black px-2 py-0.2">
                  {lang === "en" ? "ACTIVE GROUP" : "GRUPO ACTIVO"}
                </span>
                <h4 className="text-sm font-black text-neutral-900 dark:text-neutral-100 leading-tight">
                  {grupoActivo.nombre}
                </h4>
              </div>
            </div>

            <div className="text-right">
              <span className="font-mono text-xs font-black text-amber-700 dark:text-amber-400">
                {grupoActivo.puntosBoteGrupal} pts
              </span>
              <div className="text-[10px] text-neutral-500">
                {lang === "en" ? "Shared pool" : "Bote grupal"}
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white/80 dark:bg-neutral-800/80 p-3 border border-amber-200/80 dark:border-amber-900/60 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide block">
                {lang === "en" ? "Your Group Invite Code:" : "Código para invitar a otros:"}
              </span>
              <span className="font-mono text-base font-black tracking-wider text-teal-800 dark:text-teal-300">
                {grupoActivo.codigo}
              </span>
              <span className="text-[11px] text-neutral-500 block">
                {grupoActivo.tamano} {lang === "en" ? "members in contingent" : "personas en el contingente"}
              </span>
            </div>

            <div className="flex flex-col gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleCopiarCodigo}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs shadow-2xs cursor-pointer transition active:scale-95"
              >
                <ShareIcon className="w-3.5 h-3.5" />
                <span>{copiado ? (lang === "en" ? "Copied!" : "¡Copiado!") : (lang === "en" ? "Copy Code" : "Copiar código")}</span>
              </button>

              <button
                type="button"
                onClick={handleSalir}
                className="text-[10px] font-bold text-neutral-500 hover:text-rose-600 dark:hover:text-rose-400 text-right cursor-pointer underline underline-offset-2"
              >
                {lang === "en" ? "Leave group" : "Salir del grupo"}
              </button>
            </div>
          </div>

          <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {lang === "en"
              ? "Your checkpoints and scans are synced with your group. Counter perks are ready to be claimed together!"
              : "Tus escaneos y paradas están sincronizados. ¡Los beneficios en comercios se desbloquean para todos!"}
          </p>
        </div>
      ) : (
        /* Formulario para ingresar o pegar el código */
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-neutral-950 font-black">
              <UsersIcon className="h-4 w-4" />
            </span>
            <div>
              <h4 className="text-sm font-black text-neutral-900 dark:text-neutral-100">
                {lang === "en" ? "Join a Group with Code" : "¿Tienes un código de grupo?"}
              </h4>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                {lang === "en"
                  ? "Paste the code shared with you to join your crew or contingent."
                  : "Pega el código que te compartieron para unirte a tu contingente o amigos."}
              </p>
            </div>
          </div>

          {mensajeExito && (
            <div className="p-2.5 rounded-xl bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 animate-bounce">
              <SparklesIcon className="w-4 h-4 shrink-0" />
              <span>{mensajeExito}</span>
            </div>
          )}

          {error && (
            <div className="p-2 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                placeholder={lang === "en" ? "E.g. JAROCHO-482 or CONTINGENT-24" : "Ej. JAROCHO-482 o CONTINGENTE-24"}
                className="flex-1 font-mono uppercase text-xs font-bold px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />

              <button
                type="button"
                onClick={handlePegarPortapapeles}
                className="px-3 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
                title={lang === "en" ? "Paste code from clipboard" : "Pegar código del portapapeles"}
              >
                <span>📋</span>
                <span className="hidden sm:inline">{lang === "en" ? "Paste" : "Pegar"}</span>
              </button>

              <button
                type="button"
                onClick={() => handleUnirse()}
                disabled={cargando}
                className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white text-xs font-black transition flex items-center gap-1 shrink-0 shadow-sm cursor-pointer active:scale-95"
              >
                {cargando
                  ? (lang === "en" ? "Joining…" : "Uniéndote…")
                  : (lang === "en" ? "Join Group" : "Unirme")}
              </button>
            </div>

            {/* Códigos de prueba rápida para la demo del jurado */}
            <div className="pt-1">
              <span className="text-[10px] font-bold text-neutral-500 block mb-1.5">
                {lang === "en" ? "Demo quick-test group codes:" : "Códigos de prueba rápida (Demo):"}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { cod: "CONTINGENTE-24", label: lang === "en" ? "Large Contingent (24p)" : "Gran Contingente (24p)" },
                  { cod: "JAROCHO-842", label: lang === "en" ? "Tour Group (6p)" : "Grupo de Amigos (6p)" },
                  { cod: "TOUR-50", label: lang === "en" ? "Tour Bus (50p)" : "Excursión Bus (50p)" },
                ].map((demo) => (
                  <button
                    key={demo.cod}
                    type="button"
                    onClick={() => {
                      setCodigoInput(demo.cod);
                      handleUnirse(demo.cod);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-amber-100/80 hover:bg-amber-200 text-amber-950 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800 cursor-pointer transition active:scale-95"
                  >
                    <span>🔑 {demo.cod}</span>
                    <span className="text-[9px] text-amber-800/80 dark:text-amber-300">({demo.label})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
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

