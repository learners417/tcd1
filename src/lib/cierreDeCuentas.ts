/**
 * EL CIERRE DE CUENTAS — qué pasó en sus noventa días.
 *
 * Se arma cuando el Camino se cierra: qué jornadas completó, cuáles quedaron
 * sin evidencia y cuántos días de atraso acumuló.
 *
 * Con eso se ve solo si la garantía corre. La vara que cerró Javo: cumplió su
 * parte si completó todas las jornadas con evidencia y ninguna la entregó con
 * más de siete días de atraso. Si cumplió y los cinco sistemas no están
 * andando, la extensión va sin costo.
 *
 * ═══ LA MITAD QUE FALTABA ═══
 *
 * Esto medía con datos lo que entregó el CLIENTE y daba por hecho lo del
 * equipo. Pero la garantía tiene dos partes, y la del equipo es el
 * acompañamiento: la sesión de arranque y las mentorías durante los noventa
 * días.
 *
 * Si el cliente cumplió y el equipo no dio las sesiones, la garantía no puede
 * exigirle nada a él — y nadie se iba a enterar, porque el único número a la
 * vista era el suyo. Desde que las sesiones quedan registradas, las dos
 * mitades se pueden verificar, y se verifican las dos.
 *
 * Desde acá también sale la conversación de renovación: el número está a la
 * vista, no es una sensación.
 */
import { SEED_ROADMAP_V2 } from './roadmapSeed';
import { fechaDelDia } from './hojaDeRuta';
import { loQuePrometimos, cumplimosNuestraParte, type Sesion } from './sesionesHumanas';

export const DIAS_DE_TOLERANCIA = 7;

export interface JornadaCerrada {
  dia: number;
  titulo: string;
  /** La clave de progreso. */
  clave: string;
  pedia: boolean;
  hecha: boolean;
  /** Días entre la fecha que le tocaba y el día que la entregó. */
  atraso: number;
}

export interface CierreDeCuentas {
  hechas: number;
  pedidas: number;
  sinEvidencia: JornadaCerrada[];
  atrasadas: JornadaCerrada[];
  atrasoMayor: number;
  /** Cumplió su parte: todo entregado, y nada con más de siete días de atraso. */
  cumplioSuParte: boolean;
  /** Cuántas sesiones recibió de las que se le prometieron. */
  sesionesDadas: number;
  sesionesPrometidas: number;
  /**
   * Cumplimos la nuestra: le dimos el acompañamiento que compró.
   *
   * `null` cuando quien llama no trajo las sesiones. No saber no es lo mismo
   * que no haber cumplido: con `false` el veredicto le anuncia al cliente que
   * la garantía corre a nuestro cargo, y eso no se puede decir por una
   * consulta que no se hizo.
   */
  cumplimosNuestraParte: boolean | null;
}

/** Lo que pasó, jornada por jornada. */
export function jornadasCerradas(
  completadas: Set<string>,
  fechaInicio: string | null | undefined,
  entregas: Record<string, string> = {},
): JornadaCerrada[] {
  const out: JornadaCerrada[] = [];
  for (const p of SEED_ROADMAP_V2) {
    for (const m of p.metas) {
      const dia = m.dia_asignado;
      if (dia === null || dia < 1) continue;
      const minutos = parseInt(m.tiempo_estimado ?? '0', 10) || 0;
      if (minutos === 0) continue;
      const clave = `${p.numero}-${m.codigo}`;
      const hecha = completadas.has(clave);
      const leTocaba = fechaDelDia(fechaInicio, dia);
      const entregada = entregas[clave] ? new Date(`${entregas[clave]}T12:00:00`) : null;
      const atraso = hecha && leTocaba && entregada
        ? Math.max(0, Math.round((entregada.getTime() - leTocaba.getTime()) / (24 * 60 * 60 * 1000)))
        : 0;
      out.push({ dia, titulo: m.titulo, clave, pedia: Boolean(m.evidencia_requerida?.pide), hecha, atraso });
    }
  }
  return out.sort((a, b) => a.dia - b.dia);
}

