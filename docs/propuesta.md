**PULSO  
JAROCHO**

*La ciudad se activa contigo.*

**RETO 6 · CENTRO VIVO — TURISMO Y CENTRO HISTÓRICO**

Inteligencia urbana participativa para impulsar el turismo,  
la cultura y el comercio del Centro Histórico de Veracruz

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>IDEA EN UNA FRASE<br />
</strong>Una plataforma que transforma las necesidades y oportunidades del Centro Histórico en misiones urbanas personalizadas: los visitantes descubren lugares, los comercios reciben nuevas visitas y los gestores obtienen señales útiles para activar la ciudad.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

Documento de propuesta · Versión para prototipo de 24 horas  
11 de noviembre de 2026

# Resumen ejecutivo

Pulso Jarocho es una plataforma web progresiva (PWA) concebida para responder a un reto concreto: lograr que quienes visitan el Centro Histórico de Veracruz permanezcan más tiempo, descubran una oferta más diversa y conecten con los negocios y actividades culturales de la zona. La propuesta va más allá de una guía turística: utiliza un motor de recomendación y misiones para distribuir oportunidades de visita entre atractivos, eventos y establecimientos participantes.

El visitante indica cuánto tiempo tiene, qué le interesa y su presupuesto aproximado. El sistema recomienda una secuencia de paradas y puede asignarle una misión —por ejemplo, conocer un comercio tradicional, asistir a una actividad cultural o explorar una calle menos conocida—. Al llegar, valida su participación mediante un código QR y obtiene puntos o beneficios. Los comerciantes publican información y promociones; los administradores consultan un tablero con actividad digital agregada.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>PROPUESTA DE VALOR<br />
</strong>Convertir cada recorrido en una oportunidad de conexión: turismo para el visitante, visibilidad y visitas potenciales para el comercio, e información accionable para la gestión del destino.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# Por qué esta propuesta puede ganar

El jurado de un hackathon suele evaluar cuatro cosas: si la solución atiende el reto, si es innovadora, si realmente funciona y si el equipo la comunica bien. El plan de Pulso Jarocho está construido para responder a las cuatro con evidencia visible durante la presentación.

| **Criterio**             | **Qué verá el jurado**                                                                                                                                                        | **Cómo lo aseguramos**                                                                                              |
|--------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------|
| **Atiende el reto**      | Los cinco ejemplos del Reto 6 y sus tres usuarios resueltos en un solo flujo: una ruta que lleva al visitante del Zócalo a un comercio o evento que normalmente no visitaría. | Todo el MVP gira alrededor de un solo flujo: preferencias → ruta → misión → QR → tablero.                           |
| **Innovación**           | Un motor que equilibra lo que quiere el visitante con lo que necesita el comercio, y explica cada recomendación.                                                              | Puntuación determinista y explicable; la IA solo redacta la misión y el «por qué».                                  |
| **Funciona de verdad**   | La app corriendo en una URL pública, en un teléfono, con datos en la base de datos.                                                                                           | Despliegue desde el primer punto de control; cada commit de main se publica solo.                                   |
| **Momento memorable**    | Un integrante del jurado escanea un QR impreso y su visita aparece en vivo en el tablero.                                                                                     | QR físicos impresos y tablero con actualización automática cada pocos segundos.                                     |
| **Requisito del jueves** | El requisito nuevo de las 7:00 resuelto y presentado con su propia diapositiva.                                                                                               | Arquitectura configurable desde el inicio y un protocolo de 30 minutos para analizarlo y repartirlo (sección 10.6). |
| **Comunicación**         | Historia de 3 minutos, ensayada, con video de respaldo.                                                                                                                       | El integrante 5 trabaja el pitch desde el inicio, no al final.                                                      |

# Alineación con el Reto 6 · Centro vivo

El reto pide atraer, retener y conectar a visitantes con el Centro Histórico, y menciona tres problemas concretos: estancias de pocas horas, comercios que no conectan con el visitante (algunos cierran temprano o quedan vacíos) y eventos de los que casi nadie se entera. Pulso Jarocho integra en una sola experiencia los cinco ejemplos de solución que propone el reto.

| **Lo que pide el reto**                    | **Cómo lo resuelve Pulso Jarocho**                                                                                                                                                          | **En la demo**               |
|--------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------|
| **Ruta inteligente según tiempo y gustos** | Motor de oportunidades: ordena paradas por intereses, tiempo, cercanía, horario y necesidad de visibilidad del comercio, y explica cada elección.                                           | Sí · flujo principal         |
| **Agenda viva de eventos culturales**      | «Hoy en el centro»: eventos de hoy y de las próximas horas. Si un evento cabe en el tiempo del visitante, el motor lo mete en su ruta. Los organizadores lo publican en menos de un minuto. | Sí · pantalla y publicación  |
| **Vitrina digital para comercios**         | Ficha de cada comercio con promoción vigente, horario, etiqueta «abierto ahora» y misión asociada.                                                                                          | Sí · ficha y panel           |
| **Programa de recompensas**                | Pasaporte digital con sellos por QR, niveles y beneficios que el comercio confirma al canjear.                                                                                              | Sí · QR en vivo              |
| **Tablero de afluencia**                   | Tablero de afluencia digital: interacciones por zona y franja horaria, misiones y canjes. Se etiqueta como actividad registrada en la app, no como conteo de personas.                      | Sí · en vivo                 |
| **Comercios que cierran temprano**         | «Centro de noche»: misiones con más puntos en comercios abiertos después de las 19:00, e indicador para autoridades de la brecha entre la actividad nocturna y los comercios abiertos.      | Sí · versión simple          |
| **Locales vacíos**                         | Capa de «locales disponibles» en el mapa de gestión, cruzada con las zonas de más actividad, para atraer nuevos negocios donde ya hay flujo.                                                | Diapositiva · siguiente fase |

