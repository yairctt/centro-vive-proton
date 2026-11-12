# Bitácora de IA — Integrante 2 (Mapa, QR, integración y despliegue)

### 14:48 · Fase 0: estructura inicial, dependencias y tipos

- **Herramienta:** Claude Code (Claude Opus 5.5)
- **Objetivo:** dejar listo el repositorio para que los 5 integrantes trabajen en paralelo: proyecto Next.js, dependencias instaladas, carpetas por integrante, tipos compartidos y reglas para agentes.
- **Prompt (resumen):** «Crea la estructura inicial de Pulso Jarocho según docs/propuesta.md: Next.js + TS + Tailwind, dependencias del stack, carpetas por integrante, lib/types.ts y AGENTS.md.»
- **Resultado:** proyecto Next.js 16 con `package.json` y `package-lock.json` (Supabase, Leaflet/react-leaflet, html5-qrcode, qrcode, Recharts, @google/genai, zod, vitest); `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`; `.env.example` y `.gitignore`; `AGENTS.md`; `lib/types.ts` (tipos compartidos); `lib/engine/config.ts` (pesos), `lib/flags.ts` (interruptores) y `lib/i18n/es.ts` (textos); portada `app/page.tsx` con enlaces a cada sección; carpetas vacías con `.gitkeep` para cada integrante; `docs/propuesta.md`.
- **Revisión humana:** Verifiqué que `npm run build` y `npm test` compilaran limpios desde el esqueleto inicial. Revisé que las carpetas y permisos coincidieran exactamente con la tabla de integrantes de CONTEXTO.md y que `.gitignore` protegiera `.env*`. Aseguré que el repositorio quedara listo para clonar y ramificar sin fricciones entre los 5 integrantes.
- **Commit:** `4de9a68` — chore: estructura inicial del proyecto

### 15:16 · Componente de mapa Leaflet

- **Herramienta:** Claude Code (Claude Opus 5.5)
- **Objetivo:** un mapa reutilizable del Centro Histórico que muestre lugares, eventos y las paradas numeradas de una ruta.
- **Prompt (resumen):** «Crea components/mapa/Mapa.tsx con react-leaflet (sin SSR) que reciba `Place[]` y `RouteStop[]` opcional y muestre marcadores numerados.»
- **Resultado:** `components/mapa/Mapa.tsx` (envoltorio con `dynamic(..., { ssr: false })`), `MapaCentro.tsx` (implementación Leaflet: marcadores de lugares, «por confirmar», eventos y paradas numeradas, línea de ruta, ubicación del usuario, leyenda y encuadre automático), `config.ts` (centro del Zócalo, zoom, teselas y atribución de OSM, colores), `types.ts` (`MapaProps`, `LatLng`), `index.ts`; textos nuevos en `lib/i18n/es.ts` (`es.mapa`).
- **Revisión humana:** Probé la renderización en el navegador confirmando que `dynamic(..., { ssr: false })` evita el error clásico de `window is not defined` de Leaflet en Next.js. Verifiqué que las teselas carguen con la atribución obligatoria de OpenStreetMap, que el centro apunte correctamente al Zócalo (19.20, -96.13) y que los marcadores numerados de la ruta y eventos se distingan claramente en pantalla móvil.
- **Commit:** `3fd86d9` — feat(mapa): agrega mapa Leaflet con marcadores de lugares, eventos y ruta

### 16:14 · Lector QR con validación y modo demo

- **Herramienta:** Claude Code (Claude Opus 5.5)
- **Objetivo:** pantalla `/escanear` que lea el QR del lugar con la cámara trasera, valide la visita en el servidor y muestre los puntos; con respaldo de demo y captura manual si no hay cámara.
- **Prompt (resumen):** «Crea app/escanear/page.tsx con html5-qrcode (cámara trasera, solo cliente), que acepte el token solo o la URL `/escanear?t=`, llame POST /api/visits/validate con mock si falla y muestre éxito, error o captura manual. Crea lib/qr/parse.ts y lib/qr/url.ts.»
- **Resultado:** `app/escanear/page.tsx` (estados inicio → escaneando → validando → éxito/error, más captura manual con instrucciones de permiso; usa `?t=` de la URL sin abrir la cámara); `lib/qr/parse.ts` (`extractToken`), `lib/qr/url.ts` (`buildQrUrl`), `lib/qr/validate.ts` (llamada al endpoint y regla de cuándo usar el mock), `lib/qr/mock.ts` (`ValidateResponse` de ejemplo), `lib/qr/types.ts` (`ValidateResponse`, porque aún no existe en `lib/types.ts`); claves `es.qr` en `lib/i18n/es.ts`.
- **Revisión humana:** Probé el lector en un teléfono real con cámara trasera (`facingMode: environment`) y validé la solicitud de permisos. Comprobé el flujo de contingencia para la demo: si la cámara falla o no hay permisos, la captura manual por input o el parámetro directo `?t=` en la URL validan el token de inmediato sin bloquear al jurado. Verifiqué que la pantalla muestre los puntos ganados con feedback visual claro.
- **Commit:** `d34f018` — feat(qr): lector QR con validación y modo demo

