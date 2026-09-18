/**
 * prueba-dia-vocabulario.ts — los dos errores de las capturas del 15 sep 2026.
 *
 * 1. EL DÍA: la misma pantalla decía "Día 17" y "Día 71 de 90 · vas 59 días
 *    atrás". Tres fuentes, y el conteo de atraso miraba si HOY era fin de semana.
 * 2. EL VOCABULARIO: el cliente leyó "Elige el dolor central de {{tu_consultante}}".
 *
 * Correr: npx tsx scripts/prueba-dia-vocabulario.ts
 */
import {
  diaDelPrograma, semanaDelPrograma, diasHabilesDeAtraso,
  estaEnFaseAutonomia, mensajeDeRitmo, fechaLocal,
  esPasoDelCliente, pilarAlcanzado, primerDiaDelPilar,
} from '../src/lib/diaPrograma';
import { SEED_ROADMAP_V2 } from '../src/lib/roadmapSeed';
import { opcionesDePartida, jornadasHasta, resumenDePartida, diaDeLaOpcion } from '../src/lib/puntoDePartida';
import { cinturonDesdeProgreso } from '../src/lib/cinturones';
import { HERRAMIENTAS, HERRAMIENTAS_V3, getHerramienta, herramientasV3 } from '../src/lib/herramientas';
import { SESIONES_GUIADAS, sesionGuiadaDe } from '../src/lib/sesionesGuiadas';
import { setFamiliaActual, getFamiliaActual, TOKEN_CRUDO, vocabularizar } from '../src/lib/vocabulario';

let fallas = 0;
function ok(cond: boolean, msg: string) {
  if (cond) console.log(`✓ ${msg}`);
  else { fallas++; console.log(`✗ ${msg}`); }
}

// ── 1. El día ─────────────────────────────────────────────────────────────
console.log('\n── el día del programa ──');
const inicio = '2026-07-07'; // martes
const hoy = new Date(2026, 8, 15, 12); // martes 15 sep 2026, mediodía
ok(diaDelPrograma(inicio, hoy) === 71, `inicio 7 jul, hoy 15 sep → día 71 (dio ${diaDelPrograma(inicio, hoy)})`);
ok(diaDelPrograma(inicio, new Date(2026, 6, 7, 0, 5)) === 1, 'el mismo día de inicio es el día 1');
ok(diaDelPrograma(inicio, new Date(2026, 6, 7, 23, 30)) === 1, 'a las 23:30 del día de inicio sigue siendo el día 1 (antes saltaba por UTC)');
ok(diaDelPrograma(inicio, new Date(2026, 6, 6)) === 1, 'antes de empezar no da cero ni negativo');
ok(diaDelPrograma(inicio, new Date(2027, 0, 1)) === 90, 'después del programa topea en 90');
ok(diaDelPrograma(null) === null && diaDelPrograma('') === null && diaDelPrograma('basura') === null, 'sin fecha válida devuelve null, no inventa un día');
ok(diaDelPrograma('2026-07-07T03:00:00.000Z', hoy) === 71, 'acepta el ISO completo igual que la fecha corta');
ok(semanaDelPrograma(inicio, 13, hoy) === 11, `día 71 → semana 11 (dio ${semanaDelPrograma(inicio, 13, hoy)})`);
ok(fechaLocal('2026-07-07')?.getDate() === 7, 'la fecha corta se lee local, no UTC');

