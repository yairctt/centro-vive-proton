export interface MiembroGrupo {
  id: string;
  alias: string;
  color: string;
  checkins: string[];
  esLider: boolean;
}

export interface RecompensaGrupal {
  id: string;
  titulo: string;
  comercio: string;
  descripcion: string;
  requisitoParadas: number;
  codigoCanje: string;
  desbloqueada: boolean;
  canjeada: boolean;
  icono: string;
}

export interface GrupoViaje {
  id: string;
  codigo: string;
  nombre: string;
  tamano: number;
  lider: string;
  miembros: MiembroGrupo[];
  puntosBoteGrupal: number;
  paradasGrupalesCompletadas: string[];
  recompensas: RecompensaGrupal[];
  creadoEn: string;
}

const RECOMPENSAS_DEFAULT: RecompensaGrupal[] = [
  {
    id: "rec-parroquia-grupo",
    titulo: "Ronda de Café Lechero y Bombas",
    comercio: "Gran Café de la Parroquia",
    descripcion: "Cortesía para todos los miembros de la mesa al completar 2 paradas juntos.",
    requisitoParadas: 2,
    codigoCanje: "PARROQUIA-GRUPO-4X",
    desbloqueada: true,
    canjeada: false,
    icono: "coffee",
  },
  {
    id: "rec-artesanias-grupo",
    titulo: "20% Descuento Grupal + Obsequio Jarocho",
    comercio: "Mercado de Artesanías del Malecón",
    descripcion: "Descuento en compras colectivas de guayaberas y recuerdos de Veracruz.",
    requisitoParadas: 3,
    codigoCanje: "ARTESANIAS-CREW-20",
    desbloqueada: false,
    canjeada: false,
    icono: "shopping",
  },
  {
    id: "rec-portales-grupo",
    titulo: "Jarra de Torito Tradicional o Frutas",
    comercio: "Los Portales de Lerdo",
    descripcion: "Bebida de cortesía para la mesa con música de marimba en vivo.",
    requisitoParadas: 4,
    codigoCanje: "PORTALES-FIESTA-77",
    desbloqueada: false,
    canjeada: false,
    icono: "music",
  },
];

const COLORES_AVATAR = [
  "bg-teal-700 text-white",
  "bg-amber-600 text-white",
  "bg-sky-600 text-white",
  "bg-emerald-600 text-white",
  "bg-indigo-600 text-white",
  "bg-rose-600 text-white",
];

const NOMBRES_MOCK_MIEMBROS = ["María", "Carlos", "Sofía", "Diego", "Ana", "Luis"];

export function crearNuevoGrupo(nombre: string, tamano: number = 4, aliasLider: string = "Tú"): GrupoViaje {
  const codigo = `JAROCHO-${Math.floor(100 + Math.random() * 900)}`;
  const miembros: MiembroGrupo[] = [
    {
      id: "m-1",
      alias: aliasLider,
      color: COLORES_AVATAR[0],
      checkins: [],
      esLider: true,
    },
  ];

  for (let i = 1; i < tamano; i++) {
    miembros.push({
      id: `m-${i + 1}`,
      alias: NOMBRES_MOCK_MIEMBROS[i - 1] || `Acompañante ${i}`,
      color: COLORES_AVATAR[i % COLORES_AVATAR.length],
      checkins: [],
      esLider: false,
    });
  }

  const nuevoGrupo: GrupoViaje = {
    id: `g-${Date.now()}`,
    codigo,
    nombre: nombre.trim() || `Grupo ${codigo}`,
    tamano,
    lider: aliasLider,
    miembros,
    puntosBoteGrupal: 100 * tamano,
    paradasGrupalesCompletadas: [],
    recompensas: RECOMPENSAS_DEFAULT,
    creadoEn: new Date().toISOString(),
  };

  guardarGrupo(nuevoGrupo);
  return nuevoGrupo;
}

export function obtenerGrupo(): GrupoViaje | null {
  if (typeof window === "undefined") return null;
  const data = sessionStorage.getItem("pulso_grupo_activo");
  if (!data) return null;
  try {
    return JSON.parse(data) as GrupoViaje;
  } catch {
    return null;
  }
}

export function guardarGrupo(grupo: GrupoViaje): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem("pulso_grupo_activo", JSON.stringify(grupo));
  localStorage.setItem("pulso_grupo_reciente", JSON.stringify(grupo));
}

export function salirDeGrupo(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("pulso_grupo_activo");
}

export function registrarCheckinGrupo(placeId: string, miembroId: string): GrupoViaje | null {
  const grupo = obtenerGrupo();
  if (!grupo) return null;

  const miembro = grupo.miembros.find((m) => m.id === miembroId);
  if (miembro && !miembro.checkins.includes(placeId)) {
    miembro.checkins.push(placeId);
  }

  // Verificar si todos los miembros hicieron check-in en este lugar
  const todosEscaneados = grupo.miembros.every((m) => m.checkins.includes(placeId));
  if (todosEscaneados && !grupo.paradasGrupalesCompletadas.includes(placeId)) {
    grupo.paradasGrupalesCompletadas.push(placeId);
    grupo.puntosBoteGrupal += 150 * grupo.tamano;

    // Desbloquear recompensas según cantidad de paradas
    const paradasCount = grupo.paradasGrupalesCompletadas.length;
    grupo.recompensas.forEach((r) => {
      if (paradasCount >= r.requisitoParadas) {
        r.desbloqueada = true;
      }
    });
  }

  guardarGrupo(grupo);
  return grupo;
}
