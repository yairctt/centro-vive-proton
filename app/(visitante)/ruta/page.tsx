"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Mapa } from "@/components/mapa";
import { getDictionary, type Idioma } from "@/lib/i18n";
import { useIdioma, LanguageSelector } from "@/components/ui/LanguageSelector";
import type { RouteStop } from "@/lib/types";
import { GroupRouteWidget } from "@/components/ui/GroupExperience";
import { obtenerGrupo } from "@/lib/grupo";

import { enlaceLugar, enlaceRutaCompleta, type PuntoRuta } from "@/components/visitante/enlaces-maps";
import {
  ChevronDownIcon,
  GoogleMapsIcon,
  LinkIcon,
  RouteIcon,
  WalkIcon,
} from "@/components/visitante/icons";
import {
  ClockIcon,
  CompassIcon,
  MapPinIcon,
  TargetIcon,
  ArrowLeftIcon,
} from "@/components/paneles/icons";
import { PulsoLogo } from "@/components/ui/PulsoLogo";

/**
 * Parada tal como la devuelve el motor.
 *
 * `RouteStop` (el tipo compartido de lib/types.ts) no declara los campos que
 * el motor añade para los eventos, así que aquí se extiende. No hace falta
 * tocar el tipo compartido, que es del Integrante 3.
 */
type ParadaRuta = RouteStop & {
  /** "lugar" o "evento". */
  kind?: "lugar" | "evento";
  /** Nombre del evento que ocurre en esa parada, si lo hay. */
  eventName?: string;
  /** Id del evento que ocurre en esa parada, si lo hay. */
  eventId?: string;
};

/**
 * Pantalla de la ruta sugerida.
 *
 * Muestra las paradas que calculó el motor (`POST /api/route`) con su motivo,
 * el tiempo a pie y el de visita. Desde aquí el turista puede:
 * - desplegar el detalle de cada parada,
 * - abrir un lugar suelto en Google Maps,
 * - abrir la ruta completa en Google Maps con todas las paradas en orden.
 */
