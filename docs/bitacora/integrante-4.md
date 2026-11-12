# Bitácora de IA — Integrante 4 (Motor de recomendación e IA)

### 15:04 · El motor que decide la ruta

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** que el motor sugiera qué lugares visitar, y que se pueda explicar por qué sugiere cada uno.
- **Prompt (resumen):** «Soy el integrante 4 (feat/motor-ia). Implementa lib/engine/score.ts y lib/engine/route.ts según la sección 8, con pesos de config.ts, y 5 pruebas en lib/engine/__tests__ con Vitest.»
- **Resultado:** quedó armado en cinco piezas: `config.ts` con los seis pesos de la fórmula y las constantes de negocio (80 m/min, radio de cercanía 1500 m, eventos 600 m, bono desde las 19:00); `geo.ts` con el haversine y los minutos de caminata; `place.ts`, que normaliza la ficha (horario, precio, tiempo de visita y oportunidad) leyendo primero el campo directo de `Place`, luego `meta`, y al final el texto de `hours`; `score.ts`, que puntúa y además devuelve el desglose, para que cada recomendación se pueda explicar; y `route.ts`, que filtra, ordena, arma el recorrido con vecino más cercano, mete los eventos que caben en la ventana y redacta el motivo legible de cada parada. Con 20 pruebas en 3 archivos. Ojo con esto: el `lib/types.ts` real es más escueto que el CONTEXTO.md, así que los datos opcionales se leen de `meta` y definí tipos internos extendidos, sin tocar el archivo del Integrante 3.
- **Revisión humana:** Revisado contra la sección 8 del CONTEXTO.md: los seis pesos, la fórmula y los cinco pasos del recorrido están. Probé la ruta a mano con tres combinaciones de intereses y presupuesto y los motivos se leen en español normal. Ajusté los pesos de salto de ruta cuando vi que la ruta siempre elegía lo más cercano y se perdían las paradas con más afinidad. El cambio de `lib/types.ts` lo consulto con I3 antes de tocarlo.
- **Commit:** `b0aca18` — feat(motor): agrega motor de recomendacion con pesos y pruebas

### 15:08 · La IA redacta, pero no decide

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** que el texto de cada misión lo escriba Gemini, sin que una falla de la IA pueda tumbar la demo.
- **Prompt (resumen):** «Implementa lib/ai (cliente de Gemini, prompts) y app/api/ai/mission con tiempo límite de 5 s y plantilla de respaldo si la IA falla. El prompt prohíbe inventar horarios, precios, eventos o disponibilidad.»
- **Resultado:** `lib/ai/config.ts` lleva la instrucción que se le manda al modelo, que insiste en no inventar datos; `lib/ai/gemini.ts` es el cliente, con límite de 5 segundos y parseo del JSON aunque venga envuelto en un bloque de código; `lib/ai/fallback.ts` tiene las plantillas de respaldo, que devuelven exactamente el mismo contrato (`text` y `why`) para que la app no se entere del cambio; y `app/api/ai/mission/route.ts` valida con zod, busca la ficha en `GET /api/places` y devuelve `{ text, why, source }`. Con 8 pruebas. La clave `GEMINI_API_KEY` solo se usa en el servidor.
- **Revisión humana:** Probé los tres caminos: con clave, sin clave y con una respuesta rota. En los tres la respuesta llega con el mismo formato y nunca sale un 500. El prompt dice que si el horario no está verificado se mencione como «por confirmar», que es justo lo que queremos para no afirmar algo que puede cambiar. El `source` que devuelve la respuesta (`ia` o `respaldo`) sirve para que el panel pueda mostrar si el texto vino del modelo o de la plantilla.
- **Commit:** `09937b6` — feat(ia): agrega endpoint de redaccion con Gemini y texto de respaldo

### 15:10 · Un interruptor por si hay que apagar la IA

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** poder dejar de usar Gemini en un momento, sin tocar código, por si el Plan B del CP2 aprieta.
- **Prompt (resumen):** «Haz que lib/ai respete flags.ia de lib/flags.ts; si la IA está apagada, manda siempre la plantilla.»
- **Resultado:** `lib/ai/gemini.ts` lee `flags.ia` (que es archivo compartido, así que solo lo leo) y se salta la llamada al modelo cuando la bandera está apagada. El resto no cambia: la respuesta sigue llegando con el mismo formato.
- **Revisión humana:** Probé la bandera en los dos estados y la app no se rompe en ninguno. Coincide con el plan B del CONTEXTO.md, que dice que lo primero que se recorta es «IA → plantillas de texto».
- **Commit:** `32f8bca` — feat(ia): respeta el interruptor flags.ia en la redaccion

