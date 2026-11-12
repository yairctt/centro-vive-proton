# Los datos del proyecto (`supabase/`)

> Qué hay guardado, por qué está así y cómo se carga. También la respuesta a
> la pregunta que más importa en una demo: **¿de dónde salen estos datos y son
> ciertos?**

---

## 1. De dónde salen los datos

| Lugar | Qué es | Quién lo pone |
|---|---|---|
| `supabase/schema.sql` | el esquema: 10 tablas, RLS, políticas y la función de puntos | I3 |
| `supabase/seed.sql` | los datos de demostración | I3 |
| `lib/engine/datos-demo.ts` | catálogo de respaldo con horarios oficiales | I4 |
| `lib/mock/index.ts` | datos de prueba de la interfaz | I1 |

El orden de preferencia en la app es siempre:

```
base de datos (lo real)  →  catálogo de respaldo  →  error
```

Una API nunca devuelve un error 500 solo por falta de base: cae al catálogo y
lo avisa. La respuesta de `/api/route` incluye `origen: "base" | "respaldo"`
para que se sepa con qué datos se calculó.

---

## 2. Las diez tablas

### `profiles` — quién es el visitante

| Columna | Tipo | Nota |
|---|---|---|
| `id` | UUID | pk |
| `auth_id` | UUID | el usuario de Supabase Auth (único) |
| `alias` | TEXT | el nombre que se ve en el pasaporte |
| `role` | TEXT | `visitante` · `comercio` · `admin` |
| `points` | INTEGER | **lo suma el servidor**, nunca el cliente |
| `created_at` | TIMESTAMPTZ | |

### `places` — los lugares y los comercios

| Columna | Tipo | Nota |
|---|---|---|
| `id` | UUID | pk |
| `name` | TEXT | |
| `category` | TEXT | `historia` · `gastronomia` · `cultura` · `paseo` · `compras` |
| `lat`, `lng` | DOUBLE | coordenadas reales, verificadas en OpenStreetMap |
| `description` | TEXT | |
| `opens_at`, `closes_at` | TIME | `HH:MM`. `NULL` si no se conoce |
| `avg_visit_min` | INTEGER | minutos de visita típicos (30 por omisión) |
| `price_level` | TEXT | `bajo` · `medio` · `alto` (con `CHECK`) |
| `opportunity` | NUMERIC(3,2) | necesidad de visibilidad, 0.00–1.00 |
| `verified` | BOOLEAN | `false` = «por confirmar» |
| `meta` | JSONB | los atributos opcionales (ver §4) |

### `businesses` — la ficha de negocio

Une un `place_id` con el responsable, el contacto y si está **activo** en el
programa. Un lugar puede no ser comercio: por eso están en tablas separadas.

### `events` — la agenda

| Columna | Nota |
|---|---|
| `title`, `category` | |
| `place_id` | el lugar donde ocurre (puede ser nulo) |
| `starts_at`, `ends_at` | TIMESTAMPTZ, **en hora de Veracruz** |
| `source` | de dónde salió el dato |
| `verified` | `false` = «por confirmar» |

### `missions` — lo que el visitante acepta hacer

| Columna | Nota |
|---|---|
| `place_id` | dónde se hace |
| `title`, `description` | el texto de la misión |
| `points` | los puntos que da |
| `night_bonus` | si da puntos extra de noche |
| `active` | si está vigente |

### `mission_accepts` — las misiones aceptadas

`UNIQUE (profile_id, mission_id)`: aceptar dos veces la misma misión no falla,
no duplica.

### `qr_tokens` — los códigos QR

| Columna | Nota |
|---|---|
| `token` | TEXT **único**, `gen_random_uuid()` por omisión: no es predecible |
| `place_id` | el lugar |
| `expires_at` | `NULL` = no caduca |
| `active` | `false` = token retirado |

### `visits` — las visitas validadas

| Columna | Nota |
|---|---|
| `profile_id`, `place_id` | quién y dónde |
| `mission_id` | la misión completada, si la había |
| `method` | `qr` o `manual` (con `CHECK`) |
| `qr_token_id` | el token escaneado |
| `points_awarded` | lo que se sumó |

