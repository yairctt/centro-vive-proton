# Arquitectura de Pulso Jarocho

> Documento técnico de referencia del proyecto. Explica cómo encaja cada
> pieza, qué datos fluyen entre ellas y dónde tocar para cambiar algo sin
> romper el resto.
>
> **Pulso Jarocho** — *"La ciudad se activa contigo."*
> Reto 6 · Centro Vivo — Turismo y Comercio en el Centro Histórico de Veracruz.

---

## 1. Qué resuelve

El Centro Histórico de Veracruz concentrates en pocas cuadras, pero el visitante
se queda entre el Zócalo y el Malecón, los comercios de calles aledañas ven
poca gente y cierran temprano. Al mismo tiempo, hay cartelera cultural y
comercios participantes que casi nadie visita.

Pulso Jarocho convierte **tiempo + gustos + presupuesto** en una ruta con
paradas, cada una con una misión que se valida con un QR en el lugar. El
visitante acumula puntos en un pasaporte digital; el comercio ve sus visitas y
canjes; el comercio y la autoridad ven la actividad registrada.

El principio de diseño es que **el sistema no inventa datos**: si un horario no
está verificado se muestra «por confirmar», si un evento no está verificado se
muestra en gris. Preferimos admitir que falta un dato a afirmar algo que puede
ser falso.

---

## 2. Vista de capas

