"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Budget } from "@/lib/types";
import { CalendarIcon } from "@/components/paneles/icons";
import { PulsoLogo } from "@/components/ui/PulsoLogo";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BookOpenIcon,
  CoffeeIcon,
  LandmarkIcon,
  MusicIcon,
  ShoppingBagIcon,
  SpinnerIcon,
  TimerIcon,
  WalletIcon,
  WavesIcon,
} from "@/components/ui/icons";

const DURATION_OPTIONS = [
  { value: 60, label: "1 hora", desc: "Rápido y al punto" },
  { value: 120, label: "2 horas", desc: "Equilibrado y ameno" },
  { value: 180, label: "3+ horas", desc: "Experiencia completa" },
];

const INTEREST_OPTIONS = [
  { id: "historia", label: "Historia y Patrimonio", Icon: LandmarkIcon },
  { id: "gastronomia", label: "Gastronomía Jarocha", Icon: CoffeeIcon },
  { id: "cultura", label: "Cultura y Música", Icon: MusicIcon },
  { id: "paseo", label: "Paseo y Malecón", Icon: WavesIcon },
  { id: "compras", label: "Artesanías y Compras", Icon: ShoppingBagIcon },
];

const BUDGET_OPTIONS: { id: Budget; label: string; desc: string; symbol: string }[] = [
  { id: "bajo", label: "Económico", desc: "Poco o nulo gasto", symbol: "$" },
  { id: "medio", label: "Moderado", desc: "Consumo promedio", symbol: "$$" },
  { id: "alto", label: "Flexible", desc: "Sin restricción", symbol: "$$$" },
];

export default function InicioPage() {
  const router = useRouter();
  const [minutes, setMinutes] = useState<number>(120);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "gastronomia",
    "historia",
  ]);
  const [budget, setBudget] = useState<Budget>("medio");
  const [loading, setLoading] = useState(false);

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleStartRoute = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          minutes,
          interests: selectedInterests,
          budget
        })
      });

      if (!res.ok) throw new Error("Error al generar la ruta");

      const data = await res.json();
      sessionStorage.setItem('rutaGenerada', JSON.stringify(data.stops));
      router.push("/ruta");
    } catch (error) {
      console.error(error);
      alert("Hubo un error al conectar con el motor. Avisa al Integrante 3.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col font-sans selection:bg-teal-100 dark:selection:bg-teal-900">
      <header className="bg-white dark:bg-neutral-900 px-6 py-6 border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="max-w-lg mx-auto w-full">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white transition group py-1"
              title="Regresar a la portada"
            >
              <ArrowLeftIcon className="w-4 h-4 text-teal-700 dark:text-teal-400 group-hover:-translate-x-0.5 transition-transform" />
              <PulsoLogo size="xs" conTexto={false} />
              <span>Pulso Jarocho</span>
            </Link>
            <div className="flex gap-2">
              <Link
                href="/hoy"
                className="text-xs bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors"
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                Hoy
              </Link>
              <Link
                href="/pasaporte"
                className="text-xs bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors"
              >
                <BookOpenIcon className="w-3.5 h-3.5" />
                Pasaporte
              </Link>
            </div>
          </div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-neutral-100 mt-2">
            Diseña tu recorrido
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 font-medium text-sm mt-1">
            Personaliza tu tiempo, gustos y presupuesto en el Centro Histórico.
          </p>
        </div>
      </header>

      <div className="flex-1 p-6 pb-32 space-y-6 max-w-lg mx-auto w-full">
        <section className="bg-white dark:bg-neutral-900 p-5 rounded-2xl shadow-xs border border-neutral-200/80 dark:border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-neutral-900 dark:text-neutral-100 text-base flex items-center gap-2">
              <span className="flex w-7 h-7 items-center justify-center rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400">
                <TimerIcon className="w-4 h-4" />
              </span>
              ¿Cuánto tiempo tienes?
            </h2>
            <span className="text-xs font-semibold text-teal-700 dark:text-teal-400">
              {minutes} minutos
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {DURATION_OPTIONS.map((opt) => {
              const selected = minutes === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setMinutes(opt.value)}
                  className={`min-h-[4.5rem] px-2 py-3 rounded-xl border text-center transition duration-100 active:scale-[0.98] ${selected
                      ? "border-teal-700 bg-teal-50 text-teal-900 ring-2 ring-teal-600/20 dark:border-teal-500 dark:bg-teal-950/40 dark:text-teal-100 dark:ring-teal-400/20"
                      : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-700"
                    }`}
                >
                  <div className="font-bold text-sm">{opt.label}</div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-tight">{opt.desc}</div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="bg-white dark:bg-neutral-900 p-5 rounded-2xl shadow-xs border border-neutral-200/80 dark:border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-neutral-900 dark:text-neutral-100 text-base">
              ¿Qué te interesa descubrir?
            </h2>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {selectedInterests.length} seleccionados
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((interest) => {
              const selected = selectedInterests.includes(interest.id);
              const Icon = interest.Icon;
              return (
                <button
                  key={interest.id}
                  type="button"
                  onClick={() => toggleInterest(interest.id)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition duration-100 active:scale-[0.98] ${selected
                      ? "border-teal-700 bg-teal-700 text-white dark:border-teal-600 dark:bg-teal-600"
                      : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-700"
                    }`}
                >
                  <span
                    className={`flex w-6 h-6 items-center justify-center rounded-md ${selected
                        ? "bg-white/15 text-white"
                        : "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400"
                      }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  <span>{interest.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="bg-white dark:bg-neutral-900 p-5 rounded-2xl shadow-xs border border-neutral-200/80 dark:border-neutral-800 space-y-3">
          <h2 className="font-bold text-neutral-900 dark:text-neutral-100 text-base flex items-center gap-2">
            <span className="flex w-7 h-7 items-center justify-center rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
              <WalletIcon className="w-4 h-4" />
            </span>
            Presupuesto estimado
          </h2>

          <div className="grid grid-cols-3 gap-2">
            {BUDGET_OPTIONS.map((b) => {
              const selected = budget === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBudget(b.id)}
                  className={`min-h-[5.5rem] px-2 py-3 rounded-xl border text-center transition duration-100 active:scale-[0.98] ${selected
                      ? "border-teal-700 bg-teal-50 text-teal-900 ring-2 ring-teal-600/20 dark:border-teal-500 dark:bg-teal-950/40 dark:text-teal-100 dark:ring-teal-400/20"
                      : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-700"
                    }`}
                >
                  <div className="font-extrabold text-base text-teal-700 dark:text-teal-400">{b.symbol}</div>
                  <div className="font-bold text-xs mt-1 text-neutral-800 dark:text-neutral-200">{b.label}</div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-tight">{b.desc}</div>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <footer className="bg-white dark:bg-neutral-900 border-t border-neutral-200/80 dark:border-neutral-800 p-4 pb-8 max-w-lg mx-auto w-full sticky bottom-0 z-20">
        <button
          type="button"
          onClick={handleStartRoute}
          disabled={selectedInterests.length === 0 || loading}
          className="w-full py-4 bg-teal-700 hover:bg-teal-800 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-bold text-base shadow-sm active:scale-[0.98] transition-transform duration-100 flex items-center justify-center gap-2"
        >
          {loading ? (
            <SpinnerIcon className="w-5 h-5 animate-spin" />
          ) : (
            <ArrowRightIcon className="w-5 h-5" />
          )}
          <span>{loading ? 'Calculando...' : 'Crear Mi Ruta Inteligente'}</span>
        </button>
      </footer>
    </main>
  );
}
