# La capa de IA (`lib/ai` y `app/api/ai`)

> Qué hace el modelo de lenguaje en Pulso Jarocho, qué **no** puede hacer y por
> qué está limitado así.

---

## 1. En una frase

Gemini **redacta** el texto de la misión y el «por qué te lo recomendamos». No
decide la ruta, no inventa datos y nunca puede tumbar la demo.

---

## 2. La regla de oro

> **La IA no decide la ruta, la explica.**

El motor (`lib/engine`) calcula la ruta con seis pesos explícitos. La IA solo
convierte ese resultado en una frase que el visitante entienda.

Si el motor no eligió un lugar, la IA no lo puede meter. Si el motor eligió un
lugar, la IA no puede inventarle un precio, un horario ni una promoción.

---

## 3. Los archivos

| Archivo | Qué hace |
|---|---|
| `config.ts` | modelo, tiempo límite, instrucción del sistema e instrucciones de idioma |
| `gemini.ts` | cliente de `@google/genai`, armado del prompt y parseo de la respuesta |
| `fallback.ts` | las plantillas de respaldo: el mismo contrato sin llamar a la red |
| `app/api/ai/mission/route.ts` | el endpoint `POST /api/ai/mission` |

---

## 4. Qué recibe el modelo

**Solo la ficha del lugar.** Nunca el catálogo entero, nunca datos inventados:

```jsonc
{
  "nombre": "Gran Café de la Parroquia",
  "categoria": "gastronomia",
  "descripcion": "Una institución desde 1808...",
  "horario": "Todos los días de 7:00 a 23:00",
  "horarioVerificado": false,
  "avgVisitMin": 20,
  "priceLevel": "medio",
  "opportunity": 0.4
}
```

Y además:

- los **intereses** del visitante,
- el **motivo que ya calculó el motor** (para que el texto sea coherente con la
  puntuación y no lo contradiga).

---

## 5. La instrucción del sistema

Es lo que garantiza que el modelo no invente. Va literal en cada llamada:

> Eres un guía del Centro Histórico de Veracruz. Escribes en español claro y
> breve, para una persona que recorre la ciudad con el teléfono en la mano.
> Redacta únicamente con los datos que se te entregan.
> **PROHIBIDO inventar horarios, precios, eventos, promociones, accesibilidad o
> cualquier dato que no esté en la ficha.**
> Si un dato no aparece en la ficha, no lo menciones.
> Si el horario no está verificado, menciónalo como «por confirmar».
> No prometas descuentos ni puntos que no estén indicados.
> Devuelve únicamente un JSON válido con las claves `text` (la misión, máximo 2
> frases) y `why` (por qué se recomienda, máximo 1 frase).

Dos detalles pensados para el caso real:

- **«máximo 2 frases» y «máximo 1 frase»**: en un teléfono, un texto largo se
  lee mal. La misión tiene que caber en una tarjeta.
- **«menciónalo como por confirmar»**: si el horario no está verificado, el
  texto tiene que decirlo. Es la forma de que la honestidad llegue también al
  texto generado.

La respuesta se pide en JSON (`responseMimeType: "application/json"`), y el
parseo tolera que el modelo lo envuelva en un bloque de código.

---

## 6. La red puede fallar: la plantilla de respaldo

Todo lo que puede salir mal está cubierto:

| Fallo | Qué pasa |
|---|---|
| No hay `GEMINI_API_KEY` | responde la plantilla |
| La llamada tarda más de **5 segundos** | responde la plantilla |
| La API devuelve un error | responde la plantilla |
| El modelo devuelve algo que no es JSON | responde la plantilla |
| La respuesta viene vacía | responde la plantilla |
| El interruptor `ia` está apagado | responde la plantilla |

El límite de 5 segundos se aplica en el cliente, con un `Promise.race`, así que
la demo no puede quedarse esperando.

**La plantilla devuelve exactamente el mismo contrato**:

```jsonc
{
  "text": "Visita Gran Café de la Parroquia y completa la misión: recorre el lugar y registra tu visita escaneando el QR. Descubre la gastronomía en el Centro Histórico. Horario según la ficha: Todos los días de 7:00 a 23:00 (por confirmar).",
  "why": "Gran Café de la Parroquia encaja con la gastronomía y su visita cabe en el tiempo que elegiste. Te interesan gastronomía, historia.",
  "source": "respaldo"
}
```

