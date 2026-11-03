/**
 * prueba-la-oferta-que-sigue.ts — la escalera que ve el cliente cuando toca
 * un candado o se le cierra el acceso.
 *
 * ═══ QUÉ PROTEGE ═══
 *
 * EL NÚMERO ($27) abre hasta el día 5 y corta ahí. Los cinco puntos donde la
 * app le ofrece seguir —los dos candados del Camino, la puerta del ADN, el
 * cartel del Dashboard y la pantalla de acceso vencido— ofrecían «Tu Sistema
 * · $497» y «El Programa Completo · $997»: la escalera de cuando los planes
 * se llamaban por color. El que pagaba los $27 llegaba al día 6 enganchado y
 * veía un nombre y un precio que ya no se venden.
 *
 * Esta prueba sostiene tres cosas:
 *
 *   1. Que lo que se ofrece sale de `cuadroTickets`, que es donde están las
 *      ofertas de verdad, y nunca de un nombre escrito a mano.
 *   2. Que cada candado ofrece UN escalón —el que lo abre— y no el catálogo.
 *   3. Que un `plan_reservado` de la escalera vieja NO se traduce a un ticket
 *      de hoy. Ese puente ya existió en `cuadroTickets` y se quitó: pegar las
 *      dos escaleras hizo que un cliente de $497 figurara con $5.000 de
 *      instalación contratada.
 */
import {
  ofertaParaPilar, precioDe, textoDelBoton, queAbreLaOferta,
  laOferta, laOfertaQueSigue, laOfertaTrasElAcceso, ofertaReservada,
} from '../src/lib/laOfertaQueSigue';
import { TICKETS } from '../src/lib/cuadroTickets';
import { PILAR_MAX } from '../src/lib/planes';
import { ULTIMO_DIA_DE_BASE } from '../src/lib/topeDelEscalon';

let fallas = 0;
const ok = (c: boolean, m: string, d = '') => { console.log(`${c ? '✓' : '✗'} ${m}${c || !d ? '' : ' — ' + d}`); if (!c) fallas++; };

console.log('\n── el escalón que abre cada pilar ──');
ok(ofertaParaPilar(0) === 'base', 'P0 lo abre La Base');
ok(ofertaParaPilar(2) === 'base', 'P2 —el tope de La Base— lo abre La Base');
ok(ofertaParaPilar(3) === 'ascenso', 'P3 ya pide El Ascenso');
ok(ofertaParaPilar(10) === 'ascenso', 'y P10 también');
// La Instalación no es un escalón de acceso: abre lo mismo que El Ascenso y
// cambia quién lo monta. Ningún candado la ofrece.
ok(![0, 1, 2, 3, 5, 10].some((p) => ofertaParaPilar(p) === 'instalacion'),
  'ningún candado ofrece La Instalación');

console.log('\n── el corte coincide con el tope del escalón ──');
/*
 * El tope de La Base es el día 12 y vive en `topeDelEscalon`. El pilar donde
 * cambia la oferta tiene que caer exactamente ahí: si un día el tope se mueve
 * y esta prueba sigue verde, el candado del día 13 estaría vendiendo La Base
 * para un tramo que La Base no abre.
 */
const MAPA_PILAR_DIA: Record<number, [number, number]> = {
  0: [1, 1], 1: [2, 5], 2: [6, 12], 3: [13, 16], 4: [17, 19],
};
const ultimoDiaDeBase = MAPA_PILAR_DIA[2][1];
ok(ultimoDiaDeBase === ULTIMO_DIA_DE_BASE,
  `el último pilar de La Base cierra el día ${ULTIMO_DIA_DE_BASE}`, String(ultimoDiaDeBase));
const primerPilarDeAscenso = Object.entries(MAPA_PILAR_DIA)
  .find(([p]) => ofertaParaPilar(Number(p)) === 'ascenso');
ok(primerPilarDeAscenso?.[1][0] === ULTIMO_DIA_DE_BASE + 1,
  'El Ascenso empieza el día siguiente al tope de La Base', String(primerPilarDeAscenso?.[1][0]));

console.log('\n── los precios salen del cuadro de tickets ──');
ok(precioDe('base') === '$1.000', 'La Base dice $1.000', precioDe('base'));
ok(precioDe('ascenso') === '$3.000', 'El Ascenso dice $3.000', precioDe('ascenso'));
ok(precioDe('instalacion') === '$5.000', 'La Instalación dice $5.000', precioDe('instalacion'));
// Con punto de miles y sin decimales: «$1000» o «$1,000» no se leen como precio.
ok(/^\$\d\.\d{3}$/.test(precioDe('base')), 'el miles va con punto, no con coma');
(['base', 'ascenso', 'instalacion'] as const).forEach((t) => {
  ok(precioDe(t) === `$${TICKETS[t].precio.toLocaleString('es-AR')}`,
    `el precio de ${TICKETS[t].nombre} no está escrito a mano`);
  ok(textoDelBoton(t).includes(TICKETS[t].nombre), `el botón nombra ${TICKETS[t].nombre}`);
  ok(textoDelBoton(t).includes(precioDe(t)), `y dice su precio`);
});

