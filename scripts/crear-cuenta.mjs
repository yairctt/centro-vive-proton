#!/usr/bin/env node
/**
 * Crea (o actualiza) una cuenta de Supabase Auth y la liga a un perfil.
 * Sirve para dar acceso a comercios y admins: nadie puede elegir esos roles
 * al registrarse; solo se asignan aquí (o en el dashboard de Supabase).
 *
 * Uso:
 *   node scripts/crear-cuenta.mjs <correo> <contraseña> <rol> [alias-del-perfil]
 *
 * Ejemplos:
 *   node scripts/crear-cuenta.mjs comercio@equipo.mx 'Clave-Segura-1' comercio comercio-demo
 *   node scripts/crear-cuenta.mjs admin@equipo.mx    'Clave-Segura-2' admin    admin-demo
 *
 * - Con [alias-del-perfil]: liga la cuenta a ese perfil existente (p. ej. comercio-demo,
 *   que ya es dueño de los 6 comercios del seed) y le pone el rol indicado.
 * - Sin alias: crea un perfil nuevo con ese rol.
 * Lee NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY de .env.local.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function leerEnv() {
  const env = { ...process.env };
  try {
    for (const linea of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
      const i = linea.indexOf("=");
      if (i > 0 && !linea.trimStart().startsWith("#")) {
        const k = linea.slice(0, i).trim();
        env[k] ??= linea.slice(i + 1).trim().replace(/^"|"$/g, "");
      }
    }
  } catch {
    // sin .env.local: se usan las variables del entorno
  }
  return env;
}

const [correo, contrasena, rol, aliasPerfil] = process.argv.slice(2);
const ROLES = ["visitante", "comercio", "admin"];

if (!correo || !contrasena || !ROLES.includes(rol)) {
  console.error("Uso: node scripts/crear-cuenta.mjs <correo> <contraseña> <visitante|comercio|admin> [alias-del-perfil]");
  process.exit(1);
}
if (contrasena.length < 8) {
  console.error("La contraseña debe tener al menos 8 caracteres.");
  process.exit(1);
}

const env = leerEnv();
if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// 1. Usuario de Auth (si ya existe, se actualiza su contraseña)
let userId;
const { data: creado, error: errCrear } = await admin.auth.admin.createUser({
  email: correo,
  password: contrasena,
  email_confirm: true,
  user_metadata: { alias: aliasPerfil ?? correo.split("@")[0] },
});
if (creado?.user) {
  userId = creado.user.id;
  console.log(`✓ Cuenta creada: ${correo}`);
} else if (errCrear?.code === "email_exists" || /already/i.test(errCrear?.message ?? "")) {
  let pagina = 1;
  while (!userId) {
    const { data, error } = await admin.auth.admin.listUsers({ page: pagina, perPage: 200 });
    if (error || data.users.length === 0) break;
    userId = data.users.find((u) => u.email?.toLowerCase() === correo.toLowerCase())?.id;
    pagina++;
  }
  if (!userId) {
    console.error("El correo existe pero no se encontró el usuario.");
    process.exit(1);
  }
  await admin.auth.admin.updateUserById(userId, { password: contrasena, email_confirm: true });
  console.log(`✓ Cuenta existente actualizada: ${correo}`);
} else {
  console.error("No se pudo crear la cuenta:", errCrear?.message);
  process.exit(1);
}

// 2. Perfil ligado (auth_id) con el rol pedido
if (aliasPerfil) {
  const { data: perfil } = await admin.from("profiles").select("id").eq("alias", aliasPerfil).maybeSingle();
  if (!perfil) {
    console.error(`No existe un perfil con alias «${aliasPerfil}».`);
    process.exit(1);
  }
  // Si la cuenta ya tenía otro perfil (p. ej. se creó al entrar), se libera.
  await admin.from("profiles").update({ auth_id: null }).eq("auth_id", userId).neq("id", perfil.id);
  const { error } = await admin.from("profiles").update({ auth_id: userId, role: rol }).eq("id", perfil.id);
  if (error) {
    console.error("No se pudo ligar el perfil:", error.message);
    process.exit(1);
  }
  console.log(`✓ Ligada al perfil «${aliasPerfil}» con rol ${rol}`);
} else {
  const { data: existente } = await admin.from("profiles").select("id").eq("auth_id", userId).maybeSingle();
  const { error } = existente
    ? await admin.from("profiles").update({ role: rol }).eq("id", existente.id)
    : await admin
        .from("profiles")
        .insert({ auth_id: userId, alias: correo.split("@")[0], role: rol, points: 0 });
  if (error) {
    console.error("No se pudo crear el perfil:", error.message);
    process.exit(1);
  }
  console.log(`✓ Perfil con rol ${rol}`);
}
