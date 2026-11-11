import { mockValidate } from "./mock";
import type { ValidateResponse } from "./types";

export type ValidateResult =
  | { kind: "ok"; data: ValidateResponse; demo: boolean }
  | { kind: "error"; message: string | null };

const TIMEOUT_MS = 8000;

function esValidateResponse(x: unknown): x is ValidateResponse {
  const r = x as ValidateResponse;
  return !!r && typeof r.ok === "boolean" && typeof r.pointsAdded === "number" && typeof r.totalPoints === "number";
}

/**
 * Llama POST /api/visits/validate. Los puntos los decide el servidor.
 * Cae al mock («modo demo») solo si el endpoint no existe (404 sin JSON de error),
 * hay error de red/tiempo o el servidor falla (5xx). Un rechazo real del servidor
 * (4xx con { error } o ok:false) se muestra como error.
 */
export async function validateToken(token: string): Promise<ValidateResult> {
  let res: Response;
  try {
    res = await fetch("/api/visits/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    return { kind: "ok", data: mockValidate(), demo: true };
  }

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    // La página 404 de Next.js es HTML: sin cuerpo JSON.
  }
  const errorMsg =
    body && typeof (body as { error?: unknown }).error === "string" ? (body as { error: string }).error : null;

  if (res.ok && esValidateResponse(body)) {
    return body.ok ? { kind: "ok", data: body, demo: false } : { kind: "error", message: body.message || null };
  }
  if ((res.status === 404 && !errorMsg) || res.status >= 500) {
    return { kind: "ok", data: mockValidate(), demo: true };
  }
  return { kind: "error", message: errorMsg };
}
