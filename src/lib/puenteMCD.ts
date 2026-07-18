/**
 * puenteMCD.ts — T13 · EL PUENTE MCD (Plan Maestro, idea #15).
 * Los artefactos del Camino se instalan solos en Mi Clínica: el protocolo de
 * entrega → plantilla, el paciente ideal → ficha, las ofertas → catálogo.
 * TCD escribe en la tabla compartida `clinica_artefactos`; MCD (mismo proyecto
 * Supabase, misma identidad) la lee. Todo degrada: sin tabla, no rompe.
 */
import { supabase, isSupabaseReady } from './supabase';
import type { ProfileV2 } from './supabase';

export interface PacienteIdealArtefacto {
  nombre_ficticio?: string;
  edad?: number;
  profesion?: string;
  situacion?: string;
  dolores?: string[];
  suenos?: string[];
  objeciones?: string[];
  lenguaje?: string[];
  descripcion?: string; // fallback texto libre
}

export interface ServicioCatalogo {
  nombre: string;
  descripcion?: string;
  precio?: number | null;
}

export interface ArtefactosClinica {
  metodo_nombre?: string;
  protocolo?: string;
  paciente_ideal?: PacienteIdealArtefacto | null;
  catalogo: ServicioCatalogo[];
}

/** Mapea el ADN del fundador → los artefactos que amueblan Mi Clínica. */
export function construirArtefactos(perfil: Partial<ProfileV2>): ArtefactosClinica {
  const protocolo =
    perfil.adn_protocolo_servicio ||
    perfil.adn_proceso_actual ||
    '';

  let paciente_ideal: PacienteIdealArtefacto | null = null;
  if (perfil.adn_avatar) {
    const a = perfil.adn_avatar;
    paciente_ideal = {
      nombre_ficticio: a.nombre_ficticio,
      edad: a.edad,
      profesion: a.profesion,
      situacion: a.situacion,
      dolores: a.dolores,
      suenos: a.suenos,
      objeciones: a.objeciones,
      lenguaje: a.lenguaje,
    };
  } else if (perfil.avatar_cliente) {
    paciente_ideal = { descripcion: perfil.avatar_cliente };
  }

  const catalogo: ServicioCatalogo[] = [];
  if (perfil.oferta_high) catalogo.push({ nombre: 'Programa principal', descripcion: perfil.oferta_high, precio: null });
  if (perfil.oferta_mid) catalogo.push({ nombre: 'Programa intermedio', descripcion: perfil.oferta_mid, precio: null });
  if (perfil.oferta_low) catalogo.push({ nombre: 'Puerta de entrada', descripcion: perfil.oferta_low, precio: null });
  const ul = perfil.adn_oferta_ultralow;
  if (ul && (ul.nombre || ul.precio)) {
    catalogo.push({ nombre: ul.nombre || 'Oferta ultra low', descripcion: ul.resultado, precio: ul.precio ?? null });
  }

  return {
    metodo_nombre: perfil.metodo_nombre,
    protocolo: protocolo || undefined,
    paciente_ideal,
    catalogo,
  };
}

/** ¿Hay algo del Camino para instalar en Mi Clínica? */
export function hayArtefactos(perfil: Partial<ProfileV2>): boolean {
  const a = construirArtefactos(perfil);
  return !!(a.protocolo || a.paciente_ideal || a.catalogo.length > 0);
}

/** Instala/actualiza los artefactos en la tabla compartida (upsert por user_id). */
export async function sincronizarArtefactos(
  userId: string,
  perfil: Partial<ProfileV2>,
): Promise<boolean> {
  if (!isSupabaseReady() || !supabase || !userId) return false;
  if (!hayArtefactos(perfil)) return false;
  const a = construirArtefactos(perfil);
  try {
    const { error } = await supabase.from('clinica_artefactos').upsert(
      {
        user_id: userId,
        metodo_nombre: a.metodo_nombre ?? null,
        protocolo: a.protocolo ?? null,
        paciente_ideal: a.paciente_ideal ?? null,
        catalogo: a.catalogo,
        actualizado_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );
    return !error;
  } catch {
    return false;
  }
}
