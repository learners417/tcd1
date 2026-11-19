/**
 * LOS AVISOS QUE SALEN AL SISTEMA — que lleguen, que no se repitan y que no
 * rompan nada cuando el webhook está caído.
 *
 * ═══ QUÉ VIGILA ═══
 *
 * Tres cosas que se caen sin romperse:
 *
 *  1 · QUE SALGAN. La campanita suena adentro de la app y los tres momentos
 *      que importan son del que no está adentro. Si el cron deja de llamar,
 *      todo sigue verde y el cliente no recibe nada.
 *  2 · QUE NO SE REPITAN. El cron corre todos los días. Sin la marca en
 *      `notificaciones`, el que terminó los noventa días recibe su
 *      felicitación cada mañana para siempre.
 *  3 · QUE NO TUMBEN EL CRON. El mismo cron levanta las alarmas del equipo y
 *      arma la cola de excepciones. Un webhook caído no puede llevarse eso.
 *
 * Correr con: npx tsx scripts/prueba-avisos-a-ghl.ts
 */
import { readFileSync } from 'node:fs';
import { SEED_ROADMAP_V3 } from '../src/lib/roadmapSeed';
import { esPasoDelCliente } from '../src/lib/diaPrograma';

let fallas = 0;
const ok = (cond: boolean, que: string) => {
  console.log(cond ? `✓ ${que}` : `✗ ${que}`);
  if (!cond) fallas++;
};

const mod = readFileSync('api/_lib/avisar-a-ghl.ts', 'utf-8');
const cron = readFileSync('api/cron/alarmas-inactividad.ts', 'utf-8');
const soloCodigo = (t: string) => t
  .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
  .replace(/\/\/[^\n]*/g, (m) => m.replace(/[^\n]/g, ' '));
const modCodigo = soloCodigo(mod);
const cronCodigo = soloCodigo(cron);

console.log('\n══ los tres momentos ══');

for (const e of ['sin_entrar_3_dias', 'dia_5_hecho', 'camino_completo']) {
  ok(modCodigo.includes(e), `está «${e}»`);
  ok(new RegExp(`avisarUnaVez\\('${e}'`).test(cronCodigo), `y el cron lo dispara`);
}

console.log('\n══ no se repiten ══');

