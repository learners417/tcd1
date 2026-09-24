/**
 * prueba-ya-tienes.ts — el punto de partida personaliza, no saltea.
 *
 * Javo lo pidió así: con la agenda llena o empezando de cero, todos pasan por
 * el plan completo. Lo que ya tienen se revisa contra la vara, en una jornada
 * corta. Antes la app daba por hechas hasta ochenta jornadas.
 */
import { readFileSync } from 'node:fs';
import { YA_TIENES, codigosEnRevision, diasEnRevision, revisionDelDia, pasosDeRevision, proximoLunes } from '../src/lib/yaTienes';
import { SEED_ROADMAP_V2 } from '../src/lib/roadmapSeed';
import { rubricaDe } from '../src/lib/rubricas';

let fallas = 0;
const ok = (c: boolean, m: string, d = '') => { console.log(`${c ? '✓' : '✗'} ${m}${c || !d ? '' : ' — ' + d}`); if (!c) fallas++; };

const metas = SEED_ROADMAP_V2.flatMap((p) => p.metas);

console.log('\n── lo que ya tiene ──');
ok(YA_TIENES.length >= 10, `hay ${YA_TIENES.length} cosas que puede traer hechas`);
const sinJornada = YA_TIENES.filter((c) => !metas.some((m) => m.dia_asignado === c.dia));
ok(sinJornada.length === 0, 'cada una apunta a una jornada que existe', sinJornada.map((c) => c.id).join(', '));
// Cada revisión tiene con qué medirse: la rúbrica del Crítico cuando es texto,
// y una lista de comprobación cuando es una página, una agenda o una campaña.
const sinCriterio = YA_TIENES.filter((c) => {
  const m = metas.find((x) => x.dia_asignado === c.dia);
  return !(m && rubricaDe(m.codigo)) && !c.comprueba?.length;
});
ok(sinCriterio.length === 0, 'cada revisión tiene con qué medirse', sinCriterio.map((c) => c.id).join(', '));
const comprobables = YA_TIENES.filter((c) => c.comprueba?.length);
ok(comprobables.every((c) => (c.comprueba ?? []).length === 3), 'las listas de comprobación son de tres puntos');

console.log('\n── la revisión ──');
const ids = YA_TIENES.map((c) => c.id);
ok(diasEnRevision(ids).size === YA_TIENES.length, 'el que ya tiene todo pone todas esas jornadas en revisión');
ok(codigosEnRevision(ids).size === YA_TIENES.length, 'cada día en revisión resuelve a su código de hoy');
const cosa = revisionDelDia(YA_TIENES[0].dia, ids)!;
ok(Boolean(cosa), 'la jornada sabe qué se revisa ese día');
ok(pasosDeRevision(cosa).length >= 3 && pasosDeRevision(cosa).length <= 5, 'la revisión son tres pasos: mirar, medir y corregir');
ok(pasosDeRevision(cosa).some((p) => /corrige/i.test(p)), 'y termina corrigiendo, no solo mirando');

console.log('\n── nadie se saltea el Camino ──');
const roadmap = readFileSync('src/pages/Roadmap.tsx', 'utf8');
ok(!/onMarcar=/.test(roadmap), 'el punto de partida ya no marca jornadas como hechas');
ok(/codigosEnRevision/.test(roadmap), 'el Camino sabe cuáles van en revisión');
const partida = readFileSync('src/components/PuntoDePartida.tsx', 'utf8');
ok(/Empezar el día 1/.test(partida), 'todos arrancan el día 1');
ok(!/jornadasHasta/.test(partida), 'la pantalla no arrastra días por delante');

console.log('\n── el arranque es un lunes ──');
for (const d of ['2026-09-24', '2026-09-28', '2026-10-03']) {
  const lunes = proximoLunes(new Date(d + 'T12:00:00'));
  const dia = new Date(lunes + 'T12:00:00').getDay();
  ok(dia === 1, `desde el ${d} el Camino arranca el ${lunes}`);
}

console.log(fallas === 0 ? '\n✓ TODO EN VERDE\n' : `\n✗ ${fallas} FALLAS\n`);
process.exit(fallas === 0 ? 0 : 1);
