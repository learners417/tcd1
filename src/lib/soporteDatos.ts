/**
 * EL SOPORTE, CONTRA LA BASE.
 *
 * Todo lo que la conversación entre el cliente y el equipo necesita de
 * Supabase, en un solo lugar: cuántos mensajes esperan de cada lado, marcarlos
 * leídos, y subir un archivo.
 *
 * Antes estaba repartido: el contador del cliente era un cero escrito en el
 * código, el del equipo se suscribía a una lista vacía, y la única función que
 * subía archivos vivía dentro de un componente que ninguna pantalla dibujaba.
 */
import { supabase, isSupabaseReady } from './supabase';

/** El canal único del soporte. Lo mismo que lee y escribe la pantalla. */
export const CANAL = 'privado' as const;

function db() {
  return isSupabaseReady() ? supabase : null;
}

// ── Lo que espera de cada lado ─────────────────────────────────────

/**
 * Cuántas respuestas del equipo no abrió este cliente.
 *
 * Solo lo que le llegó: lo que él mismo escribió nunca cuenta como sin leer.
 */
export async function sinLeerDelCliente(userId: string): Promise<number> {
  const s = db();
  if (!s || !userId) return 0;
  const { count, error } = await s
    .from('mensajes')
    .select('id', { count: 'exact', head: true })
    .eq('canal', CANAL)
    .eq('receptor_id', userId)
    .is('leido_en', null);
  return error ? 0 : (count ?? 0);
}

/** Marca leída la conversación de quien está mirando. Devuelve cuántas marcó. */
export async function marcarLeidos(): Promise<number> {
  const s = db();
  if (!s) return 0;
  const { data, error } = await s.rpc('marcar_leidos');
  return error ? 0 : Number(data ?? 0);
}

/**
 * Cuántos clientes están esperando respuesta del equipo.
 *
 * Los mensajes entrantes llegan sin destinatario, porque el equipo no tiene un
 * receptor propio: le escriben al equipo, no a una persona.
 */
export async function cuantosEsperan(): Promise<number> {
  const s = db();
  if (!s) return 0;
  const { data, error } = await s.rpc('cuantos_esperan');
  return error ? 0 : Number(data ?? 0);
}

// ── Los adjuntos ───────────────────────────────────────────────────

/** 8 MB. Una captura de pantalla pesa menos de uno; un video no entra. */
export const TOPE_ARCHIVO = 8 * 1024 * 1024;

export type TipoDeArchivo = 'imagen' | 'audio' | 'archivo';

export function tipoDe(file: File): TipoDeArchivo {
  if (file.type.startsWith('image/')) return 'imagen';
  if (file.type.startsWith('audio/')) return 'audio';
  return 'archivo';
}

export interface ArchivoSubido {
  url: string;
  tipo: TipoDeArchivo;
}

/**
 * Sube un archivo y devuelve su dirección pública.
 *
 * Va a una carpeta con el id de quien lo sube: así la regla de borrado por
 * dueño funciona y nadie pisa los archivos de otro. Un nombre repetido tampoco
 * pisa nada, porque lleva la hora adentro.
 */
export async function subirArchivo(file: File, userId: string): Promise<ArchivoSubido> {
  const s = db();
  if (!s) throw new Error('sin conexión');
  if (file.size > TOPE_ARCHIVO) {
    throw new Error(`${file.name} pesa más de 8 MB. Mándalo más liviano, o cuéntalo con palabras.`);
  }

  const ext = file.name.includes('.') ? file.name.split('.').pop() : null;
  const limpio = (ext ?? 'bin').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8) || 'bin';
  const ruta = `${userId}/${Date.now()}.${limpio}`;

  const { data, error } = await s.storage.from('mensajes-archivos').upload(ruta, file);
  if (error) throw new Error(error.message);

  const { data: pub } = s.storage.from('mensajes-archivos').getPublicUrl(data.path);
  return { url: pub.publicUrl, tipo: tipoDe(file) };
}

/** Lo que se muestra cuando un mensaje trae archivo y no texto. */
export function comoSeLee(tipo: TipoDeArchivo | null | undefined): string {
  if (tipo === 'imagen') return 'Mandó una imagen';
  if (tipo === 'audio') return 'Mandó un audio';
  if (tipo === 'archivo') return 'Mandó un archivo';
  return '';
}
