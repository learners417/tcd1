/**
 * LA AUDITORÍA DE UN ANUNCIO: QUIÉN APRUEBA, CÓMO SE PASA, Y QUÉ NO SE SALTA.
 *
 * ═══ EL BUG QUE ESTO ARREGLA ═══
 *
 * El Constructor decidía si una pieza estaba lista con una sola línea:
 *
 *   const listaParaPublicar =
 *     audit.aprobada && bloqueantes.length === 0 && (rev?.alertasMeta?.length ?? 0) === 0;
 *
 * Todo derivado. No existía ninguna forma de que una persona dijera «esto está
 * bien». Y `audit.aprobada` sale de ocho expresiones regulares que buscan ocho
 * ingredientes por las palabras con que suelen escribirse:
 *
 *   analogia: /(funciona como|es como|igual que|imagina|como un |como una )/
 *
 * Quien escribió «lo mismo que le pasa a una puerta trabada» tiene su analogía
 * y la auditoría le dice que falta. Toca «Que la revise y escriba lo que
 * falta», la revisa, sigue faltando. Vuelve a escribirla. Sigue faltando.
 *
 * Y el botón de copiar está deshabilitado mientras eso pase: el anuncio existe,
 * está bien escrito, y no hay manera de sacarlo de la pantalla.
 *
 * ═══ LA DISTINCIÓN QUE FALTABA ═══
 *
 * Había dos cosas muy distintas tratadas igual. Una no se puede saltar; la otra
 * nunca debió ser una puerta cerrada:
 *
 *   POLÍTICA DE META (bloquea) — No se salta. Nunca, ni con aprobación.
 *     Afirmar la condición del lector, prometer curas, pedir datos de salud.
 *     Lo que está en juego es la cuenta publicitaria: se pierde en semanas y a
 *     veces no vuelve. Acá la app tiene que ser tajante, porque el cliente no
 *     puede saber qué le cuesta equivocarse.
 *
 *   LOS 8 INGREDIENTES (consejo) — Se puede aprobar a mano.
 *     Es calidad de copy, medida por aproximación. Un anuncio al que le falta
 *     la analogía se publica igual y funciona peor. Eso es una advertencia, no
 *     un candado. Y el que decide es quien escribe.
 *
 * ═══ LA APROBACIÓN ESTÁ ATADA AL TEXTO ═══
 *
 * Si se guardara «la pieza 3 está aprobada», el cliente aprobaría una versión,
 * reescribiría el anuncio entero y seguiría aprobado — justo lo contrario de
 * una auditoría. Así que se guarda la huella del texto aprobado: al cambiarlo,
 * la aprobación se cae sola y vuelve a pedirse.
 */

import type { ResultadoAuditoria } from './formulasAnuncios';

/* ══════════════════ EL VEREDICTO ══════════════════ */

export type Veredicto =
  /** Política de Meta. No se publica, y no hay aprobación que lo habilite. */
  | 'bloqueada'
  /** Le faltan ingredientes. Se puede publicar si quien escribe lo aprueba. */
  | 'con_avisos'
  /** Pasó la auditoría automática. */
  | 'aprobada_sola'
  /** Tenía avisos y una persona los leyó y la aprobó. */
  | 'aprobada_a_mano';

export interface EstadoPieza {
  veredicto: Veredicto;
  /** Si se puede copiar y llevar a Meta. */
  sePuedePublicar: boolean;
  /** El título del cartel, en una línea. */
  titulo: string;
  /** Qué tiene que hacer ahora, en una línea. Siempre hay una. */
  queSigue: string;
  /** Si tiene sentido ofrecerle el botón de aprobar a mano. */
  puedeAprobarAMano: boolean;
}

/**
 * Qué le pasa a una pieza. Una sola función: antes esta cuenta estaba escrita
 * dentro del JSX, mezclada con los colores, y por eso nadie veía que no tenía
 * salida.
 */
