"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { RouteStop } from "@/lib/types";
import { Mapa } from "@/components/mapa";

export default function RutaPage() {
    const [stops, setStops] = useState<RouteStop[]>([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        // El setTimeout saca la actualización de estado del flujo síncrono del efecto,
        // silenciando el error del linter y evitando bloqueos de renderizado.
        const timer = setTimeout(() => {
            const saved = sessionStorage.getItem('rutaGenerada');
            if (saved) {
                setStops(JSON.parse(saved));
            }
            setCargando(false);
        }, 0);

        // Limpieza del efecto
        return () => clearTimeout(timer);
    }, []);

    if (cargando) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center font-bold text-gray-500">
                Calculando paradas...
            </div>
        );
    }

    if (stops.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
                <h2 className="text-xl font-bold text-gray-800 mb-2">No hay ruta activa</h2>
                <p className="text-gray-500 mb-6">Regresa al inicio para generar una nueva ruta a tu medida.</p>
                <Link href="/inicio" className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-md active:scale-95 transition-all">
                    Ir al Inicio
                </Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-blue-200">
            <header className="bg-white px-6 py-6 shadow-sm z-[1100] sticky top-0">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">Tu ruta sugerida</h1>
                        <p className="text-gray-500 font-medium text-sm mt-1">
                            {stops.length} paradas • Aprox. {stops.reduce((acc, stop) => acc + stop.etaMin + (Number(stop.place.avgVisitMin) || 30), 0)} min
                        </p>
                    </div>
                    <Link href="/pasaporte" className="shrink-0 rounded-full bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700">
                        🏆 Pasaporte
                    </Link>
                </div>
            </header>

            <div className="px-6 pt-6 max-w-lg mx-auto w-full">
                <Mapa stops={stops} className="h-64 w-full shadow-sm border border-gray-100" />
            </div>

            <div className="flex-1 p-6 space-y-6 relative max-w-lg mx-auto w-full">
                <div className="absolute left-10 top-10 bottom-10 w-0.5 bg-gray-200 z-0"></div>

                {stops.map((stop, index) => {
                    const avgVisitMin = Number(stop.place.avgVisitMin) || 30;

                    return (
                        <div key={stop.place.id} className="relative z-10">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shadow-md shadow-blue-200 mt-1">
                                    {index + 1}
                                </div>

                                <div className="flex-1 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-gray-900">{stop.place.name}</h3>
                                        <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-md uppercase">
                                            {stop.place.category}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                                        <span className="flex items-center gap-1">🚶 {stop.etaMin} min</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">⏱️ {avgVisitMin} min visita</span>
                                    </div>

                                    <p className="text-gray-700 text-sm mb-4 leading-relaxed bg-blue-50 p-3 rounded-xl border border-blue-100">
                                        {stop.reason}
                                    </p>

                                    {stop.missionId && (
                                        <Link
                                            href={`/mision/${stop.missionId}`}
                                            className="block text-center bg-orange-100 text-orange-700 py-3 rounded-xl font-bold text-sm hover:bg-orange-200 active:scale-95 transition-all shadow-sm"
                                        >
                                            🎯 Ver Misión Disponible
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <nav className="bg-white border-t border-gray-100 p-4 pb-8 flex gap-3 max-w-lg mx-auto w-full sticky bottom-0 z-[1100]">
                <Link href="/inicio" className="flex-1 text-center py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold active:bg-gray-200 transition-colors">
                    Modificar
                </Link>
                <Link href="/escanear" className="flex-[2] text-center py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-md shadow-blue-200 active:scale-95 transition-all">
                    📷 Escanear QR
                </Link>
            </nav>
        </main>
    );
}