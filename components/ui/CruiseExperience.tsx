"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShipIcon, GlobeIcon, ClockIcon, MapPinIcon, ShieldCheckIcon, SparklesIcon, ArrowRightIcon } from "@/components/paneles/icons";
import { getDictionary, getSavedLanguage, setSavedLanguage, type Idioma } from "@/lib/i18n";

interface CruiseBannerProps {
  onLanguageChange?: (lang: Idioma) => void;
  className?: string;
}

export function CruiseBanner({ onLanguageChange, className = "" }: CruiseBannerProps) {
  const [lang, setLang] = useState<Idioma>("es");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setLang(getSavedLanguage());
  }, []);

  const handleLangToggle = (newLang: Idioma) => {
    setLang(newLang);
    setSavedLanguage(newLang);
    if (onLanguageChange) onLanguageChange(newLang);
  };

  const t = getDictionary(lang);

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-teal-500/40 bg-gradient-to-br from-teal-950 via-teal-900 to-sky-950 p-5 text-white shadow-xl ${className}`}
    >
      {/* Fondo con curvas decorativas náuticas */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-teal-400/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-amber-400/10 blur-xl" />

      {/* Cabecera del Banner */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/30">
            <ShipIcon className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-300 border border-amber-400/30">
                {lang === "en" ? "Giro del Reto · Cruise in Port" : "Giro del Reto · Crucero en Puerto"}
              </span>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-teal-200">
                3,000 Pax · 5h
              </span>
            </div>
            <h2 className="mt-1 text-base font-black text-white sm:text-lg">
              {lang === "en" ? "Cruise Passenger Express Tour" : "Ruta Express Pasajeros de Crucero"}
            </h2>
          </div>
        </div>

        {/* Selector de Idioma Rápido */}
        <div className="inline-flex rounded-xl bg-neutral-900/60 p-1 border border-white/15">
          <button
            type="button"
            onClick={() => handleLangToggle("es")}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
              lang === "es"
                ? "bg-teal-600 text-white shadow-xs"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <span>🇲🇽</span>
            <span>ES</span>
          </button>
          <button
            type="button"
            onClick={() => handleLangToggle("en")}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
              lang === "en"
                ? "bg-teal-600 text-white shadow-xs"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <span>🇺🇸</span>
            <span>EN</span>
          </button>
        </div>
      </div>

      {/* Descripción concisa adaptada al idioma */}
      <p className="relative z-10 mt-3 text-xs leading-relaxed text-teal-100/90 sm:text-sm">
        {lang === "en"
          ? "Welcome to Veracruz! You have only 5 hours on shore. Explore historic highlights, enjoy exclusive perks at local shops, and return safely to your ship on time."
          : "¡Bienvenidos al Puerto de Veracruz! Con solo 5 horas en tierra, esta ruta optimizada en inglés lleva a los 3,000 cruceristas a negocios locales con regreso garantizado al muelle."}
      </p>

      {/* Características clave del tour express */}
      <div className="relative z-10 mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-white/10 p-2.5 backdrop-blur-xs border border-white/10">
          <ClockIcon className="mx-auto h-4 w-4 text-amber-300" />
          <div className="mt-1 text-[11px] font-black text-white">5 Horas Max</div>
          <div className="text-[10px] text-teal-200">
            {lang === "en" ? "Ship Window" : "Tiempo límite"}
          </div>
        </div>
        <div className="rounded-xl bg-white/10 p-2.5 backdrop-blur-xs border border-white/10">
          <MapPinIcon className="mx-auto h-4 w-4 text-emerald-300" />
          <div className="mt-1 text-[11px] font-black text-white">
            {lang === "en" ? "8 min walk" : "8 min a pie"}
          </div>
          <div className="text-[10px] text-teal-200">
            {lang === "en" ? "Back to dock" : "Al muelle"}
          </div>
        </div>
        <div className="rounded-xl bg-white/10 p-2.5 backdrop-blur-xs border border-white/10">
          <SparklesIcon className="mx-auto h-4 w-4 text-amber-300" />
          <div className="mt-1 text-[11px] font-black text-white">
            {lang === "en" ? "Local Perks" : "Comercios"}
          </div>
          <div className="text-[10px] text-teal-200">
            {lang === "en" ? "Passport gifts" : "Regalos y canjes"}
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="relative z-10 mt-4 flex flex-col sm:flex-row gap-2.5">
        <Link
          href={`/inicio?mode=cruise&lang=${lang}`}
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 px-4 py-3 text-center text-xs font-black text-neutral-950 shadow-md transition hover:from-amber-400 hover:to-amber-300 active:scale-[0.98]"
        >
          <ShipIcon className="h-4 w-4" />
          <span>
            {lang === "en" ? "Start 5-Hour Cruise Tour (English)" : "Iniciar Tour 5h de Crucero (Inglés)"}
          </span>
          <ArrowRightIcon className="h-3.5 w-3.5" />
        </Link>

        <Link
          href="/admin?cruise=1"
          className="flex items-center justify-center gap-1.5 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-center text-xs font-bold text-white transition hover:bg-white/20 active:scale-[0.98]"
        >
          <ShieldCheckIcon className="h-4 w-4 text-teal-300" />
          <span>
            {lang === "en" ? "View Admin Impact (3k Pax)" : "Impacto en Tablero (3k)"}
          </span>
        </Link>
      </div>

      {/* Sello de garantía de retorno a tiempo */}
      <div className="relative z-10 mt-3 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-teal-200/90">
        <ShieldCheckIcon className="h-3.5 w-3.5 text-emerald-400" />
        <span>
          {lang === "en"
            ? "Guaranteed on-time return to Veracruz Cruise Terminal"
            : "Garantía de retorno puntual al Muelle Turístico de Veracruz"}
        </span>
      </div>
    </div>
  );
}

/**
 * Widget de cuenta regresiva de embarque y retorno al muelle
 * para ser mostrado en /ruta
 */
export function CruiseCountdownWidget({ lang = "es" }: { lang?: Idioma }) {
  const [timeLeft, setTimeLeft] = useState(285); // 4h 45m en minutos

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 10 ? prev - 1 : prev));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(timeLeft / 60);
  const minutes = timeLeft % 60;

  return (
    <div className="rounded-2xl border border-amber-300 bg-amber-50/90 p-4 shadow-xs dark:border-amber-800 dark:bg-amber-950/40">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-neutral-950 font-bold shadow-xs">
            <ShipIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 dark:text-amber-300">
                {lang === "en" ? "Ship Shore Leave" : "Tiempo de escala"}
              </span>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="text-sm font-black text-neutral-900 dark:text-white">
              {lang === "en" ? "All-Aboard Countdown" : "Regreso al Crucero"}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-lg font-black text-amber-900 dark:text-amber-200 font-mono">
            {hours}h {minutes}m
          </div>
          <div className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
            {lang === "en" ? "8 min walk to dock" : "8 min a pie al muelle"}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-amber-200/80 pt-2.5 text-xs text-amber-900 dark:border-amber-800/80 dark:text-amber-200">
        <span className="font-medium">
          {lang === "en" ? "Starting dock:" : "Punto de atraque:"}
        </span>
        <span className="font-bold">
          {lang === "en" ? "Veracruz Cruise Pier (Malecón)" : "Muelle Fiscal / Malecón"}
        </span>
      </div>
    </div>
  );
}

