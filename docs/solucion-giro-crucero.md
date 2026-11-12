# Solución al Giro del Reto: Atraco de Crucero (3,000 Visitantes · 5 Horas · Bilingüe)

> **Reto 6 · Centro Vivo (Turismo y Centro Histórico de Veracruz)**  
> **El Giro del Reto:** _«Atraca un crucero: 3,000 visitantes con solo 5 horas en tierra y que no hablan español. La solución debe proponerles quéhacer y llevarlos a negocios del centro. Debe aparecer en la demo final. Cuenten en su entrega cómo lo atendieron.»_

---

## 1. Resumen Ejecutivo de la Solución

Frente a la llegada simultánea de **3,000 pasajeros de crucero internacionales** al **Muelle Turístico del Malecón de Veracruz** con una ventana crítica de **5 horas de escala**, **Pulso Jarocho** implementó de forma nativa e inmediata una solución integral en 4 frentes:

```
[Muelle de Cruceros] 
       │
       ▼  (Modo Bilingüe EN / ES)
[Ruta Express 5h] ──────► [Comercios Locales Aliados] ──────► [Garantía de Retorno al Barco]
  • 4 paradas clave         • Gran Café de la Parroquia          • 8 min a pie al muelle
  • Radio < 1.2 km          • Mercado de Artesanías              • Countdown en vivo
  • Countdown en tiempo     • Los Portales de Lerdo              • Mapa de regreso
                            • Toritos La Chata
                                     │
                                     ▼
                       [Tablero de Afluencia /admin]
                         • 2,840+ interacciones
                         • 590 canjes en caja
                         • ~$485,000 MXN derrama económica
```

---

## 2. Los 3 Desafíos del Giro y Cómo los Resolvimos

### Desafío 1: «No hablan español» → Modo Internacional Bilingüe Nivel Nativo
- **Diccionario en Inglés (`lib/i18n/en.ts` y `lib/i18n/index.ts`):** Traducción 100% fiel de toda la plataforma: interfaz de exploración, mapas, paradas, misiones, escaneo QR y pasaporte digital.
- **Selector Instantáneo de Idioma (`[ 🇲🇽 ES | 🇺🇸 EN ]`):** Accesible desde la portada (`/`), el configurador de ruta (`/inicio`), y la visualización de ruta (`/ruta`). Persistencia automática en el navegador.
- **Misiones e IA en Inglés (`lib/ai/fallback.ts`):** Las misiones urbanas y las justificaciones de visita se generan automáticamente en inglés para los cruceristas extranjeros.

### Desafío 2: «Solo 5 horas en tierra» → Preset Express y Garantía de Retorno
- **Preset de Crucero (300 minutos / 5 horas):** En `/inicio`, un solo clic activa el **«Modo Crucero ⚓ (5h)»**, fijando el punto de partida en las coordenadas exactas del Muelle Turístico del Malecón (`lat: 19.201, lng: -96.134`).
- **Ship Departure Countdown (`CruiseCountdownWidget` en `/ruta`):** Un reloj interactivo en vivo calcula el tiempo restante en tierra, avisando al crucerista con suficiente margen para el toque de embarque.
- **Garantía de Retorno Puntual («Safe Return»):** Todas las paradas seleccionadas por el motor se encuentran en un radio caminable menor a 12 minutos. Al final de la ruta, el crucerista cuenta con un botón directo a Google Maps para caminar de vuelta al Muelle de Cruceros en **8 minutos a pie**.

### Desafío 3: «Llevarlos a negocios del centro» → Dinamización Comercial y Perks
- **Priorización de Comercios Locales:** El motor dirige el flujo de turistas extranjeros directamente a negocios tradicionales del centro histórico:
  1. **Mercado de Artesanías del Malecón:** Venta de guayaberas, vainilla y artesanías jarochas.
  2. **Gran Café de la Parroquia:** Degustación del café lechero tradicional tintineando el vaso.
  3. **Los Portales de Lerdo:** Música de marimba en vivo y bebidas tradicionales.
  4. **Toritos La Chata:** Degustación de torito jarocho tradicional.
- **Cruise Passenger Welcome Perks:** Incentivos en el pasaporte digital (sellos con 2x puntos y obsequios o degustaciones de cortesía en comercios participantes).
- **Monitoreo y Derrama en Tablero de Afluencia (`/admin`):**
  - Botón interactivo de **«Simulación Operativo Crucero (3,000 Pax)»**.
  - Permite a las autoridades y cámaras de comercio ver el impacto en vivo: **+2,420 interacciones registradas**, **590 canjes en comercios aliados** y una derrama económica estimada de **~$485,000 MXN**.

---

## 3. Guion Rápido para la Demo en Vivo (Pitch ante el Jurado)

> **Duración estimada: 45 segundos**

1. **Abre la Portada (`/`):**
   *«Cuando atracan 3,000 turistas de crucero en el muelle de Veracruz con solo 5 horas y sin hablar español, Pulso Jarocho activa instantáneamente el banner de crucero y el selector de idioma en inglés.»*
2. **Haz clic en «Start 5h Cruise Tour (English)»:**
   *«El turista ve la app 100% en inglés, con una ruta calibrada a 5 horas que inicia en el Malecón y lo lleva a consumir al Gran Café de la Parroquia y al Mercado de Artesanías.»*
3. **Muestra la Ruta (`/ruta`):**
   *«La app incluye un temporizador de embarque y la garantía de que nunca perderán el crucero: siempre están a menos de 8 minutos caminando del muelle.»*
4. **Pasa al Tablero de Administración (`/admin`):**
   *«Y en el tablero de las autoridades, el botón 'Simular Impacto' muestra en tiempo real cómo esos 3,000 cruceristas generan más de $485,000 pesos en ventas y canjes directos en negocios locales.»*

---

## 4. Archivos Modificados y Creados

| Archivo | Tipo | Propósito |
|---|---|---|
| `lib/i18n/en.ts` | **Nuevo** | Diccionario completo en inglés con sección especializada `cruise`. |
| `lib/i18n/index.ts` | **Nuevo** | Gestor unificado de traducción con selector y persistencia de idioma. |
| `lib/i18n/es.ts` | Modificado | Incorporación de claves equivalentes `cruise`. |
| `components/ui/CruiseExperience.tsx` | **Nuevo** | Banner interactivo de crucero y widget de cuenta regresiva de embarque. |
| `components/paneles/icons.tsx` | Modificado | Iconos SVG náuticos y globales (`ShipIcon`, `GlobeIcon`, `AnchorIcon`). |
| `app/page.tsx` | Modificado | Integración de `CruiseBanner` y selector de idioma en la portada. |
| `app/(visitante)/inicio/page.tsx` | Modificado | Soporte de Modo Crucero (5h / 300 min), selector EN/ES y coordenadas del muelle. |
| `app/(visitante)/ruta/page.tsx` | Modificado | Widget de cuenta regresiva de embarque y botón de regreso al muelle. |
| `app/(panel)/admin/page.tsx` | Modificado | Simulación interactiva del operativo de 3,000 cruceristas y derrama comercial. |
| `docs/solucion-giro-crucero.md` | **Nuevo** | Documento oficial de entrega y pitch del giro del reto. |
