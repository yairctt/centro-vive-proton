// Prueba de la pantalla de ruta en un navegador real.
// Uso: node scripts/probar-ruta.mjs
// Comprueba que no queden emojis, que los enlaces a Google Maps se arman
// bien y que el desplegable de cada parada funciona.

import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ORIGEN = process.env.DEMO_ORIGEN ?? "http://localhost:3000";
const CHROME =
  process.env.CHROME_PATH ??
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

if (!existsSync(CHROME)) {
  console.log("No se encontró Chrome; se omite la prueba de navegador.");
  process.exit(0);
}

const perfil = mkdtempSync(join(tmpdir(), "pulso-ruta-"));
const PUERTO = 9334;

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${PUERTO}`,
    `--user-data-dir=${perfil}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-gpu",
    "about:blank",
  ],
  { stdio: "ignore" },
);

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

let fallos = 0;
const comprobar = (ok, mensaje) => {
  console.log(`  ${ok ? "OK  " : "FALLA"} ${mensaje}`);
  if (!ok) fallos += 1;
};

async function conectarPestana() {
  let url = null;
  for (let i = 0; i < 60 && !url; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PUERTO}/json/list`);
      const paginas = await r.json();
      const pagina = paginas.find((p) => p.type === "page" && p.webSocketDebuggerUrl);
      if (pagina) url = pagina.webSocketDebuggerUrl;
    } catch {}
    if (!url) await dormir(250);
  }
  if (!url) throw new Error("Chrome no respondió");

  const ws = new WebSocket(url);
  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = () => rej(new Error("No se pudo abrir el WebSocket"));
  });

  let id = 0;
  const pendientes = new Map();
  ws.onmessage = (evento) => {
    const msg = JSON.parse(evento.data);
    if (msg.id && pendientes.has(msg.id)) {
      const { res, rej } = pendientes.get(msg.id);
      pendientes.delete(msg.id);
      if (msg.error) rej(new Error(JSON.stringify(msg.error)));
      else res(msg.result);
    }
  };

  const enviar = (method, params = {}) =>
    new Promise((res, rej) => {
      const msgId = ++id;
      pendientes.set(msgId, { res, rej });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });

  await enviar("Runtime.enable");
  await enviar("Page.enable");

  const evaluar = async (expresion) => {
    const r = await enviar("Runtime.evaluate", {
      expression: expresion,
      awaitPromise: true,
      returnByValue: true,
    });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text ?? "error");
    return r.result?.value;
  };

  const irA = async (ruta) => {
    await enviar("Page.navigate", { url: ORIGEN + ruta });
    await dormir(1800);
  };

  return { evaluar, irA, cerrar: () => ws.close() };
}

/** Emojis que no queremos en la interfaz. */
const EMOJIS =
  /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{1F000}-\u{1F0FF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{25AA}-\u{25FF}]/u;

try {
  console.log("\nPantalla de ruta sugerida\n");
  const { evaluar, irA, cerrar } = await conectarPestana();

  // Preparamos una ruta en el sessionStorage, como hace /inicio.
  await irA("/inicio");
  await evaluar(`(async () => {
    const res = await fetch("/api/route", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ minutes: 120, interests: ["gastronomia", "historia"], budget: "bajo" }),
    });
    const data = await res.json();
    sessionStorage.setItem("rutaGenerada", JSON.stringify(data.stops));
    return true;
  })()`);

  await irA("/ruta");

  const texto = await evaluar("document.body.innerText");

  // 1. Sin emojis.
  const emojis = texto.match(EMOJIS) ?? [];
  comprobar(
    emojis.length === 0,
    `Sin emojis en la pantalla (${emojis.length ? emojis.join(" ") : "ninguno"})`,
  );

  // 2. Iconos SVG.
  const svg = await evaluar(`document.querySelectorAll("svg").length`);
  comprobar(svg > 0, `Usa iconos SVG (${svg} iconos)`);

  // 3. Las paradas se muestran.
  const paradas = await evaluar(
    `document.querySelectorAll("[class*='rounded-2xl']").length`,
  );
  comprobar(Number(paradas) > 0, `Las paradas se muestran (${paradas} tarjetas)`);

  // 4. El botón de Google Maps apunta a la ruta completa.
  const maps = await evaluar(`(() => {
    const a = [...document.querySelectorAll("a[href*='google.com/maps']")];
    return a.map((x) => x.href);
  })()`);
  comprobar(
    Array.isArray(maps) && maps.length > 0,
    `Hay enlaces a Google Maps (${maps?.length ?? 0})`,
  );
  const urlRuta = maps?.find((u) => u.includes("/maps/dir/"));
  comprobar(Boolean(urlRuta), `El botón de la ruta completa usa /maps/dir/`);
  if (urlRuta) {
    const u = new URL(urlRuta);
    comprobar(
      u.searchParams.get("origin") !== null &&
        u.searchParams.get("destination") !== null &&
        u.searchParams.get("travelmode") === "walking",
      `La URL tiene origen, destino y modo a pie`,
    );
  }

  // 5. El desplegable de la primera parada abre el detalle y su enlace.
  // El botón del mapa también lleva aria-expanded, así que buscamos el que
  // está dentro de una tarjeta de parada (el que tiene el chevron).
  await evaluar(`(() => {
    const botones = [...document.querySelectorAll("button[aria-expanded]")];
    const botonParada = botones.find((b) => b.closest("div.rounded-2xl"));
    if (botonParada) botonParada.click();
    return !!botonParada;
  })()`);
  await dormir(700);
  const detalle = await evaluar(`(() => {
    const a = [...document.querySelectorAll("a[href*='google.com/maps']")];
    return { total: a.length, conSearch: a.filter((x) => x.href.includes("maps/search/")).length };
  })()`);
  comprobar(
    detalle.conSearch > 0,
    `Al desplegar la parada aparece el enlace del lugar (${detalle?.conSearch})`,
  );

  // 6. El mapa se puede mostrar (el botón tiene aria-label "Ver en el mapa").
  const antesDelMapa = await evaluar(`document.querySelectorAll(".leaflet-container").length`);
  await evaluar(`(() => {
    const b = document.querySelector("button[aria-label='Ver en el mapa']");
    if (b) b.click();
    return !!b;
  })()`);
  await dormir(2000);
  const despuesDelMapa = await evaluar(`document.querySelectorAll(".leaflet-container").length`);
  comprobar(
    Number(despuesDelMapa) > Number(antesDelMapa),
    `El mapa se abre (${antesDelMapa} → ${despuesDelMapa})`,
  );

  console.log(`\n  Texto de la pantalla: ${String(texto).replace(/\n+/g, " | ").slice(0, 220)}\n`);

  cerrar();
} catch (e) {
  console.error(`\nError en la prueba: ${e.message}`);
  fallos += 1;
} finally {
  chrome.kill();
  try {
    rmSync(perfil, { recursive: true, force: true });
  } catch {}
}

console.log(
  fallos === 0
    ? "La pantalla de ruta funciona.\n"
    : `\n${fallos} comprobación(es) fallaron.\n`,
);
process.exit(fallos === 0 ? 0 : 1);