```
┌──────────────────────────────────────────────────────────────────────┐
│  INTERFAZ (Next.js App Router, React 19, Tailwind 4)                │
│                                                                      │
│  Visitante        Comercio              Administración                 │
│  /inicio          /comercio             /admin                      │
│  /ruta            /comercio/qr          /admin/qr                    │
│  /mision/[id]                                               /admin    │
│  /pasaporte                                                        │
│  /escanear      Auth: /login, /registro, /recuperar                  │
│  /hoy  (agenda)                                                     │
│                                                                      │
│  La portada (app/page.tsx) lleva el logo oficial (components/ui/     │
│  PulsoLogo.tsx) y un enlace a cada sección.                          │
└──────────────────────────────┬───────────────────────────────────────┘
                               │  fetch (JSON)
┌──────────────────────────────▼───────────────────────────────────────┐
│  API (Route Handlers de Next.js) — app/api/**                         │
│                                                                      │
│  places · events · missions · rewards    →  gestión (CRUD por rol)    │
│  route · stats · me · me/passport        →  lectura agregada         │
│  visits/validate · missions/accept       →  el flujo de oro           │
│  qr-tokens · redemptions · redemptions/confirm →  QR y canjes         │
│  ai/mission                            →  redacción con Gemini      │
└──────────────────────────────┬───────────────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────────────┐
│  DOMINIO                                                              │
│                                                                      │
│  lib/engine/   Motor de recomendación (funciones puras, 6 pesos)     │
│  lib/ai/       Cliente de Gemini + plantillas de respaldo             │
│  lib/db/       Clientes de Supabase + mappers snake_case → camelCase │
│  lib/qr/       Generación y lectura de códigos QR                    │
│  lib/auth/     Reglas de acceso por rol (funciones puras)             │
│  lib/mock/     Datos de prueba de la interfaz                        │
│  lib/flags.ts  Interruptores de función                               │
│  lib/i18n/     Textos de la interfaz                                   │
└──────────────────────────────┬───────────────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────────────┐
│  DATOS — Supabase (PostgreSQL)                                        │
│                                                                      │
│  10 tablas · RLS en todas · función increment_points()               │
│  profiles · places · businesses · events · missions                   │
│  mission_accepts · qr_tokens · visits · rewards · redemptions          │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 3. El flujo de oro, paso a paso

Este es el recorrido que el jurado va a ver en vivo. Cada paso indica quién
interviene y en qué archivo.

### Paso 1 · El visitante declara sus preferencias

`app/(visitante)/inicio/page.tsx`

El visitante elige **tiempo** (60 / 90 / 120 / 180 min), **intereses** (historia,
gastronomía, cultura, paseo, compras) y **presupuesto** (bajo / medio / alto). Con
eso se hace un `POST /api/route`.

### Paso 2 · El motor arma la ruta

`lib/engine/` → `app/api/route/route.ts`

El motor **puntúa** cada lugar con seis factores, **filtra** los que no sirven
y **ordena** las paradas con vecino más cercano. Devuelve:

```jsonc
{
  "stops": [
    {
      "place": { "id": "...", "name": "Gran Café de la Parroquia", ... },
      "order": 1,
      "distanceM": 163,
      "etaMin": 2,
      "reason": "Te interesa gastronomía, está a 2 min a pie, está abierto ahora",
      "missionId": "ca000000-...",
      "kind": "lugar",
      "score": { "afinidad": 1, "cercania": 0.89, "total": 0.81, ... }
    }
  ],
  "totalMin": 88,
  "origen": "base"        // "base" = base de datos · "respaldo" = catálogo local
}
```

El campo `reason` es lo que el visitor ve: **cada parada explica por qué**.

> Detalle del motor: [`docs/explicaciones/motor.md`](explicaciones/motor.md)

### Paso 3 · El visitante acepta la misión

`app/(visitante)/mision/[id]/page.tsx` → `POST /api/missions/accept`

La misión se registra en `mission_accepts`. El endpoint es **idempotente**: si ya
la había aceptado, no falla.

### Paso 4 · El visitante escanea el QR en el lugar

`app/escanear/page.tsx` → `POST /api/visits/validate`

La cámara lee el código con `html5-qrcode`. El token viaja al servidor, que:

1. Busca el token en `qr_tokens` y verifica que esté **activo** y **no vencido**.
2. Comprueba que ese perfil **no haya visitado** ese lugar antes.
3. Suma los puntos en el **servidor** (`increment_points`), nunca en el cliente.
4. Devuelve `{ ok, pointsAdded, totalPoints, missionCompleted, message }`.

El cliente **nunca** asigna puntos: si lo hiciera, cualquiera podría fabricarse
puntos desde el navegador.

### Paso 5 · El visitante ve su pasaporte

`app/(visitante)/pasaporte/page.tsx` → `GET /api/me/passport`

Perfil, puntos, sellos de visita y recompensas canjeables.

### Paso 6 · El tablero se actualiza en vivo

`app/(panel)/admin/page.tsx` → `GET /api/stats` (cada 5 s)

El panel muestra **actividad registrada en la app**: misiones, escaneos por
lugar, canjes y actividad por hora frente a comercios abiertos.

> El aviso metodológico está arriba del todo: *«Las métricas presentadas
> corresponden a actividad registrada en la app; no constituyen conteo peatonal
> total ni ventas.»*

---

## 4. Endpoints

### Lectura

| Método y ruta | Devuelve | Acceso |
|---|---|---|
| `GET /api/places` | `Place[]` | público |
| `GET /api/events?when=today\|now` | `Event[]` | público |
| `GET /api/missions` | `Mission[]` | admin |
| `GET /api/rewards` | `Reward[]` | comercio, admin |
| `GET /api/me` | sesión y perfil | público (perfil si hay sesión) |
| `GET /api/me/passport` | `{profile, visits, rewards}` | visitante, admin |
| `GET /api/me/businesses` | negocios del comercio | comercio, admin |
| `GET /api/qr-tokens` | tarjetas de QR para imprimir | comercio, admin |
| `GET /api/stats?from&to` | `Stats` | admin |
| `GET /api/places/[id]`, `GET /api/events/[id]`, `GET /api/rewards/[id]` | un registro | según el recurso |

### El flujo de oro

| Método y ruta | Entrada | Devuelve | Acceso |
|---|---|---|---|
| `POST /api/route` | `{minutes, interests[], budget, lat?, lng?}` | `{stops, totalMin, origen}` | público |
| `POST /api/visits/validate` | `{token}` | `ValidateResponse` | visitante, admin |
| `POST /api/missions/accept` | `{missionId}` | misión aceptada | visitante, admin |
| `POST /api/missions/[id]` | — | misión concreta con su lugar | visitante, admin |
| `POST /api/redemptions` | `{rewardId}` | canje creado | visitante, admin |
| `POST /api/redemptions/confirm` | `{redemptionId}` | canje confirmado | comercio, admin |

### Gestión (CRUD)

| Método y ruta | Quién |
|---|---|
| `POST /api/places`, `POST /api/places/[id]` | admin |
| `POST /api/events`, `POST /api/events/[id]` | comercio, admin |
| `POST /api/missions`, `POST /api/missions/[id]` | admin |
| `POST /api/rewards`, `POST /api/rewards/[id]` | comercio, admin |

### La IA

| Método y ruta | Entrada | Devuelve |
|---|---|---|
| `POST /api/ai/mission` | `{placeId, interests[], place?, idioma?}` | `{text, why, source}` |

`source` dice de dónde salió el texto: `ia` (lo redactó Gemini) o `respaldo`
(plantilla). Nunca hay un 500 por culpa de la IA.

---

## 5. Modelo de datos

Las diez tablas, con su propósito y quién las escribe:

| Tabla | Qué guarda | Quién escribe |
|---|---|---|
| `profiles` |(alias, rol, puntos, `auth_id`) | el usuario al registrarse; el sistema al sumarle puntos |
| `places` | 12 lugares + 6 comercios: nombre, categoría, coordenadas, horario, `avg_visit_min`, `price_level`, `opportunity`, `verified`, `meta` | admin (seed) |
| `businesses` | ficha de negocio: `place_id`, responsable, contacto, `active` | admin (seed) |
| `events` | agenda: título, lugar, inicio, fin, `source`, `verified` | comercio, admin |
| `missions` | misiones: `place_id`, título, reglas, `points`, `night_bonus`, `active` | admin (seed) |
| `mission_accepts` | misiones aceptadas por un perfil (`UNIQUE(profile_id, mission_id)`) | `POST /api/missions/accept` |
| `qr_tokens` | un token por lugar: `token` único, `expires_at`, `active` | admin (seed) |
| `visits` | cada visita validada: perfil, lugar, misión, método, `qr_token_id` | `POST /api/visits/validate` |
| `rewards` | recompensas: `business_id`, título, condiciones, `cost_points` | comercio, admin |
| `redemptions` | canjes: perfil, recompensa, `confirmed`, `confirmed_at` | `POST /api/redemptions` y `/confirm` |

### Campos que solo existen en `meta` (JSONB)

`meta` es la válvula de escape del modelo: ahí caben los atributos que un lugar
puede tener y otro no, sin cambiar el esquema.

| Clave | Significado | Quién la llena |
|---|---|---|
| `avgVisitMin` | minutos de visita típicos | backend (seed) |
| `priceLevel` | `bajo` / `medio` / `alto` | backend (seed) |
| `opportunity` | necesidad de visibilidad, 0..1 | backend (seed) |
| `opensAt` / `closesAt` | horario en `HH:MM` | backend (seed) |
| `horarioSemanal` | horario por día de la semana (ISO 8601) | catálogo local |
| `horarioVerificado` | `false` si el horario es variable | catálogo local |
| `horarioNota` | salvedad sobre el horario | catálogo local |
| `estado` | `operativo` / `cerradoTemporalmente` / `cerradoAlPublico` | catálogo local |
| `bajoTecho` / `interior` | lugar cubierto (requisito de clima) | backend (seed) |
| `accesible` | accesibilidad (requisito de accesibilidad) | backend (seed) |
| `abreDeNoche` | negocio nocturno del seed | backend (seed) |

> Los datos opcionales del motor (los que no están en una columna) se leen de
> `meta`. Por eso el motor funciona igual con el seed del backend y con el
> catálogo local de demostración.

> Detalle del modelo: [`docs/explicaciones/datos.md`](explicaciones/datos.md)

---

## 6. Seguridad

Tres capas, de fuera hacia dentro:

**1. El middleware (`proxy.ts`)** decide qué pantalla se puede ver según el rol.
Sin sesión, redirige a `/login?next=…`. Con el modo demo encendido, deja pasar.
Las reglas viven en `lib/auth/roles.ts` como funciones puras, para que el
middleware, las APIs y los menúsRadiography usen **la misma** fuente de verdad.

| Rol | Puede ver |
|---|---|
| `visitante` | `/inicio`, `/ruta`, `/mision`, `/pasaporte`, `/escanear`, `/hoy` |
| `comercio` | `/comercio`, `/comercio/qr` |
| `admin` | todo |

**2. Row Level Security en PostgreSQL.** Las diez tablas tienen RLS activado y
sus políticas:

| Política | Qué permite |
|---|---|
| `places/events/missions/qr_tokens/rewards_select_public` | lectura pública |
| `profiles_select_own`, `profiles_update_own` | cada quien ve y edita su perfil |
| `visits_select_own` | cada quien ve sus visitas |
| `visits_insert_service`, `mission_accepts_insert_service` | solo el service role inserta |
| `redemptions_*_service` | canjes: solo el service role y el comercio |

**3. Service role en el servidor.** `SUPABASE_SERVICE_ROLE_KEY` solo se usa en
los route handlers (`lib/db/server.ts`). Nunca se expone al navegador ni se sube
al repositorio. `NEXT_PUBLIC_*` son públicas por diseño y solo se usan para
leer.

### Antifraude del QR

- El token es un `gen_random_uuid()`: no es predecible.
- Un token cuenta **una vez por perfil** (comprobación en el servidor).
- Los puntos los suma **el servidor**, con una función SQL atómica
  (`increment_points`) que evita carreras entre dos escaneos simultáneos.

---

## 7. Configuración

### Variables de entorno

| Variable | Dónde vive | Para qué |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` / Vercel | URL del proyecto |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` / Vercel | clave pública de lectura |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.local` / Vercel | **solo servidor**: escrituras y agregados |
| `GEMINI_API_KEY` | `.env.local` / Vercel | redacción de textos con Gemini |
| `NEXT_PUBLIC_MODO_DEMO` | `.env.local` / Vercel | `true` = sin sesión se usan los perfiles demo |
| `NEXT_PUBLIC_ACCESOS_DEMO` | `.env.local` / Vercel | `false` = oculta los botones de acceso rápido |
| `GEMINI_MODEL` | `.env.local` / Vercel | modelo de Gemini (por omisión `gemini-2.5-flash`) |

