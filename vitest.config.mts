// Configuración de Vitest (Integrante 4).
// Añade el alias `@/` que usa Next.js, para que las pruebas puedan importar
// los módulos igual que la aplicación.

import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules/**", ".next/**", "**/.next/**"],
  },
});
