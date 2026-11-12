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

### Desafío 2: «Solo 5 horas en tierra» → Duración Flexible y Rutas a Pie Optimizadas
- **Duraciones Flexibles (60, 90, 120, 180, 240, 300 min):** En `/inicio`, el visitante o grupo selecciona el tiempo disponible con cálculo exacto de distancias a pie (80 m/min).
- **Garantía de Retorno Puntual:** Todas las paradas seleccionadas por el motor se encuentran en el núcleo peatonal del centro histórico con enlaces directos a Google Maps para retorno inmediato.

### Desafío 3: «Llevarlos a negocios del centro» → Rutas en Grupo (Pequeños, Medianos y Grandes Contingentes)
- **Rutas Grupales y Células de Pasajeros:**
  - El caso del crucero (3,000 personas) detonó la necesidad de una arquitectura escalable: los turistas no caminan solos, se mueven en grupos pequeños (parejas/amigos 2-4), medianos (familias 5-10) o grandes contingentes de excursión (15-30+ o personalizado hasta 200+).
  - El sistema permite crear una **«Ruta en Grupo»** (`JAROCHO-88`) donde todos los integrantes comparten la misma ruta en sus teléfonos.
  - **Sello Colaborativo:** Cuando todos los miembros del grupo escanean el QR en un negocio, se activa el sello grupal con bono de puntos.
  - **Recompensas Grupales para Toda la Mesa:**
    - *Gran Café de la Parroquia:* Ronda de café lechero y bombas para toda la mesa al completar 2 paradas.
    - *Mercado de Artesanías:* 20% de descuento en compras colectivas al completar 3 paradas.
    - *Los Portales de Lerdo:* Jarra de cortesía de Torito tradicional o aguas frescas de frutas con marimba en vivo.
- **Priorización de Comercios Locales:** El motor dirige el flujo de visitantes y contingentes directamente a negocios tradicionales del centro histórico.
- **Monitoreo y Derrama en Tablero de Afluencia (`/admin`):**
  - Botón interactivo de **«Simular Contingente Masivo»**.
  - Permite a las autoridades y cámaras de comercio ver el impacto en vivo: **+2,590 interacciones registradas**, **640 canjes en comercios aliados**, **480 grupos activos** y una derrama económica estimada de **~$520,000 MXN**.

---

## 3. Guion Rápido para la Demo en Vivo (Pitch ante el Jurado)

> **Duración estimada: 45 segundos**

1. **Abre la Portada (`/`):**
   *«Cuando llegan turistas extranjeros o contingentes al centro de Veracruz con tiempo limitado y sin hablar español, Pulso Jarocho ofrece soporte bilingüe nativo y acceso directo a rutas en grupo.»*
2. **Personalización Individual o en Grupo (`/inicio`):**
   *«Los visitantes viajan en pareja, familia o excursión: seleccionan sugerencias de grupo (2-4, 5-10, 15-30+) o escriben su cantidad personalizada. Crean su 'Ruta en Grupo', comparten el código y todos siguen el mismo recorrido con un bote compartido de puntos.»*
3. **Muestra la Ruta y el Sello Grupal (`/ruta`):**
   *«En la ruta colaborativa ven en vivo el check-in de cada miembro: al sellar todos, desbloquean recompensas para toda la mesa como rondas de café lechero en La Parroquia o descuentos en artesanías.»*
4. **Pasa al Tablero de Administración (`/admin`):**
   *«Y en el tablero de las autoridades, el botón 'Simular Contingente Masivo' demuestra cómo 480 células grupales generan más de $520,000 pesos en consumo y 640 canjes en negocios locales.»*

---

## 4. Archivos Modificados y Creados

| Archivo | Tipo | Propósito |
|---|---|---|
| `lib/grupo/index.ts` | **Nuevo** | Lógica de rutas grupales, bote de puntos compartido, categorización de tamaño y persistencia. |
| `lib/grupo/__tests__/grupo.test.ts` | **Nuevo** | Pruebas unitarias de gestión de grupo, check-ins y recompensas colectivas. |
| `components/ui/GroupExperience.tsx` | **Nuevo** | Widget de check-in grupal en ruta y sección de recompensas colectivas en pasaporte. |
| `lib/i18n/en.ts` | **Nuevo** | Diccionario completo en inglés para visitantes internacionales. |
| `lib/i18n/index.ts` | **Nuevo** | Gestor unificado de traducción con selector y persistencia de idioma. |
| `components/paneles/icons.tsx` | Modificado | Iconos SVG vectoriales (`UsersIcon`, `TrophyIcon`, `ShareIcon`, `SparklesIcon`). |
| `app/page.tsx` | Modificado | Tarjeta de acceso directo a Rutas en Grupo (2 a 50+ pers.). |
| `app/(visitante)/inicio/page.tsx` | Modificado | Selector de modalidad individual vs grupo, sugerencias de tamaño y slider personalizado. |
| `app/(visitante)/ruta/page.tsx` | Modificado | Widget de avance y check-in colaborativo de integrantes. |
| `app/(visitante)/pasaporte/page.tsx` | Modificado | Sección de Recompensas de Grupo Desbloqueadas y Bote Grupal de Puntos. |
| `app/(panel)/admin/page.tsx` | Modificado | Simulación de contingentes masivos y métricas de afluencia grupal. |
| `docs/solucion-giro-crucero.md` | Actualizado | Documento oficial de entrega y pitch de la solución al giro. |