| **Usuario del reto**                 | **Qué obtiene**                                                                                           |
|--------------------------------------|-----------------------------------------------------------------------------------------------------------|
| **Visitantes y turistas**            | Una ruta a su medida, eventos de hoy y recompensas por explorar más allá del Zócalo y el Malecón.         |
| **Comerciantes y prestadores**       | Vitrina, promociones, visitas validadas y un motivo para que los visitantes lleguen, también de noche.    |
| **Autoridades de turismo y cultura** | Tablero de afluencia digital, eventos con más interés y brecha de horario nocturno para decidir campañas. |

# 1. Contexto y planteamiento del problema

El Centro Histórico de Veracruz concentra patrimonio arquitectónico, espacios públicos, gastronomía, comercio, museos, actividades culturales y puntos emblemáticos como el Zócalo, Los Portales y el Malecón. Sin embargo, la riqueza de la zona no siempre se traduce en recorridos prolongados ni en una distribución amplia de las visitas. Una parte de los visitantes puede concentrar su estancia en unos cuantos puntos, desconocer actividades disponibles o no encontrar fácilmente negocios y experiencias cercanas.

Al mismo tiempo, algunos establecimientos necesitan mayor visibilidad, promoción o conexión con el flujo turístico. La información sobre horarios, promociones y eventos puede estar dispersa o desactualizada. Las autoridades y organizaciones que impulsan el destino también requieren indicadores para entender qué contenidos despiertan interés y qué campañas generan interacción.

## 1.1 Problema central

Falta una herramienta integrada y orientada a la acción que conecte, en tiempo oportuno, las preferencias del visitante con las oportunidades culturales y comerciales del Centro Histórico, y que permita observar el resultado de esa interacción.

## 1.2 Oportunidad

Crear una capa digital ligera que complemente la oferta turística existente. Pulso Jarocho no pretende reemplazar directorios, mapas o portales institucionales: busca convertir la información en recorridos, retos y visitas verificables, con datos agregados para mejorar las decisiones.

# 2. Objetivos

## 2.1 Objetivo general

Diseñar y validar un prototipo de plataforma digital inteligente que incentive la exploración del Centro Histórico de Veracruz, conecte visitantes con comercios y actividades culturales mediante misiones personalizadas y genere indicadores de interacción que apoyen la revitalización turística y económica.

## 2.2 Objetivos específicos

- Ofrecer recorridos sugeridos según tiempo disponible, intereses, presupuesto y distancia entre puntos.

- Facilitar que comercios y organizadores publiquen información, promociones y actividades.

- Incorporar misiones y recompensas digitales que incentiven visitas a distintos puntos de interés.

- Validar visitas mediante códigos QR asociados a establecimientos o atractivos participantes.

- Mostrar a los administradores métricas de uso, misiones completadas, escaneos y canjes, sin presentar esos datos como conteos totales de peatones.

- Probar la experiencia con un conjunto acotado de lugares, negocios y usuarios durante un piloto.

# 3. Solución propuesta: ¿qué es Pulso Jarocho?

Pulso Jarocho es una PWA accesible desde el navegador del teléfono. El usuario puede entrar mediante un enlace o un código QR, sin descargar una aplicación nativa. La solución se organiza en tres experiencias conectadas: explorador, comerciante y centro de inteligencia.

## 3.1 Experiencia del visitante: Explora

- Inicio rápido: selección de duración (por ejemplo, 60, 120 o 180 minutos), intereses y presupuesto.

- Mapa interactivo: puntos de interés, negocios participantes, eventos y misiones disponibles.

- Ruta sugerida: lista ordenada de paradas con distancia aproximada y tiempo estimado, sujeto a validación cartográfica.

- Misiones: retos temáticos como “descubre un negocio tradicional”, “visita un espacio cultural” o “conoce una historia del puerto”.

- Pasaporte digital: historial de sellos, puntos, niveles y recompensas disponibles.

- Ficha de lugar: descripción breve, ubicación, horario informado, categoría, accesibilidad si está confirmada y enlace de contacto.

## 3.2 Experiencia del comercio: Participa

- Registro y perfil del establecimiento con nombre, categoría, ubicación, horarios y datos de contacto.

- Publicación de promociones o beneficios con vigencia y condiciones claras.

- Creación o participación en misiones que puedan atraer visitantes.

- Panel básico de escaneos QR, visitas validadas y recompensas canjeadas.

- Herramientas para actualizar información y pausar promociones cuando ya no estén disponibles.

## 3.3 Experiencia de gestión: Observa

- Vista de puntos y zonas con mayor o menor interacción dentro de la plataforma.

- Conteo de misiones publicadas, aceptadas y completadas.

- Escaneos QR por punto, periodo y campaña.

- Comercios con más visitas validadas y promociones con mayor interacción.

- Exportación de indicadores agregados para reportes y evaluación del piloto.

## 3.4 Agenda viva y Centro de noche

- **Hoy en el centro:** lista y mapa de eventos de hoy y de las próximas horas, filtrables por interés; cada evento indica lugar, hora y fuente.

- **Publicación rápida:** comercios y organizadores publican un evento con título, lugar, fecha, hora y categoría. Queda marcado como «por confirmar» hasta que un administrador lo verifica.

- **Eventos en la ruta:** si un evento empieza dentro del tiempo disponible del visitante y está cerca, el motor puede incluirlo como parada.

- **Centro de noche:** las misiones en comercios abiertos después de las 19:00 dan puntos extra, para alargar la estancia y apoyar a los negocios que abren de noche.

- **Brecha de horario:** el tablero compara la actividad digital por franja horaria con el número de comercios abiertos en esa franja.

# 4. Elemento innovador: motor de oportunidades urbanas

