# CONTEXTO DEL PROYECTO — Pulso Jarocho

> **Para agentes de IA (Antigravity u otros):** este archivo es la fuente de verdad del proyecto. Léelo completo antes de cualquier tarea. Si una instrucción del usuario contradice este archivo, pregunta antes de actuar. El detalle extendido está en `docs/propuesta.md`.

---

## 1. Qué estamos construyendo

**Pulso Jarocho** — _"La ciudad se activa contigo."_
Una PWA (Next.js) para el hackathon **Reto 6 · Centro vivo** (Turismo y Centro Histórico de Veracruz).

**Problema del reto:** El Centro Histórico (Zócalo, Portales, Malecón, museos) se recorre en pocas horas. Muchos negocios no conectan con los visitantes. Hay locales vacíos, comercios que cierran temprano y eventos de los que casi nadie se entera.

**Solución:** un **motor de oportunidades urbanas** que convierte el tiempo y los gustos del visitante en una **ruta con misiones**. El visitante valida cada visita con un **QR**, gana puntos en un **pasaporte digital**, y comercios y autoridades ven la actividad en **tableros**.

**Usuarios:**
| Rol | Qué hace en la app |
|---|---|
| `visitante` | Elige tiempo, intereses y presupuesto → recibe una ruta → acepta misiones → escanea QR → gana puntos → ve los eventos de hoy |
| `comercio` | Edita su ficha (vitrina), publica promociones y eventos, confirma canjes y ve sus visitas |
| `admin` | Tablero de afluencia digital, misiones, escaneos por lugar, actividad por hora y QR imprimibles |

**El flujo de oro (lo que DEBE funcionar en la demo):**
`preferencias → ruta sugerida → aceptar misión → escanear QR en el comercio → puntos en el pasaporte → la visita aparece en el tablero en < 10 s`

Momento clave del pitch: un miembro del jurado escanea un QR impreso y su visita aparece en vivo en el tablero.

---

## 2. Cómo cubrimos el reto

| El reto pide                           | Nuestra función                                                          | Demo             |
| -------------------------------------- | ------------------------------------------------------------------------ | ---------------- |
| Ruta inteligente según tiempo y gustos | Motor de oportunidades (`lib/engine`)                                    | ✅               |
| Agenda viva de eventos                 | Pantalla «Hoy en el centro»; los eventos pueden entrar en la ruta        | ✅               |
| Vitrina digital para comercios         | Ficha con promoción, horario y etiqueta «abierto ahora»                  | ✅               |
| Programa de recompensas                | Pasaporte + sellos QR + canje confirmado por el comercio                 | ✅               |
| Tablero de afluencia                   | **Afluencia digital** (interacciones en la app, NO conteo de personas)   | ✅               |
| Comercios que cierran temprano         | «Centro de noche»: puntos extra después de las 19:00 + brecha de horario | ✅ simple        |
| Locales vacíos                         | Capa «locales disponibles»                                               | Solo diapositiva |

---

## 3. Stack

- **Next.js (App Router) + TypeScript + Tailwind**, mobile-first, PWA
- **Supabase** (PostgreSQL + Auth + RLS)
- **Leaflet + react-leaflet + OpenStreetMap** (incluir atribución de OSM)
- **html5-qrcode** (leer QR) y **qrcode** (generar QR)
- **Recharts** (gráficas)
- **@google/genai** (Gemini), solo para redactar textos
- **zod** (validación), **vitest** (pruebas)
- Despliegue en **Vercel**: cada push a `main` se publica

> ⚠️ Las dependencias YA están instaladas. **No instales nada.** Si de verdad necesitas una librería, detente y avisa al integrante 2.

---

## 4. Estructura y propiedad del código

```
app/
  page.tsx                 # portada con enlaces (I2)
  (visitante)/             # I1 — inicio, preferencias, ruta, mision, pasaporte, hoy
  (panel)/admin/           # I5 — tablero de afluencia, /admin/qr lo hace I2
  (panel)/comercio/        # I5 — vitrina, eventos, canjes
  escanear/                # I2 — lector QR
  api/                     # I3 — todos los endpoints excepto api/ai
  api/ai/                  # I4 — endpoints de IA
components/
  visitante/               # I1
  mapa/                    # I2
  paneles/                 # I5
lib/
  types.ts                 # I3 — tipos compartidos (solo I3 los edita)
  mock/                    # I1 — datos de prueba con la forma de types.ts
  engine/                  # I4 — motor de recomendación (funciones puras)
  ai/                      # I4 — cliente de Gemini y prompts
  qr/                      # I2 — generación y lectura de QR
  db/                      # I3 — clientes de Supabase
  i18n/es.ts               # textos de la UI (cada quien agrega sus claves)
  flags.ts                 # interruptores de funciones
supabase/                  # I3 — schema.sql, seed.sql
docs/propuesta.md          # propuesta completa
```

