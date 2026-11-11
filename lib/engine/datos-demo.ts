// Datos de demostración de lugares y comercios (Integrante 4).
//
// Fuente: la lista de "lugares y comercios imperdibles" del equipo (LISTA.md).
//
// Criterios usados (importantes para el resto del equipo):
// - `hours` va en null y `verified` en false: la lista NO trae horarios y no
//   se inventan. El motor los leerá como "se desconoce" (disponibilidad
//   neutra) hasta que alguien los verifique.
// - `meta.priceLevel` se deja en null salvo en comercios de comida y mercado,
//   donde se pone una estimación operativa marcada como NO verificada
//   (`meta.precioVerificado: false`). No se inventa ninguna cifra de precio.
// - `meta.avgVisitMin` y `meta.opportunity` son estimaciones del equipo para
//   que el motor tenga con qué trabajar; se ajustan en `lib/engine/config.ts`.
// - Las coordenadas son aproximadas (`meta.coordenadasAproximadas: true`):
//   sirven para calcular distancias y ordenar la ruta, no para navegar.
//
// Los tipos vienen de `lib/types.ts` (Integrante 3). Este archivo no los
// modifica: los datos opcionales viajan en `meta`.

import type { Business, Place } from "../types";

/** Categorías que el motor reconoce como intereses. */
export const CATEGORIAS = [
  "historia",
  "gastronomia",
  "cultura",
  "paseo",
  "compras",
] as const;

export type Categoria = (typeof CATEGORIAS)[number];

const meta = (
  avgVisitMin: number,
  opportunity: number,
  extra: Record<string, unknown> = {},
): Record<string, unknown> => ({
  avgVisitMin,
  opportunity,
  coordenadasAproximadas: true,
  horarioPorVerificar: true,
  ...extra,
});

// ---------------------------------------------------------------------------
// Los 12 lugares "imperdibles" del Centro Histórico y alrededores.
// ---------------------------------------------------------------------------

export const LUGARES_DEMO: Place[] = [
  {
    id: "malecon",
    name: "Malecón de Veracruz",
    category: "paseo",
    lat: 19.5433,
    lng: -96.921,
    description:
      "El corazón turístico de la ciudad: el mejor lugar para caminar al atardecer entre el mar y los portales.",
    hours: null,
    verified: false,
    meta: meta(30, 0.4, { alAireLibre: true }),
  },
  {
    id: "fuerte-san-juan-de-ulua",
    name: "Fuerte de San Juan de Ulúa",
    category: "historia",
    lat: 19.5117,
    lng: -96.9017,
    description:
      "Impresionante fortaleza-isla del siglo XVI que fue aduana y prisión. Se llega en lancha desde el muelle.",
    hours: null,
    verified: false,
    meta: meta(75, 0.7, { requiereTransporte: "lancha", alAireLibre: true }),
  },
  {
    id: "acuario-de-veracruz",
    name: "Acuario de Veracruz",
    category: "cultura",
    lat: 19.5449,
    lng: -96.9297,
    description:
      "Uno de los acuarios más grandes de América Latina, ideal para ir en familia.",
    hours: null,
    verified: false,
    meta: meta(90, 0.6, { indoor: true, familiar: true }),
  },
  {
    id: "zocalo",
    name: "Zócalo y Centro Histórico",
    category: "paseo",
    lat: 19.5438,
    lng: -96.9111,
    description:
      "El alma social de la ciudad, rodeado de portales coloniales y con danzón en vivo.",
    hours: null,
    verified: false,
    meta: meta(25, 0.3, { alAireLibre: true, accesible: true }),
  },
  {
    id: "museo-naval-mexico",
    name: "Museo Naval México",
    category: "historia",
    lat: 19.5425,
    lng: -96.9135,
    description: "Una mirada profunda a la historia marítima del país.",
    hours: null,
    verified: false,
    meta: meta(45, 0.6, { indoor: true }),
  },
  {
    id: "playa-villa-del-mar",
    name: "Playa Villa del Mar",
    category: "paseo",
    lat: 19.5762,
    lng: -96.9322,
    description:
      "La playa urbana más tradicional y accesible desde el centro.",
    hours: null,
    verified: false,
    meta: meta(45, 0.5, { alAireLibre: true, playa: true }),
  },
  {
    id: "boca-del-rio",
    name: "Boca del Río y sus playas",
    category: "paseo",
    lat: 19.604,
    lng: -96.905,
    description:
      "Zona con playas más tranquilas y de agua más clara, como Mocambo.",
    hours: null,
    verified: false,
    meta: meta(75, 0.5, { alAireLibre: true, playa: true, fueraDelCentro: true }),
  },
  {
    id: "isla-de-sacrificios",
    name: "Isla de Sacrificios",
    category: "paseo",
    lat: 19.456,
    lng: -96.935,
    description:
      "Una escapada en lancha para disfrutar de aguas claras y paisajes paradisíacos.",
    hours: null,
    verified: false,
    meta: meta(180, 0.8, {
      requiereTransporte: "lancha",
      alAireLibre: true,
      fueraDelCentro: true,
      excursion: true,
    }),
  },
  {
    id: "faro-venustiano-carranza",
    name: "Faro Venustiano Carranza",
    category: "historia",
    lat: 19.548,
    lng: -96.927,
    description:
      "Un hito arquitectónico con historia: fue sede del gobierno de Carranza en 1914.",
    hours: null,
    verified: false,
    meta: meta(25, 0.6, { alAireLibre: true }),
  },
  {
    id: "baluarte-de-santiago",
    name: "Baluarte de Santiago",
    category: "historia",
    lat: 19.541,
    lng: -96.919,
    description: "Vestigio de las antiguas murallas defensivas del puerto.",
    hours: null,
    verified: false,
    meta: meta(20, 0.5, { alAireLibre: true, accesible: true }),
  },
  {
    id: "barrio-de-la-huaca",
    name: "Barrio de La Huaca",
    category: "historia",
    lat: 19.533,
    lng: -96.913,
    description:
      "Para conocer una cara más auténtica y tradicional de la ciudad.",
    hours: null,
    verified: false,
    meta: meta(35, 0.85, { barrio: true, alAireLibre: true }),
  },
  {
    id: "portales-de-veracruz",
    name: "Los Portales de Veracruz",
    category: "paseo",
    lat: 19.5435,
    lng: -96.9105,
    description:
      "Sentarse a tomar un café y ver pasar la vida es un ritual obligado.",
    hours: null,
    verified: false,
    meta: meta(20, 0.35, { alAireLibre: true, accesible: true, bajoTecho: true }),
  },
];

