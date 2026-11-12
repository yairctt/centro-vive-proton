// Pruebas del endpoint POST /api/ai/mission (Integrante 4).
// Se invoca el handler directamente, sin levantar el servidor.

import { describe, expect, it } from "vitest";

import { POST } from "../route";

function peticion(cuerpo: unknown): Request {
  return new Request("http://localhost:3000/api/ai/mission", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo),
  });
}

describe("POST /api/ai/mission", () => {
  it("redacta la misión de un lugar con su ficha", async () => {
    const respuesta = await POST(
      peticion({
        placeId: "zocalo",
        interests: ["paseo", "historia"],
        place: {
          id: "zocalo",
          name: "Zócalo y Centro Histórico",
          category: "paseo",
          lat: 19.2002,
          lng: -96.1385,
          description: "El corazón social de la ciudad",
          hours: "Todos los días, 24 horas",
          verified: true,
          meta: {},
        },
      }),
    );

    expect(respuesta.status).toBe(200);
    const cuerpo = await respuesta.json();

    expect(typeof cuerpo.text).toBe("string");
    expect(cuerpo.text.length).toBeGreaterThan(10);
    expect(typeof cuerpo.why).toBe("string");
    expect(cuerpo.why.length).toBeGreaterThan(10);
    // Sin GEMINI_API_KEY la respuesta viene de la plantilla.
    expect(["ia", "respaldo"]).toContain(cuerpo.source);
  });

  it("devuelve el mismo contrato aunque la IA falle", async () => {
    const respuesta = await POST(
      peticion({
        placeId: "zocalo",
        interests: ["paseo"],
        place: {
          id: "zocalo",
          name: "Zócalo",
          category: "paseo",
          lat: 19.2,
          lng: -96.13,
          description: "d",
          hours: null,
          verified: false,
          meta: {},
        },
      }),
    );

    const cuerpo = await respuesta.json();
    expect(cuerpo.source).toBe("respaldo");
    expect(cuerpo.text).toContain("Zócalo");
  });

  it("encuentra también los lugares de lib/mock (ids cortos)", async () => {
    // `lib/mock` del Integrante 1 usa ids "p1", "p2"… y las pantallas que
    // todavía no están conectadas a la base los usan.
    const respuesta = await POST(peticion({ placeId: "p1", interests: ["gastronomia"] }));

    expect(respuesta.status).toBe(200);
    const cuerpo = await respuesta.json();
    expect(cuerpo.text).toContain("Gran Café");
  });

  it("rechaza datos inválidos con 400", async () => {
    const respuesta = await POST(peticion({}));

    expect(respuesta.status).toBe(400);
    const cuerpo = await respuesta.json();
    expect(cuerpo.error).toBeTruthy();
  });

  it("devuelve 404 si el lugar no existe en ninguna fuente", async () => {
    const respuesta = await POST(peticion({ placeId: "no-existe-xyz", interests: [] }));

    expect(respuesta.status).toBe(404);
  });
});
