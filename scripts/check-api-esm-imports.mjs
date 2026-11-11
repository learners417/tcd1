#!/usr/bin/env node
/**
 * check-api-esm-imports.mjs
 *
 * Valida que todos los imports relativos en `api/` (Vercel Serverless
 * Functions) tengan extension `.js` explicita.
 *
 * Motivo: package.json tiene `"type": "module"` y Vercel ejecuta las
 * funciones en Node ESM puro, que requiere extension explicita en imports
 * relativos. Sin la extension, Node tira ERR_MODULE_NOT_FOUND en cold start
 * y la funcion devuelve FUNCTION_INVOCATION_FAILED al cliente — sin pista
 * util del problema. Pasó en producción y nos costó un rato encontrarlo.
 *
 * NOTA: en TypeScript con ESM, el import resuelve al `.js` compilado,
 * por eso la extension va `.js` aunque los archivos fuente sean `.ts`.
 *
 * Uso:
 *   node scripts/check-api-esm-imports.mjs        # exit 1 si hay offenders
 */

import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(import.meta.url), '../../');
const API_DIR = join(ROOT, 'api');

// Imports relativos sin extension `.js`. Captura tanto `import X from './x'`
// como `import { x } from "../x"` (single o double quotes, multi-line).
const BAD_IMPORT_RE = /from\s+['"](\.\.?\/[^'"]*?)['"]/g;

/**
 * Los imports de SOLO TIPOS no existen en tiempo de ejecución.
 *
 * `import type { X } from './y'` y `export type { X } from './y'` los borra
 * el compilador: no hay require, no hay resolucion, no hay cold start que
 * pueda fallar por ahi. Marcarlos es gritar lobo — y una lente que da
 * decenas de hallazgos ensena a ignorarla, que es peor que no tenerla.
 *
 * Se mira el `import`/`export` que ABRE la sentencia, no la linea del
 * `from`: la mayoria de estos imports son de varias lineas.
 */
const SOLO_TIPOS_RE = /(?:^|\n)[ \t]*(?:import|export)\s+type\b[^;]*$/;

// Que extensiones consideramos validas/explicitas (no flagueamos).
const VALID_EXTENSIONS = ['.js', '.mjs', '.cjs', '.json'];

async function listTsFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listTsFiles(full)));
    } else if (entry.isFile() && /\.(ts|tsx|mts|cts)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

function findOffenders(source) {
  const offenders = [];
  for (const match of source.matchAll(BAD_IMPORT_RE)) {
    const importPath = match[1];
    const hasValidExt = VALID_EXTENSIONS.some((ext) => importPath.endsWith(ext));
    if (hasValidExt) continue;
    if (SOLO_TIPOS_RE.test(source.slice(0, match.index))) continue;
    // Calcular numero de linea para el error.
    const line = source.slice(0, match.index).split('\n').length;
    offenders.push({ importPath, line });
  }
  return offenders;
}

/**
 * LA CADENA, NO LA PUNTA.
 *
 * Esto miraba SOLO los archivos de `api/`. Y un import de `api/` puede
 * entrar a `src/lib/`, y ese módulo importar otro: el segundo salto corre en
 * el mismo Node ESM y necesita la misma extensión, pero no lo miraba nadie.
 * Hasta el 11 de noviembre no se había notado porque el único módulo de
 * `src/` que `api/` alcanzaba —`laVentanaDeAcceso`— no importa nada. El
 * webhook de Fathom entró a uno que sí.
 *
 * Es la lección del turno 7 otra vez: se medía que el cable estuviera
 * enchufado, nunca que pasara corriente por todo el cable.
 */
async function existe(ruta) {
  try { await stat(ruta); return true; } catch { return false; }
}

/** El archivo real al que apunta un import relativo, o null. */
async function aDondeApunta(desde, importPath) {
  const base = resolve(dirname(desde), importPath.replace(/\.js$/, ''));
  for (const ext of ['.ts', '.tsx', '.mts', '.cts', '/index.ts', '/index.tsx']) {
    if (await existe(base + ext)) return base + ext;
  }
  return null;
}

/** Todo lo que `api/` alcanza fuera de `api/`, caminando el grafo. */
async function loQueApiAlcanza(archivosDeApi) {
  const vistos = new Set(archivosDeApi);
  const pendientes = [...archivosDeApi];
  const deAfuera = [];
  while (pendientes.length > 0) {
    const archivo = pendientes.pop();
    const fuente = await readFile(archivo, 'utf8');
    for (const match of fuente.matchAll(BAD_IMPORT_RE)) {
      // Un modulo que solo se importa por sus tipos no se carga nunca.
      if (SOLO_TIPOS_RE.test(fuente.slice(0, match.index))) continue;
      const destino = await aDondeApunta(archivo, match[1]);
      if (!destino || vistos.has(destino)) continue;
      vistos.add(destino);
      pendientes.push(destino);
      if (!destino.startsWith(API_DIR)) deAfuera.push(destino);
    }
  }
  return deAfuera;
}

async function main() {
  let files;
  try {
    files = await listTsFiles(API_DIR);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log('[check-api-esm-imports] api/ no existe, saltando.');
      process.exit(0);
    }
    throw err;
  }

  // Los de `api/` y, además, los de `src/` que `api/` alcanza: los dos
  // corren en el mismo Node ESM.
  const alcanzados = await loQueApiAlcanza(files);
  const aRevisar = [...files, ...alcanzados];

  const allOffenders = [];
  for (const file of aRevisar) {
    const source = await readFile(file, 'utf8');
    const offenders = findOffenders(source);
    if (offenders.length > 0) {
      allOffenders.push({ file: relative(ROOT, file), offenders });
    }
  }

  if (allOffenders.length === 0) {
    console.log(`[check-api-esm-imports] OK — ${files.length} archivos en api/ y `
      + `${alcanzados.length} de src/ que api/ alcanza, validados.`);
    process.exit(0);
  }

  console.error('[check-api-esm-imports] FALLO — imports relativos sin extension `.js` en lo que corre en api/:\n');
  for (const { file, offenders } of allOffenders) {
    console.error(`  ${file}`);
    for (const { line, importPath } of offenders) {
      console.error(`    L${line}: from '${importPath}'  →  agregar '.js'`);
    }
    console.error('');
  }
  console.error('Sin la extension, Vercel tira ERR_MODULE_NOT_FOUND en cold start y la funcion');
  console.error('devuelve FUNCTION_INVOCATION_FAILED. Agregar `.js` al final del path (TS resuelve');
  console.error('al .js compilado).\n');
  process.exit(1);
}

main().catch((err) => {
  console.error('[check-api-esm-imports] error inesperado:', err);
  process.exit(2);
});
