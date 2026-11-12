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

##### 16:14 · Lector QR con validación y modo demo

- **Herramienta:** Claude Code (Claude Opus 5.5)
- **Objetivo:** pantalla `/escanear` que lea el QR del lugar con la cámara trasera, valide la visita en el servidor y muestre los puntos; con respaldo de demo y captura manual si no hay cámara.
- **Prompt (resumen):** «Crea app/escanear/page.tsx con html5-qrcode (cámara trasera, solo cliente), que acepte el token solo o la URL `/escanear?t=`, llame POST /api/visits/validate con mock si falla y muestre éxito, error o captura manual. Crea lib/qr/parse.ts y lib/qr/url.ts.»
- **Resultado:** `app/escanear/page.tsx` (estados inicio → escaneando → validando → éxito/error, más captura manual con instrucciones de permiso; usa `?t=` de la URL sin abrir la cámara); `lib/qr/parse.ts` (`extractToken`), `lib/qr/url.ts` (`buildQrUrl`), `lib/qr/validate.ts` (llamada al endpoint y regla de cuándo usar el mock), `lib/qr/mock.ts` (`ValidateResponse` de ejemplo), `lib/qr/types.ts` (`ValidateResponse`, porque aún no existe en `lib/types.ts`); claves `es.qr` en `lib/i18n/es.ts`.
- **Revisión humana:** PENDIENTE: completar
- **Commit:** `d34f018` — feat(qr): lector QR con validación y modo demo

##### 18:20 · Página de QR imprimibles

- **Herramienta:** Claude Code (Claude Opus 5.5)
- **Objetivo:** página `/admin/qr` con una tarjeta imprimible por lugar (nombre, categoría, QR grande con la URL `…/escanear?t=<token>` y el lema), lista para imprimir 2 por hoja carta.
- **Prompt (resumen):** «Crea app/(panel)/admin/qr/page.tsx que lea GET /api/qr-tokens (mock si no existe), genere cada QR con `qrcode` y `buildQrUrl(token, window.location.origin)`, con botón Imprimir y CSS @media print a 2 tarjetas por hoja carta.»
- **Resultado:** `app/(panel)/admin/qr/page.tsx` (carga, error con reintento, aviso «modo demo», tarjetas y CSS de impresión que oculta la navegación y los botones); `lib/qr/tokens.ts` (`fetchQrTarjetas`, con la misma regla de mock que `validate.ts`); `mockQrTarjetas()` en `lib/qr/mock.ts` (tokens `demo-…` que se imprimen con la marca DEMO); tipo `QrTarjeta` en `lib/qr/types.ts`; textos `es.qrAdmin`. Verificado con Chrome headless: 4 tarjetas → PDF de 2 hojas carta. `GET /api/qr-tokens` queda pendiente para el integrante 3.
- **Revisión humana:** PENDIENTE: completar
- **Commit:** feat(qr): página de QR imprimibles

### Bitácora de IA — Integrante 3 (Backend, base de datos y seguridad)

##### 15:35 · Clientes Supabase, mappers y endpoints places/events

- **Herramienta:** Antigravity (Gemini 3.8 Flash)
- **Objetivo:** Configurar clientes de Supabase (admin y browser), mappers con normalización snake_case → camelCase, y crear los endpoints `GET /api/places` y `GET /api/events`.
- **Prompt (resumen):** Crear `lib/db/server.ts`, `lib/db/browser.ts`, `lib/db/mappers.ts`, `app/api/places/route.ts` y `app/api/events/route.ts` con zona `America/Mexico_City`, compilar y subir a `feat/backend`.
- **Resultado:** `lib/db/server.ts`, `lib/db/browser.ts`, `lib/db/mappers.ts`, `app/api/places/route.ts`, `app/api/events/route.ts` y actualización de tipos en `lib/types.ts`.
- **Revisión humana:** Se detectó incompatibilidad de `export const dynamic = "force-dynamic"` con `cacheComponents: true` de Next.js 16 / Turbopack; se corrigió eliminando la exportación redundante para mantener el comportamiento dinámico nativo. Se ajustó el mapper para tolerar columnas `title`/`name` en `events`.
- **Commit:** `feat(db): clientes supabase, mappers y endpoints places/events` (61425d3) y `fix(db): soporte para columna title en events mapper` (b60eb53).

