import { db } from './supabase';
import { desdeLaCadena } from './cerebro';
import { crearDesdeElSistema } from './cerebroStorage';
import {
  planificarAvisos, semanaISO, HISTORIAL_VACIO, type HistorialAvisos,
} from './avisosCliente';
import type { ItemCola } from './colaExcepciones';

/**
 * LA COLA, REPARTIDA.
 *
 * ═══ QUÉ ESTABA ROTO ═══
 *
 * La app ya sabía, cada semana, qué cliente estaba trabado, en qué, cuánto
 * dinero había en juego y qué había que hacer. `armarCola` lo calculaba, el
 * Admin lo mostraba en una pantalla, y ahí terminaba: `desdeLaCadena` —el
 * armador de tareas desde un cuello de botella, escrito y probado— no tenía
 * quién lo llamara.
 *
 * O sea que la cola existía mientras la pantalla estaba abierta. Quien no
 * abría esa tab ese día no se enteraba, y lo que estaba en la lista el lunes
 * podía no estar el martes sin que nadie hubiera hecho nada.
 *
 * ═══ QUIÉN HACE QUÉ ═══
 *
 * Los AVISOS al cliente los manda el cron diario, y los manda él solo. Esto
 * no avisa a nadie: convierte en TAREAS lo que un aviso no puede resolver.
 *
 *   · Lo que ya se avisó dos veces y sigue igual  →  tarea.
 *   · Lo que nunca fue para la app  →  tarea.
 *   · Lo que la app puede resolver avisando  →  no se toca: es del cron.
 *
 * Están separados a propósito. Con los dos lados mandando avisos, el cliente
 * recibía el mismo dos veces el día que alguien abría el Admin, y los dos
 * lados contaban el historial a su manera.
 *
 * ═══ POR QUÉ ACÁ Y NO EN LA PANTALLA ═══
 *
 * Porque una tarea tiene que existir aunque nadie la vea. Es la misma razón
 * por la que los mensajes sin responder se vuelven tareas en `soporteStorage`
 * y no en la vista que los dibuja.
 *
 * Nada de esto lanza. Si la base no contesta, el Admin abre igual: lo peor
 * que pasa es que la tarea se cree en la próxima pasada.
 */

interface FilaHistorial {
  cliente: string;
  clave: string;
  veces: number;
  ultima_semana: string;
}

/**
 * Cuántas veces salió cada aviso y en qué semana salió el último.
 *
 * Se deriva de la tabla de notificaciones, no de una tabla aparte: las dos
 * cosas que hay que saber ya están ahí desde el primer día, y un segundo
 * registro del mismo historial es un segundo registro que se desincroniza.
 */
export async function historialDeAvisos(clienteIds: string[]): Promise<HistorialAvisos> {
  if (clienteIds.length === 0) return HISTORIAL_VACIO;
  try {
    const { data, error } = await db().rpc('historial_avisos', { p_clientes: clienteIds });
    if (error || !data) return HISTORIAL_VACIO;

    const enviados: Record<string, number> = {};
    const ultimaSemana: Record<string, string> = {};
    for (const f of data as unknown as FilaHistorial[]) {
      const id = `${f.cliente}|${f.clave}`;
      enviados[id] = f.veces;
      ultimaSemana[id] = f.ultima_semana;
    }
    return { enviados, ultimaSemana };
  } catch { return HISTORIAL_VACIO; }
}

export interface ResultadoDeLaPasada {
  /** Cuellos que la app ya avisó dos veces sin que cambiara nada. */
  escalados: number;
  /** Cuellos que nunca fueron para la app: tarea directa. */
  deLaPersona: number;
  /** Cuellos que la app está atendiendo sola, sin molestar a nadie. */
  losLleveLaApp: number;
}

/**
 * Reparte la cola: lo que necesita una persona queda como tarea suya.
 *
 * `asignarA` es quien tiene la cuenta abierta. La tarea aparece en SU lista y
 * no en una bandeja común, que es la diferencia entre algo que alguien hace y
 * algo que todos suponen que hace otro.
 *
 * Devuelve el recuento para poder decirlo en pantalla. Un número a la vista
 * —«dos quedaron en tu lista»— es lo que hace que se note que la app trabajó.
 */
export async function repartirLaCola(
  cola: ItemCola[],
  asignarA: string,
): Promise<ResultadoDeLaPasada> {
  const vacio: ResultadoDeLaPasada = { escalados: 0, deLaPersona: 0, losLleveLaApp: 0 };
  if (cola.length === 0 || !asignarA) return vacio;

  const ids = [...new Set(cola.map((i) => i.clienteId))];
  const historial = await historialDeAvisos(ids);
  // Se planifica para saber cuáles ya no alcanzan, no para mandar nada: el
  // plan se usa de un solo lado, el de `aEscalar`.
  const plan = planificarAvisos(cola, historial, semanaISO());

  // La huella de la tarea la forman el cliente y el cuello, así que la misma
  // situación no se duplica cada vez que alguien abre el Admin.
  const porCuello = new Map(cola.map((i) => [`${i.clienteId}|${i.cuello}`, i]));

  let escalados = 0;
  for (const aviso of plan.aEscalar) {
    const item = porCuello.get(`${aviso.clienteId}|${aviso.clave}`);
    if (!item) continue;
    if (await crearTareaDelCuello(item, asignarA)) escalados++;
  }

  let deLaPersona = 0;
  for (const item of cola) {
    if (item.quien === 'la app') continue;
    if (await crearTareaDelCuello(item, asignarA)) deLaPersona++;
  }

  return {
    escalados,
    deLaPersona,
    losLleveLaApp: plan.aMandar.length + plan.repetidos,
  };
}

async function crearTareaDelCuello(item: ItemCola, asignarA: string): Promise<boolean> {
  const tarea = desdeLaCadena({
    clienteId: item.clienteId,
    nombre: item.nombre,
    cuello: item.cuello,
    accion: item.accion,
    mensaje: item.como,
    enRiesgo: item.enRiesgo,
    semanasIgual: item.semanasIgual,
  });
  return (await crearDesdeElSistema(tarea, asignarA)) !== null;
}
