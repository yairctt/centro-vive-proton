import { es } from "@/lib/i18n/es";
import { MenuPorRol } from "@/components/auth/MenuPorRol";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-8 px-4 py-12">
      <header className="space-y-2 text-center">
        <h1 className="text-4xl font-bold tracking-tight">{es.appName}</h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">{es.tagline}</p>
      </header>
      {/* Las opciones dependen del rol: visitante, comercio o admin. */}
      <MenuPorRol />
    </main>
  );
}
