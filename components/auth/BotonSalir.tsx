import { es } from "@/lib/i18n/es";

/** Cierra la sesión (POST /auth/salir). Funciona sin JavaScript. */
export function BotonSalir({ className = "" }: { className?: string }) {
  return (
    <form method="post" action="/auth/salir">
      <button
        type="submit"
        className={
          className ||
          "rounded-xl px-3 py-1.5 text-xs font-semibold text-neutral-600 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
        }
      >
        {es.auth.salir}
      </button>
    </form>
  );
}
