/**
 * LA ESCALERA — un solo precio y un solo nombre por escalón.
 *
 * ═══ QUÉ PASÓ ═══
 *
 * La escalera de TCD se escribía en tres lugares que no se hablaban, y cada
 * uno quedó viejo por su lado:
 *
 *   · `planes.ts` vendía «El Programa Completo» a $997 y abría los 90 días.
 *   · `topeDelEscalon.ts` vendía «base» a $1.000 y abría hasta el día 12.
 *   · El Sistema cobraba «La Base · 90 días con Javo», también a $1.000.
 *
 * Los dos primeros eran el MISMO producto con dos precios, dos nombres y dos
 * alcances distintos. Y el alcance era el peligroso: el día que el equipo
 * marcara como `base` a alguien que pagó 1.000, ese cliente se encontraba una
 * pared en el día 13 de un programa que le vendieron de 90.
 *
 * Nada de eso rompía ni fallaba. Por eso esta prueba lee el código fuente: lo
 * que hay que verificar es que las puntas digan lo mismo, y eso no se prueba
 * llamando a una función.
 *
 * ═══ LA ESCALERA, DECIDIDA POR JAVO EL 12 DE NOVIEMBRE DE 2026 ═══
 *
 *     97   Tu nuevo precio   ·    497   Tu Sistema   ·   1.000  La Base
 *   3.000  la mentoría       ·  6.000   la instalación · 10.000 el mastermind
 *
 * Correr con: npx tsx scripts/prueba-la-escalera.ts
 */
import { readFileSync } from 'node:fs';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

let fallas = 0;
const ok = (cond: boolean, que: string) => {
  console.log(cond ? `✓ ${que}` : `✗ ${que}`);
  if (!cond) fallas++;
};

const leer = (p: string) => readFileSync(p, 'utf-8');

/**
 * El archivo sin sus comentarios, y con las líneas en su lugar.
 *
 * Hace falta porque esta misma prueba, y los archivos que mide, EXPLICAN los
 * nombres viejos para que nadie los traiga de vuelta. Si mirara el comentario,
 * la explicación de por qué «El Programa Completo» se fue sería la prueba de
 * que sigue. Los comentarios se borran dejando sus espacios: así el número de
 * línea que se reporta sigue siendo el de verdad.
 */
const soloCodigo = (t: string) => t
  .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
  .replace(/^(\s*)\/\/.*$/gm, '$1');

// ── 1 · Los nombres y los precios, donde se declaran ───────────────────────
console.log('══ la declaración ══');
const planes = soloCodigo(leer('src/lib/planes.ts'));

ok(/blanco: 'Tu nuevo precio'/.test(planes),
  'la entrada se llama Tu nuevo precio, que es lo que el cliente se lleva');
ok(/negro: 'La Base'/.test(planes) && /completo: 'La Base'/.test(planes),
  'el escalón de arriba se llama La Base, igual que el producto que se cobra');
ok(/verde: '\$497', negro: '\$1\.000'/.test(planes),
  'y sus precios son 497 y 1.000');

const tope = soloCodigo(leer('src/lib/topeDelEscalon.ts'));
ok(/base: \{ precio: '\$1\.000'/.test(tope), 'La Base vale 1.000 también acá');
ok(/ascenso: \{ precio: '\$3\.000'/.test(tope), 'la mentoría, 3.000');
ok(/instalacion: \{ precio: '\$6\.000'/.test(tope),
  'y la instalación 6.000: subió el 12 nov y desde enero de 2027 va a 7.000');

// ── 2 · Lo que abre cada escalón ───────────────────────────────────────────
console.log('\n══ hasta dónde llega lo que pagó ══');
ok(/base: \{ precio: '\$1\.000', hasta: 'los 90 días/.test(tope),
  'La Base abre los 90 días: el producto se llama, textualmente, «90 días con Javo»');
ok(/negro: 99/.test(planes),
  'y el plan de arriba llega al final del Camino');
ok(!/if \(dia > ULTIMO_DIA_DE_BASE\) return false;/.test(tope),
  'ninguna puerta corta el Camino por escalón: lo que los separa es cuánto Javo tiene adentro');

// ── 3 · Los nombres viejos no vuelven ──────────────────────────────────────
console.log('\n══ los que se fueron ══');

/** Todo lo que el cliente puede llegar a leer. */
function archivosDelCliente(): string[] {
  const out: string[] = [];
  const caminar = (dir: string) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) caminar(p);
      else if (/\.tsx?$/.test(e.name)) out.push(p);
    }
  };
  caminar('src');
  return out;
}

const VIEJOS: Array<[RegExp, string]> = [
  [/Semana Blanca/, '«Semana Blanca»'],
  [/Los 5 días|Los cinco días/, '«Los 5 días»'],
  [/El Programa Completo/, '«El Programa Completo»'],
  [/\$997|\b997 USD\b/, 'el precio 997'],
  [/'\$5\.000'/, 'el precio 5.000'],
];

for (const [rx, nombre] of VIEJOS) {
  const donde = archivosDelCliente()
    .filter((f) => rx.test(soloCodigo(leer(f))))
    .map((f) => f.split('/').pop());
  ok(donde.length === 0, `${nombre} no está en ninguna pantalla${donde.length ? `: ${donde.join(', ')}` : ''}`);
}

// ── 4 · Los cinco sistemas, con el nombre del impreso ──────────────────────
console.log('\n══ los cinco sistemas ══');
const seed = JSON.parse(leer('src/lib/roadmap.seed.json')) as {
  sistemas: Array<{ n: number; nombre: string }>;
};
const ESPERADOS = ['Tu reset', 'Tu programa', 'Tu captación', 'Tu propia app', 'Tu ecosistema'];
for (const [i, esperado] of ESPERADOS.entries()) {
  const real = seed.sistemas.find((s) => s.n === i + 1)?.nombre;
  ok(real === esperado, `el sistema ${i + 1} se llama «${esperado}»${real === esperado ? '' : ` (dice «${real}»)`}`);
}
const paisajes = soloCodigo(leer('src/lib/losCincoPaisajes.ts'));
ok(!/alto impacto|captación automática|ecosistema circular/.test(paisajes),
  'y los paisajes los llaman igual, sin los adjetivos que el libro no usa');

// ── 5 · Los manuales, cada uno con su nombre ───────────────────────────────
console.log('\n══ los manuales ══');
const manuales = soloCodigo(leer('src/lib/manuales.ts'));
ok(/titulo: 'La Campaña'/.test(manuales),
  'el manual de anuncios se llama La Campaña: El Camino ya es la sección de los 90 días');
ok(!/titulo: 'El Camino'/.test(manuales),
  'y no quedó ningún manual con el nombre de la sección');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
