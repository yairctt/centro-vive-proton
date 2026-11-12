# Bitácora de IA — Integrante 4 (Motor de recomendación e IA)

### 15:04 · Motor de recomendación: pesos, puntuación y pruebas

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** el motor que decide la ruta: puntuar cada lugar con la fórmula acordada, explicarla y probarla.
- **Prompt (resumen):** «Soy el integrante 4 (feat/motor-ia). Implementa lib/engine/score.ts y lib/engine/route.ts según la sección 8, con pesos de config.ts, y 5 pruebas en lib/engine/__tests__ con Vitest.»
- **Resultado:** `lib/engine/config.ts` (los 6 pesos de la fórmula y las constantes de negocio: 80 m/min, radio de cercanía 1500 m, eventos 600 m, bono desde las 19:00, tope de paradas); `lib/engine/geo.ts` (haversine y minutos de caminata); `lib/engine/place.ts` (normaliza la ficha: horario, precio, tiempo de visita y oportunidad, leyendo el campo directo de `Place`, luego `meta`, luego el texto de `hours`); `lib/engine/score.ts` (la puntuación con desglose para poder explicarla); `lib/engine/route.ts` (filtros → orden por puntuación → recorrido con vecino más cercano → eventos que caben en la ventana → motivo legible de cada parada); `lib/engine/index.ts` como punto de entrada. 20 pruebas en 3 archivos. Adaptación necesaria: el `lib/types.ts` real es más escueto que el CONTEXTO.md, así que los datos opcionales se leen de `meta` y se definen tipos internos extendidos sin tocar el archivo del Integrante 3.
- **Revisión humana:** PENDIENTE: completar
- **Commit:** `b0aca18` — feat(motor): agrega motor de recomendacion con pesos y pruebas

