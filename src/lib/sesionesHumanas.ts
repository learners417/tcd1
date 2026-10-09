/**
 * LAS SESIONES CON PERSONAS — lo que sostiene la promesa.
 *
 * Lo que se vende es acompañamiento: la sesión de arranque y las mentorías
 * grupales tres veces por semana durante 90 días. Era lo único de la oferta
 * que no dejaba rastro: no había tabla, ni pantalla, ni registro de una sola.
 *
 * Acá vive la regla —cuántas le tocan, cuántas tuvo, hace cuánto que no tiene
 * una— y las frases con las que el equipo lo lee. Lógica pura: se prueba sola.
 */
import { TICKETS, servicioDe, type Ticket } from './cuadroTickets';

export type TipoDeSesion = 'arranque' | 'grupal' | 'uno_a_uno';

export interface Sesion {
  id?: string;
  fecha: string;
  tipo: TipoDeSesion;
  quien_la_dio: string;
  notas?: string | null;
  pendiente?: string | null;
  minutos?: number | null;
}

export const COMO_SE_LLAMA: Record<TipoDeSesion, string> = {
  arranque: 'Sesión de arranque',
  grupal: 'Mentoría grupal',
  uno_a_uno: 'Sesión uno a uno',
};

/**
 * Lo que su servicio le da.
 *
 * El Ascenso son los 90 días completos: la de arranque y tres grupales por
 * semana. La Base son tres uno a uno, una por mes. La Instalación, una sola:
 * lo demás lo monta el equipo por él.
 */
export interface LoQueLeToca {
  arranque: boolean;
  grupalesPorSemana: number;
  unoAUnoEnTotal: number;
  /** Cada cuántos días debería tener alguna. Pasado eso, algo se está cayendo. */
  cadaCuantosDias: number;
}

export const LE_TOCA: Record<Ticket, LoQueLeToca> = {
  base: { arranque: false, grupalesPorSemana: 0, unoAUnoEnTotal: 3, cadaCuantosDias: 30 },
  ascenso: { arranque: true, grupalesPorSemana: 3, unoAUnoEnTotal: 1, cadaCuantosDias: 7 },
  instalacion: { arranque: true, grupalesPorSemana: 0, unoAUnoEnTotal: 1, cadaCuantosDias: 30 },
};

export function leToca(servicio: string | null | undefined): LoQueLeToca {
  return LE_TOCA[servicioDe(servicio)];
}

const DIA = 24 * 60 * 60 * 1000;

