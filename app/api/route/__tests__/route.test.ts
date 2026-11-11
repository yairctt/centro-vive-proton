// Pruebas del endpoint POST /api/route (Integrante 4).
// Se invoca el handler directamente, sin levantar el servidor.

import { describe, expect, it } from "vitest";

import { POST } from "../route";

function peticion(cuerpo: unknown): Request {
  return new Request("http://localhost:3000/api/route", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo),
  });
}

describe("POST /api/route", () => {
  it("devuelve las paradas ordenadas con su motivo", async () => {
    const respuesta = await POST(
      peticion({ minutes: 90, interests: ["gastronomia", "historia"], budget: "bajo" }),
    );

    expect(respuesta.status).toBe(200);
    const cuerpo = await respuesta.json();

    expect(Array.isArray(cuerpo.stops)).toBe(true);
    expect(cuerpo.stops.length).toBeGreaterThan(0);
    for (const parada of cuerpo.stops) {
      expect(parada.place.id).toBeTruthy();
      expect(parada.place.name).toBeTruthy();
      expect(parada.reason.length).toBeGreaterThan(10);
      expect(typeof parada.distanceM).toBe("number");
      expect(typeof parada.etaMin).toBe("number");
    }
  });

  it("numera las paradas desde 1 y en orden", async () => {
    const respuesta = await POST(
      peticion({ minutes: 180, interests: ["cultura", "paseo"], budget: "alto" }),
    );
    const cuerpo = await respuesta.json();

    cuerpo.stops.forEach((parada: { order: number }, i: number) => {
      expect(parada.order).toBe(i + 1);
    });
  });

  it("respeta el presupuesto: no incluye los comercios caros", async () => {
    const respuesta = await POST(
      peticion({ minutes: 180, interests: ["gastronomia"], budget: "bajo" }),
    );
    const cuerpo = await respuesta.json();

    const ids = cuerpo.stops.map((s: { place: { id: string } }) => s.place.id);
    expect(ids).not.toContain("mariscos-villa-rica-mocambo");
    expect(ids).not.toContain("plaza-andamar");
  });

  it("acepta ubicación opcional", async () => {
    const respuesta = await POST(
      peticion({
        minutes: 90,
        interests: ["paseo"],
        budget: "medio",
        // Coordenadas reales del Zócalo de Veracruz (OpenStreetMap).
        lat: 19.2002,
        lng: -96.1385,
      }),
    );

    expect(respuesta.status).toBe(200);
    const cuerpo = await respuesta.json();
    expect(cuerpo.stops.length).toBeGreaterThan(0);
  });

  it("rechaza datos inválidos con 400", async () => {
    const respuestas = await Promise.all([
      POST(peticion({ minutes: 5, interests: ["paseo"], budget: "bajo" })),
      POST(peticion({ minutes: 90, interests: [], budget: "bajo" })),
      POST(peticion({ minutes: 90, interests: ["paseo"], budget: "gratis" })),
      POST(peticion({})),
    ]);

    for (const respuesta of respuestas) {
      expect(respuesta.status).toBe(400);
      const cuerpo = await respuesta.json();
      expect(cuerpo.error).toBeTruthy();
    }
  });

  it("rechaza un cuerpo que no es JSON", async () => {
    const respuesta = await POST(
      new Request("http://localhost:3000/api/route", { method: "POST", body: "no soy json" }),
    );

    expect(respuesta.status).toBe(400);
  });
});