console.log('\n── ningún nombre ni precio de la escalera vieja ──');
const VIEJO = ['Tu Sistema', 'Programa Completo', 'Tu Base', '$497', '$997', '$147',
  'blanco', 'amarillo', 'verde', 'negro'];
const todoElCopy = (['base', 'ascenso', 'instalacion'] as const).flatMap((t) => [
  TICKETS[t].nombre, precioDe(t), textoDelBoton(t), queAbreLaOferta(t), laOferta(t).mensaje,
]).join(' | ');
VIEJO.forEach((v) => ok(!todoElCopy.includes(v), `no aparece «${v}»`));

console.log('\n── un escalón por vez, nunca el catálogo ──');
const oferta = laOfertaQueSigue(2);
const cuantosNombres = (['base', 'ascenso', 'instalacion'] as const)
  .filter((t) => `${oferta.nombre} ${oferta.boton} ${oferta.abre}`.includes(TICKETS[t].nombre)).length;
ok(cuantosNombres === 1, 'la oferta nombra un solo escalón', String(cuantosNombres));
ok(queAbreLaOferta('ascenso') !== queAbreLaOferta('instalacion'),
  'La Instalación no se vende con la frase de El Ascenso');

console.log('\n── el vencimiento del acceso ──');
/*
 * El que pagó los $27 tiene abierto hasta P1 (`PILAR_MAX.blanco`). Cuando se
 * le cierra el acceso, lo que sigue es el escalón que abre P2: La Base.
 */
const trasLosCincoDias = laOfertaTrasElAcceso(PILAR_MAX.blanco);
ok(trasLosCincoDias.ticket === 'base', 'tras los 5 días sigue La Base', trasLosCincoDias.ticket);
// Quien ya tiene abierto hasta P2 consumió La Base entera: lo que sigue es
// El Ascenso, no venderle de nuevo lo que ya vio.
ok(laOfertaTrasElAcceso(PILAR_MAX.amarillo).ticket === 'ascenso',
  'a quien llegó al tope de La Base le sigue El Ascenso');
ok(laOfertaTrasElAcceso(PILAR_MAX.verde).ticket === 'ascenso',
  'y al del tramo intermedio también');
ok(trasLosCincoDias.abre.includes(String(ULTIMO_DIA_DE_BASE)),
  `le dice hasta qué día abre (${ULTIMO_DIA_DE_BASE})`);

console.log('\n── la reserva vieja no se traduce ──');
ok(ofertaReservada('base') === 'base', 'una reserva de hoy se respeta');
ok(ofertaReservada('ascenso') === 'ascenso', 'y El Ascenso también');
ok(ofertaReservada('instalacion') === 'instalacion', 'y La Instalación también');
// El puente que no debe volver: 'verde' NO es 'ascenso', 'negro' NO es nada.
ok(ofertaReservada('verde') === null, 'un «verde» anotado antes no se vuelve un ticket');
ok(ofertaReservada('negro') === null, 'ni un «negro»');
ok(ofertaReservada('amarillo') === null, 'ni un «amarillo»');
ok(ofertaReservada(null) === null, 'sin reserva, nada');
ok(ofertaReservada('') === null, 'y una reserva vacía tampoco');

console.log('\n── el candado nunca queda sin salida ──');
/*
 * Fuera del navegador no hay `import.meta.env`, así que el checkout sale
 * vacío — igual que en Vercel antes de configurar los links. En los dos casos
 * la pantalla tiene que caer al WhatsApp, nunca a un href vacío.
 */
(['base', 'ascenso', 'instalacion'] as const).forEach((t) => {
  const o = laOferta(t);
  ok((o.checkout || o.mensaje).length > 0, `${TICKETS[t].nombre} tiene a dónde ir sin link de pago`);
  ok(o.mensaje.includes(TICKETS[t].nombre), `y el mensaje al equipo dice qué quiere abrir`);
});

console.log(fallas === 0 ? '\n✓ la escalera que ve el cliente es la de hoy\n' : `\n✗ ${fallas} fallas\n`);
process.exit(fallas === 0 ? 0 : 1);
