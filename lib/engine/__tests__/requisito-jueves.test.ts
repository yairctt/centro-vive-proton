// Pruebas de los escenarios del requisito nuevo (Integrante 4).
//
// El CONTEXTO.md (sección 12) avisa de que el reto puede añadir un
// requisito sorpresa y de que "todo debe ser configurable". Estos tres
// escenarios son los que tocan al motor y a la IA:
//
//   1. Lluvia o calor  → meta.bajoTecho + peso del clima.
//   2. Accesibilidad   → meta.accesible + filtro en el motor.
//   3. Inglés          → la IA redacta en el idioma que eligió el visitante.
//
// Con los pesos en 0 y la accesibilidad apagada, nada cambia: el motor se
// comporta exactamente igual que antes del requisito.

import { describe, expect, it } from "vitest";

import { engineConfig, weights } from "../config";
import { detectarClima, esAccesible } from "../route";
import { scorePlace } from "../score";
import { instruccionPara, normalizaIdioma } from "../../ai/config";
import { fallbackMission } from "../../ai/fallback";
import { buildPrompt } from "../../ai/gemini";
import type { Place } from "../../types";

const lugar = (over: Partial<Place> = {}): Place => ({
  id: "x",
  name: "Lugar de prueba",
  category: "cultura",
  lat: 19.2,
  lng: -96.138,
  description: "d",
  hours: null,
  verified: false,
  meta: {},
  ...over,
});

const MEDIODIA = new Date("2026-11-11T13:00:00-06:00");

describe("escenario 1 · lluvia o calor", () => {
  it("detecta las condiciones adversas que reporta el visitante", () => {
    expect(detectarClima(["lluvia fuerte"])).toEqual(["lluvia fuerte"]);
    expect(detectarClima(["Lluvia"])).toEqual(["Lluvia"]);
    expect(detectarClima(["sol"])).toEqual([]);
    expect(detectarClima(undefined)).toEqual([]);
  });

  it("el calor extremo activa el clima por temperatura", () => {
    expect(detectarClima([], 35)).toEqual(["calor extremo"]);
    expect(detectarClima([], 25)).toEqual([]);
  });

  it("con buen clima no penaliza a nadie", () => {
    const r = scorePlace(lugar(), {
      interests: ["cultura"],
      now: MEDIODIA,
      remainingMin: 120,
    });

    expect(r.clima).toBe(1);
  });

  it("con mal clima, los lugares con techo puntúan más", () => {
    const conTecho = lugar({ meta: { bajoTecho: true } });
    const sinTecho = lugar();

    const base = { interests: ["cultura"], now: MEDIODIA, remainingMin: 120, clima: ["lluvia"] };
    const conP = scorePlace(conTecho, base);
    const sinP = scorePlace(sinTecho, base);

    // El desglose ya distingue un sitio con techo de otro sin él.
    expect(conP.clima).toBe(1);
    expect(sinP.clima).toBe(0);
    // Pero el total no cambia todavía: el peso del clima está en 0.
    expect(conP.total).toBeCloseTo(sinP.total, 10);
  });

  it("al activar el peso del clima, los lugares con techo suben de posición", () => {
    // Se simula el peso activo para comprobar que la mecánica funciona.
    const pesos = { ...weights, clima: 0.15 };
    const totalCon = (p: Place) => {
      const b = scorePlace(p, {
        interests: ["cultura"],
        now: MEDIODIA,
        remainingMin: 120,
        clima: ["lluvia"],
      });
      return (
        pesos.afinidad * b.afinidad +
        pesos.cercania * b.cercania +
        pesos.disponibilidad * b.disponibilidad +
        pesos.tiempo * b.tiempo +
        pesos.oportunidad * b.oportunidad +
        pesos.bonoNocturno * b.bonoNocturno +
        pesos.clima * b.clima +
        pesos.accesibilidad * b.accesibilidad
      );
    };

    const conTecho = lugar({ meta: { bajoTecho: true } });
    const sinTecho = lugar();

    expect(totalCon(conTecho)).toBeGreaterThan(totalCon(sinTecho));
  });

  it("el peso del clima está en cero por defecto: nada cambia", () => {
    expect(weights.clima).toBe(0);

    const conTecho = lugar({ meta: { bajoTecho: true } });
    const sinTecho = lugar();
    const base = { interests: ["cultura"], now: MEDIODIA, remainingMin: 120, clima: ["lluvia"] };

    // Con peso 0, los dosEmplaces suman lo mismo.
    expect(scorePlace(conTecho, base).total).toBeCloseTo(scorePlace(sinTecho, base).total, 10);
  });
});

