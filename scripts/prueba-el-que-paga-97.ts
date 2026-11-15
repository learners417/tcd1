/**
 * EL QUE PAGA 97 — que tenga todo lo que compró.
 *
 * ═══ QUÉ COMPRA ═══
 *
 * «Los 8 libros y los cinco primeros días de mi app». Es lo único que se
 * cobra solo, sin llamada, así que es el recorrido que nadie mira y el que
 * más veces se recorre.
 *
 * ═══ QUÉ VIGILA ESTA LENTE ═══
 *
 * Que lo que compró esté a su alcance. Su plan llega hasta el pilar 1: todo
 * lo que pida más que eso, no lo ve. Los libros pedían pilar 2 y grado 2
 * —medido el 15 de noviembre—, así que pagaba los libros y los veía con
 * candado. Esta lente es para que no vuelva a pasar con ninguno.
 *
 * No mide que las pantallas funcionen: eso lo camina
 * `scripts/caminar-los-cinco-dias.py`, que entra, trabaja y cierra los cinco
 * días como lo hace él.
 *
 * Correr con: npx tsx scripts/prueba-el-que-paga-97.ts
 */
import { readFileSync } from 'node:fs';
import { PILAR_MAX, NOMBRE_PLAN } from '../src/lib/planes';
import { DESTINOS } from '../src/lib/destinos';

let fallas = 0;
const ok = (cond: boolean, que: string) => {
  console.log(cond ? `✓ ${que}` : `✗ ${que}`);
  if (!cond) fallas++;
};

const TECHO = PILAR_MAX.blanco;

console.log('\n══ hasta dónde llega su plan ══');
ok(TECHO === 1, `Tu nuevo precio llega al pilar ${TECHO}`);
ok(NOMBRE_PLAN.blanco === 'Tu nuevo precio', `y se llama «${NOMBRE_PLAN.blanco}»`);

console.log('\n══ lo que compró, a su alcance ══');

/* Los libros. Es la mitad de lo que paga: si piden más pilar del que tiene,
   los compró y no los ve. */
const libros = DESTINOS.find((d) => d.id === 'biblioteca');
ok(Boolean(libros), 'la sección de los libros existe');
ok((libros?.minPilar ?? 99) <= TECHO,
  `los libros no piden más pilar del que tiene (piden ${libros?.minPilar ?? '?'}, tiene ${TECHO})`);
ok(libros?.minCinturon === undefined,
  'y no piden un grado que en cinco días no se gana');

/* Y su Número, que es lo que los cinco días construyen. */
const numero = DESTINOS.find((d) => d.id === 'numero');
ok((numero?.minPilar ?? 99) <= TECHO, 'Mi Número está a su alcance');
ok(numero?.minCinturon === undefined, 'y tampoco pide grado');

console.log('\n══ y lo que todavía no compró, cerrado ══');

/* Lo contrario también importa: si todo estuviera abierto, el escalón que
   sigue no tendría nada que ofrecer. */
const campanas = DESTINOS.find((d) => d.id === 'campanas');
ok((campanas?.minPilar ?? 0) > TECHO, 'las campañas siguen cerradas para su plan');
const metricas = DESTINOS.find((d) => d.id === 'metrics');
ok((metricas?.minPilar ?? 0) > TECHO, 'las métricas también');

console.log('\n══ lo que ve adentro sigue atado a su día ══');

/* Abrir la puerta de los libros no abre el material del programa: lo de
   adentro se filtra por el día del Camino. Si eso se cayera, el que paga 97
   se llevaría las clases de los noventa días. */
const material = readFileSync('src/components/TodoElMaterial.tsx', 'utf-8');
ok(/loQuePuedeVer\(catalogo, \{ diaActual/.test(material),
  'el material de la biblioteca se filtra por el día en que va');

console.log(fallas === 0 ? '\n✓ el que paga 97 tiene lo que compró' : `\n✗ ${fallas} fallas`);
process.exit(fallas === 0 ? 0 : 1);
