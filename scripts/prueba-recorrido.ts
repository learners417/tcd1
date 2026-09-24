/**
 * prueba-recorrido.ts — un cliente del día 1 al 90, sin callejones.
 *
 * Recorre el Camino como lo recorre una persona: día por día, mirando que
 * siempre haya algo que hacer, que cada jornada se pueda terminar, que los
 * grados se ganen con evidencia y que los entrenadores se abran cuando toca.
 *
 * Es la prueba que reemplaza a hacer los noventa días a mano.
 *
 * Uso: npx tsx scripts/prueba-recorrido.ts
 */
import { SEED_ROADMAP_V2, roadmap } from '../src/lib/roadmapSeed';
import { cinturonDesdeProgreso, CINTURONES } from '../src/lib/cinturones';
import { esPasoDelCliente } from '../src/lib/diaPrograma';
import { setFamiliaActual, VOC, TOKEN_CRUDO } from '../src/lib/vocabulario';

setFamiliaActual('Coach');

let fallas = 0;
function ok(cond: boolean, msg: string, detalle = '') {
  console.log(`${cond ? '✓' : '✗'} ${msg}${cond || !detalle ? '' : ' — ' + detalle}`);
  if (!cond) fallas++;
}

const metas = SEED_ROADMAP_V2.flatMap((p) => p.metas.map((m) => ({ ...m, pilar: p.numero })));
const porDia = new Map<number, typeof metas>();
for (const m of metas) {
  const d = m.dia_asignado;
  if (d === null || d === undefined) continue;
  porDia.set(d, [...(porDia.get(d) ?? []), m]);
}

console.log('\n── el recorrido, día por día ──');

const sinNada: number[] = [];
const sinCerrar: number[] = [];
const conTokens: string[] = [];
for (let dia = 1; dia <= 90; dia++) {
  const delDia = (porDia.get(dia) ?? []).filter(esPasoDelCliente);
  if (delDia.length === 0) { sinNada.push(dia); continue; }
  for (const m of delDia) {
    // Toda jornada dice qué te llevas y qué devuelve al terminar.
    if (!m.descripcion || !(m as { veredicto?: string }).veredicto) sinCerrar.push(dia);
    // Nada que el cliente lea puede tener un token sin reemplazar.
    for (const texto of [m.titulo, m.descripcion, ...(m.pasos ?? []), m.evidencia_requerida?.pide ?? '']) {
      if (TOKEN_CRUDO.test(VOC(texto))) conTokens.push(`día ${dia}: ${texto.slice(0, 40)}`);
    }
  }
}
// Los días de campo y los fines de semana quedan sin jornada a propósito: se
// atiende y se descansa. Lo que no puede pasar es que falte una semana entera.
const semanasVacias = [...Array(13).keys()].filter((w) =>
  [1, 2, 3, 4, 5, 6, 7].every((i) => sinNada.includes(w * 7 + i)));
ok(semanasVacias.length === 0, `${90 - sinNada.length} días con jornada y ${sinNada.length} de campo`,
   `semanas sin nada: ${semanasVacias.map((w) => w + 1).join(', ')}`);
ok(sinCerrar.length === 0, 'toda jornada dice qué te llevas y qué devuelve', `días: ${[...new Set(sinCerrar)].join(', ')}`);
ok(conTokens.length === 0, 'ningún texto llega al cliente con un token sin reemplazar', conTokens[0] ?? '');

console.log('\n── terminar cada jornada ──');
// Los días de atender y los de espera no piden trabajo en la app: se miden aparte.
const esDeAtender = (m: { tipo_jornada?: string | null }) =>
  ['campo', 'espera', 'entrega_tecnica', 'cierre'].includes(m.tipo_jornada ?? '');
const conTrabajo = metas.filter((m) => esPasoDelCliente(m) && !['CAMPO', 'ENTREGA'].includes(m.tipo) && !esDeAtender(m));
const sinSalida = conTrabajo.filter((m) => (m.pasos ?? []).length === 0 && !m.evidencia_requerida?.pide);
ok(sinSalida.length === 0, `las ${conTrabajo.length} jornadas con trabajo tienen paso a paso o evidencia`,
   sinSalida.map((m) => m.dia_asignado).join(', '));
const largas = conTrabajo.filter((m) => (m.pasos ?? []).length > 5);
ok(largas.length === 0, 'ninguna jornada pasa de cinco pasos', largas.map((m) => m.dia_asignado).join(', '));

console.log('\n── los grados se ganan con evidencia ──');
const completadas = new Set<string>();
const gradosGanados: string[] = [];
for (let dia = 1; dia <= 90; dia++) {
  for (const m of (porDia.get(dia) ?? []).filter(esPasoDelCliente)) {
    completadas.add(`${m.pilar}-${m.codigo}`);
    if (m.cinturon) gradosGanados.push(m.cinturon);
  }
  const grado = cinturonDesdeProgreso(completadas);
  if (dia === 90) {
    ok(grado.id === '1dan', `al día 90, con todo hecho, el grado es ${grado.nombre}`);
  }
}
ok(new Set(gradosGanados).size === gradosGanados.length && gradosGanados.length === CINTURONES.length,
   `los ${CINTURONES.length} grados se otorgan una sola vez cada uno`,
   `otorgados: ${gradosGanados.length}`);
const sinEvidencia = metas.filter((m) => m.cinturon && !m.evidencia_requerida?.nombre);
ok(sinEvidencia.length === 0, 'ningún grado se otorga sin evidencia', sinEvidencia.map((m) => m.codigo).join(', '));

console.log('\n── los entrenadores se abren cuando toca ──');
const diasDeAgente = new Map<string, number>();
for (const m of metas) {
  const a = (m as { agente?: string | null }).agente;
  const d = m.dia_asignado;
  if (!a || d === null || d === undefined) continue;
  if (!diasDeAgente.has(a) || d < (diasDeAgente.get(a) ?? 999)) diasDeAgente.set(a, d);
}
for (const ag of roadmap.agentes) {
  const primero = diasDeAgente.get(ag.id);
  ok(primero !== undefined && primero <= ag.dia_estimado + 7,
     `${ag.nombre} aparece en el Camino cerca de su día (${ag.dia_estimado})`,
     primero === undefined ? 'no aparece nunca' : `aparece el día ${primero}`);
}

console.log('\n── la carga es humana ──');
const minutosPorSemana: number[] = [];
for (let semana = 0; semana < 13; semana++) {
  let min = 0;
  for (let dia = semana * 7 + 1; dia <= semana * 7 + 7 && dia <= 90; dia++) {
    for (const m of (porDia.get(dia) ?? []).filter(esPasoDelCliente)) {
      min += parseInt(m.tiempo_estimado || '0', 10) || 0;
    }
  }
  minutosPorSemana.push(min);
}
const peor = Math.max(...minutosPorSemana);
ok(peor <= 600, `la semana más cargada son ${Math.round(peor / 60 * 10) / 10} horas`, `${peor} minutos`);
ok(minutosPorSemana.every((m) => m >= 30), 'ninguna semana queda vacía',
   `mínimo: ${Math.min(...minutosPorSemana)} minutos`);

console.log(fallas === 0 ? '\n✓ EL RECORRIDO COMPLETO PASA\n' : `\n✗ ${fallas} FALLAS EN EL RECORRIDO\n`);
process.exit(fallas === 0 ? 0 : 1);
