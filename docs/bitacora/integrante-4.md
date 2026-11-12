# Bitácora de IA — Integrante 4 (Motor de recomendación e IA)

### 15:04 · Motor de recomendación: puntuación, ruta y motivos

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** Puntuar cada lugar con la fórmula de la sección 8 del CONTEXTO.md, ordenar las paradas y explicar en español por qué se recomienda cada una.
- **Prompt (resumen):** «Soy el integrante 4 (feat/motor-ia). Implementa el motor de recomendación en `lib/engine/` según la sección 8 del CONTEXTO.md: los pesos viven en `config.ts`, la puntuación combina afinidad, cercanía, disponibilidad, ajuste al tiempo y oportunidad, y el recorrido se arma con vecino más cercano respetando los minutos que declara el visitante. Cada parada debe incluir su motivo legible. Cierra con al menos 5 pruebas en Vitest y verifica que `npm test` y `npm run build` pasan.»
- **Resultado:** `lib/engine/config.ts` (los 6 pesos y las constantes: 80 m/min, radio 1500 m, eventos 600 m, bono desde las 19:00), `geo.ts` (haversine), `place.ts` (normaliza horario, precio, tiempo de visita y oportunidad), `score.ts` (puntuación con desglose explicable) y `route.ts` (filtros → orden → vecino más cercano → eventos → motivo legible); 20 pruebas. Se adaptó a que el `lib/types.ts` real es más escueto que el CONTEXTO.md: los datos opcionales se leen de `meta` y se definieron tipos internos extendidos, sin tocar el archivo de I3.
- **Revisión humana:** Se contrastó la fórmula con la sección 8 y se ajustó el peso de salto de ruta, que hacía que la ruta siempre eligiera lo más cercano y se perdieran las paradas con más afinidad. La ruta se probó a mano con tres combinaciones de intereses y presupuesto.
- **Commit:** `b0aca18` — feat(motor): agrega motor de recomendacion con pesos y pruebas

### 15:08 · IA: redacción con Gemini y texto de respaldo

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** Redactar el texto de la misión y el «por qué te lo recomendamos» con Gemini, sin que una falla de la IA pueda tumbar la demo.
- **Prompt (resumen):** «Implementa la capa de IA del proyecto: `lib/ai/` con el cliente de Gemini, los prompts y una plantilla de respaldo, más el endpoint `POST /api/ai/mission`. El modelo solo redacta a partir de los datos registrados y el prompt debe prohibir explícitamente inventar horarios, precios, eventos o disponibilidad. La llamada tiene un límite de 5 segundos y, si falla o se pasa de tiempo, la plantilla responde con el mismo contrato para que la demo nunca se rompa.»
- **Resultado:** `lib/ai/config.ts` (instrucción de no inventar datos), `gemini.ts` (timeout de 5 s y parseo del JSON aunque venga en bloque de código), `fallback.ts` (plantillas con el mismo contrato `text`/`why`) y `app/api/ai/mission/route.ts` (zod + `GET /api/places` → `{ text, why, source }`); 8 pruebas. `flags.ia` permite apagar el modelo y dejar solo las plantillas, que es el primer recorte del Plan B.
- **Revisión humana:** Se probaron los tres caminos (con clave, sin clave y con respuesta rota) y en los tres la respuesta llega igual y nunca sale un 500. El prompt obliga a marcar «por confirmar» cuando el horario no está verificado.
- **Commit:** `09937b6` — feat(ia): agrega endpoint de redaccion con Gemini y texto de respaldo · `32f8bca` — feat(ia): respeta el interruptor flags.ia en la redaccion

### 16:23 · Catálogo de 12 lugares, 6 comercios y eventos

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** Convertir la lista de lugares y comercios del equipo en fichas que el motor pueda usar.
- **Prompt (resumen):** «Los datos de los 12 lugares y 6 comercios del equipo están en `LISTA.md`. Conviértelos en fichas con la forma de `lib/types.ts` y agrégalos al motor, con la misma disciplina del proyecto: nada de horarios inventados, los precios marcados como estimación no verificada y las coordenadas señaladas como aproximadas.»
- **Resultado:** `lib/engine/datos-demo.ts` (12 lugares, 6 comercios, fichas `Business` y lista ampliada) y `lib/engine/datos-eventos.ts` (4 eventos de muestra). Criterio: `hours` en null y `verified` en false porque la lista no traía horarios y no se inventan; `priceLevel` como estimación marcada como no verificada; coordenadas marcadas como aproximadas. Se dejó en `lib/engine/` (carpeta de I4) para no invadir `lib/mock/` (de I1).
- **Revisión humana:** Se añadió una prueba que verifica que ningún lugar traiga horario inventado ni precio sin marcar, y se repasó cada nombre contra la lista.
- **Commit:** `7499aea` — feat(motor): agrega catalogo de 12 lugares y 6 comercios con eventos demo

