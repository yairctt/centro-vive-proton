"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { es } from "@/lib/i18n/es";
import { fetchQrTarjetas } from "@/lib/qr/tokens";
import type { QrTarjeta } from "@/lib/qr/types";
import { buildQrUrl } from "@/lib/qr/url";

const t = es.qrAdmin;

type TarjetaLista = QrTarjeta & { url: string; dataUrl: string };

type Estado =
  | { fase: "cargando" }
  | { fase: "listo"; tarjetas: TarjetaLista[]; demo: boolean }
  | { fase: "error"; mensaje: string };

async function prepararTarjetas(tarjetas: QrTarjeta[]): Promise<TarjetaLista[]> {
  // El origin sale del navegador: funciona igual en localhost y en Vercel.
  const origin = window.location.origin;
  return Promise.all(
    tarjetas.map(async (tarjeta) => {
      const url = buildQrUrl(tarjeta.token, origin);
      const dataUrl = await QRCode.toDataURL(url, { width: 640, margin: 1, errorCorrectionLevel: "M" });
      return { ...tarjeta, url, dataUrl };
    }),
  );
}

// Hoja carta (8.5 × 11 in) con 2 tarjetas por hoja. Se ocultan la navegación del
// panel (header de PanelHeader) y todo lo marcado con print:hidden.
const CSS_IMPRESION = `
@media print {
  @page { size: letter; margin: 0.4in; }
  html, body, body * { background: #fff !important; box-shadow: none !important; }
  header, nav { display: none !important; }
  main { max-width: none !important; padding: 0 !important; margin: 0 !important; }
  .qr-hoja { display: block !important; }
  .qr-tarjeta {
    height: 4.95in; margin: 0 0 0.3in 0 !important;
    border: 2px dashed #9ca3af !important; border-radius: 0 !important;
    break-inside: avoid; page-break-inside: avoid;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  .qr-tarjeta:nth-child(2n) { break-after: page; page-break-after: always; margin-bottom: 0 !important; }
  .qr-tarjeta:last-child { break-after: auto; page-break-after: auto; }
  .qr-img { width: 3.1in !important; height: 3.1in !important; }
}
`;

export default function AdminQrPage() {
  const [estado, setEstado] = useState<Estado>({ fase: "cargando" });
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vigente = true;
    fetchQrTarjetas()
      .then(async (r) => {
        if (r.kind === "error") return { fase: "error", mensaje: r.message ?? t.errorGenerico } as const;
        return { fase: "listo", tarjetas: await prepararTarjetas(r.data), demo: r.demo } as const;
      })
      .catch(() => ({ fase: "error", mensaje: t.errorGenerico }) as const)
      .then((nuevo) => {
        if (vigente) setEstado(nuevo);
      });
    return () => {
      vigente = false;
    };
  }, [intento]);

  const reintentar = () => {
    setEstado({ fase: "cargando" });
    setIntento((n) => n + 1);
  };

  return (
    <div className="space-y-6">
      <style>{CSS_IMPRESION}</style>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between print:hidden">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{t.titulo}</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{t.descripcion}</p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          disabled={estado.fase !== "listo" || estado.tarjetas.length === 0}
          className="rounded-2xl bg-teal-700 px-6 py-4 text-base font-semibold text-white shadow-md transition active:scale-[0.98] disabled:opacity-50"
        >
          🖨️ {t.imprimir}
        </button>
      </div>

      {estado.fase === "listo" && estado.demo && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 print:hidden">
          <span className="mr-2 rounded-full bg-amber-200 px-2 py-0.5 text-xs font-semibold uppercase">
            {t.modoDemo}
          </span>
          {t.avisoDemo}
        </div>
      )}

      {estado.fase === "cargando" && (
        <p className="py-12 text-center text-neutral-500 print:hidden" aria-live="polite">
          {t.cargando}
        </p>
      )}

      {estado.fase === "error" && (
        <div className="space-y-3 py-12 text-center print:hidden" role="alert">
          <p className="text-lg font-semibold">{t.error}</p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{estado.mensaje}</p>
          <button
            type="button"
            onClick={reintentar}
            className="rounded-xl border border-neutral-300 px-5 py-3 font-medium dark:border-neutral-700"
          >
            {t.reintentar}
          </button>
        </div>
      )}

      {estado.fase === "listo" && estado.tarjetas.length === 0 && (
        <p className="py-12 text-center text-neutral-500">{t.vacio}</p>
      )}

      {estado.fase === "listo" && estado.tarjetas.length > 0 && (
        <div className="qr-hoja grid grid-cols-1 gap-4 sm:grid-cols-2">
          {estado.tarjetas.map(({ place, token, url, dataUrl }) => (
            <article
              key={place.id}
              className="qr-tarjeta relative flex flex-col items-center justify-center gap-3 rounded-2xl border border-neutral-200 bg-white p-6 text-center text-neutral-900"
            >
              {estado.demo && (
                <span className="absolute top-3 right-3 rounded border-2 border-amber-600 px-2 py-0.5 text-xs font-black tracking-widest text-amber-700">
                  {t.marcaDemo}
                </span>
              )}
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold tracking-wide text-teal-800 uppercase">
                {t.categorias[place.category] ?? place.category}
              </span>
              <h2 className="text-2xl leading-tight font-bold">{place.name}</h2>
              {/* eslint-disable-next-line @next/next/no-img-element -- data URL generada en el cliente */}
              <img src={dataUrl} alt={`${t.altQr} ${place.name}`} title={url} className="qr-img size-56 sm:size-64" />
              <p className="text-lg font-semibold">{t.lema}</p>
              <p className="font-mono text-[11px] break-all text-neutral-500">{token}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