export function estadoDePieza(a: {
  audit: ResultadoAuditoria;
  /** Cuántas alertas de política BLOQUEAN (gravedad 'bloquea'). */
  bloqueantes: number;
  /** Las alertas de Meta que escribió la segunda revisión, si corrió. */
  alertasMeta: number;
  /** Si esta misma versión del texto ya fue aprobada a mano. */
  aprobadaAMano: boolean;
}): EstadoPieza {
  // Primero lo que no se negocia. El orden importa: una pieza con un bloqueo
  // de política NO puede aparecer como aprobada por más que la aprueben.
  if (a.bloqueantes > 0 || a.alertasMeta > 0) {
    return {
      veredicto: 'bloqueada',
      sePuedePublicar: false,
      titulo: 'Esto no se puede publicar así',
      queSigue:
        'Corrige lo que está marcado arriba en rojo. Esto no es cuestión de estilo: ' +
        'es lo que hace que Meta cierre cuentas.',
      puedeAprobarAMano: false,
    };
  }

  if (a.audit.aprobada && a.audit.faltantes.length === 0) {
    return {
      veredicto: 'aprobada_sola',
      sePuedePublicar: true,
      titulo: 'Lista para publicar',
      queSigue: 'Cópiala y pégala en Meta.',
      puedeAprobarAMano: false,
    };
  }

  if (a.aprobadaAMano) {
    return {
      veredicto: 'aprobada_a_mano',
      sePuedePublicar: true,
      titulo: 'Aprobada por ti',
      queSigue:
        'Leíste los avisos y la aprobaste. Cópiala y pégala en Meta. ' +
        'Si la editas, te la vuelvo a mostrar.',
      puedeAprobarAMano: false,
    };
  }

  // Lo que antes era el callejón sin salida. Ahora tiene dos salidas y las dos
  // se dicen en la pantalla.
  const cuantos = a.audit.faltantes.length;
  return {
    veredicto: 'con_avisos',
    sePuedePublicar: false,
    titulo: cuantos === 1 ? 'Le falta un ingrediente' : `Le faltan ${cuantos} ingredientes`,
    queSigue:
      'Dos caminos: agrégale lo que falta, o apruébala igual si ya la escribiste ' +
      'con tus palabras. Lo de abajo son avisos de calidad, no de Meta.',
    puedeAprobarAMano: true,
  };
}

/* ══════════════════ LA HUELLA DEL TEXTO APROBADO ══════════════════ */

/**
 * Una huella corta y estable del texto. No es criptografía: solo tiene que
 * cambiar cuando el texto cambia, para que la aprobación no sobreviva a una
 * reescritura.
 */
export function huella(texto: string): string {
  const t = texto.trim();
  let h = 5381;
  for (let i = 0; i < t.length; i++) h = ((h << 5) + h + t.charCodeAt(i)) | 0;
  // Se le suma el largo: dos textos distintos del mismo largo pueden chocar en
  // el hash, pero dos de largo distinto ya no.
  return `${t.length.toString(36)}.${(h >>> 0).toString(36)}`;
}

export const CLAVE_APROBADAS = 'tcd_anuncios_aprobados_v1';

/** Lee el mapa { 'formulaId' : 'huella del texto aprobado' }. */
export function leerAprobadas(): Record<string, string> {
  try {
    const x = JSON.parse(localStorage.getItem(CLAVE_APROBADAS) ?? '{}') as unknown;
    return x && typeof x === 'object' ? (x as Record<string, string>) : {};
  } catch {
    return {};
  }
}

/** ¿Esta versión exacta de esta pieza está aprobada? */
export function estaAprobada(
  aprobadas: Record<string, string>,
  formulaId: number,
  texto: string,
): boolean {
  return aprobadas[String(formulaId)] === huella(texto);
}

/** Aprueba esta versión. Devuelve el mapa nuevo, para no mutar el estado. */
export function aprobar(
  aprobadas: Record<string, string>,
  formulaId: number,
  texto: string,
): Record<string, string> {
  const nuevo = { ...aprobadas, [String(formulaId)]: huella(texto) };
  try {
    localStorage.setItem(CLAVE_APROBADAS, JSON.stringify(nuevo));
  } catch {
    /* sin localStorage la aprobación vale para esta sesión */
  }
  return nuevo;
}

/** Deshace la aprobación. Para cuando se arrepiente. */
export function desaprobar(
  aprobadas: Record<string, string>,
  formulaId: number,
): Record<string, string> {
  const nuevo = { ...aprobadas };
  delete nuevo[String(formulaId)];
  try {
    localStorage.setItem(CLAVE_APROBADAS, JSON.stringify(nuevo));
  } catch {
    /* igual que arriba */
  }
  return nuevo;
}

/* ══════════════════ CÓMO SE EXPLICA ══════════════════ */

/**
 * «No me queda claro cómo es la auditoría, cómo la pasan, cómo la aprueban.»
 *
 * Tres líneas en la pantalla, no un manual aparte. Un cliente que no entiende
 * quién aprueba qué no avanza y pregunta — y preguntar es justamente lo que la
 * app existe para ahorrar.
 */
export const COMO_FUNCIONA_LA_AUDITORIA = [
  {
    titulo: 'Lo que yo reviso solo',
    texto:
      'Cada vez que escribes, busco los 8 ingredientes y las reglas de Meta. ' +
      'No tienes que pedirlo ni esperar a nadie.',
  },
  {
    titulo: 'Lo que no se puede publicar',
    texto:
      'Si algo rompe una regla de Meta, queda en rojo y no se copia hasta que lo ' +
      'corrijas. Eso no lo aprueba nadie: en juego está tu cuenta publicitaria.',
  },
  {
    titulo: 'Lo que apruebas tú',
    texto:
      'Si solo le faltan ingredientes, decides tú: agrégalos, o apruébala igual. ' +
      'Nadie del equipo tiene que mirarla para que avances.',
  },
] as const;
