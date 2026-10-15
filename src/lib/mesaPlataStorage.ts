import { db } from './supabase';
import { contarRacha, pesoDeLaCuenta } from './colaExcepciones';
import { semanaISO } from './bitacoraCampana';
import {
  calcularCadena, encontrarDomino, numerosDeFila, COLUMNAS_DE_SEMANA,
  type NumerosSemana, type Domino, type FilaDeSemana,
} from './valueChain';

/**
 * LA MESA DE PLATA, GUARDADA.
 *
 * Hasta ahora el tablero calculaba y diagnosticaba en vivo, pero al cerrar la
 * pantalla se perdía todo. Eso lo volvía inútil para lo que existe: la Mesa
 * de plata del viernes no es mirar los números de hoy, es ver cómo se movió
 * cada cuenta desde la semana pasada y cuál está peor que hace un mes.
 *
 * Y sin comparativa entre clientes no hay forma de saber a quién atender
 * primero. Once cuentas mirándose de a una son once decisiones sueltas.
 */

export interface SemanaCliente {
  clienteId: string;
  semana: string;
  numeros: NumerosSemana;
  objetivo: string;
  actualizadoEn: string | null;
}

/** Cómo viene una fila de la base. Los nombres son los de la tabla. */
// La forma de la fila y su mapeo a números viven en valueChain: el cron
// diario lee la misma tabla con la llave de servidor, y con el mapeo acá
// —en un módulo que importa el cliente del navegador— tenía que escribir su
// propia versión. Terminó con cuatro cuellos contra los veinte de esta.
type FilaBase = FilaDeSemana;

const n = (v: number | null | undefined): number =>
  typeof v === 'number' && Number.isFinite(v) ? v : 0;

const aNumeros = numerosDeFila;

const COLUMNAS = COLUMNAS_DE_SEMANA;

/** La semana de un cliente. null si todavía no se cargó. */
export async function cargarSemana(
  clienteId: string,
  semana = semanaISO(),
): Promise<SemanaCliente | null> {
  const { data, error } = await db()
    .from('sala_metricas_semana')
    .select(COLUMNAS)
    .eq('cliente_id', clienteId)
    .eq('semana_iso', semana)
    .is('anuncio', null)
    .maybeSingle();

  if (error || !data) return null;
  const f = data as unknown as FilaBase;
  return {
    clienteId, semana,
    numeros: aNumeros(f),
    objetivo: f.objetivo ?? 'mensajes',
    actualizadoEn: f.actualizado_en ?? null,
  };
}

/** Guarda (o reemplaza) la semana de un cliente. */
export async function guardarSemana(
  clienteId: string,
  numeros: NumerosSemana,
  objetivo: string,
  semana = semanaISO(),
): Promise<void> {
  const { error } = await db().rpc('guardar_semana_cliente', {
    p_cliente_id: clienteId,
    p_semana_iso: semana,
    p_datos: { ...numeros, objetivo },
  });
  if (error) throw new Error(`No se pudo guardar: ${error.message}`);
}

/** Las últimas N semanas de un cliente, de la más nueva a la más vieja. */
export async function historialCliente(
  clienteId: string,
  cuantas = 12,
): Promise<SemanaCliente[]> {
  const { data, error } = await db()
    .from('sala_metricas_semana')
    .select(COLUMNAS)
    .eq('cliente_id', clienteId)
    .is('anuncio', null)
    .order('semana_iso', { ascending: false })
    .limit(cuantas);

  if (error || !data) return [];
  return (data as unknown as FilaBase[]).map((f) => ({
    clienteId,
    semana: f.semana_iso,
    numeros: aNumeros(f),
    objetivo: f.objetivo ?? 'mensajes',
    actualizadoEn: f.actualizado_en ?? null,
  }));
}

// ── La comparativa entre cuentas ───────────────────────────────────────────

export interface FilaComparativa {
  clienteId: string;
  semana: string;
  /** El cuello de botella de esa cuenta, calculado con la misma regla. */
  domino: Domino;
  /** Lo facturado esa semana. Ordena la lista: primero la plata en riesgo. */
  facturado: number;
  cobrado: number;
  ventas: number;
  gasto: number;
  /** Cuán lejos está del ideal el indicador peor. Mayor = más urgente. */
  urgencia: number;
  /** true = no cargó los números de esta semana. */
  sinCargar: boolean;
}

