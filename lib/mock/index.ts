import { Place, RouteStop, Profile, Mission, Reward, Visit } from "../types";

export const mockProfile: Profile = {
  id: "visitante-demo",
  alias: "JarochoExplorador",
  role: "visitante",
  points: 150,
  createdAt: "2026-11-11T10:00:00Z",
};

export const mockPlaces: Place[] = [
  {
    id: "p1",
    name: "Gran Café de la Parroquia",
    category: "gastronomia",
    lat: 19.2014,
    lng: -96.1348,
    description: "El café más tradicional del puerto de Veracruz. Prueba el clásico lechero servido al son de la campana.",
    hours: "Lun–Dom 06:00–23:00",
    verified: true,
    meta: {
      avgVisitMin: 45,
      accesible: true,
      priceLevel: "medio",
      opportunity: 0.2,
    },
  },
  {
    id: "p2",
    name: "Museo Histórico Naval",
    category: "historia",
    lat: 19.2023,
    lng: -96.1362,
    description: "Espacio dedicado a la memoria marítima nacional en el antiguo edificio de la Escuela Naval Militar.",
    hours: "Mar–Dom 10:00–17:00",
    verified: true,
    meta: {
      avgVisitMin: 90,
      bajoTecho: true,
      priceLevel: "bajo",
      opportunity: 0.5,
    },
  },
  {
    id: "p3",
    name: "Los Portales de Lerdo",
    category: "cultura",
    lat: 19.1997,
    lng: -96.1384,
    description: "Corazón festivo y musical del Zócalo con marimba en vivo y ambiente jarocho tradicional.",
    hours: "Lun–Dom 12:00–02:00",
    verified: true,
    meta: {
      avgVisitMin: 60,
      accesible: true,
      priceLevel: "medio",
      opportunity: 0.3,
    },
  },
  {
    id: "p4",
    name: "Baluarte de Santiago",
    category: "historia",
    lat: 19.1948,
    lng: -96.1332,
    description: "Último vestigio de la muralla que protegía al puerto de piratas, joya del siglo XVII.",
    hours: "Mar–Dom 09:00–17:00",
    verified: true,
    meta: {
      avgVisitMin: 40,
      priceLevel: "bajo",
      opportunity: 0.7,
    },
  },
];

export const mockMissions: Mission[] = [
  {
    id: "m1",
    placeId: "p1",
    businessId: "b1",
    title: "El ritual del tintineo",
    rules: "Pide un café lechero tradicional y haz tintinear la cuchara en tu vaso. Escanea el código QR en caja o mesa para validar tu visita.",
    points: 50,
    validFrom: "2026-11-11T00:00:00Z",
    validUntil: "2026-11-12T23:59:59Z",
    status: "activa",
  },
  {
    id: "m2",
    placeId: "p2",
    businessId: null,
    title: "Héroes del Golfo",
    rules: "Visita la sala de cañones históricos del Museo Naval. Escanea el código QR en el módulo de recepción.",
    points: 75,
    validFrom: "2026-11-11T00:00:00Z",
    validUntil: null,
    status: "activa",
  },
  {
    id: "m3",
    placeId: "p3",
    businessId: "b3",
    title: "Eco de Marimba",
    rules: "Disfruta un son jarocho bajo los Portales y escanea el código QR del comercio participante.",
    points: 40,
    validFrom: "2026-11-11T00:00:00Z",
    validUntil: null,
    status: "activa",
  },
];

export const mockRouteStops: RouteStop[] = [
  {
    place: mockPlaces[0],
    order: 1,
    distanceM: 200,
    etaMin: 3,
    reason: "Punto de partida ideal para recargar energía con un café lechero tradicional.",
    missionId: "m1",
  },
  {
    place: mockPlaces[1],
    order: 2,
    distanceM: 450,
    etaMin: 6,
    reason: "Excelente opción cultural a pocos pasos, bajo techo y con rica historia naval.",
    missionId: "m2",
  },
  {
    place: mockPlaces[2],
    order: 3,
    distanceM: 300,
    etaMin: 5,
    reason: "Cierra tu recorrido disfrutando la música y la vibra jarocha en el Zócalo.",
    missionId: "m3",
  },
];

export const mockRewards: Reward[] = [
  {
    id: "r1",
    businessId: "b1",
    title: "15% de descuento en repostería tradicional",
    conditions: "Válido en Gran Café de la Parroquia al mostrar este cupón.",
    pointsCost: 100,
    validUntil: "2026-11-30T23:59:59Z",
    redemptions: 12,
  },
  {
    id: "r2",
    businessId: "b3",
    title: "Bebida de cortesía en Los Portales",
    conditions: "Aplica en consumo mínimo de $150 pesos en comercios participantes.",
    pointsCost: 150,
    validUntil: "2026-11-30T23:59:59Z",
    redemptions: 8,
  },
  {
    id: "r3",
    businessId: "b2",
    title: "Postal artesanal conmemorativa del Puerto",
    conditions: "Canjeable en módulo de atención turística del Centro Histórico.",
    pointsCost: 80,
    validUntil: null,
    redemptions: 25,
  },
];

export const mockVisits: Visit[] = [
  {
    id: "v1",
    profileId: "visitante-demo",
    placeId: "p1",
    missionId: "m1",
    createdAt: "2026-11-11T12:30:00Z",
    method: "qr",
    pointsAwarded: 50,
  },
  {
    id: "v2",
    profileId: "visitante-demo",
    placeId: "p2",
    missionId: "m2",
    createdAt: "2026-11-11T14:15:00Z",
    method: "qr",
    pointsAwarded: 75,
  },
];