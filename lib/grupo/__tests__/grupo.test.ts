import { describe, it, expect, beforeEach } from "vitest";
import {
  determinarCategoriaGrupo,
  crearNuevoGrupo,
  obtenerGrupo,
  guardarGrupo,
  salirDeGrupo,
  registrarCheckinGrupo,
  unirseAGrupoPorCodigo,
} from "../index";

describe("Módulo de Rutas en Grupo (lib/grupo)", () => {
  beforeEach(() => {
    // Mock básico de sessionStorage y localStorage para el entorno de test
    const store: Record<string, string> = {};
    global.sessionStorage = {
      getItem: (k: string) => store[k] || null,
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
      removeItem: (k: string) => {
        delete store[k];
      },
      clear: () => {
        Object.keys(store).forEach((k) => delete store[k]);
      },
      key: (i: number) => Object.keys(store)[i] || null,
      length: Object.keys(store).length,
    } as Storage;

    global.localStorage = { ...global.sessionStorage };
  });

  it("determina correctamente las categorías de grupo según el tamaño", () => {
    expect(determinarCategoriaGrupo(2)).toBe("pequeno");
    expect(determinarCategoriaGrupo(4)).toBe("pequeno");
    expect(determinarCategoriaGrupo(5)).toBe("mediano");
    expect(determinarCategoriaGrupo(10)).toBe("mediano");
    expect(determinarCategoriaGrupo(11)).toBe("grande");
    expect(determinarCategoriaGrupo(50)).toBe("grande");
    expect(determinarCategoriaGrupo(100)).toBe("grande");
  });

  it("crea un nuevo grupo con código, tamaño, bote grupal y recompensas", () => {
    const grupo = crearNuevoGrupo("Familia Flores", 6, "Papá");

    expect(grupo.nombre).toBe("Familia Flores");
    expect(grupo.tamano).toBe(6);
    expect(grupo.categoria).toBe("mediano");
    expect(grupo.lider).toBe("Papá");
    expect(grupo.codigo).toMatch(/^JAROCHO-\d{3}$/);
    expect(grupo.puntosBoteGrupal).toBe(600); // 100 * 6
    expect(grupo.recompensas.length).toBeGreaterThan(0);
    expect(grupo.miembros.length).toBe(6);
    expect(grupo.miembros[0].esLider).toBe(true);
    expect(grupo.miembros[0].alias).toBe("Papá");
  });

  it("permite a un visitante unirse a un grupo mediante su código copiado", () => {
    // 1. Unirse a un contingente nuevo por código
    const grupoUnido = unirseAGrupoPorCodigo("CONTINGENTE-MASIVO", "Turista Nuevo");
    expect(grupoUnido.codigo).toBe("CONTINGENTE-MASIVO");
    expect(grupoUnido.categoria).toBe("grande");
    expect(grupoUnido.tamano).toBe(24);
    expect(grupoUnido.miembros.some((m) => m.alias === "Turista Nuevo")).toBe(true);

    // 2. Verificar que quedó guardado como grupo activo
    const activo = obtenerGrupo();
    expect(activo?.codigo).toBe("CONTINGENTE-MASIVO");
    expect(activo?.puntosBoteGrupal).toBeGreaterThan(0);

    // 3. Unirse a un grupo existente por código
    const gExistente = crearNuevoGrupo("Amigos de Tour", 4, "Líder");
    const cod = gExistente.codigo;

    const gActualizado = unirseAGrupoPorCodigo(cod, "Compañero 2");
    expect(gActualizado.codigo).toBe(cod);
    expect(gActualizado.miembros.some((m) => m.alias === "Compañero 2")).toBe(true);
  });

  it("persiste y recupera el grupo en storage", () => {
    const grupo = crearNuevoGrupo("Amigos de Fiesta", 3, "Carlos");
    const guardado = obtenerGrupo();

    expect(guardado).not.toBeNull();
    expect(guardado?.codigo).toBe(grupo.codigo);
    expect(guardado?.nombre).toBe("Amigos de Fiesta");

    salirDeGrupo();
    expect(obtenerGrupo()).toBeNull();
  });

  it("registra check-ins individuales y completa parada colectiva al sellar todos", () => {
    const grupo = crearNuevoGrupo("Dúo Dinámico", 2, "Ana");
    const idLugar = "gran-cafe-parroquia";

    // Ana hace checkin
    const g1 = registrarCheckinGrupo(idLugar, grupo.miembros[0].id);
    expect(g1?.miembros[0].checkins).toContain(idLugar);
    expect(g1?.paradasGrupalesCompletadas).not.toContain(idLugar);

    // Segundo integrante hace checkin -> Parada grupal completa
    const g2 = registrarCheckinGrupo(idLugar, grupo.miembros[1].id);
    expect(g2?.miembros[1].checkins).toContain(idLugar);
    expect(g2?.paradasGrupalesCompletadas).toContain(idLugar);
    expect(g2?.puntosBoteGrupal).toBe(grupo.puntosBoteGrupal + 150 * 2);
  });
});


