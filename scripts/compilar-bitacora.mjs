// Compila docs/bitacora/*.md dentro de README.md, entre los marcadores
// <!-- BITACORA:INICIO --> y <!-- BITACORA:FIN -->. Uso: npm run bitacora
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = fileURLToPath(new URL("..", import.meta.url));
const dirBitacora = join(raiz, "docs", "bitacora");
const readme = join(raiz, "README.md");
const INICIO = "<!-- BITACORA:INICIO -->";
const FIN = "<!-- BITACORA:FIN -->";

// Baja los encabezados 2 niveles (# → ###) para que queden dentro de «Bitácora de IA».
function bajarEncabezados(md) {
  let enCodigo = false;
  return md
    .split(/\r?\n/)
    .map((linea) => {
      if (/^\s*(```|~~~)/.test(linea)) enCodigo = !enCodigo;
      if (enCodigo) return linea;
      return linea.replace(/^(#{1,6})(\s)/, (_, h, s) => "#".repeat(Math.min(h.length + 2, 6)) + s);
    })
    .join("\n");
}

const archivos = (await readdir(dirBitacora))
  .filter((f) => f.endsWith(".md"))
  .sort((a, b) => a.localeCompare(b, "es", { numeric: true }));

const secciones = await Promise.all(
  archivos.map(async (f) => bajarEncabezados((await readFile(join(dirBitacora, f), "utf8")).trim())),
);

const texto = await readFile(readme, "utf8");
const i = texto.indexOf(INICIO);
const j = texto.indexOf(FIN);
if (i === -1 || j === -1 || j < i) {
  console.error(`README.md debe contener ${INICIO} y ${FIN} (en ese orden).`);
  process.exit(1);
}

const bloque = `${INICIO}\n\n<!-- Generado con «npm run bitacora». No editar a mano: edita docs/bitacora/. -->\n\n${secciones.join("\n\n")}\n\n${FIN}`;
await writeFile(readme, texto.slice(0, i) + bloque + texto.slice(j + FIN.length));
console.log(`Bitácora compilada en README.md (${archivos.length} archivos).`);
