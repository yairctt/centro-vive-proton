# El motor de recomendación (`lib/engine`)

> Cómo decide el sistema qué lugares te recomienda y por qué. Todo lo que hay
> aquí son **funciones puras**: sin red, sin base de datos y sin reloj del
> sistema. La misma entrada da siempre la misma salida.

---

## 1. En una frase

El motor **puntúa** cada lugar con seis factores, **descarta** los que no
sirven, **ordena** las paradas con vecino más cercano y **explica** cada
elección en español.

---

## 2. Los archivos

| Archivo | Qué hace |
|---|---|
| `config.ts` | los seis pesos y todas las constantes de negocio |
| `geo.ts` | distancia real entre dos puntos (haversine) y minutos de caminata |
| `place.ts` | normaliza la ficha de un lugar: horario, precio, tiempo, oportunidad |
| `score.ts` | la puntuación de un lugar, con su desglose |
| `route.ts` | arma la ruta completa y redacta los motivos |
| `datos-demo.ts` | catálogo de respaldo (12 lugares, 6 comercios, agenda) |
| `datos-eventos.ts` | eventos de respaldo para la agenda |
| `zona-horaria.ts` | hora y día de la semana **de Veracruz**, no del servidor |
| `index.ts` | la puerta de entrada: lo que importa importar |

Se usa así:

```ts
import { buildRoute } from "@/lib/engine";

const { stops, totalMin } = buildRoute(places, request, { now, events, missions });
```

---

## 3. La fórmula

```
Score = w_afinidad·afinidad
      + w_cercanía·cercanía
      + w_disponibilidad·disponibilidad
      + w_tiempo·tiempo
      + w_oportunidad·oportunidad
      + w_bonoNocturno·bonoNocturno
      + w_clima·clima
      + w_accesibilidad·accesibilidad
```

Cada factor vale entre 0 y 1, así que la puntuación final también. Los pesos
viven en `config.ts`:

| Peso | Valor | Qué mide |
|---|---|---|
| `afinidad` | **0.35** | si la categoría está entre los intereses del visitante (1) o no (0.2) |
| `cercania` | **0.25** | qué tan lejos está del punto de partida, degradándose hasta 1500 m |
| `disponibilidad` | **0.15** | si está abierto ahora (1), cerrado (0) o se desconoce (0.5) |
| `tiempo` | **0.10** | si la visita cabe en los minutos que quedan (1) o no (0) |
| `oportunidad` | **0.15** | cuánta visibilidad necesita el lugar (dato del backend) |
| `bonoNocturno` | **0.10** | si está abierto después de las 19:00 (el «Centro de noche») |
| `clima` | **0** | reservado para el requisito de lluvia o calor |
| `accesibilidad` | **0** | reservado para el requisito de accesibilidad |

Los dos últimos están en **0 a propósito**: existen, están probados y no
cambian nada hasta que el requisito los pida. Ver
[`requisito-jueves.md`](requisito-jueves.md).

### Por qué estos pesos

El orden de decisión refleja lo que el proyecto defiende: **primero lo que el
visitante pidió** (afinidad), **luego lo que hace la ruta viable** (cercanía,
disponibilidad, tiempo) y **después el interés público** (oportunidad y el
incentivo nocturno). Si el peso de oportunidad fuera mayor, la ruta empezaría
por el comercio que más lo necesita en vez de por el lugar que el visitante
quiso ver.

---

## 4. Los tres pasos de la construcción

```
places + eventos + misión  →  filtrar  →  puntuar  →  ordenar  →  recorrer
```

### Paso 1 · Filtrar (descarta)

| Filtro | Por qué |
|---|---|
| Precio mayor al presupuesto | el visitante dijo que no quiere gastar eso |
| Cerrado a esta hora | no puede visitarlo |
| Sin accesibilidad (solo si el requisito está activo) | se lo pidió |

### Paso 2 · Puntuar y ordenar

Cada lugar recibe su puntuación y su **desglose** (los ocho factores por
separado). Se ordena de mayor a menor.

### Paso 3 · Recorrer (vecino más cercano)

Desde el punto de partida se elige la parada siguiente combinando dos cosas:

- que **quepa** en el tiempo que queda (caminata + visita),
- que **puntúe** alto.

