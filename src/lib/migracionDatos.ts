/**
 * LO QUE LA MIGRACIÓN DEL CLIENTE ESCRIBE EN LA BASE.
 *
 * Aparte de la lógica a propósito: `migracionDelCliente.ts` decide qué queda
 * hecho y qué no, y eso se prueba sin credenciales. Acá está lo único que toca
 * la base, en un archivo donde se puede revisar de una lectura qué se escribe
 * en el ADN de alguien.
 */
import { supabase, isSupabaseReady } from './supabase';
import type { ExtractedProfile } from './migrationTypes';
import { tieneContenido } from './migracionDelCliente';

function db() {
  return isSupabaseReady() ? supabase : null;
}

const SIN_BASE = 'La app no está conectada. Vuelve a entrar a tu cuenta.';

export interface EstadoMigracion {
  habilitada: boolean;
  migradoEn: string | null;
}

/** Si le toca migrarse, y si ya lo hizo. */
export async function miEstadoDeMigracion(clienteId: string): Promise<EstadoMigracion> {
  const s = db();
  if (!s) return { habilitada: false, migradoEn: null };
  const { data, error } = await s
    .from('profiles')
    .select('migracion_habilitada, migrado_en')
    .eq('id', clienteId)
    .maybeSingle();
  // Un error acá no puede habilitar la migración por las dudas: si no se pudo
  // leer la llave, la llave está apagada.
  if (error || !data) return { habilitada: false, migradoEn: null };
  const d = data as { migracion_habilitada?: boolean; migrado_en?: string | null };
  return {
    habilitada: d.migracion_habilitada === true,
    migradoEn: d.migrado_en ?? null,
  };
}

/**
 * Guarda lo que el cliente revisó.
 *
 * SOLO LOS CAMPOS CON CONTENIDO. Un campo vacío no se escribe: si se mandara
 * vacío, pisaría lo que el cliente ya pudiera tener cargado de antes, y eso es
 * borrarle trabajo con un texto pegado apurado.
 */
export async function guardarMiMigracion(
  clienteId: string,
  extraido: Partial<ExtractedProfile>,
): Promise<void> {
  const s = db();
  if (!s) throw new Error(SIN_BASE);

  const aGuardar: Record<string, unknown> = {};
  for (const [campo, valor] of Object.entries(extraido)) {
    if (!tieneContenido(valor)) continue;
    aGuardar[campo] = Array.isArray(valor) ? valor.join('\n') : valor;
  }

  if (Object.keys(aGuardar).length === 0) {
    // Se dice, no se calla: un guardado que no guardó nada y avisa «listo» es
    // la peor combinación posible.
    throw new Error('No hay nada con contenido para guardar todavía.');
  }

  const { error } = await s.from('profiles').update(aGuardar).eq('id', clienteId);
  if (error) throw new Error(error.message);

  // Y se cierra la migración. Va DESPUÉS del guardado y no antes: si el
  // guardado falla, el cliente no queda marcado como migrado con el ADN vacío
  // —y sin forma de volver a intentarlo, porque la pantalla ya no le
  // aparecería.
  const { error: err2 } = await s.rpc('cerrar_mi_migracion');
  if (err2) throw new Error(err2.message);
}

/* ══════════════════ LO QUE MIRA EL EQUIPO ══════════════════ */

export interface EstadoDeMigracionCliente {
  cliente_id: string;
  nombre: string;
  habilitada: boolean;
  migrado_en: string | null;
  piezas_para_campanas: number;
}

export async function estadoDeMigraciones(): Promise<EstadoDeMigracionCliente[]> {
  const s = db();
  if (!s) return [];
  const { data, error } = await s.rpc('estado_de_migraciones');
  if (error) throw new Error(error.message);
  return (data ?? []) as EstadoDeMigracionCliente[];
}

/** El equipo enciende o apaga la llave. */
export async function habilitarMigracion(
  clienteId: string,
  habilitar: boolean,
): Promise<void> {
  const s = db();
  if (!s) throw new Error(SIN_BASE);
  const { error } = await s.rpc('habilitar_migracion', {
    cliente: clienteId, habilitar,
  });
  if (error) throw new Error(error.message);
}
