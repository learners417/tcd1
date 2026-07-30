import { db } from './supabase';
import type { TareaDelCerebro, TareaOrdenada, Origen, Destino } from './cerebro';

/**
 * Las consultas del cerebro.
 *
 * Vive aparte de cerebro.ts por la regla que ya mordió cuatro veces: la
 * lógica que hay que probar no puede vivir en el archivo que importa supabase.
 */

interface FilaTarea {
  id: string; titulo: string; descripcion: string | null;
  cliente_id: string | null; origen: string; ref: string | null;
  destino: string; texto_listo: string | null; peso: number;
  prioridad: string; fecha_vencimiento: string | null; status: string;
  created_at?: string;
}

const aTarea = (f: FilaTarea): TareaDelCerebro & { creadaEn?: string } => ({
  id: f.id,
  titulo: f.titulo,
  descripcion: f.descripcion ?? '',
  clienteId: f.cliente_id,
  origen: f.origen as Origen,
  ref: f.ref,
  destino: f.destino as Destino,
  textoListo: f.texto_listo ?? undefined,
  peso: f.peso ?? 0,
  venceEn: null,
  creadaEn: f.created_at,
});

/**
 * Crea una tarea desde el sistema.
 *
 * No duplica: si ya hay una abierta por la misma causa, actualiza su peso y su
 * texto. El cuello puede haber empeorado y el mensaje puede haber cambiado,
 * pero **es la misma tarea** — y una lista con la misma cosa tres veces deja
 * de leerse.
 */
export async function crearDesdeElSistema(
  t: TareaDelCerebro,
  asignadoA: string,
): Promise<string | null> {
  try {
    const { data, error } = await db().rpc('crear_tarea_del_sistema', {
      p_titulo: t.titulo,
      p_descripcion: t.descripcion,
      p_asignado: asignadoA,
      p_cliente: t.clienteId,
      p_origen: t.origen,
      p_ref: t.ref,
      p_destino: t.destino,
      p_texto_listo: t.textoListo ?? null,
      p_peso: t.peso,
      p_prioridad: t.peso > 50_000 ? 'urgente' : t.peso > 10_000 ? 'alta' : 'media',
      p_vence: t.venceEn === null ? null
        : new Date(Date.now() + t.venceEn * 86400000).toISOString().slice(0, 10),
    });
    if (error) return null;
    return data as unknown as string;
  } catch { return null; }
}

/** Toda la lista de una persona: la misma que ve en Tareas. */
export async function miListaDeHoy(personaId: string): Promise<Array<TareaDelCerebro & { creadaEn?: string }>> {
  try {
    const { data, error } = await db().rpc('mi_lista_de_hoy', { p_persona: personaId });
    if (error || !data) return [];
    return (data as unknown as FilaTarea[]).map(aTarea);
  } catch { return []; }
}

/** Cierra una tarea. */
export async function cerrar(tareaId: string, quien: string): Promise<boolean> {
  try {
    const { error } = await db().rpc('cerrar_tarea', { p_tarea: tareaId, p_quien: quien });
    return !error;
  } catch { return false; }
}

/**
 * MANDA EL MENSAJE DE VERDAD.
 *
 * ═══ POR QUÉ ESTA FUNCIÓN EXISTE ═══
 *
 * El botón «Mandárselo en la app» **no mandaba nada**: llamaba a una función
 * que solo tachaba el ítem en la pantalla. No escribía ningún mensaje, no le
 * llegaba nada al cliente, y no quedaba registro.
 *
 * **Es la peor clase de error de interfaz**: el botón promete algo y quien lo
 * toca cree que pasó. Peor que un botón que no anda, porque el que no anda se
 * nota.
 */
export async function mandarleAlCliente(x: {
  clienteId: string;
  deQuien: string;
  texto: string;
  tareaId?: string;
}): Promise<boolean> {
  if (!x.clienteId || !x.texto.trim()) return false;
  try {
    const { error } = await db().from('mensajes').insert({
      canal: 'humano',
      emisor_id: x.deQuien,
      receptor_id: x.clienteId,
      contenido: x.texto.trim(),
    });
    if (error) return false;

    // Y el aviso, para que le llegue aunque no tenga la app abierta.
    await db().from('notificaciones').insert({
      usuario_id: x.clienteId,
      titulo: 'Tienes un mensaje del equipo',
      descripcion: x.texto.trim().slice(0, 120),
      accion_url: '/dashboard',
    });

    if (x.tareaId) await cerrar(x.tareaId, x.deQuien);
    return true;
  } catch { return false; }
}

/** Pasa una tarea a otra persona y la saca de la lista propia. */
export async function escalar(x: {
  tarea: TareaOrdenada;
  aQuien: string;
  deQuien: string;
  motivo: string;
}): Promise<boolean> {
  try {
    const { error } = await db()
      .from('admin_tareas')
      .update({ asignado_a: x.aQuien, descripcion: `${x.tarea.descripcion}\n\nPasada por: ${x.motivo}` })
      .eq('id', x.tarea.id);
    return !error;
  } catch { return false; }
}
