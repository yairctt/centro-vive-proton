# Explicación de Dominio — Módulo de Paneles (Admin y Comercio)

> **Responsable:** Integrante 5 (`feat/paneles`)  
> **Ubicación:** `app/(panel)/admin`, `app/(panel)/comercio`, `components/paneles`

---

## 1. Qué hace el módulo

El módulo de paneles provee las dos interfaces clave de gestión y visualización de **Pulso Jarocho**:
1. **Tablero de Administración (`/admin`):** Monitor de afluencia digital urbana en tiempo real para gestores de turismo y autoridades. Muestra el pulso de la ciudad mediante KPIs de interacción, distribución de escaneos por lugar, la gráfica de brecha horaria (demanda nocturna vs comercios abiertos) y un feed de visitas en vivo (< 10 s).
2. **Panel de Comercio (`/comercio`):** Vitrina comercial para negocios locales (como el Gran Café de la Parroquia, Mercado de Artesanías o Toritos La Chata). Les permite gestionar su estado (abierto/cerrado), publicar promociones con costo en puntos, confirmar canjes en caja presencial y publicar eventos rápidos para la agenda cultural.

---

## 2. Cómo funciona en 5 líneas simples

1. Los componentes leen las métricas agregadas de actividad (`Stats`), estructuradas según el contrato de `lib/types.ts`.
2. Las tarjetas KPI calculan y muestran el volumen de interacciones, misiones completadas, canjes y lugares activos.
3. Recharts renderiza dos visualizaciones clave en cada panel de forma responsiva y adaptada a dispositivos móviles.
4. El feed en vivo muestra las visitas validadas por QR al instante, permitiendo probar en la demo la latencia de < 10 segundos.
5. El comerciante valida canjes de códigos digitales y activa/pausa promociones con un solo clic en tiempo real.

---

## 3. Decisiones técnicas

- **Recharts en modo cliente (`"use client"`):** Debido a que Recharts calcula dimensiones en el DOM y SVG, los componentes de gráficas se aíslan como componentes cliente responsivos con `ResponsiveContainer` para evitar fallos de hidratación en SSR.
- **Rigor metodológico en métricas (Regla 9):** En todo momento se especifica que los datos representan *"actividad registrada en la app"* y no un conteo peatonal total ni ventas, evitando falsas expectativas y garantizando veracidad técnica.
- **Visualización de la Brecha de Horario:** Diseñada como un gráfico compuesto (Área + Línea) para contrastar directamente el pico de actividad vespertina/nocturna (18:00–22:00) con la caída de comercios abiertos, respaldando la necesidad del "Centro de Noche" y el bono nocturno.
- **Arquitectura de componentes desacoplada:** Los componentes (`KpiCard`, `ScansByPlaceChart`, `ActivityByHourChart`, `LiveVisitsFeed`, `ComercioFicha`, `ComercioPromos`, `ComercioCanjesList`) residen en `components/paneles/` y consumen tipos de `lib/types.ts`, facilitando la transición transparente de datos mock a la API `GET /api/stats` en el Punto de Control 2.

---

## 4. Preguntas probables del jurado y respuestas preparadas

### P1: ¿Por qué tienen un panel para comercios además del tablero del administrador?
> **Respuesta:** *"Porque para que un sistema de reactivación urbana funcione, el comerciante debe ser un participante activo y no un sujeto pasivo. El panel de comercio le da control directo: ve cuántos turistas le ha enviado la plataforma, confirma canjes en caja para evitar fraudes y puede publicar ofertas o eventos en minutos para llenar horas con poca afluencia."*

### P2: ¿Cómo se actualiza el feed en vivo para que el jurado vea su visita en < 10 segundos?
> **Respuesta:** *"En la arquitectura completa se conecta a las mutaciones de la tabla `visits` en Supabase (vía Supabase Realtime o polling ligero cada 5 segundos en `GET /api/stats`). Para la demo de CP1 contamos además con un disparador interactivo simulado que inserta inmediatamente el evento en el estado local garantizando una experiencia visual instantánea."*

### P3: ¿Qué utilidad práctica tiene para las autoridades ver la gráfica de 'Actividad vs. Comercios Abiertos'?
> **Respuesta:** *"Es la prueba cuantitativa de la oportunidad económica desaprovechada. Muestra que mientras los visitantes siguen activos y buscando experiencias en el Centro Histórico después de las 19:00 hrs, la mayoría de los negocios tradicionales ya cerraron sus puertas. Sirve a las cámaras de comercio y al ayuntamiento para justificar incentivos de apertura nocturna, iluminación y seguridad."*
