"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { getBrowserClient } from "@/lib/db/browser";
import { es } from "@/lib/i18n/es";
import { AuthShell, Aviso, Boton, Campo } from "@/components/auth/ui";
import { mensajeDeError } from "@/components/auth/errores";

export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [cargando, setCargando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    const { error } = await getBrowserClient().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/restablecer`,
    });
    setCargando(false);
    // Solo se muestran errores de límite; nunca se revela si el correo existe.
    if (error && error.code?.startsWith("over_")) {
      setError(mensajeDeError(error));
      return;
    }
    setEnviado(true);
  }

  return (
    <AuthShell
      titulo={es.auth.tituloRecuperar}
      subtitulo={enviado ? undefined : es.auth.subtituloRecuperar}
      pie={
        <Link href="/login" className="font-bold text-teal-700 dark:text-teal-400">
          {es.auth.entrar}
        </Link>
      }
    >
      {enviado ? (
        <Aviso tipo="ok">{es.auth.enlaceEnviado}</Aviso>
      ) : (
        <form onSubmit={enviar} className="space-y-4">
          <Campo
            label={es.auth.correo}
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error && <Aviso tipo="error">{error}</Aviso>}
          <Boton type="submit" disabled={cargando}>
            {cargando ? es.auth.enviando : es.auth.enviarEnlace}
          </Boton>
        </form>
      )}
    </AuthShell>
  );
}