##### 16:50 · Datos semilla de la demo (seed.sql)

- **Herramienta:** Antigravity (Gemini 3.8 Flash)
- **Objetivo:** Crear el script de datos semilla para la demo en `supabase/seed.sql`.
- **Prompt (resumen):** Borrar datos temporales (`QA_TEST%`), insertar 12 lugares emblemáticos del Centro Histórico de Veracruz, 6 comercios ficticios (al menos 2 nocturnos), 4 eventos con zona horaria local, 3 misiones (una con bono nocturno), 3 recompensas, generación de QR tokens para cada lugar y perfiles demo.
- **Resultado:** Archivo `supabase/seed.sql` listo y probado contra la base de datos de Supabase.
- **Revisión humana:** Se validó la compatibilidad con el esquema real de Supabase (tablas `places`, `businesses`, `events`, `missions`, `rewards`, `qr_tokens`, `profiles`), garantizando sintaxis válida para UUIDs hexadecimales y expresiones de fecha relativas a `America/Mexico_City`.
- **Commit:** `feat(db): datos semilla de la demo`.

##### 18:34 · Endpoints críticos y schema.sql

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

### Bitácora de IA — Integrante 4 (Motor de recomendación e IA)

##### 15:04 · Motor de recomendación: puntuación, ruta y motivos

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** Puntuar cada lugar con la fórmula de la sección 8 del CONTEXTO.md, ordenar las paradas y explicar en español por qué se recomienda cada una.
- **Prompt (resumen):** «Soy el integrante 4 (feat/motor-ia). Implementa lib/engine/score.ts y lib/engine/route.ts según la sección 8, con pesos de config.ts, y 5 pruebas en lib/engine/__tests__ con Vitest.»
- **Resultado:** `lib/engine/config.ts` (los 6 pesos y las constantes: 80 m/min, radio 1500 m, eventos 600 m, bono desde las 19:00), `geo.ts` (haversine), `place.ts` (normaliza horario, precio, tiempo de visita y oportunidad), `score.ts` (puntuación con desglose explicable) y `route.ts` (filtros → orden → vecino más cercano → eventos → motivo legible); 20 pruebas. Se adaptó a que el `lib/types.ts` real es más escueto que el CONTEXTO.md: los datos opcionales se leen de `meta` y se definieron tipos internos extendidos, sin tocar el archivo de I3.
- **Revisión humana:** Se contrastó la fórmula con la sección 8 y se ajustó el peso de salto de ruta, que hacía que la ruta siempre eligiera lo más cercano y se perdieran las paradas con más afinidad. La ruta se probó a mano con tres combinaciones de intereses y presupuesto.
- **Commit:** `b0aca18` — feat(motor): agrega motor de recomendacion con pesos y pruebas

##### 15:08 · IA: redacción con Gemini y texto de respaldo

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** Redactar el texto de la misión y el «por qué te lo recomendamos» con Gemini, sin que una falla de la IA pueda tumbar la demo.
- **Prompt (resumen):** «Implementa lib/ai (cliente de Gemini, prompts) y app/api/ai/mission con tiempo límite de 5 s y plantilla de respaldo si la IA falla. El prompt prohíbe inventar horarios, precios, eventos o disponibilidad.»
- **Resultado:** `lib/ai/config.ts` (instrucción de no inventar datos), `gemini.ts` (timeout de 5 s y parseo del JSON aunque venga en bloque de código), `fallback.ts` (plantillas con el mismo contrato `text`/`why`) y `app/api/ai/mission/route.ts` (zod + `GET /api/places` → `{ text, why, source }`); 8 pruebas. `flags.ia` permite apagar el modelo y dejar solo las plantillas, que es el primer recorte del Plan B.
- **Revisión humana:** Se probaron los tres caminos (con clave, sin clave y con respuesta rota) y en los tres la respuesta llega igual y nunca sale un 500. El prompt obliga a marcar «por confirmar» cuando el horario no está verificado.
- **Commit:** `09937b6` — feat(ia): agrega endpoint de redaccion con Gemini y texto de respaldo · `32f8bca` — feat(ia): respeta el interruptor flags.ia en la redaccion

