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
      titulo={es.auth.tituloLogin}
      subtitulo={es.auth.subtituloLogin}
      pie={
        <>
          {es.auth.sinCuenta}{" "}
          <Link href={conRegistro} className="font-bold text-teal-700 dark:text-teal-400">
            {es.auth.crearCuenta}
          </Link>
        </>
      }
    >
      <div className="space-y-2">
        <Boton type="button" onClick={entrarComoInvitado} disabled={cargando !== null}>
          {cargando === "invitado" ? es.auth.entrando : es.auth.invitado}
        </Boton>
        <p className="text-xs text-neutral-500">{es.auth.invitadoAyuda}</p>
      </div>

      <Separador />

      <form onSubmit={entrar} className="space-y-4">
        <Campo
          label={es.auth.correo}
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Campo
          label={es.auth.contrasena}
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <Aviso tipo="error">{error}</Aviso>}
        <Boton type="submit" variante="secundario" disabled={cargando !== null}>
          {cargando === "correo" ? es.auth.entrando : es.auth.entrar}
        </Boton>
        <p className="text-center text-sm">
          <Link href="/recuperar" className="font-semibold text-teal-700 dark:text-teal-400">
            {es.auth.olvide}
          </Link>
        </p>
      </form>

      {flags.accesosDemo && (
        <>
          <Separador />
          <div className="space-y-2">
            <p className="text-xs font-bold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
              {es.auth.accesosDemo}
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={entrarComoInvitado}
                disabled={cargando !== null}
                className="cursor-pointer rounded-xl border border-teal-200 bg-teal-50 px-2 py-2 text-xs font-semibold text-teal-800 transition hover:bg-teal-100 active:scale-95 disabled:opacity-50 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300 dark:hover:bg-teal-950/70"
              >
                {cargando === "invitado" ? es.auth.entrando : es.auth.demoVisitante}
              </button>
              <button
                type="button"
                onClick={() => entrarDemo("comercio")}
                disabled={cargando !== null}
                className="cursor-pointer rounded-xl border border-amber-200 bg-amber-50 px-2 py-2 text-xs font-semibold text-amber-800 transition hover:bg-amber-100 active:scale-95 disabled:opacity-50 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-950/70"
              >
                {cargando === "comercio" ? es.auth.entrando : es.auth.demoComercio}
              </button>
              <button
                type="button"
                onClick={() => entrarDemo("admin")}
                disabled={cargando !== null}
                className="cursor-pointer rounded-xl border border-neutral-300 bg-neutral-100 px-2 py-2 text-xs font-semibold text-neutral-800 transition hover:bg-neutral-200 active:scale-95 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
              >
                {cargando === "admin" ? es.auth.entrando : es.auth.demoAdmin}
              </button>
            </div>
            <p className="text-xs text-neutral-500">{es.auth.accesosDemoAyuda}</p>
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
