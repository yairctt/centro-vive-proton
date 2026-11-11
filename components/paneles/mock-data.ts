import type { Stats } from "@/lib/types";

export interface ExtendedStats extends Stats {
  totalInteractions: number;
  activePlaces: number;
  activeBusinesses: number;
  recentVisits: {
    id: string;
    placeId: string;
    placeName: string;
    createdAt: string;
    method: "qr" | "manual";
    pointsAwarded: number;
    missionTitle?: string;
  }[];
  activityByHourWithBusinesses: {
    hour: number;
    label: string;
    interactions: number;
    openBusinesses: number;
  }[];
}

export const MOCK_ADMIN_STATS: ExtendedStats = {
  missionsAccepted: 48,
  missionsCompleted: 31,
  redemptions: 19,
  totalInteractions: 142,
  activePlaces: 12,
  activeBusinesses: 6,
  scansByPlace: [
    { placeId: "malecon", placeName: "Malecón de Veracruz", scans: 38 },
    { placeId: "gran-cafe-de-la-parroquia", placeName: "Gran Café de la Parroquia", scans: 32 },
    { placeId: "zocalo", placeName: "Zócalo y Portales", scans: 27 },
    { placeId: "mercado-de-artesanias", placeName: "Mercado de Artesanías", scans: 19 },
    { placeId: "museo-naval-mexico", placeName: "Museo Naval México", scans: 14 },
    { placeId: "barrio-de-la-huaca", placeName: "Barrio de La Huaca", scans: 12 },
  ],
  activityByHour: [
    { hour: 8, count: 4 },
    { hour: 9, count: 9 },
    { hour: 10, count: 15 },
    { hour: 11, count: 22 },
    { hour: 12, count: 18 },
    { hour: 13, count: 14 },
    { hour: 14, count: 11 },
    { hour: 15, count: 12 },
    { hour: 16, count: 16 },
    { hour: 17, count: 24 },
    { hour: 18, count: 31 },
    { hour: 19, count: 29 },
    { hour: 20, count: 25 },
    { hour: 21, count: 18 },
    { hour: 22, count: 8 },
  ],
  activityByHourWithBusinesses: [
    { hour: 8, label: "08:00", interactions: 4, openBusinesses: 2 },
    { hour: 9, label: "09:00", interactions: 9, openBusinesses: 5 },
    { hour: 10, label: "10:00", interactions: 15, openBusinesses: 6 },
    { hour: 11, label: "11:00", interactions: 22, openBusinesses: 6 },
    { hour: 12, label: "12:00", interactions: 18, openBusinesses: 6 },
    { hour: 13, label: "13:00", interactions: 14, openBusinesses: 6 },
    { hour: 14, label: "14:00", interactions: 11, openBusinesses: 6 },
    { hour: 15, label: "15:00", interactions: 12, openBusinesses: 6 },
    { hour: 16, label: "16:00", interactions: 16, openBusinesses: 6 },
    { hour: 17, label: "17:00", interactions: 24, openBusinesses: 6 },
    { hour: 18, label: "18:00", interactions: 31, openBusinesses: 5 },
    { hour: 19, label: "19:00", interactions: 29, openBusinesses: 3 }, // Brecha: alta demanda, pocos negocios abiertos
    { hour: 20, label: "20:00", interactions: 25, openBusinesses: 2 }, // Centro de noche
    { hour: 21, label: "21:00", interactions: 18, openBusinesses: 2 },
    { hour: 22, label: "22:00", interactions: 8, openBusinesses: 1 },
  ],
  recentVisits: [
    {
      id: "v-1",
      placeId: "gran-cafe-de-la-parroquia",
      placeName: "Gran Café de la Parroquia",
      createdAt: "Hace 2 min",
      method: "qr",
      pointsAwarded: 50,
      missionTitle: "Descubre el tintineo del lechero tradicional",
    },
    {
      id: "v-2",
      placeId: "malecon",
      placeName: "Malecón de Veracruz",
      createdAt: "Hace 5 min",
      method: "qr",
      pointsAwarded: 30,
      missionTitle: "Brisa marina y vistas al puerto",
    },
    {
      id: "v-3",
      placeId: "zocalo",
      placeName: "Zócalo y Portales",
      createdAt: "Hace 8 min",
      method: "qr",
      pointsAwarded: 40,
      missionTitle: "Tradición y música en el corazón de la ciudad",
    },
    {
      id: "v-4",
      placeId: "mercado-de-artesanias",
      placeName: "Mercado de Artesanías",
      createdAt: "Hace 14 min",
      method: "qr",
      pointsAwarded: 35,
      missionTitle: "Artesanos del Golfo",
    },
    {
      id: "v-5",
      placeId: "barrio-de-la-huaca",
      placeName: "Barrio de La Huaca",
      createdAt: "Hace 21 min",
      method: "qr",
      pointsAwarded: 60,
      missionTitle: "Cuna del son y tradición jarocha",
    },
  ],
};