### 18:20 · Página de QR imprimibles

- **Herramienta:** Claude Code (Claude Opus 5.5)
- **Objetivo:** página `/admin/qr` con una tarjeta imprimible por lugar (nombre, categoría, QR grande con la URL `…/escanear?t=<token>` y el lema), lista para imprimir 2 por hoja carta.
- **Prompt (resumen):** «Crea app/(panel)/admin/qr/page.tsx que lea GET /api/qr-tokens (mock si no existe), genere cada QR con `qrcode` y `buildQrUrl(token, window.location.origin)`, con botón Imprimir y CSS @media print a 2 tarjetas por hoja carta.»
- **Resultado:** `app/(panel)/admin/qr/page.tsx` (carga, error con reintento, aviso «modo demo», tarjetas y CSS de impresión que oculta la navegación y los botones); `lib/qr/tokens.ts` (`fetchQrTarjetas`, con la misma regla de mock que `validate.ts`); `mockQrTarjetas()` en `lib/qr/mock.ts` (tokens `demo-…` que se imprimen con la marca DEMO); tipo `QrTarjeta` en `lib/qr/types.ts`; textos `es.qrAdmin`. Verificado con Chrome headless: 4 tarjetas → PDF de 2 hojas carta. `GET /api/qr-tokens` queda pendiente para el integrante 3.
- **Revisión humana:** Comprobé la vista previa de impresión con `@media print`: verifiqué que la barra de navegación, botones y avisos se oculten automáticamente y que el layout acomode exactamente 2 tarjetas por hoja tamaño carta sin saltos de página indeseados. Escaneé los códigos QR generados directamente desde la pantalla y desde una hoja impresa de prueba con el teléfono, confirmando que la URL redirige de inmediato a `/escanear?t=...`.
- **Commit:** `1e85fed` — feat(qr): página de QR imprimibles

### 23:01 · Rediseño editorial de la UI (cero emojis, paleta teal)

- **Herramienta:** Claude Code (Claude Fable 5)
- **Objetivo:** rediseño visual completo del flujo del visitante y detalles de paneles: sustituir todos los emojis por iconos SVG, aplicar paleta identitaria (teal/amber/emerald), modo oscuro y correcciones de UX (barras pegajosas que tapaban contenido, spinner de carga, estados vacíos y de error), sin tocar lógica ni contratos de API.
- **Prompt (resumen):** «Rediseño editorial humano, cero emojis y corrección UX/UI: iconos SVG centralizados, eliminar fondo negro y halos en /mision, paleta teal-700/amber-600/emerald-600, pb-32 bajo barras sticky, active:scale-[0.98], contraste WCAG.»
- **Resultado:** `components/ui/icons.tsx` (nuevo, 20 iconos SVG de trazo); rediseño de `app/(visitante)/inicio`, `ruta`, `mision/[id]`, `pasaporte`, `app/escanear`; `PrinterIcon` en `app/(panel)/comercio/qr`; logo sólido en `PanelHeader`. Lógica, hooks, sessionStorage, `#lector-qr` y `CSS_IMPRESION` intactos.
- **Revisión humana:** `npm run build` sin errores; barrido de emojis en app/ y components/ (solo quedan una flecha en comentario de código y la estrella tipográfica del marcador de Leaflet); los 2 errores de ESLint (`set-state-in-effect`) son preexistentes en lógica que no se tocó.
- **Commit:** pendiente en `feat/ux-visitante`

### 23:XX · Vista /hoy homogénea con el rediseño

- **Herramienta:** Claude Code (Claude Fable 5)
- **Objetivo:** restilizar `app/(visitante)/hoy` (venía de main con el estilo anterior) para homogeneizarla con el rediseño editorial: paleta teal/amber, superficies neutras con modo oscuro, iconos SVG en lugar de emojis y badges con borde.
- **Prompt (resumen):** «Refactoriza la vista /hoy para que sea homogénea con los cambios que se subieron.»
- **Resultado:** `app/(visitante)/hoy/page.tsx` — badge «Agenda viva» en amber con CalendarIcon, cierre con XIcon, bloque de hora en amber-600 (mismo acento que los eventos en /ruta), categoría traducida con `es.ruta.categoria`, lugar con MapPinIcon, «Por confirmar» con borde visible, estado vacío con icono circular y botón hacia /inicio. Lógica de fetch y formato de hora intactas.
- **Revisión humana:** `npm run build` sin errores.
- **Commit:** pendiente en `feat/ux-visitante`
