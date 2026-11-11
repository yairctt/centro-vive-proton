import { TOKEN_PARAM } from "./parse";

/**
 * URL que se codifica en el QR impreso de cada lugar.
 * buildQrUrl("3f6c…", "https://pulso.app") → "https://pulso.app/escanear?t=3f6c…"
 * Así el QR funciona con la cámara normal del teléfono (abre la app y valida)
 * y también con el lector de /escanear (extractToken lee el parámetro ?t=).
 */
export function buildQrUrl(token: string, baseUrl: string): string {
  const url = new URL("/escanear", baseUrl);
  url.searchParams.set(TOKEN_PARAM, token);
  return url.toString();
}
