/**
 * LA BITÁCORA — qué se probó, qué pasó con el número, y si ganó o perdió.
 *
 * El problema que resuelve: los números de la semana vivían en una sola
 * clave que se pisaba cada viernes. La semana pasada no existía. Sin eso
 * nadie aprende de una semana a la otra: se repite el mismo creativo que ya
 * había fallado, se apaga uno que venía mejorando, y toda conversación sobre
 * la campaña vuelve a ser una opinión en vez de un hecho.
 *
 * Tres columnas, que es lo que pide el método: qué probaste, qué pasó con el
 * número, y la etiqueta. Nada más.
 */

import type { EstadoAnuncio } from './decidirCampana';

export interface EntradaBitacora {
  /** Semana ISO: '2026-W31'. Es la clave: una fila por semana y anuncio. */
  semana: string;
  /** Qué anuncio, de los tres. */
  indice: number;
  /** El nombre de la fórmula con la que se escribió. */
  formula: string;
  /** Qué se cambió respecto de la semana anterior, si se cambió algo. */
  queSeProbo: string;
  gasto: number;
  conversaciones: number;
  agendas: number;
  ventas: number;
  /** El veredicto que dio el motor esa semana. */
  estado: EstadoAnuncio;
  /** Cuándo se anotó. */
  anotadaEn: string;
}

export interface FilaBitacora extends EntradaBitacora {
  /** Costo por conversación de esa semana, o null. */
  costoConversacion: number | null;
  /** Costo por venta de esa semana, o null. */
  costoVenta: number | null;
  /** Cómo se movió el costo por conversación contra la semana anterior. */
  tendencia: 'mejora' | 'empeora' | 'igual' | null;
}

/** La semana ISO de una fecha: '2026-W31'. */
export function semanaISO(d = new Date()): string {
  const f = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // Jueves de esa semana: define el año ISO.
  const dia = f.getUTCDay() || 7;
  f.setUTCDate(f.getUTCDate() + 4 - dia);
  const eneUno = new Date(Date.UTC(f.getUTCFullYear(), 0, 1));
  const n = Math.ceil(((f.getTime() - eneUno.getTime()) / 86400000 + 1) / 7);
  return `${f.getUTCFullYear()}-W${String(n).padStart(2, '0')}`;
}

const div = (a: number, b: number): number | null => (b > 0 ? a / b : null);

/**
 * Anota la semana. Si esa semana y ese anuncio ya estaban, se reemplaza.
 *
 * Reemplazar y no duplicar es a propósito: durante el viernes el sanador
 * carga, corrige y vuelve a cargar. Lo que queda es el último estado, no
 * cinco filas del mismo día.
 */
export function anotarSemana(
  bitacora: EntradaBitacora[],
  entradas: EntradaBitacora[],
): EntradaBitacora[] {
  const fuera = new Set(entradas.map((e) => `${e.semana}|${e.indice}`));
  return [...bitacora.filter((b) => !fuera.has(`${b.semana}|${b.indice}`)), ...entradas]
    .sort((a, b) => (a.semana === b.semana ? a.indice - b.indice : a.semana < b.semana ? 1 : -1));
}

/**
 * La bitácora lista para leer: con los costos calculados y la tendencia
 * contra la semana anterior del MISMO anuncio.
 */
export function leerBitacora(bitacora: EntradaBitacora[]): FilaBitacora[] {
  const ordenada = [...bitacora].sort((a, b) =>
    a.semana === b.semana ? a.indice - b.indice : a.semana < b.semana ? -1 : 1);

  const anterior = new Map<number, number | null>();
  const filas: FilaBitacora[] = ordenada.map((e) => {
    const costoConversacion = div(e.gasto, e.conversaciones);
    const prev = anterior.get(e.indice) ?? null;
    let tendencia: FilaBitacora['tendencia'] = null;
    if (costoConversacion !== null && prev !== null && prev > 0) {
      const cambio = (costoConversacion - prev) / prev;
      tendencia = Math.abs(cambio) < 0.1 ? 'igual' : cambio < 0 ? 'mejora' : 'empeora';
    }
    anterior.set(e.indice, costoConversacion);
    return {
      ...e,
      costoConversacion,
      costoVenta: div(e.gasto, e.ventas),
      tendencia,
    };
  });

  // Se devuelve de la más reciente a la más vieja, que es como se lee.
  return filas.reverse();
}

export interface ResumenBitacora {
  semanas: number;
  gastoTotal: number;
  ventasTotal: number;
  /** Costo por venta de todo el período. */
  costoVentaAcumulado: number | null;
  /** Lo que más veces ganó, con cuántas. */
  mejorFormula: { formula: string; veces: number } | null;
  /** Las fórmulas que nunca funcionaron, para no repetirlas. */
  formulasQueFallaron: string[];
}

/**
 * Lo que la bitácora enseña, en cuatro números.
 *
 * Esto es lo que ninguna semana suelta puede decir: qué fórmula gana en TU
 * cuenta y cuál ya probaste dos veces sin resultado.
 */
export function resumirBitacora(bitacora: EntradaBitacora[]): ResumenBitacora {
  const semanas = new Set(bitacora.map((b) => b.semana)).size;
  const gastoTotal = bitacora.reduce((t, b) => t + (b.gasto || 0), 0);
  const ventasTotal = bitacora.reduce((t, b) => t + (b.ventas || 0), 0);

  const ganadas = new Map<string, number>();
  const perdidas = new Map<string, number>();
  for (const b of bitacora) {
    if (!b.formula) continue;
    if (b.estado === 'ganador') ganadas.set(b.formula, (ganadas.get(b.formula) ?? 0) + 1);
    if (b.estado === 'muerto') perdidas.set(b.formula, (perdidas.get(b.formula) ?? 0) + 1);
  }

  let mejorFormula: ResumenBitacora['mejorFormula'] = null;
  for (const [formula, veces] of ganadas) {
    if (!mejorFormula || veces > mejorFormula.veces) mejorFormula = { formula, veces };
  }

  // Falló dos veces o más y nunca ganó: no vale la pena volver a probarla.
  const formulasQueFallaron = [...perdidas.entries()]
    .filter(([f, veces]) => veces >= 2 && !ganadas.has(f))
    .map(([f]) => f);

  return {
    semanas,
    gastoTotal: Number(gastoTotal.toFixed(2)),
    ventasTotal,
    costoVentaAcumulado: div(gastoTotal, ventasTotal),
    mejorFormula,
    formulasQueFallaron,
  };
}
