/**
 * EL MONTAJE, CONTRA LA BASE.
 *
 * El cliente carga lo suyo; el equipo lee. Antes todo esto vivía en el
 * navegador del cliente: si cambiaba de teléfono lo perdía, y el equipo no veía
 * nunca si estaba listo para encender.
 */
import { supabase, isSupabaseReady, guardarFila } from './supabase';
import type { Montaje } from './montajeCampana';

const COLUMNAS =
  'user_id, palabra, url_pagina, pixel_id, url_perfil, presupuesto_diario, ' +
  'dias_sostenidos, dm_probado, trabajo_claro, url_anuncio_meta, dominio, ' +
  'url_formulario, url_calendario';

function db() {
  return isSupabaseReady() ? supabase : null;
}

/** Lo que montó este cliente. Vacío si todavía no empezó. */
export async function montajeDe(userId: string): Promise<Montaje> {
  const s = db();
  if (!s || !userId) return {};
  const { data } = await s.from('montaje_campana').select(COLUMNAS).eq('user_id', userId).maybeSingle();
  return (data as Montaje | null) ?? {};
}

/**
 * Lo de varios clientes, en una sola consulta.
 *
 * El Admin arma la lista con todos a la vez: de a uno serían tantas consultas
 * como clientes, cada mañana.
 */
export async function montajeDeVarios(userIds: string[]): Promise<Record<string, Montaje>> {
  const s = db();
  if (!s || !userIds.length) return {};
  const { data, error } = await s.from('montaje_campana').select(COLUMNAS).in('user_id', userIds);
  if (error || !data) return {};
  const out: Record<string, Montaje> = {};
  for (const fila of (data as unknown as Array<Montaje & { user_id: string }>)) out[fila.user_id] = fila;
  return out;
}

/**
 * Guarda lo que el cliente acaba de cargar.
 *
 * Crea la fila la primera vez. Devuelve el error en vez de tragárselo: si no
 * se pudo guardar, el cliente tiene que enterarse antes de encender una
 * campaña creyendo que está todo listo.
 */
export async function guardarMontaje(userId: string, cambio: Partial<Montaje>): Promise<void> {
  const s = db();
  if (!s || !userId) throw new Error('sin conexión');
  // `guardarFila` y no un upsert a secas: si la base todavía no tiene la
  // restricción única, un upsert revienta con 42P10 y el cliente pierde lo
  // que acababa de cargar. Esto cae a update, y si no había fila, inserta.
  const { error } = await guardarFila(
    'montaje_campana',
    { user_id: userId, ...cambio } as Record<string, unknown>,
    ['user_id'],
  );
  if (error) {
    const texto = (error as { message?: string }).message ?? '';
    throw new Error(
      /montaje_campana|does not exist/.test(texto)
        ? 'Falta correr la migración del montaje de campaña.'
        : texto || 'No se pudo guardar.',
    );
  }
}