export interface ComercioMockData {
  id: string;
  name: string;
  category: string;
  isOpen: boolean;
  hours: string;
  address: string;
  description: string;
  verified: boolean;
  stats: {
    totalScans: number;
    activeMissions: number;
    redemptionsConfirmed: number;
    pendingRedemptions: number;
  };
  promotions: {
    id: string;
    title: string;
    description: string;
    costPoints: number;
    active: boolean;
    validUntil: string;
    totalRedeemed: number;
  }[];
  recentRedemptions: {
    id: string;
    code: string;
    visitorAlias: string;
    rewardTitle: string;
    costPoints: number;
    status: "confirmado" | "pendiente";
    timestamp: string;
  }[];
  hourlyVisits: {
    hour: string;
    visitas: number;
  }[];
  conversionData: {
    name: string;
    valor: number;
    color: string;
  }[];
}

export const MOCK_COMERCIO: ComercioMockData = {
  id: "gran-cafe-de-la-parroquia",
  name: "Gran Café de la Parroquia",
  category: "Gastronomía típica",
  isOpen: true,
  hours: "Lun–Dom 07:00–23:00",
  address: "Av. Independencia #1187, Col. Centro, Veracruz",
  description: "Una institución desde 1808. Famoso por su tradicional café lechero servido con tintineo de cuchara.",
  verified: true,
  stats: {
    totalScans: 32,
    activeMissions: 2,
    redemptionsConfirmed: 11,
    pendingRedemptions: 2,
  },
  promotions: [
    {
      id: "promo-1",
      title: "20% en Café Lechero clásico",
      description: "Válido al mostrar el cupón digital en caja tras completar la misión del Centro.",
      costPoints: 50,
      active: true,
      validUntil: "Hoy hasta las 23:00",
      totalRedeemed: 8,
    },
    {
      id: "promo-2",
      title: "Bomba con frijol y queso de cortesía",
      description: "En el consumo de dos cafés lecheros grandes.",
      costPoints: 80,
      active: true,
      validUntil: "Hasta agotar 15 porciones",
      totalRedeemed: 3,
    },
  ],
  recentRedemptions: [
    {
      id: "red-1",
      code: "PJ-PARRO-8912",
      visitorAlias: "Jarocho_Curioso",
      rewardTitle: "20% en Café Lechero",
      costPoints: 50,
      status: "pendiente",
      timestamp: "Hace 4 min",
    },
    {
      id: "red-2",
      code: "PJ-PARRO-8909",
      visitorAlias: "Marina_Ver",
      rewardTitle: "Bomba con frijol de cortesía",
      costPoints: 80,
      status: "pendiente",
      timestamp: "Hace 18 min",
    },
    {
      id: "red-3",
      code: "PJ-PARRO-8874",
      visitorAlias: "TuristaCDMX",
      rewardTitle: "20% en Café Lechero",
      costPoints: 50,
      status: "confirmado",
      timestamp: "Hace 45 min",
    },
    {
      id: "red-4",
      code: "PJ-PARRO-8841",
      visitorAlias: "SolDelGolfo",
      rewardTitle: "20% en Café Lechero",
      costPoints: 50,
      status: "confirmado",
      timestamp: "Hace 1 h 20 min",
    },
  ],
  hourlyVisits: [
    { hour: "08:00", visitas: 2 },
    { hour: "09:00", visitas: 5 },
    { hour: "10:00", visitas: 7 },
    { hour: "11:00", visitas: 4 },
    { hour: "12:00", visitas: 2 },
    { hour: "13:00", visitas: 1 },
    { hour: "17:00", visitas: 3 },
    { hour: "18:00", visitas: 6 },
    { hour: "19:00", visitas: 8 },
    { hour: "20:00", visitas: 7 },
    { hour: "21:00", visitas: 4 },
  ],
  conversionData: [
    { name: "Misiones Aceptadas", valor: 42, color: "#0f766e" },
    { name: "Visitas QR en Local", valor: 32, color: "#2563eb" },
    { name: "Canjes de Beneficio", valor: 11, color: "#d97706" },
  ],
};

