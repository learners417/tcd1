/**
 * EL JUEGO DEL SUR — el mismo juego en los libros, en el papel y acá.
 *
 * Aprobado por Javo el 15 de noviembre de 2026 (claude/ARQUITECTURA-
 * COLECCION.md §6). Cinco mecánicas, iguales en los seis libros, en El
 * Camino en papel y en la app:
 *
 *   1 · TU VASO      cada día hecho, una piedra; cada paso afuera, dos.
 *   2 · EL MAPA      los 90 días en cinco paisajes: se pinta el día hecho.
 *   3 · LA RACHA     días hábiles seguidos con paso afuera.
 *   4 · EL SELLO     uno por tramo cerrado.
 *   5 · LAS PALABRAS diez escondidas en los libros, dos por libro.
 *
 * ═══ LO QUE ESTE MÓDULO NO INVENTA ═══
 *
 * EL SELLO POR TRAMO NO ES UN PREMIO NUEVO. La app ya tiene sus grados, que
 * se ganan por evidencia al cerrar un tramo: eso ES el sello. Sumarle una
 * insignia al lado sería el sexto mapa para el mismo viaje, que es justo lo
 * que hay que sacar. En el libro el sello es una pegatina, porque el papel
 * no tiene grados.
 *
 * EL COLOR DE CADA DÍA SALE DEL SEED, no de una tabla de rangos acá. Cada
 * jornada ya dice de qué sistema es; copiar los rangos a mano era tener dos
 * calendarios para pelearse.
 *
 * ═══ QUÉ ABREN LAS DIEZ PALABRAS (lo definía APP) ═══
 *
 * El juego de la colección termina en la ecuación de la última página del
 * Bosque: CAJA ÷ HORA = ___. La respuesta no es una palabra escondida: es
 * SU número. Con las diez, la app abre TU CUENTA: su caja del mes dividida
 * por sus horas, al lado de la del día 1.
 *
 * Se eligió eso y no un bonus, un descuento ni un contenido extra porque es
 * el único premio que ya se ganó: el número por el que hizo los 90 días. Y
 * no cuesta nada de construir — los dos números ya están medidos, el día 1
 * y el día 74.
 */

/* ═══════════════ 1 · TU VASO ═══════════════ */

export const VASO = 100;
export const PIEDRA_POR_DIA = 1;
export const PIEDRA_POR_PASO_AFUERA = 2;

export interface MarcaDelVaso {
  en: number;
  nombre: string;
}

export const MARCAS: MarcaDelVaso[] = [
  { en: 33, nombre: 'La orilla' },
  { en: 66, nombre: 'La travesía' },
  { en: 100, nombre: 'La otra orilla' },
];

export function piedras(diasHechos: number, pasosAfueraHechos: number): number {
  return diasHechos * PIEDRA_POR_DIA + pasosAfueraHechos * PIEDRA_POR_PASO_AFUERA;
}

/** En qué marca va: la última alcanzada, o null si todavía no llegó a la primera. */
export function marcaAlcanzada(piedras: number): MarcaDelVaso | null {
  let ultima: MarcaDelVaso | null = null;
  for (const m of MARCAS) if (piedras >= m.en) ultima = m;
  return ultima;
}

/* ═══════════════ 3 · LA RACHA ═══════════════
 *
 * Días hábiles seguidos con su paso afuera. Si se corta, NO vuelve a cero:
 * la regla de reenganche del Camino dice que se vuelve al primer día sin
 * terminar, y la racha dice lo mismo con otras palabras — por eso guarda
 * también la más larga, que no se pierde nunca.
 */
export interface Racha {
  /** Días seguidos hasta hoy. */
  actual: number;
  /** La más larga que consiguió. No baja nunca. */
  mejor: number;
}

