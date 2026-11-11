// Punto de entrada del motor de recomendación (Integrante 4).
// El Integrante 3 importa desde aquí para no conocer los archivos internos.

export { buildRoute, buildReason } from "./route";
export type { BuildRouteOptions, EngineRouteResponse, EngineRouteStop } from "./route";
export { scorePlace, matchesInterest, normalizeText } from "./score";
export type { ScoreBreakdown, ScoreContext } from "./score";
export { fitsBudget, isOpenAt, readPlaceInfo } from "./place";
export type { PlaceInfo } from "./place";
export { distanceM, walkMinutes } from "./geo";
export { weights, engineConfig } from "./config";
export {
  CATALOGO_AMPLIO,
  CATALOGO_DEMO,
  COMERCIOS_DEMO,
  LUGARES_DEMO,
  NEGOCIOS_DEMO,
  buscarLugarDemo,
} from "./datos-demo";
export { EVENTOS_DEMO, eventosDemo } from "./datos-eventos";
