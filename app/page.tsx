import { es } from "@/lib/i18n/es";
import { MenuPorRol } from "@/components/auth/MenuPorRol";
import { PulsoLogo } from "@/components/ui/PulsoLogo";
import { MapPinIcon } from "@/components/paneles/icons";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-8 relative">
      <header className="flex flex-col items-center text-center space-y-3 mb-6">
        <div className="relative">
          <PulsoLogo size="2xl" resaltado={true} className="transition-transform duration-300 hover:scale-105" />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-teal-800 text-white text-[10px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full shadow-xs border border-teal-600">
            Reto 6 · Centro Vivo
          </div>
        </div>

        <div className="pt-2">
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 dark:text-neutral-100">
            {es.appName}
          </h1>
          <p className="mt-1 text-sm font-semibold text-teal-700 dark:text-teal-400">
            {es.tagline}
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800/80 px-3 py-1 text-xs font-semibold text-neutral-600 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-700/80">
            <MapPinIcon className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
            <span>Centro Histórico de Veracruz</span>
          </div>
        </div>
      </header>

      {/* Las opciones dependen del rol: visitante, comercio o admin. */}
      <div className="rounded-3xl border border-neutral-200/90 bg-white/95 p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/90 backdrop-blur-xs">
        <MenuPorRol />
      </div>

      <footer className="mt-6 text-center text-xs text-neutral-400 dark:text-neutral-500 space-y-1">
        <p>Turismo, reactivación comercial y afluencia viva</p>
        <p className="text-[11px] font-medium text-neutral-400/90 dark:text-neutral-500/90">
          Powered by <span className="font-semibold text-teal-700 dark:text-teal-400">Protón</span>
        </p>
      </footer>
    </main>
  );
}
