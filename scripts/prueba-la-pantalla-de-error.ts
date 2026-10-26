/**
 * prueba-la-pantalla-de-error.ts — la pantalla del peor momento.
 *
 * ═══ QUÉ PROTEGE ═══
 *
 * Hay una pantalla que se dibuja cuando ya falló todo lo demás. Por eso lleva
 * los colores escritos a mano: si el error ocurrió antes de que cargara la
 * hoja de estilos, las variables del tema no existen.
 *
 * Y por eso mismo se había quedado fuera de todos los arreglos de tema. Era
 * negra, con el texto en blanco y un botón en dorado brillante —el mismo que
 * el sistema de la app prohíbe por escrito, con el argumento de que se ve
 * barato porque lo copiaron todos—. Aparecía así en medio de una app crema,
 * justo cuando el cliente ya está molesto.
 *
 * Los avisos venían del mismo lado: salían en oscuro sobre fondo claro, y
 * abajo a la derecha, que en el teléfono es donde está la barra de pestañas.
 *
 * Esta prueba sostiene cuatro cosas:
 *
 *   1. Que el dorado brillante no vuelve, en ninguna pantalla del cliente.
 *   2. Que ningún fondo de pantalla completa se escribe en negro a mano,
 *      donde ningún ajuste de tema puede alcanzarlo.
 *   3. Que la pantalla de error abre del color de la app.
 *   4. Que la letra de esa pantalla respeta el piso de quince píxeles, que es
 *      la regla que más se cuida en todo el producto.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const raiz = join(import.meta.dirname, '..');
const leer = (p: string) => readFileSync(join(raiz, p), 'utf8');

let fallas = 0;
const ok = (cond: boolean, msg: string) => {
  if (cond) { console.log(`  ✓ ${msg}`); }
  else { console.log(`  ✗ ${msg}`); fallas++; }
};

/** Todos los archivos de código del cliente. */
function archivos(dir: string, acc: string[] = []): string[] {
  for (const n of readdirSync(join(raiz, dir))) {
    const rel = `${dir}/${n}`;
    if (statSync(join(raiz, rel)).isDirectory()) archivos(rel, acc);
    else if (/\.(tsx|ts|css)$/.test(n)) acc.push(rel);
  }
  return acc;
}
const todos = archivos('src');

console.log('\n── el dorado brillante no vuelve ──');
/*
 * #d4af37 es el dorado que el sistema visual descarta por escrito. No es un
 * token de la app: cada vez que aparece es porque alguien lo escribió a mano.
 */
const conDorado = todos.filter((f) => /#d4af37/i.test(leer(f)));
ok(conDorado.length === 0, `ningún archivo lo usa (encontrado en: ${conDorado.join(', ') || 'ninguno'})`);

console.log('\n── ningún fondo de pantalla en negro escrito a mano ──');
/*
 * Un color escrito en el estilo de un elemento no lo alcanza ningún selector
 * de tema. Si es el fondo de una pantalla entera, queda negro para siempre
 * aunque la app sea crema.
 */
const conNegro = todos.filter((f) => /backgroundColor:\s*['"]#(000|080808|0a0a0a|111)/i.test(leer(f)));
ok(conNegro.length === 0, `ninguno lo hace (encontrado en: ${conNegro.join(', ') || 'ninguno'})`);

console.log('\n── la pantalla de error abre del color de la app ──');
const main = leer('src/main.tsx');
ok(/#FAF5EA/i.test(main), 'su fondo es el crema del tema claro');
ok(!/color:\s*['"]#fff['"]/i.test(main), 'y su texto no es blanco');
ok(
  /safe-area-inset-top/.test(main),
  'y respeta la franja del reloj, porque también se dibuja a pantalla completa',
);

console.log('\n── los avisos se leen sobre el fondo claro ──');
ok(!/theme="dark"/.test(main), 'no salen en oscuro sobre una app crema');
ok(
  !/position="bottom-right"/.test(main),
  'y no salen donde está la barra de pestañas del teléfono',
);

console.log('\n── el piso de quince píxeles también acá ──');
/*
 * La pantalla de error se dibuja con tamaños escritos a mano, así que la
 * escala de la app no la protege: hay que mirarla aparte.
 */
const tamanos = [...main.matchAll(/fontSize:\s*['"](\d+)px['"]/g)].map((m) => Number(m[1]));
ok(tamanos.length > 0, `declara sus tamaños (encontrados: ${tamanos.join(', ') || 'ninguno'})`);
const chicos = tamanos.filter((t) => t < 15);
ok(chicos.length === 0, `y ninguno baja de quince (los que bajan: ${chicos.join(', ') || 'ninguno'})`);

console.log(fallas === 0 ? '\n✓ la pantalla del peor momento está del lado de la app\n' : `\n✗ ${fallas} fallas\n`);
process.exit(fallas === 0 ? 0 : 1);
