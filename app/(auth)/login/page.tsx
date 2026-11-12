"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getBrowserClient } from "@/lib/db/browser";
import { es } from "@/lib/i18n/es";
import { flags } from "@/lib/flags";
import { AuthShell, Aviso, Boton, Campo, Separador } from "@/components/auth/ui";
import { irTrasLogin } from "@/components/auth/sesion";
import { mensajeDeError } from "@/components/auth/errores";
import {
  CompassIcon,
  StoreIcon,
  BarChartIcon,
  MailIcon,
  LockIcon,
  UserCheckIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "@/components/paneles/icons";

/**
 * Credenciales de las cuentas FICTICIAS de la demo (creadas con
 * scripts/crear-cuenta.mjs). Se pueden rotar por variables de entorno y los
 * botones se apagan con NEXT_PUBLIC_ACCESOS_DEMO=false.
 */
const CUENTAS_DEMO = {
  comercio: {
    email: process.env.NEXT_PUBLIC_DEMO_COMERCIO_EMAIL ?? "comercio@pulsojarocho.mx",
    password: process.env.NEXT_PUBLIC_DEMO_COMERCIO_PASS ?? "PulsoComercio#2026",
  },
  admin: {
    email: process.env.NEXT_PUBLIC_DEMO_ADMIN_EMAIL ?? "admin@pulsojarocho.mx",
    password: process.env.NEXT_PUBLIC_DEMO_ADMIN_PASS ?? "PulsoAdmin#2026",
  },
} as const;

function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState<"correo" | "invitado" | "comercio" | "admin" | null>(null);
  const [error, setError] = useState<string | null>(
    params.get("error") === "enlace" ? es.auth.enlaceInvalido : null,
  );

  const conRegistro = next ? `/registro?next=${encodeURIComponent(next)}` : "/registro";

  async function entrar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando("correo");
    const { error } = await getBrowserClient().auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      setError(mensajeDeError(error));
      setCargando(null);
      return;
    }
    await irTrasLogin(next);
  }

  async function entrarComoInvitado() {
    setError(null);
    setCargando("invitado");
    const { error } = await getBrowserClient().auth.signInAnonymously();
    if (error) {
      setError(mensajeDeError(error));
      setCargando(null);
      return;
    }
    await irTrasLogin(next);
  }

  /** Acceso de demostración: entra con la cuenta ficticia del rol elegido. */
  async function entrarDemo(rol: "comercio" | "admin") {
    setError(null);
    setCargando(rol);
    const { error } = await getBrowserClient().auth.signInWithPassword(CUENTAS_DEMO[rol]);
    if (error) {
      setError(mensajeDeError(error));
      setCargando(null);
      return;
    }
    // Ignora ?next=: cada rol aterriza en su propio panel.
    await irTrasLogin(null);
  }

  return (
    <AuthShell
      titulo="¡Bienvenido de nuevo!"
      subtitulo={
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          ¿No tienes una cuenta?{" "}
          <Link
            href={conRegistro}
            className="font-bold text-neutral-900 hover:text-teal-700 dark:text-neutral-100 underline underline-offset-2"
          >
            Crea una cuenta nueva gratis
          </Link>
          , ¡toma menos de un minuto!
        </p>
      }
      pie={
        <div className="flex items-center justify-center gap-2 text-xs text-neutral-400 dark:text-neutral-500">
          <ShieldCheckIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>Acceso seguro · Centro Histórico de Veracruz</span>
        </div>
      }
    >
      {/* Formulario principal de credenciales como en el boceto */}
      <form onSubmit={entrar} className="space-y-4">
        <Campo
          label={es.auth.correo}
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          placeholder="tu.correo@ejemplo.com"
          icono={<MailIcon className="w-4 h-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Campo
          label={es.auth.contrasena}
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          icono={<LockIcon className="w-4 h-4" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <Aviso tipo="error">{error}</Aviso>}

        {/* Botón principal oscuro como el 'Login Now' del boceto */}
        <Boton type="submit" variante="oscuro" disabled={cargando !== null}>
          {cargando === "correo" ? "Iniciando sesión..." : "Iniciar Sesión"}
        </Boton>

        {/* Botón alternativo estilo Google del boceto: Continuar como Visitante */}
        <Boton
          type="button"
          variante="secundario"
          icono={<CompassIcon className="w-5 h-5 text-teal-700 dark:text-teal-400" />}
          onClick={entrarComoInvitado}
          disabled={cargando !== null}
        >
          {cargando === "invitado" ? "Entrando como visitante..." : "Continuar como Visitante (Sin registro)"}
        </Boton>

        {/* Enlace de recuperación al pie del formulario como en el boceto */}
        <p className="text-center text-xs text-neutral-500 pt-1">
          ¿Olvidaste tu contraseña?{" "}
          <Link
            href="/recuperar"
            className="font-bold text-neutral-900 dark:text-neutral-100 hover:text-teal-700 underline underline-offset-2"
          >
            Haz clic aquí
          </Link>
        </p>
      </form>

      {/* Accesos rápidos de demostración para el jurado */}
      {flags.accesosDemo && (
        <>
          <Separador texto="o accede con una cuenta demo (Jurado)" />
          <div className="space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Demo Visitante */}
              <button
                type="button"
                onClick={entrarComoInvitado}
                disabled={cargando !== null}
                className="group cursor-pointer flex flex-col items-center justify-center rounded-xl border border-teal-200/90 bg-teal-50/70 p-2.5 text-center transition hover:bg-teal-100/80 hover:border-teal-300 active:scale-95 disabled:opacity-50 dark:border-teal-800 dark:bg-teal-950/40 dark:hover:bg-teal-950/70"
              >
                <div className="mb-1 flex h-7 w-7 items-center justify-center rounded-lg bg-teal-700 text-white shadow-2xs group-hover:scale-105 transition-transform">
                  <UserCheckIcon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-teal-950 dark:text-teal-200">
                  {cargando === "invitado" ? "Entrando..." : "Visitante"}
                </span>
                <span className="text-[10px] text-teal-700/80 dark:text-teal-400">
                  Ruta & Sellos
                </span>
              </button>

              {/* Demo Comercio */}
              <button
                type="button"
                onClick={() => entrarDemo("comercio")}
                disabled={cargando !== null}
                className="group cursor-pointer flex flex-col items-center justify-center rounded-xl border border-amber-200/90 bg-amber-50/70 p-2.5 text-center transition hover:bg-amber-100/80 hover:border-amber-300 active:scale-95 disabled:opacity-50 dark:border-amber-800 dark:bg-amber-950/40 dark:hover:bg-amber-950/70"
              >
                <div className="mb-1 flex h-7 w-7 items-center justify-center rounded-lg bg-amber-600 text-white shadow-2xs group-hover:scale-105 transition-transform">
                  <StoreIcon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-amber-950 dark:text-amber-200">
                  {cargando === "comercio" ? "Entrando..." : "Comercio"}
                </span>
                <span className="text-[10px] text-amber-700/80 dark:text-amber-400">
                  Vitrina & Canjes
                </span>
              </button>

              {/* Demo Admin */}
              <button
                type="button"
                onClick={() => entrarDemo("admin")}
                disabled={cargando !== null}
                className="group cursor-pointer flex flex-col items-center justify-center rounded-xl border border-neutral-300 bg-neutral-100/80 p-2.5 text-center transition hover:bg-neutral-200 hover:border-neutral-400 active:scale-95 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700"
              >
                <div className="mb-1 flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-900 text-white shadow-2xs group-hover:scale-105 transition-transform dark:bg-neutral-700">
                  <BarChartIcon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  {cargando === "admin" ? "Entrando..." : "Admin"}
                </span>
                <span className="text-[10px] text-neutral-600 dark:text-neutral-400">
                  Afluencia Viva
                </span>
              </button>
            </div>
            <p className="text-center text-[11px] text-neutral-500 dark:text-neutral-400">
              {es.auth.accesosDemoAyuda}
            </p>
          </div>
        </>
      )}
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
