import type { ProfileV2 } from '../supabase';
import type { AdnFieldKey } from './types';

/**
 * Mapper: nomenclatura simbólica del brief (IRRavatar_demografia, NEGoferta_mid)
 * → campos reales de ProfileV2 (adn_avatar, oferta_mid).
 *
 * Si un campo del ADN no está cargado todavía, devuelve "—" para que el
 * modelo sepa explícitamente que no debe inventar.
 */

const PLACEHOLDER = '—';

function nonEmpty(v: string | undefined | null): string {
  if (!v) return PLACEHOLDER;
  const t = String(v).trim();
  return t.length === 0 ? PLACEHOLDER : t;
}

const FIELD_MAP: Record<AdnFieldKey, (p: Partial<ProfileV2>) => string> = {
  IDhistoria_corta_50: (p) => nonEmpty(p.historia_50),
  IDhistoria_larga_300: (p) => nonEmpty(p.historia_300),
  IDproposito_frase: (p) => nonEmpty(p.proposito),
  IDlegado_declaracion: (p) => nonEmpty(p.legado),
  METAprofesion: (p) => nonEmpty(p.especialidad ?? p.nicho),

  IRRavatar_demografia: (p) => {
    const a = p.adn_avatar;
    if (!a) return nonEmpty(p.avatar_cliente);
    const parts = [
      a.nombre_ficticio,
      a.edad ? `${a.edad} años` : '',
      a.profesion,
      a.situacion,
    ].filter(Boolean);
    return parts.length ? parts.join(' · ') : nonEmpty(p.avatar_cliente);
  },

  IRRavatar_psicografia: (p) => {
    const a = p.adn_avatar;
    if (!a) return PLACEHOLDER;
    const dolores = a.dolores?.length ? `dolores: ${a.dolores.join(' / ')}` : '';
    const suenos = a.suenos?.length ? `sueños: ${a.suenos.join(' / ')}` : '';
    return [dolores, suenos].filter(Boolean).join(' · ') || PLACEHOLDER;
  },

  IRRavatar_objeciones: (p) => {
    const a = p.adn_avatar;
    if (!a?.objeciones?.length) return PLACEHOLDER;
    return a.objeciones.join(' / ');
  },

  IRRavatar_lenguaje: (p) => {
    const a = p.adn_avatar;
    if (!a?.lenguaje?.length) return PLACEHOLDER;
    return a.lenguaje.join(' / ');
  },

  // Mismas frases del avatar — Mateo las pide como "voz" del avatar
  IRRavatar_voz: (p) => {
    const a = p.adn_avatar;
    if (!a?.lenguaje?.length) return PLACEHOLDER;
    return a.lenguaje.join(' / ');
  },

  // Lo que ya probó sin éxito (P4 · análisis pacientes / journey)
  IRRavatar_cementerio: (p) =>
    nonEmpty(p.adn_pacientes_reales ?? p.adn_avatar_journey),

  IRRmatriz_a_infierno: (p) => nonEmpty(p.matriz_a),
  IRRmatriz_b_obstaculos: (p) => nonEmpty(p.matriz_b),
  IRRmatriz_c_cielo: (p) => nonEmpty(p.matriz_c),

  IRRpuv: (p) => nonEmpty(p.adn_usp ?? p.posicionamiento),
  IRRtransformaciones_lista: (p) => nonEmpty(p.adn_transformaciones),
  IRRmetodo_nombre: (p) => nonEmpty(p.metodo_nombre),
  IRRmetodo_pasos: (p) => nonEmpty(p.metodo_pasos),

  // Diferencial · resultado · garantía no tienen campos dedicados en ProfileV2
  // todavía. El entrenador maneja el PLACEHOLDER explícitamente.
  IRRmetodo_diferencial: () => PLACEHOLDER,
  IRRmetodo_resultado: () => PLACEHOLDER,

  NEGlead_magnet: (p) => nonEmpty(p.lead_magnet),
  NEGoferta_mid: (p) => nonEmpty(p.oferta_mid),
  NEGoferta_low: (p) => nonEmpty(p.oferta_low),
  NEGoferta_high: (p) => nonEmpty(p.oferta_high),
  NEGgarantia: () => PLACEHOLDER,
  NEGescenarios_roas: (p) => nonEmpty(p.adn_escenarios_roas),

  CAPscript_venta_W: (p) => nonEmpty(p.script_venta),
  CAPlanding_copy: (p) => nonEmpty(p.adn_landing_copy),
  CAPtriage_audios_5: (p) => nonEmpty(p.adn_triage_audios),
  CAPseguimiento_secuencia: (p) => nonEmpty(p.adn_emails_nurture),
};

export function buildAdnContext(
  perfil: Partial<ProfileV2>,
  fields: AdnFieldKey[],
): string {
  if (fields.length === 0) return '(sin campos requeridos)';
  return fields.map((f) => `- ${f}: ${FIELD_MAP[f](perfil)}`).join('\n');
}

export function getNombreSanador(perfil: Partial<ProfileV2>): string {
  return perfil.nombre?.split(' ')[0] ?? 'sanador';
}