`NEXT_PUBLIC_MODO_DEMO` se lee **al compilar**: si se cambia, hay que recompilar
o redesplegar, si no sigue sin efecto.

### Interruptores (`lib/flags.ts`)

Interruptores de función, para apagar una parte sin tocar el código:

| Interruptor | Qué apaga |
|---|---|
| `ia` | la llamada a Gemini (todo pasa por las plantillas) |
| `centroDeNoche` | el bono de puntos nocturno |
| `agenda` | los eventos en la ruta |
| `modoDemo` | el acceso sin sesión |
| `accesosDemo` | los botones de acceso rápido del login |

### Pesos del motor (`lib/engine/config.ts`)

Los seis pesos de la puntuación y las constantes de negocio viven en un solo
archivo. Con `clima: 0` y `accesibilidad: 0` (los valores por omisión), el
motor se comporta **exactamente** igual que antes de preparar el requisito
nuevo.

> Cómo ajustarlo: [`docs/explicaciones/motor.md`](explicaciones/motor.md)

---

## 8. Despliegue

Cada push a `main` dispara el despliegue en Vercel.

| Paso | Dónde |
|---|---|
| 1. Variables de entorno | Vercel → Project → Settings → Environment Variables |
| 2. Esquema y datos | Supabase → SQL Editor: `supabase/schema.sql` y luego `supabase/seed.sql` |
| 3. Redeploy | Vercel (obligatorio si cambiaron las variables `NEXT_PUBLIC_*`) |

