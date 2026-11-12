import { describe, expect, it } from "vitest";
import { es } from "@/lib/i18n/es";
import { en } from "@/lib/i18n/en";
import { getDictionary, getSavedLanguage, setSavedLanguage } from "@/lib/i18n";

describe("Módulo i18n (Internacionalización Español / Inglés)", () => {
  it("es y en deben tener las mismas secciones clave de primer nivel", () => {
    const keysEs = Object.keys(es).sort();
    const keysEn = Object.keys(en).sort();
    expect(keysEs).toEqual(keysEn);
  });

  it("la sección 'inicio' debe contener todas las opciones de duración y grupos en ambos idiomas", () => {
    expect(es.inicio.duraciones.d60.label).toBe("1 hora");
    expect(en.inicio.duraciones.d60.label).toBe("1 hour");

    expect(es.inicio.duraciones.d180.label).toBe("3+ horas");
    expect(en.inicio.duraciones.d180.label).toBe("3+ hours");

    expect(es.inicio.grupoTitulo).toContain("Grupo");
    expect(en.inicio.grupoTitulo).toContain("Group");

    expect(es.inicio.tamanoPequeno).toBe("Pequeño");
    expect(en.inicio.tamanoPequeno).toBe("Small");

    expect(es.inicio.tamanoMediano).toBe("Mediano");
    expect(en.inicio.tamanoMediano).toBe("Medium");

    expect(es.inicio.tamanoContingente).toBe("Contingente");
    expect(en.inicio.tamanoContingente).toBe("Contingent");
  });

  it("la sección 'auth' debe tener soporte completo de login y accesos demo", () => {
    expect(es.auth.tituloLogin).toBe("Bienvenido de vuelta");
    expect(en.auth.tituloLogin).toBe("Welcome back");

    expect(es.auth.demoVisitante).toBe("Visitante");
    expect(en.auth.demoVisitante).toBe("Visitor");

    expect(es.auth.heroHola).toBe("¡Hola,");
    expect(en.auth.heroHola).toBe("Hello,");
  });

  it("la sección 'cruise' debe estar disponible en ambos idiomas para visitantes de crucero", () => {
    expect(es.cruise.dockName).toContain("Muelle");
    expect(en.cruise.dockName).toContain("Cruise Dock");
  });

  it("getDictionary debe devolver el diccionario correspondiente según el código de idioma", () => {
    expect(getDictionary("es")).toBe(es);
    expect(getDictionary("en")).toBe(en);
    expect(getDictionary(null)).toBe(es);
  });

  it("getSavedLanguage devuelve 'es' por defecto en entorno de servidor / node", () => {
    expect(getSavedLanguage()).toBe("es");
  });

  it("guarda y recupera idioma cuando window y storage están disponibles", () => {
    const storage: Record<string, string> = {};
    const mockStorage = {
      getItem: (k: string) => storage[k] ?? null,
      setItem: (k: string, v: string) => { storage[k] = v; },
    };
    const originalWindow = globalThis.window;
    // Simula entorno de navegador
    (globalThis as unknown as { window: unknown }).window = {
      dispatchEvent: () => true,
    };
    (globalThis as unknown as { localStorage: unknown }).localStorage = mockStorage;
    (globalThis as unknown as { sessionStorage: unknown }).sessionStorage = mockStorage;
    (globalThis as unknown as { CustomEvent: unknown }).CustomEvent = class {
      detail: unknown;
      constructor(_type: string, opts?: { detail: unknown }) {
        this.detail = opts?.detail;
      }
    };

    try {
      setSavedLanguage("en");
      expect(getSavedLanguage()).toBe("en");
      setSavedLanguage("es");
      expect(getSavedLanguage()).toBe("es");
    } finally {
      if (originalWindow === undefined) {
        // @ts-expect-error cleanup
        delete globalThis.window;
        // @ts-expect-error cleanup
        delete globalThis.localStorage;
        // @ts-expect-error cleanup
        delete globalThis.sessionStorage;
        // @ts-expect-error cleanup
        delete globalThis.CustomEvent;
      }
    }
  });
});
