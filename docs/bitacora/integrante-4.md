# Bitácora de IA — Integrante 4 (Motor de recomendación e IA)

### 15:04 · Motor de recomendación: puntuación, ruta y motivos

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** Puntuar cada lugar con la fórmula de la sección 8 del CONTEXTO.md, ordenar las paradas y explicar en español por qué se recomienda cada una.
- **Prompt (resumen):** «Soy el integrante 4 (feat/motor-ia). Implementa lib/engine/score.ts y lib/engine/route.ts según la sección 8, con pesos de config.ts, y 5 pruebas en lib/engine/__tests__ con Vitest.»
- **Resultado:** `lib/engine/config.ts` (los 6 pesos y las constantes: 80 m/min, radio 1500 m, eventos 600 m, bono desde las 19:00), `geo.ts` (haversine), `place.ts` (normaliza horario, precio, tiempo de visita y oportunidad), `score.ts` (puntuación con desglose explicable) y `route.ts` (filtros → orden → vecino más cercano → eventos → motivo legible); 20 pruebas. Se adaptó a que el `lib/types.ts` real es más escueto que el CONTEXTO.md: los datos opcionales se leen de `meta` y se definieron tipos internos extendidos, sin tocar el archivo de I3.
- **Revisión humana:** Se contrastó la fórmula con la sección 8 y se ajustó el peso de salto de ruta, que hacía que la ruta siempre eligiera lo más cercano y se perdieran las paradas con más afinidad. La ruta se probó a mano con tres combinaciones de intereses y presupuesto.
- **Commit:** `b0aca18` — feat(motor): agrega motor de recomendacion con pesos y pruebas

### 15:08 · IA: redacción con Gemini y texto de respaldo

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** Redactar el texto de la misión y el «por qué te lo recomendamos» con Gemini, sin que una falla de la IA pueda tumbar la demo.
- **Prompt (resumen):** «Implementa lib/ai (cliente de Gemini, prompts) y app/api/ai/mission con tiempo límite de 5 s y plantilla de respaldo si la IA falla. El prompt prohíbe inventar horarios, precios, eventos o disponibilidad.»
- **Resultado:** `lib/ai/config.ts` (instrucción de no inventar datos), `gemini.ts` (timeout de 5 s y parseo del JSON aunque venga en bloque de código), `fallback.ts` (plantillas con el mismo contrato `text`/`why`) y `app/api/ai/mission/route.ts` (zod + `GET /api/places` → `{ text, why, source }`); 8 pruebas. `flags.ia` permite apagar el modelo y dejar solo las plantillas, que es el primer recorte del Plan B.
- **Revisión humana:** Se probaron los tres caminos (con clave, sin clave y con respuesta rota) y en los tres la respuesta llega igual y nunca sale un 500. El prompt obliga a marcar «por confirmar» cuando el horario no está verificado.
- **Commit:** `09937b6` — feat(ia): agrega endpoint de redaccion con Gemini y texto de respaldo · `32f8bca` — feat(ia): respeta el interruptor flags.ia en la redaccion

### 16:23 · Catálogo de 12 lugares, 6 comercios y eventos

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** Convertir la lista de lugares y comercios del equipo en fichas que el motor pueda usar.
- **Prompt (resumen):** «Los datos de los 12 lugares y 6 comercios están en LISTA.md».
- **Resultado:** `lib/engine/datos-demo.ts` (12 lugares, 6 comercios, fichas `Business` y lista ampliada) y `lib/engine/datos-eventos.ts` (4 eventos de muestra). Criterio: `hours` en null y `verified` en false porque la lista no traía horarios y no se inventan; `priceLevel` como estimación marcada como no verificada; coordenadas marcadas como aproximadas. Se dejó en `lib/engine/` (carpeta de I4) para no invadir `lib/mock/` (de I1).
- **Revisión humana:** Se añadió una prueba que verifica que ningún lugar traiga horario inventado ni precio sin marcar, y se repasó cada nombre contra la lista.
- **Commit:** `7499aea` — feat(motor): agrega catalogo de 12 lugares y 6 comercios con eventos demo

