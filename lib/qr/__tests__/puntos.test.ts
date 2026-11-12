// Pruebas del flujo de puntos (Integrante 4).
// El bug original: al escanear un QR no se sumaban los puntos al pasaporte.
// La causa era doble: el mock devolvía siempre los mismos números y el
// pasaporte leía un mock fijo en vez de los puntos reales.

import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockValidate, puntosDemo, visitasDemo } from "../mock";

/** Simula el sessionStorage del navegador. */
function simularAlmacenamiento() {
  const datos = new Map<string, string>();
  const storage = {
    getItem: (k: string) => datos.get(k) ?? null,
    setItem: (k: string, v: string) => void datos.set(k, v),
    removeItem: (k: string) => void datos.delete(k),
    clear: () => datos.clear(),
    key: (i: number) => [...datos.keys()][i] ?? null,
    get length() {
      return datos.size;
    },
  };
  vi.stubGlobal("window", { sessionStorage: storage });
  return storage;
}

describe("el mock de la visita suma puntos", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    simularAlmacenamiento();
  });

  it("el primer escaneo suma puntos sobre el total inicial", () => {
    const antes = puntosDemo();
    const r = mockValidate("demo-p1-0000");

    expect(r.ok).toBe(true);
    expect(r.pointsAdded).toBe(50);
    expect(r.totalPoints).toBe(antes + 50);
    expect(puntosDemo()).toBe(antes + 50);
  });

  it("el mismo token no cuenta dos veces", () => {
    const primero = mockValidate("demo-p1-0000");
    const segundo = mockValidate("demo-p1-0000");

    expect(primero.totalPoints).toBe(200);
    expect(segundo.ok).toBe(false);
    expect(segundo.pointsAdded).toBe(0);
    expect(segundo.totalPoints).toBe(200);
    expect(puntosDemo()).toBe(200);
  });

  it("un token distinto sí suma", () => {
    mockValidate("demo-p1-0000");
    const segundo = mockValidate("demo-p2-0000");

    expect(segundo.ok).toBe(true);
    expect(segundo.totalPoints).toBe(250);
    expect(puntosDemo()).toBe(250);
  });

  it("guarda las visitas para poder mostrarlas como sellos", () => {
    mockValidate("demo-p1-0000");
    mockValidate("demo-p2-0000");

    const visitas = visitasDemo();
    expect(visitas).toHaveLength(2);
    expect(visitas[0].token).toBe("demo-p1-0000");
    expect(visitas[0].placeId).toBe("p1");
    expect(visitas[0].pointsAwarded).toBe(50);
  });

  it("sin almacenamiento (modo privado) el escaneo sigue funcionando", () => {
    vi.unstubAllGlobals();
    vi.stubGlobal("window", undefined);

    const r = mockValidate("demo-p1-0000");
    expect(r.ok).toBe(true);
    expect(r.totalPoints).toBeGreaterThan(0);
  });
});
