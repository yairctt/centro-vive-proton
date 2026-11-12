"use client";

// Implementación con Leaflet. NO importar directo: usar <Mapa /> (components/mapa/Mapa.tsx),
// que lo carga con dynamic import y ssr: false.
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo } from "react";
import { CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import type { Event, Place } from "@/lib/types";
import { es } from "@/lib/i18n/es";
import { CENTRO_VERACRUZ, COLORES, TILE_ATTRIBUTION, TILE_URL, ZOOM_INICIAL } from "./config";
import type { LatLng, MapaProps } from "./types";

const t = es.mapa;

function pin(color: string, size: number, label = "", ring = false): L.DivIcon {
  const border = ring ? "3px solid #111827" : "2px solid #fff";
  return L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
    html: `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:${color};border:${border};box-shadow:0 1px 4px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;color:#fff;font:700 13px/1 system-ui,sans-serif">${label}</div>`,
  });
}

const iconos = {
  lugar: pin(COLORES.lugar, 22),
  lugarSel: pin(COLORES.lugar, 28, "", true),
  porConfirmar: pin(COLORES.porConfirmar, 22),
  porConfirmarSel: pin(COLORES.porConfirmar, 28, "", true),
  evento: pin(COLORES.evento, 22, "★"),
};
const iconoParada = (n: number, sel: boolean) => pin(COLORES.parada, sel ? 32 : 28, String(n), sel);

function formatDistancia(m: number) {
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
}

function formatHora(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", timeZone: "America/Mexico_City" });
}

