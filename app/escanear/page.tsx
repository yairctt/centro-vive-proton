"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import type { Html5Qrcode } from "html5-qrcode";
import { useIdioma, LanguageSelector } from "@/components/ui/LanguageSelector";
import { extractToken, TOKEN_PARAM } from "@/lib/qr/parse";
import type { ValidateResponse } from "@/lib/qr/types";
import { validateToken, type ValidateResult } from "@/lib/qr/validate";
import { CheckIcon } from "@/components/paneles/icons";
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  AwardIcon,
  CameraIcon,
  TrophyIcon,
} from "@/components/ui/icons";
import { PulsoLogo } from "@/components/ui/PulsoLogo";

const LECTOR_ID = "lector-qr";

type Estado =
  | { fase: "inicio" }
  | { fase: "escaneando" }
  | { fase: "validando" }
  | { fase: "exito"; data: ValidateResponse; demo: boolean }
  | { fase: "error"; mensaje: string }
  | { fase: "manual"; sinCamara: "permiso" | "camara" | null };

const btnPrimario =
  "w-full rounded-2xl bg-teal-700 px-6 py-5 text-lg font-bold text-white shadow-sm transition duration-100 hover:bg-teal-800 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed";
const btnSecundario =
  "block w-full rounded-2xl border border-neutral-200 bg-white px-6 py-4 text-center text-base font-bold text-neutral-800 active:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:active:bg-neutral-800";

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

function estadoFinal(r: ValidateResult, errorGenerico: string = "Ocurrió un error"): Estado {
  return r.kind === "ok"
    ? { fase: "exito", data: r.data, demo: r.demo }
    : { fase: "error", mensaje: r.message ?? errorGenerico };
}

