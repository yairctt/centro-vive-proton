import Link from "next/link";
import { es } from "@/lib/i18n/es";

const links = [
  { href: "/inicio", label: "Explorar el Centro" },
  { href: "/ruta", label: "Ver la ruta sugerida" },
  { href: "/pasaporte", label: "Mi pasaporte" },
  { href: "/escanear", label: "Escanear QR" },
  { href: "/admin", label: "Panel de administración" },
  { href: "/admin/qr", label: "QR imprimibles" },
  { href: "/comercio", label: "Panel de comercio" },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-8 px-4 py-12">
      <header className="space-y-2 text-center">
        <h1 className="text-4xl font-bold tracking-tight">{es.appName}</h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">{es.tagline}</p>
      </header>
      <nav className="flex flex-col gap-3">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-xl border border-neutral-300 px-4 py-4 text-center text-base font-medium transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </main>
  );
}