La innovación principal no consiste en mostrar un mapa, sino en recomendar qué experiencia conviene activar para cada visitante considerando tanto sus preferencias como las oportunidades disponibles en el entorno. El motor puede priorizar puntos que sean relevantes para el usuario y que, además, ayuden a distribuir la atención hacia negocios o actividades que necesitan mayor visibilidad.

## 4.1 Variables de recomendación

| **Variable**      | **Qué representa**                                              | **Uso en la recomendación**               |
|-------------------|-----------------------------------------------------------------|-------------------------------------------|
| Preferencias      | Historia, gastronomía, cultura, paseo, compras.                 | Ajusta la temática de la ruta.            |
| Tiempo disponible | Duración declarada por el visitante.                            | Limita el número de paradas.              |
| Distancia         | Separación entre puntos y posición, si se autoriza.             | Evita recorridos poco prácticos.          |
| Disponibilidad    | Horario y vigencia informados.                                  | Evita recomendar opciones no disponibles. |
| Oportunidad       | Comercio nuevo, promoción o punto con baja interacción digital. | Diversifica las recomendaciones.          |
| Recompensa        | Puntos o beneficio publicado.                                   | Añade un incentivo transparente.          |

## 4.2 Lógica inicial del algoritmo

Para el hackathon se recomienda un algoritmo de puntuación sencillo, explicable y determinista, en lugar de depender por completo de un modelo de IA. Cada punto candidato recibe una puntuación de acuerdo con su afinidad con los intereses, cercanía, compatibilidad horaria, duración y oportunidad de promoción.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>PUNTUACIÓN CONCEPTUAL<br />
</strong>Puntaje = afinidad de intereses + cercanía + disponibilidad + ajuste al tiempo + prioridad de oportunidad. Los pesos se configuran y se explican; no deben presentarse como una medición científica hasta calibrarlos con datos reales.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

La primera versión puede calcular la puntuación con reglas y ordenar los resultados. La IA generativa se utiliza para redactar la misión, explicar por qué se recomienda y responder preguntas basadas en información registrada. La IA no debe inventar horarios, eventos, precios ni disponibilidad.

# 5. Ejemplo de uso

Una visitante llega al Zócalo y escanea el QR de Pulso Jarocho. Selecciona que dispone de 90 minutos, le interesa la gastronomía y la historia, y prefiere gastar poco. El sistema propone una ruta corta con un punto histórico, un comercio local participante y un espacio público cercano. La visitante acepta una misión para conocer el negocio, consulta su ficha y llega al establecimiento.

En el local, escanea un QR de visita. El sistema registra la misión completada y suma puntos a su pasaporte. Si el comercio ofrece una promoción, la visitante puede consultar sus condiciones y mostrar el beneficio al personal. En el panel, el comerciante observa el registro de la visita y el administrador ve una interacción adicional en las métricas de la campaña.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>RESULTADO ESPERADO<br />
</strong>Una misma experiencia conecta al visitante, al negocio y a quien gestiona el destino. El piloto mide interacciones verificadas; cualquier afirmación sobre incremento de ventas o afluencia deberá comprobarse mediante evaluación posterior.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 6. Alcance del prototipo de 24 horas (MVP)

El equipo debe priorizar una demostración completa de principio a fin. Se recomienda limitar el prototipo a entre 10 y 15 puntos cargados manualmente, entre 5 y 10 comercios de demostración y una o dos rutas temáticas. Los datos de ejemplo deben identificarse claramente como demostrativos.

| **Función** | **MVP en 24 horas**                                    | **Dejar para después**                           |
|-------------|--------------------------------------------------------|--------------------------------------------------|
| Mapa        | Puntos turísticos y comercios de prueba.               | Capas avanzadas y navegación paso a paso.        |
| Rutas       | Filtros por tiempo e interés; orden básico de paradas. | Optimización avanzada y tráfico en vivo.         |
| QR          | Validación de misión con QR único por punto.           | Antifraude avanzado y hardware.                  |
| Recompensas | Puntos y canje simulado o controlado.                  | Pagos, monedero o programa interoperable.        |
| Comercios   | Alta y edición básica de ficha/promoción.              | Portal comercial completo y facturación.         |
| Panel       | Conteos de interacciones y misiones.                   | Predicción de afluencia y analítica sofisticada. |
| IA          | Generación de texto de misiones y asistente acotado.   | Agente autónomo y recomendaciones complejas.     |

# 7. Arquitectura y tecnologías

Se propone una arquitectura web sencilla, con un solo repositorio y una base de datos central. Esto reduce el riesgo de integración y permite que cinco integrantes trabajen en paralelo, cada uno en su propia rama y sus propias carpetas (sección 11).

| **Tecnología**            | **Responsabilidad**                                    | **Motivo de elección**                                                           |
|---------------------------|--------------------------------------------------------|----------------------------------------------------------------------------------|
| Next.js + React           | Interfaz y rutas de la aplicación.                     | Ecosistema conocido, componentes reutilizables y despliegue rápido.              |
| Tailwind CSS              | Estilos y diseño adaptable.                            | Permite construir una interfaz consistente con rapidez.                          |
| Supabase / PostgreSQL     | Usuarios, comercios, lugares, misiones y registros QR. | Base de datos relacional, autenticación y API integrada.                         |
| Leaflet + OpenStreetMap   | Mapa y marcadores.                                     | Alternativa flexible para el prototipo; revisar atribución y condiciones de uso. |
| API de IA (Gemini u otra) | Redacción de misiones y asistente contextual.          | Aporta interacción generativa sin delegar decisiones críticas.                   |
| QRCode / ZXing            | Generar y leer códigos QR.                             | Tecnología sencilla para validar interacciones.                                  |
| Recharts                  | Gráficas del panel.                                    | Visualizaciones rápidas con React.                                               |
| Vercel                    | Publicación del frontend.                              | Despliegue rápido para una demo compartible.                                     |

## 7.1 Componentes de la arquitectura