| Integrante | Rol                                                  | Rama             | Carpetas                                                            |
| ---------- | ---------------------------------------------------- | ---------------- | ------------------------------------------------------------------- |
| **1**      | Frontend del visitante                               | `feat/visitante` | `app/(visitante)`, `components/visitante`, `lib/mock`               |
| **2**      | Mapa, QR, integración y despliegue (dueño de `main`) | `feat/mapa-qr`   | `components/mapa`, `app/escanear`, `lib/qr`, `app/(panel)/admin/qr` |
| **3**      | Backend, base de datos y seguridad                   | `feat/backend`   | `supabase`, `app/api` (excepto `ai`), `lib/db`, `lib/types.ts`      |
| **4**      | Motor de recomendación e IA                          | `feat/motor-ia`  | `lib/engine`, `lib/ai`, `app/api/ai`                                |
| **5**      | Paneles de comercio y admin; pitch                   | `feat/paneles`   | `app/(panel)`, `components/paneles`                                 |

**Archivos compartidos (no editar sin avisar):** `package.json`, `app/layout.tsx`, `lib/types.ts`, `tailwind.config`, `next.config`.

---

## 5. Tipos compartidos (`lib/types.ts`)

Esta es la forma acordada. Si `lib/types.ts` ya existe, **ese archivo manda**.

```ts
export type Role = "visitante" | "comercio" | "admin";
export type Interest =
  | "historia"
  | "gastronomia"
  | "cultura"
  | "paseo"
  | "compras";
export type Budget = "bajo" | "medio" | "alto";

export interface Place {
  id: string;
  name: string;
  category: Interest;
  lat: number;
  lng: number;
  description: string;
  opensAt?: string;
  closesAt?: string; // "HH:MM"; omitir si no está verificado
  avgVisitMin: number; // tiempo típico de visita
  priceLevel: Budget;
  opportunity: number; // 0..1 = necesidad de visibilidad
  verified: boolean; // false → mostrar «por confirmar»
  meta: Record<string, unknown>; // atributos extra (accesible, bajoTecho, ...)
}
export interface Business {
  id: string;
  placeId: string;
  ownerId?: string;
  contact?: string;
  active: boolean;
  meta: Record<string, unknown>;
}
export interface Event {
  id: string;
  title: string;
  placeId: string;
  startsAt: string;
  endsAt?: string;
  category: Interest;
  source: string;
  verified: boolean;
  meta: Record<string, unknown>;
}
export interface Mission {
  id: string;
  title: string;
  description: string;
  placeId: string;
  points: number;
  nightBonus: boolean;
  active: boolean;
}
export interface QrToken {
  id: string;
  placeId: string;
  token: string;
  expiresAt?: string;
  active: boolean;
}
export interface Visit {
  id: string;
  profileId: string;
  placeId: string;
  missionId?: string;
  createdAt: string;
  method: "qr";
}
export interface Reward {
  id: string;
  businessId: string;
  title: string;
  conditions: string;
  costPoints: number;
  validUntil?: string;
}
export interface Profile {
  id: string;
  alias: string;
  role: Role;
  points: number;
}

export interface RouteRequest {
  minutes: number;
  interests: Interest[];
  budget: Budget;
  lat?: number;
  lng?: number;
  now?: string;
}
export interface RouteStop {
  place: Place;
  order: number;
  distanceM: number;
  etaMin: number;
  reason: string;
  missionId?: string;
  eventId?: string;
}
export interface RouteResponse {
  stops: RouteStop[];
  totalMin: number;
}

export interface ValidateResponse {
  ok: boolean;
  pointsAdded: number;
  totalPoints: number;
  missionCompleted: boolean;
  message: string;
}
export interface Stats {
  missionsAccepted: number;
  missionsCompleted: number;
  redemptions: number;
  scansByPlace: { placeId: string; name: string; scans: number }[];
  activityByHour: {
    hour: number;
    interactions: number;
    openBusinesses: number;
  }[];
  recentVisits: { placeName: string; createdAt: string }[];
}
```

---

## 6. Base de datos (Supabase)

Tablas: `profiles`, `places`, `businesses`, `events`, `missions`, `mission_accepts`, `qr_tokens`, `visits`, `rewards`, `redemptions`. Todas usan `id uuid`; `places`, `events` y `businesses` llevan `meta jsonb default '{}'` y `verified boolean`.

