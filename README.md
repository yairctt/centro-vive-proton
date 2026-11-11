# Pulso Jarocho — _La ciudad se activa contigo._

PWA para el hackathon **Reto 6 · Centro vivo** (Turismo y Centro Histórico de Veracruz).
Convierte el tiempo y los gustos del visitante en una **ruta con misiones** por el Zócalo, los Portales y el Malecón; cada visita se valida con un **QR** y suma puntos en un **pasaporte digital**.
Comercios y autoridades ven la actividad registrada en la app en **tableros** casi en tiempo real.

## Cómo correrlo

Requisitos: Node.js 20 o superior.

```bash
npm install
cp .env.example .env.local   # completa las claves de Supabase y Gemini
npm run dev                  # http://localhost:3000
```

| Comando            | Qué hace                                            |
| ------------------ | --------------------------------------------------- |
| `npm run dev`      | Servidor de desarrollo                              |
| `npm run build`    | Compilación de producción (debe pasar antes de PR)  |
| `npm test`         | Pruebas del motor con Vitest                        |
| `npm run bitacora` | Compila `docs/bitacora/*.md` dentro de este README  |

Variables (`.env.local`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` y `GEMINI_API_KEY` (las dos últimas solo en el servidor). Cada push a `main` se despliega en Vercel.

## Estructura

```
app/
  page.tsx            # portada con enlaces
  (visitante)/        # inicio, preferencias, ruta, misión, pasaporte, hoy
  (panel)/admin/      # tablero de afluencia digital y QR imprimibles
  (panel)/comercio/   # vitrina, eventos y canjes
  escanear/           # lector QR
  api/                # endpoints (api/ai: redacción con Gemini)
components/           # visitante/, mapa/, paneles/
lib/
  types.ts            # tipos compartidos
  engine/             # motor de recomendación (funciones puras + pruebas)
  ai/                 # cliente de Gemini, prompts y textos de respaldo
  db/  qr/  mock/     # Supabase, QR y datos de prueba
  i18n/es.ts          # textos de la interfaz
  flags.ts            # interruptores de funciones
supabase/             # schema.sql y seed.sql
docs/
  propuesta.md        # propuesta completa
  bitacora/           # bitácora de IA por integrante
  explicaciones/      # explicación de cada módulo
scripts/              # utilidades (compilar-bitacora.mjs)
```

## Bitácora de IA

Usamos asistentes de IA para programar (agentes como Claude Code y Antigravity) durante todo el hackathon. Así los usamos:

- **Contexto común:** cada agente lee primero [`CONTEXTO.md`](CONTEXTO.md), que fija el stack, los tipos compartidos, los contratos de API y las reglas (qué carpetas puede tocar cada integrante, no instalar dependencias, no inventar datos).
- **Tareas pequeñas:** una tarea por conversación, acotada a las carpetas del integrante que la pide.
- **Registro:** al terminar cada tarea, el integrante agrega una entrada en su bitácora (herramienta, objetivo, prompt, resultado, revisión humana y commit) y el agente escribe en [`docs/explicaciones/`](docs/explicaciones/) qué hace el módulo, para que cualquiera del equipo pueda explicarlo.

**Criterio de revisión humana.** Nada generado por IA entra a `main` sin que una persona lo revise: lee el diff, comprueba que `npm run build` (y `npm test` si toca el motor) pase, lo prueba en el navegador o en un teléfono, verifica que no se inventen horarios, precios ni eventos y que los puntos se calculen solo en el servidor. Lo que se corrigió o rechazó queda anotado en la bitácora. El integrante 2 hace los merges por Pull Request.

Bitácoras por integrante:

1. [Integrante 1 — Frontend del visitante](docs/bitacora/integrante-1.md)
2. [Integrante 2 — Mapa, QR, integración y despliegue](docs/bitacora/integrante-2.md)
3. [Integrante 3 — Backend, base de datos y seguridad](docs/bitacora/integrante-3.md)
4. [Integrante 4 — Motor de recomendación e IA](docs/bitacora/integrante-4.md)
5. [Integrante 5 — Paneles de comercio y admin; pitch](docs/bitacora/integrante-5.md)

<!-- BITACORA:INICIO -->

<!-- Generado con «npm run bitacora». No editar a mano: edita docs/bitacora/. -->

### Bitácora de IA — Integrante 1 (Frontend del visitante)

### Bitácora de IA — Integrante 2 (Mapa, QR, integración y despliegue)

##### 14:48 · Fase 0: estructura inicial, dependencias y tipos

- **Herramienta:** Claude Code (Claude Opus 5.5)
- **Objetivo:** dejar listo el repositorio para que los 5 integrantes trabajen en paralelo: proyecto Next.js, dependencias instaladas, carpetas por integrante, tipos compartidos y reglas para agentes.
- **Prompt (resumen):** «Crea la estructura inicial de Pulso Jarocho según docs/propuesta.md: Next.js + TS + Tailwind, dependencias del stack, carpetas por integrante, lib/types.ts y AGENTS.md.»
- **Resultado:** proyecto Next.js 16 con `package.json` y `package-lock.json` (Supabase, Leaflet/react-leaflet, html5-qrcode, qrcode, Recharts, @google/genai, zod, vitest); `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`; `.env.example` y `.gitignore`; `AGENTS.md`; `lib/types.ts` (tipos compartidos); `lib/engine/config.ts` (pesos), `lib/flags.ts` (interruptores) y `lib/i18n/es.ts` (textos); portada `app/page.tsx` con enlaces a cada sección; carpetas vacías con `.gitkeep` para cada integrante; `docs/propuesta.md`.
- **Revisión humana:** PENDIENTE: completar
- **Commit:** `4de9a68` — chore: estructura inicial del proyecto

##### 15:16 · Componente de mapa Leaflet

- **Herramienta:** Claude Code (Claude Opus 5.5)
- **Objetivo:** un mapa reutilizable del Centro Histórico que muestre lugares, eventos y las paradas numeradas de una ruta.
- **Prompt (resumen):** «Crea components/mapa/Mapa.tsx con react-leaflet (sin SSR) que reciba `Place[]` y `RouteStop[]` opcional y muestre marcadores numerados.»
- **Resultado:** `components/mapa/Mapa.tsx` (envoltorio con `dynamic(..., { ssr: false })`), `MapaCentro.tsx` (implementación Leaflet: marcadores de lugares, «por confirmar», eventos y paradas numeradas, línea de ruta, ubicación del usuario, leyenda y encuadre automático), `config.ts` (centro del Zócalo, zoom, teselas y atribución de OSM, colores), `types.ts` (`MapaProps`, `LatLng`), `index.ts`; textos nuevos en `lib/i18n/es.ts` (`es.mapa`).
- **Revisión humana:** PENDIENTE: completar
- **Commit:** `3fd86d9` — feat(mapa): agrega mapa Leaflet con marcadores de lugares, eventos y ruta

### Bitácora de IA — Integrante 3 (Backend, base de datos y seguridad)

### Bitácora de IA — Integrante 4 (Motor de recomendación e IA)

### Bitácora de IA — Integrante 5 (Paneles de comercio y admin; pitch)

<!-- BITACORA:FIN -->

## Puntos de control

| Corte | Hora | Commit | Qué incluye |
| ----- | ---- | ------ | ----------- |
| CP1   |      |        |             |
| CP2   |      |        |             |
