export const flags = {
  ia: true,
  centroDeNoche: true,
  agenda: true,
  /**
   * Plan B de la demo: sin sesión, las APIs usan los perfiles demo
   * (visitante-demo, comercio-demo, admin-demo) y no se pide login.
   * Se enciende con NEXT_PUBLIC_MODO_DEMO=true en Vercel (requiere redeploy).
   */
  modoDemo: process.env.NEXT_PUBLIC_MODO_DEMO === "true",
  /**
   * Botones de acceso rápido en /login (visitante, comercio y admin de demo)
   * para no teclear credenciales frente al jurado.
   * Se apagan con NEXT_PUBLIC_ACCESOS_DEMO=false.
   */
  accesosDemo: process.env.NEXT_PUBLIC_ACCESOS_DEMO !== "false",
} as const;
