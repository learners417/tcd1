/**
 * Schema ADN v8 · Método CLÍNICA · Hoja de Ruta v8 (mejoras.html · mayo 2026)
 *
 * Agrupa los 65 campos del ADN del Negocio en 7 secciones:
 *   - ID  (Identidad)         · transversal · P1-P3   (+ historia_cruda, diagnostico_capa, cinco_no)
 *   - META (Meta/Onboarding)  · P0                    (+ autoevaluacion_dia1 = Foto de Partida)
 *   - IRR (Irresistible)      · P4-P7                 (+ avatar_conexion_historia, mercado, mapeo_obstaculos)
 *   - NEG (Negocio)           · P7-P8                 (+ oferta_ultralow = 5ta oferta)
 *   - INF (Infraestructura)   · P9A + P10             (+ validacion_organica obligatoria)
 *   - CAP (Captación)         · P9B-P9C
 *   - MET (Métricas)          · P11
 *
 * Los campos existentes en ProfileV2 se mapean por `profileKey`. Los campos que
 * viven dentro de objetos JSON (ej. `adn_avatar.dolores`) usan `profilePath`.
 * Los campos que requieren migración SQL pendiente se marcan con `pending: true`.
 *
 * Cambios v7 → v8:
 *  - ID.linea_tiempo_7_puntos    → ID.linea_tiempo_8_puntos (mismo profileKey)
 *  - ID.carta_futuro_2036        → ID.carta_funeral         (mismo profileKey)
 *  - IRR.metodo_pasos            ahora incluye nivel_oferta por paso
 *  + 9 campos nuevos (ver tabla en mejoras.html · Anexo C)
 */

import type { ProfileV2 } from './supabase';

export type ADNSeccionCodigo = 'ID' | 'META' | 'IRR' | 'NEG' | 'INF' | 'CAP' | 'MET';

export interface ADNCampo {
  /** Código único del campo en v7 (usado en copy y glosario). */
  codigo: string;
  /** Label visible al usuario. */
  label: string;
  /** Pilar de origen (P0.2, P1.2, etc). */
  pilarOrigen: string;
  /** Nombre de la columna en ProfileV2 (si aplica). */
  profileKey?: keyof ProfileV2;
  /** Path de extracción para campos anidados en JSON (ej. "adn_avatar.dolores"). */
  profilePath?: string;
  /** true si todavía no hay columna en DB (esperando migración). */
  pending?: boolean;
  /** Campos obligatorios para la verificación del Día 45 (Sprint 6B). */
  criticoDia45?: boolean;
}

export interface ADNSeccion {
  codigo: ADNSeccionCodigo;
  titulo: string;
  subtitulo: string;
  pilarRange: string;
  campos: ADNCampo[];
}

/**
 * Schema completo v8 · 65 campos agrupados en 7 secciones.
 * Ver Anexo C de mejoras.html para el glosario v8.
 */
