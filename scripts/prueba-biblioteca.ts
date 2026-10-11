/**
 * LA BIBLIOTECA — todo el material en un lugar, y abierta cliente por cliente.
 *
 * ═══ LOS DOS HUECOS QUE CIERRA ═══
 *
 * 1 · EL MATERIAL ESTABA REPARTIDO EN CUATRO LUGARES que no se hablaban: los
 *     videos de cada jornada, las clases del método, los tutoriales con sus
 *     pasos escritos, y lo que el equipo carga en la base. La Biblioteca
 *     mostraba dos de los cuatro.
 *
 *     Los tutoriales técnicos eran el peor caso: vivían dentro de la sesión de
 *     su día y pasado ese día no se podían volver a mirar. Son justo los que
 *     el cliente necesita releer meses después, cuando tiene que repetir algo
 *     que hizo una vez.
 *
 * 2 · NO SE PODÍA DAR ACCESO A UN CLIENTE PUNTUAL. Lo único que decidía qué
 *     veía era su avance en el Camino. Al de La Instalación —que no lo
 *     recorre— no había forma de abrirle el material.
 *
 * Correr con: npx tsx scripts/prueba-biblioteca.ts
 */
import { readFileSync } from 'node:fs';
import {
  armarCatalogo, loQuePuedeVer, cuantasFaltan, porOrigen, buscar, comoLaVe,
  COMO_SE_LLAMA_EL_ORIGEN, type PiezaDeBiblioteca,
} from '../src/lib/catalogoBiblioteca';
import { SEED_ROADMAP_V2 } from '../src/lib/roadmapSeed';

let fallas = 0;
const ok = (cond: boolean, que: string) => {
  console.log(cond ? `✓ ${que}` : `✗ ${que}`);
  if (!cond) fallas++;
};

/** Los títulos reales de las jornadas, como se los pasa la pantalla. */
const titulos: Record<number, string> = {};
for (const p of SEED_ROADMAP_V2) {
  for (const m of p.metas) if (m.dia_asignado) titulos[m.dia_asignado] = m.titulo;
}

const catalogo = armarCatalogo(titulos);

// ── 1 · Las cuatro fuentes, juntas ─────────────────────────────────────────
console.log('══ las cuatro fuentes en un solo catálogo ══');
const grupos = porOrigen(catalogo);
ok(grupos.jornada.length > 0, `${grupos.jornada.length} videos de las jornadas del Camino`);
ok(grupos.metodo.length > 0, `${grupos.metodo.length} clases del método, que no son de ningún día`);
ok(grupos.tutorial.length > 0, `${grupos.tutorial.length} tutoriales paso a paso`);
ok(catalogo.length === grupos.jornada.length + grupos.metodo.length + grupos.tutorial.length,
  `${catalogo.length} piezas en total, sin que ninguna quede fuera de su grupo`);

ok(new Set(catalogo.map((p) => p.id)).size === catalogo.length,
  'ningún id repetido: dos piezas con el mismo id se tapan entre sí en pantalla');

const conPasos = catalogo.filter((p) => p.pasos && p.pasos.length > 0);
ok(conPasos.length > 0,
  `${conPasos.length} tutoriales traen sus pasos escritos: antes se podían leer solo el día que tocaban`);
ok(conPasos.every((p) => p.dia !== null),
  'y cada uno sabe de qué día del Camino viene');

console.log('\n══ los títulos son los de verdad ══');
const conTitulo = catalogo.filter((p) => p.origen === 'jornada' && p.dia !== null);
ok(conTitulo.some((p) => !/^Día \d+$/.test(p.titulo)),
  'los videos de jornada toman el título de su jornada, no «día 31»');
ok(catalogo.every((p) => p.titulo.trim().length > 0), 'ninguna pieza sin nombre');

// ── 2 · Lo que el equipo carga pisa lo del archivo ─────────────────────────
console.log('\n══ lo que el equipo carga manda ══');
const pisado = armarCatalogo(titulos, { 1: 'https://youtu.be/AAAAAAAAAAA' });
const dia1 = pisado.find((p) => p.id === 'jornada:1');
ok(dia1?.youtube === 'AAAAAAAAAAA',
  'un video cargado en la base pisa al del archivo, igual que en el Camino');
ok(pisado.length === catalogo.length,
  'y no duplica la pieza: la pisa');

const soloBase = armarCatalogo(titulos, { 77: 'https://youtu.be/BBBBBBBBBBB' });
ok(soloBase.some((p) => p.id === 'jornada:77'),
  'un video que solo existe en la base también entra');
ok(armarCatalogo(titulos, {}).length === catalogo.length,
  'y sin nada cargado el catálogo se arma igual: la Biblioteca nunca queda vacía por una consulta que falló');

