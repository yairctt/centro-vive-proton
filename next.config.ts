
import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";

// Detectar las direcciones IPv4 de la computadora
const interfaces = Object.values(networkInterfaces());

const localIPs = interfaces.flatMap((items) =>
  (items ?? [])
    .filter((item) => item.family === "IPv4" && !item.internal)
    .map((item) => item.address)
);

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,

  // Permitir las direcciones locales detectadas
  allowedDevOrigins: [...new Set(localIPs)],

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;