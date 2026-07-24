import type { ProfileV2 } from '../supabase';
import type { AdnFieldKey } from './types';
import { getPaisInfo, instruccionesDialecto } from '../vozLocalizada';

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

  // Oferta Ultra Low ($17-47, DIY) · objeto estructurado AdnOfertaUltralow.
  NEGoferta_ultralow: (p) => {
    const o = p.adn_oferta_ultralow;
    if (!o) return PLACEHOLDER;
    const parts = [
      o.nombre,
      o.precio ? `$${o.precio}` : '',
      o.resultado,
    ].filter(Boolean);
    return parts.length ? parts.join(' · ') : PLACEHOLDER;
  },

  NEGgarantia: () => PLACEHOLDER,
  NEGescenarios_roas: (p) => nonEmpty(p.adn_escenarios_roas),

  IRRnicho: (p) => nonEmpty(p.adn_nicho ?? p.adn_micronicho ?? p.nicho),

  CAPscript_venta_W: (p) => nonEmpty(p.script_venta),
  CAPlanding_copy: (p) => nonEmpty(p.adn_landing_copy),
  CAPtriage_audios_5: (p) => nonEmpty(p.adn_triage_audios),
  CAPseguimiento_secuencia: (p) => nonEmpty(p.adn_emails_nurture),
};

export function buildAdnContext(
  perfil: Partial<ProfileV2>,
  fields: AdnFieldKey[],
): string {
  const paisInfo = getPaisInfo(perfil.pais);
  const paisLinea = paisInfo
    ? `- País del profesional: ${paisInfo.nombre} (dialecto del contenido publicable: ${paisInfo.dialecto})`
    : '- País del profesional: no especificado';

  const camposLista = fields.length === 0
    ? '(sin campos requeridos)'
    : fields.map((f) => `- ${f}: ${FIELD_MAP[f](perfil)}`).join('\n');

  // El bloque de dialecto SOLO aplica al contenido publicable (reels · stories ·
  // carruseles · copies que el sanador publicará). La voz interna del entrenador
  // hablando con el sanador queda regida por voz-javo.ts (voseo universal).
  const cadena = buildCadenaCustodia(perfil);
  return `${paisLinea}\n${camposLista}\n${cadena}\n${instruccionesDialecto(perfil.pais)}\n\nREGLA DE APLICACIÓN DEL DIALECTO:\n- Las reglas de dialecto de arriba aplican al contenido publicable (texto de reels · stories · carruseles · copies · landings · anuncios) que el sanador publicará a sus clientes finales.
- Tu voz como entrenador hablándole AL sanador SE ADAPTA a la persona: usa el trato de su país por defecto (Argentina/Uruguay/Paraguay/Nicaragua → vos; el resto → tú), y si el sanador te escribe con el otro trato, espejalo — el individuo manda sobre el país. Con moderación (máximo una cada varios mensajes, jamás forzada) podés usar expresiones naturales de su país para que la conversación se sienta de casa.
- Cuando entregues un guión / copy / texto final · respetá el dialecto del país del sanador.`;
}

/**
 * LA CADENA DE CUSTODIA (T8) — cada entrenador abre sabiendo qué construyó
 * el sanador antes de llegar a él. El precio grabado alimenta la oferta ·
 * la oferta alimenta el guion · el guion alimenta la página. El trabajo
 * anterior se cita y se respeta · jamás se pide de nuevo ni se reescribe.
 */
export function buildCadenaCustodia(perfil: Partial<ProfileV2>): string {
  const piezas: string[] = [];
  const p = perfil as Record<string, unknown>;
  const texto = (v: unknown): string | null => {
    if (typeof v === 'string' && v.trim()) return v.trim().slice(0, 220);
    return null;
  };
  const precio = texto(p['adn_precio_alto'] ?? p['adn_precio']);
  if (precio) piezas.push(`- SU NÚMERO (el precio que pronunció en voz alta en la semana 1): ${precio}`);
  const oferta = texto(p['adn_oferta_high'] ?? p['oferta_mid'] ?? p['adn_oferta']);
  if (oferta) piezas.push(`- SU OFERTA construida: ${oferta}`);
  const puv = texto(p['adn_usp'] ?? p['posicionamiento']);
  if (puv) piezas.push(`- SU PUV: ${puv}`);
  const metodo = texto(p['adn_metodo_nombre'] ?? p['adn_metodo']);
  if (metodo) piezas.push(`- SU MÉTODO con nombre: ${metodo}`);
  const estandarte = texto(p['adn_creencia_nueva'] ?? p['adn_estandarte']);
  if (estandarte) piezas.push(`- SU CREENCIA NUEVA (el Estandarte de la semana 1): ${estandarte}`);
  // los compromisos de la última Sesión Viva
  try {
    const raw = localStorage.getItem('tcd_ultima_sesion_v1');
    if (raw) {
      const ult = JSON.parse(raw) as { metaTitulo?: string; compromisos?: string[] };
      if (ult?.compromisos?.length) {
        piezas.push(`- SUS COMPROMISOS de la última sesión ("${ult.metaTitulo ?? ''}"): ${ult.compromisos.join(' · ')}`);
      }
    }
  } catch { /* noop */ }
  if (piezas.length === 0) return '';
  return `\nLA CADENA DE CUSTODIA — lo que este sanador YA construyó antes de llegar a vos (citalo al abrir · construí SOBRE esto · jamás lo pidas de nuevo ni lo reescribas sin su permiso):\n${piezas.join('\n')}\nSi tu trabajo depende de una de estas piezas · abrí la conversación nombrándola ("Escuché tu número: … · tu oferta la construimos sobre eso").\n`;
}

export function getNombreSanador(perfil: Partial<ProfileV2>): string {
  return perfil.nombre?.split(' ')[0] ?? 'sanador';
}
