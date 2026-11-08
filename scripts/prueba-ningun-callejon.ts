/**
 * NINGÚN BOTÓN MUERTO, NINGÚN CALLEJÓN
 *
 * ═══ QUÉ BUSCA, Y POR QUÉ ESTO ═══
 *
 * La batería ya tenía un chequeo de «botones sin acción», y mira una sola
 * cosa: que el `<button>` traiga `onClick`. Con eso no alcanza. Un botón
 * puede traer su `onClick` y no hacer nada igual:
 *
 *   onClick={() => {}}        la función vacía
 *   onClick={undefined}       escrito a mano
 *   onClick={() => null}      lo mismo con otra cara
 *
 * Y el peor caso no es un botón: es una pantalla donde no hay NADA que
 * tocar. El cliente llega, lee que todavía no tiene nada, y no hay un botón
 * que le diga qué hacer con eso. No está roto —no hay error, no hay
 * pantalla en blanco— y sin embargo ahí se termina su camino.
 *
 * ═══ LA REGLA DE LOS ESTADOS VACÍOS ═══
 *
 * Un estado vacío está bien de dos maneras, no de una:
 *
 *   1. Ofrece algo que tocar — el botón que lo llena.
 *   2. O explica qué lo va a llenar, cuando no hay nada que tocar todavía
 *      porque lo que falta lo carga otra persona o el tiempo.
 *
 * La segunda no entra en tres palabras. «Sin movimientos todavía» deja al
 * cliente igual de solo que una pantalla en blanco. Por eso, cuando no hay
 * nada que tocar, se exige prosa de verdad: que diga qué va a aparecer ahí.
 *
 * ═══ LO QUE NO MIRA ═══
 *
 * Un `disabled` NO es un defecto: un paso que todavía no se puede tocar
 * está bien apagado. Lo que importa es que diga POR QUÉ, y eso se mira
 * leyendo la pantalla, no el código. Va al recorrido, no acá.
 *
 * Tampoco mira los comentarios ni los textos de ayuda que viven dentro de
 * un objeto de configuración (`ayuda: '…'`): ahí la frase describe algo, no
 * se la encuentra el cliente en pantalla. Esta lente se equivocó con las
 * dos cosas la primera vez que corrió — con su propio comentario incluido.
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

let fallas = 0;
const mal = (m: string) => { fallas += 1; console.log(`✗ ${m}`); };

/** Todos los .tsx del lado del cliente. El Admin es Javo-facing y va aparte. */
function pantallas(dir: string, fuera: string[] = []): string[] {
  const out: string[] = [];
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) {
      if (fuera.includes(n)) continue;
      out.push(...pantallas(p, fuera));
    } else if (n.endsWith('.tsx')) out.push(...[p]);
  }
  return out;
}

const archivos = [
  ...pantallas('src/components', ['admin', 'editor']),
  ...pantallas('src/pages').filter((p) => !/Admin/i.test(p)),
];

/**
 * Las líneas del archivo, con los comentarios en blanco.
 *
 * Esto es lo que faltaba la primera vez: saltear la línea que ARRANCA con
 * `//` o `*` no alcanza, porque dentro de un bloque `/* … *\/` la prosa
 * arranca con cualquier palabra. Hay que llevar el estado del bloque.
 * Se devuelve el array completo para que el número de línea siga siendo el
 * del archivo de verdad.
 */