// ---------------------------------------------------------------------------
// Los 6 comercios "imprescindibles". Cada uno es un lugar (para que el motor
// pueda detener la ruta ahí) y además un comercio (con su ficha de negocio).
// ---------------------------------------------------------------------------

export const COMERCIOS_DEMO: Place[] = [
  {
    id: "gran-cafe-de-la-parroquia",
    name: "Gran Café de la Parroquia",
    category: "gastronomia",
    lat: 19.5432,
    lng: -96.9104,
    description:
      "Una institución desde 1808, famosa por su «café lechero» servido desde lo alto.",
    hours: null,
    verified: false,
    meta: meta(20, 0.4, { priceLevel: "medio", precioVerificado: false, bajoTecho: true }),
  },
  {
    id: "mercado-de-artesanias",
    name: "Mercado de Artesanías del Malecón",
    category: "compras",
    lat: 19.5417,
    lng: -96.9195,
    description:
      "El lugar clásico para comprar recuerdos y artesanías típicas veracruzanas.",
    hours: null,
    verified: false,
    meta: meta(30, 0.7, { priceLevel: "bajo", precioVerificado: false, alAireLibre: true }),
  },
  {
    id: "mariscos-villa-rica-mocambo",
    name: "Mariscos Villa Rica Mocambo",
    category: "gastronomia",
    lat: 19.608,
    lng: -96.906,
    description:
      "Una recomendación local segura para disfrutar de mariscos frescos del Golfo.",
    hours: null,
    verified: false,
    meta: meta(60, 0.7, { priceLevel: "alto", precioVerificado: false, fueraDelCentro: true }),
  },
  {
    id: "toritos-la-chata",
    name: "Toritos La Chata",
    category: "gastronomia",
    lat: 19.543,
    lng: -96.9098,
    description:
      "Para probar la bebida tradicional veracruzana por excelencia: los «toritos».",
    hours: null,
    verified: false,
    meta: meta(20, 0.55, { priceLevel: "bajo", precioVerificado: false, bajoTecho: true }),
  },
  {
    id: "plaza-andamar",
    name: "Plaza Andamar",
    category: "compras",
    lat: 19.596,
    lng: -96.894,
    description:
      "Un centro comercial moderno en Boca del Río para compras de marca y entretenimiento.",
    hours: null,
    verified: false,
    meta: meta(60, 0.6, { priceLevel: "alto", precioVerificado: false, indoor: true, fueraDelCentro: true }),
  },
  {
    id: "mercado-hidalgo",
    name: "Mercado Hidalgo",
    category: "compras",
    lat: 19.5425,
    lng: -96.915,
    description:
      "El mercado tradicional donde los locales compran mariscos, café y vainilla.",
    hours: null,
    verified: false,
    meta: meta(30, 0.75, { priceLevel: "bajo", precioVerificado: false, indoor: true }),
  },
];

