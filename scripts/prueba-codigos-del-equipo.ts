/**
 * prueba-codigos-del-equipo.ts — la nomenclatura interna no se le muestra.
 *
 * ═══ QUÉ PROTEGE ═══
 *
 * Cada jornada tiene un código: P1.3, P2.5, 0-P0.0. Es la forma en que el
 * equipo y el código se refieren a ella, y sirve para eso.
 *
 * El Camino ya lo entendió: muestra «Día 7» y tiene escrito al lado por qué
 * —«el código y el tipo son del equipo: el cliente ve el día»—. Pero tres
 * pantallas se habían quedado fuera de esa regla:
 *
 *   · El espejo de identidad le decía «Vuelve a P1.3», «Vuelve a P2.3»,
 *     «Vuelve a P3.3» y «Vuelve a P2.5»: cuatro destinos que no existen para
 *     él en ninguna parte de la app.
 *   · El mapa de muñecas encabezaba con el código de la meta.
 *   · La biblioteca etiquetaba cada video con «P1» o «r-dinero».
 *
 * Todas pasan a decir el día, que es lo único que el cliente puede ubicar.
 *
 * Esta prueba sostiene dos cosas: que no vuelva un código escrito a mano en
 * un texto que alguien lee, y que no vuelva a pintarse en pantalla el campo
 * del código sin traducir.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { diaDelCodigo } from '../src/lib/roadmapSeed';

const raiz = join(import.meta.dirname, '..');

let fallas = 0;
const ok = (cond: boolean, msg: string) => {
  if (cond) { console.log(`  ✓ ${msg}`); }
  else { console.log(`  ✗ ${msg}`); fallas++; }
};

/** Las pantallas del cliente: el Admin tiene permitido hablar en códigos. */
function pantallasDelCliente(dir: string, acc: string[] = []): string[] {
  for (const n of readdirSync(join(raiz, dir))) {
    const rel = `${dir}/${n}`;
    if (statSync(join(raiz, rel)).isDirectory()) {
      if (n === 'admin') continue;
      pantallasDelCliente(rel, acc);
    } else if (/\.tsx$/.test(n) && !/Admin/.test(n)) {
      acc.push(rel);
    }
  }
  return acc;
}

/**
 * Fuera los comentarios: el que explica un arreglo nombra el código a
 * propósito. Se reemplazan por espacios en vez de borrarse, para que los
 * números de línea sigan siendo los del archivo de verdad.
 */
const sinComentarios = (t: string) =>
  t.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
   .replace(/^([ \t]*)\/\/.*$/gm, (_m, sangria: string) => sangria);

const archivos = pantallasDelCliente('src');

console.log('\n── ningún código escrito a mano en un texto que se lee ──');
/*
 * Busca el código dentro de un texto en español: lo que delata a un código de
 * meta en una frase es que lo rodeen palabras. Una comparación como
 * `codigo === 'P1.3'` no entra, porque ahí el código es un dato, no un texto.
 */
const enTexto = /(?:[a-záéíóúñ]{2,}\s+(?:a|al|en|de)\s+)(\d-)?P\d{1,2}\.\d[a-z]?/gi;
const conCodigo: string[] = [];
for (const f of archivos) {
  const t = sinComentarios(readFileSync(join(raiz, f), 'utf8'));
  for (const m of t.matchAll(enTexto)) {
    const n = t.slice(0, m.index).split('\n').length;
    conCodigo.push(`${f}:${n} «${m[0].trim()}»`);
  }
}
ok(conCodigo.length === 0, `ninguna frase manda al cliente a un código (${conCodigo.join(' · ') || 'ninguna'})`);

console.log('\n── el campo del código no se pinta sin traducir ──');
/*
 * `{meta.codigo}` y `{v.pilar_id}` puestos directo en la pantalla imprimen el
 * código tal cual. Se permiten dentro de `diaDelCodigo(...)`, que es la
 * traducción, y en atributos como `key`, que no se ven.
 */
const pintado = /\{\s*[\w?.[\]'"]*\b(?:codigo|pilar_id)\b[\w?.[\]'"\s]*\}/g;
const crudos: string[] = [];
for (const f of archivos) {
  const t = sinComentarios(readFileSync(join(raiz, f), 'utf8'));
  for (const m of t.matchAll(pintado)) {
    const antes = t.slice(Math.max(0, m.index - 70), m.index);
    // `${…}` dentro de un texto de plantilla no es pantalla: suele ser el
    // identificador de un elemento, como `meta-${paso.codigo}`.
    if (antes.endsWith('$')) continue;
    // Dentro de una llamada a la traducción, o en un atributo: no se ve.
    if (/diaDelCodigo\(|key=|=\{$|=\{\s*$/.test(antes)) continue;
    // Una lista de parámetros no es pantalla: `({ codigo, texto }) => …`.
    if (/(?:=>|\(|,)\s*$/.test(antes)) continue;
    // Solo cuenta si está en posición de contenido: después de cerrar una
    // etiqueta. Ojo: `=>` también termina en `>`, y por eso va filtrado antes.
    if (!/>[^<{]*$/.test(antes)) continue;
    const n = t.slice(0, m.index).split('\n').length;
    crudos.push(`${f}:${n} ${m[0]}`);
  }
}
ok(crudos.length === 0, `ninguna pantalla lo pinta crudo (${crudos.join(' · ') || 'ninguna'})`);

console.log('\n── la traducción responde, exista o no la jornada ──');
/*
 * Al traducir los cuatro códigos del espejo de identidad salió algo más
 * grande que un texto mal puesto: solo P1.3 sigue en el Camino. El propósito,
 * el legado y los cinco NO no se escriben hoy en ninguna jornada.
 *
 * Así que lo que se sostiene acá no es que los cuatro existan —eso es una
 * decisión de producto abierta— sino que la traducción nunca devuelva un
 * código en pantalla: o el día, o un texto que no manda a ningún lado.
 */
(['P1.3', 'P2.3', 'P3.3', 'P2.5'] as const).forEach((c) => {
  const dia = diaDelCodigo(c);
  ok(dia === null || (typeof dia === 'number' && dia > 0),
     `${c} ${dia ? `está en el día ${dia}` : 'ya no está en el Camino: cae al texto sin destino'}`);
});
ok(diaDelCodigo('P1.3') === 2, 'tu historia sigue siendo el día 2');

console.log(fallas === 0 ? '\n✓ el cliente ve días, no códigos\n' : `\n✗ ${fallas} fallas\n`);
process.exit(fallas === 0 ? 0 : 1);
