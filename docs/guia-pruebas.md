# Guía de pruebas — Pulso Jarocho

Cómo levantar el proyecto y recorrer el flujo de oro paso a paso.
Documento del Integrante 4 (motor e IA) para que el equipo pueda probar sin
tener que adivinar qué falta.

---

## 1. Antes de empezar: qué se necesita

| Qué | Dónde | Quién lo pone |
|---|---|---|
| Node 20 o superior | — | cada quien en su máquina |
| Credenciales de Supabase | Panel de Supabase → Project Settings → API | I3 |
| API key de Gemini | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) | cualquiera |

Las variables se leen de `.env.local` (no se sube al repositorio):

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
GEMINI_API_KEY=AIza...
```

`SUPABASE_SERVICE_ROLE_KEY` y `GEMINI_API_KEY` solo se usan en el servidor:

nunca se exponen al navegador.

---

## 2. Preparar la base de datos (una sola vez)

En el **SQL Editor** del panel de Supabase, en este orden:

1. `supabase/schema.sql` → crea las diez tablas, activa RLS, las políticas y la
   función `increment_points()`.
2. `supabase/seed.sql` → mete los datos de la demo: 12 lugares, 6 comercios,
   4 eventos, 3 misiones, 3 recompensas, los QR y los perfiles de prueba.

Comprobación rápida:

```sql
SELECT count(*) FROM places;   -- 18
SELECT count(*) FROM events;   -- 4
```

Los perfiles de prueba (`visitante-demo`, `comercio-demo`, `admin-demo`) los
crea también el seed: son los que usa el modo demo cuando no hay sesión.

### 2.1 El modo demo (para probar sin cuentas)

La app tiene autenticación: sin sesión, el middleware manda a `/login` y las
APIs que exigen rol responden **401**. Para probar sin crear cuentas, se
enciende el modo demo:

```env
NEXT_PUBLIC_MODO_DEMO=true
```

Con esa variable:

- El middleware deja pasar las pantallas sin sesión.
- Las APIs usan los perfiles demo del seed en lugar de pedir login.

> La variable se lee **al compilar**. Si la cambias, hay que volver a
> compilar (`npm run build`) o redeplegar en Vercel, si no sigue sin efecto.

---

## 3. Levantar el proyecto

```bash
npm install     # solo la primera vez
npm run dev     # http://localhost:3000
```

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción (debe pasar sin errores) |
| `npm test` | Pruebas del motor (Vitest) |
| `npm run bitacora` | Compila `docs/bitacora/*.md` dentro del README |
| `node scripts/verificar-demo.mjs` | Comprueba que pantallas y endpoints responden (con el servidor arriba) |

> Las pruebas del motor pasan en cualquier zona horaria: se ejecutan con el
> offset de Veracruz y hay una prueba que las corre con UTC, Tokio y México.

### Comprobar que todo está listo

Con el servidor corriendo en otra terminal:

```bash
node scripts/verificar-demo.mjs
```

Revisa las 9 pantallas y los 7 endpoints principales. Si todo dice `OK`,
la demo se puede recorrer.

Para comprobar específicamente que **escanear un QR suma puntos al pasaporte**
(hay un Chrome instalado, la prueba lo abre sola):

```bash
node scripts/probar-puntos.mjs
```

---

## 4. Recorrer el flujo de oro

La portada (`/`) tiene un enlace a cada sección.

### 4.1 Preferencias → ruta

1. Entra a **Explorar el Centro** (`/inicio`).
2. Elige el tiempo (60 / 90 / 120 / 180 min), los intereses y el presupuesto.
3. La pantalla de ruta (`/ruta`) muestra las paradas ordenadas, con su
   distancia, su tiempo a pie y **el motivo** de cada recomendación.

**Lo que hay que ver:** que el motivo explique por qué ese lugar. Ejemplos
reales del motor:

> «Te interesa historia, está a 4 min a pie, está abierto ahora, necesita que
> le pongas un sello»

> «Hay "Danzón en la Plazuela de la Campana" cerca de la ruta»

Si la ruta sale vacía o con datos de prueba, el backend no está conectado:
revisá que `/api/route` devuelva `origen: "base"` y no `"respaldo"`.

### 4.2 Ruta → misión

Tocá **Ver Misión Disponible** en una parada. La misión muestra el nombre del
lugar, la recompensa en puntos y el botón de aceptar.

### 4.3 Aceptar la misión

Tocá **Aceptar Misión**. Queda registrada en `mission_accepts`.

### 4.4 Escanear el QR

- Desde la portada, **QR imprimibles** (`/admin/qr`) imprime las tarjetas.
- Con el teléfono: **Escanear QR** (`/escanear`) y apunta a la tarjeta.
  También acepta el token escrito a mano, o la URL
  `/escanear?t=<token>`.

El flujo correcto es: el QR llega al **servidor**, el servidor valida el token
(activo, no vencido, no usado antes por ese perfil) y **suma los puntos**.
El cliente nunca asigna puntos.

### 4.5 Ver los puntos

**Mi pasaporte** (`/pasaporte`) muestra el alias, los puntos, las visitas y las
recompensas canjeables.

> Si la base no está configurada, la pantalla avisa que está en **modo
> demostración** y guarda los puntos en el navegador: escanear un QR y volver
> al pasaporte muestra el total nuevo. Con base de datos, los puntos los lleva
> el servidor y el pasaporte los lee de ahí.

### 4.6 Ver el tablero

**Panel de administración** (`/admin`) refresca cada 5 segundos. Si alguien
escaneó un QR, su visita aparece ahí.

> Las métricas del tablero son **interacciones registradas en la app**, nunca
> conteo de personas ni de ventas. El aviso metodológico está arriba del todo.

### 4.7 El commerce

**Panel de comercio** (`/comercio`): vitrina, promociones, confirmación de
canjes y publicación de eventos (que entran como «por confirmar»).

---

## 5. Endpoints y qué devuelven

| Método y ruta | Entrada | Salida | Nota |
|---|---|---|---|
| `GET /api/places` | — | `Place[]` | Lugares de la base |
| `GET /api/events?when=today\|now` | query | `Event[]` | Agenda de hoy |
| `POST /api/events` | evento | `Event` | Queda `verified: false` |
| `POST /api/route` | `{minutes, interests[], budget, lat?, lng?}` | `{stops, totalMin, origen}` | El motor decide |
| `POST /api/ai/mission` | `{placeId, interests[], place?}` | `{text, why, source}` | `source` es `ia` o `respaldo` |
| `POST /api/missions/accept` | `{missionId}` | misión aceptada | Idempotente |
| `POST /api/visits/validate` | `{token}` | `ValidateResponse` | Los puntos los suma el servidor |
| `GET /api/me/passport` | `?profileId=` | `{profile, visits, rewards}` | |
| `GET /api/stats?from&to` | query | `Stats` |-activity registrada |
| `POST /api/redemptions/confirm` | `{redemptionId}` | canje confirmado | Solo rol comercio |
| `GET /api/qr-tokens` | — | tarjetas de QR | Solo rol admin |

`origen` en `/api/route` dice de dónde salieron los datos: `base` (la base de
datos, lo normal) o `respaldo` (el catálogo de demostración, cuando la base no
está configurada).

---

## 6. Si algo falla

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `Variables de entorno ... son requeridas` | falta `.env.local` | Copiar `.env.example` y completarlo |
| La app manda a `/login` | no hay sesión y el modo demo está apagado | Encender `NEXT_PUBLIC_MODO_DEMO=true` y **recompilar** |
| Un endpoint responde **401** | pide sesión o un rol concreto | Es correcto sin login; con `MODO_DEMO` usa el perfil demo |
| La ruta sale con datos de prueba | la base no responde | Verificar que el seed se corrió |
| La IA siempre devuelve el mismo texto | no hay `GEMINI_API_KEY` | Configurarla en Vercel y en `.env.local` |
| `npm run build` falla | suele ser una variable faltante | El build debe pasar **sin** variables: si falla, es un bug |
| El QR dice que ya se visitó | el token se usó antes con ese perfil | Es lo esperado: un token cuenta una vez |

---

## 7. Antes de abrir un PR

```bash
npm run build   # sin errores
npm test        # todas las pruebas pasan
```

Y el commit sigue el formato `tipo(área): descripción`, por ejemplo
`feat(motor): agrega el peso de oportunidad`.
