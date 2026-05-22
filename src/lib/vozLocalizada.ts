/**
 * vozLocalizada.ts — Reglas de dialecto y voz por país.
 *
 * Sol (peruana entre Panamá e Italia) reportó que la IA escribe sus landings
 * en voseo argentino. La solución: capturar el país del sanador y derivar el
 * dialecto correcto (voseo / tuteo) para todo contenido publicable destinado
 * a su avatar de cliente.
 *
 * Convención:
 *   - "voseo" → vos / tenés / querés / sabés (Argentina, Uruguay, partes de Paraguay,
 *      Centroamérica voseante)
 *   - "tuteo" → tú / tienes / quieres / sabes (resto de LATAM, España, Caribe)
 *
 * El COACH IA puede seguir hablándole a la usuaria en voseo argentino (es la
 * voz de Javo, parte de la marca). Pero el CONTENIDO que se publica al
 * cliente final (landings, anuncios, copy, reels) debe usar el dialecto del
 * país de la usuaria — salvo que ella diga lo contrario.
 */

export type Dialecto = 'voseo' | 'tuteo';

export interface PaisInfo {
  /** Código ISO-like usado en DB y en selects. */
  codigo: string;
  /** Nombre visible al usuario. */
  nombre: string;
  /** Dialecto dominante para contenido publicable. */
  dialecto: Dialecto;
  /** Modismos/sabores típicos que la IA puede usar con moderación. */
  modismos?: string[];
}

/**
 * Lista de países objetivo del Método CLÍNICA — LATAM + España.
 * Mantener corta y curada: el selector no necesita 200 países.
 * El campo `modismos` es opcional y orientativo (la IA NO debe forzarlos).
 */
export const PAISES: PaisInfo[] = [
  { codigo: 'AR', nombre: 'Argentina', dialecto: 'voseo' },
  { codigo: 'UY', nombre: 'Uruguay', dialecto: 'voseo' },
  { codigo: 'PY', nombre: 'Paraguay', dialecto: 'voseo' },
  { codigo: 'MX', nombre: 'México', dialecto: 'tuteo' },
  { codigo: 'CO', nombre: 'Colombia', dialecto: 'tuteo' },
  { codigo: 'PE', nombre: 'Perú', dialecto: 'tuteo' },
  { codigo: 'CL', nombre: 'Chile', dialecto: 'tuteo' },
  { codigo: 'VE', nombre: 'Venezuela', dialecto: 'tuteo' },
  { codigo: 'EC', nombre: 'Ecuador', dialecto: 'tuteo' },
  { codigo: 'BO', nombre: 'Bolivia', dialecto: 'tuteo' },
  { codigo: 'PA', nombre: 'Panamá', dialecto: 'tuteo' },
  { codigo: 'CR', nombre: 'Costa Rica', dialecto: 'tuteo' },
  { codigo: 'GT', nombre: 'Guatemala', dialecto: 'tuteo' },
  { codigo: 'HN', nombre: 'Honduras', dialecto: 'tuteo' },
  { codigo: 'SV', nombre: 'El Salvador', dialecto: 'tuteo' },
  { codigo: 'NI', nombre: 'Nicaragua', dialecto: 'voseo' },
  { codigo: 'DO', nombre: 'República Dominicana', dialecto: 'tuteo' },
  { codigo: 'CU', nombre: 'Cuba', dialecto: 'tuteo' },
  { codigo: 'PR', nombre: 'Puerto Rico', dialecto: 'tuteo' },
  { codigo: 'ES', nombre: 'España', dialecto: 'tuteo' },
  { codigo: 'US', nombre: 'Estados Unidos (hispanohablante)', dialecto: 'tuteo' },
  { codigo: 'OTRO', nombre: 'Otro / Español neutro', dialecto: 'tuteo' },
];

export function getPaisInfo(codigo: string | null | undefined): PaisInfo | null {
  if (!codigo) return null;
  return PAISES.find((p) => p.codigo === codigo) ?? null;
}

/**
 * Devuelve el dialecto a usar para contenido publicable destinado al avatar
 * del cliente del sanador. Default: tuteo (es el más universal en LATAM).
 */
export function dialectoParaContenido(paisCodigo: string | null | undefined): Dialecto {
  const info = getPaisInfo(paisCodigo);
  return info?.dialecto ?? 'tuteo';
}

/**
 * Bloque de instrucciones para inyectar en prompts de contenido publicable
 * (landings, anuncios, copies, reels). NO usar en el Coach IA hablando con
 * la usuaria — ese conserva la voz de Javo (voseo argentino universal).
 */
export function instruccionesDialecto(paisCodigo: string | null | undefined): string {
  const info = getPaisInfo(paisCodigo);
  const dialecto = info?.dialecto ?? 'tuteo';
  const paisNombre = info?.nombre ?? 'no especificado';

  if (dialecto === 'voseo') {
    return `
=== REGLA DE DIALECTO (OBLIGATORIA) ===
País del profesional: ${paisNombre}.
El contenido va dirigido al avatar de cliente del profesional · usa VOSEO RIOPLATENSE neutro:
- "vos" en lugar de "tú" · "tenés" en lugar de "tienes" · "querés" en lugar de "quieres"
- "sos" en lugar de "eres" · "podés" en lugar de "puedes" · "sabés" en lugar de "sabes"
- Imperativos voseo: "decime" "vení" "andá" "mirá" "escuchá"
- Sin modismos locales fuertes (nada de "che" · "boludo" · "pibe") — universal voseante.
- Si el avatar del cliente tiene un campo "lenguaje" con frases textuales · respetá esas frases exactas.
`.trim();
  }

  return `
=== REGLA DE DIALECTO (OBLIGATORIA) ===
País del profesional: ${paisNombre}.
El contenido va dirigido al avatar de cliente del profesional · usa TUTEO (español neutro de LATAM):
- "tú" en lugar de "vos" · "tienes" en lugar de "tenés" · "quieres" en lugar de "querés"
- "eres" en lugar de "sos" · "puedes" en lugar de "podés" · "sabes" en lugar de "sabés"
- Imperativos tuteo: "dime" "ven" "ve" "mira" "escucha"
- PROHIBIDO usar voseo argentino ("vos" · "tenés" · "querés" · "sos") en el contenido publicable.
- Sin modismos regionales fuertes — debe sonar natural a un hispanohablante de ${paisNombre} sin que un lector de otro país hispanohablante lo sienta extranjero.
- Si el avatar del cliente tiene un campo "lenguaje" con frases textuales · respetá esas frases exactas (esas son las palabras reales que dice el cliente final · no las traduzcas).
`.trim();
}
