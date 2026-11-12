"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Mapa } from "@/components/mapa";
import { es } from "@/lib/i18n/es";
import type { RouteStop } from "@/lib/types";

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
} from "@/components/paneles/icons";

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
      setCargando(false);
    }, 0);

    // Limpieza del efecto
    return () => clearTimeout(timer);
  }, []);

  /** Puntos de la ruta, en el orden en que se visitarán. */
  const puntos: PuntoRuta[] = useMemo(
    () =>
      stops.map((stop) => ({
        lat: stop.place.lat,
        lng: stop.place.lng,
        nombre: stop.place.name,
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-bold text-gray-500">
        {es.ruta.calculando}
      </div>
    );
  }

  if (stops.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <CompassIcon className="w-10 h-10 text-blue-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">{es.ruta.sinRuta}</h2>
        <p className="text-gray-500 mb-6">{es.ruta.sinRutaAyuda}</p>
        <Link
          href="/inicio"
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-md active:scale-95 transition-all"
        >
          {es.ruta.irAlInicio}
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-blue-200">
      <header className="bg-white px-5 py-4 shadow-sm z-20 sticky top-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <RouteIcon className="w-6 h-6 text-blue-600" />
              {es.ruta.titulo}
            </h1>
            <p className="text-gray-500 font-medium text-sm mt-1">
              {stops.length} {es.ruta.subtitulo} {minutosTotales} {es.ruta.minutos}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMapaVisible((v) => !v)}
            aria-expanded={mapaVisible}
            aria-label={es.ruta.verMapa}
            className={`shrink-0 w-11 h-11 rounded-xl border flex items-center justify-center transition-colors ${
              mapaVisible
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-200 active:bg-gray-50"
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
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-bold text-sm active:scale-[0.98] transition-transform shadow-sm shadow-blue-200"
          >
            <GoogleMapsIcon className="w-4 h-4" />
            {es.ruta.abrirRutaEnMaps}
          </a>
          <button
            type="button"
            onClick={copiarEnlace}
            className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 py-2.5 rounded-xl font-bold text-xs border border-gray-200 active:bg-gray-50 transition-colors"
          >
            <LinkIcon className="w-4 h-4" />
            {enlaceCopiado ? es.ruta.enlaceCopiado : es.ruta.copiarEnlace}
          </button>
          {!rutaEnMaps.completa && (
            <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
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
            className="h-64 w-full rounded-2xl overflow-hidden shadow-sm"
          />
          <p className="text-[11px] text-gray-500 mt-1.5 px-1">
            {es.mapa.trazoAproximado} · {es.mapa.fuente}: OpenStreetMap
          </p>
        </div>
      )}

      <div className="flex-1 p-5 space-y-4 relative max-w-lg mx-auto w-full">
        {/* Línea que une las paradas */}
        <div
          className="absolute left-[2.05rem] top-8 bottom-8 w-0.5 bg-gray-200 z-0"
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
                  className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm mt-1 ${
                    esEvento
                      ? "bg-purple-600 text-white shadow-purple-200"
                      : "bg-blue-600 text-white shadow-blue-200"
                  }`}
                >
                  {index + 1}
                </div>

                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setDetalleAbierto(abierto ? null : stop.place.id)}
                    aria-expanded={abierto}
                    className="w-full text-left p-4 active:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-3 mb-2">
                      <h3 className="font-bold text-gray-900 leading-snug">
                        {stop.place.name}
                      </h3>
                      <ChevronDownIcon
                        className={`w-4 h-4 text-gray-400 shrink-0 mt-1 transition-transform ${
                          abierto ? "rotate-180" : ""
                        }`}
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 mb-3">
                      <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md font-semibold uppercase">
                        {es.ruta.categoria[categoria] ?? stop.place.category}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <WalkIcon className="w-3.5 h-3.5" />
                        {stop.etaMin} {es.ruta.minutos} {es.ruta.aPie}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <ClockIcon className="w-3.5 h-3.5" />
                        {avgVisitMin} {es.ruta.minVisita}
                      </span>
                    </div>

                    <p className="text-gray-700 text-sm leading-relaxed bg-blue-50 p-3 rounded-xl border border-blue-100">
                      {stop.reason}
                    </p>
                  </button>

                  {/* Detalle desplegable */}
                  {abierto && (
                    <div className="border-t border-gray-100 p-4 space-y-3 bg-gray-50/60">
                      {stop.place.description && (
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {stop.place.description}
                        </p>
                      )}

                      {stop.eventName && (
                        <p className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 inline-flex items-center gap-1.5">
                          <TargetIcon className="w-3.5 h-3.5" />
                          {es.ruta.evento}: {stop.eventName}
                        </p>
                      )}

                      <a
                        href={enlaceLugar({
                          lat: stop.place.lat,
                          lng: stop.place.lng,
                          nombre: stop.place.name,
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 py-2.5 rounded-xl font-bold text-xs border border-gray-200 active:bg-gray-50 transition-colors"
                      >
                        <GoogleMapsIcon className="w-4 h-4" />
                        {es.ruta.abrirEnMaps}
                      </a>

                      {stop.missionId && (
                        <Link
                          href={`/mision/${stop.missionId}`}
                          className="w-full flex items-center justify-center gap-2 bg-orange-100 text-orange-700 py-3 rounded-xl font-bold text-sm hover:bg-orange-200 active:scale-[0.98] transition-all shadow-sm"
                        >
                          <TargetIcon className="w-4 h-4" />
                          {es.ruta.verMision}
                        </Link>
                      )}
                    </div>
                  )}

                  {/* Misión disponible: visible sin desplegar */}
                  {!abierto && stop.missionId && (
                    <div className="px-4 pb-4">
                      <Link
                        href={`/mision/${stop.missionId}`}
                        className="w-full flex items-center justify-center gap-2 bg-orange-100 text-orange-700 py-3 rounded-xl font-bold text-sm hover:bg-orange-200 active:scale-[0.98] transition-all shadow-sm"
                      >
                        <TargetIcon className="w-4 h-4" />
                        {es.ruta.verMision}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <nav className="bg-white border-t border-gray-100 p-4 pb-8 flex gap-3 max-w-lg mx-auto w-full sticky bottom-0 z-20">
        <Link
          href="/inicio"
          className="flex-1 text-center py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold active:bg-gray-200 transition-colors"
        >
          {es.ruta.modificar}
        </Link>
        <Link
          href="/pasaporte"
          className="flex-[2] text-center py-4 bg-gray-900 text-white rounded-2xl font-bold shadow-md active:scale-95 transition-all"
        >
          {es.ruta.verPasaporte}
        </Link>
      </nav>
    </main>
  );
}
