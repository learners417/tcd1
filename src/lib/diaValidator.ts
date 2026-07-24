/**
 * diaValidator.ts — Validador del Día 45 (Regla #6 v8)
 *
 * El día 45 es el "punto de no retorno": al cerrar Fase 3 (P8) el ADN debe tener
 * los campos críticos completos. Si el usuario intenta avanzar a Fase 4 con
 * el ADN incompleto a partir del día 45, la app muestra un banner bloqueando
 * el avance y listando qué campos faltan y en qué pilar se completan.
 *
 * v8 también ofrece `compararFotoPartida()`: compara `META_autoevaluacion_dia1`
 * (Foto de Partida tomada en P0.2) con el estado real del ADN para mostrar
 * el efecto revelación de "lo que no sabías que no sabías".
 *
 * Los campos críticos están definidos en `ADN_SCHEMA_V8` con `criticoDia45: true`
 * y se exportan como `CAMPOS_CRITICOS_DIA_45`. Ver Anexo D de mejoras.html.
 */

import type { ProfileV2 } from './supabase';
import {
  ADN_SCHEMA_V8,
  campoEstaCompleto,
  calcularAutoevaluacionActual,
  DIMENSIONES_FOTO_PARTIDA,
  type ADNCampo,
} from './adnSchema';

export const DIA_PUNTO_DE_NO_RETORNO = 45;

export interface ValidacionDia45 {
  /** true si todos los campos críticos están completos. */
  ok: boolean;
  /** true si el usuario ya está en Día 45 o después. */
  esDespuesDelDia45: boolean;
  /** Campos que faltan completar (cuando ok === false). */
  camposFaltantes: ADNCampo[];
  /** Porcentaje de campos críticos completados. */
  porcentajeCompleto: number;
  /**
   * true si la Fase 4 debe estar bloqueada: está después del día 45 y tiene
   * campos críticos incompletos.
   */
  debeBloquearFase4: boolean;
}

/**
 * Devuelve los campos del ADN marcados como críticos para el Día 45.
 * Reutiliza la bandera `criticoDia45` del schema v8.
 */
export function obtenerCamposCriticosDia45(): ADNCampo[] {
  return ADN_SCHEMA_V8
    .flatMap((seccion) => seccion.campos)
    .filter((c) => c.criticoDia45);
}

/**
 * Valida el estado del ADN respecto al umbral del Día 45.
 *
 * @param perfil    perfil del usuario (puede ser parcial)
 * @param diaActual día del programa (1-90); si es undefined asume el día actual
 *                  no es relevante y solo mira los campos
 */
export function validarADNDia45(
  perfil: Partial<ProfileV2>,
  diaActual?: number,
): ValidacionDia45 {
  const criticos = obtenerCamposCriticosDia45();
  const completos = criticos.filter((c) => campoEstaCompleto(perfil, c));
  const faltantes = criticos.filter((c) => !campoEstaCompleto(perfil, c));

  const porcentaje = criticos.length === 0
    ? 100
    : Math.round((completos.length / criticos.length) * 100);

  const esDespues = typeof diaActual === 'number' && diaActual >= DIA_PUNTO_DE_NO_RETORNO;
  const ok = faltantes.length === 0;

  return {
    ok,
    esDespuesDelDia45: esDespues,
    camposFaltantes: faltantes,
    porcentajeCompleto: porcentaje,
    debeBloquearFase4: esDespues && !ok,
  };
}

/**
 * Agrupa los campos faltantes por el pilar de origen, para mostrarle al usuario
 * a dónde tiene que volver para completar cada uno.
 */
export function agruparFaltantesPorPilar(
  faltantes: ADNCampo[],
): Array<{ pilar: string; campos: ADNCampo[] }> {
  const grupos = new Map<string, ADNCampo[]>();
  for (const campo of faltantes) {
    // "P5.2" → "P5"
    const pilar = campo.pilarOrigen.split('.')[0];
    const actual = grupos.get(pilar) ?? [];
    actual.push(campo);
    grupos.set(pilar, actual);
  }
  return Array.from(grupos.entries())
    .map(([pilar, campos]) => ({ pilar, campos }))
    .sort((a, b) => a.pilar.localeCompare(b.pilar));
}

// ─── Comparación Día 45 · Foto de Partida vs ADN real (v8) ──────────────────

export interface ComparacionDimension {
  /** Slug interno de la dimensión (ej "historia"). */
  key: string;
  /** Label visible (ej "Tu historia en 30 segundos"). */
  label: string;
  /** Score 1-5 que el usuario se puso el día 1 en P0.2 (Foto de Partida). */
  dia1: number;
  /** Score 1-5 derivado del estado real del ADN al día actual. */
  dia45: number;
  /** Delta dia45 - dia1 (positivo = creció, negativo = se conoció más y bajó). */
  delta: number;
}

export interface ComparacionDia45 {
  /** true si el usuario tomó la Foto de Partida (P0.2). */
  tieneFotoPartida: boolean;
  /** Comparación dimensión por dimensión. */
  dimensiones: ComparacionDimension[];
  /** Promedio dia1 (puede usarse para mostrar score global). */
  promedioDia1: number;
  /** Promedio dia45. */
  promedioDia45: number;
  /** Delta promedio (positivo = avance neto, negativo = revelación de gaps). */
  deltaPromedio: number;
}

/**
 * Compara la autoevaluación que el usuario hizo el día 1 (Foto de Partida en P0.2)
 * contra el estado real de su ADN al día actual.
 *
 * Es el efecto revelación de la regla v8: "lo que no sabías que no sabías".
 * Muchas dimensiones que el usuario se autocalificó alto el día 1 bajan al día 45
 * porque al ver el ADN real toma dimensión de lo que faltaba.
 */
export function compararFotoPartida(perfil: Partial<ProfileV2>): ComparacionDia45 {
  const dia1Raw = perfil.adn_autoevaluacion_dia1 ?? [];
  const tieneFotoPartida = dia1Raw.length === DIMENSIONES_FOTO_PARTIDA.length;
  const dia45Raw = calcularAutoevaluacionActual(perfil);

  const dimensiones: ComparacionDimension[] = DIMENSIONES_FOTO_PARTIDA.map((dim, i) => {
    const dia1 = tieneFotoPartida ? dia1Raw[i] : 0;
    const dia45 = dia45Raw[i];
    return {
      key: dim.key,
      label: dim.label,
      dia1,
      dia45,
      delta: dia45 - dia1,
    };
  });

  const promedio = (arr: number[]) =>
    arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length;
  const promedioDia1 = tieneFotoPartida
    ? promedio(dimensiones.map((d) => d.dia1))
    : 0;
  const promedioDia45 = promedio(dimensiones.map((d) => d.dia45));

  return {
    tieneFotoPartida,
    dimensiones,
    promedioDia1,
    promedioDia45,
    deltaPromedio: promedioDia45 - promedioDia1,
  };
}