`npm run build` debe pasar **sin** variables de entorno: así el build nunca se
rompe por una clave faltante, y los endpoints caen a su modo de respaldo.

---

## 9. Modo de respaldo

Cada endpoint que depende de la base tiene un plan B, para que la demo nunca
muestre una pantalla vacía ni un error:

| Fuente | De dónde sale el respaldo |
|---|---|
| Lugares y eventos | `lib/engine/datos-demo.ts` (catálogo con horarios oficiales) |
| Pasaporte | `lib/mock` del Integrante 1 |
| Tarjetas de QR | `lib/qr/mock.ts` del Integrante 2 |
| Puntos de la visita | `lib/qr/mock.ts`, acumulados en el navegador |

La respuesta de `/api/route` incluye `origen` para saber con qué datos se
calculó: `"base"` (la real) o `"respaldo"` (el catálogo local).

---

## 10. Mapas del código

| Carpeta | Qué contiene | Dueño |
|---|---|---|
| `app/(visitante)` | pantallas del visitante | I1 |
| `app/(panel)` | paneles de comercio y administración | I5 |
| `app/escanear` | lector de QR | I2 |
| `app/api` | route handlers (salvo `api/ai`) | I3 |
| `app/api/ai` | redacción con Gemini | **I4** |
| `components/mapa` | mapa de Leaflet | I2 |
| `components/paneles` | tarjetas y gráficas de los paneles | I5 |
| `components/visitante` | iconos y enlaces de la ruta | **I4** |
| `lib/engine` | motor de recomendación | **I4** |
| `lib/ai` | cliente de Gemini y plantillas | **I4** |
| `lib/db` | clientes de Supabase y mappers | I3 |
| `lib/qr` | generación y lectura de QR | I2 |
| `lib/auth` | reglas por rol | I1 |
| `lib/mock` | datos de prueba | I1 |
| `lib/i18n` | textos de la interfaz | todos |
| `lib/types.ts` | tipos compartidos | I3 |
| `lib/flags.ts` | interruptores | I3 |

