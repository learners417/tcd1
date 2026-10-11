/**
 * EXTRAS DE LA MATRIZ — el estado real de cada celda.
 *
 * Cada cruce cliente×paso guarda su estado, una nota y un link (Drive, doc,
 * página, calendario). Igual que en la planilla, pero vivo y compartido.
 * Guarda en la tabla si existen las columnas; si no, queda en este navegador
 * y no rompe nada.
 *
 * ═══ POR QUÉ «EN PROCESO» SE PARTIÓ EN DOS ═══
 *
 * Había un solo estado intermedio y no servía para lo único que se necesita
 * mirando esta matriz: **de quién es la pelota ahora.**
 *
 * «En proceso» podía ser que el cliente esté grabando su VSL o que el equipo
 * esté editándolo. Son dos situaciones opuestas: en una se le reclama a él, en
 * la otra la demora es nuestra. Con un solo color, el lunes había que
 * preguntar por cada celda amarilla de quién estaba esperando — que es
 * exactamente el trabajo que esta pantalla existe para ahorrar.
 */
import { supabase } from './supabase';

/**
 * Los cuatro estados, con el color que les corresponde:
 *
 *   pendiente → ROJO     · nadie lo empezó
 *   cliente   → NARANJA  · está en manos del cliente
 *   nosotros  → AMARILLO · está en manos del equipo
 *   listo     → VERDE    · hecho
 *
 * Y `na`, que no es un estado de avance: es un ítem que a este cliente no le
 * aplica y que por eso no cuenta para su porcentaje.
 */
export type EstadoCelda = 'pendiente' | 'cliente' | 'nosotros' | 'listo' | 'na';

/**
 * Lo que había guardado antes de partir «en proceso» en dos.
 *
 * Las filas viejas con 'proceso' se leen como 'nosotros', que es lo más
 * probable: 42 de los 62 ítems son de la agencia. Convertirlas a 'pendiente'
 * borraría trabajo que ya estaba empezado, y eso se ve como un retroceso que
 * nadie hizo.
 */
export function alEstadoNuevo(crudo: string | null | undefined): EstadoCelda | undefined {
  if (!crudo) return undefined;
  if (crudo === 'proceso') return 'nosotros';
  const validos: EstadoCelda[] = ['pendiente', 'cliente', 'nosotros', 'listo', 'na'];
  return validos.includes(crudo as EstadoCelda) ? (crudo as EstadoCelda) : undefined;
}

export interface ExtraCelda { estado?: EstadoCelda; nota?: string; link?: string }
export type ExtrasByCliente = Map<string, Map<string, ExtraCelda>>;

const LOCAL = 'tcd_matriz_extras_v1';
const clave = (clienteId: string, stepId: string) => `${clienteId}::${stepId}`;

function leerLocal(): Record<string, ExtraCelda> {
  try { return JSON.parse(localStorage.getItem(LOCAL) ?? '{}') as Record<string, ExtraCelda>; } catch { return {}; }
}

export async function loadExtras(): Promise<ExtrasByCliente> {
  const out: ExtrasByCliente = new Map();
  const poner = (cli: string, step: string, e: ExtraCelda) => {
    if (!e || (!e.estado && !e.nota && !e.link)) return;
    if (!out.has(cli)) out.set(cli, new Map());
    out.get(cli)!.set(step, { ...out.get(cli)!.get(step), ...e });
  };
  for (const [k, v] of Object.entries(leerLocal())) {
    const [cli, step] = k.split('::');
    if (cli && step) poner(cli, step, v);
  }
  if (supabase) {
    // Lo de la base pisa lo local: es la versión que ve todo el equipo.
    const { data, error } = await supabase.from('cliente_preactivacion_check')
      .select('cliente_id, step_id, estado, nota, link');
    if (!error && data) {
      for (const r of data as Array<{ cliente_id: string; step_id: string; estado?: string | null; nota?: string | null; link?: string | null }>) {
        poner(r.cliente_id, r.step_id, {
          estado: alEstadoNuevo(r.estado),
          nota: r.nota || undefined,
          link: r.link || undefined,
        });
      }
    }
  }
  return out;
}

/**
 * Guarda el estado, la nota o el link de una celda.
 *
 * ═══ POR QUÉ NO ES UN UPDATE ═══
 *
 * Antes esto hacía `update` sobre `cliente_preactivacion_check`, y en esa
 * tabla **la fila existe solo si el paso está tildado**. Así que poner una
 * nota en un paso pendiente —que es justo cuando una nota sirve— no tocaba
 * ninguna fila. No fallaba: actualizaba cero filas y seguía de largo.
 *
 * La función de la base crea la fila si hace falta, sin tildar el paso, y
 * devuelve el error si algo sale mal en vez de tragárselo.
 *
 * El guardado local sigue, pero como respaldo y no como destino: si la base
 * no responde, al menos no se pierde lo que se acaba de escribir.
 */