### 16:34 · Horarios semanales y compatibilidad con el backend

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** Usar los horarios oficiales de la lista, que cambiaban según el día, y entender las fichas tal como las devuelve el backend de I3.
- **Prompt (resumen):** «Revisa LISTA.md: la he actualizado la lista con horarios» y «El Integrante 3 ya subió /api/places y /api/events; adapta el motor a los campos nuevos de Place».
- **Resultado:** `place.ts` gana `meta.horarioSemanal` (por día ISO 8601; `null` es cerrado y un día ausente es «no se sabe»), `meta.estado` (`operativo`, `cerradoTemporalmente`, `cerradoAlPublico`) y `meta.horarioNota`; el motor filtra por el día real de la semana y la IA marca «por confirmar» lo no verificado. Además lee los campos directos de `Place` antes que `meta`. Con 6 pruebas nuevas y `backend-compat.test.ts`, que reproduce filas crudas de Supabase y las pasa por los mappers de I3.
- **Revisión humana:** Se verificó que el motor nunca descarta un lugar por no saber su horario: solo lo quita cuando hay un «cerrado» real, como el Baluarte o la Isla de Sacrificios. La primera versión de la prueba de compatibilidad usaba filas a medias y daba verde sin comprobar gran cosa; se rehízo con filas completas y ahí se detectó que el `priceLevel` del backend no llegaba al motor.
- **Commit:** `ad06fcc` — feat(motor): agrega horarios semanales oficiales al catalogo · `7611abd` — fix(motor): lee los campos nuevos de Place del backend y prueba compat

### 16:42 · Endpoint POST /api/route

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** Crear el endpoint que convierte las preferencias del visitante en una ruta, que es lo que faltaba para dejar de usar datos de prueba.
- **Prompt (resumen):** «Crea el route, lo haremos en lugar de I3» (acuerdo del equipo, ya que `app/api/**` es de I3).
- **Resultado:** `app/api/route/route.ts` (zod, lectura de `places`/`events`/`missions`, llamada a `buildRoute` y respuesta `{ stops, origen }`), `__tests__/route.test.ts` (6 pruebas) y `vitest.config.mts` con el alias `@/`, que Vitest no resolvía. La cabecera del archivo anota que lo crea I4 por acuerdo y que debe pasar a la rama de I3 sin cambiar el contrato.
- **Revisión humana:** Se probó contra el servidor real con tres combinaciones de intereses y presupuesto: la respuesta trae las paradas ordenadas con distancia, tiempo y motivo. Con datos inválidos y con un cuerpo que no es JSON responde 400 con mensaje claro.
- **Commit:** `a0155b5` — feat(api): agrega POST /api/route con el motor y pruebas del endpoint

### 17:11 · Corrección de coordenadas con OpenStreetMap

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** Corregir un error propio: el catálogo tenía las coordenadas de otra zona y la ruta entera quedaba a 80 km.
- **Prompt (resumen):** «Revisa LISTA.md otra vez y revisa las coordenadas» (al compararlo con el mock de I1 se vio la discrepancia).
- **Resultado:** Se comprobó con Nominatim, Overpass y Wikipedia que el Centro Histórico está en 19.20, -96.13, y que las coordenadas que había puesto (19.54, -96.91) eran de la zona de Xalapa. Se corrigieron los 38 lugares y los 4 eventos con datos verificados, y se añadieron 4 pruebas que blindan el error: el Zócalo en sus coordenadas reales, todo el núcleo a menos de 4 km del Zócalo, los destinos de fuera con `meta.fueraDelCentro` y el Zócalo a menos de 500 m de los Portales.
- **Revisión humana:** Fue el error más grande del trabajo y no se detectó porque el código fallara, sino al comparar con los datos de I1: las pruebas pasaban igual. A partir de ahí las distancias que calcula el motor son coherentes con el centro histórico real.
- **Commit:** `965ff80` — fix(motor): corrige coordenadas del catalogo con datos de OpenStreetMap

