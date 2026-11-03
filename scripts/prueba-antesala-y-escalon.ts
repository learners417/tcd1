/**
 * LA ANTESALA Y EL TOPE POR ESCALÓN.
 *
 * ═══ QUÉ SE PROTEGE ═══
 *
 *   1. El Camino abría con 75 minutos de medición y pacto para alguien que
 *      llega agotado, y la app se convertía en una obligación más.
 *   2. Quien pagó la primera etapa de $1.000 tenía los 90 días completos
 *      abiertos, incluidos los sistemas que el equipo instala.
 *   3. Y las entregas del cron le montaban la instalación de $5.000 a las dos
 *      semanas, sin que nadie se enterara.
 *
 * Correr con: npx tsx scripts/prueba-antesala-y-escalon.ts
 */
import { readFileSync } from 'node:fs';
import {
  AREAS, DIAS_MAXIMOS, DIAS_MINIMOS, MOVIDAS_MAXIMAS, MOVIDAS_MINIMAS,
  abreLaSesionUno, diasHechos, faltaEnLaAntesala, fechaQueSellaElInicio,
  leToca, movidasValidas, protocoloListo, sePuedeTildar, tildar, type Antesala,
} from '../src/lib/antesala';
import {
  ESCALONES, ULTIMO_DIA_DE_BASE, entraEnElEscalon, escalonDe, estaMarcado,
  leTocanLasEntregas, puertaDelEscalon, ultimoDiaDelEscalon,
} from '../src/lib/topeDelEscalon';
import { jornadaDe } from '../src/lib/roadmapSeed';

let fallas = 0;
const ok = (c: boolean, q: string) => { console.log(c ? `✓ ${q}` : `✗ ${q}`); if (!c) fallas++; };
const codigoDe = (r: string) =>
  readFileSync(r, 'utf-8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

/**
 * Una fecha de inicio que deja hoy en el día N, contada en LOCAL.
 *
 * Estaba con `toISOString()`, que da UTC: en UTC−3, de las 21:00 en adelante
 * la fecha saltaba al día siguiente y el cálculo daba uno menos. O sea que la
 * prueba pasaba de mañana y fallaba de noche, sin que nada hubiera cambiado.
 */
const fechaLocalISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const hoy = fechaLocalISO(new Date());
const haceDias = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return fechaLocalISO(d);
};

const TRES: Antesala = {
  protocolo: [
    { area: 'sueno', loQueHago: 'Apago la luz a las 23:30' },
    { area: 'pantallas', loQueHago: 'El celular queda en la cocina a las 22:00' },
    { area: 'movimiento', loQueHago: 'Camino 25 minutos después de almorzar' },
  ],
};

// ── 1 · Lo diseña él ───────────────────────────────────────────────────────
console.log('══ el protocolo lo escribe él ══');
ok(AREAS.length === 6, 'son seis áreas: elegir entre seis es decidir');
ok(AREAS.every((a) => a.pregunta.includes('?') && a.ejemplo.length > 20),
  'cada una pregunta algo concreto y trae un ejemplo: nadie arranca de una hoja en blanco');
ok(AREAS.every((a) => /hora|cuánto|cuántos|qué/i.test(a.pregunta)),
  'y todas piden una hora o un número, no una intención');

ok(!protocoloListo({}), 'sin movidas no arranca');
ok(!protocoloListo({ protocolo: [{ area: 'sueno', loQueHago: 'mejor' }] }),
  'ni con una sola, ni con tres palabras: «mejor» no es una movida');
ok(protocoloListo(TRES), `con ${MOVIDAS_MINIMAS} escritas, sí`);

const SEIS: Antesala = {
  protocolo: AREAS.map((a) => ({ area: a.id, loQueHago: `Algo concreto sobre ${a.nombre}` })),
};
ok(!protocoloListo(SEIS),
  `el techo de ${MOVIDAS_MAXIMAS} también frena: el que elige las seis se armó una semana más exigente que la que tiene`);
ok(/Deja 1/.test(faltaEnLaAntesala(SEIS)), 'y se le dice cuántas dejar para después');

ok(movidasValidas({ protocolo: [{ area: 'inventada', loQueHago: 'Lo que fuera de largo' }] }).length === 0,
  'un área que no existe no cuenta');

// ── 2 · Un día por día ─────────────────────────────────────────────────────
console.log('\n══ se tilda un día por día ══');
let a = tildar(TRES, hoy);
ok(diasHechos(a) === 1, 'tildar hoy cuenta uno');
a = tildar(a, hoy);
ok(diasHechos(a) === 1, 'y tildarlo de nuevo no suma: cinco tildes de una no son cinco días');
ok(!sePuedeTildar(a, haceDias(4)),
  'una fecha vieja no entra: el descanso no se carga en retroactivo');
