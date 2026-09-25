/**
 * LA JORNADA — entrada, trabajo y salida.
 *
 * ═══ EL CÍRCULO QUE ESTO CIERRA ═══
 *
 *   El cliente se traba  →  alguien lo atiende  →  eso cuesta minutos
 *          ↑                                              ↓
 *   más clientes vendiendo  ←  menos trabajo  ←  la traba se arregla de raíz
 *
 * Cada vuelta del círculo pasa por acá. El check-in dice quién está en qué
 * (para que dos personas no atiendan la misma cuenta). El check-out dice qué
 * se cerró y **qué trabó** — y esa traba, si se repite, deja de resolverse
 * con esfuerzo y pasa a ser trabajo de desarrollo.
 *
 * ═══ POR QUÉ NO ES UN CONTROL HORARIO ═══
 *
 * A nadie se le pide que cargue horas. Se marca cuándo empieza y cuándo
 * termina, y el resto se calcula. Lo que se mira no es cuánto trabajó una
 * persona —eso no cambia ninguna decisión— sino **cuántos minutos de humano
 * costó cada cliente**. Ese número tiene que bajar mes a mes con la misma
 * cantidad de clientes, y es lo único que distingue una app que reemplaza
 * trabajo de una que solo suma pantallas.
 */

export interface Jornada {
  personaId: string;
  /** El día, en formato aaaa-mm-dd. */
  dia: string;
  /** Cuándo entró. */
  inicio: string;
  /** En qué dijo que iba a trabajar: ids de cliente. */
  planeados: string[];
  /** Cuándo cerró. Vacío mientras está trabajando. */
  fin?: string;
  /** Qué cerró de verdad: ids de tarea. */
  cerradas: string[];
  /** Qué clientes terminó atendiendo. */
  atendidos: string[];
  /** Qué lo trabó, si algo lo trabó. */
  traba?: string;
  /** De qué cliente fue la traba. */
  trabaCliente?: string;
}

/** Una jornada que quedó abierta más de esto, se cerró sola en la vida real. */
export const HORAS_PARA_CERRAR_SOLA = 14;

export function iniciarJornada(
  personaId: string,
  planeados: string[],
  ahora = new Date(),
): Jornada {
  return {
    personaId,
    dia: ahora.toISOString().slice(0, 10),
    inicio: ahora.toISOString(),
    planeados,
    cerradas: [],
    atendidos: [],
  };
}

export function cerrarJornada(
  j: Jornada,
  x: { cerradas: string[]; atendidos: string[]; traba?: string; trabaCliente?: string },
  ahora = new Date(),
): Jornada {
  return {
    ...j,
    fin: ahora.toISOString(),
    cerradas: x.cerradas,
    atendidos: x.atendidos,
    traba: x.traba?.trim() || undefined,
    trabaCliente: x.trabaCliente,
  };
}

/**
 * Cuánto duró, en minutos.
 *
 * Se topea a las 14 horas: una jornada abierta más que eso es alguien que se
 * olvidó de cerrar, no alguien que trabajó catorce horas. Contarla entera
 * ensuciaría el único número que importa.
 */
export function minutosDe(j: Jornada): number {
  if (!j.fin) return 0;
  const a = new Date(j.inicio).getTime();
  const b = new Date(j.fin).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= a) return 0;
  return Math.min(Math.round((b - a) / 60000), HORAS_PARA_CERRAR_SOLA * 60);
}

/** ¿Está trabajando ahora mismo? */
export function estaAbierta(j: Jornada): boolean {
  if (j.fin) return false;
  const desde = Date.now() - new Date(j.inicio).getTime();
  return desde < HORAS_PARA_CERRAR_SOLA * 3600000;
}

/**
 * Quién está en qué, ahora.
 *
 * Es lo único que el check-in resuelve y que el cierre solo no puede: que dos
 * personas no atiendan la misma cuenta sin saberlo.
 */
export function quienEstaEnQue(jornadas: Jornada[]): Map<string, string[]> {
  const mapa = new Map<string, string[]>();
  for (const j of jornadas.filter(estaAbierta)) {
    for (const c of j.planeados) {
      mapa.set(c, [...(mapa.get(c) ?? []), j.personaId]);
    }
  }
  return mapa;
}

/** Las cuentas que dos o más están atendiendo a la vez. */
export function cuentasPisadas(jornadas: Jornada[]): string[] {
  return [...quienEstaEnQue(jornadas).entries()]
    .filter(([, quienes]) => quienes.length > 1)
    .map(([cliente]) => cliente);
}

