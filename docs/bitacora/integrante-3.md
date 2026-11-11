# Bitácora de IA — Integrante 3 (Backend, base de datos y seguridad)

### 15:35 · Clientes Supabase, mappers y endpoints places/events

- **Herramienta:** Antigravity (Gemini 3.8 Flash)
- **Objetivo:** Configurar clientes de Supabase (admin y browser), mappers con normalización snake_case → camelCase, y crear los endpoints `GET /api/places` y `GET /api/events`.
- **Prompt (resumen):** Crear `lib/db/server.ts`, `lib/db/browser.ts`, `lib/db/mappers.ts`, `app/api/places/route.ts` y `app/api/events/route.ts` con zona `America/Mexico_City`, compilar y subir a `feat/backend`.
- **Resultado:** `lib/db/server.ts`, `lib/db/browser.ts`, `lib/db/mappers.ts`, `app/api/places/route.ts`, `app/api/events/route.ts` y actualización de tipos en `lib/types.ts`.
- **Revisión humana:** Se detectó incompatibilidad de `export const dynamic = "force-dynamic"` con `cacheComponents: true` de Next.js 16 / Turbopack; se corrigió eliminando la exportación redundante para mantener el comportamiento dinámico nativo. Se ajustó el mapper para tolerar columnas `title`/`name` en `events`.
- **Commit:** `feat(db): clientes supabase, mappers y endpoints places/events` (61425d3) y `fix(db): soporte para columna title en events mapper` (b60eb53).

### 16:50 · Datos semilla de la demo (seed.sql)

- **Herramienta:** Antigravity (Gemini 3.8 Flash)
- **Objetivo:** Crear el script de datos semilla para la demo en `supabase/seed.sql`.
- **Prompt (resumen):** Borrar datos temporales (`QA_TEST%`), insertar 12 lugares emblemáticos del Centro Histórico de Veracruz, 6 comercios ficticios (al menos 2 nocturnos), 4 eventos con zona horaria local, 3 misiones (una con bono nocturno), 3 recompensas, generación de QR tokens para cada lugar y perfiles demo.
- **Resultado:** Archivo `supabase/seed.sql` listo y probado contra la base de datos de Supabase.
- **Revisión humana:** Se validó la compatibilidad con el esquema real de Supabase (tablas `places`, `businesses`, `events`, `missions`, `rewards`, `qr_tokens`, `profiles`), garantizando sintaxis válida para UUIDs hexadecimales y expresiones de fecha relativas a `America/Mexico_City`.
- **Commit:** `feat(db): datos semilla de la demo`.
