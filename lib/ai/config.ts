// Configuración de la capa de IA (Integrante 4).
// La IA solo redacta textos; nunca decide la ruta ni inventa datos.

export const aiConfig = {
  /** Modelo de Gemini usado para redactar. */
  modelo: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
  /** Tiempo límite de la llamada (ms). Si se excede, se usa la plantilla. */
  timeoutMs: 5000,
  /** Instruction que se le manda al modelo en cada llamada. */
  instruccion:
    "Eres un guía del Centro Histórico de Veracruz. Escribes en español claro y breve, para una persona que recorre la ciudad con el teléfono en la mano. " +
    "Redacta únicamente con los datos que se te entregan. " +
    "PROHIBIDO inventar horarios, precios, eventos, promociones, accesibilidad o cualquier dato que no esté en la ficha. " +
    "Si un dato no aparece en la ficha, no lo menciones. " +
    "Si el horario no está verificado, menciónalo como 'por confirmar'. " +
    "No prometas descuentos ni puntos que no estén indicados. " +
    "Devuelve únicamente un JSON válido con las claves 'text' (la misión, máximo 2 frases) y 'why' (por qué se recomienda, máximo 1 frase).",
} as const;