---

## 11. Documentos del proyecto

| Documento | Para qué |
|---|---|
| [`guia-pruebas.md`](guia-pruebas.md) | cómo levantar el proyecto y recorrer la demo paso a paso |
| [`explicaciones/motor.md`](explicaciones/motor.md) | el motor de recomendación, en detalle |
| [`explicaciones/ia.md`](explicaciones/ia.md) | qué hace la IA, qué no puede hacer y por qué |
| [`explicaciones/datos.md`](explicaciones/datos.md) | modelo de datos, RLS y el seed |
| [`explicaciones/mapa.md`](explicaciones/mapa.md) | el mapa de Leaflet |
| [`explicaciones/qr.md`](explicaciones/qr.md) | los códigos QR |
| [`explicaciones/auth.md`](explicaciones/auth.md) | cuentas, sesión y roles |
| [`explicaciones/paneles.md`](explicaciones/paneles.md) | tablero y panel de comercio |
| [`explicaciones/gestion-crud.md`](explicaciones/gestion-crud.md) | la gestión de lugares, eventos, misiones y recompensas |
| [`explicaciones/requisito-jueves.md`](explicaciones/requisito-jueves.md) | cómo activar el requisito nuevo en minutos |
| [`glosario.md`](glosario.md) | los términos del proyecto, en español llano |
| [`propuesta.md`](propuesta.md) | la propuesta original (contexto y justificación) |
| [`pitch/guion-pitch.md`](pitch/guion-pitch.md) | guion de 3 minutos |
| [`pitch/diapositivas.md`](pitch/diapositivas.md) | las diapositivas |
| [`bitacora/`](bitacora/) | bitácora de IA por integrante |

---

## 12. Glosario rápido

| Término | Qué significa |
|---|---|
| **Ruta** | la lista ordenada de paradas que arma el motor |
| **Misión** | lo que el visitante acepta hacer en un lugar; da puntos |
| **Pasaporte** | el documento del visitante con sus puntos, sellos y recompensas |
| **Sello** | la marca de una visita validada con QR |
| **Oportunidad** | cuánta visibilidad necesita un lugar (0..1) |
| **Bono de Centro de noche** | puntos extra después de las 19:00 para fortalecer el comercio que cierra tarde |
| **Actividad registrada** | lo que el visitante hizo **en la app**; nunca es conteo de personas |
| **Modo demo** | la app funciona sin base de datos, con datos de ejemplo |
| **Por confirmar** | el dato existe pero no está verificado; se muestra así, no se inventa |

El glosario completo está en [`glosario.md`](glosario.md).

---

## 13. Identidad visual

| Color | Uso |
|---|---|
| Verde Golfo (`#0f766e`) | el mar, el puerto y su historia |
| Ámbar Sol (`#d97706`) | danzón, energía cultural y comercio local |
| Coral Pulso (`#e11d48`) | dinamismo urbano y rutas vivas |

El logo oficial vive en `components/ui/PulsoLogo.tsx` y se usa en la portada.
Las instrucciones de estilo de los paneles están en
[`explicaciones/paneles.md`](explicaciones/paneles.md).
