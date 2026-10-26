/**
 * prueba-siete-libertades.ts — que la rueda se mida y se pueda volver a mirar.
 *
 * ═══ QUÉ PROTEGE ═══
 *
 * Dos cosas que ya fallaron.
 *
 * La primera: la rueda medía ocho dimensiones genéricas —cuerpo, mente,
 * espíritu, profesión, dinero, familia, amigos, naturaleza—, las mismas que
 * usa cualquiera. Ahora mide las siete libertades, que son la cosmovisión de
 * la casa, más el terreno donde se apoyan. Si alguien vuelve a poner rayos
 * que no son esos, la app deja de coincidir con los libros.
 *
 * La segunda, y es la que más cuesta ver: el onboarding le decía al cliente
 * «el día 90 las vas a mirar», y no había dónde. En el Diario del Director
 * había un comentario que anunciaba la sección y debajo no había nada. Un
 * módulo que ninguna pantalla monta no existe para el cliente, y es el error
 * que no deja rastro: compila, pasa las pruebas de tipos y nadie lo reporta
 * porque nadie sabe que falta.
 *
 * Por eso esta prueba no mira solo el módulo: mira que alguna pantalla lo
 * importe y lo ponga en su árbol.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { DIMENSIONES_RUEDA } from '../src/lib/rueda';

const raiz = join(import.meta.dirname, '..');
const leer = (p: string) => readFileSync(join(raiz, p), 'utf8');

let fallas = 0;
const ok = (cond: boolean, msg: string) => {
  if (cond) console.log(`  ✓ ${msg}`);
  else { console.log(`  ✗ ${msg}`); fallas++; }
};

console.log('\n── los ocho rayos son las siete libertades y el terreno ──');
const ESPERADOS = ['fisica', 'energetica', 'mental', 'emocional', 'financiera', 'tiempo', 'espiritual', 'terreno'];
const ids = DIMENSIONES_RUEDA.map((d) => d.id);
ok(
  ESPERADOS.every((e) => ids.includes(e as never)) && ids.length === ESPERADOS.length,
  `los rayos son los ocho esperados (hay: ${ids.join(', ')})`,
);
ok(
  DIMENSIONES_RUEDA.every((d) => d.label.trim().length > 0 && d.pregunta.trim().length > 0),
  'cada rayo dice su nombre y qué le pregunta al cliente',
);

console.log('\n── cada libertad tiene su color del paisaje ──');
const css = leer('src/index.css');
for (const d of DIMENSIONES_RUEDA) {
  const token = d.color.match(/var\((--[a-z-]+)/)?.[1];
  ok(Boolean(token && css.includes(`${token}:`)), `«${d.label}» usa un color declarado en el tema (${token ?? 'sin token'})`);
}

console.log('\n── la medición vieja no se lee con los nombres nuevos ──');
const rueda = leer('src/lib/rueda.ts');
ok(
  /const KEY = 'tcd_rueda_v2'/.test(rueda),
  'lo medido se guarda en una clave nueva, así «familia» no se lee como «emocional»',
);

console.log('\n── alguna pantalla monta la rueda ──');
/*
 * Se busca en todo src: el componente puede vivir donde sea, lo que no puede
 * es no estar en ninguna parte.
 */
function archivos(dir: string): string[] {
  const out: string[] = [];
  for (const e of readdirSync(join(raiz, dir), { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) out.push(...archivos(p));
    else if (/\.tsx?$/.test(e.name)) out.push(p);
  }
  return out;
}
const todos = archivos('src').filter((p) => !p.endsWith('SieteLibertades.tsx'));
const montan = todos.filter((p) => {
  const t = leer(p);
  return /from\s+'[^']*SieteLibertades'/.test(t) && /<SieteLibertades\b/.test(t);
});
ok(
  montan.length > 0,
  montan.length > 0
    ? `la monta ${montan.join(', ')}`
    : 'ninguna pantalla la monta: el cliente la mide el día 1 y no la vuelve a ver',
);

console.log('\n── y se puede volver a medir sin pasar por el onboarding ──');
const comp = leer('src/components/SieteLibertades.tsx');
ok(/guardarMedicion\(/.test(comp), 'desde la pantalla se puede guardar una medición nueva');
ok(/primeraMedicion\(/.test(comp), 'y se compara contra la foto de partida');

console.log(fallas === 0 ? '\n✓ la rueda mide las siete libertades y tiene dónde mirarse\n' : `\n✗ ${fallas} fallas\n`);
process.exit(fallas === 0 ? 0 : 1);
