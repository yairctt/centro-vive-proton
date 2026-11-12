"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getBrowserClient } from "@/lib/db/browser";
import { es } from "@/lib/i18n/es";
import { AuthShell, Aviso, Boton, Campo } from "@/components/auth/ui";
import { irTrasLogin } from "@/components/auth/sesion";
import { mensajeDeError } from "@/components/auth/errores";

function RegistroForm() {
  const params = useSearchParams();
  const next = params.get("next");
  const [alias, setAlias] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revisaCorreo, setRevisaCorreo] = useState(false);
  // Si entró como invitado, la cuenta se crea sobre esa sesión (conserva puntos).
  const [esInvitado, setEsInvitado] = useState(false);

  useEffect(() => {
    getBrowserClient()
      .auth.getUser()
      .then(({ data }: { data: { user: { is_anonymous?: boolean } | null } }) =>
        setEsInvitado(Boolean(data.user?.is_anonymous)),
      )
      .catch(() => {});
  }, []);

  async function registrar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError(es.auth.contrasenaCorta);
    if (password !== password2) return setError(es.auth.contrasenasDistintas);

    setCargando(true);
    const supabase = getBrowserClient();
    const datos = { alias: alias.trim() };
    const destino = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next ?? "/inicio")}`;

    if (esInvitado) {
      const { error } = await supabase.auth.updateUser(
        { email: email.trim(), password, data: datos },
        { emailRedirectTo: destino },
      );
      if (error) {
        setError(mensajeDeError(error));
        setCargando(false);
        return;
      }
      // El perfil ya existe (como invitado): solo se actualiza el alias.
      await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      }).catch(() => {});
      const { data } = await supabase.auth.getUser();
      if (data.user?.is_anonymous) {
        // Falta confirmar el correo para terminar de convertir la cuenta.
        setRevisaCorreo(true);
        setCargando(false);
        return;
      }
      await irTrasLogin(next);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: datos, emailRedirectTo: destino },
    });
    if (error) {
      setError(mensajeDeError(error));
      setCargando(false);
      return;
    }
    if (!data.session) {
      // Supabase pide confirmar el correo antes de iniciar sesión.
      setRevisaCorreo(true);
      setCargando(false);
      return;
    }
    await irTrasLogin(next);
  }

  if (revisaCorreo) {
    return (
      <AuthShell titulo={es.auth.tituloRegistro}>
        <Aviso tipo="ok">{es.auth.revisaCorreo}</Aviso>
        <p className="mt-4 text-center text-sm">
          <Link href="/" className="font-semibold text-teal-700 dark:text-teal-400">
            {es.auth.volver}
          </Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      titulo={es.auth.tituloRegistro}
      subtitulo={esInvitado ? es.auth.subtituloConvertir : es.auth.subtituloRegistro}
      pie={
        <>
          {es.auth.conCuenta}{" "}
          <Link
            href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
            className="font-bold text-teal-700 dark:text-teal-400"
          >
            {es.auth.entrar}
          </Link>
        </>
      }
    >
      <form onSubmit={registrar} className="space-y-4">
        <Campo
          label={es.auth.alias}
          ayuda={es.auth.aliasAyuda}
          autoComplete="nickname"
          required
          minLength={2}
          maxLength={40}
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
        />
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
          ayuda={es.auth.contrasenaAyuda}
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Campo
          label={es.auth.confirmarContrasena}
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
        />
        {error && <Aviso tipo="error">{error}</Aviso>}
        <Boton type="submit" disabled={cargando}>
          {cargando ? es.auth.creando : es.auth.crearCuenta}
        </Boton>
      </form>
    </AuthShell>
  );
}

export default function RegistroPage() {
  return (
    <Suspense>
      <RegistroForm />
    </Suspense>
  );
}
