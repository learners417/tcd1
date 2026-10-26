/**
 * prueba-antesala-tramo-corto.ts — que el que compró cinco días entre hoy.
 *
 * ═══ QUÉ PROTEGE ═══
 *
 * La antesala es un detox de cinco a siete días que se pone ANTES del día 1.
 * Existe por una razón buena: el que compra noventa días llega agotado, y la
 * primera sesión le pide claridad y energía. Para ese cliente está bien.
 *
 * Para el tramo de cinco días se da vuelta entero. Su acceso dura lo mismo que
 * la antesala, así que descansar primero le consume la compra completa: la
 * página le promete su primera sesión para hoy y la app le contestaba «te
 * faltan cinco días para que se abra tu sesión 1». Lo prometido llegaba el día
 * seis, con el acceso por vencer.
 *
 * Esta prueba sostiene cuatro cosas:
 *
 *   1. Que al tramo corto no le toca la antesala en ningún estado: vacía, a
 *      medio escribir, o con días tildados pero sin llegar al mínimo.
 *   2. Que al Camino de noventa días SÍ le sigue tocando — el arreglo no se
 *      lleva puesta la decisión de producto que estaba bien.
 *   3. Que quien ya cerró su día 1 no vuelve a la antesala, que era lo que el
 *      tercer parámetro no debía romper.
 *   4. Que el valor por omisión deja el comportamiento viejo intacto, para que
 *      un llamador que no se actualice no cambie de conducta en silencio.
 */
import { leToca, abreLaSesionUno, type Antesala } from '../src/lib/antesala';

let fallas = 0;
const ok = (cond: boolean, msg: string) => {
  if (cond) { console.log(`  ✓ ${msg}`); }
  else { console.log(`  ✗ ${msg}`); fallas++; }
};

const TRAMO_CORTO = true;
const NOVENTA_DIAS = false;

/** Una antesala en cada estado posible antes de abrir la sesión 1. */
const vacia: Antesala = {};
const aMedias: Antesala = {
  protocolo: [{ area: 'sueno', loQueHago: 'Apago la luz a las 23:30 todos los días.' }],
};
const escritaSinDias: Antesala = {
  protocolo: [
    { area: 'sueno', loQueHago: 'Apago la luz a las 23:30 todos los días.' },
    { area: 'pantallas', loQueHago: 'El celular queda en la cocina a las 22:00.' },
    { area: 'agua', loQueHago: 'Un vaso grande de agua al despertar.' },
  ],
};
const dosDias: Antesala = { ...escritaSinDias, dias: ['2026-10-20', '2026-10-21'] };
const cincoDias: Antesala = {
  ...escritaSinDias,
  dias: ['2026-10-18', '2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22'],
};

console.log('\n── al tramo de cinco días no le toca, en ningún estado ──');
ok(leToca(vacia, false, TRAMO_CORTO) === false, 'con la antesala vacía entra directo');
ok(leToca(aMedias, false, TRAMO_CORTO) === false, 'con una sola movida escrita, también');
ok(leToca(escritaSinDias, false, TRAMO_CORTO) === false, 'con el protocolo escrito y cero días, también');
ok(leToca(dosDias, false, TRAMO_CORTO) === false, 'y con dos días tildados, también');
ok(leToca(null, false, TRAMO_CORTO) === false, 'y sin antesala en el perfil, también');
ok(leToca(undefined, false, TRAMO_CORTO) === false, 'y con el campo sin definir, también');

console.log('\n── al Camino de noventa días le sigue tocando ──');
ok(leToca(vacia, false, NOVENTA_DIAS) === true, 'con la antesala vacía, descansa primero');
ok(leToca(aMedias, false, NOVENTA_DIAS) === true, 'con una sola movida, todavía le toca');
ok(leToca(escritaSinDias, false, NOVENTA_DIAS) === true, 'escrito pero sin tildar, le toca');
ok(leToca(dosDias, false, NOVENTA_DIAS) === true, 'con dos de cinco días, le toca');
ok(leToca(cincoDias, false, NOVENTA_DIAS) === false, 'con los cinco días hechos, se abre la sesión 1');

console.log('\n── quien ya entró al Camino no vuelve atrás ──');
ok(leToca(vacia, true, NOVENTA_DIAS) === false, 'cerró su día 1: la antesala no se le agrega después');
ok(leToca(vacia, true, TRAMO_CORTO) === false, 'y en el tramo corto, tampoco');

console.log('\n── el valor por omisión no cambia nada ──');
/*
 * El tercer parámetro entró con un valor por omisión para que ningún llamador
 * viejo se rompa. Eso solo es seguro si omitirlo da exactamente lo mismo que
 * pasar «no es tramo corto»: si alguna pantalla queda sin actualizar, tiene
 * que seguir comportándose como antes, no cambiar en silencio.
 */
([vacia, aMedias, escritaSinDias, dosDias, cincoDias] as Antesala[]).forEach((a, i) => {
  ok(leToca(a, false) === leToca(a, false, NOVENTA_DIAS), `omitirlo es igual que pasarlo (caso ${i + 1})`);
});

console.log('\n── la regla de apertura no se tocó ──');
ok(abreLaSesionUno(cincoDias) === true, 'cinco días hechos abren la sesión 1');
ok(abreLaSesionUno(dosDias) === false, 'dos días no la abren');
ok(abreLaSesionUno({ cerrada: '2026-10-22' }) === true, 'una antesala cerrada a mano la abre');

console.log(fallas === 0 ? '\n✓ el que compró cinco días entra hoy\n' : `\n✗ ${fallas} fallas\n`);
process.exit(fallas === 0 ? 0 : 1);
