"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getBrowserClient } from "@/lib/db/browser";
import { es } from "@/lib/i18n/es";
import { AuthShell, Aviso, Boton, Campo, Separador } from "@/components/auth/ui";
import { irTrasLogin } from "@/components/auth/sesion";
import { mensajeDeError } from "@/components/auth/errores";

function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState<"correo" | "invitado" | null>(null);
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
