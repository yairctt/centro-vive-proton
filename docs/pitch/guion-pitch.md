# Guion del Pitch y Presentación — Pulso Jarocho

> **Equipo:** Pulso Jarocho · Reto 6: Centro Vivo (Turismo y Centro Histórico de Veracruz)  
> **Líder del Pitch:** Integrante 5  
> **Duración total:** 3 minutos cronometrados  

---

## 1. Identidad Visual y Marca

- **Nombre:** Pulso Jarocho
- **Tagline:** _"La ciudad se activa contigo."_
- **Paleta de Colores:**
  - **Verde Golfo / Teal (`#0f766e`):** Identidad del mar, tradición jarocha y puerto histórico.
  - **Ámbar Sol / Oro (`#d97706`):** Danzón, energía, artesanías y eventos culturales.
  - **Rojo Pulso / Coral (`#e11d48`):** Dinamismo, misiones activas y rutas vivas.
  - **Azul Puerto (`#2563eb`):** Brisa marina, escaneos presenciales y tecnología confiable.
- **Logotipo:** Isotipo minimalista con las iniciales **PJ** entrelazadas simulando las olas del Malecón y la aguja de una brújula urbana.

---

## 2. Los 4 Eventos Clave de la Demostración

1. **Danzón en la Plazuela de la Campana (18:00–21:00):** Tradición jarocha al aire libre en el corazón del centro.
2. **Noche de son en el Malecón (20:00–23:30):** Evento nocturno clave para el "Centro de Noche", impulsando la actividad después de las 19:00 hrs.
3. **Ruta del café y el pan dulce (10:00–12:00):** Activación gastronómica tradicional con parada en el Gran Café de la Parroquia.
4. **Tarde de artesanías en el Mercado Hidalgo (16:00–19:00):** Promoción del comercio local y artesanos veracruzanos.

---

## 3. Guion de 3 Minutos (7 Bloques)

```
[0:00 - 0:20] 1. El Problema (20s)
[0:20 - 0:45] 2. La Entrada y Preferencias (25s)
[0:45 - 1:20] 3. Recomendación Inteligente (35s)
[1:20 - 2:00] 4. Misión y Visita (40s)
[2:00 - 2:25] 5. Beneficio Comercial (25s)
[2:25 - 2:50] 6. Impacto Medible (25s) ──★ MOMENTO MEMORABLE DEL JURADO
[2:50 - 3:00] 7. Cierre y Visión (10s)
```

### Bloque 1 · Problema (0:00 – 0:20 · 20 segundos)
> *"El Centro Histórico de Veracruz tiene historia, son jarocho y gastronomía única, pero la mayoría de los turistas lo recorre en apenas dos horas concentrados solo entre el Zócalo y el Malecón. Mientras tanto, calles aledañas tienen comercios vacíos, negocios que cierran temprano por falta de clientes y eventos culturales de los que casi nadie se entera."*

### Bloque 2 · Entrada (0:20 – 0:45 · 25 segundos)
> *"Pulso Jarocho resuelve esto sin pedirle al usuario descargar ninguna app: abre la PWA desde su navegador o escaneando un cartel en el Zócalo. El visitante elige tres datos simples: cuánto tiempo tiene (por ejemplo, 90 minutos), qué le interesa (gastronomía e historia) y su presupuesto. Nada de formularios pesados."*

### Bloque 3 · Recomendación (0:45 – 1:20 · 35 segundos)
> *"Al instante, nuestro motor determinista calcula la mejor ruta urbana a pie. No es una caja negra: el sistema explica de forma transparente cada parada: 'Te recomendamos el Gran Café de la Parroquia porque buscas gastronomía tradicional, está a 4 minutos a pie y tiene una misión activa hoy'. La IA redacta el motivo humano y contextual sin inventar horarios."*

### Bloque 4 · Misión y Visita (1:20 – 2:00 · 40 segundos)
> *"El visitante acepta la misión 'Descubre el tintineo del lechero tradicional'. Camina al establecimiento, consume localmente y escanea el código QR exclusivo del comercio. En el servidor se valida la visita en menos de 1 segundo: el visitante gana 50 puntos en su Pasaporte Digital y desbloquea un beneficio exclusivo."*

### Bloque 5 · Beneficio Comercial (2:00 – 2:25 · 25 segundos)
> *"En el panel del comerciante, el encargado ve la visita reflejada en su vitrina digital, confirma el canje del cupón del visitante y puede publicar nuevas promociones o eventos en segundos. El comercio ya no depende de la suerte: recibe flujo dirigido que buscaba exactamente lo que él vende."*

### Bloque 6 · Impacto Medible ★ MOMENTO MEMORABLE (2:25 – 2:50 · 25 segundos)
> *(Acción en vivo)*: *"Entregamos ahora mismo un QR impreso a un miembro del jurado. Por favor, escanéelo con la cámara de su teléfono... ¡Miren la pantalla del Tablero de Administración! En menos de 5 segundos, la visita aparece registrada en vivo en el feed y suma a la curva de actividad digital. Además, nuestra gráfica de 'Brecha de Horario' le muestra a las autoridades exactamente cómo la demanda nocturna después de las 19:00 hrs se puede capturar extendiendo la oferta comercial."*

### Bloque 7 · Cierre (2:50 – 3:00 · 10 segundos)
> *"Pulso Jarocho no es otro directorio turístico muerto: es un motor que activa la economía local paso a paso, visita por visita. La ciudad se activa contigo. Muchas gracias."*

---

## 4. Respuestas Preparadas ante Preguntas Probables del Jurado

### 1. ¿Cómo garantizan que la gente no haga trampa con los códigos QR?
> **Respuesta:** *"Los tokens QR son identificadores criptográficos únicos generados en servidor (`crypto.randomUUID()`) que cambian por campaña. La validación se ejecuta exclusivamente en el servidor (service role en Supabase) comprobando que el usuario no haya registrado ya ese mismo token y que el token esté activo. El cliente nunca puede asignarse puntos por sí mismo."*

### 2. ¿Cómo se monetiza y sostiene esta plataforma para el municipio o los comercios?
> **Respuesta:** *"Modelo freemium de tres vías: 1) Ficha básica y presencia en rutas gratuita para comercios locales; 2) Suscripción premium accesible para comercios que deseen lanzar promociones destacadas y campañas con puntos extra; 3) Licenciamiento del tablero analítico para secretarías de turismo y cámaras de comercio (CANACO) para planeación urbana y medición de impacto."*

### 3. ¿Por qué las métricas se presentan como 'actividad registrada en la app' y no afluencia total?
> **Respuesta:** *"Por rigor metodológico y ética de datos. Reconocemos la diferencia entre el conteo total de transeúntes y las señales de interacción verificadas digitalmente. Nuestras métricas reflejan tracción real, visitas confirmadas y canjes comerciales verificables, lo cual es mucho más accionable que una estimación aproximada de cabezas en la calle."*

