# Mapa del Centro Histórico (`components/mapa`)

## Qué hace

Muestra un mapa interactivo del Centro Histórico de Veracruz con OpenStreetMap. Sobre él dibuja los lugares, los eventos de la agenda y, si hay una ruta, sus paradas numeradas unidas por una línea. Lo usan las pantallas del visitante (ruta, «Hoy en el centro») con un solo componente: `<Mapa />`.

```tsx
import { Mapa } from "@/components/mapa";

<Mapa places={places} events={events} stops={route.stops} userLocation={pos}
      selectedPlaceId={id} onSelectPlace={(p) => router.push(`/mision/${p.id}`)} className="h-96 w-full" />
```

## Cómo funciona (en 5 líneas)

1. `Mapa.tsx` carga `MapaCentro.tsx` con `dynamic(..., { ssr: false })`, porque Leaflet usa `window` y no puede renderizarse en el servidor; mientras carga, muestra «Cargando mapa…».
2. `MapaCentro.tsx` pinta las teselas de OpenStreetMap centradas en el Zócalo (`config.ts`) con su atribución obligatoria.
3. Cada lugar es un círculo de color: verde si está verificado, gris si está «por confirmar»; los eventos son círculos ámbar con ★ y las paradas son círculos rojos con su número.
4. Las paradas se ordenan por `order`, se unen con una línea punteada (desde la ubicación del usuario, si la hay) y un lugar que ya es parada no se repite como marcador suelto.
5. El mapa se encuadra solo: a la ruta si existe; si no, a todos los lugares y eventos. Al tocar un marcador se abre una ficha con nombre, categoría, horario y el botón «Ver detalle».

## Decisiones técnicas

- **Sin SSR** (regla del proyecto): Leaflet rompe el build de Next.js si se importa en el servidor. El archivo con Leaflet nunca se importa directo; `index.ts` solo exporta el envoltorio.
- **Íconos con `L.divIcon` (HTML + estilos en línea)** en lugar de las imágenes PNG por defecto de Leaflet, que suelen fallar con los bundlers y no permiten números. Así no hay archivos de imagen que servir.
- **Línea recta, no ruta por calles:** no usamos un servicio de ruteo para no depender de otra API ni de una clave. La leyenda lo aclara («Trazo aproximado en línea recta»). Es el primer recorte del plan B.
- **Honestidad de datos:** los lugares y eventos con `verified=false` se muestran en gris y con la etiqueta «Por confirmar»; si no hay horario se muestra «Horario por confirmar». El mapa nunca inventa datos.
- **Configurable:** colores, centro, zoom y URL de teselas viven en `config.ts`; todos los textos en `lib/i18n/es.ts` (`es.mapa`), listos para traducir a inglés.
- **Mobile-first:** `scrollWheelZoom` desactivado para que el mapa no «atrape» el desplazamiento de la página; la altura la decide quien lo usa con `className`.
- **Componente presentacional:** no pide datos ni calcula rutas; recibe `Place[]`, `Event[]` y `RouteStop[]` con los tipos de `lib/types.ts`. La ruta la calcula el motor (`lib/engine`).

## Preguntas probables del jurado

**¿Por qué Leaflet y OpenStreetMap y no Google Maps?**
Son libres y gratuitos, no requieren clave ni tarjeta y no tienen límite de uso que nos pueda cortar la demo. Cumplimos la licencia de OSM mostrando su atribución en el mapa.

**¿La línea de la ruta sigue las calles reales?**
No: une las paradas en línea recta y la leyenda lo dice. En el Centro Histórico las distancias son cortas (cuadras), así que el orden de las paradas y el tiempo estimado del motor (≈ 80 m/min) son lo importante. Agregar ruteo por calles es un cambio acotado a este componente.

**¿Qué pasa si un lugar no tiene horario confirmado o un evento no está verificado?**
Se muestra en gris con la etiqueta «Por confirmar» y «Horario por confirmar». Preferimos admitir que falta un dato a inventarlo; el comercio puede completarlo desde su panel.
