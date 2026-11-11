/** Parámetro de la URL que lleva el token: https://<dominio>/escanear?t=<token> */
export const TOKEN_PARAM = "t";

// Los tokens son crypto.randomUUID() (con guiones); se acepta cualquier cadena
// alfanumérica con - o _ de 8 a 128 caracteres para no atarnos al formato.
const TOKEN_RE = /^[A-Za-z0-9_-]{8,128}$/;

export function isValidToken(token: string): boolean {
  return TOKEN_RE.test(token);
}

/**
 * Extrae el token del texto leído en un QR. Acepta:
 *  - el token solo: "3f6c…"
 *  - una URL absoluta: "https://pulso.app/escanear?t=3f6c…"
 *  - una ruta relativa: "/escanear?t=3f6c…" o "?t=3f6c…"
 * Devuelve null si no hay un token con formato válido.
 */
export function extractToken(text: string): string | null {
  const raw = text.trim();
  if (!raw) return null;

  const esUrl = /^https?:\/\//i.test(raw) || raw.startsWith("/") || raw.startsWith("?");
  if (esUrl) {
    try {
      const t = new URL(raw, "http://localhost").searchParams.get(TOKEN_PARAM)?.trim();
      return t && isValidToken(t) ? t : null;
    } catch {
      return null;
    }
  }

  return isValidToken(raw) ? raw : null;
}
