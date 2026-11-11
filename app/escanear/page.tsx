"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import type { Html5Qrcode } from "html5-qrcode";
import { es } from "@/lib/i18n/es";
import { extractToken, TOKEN_PARAM } from "@/lib/qr/parse";
import type { ValidateResponse } from "@/lib/qr/types";
import { validateToken, type ValidateResult } from "@/lib/qr/validate";

const t = es.qr;
const LECTOR_ID = "lector-qr";

type Estado =
  | { fase: "inicio" }
  | { fase: "escaneando" }
  | { fase: "validando" }
  | { fase: "exito"; data: ValidateResponse; demo: boolean }
  | { fase: "error"; mensaje: string }
  | { fase: "manual"; sinCamara: "permiso" | "camara" | null };

const btnPrimario =
  "w-full rounded-2xl bg-rose-600 px-6 py-5 text-lg font-semibold text-white shadow-md transition active:scale-[0.98] disabled:opacity-50";
const btnSecundario =
  "w-full rounded-2xl border border-neutral-300 px-6 py-4 text-base font-medium text-neutral-800 dark:border-neutral-700 dark:text-neutral-100";

function esErrorDePermiso(err: unknown): boolean {
  const s = String((err as { name?: string })?.name ?? err);
  return /NotAllowed|Permission|denied/i.test(s);
}

function estadoFinal(r: ValidateResult): Estado {
  return r.kind === "ok"
    ? { fase: "exito", data: r.data, demo: r.demo }
    : { fase: "error", mensaje: r.message ?? t.errorGenerico };
}

