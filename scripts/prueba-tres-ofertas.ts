/**
 * LAS TRES OFERTAS, CARGABLES SIN ERRORES.
 *
 * ═══ QUÉ SE PROTEGE ═══
 *
 *   1. El alta sellaba el escalón con un update directo, así que un alta en
 *      La Base quedaba SIN MARCAR —el valor es el mismo que el default— y el
 *      cliente abría los 90 días completos. Justo el caso del que paga la
 *      primera etapa.
 *   2. Elegir entre tres nombres sin ver qué le abre a la persona.
 *   3. El de El Ascenso monta todo él, y el día de cada tutorial estaba a mano
 *      y desfasado en 14 de los 21: al que publicaba su página el día 16 no le
 *      aparecía ningún paso a paso.
 *   4. Dos tutoriales grabados que ninguna jornada pedía, así que el cliente
 *      no se enteraba nunca de que existían.
 *
 * Correr con: npx tsx scripts/prueba-tres-ofertas.ts
 */
import { readFileSync } from 'node:fs';
import { TICKETS, type Ticket } from '../src/lib/cuadroTickets';
import { loQueAbre, enUnaLinea } from '../src/lib/queAbreCadaOferta';
import {
  LO_QUE_MONTA, deQuienEsElTrabajo, montaEnElDia, quienMonta,
} from '../src/lib/construyeSolo';
import { ULTIMO_DIA_DE_BASE } from '../src/lib/topeDelEscalon';

let fallas = 0;
const ok = (c: boolean, q: string) => { console.log(c ? `✓ ${q}` : `✗ ${q}`); if (!c) fallas++; };
const codigoDe = (r: string) =>
  readFileSync(r, 'utf-8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const seed = JSON.parse(readFileSync('src/lib/roadmap.seed.json', 'utf-8')) as {
  tutoriales: Array<{ codigo: string; titulo: string; dia: number }>;
  jornadas: Array<{ dia: number; titulo: string; tutoriales: string[] }>;
};
const LOS_TRES: Ticket[] = ['base', 'ascenso', 'instalacion'];

// ── 1 · Las tres ofertas, con sus nombres de montaña ──────────────────────
console.log('══ las tres ofertas ══');
ok(LOS_TRES.every((t) => TICKETS[t].nombre && TICKETS[t].precio > 0),
  `son tres con nombre y precio: ${LOS_TRES.map((t) => `${TICKETS[t].nombre} ${TICKETS[t].precio}`).join(' · ')}`);
ok(TICKETS.base.precio < TICKETS.ascenso.precio && TICKETS.ascenso.precio < TICKETS.instalacion.precio,
  'y en orden de precio');
ok(quienMonta('instalacion') === 'el equipo'
  && quienMonta('ascenso') === 'tú' && quienMonta('base') === 'tú',
  'lo técnico lo monta el equipo solo en La Instalación: en los otros dos lo montan ellos');
ok(/mentoría/i.test(TICKETS.ascenso.criterio),
  'y el criterio de El Ascenso lo dice: si el equipo lo hace por él, dejó de ser una mentoría');

// ── 2 · Qué abre cada una ─────────────────────────────────────────────────
console.log('\n══ qué abre cada una ══');
for (const t of LOS_TRES) {
  const a = loQueAbre(t);
  ok(Boolean(a.camino && a.monta && a.entregas),
    `${TICKETS[t].nombre}: dice su Camino, quién monta y si el equipo recibe tareas`);
}
ok(loQueAbre('base').camino.includes(String(ULTIMO_DIA_DE_BASE)),
  `La Base nombra su último día (${ULTIMO_DIA_DE_BASE}), que sale de la constante y no de un número escrito`);
ok(/90 días completos/.test(loQueAbre('ascenso').camino)
  && /90 días completos/.test(loQueAbre('instalacion').camino),
  'y las dos de arriba abren los 90 días');
ok(/El equipo recibe/.test(loQueAbre('instalacion').entregas)
  && /no recibe tareas/.test(loQueAbre('ascenso').entregas),
  'las entregas son de La Instalación: El Ascenso las hace él');
const textos = LOS_TRES.map((t) => `${enUnaLinea(t)} ${deQuienEsElTrabajo(t)}`).join(' ');
ok(!/gente/i.test(textos), 'nunca «gente»');
ok(!/no incluye|no tiene|sin acceso|le falta/i.test(textos),
  'y en positivo: se dice lo que SÍ abre, nunca lo que no');

