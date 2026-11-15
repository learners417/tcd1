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

/*
 * ═══ LO QUE CAMBIÓ EL 15 DE NOVIEMBRE DE 2026 ══════════════════════════
 *
 * Dos cosas, y las dos vienen de afuera del código.
 *
 * 1 · LA INSTALACIÓN VALE 6.000, NO 5.000. Subió el 12 de noviembre y desde
 *     enero de 2027 va a 7.000. La Cima dejó de venderse suelta: va adentro
 *     del mastermind de 10.000.
 *
 * 2 · LA BASE ABRE LOS 90 DÍAS. Esto es más de fondo, y era una trampa a
 *     punto de dispararse. El escalón `base` cortaba en el día 12, con buen
 *     motivo en su momento. Pero el producto que hoy se cobra a 1.000 se
 *     llama, textualmente, «La Base · 90 días con Javo»: así figura en el
 *     Sistema, así lo dice la página y así se escribe en cada propuesta.
 *
 *     Hoy no se nota porque la puerta solo baja para quien tiene fecha de
 *     marcado, y a los que entran solos nadie los marca. O sea que el día
 *     que el equipo marque como `base` a alguien que pagó 1.000 —lo primero
 *     que uno haría— ese cliente se encuentra una pared en el día 13 de un
 *     programa que le vendieron de 90.
 *
 *     Lo que separa a los tres escalones no es cuánta app ve, es cuánto Javo
 *     tiene adentro: La Base son los 90 días con tres sesiones, la mentoría
 *     son los 90 días acompañados, y la instalación son los 90 días con todo
 *     montado por el equipo. Por eso el Camino se abre entero en los tres, y
 *     lo que se sigue repartiendo por escalón son las ENTREGAS del equipo,
 *     que es lo que esta pieza vino a arreglar y sigue haciendo intacto en
 *     `leTocanLasEntregas`.
 */
export const ESCALONES: Record<Escalon, { precio: string; hasta: string }> = {
  base: { precio: '$1.000', hasta: 'los 90 días, con tres sesiones' },
  ascenso: { precio: '$3.000', hasta: 'los 90 días, acompañado' },
  instalacion: { precio: '$6.000', hasta: 'los 90 días, con todo montado' },
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
  _dia: number,
  _sistema: number | null,
  _servicio?: string | null,
  _marcadoEn?: string | null,
): boolean {
  /*
   * El Camino se abre entero en los tres escalones, por el motivo del
   * encabezado: los tres venden 90 días y se diferencian en cuánto Javo
   * tiene adentro, no en cuánta app.
   *
   * La función se queda —con sus cuatro parámetros y sus llamadas intactas—
   * porque el día que haya un escalón que de verdad abra menos, el corte va
   * acá y no repartido por las pantallas. `SISTEMAS_DE_BASE` y
   * `ULTIMO_DIA_DE_BASE` siguen declarados abajo por lo mismo, y los usa
   * `queAbreCadaOferta` para contar lo que cada oferta entrega.
   */
  return true;
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
  _servicio?: string | null,
  _marcadoEn?: string | null,
): string | null {
  /*
   * Era el cartel del final de la primera etapa: «Hasta acá llega tu primera
   * etapa… lo que sigue se abre cuando lo decidas». Lo dibuja `Roadmap.tsx`
   * donde el Camino se cortaba.
   *
   * Con el Camino abierto entero, ese cartel pasa a ser una pared pintada
   * sobre una puerta abierta: el cliente ve sus noventa días y al lado un
   * aviso de que su acceso termina. Peor que el corte, porque le dice que
   * compró menos de lo que tiene.
   *
   * `null` es «no hay puerta», que es lo que Roadmap ya sabe leer.
   */
  return null;
}

/**
 * El último día que tiene abierto, dada la función que dice el sistema de cada
 * jornada. La pasa quien tiene el seed cargado.
 */
export function ultimoDiaDelEscalon(
  _sistemaDe: (dia: number) => number | null,
  _servicio?: string | null,
  _marcadoEn?: string | null,
): number | null {
  /*
   * `null` quiere decir «no tiene tope», y desde el 15 nov 2026 no lo tiene
   * ninguno de los tres: los tres abren los 90 días.
   *
   * Tiene que decir lo MISMO que `entraEnElEscalon`, y por eso se cambia
   * junto con ella. Dejarla devolviendo 12 mientras el Camino abría entero
   * era peor que cualquiera de las dos cosas por separado: la pantalla
   * mostraba los 90 días y el cartel decía «hasta el día 12».
   *
   * Hoy no la llama ninguna pantalla. Se queda por lo mismo que su hermana:
   * el día que haya un escalón que abra menos, el número se calcula acá.
   */
  return null;
}