- Frontend PWA: interfaz para visitante, comerciante y administrador, con diseño responsive.

- Backend y reglas: operaciones para consultar lugares, crear rutas, registrar misiones y validar QR.

- Base de datos: almacenamiento de usuarios, puntos, comercios, eventos, promociones, misiones y actividad.

- Servicios externos: mapas y, de forma opcional, API de IA.

- Analítica: consultas agregadas sobre eventos de uso y resultados de las campañas.

## 7.2 Modelo de datos mínimo

- profiles: identificador, alias, rol y fecha de registro.

- places: nombre, categoría, coordenadas, descripción, horario y estado de verificación.

- businesses: lugar asociado, responsable, contacto y estado de participación.

- events: nombre, descripción, fecha, ubicación y fuente de información.

- missions: título, reglas, puntos, vigencia, lugar asociado y estado.

- qr_tokens: identificador, punto asociado, vigencia y estado de uso.

- visits: usuario seudónimo, punto, misión, fecha y método de validación.

- rewards: comercio, beneficio, condiciones, vigencia y canjes.

# 8. Seguridad, privacidad y confianza

- Solicitar ubicación solo cuando sea necesaria y con consentimiento; permitir introducir preferencias manualmente.

- Evitar almacenar trayectorias continuas. Para el MVP, registrar únicamente interacciones necesarias para validar misiones.

- Usar identificadores seudónimos en reportes y mostrar métricas agregadas.

- Proteger operaciones de administrador y comerciante mediante roles y permisos de base de datos.

- Generar QR con identificadores no predecibles, vigencia y validación del lado del servidor; evitar que el cliente pueda asignarse puntos directamente.

- Publicar condiciones, vigencia y límites de cada promoción. El canje debe confirmarlo el comercio.

- Verificar la información de horarios, eventos y accesibilidad antes de mostrarla como confirmada.

- No presentar escaneos QR como afluencia peatonal real ni como prueba de ventas.

# 9. Indicadores de éxito del piloto

Los indicadores propuestos miden el desempeño del prototipo. Las metas son objetivos de prueba, no resultados existentes ni promesas de impacto.

| **Indicador**          | **Meta ilustrativa**                  | **Cómo se mide**                           |
|------------------------|---------------------------------------|--------------------------------------------|
| Participación          | 100 visitantes de prueba              | Usuarios que inician una experiencia.      |
| Oferta                 | 10 comercios y 10 puntos              | Registros activos y verificados.           |
| Conversión de misión   | 50% de misiones aceptadas completadas | Misiones completadas / aceptadas.          |
| Uso de recompensas     | 30 canjes o pruebas de canje          | Registros de canje confirmados.            |
| Calidad de información | 90% de fichas revisadas               | Lista de verificación de datos y horarios. |
| Satisfacción           | Promedio objetivo de 4/5              | Encuesta breve posterior al recorrido.     |

# 10. Plan de ejecución por puntos de control

El trabajo se organiza alrededor de los dos puntos de control obligatorios. Cada uno exige un commit en el repositorio antes de la hora límite, así que el plan no se mide en horas trabajadas, sino en lo que debe estar en main y funcionando en cada corte. El principio es construir primero un «esqueleto vivo» y después ir llenándolo, en lugar de terminar módulos aislados que se integran al final.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>REGLAS DE ORO DE LOS PUNTOS DE CONTROL</strong></p>
<p>1. El commit de cada punto de control se hace 10 minutos antes del límite: 16:50 y 19:50. Nunca a las 16:59.</p>
<p>2. main siempre compila y está desplegado. Lo que no funcione se queda en su rama; no se rompe main para llegar al corte.</p>
<p>3. Cada integrante hace commits desde su propia cuenta de GitHub, para que el aporte de los cinco quede registrado.</p>
<p>4. Si a la hora de cierre algo no está listo, se recorta alcance; no se mueve la hora de cierre.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 10.1 Línea de tiempo

| **Fase**                            | **Horario**            | **Objetivo**                                                                                                | **Evidencia en el repositorio**                    |
|-------------------------------------|------------------------|-------------------------------------------------------------------------------------------------------------|----------------------------------------------------|
| **Fase 0 · Arranque**               | Primeros 45 min        | Repositorio, proyecto desplegado vacío, base de datos creada y contratos de API acordados.                  | Commit inicial en main; URL de Vercel funcionando. |
| **Fase 1 · Esqueleto vivo**         | Hasta 16:30            | Todas las pantallas navegables, datos semilla en Supabase y motor de recomendación con pruebas.             | —                                                  |
| **Punto de control 1**              | 16:30 – 16:50          | Ventana de integración y commit obligatorio.                                                                | Commit en main + etiqueta cp1 antes de 17:00.      |
| **Fase 2 · Flujo de oro**           | 17:00 – 19:30          | El recorrido completo funciona con datos reales: preferencias → ruta → misión → QR → puntos → tablero.      | —                                                  |
| **Punto de control 2**              | 19:30 – 19:50          | Ventana de integración y commit obligatorio.                                                                | Commit en main + etiqueta cp2 antes de 20:00.      |
| **Fase 3 · Pulido y pitch**         | 20:00 – 07:00 (jueves) | PWA, diseño, datos verificados, QR impresos, pruebas en teléfonos, borrador del pitch y turnos de descanso. | Commits pequeños vía PR.                           |
| **Requisito nuevo**                 | Jueves 07:00 – 07:30   | Leer, analizar y repartir el requisito nuevo del reto (sección 10.6).                                       | Etiqueta pre-jueves en main antes de las 7:00.     |
| **Fase 3b · Implementar requisito** | 07:30 – entrega −3 h   | Implementar la versión mínima demostrable del requisito y agregarla al pitch.                               | Rama feat/requisito-jueves; commit en main.        |
| **Fase 4 · Congelamiento**          | Últimas 3 h            | Solo correcciones críticas, ensayos del pitch y video de respaldo.                                          | Etiqueta v1.0-final.                               |

