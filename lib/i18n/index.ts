import { es } from "./es";
import { en } from "./en";

export type Idioma = "es" | "en";

export { es, en };

export function getDictionary(lang: string | null = "es") {
  return lang === "en" ? en : es;
}

/** Obtiene el idioma preferido guardado en localStorage o por defecto 'es' */
export function getSavedLanguage(): Idioma {
  if (typeof window === "undefined") return "es";
  const saved = localStorage.getItem("pulso_lang");
  return saved === "en" ? "en" : "es";
}

/** Guarda el idioma preferido y notifica a los componentes activos */
export function setSavedLanguage(lang: Idioma) {
  if (typeof window === "undefined") return;
  localStorage.setItem("pulso_lang", lang);
  sessionStorage.setItem("pulsoLang", lang);
  window.dispatchEvent(new CustomEvent("pulso_lang_changed", { detail: lang }));
}

