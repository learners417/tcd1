/**
 * prueba-el-cliente-que-escribe-mucho.ts
 *
 * ═══ QUÉ PROTEGE ═══
 *
 * QUE EL ESTADO LARGO SEA LARGO DE VERDAD
 *
 * La cuenta con datos tenía textos realistas pero cortos: el campo se llama
 * `historia_300` —trescientas palabras, se lo pide la app— y el estado de
 * prueba le ponía cincuenta y cinco. El cliente que llena ese campo como se lo
 * piden no es un caso raro: es el que usa bien la app.
 *
 * El modo `--largo` existe para eso, y su riesgo es silencioso: si alguien
 * acorta uno de estos textos, las cuatro vistas `>largo` siguen corriendo y
 * siguen dando verde — midiendo los textos cortos otra vez, sin medir nada
 * nuevo. Un estado de prueba que no es lo que dice ser mide la pantalla vacía
 * creyendo que la mide llena. Ya pasó dos veces en esta casa: el parámetro
 * `hechas` que nadie leía, y las diez claves de ADN inventadas que la app no
 * lee.
 *
 * Así que acá no se mira el código: se corre el generador y se cuentan las
 * palabras que salieron.
 */
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const raiz = join(import.meta.dirname, '..');

function estado(largo: boolean) {
  const salida = execFileSync('npx', ['tsx', 'scripts/estado-lleno.mts', ...(largo ? ['--largo'] : [])],
    { cwd: raiz, encoding: 'utf8', timeout: 180_000 });
  return JSON.parse(salida.trim().split('\n').at(-1) as string);
}

let fallas = 0;
const ok = (cond: boolean, msg: string) => {
  if (cond) console.log(`  ✓ ${msg}`);
  else { console.log(`  ✗ ${msg}`); fallas++; }
};
const palabras = (s: string) => String(s).trim().split(/\s+/).length;
const cifras = (n: number) => String(Math.abs(Math.trunc(n))).length;

const corto = estado(false);
const largo = estado(true);

console.log('\n── el campo tiene el largo que su nombre pide ──');
/*
 * El umbral va por debajo del objetivo a propósito: el generador corta por
 * oración, así que cae cerca de trescientas y no clavado. Lo que se protege es
 * el orden de magnitud, no un número exacto.
 */
ok(
  palabras(largo.adn.historia_300) >= 280,
  `historia_300 tiene ${palabras(largo.adn.historia_300)} palabras (el campo pide 300)`,
);
ok(
  palabras(largo.adn.metodo_pasos) >= 230,
  `metodo_pasos tiene ${palabras(largo.adn.metodo_pasos)} palabras`,
);
ok(
  palabras(largo.adn.metodo_nombre) >= 5,
  'y el nombre del método es uno de los largos, que es como los eligen',
);

console.log('\n── y los dos modos son de verdad distintos ──');
/*
 * Si el modo largo devolviera el corto, todo lo de arriba fallaría. Si el
 * corto devolviera el largo, las seis vistas `>lleno` medirían otra cosa que
 * la que dicen medir. Los dos lados importan.
 */
ok(
  palabras(corto.adn.historia_300) < 120,
  `el modo corto sigue corto: ${palabras(corto.adn.historia_300)} palabras`,
);
ok(
  palabras(largo.adn.historia_300) > palabras(corto.adn.historia_300) * 3,
  'y el largo es al menos tres veces el corto',
);

console.log('\n── el nombre compuesto ──');
ok(
  String(largo.nombre).trim().split(/\s+/).length >= 3 && String(largo.nombre).length >= 24,
  `«${largo.nombre}» — nombre y dos apellidos, que es la barra de arriba puesta a prueba`,
);
ok(
  String(corto.nombre).length < String(largo.nombre).length,
  'y el corto es un nombre simple',
);

console.log('\n── los numerales de siete cifras ──');
/*
 * Cinco cifras ya se medían. Siete es el mes de alguien que factura, y es
 * donde una caja que aguantó $127.500 deja de aguantar $13.200.000.
 */
ok(
  cifras(largo.numeros.ingresos_cobrados) >= 7,
  `ingresos_cobrados tiene ${cifras(largo.numeros.ingresos_cobrados)} cifras`,
);
ok(
  cifras(largo.numeros.gasto_ads) >= 7,
  `gasto_ads tiene ${cifras(largo.numeros.gasto_ads)} cifras`,
);
ok(
  cifras(corto.numeros.ingresos_cobrados) === 7 && cifras(corto.numeros.gasto_ads) === 6,
  'y el modo corto conserva los suyos, que son los que ya estaban medidos',
);

console.log('\n── y las dos cuentas comparten lo que no cambia ──');
/*
 * El largo cambia los TEXTOS y los NÚMEROS, no el avance: las dos cuentas
 * están en el mismo día 72 con las mismas jornadas cerradas. Si el largo
 * trajera otro avance, la diferencia entre `>lleno` y `>largo` dejaría de ser
 * atribuible al texto.
 */
ok(
  largo.dias === corto.dias && largo.hechas.length === corto.hechas.length,
  `las dos están en el día ${largo.dias} con ${largo.hechas.length} jornadas cerradas`,
);
ok(
  Object.keys(largo.adn).length === Object.keys(corto.adn).length,
  `y las dos llenan los mismos ${Object.keys(largo.adn).length} campos del ADN`,
);

console.log(fallas === 0
  ? '\n✓ el estado del cliente que escribe mucho es largo de verdad\n'
  : `\n✗ ${fallas} fallas\n`);
process.exit(fallas === 0 ? 0 : 1);