describe("escenario 2 · accesibilidad", () => {
  it("lee la accesibilidad de meta.accesible", () => {
    expect(esAccesible(lugar({ meta: { accesible: true } }))).toBe(true);
    expect(esAccesible(lugar({ meta: { accesible: false } }))).toBe(false);
  });

  it("un lugar verificado sin dato se asume accesible; uno sin verificar no", () => {
    expect(esAccesible(lugar({ verified: true }))).toBe(true);
    expect(esAccesible(lugar({ verified: false }))).toBe(false);
  });

  it("el filtro está apagado por defecto: la ruta no cambia", () => {
    expect(engineConfig.accesibilidad.exigirAccesible).toBe(false);
    expect(weights.accesibilidad).toBe(0);
  });

  it("el desglose refleja la accesibilidad, aunque el peso esté en cero", () => {
    const base = {
      interests: ["cultura"],
      now: MEDIODIA,
      remainingMin: 120,
      requiereAccesible: true,
    };
    const accesible = lugar({ meta: { accesible: true } });
    const noAccesible = lugar({ meta: { accesible: false } });

    const conP = scorePlace(accesible, base);
    const sinP = scorePlace(noAccesible, base);

    expect(conP.accesibilidad).toBe(1);
    expect(sinP.accesibilidad).toBe(0);
    // Y como el peso sigue en 0, el total aún no cambia: solo queda preparado.
    expect(conP.total).toBeCloseTo(sinP.total, 10);
  });
});

describe("escenario 3 · inglés para cruceristas", () => {
  it("normaliza el idioma", () => {
    expect(normalizaIdioma("en")).toBe("en");
    expect(normalizaIdioma("EN")).toBe("en");
    expect(normalizaIdioma("es")).toBe("es");
    expect(normalizaIdioma(undefined)).toBe("es");
    expect(normalizaIdioma("fr")).toBe("es");
  });

  it("la instrucción cambia con el idioma", () => {
    const es = instruccionPara("es");
    const en = instruccionPara("en");

    expect(es).not.toBe(en);
    expect(en).toContain("English");
  });

  it("el prompt pide los datos en el idioma pedido", () => {
    const en = buildPrompt({ place: lugar(), interests: ["paseo"], idioma: "en" });
    const es = buildPrompt({ place: lugar(), interests: ["paseo"], idioma: "es" });

    expect(en).toContain("Place data");
    expect(en).toContain("Visitor interests");
    expect(es).toContain("Datos de la ficha");
    expect(es).toContain("Intereses del visitante");
  });

  it("la plantilla de respaldo también escribe en inglés", () => {
    const en = fallbackMission(lugar({ name: "Plaza de Armas" }), ["paseo"], "en");
    const es = fallbackMission(lugar({ name: "Plaza de Armas" }), ["paseo"], "es");

    expect(en.text).toContain("Visit");
    expect(en.why).toContain("fits");
    expect(es.text).toContain("Visita");
    expect(es.why).toContain("encaja");
  });

  it("la plantilla en inglés marca el horario no verificado", () => {
    const en = fallbackMission(lugar({ hours: "Todos los días, 24 horas" }), [], "en");

    expect(en.text).toContain("to be confirmed");
  });
});