## 10.2 Fase 0 · Arranque (todos, primeros 45 minutos)

- **Integrante 2:** crea el repositorio, el proyecto Next.js con TypeScript y Tailwind, protege main, invita a los demás y conecta Vercel para que cada cambio en main se publique solo.

- **Integrante 3:** crea el proyecto de Supabase, comparte las variables de entorno por un canal privado (nunca en el repositorio) y sube .env.example y lib/types.ts con los tipos compartidos.

- **Integrante 4:** define los pesos iniciales del motor y el formato exacto de la respuesta de /api/route.

- **Integrantes 1 y 5:** bocetan en papel o Figma las seis pantallas clave y fijan colores, tipografía y logo.

- **Todos:** eligen los 12 lugares y 6 comercios de la demo dentro de un área pequeña (Zócalo, Portales, Malecón y calles cercanas) y acuerdan los contratos de API de la sección 11.3.

## 10.3 Punto de control 1 · «Esqueleto vivo» (commit antes de 17:00)

Meta: una URL pública donde se pueda navegar por todas las pantallas, con lugares reales leídos de la base de datos y un motor que ya ordena paradas. Mientras el backend no esté listo, el frontend trabaja con datos de prueba en lib/mock para que nadie se quede esperando.

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 15%" />
<col style="width: 39%" />
<col style="width: 24%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Integrante</strong></th>
<th><strong>Rama</strong></th>
<th><strong>Actividades</strong></th>
<th><strong>Listo cuando…</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p><strong>Integrante 1</strong></p>
<p><strong>Visitante</strong></p></td>
<td>feat/visitante</td>
<td>Pantallas de inicio y preferencias (tiempo, intereses y presupuesto), ruta sugerida, detalle de misión y pasaporte, con datos de prueba. Diseño pensado para teléfono.</td>
<td>Se recorren las 4 pantallas en un teléfono sin errores.</td>
</tr>
<tr class="even">
<td><p><strong>Integrante 2</strong></p>
<p><strong>Mapa, QR e integración</strong></p></td>
<td>feat/mapa-qr</td>
<td>Componente de mapa con Leaflet y OpenStreetMap con marcadores (cargado sin SSR). Pantalla /escanear que lee un QR con la cámara y muestra el token.</td>
<td>El mapa se ve en la pantalla de ruta y la cámara lee un QR de prueba.</td>
</tr>
<tr class="odd">
<td><p><strong>Integrante 3</strong></p>
<p><strong>Backend y datos</strong></p></td>
<td>feat/backend</td>
<td>Esquema SQL de las tablas del modelo de datos, datos semilla (12 lugares, 6 comercios, 4 eventos, 3 misiones, 3 recompensas) y GET /api/places.</td>
<td>/api/places devuelve los lugares reales desde la URL de Vercel.</td>
</tr>
<tr class="even">
<td><p><strong>Integrante 4</strong></p>
<p><strong>Motor e IA</strong></p></td>
<td>feat/motor-ia</td>
<td>lib/engine: función pura que puntúa y ordena paradas según intereses, tiempo, cercanía, horario y oportunidad, y devuelve el motivo de cada parada. 5 pruebas con Vitest.</td>
<td>Las pruebas pasan y la salida incluye motivos legibles.</td>
</tr>
<tr class="odd">
<td><p><strong>Integrante 5</strong></p>
<p><strong>Paneles y pitch</strong></p></td>
<td>feat/paneles</td>
<td>Estructura de /comercio y /admin: tarjetas de indicadores y 2 gráficas con Recharts usando datos de prueba. Primer borrador del guion del pitch.</td>
<td>Ambos paneles se ven y el guion tiene sus 7 bloques.</td>
</tr>
</tbody>
</table>

## 10.4 Punto de control 2 · «Flujo de oro» (commit antes de 20:00)