/**
 * Todas las cuentas de una semana, ordenadas por DINERO EN RIESGO.
 *
 * El orden no es alfabético ni por lo mal que está: es por cuánto se pierde
 * si eso no se arregla. Una cuenta que factura $3.000 y está en amarillo pesa
 * más que una que factura $200 y está en rojo.
 */
export async function comparativaSemana(
  clienteIds: string[],
  semana = semanaISO(),
): Promise<FilaComparativa[]> {
  if (clienteIds.length === 0) return [];

  const { data, error } = await db()
    .from('sala_metricas_semana')
    .select(COLUMNAS)
    .in('cliente_id', clienteIds)
    .eq('semana_iso', semana)
    .is('anuncio', null);

  const filas = (error || !data) ? [] : (data as unknown as FilaBase[]);
  const porCliente = new Map(filas.map((f) => [f.cliente_id, f]));

  /**
   * Los países de cada uno, en UNA consulta para todos.
   *
   * Sin esto, `calcularCadena` juzgaba el CPM de toda la cartera contra la
   * banda de México: `bandaDe([])` cae en la referencia por defecto. El techo
   * argentino está por debajo del piso español, así que el diagnóstico se
   * equivocaba en las dos direcciones, en silencio y para todos.
   */
  const paisesPorCliente = new Map<string, string[]>();
  {
    const r = await db()
      // La clave de montaje_campana es `user_id`, no `cliente_id`. Estaba mal
      // puesto y la consulta fallaba en silencio: el `?? []` tapaba el error y
      // la banda volvía a ser la de México, que es exactamente el bug que esto
      // venía a arreglar.
      .from('montaje_campana')
      .select('user_id, paises')
      .in('user_id', clienteIds);
    for (const m of (r.data ?? []) as Array<{ user_id: string; paises: string[] | null }>) {
      if (m.paises?.length) paisesPorCliente.set(m.user_id, m.paises);
    }
  }

  const out: FilaComparativa[] = clienteIds.map((id) => {
    const f = porCliente.get(id);
    if (!f) {
      // Que no haya cargado NO es un dato menor: es lo primero a resolver,
      // porque sin números no hay diagnóstico posible para esa cuenta.
      return {
        clienteId: id, semana,
        domino: {
          indicador: null, tramo: null,
          titulo: 'No cargó los números',
          porque: 'Sin datos no hay diagnóstico. Es lo primero a destrabar en esta cuenta.',
        },
        facturado: 0, cobrado: 0, ventas: 0, gasto: 0,
        urgencia: Infinity, sinCargar: true,
      };
    }
    const numeros = aNumeros(f);
    const cadena = calcularCadena(numeros, paisesPorCliente.get(id) ?? []);
    const domino = encontrarDomino(cadena);
    return {
      clienteId: id, semana, domino,
      facturado: n(f.facturado), cobrado: n(f.cobrado),
      ventas: n(f.ventas), gasto: n(f.gasto),
      urgencia: domino.indicador?.brecha ?? 0,
      sinCargar: false,
    };
  });

  // Primero los que no cargaron, después por dinero en riesgo: lo que factura
  // por lo roto que está. Una cuenta sana no sube aunque facture mucho.
  return out.sort((a, b) => {
    if (a.sinCargar !== b.sinCargar) return a.sinCargar ? -1 : 1;
    const riesgoA = a.facturado * Math.min(a.urgencia, 5);
    const riesgoB = b.facturado * Math.min(b.urgencia, 5);
    if (riesgoB !== riesgoA) return riesgoB - riesgoA;
    return b.urgencia - a.urgencia;
  });
}

// ── Cuántas semanas seguidas con el mismo problema ─────────────────────────

export interface RachaCuello {
  clienteId: string;
  /** El cuello actual, o null si la cuenta está sana. */
  cuello: string | null;
  /** Semanas SEGUIDAS con ese mismo cuello, contando la actual. */
  semanas: number;
}

/**
 * Cuenta las semanas seguidas que un cliente viene con el MISMO cuello de
 * botella.
 *
 * Es el número que decide si algo escala de la app a una persona. Sin esto,
 * la cola trataba igual a quien tiene un problema nuevo y a quien lleva un
 * mes trabado — y el segundo es el único que necesita que alguien entre.
 *
 * Se cuenta hacia atrás desde la semana más reciente y se corta en el primer
 * cambio: si el cuello se movió, el problema anterior se resolvió (o se
 * transformó en otro, que es información distinta).
 */
