/**
 * prueba-la-franja-del-reloj.ts — que el encabezado no quede bajo el reloj.
 *
 * ═══ QUÉ PROTEGE ═══
 *
 * La app declara `viewport-fit=cover`, que la hace ocupar la pantalla entera
 * del teléfono, incluida la franja donde viven el reloj, la señal y la
 * batería. Eso es lo que queremos: una app instalada que llega a los bordes.
 *
 * Pero ocupar esa franja obliga a reservar su alto. Durante meses no se
 * reservó: había cuatro zonas seguras en todo el código y las cuatro eran de
 * abajo. Resultado, en el iPhone con la app instalada el encabezado quedaba
 * justo debajo del reloj. Primera pantalla, primer segundo, del cliente que
 * acaba de pagar.
 *
 * Y había dos cosas más, del mismo origen: la barra de estado estaba en modo
 * translúcido, que pinta el reloj en blanco —ilegible sobre el crema de la
 * app—, y el color de arranque era negro, así que la pantalla de inicio abría
 * en negro para entrar a una app clara.
 *
 * Esto no se puede medir abriendo la app en el navegador de pruebas: fuera de
 * un teléfono real `env(safe-area-inset-top)` siempre vale cero. Así que se
 * mide donde sí se puede: en que la configuración sea coherente consigo
 * misma. Si alguien vuelve a poner la pantalla completa sin reservar el alto,
 * o devuelve el negro, esta prueba lo dice.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const raiz = join(import.meta.dirname, '..');
const leer = (p: string) => readFileSync(join(raiz, p), 'utf8');

const html = leer('index.html');
const css = leer('src/index.css');
const vite = leer('vite.config.ts');

let fallas = 0;
const ok = (cond: boolean, msg: string) => {
  if (cond) { console.log(`  ✓ ${msg}`); }
  else { console.log(`  ✗ ${msg}`); fallas++; }
};

/** El crema del tema claro, que es el único que ve el cliente. */
const CREMA = '#EAE4D9';

console.log('\n── si ocupa la pantalla entera, reserva la franja ──');
const ocupaTodo = /viewport-fit\s*=\s*cover/.test(html);
ok(ocupaTodo, 'la app llega a los bordes del teléfono');
if (ocupaTodo) {
  ok(
    /safe-area-inset-top/.test(css),
    'y reserva el alto de arriba, así que el encabezado no queda bajo el reloj',
  );
}

console.log('\n── el reloj se tiene que leer ──');
/*
 * `black-translucent` pinta el reloj en blanco y deja que el contenido suba
 * hasta el borde. Las dos cosas están mal en una app de fondo claro: el reloj
 * blanco sobre crema no se ve, y el contenido se mete debajo.
 */
ok(
  !/apple-mobile-web-app-status-bar-style"\s+content="black-translucent"/.test(html),
  'la barra de estado no está en el modo que pinta el reloj en blanco',
);

console.log('\n── la pantalla de arranque abre del color de la app ──');
const colorHtml = html.match(/name="theme-color"\s+content="([^"]+)"/)?.[1] ?? '';
ok(
  colorHtml.toUpperCase() === CREMA,
  `el color declarado es el crema de la app (dice «${colorHtml || 'nada'}»)`,
);

const temaVite = vite.match(/theme_color:\s*'([^']+)'/)?.[1] ?? '';
const fondoVite = vite.match(/background_color:\s*'([^']+)'/)?.[1] ?? '';
ok(temaVite.toUpperCase() === CREMA, `y el de la app instalada también (dice «${temaVite || 'nada'}»)`);
ok(fondoVite.toUpperCase() === CREMA, `y el fondo de arranque también (dice «${fondoVite || 'nada'}»)`);

console.log('\n── el crema sigue siendo el fondo del cliente ──');
/*
 * Si alguien cambia el fondo del tema claro y olvida los tres colores de
 * arriba, la pantalla de arranque vuelve a abrir de otro color que el de la
 * app. Esta es la que ata las dos cosas.
 */
const fondoClaro = css.match(/--bg-root:\s*(#[0-9A-Fa-f]{6})\s*;[\s\S]{0,400}?--text-cream/);
const declaraciones = [...css.matchAll(/--bg-root:\s*(#[0-9A-Fa-f]{6})/g)].map((m) => m[1].toUpperCase());
ok(
  declaraciones.includes(CREMA),
  `el tema claro declara el crema como fondo (encontrados: ${declaraciones.join(', ') || 'ninguno'})`,
);
void fondoClaro;

console.log(fallas === 0 ? '\n✓ la franja del reloj está reservada\n' : `\n✗ ${fallas} fallas\n`);
process.exit(fallas === 0 ? 0 : 1);
