// Comprueba que los enlaces internos de la documentación apunten a archivos
// que existen. Uso: node scripts/verificar-enlaces.mjs
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const raiz = process.cwd();
const docs = join(raiz, "docs");

function mdFiles(dir) {
  const salida = [];
  for (const nombre of readdirSync(dir)) {
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) salida.push(...mdFiles(ruta));
    else if (nombre.endsWith(".md")) salida.push(ruta);
  }
  return salida;
}

const archivos = [...mdFiles(docs), join(raiz, "README.md")];
let rotos = 0;
let revisados = 0;

for (const archivo of archivos) {
  const texto = readFileSync(archivo, "utf8");
  const enlaces = [...texto.matchAll(/\[[^\]]*\]\(([^)#][^)]*)\)/g)].map((m) => m[1]);
  for (const enlace of enlaces) {
    if (/^https?:|^mailto:/.test(enlace)) continue;
    revisados += 1;
    const destino = resolve(dirname(archivo), enlace.split("#")[0]);
    try {
      statSync(destino);
    } catch {
      rotos += 1;
      const relativo = archivo.replace(raiz + "\\", "");
      console.log(`  ROTO  ${relativo} -> ${enlace}`);
    }
  }
}

console.log(
  rotos === 0
    ? `\nTodos los enlaces están bien (${revisados} revisados en ${archivos.length} archivos).\n`
    : `\n${rotos} enlace(s) roto(s).\n`,
);
process.exit(rotos === 0 ? 0 : 1);