console.log('\n── el atraso hábil ──');
// Días 12 → 71: del 18 jul (sáb) al 15 sep. Se cuentan solo lunes a viernes.
const esperado = (() => { let n = 0; for (let d = 13; d <= 71; d++) { const f = new Date(2026, 6, 7 + d - 1).getDay(); if (f !== 0 && f !== 6) n++; } return n; })();
const atraso = diasHabilesDeAtraso(inicio, 12, 71);
ok(atraso === esperado && atraso < 59, `paso del día 12, hoy día 71 → ${atraso} hábiles (no 59)`);
// El error viejo: el resultado dependía de qué día de la semana se abría la app.
ok(diasHabilesDeAtraso(inicio, 12, 71) === diasHabilesDeAtraso(inicio, 12, 71), 'el resultado no depende del día en que se abre la app');
// Día 5 = sáb 11 jul, día 6 = dom 12 jul, día 7 = lun 13 jul
ok(diasHabilesDeAtraso(inicio, 4, 6) === 0, 'paso del viernes, hoy domingo → 0 hábiles');
ok(diasHabilesDeAtraso(inicio, 4, 7) === 1, 'paso del viernes, hoy lunes → 1 hábil');
ok(diasHabilesDeAtraso(inicio, 20, 10) === 0, 'adelantado → 0');
ok(diasHabilesDeAtraso(inicio, null, 30) === 0, 'camino terminado (sin paso pendiente) → 0');
ok(diasHabilesDeAtraso(null, 5, 30) === 0, 'sin fecha de inicio → 0, no inventa atraso');

console.log('\n── la fase por avance ──');
ok(!estaEnFaseAutonomia(12), 'día 71 de calendario con el paso del día 12 → NO es Fase Autonomía');
ok(estaEnFaseAutonomia(50), 'paso del día 50 → Fase Autonomía');
ok(estaEnFaseAutonomia(null, true), 'camino terminado → Fase Autonomía');
ok(!estaEnFaseAutonomia(null, false), 'sin paso y sin terminar → no');

console.log('\n── el mensaje de ritmo, en positivo ──');
const casos = [mensajeDeRitmo(71, 12, 42), mensajeDeRitmo(15, 13, 2), mensajeDeRitmo(10, 12, 0), mensajeDeRitmo(10, null, 0)];
ok(casos[0].tono === 'lejos' && casos[1].tono === 'cerca' && casos[2].tono === 'al_dia' && casos[3].tono === 'al_dia', 'tonos: lejos / cerca / al día / al día');
const negativas = /atr[aá]s|atras(o|ado)|no vas|te atrasaste|perdiste/i;
ok(casos.every((c) => !negativas.test(c.texto)), 'ningún mensaje dice "atrás", "atraso" ni "perdiste"');
ok(casos[0].texto.includes('día 12') && casos[0].texto.includes('Día 71'), 'el mensaje dice qué paso toca y en qué día está');
ok(casos.every((c) => c.texto.length <= 110), 'cada mensaje entra en tres líneas de teléfono (≤110 caracteres)');

console.log('\n── los pilares se abren por el camino, no quedan todos cerrados ──');
ok(!esPasoDelCliente({ tipo_jornada: 'entrega_tecnica' }) && esPasoDelCliente({ tipo_jornada: 'sesion' }) && esPasoDelCliente({}), 'la entrega técnica es del equipo; el resto, del cliente');
const p0 = [{ dia_asignado: 0, tipo_jornada: 'entrega_tecnica' }, { dia_asignado: 1, tipo_jornada: 'sesion' }];
ok(primerDiaDelPilar(p0) === 1, 'el primer día de un pilar ignora el paso del equipo');
ok(pilarAlcanzado(p0, 0, 1), 'el día 1, el pilar del día 1 está abierto');
ok(!pilarAlcanzado([{ dia_asignado: 22 }], 0, 15), 'yendo por el día 15, el pilar del día 22 sigue cerrado');
ok(pilarAlcanzado([{ dia_asignado: 22 }], 2, 15), 'si ya hizo algo en él, está abierto');
ok(pilarAlcanzado([{ dia_asignado: 80 }], 0, null), 'con el camino terminado, todo abierto');
ok(!pilarAlcanzado([{ dia_asignado: 0, tipo_jornada: 'entrega_tecnica' }], 0, 5), 'un pilar solo del equipo no se abre al cliente');
// Sobre el seed real: el día 1 al menos un pilar está abierto, y el del primer paso también.
const abiertosDia1 = SEED_ROADMAP_V2.filter((p) => pilarAlcanzado(p.metas, 0, 1));
ok(abiertosDia1.length >= 1, `seed real, día 1: ${abiertosDia1.length} pilar(es) abierto(s)`);
const primerPaso = SEED_ROADMAP_V2.flatMap((p) => p.metas.filter(esPasoDelCliente).map((m) => ({ p, m })))
  .sort((a, b) => (a.m.dia_asignado ?? 0) - (b.m.dia_asignado ?? 0))[0];
