/**
 * LO QUE HABLA CON LA BASE: canales, reportes y mentorías grupales.
 *
 * Aparte de la lógica a propósito, como el resto del repo: así las reglas de
 * quién ve qué se prueban sin credenciales, y lo que toca la base queda en un
 * solo archivo donde se puede revisar de una lectura.
 */
import { supabase, isSupabaseReady } from './supabase';
import type { IdCanal } from './viaDeContacto';

/** El mismo portero que el resto del repo. Sin esto, cada función se rompe en
 *  un entorno sin credenciales y el síntoma es una pantalla en blanco. */
function db() {
  return isSupabaseReady() ? supabase : null;
}

/** Lo que se devuelve cuando no hay base: vacío, no una excepción. Una lista
 *  vacía la pantalla la sabe dibujar; una excepción la deja en blanco. */
const SIN_BASE = 'La app no está conectada. Vuelve a entrar a tu cuenta.';

/* ══════════════════ LOS CANALES ══════════════════ */

export interface MensajeDeCanal {
  id: string;
  canal: IdCanal;
  autor_id: string;
  autor_nombre: string;
  del_equipo: boolean;
  texto: string;
  responde_a: string | null;
  creado_en: string;
}

export async function mensajesDelCanal(canal: IdCanal, cuantos = 50): Promise<MensajeDeCanal[]> {
  const s = db();
  if (!s) return [];
  const { data, error } = await s
    .from('canales_mensajes')
    .select('*')
    .eq('canal', canal)
    .order('creado_en', { ascending: false })
    .limit(cuantos);
  if (error) throw new Error(error.message);
  // Se piden los últimos y se dan vuelta: con `ascending` y un límite, el
  // límite se queda con los más viejos y el canal se ve congelado en el día
  // que arrancó.
  return (data ?? []).reverse() as MensajeDeCanal[];
}

export async function escribirEnCanal(a: {
  canal: IdCanal; autorId: string; autorNombre: string; texto: string;
  delEquipo?: boolean; respondeA?: string | null;
}): Promise<void> {
  const s = db();
  if (!s) throw new Error(SIN_BASE);
  const { error } = await s.from('canales_mensajes').insert({
    canal: a.canal,
    autor_id: a.autorId,
    autor_nombre: a.autorNombre,
    del_equipo: a.delEquipo ?? false,
    texto: a.texto.trim(),
    responde_a: a.respondeA ?? null,
  });
  if (error) throw new Error(error.message);
}