##### 16:23 · Catálogo de 12 lugares, 6 comercios y eventos

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** Convertir la lista de lugares y comercios del equipo en fichas que el motor pueda usar.
- **Prompt (resumen):** «Los datos de los 12 lugares y 6 comercios están en LISTA.md».
- **Resultado:** `lib/engine/datos-demo.ts` (12 lugares, 6 comercios, fichas `Business` y lista ampliada) y `lib/engine/datos-eventos.ts` (4 eventos de muestra). Criterio: `hours` en null y `verified` en false porque la lista no traía horarios y no se inventan; `priceLevel` como estimación marcada como no verificada; coordenadas marcadas como aproximadas. Se dejó en `lib/engine/` (carpeta de I4) para no invadir `lib/mock/` (de I1).
- **Revisión humana:** Se añadió una prueba que verifica que ningún lugar traiga horario inventado ni precio sin marcar, y se repasó cada nombre contra la lista.
- **Commit:** `7499aea` — feat(motor): agrega catalogo de 12 lugares y 6 comercios con eventos demo

##### 16:34 · Horarios semanales y compatibilidad con el backend

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** Usar los horarios oficiales de la lista, que cambiaban según el día, y entender las fichas tal como las devuelve el backend de I3.
- **Prompt (resumen):** «Revisa LISTA.md: la he actualizado la lista con horarios» y «El Integrante 3 ya subió /api/places y /api/events; adapta el motor a los campos nuevos de Place».
- **Resultado:** `place.ts` gana `meta.horarioSemanal` (por día ISO 8601; `null` es cerrado y un día ausente es «no se sabe»), `meta.estado` (`operativo`, `cerradoTemporalmente`, `cerradoAlPublico`) y `meta.horarioNota`; el motor filtra por el día real de la semana y la IA marca «por confirmar» lo no verificado. Además lee los campos directos de `Place` antes que `meta`. Con 6 pruebas nuevas y `backend-compat.test.ts`, que reproduce filas crudas de Supabase y las pasa por los mappers de I3.
- **Revisión humana:** Se verificó que el motor nunca descarta un lugar por no saber su horario: solo lo quita cuando hay un «cerrado» real, como el Baluarte o la Isla de Sacrificios. La primera versión de la prueba de compatibilidad usaba filas a medias y daba verde sin comprobar gran cosa; se rehízo con filas completas y ahí se detectó que el `priceLevel` del backend no llegaba al motor.
- **Commit:** `ad06fcc` — feat(motor): agrega horarios semanales oficiales al catalogo · `7611abd` — fix(motor): lee los campos nuevos de Place del backend y prueba compat

##### 16:42 · Endpoint POST /api/route

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** Crear el endpoint que convierte las preferencias del visitante en una ruta, que es lo que faltaba para dejar de usar datos de prueba.
- **Prompt (resumen):** «Crea el route, lo haremos en lugar de I3» (acuerdo del equipo, ya que `app/api/**` es de I3).
- **Resultado:** `app/api/route/route.ts` (zod, lectura de `places`/`events`/`missions`, llamada a `buildRoute` y respuesta `{ stops, origen }`), `__tests__/route.test.ts` (6 pruebas) y `vitest.config.mts` con el alias `@/`, que Vitest no resolvía. La cabecera del archivo anota que lo crea I4 por acuerdo y que debe pasar a la rama de I3 sin cambiar el contrato.
- **Revisión humana:** Se probó contra el servidor real con tres combinaciones de intereses y presupuesto: la respuesta trae las paradas ordenadas con distancia, tiempo y motivo. Con datos inválidos y con un cuerpo que no es JSON responde 400 con mensaje claro.
- **Commit:** `a0155b5` — feat(api): agrega POST /api/route con el motor y pruebas del endpoint

