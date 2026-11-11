# QR: generación, escaneo y validación (`lib/qr`, `app/escanear`)

## Qué hace

Cada lugar participante tiene un QR impreso. Cuando el visitante lo escanea, la app manda el token al servidor, que registra la visita y suma los puntos al pasaporte. Esa visita aparece en el tablero de admin en menos de 10 s. Es la parte del flujo de oro que **nunca se recorta**: QR → puntos → tablero.

## Cómo funciona (en 5 líneas)

1. Para cada lugar, el servidor guarda en `qr_tokens` un token aleatorio (`crypto.randomUUID()`). `/admin/qr` lo convierte en una URL con `buildQrUrl(token, dominio)` → `https://<dominio>/escanear?t=<token>` y la imprime como QR.
2. El visitante puede escanearlo con la **cámara normal del teléfono** (abre `/escanear?t=…` y valida sin abrir el lector) o con el botón «Escanear QR» de la app (html5-qrcode con la cámara trasera).
3. `extractToken()` acepta tanto el token solo como la URL completa y rechaza cualquier otro QR («Este código no es un QR de Pulso Jarocho»).
4. La página manda solo `{ token }` a `POST /api/visits/validate`. El servidor comprueba que el token exista, esté activo y no lo haya usado ese perfil, guarda la visita y calcula los puntos.
5. La pantalla muestra «+N puntos», el total del pasaporte y si se completó la misión; o el error con «Intentar de nuevo». Si se niega la cámara, se muestran instrucciones y un campo para escribir el código a mano.

## Flujo completo

```
/admin/qr            Teléfono del visitante                      Servidor (/api/visits/validate)
─────────            ──────────────────────                      ──────────────────────────────
token = randomUUID   cámara lee el QR
buildQrUrl() ──QR──▶ extractToken(texto) → token
                     POST { token } ───────────────────────────▶ ¿token existe y está activo?
                                                                 ¿ya lo usó este perfil? → error
                                                                 inserta visits, suma puntos
                     ◀────────── ValidateResponse ────────────── { ok, pointsAdded, totalPoints,
                     pantalla «+N puntos»                          missionCompleted, message }
                                                                 → el tablero lo ve en /api/stats
```

## Decisiones técnicas

**Por qué el token no es predecible.** Si el QR llevara algo como `zocalo-1`, cualquiera podría adivinar los demás y sumar puntos desde su casa sin visitar el lugar. `crypto.randomUUID()` da 122 bits aleatorios: no se puede adivinar ni deducir de otro token. Además cada token cuenta una sola vez por perfil, así que copiar la foto de un QR no permite repetir puntos.

**Por qué los puntos se calculan en el servidor.** Todo lo que corre en el teléfono se puede modificar (DevTools, peticiones hechas a mano). Por eso el cliente solo manda el token y nunca dice «dame 50 puntos». El servidor decide cuántos puntos vale la visita (misión, bono nocturno) y los escribe con la service role, que nunca sale del servidor. RLS impide que un visitante escriba en `visits` o cambie su `points`. Así el tablero de afluencia es confiable.

**Por qué el QR codifica una URL y no solo el token.** Casi nadie abre una app para escanear: usan la cámara del teléfono. Con una URL, la cámara normal abre directamente `/escanear?t=…` y la visita se valida sin instalar nada, y eso es lo que pasa cuando el jurado escanea en la demo. El lector interno también entiende la URL, y si alguien escanea un QR con el token solo, también funciona. Al validar quitamos `?t=` de la barra de direcciones para que recargar no repita la validación.

**Modo demo.** Si `/api/visits/validate` todavía no existe (404 sin JSON), hay error de red o el servidor falla (5xx), se usa `lib/qr/mock.ts` y se muestra la etiqueta «modo demo». Un rechazo real del servidor (token inválido o ya usado: 4xx con `{ error }`) **no** cae al mock: se muestra el error. El mock nunca toca la base de datos ni el tablero.

**Otras:** html5-qrcode se carga con `import()` solo al pulsar el botón (no pesa en la carga inicial ni rompe el render del servidor); `facingMode: "environment"` elige la cámara trasera; la cámara se apaga en cuanto se lee un código o se sale de la pantalla. La cámara solo funciona con HTTPS (Vercel) o en `localhost`. Los textos están en `es.qr`.

## Preguntas probables del jurado

**¿Qué impide que alguien le tome foto al QR y sume puntos desde su casa?**
Cada token cuenta una vez por perfil, así que la foto no sirve para repetir puntos. Para lo demás, el token es aleatorio (no se pueden fabricar QR de otros lugares) y el registro de visitas permite ver patrones raros. Si hiciera falta más control, `qr_tokens` ya tiene `expiresAt` para rotar los códigos, o se puede pedir la ubicación del teléfono al validar.

**¿Hay que instalar una app para escanear?**
No. El QR es una URL: la cámara normal del teléfono abre la PWA y valida la visita al instante. El lector dentro de la app es una opción más, y si la cámara no tiene permiso, se puede escribir el código impreso.

**¿Qué pasa si el internet falla en el momento de escanear?**
La validación necesita el servidor porque ahí se calculan los puntos. Hoy, mientras el backend se integra, un fallo de red muestra una respuesta de ejemplo con la etiqueta «modo demo» bien visible, que no suma puntos reales. Con el backend en producción, la regla es volver a escanear cuando regrese la señal. Guardar el token y validarlo al recuperar la red es el siguiente paso con la caché de la PWA (sección 12 del contexto).
