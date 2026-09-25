import type { Situacion } from '../components/onboarding/PasoSituacion';

/**
 * LOS CARRILES — lo que el onboarding decide, sin volver a preguntar nada.
 *
 * Un solo camino. Los tramos, los hitos y los grados son idénticos para todos:
 * lo que cambia es el contenido dentro de cada paso. Tres interruptores y una
 * bifurcación, todos derivados de lo que ya contestó.
 */

export interface Carriles {
  /** Instagram o LinkedIn: cambia ejemplos y formatos, nunca el orden. */
  canal: 'personas' | 'organizaciones' | 'ambas' | 'sin_definir';
  /** true = su colegio le prohíbe prueba social y promesa de resultado. */
  conLimites: boolean;
  /** true = tiene la agenda llena: suma el bloque de vaciar y el beneficio por hora. */
  agendaLlena: boolean;
  /** true = ya vendió al precio nuevo: la pauta puede abrir antes. */
  yaVendio: boolean;
  /** Cuántas personas de su red le contestarían. Alimenta el plan de caza. */
  redPropia: number;
  /** Por dónde arrancan los días 1 a 10. */
  entrada: 'informacion' | 'coraje' | 'permiso';
}

const LLENA_DESDE_HORAS_LIBRES = 6;

function num(v: string | undefined): number {
  const n = parseInt(String(v ?? '').replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(n) ? n : 0;
}

/** Lee lo que el cliente contestó en el onboarding. */
export function leerSituacion(): Situacion | null {
  try {
    const raw = localStorage.getItem('tcd_situacion');
    return raw ? (JSON.parse(raw) as Situacion) : null;
  } catch {
    return null;
  }
}

/**
 * Por dónde arranca.
 *
 * - permiso: se esconde detrás de la profesión. A veces es verdad y a veces es
 *   la mentira con mejor disfraz; la app no lo decide sola, lo separa el mentor.
 * - coraje: sabe qué hacer y no se anima. Es el caso más común.
 * - informacion: le falta saber. Construir primero le da confianza.
 *
 * Sin datos suficientes arranca por coraje, que es el orden que sirve para la
 * mayoría.
 */
export function entradaDe(s: Situacion | null): Carriles['entrada'] {
  if (!s) return 'coraje';
  const escudos = [s.garantia_estado === 'no_puedo', s.limites_certeza === 'creo_que_si'].filter(Boolean).length;
  if (escudos >= 2) return 'permiso';
  if (s.garantia_estado === 'miedo') return 'coraje';
  if (s.garantia_estado === 'nunca' && s.brecha.trim().length < 40) return 'informacion';
  return 'coraje';
}

export function carrilesDe(s: Situacion | null): Carriles {
  return {
    canal: s?.mercado ? s.mercado : 'sin_definir',
    conLimites: s?.limites_certeza === 'si_claros' || s?.garantia_estado === 'no_puedo',
    agendaLlena: s ? num(s.horas_libres) < LLENA_DESDE_HORAS_LIBRES : false,
    yaVendio: s?.vendio_al_precio === 'si',
    redPropia: num(s?.red_propia),
    entrada: entradaDe(s),
  };
}

/** Los carriles vigentes. Es lo que consulta el camino. */
export function carriles(): Carriles {
  return carrilesDe(leerSituacion());
}

/**
 * El ingreso que hay que reemplazar, no sumar. Es el nudo de quien tiene la
 * agenda llena: cada silla ocupada queda ocupada por años.
 */
export function ingresoAReemplazar(s: Situacion | null = leerSituacion()): number | null {
  if (!s) return null;
  const porSemana = num(s.consultantes_semana);
  const precio = num(s.precio_sesion);
  if (!porSemana || !precio) return null;
  return porSemana * precio * 4;
}