### 15:08 · Capa de IA: Gemini con texto de respaldo

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** que la IA redacte el texto de la misión y el «por qué te lo recomendamos» sin que la demo pueda romperse.
- **Prompt (resumen):** «Implementa lib/ai (cliente de Gemini, prompts) y app/api/ai/mission con tiempo límite de 5 s y plantilla de respaldo si la IA falla. El prompt prohíbe inventar horarios, precios, eventos o disponibilidad.»
- **Resultado:** `lib/ai/config.ts` (modelo e instrucción explícita de no inventar datos); `lib/ai/gemini.ts` (cliente de `@google/genai`, timeout de 5 s con `Promise.race`, parseo del JSON aunque venga envuelto en ```` ```json ````, y cualquier fallo devuelve la plantilla); `lib/ai/fallback.ts` (plantillas con el mismo contrato `{ text, why }`); `app/api/ai/mission/route.ts` (valida con zod, busca la ficha en `GET /api/places` y devuelve `{ text, why, source }`); 8 pruebas.
- **Revisión humana:** PENDIENTE: completar
- **Commit:** `09937b6` — feat(ia): agrega endpoint de redaccion con Gemini y texto de respaldo

### 15:10 · Interruptor de la IA

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** poder apagar la IA con una bandera sin tocar el código, por si el Plan B del CP2 aprieta.
- **Prompt (resumen):** «Haz que lib/ai respete flags.ia de lib/flags.ts; si la IA está apagada, manda siempre la plantilla.»
- **Resultado:** `lib/ai/gemini.ts` lee `flags.ia` (archivo compartido, solo lectura) y salta la llamada a Gemini cuando la bandera está apagada. La variable `GEMINI_API_KEY` solo se usa en el servidor.
- **Revisión humana:** PENDIENTE: completar
- **Commit:** `32f8bca` — feat(ia): respeta el interruptor flags.ia en la redaccion

### 16:23 · Catálogo de 12 lugares y 6 comercios con eventos de demostración

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** los datos semilla del equipo, convertidos en fichas que el motor pueda usar.
- **Prompt (resumen):** «Los datos de los 12 lugares y 6 comercios están en LISTA.md» (lista del equipo con horarios oficiales actualizados más adelante).
- **Resultado:** `lib/engine/datos-demo.ts` con los 12 lugares, los 6 comercios, las fichas de negocio (`Business`) y la lista ampliada; `lib/engine/datos-eventos.ts` con 4 eventos de muestra. Criterios: `hours` en null y `verified` en false porque la lista no traía horarios y no se inventan; `meta.priceLevel` como estimación operativa marcada `precioVerificado: false`; coordenadas marcadas como aproximadas. Nota de propiedad: el archivo se quedó en `lib/engine/` (mi carpeta) para no invadir `lib/mock/`, que es del Integrante 1.
- **Revisión humana:** PENDIENTE: completar
- **Commit:** `7499aea` — feat(motor): agrega catalogo de 12 lugares y 6 comercios con eventos demo

### 16:24 · Compatibilidad con los campos nuevos del backend

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** que el motor entendiera las fichas tal como las devuelve el backend del Integrante 3.
- **Prompt (resumen):** «El Integrante 3 ya subió /api/places y /api/events con el mapper de lib/db; adapta el motor a los campos nuevos de Place.»
- **Resultado:** `lib/engine/place.ts` ahora lee los campos directos de `Place` (`opensAt`, `closesAt`, `avgVisitMin`, `priceLevel`, `opportunity`) antes que `meta`, y `lib/engine/__tests__/backend-compat.test.ts` reproduce filas crudas de Supabase, las pasa por `toPlace`/`toEvent` y comprueba que el motor las interpreta bien.
- **Revisión humana:** PENDIENTE: completar
- **Commit:** `7611abd` — fix(motor): lee los campos nuevos de Place del backend y prueba compat

### 16:34 · Horarios semanales oficiales

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** usar los horarios oficiales que el equipo puso en la lista, que cambiaban por día de la semana.
- **Prompt (resumen):** «Revisa LISTA.md: la he actualizado la lista con horarios» (el Zócalo y el Malecón 24 h; el Museo Naval y el Fuerte de Ulúa cerrados los lunes; el Acuario cierra más tarde el fin de semana; el Mercado Hidalgo cierra antes los domingos; el Tianguis solo fines de semana; el Baluarte cerrado por restauración; la Isla de Sacrificios cerrada al público).
- **Resultado:** `lib/engine/place.ts` gana el horario semanal (`meta.horarioSemanal`, por día ISO 8601; un día con `null` es cerrado y un día ausente es «no se sabe»), el estado del lugar (`operativo`, `cerradoTemporalmente`, `cerradoAlPublico`) y la salvedad `meta.horarioNota` para los horarios variables; el motor filtra por el día real de la semana y la IA marca «por confirmar» cuando el horario no está verificado. 6 pruebas nuevas.
- **Revisión humana:** PENDIENTE: completar
- **Commit:** `ad06fcc` — feat(motor): agrega horarios semanales oficiales al catalogo

### 16:42 · Endpoint POST /api/route

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** el endpoint que convierte las preferencias del visitante en una ruta, que es lo que la app necesita para dejar de usar datos de prueba.
- **Prompt (resumen):** «Crea el route, lo haremos en lugar de I3» (acuerdo del equipo, ya que `app/api/**` es del Integrante 3).
- **Resultado:** `app/api/route/route.ts` (valida con zod, lee `places`, `events` y `missions` con el cliente de Supabase, y llama a `buildRoute`; devuelve `{ stops, origen }`) con `app/api/route/__tests__/route.test.ts` (6 pruebas) y `vitest.config.mts` con el alias `@/` que Vitest no resolvía. La cabecera del archivo deja anotado que lo crea el Integrante 4 por acuerdo y que debe pasar a la rama del Integrante 3 sin cambiar el contrato.
- **Revisión humana:** PENDIENTE: completar
- **Commit:** `a0155b5` — feat(api): agrega POST /api/route con el motor y pruebas del endpoint

### 17:11 · Coordenadas verificadas en OpenStreetMap

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** corregir un error propio: el catálogo tenía las coordenadas de otra zona y la ruta entera quedaba a 80 km.
- **Prompt (resumen):** «Revisa LISTA.md otra vez y revisa las coordenadas» (al comparar con el mock del Integrante 1 se vio la discrepancia).
- **Resultado:** se comprobó con Nominatim, Overpass y Wikipedia que el Centro Histórico de Veracruz está en ~19.20, -96.13 (las coordenadas del catálogo, ~19.54/-96.91, eran de la zona de Xalapa) y se corrigieron los 38 lugares y los 4 eventos con datos verificados. Se añadieron 4 pruebas que blindan el error: el Zócalo en sus coordenadas reales, todos los lugares del núcleo a menos de 4 km del Zócalo, los destinos fuera del centro con `meta.fueraDelCentro`, y el Zócalo y los Portales a menos de 500 m entre sí.
- **Revisión humana:** PENDIENTE: completar
- **Commit:** `965ff80` — fix(motor): corrige coordenadas del catalogo con datos de OpenStreetMap

### 17:27 · La base de datos como fuente principal

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** que el seed del Integrante 3 sea la fuente de verdad y que el catálogo quede solo como respaldo.
- **Prompt (resumen):** «Haremos la opción 2, la seed de I3 siempre quedará como la principal» (decisión del equipo tras detectar incompatibilidades entre el seed y el mapper).
- **Resultado:** `app/api/route/adaptar.ts` traduce las filas del seed al motor sin tocar `lib/db/mappers.ts` (el seed guarda `events.title` donde el mapper lee `name`, y `missions.description`/`active` donde el mapper lee `rules`/`status`); el motor respeta `meta.abreDeNoche` del seed y localiza el punto de referencia por palabra clave para que funcione con «Zócalo de Veracruz (Plaza de Armas)»; `app/api/route/route.ts` usa la base y cae al catálogo solo si no responde o está vacía, avisando en `origen`. Pruebas que reproducen las filas exactas del seed y sus 18 lugares completos.
- **Revisión humana:** PENDIENTE: completar
- **Commit:** `4ffd5a4` — fix(motor): usa la base de datos como fuente principal y corrige la zona horaria

### 18:21 · Zona horaria: el servidor corre en UTC, la demo es en Veracruz

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** corregir un error silencioso que solo aparecería en producción.
- **Prompt (resumen):** «Revisa el merge antes de continuar» (la revisión detectó que `getHours()` usaba la hora del servidor).
- **Resultado:** `lib/engine/zona-horaria.ts` (calcula hora y día de la semana con `Intl` en `America/Mexico_City`, y `instanteEnZona()` convierte una hora de reloj de Veracruz al instante absoluto correcto); el motor dejó de usar `getHours()`. El bug era real: en Vercel (UTC) el evento de las 18:00 caía a las 12:00 en Veracruz y el día se corría al anterior.
- **Revisión humana:** PENDIENTE: completar
- **Commit:** `197726e` — fix(motor): corrige los horarios de respaldo para el servidor en UTC

### 18:22 · Pruebas que no dependan de la zona del servidor

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** que la suite dé el mismo resultado en el portátil del equipo y en el servidor de Vercel.
- **Prompt (resumen):** «Revisa el merge y después continuamos» (al correr la suite con `TZ=UTC` fallaron 11 pruebas que en local pasaban).
- **Resultado:** todas las fechas de las pruebas pasaron a llevar el offset explícito de Veracruz (`-06:00`) y se añadió `lib/engine/__tests__/independencia-zona.test.ts`, que lanza la suite del motor en subprocesos con UTC, Veracruz y Tokio y exige que las tres pasen. La suite completa pasa en cinco zonas horarias distintas.
- **Revisión humana:** PENDIENTE: completar
- **Commit:** `e748088` — test(motor): hace los tests del endpoint independientes de la zona horaria

### 18:42 · Integración del backend del Integrante 3

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** traer a `main` los endpoints, el esquema y los datos semilla que subió el Integrante 3.
- **Prompt (resumen):** «Actualiza la carpeta porque en el repositorio ya subió endpoints I3».
- **Resultado:** se integraron `/api/visits/validate`, `/api/missions/accept`, `/api/me/passport`, `/api/stats`, `supabase/schema.sql` y `supabase/seed.sql`, resolviendo el conflicto de `lib/qr/types.ts` a favor del tipo compartido. Se corrigieron tres cosas que rompían el build o la demo: `getAdminClient()` estaba fuera del `try` en dos endpoints y tumbaba `npm run build` sin `.env.local`; `/api/stats` se prerenderizaba y con `cacheComponents` de Next 16 había que marcarlo con `connection()`; y la actividad por hora usaba la hora del servidor en vez de la de Veracruz.
- **Revisión humana:** PENDIENTE: completar
- **Commit:** `0662073` — merge(backend): integra endpoints de I3 con schema.sql y seed.sql

### 18:47 · Choque entre I3 e I5 por /api/stats

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** resolver el conflicto de una ruta que dos integrantes escribieron por separado.
- **Prompt (resumen):** «Actualiza la carpeta» (mientras se integraba, el Integrante 5 subió otra versión de `/api/stats`).
- **Resultado:** se conservó la versión del Integrante 5, que es la que consume su panel `/admin` (pide `ExtendedStats` y refresca cada 5 s); la del Integrante 3 habría roto ese panel. A esa versión se le añadieron el `connection()` y la corrección de la zona horaria.
- **Revisión humana:** PENDIENTE: completar
- **Commit:** `cdd99df` — merge(paneles): integra cambios de I5 y resuelve /api/stats con la version del panel