/** El cierre completo, listo para mostrar. */
export function cierreDeCuentas(
  completadas: Set<string>,
  fechaInicio: string | null | undefined,
  entregas: Record<string, string> = {},
  /**
   * Las sesiones que de verdad tuvo, y lo que contrató.
   *
   * `null` significa «no las traje», no «no tuvo ninguna».
   */
  sesiones: Sesion[] | null = null,
  servicio: string | null | undefined = null,
): CierreDeCuentas {
  const jornadas = jornadasCerradas(completadas, fechaInicio, entregas);
  const pedidas = jornadas.filter((j) => j.pedia);
  const sinEvidencia = pedidas.filter((j) => !j.hecha);
  const atrasadas = jornadas.filter((j) => j.atraso > DIAS_DE_TOLERANCIA);
  const atrasoMayor = jornadas.reduce((m, j) => Math.max(m, j.atraso), 0);
  return {
    hechas: jornadas.filter((j) => j.hecha).length,
    pedidas: pedidas.length,
    sinEvidencia,
    atrasadas,
    atrasoMayor,
    cumplioSuParte: sinEvidencia.length === 0 && atrasadas.length === 0,
    sesionesDadas: sesiones?.length ?? 0,
    sesionesPrometidas: sesiones ? loQuePrometimos(servicio) : 0,
    cumplimosNuestraParte: sesiones ? cumplimosNuestraParte(sesiones, servicio) : null,
  };
}

/**
 * El veredicto, escrito como se lo diría una persona.
 *
 * Las dos partes, y en este orden: primero lo que recibió, después lo que
 * entregó. Si el equipo no dio las sesiones, eso se dice ANTES de pedirle
 * cuentas al cliente, porque en ese caso la garantía corre igual y no hay
 * nada que reclamarle.
 */
export function veredictoDeGarantia(c: CierreDeCuentas): string {
  if (c.cumplimosNuestraParte === false && c.sesionesPrometidas > 0) {
    return `Te dimos ${c.sesionesDadas} de las ${c.sesionesPrometidas} sesiones que te prometimos. `
      + 'La garantía corre: seguimos sin costo hasta que los cinco sistemas estén andando.';
  }
  if (c.cumplioSuParte) {
    return 'Hiciste tu parte completa: entregaste todo y a tiempo. Si los cinco sistemas todavía no están andando, seguimos sin costo hasta que funcionen.';
  }
  if (c.sinEvidencia.length) {
    return `Quedaron ${c.sinEvidencia.length} jornadas sin entregar. Esas son las que faltan para que la garantía corra.`;
  }
  return `Entregaste todo, y ${c.atrasadas.length} ${c.atrasadas.length === 1 ? 'jornada llegó' : 'jornadas llegaron'} con más de ${DIAS_DE_TOLERANCIA} días de atraso.`;
}

/**
 * Lo que el EQUIPO entregó, para la ficha del cliente.
 *
 * Es la línea que antes no existía en ninguna pantalla: nadie podía decir,
 * mirando una cuenta, si el acompañamiento que se vendió se dio.
 */
export function loQueLeDimos(c: CierreDeCuentas): string {
  if (c.cumplimosNuestraParte === null) return 'Sus sesiones todavía no se consultaron.';
  if (c.sesionesPrometidas === 0) return `${c.sesionesDadas} sesiones registradas.`;
  const faltan = Math.max(0, c.sesionesPrometidas - c.sesionesDadas);
  if (c.cumplimosNuestraParte) {
    return `${c.sesionesDadas} de ${c.sesionesPrometidas} sesiones dadas. Cumplimos.`;
  }
  return `${c.sesionesDadas} de ${c.sesionesPrometidas} sesiones dadas: faltan ${faltan}. `
    + 'Con esto la garantía corre a nuestro cargo.';
}
