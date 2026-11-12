# Requisito del jueves — guía rápida (Integrante 4)

> El reto puede añadir un requisito sorpresa a las 07:00. Esta guía deja
> preparado lo que depende del **motor** y de la **IA**, con los pasos exactos
> para activarlo. Todo se cambia desde configuración: **no hay que reescribir
> el motor**.

Según la sección 12 del CONTEXTO.md, estos son los escenarios que nos tocan:

| Posible requisito | Qué tocar | Quién |
|---|---|---|
| Inglés / cruceristas | `idioma` en la petición + `lib/i18n/en.ts` | I1, **I4** |
| Accesibilidad | `meta.accesible` + filtro en el motor | I3, **I4** |
| Lluvia o calor | `meta.bajoTecho` + peso del clima | **I4** |

---

## 1. Lluvia o calor

**Ya está en el motor.** El peso `clima` está en `lib/engine/config.ts` (ahora
en 0, así que no cambia nada hasta activarlo).

```ts
// lib/engine/config.ts
export const weights = {
  ...
  clima: 0.15,   // ← poner > 0 para activarlo
};
```

El motor ya recibe el clima que reporta el visitante:

```http
POST /api/route
{ "minutes": 120, "interests": ["paseo"], "budget": "medio",
  "clima": ["lluvia"], "temperaturaC": 34 }
```

Y hace dos cosas:

- Un lugar con `meta.bajoTecho: true` (o `meta.interior: true`) puntúa **1** en
  el factor clima; uno sin techo puntúa **0**.
- Si la temperatura llega a `engineConfig.clima.temperaturaCalorExtremo` (33 °C
  por omisión), se activa sola, sin que el visitante diga nada.

**Quién lo rellena:** I3 agrega `bajoTecho` y `interior` en `meta` de los
lugares del `seed.sql`. Si un lugar no lo dice, se trata como descubierto (no
se inventa que tenga techo).

---

## 2. Accesibilidad

**Ya está en el motor**, con dos llaves:

```ts
// lib/engine/config.ts
accesibilidad: {
  exigirAccesible: true,       // ← activa el filtro
  permitirDesconocido: true,    // false = descarta también los que no lo digan
},
```

```http
POST /api/route
{ "minutes": 120, "interests": ["historia"], "budget": "medio",
  "requiereAccesible": true }
```

El motor lee `meta.accesible` de cada lugar:

- `true` → accesible.
- `false` → no accesible.
- Sin dato → se asume accesible **solo si el lugar está verificado**; si no,
  no se da por accesible (no se inventa).

Con `exigirAccesible: true` y `permitirDesconocido: false`, los lugares sin
dato se descartan de la ruta.

**Quién lo rellena:** I3 agrega `accesible` en `meta` del seed.

---

## 3. Inglés para cruceristas

La IA ya acepta el idioma:

```http
POST /api/ai/mission
{ "placeId": "zocalo", "interests": ["paseo"], "idioma": "en" }
```

Con `"en"`:

- La instrucción que se manda al modelo cambia (redacta en inglés para un
  visitante de crucero).
- El prompt se arma en inglés.
- Si Gemini falla, **la plantilla de respaldo también escribe en inglés**
  (`Visit ... and complete the mission`, `to be confirmed`).

**Quién lo rellena:** I1, con `lib/i18n/en.ts` y el selector de idioma en la
interfaz; el selector manda `idioma` en las dos peticiones (`/api/route` y
`/api/ai/mission`).

---

## 4. Si el requisito fuera otro

La misma regla: **cualquier cosa nueva del motor es un peso más en
`config.ts` y un dato en `meta`.**

El esqueleto siempre es el mismo:

1. Un peso nuevo en `weights` (en 0 = apagado, no cambia nada).
2. Un dato opcional en `meta` del lugar (que el backend siembra).
3. Un factor en `scorePlace` que devuelve 0..1 y va en el desglose.
4. Un filtro en `buildRoute`, si hace falta excluir.

Con eso, activar el requisito es cambiar un número, y la demo sigue
funcionando mientras tanto.

---

## Comprobaciones

```bash
npm test     # incluye lib/engine/__tests__/requisito-jueves.test.ts
npm run build
```

Ese archivo de pruebas deja claro que **con los pesos en 0 el motor se comporta
exactamente igual que antes**: los escenarios están preparados, no activos.