/** Fichas de negocio de los 6 comercios (tabla `businesses`). */
export const NEGOCIOS_DEMO: Business[] = COMERCIOS_DEMO.map((lugar) => ({
  id: `negocio-${lugar.id}`,
  placeId: lugar.id,
  ownerId: null,
  name: lugar.name,
  contact: null,
  active: true,
  verified: false,
  meta: { datosPendientes: ["contacto", "horario", "precio"] },
}));

// ---------------------------------------------------------------------------
// Lista ampliada: sirve para subir el catálogo cuando haga falta variedad.
// ---------------------------------------------------------------------------

export const LUGARES_EXTENDIDOS: Place[] = [
  {
    id: "centro-cultural-atarazanas",
    name: "Centro Cultural Atarazanas",
    category: "cultura",
    lat: 19.5433,
    lng: -96.9108,
    description:
      "Un vibrante centro cultural en el centro histórico, ideal para exposiciones de arte.",
    hours: null,
    verified: false,
    meta: meta(60, 0.7, { indoor: true }),
  },
  {
    id: "centro-cultural-leyes-de-reforma",
    name: "Centro Cultural Leyes de Reforma",
    category: "cultura",
    lat: 19.5345,
    lng: -96.9132,
    description:
      "Espacio moderno con exposiciones y una tienda de artesanías locales.",
    hours: null,
    verified: false,
    meta: meta(55, 0.7, { indoor: true }),
  },
  {
    id: "casa-museo-benito-juarez",
    name: "Casa Museo Benito Juárez",
    category: "historia",
    lat: 19.5327,
    lng: -96.9143,
    description:
      "Sitio de interés histórico y punto de venta de artesanías.",
    hours: null,
    verified: false,
    meta: meta(40, 0.7, { indoor: true }),
  },
  {
    id: "ex-convento-bethlehemita",
    name: "Ex Convento Betlehemita",
    category: "cultura",
    lat: 19.5348,
    lng: -96.9112,
    description:
      "Un edificio con siglos de historia que hoy funciona como centro cultural.",
    hours: null,
    verified: false,
    meta: meta(50, 0.65, { indoor: true }),
  },
  {
    id: "plaza-de-la-republica",
    name: "Plaza de la República",
    category: "historia",
    lat: 19.5395,
    lng: -96.9148,
    description:
      "Una explanada histórica entre el centro y el puerto.",
    hours: null,
    verified: false,
    meta: meta(25, 0.6, { alAireLibre: true, accesible: true }),
  },
  {
    id: "playa-mocambo",
    name: "Playa Mocambo",
    category: "paseo",
    lat: 19.6072,
    lng: -96.9068,
    description:
      "Una playa de oleaje más fuerte, muy frecuentada por locales y turistas.",
    hours: null,
    verified: false,
    meta: meta(60, 0.5, { alAireLibre: true, playa: true, fueraDelCentro: true }),
  },
  {
    id: "playa-de-anton-lizardo",
    name: "Playa de Antón Lizardo",
    category: "paseo",
    lat: 19.6138,
    lng: -96.9012,
    description:
      "Un poco más al sur: opción para un día de playa más tranquilo.",
    hours: null,
    verified: false,
    meta: meta(70, 0.55, { alAireLibre: true, playa: true, fueraDelCentro: true }),
  },
  {
    id: "rio-de-la-antigua",
    name: "Río de La Antigua",
    category: "historia",
    lat: 19.5192,
    lng: -96.3216,
    description:
      "Un paseo escénico por el río y los vestigios de la primera ciudad colonial.",
    hours: null,
    verified: false,
    meta: meta(120, 0.8, { fueraDelCentro: true, excursion: true }),
  },
  {
    id: "tlacotalpan",
    name: "Tlacotalpan",
    category: "historia",
    lat: 19.2147,
    lng: -96.4761,
    description:
      "Pueblo Mágico cercano (a ~1.5 h) famoso por su arquitectura de colores vibrantes.",
    hours: null,
    verified: false,
    meta: meta(300, 0.85, { fueraDelCentro: true, excursion: true, puebloMagico: true }),
  },
  {
    id: "macroplaza-del-malecon",
    name: "Macroplaza del Malecón",
    category: "paseo",
    lat: 19.5431,
    lng: -96.9205,
    description:
      "La explanada que conecta el Baluarte con el barrio de La Huaca, perfecta para caminar.",
    hours: null,
    verified: false,
    meta: meta(20, 0.4, { alAireLibre: true, accesible: true }),
  },
  {
    id: "plaza-soberania",
    name: "Plaza Soberanía",
    category: "paseo",
    lat: 19.5408,
    lng: -96.9212,
    description:
      "Espacio público rehabilitado, usado por las familias locales por las tardes.",
    hours: null,
    verified: false,
    meta: meta(25, 0.65, { alAireLibre: true, accesible: true }),
  },
  {
    id: "plazuela-de-la-campana",
    name: "Plazuela de la Campana",
    category: "cultura",
    lat: 19.5427,
    lng: -96.9145,
    description:
      "Un rincón donde, según la tradición, se baila danzón varias noches por semana.",
    hours: null,
    verified: false,
    meta: meta(30, 0.75, { alAireLibre: true, danzon: true }),
  },
];

