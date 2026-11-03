/**
 * LOS TRES CAMPOS QUE META PIDE AL MONTAR UN ANUNCIO.
 *
 * ═══ QUÉ FALTABA ═══
 *
 * La app escribía el anuncio completo y el cliente lo copiaba. Pero Meta no
 * pide «el anuncio»: pide tres campos separados, y dos de ellos no existían en
 * ninguna parte.
 *
 *   TEXTO PRINCIPAL — el cuerpo. Esto sí lo tenía.
 *   TITULAR         — la línea en negrita debajo del video. No existía.
 *   DESCRIPCIÓN     — la línea de apoyo. No existía.
 *
 * Así que al llegar al administrador de anuncios, con el cuerpo copiado y dos
 * campos vacíos delante, escribía cualquier cosa ahí mismo. Y lo que escribe
 * apurado en el campo que no entiende es lo que después lee quien duda si
 * hacer clic.
 *
 * ═══ LOS LÍMITES, Y QUÉ SE VE DE VERDAD ═══
 *
 * Meta recomienda 125 caracteres de texto principal, 40 de titular y 30 de
 * descripción. No son topes: deja escribir más, y recorta con «… más».
 *
 * Y hay algo que conviene decirle porque cambia dónde pone el esfuerzo: en un
 * reel de Instagram el titular y la descripción casi no se ven — el botón se
 * lleva la atención. Se llenan igual, porque Meta los pide y porque el mismo
 * anuncio se muestra en Feed y en Explorar, donde sí aparecen.
 *
 * Decirle «llena esto, aunque en el reel casi no se vea» es más honesto que
 * dejarlo creyendo que el titular es lo que decide. Lo que decide, en un reel,
 * son los tres primeros segundos del video.
 */

export const LIMITE_TEXTO = 125;
export const LIMITE_TITULAR = 40;
export const LIMITE_DESCRIPCION = 30;

export interface CamposMeta {
  /** El cuerpo. Lo que ya se escribía. */
  textoPrincipal: string;
  /** La línea en negrita. Máximo 40 para que no se corte. */
  titular: string;
  /** La línea de apoyo. Máximo 30. */
  descripcion: string;
  /** El botón. */
  botón: string;
}

export interface CampoConAviso {
  id: 'textoPrincipal' | 'titular' | 'descripcion' | 'botón';
  /** Como se llama EN META, para que lo encuentre en la pantalla. */
  etiqueta: string;
  valor: string;
  limite: number;
  /** Vacío cuando está bien. */
  aviso: string;
  /** Dónde se ve y dónde no. */
  dondeSeVe: string;
}

export const BOTON_RECOMENDADO = 'Más información';

/**
 * La revisión de los tres campos, con el largo contado.
 *
 * El aviso dice cuántos caracteres se pasa, no «es muy largo»: con el número,
 * sabe cuánto sacar.
 */
export function revisarCampos(c: CamposMeta): CampoConAviso[] {
  const uno = (
    id: CampoConAviso['id'], etiqueta: string, valor: string, limite: number, dondeSeVe: string,
  ): CampoConAviso => {
    const largo = valor.trim().length;
    let aviso = '';
    if (largo === 0) aviso = 'Está vacío. Meta lo pide.';
    else if (largo > limite) {
      aviso = `${largo} caracteres: ${largo - limite} de más. A partir de ${limite} se corta.`;
    }
    return { id, etiqueta, valor: valor.trim(), limite, aviso, dondeSeVe };
  };

  return [
    uno('textoPrincipal', 'Texto principal', c.textoPrincipal, LIMITE_TEXTO,
      'Las primeras dos líneas se ven siempre; el resto queda detrás de «más».'),
    uno('titular', 'Titular', c.titular, LIMITE_TITULAR,
      'En Feed y Explorar se ve en negrita. En el reel casi no se ve.'),
    uno('descripcion', 'Descripción', c.descripcion, LIMITE_DESCRIPCION,
      'Solo en Feed, y chica. Es la que menos pesa de las tres.'),
    uno('botón', 'Llamada a la acción', c.botón, 40,
      'Se ve siempre, en todas las ubicaciones. Es lo que se toca.'),
  ];
}

/** Si los cuatro están como Meta los quiere. */
export function camposListos(c: CamposMeta): boolean {
  return revisarCampos(c).every((x) => x.aviso === '');
}

/* ══════════════════ SACARLOS DEL ANUNCIO QUE YA ESCRIBIÓ ══════════════════ */