**Datos semilla de la demo:** 12 lugares (Zócalo, Portales, Malecón y calles cercanas), 6 comercios, 4 eventos (hoy y mañana, al menos uno nocturno), 3 misiones, 3 recompensas y 1 QR por lugar. Los comercios son **ficticios o autorizados**. Los horarios no verificados van con `verified=false`.

**Seguridad:**

- RLS por rol.
- Los puntos y las visitas **solo se escriben desde el servidor** (service role en route handlers).
- Los tokens QR no son predecibles (`crypto.randomUUID()`).
- Un token cuenta una vez por perfil.

**Usuarios de la demo:** auth anónima de Supabase o perfiles demo fijos (`visitante-demo`, `comercio-demo`, `admin-demo`).

---

## 7. Contratos de API

| Método y ruta                     | Entrada                        | Salida                             | Dueño                     |
| --------------------------------- | ------------------------------ | ---------------------------------- | ------------------------- |
| `GET /api/places`                 | —                              | `Place[]`                          | I3                        |
| `GET /api/events?when=today\|now` | query                          | `Event[]` (con su `Place`)         | I3                        |
| `POST /api/events`                | `Omit<Event,"id"\|"verified">` | `Event` (`verified=false`)         | I3                        |
| `POST /api/route`                 | `RouteRequest`                 | `RouteResponse`                    | I3 (llama al motor de I4) |
| `POST /api/missions/accept`       | `{ missionId }`                | `{ ok: true }`                     | I3                        |
| `POST /api/visits/validate`       | `{ token }`                    | `ValidateResponse`                 | I3                        |
| `GET /api/me/passport`            | —                              | `{ profile, visits, rewards }`     | I3                        |
| `POST /api/redemptions/confirm`   | `{ redemptionId }`             | `{ ok: true }` (solo rol comercio) | I3                        |
| `GET /api/stats`                  | `?from&to` opcional            | `Stats`                            | I3                        |
| `POST /api/ai/mission`            | `{ placeId, interests }`       | `{ text, why }`                    | I4                        |

Todas las respuestas son JSON. Errores: `{ error: string }` con el código HTTP correcto. Validar la entrada con zod.

---

## 8. Motor de recomendación (`lib/engine`)

**Funciones puras, deterministas y explicables.** La IA NO decide la ruta.

```
score(place) = w.afinidad      * (category ∈ interests ? 1 : 0.2)
             + w.cercania      * (1 - min(dist/1500m, 1))
             + w.disponibilidad* (abierto durante la ventana ? 1 : 0)
             + w.tiempo        * (avgVisitMin cabe en el tiempo restante ? 1 : 0)
             + w.oportunidad   * place.opportunity
             + w.bonoNocturno  * (now >= 19:00 && abierto después de 19:00 ? 1 : 0)
```

1. Filtrar por presupuesto y lugares cerrados.
2. Ordenar por `score`.
3. Construir la ruta con vecino más cercano mientras quepa en `minutes`, usando la caminata (≈ 80 m/min, distancia haversine) más `avgVisitMin`.
4. Incluir un evento si empieza dentro de la ventana de tiempo y está a menos de 600 m de la ruta.
5. Cada parada lleva un `reason` legible, por ejemplo: «Te gusta la gastronomía, está a 4 min y es un comercio nuevo».

Los pesos viven en `lib/engine/config.ts`. Requiere pruebas en Vitest (`npm test`).

**IA (`lib/ai`, Gemini):**

- Solo redacta el texto de la misión y el «por qué te lo recomendamos» **a partir de los datos que recibe**.
- Tiempo límite de 5 s. Si falla, se usa una plantilla de texto.
- El prompt prohíbe inventar horarios, precios, eventos o disponibilidad.
- La clave `GEMINI_API_KEY` solo se usa en el servidor.

---

## 9. Reglas para agentes de IA

