/**
 * prueba-una-palabra-para-el-camino.ts
 *
 * ═══ QUÉ PROTEGE ═══
 *
 * La unidad del Camino se contaba con TRES palabras distintas, en tres
 * pantallas que el mismo cliente abre el mismo día:
 *
 *   El Camino, el numeral más grande de la app   «{hechas} de 91 PASOS»
 *   La Hoja de Ruta                              «{hechas} de 65 JORNADAS hechas»
 *   Métricas                                     «TAREAS completadas»
 *   El cierre de cuentas                         «jornadas completadas»
 *
 * Y «paso» no es un sinónimo suelto: ya significa otra cosa acá adentro. Cada
 * jornada tiene cinco o seis PASOS numerados, con su versalita de oro, que es
 * lo que hay que hacer ese día. Así que el encabezado prometía «91 pasos» y
 * al abrir el primero aparecían otros cinco. Dos cosas con un nombre.
 *
 * La palabra es JORNADA: es como la llama el dato —`jornadas` en el seed—, es
 * la de la Hoja de Ruta, y es la del cierre de cuentas, que es el momento
 * comercial más importante del programa. «Tarea» es la palabra del código
 * (`TipoTarea`, `TaskModal`, `adminTasks`), no la del cliente.
 *
 * Y el contador iba en tres formas en una sola fila de cuatro tarjetas:
 * «12/91 del total», «8/90 totales», «de 13 semanas». La barra es notación y
 * hay que decodificarla; «12 de 91» se lee.
 *
 * Lo que esta prueba NO exige: que «tarea», «meta» o «pilar» desaparezcan del
 * código. Son los identificadores del dato y de la base, y cambiarlos sería
 * un barrido sin ganancia. Lo que se mide es lo que el cliente LEE.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const raiz = join(import.meta.dirname, '..');
const leer = (p: string) => readFileSync(join(raiz, p), 'utf8');

let fallas = 0;
const ok = (cond: boolean, msg: string) => {
  if (cond) console.log(`  ✓ ${msg}`);
  else { console.log(`  ✗ ${msg}`); fallas++; }
};

/** Los archivos que pintan pantallas del cliente. El Admin tiene su vocabulario. */
function delCliente(dir = 'src'): string[] {
  const out: string[] = [];
  for (const e of readdirSync(join(raiz, dir), { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.name === 'admin' || e.name === 'Admin.tsx') continue;
    if (e.isDirectory()) out.push(...delCliente(p));
    else if (/\.tsx$/.test(e.name)) out.push(p);
  }
  return out;
}

/** Lo que queda cuando se van los comentarios: un comentario puede nombrar el bug. */
const sinComentarios = (s: string) => s
  .replace(/\/\*[\s\S]*?\*\//g, ' ')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ')
  .replace(/\/\/[^\n]*/g, ' ');

console.log('\n── la unidad del Camino se llama jornada ──');
/*
 * Se busca la unidad CONTADA: «de N tareas», «N tareas hechas», «Tareas
 * completadas». Un «tarea» suelto puede ser el tipo de dato, el nombre de un
 * componente o el título de una pantalla del equipo.
 */
const CONTADA = /\b(?:de\s+\{?[\w.]+\}?\s+|[0-9]+\s+|\{[\w.]+\}\s+)?(tareas|pasos|metas)\b\s*(?:hechas?|completad[ao]s?|cerradas?|listas?|del total|en total|totales)?/gi;
const malNombradas: string[] = [];
for (const archivo of delCliente()) {
  const vivo = sinComentarios(leer(archivo));
  /* Solo lo que está entre > y <, o en una plantilla: eso es lo que se lee. */
  for (const m of vivo.matchAll(/>([^<>{}\n]{6,}?)</g)) {
    const t = m[1];
    if (/\b(tareas|pasos)\b/i.test(t) && /\b(de|hechas|completad|cerradas|total)\b/i.test(t)) {
      malNombradas.push(`${archivo}: «${t.trim().slice(0, 50)}»`);
    }
  }
  for (const m of vivo.matchAll(/`([^`]{6,120}?)`/g)) {
    const t = m[1];
    if (/\$\{/.test(t) && /\b(tareas|pasos)\b/i.test(t) && /\b(de|total)\b/i.test(t)) {
      malNombradas.push(`${archivo}: «${t.trim().slice(0, 50)}»`);
    }
  }
}
ok(
  malNombradas.length === 0,
  malNombradas.length === 0
    ? 'ninguna pantalla del cliente cuenta «tareas» ni «pasos» del Camino'
    : `todavía cuentan otra cosa: ${malNombradas.join(' · ')}`,
);
void CONTADA;

ok(
  /de \{total\} jornadas/.test(leer('src/components/camino/EncabezadoCamino.tsx')),
  'el numeral más grande de la app dice «de N jornadas»',
);
ok(
  /jornadas hechas/.test(leer('src/components/camino/HojaDeRuta.tsx')),
  'y la Hoja de Ruta dice lo mismo, con el mismo participio',
);
ok(
  /jornadas hechas/.test(leer('src/components/CierreDelCamino.tsx')),
  'y el cierre de cuentas también: una palabra, un participio',
);

console.log('\n── «paso» queda para lo que ya nombraba ──');
/*
 * Los pasos de adentro de una jornada: cinco o seis, numerados, con la
 * versalita de oro. Ese uso es el legítimo y por eso el otro tenía que irse.
 */
ok(
  /pasos: string\[\]/.test(leer('src/lib/roadmapSeed.ts')),
  'cada jornada sigue teniendo sus pasos, que es lo que hay que hacer ese día',
);

console.log('\n── y el contador se lee, no se decodifica ──');
const metrics = sinComentarios(leer('src/pages/Metrics.tsx'));
const conBarra = [...metrics.matchAll(/sub=\{`([^`]*\$\{[^`]*)`\}/g)]
  .map((m) => m[1]).filter((t) => t.includes('/'));
ok(
  conBarra.length === 0,
  conBarra.length === 0
    ? 'las cuatro tarjetas de Métricas cuentan «de N en total», sin barra'
    : `con barra: ${conBarra.join(' · ')}`,
);
ok(
  /label="Jornadas hechas"/.test(metrics),
  'y la primera tarjeta nombra la unidad del Camino',
);
/*
 * «Pilar» es el identificador de la base: al cliente el Camino le muestra el
 * tramo por sus días, y lo que gana al cerrarlo es un cinturón. Esa es la
 * palabra del producto — «el progreso se mide en CINTURONES».
 */
ok(
  /label="Cinturones ganados"/.test(metrics) && !/label="Pilares completados"/.test(metrics),
  'y los tramos cerrados se cuentan por lo que el cliente gana: cinturones',
);

console.log('\n── y los numerales de una fila arrancan en la misma línea ──');
/*
 * «Jornadas hechas» y «Cinturones ganados» envuelven en dos renglones;
 * «Días con diario» y «Semana actual» entran en uno. Sin alto reservado, el
 * numeral de cada tarjeta arranca donde termina su propia etiqueta, así que
 * en una fila de cuatro los números quedaban a alturas distintas — un
 * renglón entero de diferencia— y el ojo, que recorre la fila buscando las
 * cifras, tiene que ir a buscarlas una por una.
 *
 * Medido después: 371 y 370 en la primera fila, 528 y 527 en la segunda. El
 * píxel de diferencia es el redondeo del alto de línea.
 */
const conAltoReservado = [...metrics.matchAll(/min-h-\[2\.5rem\]/g)].length;
ok(
  conAltoReservado >= 2,
  conAltoReservado >= 2
    ? 'las dos tarjetas de KPI reservan el alto de su etiqueta'
    : `solo ${conAltoReservado} de 2 lo reservan`,
);

console.log(fallas === 0 ? '\n✓ una palabra para la unidad del Camino\n' : `\n✗ ${fallas} fallas\n`);
process.exit(fallas === 0 ? 0 : 1);