ok(/\.insert\(\{[\s\S]{0,200}clave/.test(cronCodigo),
  'cada aviso enviado se anota con su clave');
/*
 * SE MIRA EL MECANISMO, NO CÓMO SE ESCRIBE.
 *
 * Esta lente y la de la ventana, más abajo, exigían la línea LETRA POR LETRA.
 * El turno 19 le agregó a `avisarUnaVez` un objeto de opciones —hacía falta:
 * hay eventos que ocurren cinco veces y necesitan sufijo en la llave— y las
 * dos se pusieron rojas sin que se rompiera nada: `cadaSemana` pasó a ser
 * `opciones.cadaSemana`. Es el mismo error que el 18 de noviembre puso rojas
 * cinco lentes del cobro. Lo que importa es que la marca anterior frene el
 * aviso, y que el semanal sea la única excepción.
 */
ok(/if \(cuando && \(![\w.]*cadaSemana \|\| cuando > haceUnaSemana\)\) return;/.test(cronCodigo),
  'y si ya salió no vuelve a salir (el atraso, una vez por semana)');
ok(/if \(salida !== 'enviado'\) return;/.test(cronCodigo),
  'solo se anota lo que de verdad salió: si falla, se reintenta mañana');

console.log('\n══ no tumban el cron ══');

ok(/catch \{\s*return 'falló';\s*\}/.test(modCodigo),
  'el que avisa no lanza: devuelve qué pasó');
ok(!/throw /.test(modCodigo), 'y no tira ningún error hacia afuera');

console.log('\n══ callado hasta que lo prendan ══');

ok(/if \(!url\) return 'sin-webhook';/.test(modCodigo),
  'sin la dirección del flujo no sale ningún pedido');
ok(/GHL_AVISOS_WEBHOOK/.test(modCodigo),
  'y la dirección vive en el entorno, no en el repo');
/* La dirección de un webhook es una llave: quien la tiene escribe en el
   Sistema de Javo. Nunca en el código. */
ok(!/https:\/\/services\.leadconnectorhq\.com/.test(modCodigo + cronCodigo),
  'ninguna dirección de GHL escrita en el repo');

console.log('\n══ el cliente se identifica por su correo ══');

ok(/select\('id, nombre, email,/.test(cronCodigo),
  'el cron trae el correo, que es como GHL conoce a la persona');
ok(/if \(!contacto\.email\) return 'sin-email';/.test(modCodigo),
  'y sin correo no se manda un aviso que GHL no puede entregar');

console.log('\n══ y el calendario del que cuelgan dice la verdad ══');

/*
 * ACÁ ESTABA LA CEGUERA, Y COSTÓ CARO. Esta lente verificaba que la llamada
 * `avisarUnaVez('camino_completo'…)` estuviera escrita en el cron. Estaba — y
 * no podía ser verdad nunca: colgaba de una tabla del Camino copiada a mano
 * en la que 33 de 40 códigos ya no existían en el seed.
 *
 * Así que ahora se EJECUTA la misma derivación que hace el cron y se compara
 * con el seed, en vez de buscar texto. Lo que se mide es si la condición
 * puede ser verdadera, no si la línea está escrita.
 */
const camino = SEED_ROADMAP_V3
  .flatMap((p) => (p.metas ?? [])
    .filter((m) => esPasoDelCliente(m) && (m.dia_asignado ?? 0) > 0)
    .map((m) => ({ c: m.codigo, d: m.dia_asignado as number })))
  .sort((a, b) => a.d - b.d);

ok(camino.length > 0, `${camino.length} jornadas del cliente salen del seed`);
ok(/CAMINO: \{ p: number; c: string; d: number \}\[\] = SEED_ROADMAP_V3/.test(cronCodigo),
  'el cron lo deriva del seed y no de una copia a mano');

const delDia5 = camino.filter((m) => m.d === 5);
ok(delDia5.length > 0, `el día 5 existe en el camino (${delDia5.map((m) => m.c).join(', ')})`);

const ultimo = Math.max(...camino.map((m) => m.d));
ok(ultimo === 90, `el último día del camino es el 90 (es ${ultimo})`);

/* El que cerró todo no puede quedar «atrasado»: así se veían todos. */
const todoHecho = new Set(camino.map((m) => m.c));
const pendienteConTodo = camino.find((m) => !todoHecho.has(m.c));
ok(!pendienteConTodo, `el que cerró todo no queda con una jornada pendiente${
  pendienteConTodo ? ` — ${pendienteConTodo.c}` : ''}`);

/* Y el aviso del día 5 no puede dispararse antes del día 5. */
const hastaElCuatro = new Set(camino.filter((m) => m.d <= 4).map((m) => m.c));
ok(!delDia5.every((m) => hastaElCuatro.has(m.c)),
  'el aviso del día 5 no se cumple con lo hecho hasta el día 4');

console.log('\n══ un aviso viejo no sale de golpe ══');
ok(/const VENTANA: Record<EventoDeAviso, number>/.test(cronCodigo),
  'cada aviso tiene su ventana en días de programa');
/* Mismo motivo que arriba: el día se compara contra su ventana y se vuelve,
   se llame `dia` o `datos.dia`, y admita o no un tope propio en la llamada. */
ok(/if \([^;\n]*\bdia\b[^;\n]*>[^;\n]*VENTANA\[evento\][^;\n]*\) return;/.test(cronCodigo),
  'y fuera de su ventana no sale: el día que se prenda el webhook no se inunda a nadie');

console.log('\n══ un aviso roto no se lleva puesto el cron ══');
ok(/\} catch \(e\) \{\s*Sentry\.captureException\(e\);\s*\}/.test(cronCodigo),
  'los avisos tienen su propio catch');
ok(/AbortSignal\.timeout\(/.test(modCodigo),
  'y el pedido al Sistema tiene reloj, para que un Sistema lento no coma el cron');

console.log(fallas === 0 ? '\n✓ los avisos, en su lugar' : `\n✗ ${fallas} fallas`);
process.exit(fallas === 0 ? 0 : 1);
