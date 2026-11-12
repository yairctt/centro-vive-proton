// Prueba de navegador del flujo de puntos: escanear un QR debe sumar puntos
// y el pasaporte debe mostrarlos.
//
// Uso: node scripts/probar-puntos.mjs
// Requiere el servidor corriendo en :3000 (npm run start) y Chrome instalado.

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

const perfil = mkdtempSync(join(tmpdir(), "pulso-chrome-"));
const PUERTO = 9333;

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${PUERTO}`,
    `--user-data-dir=${perfil}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-gpu",
    "--hide-scrollbars",
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

/** Conecta con la primera pestaña y devuelve un evaluador de expresiones. */
async function conectarPestana() {
  // Esperamos a que DevTools responda y a que haya una pestaña real.
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
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text ?? "error al evaluar");
    return r.result?.value;
  };

  const irA = async (ruta) => {
    await enviar("Page.navigate", { url: ORIGEN + ruta });
    await dormir(1600);
  };

  return { evaluar, irA, cerrar: () => ws.close() };
}

try {
  console.log("\nFlujo de puntos en el navegador\n");
  const { evaluar, irA, cerrar } = await conectarPestana();

  // 1. Escaneamos un QR de demostración.
  await irA("/escanear?t=demo-p1-0000");
  const trasEscanear = await evaluar(`document.body.innerText.slice(0, 220)`);
  console.log(`  Pantalla de escaneo: ${String(trasEscanear).replace(/\n+/g, " | ").slice(0, 150)}`);

  const puntos1 = await evaluar(`sessionStorage.getItem("pulso:puntos-demo")`);
  comprobar(
    puntos1 !== null && Number(puntos1) > 150,
    `Los puntos se guardaron al escanear (${puntos1})`,
  );

  // 2. El mismo token no debe volver a contar.
  await irA("/escanear?t=demo-p1-0000");
  const puntos2 = await evaluar(`sessionStorage.getItem("pulso:puntos-demo")`);
  comprobar(
    puntos2 === puntos1,
    `El mismo token no suma dos veces (${puntos1} → ${puntos2})`,
  );

  // 3. El pasaporte debe mostrar los puntos acumulados.
  await irA("/pasaporte");
  const enPasaporte = await evaluar(
    `(() => { const m = document.body.innerText.match(/Puntos Acumulados\\s*(\\d+)/i); return m ? Number(m[1]) : null; })()`,
  );
  comprobar(
    enPasaporte !== null && enPasaporte === Number(puntos1),
    `El pasaporte muestra los puntos escaneados (${enPasaporte} = ${puntos1})`,
  );

  // 4. Un token distinto sí suma.
  await irA("/escanear?t=demo-p2-0000");
  const puntos3 = await evaluar(`sessionStorage.getItem("pulso:puntos-demo")`);
  comprobar(
    Number(puntos3) > Number(puntos1),
    `Un token nuevo sí suma (${puntos1} → ${puntos3})`,
  );

  // 5. Y el pasaporte refleja el total nuevo.
  await irA("/pasaporte");
  const final = await evaluar(
    `(() => { const m = document.body.innerText.match(/Puntos Acumulados\\s*(\\d+)/i); return m ? Number(m[1]) : null; })()`,
  );
  comprobar(final === Number(puntos3), `El pasaporte refleja el total final (${final} = ${puntos3})`);

  cerrar();
} catch (e) {
  console.error(`\nError en la prueba de navegador: ${e.message}`);
  fallos += 1;
} finally {
  chrome.kill();
  try {
    rmSync(perfil, { recursive: true, force: true });
  } catch {}
}

console.log(
  fallos === 0
    ? "\nEl flujo de puntos funciona.\n"
    : `\n${fallos} comprobación(es) fallaron.\n`,
);
process.exit(fallos === 0 ? 0 : 1);