ok(pilarAlcanzado(primerPaso.p.metas, 0, primerPaso.m.dia_asignado ?? 0), `el pilar del primer paso (${primerPaso.m.codigo}) está abierto`);
// El error de fondo: ningún pilar del seed tiene una regla que el código reconozca.
const reglasViejas = new Set(['auto', 'completar_anterior', 'venta_real', 'qa_verde']);
ok(SEED_ROADMAP_V2.every((p) => !reglasViejas.has(p.desbloqueo)), 'control: el seed ya no usa las reglas viejas (por eso hacía falta la nueva)');

console.log('\n── el punto de partida del cliente que ya venía andando ──');
const ops = opcionesDePartida();
ok(ops.length === 10, `hay ${ops.length} opciones, una por grado ganable`);
ok(ops.every((o) => o.loQueYaTienes && !/cintur/i.test(o.loQueYaTienes)), 'cada opción dice lo que YA TIENE, no el nombre del grado');
const campana = ops.find((o) => o.id === '3gup')!;
ok(campana.dia === 31, `«${campana.loQueYaTienes}» entra en el día ${campana.dia}`);
const marcadas = jornadasHasta(SEED_ROADMAP_V2, campana.dia);
ok(marcadas.length > 0 && marcadas.length < 90, `marca ${marcadas.length} jornadas, no las 90`);
const codigos = new Set(marcadas.map((m) => m.codigo));
const todas = SEED_ROADMAP_V2.flatMap((p) => p.metas.map((m) => ({ p, m })));
ok(!codigos.has('P0.d0'), 'no marca la entrega técnica: es del equipo');
ok(todas.filter(({ m }) => codigos.has(m.codigo)).every(({ m }) => (m.dia_asignado ?? 0) <= 31), 'no marca nada posterior al día elegido');
ok(!todas.some(({ m }) => codigos.has(m.codigo) && m.evidencia_requerida?.del_mercado), 'no marca lo que depende de que otro pague: eso se gana');
const grado = cinturonDesdeProgreso(new Set(marcadas.map((m) => m.clave)));
ok(grado.id === '3gup', `con eso marcado, el cinturón queda en ${grado.nombre}`);
ok(diaDeLaOpcion('inventado') === null && resumenDePartida(SEED_ROADMAP_V2, 'inventado') === null, 'una opción inventada no rompe nada');
const cero = jornadasHasta(SEED_ROADMAP_V2, 0);
ok(cero.length === 0, 'el que empieza de cero no arrastra nada');

// ── 2. El vocabulario ─────────────────────────────────────────────────────
console.log('\n── ningún token crudo sale del catálogo ──');
function tokensEn(valor: unknown, ruta: string, out: string[], vistos = new Set<unknown>()) {
  if (typeof valor === 'string') { if (TOKEN_CRUDO.test(valor)) out.push(`${ruta}: ${valor.slice(0, 70)}`); return; }
  if (typeof valor === 'function') {
    // Las funciones de prompt: llamarlas con datos mínimos y mirar lo que devuelven.
    try {
      const f = valor as (...a: unknown[]) => unknown;
      const r = f.length >= 3
        ? f({ titulo: 'X', significado: 'Y' }, {}, {})
        : f({}, {});
      tokensEn(r, `${ruta}()`, out, vistos);
    } catch { /* una función que no se puede llamar en seco no se evalúa aquí */ }
    return;
  }
  if (valor && typeof valor === 'object') {
    if (vistos.has(valor)) return;
    vistos.add(valor);
    for (const [k, v] of Object.entries(valor as Record<string, unknown>)) tokensEn(v, `${ruta}.${k}`, out, vistos);
  }
}

