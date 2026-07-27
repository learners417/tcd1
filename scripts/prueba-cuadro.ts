/**
 * Pruebas del cuadro de validación por ticket.
 *
 * La más importante es la primera: que ningún id de las listas sea inventado.
 * Son cadenas de texto — el compilador no las verifica, y un id que no existe
 * hace que un ítem quede mal repartido sin que nadie se entere. Al construir
 * esto inventé 41 de 47 y compilaba perfecto.
 *
 * Correr con: npx tsx scripts/prueba-cuadro.ts
 */
import { readFileSync } from 'node:fs';
import { STEPS, SECTIONS } from '../src/lib/preactivacionSteps';
import {
  TICKETS, cuadroDe, resumirCuadro, marcarBloques, bloquesDisponibles, avanceDe,
  type Ticket,
} from '../src/lib/cuadroTickets';

let fallas = 0;
const linea = (ok: boolean, txt: string) => {
  if (!ok) fallas++;
  console.log(`${ok ? '✓' : '✗'} ${txt}`);
};

const REALES = new Set(STEPS.map((s) => s.id));
const TODOS: Ticket[] = ['mil', 'dos_mil', 'cinco_mil', 'diez_mil'];

// ── 1 · Ningún id inventado ────────────────────────────────────────────────
console.log('══ los ids son reales ══');
const fuente = readFileSync('src/lib/cuadroTickets.ts', 'utf-8');
const enListas = [...fuente.matchAll(/^\s+'([a-z0-9_]+)',/gm)].map((m) => m[1]);
const inventados = enListas.filter((id) => !REALES.has(id));
linea(inventados.length === 0,
  inventados.length === 0
    ? `los ${enListas.length} ids de las listas existen en preactivacionSteps`
    : `IDS INVENTADOS: ${inventados.join(', ')}`);

// ── 2 · Los cuatro tickets ─────────────────────────────────────────────────
console.log('\n══ los cuatro tickets ══');
linea(TODOS.every((t) => TICKETS[t].criterio.length > 40),
  'cada ticket tiene su criterio escrito, no solo un precio');
linea(TICKETS.mil.precio < TICKETS.dos_mil.precio
   && TICKETS.dos_mil.precio < TICKETS.cinco_mil.precio
   && TICKETS.cinco_mil.precio < TICKETS.diez_mil.precio,
  'los precios están en orden');
linea(!TICKETS.mil.conDireccion && !TICKETS.dos_mil.conDireccion
   && TICKETS.diez_mil.conDireccion,
  'solo el de $10.000 tiene sesiones de dirección');

for (const t of TODOS) {
  const r = resumirCuadro(t);
  console.log(`  ${t.padEnd(10)} ${r.total} ítems · cliente ${r.delCliente} · equipo ${r.delEquipo} · juntos ${r.compartidos}`);
}

// ── 3 · Lo que el cliente solo NO puede hacer ──────────────────────────────
console.log('\n══ el que va solo ══');
const mil = cuadroDe('mil');
const aplicanMil = mil.filter((i) => !i.noAplica);
linea(aplicanMil.length < STEPS.length,
  `al de $1.000 no se le muestran los ${STEPS.length - aplicanMil.length} ítems que necesitan a un instalador`);
linea(aplicanMil.every((i) => i.loHace === 'el cliente'),
  'todo lo que le queda lo hace él: no hay tareas huérfanas esperando a nadie');
linea(mil.filter((i) => i.noAplica).some((i) => i.id === 'm_portafolio'),
  'el portafolio de Meta no le aplica: su campaña corre sin uno propio');
linea(mil.filter((i) => i.noAplica).some((i) => i.id === 'dominio'),
  'ni el dominio: su landing va dentro de la app');
linea(aplicanMil.filter((i) => i.conTutorial).length > 20,
  `${aplicanMil.filter((i) => i.conTutorial).length} de sus ítems tienen paso a paso`);

console.log('\n══ el de $2.000 ══');
const dos = cuadroDe('dos_mil').filter((i) => !i.noAplica);
const revisados = dos.filter((i) => i.loHace === 'los dos');
linea(revisados.length === 4,
  `el equipo revisa ${revisados.length} puntos: ${revisados.map((i) => i.id).join(', ')}`);
linea(cuadroDe('mil').filter((i) => !i.noAplica).length === dos.length,
  've los mismos ítems que el de $1.000 — lo que cambia es quién los revisa');

console.log('\n══ la instalación acompañada ══');
const cinco = cuadroDe('cinco_mil');
linea(cinco.every((i) => !i.noAplica), `ve los ${cinco.length} ítems, sin recortes`);
linea(cinco.filter((i) => i.loHace === 'el equipo').length > 30,
  'y la mayoría los hace el equipo, que es lo que compró');
linea(cinco.filter((i) => i.loHace === 'el cliente').length > 5,
  'pero su método y su voz siguen siendo suyos');

// ── 4 · Los clientes de antes de la app ────────────────────────────────────
console.log('\n══ el que viene de antes ══');
const bloques = bloquesDisponibles();
linea(bloques.length === SECTIONS.length, `hay ${bloques.length} bloques para marcar`);
linea(bloques.every((b) => b.cuantos > 0 && b.titulo.length > 3),
  'cada bloque dice cuántos ítems trae y cómo se llama');
linea(!bloques[0].titulo.startsWith('1'),
  'sin el número adelante, que ya lo dice el orden');

const yaTiene = marcarBloques(['perfil', 'metodo']);
linea(yaTiene.hechos.length === 13,
  `marcar perfil y método deja ${yaTiene.hechos.length} ítems resueltos de una`);
linea(yaTiene.hechos.every((id) => REALES.has(id)),
  'y todos son ítems reales');
linea(marcarBloques([]).hechos.length === 0, 'sin bloques no marca nada');
linea(marcarBloques(['inventado']).hechos.length === 0,
  'un bloque que no existe no rompe');

// ── 5 · El avance cuenta solo lo que aplica ────────────────────────────────
console.log('\n══ el avance ══');
const hechos = new Set(yaTiene.hechos);
const avMil = avanceDe('mil', hechos);
const avCinco = avanceDe('cinco_mil', hechos);
linea(avMil.total < avCinco.total,
  `el de $1.000 tiene ${avMil.total} ítems y el de $5.000 ${avCinco.total}`);
linea(avMil.pct > avCinco.pct,
  `con lo mismo hecho, el de $1.000 va ${avMil.pct}% y el de $5.000 ${avCinco.pct}% — el porcentaje cuenta solo lo que le aplica`);
linea(avanceDe('mil', new Set()).pct === 0, 'sin nada hecho va en cero');
linea(avanceDe('mil', new Set(STEPS.map((s) => s.id))).pct === 100,
  'con todo hecho va en cien, sin pasarse');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