Se avanza hasta que no queda tiempo o ya no hay paradas. El resultado respeta
el presupuesto de minutos: **la ruta nunca dura más de lo que pidió el
visitante**.

---

## 5. Distancias y tiempos

| Dato | De dónde sale |
|---|---|
| Distancia entre dos lugares | fórmula de **haversine** sobre lat/lng reales (`geo.ts`) |
| Velocidad de caminata | **80 m/min** (`engineConfig.velocidadCaminataMPerMin`) |
| Radio de cercanía | **1500 m**: a partir de ahí la cercanía deja de penalizar |
| Radio de evento | **600 m**: un evento entra en la ruta si está a menos de eso |

La distancia es real (no un número inventado), pero **no sigue las calles**:
es la línea recta entre dos puntos. En el Centro Histórico, donde las cuadras
son cortas, el orden y el tiempo estimado son lo importante. El mapa lo
advierte con el texto «Trazo aproximado en línea recta».

### El enlace a Google Maps

Cada parada se puede abrir en Google Maps (`components/visitante/enlaces-maps.ts`).
Al armar el enlace se **limpia el prefijo `[DEMO]`** del nombre: los comercios de
la demo son ficticios y ese texto rompería la búsqueda en Google. El nombre real
del lugar sí se conserva.

---

## 6. Los horarios: por día de la semana

El backend guarda el horario de un lugar en dos sitios: columnas sueltas
(`opens_at`, `closes_at`) y el bloque `meta`. Cuando el horario **depende del
día** —el museo abre de martes a domingo, el mercado cierra antes el
domingo— se usa `meta.horarioSemanal`:

```jsonc
"meta": {
  "horarioSemanal": {
    "1": null,                      // lunes: cerrado
    "2": ["10:00", "17:00"],        // martes: de 10:00 a 17:00
    "3": ["10:00", "17:00"],
    "4": ["10:00", "17:00"],
    "5": ["10:00", "17:00"],
    "6": ["10:00", "17:00"],
    "7": ["10:00", "16:00"]         // domingo: cierra antes
  }
}
```

Las claves son días **ISO 8601**: 1 = lunes … 7 = domingo.

| Valor | Significado |
|---|---|
| `["10:00", "17:00"]` | abierto ese día |
| `null` | **cerrado** ese día |
| la clave no aparece | no se sabe: el lugar **no se descarta** |

Ese último caso es importante: **la ausencia de datos nunca es motivo para
eliminar un lugar**. Solo se elimina cuando hay un «cerrado» explícito.

### El estado del lugar

`meta.estado` marca los casos especiales:

| Estado | Qué significa |
|---|---|
| `operativo` | el normal (no hace falta ponerlo) |
| `cerradoTemporalmente` | cerrado por restauración: sale de la ruta |
| `cerradoAlPublico` | protegido o en obras: sale de la ruta |

### Horarios que no están verificados

Cuando el horario varía o hay que confirmarlo en el sitio:

```jsonc
"meta": {
  "horarioVerificado": false,
  "horarioNota": "El horario más reportado es 7:00–23:00, pero algunas fuentes mencionan 6:00–1:00."
}
```

El motor **no lo descarta** (lo trata como «no se sabe») y la IA lo menciona
como «por confirmar». Nunca se presenta como seguro un dato que no lo está.

---

## 7. La hora del día: la zona del destino

El servidor (Vercel) corre en **UTC**; la demo es en Veracruz (UTC-6). Si el
motor usara `date.getHours()`, el bono de «Centro de noche» se dispararía a las
**13:00** en vez de a las 19:00, y el día de la semana se cruzaría mal.

Por eso `zona-horaria.ts` usa `Intl`:

```ts
export function minutosDelDia(fecha: Date): number;   // en hora de Veracruz
export function diaSemanaIso(fecha: Date): 1|2|3|4|5|6|7;
```

Y `instanteEnZona()` convierte una hora de reloj de Veracruz al instante
correcto, para los datos que se guardan (los eventos de respaldo).

> Hay una prueba que corre la suite del motor en UTC, en hora de Veracruz y en
> Tokio: el resultado tiene que ser el mismo.

---

## 8. El motivo: lo que ve el visitante

Cada parada lleva un texto en español que explica la decisión. Se arma con las
mismas piezas que la puntuación:

