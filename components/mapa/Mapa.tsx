"use client";

import dynamic from "next/dynamic";
import { es } from "@/lib/i18n/es";

/**
 * Mapa del Centro Histórico (Leaflet + OpenStreetMap), cargado solo en el cliente.
 *
 * Uso:
 *   import { Mapa } from "@/components/mapa";
 *   <Mapa places={places} stops={route.stops} userLocation={pos} onSelectPlace={(p) => ...} className="h-96 w-full" />
 */
export const Mapa = dynamic(() => import("./MapaCentro"), {
  ssr: false,
  loading: () => (
    <div className="flex h-80 w-full items-center justify-center rounded-xl bg-neutral-100 text-sm text-neutral-500 dark:bg-neutral-900">
      {es.mapa.cargando}
    </div>
  ),
});
