import type { Event, Place, RouteStop } from "@/lib/types";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface MapaProps {
  /** Lugares a mostrar como marcadores. */
  places?: Place[];
  /** Eventos (agenda viva) a mostrar como marcadores. */
  events?: Event[];
  /** Paradas de una ruta: se numeran y se unen con una línea. */
  stops?: RouteStop[];
  /** Ubicación del visitante, si dio permiso. */
  userLocation?: LatLng | null;
  /** Resalta este lugar. */
  selectedPlaceId?: string | null;
  /** Se llama al pulsar "Ver detalle" en un lugar o parada. */
  onSelectPlace?: (place: Place) => void;
  /** Muestra la leyenda de colores. */
  showLegend?: boolean;
  /** Clases del contenedor; define aquí la altura (por defecto h-80). */
  className?: string;
}
