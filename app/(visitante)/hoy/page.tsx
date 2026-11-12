"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
// Renombramos Event a AppEvent para que no choque con el Event nativo del navegador
import { Event as AppEvent, Place } from "@/lib/types";

// Usamos el apodo AppEvent y agregamos title?: string
type EventoConLugar = AppEvent & { place?: Place; name?: string; title?: string };

export default function HoyEnElCentroPage() {
    const [eventos, setEventos] = useState<EventoConLugar[]>([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const fetchEventos = async () => {
            try {
                const res = await fetch('/api/events?when=today');
                if (res.ok) {
                    const data = await res.json();
                    setEventos(data);
                }
            } catch (error) {
                console.error("Error cargando eventos:", error);
            } finally {
                setCargando(false);
            }
        };
        fetchEventos();
    }, []);

    const formatTime = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
        } catch (e) {
            return dateString.length > 5 ? dateString.substring(0, 5) : dateString;
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-blue-200">
            <header className="bg-white px-6 py-8 shadow-sm z-10 sticky top-0 border-b border-gray-100">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs uppercase tracking-wider font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-md">
                        Agenda Viva
                    </span>
                    <Link href="/inicio" className="text-sm font-bold text-gray-400 hover:text-gray-700 transition-colors">
                        ✕ Cerrar
                    </Link>
                </div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Hoy en el centro</h1>
                <p className="text-gray-500 mt-2 font-medium">Eventos y actividades para este día.</p>
            </header>

            <div className="flex-1 p-6 max-w-lg mx-auto w-full space-y-4">
                {cargando ? (
                    <div className="text-center py-10 font-bold text-gray-400">Buscando eventos...</div>
                ) : eventos.length === 0 ? (
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 text-center shadow-sm">
                        <div className="text-4xl mb-4">📭</div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Día tranquilo</h2>
                        <p className="text-gray-500 text-sm">No hay eventos especiales registrados para hoy, pero el Centro siempre tiene lugares increíbles por descubrir.</p>
                    </div>
                ) : (
                    eventos.map((evento) => (
                        <div key={evento.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative transition-all active:scale-[0.98]">
                            {!evento.verified && (
                                <div className="absolute top-3 right-3 bg-gray-100 text-gray-500 text-[10px] font-black uppercase px-2 py-1 rounded-md tracking-wider z-10">
                                    Por confirmar
                                </div>
                            )}

                            <div className="flex items-stretch">
                                <div className="bg-gray-900 text-white w-24 flex flex-col items-center justify-center p-3 shrink-0">
                                    <span className="text-[10px] font-bold uppercase text-gray-400 mb-1">Inicia</span>
                                    <span className="text-xl font-black tracking-tight">{formatTime(evento.startsAt)}</span>
                                </div>

                                <div className="p-4 flex-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-1 block">
                                        {evento.category}
                                    </span>
                                    <h3 className="font-bold text-gray-900 leading-tight mb-2 text-lg">
                                        {evento.title || evento.name || "Evento sin nombre"}
                                    </h3>
                                    {evento.place && (
                                        <p className="text-xs text-gray-500 flex items-center gap-1 font-medium bg-gray-50 p-1.5 rounded-lg inline-flex">
                                            <span>📍</span> {evento.place.name}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </main>
    );
}