##### 17:11 · Corrección de coordenadas con OpenStreetMap

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** Corregir un error propio: el catálogo tenía las coordenadas de otra zona y la ruta entera quedaba a 80 km.
- **Prompt (resumen):** «Revisa LISTA.md otra vez y revisa las coordenadas» (al compararlo con el mock de I1 se vio la discrepancia).
- **Resultado:** Se comprobó con Nominatim, Overpass y Wikipedia que el Centro Histórico está en 19.20, -96.13, y que las coordenadas que había puesto (19.54, -96.91) eran de la zona de Xalapa. Se corrigieron los 38 lugares y los 4 eventos con datos verificados, y se añadieron 4 pruebas que blindan el error: el Zócalo en sus coordenadas reales, todo el núcleo a menos de 4 km del Zócalo, los destinos de fuera con `meta.fueraDelCentro` y el Zócalo a menos de 500 m de los Portales.
- **Revisión humana:** Fue el error más grande del trabajo y no se detectó porque el código fallara, sino al comparar con los datos de I1: las pruebas pasaban igual. A partir de ahí las distancias que calcula el motor son coherentes con el centro histórico real.
- **Commit:** `965ff80` — fix(motor): corrige coordenadas del catalogo con datos de OpenStreetMap

##### 17:27 · La base de datos como fuente principal

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** Que el seed de I3 sea la fuente de verdad y el catálogo quede solo como respaldo.
- **Prompt (resumen):** «Haremos la opción 2, la seed de I3 siempre quedará como la principal».
- **Resultado:** `app/api/route/adaptar.ts` traduce las filas del seed al motor sin tocar `lib/db/mappers.ts` (el seed guarda `events.title` donde el mapper lee `name`, y `missions.description`/`active` donde lee `rules`/`status`); el motor respeta `meta.abreDeNoche` y localiza el punto de referencia por palabra clave, para funcionar con «Zócalo de Veracruz (Plaza de Armas)». `/api/route` usa la base y cae al catálogo solo si no responde o está vacía, avisando en `origen`.
- **Revisión humana:** Al leer el seed se detectó que sus columnas y las del mapper no coinciden, lo que habría armado la ruta con nombres vacíos y sin misiones. Se corrigió desde el endpoint de I4 y se avisó a I3 para que lo ajuste en su rama. Con pruebas que reproducen las filas exactas del seed y sus 18 lugares.
- **Commit:** `4ffd5a4` — fix(motor): usa la base de datos como fuente principal y corrige la zona horaria

##### 18:21 · Zona horaria: el servidor en UTC, la demo en Veracruz

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** Corregir un error que solo habría aparecido en producción y hacer que las pruebas no dependan de la zona del servidor.
- **Prompt (resumen):** «Revisa el merge antes de continuar» y «Revisa el merge y después continuamos».
- **Resultado:** `lib/engine/zona-horaria.ts` calcula hora y día de la semana con `Intl` en `America/Mexico_City` y añade `instanteEnZona()` para convertir una hora de reloj al instante correcto; el motor dejó de usar `getHours()`. Además, todas las fechas de las pruebas llevan el offset explícito de Veracruz (`-06:00`) y se añadió `independencia-zona.test.ts`, que lanza la suite del motor en subprocesos con UTC, Veracruz y Tokio.
- **Revisión humana:** El bug era real y silencioso: en el portátil todo funcionaba, pero en Vercel (UTC) el evento de las 18:00 caería a las 12:00 en Veracruz, el día se correría al anterior y el bono de «Centro de noche» se dispararía seis horas antes, justo a la hora de la comida. Al correr la suite con `TZ=UTC` fallaron 11 pruebas que en local pasaban; con el offset explícito la suite completa pasa en cinco zonas horarias distintas.
- **Commit:** `197726e` — fix(motor): corrige los horarios de respaldo para el servidor en UTC · `e748088` — test(motor): hace los tests del endpoint independientes de la zona horaria

