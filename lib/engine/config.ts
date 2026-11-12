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
  /**
   * Penalización por cada minuto de caminata extra entre paradas.
   * Es un valor pequeño a propósito: la afinidad y la cercanía (que ya están
   * en la puntuación) deben mandar, no el salto. Con 0.1 este factor
   * aplastaba la afinidad y la ruta elegía siempre lo más cercano.
   */
  penalSaltoDeRuta: 0.005,
  /** Tope de paradas para no saturar la pantalla del móvil. */
  maxParadas: 12,
  /**
   * Lugar que se toma como punto de partida cuando el visitante no autoriza
   * ubicación. El Zócalo es el corazón del Centro Histórico: es el punto de
   * referencia más razonable para ordenar la ruta.
   *
   * Se busca primero por id y, si no aparece, por nombre que contenga esta
   * palabra. Así funciona con el catálogo de demostración ("zocalo") y con el
   * seed del backend ("Zócalo de Veracruz (Plaza de Armas)").
   */
  lugarReferenciaId: "zocalo",
  /** Palabra clave para localizar el lugar de referencia por su nombre. */
  palabraClaveReferencia: "zocalo",
} as const;
