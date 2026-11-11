// Datos de demostración de lugares y comercios (Integrante 4).
//
// Fuente: la "Guía turística actualizada: Veracruz Puerto" del equipo
// (LISTA.md), con los horarios oficiales reportados.
//
// Criterios usados (importantes para el resto del equipo):
// - Los horarios vienen de la lista del equipo, así que `verified` va en true
//   y el horario semanal viaja en `meta.horarioSemanal` (por día de la semana,
//   ISO 8601: 1 = lunes … 7 = domingo). Un día con `null` = cerrado ese día.
// - Cuando la lista dice "se recomienda confirmar" o da horarios variables,
//   se marca `meta.horarioVerificado: false` y se anota la salvedad en
//   `meta.horarioNota`. El motor entonces NO descarta el lugar: lo trata como
//   "no se sabe", que es más honesto que inventar.
// - `meta.priceLevel` es una estimación operativa marcada como no verificada
//   (`meta.precioVerificado: false`). No se inventa ninguna cifra de precio.
// - `meta.avgVisitMin` y `meta.opportunity` son estimaciones del equipo para
//   que el motor tenga con qué trabajar; se ajustan en `lib/engine/config.ts`.
// - Las coordenadas son aproximadas (`meta.coordenadasAproximadas: true`):
//   sirven para calcular distancias y ordenar la ruta, no para navegar.
//
// Los tipos vienen de `lib/types.ts` (Integrante 3). Este archivo no los
// modifica: los datos opcionales viajan en `meta`.

import type { Business, Place } from "../types";
import type { DiaSemana, HorarioSemanal, TramoHorario } from "./place";

/** Categorías que el motor reconoce como intereses. */
export const CATEGORIAS = [
  "historia",
  "gastronomia",
  "cultura",
  "paseo",
  "compras",
] as const;

export type Categoria = (typeof CATEGORIAS)[number];

/** Tramo fijo "abierto las 24 horas" (cierra a medianoche). */
const TODO_EL_DIA: TramoHorario = ["00:00", "24:00"];

/**
 * Días en que el lugar abre con este tramo.
 * Los días que no se mencionan se dejan sin dato, para poder combinarlos
 * con `cerrado()` sin pisarse.
 */
function abre(tramo: TramoHorario, ...diasAbre: number[]): HorarioSemanal {
  const horario: HorarioSemanal = {};
  for (const dia of diasAbre) horario[dia as DiaSemana] = tramo;
  return horario;
}

/** Días en que el lugar está cerrado. */
function cerrado(...diasCerrados: number[]): HorarioSemanal {
  const horario: HorarioSemanal = {};
  for (const dia of diasCerrados) horario[dia as DiaSemana] = null;
  return horario;
}

/** Horario de 24 horas, todos los días. */
const ABIERTO_24H: HorarioSemanal = abre(TODO_EL_DIA, 1, 2, 3, 4, 5, 6, 7);

/** Todos los días con el mismo tramo. */
function todosLosDias(tramo: TramoHorario): HorarioSemanal {
  return abre(tramo, 1, 2, 3, 4, 5, 6, 7);
}

const meta = (
  avgVisitMin: number,
  opportunity: number,
  extra: Record<string, unknown> = {},
): Record<string, unknown> => ({
  avgVisitMin,
  opportunity,
  coordenadasAproximadas: true,
  ...extra,
});

// ---------------------------------------------------------------------------
// Los 12 lugares "top" con sus horarios oficiales.
// ---------------------------------------------------------------------------

