import { es } from "@/lib/i18n/es";
import { mockPlaces } from "@/lib/mock";
import type { QrTarjeta, ValidateResponse } from "./types";

/**
 * Puntos acumulados en esta sesión de demostración.
 *
 * El modo demo existe para que el flujo de oro se pueda recorrer sin base de
 * datos: escanear un QR debe sumar puntos y el pasaporte debe mostrarlos.
 * Este módulo guarda lo escaneado en el navegador (sessionStorage) para que
 * el total vaya creciendo, igual que lo haría el servidor con la base.
 *
 * Los puntos reales SIEMPRE los calcula el servidor; esto es solo el respaldo
 * cuando `POST /api/visits/validate` no está disponible.
 */

const CLAVE_ALMACEN = "pulso:puntos-demo";
const CLAVE_VISITAS = "pulso:visitas-demo";

/** Puntos base por visita con QR. */
const PUNTOS_BASE = 50;

interface VisitaDemo {
  token: string;
  placeId: string;
  pointsAwarded: number;
  createdAt: string;
}

function leer<T>(clave: string, porDefecto: T): T {
  if (typeof window === "undefined") return porDefecto;
  try {
    const crudo = window.sessionStorage.getItem(clave);
    return crudo ? (JSON.parse(crudo) as T) : porDefecto;
  } catch {
    return porDefecto;
  }
}

function guardar(clave: string, valor: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    // Sin almacenamiento (modo privado) los puntos no se acumulan, pero el
    // escaneo sigue respondiendo bien.
  }
}

/** Puntos acumulados hasta ahora en la demo. */
export function puntosDemo(): number {
  return leer<number>(CLAVE_ALMACEN, 150);
}

/** Visitas registradas en la demo. */
export function visitasDemo(): VisitaDemo[] {
  return leer<VisitaDemo[]>(CLAVE_VISITAS, []);
}

/**
 * Respuesta de ejemplo para cuando POST /api/visits/validate no está
 * disponible. Suma los puntos al total de la sesión, para que el flujo se
 * comporte como el real.
 */
export function mockValidate(token?: string): ValidateResponse {
  const totalAnterior = puntosDemo();
  const visitas = visitasDemo();

  // Un token solo cuenta una vez, como en el servidor.
  if (token && visitas.some((v) => v.token === token)) {
    return {
      ok: false,
      pointsAdded: 0,
      totalPoints: totalAnterior,
      missionCompleted: false,
      message: "Ya visitaste este lugar en esta sesión.",
    };
  }

  const pointsAdded = PUNTOS_BASE;
  const totalPoints = totalAnterior + pointsAdded;

  if (token) {
    guardar(CLAVE_VISITAS, [
      ...visitas,
      { token, placeId: lugarDeToken(token), pointsAwarded: pointsAdded, createdAt: new Date().toISOString() },
    ]);
  }
  guardar(CLAVE_ALMACEN, totalPoints);

  return {
    ok: true,
    pointsAdded,
    totalPoints,
    missionCompleted: true,
    message: es.qr.mockMensaje,
  };
}

/** Deduce el lugar del token de demo (los tokens son `demo-<id>-0000`). */
function lugarDeToken(token: string): string {
  const partes = token.split("-");
  return partes.length >= 2 ? partes[1] : token;
}

/**
 * Tarjetas de ejemplo para cuando GET /api/qr-tokens aún no existe o falla.
 * Los tokens empiezan con «demo-» a propósito: NO son válidos en producción
 * y las tarjetas se imprimen con la marca «DEMO».
 */
export function mockQrTarjetas(): QrTarjeta[] {
  return mockPlaces.map((place) => ({ place, token: `demo-${place.id}-0000` }));
}
