/**
 * POST /auth/salir — cierra la sesión y vuelve a la portada.
 * Se usa con un <form method="post" action="/auth/salir">.
 */
import { NextResponse, type NextRequest } from "next/server";
import { getAuthClient } from "@/lib/db/auth";

export async function POST(request: NextRequest) {
  try {
    const supabase = await getAuthClient();
    await supabase.auth.signOut();
  } catch {
    // Sin sesión o sin variables: igual se manda a la portada.
  }
  // 303: el navegador sigue la redirección con GET.
  return NextResponse.redirect(new URL("/", request.nextUrl.origin), { status: 303 });
}