export const LUGARES_DEMO: Place[] = [
  {
    id: "malecon",
    name: "Malecón de Veracruz",
    category: "paseo",
    lat: 19.2015,
    lng: -96.1352,
    description:
      "El corazón turístico de la ciudad: el mejor lugar para caminar al atardecer entre el mar y los portales.",
    hours: "Todos los días, 24 horas",
    verified: true,
    meta: meta(30, 0.4, {
      horarioSemanal: ABIERTO_24H,
      horarioVerificado: true,
      alAireLibre: true,
      accesoPublico: true,
    }),
  },
  {
    id: "fuerte-san-juan-de-ulua",
    name: "Fuerte de San Juan de Ulúa",
    category: "historia",
    lat: 19.2094,
    lng: -96.1314,
    description:
      "Impresionante fortaleza-isla del siglo XVI que fue aduana y prisión. Se llega en lancha desde el muelle.",
    hours: "Martes a domingo de 9:30 a 16:30 (desalojo 17:00). Lunes cerrado.",
    verified: true,
    meta: meta(75, 0.7, {
      horarioSemanal: { ...abre(["09:30", "16:30"], 2, 3, 4, 5, 6, 7), ...cerrado(1) },
      horarioVerificado: true,
      horarioNota:
        "Último acceso 16:30. Algunas fuentes mencionan 10:00–16:00, conviene llegar temprano.",
      requiereTransporte: "lancha",
      alAireLibre: true,
    }),
  },
  {
    id: "acuario-de-veracruz",
    name: "Acuario de Veracruz",
    category: "cultura",
    lat: 19.1874,
    lng: -96.1229,
    description:
      "Uno de los acuarios más grandes de América Latina, ideal para ir en familia.",
    hours: "Lunes a jueves de 10:00 a 19:00; viernes a domingo y días festivos de 10:00 a 19:30.",
    verified: true,
    meta: meta(90, 0.6, {
      horarioSemanal: {
        ...abre(["10:00", "19:00"], 1, 2, 3, 4),
        ...abre(["10:00", "19:30"], 5, 6, 7),
      },
      horarioVerificado: true,
      horarioNota: "En Carnaval o Semana Santa suele haber horarios especiales.",
      indoor: true,
      familiar: true,
    }),
  },
  {
    id: "zocalo",
    name: "Zócalo y Centro Histórico",
    category: "paseo",
    lat: 19.2002,
    lng: -96.1385,
    description:
      "El alma social de la ciudad, rodeado de portales coloniales y con danzón en vivo.",
    hours: "Todos los días, 24 horas",
    verified: true,
    meta: meta(25, 0.3, {
      horarioSemanal: ABIERTO_24H,
      horarioVerificado: true,
      alAireLibre: true,
      accesible: true,
    }),
  },
  {
    id: "museo-naval-mexico",
    name: "Museo Naval México",
    category: "historia",
    lat: 19.1992,
    lng: -96.1351,
    description: "Una mirada profunda a la historia marítima del país.",
    hours: "Martes a domingo de 10:00 a 17:00. Lunes cerrado.",
    verified: true,
    meta: meta(45, 0.6, {
      horarioSemanal: { ...abre(["10:00", "17:00"], 2, 3, 4, 5, 6, 7), ...cerrado(1) },
      horarioVerificado: true,
      horarioNota: "Algunas fuentes indican hasta las 16:00, se recomienda ir con margen.",
      indoor: true,
    }),
  },
  {
    id: "playa-villa-del-mar",
    name: "Playa Villa del Mar",
    category: "paseo",
    lat: 19.1829,
    lng: -96.1242,
    description:
      "La playa urbana más tradicional y accesible desde el centro.",
    hours: "Acceso público, 24 horas",
    verified: true,
    meta: meta(45, 0.5, {
      horarioSemanal: ABIERTO_24H,
      horarioVerificado: true,
      alAireLibre: true,
      playa: true,
      accesoPublico: true,
    }),
  },
  {
    id: "boca-del-rio",
    name: "Boca del Río y sus playas",
    category: "paseo",
    lat: 19.133,
    lng: -96.1027,
    description:
      "Zona con playas más tranquilas y de agua más clara, como Mocambo.",
    hours: "Acceso público, 24 horas",
    verified: true,
    meta: meta(75, 0.5, {
      horarioSemanal: ABIERTO_24H,
      horarioVerificado: true,
      alAireLibre: true,
      playa: true,
      accesoPublico: true,
      fueraDelCentro: true,
    }),
  },
  {
    id: "isla-de-sacrificios",
    name: "Isla de Sacrificios",
    category: "paseo",
    lat: 19.1755,
    lng: -96.092,
    description:
      "Una escapada en lancha para disfrutar de aguas claras y paisajes paradisíacos.",
    hours: "Cerrada al público desde 1982. Los tours en lancha operan de 9:00 a 14:00.",
    verified: true,
    meta: meta(180, 0.8, {
      horarioSemanal: todosLosDias(["09:00", "14:00"]),
      horarioVerificado: true,
      horarioNota:
        "Acceso restringido: la isla está cerrada al público desde 1982 por ser área natural protegida. Solo se ubica en lancha.",
      estado: "cerradoAlPublico",
      requiereTransporte: "lancha",
      excursion: true,
      fueraDelCentro: true,
    }),
  },
  {
    id: "faro-venustiano-carranza",
    name: "Faro Venustiano Carranza",
    category: "historia",
    lat: 19.2019,
    lng: -96.1335,
    description:
      "Un hito arquitectónico con historia: fue sede del gobierno de Carranza en 1914.",
    hours: "Todos los días de 8:00 a 20:00 (acceso al exterior).",
    verified: true,
    meta: meta(25, 0.6, {
      horarioSemanal: todosLosDias(["08:00", "20:00"]),
      horarioVerificado: true,
      horarioNota: "El ingreso a la torre puede estar sujeto a disposiciones locales.",
      alAireLibre: true,
    }),
  },
  {
    id: "baluarte-de-santiago",
    name: "Baluarte de Santiago",
    category: "historia",
    lat: 19.1981,
    lng: -96.1332,
    description: "Vestigio de las antiguas murallas defensivas del puerto.",
    hours: "Cerrado temporalmente por restauración. Horario habitual: martes a domingo de 9:00 a 17:00.",
    verified: true,
    meta: meta(20, 0.5, {
      horarioSemanal: { ...abre(["09:00", "17:00"], 2, 3, 4, 5, 6, 7), ...cerrado(1) },
      horarioVerificado: true,
      horarioNota: "Cerrado temporalmente por restauración.",
      estado: "cerradoTemporalmente",
      alAireLibre: true,
      accesible: true,
    }),
  },
  {
    id: "barrio-de-la-huaca",
    name: "Barrio de La Huaca",
    category: "historia",
    lat: 19.1975,
    lng: -96.1396,
    description:
      "Para conocer una cara más auténtica y tradicional de la ciudad.",
    hours: "Abierto las 24 horas. Puestos y actividad comercial desde las 8:00.",
    verified: true,
    meta: meta(35, 0.85, {
      horarioSemanal: ABIERTO_24H,
      horarioVerificado: true,
      horarioNota: "Los puestos de antojitos operan principalmente de 8:00 hasta la noche.",
      barrio: true,
      alAireLibre: true,
    }),
  },
  {
    id: "portales-de-veracruz",
    name: "Los Portales de Veracruz",
    category: "paseo",
    lat: 19.1996,
    lng: -96.1386,
    description:
      "Sentarse a tomar un café y ver pasar la vida es un ritual obligado.",
    hours: "Abiertos las 24 horas (los cafés de abajo tienen horario comercial).",
    verified: true,
    meta: meta(20, 0.35, {
      horarioSemanal: ABIERTO_24H,
      horarioVerificado: true,
      alAireLibre: true,
      accesible: true,
      bajoTecho: true,
    }),
  },
];