export async function saveExtra(clienteId: string, stepId: string, cambio: ExtraCelda): Promise<void> {
  const all = leerLocal();
  const k = clave(clienteId, stepId);
  const nuevo = { ...(all[k] ?? {}), ...cambio };
  if (!nuevo.estado && !nuevo.nota && !nuevo.link) delete all[k]; else all[k] = nuevo;
  try { localStorage.setItem(LOCAL, JSON.stringify(all)); } catch { /* noop */ }

  if (!supabase) return;
  const { error } = await supabase.rpc('guardar_extra_celda', {
    p_cliente: clienteId,
    p_step: stepId,
    p_estado: nuevo.estado ?? null,
    p_nota: nuevo.nota ?? null,
    p_link: nuevo.link ?? null,
  });
  if (error) {
    throw new Error(
      /guardar_extra_celda/.test(error.message)
        ? 'Falta correr la migración de la matriz compartida: por ahora esto queda solo en este navegador.'
        : error.message,
    );
  }
}

export function extraDe(extras: ExtrasByCliente, clienteId: string, stepId: string): ExtraCelda {
  return extras.get(clienteId)?.get(stepId) ?? {};
}

/**
 * El ciclo del clic, que depende de QUIÉN hace el ítem.
 *
 * Con cinco estados, un ciclo único serían cinco toques para llegar a «listo»
 * — y la matriz se toca cientos de veces por semana. Así que el estado
 * intermedio que aparece primero es el del responsable del ítem: en uno del
 * cliente, «en manos del cliente»; en uno de la agencia, «en manos del
 * equipo». Los de ambos pasan por los dos, que es lo que de verdad ocurre.
 *
 * Para pasarle la pelota al otro alcanza con seguir tocando: nadie queda
 * encerrado en un estado por el responsable que tenga escrito el ítem.
 */
export function siguienteEstado(
  actual: EstadoCelda | undefined,
  quien: 'cliente' | 'agencia' | 'ambos',
): EstadoCelda {
  const ciclo: EstadoCelda[] = quien === 'cliente'
    ? ['pendiente', 'cliente', 'listo', 'na']
    : quien === 'agencia'
      ? ['pendiente', 'nosotros', 'listo', 'na']
      : ['pendiente', 'cliente', 'nosotros', 'listo', 'na'];
  const i = ciclo.indexOf(actual ?? 'pendiente');
  // Un estado que no está en el ciclo de este responsable —un ítem de la
  // agencia que alguien dejó «en manos del cliente», que es legítimo— no
  // vuelve a cero: avanza a listo. Con `indexOf` en -1 el siguiente caía en
  // 'pendiente' y el toque borraba el avance en vez de completarlo.
  if (i === -1) return 'listo';
  return ciclo[(i + 1) % ciclo.length];
}

export const ESTADO_LABEL: Record<EstadoCelda, string> = {
  pendiente: 'Sin empezar',
  cliente: 'La tiene el cliente',
  nosotros: 'La tenemos nosotros',
  listo: 'Listo',
  na: 'No aplica',
};

/** El color de cada estado. Uno por estado y el mismo en todas las pantallas. */
export const ESTADO_COLOR: Record<EstadoCelda, { fondo: string; borde: string; texto: string }> = {
  pendiente: { fondo: 'bg-danger/[0.10]', borde: 'border-danger/45', texto: 'text-danger' },
  cliente:   { fondo: 'bg-[#E8862E]/[0.12]', borde: 'border-[#E8862E]/50', texto: 'text-[#F0A65C]' },
  nosotros:  { fondo: 'bg-gold/[0.12]', borde: 'border-gold/50', texto: 'text-goldhi' },
  listo:     { fondo: 'bg-success/[0.10]', borde: 'border-success/45', texto: 'text-success' },
  na:        { fondo: '', borde: 'border-cream/10', texto: 'text-cream/30' },
};

/** La marca corta de cada estado, para una celda angosta. */
export const ESTADO_MARCA: Record<EstadoCelda, string> = {
  pendiente: '',
  cliente: 'C',
  nosotros: 'N',
  listo: '✓',
  na: '–',
};

/**
 * De quién es la pelota, contando toda la lista de un cliente.
 *
 * Es la línea que el equipo necesita el lunes: cuántas está esperando él y
 * cuántas estamos trabando nosotros. Antes las dos eran el mismo amarillo y
 * había que preguntar celda por celda.
 */
export function deQuienEsLaPelota(estados: Array<EstadoCelda | undefined>): {
  delCliente: number; nuestras: number; sinEmpezar: number; listas: number;
} {
  let delCliente = 0, nuestras = 0, sinEmpezar = 0, listas = 0;
  for (const e of estados) {
    if (e === 'cliente') delCliente++;
    else if (e === 'nosotros') nuestras++;
    else if (e === 'listo') listas++;
    else if (e !== 'na') sinEmpezar++;
  }
  return { delCliente, nuestras, sinEmpezar, listas };
}

/** Esa cuenta, dicha en una línea. */
export function laPelota(x: ReturnType<typeof deQuienEsLaPelota>): string {
  if (x.nuestras === 0 && x.delCliente === 0) {
    return x.sinEmpezar > 0
      ? `${x.sinEmpezar} sin empezar. Nada en curso.`
      : 'Todo listo.';
  }
  const partes: string[] = [];
  if (x.nuestras > 0) partes.push(`${x.nuestras} ${x.nuestras === 1 ? 'la tenemos' : 'las tenemos'} nosotros`);
  if (x.delCliente > 0) partes.push(`${x.delCliente} ${x.delCliente === 1 ? 'la tiene' : 'las tiene'} él`);
  return `${partes.join(' y ')}.`;
}