export const ADN_SCHEMA_V8: ADNSeccion[] = [
  // ─── ID · Identidad transversal · P1-P3 ────────────────────────────────────
  {
    codigo: 'ID',
    titulo: 'C·L — Conciencia y Liberación',
    subtitulo: 'Fase 1 · Tu relación con el dinero y tu voz. Se completa en Sanar el Dinero.',
    pilarRange: 'P1-P3',
    campos: [
      { codigo: 'ID.linea_tiempo_8_puntos', label: 'Línea de tiempo vital (8 puntos)', pilarOrigen: 'P1.2', profileKey: 'adn_linea_tiempo' },
      { codigo: 'ID.historia_cruda', label: 'Historia cruda (sin IA · 500 palabras)', pilarOrigen: 'P1.2b', profileKey: 'adn_historia_cruda', criticoDia45: true },
      { codigo: 'ID.historia_larga_300', label: 'Historia larga (~300 palabras)', pilarOrigen: 'P0.2', profileKey: 'historia_300', criticoDia45: true },
      { codigo: 'ID.historia_media_150', label: 'Historia media (~150 palabras)', pilarOrigen: 'P0.2', profileKey: 'historia_150' },
      { codigo: 'ID.historia_corta_50', label: 'Historia corta (~50 palabras)', pilarOrigen: 'P0.2', profileKey: 'historia_50' },
      { codigo: 'ID.cinco_por_que', label: 'Los 5 por qué', pilarOrigen: 'P2.2', profileKey: 'adn_cinco_por_que' },
      { codigo: 'ID.proposito_parrafo', label: 'Propósito (párrafo)', pilarOrigen: 'P0.2', profileKey: 'proposito' },
      { codigo: 'ID.proposito_frase', label: 'Propósito (frase corta)', pilarOrigen: 'P0.2', profileKey: 'proposito', criticoDia45: true },
      { codigo: 'ID.diagnostico_capa', label: 'Diagnóstico de la Capa (síndrome de la capa)', pilarOrigen: 'P2.4', profileKey: 'adn_diagnostico_capa' },
      { codigo: 'ID.cinco_no', label: 'Filtro del NO · 5 NOs concretos', pilarOrigen: 'P2.5', profileKey: 'adn_cinco_no', criticoDia45: true },
      { codigo: 'ID.carta_funeral', label: 'Carta desde tu funeral', pilarOrigen: 'P3.2', profileKey: 'adn_carta_futuro' },
      { codigo: 'ID.legado_declaracion', label: 'Declaración de legado', pilarOrigen: 'P0.2', profileKey: 'legado', criticoDia45: true },
    ],
  },

  // ─── META · Onboarding · P0 ────────────────────────────────────────────────
  {
    codigo: 'META',
    titulo: 'Punto de Partida',
    subtitulo: 'Fase 0 · Tu foto inicial. Se llenó al entrar — es tu antes.',
    pilarRange: 'P0',
    campos: [
      { codigo: 'META.profesion', label: 'Profesión / especialidad', pilarOrigen: 'P0.1', profileKey: 'especialidad' },
      { codigo: 'META.anios_experiencia', label: 'Años de experiencia', pilarOrigen: 'P0.1', profilePath: 'adn_formulario_bienvenida.anios_experiencia' },
      { codigo: 'META.pacientes_actuales', label: 'Pacientes activos', pilarOrigen: 'P0.1', profilePath: 'adn_formulario_bienvenida.pacientes_actuales' },
      { codigo: 'META.facturacion_rango', label: 'Rango de facturación', pilarOrigen: 'P0.1', profilePath: 'adn_formulario_bienvenida.facturacion_rango' },
      { codigo: 'META.frustracion_actual', label: 'Frustración principal hoy', pilarOrigen: 'P0.1', profilePath: 'adn_formulario_bienvenida.frustracion_actual' },
      { codigo: 'META.vision_90_dias', label: 'Visión 90 días', pilarOrigen: 'P0.1', profilePath: 'adn_formulario_bienvenida.vision_90_dias' },
      { codigo: 'META.horas_disponibles', label: 'Horas disponibles / día', pilarOrigen: 'P0.1', profilePath: 'adn_formulario_bienvenida.horas_disponibles' },
      { codigo: 'META.experiencia_digital', label: 'Experiencia digital previa', pilarOrigen: 'P0.1', profilePath: 'adn_formulario_bienvenida.experiencia_digital' },
      { codigo: 'META.autoevaluacion_dia1', label: 'Foto de Partida (autoevaluación 8 dimensiones)', pilarOrigen: 'P0.2', profileKey: 'adn_autoevaluacion_dia1' },
    ],
  },

  // ─── IRR · Irresistible · P4-P7 ────────────────────────────────────────────
  {
    codigo: 'IRR',
    titulo: 'I — Identidad',
    subtitulo: 'Fase 2 · Tu método con nombre y tu avatar: a quién sirves y por qué te eligen.',
    pilarRange: 'P4-P7',
    campos: [
      { codigo: 'IRR.avatar_demografia', label: 'Avatar · demografía', pilarOrigen: 'P2.3', profilePath: 'adn_avatar.edad', criticoDia45: true },
      { codigo: 'IRR.avatar_psicografia', label: 'Avatar · psicografía', pilarOrigen: 'P2.3', profilePath: 'adn_avatar.dolores', criticoDia45: true },
      { codigo: 'IRR.avatar_journey', label: 'Avatar · journey', pilarOrigen: 'P2.3', profileKey: 'adn_avatar_journey' },
      { codigo: 'IRR.avatar_objeciones', label: 'Avatar · objeciones', pilarOrigen: 'P2.3', profilePath: 'adn_avatar.objeciones' },
      { codigo: 'IRR.avatar_conexion_historia', label: 'Avatar · conexión con tu historia', pilarOrigen: 'P2.3', profileKey: 'adn_avatar_conexion_historia', criticoDia45: true },
      { codigo: 'IRR.mercado', label: 'Mercado (nivel 1 del embudo)', pilarOrigen: 'P5.2', profileKey: 'adn_mercado' },
      { codigo: 'IRR.nicho', label: 'Nicho', pilarOrigen: 'P2.3', profileKey: 'adn_nicho' },
      { codigo: 'IRR.micronicho', label: 'Micronicho', pilarOrigen: 'P2.3', profileKey: 'adn_micronicho', criticoDia45: true },
      { codigo: 'IRR.puv', label: 'PUV (Propuesta Única de Valor · para el nicho)', pilarOrigen: 'P4.2', profileKey: 'adn_usp', criticoDia45: true },
      { codigo: 'IRR.transformaciones_lista', label: 'Lista de transformaciones', pilarOrigen: 'P5.4', profileKey: 'adn_transformaciones' },
      { codigo: 'IRR.matriz_a_infierno', label: 'Matriz A · el infierno', pilarOrigen: 'P2.3', profileKey: 'matriz_a', criticoDia45: true },
      { codigo: 'IRR.matriz_b_obstaculos', label: 'Matriz B · los obstáculos', pilarOrigen: 'P2.3', profileKey: 'matriz_b' },
      { codigo: 'IRR.matriz_c_cielo', label: 'Matriz C · el cielo', pilarOrigen: 'P2.3', profileKey: 'matriz_c', criticoDia45: true },
      { codigo: 'IRR.metodo_nombre', label: 'Nombre del método propio', pilarOrigen: 'P2.4', profileKey: 'metodo_nombre', criticoDia45: true },
      { codigo: 'IRR.metodo_pasos', label: 'Pasos del método (3-7 · con nivel_oferta por paso)', pilarOrigen: 'P2.4', profileKey: 'metodo_pasos', criticoDia45: true },
      { codigo: 'IRR.metodo_mapeo_obstaculos', label: 'Mapeo Obstáculos B → Pasos del método', pilarOrigen: 'P2.4', profileKey: 'adn_metodo_mapeo_obstaculos' },
    ],
  },

  // ─── NEG · Negocio · P7-P8 ─────────────────────────────────────────────────
  {
    codigo: 'NEG',
    titulo: 'N — Narrativa',
    subtitulo: 'Fase 2 · Tu oferta y la matemática que cierra.',
    pilarRange: 'P7-P8',
    campos: [
      { codigo: 'NEG.proceso_actual', label: 'Proceso actual documentado', pilarOrigen: 'P7.5', profileKey: 'adn_proceso_actual' },
      { codigo: 'NEG.oferta_mid', label: 'Oferta Mid ($1K-5K · DWY · principal)', pilarOrigen: 'P3.2', profileKey: 'oferta_mid', criticoDia45: true },
      { codigo: 'NEG.oferta_ultralow', label: 'Oferta Ultra Low ($17-47 · DIY)', pilarOrigen: 'P3.2', profileKey: 'adn_oferta_ultralow', criticoDia45: true },
      { codigo: 'NEG.lead_magnet', label: 'Lead Magnet ($0)', pilarOrigen: 'P3.2', profileKey: 'lead_magnet' },
      { codigo: 'NEG.oferta_low', label: 'Oferta Low ($100-500 · DIY)', pilarOrigen: 'P3.2', profileKey: 'oferta_low' },
      { codigo: 'NEG.oferta_high', label: 'Oferta High ($5K+ · DFY)', pilarOrigen: 'P3.2', profileKey: 'oferta_high' },
      { codigo: 'NEG.escenarios_roas', label: 'Escenarios ROAS ($10K)', pilarOrigen: 'P8.7', profileKey: 'adn_escenarios_roas' },
    ],
  },

  // ─── INF · Infraestructura · P9A + P10 ─────────────────────────────────────
  {
    codigo: 'INF',
    titulo: 'I — Instalación',
    subtitulo: 'Fase 3 · Tu sistema de captación: el agente, la agenda, la campaña.',
    pilarRange: 'P9A + P10',
    campos: [
      { codigo: 'INF.landing_copy_completo', label: 'Copy completo de landing', pilarOrigen: 'P4.5b', profileKey: 'adn_landing_copy' },
      { codigo: 'INF.vsl_script', label: 'Script del VSL', pilarOrigen: 'P5.2', profileKey: 'adn_vsl_script' },
      { codigo: 'INF.perfil_ig_optimizado', label: 'Perfil de IG optimizado (bio + destacadas + link)', pilarOrigen: 'P4.2b', profileKey: 'adn_perfil_ig' },
      { codigo: 'INF.anuncio_followme', label: 'El montaje de campaña (los 8 candados)', pilarOrigen: 'P4.6', profileKey: 'adn_anuncio_followme' },
      { codigo: 'INF.anuncios_meta_6_creativos', label: 'Anuncios Meta · 6 creativos N1/N2/N3', pilarOrigen: 'P4.3', profileKey: 'adn_anuncios' },
      { codigo: 'INF.validacion_organica', label: 'Validación orgánica (mínimo 3 piezas)', pilarOrigen: 'P4.3d', profileKey: 'adn_validacion_organica' },
      { codigo: 'INF.meta_config', label: 'Configuración Meta Ads', pilarOrigen: 'P9A.5', profileKey: 'adn_meta_config' },
      { codigo: 'INF.skool_setup', label: 'Setup Skool (Free + Paid)', pilarOrigen: 'P9A.5', profileKey: 'adn_skool_setup' },
      { codigo: 'INF.paleta_colores', label: 'Paleta de colores', pilarOrigen: 'P10.2', profileKey: 'identidad_colores' },
      { codigo: 'INF.tipografias', label: 'Tipografías', pilarOrigen: 'P10.2', profileKey: 'identidad_tipografia' },
      { codigo: 'INF.templates_canva', label: 'Templates en Canva (10-15)', pilarOrigen: 'P10.3', profileKey: 'adn_templates_canva' },
      { codigo: 'INF.creativos_v2_con_identidad', label: 'Creativos v2 con identidad aplicada', pilarOrigen: 'P10.3', profileKey: 'adn_creativos_v2' },
    ],
  },

  // ─── CAP · Captación · P9B-P9C ─────────────────────────────────────────────
  {
    codigo: 'CAP',
    titulo: 'C — Cobro',
    subtitulo: 'Fases 3-4 · Cómo conviertes mensajes en llamadas, y llamadas en pacientes.',
    pilarRange: 'P9B-P9C',
    campos: [
      { codigo: 'CAP.script_venta_W', label: 'Script de venta · la W', pilarOrigen: 'P9B.3', profileKey: 'script_venta' },
      { codigo: 'CAP.triage_audios_5', label: 'Triage WhatsApp · 5 audios', pilarOrigen: 'P9B.2', profileKey: 'adn_triage_audios' },
      { codigo: 'CAP.masterclass_estructura', label: 'Masterclass · 90 min · 5 bloques', pilarOrigen: 'P9B.4', profileKey: 'adn_masterclass_estructura' },
      { codigo: 'CAP.protocolo_entrega', label: 'Protocolo de entrega post-venta', pilarOrigen: 'P6.2', profileKey: 'adn_protocolo_servicio' },
      { codigo: 'CAP.emails_nurture_6', label: 'Secuencia 6 emails · 28 días', pilarOrigen: 'P9C.2', profileKey: 'adn_emails_nurture' },
      { codigo: 'CAP.plan_contenido_semanal', label: 'Plan de contenido semanal (Mar N1 · Jue N2 · Sáb N3)', pilarOrigen: 'P9C.3', profileKey: 'adn_plan_contenido_semanal' },
      { codigo: 'CAP.retargeting_config', label: 'Configuración de retargeting', pilarOrigen: 'P9C.4', profileKey: 'adn_retargeting_config' },
    ],
  },

  // ─── MET · Métricas · P11 ──────────────────────────────────────────────────
  {
    codigo: 'MET',
    titulo: 'A — Autonomía',
    subtitulo: 'Fase 4 · De 1 a 10: el sistema trabajando por ti.',
    pilarRange: 'P11',
    campos: [
      { codigo: 'MET.tablero_cierre_ciclo', label: 'Tablero de cierre del ciclo', pilarOrigen: 'P11.1', profileKey: 'adn_tablero_cierre' },
      { codigo: 'MET.retrospectiva_documentada', label: 'Retrospectiva documentada', pilarOrigen: 'P11.2', profileKey: 'adn_retrospectiva' },
      { codigo: 'MET.plan_ciclo_2', label: 'Plan del ciclo 2 (Consolidar / Optimizar / Escalar)', pilarOrigen: 'P11.2', profileKey: 'adn_plan_ciclo_2' },
      { codigo: 'MET.masterclass_analytics', label: 'Masterclass Analytics', pilarOrigen: 'P11.2', profileKey: 'adn_masterclass_analytics' },
    ],
  },
];

