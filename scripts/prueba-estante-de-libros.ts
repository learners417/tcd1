/**
 * prueba-estante-de-libros.ts — que los libros estén, y que no vendan ahí.
 *
 * ═══ QUÉ PROTEGE ═══
 *
 * La Biblioteca junta los videos del Camino, las clases del método y los
 * pasos escritos, y no tenía concepto de libro. Los libros son la fuente:
 * Sanadores Libres explica esta app y las siete libertades son la cosmovisión
 * detrás de todo. Sin ellos, el cliente que quiere entender por qué el Camino
 * está en este orden no lo encuentra en ninguna pantalla.
 *
 * Y protege dos cosas más, que son las que se rompen solas con el tiempo:
 *
 * Que alguna pantalla lo monte. Un componente que nadie monta no existe para
 * el cliente, compila igual y no lo reporta nadie.
 *
 * Que el estante no venda. Lo que el libro cuesta y cómo se entrega cambia
 * más seguido que esta pantalla, y una cifra vieja en la app es peor que
 * ninguna. Además la palabra «gratis» no se usa en esta casa: el libro se
 * cobra.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { LIBROS, estante, COMO_SE_LLAMA_EL_ROL, faltanDelSur, LIBROS_DEL_SUR_ESPERADOS } from '../src/lib/libros';

const raiz = join(import.meta.dirname, '..');
const leer = (p: string) => readFileSync(join(raiz, p), 'utf8');

let fallas = 0;
const ok = (cond: boolean, msg: string) => {
  if (cond) console.log(`  ✓ ${msg}`);
  else { console.log(`  ✗ ${msg}`); fallas++; }
};

console.log('\n── los dos que no pueden faltar ──');
const ids = LIBROS.map((l) => l.id);
ok(ids.includes('sanadores-libres'), 'está Sanadores Libres, que es el libro de esta app');
ok(ids.includes('siete-libertades'), 'están las siete libertades, que son la raíz de todo');
ok(
  LIBROS.filter((l) => l.rol === 'esta-app').length === 1,
  'y uno solo lleva el rol del libro de esta app',
);
ok(
  LIBROS.filter((l) => l.rol === 'raiz').length === 1,
  'y uno solo es la raíz: dos raíces es no tener ninguna',
);

console.log('\n── cada libro dice qué explica ──');
for (const l of LIBROS) {
  ok(
    l.queExplica.trim().length > 20,
    `«${l.titulo}» dice qué explica, que es lo que decide si el cliente lo abre`,
  );
}

console.log('\n── la colección del sur tiene su orden ──');
/*
 * Los libros sueltos se leen en cualquier orden. La colección del sur no: son
 * los cinco sistemas, los mismos del Camino, y ahí el orden manda.
 */
const sur = LIBROS.filter((l) => l.rol === 'coleccion');
ok(sur.every((l) => typeof l.orden === 'number'), 'cada libro de la colección tiene su número');
const ordenes = sur.map((l) => l.orden);
ok(new Set(ordenes).size === ordenes.length, 'y no hay dos con el mismo número');
ok(sur.length <= LIBROS_DEL_SUR_ESPERADOS, `la colección no se pasa de ${LIBROS_DEL_SUR_ESPERADOS}`);
console.log(`  · faltan ${faltanDelSur()} por cargar, y el estante lo dice en pantalla`);

console.log('\n── el estante no vende ──');
const comp = leer('src/components/EstanteDeLibros.tsx');
const textoDeLosLibros = LIBROS.map((l) => `${l.titulo} ${l.queExplica}`).join(' ');
const PLATA = /\b(gratis|sin costo|de regalo|regalo|USD|\$\s?\d|\d+\s?(dólares|usd))\b/i;
const enComp = comp.match(PLATA);
ok(!enComp, enComp ? `la pantalla dice «${enComp[0]}»: el precio se decide fuera de la app` : 'la pantalla no habla de precios');
const enDatos = textoDeLosLibros.match(PLATA);
ok(!enDatos, enDatos ? `un libro dice «${enDatos[0]}»` : 'ningún libro habla de precios');

console.log('\n── cada rol tiene cómo llamarse en pantalla ──');
for (const l of LIBROS) {
  ok(Boolean(COMO_SE_LLAMA_EL_ROL[l.rol]), `el rol de «${l.titulo}» tiene nombre en pantalla`);
}

console.log('\n── alguna pantalla monta el estante ──');
function archivos(dir: string): string[] {
  const out: string[] = [];
  for (const e of readdirSync(join(raiz, dir), { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) out.push(...archivos(p));
    else if (/\.tsx?$/.test(e.name)) out.push(p);
  }
  return out;
}
const montan = archivos('src')
  .filter((p) => !p.endsWith('EstanteDeLibros.tsx'))
  .filter((p) => {
    const t = leer(p);
    return /from\s+'[^']*EstanteDeLibros'/.test(t) && /<EstanteDeLibros\b/.test(t);
  });
ok(montan.length > 0, montan.length > 0 ? `lo monta ${montan.join(', ')}` : 'ninguna pantalla lo monta');

console.log('\n── el estante sale ordenado ──');
const orden = estante().map((l) => l.rol);
ok(orden[0] === 'raiz', 'primero la raíz');
ok(orden[1] === 'esta-app', 'después el libro de esta app');

console.log(fallas === 0 ? '\n✓ los libros están en la Biblioteca y no venden desde ahí\n' : `\n✗ ${fallas} fallas\n`);
process.exit(fallas === 0 ? 0 : 1);