function Escaner() {
  const router = useRouter();
  const params = useSearchParams();
  const { lang, t: dict } = useIdioma();
  const t = dict.qr;

  // QR leído con la cámara normal del teléfono: /escanear?t=<token> → se valida sin abrir la cámara.
  const [estado, setEstado] = useState<Estado>(() => {
    const desdeUrl = params.get(TOKEN_PARAM);
    if (!desdeUrl) return { fase: "inicio" };
    return extractToken(desdeUrl) ? { fase: "validando" } : { fase: "error", mensaje: "Código inválido" };
  });
  const [tokenManual, setTokenManual] = useState("");
  const [errorManual, setErrorManual] = useState<string | null>(null);
  const [tieneRuta, setTieneRuta] = useState(false);
  const lectorRef = useRef<Html5Qrcode | null>(null);
  const leidoRef = useRef(false);
  const urlProcesadaRef = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setTieneRuta(Boolean(sessionStorage.getItem("rutaGenerada")));
    }
  }, []);

  const validar = useCallback((token: string) => {
    setEstado({ fase: "validando" });
    void validateToken(token).then((r) => setEstado(estadoFinal(r, t.errorGenerico)));
  }, [t.errorGenerico]);

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
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 bg-neutral-50 px-6 pt-8 pb-8 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <style>{CSS_ANIMACIONES}</style>
      <header className="flex items-center justify-between">
        <Link
          href={tieneRuta ? `/ruta${lang === "en" ? "?lang=en" : ""}` : `/${lang === "en" ? "?lang=en" : ""}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 dark:text-teal-400"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          {tieneRuta ? t.volverRuta : (lang === "en" ? "Back to Home" : "Volver a la portada")}
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSelector size="sm" />
          <PulsoLogo size="xs" conTexto={false} />
          <Link
            href={`/pasaporte${lang === "en" ? "?lang=en" : ""}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300"
          >
            <TrophyIcon className="h-3.5 w-3.5" />
            {t.verPasaporte}
          </Link>
        </div>
      </header>
      <h1 className="text-3xl font-black tracking-tight">{t.titulo}</h1>

      {estado.fase === "inicio" && (
        <section className="flex flex-1 flex-col gap-6">
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-neutral-200/80 bg-white p-8 text-center shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex size-20 items-center justify-center rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400">
              <CameraIcon className="size-9" />
            </div>
            <p className="text-base font-medium text-neutral-600 dark:text-neutral-400">{t.instrucciones}</p>
          </div>
          <ol className="space-y-3">
            {t.pasos.map((paso, i) => (
              <li
                key={paso}
                className="flex items-center gap-3 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-900"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-sm font-black text-teal-700 dark:bg-teal-950/40 dark:text-teal-400">
                  {i + 1}
                </span>
                <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">{paso}</span>
              </li>
            ))}
          </ol>
          <div className="mt-auto space-y-2">
            <button
              type="button"
              className={`${btnPrimario} flex items-center justify-center gap-2`}
              onClick={() => setEstado({ fase: "escaneando" })}
            >
              <CameraIcon className="size-5" />
              {t.botonEscanear}
            </button>
            <button
              type="button"
              className="w-full py-2 text-sm font-medium text-neutral-500 underline dark:text-neutral-400"
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
            className="aspect-square w-full overflow-hidden rounded-2xl border border-neutral-200/80 bg-neutral-900 text-neutral-400 dark:border-neutral-700 [&_video]:h-full [&_video]:w-full [&_video]:object-cover"
          />
          <p className="text-center text-sm font-medium text-neutral-600 dark:text-neutral-400">{t.apunta}</p>
          <button type="button" className={btnSecundario} onClick={reiniciar}>
            {t.cancelar}
          </button>
        </section>
      )}

      {estado.fase === "validando" && (
        <section className="flex flex-1 flex-col items-center justify-center gap-4" aria-live="polite">
          <div className="size-12 animate-spin rounded-full border-4 border-teal-100 border-t-teal-700 dark:border-teal-900 dark:border-t-teal-400" />
          <p className="text-base">{t.validando}</p>
        </section>
      )}

      {estado.fase === "exito" && (
        <section className="flex flex-1 flex-col items-center justify-center gap-5 text-center" aria-live="polite">
          {estado.demo && (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
              {t.modoDemo}
            </span>
          )}
          <div className="pj-sello flex size-36 flex-col items-center justify-center rounded-full border-4 border-dashed border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
            <CheckIcon className="size-12" />
            <span className="mt-1 text-xs font-black tracking-[0.3em]">{t.sellado}</span>
          </div>
          <p className="pj-aparece text-2xl font-black">{t.exito}</p>
          {estado.data.message && (
            <p className="pj-aparece text-base font-medium text-neutral-600 dark:text-neutral-400">{estado.data.message}</p>
          )}
          <p className="pj-aparece text-6xl font-black text-teal-700 dark:text-teal-400">
            +<ContadorPuntos hasta={estado.data.pointsAdded} />{" "}
            <span className="text-2xl font-bold">{t.puntos}</span>
          </p>
          <p className="pj-aparece rounded-2xl border border-neutral-200/80 bg-white px-4 py-2 text-base text-neutral-700 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
            {t.totalPasaporte}: <strong className="text-neutral-900 dark:text-neutral-100">{estado.data.totalPoints}</strong> {t.puntos}
          </p>
          {estado.data.missionCompleted && (
            <p className="pj-aparece inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-base font-bold text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
              <AwardIcon className="size-4" />
              {t.misionCompletada}
            </p>
          )}
          <div className="mt-4 flex w-full flex-col gap-3">
            <Link href={`/ruta${lang === "en" ? "?lang=en" : ""}`} className={`${btnPrimario} flex items-center justify-center gap-2 text-center`}>
              {t.seguirRuta}
              <ArrowRightIcon className="size-5" />
            </Link>
            <Link href={`/pasaporte${lang === "en" ? "?lang=en" : ""}`} className={`${btnSecundario} flex items-center justify-center gap-2`}>
              <TrophyIcon className="size-4" />
              {t.verPasaporte}
            </Link>
            <button
              type="button"
              className="py-2 text-sm font-medium text-neutral-500 underline dark:text-neutral-400"
              onClick={reiniciar}
            >
              {t.escanearOtro}
            </button>
          </div>
        </section>
      )}

      {estado.fase === "error" && (
        <section className="flex flex-1 flex-col items-center justify-center gap-4 text-center" role="alert">
          <div className="flex size-20 items-center justify-center rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
            <AlertCircleIcon className="size-9" />
          </div>
          <p className="text-2xl font-black">{t.error}</p>
          <p className="text-base text-neutral-600 dark:text-neutral-400">{estado.mensaje}</p>
          <button type="button" className={btnPrimario} onClick={reiniciar}>
            {t.intentarDeNuevo}
          </button>
        </section>
      )}

      {estado.fase === "manual" && (
        <section className="flex flex-col gap-5">
          {estado.sinCamara && (
            <div
              className="space-y-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
              role="alert"
            >
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
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-4 font-mono text-base transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/30 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900"
            />
            {errorManual && <p className="text-sm text-rose-700 dark:text-rose-300">{errorManual}</p>}
            <button type="submit" className={btnPrimario} disabled={!tokenManual.trim()}>
              {t.validar}
            </button>
          </form>
          <button type="button" className={btnSecundario} onClick={reiniciar}>
            {t.volver}
          </button>
        </section>
      )}

      <footer className="mt-8 text-center text-xs text-neutral-400 dark:text-neutral-500 pb-8">
        <p>
          Powered by <span className="font-semibold text-teal-700 dark:text-teal-400">Protón</span>
        </p>
      </footer>
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
