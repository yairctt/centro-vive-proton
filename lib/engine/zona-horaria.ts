// Zona horaria del destino (Integrante 4).
//
// El servidor (Vercel) corre en UTC, pero la demo es en Veracruz
// (America/Mexico_City, UTC-6). El horario del día y el día de la semana
// deben calcularse en la hora local del destino: si no, el bono de "Centro
// de noche" se dispararía seis horas antes de tiempo.
//
// Se usa Intl en lugar de un offset fijo porque así funciona aunque la zona
// cambie (y porque México ya no aplica horario de verano, pero no conviene
// depender de eso).

/** Zona horaria del Centro Histórico de Veracruz. */
export const ZONA_DESTINO = "America/Mexico_City";

interface PartesFecha {
  hora: number;
  minuto: number;
  /** 0 = domingo … 6 = sábado (como `Date.getDay()`). */
  diaSemana: number;
}

/** Descompone una fecha en la zona horaria indicada. */
export function partesEnZona(fecha: Date, zona: string = ZONA_DESTINO): PartesFecha {
  const formato = new Intl.DateTimeFormat("en-US", {
    timeZone: zona,
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hour12: false,
  });

  const partes = formato.formatToParts(fecha);
  const valor = (tipo: string) =>
    partes.find((parte) => parte.type === tipo)?.value ?? "0";

  const dias: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };

  const horaCruda = Number(valor("hour"));
  return {
    // Intl puede devolver "24" en medianoche con hour12: false.
    hora: horaCruda === 24 ? 0 : horaCruda,
    minuto: Number(valor("minute")),
    diaSemana: dias[valor("weekday")] ?? fecha.getDay(),
  };
}

/** Minutos transcurridos desde medianoche, en la zona del destino. */
export function minutosDelDia(fecha: Date, zona: string = ZONA_DESTINO): number {
  const { hora, minuto } = partesEnZona(fecha, zona);
  return hora * 60 + minuto;
}

/**
 * Día de la semana en ISO 8601 (1 = lunes … 7 = domingo), en la zona del
 * destino.
 */
export function diaSemanaIso(fecha: Date, zona: string = ZONA_DESTINO): 1 | 2 | 3 | 4 | 5 | 6 | 7 {
  const { diaSemana } = partesEnZona(fecha, zona);
  return (diaSemana === 0 ? 7 : diaSemana) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
}
