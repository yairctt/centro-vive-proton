"use client";

import React, { useState, useEffect } from "react";
import { getDictionary, getSavedLanguage, setSavedLanguage, type Idioma } from "@/lib/i18n";

export function useIdioma(): {
  lang: Idioma;
  setLang: (lang: Idioma) => void;
  t: ReturnType<typeof getDictionary>;
} {
  const [lang, setLangState] = useState<Idioma>("es");

  useEffect(() => {
    // Sincronizar con el valor guardado
    setLangState(getSavedLanguage());

    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent<Idioma>;
      if (customEvent.detail === "es" || customEvent.detail === "en") {
        setLangState(customEvent.detail);
      } else {
        setLangState(getSavedLanguage());
      }
    };

    window.addEventListener("pulso_lang_changed", handleLangChange);
    window.addEventListener("storage", handleLangChange);
    return () => {
      window.removeEventListener("pulso_lang_changed", handleLangChange);
      window.removeEventListener("storage", handleLangChange);
    };
  }, []);

  const setLang = (newLang: Idioma) => {
    setLangState(newLang);
    setSavedLanguage(newLang);
  };

  const t = getDictionary(lang);

  return { lang, setLang, t };
}

interface LanguageSelectorProps {
  className?: string;
  size?: "sm" | "md";
}

export function LanguageSelector({
  className = "",
  size = "md",
}: LanguageSelectorProps) {
  const { lang, setLang } = useIdioma();

  const isSmall = size === "sm";

  return (
    <div
      role="group"
      aria-label="Selector de idioma / Language selector"
      className={`inline-flex items-center rounded-xl bg-neutral-100/90 dark:bg-neutral-800/90 p-0.5 border border-neutral-200/90 dark:border-neutral-700/80 shadow-2xs backdrop-blur-xs ${className}`}
    >
      <button
        type="button"
        onClick={() => setLang("es")}
        aria-pressed={lang === "es"}
        className={`flex items-center gap-1 rounded-lg font-bold transition-all cursor-pointer ${
          isSmall ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
        } ${
          lang === "es"
            ? "bg-teal-700 text-white shadow-2xs dark:bg-teal-600"
            : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        }`}
        title="Cambiar a Español"
      >
        <span aria-hidden="true">🇲🇽</span>
        <span>ES</span>
      </button>
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        className={`flex items-center gap-1 rounded-lg font-bold transition-all cursor-pointer ${
          isSmall ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
        } ${
          lang === "en"
            ? "bg-teal-700 text-white shadow-2xs dark:bg-teal-600"
            : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        }`}
        title="Switch to English"
      >
        <span aria-hidden="true">🇺🇸</span>
        <span>EN</span>
      </button>
    </div>
  );
}