```
Te interesa historia, está a 4 min a pie, está abierto ahora,
necesita que le pongas un sello, cuenta con puntos extra de Centro de noche
```

| Pieza | De dónde sale |
|---|---|
| «Te interesa X» | la categoría está entre sus intereses |
| «está a N min a pie» | la distancia real hasta la parada |
| «está abierto ahora» | el horario del día, en hora de Veracruz |
| «necesita que le pongas un sello» | `opportunity` alta (≥ 0.7): el lugar necesita visitantes |
| «cuenta con puntos extra de Centro de noche» | está abierto después de las 19:00 |
| «Hay "Danzón en la Plazuela" cerca de la ruta» | hay un evento en esa parada |

---

## 9. Los interruptores

El motor respeta dos banderas de `lib/flags.ts`:

| Interruptor | Efecto |
|---|---|
| `centroDeNoche` | si está apagado, el bono nocturno no se aplica |
| `agenda` | si está apagado, los eventos no entran en la ruta |

Y `ia` (que vive en la capa de IA) apaga la llamada a Gemini.

---

## 10. Cómo ajustarlo

### Quiero que prefiera los lugares con más visibilidad

```ts
// lib/engine/config.ts
oportunidad: 0.15  →  0.25
```

Y baja `afinidad` para que no se compensate tanto.

### Quiero rutas más cortas

```ts
velocidadCaminataMPerMin: 80  →  70   // el motor estima que se camina más lento
```

### Quiero que el «Centro de noche» empiece antes

```ts
horaBonoNocturno: 19  →  18
```

### Quiero que un evento entre aunque esté más lejos

```ts
radioEventoM: 600  →  900
```

### Quiero quitar el «Centro de noche»

```ts
// lib/flags.ts
centroDeNoche: false
```

---

## 11. Las pruebas

`lib/engine/__tests__/` — **función pura, resultado verificable**:

| Archivo | Qué comprueba |
|---|---|
| `score.test.ts` | cada factor por separado: afinidad, cercanía, disponibilidad, tiempo, oportunidad, bono y la suma ponderada |
| `route.test.ts` | los filtros de presupuesto y de lugar cerrado, el orden, el tiempo total y el motivo de cada parada |
| `datos-demo.test.ts` | el catálogo: que ningún lugar traiga horario inventado, que las coordenadas sean las reales y que la ruta respete el tiempo |
| `datos-eventos.test.ts` | que los eventos entren solo si caben en la ventana y en el radio |
| `flags.test.ts` | que cada interruptor se respete en los dos estados |
| `zona-horaria.test.ts` | que la hora y el día se calculen en la zona del destino |
| `independencia-zona.test.ts` | que la suite dé lo mismo con el servidor en UTC, Veracruz y Tokio |
| `requisito-jueves.test.ts` | que los escenarios del requisito nuevo estén preparados y no cambien nada hasta activarlos |
| `backend-compat.test.ts` | que el motor entienda las filas tal como las devuelve el mapper del backend |

```bash
npm test
```

---

## 12. Preguntas del jurado

**¿Por qué un algoritmo y no un modelo de lenguaje?**
Porque tiene que ser **reproducible**: la misma ruta con los mismos datos, y
razonable en cada parada. Un modelo puede inventar un lugar o un horario; un
motor con pesos explícitos no. La IA entra después, para explicarlo.

**¿Cómo se sabe que el peso está bien?**
Con el desglose: cada parada enseña los ocho factores. Se puede ver por qué
el Zócalo ganó y por qué uncomercio de la calle de atrás no entró.

**¿La ruta sigue las calles?**
No: es la línea recta entre paradas, y el mapa lo dice. Calcular rutas por
calles exigiría otro servicio con clave y cuota. En el Centro Histórico, de
seis cuadras, el orden y el tiempo estimado son lo que el visitante nota.

**¿Y si cambia el peso de un día para otro?**
Vive en `config.ts`; se cambia y se compila. Además hay una bandera para
apagar el «Centro de noche» sin tocar el motor.

**¿Qué pasa si no se sabe el horario de un lugar?**
No se descarta. Se le da disponibilidad neutra y se muestra «por confirmar».
Descartarlo por ignorancia sería tapar una parte del centro.
