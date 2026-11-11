// Configuración del motor de recomendación (Integrante 4).
// Todo es ajustable para el requisito nuevo del jueves: aquí viven los pesos
// y las constantes de negocio, sin tocar la lógica.

// Pesos de la puntuación (sección 8 de CONTEXTO.md / 4.2 de docs/propuesta.md).
export const weights = {
  afinidad: 0.35,
  cercania: 0.25,
  disponibilidad: 0.15,
  tiempo: 0.1,
  oportunidad: 0.15,
  bonoNocturno: 0.1,
} as const;

export const engineConfig = {
  /** Velocidad de caminata usada para estimar trayectos (m/min). */
  velocidadCaminataMPerMin: 80,
  /** Radio en el que la cercanía deja de penalizar (m). */
  radioCercaniaM: 1500,
  /** Un evento entra en la ruta si está a menos de este radio (m). */
  radioEventoM: 600,
  /** Afinidad de un lugar cuya categoría no está en los intereses. */
  afinidadFueraDeInteres: 0.2,
  /** Hora en la que empieza el «Centro de noche». */
  horaBonoNocturno: 19,
  /** Tiempo de visita típico cuando el lugar no lo declara (min). */
  visitaPorDefectoMin: 30,
  /** Necesidad de visibilidad cuando el lugar no la declara (0..1). */
  oportunidadPorDefecto: 0.5,
  /** Disponibilidad cuando el horario es desconocido (ni abierto ni cerrado). */
  disponibilidadDesconocida: 0.5,
  /** Cercanía cuando el visitante no autoriza ubicación. */
  cercaniaSinOrigen: 0.5,
  /** Penalización por saltar de un extremo a otro de la ciudad. */
  penalSaltoDeRuta: 0.1,
  /** Tope de paradas para no saturar la pantalla del móvil. */
  maxParadas: 12,
} as const;
