// Pruebas de los enlaces a Google Maps (Integrante 4).

import { describe, expect, it } from "vitest";

import { MAXIMO_WAYPOINTS, enlaceLugar, enlaceRutaCompleta } from "../enlaces-maps";

const punto = (lat: number, lng: number, nombre = "Lugar") => ({ lat, lng, nombre });

describe("enlace de un lugar", () => {
  it("abre la búsqueda de Google Maps con el nombre y las coordenadas", () => {
    const url = new URL(enlaceLugar(punto(19.2002, -96.1385, "Zócalo")));

    expect(url.origin + url.pathname).toBe("https://www.google.com/maps/search/");
    expect(url.searchParams.get("api")).toBe("1");
    expect(url.searchParams.get("query")).toContain("Zócalo");
    expect(url.searchParams.get("query")).toContain("19.2002,-96.1385");
  });
});

describe("enlace de la ruta completa", () => {
  it("pone la primera parada como origen y la última como destino", () => {
    const url = new URL(
      enlaceRutaCompleta([
        punto(19.2, -96.13, "A"),
        punto(19.21, -96.14, "B"),
        punto(19.22, -96.15, "C"),
      ]).url,
    );

    expect(url.pathname).toBe("/maps/dir/");
    expect(url.searchParams.get("origin")).toBe("19.2,-96.13");
    expect(url.searchParams.get("destination")).toBe("19.22,-96.15");
    expect(url.searchParams.get("travelmode")).toBe("walking");
  });

  it("pone las paradas intermedias como waypoints, en orden", () => {
    const url = new URL(
      enlaceRutaCompleta([
        punto(19.2, -96.13, "A"),
        punto(19.21, -96.14, "B"),
        punto(19.22, -96.15, "C"),
        punto(19.23, -96.16, "D"),
      ]).url,
    );

    expect(url.searchParams.get("waypoints")).toBe("19.21,-96.14|19.22,-96.15");
  });

  it("con dos paradas no hay waypoints", () => {
    const url = new URL(
      enlaceRutaCompleta([punto(19.2, -96.13), punto(19.21, -96.14)]).url,
    );

    expect(url.searchParams.get("waypoints")).toBeNull();
  });

  it("con una sola parada abre ese lugar", () => {
    const resultado = enlaceRutaCompleta([punto(19.2, -96.13, "Único")]);

    expect(resultado.url).toContain("maps/search/");
    expect(resultado.completa).toBe(true);
  });

  it("sin paradas devuelve un enlace genérico", () => {
    const resultado = enlaceRutaCompleta([]);

    expect(resultado.url).toBe("https://www.google.com/maps");
    expect(resultado.completa).toBe(true);
  });

  it("recorta las paradas que superan el límite de Google Maps y avisa", () => {
    const muchos = Array.from({ length: MAXIMO_WAYPOINTS + 3 }, (_, i) =>
      punto(19 + i / 100, -96.1),
    );

    const resultado = enlaceRutaCompleta(muchos);

    expect(resultado.completa).toBe(false);
    expect(resultado.omitidas).toBe(3);
    // El enlace no lleva más destinos de los que Google acepta.
    const url = new URL(resultado.url);
    const waypoints = url.searchParams.get("waypoints");
    const total = (waypoints ? waypoints.split("|").length : 0) + 2;
    expect(total).toBeLessThanOrEqual(MAXIMO_WAYPOINTS);
  });

  it("el enlace completo no pierde ninguna parada cuando hay pocas", () => {
    const resultado = enlaceRutaCompleta([
      punto(19.2, -96.13),
      punto(19.21, -96.14),
      punto(19.22, -96.15),
    ]);

    expect(resultado.completa).toBe(true);
    expect(resultado.omitidas).toBe(0);
  });
});