##### 18:42 · Integración del backend de I3 y del panel de I5

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** Traer a `main` los endpoints, el esquema y los datos semilla de I3, y resolver el choque entre I3 e I5 por `/api/stats`.
- **Prompt (resumen):** «Actualiza la carpeta porque en el repositorio ya subió endpoints I3».
- **Resultado:** Entraron `/api/visits/validate`, `/api/missions/accept`, `/api/me/passport`, `/api/stats`, `supabase/schema.sql` y `supabase/seed.sql`, con el conflicto de `lib/qr/types.ts` resuelto a favor del tipo compartido. Se corrigieron tres cosas: `getAdminClient()` estaba fuera del `try` en dos endpoints y tumbaba el build sin `.env.local`; `/api/stats` se prerenderizaba y con `cacheComponents` de Next 16 se marcó con `connection()`; y la actividad por hora usaba la hora del servidor. Del choque de `/api/stats` se conservó la versión de I5, que es la que consume su panel `/admin` (pide `ExtendedStats` y refresca cada 5 s).
- **Revisión humana:** El `schema.sql` de I3 está completo (las diez tablas, RLS en todas, las políticas y la función `increment_points`), que era justo lo que faltaba para poder levantar la base de cero. Los tres arreglos son de la carpeta de I3, así que se le avisó para que los incorpore en su rama. El build ahora pasa con y sin variables de entorno, que es lo que garantiza que `main` no se rompa.
- **Commit:** `0662073` — merge(backend): integra endpoints de I3 con schema.sql y seed.sql · `cdd99df` — merge(paneles): integra cambios de I5 y resuelve /api/stats con la version del panel

### Bitácora de IA — Integrante 5 (Paneles de comercio y admin; pitch)

##### 14:55 · Fase 0: Identidad visual, 4 eventos de la demo y esqueleto del pitch

- **Herramienta:** Antigravity (Gemini 3.8 Flash)
- **Objetivo:** Definir la identidad visual (paleta veracruzana: verde mar, ámbar sol, rojo pulso), seleccionar los 4 eventos clave de la demo y redactar el guion del pitch de 3 minutos en 7 bloques cronometrados.
- **Prompt (resumen):** «Define la paleta de colores y logo para Pulso Jarocho, los 4 eventos de la demo (uno nocturno para Centro de noche) y el guion del pitch de 3 minutos con el momento memorable del jurado.»
- **Resultado:** `docs/pitch/guion-pitch.md` con los 7 bloques del pitch, paleta cromática, 4 eventos demo (Plazuela de la Campana, Malecón nocturno, Ruta del café, Mercado Hidalgo) y 3 respuestas a preguntas del jurado.
- **Revisión humana:** Se confirmó la concordancia con el límite de 3 minutos y se validó que el momento memorable del jurado estuviera colocado en el minuto 2:25.
- **Commit:** `feat(pitch): guion de 3 minutos en 7 bloques y eventos demo`

---

##### 15:45 · Fase 1a: Layout de /admin con tarjetas KPI y gráficas Recharts

- **Herramienta:** Antigravity (Gemini 3.8 Flash)
- **Objetivo:** Construir el panel de administración (`/admin`) con tarjetas KPI de afluencia digital, gráfica de escaneos por lugar y gráfica de brecha de horario (actividad vs comercios abiertos) usando Recharts y datos acordes al tipo `Stats`.
- **Prompt (resumen):** «Crea app/(panel)/admin con tarjetas KPI, gráfica de escaneos por lugar y gráfica de actividad por hora vs comercios abiertos con Recharts. Mobile-first y respetando la regla 9 de métricas como actividad registrada.»
- **Resultado:** `app/(panel)/layout.tsx`, `app/(panel)/admin/page.tsx`, `components/paneles/KpiCard.tsx`, `components/paneles/ScansByPlaceChart.tsx`, `components/paneles/ActivityByHourChart.tsx`, `components/paneles/LiveVisitsFeed.tsx`, `components/paneles/mock-data.ts`; claves en `lib/i18n/es.ts`.
- **Revisión humana:** Se verificó el aviso metodológico en la parte superior y se probó la visualización de la brecha nocturna a partir de las 19:00 hrs.
- **Commit:** `feat(admin): layout con tarjetas KPI y graficas Recharts de afluencia`

