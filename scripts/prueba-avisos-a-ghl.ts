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
ok(/if \(cuando && \(!cadaSemana \|\| cuando > haceUnaSemana\)\) return;/.test(cronCodigo),
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

console.log(fallas === 0 ? '\n✓ los avisos, en su lugar' : `\n✗ ${fallas} fallas`);
process.exit(fallas === 0 ? 0 : 1);