export async function borrarDeCanal(id: string): Promise<void> {
  const s = db();
  if (!s) throw new Error(SIN_BASE);
  const { error } = await s.from('canales_mensajes').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

/* ══════════════════ LOS REPORTES ══════════════════ */

export interface Reporte {
  id: string;
  cliente_id: string;
  donde_estoy: string;
  que_trabo: string;
  que_necesito: string;
  creado_en: string;
  respuesta: string | null;
  respondido_por: string | null;
  respondido_en: string | null;
  vence_en: string;
}

export async function misReportes(clienteId: string): Promise<Reporte[]> {
  const s = db();
  if (!s) return [];
  const { data, error } = await s
    .from('reportes')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('creado_en', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Reporte[];
}

export async function mandarReporte(a: {
  clienteId: string; dondeEstoy: string; queTrabo: string; queNecesito: string;
}): Promise<void> {
  const s = db();
  if (!s) throw new Error(SIN_BASE);
  const { error } = await s.from('reportes').insert({
    cliente_id: a.clienteId,
    donde_estoy: a.dondeEstoy.trim(),
    que_trabo: a.queTrabo.trim(),
    que_necesito: a.queNecesito.trim(),
  });
  if (error) throw new Error(error.message);
}

/** La cola del equipo: los que esperan, el más vencido primero. */
export async function reportesQueEsperan(): Promise<Reporte[]> {
  const s = db();
  if (!s) return [];
  const { data, error } = await s
    .from('reportes')
    .select('*')
    .is('respuesta', null)
    .order('vence_en', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Reporte[];
}

export async function responderReporte(a: {
  id: string; respuesta: string; quienResponde: string;
}): Promise<void> {
  const s = db();
  if (!s) throw new Error(SIN_BASE);
  const { error } = await s.from('reportes').update({
    respuesta: a.respuesta.trim(),
    respondido_por: a.quienResponde,
    respondido_en: new Date().toISOString(),
  }).eq('id', a.id);
  if (error) throw new Error(error.message);
}

/* ══════════════════ LAS MENTORÍAS GRUPALES ══════════════════ */

export type TemaGrupal = 'producto' | 'marketing' | 'ventas';

export interface SesionGrupal {
  id: string;
  tema: TemaGrupal;
  grupo: string;
  empieza_en: string;
  duracion_min: number;
  url_reunion: string;
  url_grabacion: string | null;
  notas: string | null;
}

/** Las que vienen, en orden. Las pasadas se piden aparte. */
export async function proximasGrupales(cuantas = 6): Promise<SesionGrupal[]> {
  const s = db();
  if (!s) return [];
  const { data, error } = await s
    .from('sesiones_grupales')
    .select('*')
    .gte('empieza_en', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString())
    .order('empieza_en', { ascending: true })
    .limit(cuantas);
  if (error) throw new Error(error.message);
  // Se piden desde dos horas atrás a propósito: una sesión que arrancó hace
  // media hora todavía es la de ahora, y desaparecía de la pantalla justo
  // cuando el cliente la buscaba para entrar.
  return (data ?? []) as SesionGrupal[];
}

/** Las grabaciones, para quien no pudo entrar. */
export async function grabacionesGrupales(cuantas = 12): Promise<SesionGrupal[]> {
  const s = db();
  if (!s) return [];
  const { data, error } = await s
    .from('sesiones_grupales')
    .select('*')
    .not('url_grabacion', 'is', null)
    .order('empieza_en', { ascending: false })
    .limit(cuantas);
  if (error) throw new Error(error.message);
  return (data ?? []) as SesionGrupal[];
}

/** Se marca al tocar «Entrar»: nadie tiene que acordarse de tomar asistencia. */
export async function marcarQueEntro(sesionId: string, clienteId: string): Promise<void> {
  const s = db();
  if (!s) return;
  const { error } = await s
    .from('asistencia_grupales')
    .upsert({ sesion_id: sesionId, cliente_id: clienteId });
  // Que falle la asistencia no puede impedirle entrar a la mentoría: es un dato
  // para el seguimiento, no una puerta.
  if (error) console.warn('no se pudo marcar la asistencia:', error.message);
}

export async function guardarGrupal(s: Partial<SesionGrupal> & { id?: string }): Promise<void> {
  const base = db();
  if (!base) throw new Error(SIN_BASE);
  const { error } = s.id
    ? await base.from('sesiones_grupales').update(s).eq('id', s.id)
    : await base.from('sesiones_grupales').insert(s);
  if (error) throw new Error(error.message);
}

/* ══════════════════ LO QUE MIRA EL EQUIPO ══════════════════ */

export interface EstadoDeAcompanamiento {
  cliente_id: string;
  nombre: string;
  servicio: string;
  reportes_sin_responder: number;
  reporte_mas_viejo: string | null;
  vencido: boolean;
  ultima_grupal_a_la_que_entro: string | null;
  grupales_seguidas_sin_entrar: number;
}

/** Una consulta para toda la pantalla del seguimiento, no cuatro por cliente. */
export async function estadoDeAcompanamiento(): Promise<EstadoDeAcompanamiento[]> {
  const s = db();
  if (!s) return [];
  const { data, error } = await s.rpc('estado_de_acompanamiento');
  if (error) throw new Error(error.message);
  return (data ?? []) as EstadoDeAcompanamiento[];
}