export async function rachaDelCuello(
  clienteId: string,
  cuantas = 8,
): Promise<RachaCuello> {
  const historial = await historialCliente(clienteId, cuantas);
  if (historial.length === 0) return { clienteId, cuello: null, semanas: 0 };
  // Los países de este cliente: la racha de cuello depende de contra qué banda
  // se mide su CPM, así que con la lista vacía la racha también salía mal.
  const m = await db()
    .from('montaje_campana')
    .select('paises')
    .eq('user_id', clienteId)
    .maybeSingle();
  const paises = ((m.data as { paises?: string[] } | null)?.paises) ?? [];
  const cuellos = historial.map(
    (h) => encontrarDomino(calcularCadena(h.numeros, paises)).indicador?.id ?? null);
  return { clienteId, ...contarRacha(cuellos) };
}

/** Las rachas de varios clientes, en paralelo. */
export async function rachasDeTodos(
  clienteIds: string[],
): Promise<Map<string, number>> {
  const rachas = await Promise.all(clienteIds.map((id) => rachaDelCuello(id)));
  return new Map(rachas.map((r) => [r.clienteId, r.semanas]));
}

// ── La pantalla de supervisión ─────────────────────────────────────────────

export type Semaforo = 'verde' | 'amarillo' | 'rojo' | 'sin_datos';

export interface FilaSupervision {
  clienteId: string;
  semana: string;
  /** Un punto por tramo de la cadena. Es la lectura de dos segundos. */
  atraccion: Semaforo;
  conversion: Semaforo;
  retencion: Semaforo;
  /** El titular del cuello de botella. */
  cuello: string;
  /** Semanas seguidas con el mismo cuello. */
  semanasIgual: number;
  facturado: number;
  cobrado: number;
  ventas: number;
  sinCargar: boolean;
  /** Lo que ordena la lista: lo rojo y lo caro arriba. */
  peso: number;
}

/**
 * Una fila por cliente, un punto por tramo. Lo rojo arriba.
 *
 * Existe porque el Admin no supervisaba: MONTABA EL MISMO COMPONENTE DEL
 * CLIENTE con su id, así que veía lo que ve el cliente. Eso sirve para
 * ayudarlo con algo puntual, no para saber a quién atender entre once.
 *
 * La diferencia es el ancho: acá se ven todas las cuentas a la vez, y la
 * pregunta que contesta no es "cómo va esta" sino "cuál primero".
 */
export async function supervision(
  clienteIds: string[],
  semana = semanaISO(),
): Promise<FilaSupervision[]> {
  if (clienteIds.length === 0) return [];

  const [comparativa, rachas] = await Promise.all([
    comparativaSemana(clienteIds, semana),
    rachasDeTodos(clienteIds),
  ]);

  const filas: FilaSupervision[] = comparativa.map((c) => {
    const semanasIgual = rachas.get(c.clienteId) ?? 0;
    if (c.sinCargar) {
      return {
        clienteId: c.clienteId, semana,
        atraccion: 'sin_datos', conversion: 'sin_datos', retencion: 'sin_datos',
        cuello: 'No cargó los números', semanasIgual,
        facturado: 0, cobrado: 0, ventas: 0, sinCargar: true,
        // Sin datos va arriba de todo: no se puede decidir nada sobre esa cuenta.
        peso: pesoDeLaCuenta({ facturado: 0, urgencia: 0, semanasIgual, sinCargar: true }),
      };
    }

    const tramo = (t: 'atraccion' | 'conversion' | 'retencion'): Semaforo => {
      const esTramo = c.domino.tramo === t;
      if (!esTramo) return 'verde';
      const b = c.domino.indicador?.brecha ?? 0;
      return b > 0.5 ? 'rojo' : 'amarillo';
    };

    return {
      clienteId: c.clienteId, semana,
      atraccion: tramo('atraccion'),
      conversion: tramo('conversion'),
      retencion: tramo('retencion'),
      cuello: c.domino.titulo,
      semanasIgual,
      facturado: c.facturado, cobrado: c.cobrado, ventas: c.ventas,
      sinCargar: false,
      // Lo que factura por lo roto que está, multiplicado por la insistencia:
      // tres semanas con el mismo problema pesa más que una.
      peso: pesoDeLaCuenta({
        facturado: c.facturado, urgencia: c.urgencia, semanasIgual, sinCargar: false,
      }),
    };
  });

  return filas.sort((a, b) => b.peso - a.peso);
}
