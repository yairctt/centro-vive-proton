import Link from "next/link";
import { es } from "@/lib/i18n/es";

const t = es.portada;

const accesosEquipo = [
  { href: "/admin", label: t.equipoAdmin },
  { href: "/admin/qr", label: t.equipoQr },
  { href: "/comercio", label: t.equipoComercio },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 bg-gray-50 px-6 py-8 text-gray-900">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-800 p-8 text-white shadow-xl shadow-blue-900/20">
        <div className="pointer-events-none absolute -top-10 -right-10 size-40 rounded-full border-[20px] border-white/10" />
        <span className="relative rounded-full bg-white/20 px-3 py-1 text-xs font-bold tracking-wider uppercase backdrop-blur-md">
          {t.etiqueta}
        </span>
        <h1 className="relative mt-5 text-4xl font-black tracking-tight">{es.appName}</h1>
        <p className="relative mt-2 text-lg font-medium text-blue-100">{es.tagline}</p>
        <p className="relative mt-6 text-sm leading-relaxed text-blue-100/90">{t.descripcion}</p>
      </section>

      <Link
        href="/inicio"
        className="block w-full rounded-2xl bg-blue-600 px-6 py-5 text-center text-lg font-bold text-white shadow-lg shadow-blue-200 transition active:scale-[0.98]"
      >
        🧭 {t.empezar}
      </Link>

      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/escanear"
          className="flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-xs transition active:scale-[0.98]"
        >
          <span className="text-3xl">📷</span>
          <span className="text-sm font-bold">{t.escanear}</span>
        </Link>
        <Link
          href="/pasaporte"
          className="flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-xs transition active:scale-[0.98]"
        >
          <span className="text-3xl">🏆</span>
          <span className="text-sm font-bold">{t.pasaporte}</span>
        </Link>
      </div>

      <footer className="mt-auto border-t border-gray-200 pt-5 text-center">
        <p className="mb-2 text-[11px] font-bold tracking-wider text-gray-400 uppercase">{t.equipo}</p>
        <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1">
          {accesosEquipo.map((l) => (
            <Link key={l.href} href={l.href} className="py-1 text-xs font-medium text-gray-500 underline">
              {l.label}
            </Link>
          ))}
        </nav>
      </footer>
    </main>
  );
}
