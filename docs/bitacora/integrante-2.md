# Bitácora de IA — Integrante 2 (Mapa, QR, integración y despliegue)

### 14:48 · Fase 0: estructura inicial, dependencias y tipos

- **Herramienta:** Claude Code (Claude Opus 5.5)
- **Objetivo:** dejar listo el repositorio para que los 5 integrantes trabajen en paralelo: proyecto Next.js, dependencias instaladas, carpetas por integrante, tipos compartidos y reglas para agentes.
- **Prompt (resumen):** «Crea la estructura inicial de Pulso Jarocho según docs/propuesta.md: Next.js + TS + Tailwind, dependencias del stack, carpetas por integrante, lib/types.ts y AGENTS.md.»
- **Resultado:** proyecto Next.js 16 con `package.json` y `package-lock.json` (Supabase, Leaflet/react-leaflet, html5-qrcode, qrcode, Recharts, @google/genai, zod, vitest); `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`; `.env.example` y `.gitignore`; `AGENTS.md`; `lib/types.ts` (tipos compartidos); `lib/engine/config.ts` (pesos), `lib/flags.ts` (interruptores) y `lib/i18n/es.ts` (textos); portada `app/page.tsx` con enlaces a cada sección; carpetas vacías con `.gitkeep` para cada integrante; `docs/propuesta.md`.
- **Revisión humana:** PENDIENTE: completar
- **Commit:** `4de9a68` — chore: estructura inicial del proyecto

### 15:16 · Componente de mapa Leaflet

- **Herramienta:** Claude Code (Claude Opus 5.5)
- **Objetivo:** un mapa reutilizable del Centro Histórico que muestre lugares, eventos y las paradas numeradas de una ruta.
- **Prompt (resumen):** «Crea components/mapa/Mapa.tsx con react-leaflet (sin SSR) que reciba `Place[]` y `RouteStop[]` opcional y muestre marcadores numerados.»
- **Resultado:** `components/mapa/Mapa.tsx` (envoltorio con `dynamic(..., { ssr: false })`), `MapaCentro.tsx` (implementación Leaflet: marcadores de lugares, «por confirmar», eventos y paradas numeradas, línea de ruta, ubicación del usuario, leyenda y encuadre automático), `config.ts` (centro del Zócalo, zoom, teselas y atribución de OSM, colores), `types.ts` (`MapaProps`, `LatLng`), `index.ts`; textos nuevos en `lib/i18n/es.ts` (`es.mapa`).
- **Revisión humana:** PENDIENTE: completar
- **Commit:** `3fd86d9` — feat(mapa): agrega mapa Leaflet con marcadores de lugares, eventos y ruta

### 16:14 · Lector QR con validación y modo demo

- **Herramienta:** Claude Code (Claude Opus 5.5)
- **Objetivo:** pantalla `/escanear` que lea el QR del lugar con la cámara trasera, valide la visita en el servidor y muestre los puntos; con respaldo de demo y captura manual si no hay cámara.
- **Prompt (resumen):** «Crea app/escanear/page.tsx con html5-qrcode (cámara trasera, solo cliente), que acepte el token solo o la URL `/escanear?t=`, llame POST /api/visits/validate con mock si falla y muestre éxito, error o captura manual. Crea lib/qr/parse.ts y lib/qr/url.ts.»
- **Resultado:** `app/escanear/page.tsx` (estados inicio → escaneando → validando → éxito/error, más captura manual con instrucciones de permiso; usa `?t=` de la URL sin abrir la cámara); `lib/qr/parse.ts` (`extractToken`), `lib/qr/url.ts` (`buildQrUrl`), `lib/qr/validate.ts` (llamada al endpoint y regla de cuándo usar el mock), `lib/qr/mock.ts` (`ValidateResponse` de ejemplo), `lib/qr/types.ts` (`ValidateResponse`, porque aún no existe en `lib/types.ts`); claves `es.qr` en `lib/i18n/es.ts`.
- **Revisión humana:** PENDIENTE: completar
- **Commit:** `d34f018` — feat(qr): lector QR con validación y modo demo
