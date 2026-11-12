"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { getBrowserClient } from "@/lib/db/browser";
import { es } from "@/lib/i18n/es";
import { AuthShell, Aviso, Boton, Campo } from "@/components/auth/ui";
import { irTrasLogin } from "@/components/auth/sesion";
import { mensajeDeError } from "@/components/auth/errores";

/**
 * Se llega desde el enlace del correo de recuperación:
 * /auth/callback canjea el código por una sesión y redirige aquí.
 */
export default function RestablecerPage() {
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [cargando, setCargando] = useState(false);
  const [listo, setListo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError(es.auth.contrasenaCorta);
    if (password !== password2) return setError(es.auth.contrasenasDistintas);

    setCargando(true);
    const supabase = getBrowserClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setError(es.auth.sinSesionRestablecer);
      setCargando(false);
      return;
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(mensajeDeError(error));
      setCargando(false);
      return;
    }
    setListo(true);
    setTimeout(() => irTrasLogin(null), 1200);
  }

  return (
    <AuthShell
      titulo={es.auth.tituloRestablecer}
      subtitulo={listo ? undefined : es.auth.subtituloRestablecer}
      pie={
        <Link href="/recuperar" className="font-bold text-teal-700 dark:text-teal-400">
          {es.auth.olvide}
        </Link>
      }
    >
      {listo ? (
        <Aviso tipo="ok">{es.auth.contrasenaGuardada}</Aviso>
      ) : (
        <form onSubmit={guardar} className="space-y-4">
          <Campo
            label={es.auth.contrasenaNueva}
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
            {cargando ? es.auth.guardando : es.auth.guardar}
          </Boton>
        </form>
      )}
    </AuthShell>
  );
}
