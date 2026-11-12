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

export type CategoriaGrupo = "pequeno" | "mediano" | "grande";

export interface GrupoViaje {
  id: string;
  codigo: string;
  nombre: string;
  tamano: number;
  categoria: CategoriaGrupo;
  lider: string;
  miembros: MiembroGrupo[];
  puntosBoteGrupal: number;
  paradasGrupalesCompletadas: string[];
  recompensas: RecompensaGrupal[];
  creadoEn: string;
}

export function determinarCategoriaGrupo(tamano: number): CategoriaGrupo {
  if (tamano <= 4) return "pequeno";
  if (tamano <= 10) return "mediano";
  return "grande";
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
  "bg-purple-600 text-white",
  "bg-orange-600 text-white",
];

const NOMBRES_MOCK_MIEMBROS = [
  "María", "Carlos", "Sofía", "Diego", "Ana", "Luis",
  "Valeria", "Mateo", "Camila", "Jorge", "Lucía", "Fernando",
];

export function crearNuevoGrupo(nombre: string, tamano: number = 4, aliasLider: string = "Tú"): GrupoViaje {
  const codigo = `JAROCHO-${Math.floor(100 + Math.random() * 900)}`;
  const categoria = determinarCategoriaGrupo(tamano);
  const totalSlots = Math.min(tamano, 8); // Renderizamos hasta 8 avatares interactivos

  const miembros: MiembroGrupo[] = [
    {
      id: "m-1",
      alias: aliasLider,
      color: COLORES_AVATAR[0],
      checkins: [],
      esLider: true,
    },
  ];

  for (let i = 1; i < totalSlots; i++) {
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
    categoria,
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

function getSessionStorage(): Storage | null {
  if (typeof window !== "undefined" && window.sessionStorage) return window.sessionStorage;
  if (typeof globalThis !== "undefined" && (globalThis as unknown as { sessionStorage?: Storage }).sessionStorage) {
    return (globalThis as unknown as { sessionStorage: Storage }).sessionStorage;
  }
  return null;
}

function getLocalStorage(): Storage | null {
  if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
  if (typeof globalThis !== "undefined" && (globalThis as unknown as { localStorage?: Storage }).localStorage) {
    return (globalThis as unknown as { localStorage: Storage }).localStorage;
  }
  return null;
}

export function obtenerGrupo(): GrupoViaje | null {
  const storage = getSessionStorage();
  if (!storage) return null;
  const data = storage.getItem("pulso_grupo_activo");
  if (!data) return null;
  try {
    return JSON.parse(data) as GrupoViaje;
  } catch {
    return null;
  }
}

export function guardarGrupo(grupo: GrupoViaje): void {
  const session = getSessionStorage();
  if (session) {
    session.setItem("pulso_grupo_activo", JSON.stringify(grupo));
  }
  const local = getLocalStorage();
  if (local) {
    local.setItem("pulso_grupo_reciente", JSON.stringify(grupo));
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("pulso_grupo_changed", { detail: grupo }));
  }
}

export function salirDeGrupo(): void {
  const session = getSessionStorage();
  if (session) {
    session.removeItem("pulso_grupo_activo");
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("pulso_grupo_changed", { detail: null }));
  }
}

/**
 * Permite a un visitante unirse a un grupo grande o pequeño existente
 * ingresando o pegando el código de grupo (ej: JAROCHO-482, CONTINGENTE-24).
 */
export function unirseAGrupoPorCodigo(codigoInput: string, aliasMiembro: string = "Tú"): GrupoViaje {
  const codigoLimpio = codigoInput.trim().toUpperCase();
  const grupoActual = obtenerGrupo();

  if (grupoActual && grupoActual.codigo.toUpperCase() === codigoLimpio) {
    if (!grupoActual.miembros.some((m) => m.alias === aliasMiembro)) {
      grupoActual.miembros.push({
        id: `m-${Date.now()}`,
        alias: aliasMiembro,
        color: COLORES_AVATAR[grupoActual.miembros.length % COLORES_AVATAR.length],
        checkins: [],
        esLider: false,
      });
      guardarGrupo(grupoActual);
    }
    return grupoActual;
  }

  const local = getLocalStorage();
  if (local) {
    const data = local.getItem("pulso_grupo_reciente");
    if (data) {
      try {
        const reciente = JSON.parse(data) as GrupoViaje;
        if (reciente && reciente.codigo.toUpperCase() === codigoLimpio) {
          if (!reciente.miembros.some((m) => m.alias === aliasMiembro)) {
            reciente.miembros.push({
              id: `m-${Date.now()}`,
              alias: aliasMiembro,
              color: COLORES_AVATAR[reciente.miembros.length % COLORES_AVATAR.length],
              checkins: [],
              esLider: false,
            });
          }
          guardarGrupo(reciente);
          return reciente;
        }
      } catch {}
    }
  }

  // Detectar si el código indica un contingente masivo o grupo
  const esContingenteGrande =
    codigoLimpio.includes("CONTINGENTE") ||
    codigoLimpio.includes("TOUR") ||
    codigoLimpio.includes("CRUCERO") ||
    codigoLimpio.includes("BUS") ||
    codigoLimpio.includes("MASIVO") ||
    codigoLimpio.includes("24") ||
    codigoLimpio.includes("50");

  const tamano = esContingenteGrande ? 24 : 6;
  const categoria = determinarCategoriaGrupo(tamano);

  const nuevoGrupo: GrupoViaje = {
    id: `g-${Date.now()}`,
    codigo: codigoLimpio,
    nombre: esContingenteGrande ? `Gran Contingente ${codigoLimpio}` : `Grupo ${codigoLimpio}`,
    tamano,
    categoria,
    lider: "Coordinador de Grupo",
    miembros: [
      {
        id: "m-guia",
        alias: "Coordinador",
        color: COLORES_AVATAR[1],
        checkins: ["malecon", "zocalo"],
        esLider: true,
      },
      {
        id: `m-${Date.now()}`,
        alias: aliasMiembro,
        color: COLORES_AVATAR[0],
        checkins: [],
        esLider: false,
      },
      {
        id: "m-3",
        alias: "Carlos M.",
        color: COLORES_AVATAR[2],
        checkins: ["malecon"],
        esLider: false,
      },
      {
        id: "m-4",
        alias: "Valeria R.",
        color: COLORES_AVATAR[3],
        checkins: ["malecon"],
        esLider: false,
      },
      {
        id: "m-5",
        alias: "Mateo S.",
        color: COLORES_AVATAR[4],
        checkins: [],
        esLider: false,
      },
    ],
    puntosBoteGrupal: 150 * tamano,
    paradasGrupalesCompletadas: ["malecon"],
    recompensas: RECOMPENSAS_DEFAULT.map((r, idx) => ({
      ...r,
      desbloqueada: idx === 0,
    })),
    creadoEn: new Date().toISOString(),
  };

  guardarGrupo(nuevoGrupo);
  return nuevoGrupo;
}

export function registrarCheckinGrupo(placeId: string, miembroId: string): GrupoViaje | null {
  const grupo = obtenerGrupo();
  if (!grupo) return null;

  const miembro = grupo.miembros.find((m) => m.id === miembroId);
  if (miembro && !miembro.checkins.includes(placeId)) {
    miembro.checkins.push(placeId);
  }

  // Verificar si todos los miembros mostrados hicieron check-in en este lugar
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