1. **Solo modifica las carpetas de tu integrante** (sección 4). Si necesitas otra, detente y explica qué cambio se necesita.
2. **No instales dependencias** ni edites los archivos compartidos.
3. **Usa los tipos de `lib/types.ts`** y los contratos de la sección 7. Si el backend no está listo, usa `lib/mock` con exactamente esas formas.
4. **No inventes datos reales** (horarios, precios, eventos). Si un dato falta, márcalo «por confirmar».
5. **Los puntos se calculan en el servidor**, nunca en el cliente.
6. **Leaflet siempre con** `dynamic(() => import(...), { ssr: false })` e importando `leaflet/dist/leaflet.css`.
7. **Mobile-first** (pensado para 375 px de ancho), botones grandes, buen contraste. Textos de UI en `lib/i18n/es.ts`.
8. **Variables secretas** solo en el servidor. Nunca hagas commit de `.env*`, excepto `.env.example`.
9. **Las métricas se etiquetan como «actividad registrada en la app»**, nunca como conteo de personas o ventas.
10. **Antes de dar una tarea por terminada:** `npm run build` sin errores (y `npm test` si tocaste el motor).
11. **Cambios pequeños.** Una tarea por conversación. No refactorices código ajeno.
12. **Mensajes de commit:** `tipo(área): descripción`, con tipos `feat`, `fix`, `style`, `test`, `docs` o `chore`.

---

## 10. Flujo de Git

- `main` siempre compila y está desplegada. Solo recibe cambios por **Pull Request**; el integrante 2 hace los merges.
- Una rama por integrante (`feat/...`). Hagan `git pull origin main` **cada hora**.
- Errores puntuales en ramas `fix/<descripción>`.
- Cada quien hace commits desde **su propia cuenta**, cada 30–45 min.

### Puntos de control obligatorios (miércoles)

| Corte   | Aviso | PR abiertos | Integración | Commit + tag      | Límite |
| ------- | ----- | ----------- | ----------- | ----------------- | ------ |
| **CP1** | 16:20 | 16:30       | 16:30–16:45 | **16:50 → `cp1`** | 17:00  |
| **CP2** | 19:20 | 19:30       | 19:30–19:45 | **19:50 → `cp2`** | 20:00  |

**Orden de merge:** backend → motor/IA → mapa/QR → visitante → paneles. Se corre `npm run build` después de cada merge. Lo que no funcione se queda en su rama: **nunca se rompe `main`**.

**CP1 · «Esqueleto vivo»:** URL pública; todas las pantallas navegables (con mock está bien); `/api/places` con datos reales; motor con pruebas que pasan; mapa con marcadores; lector QR que lee un token; paneles con gráficas mock.

**CP2 · «Flujo de oro»:** el flujo completo de la sección 1 funciona en un teléfono, en producción, con datos reales, más la agenda de eventos y la IA con fallback.

**Plan B si vamos atrasados en CP2.** Se recorta en este orden:

1. IA → plantillas de texto.
2. Panel de comercio → solo el de admin.
3. Línea de ruta en el mapa → solo marcadores numerados.

**Nunca se recorta** QR → puntos → tablero.

---

## 11. Horario por integrante (miércoles 11 → jueves 12 de noviembre)

| Hora                 | I1 Visitante                                                                 | I2 Mapa/QR                     | I3 Backend                             | I4 Motor/IA                                | I5 Paneles                               |
| -------------------- | ---------------------------------------------------------------------------- | ------------------------------ | -------------------------------------- | ------------------------------------------ | ---------------------------------------- |
| 14:30–15:00          | Bocetos; lista de 12 lugares con I4                                          | Repo, deps, Vercel, AGENTS.md  | Supabase, schema, types                | config.ts; datos de lugares y comercios    | Logo, paleta, 4 eventos                  |
| 15:00–16:00          | Inicio, preferencias, ruta (mock)                                            | Mapa Leaflet + marcadores      | schema + seed, `GET /api/places`       | Puntuación y orden                         | Layout `/admin`, KPI mock                |
| 16:00–16:20          | Misión y pasaporte (mock)                                                    | `/escanear`                    | Variables en Vercel, `GET /api/events` | Pruebas Vitest y motivos                   | `/comercio` + 2 gráficas                 |
| 16:20–16:50          | **CP1**                                                                      | **merge + tag**                | **CP1**                                | **CP1**                                    | **CP1**                                  |
| 17:00–18:00          | Conectar places y route                                                      | `/admin/qr`, ruta en el mapa   | route, accept, validate                | Motor en route; `/api/ai/mission`          | Formulario de eventos, canjes            |
| 18:00–19:20          | «Hoy en el centro», pasaporte real                                           | Escáner → validate, animación  | stats, POST events, RLS, perfiles demo | Eventos en el motor, bono nocturno         | Paneles con stats cada 5 s, diapositivas |
| 19:20–19:50          | **CP2**                                                                      | **merge + tag**                | **CP2**                                | **CP2**                                    | **CP2**                                  |
| 19:50–20:30          | Demo completa en teléfono y lista de bugs (todos)                            |                                |                                        |                                            |                                          |
| 20:30–00:00          | Bugs de UI, PWA                                                              | QA en teléfonos, imprimir QR   | Revisión de datos, `seed:demo`         | Ajustar pesos; preparar en.ts, meta, flags | Diapositivas, ensayo 1                   |
| 00:00–03:30          | 😴                                                                           | Bugs                           | 😴                                     | Diapositiva del algoritmo                  | Ensayo 2                                 |
| 03:30–06:45          | Pulido visual                                                                | 😴                             | Respaldo, tag `pre-jueves`             | 😴                                         | 😴                                       |
| **Jue 07:00**        | **Requisito nuevo:** 10 min leer, 10 min clasificar, 10 min repartir (todos) |                                |                                        |                                            |                                          |
| 07:30 → entrega −3 h | Requisito (su área)                                                          | Integración, video de respaldo | Requisito                              | Requisito                                  | Diapositiva del requisito, ensayo 3      |

