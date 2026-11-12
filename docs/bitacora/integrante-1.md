# Bitácora de IA — Integrante 1 (Frontend del visitante)

### 15:00 · Fase 1: Esqueleto vivo y datos mock (CP1)

- **Herramienta:** Gemini 3.1 Pro (Antigravity IDE)
- **Objetivo:** Crear la estructura de carpetas `app/(visitante)` y las vistas iniciales (Inicio, Ruta, Misión, Pasaporte) con datos de prueba estáticos para no depender del backend todavía.
- **Prompt (resumen):** «Crea en `app/(visitante)` las pantallas inicio (tiempo, intereses, presupuesto), ruta, `mision/[id]` y pasaporte, usando datos de `lib/mock` con los tipos de `lib/types.ts`. Diseño mobile-first.»
- **Resultado:** `lib/mock/index.ts` con `mockProfile`, `mockPlaces` y `mockRouteStops`, más los `page.tsx` iniciales de cada vista con la navegación base (`useRouter` y `Link`). Se resolvió un problema con `mkdir` en PowerShell creando las carpetas directamente en el IDE.
- **Revisión humana:** Completada (archivos creados y servidor levantado con éxito).
- **Commit:** `c7b2a91` — feat(visitante): agrega vistas del esqueleto vivo y datos mock

### 16:20 · Fase 2: Diseño UI final y limpieza de errores (CP1)

- **Herramienta:** Gemini 3.1 Pro (Antigravity IDE)
- **Objetivo:** Pulir la interfaz para cumplir con el documento de diseño (mobile-first, botones grandes, alto contraste) y resolver las advertencias de compilación antes del merge.
- **Prompt (resumen):** «Proporciona el diseño final para las pantallas restantes (Ruta, Misión y Pasaporte) y ayúdame a solucionar el error de compilación "MisionPage defined multiple times".»
- **Resultado:** Clases de Tailwind avanzadas (efectos `active:scale-95`, tarjetas, gradientes, layout fijo inferior) y corrección del error de duplicación de funciones borrando el código sobrante. Build local exitoso sin errores.
- **Revisión humana:** Completada (UI revisada en modo dispositivo móvil en Chrome y build exitoso).
- **Commit:** `a1f8c3d` — feat(visitante): vistas del esqueleto vivo CP1 completas

### 17:12 · Fase 3: Conexión del motor y lugares reales (CP2)

- **Herramienta:** Gemini 3.1 Pro (Antigravity IDE)
- **Objetivo:** Abandonar los datos mock y conectar el formulario de preferencias con el endpoint real `POST /api/route`, pasando la respuesta a la pantalla de ruta.
- **Prompt (resumen):** «Actualiza el código de la página de inicio y de ruta para conectarlo con el backend real de mis compañeros. Pásale los minutos, intereses y presupuesto, y lee el resultado.»
- **Resultado:** En `/inicio` se agregó el `fetch` al endpoint de I4 con manejo de estado de carga y se guardó la respuesta en `sessionStorage`; en `/ruta` se refactorizó para leer de la sesión. Se corrigió además un error de React (cascading renders por `setState` síncrono) usando `isClient` para evitar problemas de hidratación de Next.js.
- **Revisión humana:** PENDIENTE: Confirmar visualización de ruta real con base de datos.
- **Commit:** `e5a9b42` — feat(visitante): conecta preferencias con POST /api/route real
