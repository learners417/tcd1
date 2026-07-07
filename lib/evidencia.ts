/**
 * evidencia.ts — Evidencia por sesión (Cirugía Final F2 · jul 2026)
 * La evidencia se sube EN la tarea (foto de la quema, audio del precio,
 * screenshot de la campaña, comprobante del pago). Sin tabla nueva:
 * vive en Storage bajo evidencias/{userId}/{metaCodigo}/.
 */
import { supabase, isSupabaseReady } from './supabase';

const BUCKET = 'task-attachments';

export interface Evidencia {
  name: string;
  path: string;
  created_at?: string;
}

function carpeta(userId: string, metaCodigo: string): string {
  return `evidencias/${userId}/${metaCodigo.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
}

/** Lista las evidencias subidas para una meta. [] si no hay o sin conexión. */
export async function listarEvidencias(userId: string, metaCodigo: string): Promise<Evidencia[]> {
  if (!isSupabaseReady() || !supabase || !userId) return [];
  const { data, error } = await supabase.storage.from(BUCKET).list(carpeta(userId, metaCodigo), { limit: 20 });
  if (error || !data) return [];
  return data
    .filter((f) => f.name && !f.name.startsWith('.'))
    .map((f) => ({ name: f.name, path: `${carpeta(userId, metaCodigo)}/${f.name}`, created_at: f.created_at }));
}

/** Sube una evidencia. Devuelve la evidencia o null si falla. */
export async function subirEvidencia(userId: string, metaCodigo: string, file: File): Promise<Evidencia | null> {
  if (!isSupabaseReady() || !supabase || !userId) return null;
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${carpeta(userId, metaCodigo)}/${Date.now()}_${safe}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false });
  if (error) return null;
  return { name: safe, path };
}

/** URL firmada para ver una evidencia. */
export async function urlEvidencia(path: string): Promise<string | null> {
  if (!isSupabaseReady() || !supabase) return null;
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}