### 16:34 · Horarios semanales y compatibilidad con el backend

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** Usar los horarios oficiales de la lista, que cambiaban según el día, y entender las fichas tal como las devuelve el backend de I3.
- **Prompt (resumen):** «Actualicé `LISTA.md` con los horarios oficiales de cada lugar, y varios cambian según el día de la semana. Adapta el motor para manejarlos: que pueda distinguir un lugar cerrado de uno cuyo horario simplemente no se conoce, de modo que nunca se descarte un sitio por falta de información. Además, el Integrante 3 ya subió `/api/places` y `/api/events` con su mapper: revisa qué campos trae ahora una ficha y ajusta el motor para leerlos.»
- **Resultado:** `place.ts` gana `meta.horarioSemanal` (por día ISO 8601; `null` es cerrado y un día ausente es «no se sabe»), `meta.estado` (`operativo`, `cerradoTemporalmente`, `cerradoAlPublico`) y `meta.horarioNota`; el motor filtra por el día real de la semana y la IA marca «por confirmar» lo no verificado. Además lee los campos directos de `Place` antes que `meta`. Con 6 pruebas nuevas y `backend-compat.test.ts`, que reproduce filas crudas de Supabase y las pasa por los mappers de I3.
- **Revisión humana:** Se verificó que el motor nunca descarta un lugar por no saber su horario: solo lo quita cuando hay un «cerrado» real, como el Baluarte o la Isla de Sacrificios. La primera versión de la prueba de compatibilidad usaba filas a medias y daba verde sin comprobar gran cosa; se rehízo con filas completas y ahí se detectó que el `priceLevel` del backend no llegaba al motor.
- **Commit:** `ad06fcc` — feat(motor): agrega horarios semanales oficiales al catalogo · `7611abd` — fix(motor): lee los campos nuevos de Place del backend y prueba compat

### 16:42 · Endpoint POST /api/route

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** Crear el endpoint que convierte las preferencias del visitante en una ruta, que es lo que faltaba para dejar de usar datos de prueba.
- **Prompt (resumen):** «Crea el endpoint `POST /api/route`: valida el cuerpo con zod, lee los lugares, los eventos y las misiones del backend, se los pasa al motor y devuelve las paradas ordenadas con su motivo. La IA no participa en esta decisión. Lo hacemos en lugar de I3 por acuerdo del equipo, así que deja anotado en la cabecera que el archivo es de I4 y que debe pasar a su rama sin cambiar el contrato.»
- **Resultado:** `app/api/route/route.ts` (zod, lectura de `places`/`events`/`missions`, llamada a `buildRoute` y respuesta `{ stops, origen }`), `__tests__/route.test.ts` (6 pruebas) y `vitest.config.mts` con el alias `@/`, que Vitest no resolvía. La cabecera del archivo anota que lo crea I4 por acuerdo y que debe pasar a la rama de I3 sin cambiar el contrato.
- **Revisión humana:** Se probó contra el servidor real con tres combinaciones de intereses y presupuesto: la respuesta trae las paradas ordenadas con distancia, tiempo y motivo. Con datos inválidos y con un cuerpo que no es JSON responde 400 con mensaje claro.
- **Commit:** `a0155b5` — feat(api): agrega POST /api/route con el motor y pruebas del endpoint

### 17:11 · Corrección de coordenadas con OpenStreetMap

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** Corregir un error propio: el catálogo tenía las coordenadas de otra zona y la ruta entera quedaba a 80 km.
- **Prompt (resumen):** «Revisa las coordenadas del catálogo y contrástalas con una fuente geográfica real. Al compararlo con los datos del Integrante 1 vi que las mías no correspondían al Centro Histórico de Veracruz, así que confírmalas con OpenStreetMap y Wikipedia y corrige las que estén mal, además de añadir pruebas que impidan que un error así vuelva a colarse.»
- **Resultado:** Se comprobó con Nominatim, Overpass y Wikipedia que el Centro Histórico está en 19.20, -96.13, y que las coordenadas que había puesto (19.54, -96.91) eran de la zona de Xalapa. Se corrigieron los 38 lugares y los 4 eventos con datos verificados, y se añadieron 4 pruebas que blindan el error: el Zócalo en sus coordenadas reales, todo el núcleo a menos de 4 km del Zócalo, los destinos de fuera con `meta.fueraDelCentro` y el Zócalo a menos de 500 m de los Portales.
- **Revisión humana:** Fue el error más grande del trabajo y no se detectó porque el código fallara, sino al comparar con los datos de I1: las pruebas pasaban igual. A partir de ahí las distancias que calcula el motor son coherentes con el centro histórico real.
- **Commit:** `965ff80` — fix(motor): corrige coordenadas del catalogo con datos de OpenStreetMap