// ---------------------------------------------------------------------------
// Los 6 comercios "imprescindibles" con sus horarios.
// ---------------------------------------------------------------------------

export const COMERCIOS_DEMO: Place[] = [
  {
    id: "gran-cafe-de-la-parroquia",
    name: "Gran Café de la Parroquia",
    category: "gastronomia",
    lat: 19.2011,
    lng: -96.1351,
    description:
      "Una institución desde 1808, famosa por su «café lechero» servido desde lo alto.",
    hours: "Todos los días de 7:00 a 23:00 (se recomienda confirmar).",
    verified: true,
    meta: meta(20, 0.4, {
      horarioSemanal: todosLosDias(["07:00", "23:00"]),
      horarioVerificado: false,
      horarioNota:
        "El horario más reportado es 7:00–23:00, pero algunas fuentes mencionan 6:00–1:00 o 7:00–00:00. Se recomienda confirmar en el lugar.",
      priceLevel: "medio",
      precioVerificado: false,
      bajoTecho: true,
    }),
  },
  {
    id: "mercado-de-artesanias",
    name: "Mercado de Artesanías del Malecón",
    category: "compras",
    lat: 19.2027,
    lng: -96.1401,
    description:
      "El lugar clásico para comprar recuerdos y artesanías típicas veracruzanas.",
    hours: "Generalmente de 9:00 a 20:00. Abierto todos los días.",
    verified: true,
    meta: meta(30, 0.7, {
      horarioSemanal: todosLosDias(["09:00", "20:00"]),
      horarioVerificado: false,
      horarioNota:
        "Varía según el local: hay referencias de 9:30–18:00 e incluso hasta 22:00 en algunas plazas artesanales.",
      priceLevel: "bajo",
      precioVerificado: false,
      alAireLibre: true,
    }),
  },
  {
    id: "mariscos-villa-rica-mocambo",
    name: "Mariscos Villa Rica Mocambo",
    category: "gastronomia",
    lat: 19.1335,
    lng: -96.1057,
    description:
      "Una recomendación local segura para disfrutar de mariscos frescos del Golfo.",
    hours: "Lun a mié y dom de 11:15 a 22:00; jue a sáb de 11:15 a 23:00.",
    verified: true,
    meta: meta(60, 0.7, {
      horarioSemanal: {
        ...abre(["11:15", "22:00"], 1, 2, 3, 7),
        ...abre(["11:15", "23:00"], 4, 5, 6),
      },
      horarioVerificado: true,
      priceLevel: "alto",
      precioVerificado: false,
      fueraDelCentro: true,
    }),
  },
  {
    id: "toritos-la-chata",
    name: "Toritos La Chata",
    category: "gastronomia",
    lat: 19.1977,
    lng: -96.1346,
    description:
      "Para probar la bebida tradicional veracruzana por excelencia: los «toritos».",
    hours: "Todos los días de 10:00 a 21:00.",
    verified: true,
    meta: meta(20, 0.55, {
      horarioSemanal: todosLosDias(["10:00", "21:00"]),
      horarioVerificado: true,
      priceLevel: "bajo",
      precioVerificado: false,
      bajoTecho: true,
    }),
  },
  {
    id: "plaza-andamar",
    name: "Plaza Andamar",
    category: "compras",
    lat: 19.139,
    lng: -96.1026,
    description:
      "Un centro comercial moderno en Boca del Río para compras de marca y entretenimiento.",
    hours: "Todos los días de 11:00 a 21:00.",
    verified: true,
    meta: meta(60, 0.6, {
      horarioSemanal: todosLosDias(["11:00", "21:00"]),
      horarioVerificado: true,
      horarioNota: "Horario general del centro comercial; algunas tiendas pueden variar.",
      priceLevel: "alto",
      precioVerificado: false,
      indoor: true,
      fueraDelCentro: true,
    }),
  },
  {
    id: "mercado-hidalgo",
    name: "Mercado Hidalgo",
    category: "compras",
    lat: 19.1936,
    lng: -96.1371,
    description:
      "El mercado tradicional donde los locales compran mariscos, café y vainilla.",
    hours: "Lunes a sábado de 7:00 a 18:00; domingos de 7:00 a 16:00.",
    verified: true,
    meta: meta(30, 0.75, {
      horarioSemanal: {
        ...abre(["07:00", "18:00"], 1, 2, 3, 4, 5, 6),
        ...abre(["07:00", "16:00"], 7),
      },
      horarioVerificado: true,
      horarioNota: "Algunos puestos pueden abrir más temprano (6:00) o cerrar más tarde.",
      priceLevel: "bajo",
      precioVerificado: false,
      indoor: true,
    }),
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
  meta: { datosPendientes: ["contacto"] },
}));

