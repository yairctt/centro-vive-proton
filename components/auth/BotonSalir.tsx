import { getDictionary, getSavedLanguage, type Idioma } from "@/lib/i18n";

/** Cierra la sesión (POST /auth/salir). Funciona sin JavaScript. */
export function BotonSalir({ className = "", lang }: { className?: string; lang?: Idioma }) {
  const activeLang = lang || (typeof window !== "undefined" ? getSavedLanguage() : "es");
  const t = getDictionary(activeLang);

  return (
    <form method="post" action="/auth/salir">
      <button
        type="submit"
        className={
          className ||
          "rounded-xl px-3 py-1.5 text-xs font-semibold text-neutral-600 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 cursor-pointer"
        }
      >
        {t.auth.salir}
      </button>
    </form>
  );
}