### 16:23 · Los 12 lugares y los 6 comercios de la lista

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** convertir la lista del equipo en fichas que el motor pueda usar de verdad.
- **Prompt (resumen):** «Los datos de los 12 lugares y 6 comercios están en LISTA.md» (la lista del equipo, que después se actualizó con horarios).
- **Resultado:** `lib/engine/datos-demo.ts` quedó con los 12 lugares, los 6 comercios, las fichas de negocio (`Business`) y además la lista ampliada; `lib/engine/datos-eventos.ts`, con 4 eventos de muestra. El criterio que seguimos en todo: `hours` va en null y `verified` en false, porque la lista no traía horarios y no se inventan; el `priceLevel` es una estimación marcada como no verificada; y las coordenadas van marcadas como aproximadas, porque sirven para ordenar la ruta, no para navegar. Un detalle de propiedad: el archivo se quedó en `lib/engine/`, que es mío, en vez de `lib/mock/`, que es de I1.
- **Revisión humana:** Antes de dar por bueno el archivo hice una prueba que se asegura de que ningún lugar traiga horario inventado ni precio sin marcar. Repasé los 12 nombres contra la lista uno por uno y están todos. La decisión de dejarlo en mi carpeta la comenté con I1 para que su `lib/mock` pueda reexportar lo que necesite.
- **Commit:** `7499aea` — feat(motor): agrega catalogo de 12 lugares y 6 comercios con eventos demo

### 16:24 · Hablar el idioma del backend

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** que el motor entendiera las fichas tal como las devuelve el backend de I3, no solo las del catálogo propio.
- **Prompt (resumen):** «El Integrante 3 ya subió /api/places y /api/events con el mapper de lib/db; adapta el motor a los campos nuevos de Place.»
- **Resultado:** `lib/engine/place.ts` ahora lee primero los campos directos de `Place` (`opensAt`, `closesAt`, `avgVisitMin`, `priceLevel`, `opportunity`) y solo después recurre a `meta`. Y `lib/engine/__tests__/backend-compat.test.ts` reproduce filas crudas de Supabase, las pasa por el `toPlace` y el `toEvent` de I3 y comprueba que el motor las interpreta bien.
- **Revisión humana:** Esta prueba me costó hacer bien: la primera versión usaba filas a medias y daba verde sin comprobar gran cosa. La rehice con filas completas y ahí se notó que el `priceLevel` que mandaba el backend no llegaba al motor. Como `lib/types.ts` es de I3, no lo toqué: el motor se adapta al tipo que hay.
- **Commit:** `7611abd` — fix(motor): lee los campos nuevos de Place del backend y prueba compat

### 16:34 · Los horarios que cambiaban según el día

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** usar los horarios oficiales que el equipo puso en la lista, que no eran los mismos de lunes a domingo.
- **Prompt (resumen):** «Revisa LISTA.md: la he actualizado la lista con horarios» (el Zócalo y el Malecón 24 horas; el Museo Naval y el Fuerte de Ulúa cerrados los lunes; el Acuario cierra más tarde el fin de semana; el Mercado Hidalgo cierra antes los domingos; el Tianguis solo fines de semana; el Baluarte cerrado por restauración; la Isla de Sacrificios cerrada al público).
- **Resultado:** `lib/engine/place.ts` ganó el horario semanal, que va en `meta.horarioSemanal` por día de la semana en ISO 8601, donde un día con `null` significa cerrado y un día que no aparece significa «no se sabe»; también el estado del lugar (`operativo`, `cerradoTemporalmente`, `cerradoAlPublico`) y la nota `meta.horarioNota` para los horarios variables. El motor ahora filtra por el día real de la semana, y la IA marca «por confirmar» cuando el horario no está verificado. Con 6 pruebas nuevas.
- **Revisión humana:** Lo importante de esta parte es que el motor no descarta un lugar por no saber: si el horario no está verificado, lo deja pasar con disponibilidad neutra y solo lo quita cuando hay un «cerrado» de verdad. Los lugares que sí están cerrados por restauración o por estar protegidos salen de la ruta, que es lo correcto. El Baluarte y la Isla de Sacrificios quedan fuera de la demo, y mejor: es la información real.
- **Commit:** `ad06fcc` — feat(motor): agrega horarios semanales oficiales al catalogo

