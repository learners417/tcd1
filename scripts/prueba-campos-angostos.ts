/**
 * prueba-campos-angostos.ts — ningún campo que empuje la pantalla de costado.
 *
 * El error que la motivó, medido el 13 de noviembre: en «Montar en Meta» la
 * pantalla se desplazaba 18 píxeles de costado en un teléfono de 390. El
 * culpable no se veía: un `<input className="flex-1">` dentro de una fila
 * `flex`. Un campo de texto trae un ancho propio de unos 20 caracteres, y un
 * hijo de `flex` no baja de su ancho propio a menos que se lo permita
 * (`min-width: 0`). Así que la fila pedía 363 px dentro de una caja de 300 y
 * el desborde subía hasta la página entera.
 *
 * No era uno: eran doce lugares. Y el medidor de pantallas lo veía solo a
 * veces —depende de si la animación de entrada terminó—, así que la falta
 * estuvo seis corridas en verde. Esta lente no depende del momento: lee el
 * código.
 *
 * La regla: un `<input>`, `<textarea>` o `<select>` con `flex-1` tiene que
 * declarar su mínimo —`min-w-0` para que pueda encogerse, o un `min-w-[...]`
 * a propósito si lo que se quiere es que NO encoja.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

let fallas = 0;
const ok = (c: boolean, m: string, d = '') => {
  console.log(`${c ? '✓' : '✗'} ${m}${c || !d ? '' : '\n    ' + d}`);
  if (!c) fallas++;
};

function archivos(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const ruta = join(dir, f);
    if (statSync(ruta).isDirectory()) return archivos(ruta);
    return /\.tsx$/.test(f) ? [ruta] : [];
  });
}

/** Devuelve el texto de la etiqueta que abre en `desde`, hasta su `>`. */
function etiqueta(t: string, desde: number): string {
  let llaves = 0;
  for (let i = desde; i < t.length; i++) {
    const c = t[i];
    if (c === '{') llaves++;
    else if (c === '}') llaves--;
    else if (c === '>' && llaves === 0) return t.slice(desde, i);
  }
  return t.slice(desde, desde + 2000);
}

const sueltos: string[] = [];
for (const f of archivos('src')) {
  const t = readFileSync(f, 'utf8');
  for (const m of t.matchAll(/<(input|textarea|select)\b/g)) {
    const tag = etiqueta(t, m.index!);
    if (!/\bflex-1\b/.test(tag)) continue;
    if (/\bmin-w-/.test(tag)) continue;
    const linea = t.slice(0, m.index!).split('\n').length;
    sueltos.push(`${f}:${linea} <${m[1]}> con flex-1 y sin min-w-`);
  }
}

ok(sueltos.length === 0,
   'ningún campo con flex-1 se niega a encogerse (min-w-)',
   sueltos.join('\n    '));

console.log(fallas === 0 ? '\n✓ TODO EN VERDE' : `\n✗ ${fallas} FALLAS`);
process.exit(fallas === 0 ? 0 : 1);