// ── 3 · Qué puede ver cada cliente ─────────────────────────────────────────
console.log('\n══ qué ve quien va por el día 31 ══');
const enElDia31 = loQuePuedeVer(catalogo, { diaActual: 31, bibliotecaAbierta: false });
ok(enElDia31.length < catalogo.length, 'no ve todo');
ok(enElDia31.every((p) => p.dia === null || p.dia <= 31), 'nada posterior a su día');
ok(enElDia31.some((p) => p.dia === null),
  'pero sí las clases del método: no dependen del avance');
ok(cuantasFaltan(catalogo, { diaActual: 31, bibliotecaAbierta: false }) > 0,
  'y se puede decir cuántas le faltan sin mostrárselas');

const delDia30 = catalogo.find((p) => p.dia === 30);
ok(delDia30 === undefined || enElDia31.includes(delDia30),
  'quien va por el 31 puede volver al material del 30 aunque no haya cerrado esa jornada: negárselo sería castigarlo por estar atrasado justo cuando lo necesita');

console.log('\n══ con la Biblioteca abierta ══');
const abierta = loQuePuedeVer(catalogo, { diaActual: 3, bibliotecaAbierta: true });
ok(abierta.length === catalogo.length,
  've todo, sin esperar su día: es para el de La Instalación, que no recorre el Camino');
ok(cuantasFaltan(catalogo, { diaActual: 3, bibliotecaAbierta: true }) === 0, 'y no le falta nada');

const recienEmpieza = loQuePuedeVer(catalogo, { diaActual: null, bibliotecaAbierta: false });
ok(recienEmpieza.every((p) => p.dia === null),
  'quien todavía no empezó ve solo lo que no depende del día, en vez de una pantalla vacía');

// ── 4 · La línea de arriba ─────────────────────────────────────────────────
console.log('\n══ la línea de arriba ══');
const linea31 = comoLaVe(catalogo, { diaActual: 31, bibliotecaAbierta: false });
ok(/se abren a medida que avanzas/.test(linea31), `dice lo que SÍ pasa: "${linea31}"`);
const lineaAbierta = comoLaVe(catalogo, { diaActual: 3, bibliotecaAbierta: true });
ok(/todos disponibles/.test(lineaAbierta), `y a quien la tiene abierta se lo dice: "${lineaAbierta}"`);
ok(!/undefined|NaN|null/.test(linea31 + lineaAbierta), 'sin agujeros en el texto');
ok(COMO_SE_LLAMA_EL_ORIGEN.tutorial === 'Paso a paso',
  'cada origen tiene su nombre en pantalla, no el del código');

// ── 5 · La búsqueda ────────────────────────────────────────────────────────
console.log('\n══ la búsqueda ══');
const conAcento = catalogo.find((p) => /[áéíóúñ]/i.test(p.titulo));
if (conAcento) {
  const sinAcento = conAcento.titulo.normalize('NFD').replace(/[̀-ͯ]/g, '');
  ok(buscar(catalogo, sinAcento).some((p) => p.id === conAcento.id),
    `se encuentra sin escribir las tildes: "${sinAcento.slice(0, 32)}"`);
}
ok(buscar(catalogo, 'MÉTODO'.toLowerCase()).length <= catalogo.length, 'la búsqueda no inventa piezas');
ok(buscar(catalogo, '').length === catalogo.length, 'y sin texto devuelve todo');
ok(buscar(catalogo, 'zzzzznoexiste').length === 0, 'lo que no está, no está');

// ── 6 · Dónde vive ─────────────────────────────────────────────────────────
console.log('\n══ dónde vive ══');
const lib = readFileSync('src/lib/catalogoBiblioteca.ts', 'utf-8');
const mig = readFileSync('supabase/migrations/20261015_biblioteca_por_cliente.sql', 'utf-8');

ok(!/from '\.\/supabase'/.test(lib), 'la regla se prueba sola: no toca la base');
ok(/add column if not exists biblioteca_abierta boolean/.test(mig),
  'el permiso es una columna del cliente, idempotente');
ok(/biblioteca_abierta_por/.test(mig) && /biblioteca_abierta_el/.test(mig),
  'con la firma: quién la abrió y cuándo');
ok(/else null end/.test(mig),
  'y al cerrarla la firma se borra: una firma vieja sobre un permiso que ya no está cuenta una historia que no es');
ok(/Solo el equipo puede abrir/.test(mig), 'solo el equipo puede abrirla');
ok(/p\.admin_rol in \('owner', 'manager', 'staff'\)/.test(mig),
  'con el mismo criterio de equipo que el resto de la app');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
