"use client";
import { useRouter } from "next/navigation";

export default function MisionPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  const handleAccept = () => {
    alert("¡Misión aceptada! Busca el QR al llegar al comercio.");
    router.push("/ruta");
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col justify-center p-6 font-sans">
      <div className="w-full max-w-md mx-auto bg-gray-800 p-8 rounded-[2rem] shadow-2xl border border-gray-700 text-center relative overflow-hidden">
        {/* Efecto de luz de fondo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-orange-500 rounded-full blur-[3xl] opacity-20 pointer-events-none"></div>

        <span className="inline-block bg-orange-500/20 text-orange-400 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider mb-6 border border-orange-500/30">
          Misión Especial
        </span>

        <h1 className="text-3xl font-black mb-4 leading-tight">Prueba el<br />Lechero</h1>

        <p className="text-gray-300 mb-8 text-base leading-relaxed">
          Pide el tradicional café lechero en La Parroquia y escanea el código QR en la caja al pagar.
        </p>

        <div className="bg-gray-900/50 rounded-2xl p-6 mb-8 border border-gray-700/50">
          <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Recompensa</p>
          <div className="flex items-center justify-center gap-2 text-yellow-400 font-black text-4xl">
            <span>+50</span>
            <span className="text-xl mt-2">pts</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleAccept}
            className="w-full bg-white text-gray-900 py-4 rounded-2xl font-black text-lg active:scale-95 transition-transform shadow-lg shadow-white/10"
          >
            Aceptar Misión
          </button>
          <button
            onClick={() => router.back()}
            className="w-full text-gray-400 py-4 font-bold text-sm hover:text-white transition-colors"
          >
            Quizás luego
          </button>
        </div>
      </div>
    </main>
  );
}