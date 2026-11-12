// Comprobación de que la demo está lista para probarse.
// Uso: node scripts/verificar-demo.mjs   (con el servidor corriendo en :3000)
//
// Comprueba que todas las pantallas responden y que los endpoints devuelven
// datos utilizables, sin importar si la base de datos está configurada.

const ORIGEN = process.env.DEMO_ORIGEN ?? "http://localhost:3000";

const PANTALLAS = [
  ["/", "Portada"],
  ["/inicio", "Preferencias"],
  ["/ruta", "Ruta sugerida"],
  ["/mision/p1", "Misión"],
  ["/pasaporte", "Pasaporte"],
  ["/escanear", "Escáner QR"],
  ["/admin", "Tablero de admin"],
  ["/admin/qr", "QR imprimibles"],
  ["/comercio", "Panel de comercio"],
];

const ENDPOINTS = [
  ["GET", "/api/places"],
  ["GET", "/api/events"],
  ["GET", "/api/stats"],
  ["GET", "/api/me/passport"],
  ["GET", "/api/qr-tokens"],
  ["POST", "/api/route", { minutes: 90, interests: ["gastronomia", "historia"], budget: "bajo" }],
  ["POST", "/api/ai/mission", { placeId: "zocalo", interests: ["paseo"] }],
];

let fallos = 0;

console.log(`\nComprobando ${ORIGEN}\n`);

console.log("Pantallas");
for (const [ruta, nombre] of PANTALLAS) {
  try {
    const r = await fetch(ORIGEN + ruta);
    const ok = r.ok;
    if (!ok) fallos += 1;
    console.log(`  ${ok ? "OK  " : "FALLA"} ${nombre.padEnd(20)} ${ruta} (${r.status})`);
  } catch (e) {
    fallos += 1;
    console.log(`  FALLA ${nombre.padEnd(20)} ${ruta} (${e.message})`);
  }
}

console.log("\nEndpoints");
for (const [metodo, ruta, cuerpo] of ENDPOINTS) {
  try {
    const r = await fetch(ORIGEN + ruta, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    });
    const texto = await r.text();
    const vacio = texto.trim() === "" || texto === "[]" || texto === "{}";
    const ok = r.ok && !vacio;
    if (!ok) fallos += 1;
    const detalle = metodo === "GET" && ruta === "/api/route" ? "" : ` (${texto.length} bytes)`;
    console.log(`  ${ok ? "OK  " : "FALLA"} ${metodo} ${ruta.padEnd(22)} ${r.status}${detalle}`);
    if (metodo === "POST" && ruta === "/api/route") {
      const datos = JSON.parse(texto);
      console.log(`       ${datos.stops.length} paradas · ${datos.totalMin} min · origen: ${datos.origen}`);
    }
  } catch (e) {
    fallos += 1;
    console.log(`  FALLA ${metodo} ${ruta} (${e.message})`);
  }
}

console.log(
  fallos === 0
    ? "\nTodo listo para probar.\n"
    : `\n${fallos} comprobación(es) fallaron. Revisa la terminal del servidor.\n`,
);
process.exit(fallos === 0 ? 0 : 1);
