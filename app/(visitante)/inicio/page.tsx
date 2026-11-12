"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Budget } from "@/lib/types";
import { CalendarIcon, ShipIcon, GlobeIcon, SparklesIcon, UsersIcon, TrophyIcon } from "@/components/paneles/icons";
import { PulsoLogo } from "@/components/ui/PulsoLogo";
import { getDictionary, getSavedLanguage, setSavedLanguage, type Idioma } from "@/lib/i18n";
import { crearNuevoGrupo, obtenerGrupo, unirseAGrupoPorCodigo } from "@/lib/grupo";
import { JoinGroupCard } from "@/components/ui/GroupExperience";
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
  const [submodoGrupo, setSubmodoGrupo] = useState<"crear" | "unirme">("crear");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const searchParams = new URLSearchParams(window.location.search);
    const queryLang = searchParams.get("lang");
    const queryMode = searchParams.get("mode");
    const queryGrupo = searchParams.get("grupo") || searchParams.get("code");

    const activeLang: Idioma = queryLang === "en" || queryLang === "es" ? (queryLang as Idioma) : getSavedLanguage();
    setLang(activeLang);

    if (queryGrupo) {
      setEsGrupo(true);
      setSubmodoGrupo("unirme");
      const g = unirseAGrupoPorCodigo(queryGrupo, activeLang === "en" ? "You" : "Tú");
      setTamanoGrupo(g.tamano);
      setNombreGrupo(g.nombre);
    } else if (queryMode === "grupo") {
      setEsGrupo(true);
      setTamanoGrupo(5);
    } else {
      const gActivo = obtenerGrupo();
      if (gActivo) {
        setEsGrupo(true);
        setTamanoGrupo(gActivo.tamano);
        setNombreGrupo(gActivo.nombre);
        setSubmodoGrupo("unirme");
      }
    }

    const onLangChange = (e: Event) => {
      const custom = e as CustomEvent<Idioma>;
      if (custom.detail === "es" || custom.detail === "en") {
        setLang(custom.detail);
      }
    };
    window.addEventListener("pulso_lang_changed", onLangChange);
    return () => window.removeEventListener("pulso_lang_changed", onLangChange);
  }, []);

  const toggleLanguage = (newLang: Idioma) => {
    setLang(newLang);
    setSavedLanguage(newLang);
  };

  const t = getDictionary(lang);

  const durationOptions = [
    { value: 60, label: t.inicio.duraciones.d60.label, desc: t.inicio.duraciones.d60.desc },
    { value: 120, label: t.inicio.duraciones.d120.label, desc: t.inicio.duraciones.d120.desc },
    { value: 180, label: t.inicio.duraciones.d180.label, desc: t.inicio.duraciones.d180.desc },
    { value: 240, label: t.inicio.duraciones.d240.label, desc: t.inicio.duraciones.d240.desc },
  ];

  const interestOptions = [
    { id: "historia", label: t.inicio.intereses.historia, Icon: LandmarkIcon },
    { id: "gastronomia", label: t.inicio.intereses.gastronomia, Icon: CoffeeIcon },
    { id: "cultura", label: t.inicio.intereses.cultura, Icon: MusicIcon },
    { id: "paseo", label: t.inicio.intereses.paseo, Icon: WavesIcon },
    { id: "compras", label: t.inicio.intereses.compras, Icon: ShoppingBagIcon },
  ];

  const budgetOptions: { id: Budget; label: string; desc: string; symbol: string }[] = [
    { id: "bajo", label: t.inicio.presupuesto.bajo.label, desc: t.inicio.presupuesto.bajo.desc, symbol: "$" },
    { id: "medio", label: t.inicio.presupuesto.medio.label, desc: t.inicio.presupuesto.medio.desc, symbol: "$$" },
    { id: "alto", label: t.inicio.presupuesto.alto.label, desc: t.inicio.presupuesto.alto.desc, symbol: "$$$" },
  ];

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleStartRoute = async () => {
    if (selectedInterests.length === 0) {
      alert(t.inicio.alertaSinInteres);
      return;
    }
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
        const existente = obtenerGrupo();
        if (!existente || submodoGrupo === "crear") {
          crearNuevoGrupo(nombreGrupo, tamanoGrupo, lang === "en" ? "You" : "Tú");
        }
      } else {
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("pulso_grupo_activo");
        }
      }

      router.push(`/ruta?lang=${lang}`);
    } catch (error) {
      console.error(error);
      alert(lang === "en" ? "Error connecting to route engine." : "Hubo un error al conectar con el motor. Avisa al Integrante 3.");
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
                className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  lang === "es"
                    ? "bg-teal-700 text-white shadow-2xs"
                    : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400"
                }`}
              >
                🇲🇽 ES
              </button>
              <button
                type="button"
                onClick={() => toggleLanguage("en")}
                className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  lang === "en"
                    ? "bg-teal-700 text-white shadow-2xs"
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
                {t.inicio.tituloPersonalizar}
              </h1>
              <p className="text-neutral-500 dark:text-neutral-400 font-medium text-sm mt-1">
                {t.inicio.subtituloPersonalizar}
              </p>
            </div>

            {/* Toggle de Modo Grupo */}
            <button
              type="button"
              onClick={() => setEsGrupo((v) => !v)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-black border transition-all shadow-2xs cursor-pointer ${
                esGrupo
                  ? "bg-amber-500 text-neutral-950 border-amber-600 ring-2 ring-amber-400/30"
                  : "bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800"
              }`}
              title={lang === "en" ? "Toggle group tour mode" : "Activar o desactivar modalidad de ruta en grupo"}
            >
              <UsersIcon className="w-4 h-4" />
              <span>{esGrupo ? `${lang === "en" ? "Group" : "Grupo"} (${tamanoGrupo}p) ✓` : (lang === "en" ? "Group Mode" : "Modo Grupo")}</span>
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
              {t.inicio.cuantoTiempo}
            </h2>
            <span className="text-xs font-semibold text-teal-700 dark:text-teal-400">
              {minutes} {t.inicio.minutos}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {durationOptions.map((opt) => {
              const selected = minutes === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setMinutes(opt.value)}
                  className={`min-h-[4.5rem] px-2 py-3 rounded-xl border text-center transition duration-100 active:scale-[0.98] cursor-pointer ${selected
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
              {t.inicio.comoViajas}
            </h2>
            <span className="text-xs font-semibold text-teal-700 dark:text-teal-400">
              {esGrupo ? `${tamanoGrupo} ${t.inicio.personas}` : t.inicio.individual}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setEsGrupo(false)}
              className={`p-3 rounded-xl border text-center transition duration-100 cursor-pointer ${
                !esGrupo
                  ? "border-teal-700 bg-teal-50 text-teal-900 ring-2 ring-teal-600/20 dark:border-teal-500 dark:bg-teal-950/40 dark:text-teal-100"
                  : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
              }`}
            >
              <div className="font-bold text-sm">{t.inicio.soloTitulo}</div>
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">{t.inicio.soloDesc}</div>
            </button>

            <button
              type="button"
              onClick={() => setEsGrupo(true)}
              className={`p-3 rounded-xl border text-center transition duration-100 cursor-pointer ${
                esGrupo
                  ? "border-amber-600 bg-amber-50 text-amber-950 ring-2 ring-amber-500/20 dark:border-amber-500 dark:bg-amber-950/40 dark:text-amber-100"
                  : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
              }`}
            >
              <div className="font-bold text-sm flex items-center justify-center gap-1.5">
                <UsersIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>{t.inicio.grupoTitulo}</span>
              </div>
              <div className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5 font-semibold">{t.inicio.grupoDesc}</div>
            </button>
          </div>

          {esGrupo && (
            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-4">
              {/* Pestañas: Crear Grupo vs Unirme con Código */}
              <div className="grid grid-cols-2 p-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-xl text-xs font-bold gap-1">
                <button
                  type="button"
                  onClick={() => setSubmodoGrupo("crear")}
                  className={`py-2 px-2 rounded-lg transition-all text-center cursor-pointer ${
                    submodoGrupo === "crear"
                      ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-black"
                      : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400"
                  }`}
                >
                  ➕ {t.inicio.submodoCrear}
                </button>

                <button
                  type="button"
                  onClick={() => setSubmodoGrupo("unirme")}
                  className={`py-2 px-2 rounded-lg transition-all text-center cursor-pointer ${
                    submodoGrupo === "unirme"
                      ? "bg-amber-500 text-neutral-950 shadow-xs font-black"
                      : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400"
                  }`}
                >
                  🔑 {t.inicio.submodoUnirme}
                </button>
              </div>

              {submodoGrupo === "unirme" ? (
                <JoinGroupCard
                  lang={lang}
                  onGroupJoined={(g) => {
                    setTamanoGrupo(g.tamano);
                    setNombreGrupo(g.nombre);
                  }}
                  onGroupLeft={() => {
                    setEsGrupo(false);
                    setSubmodoGrupo("crear");
                  }}
                />
              ) : (
                <>
                  {/* Sugerencias de tamaño de grupo */}
                  <div>
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-2">
                      {t.inicio.sugerenciaTamano}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setTamanoGrupo(3);
                          setEsPersonalizado(false);
                        }}
                        className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                          !esPersonalizado && tamanoGrupo <= 4
                            ? "bg-amber-500 border-amber-600 text-neutral-950 font-black shadow-xs"
                            : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-300"
                        }`}
                      >
                        <div className="text-xs font-bold">{t.inicio.tamanoPequeno}</div>
                        <div className="text-[10px] mt-0.5 opacity-90">{t.inicio.tamanoPequenoDesc}</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setTamanoGrupo(6);
                          setEsPersonalizado(false);
                        }}
                        className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                          !esPersonalizado && tamanoGrupo >= 5 && tamanoGrupo <= 10
                            ? "bg-amber-500 border-amber-600 text-neutral-950 font-black shadow-xs"
                            : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-300"
                        }`}
                      >
                        <div className="text-xs font-bold">{t.inicio.tamanoMediano}</div>
                        <div className="text-[10px] mt-0.5 opacity-90">{t.inicio.tamanoMedianoDesc}</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setTamanoGrupo(20);
                          setEsPersonalizado(false);
                        }}
                        className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                          !esPersonalizado && tamanoGrupo > 10
                            ? "bg-amber-500 border-amber-600 text-neutral-950 font-black shadow-xs"
                            : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-300"
                        }`}
                      >
                        <div className="text-xs font-bold">{t.inicio.tamanoContingente}</div>
                        <div className="text-[10px] mt-0.5 opacity-90">{t.inicio.tamanoContingenteDesc}</div>
                      </button>
                    </div>
                  </div>

                  {/* Cantidad personalizada */}
                  <div className="bg-neutral-50 dark:bg-neutral-800/60 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                        {t.inicio.personalizada}
                      </span>
                      <span className="font-mono text-sm font-black text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-md">
                        {tamanoGrupo} {t.inicio.personas}
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
                      {t.inicio.nombreGrupoLabel}
                    </label>
                    <input
                      type="text"
                      value={nombreGrupo}
                      onChange={(e) => setNombreGrupo(e.target.value)}
                      placeholder={t.inicio.nombreGrupoPlaceholder}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                  </div>

                  {/* Beneficio dinámico según el tamaño */}
                  <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 p-3 border border-amber-200 dark:border-amber-800 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                    <TrophyIcon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5 text-[11px] leading-relaxed">
                      <p className="font-bold">
                        {tamanoGrupo <= 4
                          ? t.inicio.beneficioPequenoTitulo
                          : tamanoGrupo <= 10
                          ? t.inicio.beneficioMedianoTitulo
                          : `${t.inicio.beneficioGrandeTitulo} (${tamanoGrupo} ${t.inicio.personas})`}
                      </p>
                      <p>
                        {tamanoGrupo <= 4
                          ? t.inicio.beneficioPequenoDesc
                          : tamanoGrupo <= 10
                          ? t.inicio.beneficioMedianoDesc
                          : t.inicio.beneficioGrandeDesc}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </section>

        <section className="bg-white dark:bg-neutral-900 p-5 rounded-2xl shadow-xs border border-neutral-200/80 dark:border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-neutral-900 dark:text-neutral-100 text-base">
              {t.inicio.queTeInteresa}
            </h2>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {selectedInterests.length} {lang === "en" ? "selected" : "seleccionados"}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {interestOptions.map((interest) => {
              const selected = selectedInterests.includes(interest.id);
              const Icon = interest.Icon;
              return (
                <button
                  key={interest.id}
                  type="button"
                  onClick={() => toggleInterest(interest.id)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition duration-100 active:scale-[0.98] cursor-pointer ${selected
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
            {t.inicio.cualPresupuesto}
          </h2>

          <div className="grid grid-cols-3 gap-2">
            {budgetOptions.map((b) => {
              const selected = budget === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBudget(b.id)}
                  className={`min-h-[5.5rem] px-2 py-3 rounded-xl border text-center transition duration-100 active:scale-[0.98] cursor-pointer ${selected
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
          className="w-full py-4 bg-teal-700 hover:bg-teal-800 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-bold text-base shadow-sm active:scale-[0.98] transition-transform duration-100 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <SpinnerIcon className="w-5 h-5 animate-spin" />
          ) : (
            <ArrowRightIcon className="w-5 h-5" />
          )}
          <span>{loading ? t.inicio.calculando : t.inicio.botonGenerar}</span>
        </button>
        <p className="text-center text-[10px] text-neutral-400 dark:text-neutral-500">
          Powered by <span className="font-semibold text-teal-700 dark:text-teal-400">Protón</span>
        </p>
      </footer>
    </main>
  );
}
