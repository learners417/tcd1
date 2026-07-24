/**
 * graduacion.ts — T11 · LA EMOCIÓN FINAL (Plan Maestro).
 * Los datos de la graduación completa: los comprobantes de los 10 (viven en
 * Storage, subidos como evidencia en los hitos de venta) y el Mensaje al
 * Futuro (el audio sellado del Día 1, que se abre en la graduación — T3 #10).
 * Todo degrada con elegancia: sin conexión o sin archivos, devuelve vacío.
 */
import { supabase, isSupabaseReady } from './supabase';
import { listarEvidencias, urlEvidencia, type Evidencia } from './evidencia';

/** Los hitos donde vive el comprobante de pago (primer $1.000 y los 10). */
const CODIGOS_COMPROBANTE = ['P6.3', 'P6.4', 'P7.3'];

export interface Comprobante extends Evidencia {
  url?: string;
  esImagen: boolean;
}

/** Los comprobantes de los 10 (evidencia subida en los hitos de venta). */
export async function fetchComprobantes(userId: string): Promise<Comprobante[]> {
  if (!userId) return [];
  const todas: Evidencia[] = [];
  for (const codigo of CODIGOS_COMPROBANTE) {
    try {
      const ev = await listarEvidencias(userId, codigo);
      todas.push(...ev);
    } catch {
      /* un hito sin evidencia no rompe el resto */
    }
  }
  return Promise.all(
    todas.map(async (e) => ({
      ...e,
      url: (await urlEvidencia(e.path)) ?? undefined,
      esImagen: /\.(png|jpe?g|webp|gif|heic)$/i.test(e.name),
    })),
  );
}

const BUCKET = 'task-attachments';

/**
 * El Mensaje al Futuro: el audio sellado del Día 1. Se busca en Storage bajo
 * mensaje-futuro/{userId}/. Devuelve la URL firmada o null (todavía no grabado).
 */
export async function fetchMensajeFuturo(userId: string): Promise<string | null> {
  if (!isSupabaseReady() || !supabase || !userId) return null;
  try {
    const { data } = await supabase.storage.from(BUCKET).list(`mensaje-futuro/${userId}`, { limit: 5 });
    const audio = (data ?? []).find((f) => f.name && /\.(mp3|m4a|wav|ogg|webm)$/i.test(f.name));
    if (!audio) return null;
    const { data: signed } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(`mensaje-futuro/${userId}/${audio.name}`, 3600);
    return signed?.signedUrl ?? null;
  } catch {
    return null;
  }
}
