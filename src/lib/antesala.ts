/**
 * LA ANTESALA — el detox que abre la sesión 1.
 *
 * ═══ QUÉ PROBLEMA RESUELVE ═══
 *
 * El Camino arrancaba en el día 1 con una sesión de 75 minutos: diez preguntas
 * de medición, el pacto, la hora real neta. Eso le pide claridad y energía a
 * alguien que llega agotado, y el que llega agotado es la mayoría: por eso
 * compra.
 *
 * Lo que pasaba entonces es lo que no queremos. Abría la app cansado, hacía la
 * mitad de la primera sesión, la dejaba, y al otro día la app le mostraba una
 * jornada pendiente. Una más. Y la fatiga que lo trajo hasta acá ahora también
 * la produce la app.
 *
 * Así que antes del día 1 hay cinco a siete días que no construyen nada: solo
 * descansan.
 *
 * ═══ POR QUÉ LO DISEÑA ÉL ═══
 *
 * Porque si le decimos a qué hora dormir y qué comer, sumamos una obligación
 * más a alguien que ya tiene de sobra, y la va a cumplir dos días. El día 4
 * del Camino usa la misma regla y lo dice así: «nadie te va a decir qué comer
 * ni a qué hora levantarte».
 *
 * Acá elige de tres a cinco movidas, las escribe con sus palabras y con un
 * número, y las tilda un día por día. Son suyas: eso es lo que las sostiene.
 *
 * ═══ POR QUÉ CINCO Y NO UNO ═══
 *
 * Porque dormir una noche no cambia nada, y porque el límite de arriba también
 * importa: a los siete días se cierra sola. Sin ese techo, descansar se
 * convierte en la forma más cómoda de no empezar.
 */

/** Las áreas entre las que elige. Son seis para que elegir sea decidir. */
export interface AreaDelDetox {
  id: string;
  nombre: string;
  /** La pregunta que contesta al elegirla. Siempre pide un número o una hora. */
  pregunta: string;
  /** Un ejemplo, para que no arranque de una página en blanco. */
  ejemplo: string;
}

export const AREAS: AreaDelDetox[] = [
  {
    id: 'sueno',
    nombre: 'Tu sueño',
    pregunta: '¿A qué hora apagas la luz?',
    ejemplo: 'Apago la luz a las 23:30, con alarma puesta a las 23:15 para ir cerrando.',
  },
  {
    id: 'pantallas',
    nombre: 'Tus pantallas',
    pregunta: '¿A qué hora dejas el celular, y dónde duerme?',
    ejemplo: 'A las 22:00 el celular queda cargando en la cocina.',
  },
  {
    id: 'alimentacion',
    nombre: 'Tu alimentación',
    pregunta: '¿Qué cambias, y en qué comida?',
    ejemplo: 'Desayuno algo de verdad antes del primer café.',
  },
  {
    id: 'movimiento',
    nombre: 'Tu movimiento',
    pregunta: '¿Qué haces, cuántos minutos y a qué hora?',
    ejemplo: 'Camino 25 minutos al aire libre después de almorzar.',
  },
  {
    id: 'silencio',
    nombre: 'Tu silencio',
    pregunta: '¿Cuántos minutos sin nada, y cuándo?',
    ejemplo: 'Diez minutos sentado, sin música y sin teléfono, antes de atender.',
  },
  {
    id: 'agua',
    nombre: 'Tu agua',
    pregunta: '¿Cuánto tomas al despertar?',
    ejemplo: 'Un vaso grande de agua antes de cualquier otra cosa.',
  },
];

export const areaPorId = new Map(AREAS.map((a) => [a.id, a]));

/** Una movida elegida: el área, y lo que él escribió. */
export interface Movida {
  area: string;
  loQueHago: string;
}

export interface Antesala {
  /** Las tres a cinco movidas que eligió y escribió. */
  protocolo?: Movida[];
  /** Las fechas ISO en que tildó. Una por día. */
  dias?: string[];
  /** La fecha en que se cerró. Es la que sella el inicio del Camino. */
  cerrada?: string;
}

export const MOVIDAS_MINIMAS = 3;
export const MOVIDAS_MAXIMAS = 5;
export const DIAS_MINIMOS = 5;
export const DIAS_MAXIMOS = 7;

/*
 * Las fechas se arman en LOCAL, no con toISOString().
 *
 * `toISOString()` devuelve UTC. En Argentina —UTC−3— de las 21:00 en adelante
 * eso da la fecha del día siguiente. O sea que el cliente que tildaba su día
 * de descanso a la noche —que es justo cuando se tilda «apagué la luz a las
 * 23:30»— marcaba mañana, y hoy le quedaba sin marcar. Y «ayer» se corría
 * igual, así que tampoco lo podía recuperar.
 */
const enLocal = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const hoyISO = (d = new Date()) => enLocal(d);

const diaAntes = (iso: string) => {
  const [a, m, dd] = iso.split('-').map(Number);
  const d = new Date(a, (m ?? 1) - 1, dd ?? 1);
  d.setDate(d.getDate() - 1);
  return enLocal(d);
};