/** Catálogo ampliado de comercios con sabor local. */
export const COMERCIOS_EXTENDIDOS: Place[] = [
  {
    id: "jarrita-de-oro",
    name: "Jarrita de Oro",
    category: "gastronomia",
    lat: 19.5392,
    lng: -96.9128,
    description:
      "Restaurante emblemático, famoso por su cocina tradicional, desayunos y porciones generosas.",
    hours: null,
    verified: false,
    meta: meta(55, 0.6, { priceLevel: "medio", precioVerificado: false }),
  },
  {
    id: "gran-cafe-del-portal",
    name: "Gran Café del Portal",
    category: "gastronomia",
    lat: 19.5436,
    lng: -96.9108,
    description:
      "Con tradición desde 1929, otra excelente opción para un buen café en el centro histórico.",
    hours: null,
    verified: false,
    meta: meta(30, 0.55, { priceLevel: "bajo", precioVerificado: false, bajoTecho: true }),
  },
  {
    id: "mardel",
    name: "Mardel",
    category: "gastronomia",
    lat: 19.5439,
    lng: -96.9215,
    description: "Si buscas un desayuno con la mejor vista al mar, este es un buen lugar.",
    hours: null,
    verified: false,
    meta: meta(50, 0.6, { priceLevel: "medio", precioVerificado: false, frenteAlMar: true }),
  },
  {
    id: "los-farolitos",
    name: "Los Farolitos",
    category: "gastronomia",
    lat: 19.5433,
    lng: -96.9115,
    description:
      "Recomendado para desayunos y guisados caseros en un ambiente informal y familiar.",
    hours: null,
    verified: false,
    meta: meta(45, 0.65, { priceLevel: "bajo", precioVerificado: false }),
  },
  {
    id: "guayaberas-cab",
    name: "Guayaberas Cab",
    category: "compras",
    lat: 19.5428,
    lng: -96.9112,
    description:
      "Sastrería familiar en el centro, especializada en las clásicas guayaberas jarochas.",
    hours: null,
    verified: false,
    meta: meta(35, 0.75, { priceLevel: "medio", precioVerificado: false }),
  },
  {
    id: "cafe-andrade",
    name: "Café Andrade",
    category: "gastronomia",
    lat: 19.5968,
    lng: -96.8995,
    description:
      "Tostadora local en Boca del Río que vende café de altura de Coatepec y Huatusco, molido al momento.",
    hours: null,
    verified: false,
    meta: meta(25, 0.7, { priceLevel: "medio", precioVerificado: false, fueraDelCentro: true }),
  },
  {
    id: "portal-de-miranda",
    name: "Portal de Miranda",
    category: "compras",
    lat: 19.5437,
    lng: -96.9113,
    description:
      "En los portales del zócalo encontrarás tobacconists que venden puros de la región de San Andrés Tuxtla.",
    hours: null,
    verified: false,
    meta: meta(20, 0.8, { priceLevel: "medio", precioVerificado: false, bajoTecho: true }),
  },
  {
    id: "tianguis-de-los-lavaderos",
    name: "Tianguis de Los Lavaderos",
    category: "compras",
    lat: 19.5382,
    lng: -96.9147,
    description:
      "Si visitas en fin de semana, es un tianguis tradicional con más de 30 años, totalmente local.",
    hours: null,
    verified: false,
    meta: meta(50, 0.85, { priceLevel: "bajo", precioVerificado: false, soloFinDeSemana: true }),
  },
];

/** Los 12 lugares + los 6 comercios: el catálogo mínimo de la demo. */
export const CATALOGO_DEMO: Place[] = [...LUGARES_DEMO, ...COMERCIOS_DEMO];

/** Catálogo ampliado, para cuando se quiera más variedad en la ruta. */
export const CATALOGO_AMPLIO: Place[] = [
  ...CATALOGO_DEMO,
  ...LUGARES_EXTENDIDOS,
  ...COMERCIOS_EXTENDIDOS,
];

/** Busca un lugar por id en cualquiera de los catálogos. */
export function buscarLugarDemo(id: string): Place | undefined {
  return CATALOGO_AMPLIO.find((lugar) => lugar.id === id);
}