Meta: una sola persona puede hacer la demostración completa desde un teléfono, en la URL pública, con datos reales: elegir preferencias, recibir la ruta, aceptar una misión, escanear el QR del comercio, ver los puntos en el pasaporte y ver esa visita en el tablero.

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 15%" />
<col style="width: 39%" />
<col style="width: 24%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Integrante</strong></th>
<th><strong>Rama</strong></th>
<th><strong>Actividades</strong></th>
<th><strong>Listo cuando…</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p><strong>Integrante 1</strong></p>
<p><strong>Visitante</strong></p></td>
<td>feat/visitante</td>
<td>Conectar las pantallas a /api/route, /api/places y /api/events; pantalla «Hoy en el centro»; aceptar misión; pasaporte con puntos reales; estados de carga, error y vacío.</td>
<td>El flujo del visitante ya no usa datos de prueba.</td>
</tr>
<tr class="even">
<td><p><strong>Integrante 2</strong></p>
<p><strong>Mapa, QR e integración</strong></p></td>
<td>feat/mapa-qr</td>
<td>Conectar el escáner a /api/visits/validate con confirmación visual de puntos; dibujar la ruta real en el mapa; página /admin/qr para imprimir los QR de cada lugar.</td>
<td>Escanear un QR impreso suma puntos y aparece en el pasaporte.</td>
</tr>
<tr class="odd">
<td><p><strong>Integrante 3</strong></p>
<p><strong>Backend y datos</strong></p></td>
<td>feat/backend</td>
<td>POST /api/route (usa el motor), /api/missions/accept y /api/visits/validate: token no predecible, vigencia, un uso por usuario y puntos calculados en el servidor. GET y POST /api/events. Perfiles de demostración y permisos por rol (RLS).</td>
<td>Un QR repetido o vencido se rechaza; el cliente no puede asignarse puntos.</td>
</tr>
<tr class="even">
<td><p><strong>Integrante 4</strong></p>
<p><strong>Motor e IA</strong></p></td>
<td>feat/motor-ia</td>
<td>/api/ai/mission con Gemini: redacta la misión y el «por qué te lo recomendamos» solo con datos registrados. Tiempo límite de 5 s y plantilla de respaldo si la IA falla. El motor incluye eventos que caben en el tiempo y la bonificación de Centro de noche.</td>
<td>Con o sin IA, cada parada muestra texto de misión y motivo.</td>
</tr>
<tr class="odd">
<td><p><strong>Integrante 5</strong></p>
<p><strong>Paneles y pitch</strong></p></td>
<td>feat/paneles</td>
<td>Paneles conectados a GET /api/stats: misiones aceptadas y completadas, escaneos por lugar y canjes. Actividad por franja horaria. El comercio confirma canjes y publica eventos. Borrador de diapositivas.</td>
<td>Una visita nueva aparece en el tablero en menos de 10 s.</td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>PLAN B SI VAMOS ATRASADOS EN EL PUNTO DE CONTROL 2</strong></p>
<p>Recortar en este orden: (1) IA → usar plantillas de texto; (2) panel de comercio → dejar solo el de administrador; (3) línea de ruta en el mapa → solo marcadores numerados. El flujo QR → puntos → tablero no se recorta: es el corazón de la demo.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 10.5 Fase 3 y 4 · Pulido, pitch y congelamiento (después de las 20:00)

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 15%" />
<col style="width: 39%" />
<col style="width: 24%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Integrante</strong></th>
<th><strong>Rama</strong></th>
<th><strong>Actividades</strong></th>
<th><strong>Listo cuando…</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p><strong>Integrante 1</strong></p>
<p><strong>Visitante</strong></p></td>
<td>feat/visitante</td>
<td>Pulido visual, PWA (manifest, ícono, instalable), pantalla de bienvenida de una sola vista y accesibilidad básica (contraste y tamaño de botones).</td>
<td>La app se instala en el teléfono y se ve profesional.</td>
</tr>
<tr class="even">
<td><p><strong>Integrante 2</strong></p>
<p><strong>Mapa, QR e integración</strong></p></td>
<td>feat/mapa-qr</td>
<td>Pruebas de punta a punta en Android y iPhone, imprimir los QR, grabar el video de respaldo de la demo y administrar los últimos merges.</td>
<td>Existe un video de respaldo de 2 min y los QR están impresos.</td>
</tr>
<tr class="odd">
<td><p><strong>Integrante 3</strong></p>
<p><strong>Backend y datos</strong></p></td>
<td>feat/backend</td>
<td>Revisar datos de los 12 lugares (horarios dudosos marcados «por confirmar») y crear un script de reinicio de la demo (npm run seed:demo).</td>
<td>La base se reinicia en un comando antes de presentar.</td>
</tr>
<tr class="even">
<td><p><strong>Integrante 4</strong></p>
<p><strong>Motor e IA</strong></p></td>
<td>feat/motor-ia</td>
<td>Ajustar pesos del motor con casos reales; preparar la diapositiva que explica el algoritmo; asistente de preguntas acotado solo si sobra tiempo.</td>
<td>Puede explicar el algoritmo en 30 s ante el jurado.</td>
</tr>
<tr class="odd">
<td><p><strong>Integrante 5</strong></p>
<p><strong>Paneles y pitch</strong></p></td>
<td>feat/paneles</td>
<td>Diapositivas finales, ensayos cronometrados de 3 min y lista de respuestas a preguntas probables del jurado (modelo de negocio, escalabilidad, privacidad).</td>
<td>Al menos 3 ensayos completos con el cronómetro.</td>
</tr>
</tbody>
</table>

## 10.6 Requisito nuevo del jueves a las 7:00

El reto recibirá un requisito nuevo el jueves a las 7:00. Es probable que el jurado evalúe qué tan bien se adapta cada equipo, así que se prepara desde hoy: código configurable, una base estable antes de las 7:00 y un protocolo para decidir rápido.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>PREPARACIÓN DESDE HOY (SIN COSTO EXTRA)</strong></p>
<p>Pesos del motor en lib/engine/config.ts, no repartidos por el código.</p>
<p>Textos de la interfaz en un archivo de idioma (lib/i18n/es.ts) desde el inicio.</p>
<p>Interruptores de funciones en lib/flags.ts para activar o apagar módulos sin romper nada.</p>
<p>Columna meta (jsonb) en places, events y businesses para agregar atributos sin migraciones grandes.</p>
<p>Antes de las 7:00, main estable y etiquetada pre-jueves: el cambio empieza desde una base limpia.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## Escenarios probables y qué ya los facilita

| **Posible requisito**                                    | **Respuesta rápida**                                                                      | **Quién lo toma** |
|----------------------------------------------------------|-------------------------------------------------------------------------------------------|-------------------|
| **Turistas de crucero o en inglés**                      | Agregar lib/i18n/en.ts y selector de idioma; la IA redacta misiones en el idioma elegido. | Integrantes 1 y 4 |
| **Accesibilidad o movilidad reducida**                   | Atributo accesible en meta y filtro en el motor; marcar «por confirmar» si no hay dato.   | Integrantes 3 y 4 |
| **Lluvia o calor**                                       | Atributo bajo techo o con sombra y peso del clima en config.ts.                           | Integrante 4      |
| **Evento masivo o temporada (Carnaval, Día de Muertos)** | Cargar eventos en la agenda y subir su peso de oportunidad en el motor.                   | Integrantes 3 y 5 |
| **Datos para autoridades**                               | Exportar CSV desde /api/stats y vista de zonas por franja horaria.                        | Integrantes 3 y 5 |
| **Sin conexión o internet débil**                        | Caché de la PWA para lugares y ruta; el QR se valida cuando vuelve la red.                | Integrante 2      |

