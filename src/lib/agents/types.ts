import type { PilarId, ProfileV2 } from '../supabase';

export interface MensajeAgente {
  rol: 'usuario' | 'agente';
  contenido: string;
}

export type AdnFieldKey =
  | 'IDhistoria_corta_50'
  | 'IDhistoria_larga_300'
  | 'IDproposito_frase'
  | 'IDlegado_declaracion'
  | 'METAprofesion'
  | 'IRRavatar_demografia'
  | 'IRRavatar_psicografia'
  | 'IRRavatar_objeciones'
  | 'IRRavatar_lenguaje'
  | 'IRRmatriz_a_infierno'
  | 'IRRmatriz_b_obstaculos'
  | 'IRRmatriz_c_cielo'
  | 'IRRpuv'
  | 'IRRtransformaciones_lista'
  | 'IRRmetodo_nombre'
  | 'IRRmetodo_pasos'
  | 'NEGlead_magnet'
  | 'NEGoferta_mid'
  | 'NEGoferta_low'
  | 'NEGoferta_high';

export interface ConfigAgente {
  id: string;
  titulo: string;
  subtitulo: string;
  icon: string;
  accentOpacity: string;
  descripcion: string;
  unlockPilar: PilarId;
  adnFieldsNeeded: AdnFieldKey[];
  sistemPrompt: (perfil: Partial<ProfileV2>) => string;
  mensajeInicial: (perfil: Partial<ProfileV2>) => string;
  sugerencias: string[];
}