// Control: el catálogo crudo SÍ tiene tokens (si no, esta prueba no prueba nada).
const crudos: string[] = [];
for (const h of [...HERRAMIENTAS_V3, ...HERRAMIENTAS]) tokensEn(h, h.id, crudos);
for (const [c, sgu] of Object.entries(SESIONES_GUIADAS)) tokensEn(sgu, c, crudos);
ok(crudos.length > 20, `control: el catálogo crudo tiene ${crudos.length} textos con tokens (la prueba tiene qué atrapar)`);

const familias = [
  ['clinica', 'Psicóloga'],
  ['acompanamiento', 'Coach ontológico'],
  ['formacion', 'Entrenador personal'],
] as const;
const ids = [...new Set([...HERRAMIENTAS_V3, ...HERRAMIENTAS].map((h) => h.id))];
for (const [fam, esp] of familias) {
  setFamiliaActual(esp);
  ok(getFamiliaActual() === fam, `familia ${fam} detectada desde "${esp}"`);
  const fugas: string[] = [];
  for (const id of ids) tokensEn(getHerramienta(id), id, fugas);
  for (const h of herramientasV3()) tokensEn(h, `lista:${h.id}`, fugas);
  for (const c of Object.keys(SESIONES_GUIADAS)) tokensEn(sesionGuiadaDe(c), c, fugas);
  ok(fugas.length === 0, `${fam}: ${ids.length} herramientas y ${Object.keys(SESIONES_GUIADAS).length} sesiones sin tokens crudos${fugas.length ? ` — ${fugas.slice(0, 3).join(' | ')}` : ''}`);
}

console.log('\n── el caso exacto de la captura ──');
setFamiliaActual('Médica clínica');
const conDolor = [...HERRAMIENTAS_V3, ...HERRAMIENTAS].find((h) => h.constructorFases?.etiquetaOpciones.includes('dolor central'));
ok(!!conDolor, 'existe la herramienta "Elige el dolor central"');
const etiqueta = conDolor ? getHerramienta(conDolor.id)?.constructorFases?.etiquetaOpciones ?? '' : '';
ok(etiqueta === 'Elige el dolor central de tu paciente', `se lee: "${etiqueta}"`);
setFamiliaActual('Coach');
const etiquetaCoach = conDolor ? getHerramienta(conDolor.id)?.constructorFases?.etiquetaOpciones ?? '' : '';
ok(etiquetaCoach.endsWith('de tu consultante') || !etiquetaCoach.includes('{{'), `para un coach: "${etiquetaCoach}"`);

console.log('\n── estabilidad (sin re-renders en bucle) ──');
setFamiliaActual('Psicóloga');
const id0 = ids[0];
ok(getHerramienta(id0) === getHerramienta(id0), 'misma herramienta, misma familia → misma referencia');
ok(sesionGuiadaDe('P0.3') === sesionGuiadaDe('P0.3'), 'misma sesión → misma referencia');
const conPrompt = [...HERRAMIENTAS_V3, ...HERRAMIENTAS].find((h) => h.constructorFases);
if (conPrompt) {
  const a = getHerramienta(conPrompt.id)!.constructorFases!.promptOpciones;
  const b = getHerramienta(conPrompt.id)!.constructorFases!.promptOpciones;
  ok(a === b, 'la función de prompt envuelta también es estable');
}
ok(vocabularizar(null) === null && vocabularizar(undefined) === undefined && vocabularizar(3) === 3, 'valores vacíos pasan intactos');
const original = HERRAMIENTAS_V3[0];
const antes = JSON.stringify(original, (_k, v) => (typeof v === 'function' ? 'fn' : v));
getHerramienta(original.id);
ok(JSON.stringify(original, (_k, v) => (typeof v === 'function' ? 'fn' : v)) === antes, 'el catálogo original no se modifica (sigue con tokens para otras familias)');

console.log(fallas === 0 ? '\n✓ TODO EN VERDE' : `\n✗ ${fallas} FALLAS`);
process.exit(fallas === 0 ? 0 : 1);
