# Diapositivas de Presentación — Pulso Jarocho

> **Pitch oficial:** 3 minutos cronometrados  
> **Estructura:** 8 diapositivas de alto impacto visual y conceptual  
> **Líder:** Integrante 5  

---

## Diapositiva 1 · Portada
- **Título principal:** PULSO JAROCHO
- **Subtítulo:** *"La ciudad se activa contigo."*
- **Contexto:** Reto 6 · Centro Vivo — Turismo y Comercio en el Centro Histórico de Veracruz.
- **Identidad visual:**
  - Verde Golfo (`#0f766e`): El mar, el puerto y su historia.
  - Ámbar Sol (`#d97706`): Danzón, energía cultural y comercio local.
  - Coral Pulso (`#e11d48`): Dinamismo urbano y rutas vivas.
- **Equipo:** Equipo Proton (5 roles integrados).

---

## Diapositiva 2 · El Problema del Centro Histórico
- **La paradoja del visitante:**
  - El Centro se recorre en promedio en **menos de 2 horas**.
  - El 80% de los turistas se queda únicamente entre el Zócalo y el Malecón.
- **Consecuencias invisibles:**
  - Comercios tradicionales en calles aledañas con baja afluencia.
  - Negocios que cierran temprano (antes de las 19:00 hrs) por falta de clientes.
  - Cartelera cultural y eventos de los que casi nadie se entera.
- **Gráfica clave:** Curva de permanencia turística vs. oferta cultural desaprovechada.

---

## Diapositiva 3 · Nuestra Solución: Un Motor de Oportunidades Urbanas
- **No es otro directorio turístico pasivo:**
  - Es una **PWA sin descargas** (Next.js, mobile-first).
- **El flujo de 3 pasos para el visitante:**
  1. **Elige:** Tiempo disponible (60/90/120 min), intereses y presupuesto.
  2. **Recorre:** Una ruta inteligente con misiones temáticas a pie.
  3. **Valida:** Escanea el QR exclusivo en el local, gana puntos y canjea recompensas.
- **Tres experiencias unidas:**
  - Visitante (`Explora`) · Comercio (`Participa`) · Autoridades y Gestión (`Observa`).

---

## Diapositiva 4 · La Innovación: Algoritmo Explicable + IA Contextual
- **Puntuación pura y determinista (el algoritmo decide la ruta, no la IA):**
  $$\text{Score} = w_{\text{afinidad}} + w_{\text{cercanía}} + w_{\text{disponibilidad}} + w_{\text{tiempo}} + w_{\text{oportunidad}} + w_{\text{bono\_nocturno}}$$
  - Pesos en uso (`lib/engine/config.ts`): afinidad **0.35**, cercanía **0.25**, disponibilidad **0.15**, tiempo **0.10**, oportunidad **0.15**, bono nocturno **0.10**.
  - Cada parada lleva **el desglose** de su puntuación, no solo el total: por eso el motivo que ve el turista explica la decisión.
- **Cómo se arma la ruta (3 pasos, sin caja negra):**
  1. **Filtro:** se descartan los lugares cerrados ahora y los que no entran en el presupuesto.
  2. **Orden:** se puntúa cada lugar con los seis factores y se ordena.
  3. **Recorrido:** se camina de parada en parada con **vecino más cercano**, sin pasarse de los minutos que declaró el visitante (≈ 80 m/min, distancia real por haversine).
- **Por qué funciona:**
  - Equilibra lo que busca el turista con los comercios y puntos que necesitan visibilidad.
  - **Incentivo «Centro de noche»:** puntos extra pasadas las 19:00 hrs para combatir el cierre temprano.
  - **Todo es configurable:** los pesos viven en un archivo, no en el código. Por eso un requisito nuevo (lluvia, accesibilidad, inglés) se activa cambiando valores, no reescribiendo el motor.
- **El rol estricto de Gemini:**
  - Redacta el motivo de la misión y el *«por qué te lo recomendamos»* sin inventar precios, horarios ni datos no verificados.
  - Si el modelo no responde en 5 segundos o falla, entra una **plantilla de respaldo**: la demo nunca se rompe.
  - El punto clave ante el jurado: **la IA no decide la ruta, la explica.**

---

## Diapositiva 5 · Demostración en Vivo: El Flujo de Oro (< 10 segundos)
- **Momento Memorable de la Presentación:**
  1. *Paso 1:* Generamos una ruta con parada en el Gran Café de la Parroquia.
  2. *Paso 2:* **Un miembro del jurado escanea un código QR impreso** con su teléfono.
  3. *Paso 3:* En la pantalla principal, el **Tablero de Afluencia Digital se actualiza en vivo en menos de 5 segundos**.
- **Lo que demuestra:**
  - La arquitectura de Supabase + Next.js procesa en tiempo real con cero fricción.
  - Verificación en servidor: antifraude nativo.

---

## Diapositiva 6 · La Brecha de Horario (Impacto para las Autoridades)
- **Métricas como «Actividad registrada en la app» (Ética de datos y Regla 9):**
  - Gráfica compuesta: **Interacciones vs. Comercios Abiertos**.
  - Evidencia de que de 18:00 a 22:00 la actividad en la app sube, pero los comercios cierran.
- **Valor accionable para CANACO y el Ayuntamiento:**
  - Permite justificar programas de iluminación, seguridad y extensión de horarios comerciales con datos verificables.

---

## Diapositiva 7 · Modelo de Negocio, Sostenibilidad y Futuro
- **Esquema de monetización viable:**
  - **Freemium para comercios:** Ficha básica gratuita; suscripción para promociones destacadas y campañas con bono de puntos.
  - **Licencia de inteligencia urbana:** Tableros analíticos avanzados para secretarías de turismo y planeación urbana.
- **Capa «Locales Disponibles»:**
  - Mapeo de espacios comerciales vacíos con métricas de afluencia cercana para atraer nuevos emprendedores e inversionistas.

---

## Diapositiva 8 · Cierre
- **Frase final:**
  > *"No queremos construir otro folleto digital: queremos activar la ciudad, una visita a la vez."*
- **Llamado a la acción:**
  - **Pulso Jarocho:** *La ciudad se activa contigo.*
  - URL del demo en vivo disponible para el jurado.