function AjustarVista({ puntos }: { puntos: LatLng[] }) {
  const map = useMap();
  const clave = puntos.map((p) => `${p.lat},${p.lng}`).join("|");
  useEffect(() => {
    if (puntos.length === 0) return;
    if (puntos.length === 1) {
      map.setView([puntos[0].lat, puntos[0].lng], Math.max(map.getZoom(), ZOOM_INICIAL));
      return;
    }
    map.fitBounds(L.latLngBounds(puntos.map((p) => [p.lat, p.lng])), { padding: [32, 32], maxZoom: 17 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, clave]);
  return null;
}

function FichaLugar({ place, onSelectPlace }: { place: Place; onSelectPlace?: (p: Place) => void }) {
  const nombreLimpio = place.name.replace(/^\[DEMO\]\s*/i, "").trim();
  return (
    <div className="min-w-40 space-y-1">
      <p className="text-sm font-semibold">{nombreLimpio}</p>
      <p className="text-xs text-neutral-600">
        {place.category} · {place.verified ? t.verificado : t.porConfirmar}
      </p>
      <p className="text-xs">{place.hours ?? t.horarioPendiente}</p>
      {onSelectPlace && (
        <button
          type="button"
          onClick={() => onSelectPlace(place)}
          className="mt-1 w-full rounded-md bg-neutral-900 px-2 py-1.5 text-xs font-medium text-white"
        >
          {t.verDetalle}
        </button>
      )}
    </div>
  );
}

function FichaEvento({ event }: { event: Event }) {
  const nombreLimpio = event.name.replace(/^\[DEMO\]\s*/i, "").trim();
  return (
    <div className="min-w-40 space-y-1">
      <p className="text-sm font-semibold">{nombreLimpio}</p>
      <p className="text-xs text-neutral-600">
        {event.category} · {formatHora(event.startsAt)}
      </p>
      <div className="pt-1">
        <a
          href="/hoy"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 hover:text-teal-900 dark:text-teal-400"
        >
          Notificarme en Agenda →
        </a>
      </div>
    </div>
  );
}

function Leyenda({ conEventos, conParadas }: { conEventos: boolean; conParadas: boolean }) {
  const items: [string, string][] = [
    [COLORES.lugar, t.leyenda.lugar],
    [COLORES.porConfirmar, t.leyenda.porConfirmar],
  ];
  if (conEventos) items.push([COLORES.evento, t.leyenda.evento]);
  if (conParadas) items.push([COLORES.parada, t.leyenda.parada]);
  return (
    <div className="pointer-events-none absolute top-2 right-2 z-[1000] rounded-lg bg-white/90 px-2 py-1.5 text-[11px] text-neutral-800 shadow">
      {items.map(([color, label]) => (
        <div key={label} className="flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-full" style={{ background: color }} />
          {label}
        </div>
      ))}
      {conParadas && <div className="mt-0.5 text-neutral-500">{t.trazoAproximado}</div>}
    </div>
  );
}

export default function MapaCentro({
  places = [],
  events = [],
  stops = [],
  userLocation = null,
  selectedPlaceId = null,
  onSelectPlace,
  showLegend = true,
  className = "h-80 w-full",
}: MapaProps) {
  const paradas = useMemo(() => [...stops].sort((a, b) => a.order - b.order), [stops]);
  const idsEnRuta = useMemo(() => new Set(paradas.map((s) => s.place.id)), [paradas]);
  const lugaresSueltos = useMemo(() => places.filter((p) => !idsEnRuta.has(p.id)), [places, idsEnRuta]);

  // Encuadre: la ruta si existe; si no, todos los lugares y eventos.
  const puntosVista = useMemo<LatLng[]>(() => {
    if (paradas.length > 0) {
      const pts = paradas.map((s) => ({ lat: s.place.lat, lng: s.place.lng }));
      return userLocation ? [userLocation, ...pts] : pts;
    }
    return [...places, ...events].map((p) => ({ lat: p.lat, lng: p.lng }));
  }, [paradas, places, events, userLocation]);

  const trazo = useMemo<[number, number][]>(() => {
    const pts: [number, number][] = paradas.map((s) => [s.place.lat, s.place.lng]);
    return userLocation && pts.length > 0 ? [[userLocation.lat, userLocation.lng], ...pts] : pts;
  }, [paradas, userLocation]);

  return (
    <div className={`relative isolate overflow-hidden rounded-xl ${className}`}>
      <MapContainer
        center={[CENTRO_VERACRUZ.lat, CENTRO_VERACRUZ.lng]}
        zoom={ZOOM_INICIAL}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} maxZoom={19} />
        <AjustarVista puntos={puntosVista} />

        {trazo.length > 1 && (
          <Polyline positions={trazo} pathOptions={{ color: COLORES.parada, weight: 4, opacity: 0.7, dashArray: "6 8" }} />
        )}

        {lugaresSueltos.map((p) => {
          const sel = p.id === selectedPlaceId;
          const icon = p.verified ? (sel ? iconos.lugarSel : iconos.lugar) : sel ? iconos.porConfirmarSel : iconos.porConfirmar;
          return (
            <Marker key={`p-${p.id}`} position={[p.lat, p.lng]} icon={icon} zIndexOffset={sel ? 500 : 0}>
              <Popup>
                <FichaLugar place={p} onSelectPlace={onSelectPlace} />
              </Popup>
            </Marker>
          );
        })}

        {events.map((e) => (
          <Marker key={`e-${e.id}`} position={[e.lat, e.lng]} icon={iconos.evento} zIndexOffset={200}>
            <Popup>
              <FichaEvento event={e} />
            </Popup>
          </Marker>
        ))}

        {paradas.map((s, i) => {
          const sel = s.place.id === selectedPlaceId;
          return (
            <Marker
              key={`s-${s.place.id}-${s.order}`}
              position={[s.place.lat, s.place.lng]}
              icon={iconoParada(i + 1, sel)}
              zIndexOffset={1000 + i}
            >
              <Popup>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-rose-600">
                    {t.parada} {i + 1} · {formatDistancia(s.distanceM)} · {s.etaMin} {t.minutos}
                  </p>
                  <FichaLugar place={s.place} onSelectPlace={onSelectPlace} />
                  <p className="text-xs italic">{s.reason}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {userLocation && (
          <CircleMarker
            center={[userLocation.lat, userLocation.lng]}
            radius={8}
            pathOptions={{ color: "#fff", weight: 3, fillColor: COLORES.usuario, fillOpacity: 1 }}
          >
            <Popup>{t.estasAqui}</Popup>
          </CircleMarker>
        )}
      </MapContainer>
      {showLegend && <Leyenda conEventos={events.length > 0} conParadas={paradas.length > 0} />}
    </div>
  );
}
