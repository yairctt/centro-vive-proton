#!/usr/bin/env node
/**
 * Inserta un evento de HOY en la tabla `events`, sin abrir el dashboard de Supabase.
 * El evento aparece en la pestaña «Hoy en el centro» (GET /api/events?when=today).
 *
 * Uso:
 *   node scripts/crear-evento.mjs "<título>" "<lugar>" <categoría> <inicio HH:MM> [fin HH:MM]
 *
 * Ejemplo:
 *   node scripts/crear-evento.mjs "Son jarocho en vivo" "Portales" cultura 19:00 21:30
 *
 * - <lugar> se busca por nombre (coincidencia parcial, sin distinguir mayúsculas)
 *   en la tabla `places`; también acepta el uuid directo.
 * - Las horas son hora local de Veracruz (America/Mexico_City), del día de hoy.
 * - Se guarda con source='demo' y verified=false (regla: no inventar eventos reales).
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

const CATEGORIAS = ["historia", "gastronomia", "cultura", "paseo", "compras"];
const [titulo, lugar, categoria, inicio, fin] = process.argv.slice(2);

const esHora = (h) => /^\d{1,2}:\d{2}$/.test(h ?? "");
if (!titulo || !lugar || !CATEGORIAS.includes(categoria) || !esHora(inicio) || (fin && !esHora(fin))) {
  console.error(
    'Uso: node scripts/crear-evento.mjs "<título>" "<lugar>" <' +
      CATEGORIAS.join("|") +
      "> <inicio HH:MM> [fin HH:MM]",
  );
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

/** Hoy a las HH:MM en hora de Veracruz, como instante ISO (igual que el seed). */
function hoyALas(hora) {
  const ahora = new Date();
  const fecha = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(ahora);
  const tz = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Mexico_City",
    timeZoneName: "longOffset",
  })
    .formatToParts(ahora)
    .find((p) => p.type === "timeZoneName")?.value;
  const m = /GMT([+-]\d{2}):(\d{2})/.exec(tz ?? "");
  const offset = m ? `${m[1]}:${m[2]}` : "-06:00";
  const [h, min] = hora.split(":");
  return new Date(`${fecha}T${h.padStart(2, "0")}:${min}:00.000${offset}`).toISOString();
}

// 1. Encontrar el lugar (por uuid o por nombre parcial)
const esUuid = /^[0-9a-f-]{36}$/i.test(lugar);
const { data: lugares, error: errLugar } = esUuid
  ? await admin.from("places").select("id, name").eq("id", lugar)
  : await admin.from("places").select("id, name").ilike("name", `%${lugar}%`);
if (errLugar) {
  console.error("No se pudo consultar places:", errLugar.message);
  process.exit(1);
}
if (!lugares?.length) {
  console.error(`No se encontró un lugar que coincida con «${lugar}».`);
  process.exit(1);
}
if (lugares.length > 1) {
  console.error(`«${lugar}» coincide con varios lugares; sé más específico:`);
  for (const p of lugares) console.error(`  - ${p.name}`);
  process.exit(1);
}

// 2. Insertar el evento de hoy
const evento = {
  place_id: lugares[0].id,
  title: titulo,
  category: categoria,
  starts_at: hoyALas(inicio),
  ends_at: fin ? hoyALas(fin) : null,
  source: "demo",
  verified: false,
  meta: {},
};
const { error } = await admin.from("events").insert(evento);
if (error) {
  console.error("No se pudo crear el evento:", error.message);
  process.exit(1);
}
console.log(`✓ Evento «${titulo}» creado en ${lugares[0].name}, hoy ${inicio}${fin ? `–${fin}` : ""}.`);
console.log("  Revisa la pestaña «Hoy en el centro» o GET /api/events?when=today.");
