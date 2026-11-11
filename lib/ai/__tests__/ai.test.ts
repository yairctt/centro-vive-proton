// Pruebas de la capa de IA (Integrante 4).
import { describe, expect, it } from "vitest";

import { fallbackMission } from "../fallback";
import { buildPrompt, parseModelJson } from "../gemini";
import { zocalo } from "../../engine/__tests__/fixtures";

describe("plantilla de respaldo", () => {
  it("devuelve el contrato text/why sin llamar a la red", () => {
    const copy = fallbackMission(zocalo, ["paseo"]);

    expect(copy.source).toBe("respaldo");
    expect(copy.text).toContain("Zócalo");
    expect(copy.why.length).toBeGreaterThan(10);
  });

  it("marca como «por confirmar» los horarios no verificados", () => {
    const copy = fallbackMission(
      { ...zocalo, verified: false, hours: "Lun-Dom 09:00-21:00" },
      [],
    );

    expect(copy.text).toContain("por confirmar");
  });

  it("no menciona horarios si la ficha no los tiene", () => {
    const copy = fallbackMission({ ...zocalo, hours: null }, []);

    expect(copy.text).not.toMatch(/horario/i);
  });
});

describe("prompt", () => {
  it("incluye los datos de la ficha y prohíbe inventar", () => {
    const prompt = buildPrompt({
      place: zocalo,
      interests: ["paseo"],
      reason: "Está a 4 min a pie",
    });

    expect(prompt).toContain("Zócalo");
    expect(prompt).toContain("paseo");
    expect(prompt).toContain("Motivo calculado por el motor");
  });
});

describe("parseo de la respuesta del modelo", () => {
  it("acepta JSON limpio", () => {
    const r = parseModelJson('{"text":"Visita el Zócalo","why":"Te gusta el paseo"}');
    expect(r?.text).toBe("Visita el Zócalo");
    expect(r?.why).toBe("Te gusta el paseo");
  });

  it("acepta JSON envuelto en bloque de código", () => {
    const r = parseModelJson('```json\n{"text":"Visita","why":"Porque sí"}\n```');
    expect(r?.text).toBe("Visita");
  });

  it("devuelve null si la respuesta no es interpretable", () => {
    expect(parseModelJson("no soy json")).toBeNull();
    expect(parseModelJson("")).toBeNull();
  });

  it("completa el motivo si el modelo lo omite", () => {
    const r = parseModelJson('{"text":"Visita el Zócalo"}');
    expect(r?.text).toBe("Visita el Zócalo");
    expect(r?.why.length).toBeGreaterThan(0);
  });
});