### `rewards` — las recompensas

Del negocio (`business_id`), con el título, las condiciones, el **coste en
puntos** y la vigencia.

### `redemptions` — los canjes

| Columna | Nota |
|---|---|
| `profile_id`, `reward_id` | quién canjeó qué |
| `confirmed` | `false` hasta que el comercio lo entrega |
| `confirmed_at` | cuándo se confirmó |

---

## 3. El seed: qué carga

| Tabla | Filas | Qué son |
|---|---|---|
| `profiles` | 3 | `visitante-demo`, `comercio-demo`, `admin-demo` |
| `places` | **18** | 12 lugares del Centro Histórico + 6 comercios de demostración |
| `businesses` | 6 | los 6 comercios |
| `events` | 4 | hoy (18:00 y 20:00) y mañana (11:00 y 19:00) |
| `missions` | 3 | una con bono nocturno |
| `rewards` | 3 | 60, 80 y 100 puntos |
| `qr_tokens` | 18 | uno por lugar, con `gen_random_uuid()` |

### Los 12 lugares

Zócalo de Veracruz · Catedral · Palacio Municipal · Los Portales de Lerdo ·
Malecón · Faro Venustiano Carranza · Museo de la Ciudad · Callejón del Diamante ·
Gran Café del Portal · Mercado Hidalgo · Baluarte de Santiago · Recinto de la Reforma.

### Los 6 comercios

Van marcados con **`[DEMO]`** en el nombre, a propósito: en la interfaz se ve
de un vistazo que son ficticios, no empresas reales.

`Antojitos La Jarocha Alegre` · `Café y Toritos La Bamba Nocturna` (abre de noche) ·
`Mariscos El Puerto Bravo` (abre de noche) · `Artesanías El Coral Blanco` ·
`Guayaberas y Sombreros El Danzón` · `Dulcería y Nieves Doña Gloria`.

### Cómo se corre

En el **SQL Editor** de Supabase, en este orden:

1. `supabase/schema.sql` — crea las tablas, activa RLS, las políticas y la función.
2. `supabase/seed.sql` — mete los datos. Es idempotente: se puede volver a
   correr sin duplicar (`ON CONFLICT ... DO UPDATE`).

Comprobación:

```sql
SELECT count(*) FROM places;    -- 18
SELECT count(*) FROM events;    -- 4
SELECT count(*) FROM profiles;  -- 3
```

---

## 4. `meta`: la válvula de escape

`meta` es JSONB y ahí caben los atributos que un lugar puede tener y otro no,
**sin tocar el esquema**.

| Clave | Tipo | Para qué | Quién la llena |
|---|---|---|---|
| `avgVisitMin` | number | minutos de visita | backend (columna propia) |
| `priceLevel` | `bajo`/`medio`/`alto` | rango de precio | backend (columna propia) |
| `opportunity` | number | necesidad de visibilidad, 0..1 | backend (columna propia) |
| `opensAt` / `closesAt` | `HH:MM` | horario | backend (columnas propias) |
| `horarioSemanal` | objeto | horario por día de la semana (ISO 8601) | catálogo local |
| `horarioVerificado` | boolean | `false` si el horario es variable | catálogo local |
| `horarioNota` | texto | la salvedad sobre el horario | catálogo local |
| `estado` | texto | `cerradoTemporalmente` · `cerradoAlPublico` | catálogo local |
| `bajoTecho` / `interior` | boolean | lugar cubierto (requisito de clima) | backend |
| `accesible` | boolean | accesibilidad (requisito de accesibilidad) | backend |
| `abreDeNoche` | boolean | negocio nocturno | backend |

### `horarioSemanal` en detalle

```jsonc
{
  "1": null,                    // lunes: cerrado
  "2": ["10:00", "17:00"],      // martes: de 10:00 a 17:00
  "7": ["10:00", "16:00"]       // domingo: cierra antes
}
```

Las claves son días ISO 8601 (1 = lunes … 7 = domingo). Un día con `null` es
**cerrado**; un día que **no aparece** es «no se sabe» y el lugar **no se
descarta**. Solo se elimina un lugar cuando hay un «cerrado» explícito.

---