---

##### 16:18 · Fase 1b: Panel de /comercio con vitrina digital, canjes y 2 gráficas

- **Herramienta:** Antigravity (Gemini 3.8 Flash)
- **Objetivo:** Construir el panel de comercio (`/comercio`) con vitrina comercial (Gran Café de la Parroquia y selector de comercios), gestión de promociones, confirmación interactiva de canjes, modal de publicación rápida de eventos y 2 gráficas Recharts (visitas por hora y embudo de conversión).
- **Prompt (resumen):** «Crea app/(panel)/comercio con ficha de vitrina digital, confirmación de canjes, promociones y 2 gráficas Recharts (visitas y conversión).»
- **Resultado:** `app/(panel)/comercio/page.tsx`, `components/paneles/ComercioFicha.tsx`, `components/paneles/ComercioPromos.tsx`, `components/paneles/ComercioCanjesList.tsx`, `components/paneles/ComercioHourlyChart.tsx`, `components/paneles/ComercioConversionChart.tsx`, `components/paneles/PublishEventModal.tsx`, `docs/explicaciones/paneles.md`.
- **Revisión humana:** Se probó el botón interactivo de confirmación de canje presencial y la selección entre distintos comercios de prueba.
- **Commit:** `feat(comercio): vitrina digital, gestion de canjes y graficas comerciales`

---

##### 17:40 · Fase 2a: Conexión de formulario de eventos y confirmación de canjes

- **Herramienta:** Antigravity (Gemini 3.8 Flash)
- **Objetivo:** Conectar el modal de eventos comerciales con `POST /api/events` para que los eventos propuestos por el comercio viajen al backend («por confirmar») y conectar la confirmación de canjes con `POST /api/redemptions/confirm`.
- **Prompt (resumen):** «Conecta PublishEventModal a POST /api/events y ComercioCanjesList a POST /api/redemptions/confirm con manejo de errores y fallback a modo demo.»
- **Resultado:** `components/paneles/PublishEventModal.tsx` conectado a `/api/events`, `components/paneles/ComercioCanjesList.tsx` conectado a `/api/redemptions/confirm`.
- **Revisión humana:** Se verificó que el estado de los canjes se actualice visualmente al instante y que los eventos enviados muestren la insignia de estado «Por confirmar».
- **Commit:** `feat(paneles): conexion de eventos y canjes con fallback resiliente`

---

##### 18:25 · Fase 2b: Polling en vivo en /admin cada 5 s y borrador de diapositivas

- **Herramienta:** Antigravity (Gemini 3.8 Flash)
- **Objetivo:** Implementar la actualización periódica en vivo del tablero de administración (`GET /api/stats` cada 5 s) para cumplir la regla del momento memorable del jurado (< 10 s), y redactar el borrador completo de diapositivas del pitch.
- **Prompt (resumen):** «Agrega polling en vivo cada 5 s en app/(panel)/admin/page.tsx consultando GET /api/stats con fallback graceful y crea docs/pitch/diapositivas.md con las 8 diapositivas de la demo.»
- **Resultado:** `app/(panel)/admin/page.tsx` con polling cada 5 segundos y toggle de pausar/reanudar; `docs/pitch/diapositivas.md` con 8 diapositivas detalladas (problema, solución, algoritmo, demo en vivo con jurado, brecha de horario, modelo de negocio y cierre).
- **Revisión humana:** Se validó que el polling no genere parpadeos en pantalla y que la latencia visual del feed sea inferior a 5 segundos.
- **Commit:** `feat(paneles): polling en vivo cada 5s en admin y diapositivas del pitch`

<!-- BITACORA:FIN -->

## Puntos de control

| Corte | Hora | Commit | Qué incluye |
| ----- | ---- | ------ | ----------- |
| CP1   |      |        |             |
| CP2   |      |        |             |
