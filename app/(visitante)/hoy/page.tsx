"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
// Renombramos Event a AppEvent para que no choque con el Event nativo del navegador
import { Event as AppEvent, Place } from "@/lib/types";
import { es } from "@/lib/i18n/es";
import { CalendarIcon, MapPinIcon, XIcon } from "@/components/paneles/icons";

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
        <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col font-sans selection:bg-teal-100 dark:selection:bg-teal-900">
            <header className="bg-white dark:bg-neutral-900 px-6 py-8 border-b border-neutral-200/80 dark:border-neutral-800 z-10 sticky top-0">
                <div className="flex justify-between items-center mb-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 dark:text-amber-300 dark:bg-amber-950/40 dark:border-amber-800 px-2.5 py-1 rounded-full">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        Agenda viva
                    </span>
                    <Link
                        href="/inicio"
                        className="inline-flex items-center gap-1 text-sm font-bold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
                    >
                        <XIcon className="w-4 h-4" />
                        Cerrar
                    </Link>
                </div>
                <h1 className="text-3xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight">Hoy en el centro</h1>
                <p className="text-neutral-500 dark:text-neutral-400 mt-2 font-medium">Eventos y actividades para este día.</p>
            </header>

            <div className="flex-1 p-6 pb-16 max-w-lg mx-auto w-full space-y-4">
                {cargando ? (
                    <div className="text-center py-10 font-bold text-neutral-500 dark:text-neutral-400">Buscando eventos...</div>
                ) : eventos.length === 0 ? (
                    <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 text-center shadow-xs flex flex-col items-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400">
                            <CalendarIcon className="w-7 h-7" />
                        </div>
                        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Día tranquilo</h2>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-5">No hay eventos especiales registrados para hoy, pero el Centro siempre tiene lugares increíbles por descubrir.</p>
                        <Link
                            href="/inicio"
                            className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-sm active:scale-[0.98] transition duration-100"
                        >
                            Diseñar mi recorrido
                        </Link>
                    </div>
                ) : (
                    eventos.map((evento) => (
                        <div key={evento.id} className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xs border border-neutral-200/80 dark:border-neutral-800 overflow-hidden relative active:scale-[0.98] transition duration-100">
                            {!evento.verified && (
                                <div className="absolute top-3 right-3 bg-neutral-100 text-neutral-600 border border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700 text-[11px] font-bold px-2 py-1 rounded-md z-10">
                                    Por confirmar
                                </div>
                            )}

                            <div className="flex items-stretch">
                                <div className="bg-amber-600 text-white w-24 flex flex-col items-center justify-center p-3 shrink-0">
                                    <span className="text-[11px] font-bold text-amber-100 mb-1">Inicia</span>
                                    <span className="text-xl font-black tracking-tight">{formatTime(evento.startsAt)}</span>
                                </div>

                                <div className="p-4 flex-1">
                                    <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400 mb-1 block">
                                        {es.ruta.categoria[evento.category?.toLowerCase?.()] ?? evento.category}
                                    </span>
                                    <h3 className="font-bold text-neutral-900 dark:text-neutral-100 leading-tight mb-2 text-lg">
                                        {evento.title || evento.name || "Evento sin nombre"}
                                    </h3>
                                    {evento.place && (
                                        <p className="text-xs text-neutral-600 dark:text-neutral-400 items-center gap-1.5 font-medium bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-2 py-1.5 rounded-lg inline-flex">
                                            <MapPinIcon className="w-3.5 h-3.5 shrink-0" />
                                            {evento.place.name}
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
