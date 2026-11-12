// Configuración de la capa de IA (Integrante 4).
// La IA solo redacta textos; nunca decide la ruta ni inventa datos.

export type IdiomaIA = "es" | "en";

export const aiConfig = {
  /** Modelo de Gemini usado para redactar. */
  modelo: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
  /** Modelo de DeepSeek usado para redactar. */
  modeloDeepseek: process.env.DEEPSEEK_MODEL ?? "deepseek-chat",
  /** Endpoint de la API de DeepSeek. */
  deepseekEndpoint: process.env.DEEPSEEK_ENDPOINT ?? "https://api.deepseek.com/chat/completions",
  /** Tiempo límite de la llamada (ms). Si se excede, se usa la plantilla. */
  timeoutMs: 5000,
  /** Idioma por defecto: español. */
  idiomaPorDefecto: "es" as IdiomaIA,
  /**
   * Instrucción que se le manda al modelo en cada llamada.
   *
   * La parte del idioma se añade aparte (ver `instruccionPara`), porque el
   * requisito de los cruceristas pide que la IA redacte en el idioma que
   * eligió el visitante.
   */
  instruccion:
    "Eres un guía del Centro Histórico de Veracruz. Escribes en español claro y breve, para una persona que recorre la ciudad con el teléfono en la mano. " +
    "Redacta únicamente con los datos que se te entregan. " +
    "PROHIBIDO inventar horarios, precios, eventos, promociones, accesibilidad o cualquier dato que no esté en la ficha. " +
    "Si un dato no aparece en la ficha, no lo menciones. " +
    "Si el horario no está verificado, menciónalo como 'por confirmar'. " +
    "No prometas descuentos ni puntos que no estén indicados. " +
    "Devuelve únicamente un JSON válido con las claves 'text' (la misión, máximo 2 frases) y 'why' (por qué se recomienda, máximo 1 frase).",
} as const;

/**
 * Instrucciones de idioma para el modelo.
 * Con "en" la IA escribe para un visitante que habla inglés (cruceristas).
 */
const INSTRUCCIONES_IDIOMA: Record<IdiomaIA, string> = {
  es: "Escribe en español. Menciona 'por confirmar' si el horario no está verificado.",
  en:
    "Write in English for a cruise visitor. If the opening hours are not verified, say 'to be confirmed'. " +
    "Use the place name as it appears in the data, and keep the tone warm and brief.",
};

/**
 * Devuelve la instrucción completa para el idioma pedido.
 * Si el idioma no se reconoce, se usa el de por defecto (español).
 */
export function instruccionPara(idioma?: string): string {
  const clave = (idioma ?? aiConfig.idiomaPorDefecto).toLowerCase().startsWith("en")
    ? "en"
    : (idioma ?? aiConfig.idiomaPorDefecto).toLowerCase().startsWith("es")
      ? "es"
      : aiConfig.idiomaPorDefecto;
  return `${aiConfig.instruccion} ${INSTRUCCIONES_IDIOMA[clave]}`;
}

/** Normaliza el idioma a "es" o "en". */
export function normalizaIdioma(idioma?: string): IdiomaIA {
  const texto = (idioma ?? "").toLowerCase();
  if (texto.startsWith("en")) return "en";
  return "es";
}