function aFecha(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Las sesiones de la más nueva a la más vieja. */
export function ordenadas(sesiones: Sesion[]): Sesion[] {
  return [...sesiones].sort((a, b) => b.fecha.localeCompare(a.fecha));
}

/** La última que tuvo, si tuvo alguna. */
export function ultima(sesiones: Sesion[]): Sesion | null {
  return ordenadas(sesiones)[0] ?? null;
}

/**
 * Hace cuántos días que no tiene una.
 *
 * Sin ninguna devuelve null: no es que se haya atrasado, es que todavía no
 * empezó. Quien llama decide qué hacer con eso.
 */
export function diasSinSesion(sesiones: Sesion[], hoy: string): number | null {
  const u = ultima(sesiones);
  if (!u) return null;
  return Math.max(0, Math.floor((aFecha(hoy).getTime() - aFecha(u.fecha).getTime()) / DIA));
}

/**
 * Los días sin sesión que de verdad se le pueden reclamar al equipo.
 *
 * Los días en que el soporte estaba cerrado y avisado no cuentan: el cliente
 * sabía desde que compró que esos días no había nadie. Sin este descuento,
 * cada enero enciende en amarillo a toda la cartera por una ventana anunciada.
 *
 * Quien llama pasa los días avisados; acá no se consulta nada.
 */
export function diasReclamables(
  sesiones: Sesion[],
  hoy: string,
  diasAvisados = 0,
): number | null {
  const dias = diasSinSesion(sesiones, hoy);
  if (dias === null) return null;
  return Math.max(0, dias - Math.max(0, diasAvisados));
}

/**
 * Si se está cayendo el acompañamiento que compró.
 *
 * El margen es generoso a propósito —el doble de lo que le toca— porque una
 * semana puede saltarse por mil razones legítimas. Lo que no puede pasar
 * desapercibido es que pasen dos o tres.
 */
export function seEstaCayendo(
  sesiones: Sesion[],
  servicio: string | null | undefined,
  hoy: string,
  diasAvisados = 0,
): boolean {
  const dias = diasReclamables(sesiones, hoy, diasAvisados);
  if (dias === null) return false;
  return dias > leToca(servicio).cadaCuantosDias * 2;
}

/** Cuántas tuvo de cada tipo. */
export function cuantasDe(sesiones: Sesion[], tipo: TipoDeSesion): number {
  return sesiones.filter((s) => s.tipo === tipo).length;
}

/**
 * Cuántas dio una persona en los últimos siete días.
 *
 * Es lo que la barra de carga de «Mi rol» necesita para no mentir: antes medía
 * solo las cuentas en instalación, así que alguien que dio nueve sesiones en la
 * semana aparecía con la semana vacía.
 *
 * Compara por nombre porque es lo que se guarda al cargarla. Si dos personas
 * del equipo se llaman igual, las sesiones de ambas cuentan para las dos: es
 * preferible a no contar ninguna, y el día que haya dos Lupe se guarda el id.
 */
export function cuantasDioEstaSemana(
  sesiones: Sesion[],
  quien: string | null | undefined,
  hoy: string,
): number {
  if (!quien) return 0;
  const nombre = quien.trim().toLowerCase();
  if (!nombre) return 0;
  return sesiones.filter((s) => {
    if ((s.quien_la_dio ?? '').trim().toLowerCase() !== nombre) return false;
    const dias = Math.floor((aFecha(hoy).getTime() - aFecha(s.fecha).getTime()) / DIA);
    return dias >= 0 && dias < 7;
  }).length;
}

/**
 * Cómo viene su acompañamiento, en una línea.
 *
 * Es lo que el equipo lee en la ficha antes de escribirle.
 */
export function comoViene(
  sesiones: Sesion[],
  servicio: string | null | undefined,
  hoy: string,
): string {
  if (sesiones.length === 0) {
    const t = leToca(servicio);
    return t.arranque
      ? 'Todavía no tuvo su sesión de arranque.'
      : 'Todavía no tuvo ninguna sesión.';
  }

  const dias = diasSinSesion(sesiones, hoy) ?? 0;
  const total = sesiones.length;
  const cuenta = `${total} ${total === 1 ? 'sesión' : 'sesiones'}`;

  if (seEstaCayendo(sesiones, servicio, hoy)) {
    return `${cuenta}, pero hace ${dias} días que no tiene una. Está dejando de recibir lo que compró.`;
  }
  if (dias === 0) return `${cuenta}. La última, hoy.`;
  if (dias === 1) return `${cuenta}. La última, ayer.`;
  return `${cuenta}. La última, hace ${dias} días.`;
}

/**
 * Lo que le falta de lo que compró.
 *
 * No es un reproche al cliente: es lo que el equipo todavía le debe.
 */
export function loQueSeLeDebe(
  sesiones: Sesion[],
  servicio: string | null | undefined,
): string[] {
  const t = leToca(servicio);
  const falta: string[] = [];

  if (t.arranque && cuantasDe(sesiones, 'arranque') === 0) {
    falta.push('su sesión de arranque');
  }
  const unoAUno = cuantasDe(sesiones, 'uno_a_uno');
  if (unoAUno < t.unoAUnoEnTotal) {
    const n = t.unoAUnoEnTotal - unoAUno;
    falta.push(n === 1 ? '1 sesión uno a uno' : `${n} sesiones uno a uno`);
  }
  return falta;
}

/** Las doce semanas que dura el Camino. */
export const SEMANAS_DEL_CAMINO = 12;

/**
 * Cuántas sesiones se le prometieron en total por los noventa días.
 *
 * Es la mitad de la garantía que no se medía. El cierre de cuentas verificaba
 * con datos lo que el CLIENTE entregó —jornadas y atrasos— y daba por hecho
 * lo del equipo. Si el cliente cumplió su parte y el equipo no dio las
 * sesiones, la garantía no puede exigirle nada a él.
 */
export function loQuePrometimos(servicio: string | null | undefined): number {
  const t = leToca(servicio);
  return (t.arranque ? 1 : 0)
    + t.grupalesPorSemana * SEMANAS_DEL_CAMINO
    + t.unoAUnoEnTotal;
}

/**
 * Si el equipo cumplió su parte del acompañamiento.
 *
 * El margen: se cumple con el 80 % de lo prometido. No es una licencia para
 * dar menos, es reconocer que una grupal que se cae por un feriado no rompe
 * la promesa, y que exigir el 100 % exacto convierte cualquier semana con una
 * baja en un incumplimiento formal. Por debajo de ahí el cliente recibió
 * visiblemente menos de lo que compró.
 */
export const CUMPLE_CON = 0.8;

export function cumplimosNuestraParte(
  sesiones: Sesion[],
  servicio: string | null | undefined,
): boolean {
  const prometidas = loQuePrometimos(servicio);
  if (prometidas === 0) return true;
  return sesiones.length >= Math.ceil(prometidas * CUMPLE_CON);
}

/** Lo que incluye su servicio, dicho como se le dijo al venderlo. */
export function queIncluye(servicio: string | null | undefined): string {
  const t = leToca(servicio);
  const partes: string[] = [];
  if (t.arranque) partes.push('la sesión de arranque');
  if (t.grupalesPorSemana > 0) {
    partes.push(`${EN_PALABRAS[t.grupalesPorSemana] ?? t.grupalesPorSemana} mentorías grupales por semana`);
  }
  if (t.unoAUnoEnTotal > 0) {
    partes.push(t.unoAUnoEnTotal === 1
      ? 'una sesión uno a uno'
      : `${EN_PALABRAS[t.unoAUnoEnTotal] ?? t.unoAUnoEnTotal} sesiones uno a uno`);
  }
  const nombre = TICKETS[servicioDe(servicio)].nombre;
  return partes.length ? `${nombre} incluye ${enumerar(partes)}.` : `${nombre}.`;
}

const EN_PALABRAS: Record<number, string> = {
  1: 'una', 2: 'dos', 3: 'tres', 4: 'cuatro', 5: 'cinco', 6: 'seis',
};

/** "A, B y C" — como lo escribiría una persona, no "A y B y C". */
function enumerar(partes: string[]): string {
  if (partes.length <= 1) return partes[0] ?? '';
  return `${partes.slice(0, -1).join(', ')} y ${partes[partes.length - 1]}`;
}

/** "9 de octubre" — la fecha como la diría una persona. */
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

export function enPalabras(iso: string | null | undefined): string {
  if (!iso) return '';
  const f = aFecha(iso);
  return `${f.getDate()} de ${MESES[f.getMonth()]}`;
}