### 17:27 · La base de datos como fuente principal

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** Que el seed de I3 sea la fuente de verdad y el catálogo quede solo como respaldo.
- **Prompt (resumen):** «Haremos la opción 2, la seed de I3 siempre quedará como la principal».
- **Resultado:** `app/api/route/adaptar.ts` traduce las filas del seed al motor sin tocar `lib/db/mappers.ts` (el seed guarda `events.title` donde el mapper lee `name`, y `missions.description`/`active` donde lee `rules`/`status`); el motor respeta `meta.abreDeNoche` y localiza el punto de referencia por palabra clave, para funcionar con «Zócalo de Veracruz (Plaza de Armas)». `/api/route` usa la base y cae al catálogo solo si no responde o está vacía, avisando en `origen`.
- **Revisión humana:** Al leer el seed se detectó que sus columnas y las del mapper no coinciden, lo que habría armado la ruta con nombres vacíos y sin misiones. Se corrigió desde el endpoint de I4 y se avisó a I3 para que lo ajuste en su rama. Con pruebas que reproducen las filas exactas del seed y sus 18 lugares.
- **Commit:** `4ffd5a4` — fix(motor): usa la base de datos como fuente principal y corrige la zona horaria

### 18:21 · Zona horaria: el servidor en UTC, la demo en Veracruz

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** Corregir un error que solo habría aparecido en producción y hacer que las pruebas no dependan de la zona del servidor.
- **Prompt (resumen):** «Revisa el merge antes de continuar» y «Revisa el merge y después continuamos».
- **Resultado:** `lib/engine/zona-horaria.ts` calcula hora y día de la semana con `Intl` en `America/Mexico_City` y añade `instanteEnZona()` para convertir una hora de reloj al instante correcto; el motor dejó de usar `getHours()`. Además, todas las fechas de las pruebas llevan el offset explícito de Veracruz (`-06:00`) y se añadió `independencia-zona.test.ts`, que lanza la suite del motor en subprocesos con UTC, Veracruz y Tokio.
- **Revisión humana:** El bug era real y silencioso: en el portátil todo funcionaba, pero en Vercel (UTC) el evento de las 18:00 caería a las 12:00 en Veracruz, el día se correría al anterior y el bono de «Centro de noche» se dispararía seis horas antes, justo a la hora de la comida. Al correr la suite con `TZ=UTC` fallaron 11 pruebas que en local pasaban; con el offset explícito la suite completa pasa en cinco zonas horarias distintas.
- **Commit:** `197726e` — fix(motor): corrige los horarios de respaldo para el servidor en UTC · `e748088` — test(motor): hace los tests del endpoint independientes de la zona horaria

### 18:42 · Integración del backend de I3 y del panel de I5

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** Traer a `main` los endpoints, el esquema y los datos semilla de I3, y resolver el choque entre I3 e I5 por `/api/stats`.
- **Prompt (resumen):** «Actualiza la carpeta porque en el repositorio ya subió endpoints I3».
- **Resultado:** Entraron `/api/visits/validate`, `/api/missions/accept`, `/api/me/passport`, `/api/stats`, `supabase/schema.sql` y `supabase/seed.sql`, con el conflicto de `lib/qr/types.ts` resuelto a favor del tipo compartido. Se corrigieron tres cosas: `getAdminClient()` estaba fuera del `try` en dos endpoints y tumbaba el build sin `.env.local`; `/api/stats` se prerenderizaba y con `cacheComponents` de Next 16 se marcó con `connection()`; y la actividad por hora usaba la hora del servidor. Del choque de `/api/stats` se conservó la versión de I5, que es la que consume su panel `/admin` (pide `ExtendedStats` y refresca cada 5 s).
- **Revisión humana:** El `schema.sql` de I3 está completo (las diez tablas, RLS en todas, las políticas y la función `increment_points`), que era justo lo que faltaba para poder levantar la base de cero. Los tres arreglos son de la carpeta de I3, así que se le avisó para que los incorpore en su rama. El build ahora pasa con y sin variables de entorno, que es lo que garantiza que `main` no se rompa.
- **Commit:** `0662073` — merge(backend): integra endpoints de I3 con schema.sql y seed.sql · `cdd99df` — merge(paneles): integra cambios de I5 y resuelve /api/stats con la version del panel
