/**
 * MENOS MAPAS PARA EL MISMO VIAJE — lo que el cliente lee afuera.
 *
 * ═══ QUÉ RESUELVE ═══
 *
 * El Camino se clasificó de siete maneras a la vez: estaciones, sistemas,
 * pilares, cinturones, libertades, fases y C·L·I·N·I·C·A. Siete mapas del
 * mismo viaje, y el que los lee no sabe cuál mirar.
 *
 * Javo lo cortó el 12 de noviembre: AFUERA quedan tres —paisaje, libertad y
 * sistema—. Los cinturones son un premio, no un mapa: aparecen cuando se
 * ganan. Los pilares, las fases y C·L·I·N·I·C·A son de adentro: ordenan el
 * código y el Admin, y el cliente no los lee nunca.
 *
 * ═══ CÓMO SE MIDE ═══
 *
 * Por el TEXTO que va a pantalla, no por el código: `pilar` como nombre de
 * variable está en todos lados y está bien. Lo que no puede estar es escrito
 * en una frase que el cliente lee. Medido el 15 de noviembre en las pantallas
 * de verdad: quedaban dos, las dos en el aviso del día 45 —«La Fase 4 se abre
 * con tu ADN completo» y «los completas en su pilar»—.
 *
 * ═══ Y EL PASO DE DIEZ MINUTOS ═══
 *
 * El día que vale es justo el día en que no va a hacer la sesión de setenta y
 * cinco minutos. Si el paso afuera vive solo adentro de la sesión, el que
 * abre la app con diez minutos cierra la app sin enterarse. Tiene que estar
 * en Hoy.
 *
 * Correr con: npx tsx scripts/prueba-menos-mapas.ts
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

let fallas = 0;
const ok = (cond: boolean, que: string) => {
  console.log(cond ? `✓ ${que}` : `✗ ${que}`);
  if (!cond) fallas++;
};

/** Las pantallas del cliente: fuera el Admin, que es de Javo. */
const pantallas: string[] = [];
const recorrer = (dir: string) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { if (!/admin/i.test(e.name)) recorrer(p); }
    else if (/\.tsx$/.test(e.name) && !/Admin/.test(e.name)) pantallas.push(p);
  }
};
recorrer('src/components');
recorrer('src/pages');

/**
 * El texto que va a pantalla: lo que queda entre etiquetas y lo que viaja en
 * un atributo de texto. Sin comentarios —ahí se explica justamente por qué
 * una palabra NO está— y sin nombres de variable.
 */
function textoDePantalla(fuente: string): string {
  const sinComentarios = fuente
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/[^\n]*/g, ' ');
  const trozos: string[] = [];
  for (const m of sinComentarios.matchAll(/>([^<>{}]{3,})</g)) {
    const t = m[1].trim();
    /* Entre `>` y `<` también cae código, cuando una expresión JSX se parte
       en varias líneas: `) : pilar.estado === 'completado' ? (`. Eso no lo
       lee nadie, y contarlo deja la lente roja por algo que no existe. Se
       pide que parezca una frase: con espacio, sin signos de código. */
    if (!/\s/.test(t)) continue;
    if (/[=(){};]|&&|\|\||=>|\.\w+\s*\(/.test(t)) continue;
    trozos.push(t);
  }
  for (const m of sinComentarios.matchAll(/(?:aria-label|title|placeholder|alt)=["']([^"']+)["']/g)) trozos.push(m[1]);
  return trozos.join(' \n ');
}

console.log('\n══ afuera, solo paisaje · libertad · sistema ══');

const DE_ADENTRO: [RegExp, string][] = [
  [/\bpilar(es)?\b/i, 'pilar'],
  [/\bfase\s*\d|\bla fase\b/i, 'fase'],
  [/C·L·I·N·I·C·A|\bCLINICA\b/, 'C·L·I·N·I·C·A'],
];
const encontrados: string[] = [];
for (const f of pantallas) {
  const texto = textoDePantalla(readFileSync(f, 'utf-8'));
  for (const [re, nombre] of DE_ADENTRO) {
    const m = re.exec(texto);
    if (m) encontrados.push(`${f.replace('src/', '')}: «${m[0]}» (${nombre})`);
  }
}
ok(encontrados.length === 0, `ninguna pantalla del cliente nombra un mapa de adentro${
  encontrados.length ? `\n     ${encontrados.join('\n     ')}` : ''}`);

console.log('\n══ el grado es un premio, no un mapa ══');

/* Puede decir «Cinturón» cuando se gana: eso es el premio. Lo que no puede
   es ser un rótulo de sección, que lo volvería el sexto mapa. */
const premio = readFileSync('src/components/Graduacion.tsx', 'utf-8');
ok(/cintur/i.test(premio), 'el grado se nombra donde se entrega');

console.log('\n══ el paso de diez minutos se alcanza sin entrar ══');

const tarjeta = readFileSync('src/components/camino/TarjetaDeHoy.tsx', 'utf-8');
ok(/pasoAfuera/.test(tarjeta), 'la tarjeta de Hoy recibe el paso afuera');
ok(/marcarPasoAfuera\(\s*dia/.test(tarjeta), 'y se puede marcar desde ahí');
const panel = readFileSync('src/pages/Dashboard.tsx', 'utf-8');
ok(/pasoAfuera: data\.tareasHoy\[0\]\.paso_afuera/.test(panel),
  'y Hoy se lo pasa desde la jornada del día');

console.log(fallas === 0 ? '\n✓ tres mapas afuera, y el paso a la vista' : `\n✗ ${fallas} fallas`);
process.exit(fallas === 0 ? 0 : 1);
