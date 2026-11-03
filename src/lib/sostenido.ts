/**
 * LO SOSTENIDO — lo que no se completa, se sostiene.
 *
 * "Dos mensajes por día" durante diez días no es una tarea: si aparece como
 * tarea del día, a la tercera vez es empapelado y deja de leerse. Se mide por
 * racha, que es la forma que la cabeza entiende sin esfuerzo.
 *
 * No hace falta modelo de datos nuevo: vive en el mismo set de progreso que ya
 * funciona y ya se sincroniza, con la fecha adentro de la clave. Es
 * autoreportado, que es lo que realmente es — nadie puede verificar desde
 * afuera que mandó dos mensajes.
 */

const CLAVE_SET = 'tcd_hoja_ruta_v2';

export type Sostenido = 'mensajes' | 'publicar';

/** La fecha local en formato AAAA-MM-DD. Nunca UTC: la racha es del usuario. */
export function hoyLocal(d: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** La clave de un día de algo sostenido. */
export const claveSostenido = (que: Sostenido, fecha: string): string =>
  `sostenido:${que}:${fecha}`;

function leerSet(): Set<string> {
  try {
    const raw = localStorage.getItem(CLAVE_SET);
    return new Set<string>(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set<string>();
  }
}

function guardarSet(s: Set<string>): void {
  try {
    localStorage.setItem(CLAVE_SET, JSON.stringify([...s]));
  } catch {
    /* sin almacenamiento: la racha no se guarda, pero nada se rompe */
  }
}

/** ¿Ya lo hizo hoy? */
export function hechoHoy(que: Sostenido, set?: Set<string>): boolean {
  return (set ?? leerSet()).has(claveSostenido(que, hoyLocal()));
}

/** Marca o desmarca el día de hoy. Devuelve el estado nuevo. */
export function marcarHoy(que: Sostenido, valor: boolean): boolean {
  const s = leerSet();
  const k = claveSostenido(que, hoyLocal());
  if (valor) s.add(k);
  else s.delete(k);
  guardarSet(s);
  return valor;
}

/**
 * Días seguidos hasta hoy. Si hoy todavía no lo hizo pero ayer sí, la racha
 * sigue viva: recién se corta cuando pasa un día entero sin marcar.
 */
export function racha(que: Sostenido, set?: Set<string>, desde: Date = new Date()): number {
  const s = set ?? leerSet();
  const d = new Date(desde);
  let n = 0;

  // Si hoy no está marcado, la racha se cuenta desde ayer.
  if (!s.has(claveSostenido(que, hoyLocal(d)))) {
    d.setDate(d.getDate() - 1);
  }
  // Hasta 400 días: suficiente para cualquier camino y con tope duro.
  for (let i = 0; i < 400; i++) {
    if (!s.has(claveSostenido(que, hoyLocal(d)))) break;
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

/**
 * EL ÁNGULO DEL DÍA — no se guarda, se calcula.
 *
 * Rotación de catorce días del calendario de contenido. En un mes son cinco de
 * venta directa y cuatro de alcance masivo, que es el reparto probado.
 */
const ROTACION = [
  'Errores del mercado',
  'Alcance masivo',
  'Prueba social',
  'Venta directa',
  'Vinculación',
  'El problema',
  'Venta directa',
  'Objeciones',
  'Alcance masivo',
  'Autoridad',
  'Demostración',
  'Storytelling',
  'Controversia',
  'Comparación',
] as const;

/** Ángulos que no se pueden usar cuando el colegio profesional los prohíbe. */
const PROHIBIDOS_CON_LIMITES = new Set(['Prueba social']);

/** Con qué se reemplaza un ángulo apagado, sin perder el efecto de autoridad. */
const REEMPLAZO = 'Demostración';

/**
 * El ángulo que le toca hoy.
 *
 * @param dia        día del programa, base 1
 * @param conLimites true si su colegio le prohíbe prueba social y promesa
 * @param tienePrueba true si ya entregó y tiene testimonios propios
 */
export function anguloDelDia(
  dia: number,
  conLimites = false,
  tienePrueba = false,
): string {
  if (dia < 1) return ROTACION[0];
  const base = ROTACION[(dia - 1) % ROTACION.length];

  // En el primer mes todavía no vendió: no tiene prueba social que mostrar.
  // Y con límites de colegio no la va a tener nunca.
  if (PROHIBIDOS_CON_LIMITES.has(base) && (conLimites || !tienePrueba)) {
    return REEMPLAZO;
  }
  return base;
}
