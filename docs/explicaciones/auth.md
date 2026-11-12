# Cuentas y acceso por rol (`feat/auth`)

## Qué hace

Cada persona tiene su cuenta y todo queda guardado en ella: puntos, sellos de visita, misiones y canjes. La app se divide por rol:

| Rol | Ve | Pantalla de inicio |
| --- | --- | --- |
| `visitante` | Explorar el centro, rutas sugeridas, misiones, pasaporte, escanear QR | `/inicio` |
| `comercio` | Panel de comercio y QR imprimibles **de sus locales** | `/comercio` |
| `admin` | Todo (tablero de afluencia, comercio, QR de todos, lado visitante) | `/admin` |

## Cómo funciona (5 líneas)

1. Supabase Auth guarda la sesión en cookies (`@supabase/ssr`); hay correo + contraseña y **«Entrar como invitado»** (auth anónima).
2. La primera vez que un usuario llama a la API se crea su fila en `profiles` (ligada por `auth_id`) con rol `visitante`.
3. `proxy.ts` revisa cada página: sin sesión → `/login?next=…`; rol sin permiso → su pantalla de inicio. Las reglas viven en `lib/auth/roles.ts`.
4. Cada API toma el perfil **de la sesión** con `requireProfile([...roles])` (`lib/db/auth.ts`); el cliente ya no puede mandar un `profileId` ajeno.
5. Recuperar contraseña: `/recuperar` manda un correo → el enlace pasa por `/auth/callback` (canjea el código por sesión) → `/restablecer` guarda la nueva.

## Decisiones técnicas

- **Invitado para el jurado:** escanear el QR impreso no puede pedir registro. El invitado tiene un perfil real (sus puntos cuentan en el tablero) y después puede crear su cuenta **conservando los puntos** (`/registro` convierte la sesión anónima).
- **Roles no se eligen al registrarse.** Todos entran como `visitante`; `comercio` y `admin` se asignan con `node scripts/crear-cuenta.mjs` o en el dashboard. Así nadie se da permisos solo.
- **Doble candado:** el proxy decide qué páginas se ven, pero cada API vuelve a validar sesión y rol (el proxy no cubre `/api/*`).
- **Plan B:** `NEXT_PUBLIC_MODO_DEMO=true` apaga el login y las APIs usan los perfiles demo (`visitante-demo`, `comercio-demo`, `admin-demo`).
- Los QR imprimibles pasaron de `/admin/qr` a `/comercio/qr` (la ruta vieja redirige).

## Configuración en Supabase (dashboard)

- **Authentication → Sign In / Providers → Anonymous sign-ins:** activar (para «Entrar como invitado»).
- **Authentication → Sign In / Providers → Email → Confirm email:** para la demo conviene **apagarlo**; con el correo por defecto de Supabase solo llegan correos a los miembros del equipo y hay pocos envíos por hora.
- **Authentication → URL Configuration:** *Site URL* = dominio de Vercel; en *Redirect URLs* agregar `https://<dominio>/auth/callback` y `http://localhost:3000/auth/callback`.
- Para correos a usuarios reales (recuperar contraseña): configurar SMTP propio (p. ej. Resend) en *Authentication → Emails → SMTP Settings*.

## Preguntas probables del jurado

1. **¿Qué pasa si alguien manipula la app para sumarse puntos?** Los puntos se calculan solo en el servidor y con el perfil de la sesión; el cliente no puede elegir a qué perfil se suman. Además, un QR cuenta una sola vez por perfil.
2. **¿Por qué dejar entrar como invitado?** Para que escanear un QR tome segundos. El invitado es una cuenta real y anónima; si luego se registra, conserva sus puntos.
3. **¿Cómo se evita que un comercio vea datos de otro?** El comercio solo recibe los QR y canjes de los negocios donde es dueño (`businesses.owner_id`); el admin es el único que ve todo.
