/**
 * EL PRÓXIMO ENCUENTRO — cuándo es la próxima grupal y por dónde se entra.
 *
 * ═══ QUÉ RESUELVE ═══
 *
 * El cliente compró acompañamiento con encuentros en vivo y la pantalla de
 * Hoy no los nombraba. Para saber cuándo era el próximo tenía que ir a la
 * comunidad, abrir Eventos y leer una lista: tres pantallas para un dato de
 * una línea, justo el dato que se olvida.
 *
 * ═══ POR QUÉ DOS FUENTES Y NO UNA ═══
 *
 * La app YA sabía de las grupales: `sesiones_grupales` existe desde julio, la
 * carga el equipo desde el Admin y `proximasGrupales()` las lee. Verificado
 * el 19 de noviembre: lo que faltaba no era el dato, era que Hoy lo mirara.
 *
 * Pero la tabla puede estar vacía —los nueve encuentros de noviembre y
 * diciembre se cargaron como eventos de la comunidad, en el Sistema, no acá—
 * y una tarjeta que dice «no hay encuentros» cuando el miércoles sí hay uno
 * es peor que no tener tarjeta. Así que hay dos fuentes, en este orden:
 *
 *   1 · lo que el equipo cargó en `sesiones_grupales` (es la verdad: tiene
 *       tema, duración y su propio link)
 *   2 · y si ahí no hay nada, el calendario fijo de abajo
 *
 * El calendario fijo tiene FECHA DE CORTE a propósito. Un horario escrito en
 * el código sobrevive al acuerdo que lo puso: pasado el 10 de diciembre esta
 * función devuelve `null` y la tarjeta desaparece, en vez de citar al cliente
 * a una reunión que ya no existe. Para que siga, se renueva la fecha acá —una
 * línea— o se cargan las sesiones en el Admin, que es el camino bueno.
 */

/**
 * Los encuentros tal como están acordados hasta el 10 de diciembre de 2026:
 * martes, miércoles y jueves a las 13:00 de Argentina, en la misma sala.
 */
export const ENCUENTROS_ACORDADOS = {
  /** Día de la semana, como lo cuenta JavaScript: 2 martes, 3 miércoles, 4 jueves. */
  dias: [2, 3, 4] as const,
  /** 13:00 de Argentina, que no cambia de huso en el año: 16:00 UTC. */
  horaUTC: 16,
  /** Hasta cuándo vale lo acordado. Después, la tarjeta no se dibuja. */
  hasta: '2026-12-10',
  /** La sala fija, la misma que está en los nueve eventos de la comunidad. */
  link: 'https://meet.google.com/ouj-rtyr-ugn',
} as const;

export interface Encuentro {
  /** Cuándo empieza, en tiempo real. */
  cuando: Date;
  /** Por dónde se entra. */
  link: string;
  /** De dónde salió: lo cargado por el equipo o el calendario acordado. */
  fuente: 'cargado' | 'acordado';
}

/**
 * El margen hacia atrás: un encuentro que arrancó hace media hora TODAVÍA es
 * el de ahora, y es justo cuando el cliente busca el link. Mismo criterio que
 * `proximasGrupales`, que pide desde dos horas atrás.
 */
const MARGEN_MS = 2 * 60 * 60 * 1000;

/**
 * El próximo encuentro del calendario acordado, o `null` si ya se pasó la
 * fecha de corte.
 *
 * Se buscan catorce días hacia adelante y no «el próximo martes»: con tres
 * días por semana, calcular cuál toca a mano es donde entran los errores de
 * borde (hoy es jueves a las 14, el próximo es el martes que viene).
 */
export function proximoEncuentroAcordado(ahora: Date = new Date()): Encuentro | null {
  const corte = new Date(`${ENCUENTROS_ACORDADOS.hasta}T23:59:59Z`).getTime();
  const desde = ahora.getTime() - MARGEN_MS;
  for (let i = 0; i <= 14; i++) {
    const d = new Date(ahora.getTime() + i * 86400000);
    const cuando = new Date(Date.UTC(
      d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(),
      ENCUENTROS_ACORDADOS.horaUTC, 0, 0,
    ));
    if (!(ENCUENTROS_ACORDADOS.dias as readonly number[]).includes(cuando.getUTCDay())) continue;
    if (cuando.getTime() < desde) continue;
    if (cuando.getTime() > corte) return null;
    return { cuando, link: ENCUENTROS_ACORDADOS.link, fuente: 'acordado' };
  }
  return null;
}

/**
 * Cómo se dice la fecha, en la hora de Argentina y en castellano neutro.
 *
 * El huso va escrito: sin él, el cliente de México leería las 13:00 de su
 * reloj y entraría tres horas tarde. `Intl` lo resuelve sin tabla propia.
 */
export function cuandoSeDice(cuando: Date): string {
  /*
   * SIN EL MES, Y MEDIDO.
   *
   * La primera versión decía «martes, 3 de noviembre, 13:00 de Argentina» y
   * el medidor la marcó: en 360 px se desbordaba de su renglón. El mes no
   * agrega nada —nunca se nombra un encuentro a más de catorce días— y el
   * huso sí, porque el cliente de México tiene que restar.
   */
  const partes = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
    timeZone: 'America/Argentina/Buenos_Aires',
  }).formatToParts(cuando);
  const de = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? '';
  return `${de('weekday')} ${de('day')} · ${de('hour')}:${de('minute')} de Argentina`;
}