/** Backward-compat alias para imports antiguos. v7 ahora es v8. */
export const ADN_SCHEMA_V7 = ADN_SCHEMA_V8;

/** Campos críticos que se verifican el Día 45 (Anexo D v8). */
export const CAMPOS_CRITICOS_DIA_45: string[] = ADN_SCHEMA_V8
  .flatMap((seccion) => seccion.campos)
  .filter((c) => c.criticoDia45)
  .map((c) => c.codigo);

/** Extrae el valor de un campo del perfil, soportando paths anidados. */
export function getADNValor(perfil: Partial<ProfileV2>, campo: ADNCampo): unknown {
  if (campo.profileKey) {
    return perfil[campo.profileKey];
  }
  if (campo.profilePath) {
    const partes = campo.profilePath.split('.');
    let cursor: unknown = perfil;
    for (const parte of partes) {
      if (cursor === null || cursor === undefined) return undefined;
      if (typeof cursor !== 'object') return undefined;
      cursor = (cursor as Record<string, unknown>)[parte];
    }
    return cursor;
  }
  return undefined;
}

/** Devuelve true si el campo tiene valor válido en el perfil. */
export function campoEstaCompleto(perfil: Partial<ProfileV2>, campo: ADNCampo): boolean {
  const valor = getADNValor(perfil, campo);
  if (valor === undefined || valor === null) return false;
  if (typeof valor === 'string') return valor.trim().length > 0;
  if (Array.isArray(valor)) return valor.length > 0;
  if (typeof valor === 'object') return Object.keys(valor).length > 0;
  if (typeof valor === 'number') return true;
  if (typeof valor === 'boolean') return true;
  return false;
}