ok(sePuedeTildar(tildar({ ...TRES }, haceDias(1)), hoy),
  'pero ayer sí se acepta una vez: el que descansó y se olvidó de marcarlo descansó igual');
ok(!sePuedeTildar(TRES, haceDias(1)) === false,
  'ayer se puede marcar incluso sin haber marcado hoy');
ok(!sePuedeTildar({}, hoy), 'sin protocolo escrito no hay nada que tildar');

// ── 3 · Cinco abren, siete cierran ────────────────────────────────────────
console.log('\n══ cinco abren la sesión 1 ══');
const conDias = (n: number): Antesala => ({
  ...TRES, dias: Array.from({ length: n }, (_, i) => haceDias(n - i - 1)),
});
ok(!abreLaSesionUno(conDias(4)), 'con cuatro días todavía no');
ok(abreLaSesionUno(conDias(DIAS_MINIMOS)), `con ${DIAS_MINIMOS} sí`);
ok(/un día/.test(faltaEnLaAntesala(conDias(4))), 'y se le dice cuánto falta, en singular cuando es uno');
ok(!/atras|retras|tarde|falta de/i.test(faltaEnLaAntesala(conDias(2))),
  'en positivo: nunca se le dice que viene mal');

let siete: Antesala = { ...TRES, dias: Array.from({ length: 6 }, (_, i) => haceDias(6 - i)) };
siete = tildar(siete, hoy);
ok(siete.cerrada === hoy,
  `al día ${DIAS_MAXIMOS} se cierra sola: sin techo, descansar es la forma más cómoda de no empezar`);
ok(!sePuedeTildar(siete, hoy), 'y cerrada ya no se tilda');

console.log('\n══ la fecha que sella el inicio ══');
ok(fechaQueSellaElInicio(conDias(4)) === null, 'con cuatro días no hay fecha todavía');
ok(fechaQueSellaElInicio(conDias(DIAS_MINIMOS)) === haceDias(0),
  'con cinco, la fecha es el día en que llegó al quinto');
ok(fechaQueSellaElInicio(conDias(7)) === haceDias(2),
  'con siete sigue siendo el quinto: los 90 días arrancan cuando se ganó la sesión 1');

console.log('\n══ a quien ya entró no se le agrega una puerta atrás ══');
ok(leToca({}, false), 'al que no cerró su día 1, le toca');
ok(!leToca({}, true), 'al que ya lo cerró, no');
ok(!leToca(conDias(DIAS_MINIMOS), false), 'y al que la hizo, tampoco');

// ── 4 · El tope por escalón ───────────────────────────────────────────────
console.log('\n══ hasta dónde llega lo que pagó ══');
ok(escalonDe(undefined) === 'base' && escalonDe('cualquiera') === 'base',
  'lo que no reconocemos cae en base: mostrarle de menos se arregla con un mensaje, de más hace trabajar al equipo gratis');
ok(escalonDe('ascenso') === 'ascenso' && escalonDe('instalacion') === 'instalacion',
  'y los dos de arriba se respetan');
ok(Object.keys(ESCALONES).length === 3, 'son los tres de la migración, con su precio');

const sist = (d: number) => jornadaDe(d)?.sistema ?? null;
const MARCADO = '2026-10-14T12:00:00Z';
const abiertos = (serv: string) =>
  Array.from({ length: 91 }, (_, d) => d).filter((d) => entraEnElEscalon(d, sist(d), serv, MARCADO));

ok(abiertos('base').join(',') === '0,1,2,3,4,5,6,7,8,9,10,12',
  `base abre los días 0 al 10 y el 12: los sistemas 1 y 2 (abre ${abiertos('base').join(',')})`);
ok(!entraEnElEscalon(11, sist(11), 'base', MARCADO),
  'el día 11 queda cerrado: es del sistema 3, aunque esté en medio de los otros');
ok(entraEnElEscalon(12, sist(12), 'base', MARCADO),
  'y el 12 abre igual, que es con lo que cierra su primera etapa');
ok(abiertos('ascenso').length === 91 && abiertos('instalacion').length === 91,
  'los dos escalones de arriba abren los 90 días');
ok(ultimoDiaDelEscalon(sist, 'base', MARCADO) === ULTIMO_DIA_DE_BASE,
  `el último día de base es el ${ULTIMO_DIA_DE_BASE}`);
ok(ultimoDiaDelEscalon(sist, 'ascenso', MARCADO) === null, 'y los de arriba no tienen tope');

