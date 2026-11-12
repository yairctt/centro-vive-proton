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
  "w-full rounded-2xl bg-blue-600 px-6 py-5 text-lg font-bold text-white shadow-lg shadow-blue-200 transition active:scale-[0.98] disabled:opacity-50";
const btnSecundario =
  "block w-full rounded-2xl border border-gray-200 bg-white px-6 py-4 text-center text-base font-bold text-gray-800 active:bg-gray-100";

function esErrorDePermiso(err: unknown): boolean {
  const s = String((err as { name?: string })?.name ?? err);
  return /NotAllowed|Permission|denied/i.test(s);
}

// Sello del pasaporte: entra grande y transparente y «golpea» la página.
const CSS_ANIMACIONES = `
@keyframes pj-sello { 0% { transform: scale(2.6) rotate(8deg); opacity: 0; } 60% { transform: scale(0.92) rotate(-10deg); opacity: 1; } 100% { transform: scale(1) rotate(-8deg); opacity: 1; } }
@keyframes pj-aparece { from { transform: translateY(12px); opacity: 0; } to { transform: none; opacity: 1; } }
.pj-sello { animation: pj-sello 520ms cubic-bezier(.2,.9,.3,1.2) both; }
.pj-aparece { animation: pj-aparece 400ms ease-out both; }
@media (prefers-reduced-motion: reduce) { .pj-sello, .pj-aparece { animation: none; } }
`;

/** Cuenta de 0 a `hasta` en ~700 ms. */
function ContadorPuntos({ hasta }: { hasta: number }) {
  const [valor, setValor] = useState(0);
  useEffect(() => {
    let frame = 0;
    const inicio = performance.now();
    const paso = (ahora: number) => {
      const p = Math.min((ahora - inicio) / 700, 1);
      setValor(Math.round(hasta * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame = requestAnimationFrame(paso);
    };
    frame = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(frame);
  }, [hasta]);
  return <>{valor}</>;
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
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 bg-gray-50 px-6 pt-8 pb-8 text-gray-900">
      <style>{CSS_ANIMACIONES}</style>
      <header className="flex items-center justify-between">
        <Link href="/ruta" className="text-xs font-bold text-blue-600">
          ← {t.volverRuta}
        </Link>
        <Link href="/pasaporte" className="rounded-full bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700">
          🏆 {t.verPasaporte}
        </Link>
      </header>
      <h1 className="text-3xl font-black tracking-tight">{t.titulo}</h1>

      {estado.fase === "inicio" && (
        <section className="flex flex-1 flex-col gap-6">
          <div className="flex flex-col items-center gap-4 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-800 p-8 text-center text-white shadow-xl shadow-blue-900/20">
            <div className="flex size-20 items-center justify-center rounded-3xl border border-white/30 bg-white/20 text-4xl backdrop-blur-md">
              📷
            </div>
            <p className="text-base font-medium text-blue-100">{t.instrucciones}</p>
          </div>
          <ol className="space-y-3">
            {t.pasos.map((paso, i) => (
              <li key={paso} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-xs">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-black text-blue-600">
                  {i + 1}
                </span>
                <span className="text-sm font-bold text-gray-800">{paso}</span>
              </li>
            ))}
          </ol>
          <div className="mt-auto space-y-2">
            <button type="button" className={btnPrimario} onClick={() => setEstado({ fase: "escaneando" })}>
              📷 {t.botonEscanear}
            </button>
            <button
              type="button"
              className="w-full py-2 text-sm font-medium text-gray-500 underline"
              onClick={() => setEstado({ fase: "manual", sinCamara: null })}
            >
              {t.escribirCodigo}
            </button>
          </div>
        </section>
      )}

      {estado.fase === "escaneando" && (
        <section className="flex flex-col gap-4">
          <div
            id={LECTOR_ID}
            className="aspect-square w-full overflow-hidden rounded-2xl bg-neutral-900 text-neutral-400 [&_video]:h-full [&_video]:w-full [&_video]:object-cover"
          />
          <p className="text-center text-sm font-medium text-gray-600">{t.apunta}</p>
          <button type="button" className={btnSecundario} onClick={reiniciar}>
            {t.cancelar}
          </button>
        </section>
      )}

      {estado.fase === "validando" && (
        <section className="flex flex-1 flex-col items-center justify-center gap-4" aria-live="polite">
          <div className="size-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
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
          <div className="pj-sello flex size-36 flex-col items-center justify-center rounded-full border-4 border-dashed border-emerald-500 bg-emerald-50 text-emerald-700">
            <span className="text-5xl leading-none font-black">✓</span>
            <span className="mt-1 text-xs font-black tracking-[0.3em]">{t.sellado}</span>
          </div>
          <p className="pj-aparece text-2xl font-black">{t.exito}</p>
          {estado.data.message && (
            <p className="pj-aparece text-base font-medium text-gray-600">{estado.data.message}</p>
          )}
          <p className="pj-aparece text-6xl font-black text-blue-600">
            +<ContadorPuntos hasta={estado.data.pointsAdded} />{" "}
            <span className="text-2xl font-bold">{t.puntos}</span>
          </p>
          <p className="pj-aparece rounded-2xl bg-white px-4 py-2 text-base text-gray-700 shadow-xs">
            {t.totalPasaporte}: <strong className="text-gray-900">{estado.data.totalPoints}</strong> {t.puntos}
          </p>
          {estado.data.missionCompleted && (
            <p className="pj-aparece rounded-xl bg-amber-100 px-4 py-2 text-base font-bold text-amber-900">
              🏅 {t.misionCompletada}
            </p>
          )}
          <div className="mt-4 flex w-full flex-col gap-3">
            <Link href="/ruta" className={`${btnPrimario} block text-center`}>
              {t.seguirRuta} →
            </Link>
            <Link href="/pasaporte" className={btnSecundario}>
              🏆 {t.verPasaporte}
            </Link>
            <button type="button" className="py-2 text-sm font-medium text-gray-500 underline" onClick={reiniciar}>
              {t.escanearOtro}
            </button>
          </div>
        </section>
      )}

      {estado.fase === "error" && (
        <section className="flex flex-1 flex-col justify-center gap-4 text-center" role="alert">
          <p className="text-5xl">😕</p>
          <p className="text-2xl font-black">{t.error}</p>
          <p className="text-base text-gray-600">{estado.mensaje}</p>
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
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-4 font-mono text-base focus:border-blue-500 focus:outline-none"
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
