# Gestión de contenido (CRUD de paneles)

## Qué hace el módulo

Permite dar de alta, editar y borrar el contenido de la app desde la propia interfaz, sin tocar
Supabase: el **admin** gestiona lugares, eventos, misiones y recompensas en `/admin/gestion`; el
**comercio** gestiona los eventos y recompensas de sus locales en `/comercio/gestion` (y desde el
botón «Publicar Evento» de su panel).

## Cómo funciona (en 5 líneas)

1. Las pantallas de gestión llaman a route handlers REST: `POST/PATCH/DELETE` sobre `/api/places`, `/api/events`, `/api/missions` y `/api/rewards`.
2. Cada handler valida la sesión con `requireProfile(roles)` y la entrada con esquemas zod compartidos (`app/api/_lib/esquemas.ts`).
3. La propiedad se verifica en el servidor: un comercio solo toca lo que cuelga de sus `businesses.owner_id` (`app/api/_lib/comercio.ts`).
4. La escritura usa el cliente service-role (regla del proyecto: el cliente nunca escribe directo), convirtiendo camelCase → snake_case.
5. Los eventos nuevos siempre entran con `verified=false` («por confirmar»); solo un admin los verifica, y aparecen al momento en «Hoy en el centro».

## Decisiones técnicas

- **Contrato de la sección 7 respetado:** `POST /api/events` recibe `Omit<Event,"id"|"verified">` y responde el `Event` creado con `verified=false`.
- **`GET /api/events?when=all`** se agregó para las listas de gestión (la agenda del visitante sigue usando `today`/`now`).
- **La tabla `events` no tiene columna `description`:** la descripción viaja dentro de `meta.description` y el mapper la expone como `event.description`.
- **Esquemas zod compartidos** entre crear (completo) y editar (parcial) para no duplicar validación, con mensajes en español.
- **Confirmación de borrado en dos pasos** en la UI (sin `window.confirm`), y borrar un lugar advierte que arrastra QR, negocios y visitas (FK `ON DELETE CASCADE`).
- **Alternativa CLI:** `node scripts/crear-evento.mjs "<título>" "<lugar>" <categoría> <HH:MM> [HH:MM]` inserta un evento de hoy leyendo `.env.local` (mismo patrón que `crear-cuenta.mjs`).

## Preguntas probables del jurado

1. **¿Cualquiera puede publicar un evento?** No. Hace falta sesión con rol comercio o admin; el comercio solo puede publicar en los lugares de sus negocios y todo entra «por confirmar» hasta que un admin lo verifica.
2. **¿Cómo evitan que un comercio edite datos de otro?** La regla se aplica en el servidor, no en la UI: cada PATCH/DELETE consulta primero los negocios del perfil en sesión (`businesses.owner_id`) y responde 403 si el recurso no le pertenece.
3. **¿Qué pasa si se publica un evento con datos falsos?** Nace sin verificar y la app lo marca «por confirmar» ante el visitante; el admin puede corregirlo, verificarlo o eliminarlo desde `/admin/gestion`, cumpliendo la regla de no inventar información real.
