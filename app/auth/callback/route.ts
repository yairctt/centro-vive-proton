/**
 * GET /auth/callback
 * Destino de los enlaces que manda Supabase por correo (confirmar cuenta,
 * recuperar contraseña). Canjea el código por una sesión y redirige a `next`.
 *   ?code=…              (flujo PKCE, el normal con @supabase/ssr)
 *   ?token_hash=…&type=… (plantillas de correo personalizadas)
 */
import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { getAuthClient } from "@/lib/db/auth";

function destino(next: string | null): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = destino(searchParams.get("next"));
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  try {
    const supabase = await getAuthClient();
    const { error } = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : tokenHash && type
        ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
        : { error: new Error("Enlace incompleto") };

    if (!error) return NextResponse.redirect(new URL(next, origin));
  } catch {
    // cae al error de abajo
  }
  return NextResponse.redirect(new URL("/login?error=enlace", origin));
}
