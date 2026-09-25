import { generateText } from './aiProvider';
import { rubricaDe, type Rubrica, type Veredicto } from './rubricas';

/**
 * EL CRÍTICO GENÉRICO — juzga cualquier pieza estrella contra su rúbrica.
 *
 * Hermano de `criticoPieza.ts`, que sigue atendiendo solo los anuncios con su
 * auditoría determinista. Este toma la misma arquitectura y la abre al resto
 * del Camino: oferta, precio, mensaje, VSL, formulario, script y cartera.
 *
 * LO IMPORTANTE, igual que en el otro: usa la tarea 'auditoria', que en el
 * enrutador va a un modelo DISTINTO del que escribió la pieza. Un modelo
 * aprueba su propio texto casi siempre — pedirle que se corrija a sí mismo
 * no es una revisión, es una firma.
 *
 * Y una regla de producto: cuando bloquea, dice DÓNDE se arregla. Un
 * "no sale todavía" sin destino es un muro; con destino es una dirección.
 */

export interface CriterioEvaluado {
  pregunta: string;
  cumple: boolean;
  /** Por qué no cumple, en una frase. Vacío si cumple. */
  motivo: string;
}

export interface VeredictoRubrica {
  veredicto: Veredicto;
  /** Una frase. Nunca "podría mejorarse". */
  motivo: string;
  criterios: CriterioEvaluado[];
  /** Se disparó el descalificador. */
  descalificado: boolean;
  /** Su propio texto, reescrito. null si no hizo falta. */
  correccion: string | null;
  /** A dónde se lo manda si no sale. */
  donde_se_arregla: string | null;
  /** Si el crítico no pudo opinar, por qué. */
  problema?: string;
}

function prompt(texto: string, r: Rubrica): string {
  const criterios = r.criterios
    .map((c, i) => `${i + 1}. ${c.pregunta}\n   Qué mirar: ${c.busca}`)
    .join('\n');

  return `Eres el revisor de ${r.pieza}. No escribes la pieza: la juzgas.

LA PIEZA:
"""
${texto}
"""

LOS CRITERIOS. Cada uno se contesta con sí o no, nada intermedio:
${criterios}

EL DESCALIFICADOR. Si esto pasa, el veredicto es "no_sale" aunque los criterios estén bien:
${r.descalificador}

CÓMO RESPONDES:
- El motivo es UNA frase concreta. Nunca "podría mejorarse" ni "está bien pero".
  Mal: "la promesa podría ser más clara".
  Bien: "tu promesa dice acompañamiento, que es lo que haces tú, no lo que la persona logra".
- Si algo no cumple, reescribes ESA PARTE con las palabras de la pieza, no con las tuyas.
- Hablas de tú, en castellano neutro. Nunca voseo.

Responde SOLO este JSON, sin texto alrededor y sin bloques de código:
{"veredicto":"sale|reparos|no_sale","motivo":"una frase","descalificado":true|false,"criterios":[{"pregunta":"...","cumple":true|false,"motivo":"..."}],"correccion":"la parte reescrita, o null"}`;
}

function leerJson(bruto: string): Record<string, unknown> | null {
  try {
    const limpio = bruto.replace(/```json|```/g, '').trim();
    const ini = limpio.indexOf('{');
    const fin = limpio.lastIndexOf('}');
    if (ini < 0 || fin < 0) return null;
    return JSON.parse(limpio.slice(ini, fin + 1));
  } catch {
    return null;
  }
}

export async function revisarConRubrica(
  codigo: string,
  texto: string,
): Promise<VeredictoRubrica | null> {
  const r = rubricaDe(codigo);
  if (!r) return null;

  const vacio: VeredictoRubrica = {
    veredicto: 'reparos',
    motivo: '',
    criterios: [],
    descalificado: false,
    correccion: null,
    donde_se_arregla: null,
  };

  // Una pieza de dos líneas no se juzga: se devuelve.
  if (!texto || texto.trim().length < 40) {
    return {
      ...vacio,
      veredicto: 'no_sale',
      motivo: 'Todavía no hay pieza suficiente para juzgar.',
      donde_se_arregla: r.donde_se_arregla,
    };
  }

  try {
    const bruto = await generateText({
      tarea: 'auditoria',
      feature: 'constructor',
      prompt: prompt(texto, r),
    });
    const json = leerJson(bruto);
    if (!json) {
      return { ...vacio, problema: 'El revisor respondió en un formato que no se pudo leer.' };
    }

    const veredicto = (['sale', 'reparos', 'no_sale'] as const).includes(json.veredicto as Veredicto)
      ? (json.veredicto as Veredicto)
      : 'reparos';
    const descalificado = json.descalificado === true;
    // El descalificador manda: si se disparó, no sale, diga lo que diga el modelo.
    const final: Veredicto = descalificado ? 'no_sale' : veredicto;

    return {
      veredicto: final,
      motivo: typeof json.motivo === 'string' ? json.motivo : '',
      criterios: Array.isArray(json.criterios) ? (json.criterios as CriterioEvaluado[]) : [],
      descalificado,
      correccion: typeof json.correccion === 'string' && json.correccion.trim() ? json.correccion : null,
      donde_se_arregla: final === 'no_sale' ? r.donde_se_arregla : null,
    };
  } catch {
    return { ...vacio, problema: 'No se pudo revisar ahora. Guarda igual y vuelve a intentar.' };
  }
}

/** Si la sesión bloquea, no se sella el ADN sin "sale" o "reparos". */
export function puedeAvanzar(codigo: string, v: VeredictoRubrica | null): boolean {
  const r = rubricaDe(codigo);
  if (!r || !r.bloquea) return true;
  if (!v) return true; // si el crítico no pudo opinar, no se castiga al cliente
  return v.veredicto !== 'no_sale';
}