### 17:27 · La base de datos como fuente principal

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** Que el seed de I3 sea la fuente de verdad y el catálogo quede solo como respaldo.
- **Prompt (resumen):** «Revisa el seed del Integrante 3 y compáralo con lo que el motor espera. Haremos que la base de datos sea siempre la fuente principal y que nuestro catálogo quede únicamente como respaldo para cuando la base no esté disponible. Si las columnas del seed no coinciden con las que lee el mapper, adapta el endpoint para traducirlas sin modificar los archivos del Integrante 3.»
- **Resultado:** `app/api/route/adaptar.ts` traduce las filas del seed al motor sin tocar `lib/db/mappers.ts` (el seed guarda `events.title` donde el mapper lee `name`, y `missions.description`/`active` donde lee `rules`/`status`); el motor respeta `meta.abreDeNoche` y localiza el punto de referencia por palabra clave, para funcionar con «Zócalo de Veracruz (Plaza de Armas)». `/api/route` usa la base y cae al catálogo solo si no responde o está vacía, avisando en `origen`.
- **Revisión humana:** Al leer el seed se detectó que sus columnas y las del mapper no coinciden, lo que habría armado la ruta con nombres vacíos y sin misiones. Se corrigió desde el endpoint de I4 y se avisó a I3 para que lo ajuste en su rama. Con pruebas que reproducen las filas exactas del seed y sus 18 lugares.
- **Commit:** `4ffd5a4` — fix(motor): usa la base de datos como fuente principal y corrige la zona horaria

### 18:21 · Zona horaria: el servidor en UTC, la demo en Veracruz

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** Corregir un error que solo habría aparecido en producción y hacer que las pruebas no dependan de la zona del servidor.
- **Prompt (resumen):** «Revisa el merge con cuidado antes de continuar. Me preocupa que el motor esté calculando la hora y el día de la semana con la zona del servidor, que en Vercel es UTC, cuando la demo es en Veracruz. Si es así, corrígelo con la zona del destino y agrega una prueba que levante la suite del motor con distintas zonas horarias para que no vuelva a pasar.»
- **Resultado:** `lib/engine/zona-horaria.ts` calcula hora y día de la semana con `Intl` en `America/Mexico_City` y añade `instanteEnZona()` para convertir una hora de reloj al instante correcto; el motor dejó de usar `getHours()`. Además, todas las fechas de las pruebas llevan el offset explícito de Veracruz (`-06:00`) y se añadió `independencia-zona.test.ts`, que lanza la suite del motor en subprocesos con UTC, Veracruz y Tokio.
- **Revisión humana:** El bug era real y silencioso: en el portátil todo funcionaba, pero en Vercel (UTC) el evento de las 18:00 caería a las 12:00 en Veracruz, el día se correría al anterior y el bono de «Centro de noche» se dispararía seis horas antes, justo a la hora de la comida. Al correr la suite con `TZ=UTC` fallaron 11 pruebas que en local pasaban; con el offset explícito la suite completa pasa en cinco zonas horarias distintas.
- **Commit:** `197726e` — fix(motor): corrige los horarios de respaldo para el servidor en UTC · `e748088` — test(motor): hace los tests del endpoint independientes de la zona horaria