El campo `source` dice de dónde salió el texto: `ia` o `respaldo`. La app lo
puede mostrar para ser transparente con el público.

---

## 7. El endpoint

```
POST /api/ai/mission
```

| Campo | Obligatorio | Qué es |
|---|---|---|
| `placeId` | sí | id del lugar |
| `interests` | no | los intereses del visitante |
| `place` | no | la ficha entera, para no depender del backend |
| `idioma` | no | `es` (por omisión) o `en` |

Respuesta: `{ text, why, source }`.

### Cómo encuentra la ficha

En este orden, y cada paso es inmediato:

1. La que viene en el cuerpo (`place`).
2. El catálogo local (`lib/engine/datos-demo.ts`).
3. `lib/mock` (ids cortos tipo `p1`).
4. La base de datos, con un **límite de 2,5 segundos**: si Supabase no
   responde, se queda con lo que ya tenía en vez de dejar la pantalla esperando.

---

## 8. El idioma (para los cruceristas)

Con `"idioma": "en"` cambian tres cosas a la vez:

| Elemento | En español | En inglés |
|---|---|---|
| Instrucción al modelo | «Escribe en español…» | «Write in English for a cruise visitor…» |
| Encabezado del prompt | «Datos de la ficha» | «Place data» |
| Plantilla de respaldo | «Visita… completa la misión» | «Visit… and complete the mission» |
| Aviso de horario sin verificar | «por confirmar» | «to be confirmed» |

Que la plantilla también cambie de idioma es lo importante: **si Gemini falla
justo cuando llega un cruises, el texto sigue siendo utilizable**.

El nombre del lugar **no se traduce**: se usa tal como está en la ficha, que es
como lo busca el turista en Google Maps.

---

## 9. Lo que la IA no hace

| No puede… | Por qué |
|---|---|
| Elegir los lugares de la ruta | la ruta la decide el motor |
| Inventar horarios, precios o promociones | va prohibido en la instrucción y no hay dato fuera de la ficha |
| Dar puntos | los puntos los suma el servidor, con la función SQL `increment_points` |
| Devolver un 500 | todo fallo cae a la plantilla |
| Filtrar por el presupuesto | es un filtro determinista del motor |
| Conocer al visitante | solo recibe la ficha del lugar y sus intereses |

---

## 10. Configuración

| Variable | Por omisión | Para qué |
|---|---|---|
| `GEMINI_API_KEY` | — | la credencial. Sin ella, todo va por plantilla |
| `GEMINI_MODEL` | `gemini-2.5-flash` | el modelo usado |
| — | `timeoutMs: 5000` | tiempo límite de la llamada |
| — | `temperature: 0.4` | baja, para que no invente ni se desvíe |
| `flags.ia` | `true` | interruptor para apagar la IA |

Cambiar el modelo es cambiar una variable; el resto está en `config.ts`.

---

## 11. Las pruebas

`lib/ai/__tests__/ai.test.ts` y `app/api/ai/mission/__tests__/mission.test.ts`:

- la plantilla genera el mismo contrato que el modelo,
- un horario sin verificar se marca como «por confirmar» y no como seguro,
- un horario verificado se afirma sin rodeos,
- la respuesta se parsea aunque venga en bloque de código,
- si el modelo devuelve algo ininterpretable, se responde con la plantilla,
- el prompt en inglés pide los datos en inglés,
- la plantilla en inglés también escribe en inglés,
- el endpoint con un id inexistente responde 404 y no un 500.

---

## 12. Preguntas del jurado

**¿Y si Gemini inventa un horario?**
La instrucción lo prohíbe y los datos que recibe son solo los de la ficha. Pero
además hay una red de seguridad: el texto generado nunca es la única fuente.
El horario que ve el visitante sale de la base de datos, no del modelo; el
modelo solo lo menciona, y solo si está verificado.

**¿Qué pasa si la API de Google se cae durante la demo?**
La plantilla responde. El visitante lee «Visita el Gran Café de la Parroquia y
completa la misión…» y el flujo sigue igual. La demo no depende de que un
tercero esté en línea.

**¿Por qué limitar el tiempo a 5 segundos?**
Porque en una demo, esperar en silencio es peor que un texto genérico. El
límite obliga a decidir rápido: el modelo o la plantilla.

**¿Podría la IA responder preguntas del visitante sobre horarios?**
No en esta versión. Sería el siguiente paso: una capa de consulta sobre los
datos registrados, con el mismo principio de no inventar.
