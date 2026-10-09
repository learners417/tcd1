/**
 * Pruebas del cuadro de validación por escalón de servicio.
 *
 * La más importante es la primera: que ningún id de las listas sea inventado.
 * Son cadenas de texto — el compilador no las verifica, y un id que no existe
 * hace que un ítem quede mal repartido sin que nadie se entere. Al construir
 * esto inventé 41 de 47 y compilaba perfecto.
 *
 * La segunda más importante es la del final: que el servicio NO se derive del
 * plan de acceso. Ese puente existió, y hacía que un cliente de $497 figurara
 * con $5.000 de instalación contratada.
 *
 * Correr con: npx tsx scripts/prueba-cuadro.ts
 */
import { readFileSync } from 'node:fs';
import { STEPS, SECTIONS } from '../src/lib/preactivacionSteps';
import {
  TICKETS, CIMA, cuadroDe, resumirCuadro, marcarBloques, bloquesDisponibles,
  avanceDe, servicioDe, type Ticket,
} from '../src/lib/cuadroTickets';

let fallas = 0;
const linea = (ok: boolean, txt: string) => {
  if (!ok) fallas++;
  console.log(`${ok ? '✓' : '✗'} ${txt}`);
};

const REALES = new Set(STEPS.map((s) => s.id));
const TODOS: Ticket[] = ['base', 'ascenso', 'instalacion'];

// ── 1 · Ningún id inventado ────────────────────────────────────────────────
console.log('══ los ids son reales ══');
const fuente = readFileSync('src/lib/cuadroTickets.ts', 'utf-8');
const enListas = [...fuente.matchAll(/^\s+'([a-z0-9_]+)',/gm)].map((m) => m[1]);
const inventados = enListas.filter((id) => !REALES.has(id));
linea(inventados.length === 0,
  inventados.length === 0
    ? `los ${enListas.length} ids de las listas existen en preactivacionSteps`
    : `IDS INVENTADOS: ${inventados.join(', ')}`);

// ── 2 · Los tres escalones ─────────────────────────────────────────────────
console.log('\n══ los tres escalones ══');
linea(TODOS.every((t) => TICKETS[t].criterio.length > 40),
  'cada escalón tiene su criterio escrito, no solo un precio');
linea(TODOS.every((t) => TICKETS[t].incluye.length > 40),
  'y dice qué incluye, como se le dijo al cliente');
linea(TICKETS.base.precio === 1000 && TICKETS.ascenso.precio === 3000
   && TICKETS.instalacion.precio === 5000,
  'los precios son los que se venden: 1.000 · 3.000 · 5.000');
linea(TICKETS.base.precio < TICKETS.ascenso.precio
   && TICKETS.ascenso.precio < TICKETS.instalacion.precio,
  'y están en orden');
linea(CIMA.precio === 5000 && CIMA.dias === 5,
  'La Cima son 5 días y 5.000 USD, y se suma aparte');
linea(!Object.values(TICKETS).some((d) => 'conDireccion' in d),
  'ya no hay «sesiones de dirección»: era un campo que el código nunca usaba');

for (const t of TODOS) {
  const r = resumirCuadro(t);
  console.log(`  ${t.padEnd(12)} ${r.total} ítems · cliente ${r.delCliente} · equipo ${r.delEquipo} · juntos ${r.compartidos}`);
}

// ── 3 · La Base: va solo, con tutoriales ───────────────────────────────────
console.log('\n══ La Base ══');
const base = cuadroDe('base');
const aplicanBase = base.filter((i) => !i.noAplica);
linea(aplicanBase.length < STEPS.length,
  `no se le muestran los ${STEPS.length - aplicanBase.length} ítems que necesitan a un instalador`);
linea(aplicanBase.every((i) => i.loHace === 'el cliente'),
  'todo lo que le queda lo hace él: no hay tareas huérfanas esperando a nadie');
linea(base.filter((i) => i.noAplica).some((i) => i.id === 'm_portafolio'),
  'el portafolio de Meta no le aplica: su campaña corre sin uno propio');
linea(base.filter((i) => i.noAplica).some((i) => i.id === 'dominio'),
  'ni el dominio: su landing va dentro de la app');
