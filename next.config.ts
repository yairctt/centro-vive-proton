
import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";

const interfaces = Object.values(networkInterfaces());

const localIPs = interfaces.flatMap((items) =>
  (items ?? [])
    .filter((item) => item.family === "IPv4" && !item.internal)
    .map((item) => item.address)
);

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,

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
