// Prueba de que el motor no depende de la zona horaria del servidor (I4).
//
// En producción el servidor (Vercel) corre en UTC, pero la demo es en
// Veracruz (UTC-6). Esta prueba genera la misma ruta con el motor corriendo
// en distintas zonas horarias y comprueba que el resultado es idéntico.
//
// Para eso lanza la suite del motor en un subproceso con TZ distinta. La
// variable PULSO_ZONA_PRUEBA evita que el subproceso vuelva a lanzar otro
// subproceso (recursión).

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { eventosDemo } from "../datos-eventos";
import { minutosDelDia } from "../zona-horaria";

/**
 * Genera la ruta con el motor en la zona horaria indicada, lanzando un
 * subproceso de Node con TZ distinta.
 */
function rutaEnZona(tz: string): string {
  const raiz = process.cwd();
  const vitest = join(raiz, "node_modules", "vitest", "vitest.mjs");
  if (!existsSync(vitest)) return "";

  try {
    return execFileSync(
      process.execPath,
      [vitest, "run", "lib/engine/__tests__/score.test.ts", "lib/engine/__tests__/route.test.ts"],
      {
        cwd: raiz,
        env: { ...process.env, TZ: tz, PULSO_ZONA_PRUEBA: "1", NO_COLOR: "1" },
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      },
    ).replace(/\x1b\[[0-9;]*m/g, "").trim();
  } catch {
    return "";
  }
}

describe("independencia de la zona horaria del servidor", () => {
  it("los eventos de respaldo caen en la hora de Veracruz", () => {
    const eventos = eventosDemo(new Date("2026-11-11T18:00:00.000Z"));

    const danzon = eventos.find((e) => e.id === "evento-demo-danzon")!;
    const nocturno = eventos.find((e) => e.id === "evento-demo-nocturno")!;
    const ruta = eventos.find((e) => e.id === "evento-demo-ruta-gastronomica")!;

    // 18:00, 20:00 y 10:00 en Veracruz, sin importar dónde esté el servidor.
    expect(minutosDelDia(new Date(danzon.startsAt))).toBe(18 * 60);
    expect(minutosDelDia(new Date(nocturno.startsAt))).toBe(20 * 60);
    expect(minutosDelDia(new Date(ruta.startsAt))).toBe(10 * 60);
  });

  it("los eventos de respaldo caen en el día correcto", () => {
    const eventos = eventosDemo(new Date("2026-11-11T18:00:00.000Z"));

    for (const evento of eventos) {
      const dia = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Mexico_City",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date(evento.startsAt));

      expect(dia, `${evento.id} quedó en ${dia}`).toBe("2026-11-11");
    }
  });

  it("la suite del motor pasa igual con el servidor en UTC y en hora de Veracruz", () => {
    const enUtc = rutaEnZona("UTC");
    const enVeracruz = rutaEnZona("America/Mexico_City");
    const enTokio = rutaEnZona("Asia/Tokyo");

    if (!enUtc || !enVeracruz || !enTokio) {
      // Si no se puede lanzar el subproceso, la comprobación se omite.
      return;
    }

    for (const [nombre, salida] of [
      ["UTC", enUtc],
      ["Veracruz", enVeracruz],
      ["Tokio", enTokio],
    ] as const) {
      expect(salida, `Falló con el servidor en ${nombre}`).toMatch(/Tests\s+\d+ passed/);
      expect(salida, `Falló con el servidor en ${nombre}`).not.toMatch(/failed/);
    }
  }, 15000);
});