function lineasDeCodigo(src: string): string[] {
  const out: string[] = [];
  let enBloque = false;
  for (const linea of src.split('\n')) {
    if (enBloque) {
      out.push('');
      if (linea.includes('*/')) enBloque = false;
      continue;
    }
    const abre = linea.indexOf('/*');
    if (abre >= 0 && !linea.slice(abre).includes('*/')) {
      enBloque = true;
      out.push(linea.slice(0, abre));
      continue;
    }
    out.push(linea.replace(/\/\*.*?\*\//g, '').replace(/\/\/.*$/, ''));
  }
  return out;
}

/* ── 1 · Botones que traen su onClick y no hacen nada ──
 *
 * El patrón se escribe de varias formas; todas significan lo mismo. Se
 * buscan en el archivo entero y no solo dentro de `<button>`, porque el
 * mismo vacío llega por una prop: `onCerrar={() => {}}`.
 */
const VACIAS = [
  /on[A-Z]\w*=\{\s*\(\s*\)\s*=>\s*\{\s*\}\s*\}/,      // () => {}
  /on[A-Z]\w*=\{\s*\(\s*\)\s*=>\s*null\s*\}/,          // () => null
  /on[A-Z]\w*=\{\s*\(\s*\)\s*=>\s*undefined\s*\}/,
  /onClick=\{\s*undefined\s*\}/,
];
const muertos: string[] = [];
for (const f of archivos) {
  const src = readFileSync(f, 'utf8');
  const crudas = src.split('\n');
  /* El manejador se busca en la línea CRUDA, no en la limpia: un cuerpo
   * vacío que trae un comentario adentro —`() => { /* se recarga solo *\/ }`—
   * está vacío a propósito y lo dice. La línea limpia se usa nada más que
   * para saber si estamos dentro de un comentario. */
  lineasDeCodigo(src).forEach((limpia, i) => {
    if (!limpia.trim()) return;
    const l = crudas[i];
    if (VACIAS.some((re) => re.test(l))) muertos.push(`${f}:${i + 1}  ${l.trim().slice(0, 90)}`);
  });
}
if (muertos.length) {
  mal(`${muertos.length} manejador(es) que no hacen nada:`);
  for (const m of muertos.slice(0, 12)) console.log(`    ${m}`);
}

/* ── 2 · Enlaces que no llevan a ningún lado ── */
const huecos: string[] = [];
for (const f of archivos) {
  lineasDeCodigo(readFileSync(f, 'utf8')).forEach((l, i) => {
    if (/href=["']#["']/.test(l) || /href=\{?["']{2}\}?/.test(l)) {
      huecos.push(`${f}:${i + 1}  ${l.trim().slice(0, 90)}`);
    }
  });
}
if (huecos.length) {
  mal(`${huecos.length} enlace(s) que no llevan a ningún lado:`);
  for (const h of huecos.slice(0, 8)) console.log(`    ${h}`);
}

/* ── 3 · Estados vacíos sin salida ──
 *
 * La frase se reconoce por cómo se escribe en esta casa. Lo que se exige
 * es una de las dos salidas: algo que tocar en las quince líneas de
 * alrededor, o prosa suficiente como para explicar qué va a aparecer ahí.
 */
const VACIO = /(todav[ií]a no (tienes|hay)|a[úu]n no (tienes|hay)|no tienes (ning|nada)|sin .{3,20} todav[ií]a)/i;
const TOCABLE = /(<button|<a\s|onClick=|<Link|<textarea|<input|<select|role="button")/;
/** `ayuda: 'Si aún no tienes, déjalo vacío.'` describe un campo, no es pantalla. */
const CONFIG = /^\s*[{[]?\s*(\w+:\s*)?['"`]|\w+:\s*['"`]/;
/** El largo de la prosa del bloque, sin etiquetas ni clases. */
function largoDeProsa(txt: string): number {
  return txt
    .replace(/<[^>]*>/g, ' ')
    .replace(/\{[^}]*\}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim().length;
}
const callejones: string[] = [];
for (const f of archivos) {
  const lineas = lineasDeCodigo(readFileSync(f, 'utf8'));
  lineas.forEach((l, i) => {
    if (!VACIO.test(l)) return;
    if (CONFIG.test(l)) return;
    const despues = lineas.slice(i, i + 15).join('\n');
    const antes = lineas.slice(Math.max(0, i - 6), i).join('\n');
    if (TOCABLE.test(despues) || TOCABLE.test(antes)) return;
    /* Sin nada que tocar, la segunda salida: que explique qué lo llena. */
    const prosa = largoDeProsa(lineas.slice(Math.max(0, i - 2), i + 4).join(' '));
    if (prosa >= 90) return;
    callejones.push(`${f}:${i + 1}  ${l.trim().slice(0, 80)}  (${prosa} caracteres de prosa)`);
  });
}
if (callejones.length) {
  mal(`${callejones.length} estado(s) vacío(s) sin salida ni explicación:`);
  for (const c of callejones.slice(0, 12)) console.log(`    ${c}`);
}

if (!fallas) {
  console.log(`✓ ${archivos.length} pantallas del cliente sin botones muertos ni callejones`);
}
process.exit(fallas ? 1 : 0);