/** Calcula el porcentaje de completitud de una sección del ADN. */
export function calcularCompletitudSeccion(
  perfil: Partial<ProfileV2>,
  seccion: ADNSeccion,
): { completos: number; total: number; porcentaje: number } {
  const completos = seccion.campos.filter((c) => campoEstaCompleto(perfil, c)).length;
  const total = seccion.campos.length;
  const porcentaje = total === 0 ? 0 : Math.round((completos / total) * 100);
  return { completos, total, porcentaje };
}

/** Porcentaje de completitud del ADN completo. */
export function calcularCompletitudTotal(perfil: Partial<ProfileV2>): {
  completos: number;
  total: number;
  porcentaje: number;
} {
  const todosLosCampos = ADN_SCHEMA_V8.flatMap((s) => s.campos);
  const completos = todosLosCampos.filter((c) => campoEstaCompleto(perfil, c)).length;
  const total = todosLosCampos.length;
  const porcentaje = total === 0 ? 0 : Math.round((completos / total) * 100);
  return { completos, total, porcentaje };
}

// ─── Helpers de Foto de Partida (P0.2) · Comparación Día 45 ──────────────────

/**
 * Las 8 dimensiones autoevaluadas en la Foto de Partida (P0.2).
 * El usuario las califica 1-5 al día 1, y la app las compara contra el ADN real
 * al día 45 (efecto revelación de "lo que no sabías que no sabías").
 */