## 5. Seguridad de los datos

### Row Level Security

Las diez tablas tienen RLS activado. Las políticas:

| Política | Qué permite |
|---|---|
| `places_select_public` | lectura pública de los lugares |
| `events_select_public` | lectura pública de la agenda |
| `missions_select_public` | lectura pública de las misiones |
| `qr_tokens_select_public` | lectura pública de los tokens |
| `rewards_select_public` | lectura pública de las recompensas |
| `profiles_select_own` | cada quien ve su perfil |
| `profiles_update_own` | cada quien actualiza su perfil |
| `visits_select_own` | cada quien ve sus visitas |
| `visits_insert_service` | **solo el service role** inserta visitas |
| `mission_accepts_select_own` | cada quien ve lo que aceptó |
| `mission_accepts_insert_service` | **solo el service role** inserta aceptaciones |
| `redemptions_select_service` | solo el service role |
| `redemptions_insert_service` | solo el service role |
| `redemptions_update_service` | solo el service role |

La idea: **el navegador nunca puede escribir**. Todo lo que suma puntos o
registra una visita pasa por un route handler con la service role.

### La función `increment_points`

```sql
CREATE OR REPLACE FUNCTION increment_points(profile_id UUID, delta INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE new_total INTEGER;
BEGIN
  UPDATE profiles SET points = points + delta
   WHERE id = profile_id
  RETURNING points INTO new_total;
  RETURN new_total;
END;
$$;
```

`SECURITY DEFINER` + `UPDATE ... RETURNING`: la suma es **atómica**. Si dos
escaneos del mismo usuario llegan a la vez, la base de datos los serializa: no
se pierde ni se duplica ningún punto.

---

## 6. Los tokens QR

- `gen_random_uuid()`: un identificador aleatorio de 128 bits. **No es
  predecible.**
- `UNIQUE`: no hay dos tokens iguales.
- `expires_at`: puede caducar.
- `active`: se puede retirar sin borrar.
- El servidor comprueba, en este orden: **existe → está activo → no ha
  expirado → ese perfil no lo ha usado antes**.

Un token cuenta **una vez por perfil**. Por eso el seed genera **18 tokens**
(uno por lugar), no uno por usuario.

---

## 7. La verdad de los datos

Es la pregunta que hay que poder responder sin dudar:

| Qué | De dónde sale | Cómo se marca |
|---|---|---|
| Nombres y coordenadas de los 12 lugares | OpenStreetMap, verificados | `verified: false` → «por confirmar» |
| Horarios | los reporta la lista del equipo, sin verificar en el sitio | `horarioVerificado: false` + nota |
| Los 6 comercios | **ficticios**, creados para la demo | `[DEMO]` en el nombre |
| Los 4 eventos | simulados para la demo | `source: "demo"` |
| Puntos | los calcula el servidor | — |

**El principio del proyecto:** si un dato no está verificado, se muestra como
«por confirmar». Es preferible a afirmar algo que puede ser falso.

---

## 8. Preguntas del jurado

**¿Los lugares son reales?**
Los 12 lugares del Centro Histórico **sí existen** y sus coordenadas están
verificadas en OpenStreetMap. Los **6 comercios son ficticios**, y su nombre lo
dice (`[DEMO]`). No se atribuyen ventas ni afirmaciones a negocios reales.

**¿Los horarios son ciertos?**
Vienen de fuentes públicas, pero **no están verificados en el sitio**, así que
la app los marca «por confirmar» y no se afirma nada como seguro. Es
deliberado.

**¿Por qué hay datos duplicados en el código y en la base?**
El catálogo de `lib/engine/datos-demo.ts` es el **respaldo**: permite que la
demo funcione sin base de datos. Cuando la base está cargada, manda la base.

**¿Qué pasa si alguien manipula el navegador para darse puntos?**
No puede. Los puntos se suman en el servidor, con una función SQL atómica, y
solo con una sesión válida. El token tiene que existir, estar activo y no
haber sido usado por ese perfil.

**¿Los datos son personales?**
No. El alias es un seudónimo y no se guarda ubicación: la latitud del
visitante solo se usa en memoria, para ordenar la ruta, y no se persiste.