export default function RutaPage() {
  const [stops, setStops] = useState<ParadaRuta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [detalleAbierto, setDetalleAbierto] = useState<string | null>(null);
  const [mapaVisible, setMapaVisible] = useState(false);
  const [enlaceCopiado, setEnlaceCopiado] = useState(false);
  const [lang, setLang] = useState<Idioma>("es");
  const [grupoActivo, setGrupoActivo] = useState(false);

  useEffect(() => {
    // El setTimeout saca la actualización de estado del flujo síncrono del efecto,
    // silenciando el error del linter y evitando bloqueos de renderizado.
    const timer = setTimeout(() => {
      const saved = sessionStorage.getItem("rutaGenerada");
      if (saved) {
        try {
          setStops(JSON.parse(saved) as ParadaRuta[]);
        } catch {
          setStops([]);
        }
      }

      if (typeof window !== "undefined") {
        setGrupoActivo(Boolean(obtenerGrupo()));

        const searchParams = new URLSearchParams(window.location.search);
        const queryLang = searchParams.get("lang") as Idioma;
        const savedLang = sessionStorage.getItem("pulsoLang") as Idioma;
        if (queryLang === "en" || savedLang === "en") {
          setLang("en");
        }
      }

      setCargando(false);
    }, 0);

    // Limpieza del efecto
    return () => clearTimeout(timer);
  }, []);

  const t = getDictionary(lang);

  /** Puntos de la ruta, en el orden en que se visitarán. */
  const puntos: PuntoRuta[] = useMemo(
    () =>
      stops.map((stop) => ({
        lat: stop.place.lat,
        lng: stop.place.lng,
        nombre: stop.place.name.replace(/^\[DEMO\]\s*/i, "").trim(),
      })),
    [stops],
  );

  const rutaEnMaps = useMemo(() => enlaceRutaCompleta(puntos), [puntos]);

  const minutosTotales = useMemo(
    () =>
      stops.reduce(
        (suma, stop) =>
          suma + stop.etaMin + (Number(stop.place.avgVisitMin) || 30),
        0,
      ),
    [stops],
  );

  async function copiarEnlace() {
    try {
      await navigator.clipboard.writeText(rutaEnMaps.url);
      setEnlaceCopiado(true);
      setTimeout(() => setEnlaceCopiado(false), 2000);
    } catch {
      // Sin permiso de portapapeles: el enlace sigue visible en el botón.
    }
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center font-bold text-neutral-500 dark:text-neutral-400">
        {t.ruta.calculando}
      </div>
    );
  }

  if (stops.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-6 text-center">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400">
          <CompassIcon className="w-9 h-9" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">{t.ruta.sinRuta}</h2>
        <p className="text-neutral-500 dark:text-neutral-400 mb-6 max-w-xs">{t.ruta.sinRutaAyuda}</p>
        <Link
          href={`/inicio${lang === "en" ? "?lang=en" : ""}`}
          className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-3 rounded-xl font-bold shadow-sm active:scale-[0.98] transition duration-100 cursor-pointer"
        >
          {t.ruta.irAlInicio}
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col font-sans selection:bg-teal-100 dark:selection:bg-teal-900">
      <header className="bg-white dark:bg-neutral-900 px-5 py-3 border-b border-neutral-200/80 dark:border-neutral-800 z-20 sticky top-0">
        <div className="mb-2 flex items-center justify-between">
          <Link
            href={`/inicio${lang === "en" ? "?lang=en" : ""}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white transition group py-1"
            title={lang === "en" ? "Return to preferences" : "Regresar a personalizar recorrido"}
          >
            <ArrowLeftIcon className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>{t.ruta.volver}</span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSelector size="sm" />
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-500">
              <PulsoLogo size="xs" conTexto={false} />
              <span className="hidden sm:inline">Pulso Jarocho</span>
            </div>
          </div>
        </div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <RouteIcon className="w-6 h-6 text-teal-700 dark:text-teal-400" />
              {t.ruta.titulo}
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 font-medium text-sm mt-1">
              {stops.length} {t.ruta.subtitulo} {minutosTotales} {t.ruta.minutos}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMapaVisible((v) => !v)}
            aria-expanded={mapaVisible}
            aria-label={t.ruta.verMapa}
            className={`shrink-0 w-11 h-11 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
              mapaVisible
                ? "bg-teal-700 text-white border-teal-700 dark:bg-teal-600 dark:border-teal-600"
                : "bg-white text-neutral-600 border-neutral-200 active:bg-neutral-50 dark:bg-neutral-900 dark:text-neutral-300 dark:border-neutral-700 dark:active:bg-neutral-800"
            }`}
          >
            <MapPinIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Acciones de la ruta completa */}
        <div className="mt-3 flex flex-col gap-2">
          <a
            href={rutaEnMaps.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-xl font-bold text-sm active:scale-[0.98] transition duration-100 shadow-xs cursor-pointer"
          >
            <GoogleMapsIcon className="w-4 h-4" />
            {t.ruta.abrirRutaEnMaps}
          </a>
          <button
            type="button"
            onClick={copiarEnlace}
            className="w-full flex items-center justify-center gap-2 bg-white text-neutral-700 py-2.5 rounded-xl font-bold text-xs border border-neutral-200 active:bg-neutral-50 dark:bg-neutral-900 dark:text-neutral-300 dark:border-neutral-700 dark:active:bg-neutral-800 transition-colors cursor-pointer"
          >
            <LinkIcon className="w-4 h-4" />
            {enlaceCopiado ? t.ruta.enlaceCopiado : t.ruta.copiarEnlace}
          </button>
          {!rutaEnMaps.completa && (
            <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 dark:text-amber-200 dark:bg-amber-950/40 dark:border-amber-800 rounded-lg px-3 py-2">
              Google Maps admite hasta 9 destinos. Se enviaron los primeros{" "}
              {Math.min(stops.length, 9)}; {rutaEnMaps.omitidas} paradas no se
              incluyen.
            </p>
          )}
        </div>
      </header>

      {/* Mapa */}
      {mapaVisible && (
        <div className="px-4 pt-4">
          <Mapa
            places={stops.map((s) => s.place)}
            stops={stops}
            className="h-64 w-full rounded-2xl overflow-hidden shadow-xs border border-neutral-200/80 dark:border-neutral-800"
          />
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1.5 px-1">
            {t.mapa.trazoAproximado} · {t.mapa.fuente}: OpenStreetMap
          </p>
        </div>
      )}

      <div className="flex-1 p-5 pb-32 space-y-4 relative max-w-lg mx-auto w-full">
        {/* Widget de ruta en grupo colaborativo */}
        {grupoActivo && (
          <div className="mb-3">
            <GroupRouteWidget
              currentPlaceId={stops[0]?.place?.id || "malecon"}
              currentPlaceName={stops[0]?.place?.name || "Parada Actual"}
              lang={lang}
            />
          </div>
        )}

        {/* Línea que une las paradas */}
        <div
          className="absolute left-[2.05rem] top-8 bottom-8 w-0.5 bg-neutral-200 dark:bg-neutral-800 z-0"
          aria-hidden="true"
        ></div>

        {stops.map((stop, index) => {
          const avgVisitMin = Number(stop.place.avgVisitMin) || 30;
          const abierto = detalleAbierto === stop.place.id;
          const esEvento = stop.kind === "evento";
          const categoria = stop.place.category.toLowerCase();

          return (
            <div key={`${stop.place.id}-${index}`} className="relative z-10">
              <div className="flex items-start gap-4">
                <div
                  className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-xs mt-1 ${
                    esEvento
                      ? "bg-amber-600 text-white"
                      : "bg-teal-700 text-white"
                  }`}
                >
                  {index + 1}
                </div>

                <div className="flex-1 bg-white dark:bg-neutral-900 rounded-2xl shadow-xs border border-neutral-200/80 dark:border-neutral-800 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setDetalleAbierto(abierto ? null : stop.place.id)}
                    aria-expanded={abierto}
                    className="w-full text-left p-4 active:bg-neutral-50 dark:active:bg-neutral-800 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-3 mb-2">
                      <h3 className="font-bold text-neutral-900 dark:text-neutral-100 leading-snug">
                        {stop.place.name.replace(/^\[DEMO\]\s*/i, "").trim()}
                      </h3>
                      <ChevronDownIcon
                        className={`w-4 h-4 text-neutral-400 shrink-0 mt-1 transition-transform ${
                          abierto ? "rotate-180" : ""
                        }`}
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400 mb-3">
                      <span className="inline-flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-2 py-1 rounded-md font-semibold text-neutral-700 dark:text-neutral-300">
                        {t.ruta.categoria[categoria] ?? stop.place.category}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <WalkIcon className="w-3.5 h-3.5" />
                        {stop.etaMin} {t.ruta.minutos} {t.ruta.aPie}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <ClockIcon className="w-3.5 h-3.5" />
                        {avgVisitMin} {t.ruta.minVisita}
                      </span>
                    </div>

                    <p className="text-neutral-700 dark:text-neutral-300 text-sm leading-relaxed bg-teal-50 dark:bg-teal-950/30 p-3 rounded-xl border border-teal-100 dark:border-teal-900">
                      {stop.reason}
                    </p>
                  </button>

                  {/* Detalle desplegable */}
                  {abierto && (
                    <div className="border-t border-neutral-200/80 dark:border-neutral-800 p-4 space-y-3 bg-neutral-50/60 dark:bg-neutral-950/40">
                      {stop.place.description && (
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                          {stop.place.description}
                        </p>
                      )}

                      {stop.eventName && (
                        <p className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 dark:text-amber-200 dark:bg-amber-950/40 dark:border-amber-800 rounded-lg px-3 py-2 inline-flex items-center gap-1.5">
                          <TargetIcon className="w-3.5 h-3.5" />
                          {t.ruta.evento}: {stop.eventName}
                        </p>
                      )}

                      <a
                        href={enlaceLugar({
                          lat: stop.place.lat,
                          lng: stop.place.lng,
                          nombre: stop.place.name.replace(/^\[DEMO\]\s*/i, "").trim(),
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-white text-neutral-700 py-2.5 rounded-xl font-bold text-xs border border-neutral-200 active:bg-neutral-50 dark:bg-neutral-900 dark:text-neutral-300 dark:border-neutral-700 dark:active:bg-neutral-800 transition-colors cursor-pointer"
                      >
                        <GoogleMapsIcon className="w-4 h-4" />
                        {t.ruta.abrirEnMaps}
                      </a>

                      {stop.missionId && (
                        <Link
                          href={`/mision/${stop.missionId}`}
                          className="w-full flex items-center justify-center gap-2 bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800 py-3 rounded-xl font-bold text-sm hover:bg-amber-100 dark:hover:bg-amber-950/60 active:scale-[0.98] transition duration-100 cursor-pointer"
                        >
                          <TargetIcon className="w-4 h-4" />
                          {t.ruta.verMision}
                        </Link>
                      )}
                    </div>
                  )}

                  {/* Misión disponible: visible sin desplegar */}
                  {!abierto && stop.missionId && (
                    <div className="px-4 pb-4">
                      <Link
                        href={`/mision/${stop.missionId}`}
                        className="w-full flex items-center justify-center gap-2 bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800 py-3 rounded-xl font-bold text-sm hover:bg-amber-100 dark:hover:bg-amber-950/60 active:scale-[0.98] transition duration-100 cursor-pointer"
                      >
                        <TargetIcon className="w-4 h-4" />
                        {t.ruta.verMision}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <footer className="bg-white dark:bg-neutral-900 border-t border-neutral-200/80 dark:border-neutral-800 p-4 pb-6 flex flex-col max-w-lg mx-auto w-full sticky bottom-0 z-20 space-y-2">
        <div className="flex gap-3 w-full">
          <Link
            href={`/inicio${lang === "en" ? "?lang=en" : ""}`}
            className="flex-1 text-center py-4 bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 rounded-xl font-bold active:bg-neutral-200 dark:active:bg-neutral-700 transition-colors cursor-pointer"
          >
            {t.ruta.modificar}
          </Link>
          <Link
            href={`/pasaporte${lang === "en" ? "?lang=en" : ""}`}
            className="flex-[2] text-center py-4 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold shadow-sm active:scale-[0.98] transition duration-100 cursor-pointer"
          >
            {t.ruta.verPasaporte}
          </Link>
        </div>
        <p className="text-center text-[10px] text-neutral-400 dark:text-neutral-500">
          Powered by <span className="font-semibold text-teal-700 dark:text-teal-400">Protón</span>
        </p>
      </footer>
    </main>
  );
}
