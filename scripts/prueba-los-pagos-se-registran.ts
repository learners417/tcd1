/**
 * prueba-los-pagos-se-registran.ts
 *
 * ═══ QUÉ PROTEGE ═══
 *
 * Supabase DEVUELVE el error, no lo lanza. Una escritura así se ve igual
 * cuando funciona y cuando falla:
 *
 *     await admin.from('paypal_orders').update({ status: 'captured' }).eq(…)
 *
 * No hay excepción, no hay nada en la consola, el `await` termina contento.
 * Seis escrituras del cobro estaban escritas de esa forma.
 *
 * La peor es la que marca la orden como capturada, porque corre DESPUÉS de
 * acreditar: si se pierde, el cliente tiene sus créditos, PayPal cobró, y la
 * orden queda en «pending». El registro diría que no pagó. Y un segundo
 * intento del cliente no entraría por la guarda de idempotencia —que mira
 * justamente ese campo— así que volvería a capturar en PayPal y vería un
 * error con el pago hecho.
 *
 * Esta prueba hace dos cosas. Primero CORRE el ayudante contra escrituras
 * que fallan a propósito, que es la única forma de saber que el reintento y
 * el registro funcionan. Después revisa que las seis escrituras lo usen.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { escrituraDePago, MARCA } from '../api/_lib/escritura-de-pago.js';

const raiz = join(import.meta.dirname, '..');
const leer = (p: string) => readFileSync(join(raiz, p), 'utf8');

let fallas = 0;
const ok = (cond: boolean, msg: string) => {
  if (cond) console.log(`  ✓ ${msg}`);
  else { console.log(`  ✗ ${msg}`); fallas++; }
};

/* ══ 1 · el ayudante, corriendo de verdad ═════════════════════════════════ */
console.log('\n── el ayudante, contra escrituras que fallan ──');

// Se toma prestada la consola para leer lo que registra.
const vistos: string[] = [];
const erroresReales = console.error;
const avisosReales = console.warn;
console.error = (...a: unknown[]) => { vistos.push(a.join(' ')); };
console.warn = (...a: unknown[]) => { vistos.push(a.join(' ')); };

// a · la escritura funciona de una
let intentos = 0;
const buena = await escrituraDePago('prueba', { x: 1 }, () => {
  intentos++;
  return Promise.resolve({ error: null });
});
ok(buena.ok && intentos === 1, 'una escritura que funciona se hace una sola vez');

// b · falla la primera y funciona la segunda: casi siempre es un corte de un segundo
intentos = 0;
const segunda = await escrituraDePago('prueba', { x: 2 }, () => {
  intentos++;
  return Promise.resolve(intentos === 1 ? { error: { message: 'red cortada' } } : { error: null });
});
ok(segunda.ok && intentos === 2, 'si falla la primera vez, reintenta y queda escrita');

// c · falla siempre: no se pierde, se registra con la marca y todos los datos
intentos = 0;
vistos.length = 0;
const mala = await escrituraDePago(
  'marcar la orden como capturada',
  { orderId: 'ORD-1', userId: 'U-1', creditos: 500, acreditado: true },
  () => { intentos++; return Promise.resolve({ error: { message: 'base caída' } }); },
);
const registro = vistos.find((v) => v.includes(MARCA)) ?? '';
ok(!mala.ok, 'si falla las dos veces, lo dice en vez de darlo por hecho');
ok(intentos === 2, 'y no insiste más de dos veces');
ok(registro !== '', `queda registrado con la marca ${MARCA}, que se puede buscar`);
ok(
  ['ORD-1', 'U-1', '500', 'acreditado', 'base caída'].every((d) => registro.includes(d)),
  'y el registro trae todo lo necesario para reconstruir la fila a mano',
);

// d · un corte de red llega como excepción, y se trata igual
const reventada = await escrituraDePago('prueba', { x: 4 }, () => {
  throw new Error('socket cerrado');
});
ok(!reventada.ok, 'una excepción de red no se escapa: se trata como el error que es');

console.error = erroresReales;
console.warn = avisosReales;

/* ══ 2 · las seis escrituras del cobro ════════════════════════════════════ */
console.log('\n── las escrituras del cobro ──');

for (const archivo of ['api/payments/paypal/capture-order.ts', 'api/payments/paypal/webhook.ts']) {
  const t = leer(archivo);
  /*
   * Una escritura a paypal_orders que no pasa por el ayudante es una que
   * puede perderse. Se buscan los `.update(` que cuelgan directamente de un
   * `.from('paypal_orders')` sin el ayudante arriba.
   */
  const sueltas = [...t.matchAll(/\n\s*await admin\s*\n?\s*\.from\('paypal_orders'\)\s*\n?\s*\.(update|insert|upsert)\(/g)];
  ok(
    sueltas.length === 0,
    sueltas.length === 0
      ? `${archivo.split('/').pop()}: ninguna escritura de la orden se hace sin mirar el error`
      : `${archivo}: ${sueltas.length} escrituras sin mirar el error`,
  );
  const conAyudante = [...t.matchAll(/escrituraDePago\(/g)].length;
  ok(conAyudante >= 3, `${archivo.split('/').pop()}: ${conAyudante} escrituras pasan por el ayudante`);
}

/*
 * Y la de create-order, que ya miraba el error desde antes con su razón
 * escrita: el aviso de PayPal puede recrear la fila si hace falta.
 */
const crear = leer('api/payments/paypal/create-order.ts');
ok(
  /const \{ error: insertError \}/.test(crear) && /if \(insertError\)/.test(crear),
  'create-order mira el error de su inserción, como ya lo hacía',
);

/* ══ 3 · la respuesta le dice al equipo lo que pasó ═══════════════════════ */
console.log('\n── qué se le devuelve al cliente ──');
const captura = leer('api/payments/paypal/capture-order.ts');
ok(
  /registroPendiente: true/.test(captura),
  'si el registro quedó pendiente, la respuesta lo marca para el equipo',
);
ok(
  /\.\.\.\(registro\.ok \? \{\} : \{ registroPendiente: true \}\)/.test(captura),
  'y sigue siendo 200 con los créditos: para el cliente el pago salió bien, porque salió bien',
);

console.log(fallas === 0 ? '\n✓ ningún pago se registra en silencio\n' : `\n✗ ${fallas} fallas\n`);
process.exit(fallas === 0 ? 0 : 1);