// ---------------------------------------------------------------------------
// Lista ampliada con horarios.
// ---------------------------------------------------------------------------

export const LUGARES_EXTENDIDOS: Place[] = [
  {
    id: "centro-cultural-atarazanas",
    name: "Centro Cultural Atarazanas",
    category: "cultura",
    lat: 19.1984,
    lng: -96.1346,
    description:
      "Un vibrante centro cultural en el centro histórico, ideal para exposiciones de arte.",
    hours: "Oficina lunes a viernes de 9:00 a 18:00; exposiciones de martes a domingo de 10:00 a 19:00.",
    verified: true,
    meta: meta(60, 0.7, {
      horarioSemanal: { ...abre(["10:00", "19:00"], 2, 3, 4, 5, 6, 7), ...cerrado(1) },
      horarioVerificado: false,
      horarioNota: "El horario de oficina es de lunes a viernes; las exposiciones pueden variar según la muestra.",
      indoor: true,
    }),
  },
  {
    id: "centro-cultural-leyes-de-reforma",
    name: "Centro Cultural Leyes de Reforma",
    category: "cultura",
    lat: 19.1927,
    lng: -96.1665,
    description:
      "Espacio moderno con exposiciones y una tienda de artesanías locales.",
    hours: "Martes a domingo de 10:00 a 18:00.",
    verified: true,
    meta: meta(55, 0.7, {
      horarioSemanal: { ...abre(["10:00", "18:00"], 2, 3, 4, 5, 6, 7), ...cerrado(1) },
      horarioVerificado: true,
      indoor: true,
      fueraDelCentro: true,
    }),
  },
  {
    id: "casa-museo-benito-juarez",
    name: "Casa Museo Benito Juárez",
    category: "historia",
    lat: 19.1967,
    lng: -96.1337,
    description:
      "Sitio de interés histórico y punto de venta de artesanías.",
    hours: "Martes a domingo de 10:00 a 18:00 (entrada gratuita).",
    verified: true,
    meta: meta(40, 0.7, {
      horarioSemanal: { ...abre(["10:00", "18:00"], 2, 3, 4, 5, 6, 7), ...cerrado(1) },
      horarioVerificado: true,
      indoor: true,
    }),
  },
  {
    id: "ex-convento-bethlehemita",
    name: "Ex Convento Betlehemita",
    category: "cultura",
    lat: 19.1963,
    lng: -96.1343,
    description:
      "Un edificio con siglos de historia que hoy funciona como centro cultural.",
    hours: "Martes a domingo, generalmente de 10:00 a 19:00.",
    verified: true,
    meta: meta(50, 0.65, {
      horarioSemanal: { ...abre(["10:00", "19:00"], 2, 3, 4, 5, 6, 7), ...cerrado(1) },
      horarioVerificado: false,
      horarioNota: "Algunas fuentes indican hasta las 18:00.",
      indoor: true,
    }),
  },
  {
    id: "plaza-de-la-republica",
    name: "Plaza de la República",
    category: "historia",
    lat: 19.2027,
    lng: -96.1386,
    description:
      "Una explanada histórica entre el centro y el puerto.",
    hours: "Espacio público, 24 horas.",
    verified: true,
    meta: meta(20, 0.6, {
      horarioSemanal: ABIERTO_24H,
      horarioVerificado: true,
      alAireLibre: true,
      accesible: true,
      accesoPublico: true,
    }),
  },
  {
    id: "playa-mocambo",
    name: "Playa Mocambo",
    category: "paseo",
    lat: 19.133,
    lng: -96.1027,
    description:
      "Una playa de oleaje más fuerte, muy frecuentada por locales y turistas.",
    hours: "Acceso público, 24 horas.",
    verified: true,
    meta: meta(45, 0.5, {
      horarioSemanal: ABIERTO_24H,
      horarioVerificado: true,
      alAireLibre: true,
      playa: true,
      accesoPublico: true,
      fueraDelCentro: true,
    }),
  },
  {
    id: "playa-de-anton-lizardo",
    name: "Playa de Antón Lizardo",
    category: "paseo",
    lat: 19.1215,
    lng: -96.1089,
    description:
      "Un poco más al sur: opción para un día de playa más tranquilo.",
    hours: "Acceso público, 24 horas.",
    verified: true,
    meta: meta(70, 0.55, {
      horarioSemanal: ABIERTO_24H,
      horarioVerificado: true,
      alAireLibre: true,
      playa: true,
      accesoPublico: true,
      fueraDelCentro: true,
    }),
  },
  {
    id: "rio-de-la-antigua",
    name: "Río de La Antigua",
    category: "historia",
    lat: 19.311,
    lng: -96.297,
    description:
      "Un paseo escénico por el río y los vestigios de la primera ciudad colonial.",
    hours: "Zona ribereña libre las 24 horas; restaurantes y aventura de 9:00 a 18:00.",
    verified: true,
    meta: meta(120, 0.8, {
      horarioSemanal: todosLosDias(["09:00", "18:00"]),
      horarioVerificado: true,
      horarioNota: "El acceso a la ribera es libre; el horario aplica a locales y actividades.",
      fueraDelCentro: true,
      excursion: true,
    }),
  },
  {
    id: "tlacotalpan",
    name: "Tlacotalpan",
    category: "historia",
    lat: 18.6121,
    lng: -95.6612,
    description:
      "Pueblo Mágico cercano (a ~1.5 h) famoso por su arquitectura de colores vibrantes.",
    hours: "Acceso libre al pueblo las 24 horas; museos de martes a domingo de 10:00 a 17:00.",
    verified: true,
    meta: meta(300, 0.85, {
      horarioSemanal: { ...abre(["10:00", "17:00"], 2, 3, 4, 5, 6, 7), ...cerrado(1) },
      horarioVerificado: true,
      horarioNota: "Los museos suelen cerrar a las 17:00 o 18:00 según el recinto.",
      fueraDelCentro: true,
      excursion: true,
      puebloMagico: true,
    }),
  },
  {
    id: "macroplaza-del-malecon",
    name: "Macroplaza del Malecón",
    category: "paseo",
    lat: 19.2025,
    lng: -96.1375,
    description:
      "La explanada que conecta el Baluarte con el barrio de La Huaca, perfecta para caminar.",
    hours: "Abierta las 24 horas.",
    verified: true,
    meta: meta(20, 0.4, {
      horarioSemanal: ABIERTO_24H,
      horarioVerificado: true,
      alAireLibre: true,
      accesible: true,
      accesoPublico: true,
    }),
  },
  {
    id: "plaza-soberania",
    name: "Plaza Soberanía",
    category: "paseo",
    lat: 19.155,
    lng: -96.0967,
    description:
      "Espacio público rehabilitado, usado por las familias locales por las tardes.",
    hours: "Aproximadamente de 6:00 a 23:30.",
    verified: true,
    meta: meta(25, 0.65, {
      horarioSemanal: todosLosDias(["06:00", "23:30"]),
      horarioVerificado: false,
      horarioNota: "Horario variable según los eventos programados.",
      alAireLibre: true,
      accesible: true,
      fueraDelCentro: true,
    }),
  },
  {
    id: "plazuela-de-la-campana",
    name: "Plazuela de la Campana",
    category: "cultura",
    lat: 19.1989,
    lng: -96.137,
    description:
      "Un rincón donde, según la tradición, se baila danzón varias noches por semana.",
    hours: "El espacio físico está abierto las 24 horas; el danzón suele ser por las tardes/noches.",
    verified: true,
    meta: meta(30, 0.75, {
      horarioSemanal: ABIERTO_24H,
      horarioVerificado: true,
      horarioNota: "El danzón y la salsa suelen ser por las tardes y noches (por ejemplo, domingos a las 18:00).",
      alAireLibre: true,
      danzon: true,
      accesoPublico: true,
    }),
  },
];