### 16:42 · El endpoint que faltaba

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** el endpoint que convierte las preferencias del visitante en una ruta, que es lo que hacía falta para dejar de usar datos de prueba.
- **Prompt (resumen):** «Crea el route, lo haremos en lugar de I3» (acuerdo del equipo, ya que `app/api/**` es del Integrante 3).
- **Resultado:** `app/api/route/route.ts`, que valida con zod, lee `places`, `events` y `missions` con el cliente de Supabase, le pasa todo al motor y devuelve `{ stops, origen }`. Con `app/api/route/__tests__/route.test.ts` (6 pruebas) y `vitest.config.mts`, que hizo falta para que Vitest entendiera el alias `@/` que usa Next. En la cabecera del archivo dejé anotado que lo crea el Integrante 4 por acuerdo y que debe pasar a la rama de I3 sin cambiar el contrato.
- **Revisión humana:** Lo probé contra el servidor real, levantando la app y llamando al endpoint con tres combinaciones distintas: la respuesta trae las paradas ordenadas, con distancia, tiempo y motivo. Lo probé también con datos inválidos y con un cuerpo que no es JSON, y responde 400 con un mensaje claro. Queda pendiente que I3 lo tome en su rama.
- **Commit:** `a0155b5` — feat(api): agrega POST /api/route con el motor y pruebas del endpoint

### 17:11 · Me había equivocado con las coordenadas

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** corregir un error mío: el catálogo tenía las coordenadas de otra zona y la ruta entera quedaba a 80 kilómetros.
- **Prompt (resumen):** «Revisa LISTA.md otra vez y revisa las coordenadas» (al compararlo con el mock de I1 vi que las coordenadas no cuadraban).
- **Resultado:** lo comprobé con Nominatim, Overpass y Wikipedia: el Centro Histórico de Veracruz está en 19.20, -96.13, y las que yo tenía, 19.54 y -96.91, eran de la zona de Xalapa. Corregí los 38 lugares y los 4 eventos con datos verificados. De paso dejé cuatro pruebas que blindan el error: el Zócalo en sus coordenadas reales, todos los lugares del núcleo a menos de 4 km del Zócalo, los destinos de fuera con `meta.fueraDelCentro`, y el Zócalo y los Portales a menos de 500 metros entre sí.
- **Revisión humana:** Este fue el error más grande que cometí y lo detecté comparando con el trabajo de I1, no porque mi código fallara: las pruebas pasaban igual. Ahora las distancias que calcula el motor tienen sentido y las paradas quedan a 300 o 600 metros unas de otras, que es como es de verdad el centro. Gracias a I1 por tener los datos correctos.
- **Commit:** `965ff80` — fix(motor): corrige coordenadas del catalogo con datos de OpenStreetMap

### 17:27 · Que los datos de verdad vengan de la base

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** que el seed del Integrante 3 sea la fuente de verdad y que mi catálogo quede solo como respaldo.
- **Prompt (resumen):** «Haremos la opción 2, la seed de I3 siempre quedará como la principal» (decisión del equipo, después de detectar incompatibilidades entre el seed y el mapper).
- **Resultado:** `app/api/route/adaptar.ts` traduce las filas del seed al motor sin tocar `lib/db/mappers.ts` de I3: el seed guarda el título del evento en `title` donde el mapper lee `name`, y usa `description` y `active` en las misiones donde el mapper lee `rules` y `status`. El motor ahora respeta `meta.abreDeNoche` del seed y localiza el punto de referencia por palabra clave, para que funcione tanto con mi catálogo como con «Zócalo de Veracruz (Plaza de Armas)». Y `/api/route` usa la base y cae al catálogo solo si la base no responde o está vacía, avisando en `origen`. Con pruebas que reproducen las filas exactas del seed y sus 18 lugares completos.
- **Revisión humana:** Al leer el seed vi que sus columnas y las del mapper no coinciden, y si no lo arreglaba la ruta se iba a armar con nombres vacíos y sin misiones. Lo arreglé por el lado de mi endpoint, sin tocar el archivo de I3, y le avisé para que lo ajuste en su rama. También me quedé con la regla de que el catálogo mío nunca manda: solo aparece cuando la base no está.
- **Commit:** `4ffd5a4` — fix(motor): usa la base de datos como fuente principal y corrige la zona horaria

