"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Budget } from "@/lib/types";
import { CalendarIcon, ShipIcon, GlobeIcon, SparklesIcon, UsersIcon, TrophyIcon } from "@/components/paneles/icons";
import { PulsoLogo } from "@/components/ui/PulsoLogo";
import { getDictionary, getSavedLanguage, setSavedLanguage, type Idioma } from "@/lib/i18n";
import { crearNuevoGrupo } from "@/lib/grupo";
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
  { value: 240, label: "4+ horas", desc: "Recorrido extenso" },
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
  const [lang, setLang] = useState<Idioma>("es");
  const [minutes, setMinutes] = useState<number>(120);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "gastronomia",
    "historia",
  ]);
  const [budget, setBudget] = useState<Budget>("medio");
  const [loading, setLoading] = useState(false);
  const [esGrupo, setEsGrupo] = useState(false);
  const [tamanoGrupo, setTamanoGrupo] = useState(4);
  const [esPersonalizado, setEsPersonalizado] = useState(false);
  const [nombreGrupo, setNombreGrupo] = useState("Amigos del Puerto");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const searchParams = new URLSearchParams(window.location.search);
    const queryLang = searchParams.get("lang");
    const queryMode = searchParams.get("mode");

    const activeLang: Idioma = queryLang === "en" || queryLang === "es" ? (queryLang as Idioma) : getSavedLanguage();
    setLang(activeLang);

    if (queryMode === "grupo") {
      setEsGrupo(true);
      setTamanoGrupo(5);
    }
  }, []);

  const toggleLanguage = (newLang: Idioma) => {
    setLang(newLang);
    setSavedLanguage(newLang);
  };

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
          budget,
        })
      });

      if (!res.ok) throw new Error("Error al generar la ruta");

      const data = await res.json();
      sessionStorage.setItem('rutaGenerada', JSON.stringify(data.stops));
      sessionStorage.setItem('pulsoLang', lang);

      if (esGrupo) {
        crearNuevoGrupo(nombreGrupo, tamanoGrupo, "Tú");
      } else {
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("pulso_grupo_activo");
        }
      }

      router.push(`/ruta?lang=${lang}`);
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
        <div className="max-w-lg mx-auto w-full space-y-3">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white transition group py-1"
              title={lang === "en" ? "Return to home" : "Regresar a la portada"}
            >
              <ArrowLeftIcon className="w-4 h-4 text-teal-700 dark:text-teal-400 group-hover:-translate-x-0.5 transition-transform" />
              <PulsoLogo size="xs" conTexto={false} />
              <span>Pulso Jarocho</span>
            </Link>

            {/* Selector de idioma */}
            <div className="inline-flex rounded-xl bg-neutral-100 dark:bg-neutral-800 p-0.5 border border-neutral-200 dark:border-neutral-700 text-xs">
              <button
                type="button"
                onClick={() => toggleLanguage("es")}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  lang === "es"
                    ? "bg-white dark:bg-neutral-700 text-teal-800 dark:text-teal-200 shadow-2xs"
                    : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400"
                }`}
              >
                🇲🇽 ES
              </button>
              <button
                type="button"
                onClick={() => toggleLanguage("en")}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  lang === "en"
                    ? "bg-white dark:bg-neutral-700 text-teal-800 dark:text-teal-200 shadow-2xs"
                    : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400"
                }`}
              >
                🇺🇸 EN
              </button>
            </div>
          </div>

          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black text-neutral-900 dark:text-neutral-100">
                {lang === "en" ? "Design your tour" : "Diseña tu recorrido"}
              </h1>
              <p className="text-neutral-500 dark:text-neutral-400 font-medium text-sm mt-1">
                {lang === "en"
                  ? "Tailored stops, time, and budget in Historic Downtown Veracruz."
                  : "Personaliza tu tiempo, gustos y presupuesto en el Centro Histórico."}
              </p>
            </div>

            {/* Toggle de Modo Grupo */}
            <button
              type="button"
              onClick={() => setEsGrupo((v) => !v)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-black border transition-all shadow-2xs ${
                esGrupo
                  ? "bg-amber-500 text-neutral-950 border-amber-600 ring-2 ring-amber-400/30"
                  : "bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800"
              }`}
              title="Activar o desactivar modalidad de ruta en grupo"
            >
              <UsersIcon className="w-4 h-4" />
              <span>{esGrupo ? `Grupo (${tamanoGrupo}p) ✓` : "Modo Grupo"}</span>
            </button>
          </div>
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

        {/* Modalidad de Recorrido: Individual o En Grupo */}
        <section className="bg-white dark:bg-neutral-900 p-5 rounded-2xl shadow-xs border border-neutral-200/80 dark:border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-neutral-900 dark:text-neutral-100 text-base flex items-center gap-2">
              <span className="flex w-7 h-7 items-center justify-center rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400">
                <UsersIcon className="w-4 h-4" />
              </span>
              ¿Cómo viajas hoy?
            </h2>
            <span className="text-xs font-semibold text-teal-700 dark:text-teal-400">
              {esGrupo ? `${tamanoGrupo} personas` : "Individual"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setEsGrupo(false)}
              className={`p-3 rounded-xl border text-center transition duration-100 ${
                !esGrupo
                  ? "border-teal-700 bg-teal-50 text-teal-900 ring-2 ring-teal-600/20 dark:border-teal-500 dark:bg-teal-950/40 dark:text-teal-100"
                  : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
              }`}
            >
              <div className="font-bold text-sm">Explorador Solo</div>
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">Ruta individual</div>
            </button>

            <button
              type="button"
              onClick={() => setEsGrupo(true)}
              className={`p-3 rounded-xl border text-center transition duration-100 ${
                esGrupo
                  ? "border-amber-600 bg-amber-50 text-amber-950 ring-2 ring-amber-500/20 dark:border-amber-500 dark:bg-amber-950/40 dark:text-amber-100"
                  : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
              }`}
            >
              <div className="font-bold text-sm flex items-center justify-center gap-1.5">
                <UsersIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Ruta en Grupo</span>
              </div>
              <div className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5 font-semibold">¡Bote de recompensas!</div>
            </button>
          </div>

          {esGrupo && (
            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-4">
              {/* Sugerencias de tamaño de grupo */}
              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-2">
                  Selecciona sugerencia de tamaño de grupo
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTamanoGrupo(3);
                      setEsPersonalizado(false);
                    }}
                    className={`p-2.5 rounded-xl border text-center transition ${
                      !esPersonalizado && tamanoGrupo <= 4
                        ? "bg-amber-500 border-amber-600 text-neutral-950 font-black shadow-xs"
                        : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-300"
                    }`}
                  >
                    <div className="text-xs font-bold">Pequeño</div>
                    <div className="text-[10px] mt-0.5 opacity-90">Pareja / Amigos (2-4)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTamanoGrupo(6);
                      setEsPersonalizado(false);
                    }}
                    className={`p-2.5 rounded-xl border text-center transition ${
                      !esPersonalizado && tamanoGrupo >= 5 && tamanoGrupo <= 10
                        ? "bg-amber-500 border-amber-600 text-neutral-950 font-black shadow-xs"
                        : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-300"
                    }`}
                  >
                    <div className="text-xs font-bold">Mediano</div>
                    <div className="text-[10px] mt-0.5 opacity-90">Familia / Célula (5-10)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTamanoGrupo(20);
                      setEsPersonalizado(false);
                    }}
                    className={`p-2.5 rounded-xl border text-center transition ${
                      !esPersonalizado && tamanoGrupo > 10
                        ? "bg-amber-500 border-amber-600 text-neutral-950 font-black shadow-xs"
                        : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-300"
                    }`}
                  >
                    <div className="text-xs font-bold">Contingente</div>
                    <div className="text-[10px] mt-0.5 opacity-90">Excursión / Tour (15-30+)</div>
                  </button>
                </div>
              </div>

              {/* Cantidad personalizada */}
              <div className="bg-neutral-50 dark:bg-neutral-800/60 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    O escribe tu cantidad personalizada:
                  </span>
                  <span className="font-mono text-sm font-black text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-md">
                    {tamanoGrupo} personas
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="2"
                    max="50"
                    value={tamanoGrupo}
                    onChange={(e) => {
                      setTamanoGrupo(Number(e.target.value));
                      setEsPersonalizado(true);
                    }}
                    className="flex-1 accent-amber-600 cursor-pointer h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg"
                  />
                  <input
                    type="number"
                    min="2"
                    max="300"
                    value={tamanoGrupo}
                    onChange={(e) => {
                      const val = Math.max(2, Number(e.target.value) || 2);
                      setTamanoGrupo(val);
                      setEsPersonalizado(true);
                    }}
                    className="w-16 text-center text-xs font-bold py-1 px-1.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Nombre del grupo */}
              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Nombre de tu grupo, familia o contingente
                </label>
                <input
                  type="text"
                  value={nombreGrupo}
                  onChange={(e) => setNombreGrupo(e.target.value)}
                  placeholder="Ej. Familia Martínez o Excursión de Turismo"
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                />
              </div>

              {/* Beneficio dinámico según el tamaño */}
              <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 p-3 border border-amber-200 dark:border-amber-800 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                <TrophyIcon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-[11px] leading-relaxed">
                  <p className="font-bold">
                    {tamanoGrupo <= 4
                      ? "Beneficio de Grupo Pequeño (2-4 personas):"
                      : tamanoGrupo <= 10
                      ? "Beneficio de Grupo Mediano / Familia (5-10 personas):"
                      : `Beneficio de Gran Contingente (${tamanoGrupo} personas):`}
                  </p>
                  <p>
                    {tamanoGrupo <= 4
                      ? "Ronda de café lechero en La Parroquia y puntos multiplicados al escanear juntos."
                      : tamanoGrupo <= 10
                      ? "20% de descuento en artesanías, mesa reservada en Portales y bote compartido de puntos."
                      : "Atención prioritaria en comercios aliados, reservación de área colectiva y vales para todos."}
                  </p>
                </div>
              </div>
            </div>
          )}
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

      <footer className="bg-white dark:bg-neutral-900 border-t border-neutral-200/80 dark:border-neutral-800 p-4 pb-6 max-w-lg mx-auto w-full sticky bottom-0 z-20 space-y-2">
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
        <p className="text-center text-[10px] text-neutral-400 dark:text-neutral-500">
          Powered by <span className="font-semibold text-teal-700 dark:text-teal-400">Protón</span>
        </p>
      </footer>
    </main>
  );
}
