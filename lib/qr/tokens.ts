import { mockQrTarjetas } from "./mock";
import type { QrTarjeta } from "./types";

export type TarjetasResult =
  | { kind: "ok"; data: QrTarjeta[]; demo: boolean }
  | { kind: "error"; message: string | null };

function esTarjetas(x: unknown): x is QrTarjeta[] {
  return (
    Array.isArray(x) &&
    x.every((t) => t && typeof t.token === "string" && t.place && typeof t.place.name === "string")
  );
}

/**
 * Llama GET /api/qr-tokens. Igual que validateToken: cae al mock («modo demo»)
 * solo si el endpoint no existe (404 sin JSON de error), hay error de red o 5xx.
 * Un rechazo real (p. ej. 401/403 sin rol admin) se muestra como error.
 */
export async function fetchQrTarjetas(): Promise<TarjetasResult> {
  let res: Response;
  try {
    res = await fetch("/api/qr-tokens", { cache: "no-store", signal: AbortSignal.timeout(8000) });
  } catch {
    return { kind: "ok", data: mockQrTarjetas(), demo: true };
  }

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    // La página 404 de Next.js es HTML.
  }
  const errorMsg =
    body && typeof (body as { error?: unknown }).error === "string" ? (body as { error: string }).error : null;

  if (res.ok && esTarjetas(body)) return { kind: "ok", data: body, demo: false };
  if ((res.status === 404 && !errorMsg) || res.status >= 500) {
    return { kind: "ok", data: mockQrTarjetas(), demo: true };
  }
  return { kind: "error", message: errorMsg };
}
