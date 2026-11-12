// Pruebas de la zona horaria del destino (Integrante 4).
// El servidor corre en UTC, pero la demo es en Veracruz (UTC-6).

import { describe, expect, it } from "vitest";

import { diaSemanaIso, minutosDelDia, partesEnZona } from "../zona-horaria";
import { dayOfWeek, minutesOfDay } from "../score";

describe("zona horaria de Veracruz", () => {
  it("calcula la hora local aunque el instante sea UTC", () => {
    // 2026-11-11T20:00:00Z son las 14:00 en Veracruz (UTC-6).
    const instante = new Date("2026-11-11T20:00:00.000Z");

    expect(minutosDelDia(instante)).toBe(14 * 60);
    expect(minutesOfDay(instante)).toBe(14 * 60);
  });

  it("la medianoche local se cuenta como 0 minutos, no como 24 horas", () => {
    // 2026-11-12T06:00:00Z son las 00:00 en Veracruz.
    const medianoche = new Date("2026-11-12T06:00:00.000Z");

    expect(minutosDelDia(medianoche)).toBe(0);
  });

  it("el bono nocturno no se dispara a las 14:00 de Veracruz", () => {
    // 14:00 en Veracruz: todavía no es Centro de noche.
    const tarde = new Date("2026-11-11T20:00:00.000Z");
    // 20:00 en Veracruz: sí es Centro de noche.
    const noche = new Date("2026-11-12T02:00:00.000Z");

    expect(minutosDelDia(tarde) < 19 * 60).toBe(true);
    expect(minutosDelDia(noche) >= 19 * 60).toBe(true);
  });

  it("calcula el día de la semana en la zona local", () => {
    // 2026-11-11T03:00:00Z es el martes 21:00 en Veracruz.
    const martes = new Date("2026-11-11T03:00:00.000Z");
    // 2026-11-11T04:00:00Z es el martes 22:00 en Veracruz.
    const martesTarde = new Date("2026-11-11T04:00:00.000Z");
    // 2026-11-11T20:00:00Z es el miércoles 14:00 en Veracruz.
    const miercoles = new Date("2026-11-11T20:00:00.000Z");

    expect(diaSemanaIso(martes)).toBe(2);
    expect(diaSemanaIso(martesTarde)).toBe(2);
    expect(diaSemanaIso(miercoles)).toBe(3);
    expect(dayOfWeek(miercoles)).toBe(3);
  });

  it("el cambio de día en UTC no cambia el día local", () => {
    // 2026-11-11T04:30:00Z: en UTC ya es miércoles, en Veracruz sigue martes.
    const instante = new Date("2026-11-11T04:30:00.000Z");

    expect(instante.getUTCDay()).toBe(3); // miércoles en UTC
    expect(diaSemanaIso(instante)).toBe(2); // martes en Veracruz
  });

  it("descompone la fecha en hora, minuto y día", () => {
    const partes = partesEnZona(new Date("2026-11-11T20:30:00.000Z"));

    expect(partes.hora).toBe(14);
    expect(partes.minuto).toBe(30);
    expect(partes.diaSemana).toBe(3);
  });
});
