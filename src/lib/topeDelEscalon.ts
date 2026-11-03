/**
 * EL TOPE POR ESCALÓN — hasta dónde llega lo que pagó.
 *
 * ═══ QUÉ PROBLEMA RESUELVE ═══
 *
 * `servicio_contratado` separaba qué DEBE el equipo de qué VE el cliente, y
 * cerraba un agujero real: antes, quien pagaba $497 de acceso aparecía en su
 * ficha como «la agencia instala 51 de 62 ítems».
 *
 * Pero la columna solo cambiaba el chat, cuántas sesiones 1-1 se le muestran y
 * qué se le ofrece al final. El Camino no la miraba. O sea que quien pagó la
 * primera etapa de $1.000 abría la app y tenía los 90 días completos, incluidos
 * los sistemas donde el equipo le monta la página, los formularios y las
 * automatizaciones de WhatsApp.
 *
 * Y las entregas del equipo lo empeoraban: el cron las dispara por el día del
 * trabajo, así que a las dos semanas le entraba a Lupe la tarea de montarle
 * la instalación entera a alguien que no la compró.
 *
 * ═══ CÓMO QUEDA ═══
 *
 *   base         $1.000  los sistemas 1 y 2: su reset y su programa
 *   ascenso      $3.000  los 90 días completos
 *   instalacion  $5.000  los 90 días y el equipo monta todo
 *
 * El corte de `base` es por SISTEMA y no por día, porque el Camino los
 * intercala: el día 11 es del sistema 3 y el 12 vuelve al 2. Cortar en el día
 * 10 le sacaba «Tu método aprobado y todo listo», que es con lo que cierra su
 * primera etapa.
 */
/*
 * Este módulo no importa nada. Lo usa el cron de Vercel, que corre en ESM puro
 * y arranca en frío: traer el seed del Camino y el cliente de Supabase para
 * preguntar un escalón son dos megas y una conexión que no necesita. Por eso
 * el sistema de la jornada entra por parámetro y lo resuelve quien ya tiene el
 * seed cargado, que es la pantalla.
 */

export type Escalon = 'base' | 'ascenso' | 'instalacion';

export const ESCALONES: Record<Escalon, { precio: string; hasta: string }> = {
  base: { precio: '$1.000', hasta: 'los sistemas 1 y 2' },
  ascenso: { precio: '$3.000', hasta: 'los 90 días completos' },
  instalacion: { precio: '$5.000', hasta: 'los 90 días, con todo montado' },
};

/** Los sistemas que entran en el escalón base: su reset y su programa. */
export const SISTEMAS_DE_BASE = [1, 2];

/**
 * Y el techo de día, que hace falta además del sistema.
 *
 * Los cinco sistemas no corren en bloques: el día 68 revisa su precio y el 80
 * su programa, así que los dos son del sistema 1 y del 2. Cortando solo por
 * sistema, el escalón base abría jornadas sueltas hasta el día 80 y dejaba el
 * medio cerrado, que es la peor de las dos cosas.
 *
 * El 12 es «Tu método aprobado y todo listo»: ahí cierra su primera etapa con
 * precio, método y oferta en una página.
 */
export const ULTIMO_DIA_DE_BASE = 12;

/**
 * El escalón del perfil. Lo que no reconocemos cae en `base`, igual que la
 * migración: mostrarle de menos a quien pagó se arregla con un mensaje, y
 * mostrarle de más hace trabajar al equipo gratis sin que nadie se entere.
 */
export function escalonDe(servicio?: string | null): Escalon {
  return servicio === 'ascenso' || servicio === 'instalacion' ? servicio : 'base';
}

/**
 * Si esa jornada está dentro de lo que pagó.
 *
 * Los días sin sistema —los fines de semana, la entrega técnica, los días de
 * atender— entran siempre: son el calendario, no el contenido.
 */
/**
 * Si el tope corre para esta ficha.
 *
 * `servicio_contratado` es `not null default 'base'`, así que sin esta pregunta
 * el tope se le aplicaría a todos los clientes de hoy —que están en 'base'
 * porque nadie los marcó— y perderían los días 13 al 90 de un día para el otro.
 * Manda el escalón MARCADO: sin fecha, el Camino abre completo.
 */
export function estaMarcado(marcadoEn?: string | null): boolean {
  return Boolean(marcadoEn);
}

export function entraEnElEscalon(
  dia: number,
  sistema: number | null,
  servicio?: string | null,
  marcadoEn?: string | null,
): boolean {
  if (!estaMarcado(marcadoEn)) return true;
  if (escalonDe(servicio) !== 'base') return true;
  if (dia > ULTIMO_DIA_DE_BASE) return false;
  return sistema === null || SISTEMAS_DE_BASE.includes(sistema);
}

/**
 * Si las entregas del equipo le corresponden: solo el escalón que las compró,
 * y solo cuando alguien lo marcó.
 *
 * Sin marcar no se disparan. Eso deja al equipo sin tareas automáticas hasta
 * que alguien diga quién compró la instalación, que es exactamente el estado
 * en el que estaba antes de que existieran: ninguna se perdía porque ninguna
 * salía.
 */
export function leTocanLasEntregas(
  servicio?: string | null,
  marcadoEn?: string | null,
): boolean {
  return estaMarcado(marcadoEn) && escalonDe(servicio) === 'instalacion';
}

/**
 * La puerta: lo que lee cuando toca una jornada que queda del otro lado.
 *
 * Dice lo que SÍ tiene y lo que sigue, nunca lo que le falta por no haber
 * pagado: el que terminó su primera etapa acaba de hacer un trabajo real.
 */
export function puertaDelEscalon(
  servicio?: string | null,
  marcadoEn?: string | null,
): string | null {
  if (!estaMarcado(marcadoEn) || escalonDe(servicio) !== 'base') return null;
  return 'Hasta acá llega tu primera etapa. Cerraste tu reset y tu programa: ' +
    'tienes precio, método y oferta en una página. Lo que sigue es tu captación, ' +
    'y se abre cuando lo decidas.';
}

/**
 * El último día que tiene abierto, dada la función que dice el sistema de cada
 * jornada. La pasa quien tiene el seed cargado.
 */
export function ultimoDiaDelEscalon(
  sistemaDe: (dia: number) => number | null,
  servicio?: string | null,
  marcadoEn?: string | null,
): number | null {
  if (!estaMarcado(marcadoEn) || escalonDe(servicio) !== 'base') return null;
  let ultimo = 0;
  for (let d = 1; d <= ULTIMO_DIA_DE_BASE; d += 1) {
    const s = sistemaDe(d);
    if (s !== null && SISTEMAS_DE_BASE.includes(s)) ultimo = d;
  }
  return ultimo || null;
}