export function rachaDe(diasConPaso: number[], diasPosibles: number[]): Racha {
  const hechos = new Set(diasConPaso);
  const orden = [...diasPosibles].sort((a, b) => a - b);
  let actual = 0;
  let mejor = 0;
  for (const d of orden) {
    if (hechos.has(d)) {
      actual += 1;
      if (actual > mejor) mejor = actual;
    } else {
      actual = 0;
    }
  }
  /* `actual` queda en la racha que termina en el último día posible. Para el
     que todavía no llegó a los últimos días, la racha que importa es la que
     termina en el último día que YA pasó: se cuenta hacia atrás desde ahí. */
  const ultimo = Math.max(...diasConPaso, 0);
  let corriendo = 0;
  for (const d of orden) {
    if (d > ultimo) break;
    corriendo = hechos.has(d) ? corriendo + 1 : 0;
  }
  return { actual: corriendo, mejor };
}

export const SI_SE_CORTA =
  'Si te caíste, no empiezas de nuevo. Vuelves al primer día sin terminar y haces solo su paso esencial.';

/* ═══════════════ 5 · LAS DIEZ PALABRAS ═══════════════
 *
 * Las diez del sistema, dos escondidas en las ilustraciones de cada libro
 * del sur. El orden es el de la colección, no alfabético.
 */
export interface PalabraEscondida {
  palabra: string;
  /** El libro en cuyas ilustraciones está. */
  libro: string;
}

export const PALABRAS: PalabraEscondida[] = [
  { palabra: 'HORA', libro: 'El lago' },
  { palabra: 'PRECIO', libro: 'El lago' },
  { palabra: 'PROTOCOLO', libro: 'La montaña' },
  { palabra: 'MODELO', libro: 'La montaña' },
  { palabra: 'CAJA', libro: 'El viento' },
  { palabra: 'SISTEMA', libro: 'El viento' },
  { palabra: 'LIBRES', libro: 'El río' },
  { palabra: 'IMPOSTOR', libro: 'El río' },
  { palabra: 'BOT', libro: 'El bosque' },
  { palabra: 'ESCÁNER', libro: 'El bosque' },
];

export const ECUACION = 'CAJA ÷ HORA = ';

/** La respuesta de la ecuación no es una palabra: es su número. */
export const LO_QUE_ABRE = {
  titulo: 'Tu cuenta',
  dice: 'Tu caja de este mes, dividida por tus horas. Al lado de la del día 1.',
} as const;

/* ═══════════════ LO QUE ESCRIBE EL CLIENTE ═══════════════ */

const CLAVE_PALABRAS = 'tcd_juego_palabras_v1';
const CLAVE_PASOS = 'tcd_juego_pasos_afuera_v1';

export function leerPalabras(): string[] {
  try {
    const raw = localStorage.getItem(CLAVE_PALABRAS);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

/** Marca una palabra como encontrada. Devuelve la lista nueva. */
export function encontrarPalabra(palabra: string): string[] {
  const limpia = palabra.trim().toUpperCase();
  const existe = PALABRAS.some((p) => p.palabra === limpia);
  if (!existe) return leerPalabras();
  const todas = new Set(leerPalabras());
  todas.add(limpia);
  const lista = [...todas];
  try { localStorage.setItem(CLAVE_PALABRAS, JSON.stringify(lista)); } catch { /* noop */ }
  return lista;
}

export function estanLasDiez(encontradas: string[]): boolean {
  return PALABRAS.every((p) => encontradas.includes(p.palabra));
}

/** Los días en que marcó su paso afuera. Es lo único que el paso pide. */
export function leerPasosAfuera(): number[] {
  try {
    const raw = localStorage.getItem(CLAVE_PASOS);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

export function marcarPasoAfuera(dia: number, hecho: boolean): number[] {
  const todos = new Set(leerPasosAfuera());
  if (hecho) todos.add(dia);
  else todos.delete(dia);
  const lista = [...todos].sort((a, b) => a - b);
  try { localStorage.setItem(CLAVE_PASOS, JSON.stringify(lista)); } catch { /* noop */ }
  return lista;
}