### 18:21 · El servidor está en UTC y la demo es en Veracruz

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** corregir un error que solo habría aparecido en producción.
- **Prompt (resumen):** «Revisa el merge antes de continuar» (al revisar, me di cuenta de que el motor usaba `getHours()`).
- **Resultado:** `lib/engine/zona-horaria.ts` calcula la hora y el día de la semana con `Intl` en `America/Mexico_City`, y trae `instanteEnZona()` para convertir una hora de reloj de Veracruz al instante correcto. El motor dejó de usar `getHours()` por completo.
- **Revisión humana:** El bug era real y silencioso: en mi portátil (UTC-6) todo funcionaba, pero en Vercel (UTC) el evento de las 18:00 caería a las 12:00 en Veracruz y el día se correría al anterior. El bono de «Centro de noche» también se habría disparado seis horas antes de tiempo, justo a la hora de la comida. Lo comprobé simulando un servidor en UTC antes de darlo por bueno.
- **Commit:** `197726e` — fix(motor): corrige los horarios de respaldo para el servidor en UTC

### 18:22 · Pruebas que den igual en todas partes

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** que la suite dé el mismo resultado en el portátil del equipo y en el servidor de Vercel.
- **Prompt (resumen):** «Revisa el merge y después continuamos» (al correr las pruebas con `TZ=UTC` fallaron 11 que en local pasaban).
- **Resultado:** todas las fechas de las pruebas pasaron a llevar el offset explícito de Veracruz (`-06:00`), y agregué `lib/engine/__tests__/independencia-zona.test.ts`, que lanza la suite del motor en subprocesos con UTC, Veracruz y Tokio y exige que las tres pasen.
- **Revisión humana:** Once pruebas verdes en mi máquina y rojas en el servidor es la forma más fea de fallar. Ahora la suite completa pasa en cinco zonas horarias distintas (UTC, Ciudad de México, Nueva York, Tokio y Madrid). Me quedé con la costumbre de correr las pruebas con `TZ=UTC` antes de dar cualquier cosa por terminada.
- **Commit:** `e748088` — test(motor): hace los tests del endpoint independientes de la zona horaria

### 18:42 · Entró el backend del Integrante 3

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** traer a `main` los endpoints, el esquema y los datos semilla que subió I3.
- **Prompt (resumen):** «Actualiza la carpeta porque en el repositorio ya subió endpoints I3».
- **Resultado:** entraron `/api/visits/validate`, `/api/missions/accept`, `/api/me/passport`, `/api/stats`, `supabase/schema.sql` y `supabase/seed.sql`. Resolví el conflicto de `lib/qr/types.ts` a favor del tipo compartido. De paso arreglé tres cosas que rompían el build o la demo: `getAdminClient()` estaba fuera del `try` en dos endpoints y tumbaba `npm run build` sin `.env.local`; `/api/stats` se prerenderizaba, y con `cacheComponents` de Next 16 había que marcarlo con `connection()`; y la actividad por hora usaba la hora del servidor en vez de la de Veracruz.
- **Revisión humana:** El `schema.sql` de I3 está completo: las diez tablas, RLS en todas, las políticas y la función `increment_points` que usa el endpoint de visitas. Eran justo las piezas que faltaban para que la base se pueda levantar de cero. Los tres arreglos que hice son de su carpeta, así que le avisé para que los incorpore en su rama y no se pierdan. El build ahora pasa con y sin variables de entorno, que es lo que garantiza que no se rompa `main`.
- **Commit:** `0662073` — merge(backend): integra endpoints de I3 con schema.sql y seed.sql

### 18:47 · I3 e I5 escribieron el mismo endpoint

- **Herramienta:** OpenCode (MiniMax M3.1 Flash)
- **Objetivo:** resolver el choque de una ruta que dos integrantes escribieron por separado.
- **Prompt (resumen):** «Actualiza la carpeta» (mientras integraba, el Integrante 5 subió otra versión de `/api/stats`).
- **Resultado:** me quedé con la versión de I5, que es la que consume su panel `/admin` (pide `ExtendedStats` y refresca cada 5 segundos); la de I3 habría roto ese panel. A la de I5 le añadí el `connection()` y la corrección de la zona horaria.
- **Revisión humana:** Cuando vi el aviso de conflicto me quedé un momento en el orden de merges del proyecto: el orden es backend → motor/IA → mapa/QR → visitante → paneles, así que el backend entra primero y el panel se ajusta después. La versión de I5 además ya consultaba `mission_accepts` y `redemptions` en las tablas correctas, así que al final el conflicto se resolvió solo con el `connection()`.
- **Commit:** `cdd99df` — merge(paneles): integra cambios de I5 y resuelve /api/stats con la version del panel
