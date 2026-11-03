/**
 * LA OFERTA QUE SIGUE — qué se le ofrece a quien toca un candado.
 *
 * ═══ QUÉ PROBLEMA RESUELVE ═══
 *
 * EL NÚMERO ($27) abre hasta el día 5 y corta ahí, que es donde se gana el
 * grado «Precio digno». Es el mejor momento para ofrecerle seguir: tiene su
 * precio decidido y un grado ganado.
 *
 * Y lo que el candado del día 6 le ofrecía era «Tu Sistema · $497». Más
 * arriba, «El Programa Completo · $997». Esa es la escalera vieja, de cuando
 * los planes se llamaban por color y se cortaban por pilar.
 *
 * La de hoy es La Base ($1.000), El Ascenso ($3.000) y La Instalación
 * ($5.000), y vive en `cuadroTickets`. Así que el que pagaba $27, llegaba al
 * día 6 enganchado, tocaba el botón y veía un nombre y un precio que ya no se
 * venden. La venta automática se cortaba justo ahí.
 *
 * ═══ POR QUÉ UN ESCALÓN POR VEZ ═══
 *
 * El candado del día 6 ofrece La Base, no las tres. Y el del día 13 ofrece El
 * Ascenso. Cada candado ofrece el escalón que lo abre, no el catálogo: elegir
 * entre tres en el momento de pagar es la forma más cara de no decidir.
 *
 *     $27 ──día 5──▸ La Base $1.000 ──día 12──▸ El Ascenso $3.000
 *
 * ═══ POR QUÉ NO VIVE EN `planes.ts` ═══
 *
 * `planes.ts` gobierna el ACCESO: hasta qué pilar ve cada quien, y eso sigue
 * igual. Esto es otra pregunta —qué se le VENDE— y la respuesta sale de
 * `cuadroTickets`, que es donde están las ofertas de verdad. El día que
 * cambie un precio, cambia en un solo lugar.
 */
import { TICKETS, type Ticket } from './cuadroTickets';

/*
 * El último pilar que abre La Base. P2 termina en el día 12, que es el mismo
 * tope que `ULTIMO_DIA_DE_BASE`. No se importa de allá a propósito: aquel
 * módulo corre en el cron sin imports, y acá hace falta el número del pilar,
 * no el del día.
 */
const ULTIMO_PILAR_DE_BASE = 2;

/** El escalón que abre ese pilar. */
export function ofertaParaPilar(pilarNum: number): Ticket {
  return pilarNum <= ULTIMO_PILAR_DE_BASE ? 'base' : 'ascenso';
}

/**
 * El link de pago de cada escalón.
 *
 * Se configuran en Vercel sin tocar código: VITE_CHECKOUT_BASE y
 * VITE_CHECKOUT_ASCENSO. Con la URL vacía, el botón cae al WhatsApp de
 * siempre, así que el candado nunca queda sin salida.
 */
const env = (import.meta as { env?: Record<string, string | undefined> }).env ?? {};

export function checkoutDeOferta(t: Ticket): string {
  if (t === 'base') return env.VITE_CHECKOUT_BASE || '';
  if (t === 'ascenso') return env.VITE_CHECKOUT_ASCENSO || '';
  return env.VITE_CHECKOUT_INSTALACION || '';
}

/** El precio como se escribe: 1.000, no 1000 ni 1,000. */
export function precioDe(t: Ticket): string {
  return `$${TICKETS[t].precio.toLocaleString('es-AR')}`;
}

/** Lo que dice el botón del candado. */
export function textoDelBoton(t: Ticket): string {
  return `Abrir ${TICKETS[t].nombre} · ${precioDe(t)}`;
}

/** Lo que abre, en una línea, para que sepa qué está comprando. */
export function queAbreLaOferta(t: Ticket): string {
  if (t === 'base') return 'Tu Camino hasta el día 12: tu método escrito y tu programa de 1.000 USD en una página.';
  if (t === 'ascenso') return 'Los 90 días completos, desde la antesala hasta tu graduación.';
  /*
   * La Instalación también abre los 90 días, pero eso no es lo que se compra:
   * lo que cambia es QUIÉN los monta. Decirle «los 90 días completos» acá
   * sería venderle de nuevo lo que El Ascenso ya le daba por 3.000 menos.
   */
  return 'Los 90 días completos, con tu landing, tus automatizaciones y tus campañas montadas por el equipo.';
}

/** El mensaje de WhatsApp, para cuando el link de pago todavía no está. */
export function mensajeParaElEquipo(t: Ticket): string {
  return `Hola · Quiero abrir ${TICKETS[t].nombre} (${precioDe(t)})`;
}

/** Una oferta armada, que es como la usan las pantallas. */
export function laOferta(t: Ticket) {
  return {
    ticket: t,
    nombre: TICKETS[t].nombre,
    precio: precioDe(t),
    boton: textoDelBoton(t),
    abre: queAbreLaOferta(t),
    checkout: checkoutDeOferta(t),
    mensaje: mensajeParaElEquipo(t),
  };
}

/** La oferta que abre ese pilar. */
export function laOfertaQueSigue(pilarNum: number) {
  return laOferta(ofertaParaPilar(pilarNum));
}

/**
 * LA OFERTA DE CUANDO SE VENCE EL ACCESO.
 *
 * El que paga $27 tiene 21 días de calendario para hacer sus 5 sesiones. El
 * día 22 el acceso se cierra, y esa pantalla es el punto de venta más caro de
 * la app: tiene su precio nuevo decidido, su grado ganado, y acaba de perder
 * la puerta.
 *
 * Lo que sigue es el escalón que abre el PRIMER pilar que su plan no abría.
 * Para quien venía de los 5 días, P1 era el tope, así que sigue P2 — La Base.
 * Se calcula, no se escribe: el día que `PILAR_MAX` cambie, esta pantalla
 * cambia con él.
 */
export function laOfertaTrasElAcceso(pilarMaxDeSuPlan: number) {
  return laOfertaQueSigue(pilarMaxDeSuPlan + 1);
}

/**
 * EL CUPO QUE EL EQUIPO LE GUARDÓ — solo si es una oferta de hoy.
 *
 * `plan_reservado` lo marca una persona en la ficha del cliente, y durante
 * meses las opciones fueron los colores de la escalera vieja. Los clientes
 * anotados entonces siguen teniendo «verde» o «negro» guardado.
 *
 * ═══ POR QUÉ NO SE TRADUCE ═══
 *
 * Traducir un color a un ticket es exactamente el puente que `cuadroTickets`
 * quitó y documentó para que no vuelva: pegar las dos escaleras hizo que un
 * cliente de $497 figurara con $5.000 de instalación contratada. Acá el daño
 * sería al revés y a la vista del cliente: decirle «tu lugar está reservado ·
 * $497» de un precio que ya no se vende.
 *
 * Así que un valor viejo devuelve `null` y la pantalla ofrece el escalón que
 * sigue, que es verdad siempre. El valor viejo no se borra: sigue siendo lo
 * que esa persona eligió, y el equipo lo ve en la ficha.
 */
export function ofertaReservada(valor: string | null | undefined): Ticket | null {
  return valor === 'base' || valor === 'ascenso' || valor === 'instalacion' ? valor : null;
}
