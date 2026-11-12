// Pruebas de la capa de IA (Integrante 4).
import { describe, expect, it, vi } from "vitest";

import { fallbackMission } from "../fallback";
import { buildPrompt, generateMission, parseModelJson } from "../gemini";
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

  it("marca como «por confirmar» cuando la ficha avisa que el horario es variable", () => {
    const copy = fallbackMission(
      {
        ...zocalo,
        verified: true,
        hours: "Todos los días de 7:00 a 23:00 (se recomienda confirmar).",
        meta: { horarioVerificado: false },
      },
      [],
    );

    expect(copy.text).toContain("por confirmar");
  });

  it("afirma el horario cuando la ficha lo declara verificado", () => {
    const copy = fallbackMission(
      {
        ...zocalo,
        verified: true,
        hours: "Todos los días, 24 horas",
        meta: { horarioVerificado: true },
      },
      [],
    );

    expect(copy.text).toContain("24 horas");
    expect(copy.text).not.toContain("por confirmar");
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

describe("generateMission con DeepSeek", () => {
  it("llama a DeepSeek y devuelve source 'ia' cuando la respuesta es válida", async () => {
    const originalKey = process.env.DEEPSEEK_API_KEY;
    process.env.DEEPSEEK_API_KEY = "sk-test-key";

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                text: "Recorre los portales y admira la arquitectura.",
                why: "Es el sitio histórico central.",
              }),
            },
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    try {
      const res = await generateMission({
        place: zocalo,
        interests: ["historia"],
      });

      expect(res.source).toBe("ia");
      expect(res.text).toBe("Recorre los portales y admira la arquitectura.");
      expect(fetchMock).toHaveBeenCalled();
    } finally {
      process.env.DEEPSEEK_API_KEY = originalKey;
      vi.unstubAllGlobals();
    }
  });

  it("degrada a la plantilla de respaldo si DeepSeek falla", async () => {
    const originalKey = process.env.DEEPSEEK_API_KEY;
    process.env.DEEPSEEK_API_KEY = "sk-test-key";

    const fetchMock = vi.fn().mockRejectedValue(new Error("Network error"));
    vi.stubGlobal("fetch", fetchMock);

    try {
      const res = await generateMission({
        place: zocalo,
        interests: ["historia"],
      });

      expect(res.source).toBe("respaldo");
      expect(res.text).toContain("Zócalo");
    } finally {
      process.env.DEEPSEEK_API_KEY = originalKey;
      vi.unstubAllGlobals();
    }
  });
});