linea(aplicanBase.filter((i) => i.conTutorial).length > 20,
  `${aplicanBase.filter((i) => i.conTutorial).length} de sus ítems tienen paso a paso`);

// ── 4 · El Ascenso: lo construyen juntos ───────────────────────────────────
console.log('\n══ El Ascenso ══');
const ascenso = cuadroDe('ascenso');
linea(ascenso.every((i) => !i.noAplica),
  `le aplican los ${ascenso.length} ítems: en 90 días se instala todo`);
linea(ascenso.filter((i) => i.loHace === 'el equipo').length === 0,
  'ninguno lo hace el equipo solo — si lo hiciera, dejaría de ser una mentoría');
linea(ascenso.filter((i) => i.loHace === 'los dos').length > 20,
  `${ascenso.filter((i) => i.loHace === 'los dos').length} se hacen juntos en la grupal`);
linea(ascenso.filter((i) => i.loHace === 'el cliente').length > 5,
  'y lo suyo sigue siendo suyo');
linea(aplicanBase.length < ascenso.length,
  've más que el de La Base, que es parte de lo que pagó');

// ── 5 · La Instalación: la monta el equipo ─────────────────────────────────
console.log('\n══ La Instalación ══');
const inst = cuadroDe('instalacion');
linea(inst.every((i) => !i.noAplica), `ve los ${inst.length} ítems, sin recortes`);
linea(inst.filter((i) => i.loHace === 'el equipo').length > 30,
  'y la mayoría los hace el equipo, que es lo que compró');
linea(inst.filter((i) => i.loHace === 'el cliente').length > 5,
  'pero su método y su voz siguen siendo suyos');

// ── 6 · Los clientes de antes de la app ────────────────────────────────────
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

// ── 7 · El avance cuenta solo lo que aplica ────────────────────────────────
console.log('\n══ el avance ══');
const hechos = new Set(yaTiene.hechos);
const avBase = avanceDe('base', hechos);
const avInst = avanceDe('instalacion', hechos);
linea(avBase.total < avInst.total,
  `La Base tiene ${avBase.total} ítems y La Instalación ${avInst.total}`);
linea(avBase.pct > avInst.pct,
  `con lo mismo hecho, La Base va ${avBase.pct}% y La Instalación ${avInst.pct}% — el porcentaje cuenta solo lo que le aplica`);
linea(avanceDe('base', new Set()).pct === 0, 'sin nada hecho va en cero');
linea(avanceDe('base', new Set(STEPS.map((s) => s.id))).pct === 100,
  'con todo hecho va en cien, sin pasarse');

// ── 8 · El servicio NO se deriva del plan de acceso ────────────────────────
console.log('\n══ las dos escaleras, separadas ══');
linea(!/TICKET_DE_PLAN/.test(fuente),
  'el puente plan → ticket ya no existe: era lo que hacía figurar a un cliente de $497 con $5.000 de instalación');

// Los colores pueden quedar nombrados en los comentarios —ahí explican por qué
// se quitó el puente— pero no en una línea que se ejecute.
const codigo = fuente
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\/\/.*$/gm, '');
linea(!/verde|negro|blanco|amarillo/.test(codigo),
  'y ningún color del plan de acceso aparece en el código que corre');
linea(servicioDe('ascenso') === 'ascenso' && servicioDe('instalacion') === 'instalacion',
  'lo que está marcado se respeta');
linea(servicioDe('verde') === 'base' && servicioDe('negro') === 'base',
  'un color del plan de acceso NO compra servicio: cae en el más bajo');
linea(servicioDe(null) === 'base' && servicioDe(undefined) === 'base'
   && servicioDe('') === 'base' && servicioDe('inventado') === 'base',
  'sin marcar, o con un valor raro, cae en el más bajo — nunca en el más alto');

const mig = readFileSync('supabase/migrations/20261009_servicio_contratado.sql', 'utf-8');
linea(/default 'base'/.test(mig),
  'y en la base todos arrancan en el más bajo hasta que alguien los marque');
linea(/admin_rol in \('owner', 'manager', 'staff'\)/.test(mig),
  'solo el equipo puede marcarlo');
linea(/servicio_marcado_por/.test(mig) && /servicio_marcado_el/.test(mig),
  'y queda registrado quién lo marcó y cuándo: es una decisión de plata');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