## Protocolo de las 7:00

- **07:00–07:10 · Leer:** los cinco leen el requisito completo; nadie programa todavía.

- **07:10–07:20 · Clasificar:** ¿es un dato nuevo, una función nueva o una restricción? ¿Qué ya lo resuelve en parte? Definir la versión mínima que se puede demostrar.

- **07:20–07:30 · Repartir:** asignar por propiedad de carpetas (sección 11.1). El integrante 5 escribe de inmediato la diapositiva «Cómo respondimos al requisito nuevo».

- **Rama:** feat/requisito-jueves (o subramas por persona). Se integra a main con el mismo protocolo de los puntos de control, al menos 3 horas antes de la entrega.

- **Turnos de descanso:** el grupo A (integrantes 1 y 3) descansa de 00:00 a 03:30; el grupo B (2, 4 y 5) de 03:30 a 06:45. A las 7:00 están los cinco despiertos y main estable.

# 11. Equipo, ramas y flujo de trabajo en Git

## 11.1 Roles y propiedad del código

Cada integrante es dueño de un conjunto de carpetas. Así se trabaja en paralelo casi sin conflictos de merge: nadie edita las carpetas de otro sin avisar.

| **Integrante**   | **Rol**                                              | **Rama**       | **Carpetas que le pertenecen**                                                |
|------------------|------------------------------------------------------|----------------|-------------------------------------------------------------------------------|
| **Integrante 1** | Frontend del visitante                               | feat/visitante | app/(visitante)/\*\*, components/visitante/\*\*, lib/mock/\*\*                |
| **Integrante 2** | Mapa, QR, integración y despliegue (dueño de main)   | feat/mapa-qr   | components/mapa/\*\*, app/escanear/\*\*, lib/qr/\*\*, configuración de Vercel |
| **Integrante 3** | Backend, base de datos y seguridad                   | feat/backend   | supabase/\*\*, app/api/\*\* (excepto IA), lib/db/\*\*, lib/types.ts           |
| **Integrante 4** | Motor de recomendación e IA                          | feat/motor-ia  | lib/engine/\*\*, lib/ai/\*\*, app/api/ai/\*\*, pruebas del motor              |
| **Integrante 5** | Paneles de comercio y administrador; líder del pitch | feat/paneles   | app/(panel)/\*\*, components/paneles/\*\*, carpeta del pitch                  |

## 11.2 Estrategia de ramas

- **main:** siempre compila y está desplegada en Vercel. Protegida: solo recibe cambios por Pull Request. El integrante 2 hace los merges en los puntos de control.

- **feat/\<área\>:** una rama por integrante durante todo el evento. Antes de abrir un PR, cada quien trae los cambios de main (git pull origin main) y resuelve sus propios conflictos.

- **fix/\<descripción\>:** ramas cortas para errores encontrados en pruebas, sobre todo en la fase 3.

- **Sincronización cada hora:** todos hacen pull de main al menos una vez por hora para no acumular diferencias.

- **Archivos compartidos:** package.json, app/layout.tsx y lib/types.ts solo los modifica su dueño. Si alguien necesita instalar una librería, lo avisa en el chat del equipo antes.

- **Vistas previas:** cada PR genera una URL de vista previa en Vercel para probar antes de unir a main.

## 11.3 Contratos de API (se acuerdan en la fase 0)

| **Endpoint**                  | **Entrada**                                             | **Salida**                                                                     | **Dueño**                   |
|-------------------------------|---------------------------------------------------------|--------------------------------------------------------------------------------|-----------------------------|
| **GET /api/places**           | —                                                       | Lista de lugares con categoría, coordenadas, horario y estado de verificación. | Integrante 3                |
| **POST /api/route**           | minutos, intereses\[\], presupuesto, ubicación opcional | Paradas ordenadas con distancia, tiempo estimado y motivo.                     | Integrantes 3 y 4           |
| **GET y POST /api/events**    | fecha o «ahora»; datos del evento al publicar           | Eventos de hoy con lugar, hora, categoría y estado de verificación.            | Integrante 3                |
| **POST /api/missions/accept** | id de misión                                            | Misión aceptada con su estado.                                                 | Integrante 3                |
| **POST /api/visits/validate** | token del QR                                            | Puntos sumados, misión completada (sí/no) y total del pasaporte.               | Integrante 3                |
| **POST /api/ai/mission**      | id de lugar y preferencias                              | Texto de misión y «por qué te lo recomendamos».                                | Integrante 4                |
| **GET /api/stats**            | periodo opcional                                        | Misiones, escaneos por lugar, canjes y comercios más visitados.                | Integrante 3 (consume el 5) |

## 11.4 Protocolo de commit en cada punto de control

Se aplica igual en ambos cortes. Horarios para el punto de control 1 (entre paréntesis, el punto de control 2):

- **16:20 (19:20) · Aviso de cierre:** el integrante 2 avisa al equipo. Nadie empieza funciones nuevas.

- **16:30 (19:30) · PR abiertos:** cada integrante abre su PR con lo que funcione. Lo incompleto se deja fuera o desconectado del menú, nunca roto.

- **16:30–16:45 (19:30–19:45) · Integración:** el integrante 2 une en este orden: backend → motor/IA → mapa/QR → visitante → paneles, y corre npm run build después de cada merge.

- **16:50 (19:50) · Commit y etiqueta:** push a main con el mensaje «chore: punto de control 1» (o 2) y etiqueta cp1 (o cp2).

- **16:55 (19:55) · Verificación:** confirmar en GitHub que el commit aparece con hora anterior al límite, que Vercel publicó sin errores y tomar captura de pantalla como evidencia.

## 11.5 Convención de commits

- Formato: tipo(área): descripción corta en presente. Ejemplos: feat(motor): agrega puntuación por cercanía · fix(qr): rechaza tokens vencidos · chore(cp1): punto de control 1.