---

## 12. Requisito nuevo del jueves a las 7:00

El reto recibe un requisito sorpresa. Por eso **todo debe ser configurable**:

- pesos en `lib/engine/config.ts`
- funciones encendibles en `lib/flags.ts`
- textos en `lib/i18n/`
- atributos extra en `meta jsonb`

Escenarios probables y respuesta rápida:

| Posible requisito        | Respuesta                                                                 | Quién  |
| ------------------------ | ------------------------------------------------------------------------- | ------ |
| Inglés / cruceristas     | `lib/i18n/en.ts` + selector de idioma; la IA redacta en el idioma elegido | I1, I4 |
| Accesibilidad            | `meta.accesible` + filtro en el motor                                     | I3, I4 |
| Lluvia o calor           | `meta.bajoTecho` + peso del clima                                         | I4     |
| Evento masivo (Carnaval) | Cargar en la agenda + más peso de oportunidad                             | I3, I5 |
| Datos para autoridades   | Exportar CSV desde stats                                                  | I3, I5 |
| Sin conexión             | Caché de la PWA; el QR se valida al volver la red                         | I2     |

Se trabaja en la rama `feat/requisito-jueves` y se integra con el mismo protocolo de los puntos de control.

---

## 13. Prompts iniciales por integrante

Empieza siempre con: **«Lee CONTEXTO.md completo antes de empezar.»**

- **I1:** «Soy el integrante 1 (feat/visitante). Crea en app/(visitante) las pantallas inicio (tiempo 60/90/120/180 min, intereses, presupuesto), ruta, mision/[id] y pasaporte, usando datos de lib/mock con los tipos de lib/types.ts. Mobile-first.»
- **I2:** «Soy el integrante 2 (feat/mapa-qr). Crea components/mapa/Mapa.tsx con react-leaflet (sin SSR) que reciba `Place[]` y `RouteStop[]` opcional y muestre marcadores numerados, más app/escanear con html5-qrcode que lea un QR y muestre el token.»
- **I3:** «Soy el integrante 3 (feat/backend). Escribe supabase/schema.sql (sección 6, con RLS), supabase/seed.sql con los datos de la demo, lib/db (clientes de servidor y navegador) y GET /api/places.»
- **I4:** «Soy el integrante 4 (feat/motor-ia). Implementa lib/engine/score.ts y lib/engine/route.ts según la sección 8, con pesos de config.ts, y 5 pruebas en lib/engine/**tests** con Vitest.»
- **I5:** «Soy el integrante 5 (feat/paneles). Crea app/(panel)/admin con tarjetas KPI, gráfica de escaneos por lugar y gráfica de actividad por hora vs comercios abiertos (Recharts), usando un mock con la forma de `Stats`. Luego app/(panel)/comercio.»

## 14. Bitácora de IA y pregunta de dominio (requisito del hackathon)

**Bitácora:** al terminar CADA tarea hecha con IA, agrega una entrada en `docs/bitacora/integrante-N.md` (tu número). No edites README.md; el integrante 2 lo compila en cada punto de control. Formato:

### HH:MM · Título corto

- **Herramienta:** Antigravity (modelo usado)
- **Objetivo:** qué se pidió
- **Prompt (resumen):** 1–2 líneas
- **Resultado:** qué generó la IA (archivos)
- **Revisión humana:** qué verificamos, corregimos o rechazamos
- **Commit:** hash o mensaje

**Pregunta de dominio:** cualquier integrante debe poder explicar cualquier parte. Al terminar cada tarea, el agente agrega a `docs/explicaciones/<area>.md` qué hace el módulo, cómo funciona en 5 líneas simples, las decisiones técnicas y 3 preguntas probables del jurado con su respuesta.