// ── El marcador de la semana ───────────────────────────────────────────────

/**
 * El único objetivo: **que todos los clientes vendan.**
 *
 * No hay prioridades trimestrales ni objetivos por área. Hay un número, y
 * todo lo demás existe para moverlo. Si un cliente no vendió esta semana,
 * eso es lo que hay que destrabar — no importa qué otra cosa esté pasando.
 */
export interface Marcador {
  /** Cuántos vendieron esta semana, de los activos. */
  vendieron: number;
  activos: number;
  /** El porcentaje, que es EL número. */
  pctVendiendo: number;
  /** Cuántas cuentas están frenadas. */
  enRojo: number;
  /** Lo que facturaron los clientes esta semana. */
  facturadoClientes: number;
  /** Minutos de humano por cliente: dice si la app está reemplazando trabajo. */
  minutosPorCliente: number;
  /** Trabas que ya se repitieron tres veces. */
  trabasDelSistema: number;
  /** La frase de arriba, que dice qué mirar. */
  titular: string;
}

export function armarMarcador(x: {
  clientesActivos: number;
  clientesQueVendieron: number;
  clientesEnRojo: number;
  facturadoClientes: number;
  minutosTotales: number;
  trabasDelSistema: number;
}): Marcador {
  const pct = x.clientesActivos > 0
    ? Math.round((x.clientesQueVendieron / x.clientesActivos) * 100)
    : 0;
  const porCliente = x.clientesActivos > 0
    ? Math.round(x.minutosTotales / x.clientesActivos)
    : 0;

  // El titular sale de lo que MÁS rompe el círculo, en este orden.
  let titular: string;
  if (x.clientesActivos === 0) {
    titular = 'Todavía no hay clientes activos.';
  } else if (x.trabasDelSistema > 0) {
    titular = x.trabasDelSistema === 1
      ? 'Hay una traba que ya se repitió tres veces. Mientras siga, va a seguir costando trabajo todas las semanas.'
      : `Hay ${x.trabasDelSistema} trabas repetidas. Mientras sigan, van a seguir costando trabajo todas las semanas.`;
  } else if (x.clientesEnRojo > 0) {
    const sinVender = x.clientesActivos - x.clientesQueVendieron;
    titular = `${sinVender} ${sinVender === 1 ? 'cliente no vendió' : 'clientes no vendieron'} esta semana. ${x.clientesEnRojo} ${x.clientesEnRojo === 1 ? 'está frenado' : 'están frenados'}.`;
  } else if (pct === 100) {
    titular = 'Vendieron todos. Esta es la semana que hay que poder repetir.';
  } else {
    titular = `${x.clientesQueVendieron} de ${x.clientesActivos} vendieron. Los que faltan no están frenados: falta volumen.`;
  }

  return {
    vendieron: x.clientesQueVendieron,
    activos: x.clientesActivos,
    pctVendiendo: pct,
    enRojo: x.clientesEnRojo,
    facturadoClientes: x.facturadoClientes,
    minutosPorCliente: porCliente,
    trabasDelSistema: x.trabasDelSistema,
    titular,
  };
}

/**
 * Cómo se movió el número que importa contra la semana pasada.
 *
 * Dos números: cuántos venden y cuánto cuesta cada uno. El círculo va bien
 * cuando el primero sube **y** el segundo baja. Si suben los dos, se está
 * comprando resultado con trabajo — y eso no escala.
 */
export function comoVaElCirculo(
  hoy: Marcador,
  anterior: Marcador | null,
): { texto: string; sano: boolean } {
  if (!anterior) {
    return { texto: 'Primera semana medida. La que viene ya se puede comparar.', sano: true };
  }
  const masVenden = hoy.pctVendiendo > anterior.pctVendiendo;
  const menosTrabajo = hoy.minutosPorCliente < anterior.minutosPorCliente;

  if (masVenden && menosTrabajo) {
    return {
      texto: 'Venden más y cuestan menos trabajo. Así se ve el círculo funcionando.',
      sano: true,
    };
  }
  if (masVenden && !menosTrabajo) {
    return {
      texto: 'Venden más, pero cada uno cuesta más trabajo. Se está comprando resultado con horas, y eso no escala.',
      sano: false,
    };
  }
  if (!masVenden && menosTrabajo) {
    return {
      texto: 'Cuesta menos trabajo, pero no venden más. La app está aliviando, todavía no está resolviendo.',
      sano: false,
    };
  }
  return {
    texto: 'Venden menos y cuesta más. Es la semana para mirar las trabas, no para empujar más fuerte.',
    sano: false,
  };
}
