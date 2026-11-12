// Captura de la pantalla de ruta para revisarla.
// Uso: node scripts/capturar-ruta.mjs  ->  docs/ruta-captura.png
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ORIGEN = process.env.DEMO_ORIGEN ?? "http://localhost:3000";
const SALIDA = process.env.CAPTURA_SALIDA ?? "docs/ruta-captura.png";
const CHROME =
  process.env.CHROME_PATH ??
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

if (!existsSync(CHROME)) {
  console.log("No se encontró Chrome; no se captura nada.");
  process.exit(0);
}

const perfil = mkdtempSync(join(tmpdir(), "pulso-cap-"));
const PUERTO = 9335;

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${PUERTO}`,
    `--user-data-dir=${perfil}`,
    "--no-first-run",
    "--disable-gpu",
    "--hide-scrollbars",
    "--window-size=430,1500",
    "about:blank",
  ],
  { stdio: "ignore" },
);

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  let url = null;
  for (let i = 0; i < 60 && !url; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PUERTO}/json/list`);
      const paginas = await r.json();
      const p = paginas.find((x) => x.type === "page" && x.webSocketDebuggerUrl);
      if (p) url = p.webSocketDebuggerUrl;
    } catch {}
    if (!url) await dormir(250);
  }

  const ws = new WebSocket(url);
  await new Promise((res) => (ws.onopen = res));

  let id = 0;
  const pend = new Map();
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pend.has(m.id)) {
      const { res, rej } = pend.get(m.id);
      pend.delete(m.id);
      if (m.error) rej(new Error(JSON.stringify(m.error)));
      else res(m.result);
    }
  };
  const enviar = (method, params = {}) =>
    new Promise((res, rej) => {
      const i = ++id;
      pend.set(i, { res, rej });
      ws.send(JSON.stringify({ id: i, method, params }));
    });

  await enviar("Runtime.enable");
  await enviar("Page.enable");
  await enviar("Emulation.setDeviceMetricsOverride", {
    width: 430,
    height: 932,
    deviceScaleFactor: 2,
    mobile: true,
  });

  const evaluar = async (expr) => {
    const r = await enviar("Runtime.evaluate", {
      expression: expr,
      awaitPromise: true,
      returnByValue: true,
    });
    return r.result?.value;
  };

  await enviar("Page.navigate", { url: `${ORIGEN}/inicio` });
  await dormir(2000);

  const prepared = await evaluar(`(async () => {
    const res = await fetch("/api/route", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ minutes: 120, interests: ["gastronomia", "historia"], budget: "bajo" }),
    });
    const data = await res.json();
    sessionStorage.setItem("rutaGenerada", JSON.stringify(data.stops));
    return true;
  })()`);
  if (!prepared) throw new Error("No se pudo preparar la ruta en el sessionStorage");

  await enviar("Page.navigate", { url: `${ORIGEN}/ruta` });
  await dormir(2200);

  const { data } = await enviar("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
  });
  writeFileSync(SALIDA, Buffer.from(data, "base64"));
  console.log(`Captura guardada en ${SALIDA}`);

  ws.close();
} catch (e) {
  console.error(`Error: ${e.message}`);
} finally {
  chrome.kill();
  try {
    rmSync(perfil, { recursive: true, force: true });
  } catch {}
}
