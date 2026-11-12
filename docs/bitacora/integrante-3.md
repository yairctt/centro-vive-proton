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

### 18:34 · Endpoints críticos y schema.sql

- **Herramienta:** Antigravity (Gemini 2.5 Pro)
- **Objetivo:** Crear `supabase/schema.sql`, `POST /api/visits/validate`, `POST /api/missions/accept`, `GET /api/me/passport` y `GET /api/stats`. Commit de `seed.sql` que faltaba.
- **Prompt (resumen):** «Ruta crítica: Faltan commitear schema.sql/seed.sql y crear los endpoints: POST /api/visits/validate, POST /api/missions/accept, GET /api/me/passport y GET /api/stats.»
- **Resultado:** 5 archivos nuevos:
  - `supabase/schema.sql` — DDL completo con RLS y función `increment_points()`.
  - `app/api/visits/validate/route.ts` — valida token QR, registra visita, otorga puntos (cálculo servidor).
  - `app/api/missions/accept/route.ts` — inserta en `mission_accepts`, idempotente.
  - `app/api/me/passport/route.ts` — devuelve perfil + visitas + recompensas canjeables.
  - `app/api/stats/route.ts` — agrega actividad registrada en la app (scansByPlace, activityByHour, etc.).
- **Revisión humana:** Se corrigieron 4 errores TS: `ZodError.errors` → `.issues`, shape de `Stats.scansByPlace` (`placeName` no `name`) y `activityByHour` (`count` no `interactions`). Build confirmado en 0 errores.
- **Commit:** `feat(backend): schema.sql, validate, accept, passport y stats`

### 18:54 · Build de Vercel: rutas API dinámicas

- **Herramienta:** Claude Code (Claude Opus 5.5)
- **Objetivo:** Que el PR pase el build (fallaba al prerenderizar `/api/me/passport` sin variables de Supabase).
- **Prompt (resumen):** Log de Vercel con el error «Variables de entorno … son requeridas» al prerenderizar.
- **Resultado:** Con `cacheComponents` (Next 16) `export const dynamic` no evita el prerender; se usa `await connection()` en los GET. Se resolvió el conflicto de merge en `api/stats` y faltaba importar `connection`.
- **Revisión humana:** Pendiente — verificado con `npm run build` (todas las `/api/*` como `ƒ Dynamic`).
- **Commit:** `73b5544`, `669c0eb`

### 19:25 · QR imprimibles y confirmación de canjes

- **Herramienta:** Claude Code (Claude Opus 5.5)
- **Objetivo:** Crear `GET /api/qr-tokens` y `POST /api/redemptions/confirm`, y corregir la validación de ids.
- **Prompt (resumen):** «Faltan POST /api/redemptions/confirm y GET /api/qr-tokens.»
- **Resultado:** Un token activo por lugar con forma `QrTarjeta`; confirmación de canje solo por el comercio dueño, una sola vez, con descuento de puntos en el servidor. `z.string().uuid()` (zod 4) rechazaba los ids del seed → `z.guid()`.
- **Revisión humana:** Pendiente — probado contra Supabase con un canje temporal (200 → 409 al repetir) y limpieza posterior.
- **Commit:** `e2dfb14`, `fa4d2c3`

### 19:34 · Visitas con la base real, canjes y schema.sql

- **Herramienta:** Claude Code (Claude Opus 5.5)
- **Objetivo:** Revisar los pendientes del backend contra la base real.
- **Prompt (resumen):** «Sigamos con los pendientes.»
- **Resultado:** `visits` no tiene `points_awarded` → todo escaneo QR fallaba; ahora guarda `qr_token_id`. `stats` usa datos reales (canjes, misiones aceptadas). Nuevos `POST/GET /api/redemptions`. `schema.sql` igual a la base.
- **Revisión humana:** Pendiente — flujo completo probado (QR → puntos → tablero → pasaporte → canje → confirmación) y datos de prueba borrados.
- **Commit:** `c7d7936`

### 20:50 · Cuentas de usuario, recuperación de contraseña y acceso por rol

- **Herramienta:** Claude Code (Claude Opus 5.5)
- **Objetivo:** Registro, inicio de sesión, invitado, recuperación de contraseña y separar la app por rol (rama `feat/auth`).
- **Prompt (resumen):** «Registro de usuario para que cada quien tenga todo guardado, recuperar contraseña y dividir por rol: visitante (explorar, rutas, pasaporte), admin (panel) y comercio (QR imprimibles y panel).»
- **Resultado:** Supabase Auth con `@supabase/ssr`; `proxy.ts` por rol; páginas `/login`, `/registro`, `/recuperar`, `/restablecer`; APIs con el perfil de la sesión (ya no aceptan `profileId`); QR imprimibles movidos a `/comercio/qr` (solo los del comercio); pasaporte con datos reales y botón «Canjear»; `scripts/crear-cuenta.mjs` para cuentas de comercio/admin. Ver `docs/explicaciones/auth.md`.
- **Revisión humana:** Pendiente — verificado: build, redirecciones sin sesión y 401 en las APIs protegidas.
- **Commit:** `feat(auth): cuentas, recuperación de contraseña y acceso por rol`
