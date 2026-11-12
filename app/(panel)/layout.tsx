import React from "react";
import Link from "next/link";
import { PanelHeader } from "@/components/paneles";
import { PulsoLogo } from "@/components/ui/PulsoLogo";

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex flex-col bg-neutral-50/70 text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-100">
      <PanelHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        {children}
      </main>

      {/* Pie de página cálido e informativo para comerciantes y jurado */}
      <footer className="mt-12 border-t border-neutral-200/80 bg-white/80 py-8 text-xs text-neutral-500 backdrop-blur-xs dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-400">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <PulsoLogo size="sm" conTexto={false} />
            <div className="space-y-0.5">
              <p className="font-bold text-neutral-800 dark:text-neutral-200">
                Pulso Jarocho · Centro Vivo
              </p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Iniciativa para la dinamización urbana y comercial del Centro Histórico de Veracruz.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <Link href="/admin" className="hover:text-teal-700 dark:hover:text-teal-400 transition">
              Tablero Admin
            </Link>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <Link href="/comercio" className="hover:text-amber-700 dark:hover:text-amber-400 transition">
              Mi Comercio
            </Link>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <Link href="/escanear" className="hover:text-teal-700 dark:hover:text-teal-400 transition">
              Lector QR
            </Link>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <Link href="/" className="hover:text-neutral-800 dark:hover:text-neutral-200 transition">
              Portada Turística
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-4 max-w-6xl px-4 text-center sm:px-6 space-y-1">
          <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
            Métricas basadas en actividad registrada en la app (visitas validadas por QR y cupones confirmados).
          </p>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Powered by <span className="font-semibold text-teal-700 dark:text-teal-400">Protón</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