export const DIMENSIONES_FOTO_PARTIDA = [
  { key: 'historia',         label: 'Tu historia en 30 segundos',           refCampo: 'ID.historia_corta_50' },
  { key: 'proposito',        label: 'Tu propósito como filtro real',        refCampo: 'ID.proposito_frase' },
  { key: 'legado',           label: 'Tu declaración de legado',             refCampo: 'ID.legado_declaracion' },
  { key: 'avatar',           label: 'Tu avatar definido y específico',      refCampo: 'IRR.avatar_psicografia' },
  { key: 'metodo_nombrado',  label: 'Tu método con nombre propio',          refCampo: 'IRR.metodo_nombre' },
  { key: 'escalera_ofertas', label: 'Tu escalera de ofertas armada',        refCampo: 'NEG.oferta_mid' },
  { key: 'contenido_nivel',  label: 'Tu contenido por nivel de awareness',  refCampo: 'INF.anuncios_meta_6_creativos' },
  { key: 'sistema_autonomo', label: 'Tu sistema funcionando sin vos',       refCampo: 'CAP.retargeting_config' },
] as const;

export type DimensionFotoPartida = (typeof DIMENSIONES_FOTO_PARTIDA)[number]['key'];

/**
 * Calcula la autoevaluación "actual" (día 45+) derivada del estado real del ADN.
 * Cada dimensión vale 5 si el campo de referencia está completo, 1 si está vacío.
 * Es una aproximación intencionalmente simple — el objetivo es la comparación
 * relativa, no un score perfecto.
 */
export function calcularAutoevaluacionActual(perfil: Partial<ProfileV2>): number[] {
  const todosLosCampos = ADN_SCHEMA_V8.flatMap((s) => s.campos);
  return DIMENSIONES_FOTO_PARTIDA.map((dim) => {
    const campo = todosLosCampos.find((c) => c.codigo === dim.refCampo);
    if (!campo) return 1;
    return campoEstaCompleto(perfil, campo) ? 5 : 1;
  });
}
