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
} as const;
