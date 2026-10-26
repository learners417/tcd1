/**
 * prueba-lecciones-escritas.ts — que ninguna jornada llegue sin su enseñanza.
 *
 * ═══ QUÉ PROTEGE ═══
 *
 * El Camino tiene 43 jornadas con video. Doce están grabadas.
 *
 * Las otras treinta y una no quedaban vacías, que es lo que las volvía
 * difíciles de ver: la pantalla mostraba «Tu sesión, escrita» y abajo los
 * pasos del día. El cliente leía QUÉ hacer. La razón por la que se hace —la
 * clase, lo que justifica que esto cueste lo que cuesta— no estaba en ninguna
 * parte. Veinticinco de esas treinta y una no tenían ni video ni lección.
 *
 * Una jornada así se completa igual. El cliente tilda, avanza, y nunca se
 * enteró de que faltaba algo. Por eso no lo reporta nadie.
 *
 * ═══ LA REGLA ═══
 *
 * Toda jornada de video tiene su lección escrita, con video o sin él. El
 * texto es la clase; el video se suma arriba cuando se graba.
 *
 * Y la lección se mide con la misma vara que el resto de lo que lee el
 * cliente, porque la lee en la misma pantalla: sin jerga, sin códigos
 * internos, sin voseo —sus clientes son de Ecuador, Panamá, Chile y
 * Venezuela—, con «personas» y nunca «gente», y en letra que no sea chica.
 */
import { roadmap, diaDelCodigo } from '../src/lib/roadmapSeed';
import { VIDEOS_POR_JORNADA } from '../src/lib/videosCargados';
import { GUIONES } from '../src/lib/guionesVideos';
import { JERGA, CODIGO } from './lente-lenguaje';

/** Castellano neutro: el voseo queda fuera de todo lo que lee el cliente. */
const VOSEO =
  /\b(vos|sos|tenés|querés|podés|sabés|hacés|decís|venís|ponés|mirás|vendés|cobrás|elegís|escribís|andá|mirá|fijate|acordate|quedate|pegá|entrá|poné|revisá|cargá|elegí|escribí|anotá|probá|avisá|identificá|pausá|frená|bajá|subile|mandá|dejá|tomá|buscá|contá|empezá|segu[ií])\b/i;

/** Nunca «gente»: siempre personas o consultantes. */
const GENTE = /\bgente\b/i;

/** Los tokens que el vocabulario sabe reemplazar. Cualquier otro se ve crudo. */
const TOKEN_BUENO = /^(consultante|consultantes|tu_consultante|Consultante|Consultantes|Tu_consultante)$/;

let fallas = 0;
const mal = (msg: string) => { console.log(`  ✗ ${msg}`); fallas++; };

const jornadas = roadmap.piezas.map((p) => ({
  ...p,
  diaReal: diaDelCodigo(p.codigo) ?? p.dia ?? 0,
}));

console.log('\n── toda jornada tiene su lección escrita ──');
const sinLeccion = jornadas.filter((p) => !GUIONES[p.codigo]?.esencia?.trim());
const sinVideoNiLeccion = sinLeccion.filter(
  (p) => !(VIDEOS_POR_JORNADA[p.codigo] || VIDEOS_POR_JORNADA[p.diaReal]),
);
if (sinVideoNiLeccion.length === 0) {
  console.log(`  ✓ las ${jornadas.length} jornadas tienen video o lección escrita`);
} else {
  for (const p of sinVideoNiLeccion) {
    mal(`día ${p.diaReal} · «${p.titulo}» no tiene video ni lección: el cliente no recibe la clase`);
  }
}

console.log('\n── la lección se lee como el resto del Camino ──');
let revisadas = 0;
for (const [codigo, g] of Object.entries(GUIONES)) {
  const e = g.esencia?.trim();
  if (!e) continue;
  revisadas++;
  const j = e.match(JERGA);
  if (j) mal(`${codigo}: dice «${j[0]}», que es jerga para quien cura`);
  const c = e.match(CODIGO);
  if (c) mal(`${codigo}: muestra el código interno «${c[0]}»`);
  const v = e.match(VOSEO);
  if (v) mal(`${codigo}: dice «${v[0]}» — el Camino se escribe en castellano neutro`);
  const gn = e.match(GENTE);
  if (gn) mal(`${codigo}: dice «${gn[0]}» — se dice personas o consultantes`);
  for (const t of e.matchAll(/\{\{([^}]+)\}\}/g)) {
    if (!TOKEN_BUENO.test(t[1])) mal(`${codigo}: el token «${t[1]}» no lo reemplaza nadie, se ve crudo`);
  }
}
if (fallas === 0) console.log(`  ✓ las ${revisadas} lecciones pasan la misma vara que el Camino`);

console.log('\n── la lección entra en la pantalla ──');
/*
 * La esencia se muestra en un recuadro del alto de un video. Una lección muy
 * larga se lee con barra lateral, y la que no se desliza no se lee.
 */
const largas = Object.entries(GUIONES).filter(([, g]) => (g.esencia?.length ?? 0) > 620);
if (largas.length === 0) console.log('  ✓ ninguna lección se pasa del recuadro');
else for (const [codigo, g] of largas) mal(`${codigo}: la lección tiene ${g.esencia.length} letras y no entra en el recuadro`);

console.log('\n── el guión de grabación está completo ──');
for (const [codigo, g] of Object.entries(GUIONES)) {
  if (!g.guion?.trim()) mal(`${codigo}: no tiene guión para grabar`);
  if (!g.proposito?.trim()) mal(`${codigo}: no dice qué movimiento produce`);
}
if (fallas === 0) console.log(`  ✓ los ${Object.keys(GUIONES).length} guiones tienen su propósito y su texto`);

console.log(fallas === 0 ? '\n✓ ninguna jornada llega sin su enseñanza\n' : `\n✗ ${fallas} fallas\n`);
process.exit(fallas === 0 ? 0 : 1);