/** Catálogo ampliado de comercios con sabor local. */
export const COMERCIOS_EXTENDIDOS: Place[] = [
  {
    id: "jarrita-de-oro",
    name: "Jarrita de Oro",
    category: "gastronomia",
    lat: 19.1963,
    lng: -96.1297,
    description:
      "Restaurante emblemático, famoso por su cocina tradicional, desayunos y porciones generosas.",
    hours: "Todos los días de 7:00 a 21:30.",
    verified: true,
    meta: meta(55, 0.6, {
      horarioSemanal: todosLosDias(["07:00", "21:30"]),
      horarioVerificado: false,
      horarioNota: "Horario aproximado, con variaciones según la sucursal.",
      priceLevel: "medio",
      precioVerificado: false,
    }),
  },
  {
    id: "gran-cafe-del-portal",
    name: "Gran Café del Portal",
    category: "gastronomia",
    lat: 19.1996,
    lng: -96.1386,
    description:
      "Con tradición desde 1929, otra excelente opción para un buen café en el centro histórico.",
    hours: "Lunes a viernes de 7:00 a 23:30; sábados y domingos de 7:00 a 00:00.",
    verified: true,
    meta: meta(30, 0.55, {
      horarioSemanal: {
        ...abre(["07:00", "23:30"], 1, 2, 3, 4, 5),
        ...abre(["07:00", "00:00"], 6, 7),
      },
      horarioVerificado: true,
      priceLevel: "bajo",
      precioVerificado: false,
      bajoTecho: true,
    }),
  },
  {
    id: "mardel",
    name: "Mardel",
    category: "gastronomia",
    lat: 19.1984,
    lng: -96.1353,
    description: "Si buscas un desayuno con la mejor vista al mar, este es un buen lugar.",
    hours: "Desayuno: lun a sáb de 7:00 a 13:45, dom de 8:00 a 13:45. Comida: lun a sáb de 14:00 a 23:00, dom de 14:00 a 21:00.",
    verified: true,
    meta: meta(50, 0.6, {
      horarioSemanal: {
        ...abre(["14:00", "23:00"], 1, 2, 3, 4, 5, 6),
        ...abre(["14:00", "21:00"], 7),
      },
      horarioVerificado: true,
      horarioNota: "El desayuno va de 7:00 a 13:45 (domingo desde las 8:00).",
      priceLevel: "medio",
      precioVerificado: false,
      frenteAlMar: true,
    }),
  },
  {
    id: "los-farolitos",
    name: "Los Farolitos",
    category: "gastronomia",
    lat: 19.1731,
    lng: -96.1247,
    description:
      "Recomendado para desayunos y guisados caseros en un ambiente informal y familiar.",
    hours: "Todos los días de 7:00 a 23:30 (aproximadamente).",
    verified: true,
    meta: meta(45, 0.65, {
      horarioSemanal: todosLosDias(["07:00", "23:30"]),
      horarioVerificado: false,
      horarioNota: "Horario aproximado.",
      priceLevel: "bajo",
      precioVerificado: false,
    }),
  },
  {
    id: "guayaberas-cab",
    name: "Guayaberas Cab",
    category: "compras",
    lat: 19.1994,
    lng: -96.1438,
    description:
      "Sastrería familiar en el centro, especializada en las clásicas guayaberas jarochas.",
    hours: "Reportada como cerrada permanentemente.",
    verified: true,
    meta: meta(35, 0.75, {
      horarioSemanal: {},
      horarioVerificado: true,
      horarioNota: "Cerrada permanentemente según múltiples fuentes. Se recomienda buscar otras opciones de guayaberas en el centro.",
      estado: "cerradoAlPublico",
      priceLevel: "medio",
      precioVerificado: false,
    }),
  },
  {
    id: "cafe-andrade",
    name: "Café Andrade",
    category: "gastronomia",
    lat: 19.2182,
    lng: -96.1855,
    description:
      "Tostadora local en Boca del Río que vende café de altura de Coatepec y Huatusco, molido al momento.",
    hours: "Sucursal Tampiquera: todos los días de 7:30 a 20:30 (desayuno hasta las 21:20).",
    verified: true,
    meta: meta(25, 0.7, {
      horarioSemanal: todosLosDias(["07:30", "20:30"]),
      horarioVerificado: false,
      horarioNota: "El horario varía por sucursal; se indica el de la Tampiquera.",
      priceLevel: "medio",
      precioVerificado: false,
      fueraDelCentro: true,
    }),
  },
  {
    id: "portal-de-miranda",
    name: "Portal de Miranda",
    category: "compras",
    lat: 19.2001,
    lng: -96.1377,
    description:
      "En los portales del zócalo encontrarás tobacconists que venden puros de la región de San Andrés Tuxtla.",
    hours: "Edificio histórico (Fototeca): martes a domingo de 11:00 a 18:00.",
    verified: true,
    meta: meta(20, 0.8, {
      horarioSemanal: { ...abre(["11:00", "18:00"], 2, 3, 4, 5, 6, 7), ...cerrado(1) },
      horarioVerificado: true,
      horarioNota: "Los comercios de puros en los portales tienen horarios similares a los del Zócalo.",
      priceLevel: "medio",
      precioVerificado: false,
      bajoTecho: true,
    }),
  },
  {
    id: "tianguis-de-los-lavaderos",
    name: "Tianguis de Los Lavaderos",
    category: "compras",
    lat: 19.191,
    lng: -96.1291,
    description:
      "Si visitas en fin de semana, es un tianguis tradicional con más de 30 años, totalmente local.",
    hours: "Solo sábados y domingos de 9:00 a 17:30.",
    verified: true,
    meta: meta(50, 0.85, {
      horarioSemanal: { ...abre(["09:00", "17:30"], 6, 7), ...cerrado(1, 2, 3, 4, 5) },
      horarioVerificado: true,
      priceLevel: "bajo",
      precioVerificado: false,
      soloFinDeSemana: true,
    }),
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
