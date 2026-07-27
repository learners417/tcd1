import { generateText } from './aiProvider';
import { INGREDIENTES, REGLAS_META, auditarPieza, type ResultadoAuditoria } from './formulasAnuncios';
import { FORMAS_VOSEO } from './vozLocalizada';

/**
 * EL CRÍTICO — la segunda revisión de una pieza, antes de que salga.
 *
 * Dos revisiones distintas, a propósito:
 *
 *   1. `auditarPieza()` es determinista: expresiones regulares, gratis e
 *      instantánea. Da siempre el mismo veredicto para el mismo texto, que
 *      es lo que hace que el criterio se pueda confiar.
 *
 *   2. Esto es juicio de verdad: lee la pieza como la leería una persona y
 *      además ESCRIBE lo que falta.
 *
 * LO IMPORTANTE: usa la tarea 'auditoria', que en el enrutador va a un modelo
 * distinto del que escribió la pieza (que usa 'guion'), y con temperatura
 * baja. Un modelo aprueba su propio texto casi siempre — pedirle que se
 * corrija a sí mismo no es una revisión, es una firma.
 */

export interface Correccion {
  /** Qué ingrediente faltaba. */
  ingrediente: string;
  /** La línea escrita, lista para pegar. */
  linea: string;
  /** Dónde va dentro de la pieza. */
  /** Texto libre del crítico, para mostrar. */
  donde: string;
  /** Dónde va de verdad. Se deriva del ingrediente, no de lo que escriba
   *  el modelo: un gancho SIEMPRE va primero, pase lo que pase. */
  posicion: 'inicio' | 'final';
}

export interface VeredictoCritico {
  /** El resultado determinista, que siempre está. */
  base: ResultadoAuditoria;
  /** Lo que el crítico escribió para lo que falta. null = no se pudo. */
  correcciones: Correccion[] | null;
  /** Problemas de política de Meta detectados. */
  alertasMeta: string[];
  /** Si el crítico no pudo opinar, por qué. */
  problema?: string;
}

/** Lo que la app le pide al crítico. Fuera de esto no opina. */
function promptCritico(texto: string, faltantes: string[], palabra: string): string {
  const receta = INGREDIENTES
    .filter((i) => faltantes.includes(i.nombre))
    .map((i) => `- ${i.nombre}: ${i.descripcion}`)
    .join('\n');

  return `Eres el revisor de un anuncio antes de que salga publicado. NO lo reescribes: solo agregas lo que falta.

EL ANUNCIO:
"""
${texto}
"""

INGREDIENTES QUE LE FALTAN:
${receta}

LA PALABRA CLAVE DE LA CAMPAÑA: ${palabra || '(sin definir)'}

REGLAS DE PUBLICACIÓN QUE NO SE PUEDEN ROMPER:
${REGLAS_META.map((r) => `- ${r}`).join('\n')}

TU TRABAJO:
1. Por cada ingrediente que falta, escribe UNA línea que lo resuelva, en el mismo tono y registro del anuncio. Nada de relleno.
2. Revisa si el anuncio rompe alguna regla de publicación.

REGISTRO: castellano neutro, de tú. Nunca voseo (${FORMAS_VOSEO}).
NO inventes resultados, cifras ni testimonios que no estén en el anuncio.

Responde SOLO con este JSON, sin texto alrededor ni bloques de código:
{"correcciones":[{"ingrediente":"NOMBRE","linea":"la línea escrita","donde":"dónde va"}],"alertasMeta":["problema encontrado"]}`;
}

/** Extrae el JSON aunque el modelo lo envuelva en texto o en un bloque. */
function leerJson(bruto: string): { correcciones?: unknown; alertasMeta?: unknown } | null {
  const limpio = bruto.replace(/```json|```/g, '').trim();
  const desde = limpio.indexOf('{');
  const hasta = limpio.lastIndexOf('}');
  if (desde === -1 || hasta <= desde) return null;
  try {
    return JSON.parse(limpio.slice(desde, hasta + 1));
  } catch {
    return null;
  }
}

/**
 * Revisa una pieza y escribe lo que le falta.
 *
 * Nunca lanza: si el crítico no puede opinar, se devuelve el veredicto
 * determinista igual. Perder la segunda revisión no puede dejar al sanador
 * sin ninguna.
 */
export async function revisarPieza(
  texto: string,
  palabra: string,
): Promise<VeredictoCritico> {
  const base = auditarPieza(texto);

  if (base.faltantes.length === 0) {
    return { base, correcciones: [], alertasMeta: [] };
  }

  try {
    const bruto = await generateText({
      tarea: 'auditoria',
      feature: 'constructor',
      prompt: promptCritico(texto, base.faltantes, palabra),
    });
    const json = leerJson(bruto);
    if (!json) {
      return { base, correcciones: null, alertasMeta: [], problema: 'El revisor respondió en un formato que no se pudo leer.' };
    }

    const correcciones: Correccion[] = Array.isArray(json.correcciones)
      ? (json.correcciones as Correccion[])
          .filter((c) => c && typeof c.linea === 'string' && c.linea.trim())
          .map((c) => ({
            ingrediente: String(c.ingrediente ?? '').slice(0, 40),
            linea: String(c.linea).trim().slice(0, 400),
            donde: String(c.donde ?? '').slice(0, 80),
            // El gancho abre la pieza. Si esta línea se pegara al final,
            // el anuncio quedaría al revés — y eso ya pasaba.
            posicion: /hook|gancho/i.test(String(c.ingrediente ?? '')) ? 'inicio' : 'final',
          }))
      : [];

    const alertasMeta: string[] = Array.isArray(json.alertasMeta)
      ? (json.alertasMeta as unknown[])
          .filter((a): a is string => typeof a === 'string' && a.trim().length > 0)
          .map((a) => a.trim().slice(0, 200))
      : [];

    return { base, correcciones, alertasMeta };
  } catch (err) {
    return {
      base,
      correcciones: null,
      alertasMeta: [],
      problema: err instanceof Error ? err.message : 'No se pudo revisar ahora.',
    };
  }
}