/**
 * El primer intento, sin gastar una llamada al modelo.
 *
 * El titular sale del gancho, que es la primera línea del anuncio y ya está
 * escrita para frenar el scroll. Recortado en una palabra entera, no a la
 * mitad: un titular cortado en «profesio…» se ve descuidado y es lo primero
 * que lee alguien que no te conoce.
 */
export function primerIntento(textoDelAnuncio: string, oferta?: string): CamposMeta {
  const lineas = textoDelAnuncio.trim().split('\n').map((l) => l.trim()).filter(Boolean);
  const gancho = lineas[0] ?? '';

  return {
    textoPrincipal: textoDelAnuncio.trim(),
    titular: recortarEnPalabra(sinEmojis(gancho), LIMITE_TITULAR),
    descripcion: recortarEnPalabra(sinEmojis(oferta ?? ''), LIMITE_DESCRIPCION),
    botón: BOTON_RECOMENDADO,
  };
}

/** Recorta sin partir palabras ni dejar un signo colgando. */
export function recortarEnPalabra(texto: string, limite: number): string {
  const t = texto.trim();
  if (t.length <= limite) return t;
  const cortado = t.slice(0, limite);
  const hastaEspacio = cortado.slice(0, cortado.lastIndexOf(' '));
  // Si la primera palabra ya pasa el límite, no hay espacio donde cortar: se
  // devuelve el recorte duro antes que una cadena vacía.
  const base = hastaEspacio.length > 0 ? hastaEspacio : cortado;
  return base.replace(/[\s,;:.¡!¿?—-]+$/, '');
}

/** Los emojis no cuentan igual en todos lados y en el titular se ven mal. */
function sinEmojis(s: string): string {
  return s.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '').replace(/\s+/g, ' ').trim();
}

/**
 * Lo que se le pide al modelo cuando el primer intento no alcanza.
 *
 * Va con los límites adentro: pedirle «un titular corto» devuelve setenta
 * caracteres, y después hay que recortarlo a mano justo donde pierde el
 * sentido.
 */
export function promptDeCampos(a: {
  textoDelAnuncio: string; oferta?: string; aQuien?: string;
}): string {
  return `Escribe el TITULAR y la DESCRIPCIÓN de este anuncio para Meta.

EL ANUNCIO:
${a.textoDelAnuncio}
${a.oferta ? `\nLA OFERTA: ${a.oferta}` : ''}${a.aQuien ? `\nA QUIÉN: ${a.aQuien}` : ''}

TITULAR — hasta ${LIMITE_TITULAR} caracteres contando espacios.
  Es la línea en negrita debajo del video. Dice el resultado o el momento, no
  el nombre del programa. Sin emojis. Sin signos de admiración.

DESCRIPCIÓN — hasta ${LIMITE_DESCRIPCION} caracteres contando espacios.
  Una línea de apoyo. Lo concreto: qué es o para quién es.

REGLAS
- Castellano neutro (tú). Nunca voseo.
- En positivo: lo que sí es, nunca lo que no es.
- Nunca la palabra «gente»: personas o consultantes.
- Hablado y natural, como lo diría alguien en voz alta. Sin tono de marketing.
- Nada de promesas de curación ni de afirmar la condición de quien lee.
- Cuenta los caracteres antes de responder. Si te pasas, acórtalo.

Responde SOLO este JSON, sin nada alrededor:
{"titular":"…","descripcion":"…"}`;
}

/** Lee lo que devolvió el modelo sin romperse si vino con texto alrededor. */
export function leerRespuesta(crudo: string): { titular: string; descripcion: string } | null {
  try {
    const m = /\{[\s\S]*\}/.exec(crudo);
    if (!m) return null;
    const x = JSON.parse(m[0]) as { titular?: unknown; descripcion?: unknown };
    const t = typeof x.titular === 'string' ? x.titular.trim() : '';
    const d = typeof x.descripcion === 'string' ? x.descripcion.trim() : '';
    if (!t) return null;
    // Se recorta igual: el modelo se pasa del límite seguido, y un titular
    // cortado por Meta a la mitad de una palabra es peor que uno más corto.
    return {
      titular: recortarEnPalabra(t, LIMITE_TITULAR),
      descripcion: recortarEnPalabra(d, LIMITE_DESCRIPCION),
    };
  } catch {
    return null;
  }
}

/** Lo que se copia y se pega campo por campo en el administrador. */
export function paraPegar(c: CamposMeta): string {
  return [
    '═══ TEXTO PRINCIPAL ═══', c.textoPrincipal, '',
    '═══ TITULAR ═══', c.titular, '',
    '═══ DESCRIPCIÓN ═══', c.descripcion, '',
    '═══ LLAMADA A LA ACCIÓN ═══', c.botón,
  ].join('\n');
}
