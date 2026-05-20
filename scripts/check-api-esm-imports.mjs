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

import { readdir, readFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(import.meta.url), '../../');
const API_DIR = join(ROOT, 'api');

// Imports relativos sin extension `.js`. Captura tanto `import X from './x'`
// como `import { x } from "../x"` (single o double quotes, multi-line).
const BAD_IMPORT_RE = /from\s+['"](\.\.?\/[^'"]*?)['"]/g;

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
    // Calcular numero de linea para el error.
    const line = source.slice(0, match.index).split('\n').length;
    offenders.push({ importPath, line });
  }
  return offenders;
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

  const allOffenders = [];
  for (const file of files) {
    const source = await readFile(file, 'utf8');
    const offenders = findOffenders(source);
    if (offenders.length > 0) {
      allOffenders.push({ file: relative(ROOT, file), offenders });
    }
  }

  if (allOffenders.length === 0) {
    console.log(`[check-api-esm-imports] OK — ${files.length} archivos en api/ validados.`);
    process.exit(0);
  }

  console.error('[check-api-esm-imports] FALLO — imports relativos sin extension `.js` en api/:\n');
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