### 18:42 · Integración del backend de I3 y del panel de I5

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** Traer a `main` los endpoints, el esquema y los datos semilla de I3, y resolver el choque entre I3 e I5 por `/api/stats`.
- **Prompt (resumen):** «Actualiza la carpeta con lo que el Integrante 3 ya subió al repositorio: los endpoints que faltaban, el esquema de la base y los datos semilla. Revisa que el build siga pasando y que nada de lo que haya entrado rompa lo que ya funcionaba.»
- **Resultado:** Entraron `/api/visits/validate`, `/api/missions/accept`, `/api/me/passport`, `/api/stats`, `supabase/schema.sql` y `supabase/seed.sql`, con el conflicto de `lib/qr/types.ts` resuelto a favor del tipo compartido. Se corrigieron tres cosas: `getAdminClient()` estaba fuera del `try` en dos endpoints y tumbaba el build sin `.env.local`; `/api/stats` se prerenderizaba y con `cacheComponents` de Next 16 se marcó con `connection()`; y la actividad por hora usaba la hora del servidor. Del choque de `/api/stats` se conservó la versión de I5, que es la que consume su panel `/admin` (pide `ExtendedStats` y refresca cada 5 s).
- **Revisión humana:** El `schema.sql` de I3 está completo (las diez tablas, RLS en todas, las políticas y la función `increment_points`), que era justo lo que faltaba para poder levantar la base de cero. Los tres arreglos son de la carpeta de I3, así que se le avisó para que los incorpore en su rama. El build ahora pasa con y sin variables de entorno, que es lo que garantiza que `main` no se rompa.
- **Commit:** `0662073` — merge(backend): integra endpoints de I3 con schema.sql y seed.sql · `cdd99df` — merge(paneles): integra cambios de I5 y resuelve /api/stats con la version del panel

### 19:24 · Auditoría final: interruptores, 404 de la IA y minutos totales

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** Repasar el motor de arriba abajo contra el código real del equipo para detectar lo que quedara pendiente de mi parte antes del corte.
- **Prompt (resumen):** «Actualiza la carpeta con el main del repositorio para revisar qué nos falta por hacer» y «de nuestra parte hace falta algo?».
- **Resultado:** Se encontraron y corrigieron tres cosas del motor. Primera: `lib/flags.ts` define tres interruptores y solo se usaba `ia`; ahora `centroDeNoche` apaga el bono nocturno y `agenda` saca los eventos de la ruta. Segunda: `/api/ai/mission` buscaba el lugar por id en `/api/places` y en el catálogo propio, pero `lib/mock` del Integrante 1 usa ids cortos ("p1", "p2"…), así que la IA respondía 404 con las pantallas que aún no están conectadas a la base; ahora cae también a `lib/mock`. Tercera: el motor no devolvía `totalMin`, que el contrato ya pedía, y al añadirlo apareció que con 120 minutos la ruta reportaba 129, porque a cada evento se le sumaba tiempo de visita como si fuera un lugar (a un evento se asiste, no se visita); ahora un evento solo suma el traslado. Con 111 pruebas en 13 archivos, incluidos `flags.test.ts` (que simula el módulo con `vi.mock` para probar los dos estados) y `mission.test.ts`.
- **Revisión humana:** La revisión se hizo sobre el código, no sobre la memoria: se buscaron los interruptores sin usar, se compararon los formatos de id entre el seed, `lib/mock` y el catálogo, y se comprobó que el cálculo de la hora nocturna de I3 coincide con el del motor en UTC, Tokio y Nueva York. En las pruebas de los interruptores se descubrió que la ventana de tiempo del evento estaba mal puesta en el test (no en el código) y se corrigió.
- **Commit:** `ab41250` — fix(motor): respeta los interruptores, arregla el 404 de la IA y el total de minutos

### 19:48 · Modo demo en todos los endpoints y guía de pruebas

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** Dejar el proyecto en estado de poderse probar de punta a punta, y que la demo no se caiga si la base de datos no está configurada.
- **Prompt (resumen):** «Han actualizado la rama main, revisa y completa lo que haga falta para empezar a hacer pruebas».
- **Resultado:** Se auditaron los 11 endpoints del contrato contra el servidor real y se detectó que sin base de datos configurada cuatro de ellos devolvían 500 sin cuerpo: `/api/places`, `/api/events`, `/api/me/passport` y `/api/qr-tokens`. Todos ahora caen a un catálogo de respaldo con el mismo contrato, siguiendo el patrón que ya usaba `/api/route` y `/api/stats`: lugares y eventos desde `lib/engine/datos-demo.ts`, el pasaporte desde `lib/mock` y las tarjetas de QR desde `lib/qr/mock`. En `/api/visits/validate` el error se corrige devolviendo 404 sin cuerpo, que es la convención que `lib/qr/validate.ts` usa para activar el modo demo. También se añadió el enlace a `/ruta` y `/pasaporte` en la portada (que no los tenía, así que el flujo de oro no se podía recorrer a mano), la guía `docs/guia-pruebas.md` con los pasos exactos y el script `scripts/verificar-demo.mjs`, que comprueba las 9 pantallas y los 7 endpoints principales de una sola vez.
- **Revisión humana:** Se verificó endpoint por endpoint contra el servidor corriendo, no contra el código: las 9 pantallas responden 200 y los 7 endpoints devuelven datos utilizables. Se comprobó además que el escáner cae al modo demo con el 404 sin cuerpo, porque un 404 con JSON de error se habría tomado como rechazo real y la demo habría mostrado un fallo en vez de la visita de ejemplo. Los cuatro endpoints corregidos son de la carpeta de I3, así que se le avisó para que incorpore los cambios en su rama.
- **Commit:** pendiente

