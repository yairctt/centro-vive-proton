# Reglas para agentes — Pulso Jarocho

Lee docs/propuesta.md (secciones 3, 7, 10 y 11) antes de cualquier tarea.

Stack: Next.js App Router + TypeScript + Tailwind, Supabase, Leaflet, Recharts, Gemini (@google/genai).

Propiedad de carpetas:
- Integrante 1 (feat/visitante): app/(visitante), components/visitante, lib/mock
- Integrante 2 (feat/mapa-qr): components/mapa, app/escanear, lib/qr
- Integrante 3 (feat/backend): supabase, app/api (excepto app/api/ai), lib/db, lib/types.ts
- Integrante 4 (feat/motor-ia): lib/engine, lib/ai, app/api/ai
- Integrante 5 (feat/paneles): app/(panel), components/paneles

Reglas:
- SOLO modifica las carpetas de tu integrante. Si necesitas otra, detente y avisa.
- NO instales dependencias ni edites package.json, app/layout.tsx ni lib/types.ts.
- Usa los tipos de lib/types.ts y los contratos de API de docs/propuesta.md (sección 11.3).
- Nunca inventes horarios, precios ni eventos: usa la base de datos o lib/mock.
- Los puntos se calculan en el servidor, nunca en el cliente.
- Textos de la interfaz en lib/i18n/es.ts. Diseño mobile-first.
- Leaflet siempre se carga con dynamic import y ssr: false.
- Antes de terminar una tarea: npm run build sin errores.
- Commits: tipo(área): descripción. Ejemplo: feat(mapa): agrega marcadores.