function Escaner() {
  const router = useRouter();
  const params = useSearchParams();
  // QR leído con la cámara normal del teléfono: /escanear?t=<token> → se valida sin abrir la cámara.
  const [estado, setEstado] = useState<Estado>(() => {
    const desdeUrl = params.get(TOKEN_PARAM);
    if (!desdeUrl) return { fase: "inicio" };
    return extractToken(desdeUrl) ? { fase: "validando" } : { fase: "error", mensaje: t.codigoInvalido };
  });
  const [tokenManual, setTokenManual] = useState("");
  const [errorManual, setErrorManual] = useState<string | null>(null);
  const lectorRef = useRef<Html5Qrcode | null>(null);
  const leidoRef = useRef(false);
  const urlProcesadaRef = useRef(false);

  const validar = useCallback((token: string) => {
    setEstado({ fase: "validando" });
    void validateToken(token).then((r) => setEstado(estadoFinal(r)));
  }, []);

  const procesarTexto = useCallback(
    (texto: string) => {
      const token = extractToken(texto);
      if (!token) {
        setEstado({ fase: "error", mensaje: t.codigoInvalido });
        return;
      }
      validar(token);
    },
    [validar],
  );

  useEffect(() => {
    if (urlProcesadaRef.current) return;
    const desdeUrl = params.get(TOKEN_PARAM);
    if (!desdeUrl) return;
    urlProcesadaRef.current = true;
    router.replace("/escanear"); // quita el token de la URL: recargar no revalida
    const token = extractToken(desdeUrl);
    if (token) void validateToken(token).then((r) => setEstado(estadoFinal(r)));
  }, [params, router]);

  // Enciende la cámara cuando el contenedor del lector ya está en pantalla.
  useEffect(() => {
    if (estado.fase !== "escaneando") return;
    let cancelado = false;
    leidoRef.current = false;

    const iniciar = (async () => {
      const { Html5Qrcode } = await import("html5-qrcode"); // solo en el cliente
      if (cancelado) return;
      const lector = new Html5Qrcode(LECTOR_ID, { verbose: false });
      lectorRef.current = lector;
      try {
        await lector.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: (w, h) => ({ width: Math.min(w, h) * 0.7, height: Math.min(w, h) * 0.7 }) },
          (texto) => {
            if (leidoRef.current) return;
            leidoRef.current = true;
            lector
              .stop()
              .catch(() => {})
              .finally(() => {
                lectorRef.current = null;
                procesarTexto(texto);
              });
          },
          () => {}, // fotogramas sin QR: se ignoran
        );
      } catch (err) {
        lectorRef.current = null;
        if (!cancelado) setEstado({ fase: "manual", sinCamara: esErrorDePermiso(err) ? "permiso" : "camara" });
      }
    })();

    return () => {
      cancelado = true;
      void iniciar.finally(() => {
        const lector = lectorRef.current;
        lectorRef.current = null;
        if (lector?.isScanning) lector.stop().then(() => lector.clear()).catch(() => {});
      });
    };
  }, [estado.fase, procesarTexto]);

  const enviarManual = (e: React.FormEvent) => {
    e.preventDefault();
    const token = extractToken(tokenManual);
    if (!token) {
      setErrorManual(t.codigoInvalido);
      return;
    }
    setErrorManual(null);
    validar(token);
  };

  const reiniciar = () => {
    setTokenManual("");
    setErrorManual(null);
    setEstado({ fase: "inicio" });
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-4 py-8">
      <header className="space-y-2">
        <Link href="/" className="text-sm text-neutral-500">
          ← {es.appName}
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">{t.titulo}</h1>
      </header>

      {estado.fase === "inicio" && (
        <section className="flex flex-1 flex-col justify-center gap-4">
          <p className="text-base text-neutral-600 dark:text-neutral-400">{t.instrucciones}</p>
          <button type="button" className={btnPrimario} onClick={() => setEstado({ fase: "escaneando" })}>
            {t.botonEscanear}
          </button>
          <button
            type="button"
            className="py-2 text-sm text-neutral-600 underline dark:text-neutral-400"
            onClick={() => setEstado({ fase: "manual", sinCamara: null })}
          >
            {t.escribirCodigo}
          </button>
        </section>
      )}

      {estado.fase === "escaneando" && (
        <section className="flex flex-col gap-4">
          <div
            id={LECTOR_ID}
            className="aspect-square w-full overflow-hidden rounded-2xl bg-neutral-900 text-neutral-400 [&_video]:h-full [&_video]:w-full [&_video]:object-cover"
          />
          <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">{t.apunta}</p>
          <button type="button" className={btnSecundario} onClick={reiniciar}>
            {t.cancelar}
          </button>
        </section>
      )}

      {estado.fase === "validando" && (
        <section className="flex flex-1 flex-col items-center justify-center gap-4" aria-live="polite">
          <div className="size-12 animate-spin rounded-full border-4 border-neutral-300 border-t-rose-600" />
          <p className="text-base">{t.validando}</p>
        </section>
      )}

      {estado.fase === "exito" && (
        <section className="flex flex-1 flex-col items-center justify-center gap-5 text-center" aria-live="polite">
          {estado.demo && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900 uppercase">
              {t.modoDemo}
            </span>
          )}
          <p className="text-2xl font-bold">{t.exito}</p>
          <p className="text-6xl font-extrabold text-rose-600">
            +{estado.data.pointsAdded} <span className="text-2xl font-bold">{t.puntos}</span>
          </p>
          <p className="text-base text-neutral-700 dark:text-neutral-300">
            {t.totalPasaporte}: <strong>{estado.data.totalPoints}</strong> {t.puntos}
          </p>
          {estado.data.missionCompleted && (
            <p className="rounded-xl bg-emerald-100 px-4 py-2 text-base font-semibold text-emerald-900">
              🏅 {t.misionCompletada}
            </p>
          )}
          {estado.data.message && <p className="text-sm text-neutral-500">{estado.data.message}</p>}
          <div className="mt-4 flex w-full flex-col gap-3">
            <Link href="/pasaporte" className={`${btnPrimario} text-center`}>
              {t.verPasaporte}
            </Link>
            <button type="button" className={btnSecundario} onClick={reiniciar}>
              {t.escanearOtro}
            </button>
          </div>
        </section>
      )}

      {estado.fase === "error" && (
        <section className="flex flex-1 flex-col justify-center gap-4 text-center" role="alert">
          <p className="text-2xl font-bold">{t.error}</p>
          <p className="text-base text-neutral-700 dark:text-neutral-300">{estado.mensaje}</p>
          <button type="button" className={btnPrimario} onClick={reiniciar}>
            {t.intentarDeNuevo}
          </button>
        </section>
      )}

      {estado.fase === "manual" && (
        <section className="flex flex-col gap-5">
          {estado.sinCamara && (
            <div className="space-y-2 rounded-2xl bg-amber-50 p-4 text-amber-950" role="alert">
              <p className="font-semibold">{estado.sinCamara === "permiso" ? t.sinPermisoTitulo : t.sinCamaraTitulo}</p>
              <ol className="list-decimal space-y-1 pl-5 text-sm">
                {t.sinPermisoPasos.map((paso) => (
                  <li key={paso}>{paso}</li>
                ))}
              </ol>
            </div>
          )}
          <form onSubmit={enviarManual} className="flex flex-col gap-3">
            <label htmlFor="token" className="text-sm font-medium">
              {t.campoToken}
            </label>
            <input
              id="token"
              value={tokenManual}
              onChange={(e) => setTokenManual(e.target.value)}
              placeholder={t.campoTokenPlaceholder}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              className="w-full rounded-xl border border-neutral-300 px-4 py-4 font-mono text-base dark:border-neutral-700 dark:bg-neutral-900"
            />
            {errorManual && <p className="text-sm text-rose-700">{errorManual}</p>}
            <button type="submit" className={btnPrimario} disabled={!tokenManual.trim()}>
              {t.validar}
            </button>
          </form>
          <button type="button" className={btnSecundario} onClick={reiniciar}>
            {t.volver}
          </button>
        </section>
      )}
    </main>
  );
}

export default function EscanearPage() {
  return (
    <Suspense>
      <Escaner />
    </Suspense>
  );
}
