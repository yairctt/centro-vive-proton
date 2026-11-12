# Glosario de Pulso Jarocho

> Los términos del proyecto explicados en español llano, para el equipo, para
> el jurado y para quien lea el código después.

---

## Lo que ve el visitante

**Ruta**
: La lista ordenada de paradas que el sistema le propone. Se calcula con el
tiempo, los intereses y el presupuesto que declaró. Cada parada lleva **el
motivo** por qué está ahí.

**Parada**
: Un lugar dentro de la ruta, con su número de orden, la distancia a pie, el
tiempo estimado y la razón de la recomendación.

**Misión**
: Lo que el visitante acepta hacer en un lugar (pedir el café lechero, mirar
la sala de cañones). Al completarla, suma puntos.

**Aceptar una misión**
: Queda registrada en `mission_accepts`. El visitante ve en su Passport qué
misiones tiene pendientes y cuáles ya hizo.

**Pasaporte**
: El documento del visitante con su alias, sus puntos, los sellos de sus
visitas y las recompensas que puede canjear.

**Sello**
: La marca de una visita validada con QR. Aparece en el pasaporte.

**Canje**
: El intercambio de puntos por una recompensa. El visitante lo pide; **el
comercio lo confirma** en su panel, porque la entrega es presencial.

**QR**
: El código impreso en cada lugar. Al escanearlo, el servidor valida la visita
y suma los puntos. El token es aleatorio y **cuenta una vez por persona**.

**Escanear**
: Apuntar la cámara al código. También se puede escribir el token a mano, por
si la cámara no está disponible.

**«Hoy en el centro»**
: La agenda del día: los eventos que ocurren en el Centro Histórico y que
pueden entrar en la ruta.

---

## Lo que ve el comercio

**Vitrina**
: La ficha pública del negocio: nombre, descripción, promociones y
recompensas.

**Publicar un evento**
: Un comercio propone un evento. Entra a la agenda como **«por confirmar»**
hasta que alguien lo verifica.

**Confirmar un canje**
: El comercio marca que entregó la recompensa. Es el paso final: el canje pasa
de «pedido» a «entregado».

---

## Lo que ve la administración

**Tablero de afluencia digital**
: El panel con la actividad registrada en la app: misiones, escaneos por
lugar, canjes y actividad por hora comparada con los comercios abiertos.

**Actividad registrada**
: Lo que la gente hizo **dentro de la app**: escaneó un QR, aceptó una
misión, canjeó un premio. **No es un conteo de personas** ni de ventas, y la
propia interfaz lo advierte arriba.

**Brecha de horario**
: La diferencia entre cuándo hay actividad en la app y cuándo están abiertos
los comercios. Es el dato que le sirve a la autoridad para justificar
programas de iluminación, seguridad o extensión de horarios.

---

## Cómo funciona por dentro

**Motor**
: El módulo (`lib/engine`) que decide la ruta. Pondera seis factores y
ordena las paradas. Es **determinista**: los mismos datos dan siempre la misma
ruta.

**Puntuación**
: El número que recibe cada lugar. Sale de sumar seis factores ponderados:
afinidad, cercanía, disponibilidad, tiempo, oportunidad y bono nocturno.

**Peso**
: Cuánto vale cada factor en la puntuación. Viven en
`lib/engine/config.ts`. Se ajustan sin tocar el código.

**Desglose**
: La puntuación partida en sus factores. Cada parada lo lleva, para poder
explicar la recomendación.

**Explicabilidad**
: Que se pueda decir por qué un lugar está en la ruta. Es la diferencia entre
una recomendación y una caja negra.

**Vecino más cercano**
: La forma de ordenar las paradas: se camina de una en una eligiendo la más
cercana que todavía quepa en el tiempo restante.

**Haversine**
: La fórmula para calcular la distancia real entre dos coordenadas. Se usa
para estimar el tiempo de caminata (≈ 80 m/min).

**Motivo**
: El texto en español que explica cada parada. Lo arma el motor con las
mismas piezas de la puntuación.

**IA**
: Gemini. Solo **redacta** el texto de la misión y el «por qué te lo
recomendamos». No decide la ruta ni inventa datos.

**Plantilla de respaldo**
: El texto que aparece si la IA no responde, se pasa de 5 segundos o no hay
clave de API. Devuelve el mismo formato, así que la app no se entera.

**Modo demo**
: La app funcionando sin base de datos, con el catálogo local. Se enciende
con `NEXT_PUBLIC_MODO_DEMO=true`.

**Por confirmar**
: La etiqueta de un dato que existe pero no está verificado. La app la
muestra en vez de afirmar algo que puede ser falso.

**Cerrado temporalmente**
: Un lugar que no se puede visitar ahora (por restauración, por ejemplo).
Sale de la ruta.

---

## Datos y base de datos

**Supabase**
: La base de datos del proyecto: PostgreSQL con autenticación y Row Level
Security.

**Schema**
: El archivo `supabase/schema.sql` con las tablas, las políticas de seguridad
y la función de puntos.

**Seed**
: El archivo `supabase/seed.sql` con los datos de demostración. Se puede correr
varias veces sin duplicar.

**Service role**
: Una clave de Supabase con permiso completo. **Solo se usa en el servidor**
(`lib/db/server.ts`); nunca llega al navegador.

**Clave anónima**
: La clave pública de Supabase. Solo puede leer lo que las políticas de RLS
permiten.

**RLS (Row Level Security)**
: Las reglas de la base de datos que deciden quién puede leer y escribir cada
tabla. Es la segunda capa de seguridad, después del middleware.

**`meta`**
: Un campo JSONB en las tablas donde caben los atributos opcionales (horario
por día, accesibilidad, lugar con techo…). Evita cambiar el esquema cada vez
que hace falta un dato nuevo.

**Token**
: El identificador aleatorio del QR de cada lugar. No es predecible, puede
caducar y se puede retirar.

**Visita**
: Un registro de `visits`: quién, dónde, con qué QR y cuántos puntos sumó.

**Alias**
: El seudónimo con el que el visitante aparece en su pasaporte. No se guardan
datos personales ni la ubicación.

---

## Palabras del pitch

**Centro Histórico**
: El conjunto de calles y plazas alrededor del Zócalo y el Malecón. El
proyecto trabaja sobre él.

**Zócalo**
: La plaza central. Es el punto de referencia del motor: sin ubicación, la
ruta se ordena desde ahí.

**Malecón**
: El paseo marítimo. El lugar con más movimiento del Centro.

**Centro de noche**
: El Incentivo para los negocios que siguen abiertos después de las 19:00:
el motor les da puntos extra en la puntuación.

**Pulso**
: La idea del proyecto: que el Centro Histórico registre actividad por la
vía de los visitantes y que esa actividad sea visible para el comercio y para
la autoridad.