// El techo de día hace falta ADEMÁS del sistema: el día 68 revisa su precio y
// el 80 su programa, así que los dos son del sistema 1 y del 2. Cortando solo
// por sistema, base abría jornadas sueltas hasta el día 80.
ok(sist(68) !== null && [1, 2].includes(sist(68)!) && !entraEnElEscalon(68, sist(68), 'base', MARCADO),
  'el día 68 es del sistema 2 y queda cerrado igual: los sistemas se intercalan hasta el final');

console.log('\n══ sin marcar, nada se corta ══');
ok(!estaMarcado(null) && !estaMarcado(undefined) && estaMarcado(MARCADO),
  'marcado es tener la fecha puesta');
ok(Array.from({ length: 91 }, (_, d) => d).every((d) => entraEnElEscalon(d, sist(d), 'base', null)),
  'a quien nadie marcó se le abre el Camino completo: la columna viene en base por default y todos los clientes de hoy están ahí');
ok(!leTocanLasEntregas('instalacion', null),
  'y las entregas no se disparan sin marcar: el equipo no recibe tareas de instalar hasta que alguien diga quién la compró');
ok(puertaDelEscalon('base', null) === null, 'ni ve una puerta que no le corresponde');

console.log('\n══ la puerta ══');
const puerta = puertaDelEscalon('base', MARCADO) ?? '';
ok(puerta.length > 0 && puertaDelEscalon('ascenso', MARCADO) === null,
  'solo base ve una puerta');
ok(/Cerraste|tienes/.test(puerta) && !/no pagaste|te falta pagar|no incluye/i.test(puerta),
  'y dice lo que SÍ tiene, nunca lo que le falta por no haber pagado');
ok(!/gente/i.test(puerta + faltaEnLaAntesala({})), 'nunca «gente»');

// ── 5 · Las entregas son del escalón que las compró ───────────────────────
console.log('\n══ las entregas del equipo ══');
ok(!leTocanLasEntregas('base', MARCADO) && !leTocanLasEntregas('ascenso', MARCADO),
  'base y ascenso no las reciben');
ok(leTocanLasEntregas('instalacion', MARCADO),
  'solo instalacion, que es «el equipo monta todo»');

const cron = codigoDe('api/cron/alarmas-inactividad.ts');
ok(/leTocanLasEntregas\(cli\.servicio_contratado, cli\.servicio_marcado_el\)/.test(cron),
  'el cron lo pregunta antes de disparar: sin esta línea le montaba la instalación de $5.000 a quien pagó $1.000');
// Se mira el select de clientes, no «antes de la primera aparición»: la primera
// aparición de entregaPendiente es su import, arriba de todo.
ok(/servicio_contratado, servicio_marcado_el'\)/.test(cron),
  'y la trae en el select, porque sin la columna la pregunta siempre dice lo mismo');

const tope = codigoDe('src/lib/topeDelEscalon.ts');
ok(!/^import /m.test(tope),
  'el módulo no importa nada: lo usa el cron en frío y no puede arrastrar el seed ni Supabase');

// ── 6 · Cerrado en la pantalla ────────────────────────────────────────────
console.log('\n══ y está conectado a lo que ve ══');
const roadmap = codigoDe('src/pages/Roadmap.tsx');
ok(/leToca\(perfil\?\.antesala/.test(roadmap),
  'el Camino no abre el día 1 hasta que hizo sus cinco días');
ok(/entraEnElEscalon\(/.test(roadmap),
  'y no abre lo que queda del otro lado de su escalón');
ok(/entraEnElEscalon\(m\.dia_asignado/.test(roadmap),
  'el orden saltea lo que no es suyo: sin eso, el día 12 esperaba para siempre al 11');
ok(/puertaDelEscalon/.test(roadmap), 'con la puerta como motivo, no un candado sin explicación');

const dash = codigoDe('src/pages/Dashboard.tsx');
ok(/<LaAntesala/.test(dash), 'la pantalla de Hoy abre con la antesala mientras le toca');
ok(/!enAntesala && data\.tareasHoy\[0\]/.test(dash),
  'y la jornada del día no se dibuja: es justo la tarea que no hay');
ok(/campos\.fecha_inicio = sella/.test(dash),
  'al cerrarla se sella la fecha de inicio: si no, sale de su semana de descanso con una semana de diferencia encima');

const mig = readFileSync('supabase/migrations/20261022_la_antesala.sql', 'utf-8');
ok(/add column if not exists antesala jsonb/.test(mig), 'la columna existe y es idempotente');
ok(/comment on column/.test(mig), 'y queda explicada en la base, no solo acá');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
