"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Budget } from "@/lib/types";

const DURATION_OPTIONS = [
  { value: 60, label: "1 hora", desc: "Rápido y al punto" },
  { value: 120, label: "2 horas", desc: "Equilibrado y ameno" },
  { value: 180, label: "3+ horas", desc: "Experiencia completa" },
];

const INTEREST_OPTIONS = [
  { id: "historia", label: "Historia y Patrimonio", icon: "🏛️" },
  { id: "gastronomia", label: "Gastronomía Jarocha", icon: "☕" },
  { id: "cultura", label: "Cultura y Música", icon: "🪕" },
  { id: "paseo", label: "Paseo y Malecón", icon: "🌊" },
  { id: "compras", label: "Artesanías y Compras", icon: "🛍️" },
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
    <main className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-blue-200">
      <header className="bg-white px-6 py-6 shadow-sm border-b border-gray-100">
        <div className="max-w-lg mx-auto w-full">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-bold text-blue-600">
              Pulso Jarocho
            </span>
            <Link
              href="/pasaporte"
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors"
            >
              <span>📘</span> Pasaporte
            </Link>
          </div>
          <h1 className="text-2xl font-black text-gray-900 mt-2">
            Diseña tu recorrido
          </h1>
          <p className="text-gray-500 font-medium text-sm mt-1">
            Personaliza tu tiempo, gustos y presupuesto en el Centro Histórico.
          </p>
        </div>
      </header>

      <div className="flex-1 p-6 space-y-6 max-w-lg mx-auto w-full">
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <span>⏱️</span> ¿Cuánto tiempo tienes?
            </h2>
            <span className="text-xs font-semibold text-blue-600">
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
                  className={`p-3 rounded-xl border text-center transition-all ${selected
                      ? "border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    }`}
                >
                  <div className="font-bold text-sm">{opt.label}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">{opt.desc}</div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <span>🎯</span> ¿Qué te interesa descubrir?
            </h2>
            <span className="text-xs text-gray-400">
              {selectedInterests.length} seleccionados
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((interest) => {
              const selected = selectedInterests.includes(interest.id);
              return (
                <button
                  key={interest.id}
                  type="button"
                  onClick={() => toggleInterest(interest.id)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all ${selected
                      ? "border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-200"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    }`}
                >
                  <span>{interest.icon}</span>
                  <span>{interest.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-3">
          <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <span>💳</span> Presupuesto estimado
          </h2>

          <div className="grid grid-cols-3 gap-2">
            {BUDGET_OPTIONS.map((b) => {
              const selected = budget === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBudget(b.id)}
                  className={`p-3 rounded-xl border text-center transition-all ${selected
                      ? "border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    }`}
                >
                  <div className="font-extrabold text-base text-blue-600">{b.symbol}</div>
                  <div className="font-bold text-xs mt-1 text-gray-800">{b.label}</div>
                  <div className="text-[10px] text-gray-500">{b.desc}</div>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <footer className="bg-white border-t border-gray-100 p-4 pb-8 max-w-lg mx-auto w-full sticky bottom-0 z-20 shadow-lg">
        <button
          type="button"
          onClick={handleStartRoute}
          disabled={selectedInterests.length === 0 || loading}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-2xl font-bold text-base shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <span>🚀</span>
          <span>{loading ? 'Calculando...' : 'Crear Mi Ruta Inteligente'}</span>
        </button>
      </footer>
    </main>
  );
}