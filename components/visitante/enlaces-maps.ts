// Enlaces hacia Google Maps (Integrante 4).
//
// El mapa de la app es Leaflet con OpenStreetMap, a propósito: es libre, no
// pide clave ni tarjeta y no tiene límites de uso. Para el turista que quiere
// navegar de verdad, estos enlaces lo llevan a Google Maps en el teléfono.

/** Máximo de destinos que acepta Google Maps en una sola URL. */
export const MAXIMO_WAYPOINTS = 9;

/** Un punto de la ruta. */
export interface PuntoRuta {
  lat: number;
  lng: number;
  nombre: string;
}

/**
 * Enlace para abrir un solo lugar en Google Maps.
 * Usa `search` con coordenadas y el nombre, para que encuentre el lugar
 * aunque Google no tenga ese punto exacto en su base.
 * Limpia automáticamente cualquier prefijo residual como [DEMO] para no romper la búsqueda.
 */
export function enlaceLugar(punto: PuntoRuta): string {
  const nombreLimpio = punto.nombre.replace(/^\[DEMO\]\s*/i, "").trim();
  const consulta = encodeURIComponent(`${nombreLimpio} ${punto.lat},${punto.lng}`);
  return `https://www.google.com/maps/search/?api=1&query=${consulta}`;
}

/** Coordenadas de referencia del Muelle Turístico de Cruceros y Malecón de Veracruz. */
export const MUELLE_CRUCEROS: PuntoRuta = {
  lat: 19.2025,
  lng: -96.1345,
  nombre: "Muelle Turístico de Cruceros y Malecón de Veracruz",
};

/**
 * Enlace para retornar a pie desde una parada (ej. la última parada)
 * hacia el Muelle de Cruceros o hacia el punto de origen (Garantía de Retorno Seguro).
 */
export function enlaceRetorno(desde: PuntoRuta, hacia: PuntoRuta = MUELLE_CRUCEROS): string {
  const parametros = new URLSearchParams({
    api: "1",
    origin: `${desde.lat},${desde.lng}`,
    destination: `${hacia.lat},${hacia.lng}`,
    travelmode: "walking",
  });
  return `https://www.google.com/maps/dir/?${parametros.toString()}`;
}

/**
 * Enlace para abrir la ruta completa en Google Maps, con las paradas como
 * puntos intermedios en el orden en que se recomienda visitar.
 *
 * Google Maps admite hasta nueve destinos; si la ruta tiene más, se toman los
 * primeros y se avisa con `completada: false`.
 */
export function enlaceRutaCompleta(puntos: PuntoRuta[]): {
  url: string;
  /** False si se recortaron paradas por el límite de Google Maps. */
  completa: boolean;
  /** Paradas que se quedó fuera, por si hay que avisar al usuario. */
  omitidas: number;
} {
  if (puntos.length === 0) {
    return { url: "https://www.google.com/maps", completa: true, omitidas: 0 };
  }

  if (puntos.length === 1) {
    return { url: enlaceLugar(puntos[0]), completa: true, omitidas: 0 };
  }

  const limitados = puntos.slice(0, MAXIMO_WAYPOINTS);
  const omitidas = puntos.length - limitados.length;
  const origen = limitados[0];
  const destino = limitados[limitados.length - 1];
  const intermedios = limitados.slice(1, -1);

  const parametros = new URLSearchParams({
    api: "1",
    origin: `${origen.lat},${origen.lng}`,
    destination: `${destino.lat},${destino.lng}`,
    travelmode: "walking",
  });

  if (intermedios.length > 0) {
    parametros.set(
      "waypoints",
      intermedios.map((p) => `${p.lat},${p.lng}`).join("|"),
    );
  }

  return {
    url: `https://www.google.com/maps/dir/?${parametros.toString()}`,
    completa: omitidas === 0,
    omitidas,
  };
}