// ── 3 · El alta marca el escalón de verdad ────────────────────────────────
console.log('\n══ el alta ══');
const admin = codigoDe('src/pages/Admin.tsx');
ok(/rpc\('marcar_servicio'/.test(admin),
  'el alta marca el escalón con el RPC, que sella quién y cuándo');
ok(!/servicio_contratado: nuevoForm\.servicio/.test(admin),
  'y ya no lo escribe en el update: así quedaba sin marcar cuando elegían La Base, que es el default');
ok(/loQueAbre\(nuevoForm\.servicio\)/.test(admin),
  'y debajo del selector se lee qué le abre lo que acaba de elegir');
ok(/TICKETS\[nuevoForm\.servicio\]\.criterio/.test(admin),
  'con el criterio del escalón, que es la frase que ordena el trabajo con esa persona');

// ── 4 · Cada tutorial en el día de su jornada ─────────────────────────────
console.log('\n══ los tutoriales, en el día que se usan ══');
const diaDeLaJornada = new Map<string, number>();
for (const j of [...seed.jornadas].sort((a, b) => a.dia - b.dia)) {
  for (const c of j.tutoriales) if (!diaDeLaJornada.has(c)) diaDeLaJornada.set(c, j.dia);
}
const desfasados = seed.tutoriales.filter((t) => diaDeLaJornada.get(t.codigo) !== t.dia);
ok(desfasados.length === 0,
  `los ${seed.tutoriales.length} tutoriales dicen el día de la jornada que los pide (desfasados: ${desfasados.map((t) => t.codigo).join(', ') || 'ninguno'})`);
const huerfanos = seed.tutoriales.filter((t) => !diaDeLaJornada.has(t.codigo));
ok(huerfanos.length === 0,
  `ninguno queda sin jornada que lo pida: la app los busca por día, y uno sin jornada no se ve nunca (${huerfanos.map((t) => t.codigo).join(', ') || 'ninguno'})`);

const gen = readFileSync('tcd-spec/datos/generar_seed.py', 'utf-8');
ok(/DIA_DEL_TUTORIAL/.test(gen),
  'el día sale calculado de las jornadas, no de un número a mano en la tabla');
ok(/Tutoriales que ninguna jornada pide/.test(gen),
  'y el generador se niega a escribir el seed si alguno queda huérfano');

// ── 5 · Lo que monta él ───────────────────────────────────────────────────
console.log('\n══ lo que monta él ══');
ok(LO_QUE_MONTA.length === 3, 'tres grupos, uno por cada entrega que el equipo haría');
ok(LO_QUE_MONTA.every((x) => x.piezas.length >= 3 && x.queda.trim()),
  'cada grupo trae sus piezas y qué queda andando cuando están');

const codigosReales = new Set(seed.tutoriales.map((t) => t.codigo));
const inventados = LO_QUE_MONTA
  .flatMap((x) => x.piezas.flatMap((p) => p.tutoriales))
  .filter((c) => !codigosReales.has(c));
ok(inventados.length === 0,
  `ningún código de tutorial inventado (${inventados.join(', ') || 'ninguno'})`);

const malUbicadas = LO_QUE_MONTA.flatMap((x) => x.piezas)
  .flatMap((p) => p.tutoriales.map((c) => ({ c, pide: p.dia, esta: diaDeLaJornada.get(c) })))
  .filter((x) => x.pide !== x.esta);
ok(malUbicadas.length === 0,
  `cada pieza cae en el día donde está su tutorial (${malUbicadas.map((x) => `${x.c}:${x.pide}≠${x.esta}`).join(' ') || 'todas'})`);

ok(montaEnElDia(11) !== null && montaEnElDia(7) === null,
  'los grupos se piden por el día de la entrega');
ok(/mentoría/i.test(deQuienEsElTrabajo('ascenso'))
  && /equipo/.test(deQuienEsElTrabajo('instalacion')),
  'y lo que lee cada uno es distinto: el de El Ascenso lo lleva a la mentoría');

// ── 6 · El panel está conectado ───────────────────────────────────────────
console.log('\n══ y lo ve en su Camino ══');
const road = codigoDe('src/pages/Roadmap.tsx');
const panel = codigoDe('src/components/camino/QuienMonta.tsx');
ok(/<QuienMonta/.test(road), 'el Camino dibuja el panel de quién monta');
ok(/servicioMarcadoEl=\{perfil\?\.servicio_marcado_el\}/.test(road),
  'y le pasa la marca: sin escalón marcado no se afirma nada');
ok(/estaMarcado\(servicioMarcadoEl\)/.test(panel) && /return null/.test(panel),
  'el panel se calla si nadie marcó: decirle «lo montas tú» a quien compró La Instalación es peor que no decir nada');
ok(/LO_QUE_MONTA\.slice\(0, 1\)/.test(panel),
  'en La Base solo muestra el primer grupo: su Camino cierra en el día 12 y no llega a los otros');
ok(/tutorialPorCodigo/.test(panel),
  'y los nombres de los tutoriales salen del seed, no escritos de nuevo acá');
ok(/onIrAlDia/.test(panel) && /codigoDelDia\(dia\)/.test(road),
  'tocar un día lleva a esa jornada: un panel que informa y no lleva a ninguna parte es una nota');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