- Tipos: feat (función nueva), fix (corrección), style (diseño), test (pruebas), docs (documentación), chore (configuración y cortes).

- Commits pequeños y frecuentes, al menos uno cada 30–45 minutos por persona. Un historial activo de los cinco integrantes también comunica trabajo en equipo al jurado.

# 12. Guion de demostración ante el jurado

Duración sugerida: 3 minutos. La demostración debe contar una historia completa y no limitarse a recorrer pantallas.

1.  Problema (20 segundos): mostrar que el visitante puede concentrarse en unos pocos sitios y desconocer negocios o actividades cercanas.

2.  Entrada (25 segundos): escanear el QR de Pulso Jarocho y elegir tiempo, intereses y presupuesto.

3.  Recomendación (35 segundos): generar una ruta y explicar por qué el motor priorizó cada parada.

4.  Misión y visita (40 segundos): aceptar una misión, llegar al comercio de prueba y escanear el QR.

5.  Beneficio comercial (25 segundos): mostrar al comerciante el registro de interacción o canje.

6.  Impacto medible (25 segundos): abrir el tablero y mostrar misiones, escaneos y puntos con mayor actividad digital.

7.  Cierre (10 segundos): explicar cómo el sistema convierte exploración en conexión económica y cultural.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>MOMENTO MEMORABLE DE LA DEMO</strong></p>
<p>En el paso 6, entregar a un integrante del jurado un QR impreso para que lo escanee con su propio teléfono. Su visita aparece en vivo en el tablero mientras se presenta. Si la red falla, se usa el video de respaldo grabado en la fase 3.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 13. Pitch de presentación

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>PITCH SUGERIDO<br />
</strong>“Hoy, muchas personas visitan el Centro Histórico de Veracruz, pero no necesariamente descubren todo lo que tiene para ofrecer. Los negocios locales y las actividades culturales compiten por captar su atención, mientras la información se encuentra dispersa. Pulso Jarocho convierte esa desconexión en una oportunidad: crea misiones personalizadas que invitan a explorar otros rincones, valida las visitas mediante QR y recompensa la participación. Cada recorrido genera una conexión entre visitante y comercio, y cada interacción aporta información agregada para entender qué experiencias funcionan. No queremos construir otro directorio turístico: queremos activar la ciudad, una visita a la vez.”</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 14. Riesgos y mitigaciones

| **Riesgo**                                    | **Mitigación**                                                                                                                  |
|-----------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| Información incompleta o desactualizada       | Cargar pocos puntos verificados, indicar fecha de actualización y permitir reportes.                                            |
| QR compartido o reutilizado                   | Token con vigencia, uso limitado y validación en servidor.                                                                      |
| Dependencia de la IA                          | Mantener reglas deterministas para rutas; usar IA solo como apoyo de texto.                                                     |
| Falla de internet o GPS                       | Permitir selección manual del punto y mostrar información básica; la validación QR requiere conexión en el MVP.                 |
| Integración tardía                            | Contratos de API en la fase 0, propiedad de carpetas por integrante y dos puntos de control con commit en main (16:50 y 19:50). |
| Confusión entre actividad digital y afluencia | Etiquetar las métricas como interacciones registradas, no como conteo total de personas.                                        |

# 15. Evolución posterior al hackathon

- Integración con agendas culturales oficiales y mecanismos para confirmar eventos.

- Herramientas de incorporación y capacitación para más comercios.

- Rutas accesibles y filtros de movilidad, cuando se cuente con datos confiables.

- Sistema de campañas patrocinadas con reglas transparentes y medición de resultados.

- Analítica temporal y espacial más robusta, con protección de privacidad y muestras suficientes.

- Integración con programas institucionales y plataformas turísticas existentes, mediante acuerdos y APIs cuando estén disponibles.

# 16. Conclusión

Pulso Jarocho propone una manera práctica de conectar turismo, cultura y comercio mediante una experiencia digital participativa. Su principal diferenciador es el motor de oportunidades urbanas: en vez de limitarse a informar qué existe, recomienda acciones concretas que pueden llevar al visitante a descubrir nuevos lugares y al comercio local a recibir atención. Para el hackathon, el alcance se concentra en un recorrido funcional con recomendación, misión, QR, recompensa y tablero. Esta demostración permite explicar tanto la innovación como su viabilidad técnica y su potencial de crecimiento.

# Anexo A. Datos mínimos para cargar en la demo

- 10–15 puntos de interés: nombre, categoría, coordenadas, descripción breve y horario verificado o marcado como pendiente.

- 5–10 comercios ficticios o participantes que hayan autorizado aparecer en la demo.

- 2 rutas temáticas de ejemplo: historia y cultura; gastronomía y paseo.

- 3 misiones: descubrir un comercio, visitar un punto cultural y asistir a una actividad.

- 3 recompensas de demostración con condiciones claras y 4 eventos en la agenda (hoy y mañana, al menos uno nocturno).

- 1 QR por punto de validación, con tokens de prueba.

# Anexo B. Decisiones que deben cerrarse al iniciar

- Confirmar nombre final, identidad visual y frase de marca.

- Elegir un área geográfica pequeña para la demo y verificar manualmente los puntos.

- Acordar quién puede crear comercios, misiones y recompensas.

- Definir si el piloto usa cuentas reales o perfiles de demostración.

- Establecer el formato de QR y el procedimiento de validación en servidor.

- Congelar el alcance después del punto de control 2 (20:00) salvo pulido, correcciones críticas y el requisito nuevo del jueves; congelamiento total en las últimas 3 horas.

**Nota:** Esta propuesta es un documento de diseño para un prototipo de hackathon. Los nombres de negocios, promociones, horarios, eventos y métricas deberán verificarse antes de una prueba pública. Las cifras de metas son ilustrativas y no representan resultados ya obtenidos.
