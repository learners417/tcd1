/**
 * EL JUEGO DEL SUR — que el juego de los libros cuente lo mismo en la app.
 *
 * ═══ QUÉ VIGILA ═══
 *
 * Las cinco mecánicas están escritas en tres lugares que no se hablan: la
 * guarda de los seis libros, El Camino en papel y esta app. Si el vaso de la
 * app se llena con otra cuenta que el del libro, el cliente tiene dos juegos
 * y ninguno es el suyo. Esta lente fija la cuenta.
 *
 * Y vigila lo que es fácil que se caiga sin romperse: que el paso afuera se
 * pueda marcar. La racha y las dos piedras del paso afuera se dibujan igual
 * con la lista vacía; sin el toque que la llena, las dos quedan en cero para
 * siempre y nadie ve un error.
 *
 * Correr con: npx tsx scripts/prueba-el-juego-del-sur.ts
 */
import { readFileSync } from 'node:fs';

let fallas = 0;
const ok = (cond: boolean, que: string) => {
  console.log(cond ? `✓ ${que}` : `✗ ${que}`);
  if (!cond) fallas++;
};

const fuente = readFileSync('src/lib/elJuegoDelSur.ts', 'utf-8');
const soloCodigo = fuente
  .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
  .replace(/\/\/[^\n]*/g, (m) => m.replace(/[^\n]/g, ' '));

console.log('\n══ tu vaso: la cuenta del libro ══');

ok(/export const VASO = 100/.test(soloCodigo), 'el vaso son 100 piedras');
ok(/PIEDRA_POR_DIA = 1\b/.test(soloCodigo), 'cada día hecho vale una');
ok(/PIEDRA_POR_PASO_AFUERA = 2\b/.test(soloCodigo), 'cada paso afuera vale dos');
for (const [en, nombre] of [[33, 'La orilla'], [66, 'La travesía'], [100, 'La otra orilla']] as const) {
  ok(new RegExp(`en:\\s*${en},\\s*nombre:\\s*'${nombre}'`).test(soloCodigo),
    `la marca de ${en} es «${nombre}»`);
}

console.log('\n══ las diez palabras ══');

const palabras = [...soloCodigo.matchAll(/palabra:\s*'([^']+)'/g)].map((m) => m[1]);
ok(palabras.length === 10, `${palabras.length} palabras`);
const delSistema = ['HORA', 'PRECIO', 'PROTOCOLO', 'MODELO', 'CAJA', 'SISTEMA', 'LIBRES', 'IMPOSTOR', 'BOT', 'ESCÁNER'];
const sobran = palabras.filter((p) => !delSistema.includes(p));
ok(sobran.length === 0, `son las diez del sistema${sobran.length ? ` — sobra ${sobran.join(', ')}` : ''}`);
const porLibro = [...soloCodigo.matchAll(/libro:\s*'([^']+)'/g)].map((m) => m[1]);
const cuenta = porLibro.reduce<Record<string, number>>((a, l) => ({ ...a, [l]: (a[l] ?? 0) + 1 }), {});
ok(Object.keys(cuenta).length === 5, `repartidas en ${Object.keys(cuenta).length} libros`);
ok(Object.values(cuenta).every((n) => n === 2), 'dos por libro, como en la colección');

console.log('\n══ lo que abren, que lo definía la app ══');

ok(/CAJA ÷ HORA = /.test(soloCodigo), 'la ecuación del bosque está escrita');
ok(/LO_QUE_ABRE/.test(soloCodigo), 'y hay algo decidido para cuando estén las diez');
const pantalla = readFileSync('src/components/camino/ElJuegoDelSur.tsx', 'utf-8');
ok(/horaReal/.test(pantalla), 'lo que abre usa su hora real, que la app ya midió');

console.log('\n══ la racha tiene de dónde contar ══');

/* Lo que se puede caer sin romperse: el paso afuera no se podía marcar, así
   que la racha y las dos piedras quedaban dibujadas y en cero para siempre. */
const sesion = readFileSync('src/components/sesion/SesionViva.tsx', 'utf-8');
/* Se busca la LLAMADA con su día, no el nombre: importado y sin usar, el
   nombre está igual y la lente daba verde con el toque desconectado. Probado
   sacando la llamada y dejando el import. */
ok(/marcarPasoAfuera\(\s*diaDelPaso/.test(sesion),
  'el paso afuera se puede marcar en la sesión, y se llama con su día');
ok(/diaDelPaso/.test(sesion), 'y se guarda con su día, que es lo que la racha cuenta');
const camino = readFileSync('src/pages/Roadmap.tsx', 'utf-8');
ok(/diaDelPaso=\{meta\.dia_asignado\}/.test(camino), 'El Camino le pasa ese día');
ok(/<ElJuegoDelSur\s/.test(camino), 'y el tablero está puesto en El Camino');

console.log('\n══ ningún mapa de más ══');

/* El sello por tramo YA existe en la app: son los grados. Una insignia nueva
   al lado sería el sexto mapa para el mismo viaje. */
ok(!/insignia|sello/i.test(soloCodigo),
  'el sello por tramo no se duplica: en la app son los grados que ya existen');

/* Y el color de cada día sale del seed, no de rangos copiados acá. */
ok(!/\b(1 a 7|8 a 14|15 a 35|36 a 84|85 a 90)\b/.test(soloCodigo),
  'los días de cada paisaje no están copiados: salen del seed');

console.log(fallas === 0 ? '\n✓ el juego del sur, con la cuenta del libro' : `\n✗ ${fallas} fallas`);
process.exit(fallas === 0 ? 0 : 1);
