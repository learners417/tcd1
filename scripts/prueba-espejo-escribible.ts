/**
 * prueba-espejo-escribible.ts — que el espejo no mande a ningún lado.
 *
 * ═══ QUÉ PROTEGE ═══
 *
 * El Espejo de Identidad muestra cuatro piezas: historia, propósito, legado y
 * los cinco NO. Cuando una faltaba, mandaba a buscarla a la jornada donde se
 * escribía — y tres de esas cuatro jornadas ya no existen en el Camino. El
 * propósito, el legado y los cinco NO quedaron de una versión anterior del
 * método.
 *
 * Es el error que más tarda en verse: la pantalla se abre, se lee entera, y
 * el único que descubre que el destino no existe es el cliente que intenta ir.
 *
 * Ahora las cuatro se escriben en el espejo mismo. Esta prueba exige dos
 * cosas: que ninguna pieza mande a un código de jornada, y que las cuatro
 * tengan por dónde escribirse.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { roadmap } from '../src/lib/roadmapSeed';

const raiz = join(import.meta.dirname, '..');
const leer = (p: string) => readFileSync(join(raiz, p), 'utf8');

let fallas = 0;
const ok = (cond: boolean, msg: string) => {
  if (cond) console.log(`  ✓ ${msg}`);
  else { console.log(`  ✗ ${msg}`); fallas++; }
};

const espejo = leer('src/components/EspejoIdentidadModal.tsx');
const cuerpo = espejo.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

console.log('\n── el espejo no manda a ninguna jornada ──');
/*
 * Se mira el código sin comentarios: los comentarios SÍ nombran los códigos
 * viejos, y tienen que poder hacerlo para contar qué pasó.
 */
const codigos = [...cuerpo.matchAll(/'(P\d{1,2}[a-z]?\.\d+[a-z]?)'/gi)].map((m) => m[1]);
ok(
  codigos.length === 0,
  codigos.length === 0
    ? 'ninguna pieza apunta a un código de jornada'
    : `apunta a ${codigos.join(', ')}, y una jornada puede dejar de existir`,
);

console.log('\n── las cuatro piezas se pueden escribir ──');
for (const campo of ['historia_50', 'proposito', 'legado', 'adn_cinco_no']) {
  ok(new RegExp(`${campo}:`).test(cuerpo), `«${campo}» se guarda desde el espejo`);
}

console.log('\n── y alguien se las guarda de verdad ──');
const roadmapTsx = leer('src/pages/Roadmap.tsx');
ok(/onGuardarPieza=\{/.test(roadmapTsx), 'el Camino le pasa al espejo cómo guardar');
ok(
  /guardarPiezaDelADN[\s\S]{0,900}from\('profiles'\)\.update/.test(roadmapTsx),
  'y lo guardado llega a la base, no solo a la pantalla',
);
ok(
  /guardarPiezaDelADN[\s\S]{0,900}const \{ error \}[\s\S]{0,200}if \(error\)/.test(roadmapTsx),
  'y si la base falla, el cliente se entera: Supabase devuelve el error en vez de lanzarlo',
);

console.log('\n── los cinco NO se guardan los cinco ──');
ok(
  /listos < 5/.test(cuerpo),
  'no se guardan tres: tres NO dejan pasar lo que el cuarto hubiera frenado',
);

console.log('\n── y si alguna de esas jornadas vuelve, se entera ──');
/*
 * Si el método vuelve a tener una jornada que escribe estas piezas, lo que
 * corresponde es revisar si el espejo debe seguir pidiéndolas. No es una
 * falta: es un aviso.
 */
for (const c of ['P2.3', 'P3.3', 'P2.5']) {
  if (roadmap.piezas.some((p) => p.codigo === c)) {
    console.log(`  · ${c} volvió al Camino: conviene revisar si el espejo debe seguir pidiendo esa pieza`);
  }
}
console.log('  ✓ revisado');

console.log(fallas === 0 ? '\n✓ el espejo se completa solo\n' : `\n✗ ${fallas} fallas\n`);
process.exit(fallas === 0 ? 0 : 1);