/** Las movidas que valen: las que tienen área conocida y algo escrito. */
export function movidasValidas(a: Antesala | null | undefined): Movida[] {
  return (a?.protocolo ?? []).filter(
    (m) => areaPorId.has(m.area) && m.loQueHago.trim().length >= 8,
  );
}

/**
 * El protocolo está listo con tres a cinco movidas escritas.
 *
 * El techo de cinco es tan importante como el piso de tres: el que elige las
 * seis se armó una semana más exigente que la que tiene hoy, y la abandona el
 * miércoles.
 */
export function protocoloListo(a: Antesala | null | undefined): boolean {
  const n = movidasValidas(a).length;
  return n >= MOVIDAS_MINIMAS && n <= MOVIDAS_MAXIMAS;
}

/** Los días tildados, sin repetidos. */
export function diasHechos(a: Antesala | null | undefined): number {
  return new Set(a?.dias ?? []).size;
}

/**
 * Hoy se puede tildar si el protocolo está escrito y hoy todavía no se tildó.
 *
 * Se acepta tildar el día de ayer, una sola vez: el que descansó y se olvidó
 * de marcarlo descansó igual, y hacerle perder el día enseña a no volver.
 */
export function sePuedeTildar(
  a: Antesala | null | undefined,
  fecha: string = hoyISO(),
): boolean {
  if (!protocoloListo(a) || cerrada(a)) return false;
  const hechos = new Set(a?.dias ?? []);
  if (hechos.has(fecha)) return false;
  return fecha === hoyISO() || fecha === diaAntes(hoyISO());
}

/** Tilda una fecha y devuelve la antesala nueva. Nunca pisa lo que ya había. */
export function tildar(
  a: Antesala | null | undefined,
  fecha: string = hoyISO(),
): Antesala {
  const base: Antesala = { ...(a ?? {}) };
  if (!sePuedeTildar(base, fecha)) return base;
  const dias = [...new Set([...(base.dias ?? []), fecha])].sort();
  const siguiente: Antesala = { ...base, dias };
  // A los siete se cierra sola: el techo es parte del método.
  if (dias.length >= DIAS_MAXIMOS) siguiente.cerrada = fecha;
  return siguiente;
}

/** Se cerró a mano, o se cerró sola al séptimo día. */
export function cerrada(a: Antesala | null | undefined): boolean {
  return Boolean(a?.cerrada);
}

/**
 * La sesión 1 abre con cinco días hechos. No hace falta cerrarla: el que quiere
 * llegar a siete sigue tildando con el Camino ya abierto.
 */
export function abreLaSesionUno(a: Antesala | null | undefined): boolean {
  return cerrada(a) || diasHechos(a) >= DIAS_MINIMOS;
}

/**
 * Quien ya cerró su primera jornada no vuelve atrás. La antesala es la puerta
 * de entrada, no un paso que se le agrega a mitad de camino a quien ya entró.
 *
 * ═══ Y A QUIEN COMPRÓ CINCO DÍAS NO LE TOCA NUNCA ═══
 *
 * La antesala existe porque el que compra noventa días llega agotado y la
 * primera sesión le pide claridad. Ese razonamiento vale para los noventa
 * días. Para el tramo de cinco, se da vuelta entero: su acceso dura lo mismo
 * que la antesala, así que descansar primero le consume la compra completa.
 * Lo que la página le promete para hoy le llegaría el día seis, con el acceso
 * por vencer.
 *
 * Así que en el tramo corto se entra directo a la sesión 1. El descanso no
 * desaparece: vuelve a estar disponible el día que sube al Camino de noventa.
 */
export function leToca(
  a: Antesala | null | undefined,
  yaCerroElDiaUno: boolean,
  tramoCorto = false,
): boolean {
  if (tramoCorto) return false;
  return !yaCerroElDiaUno && !abreLaSesionUno(a);
}

/** Qué le falta, en positivo y con el número exacto. */
export function faltaEnLaAntesala(a: Antesala | null | undefined): string {
  const n = movidasValidas(a).length;
  if (n < MOVIDAS_MINIMAS) {
    const faltan = MOVIDAS_MINIMAS - n;
    return faltan === 1
      ? 'Elige una movida más y escribe qué vas a hacer.'
      : `Elige ${faltan} movidas más y escribe qué vas a hacer en cada una.`;
  }
  if (n > MOVIDAS_MAXIMAS) {
    return `Deja ${n - MOVIDAS_MAXIMAS} para más adelante: cinco es el techo de esta semana.`;
  }
  const hechos = diasHechos(a);
  if (hechos >= DIAS_MINIMOS) return '';
  const faltan = DIAS_MINIMOS - hechos;
  return faltan === 1
    ? 'Te falta un día para que se abra tu sesión 1.'
    : `Te faltan ${faltan} días para que se abra tu sesión 1.`;
}

/** La fecha con la que arranca el Camino: el día en que la antesala quedó lista. */
export function fechaQueSellaElInicio(a: Antesala | null | undefined): string | null {
  if (a?.cerrada) return a.cerrada;
  const dias = [...new Set(a?.dias ?? [])].sort();
  return dias.length >= DIAS_MINIMOS ? dias[DIAS_MINIMOS - 1] : null;
}