### 21:10 · Interfaz de «Tu ruta sugerida»: sin emojis, interactiva y con Google Maps

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** Rediseñar la pantalla de la ruta: quitar los emojis, hacerla más interactiva y añadir un enlace a Google Maps para que el turista ubique los lugares en su teléfono.
- **Prompt (resumen):** «Trabajarás en la interfaz "Tu ruta sugerida": quiero que descartes los emojis, sea más interactiva y que agregues un enlace a Google Maps para facilitar al turista a identificar los lugares que le indica la ruta.»
- **Resultado:** La pantalla (`app/(visitante)/ruta/page.tsx`) quedó con iconos SVG en lugar de emojis (reutilizando los del Integrante 5 en `components/paneles/icons.tsx` y creando los propios de la ruta en `components/visitante/icons.tsx`); cada parada ahora se despliega para mostrar la descripción, el evento asociado y el botón de abrir ese lugar en Google Maps; hay un mapa de Leaflet que se puede mostrar con un toque; y en la cabecera, un botón que abre **la ruta completa en Google Maps con todas las paradas como waypoints en el orden recomendado**, más otro para copiar ese enlace. Los enlaces se arman en `components/visitante/enlaces-maps.ts`, que además recorta a los nueve destinos que acepta Google Maps y avisa si se quedaron paradas fuera. Con 8 pruebas de los enlaces, 125 en total, y los scripts `scripts/probar-ruta.mjs` y `scripts/capturar-ruta.mjs`, que revisan la pantalla en un Chrome de verdad (que no queden emojis, que los enlaces se armen bien y que el desplegable y el mapa funcionen).
- **Revisión humana:** Se comprobó en el navegador: la pantalla no tiene ni un emoji, muestra los iconos, el enlace de la cabecera abre `/maps/dir/` con origen, destino y modo a pie, y al desplegar una parada aparece el enlace del lugar suelto. Se respetó la decisión del proyecto de usar Leaflet con OpenStreetMap (libre, sin claves ni límites) y el enlace a Google Maps es un deep link que no necesita claves ni API, así que no se rompe el criterio del jurado. Los archivos tocados son de I1 (la pantalla y `components/visitante/`), así que se le avisó para que incorpore los cambios en su rama.
- **Commit:** pendiente

### 20:33 · Arreglo del flujo de puntos: escanear → pasaporte

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** Corregir que al escanear un QR no se sumaran los puntos al pasaporte.
- **Prompt (resumen):** «Hay un bug, el cual es que al realizar la visita y escanear el código QR no se suman los puntos a pasaporte».
- **Resultado:** El bug tenía dos causas encadenadas. Primera: `lib/qr/mock.ts` devolvía siempre los mismos números (`pointsAdded: 50`, `totalPoints: 150`), así que aunque el escaneo «funcionara» el total nunca cambiaba; ahora el mock guarda los puntos y las visitas en el `sessionStorage` del navegador y los va sumando, con un token que solo cuenta una vez, igual que el servidor. Segunda: `app/(visitante)/pasaporte/page.tsx` era una pantalla estática que leía `mockProfile.points` de `lib/mock`, así que mostraba 150 fijos aunque se acabara de escanear; ahora lee `GET /api/me/passport` y, cuando la base no está disponible, usa los puntos de la sesión. De paso, `GET /api/me/passport` responde `demo: true` en modo respaldo, para que el cliente sepa que debe tomar los puntos del navegador (el servidor no ve su `sessionStorage`). Con 5 pruebas nuevas en `lib/qr/__tests__/puntos.test.ts` y el script `scripts/probar-puntos.mjs`, que recorre el flujo en un Chrome de verdad.
- **Revisión humana:** El arreglo se comprobó en un navegador real, no solo con pruebas unitarias: escanear un QR lleva el total de 150 a 200, volver a escanear el mismo token no suma otra vez, un token distinto lo lleva a 250 y el pasaporte muestra siempre el total vigente. Con base de datos el camino ya estaba bien (la función `increment_points` suma de forma atómica y `/api/me/passport` lee `profiles.points`), así que el arreglo era del lado del modo demo. Los archivos tocados son de I1 (la pantalla del pasaporte) e I2 (el mock del QR), así que se les avisó para que los incorporen en sus ramas.
- **Commit:** pendiente
