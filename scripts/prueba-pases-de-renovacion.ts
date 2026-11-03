/**
 * prueba-pases-de-renovacion.ts — que el día 91 tenga a dónde seguir.
 *
 * ═══ QUÉ PROTEGE ═══
 *
 * El Camino son noventa días y termina. Lo que sigue es la cuota, y hasta
 * ahora la app no la ofrecía en ninguna parte: la pantalla del cierre
 * mostraba lo que hizo y lo que le faltó, y la conversación de qué sigue
 * dependía de que alguien se acordara de escribirle.
 *
 * ═══ Y EL CHOQUE DE NÚMEROS ═══
 *
 * 497 y 997 son también los precios de entrada al Camino en planes.ts, y son
 * cosas distintas: allá se paga UNA VEZ para entrar, acá se paga POR MES para
 * seguir. El mismo número significando dos cosas es exactamente lo que hace
 * que un cliente crea que ya pagó lo que no pagó, o al revés.
 *
 * Por eso esta prueba exige dos cosas: que cada pase diga «al mes» donde se
 * muestra, y que las dos escaleras nunca aparezcan en la misma pantalla.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { PASES } from '../src/lib/renovacion';

const raiz = join(import.meta.dirname, '..');
const leer = (p: string) => readFileSync(join(raiz, p), 'utf8');

let fallas = 0;
const ok = (cond: boolean, msg: string) => {
  if (cond) console.log(`  ✓ ${msg}`);
  else { console.log(`  ✗ ${msg}`); fallas++; }
};

console.log('\n── los tres pases, con sus precios ──');
const esperados: Array<[string, number]> = [['app', 97], ['grupal', 497], ['privado', 997]];
ok(PASES.length === 3, `son tres pases (hay ${PASES.length})`);
for (const [id, precio] of esperados) {
  const p = PASES.find((x) => x.id === id);
  ok(p?.precio === precio, `«${id}» cuesta ${precio} al mes${p ? ` (dice ${p.precio})` : ' — no existe'}`);
}
ok(
  PASES.filter((p) => p.destacado).length === 1,
  'uno solo lleva la marca: dos recomendados es ninguno',
);
for (const p of PASES) {
  ok(p.incluye.length >= 2 && p.para.trim().length > 10, `«${p.nombre}» dice para qué es y qué incluye`);
}

console.log('\n── la escalera sube ──');
const precios = PASES.map((p) => p.precio);
ok(
  precios.every((v, i) => i === 0 || v > precios[i - 1]),
  `van de menor a mayor (${precios.join(' · ')})`,
);

console.log('\n── en pantalla siempre dice al mes ──');
const comp = leer('src/components/PasesDeRenovacion.tsx');
ok(/al mes/.test(comp), 'la pantalla escribe «al mes» junto al número');
ok(
  !/\$\s?\d/.test(comp),
  'y escribe «dólares» en vez del signo: un número con signo se confunde con el precio de entrada',
);

console.log('\n── las dos escaleras no conviven ──');
/*
 * planes.ts vende la entrada al Camino con 497 y 997. Si una pantalla
 * mostrara las dos escaleras, el mismo número diría dos cosas.
 */
function archivos(dir: string): string[] {
  const out: string[] = [];
  for (const e of readdirSync(join(raiz, dir), { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) out.push(...archivos(p));
    else if (/\.tsx$/.test(e.name)) out.push(p);
  }
  return out;
}
const mezclan = archivos('src').filter((p) => {
  const t = leer(p);
  return /<PasesDeRenovacion\b/.test(t) && /PRECIO_FUNDADOR/.test(t);
});
ok(
  mezclan.length === 0,
  mezclan.length === 0
    ? 'ninguna pantalla muestra los pases junto a los precios de entrada'
    : `${mezclan.join(', ')} muestra las dos escaleras: 497 diría dos cosas`,
);

console.log('\n── alguna pantalla los ofrece ──');
const montan = archivos('src')
  .filter((p) => !p.endsWith('PasesDeRenovacion.tsx'))
  .filter((p) => {
    const t = leer(p);
    return /from\s+'[^']*PasesDeRenovacion'/.test(t) && /<PasesDeRenovacion\b/.test(t);
  });
ok(
  montan.length > 0,
  montan.length > 0 ? `los ofrece ${montan.join(', ')}` : 'ninguna pantalla los ofrece: el día 91 no tiene a dónde seguir',
);

console.log('\n── y hay por dónde pagar ──');
ok(
  /cobroUrl\(/.test(comp) && /waLink/.test(comp),
  'con enlace de cobro se paga ahí; sin enlace cargado, el botón escribe por WhatsApp',
);

console.log(fallas === 0 ? '\n✓ el día 91 tiene a dónde seguir\n' : `\n✗ ${fallas} fallas\n`);
process.exit(fallas === 0 ? 0 : 1);
