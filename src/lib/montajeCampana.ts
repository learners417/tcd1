/**
 * EL MONTAJE DE LA CAMPAÑA — qué le falta para poder encender.
 *
 * ═══ LA DECISIÓN QUE ORDENA ESTO ═══
 *
 * **Cada candado es un dato, no un tilde.** «Tu píxel está activo» no se marca
 * a mano: se marca porque el id del píxel está cargado. Un tilde vacío no lo
 * puede verificar nadie —ni el cliente a sí mismo— y además no le sirve al
 * equipo para nada. Un dato sí: se mira, se abre, se chequea.
 *
 * Dos de los ocho siguen siendo un sí o no, porque son acciones y no cosas:
 * probar el DM desde otra cuenta, y tener claro cuál es su único trabajo.
 *
 * Lógica pura: no toca la base, así se puede probar sola.
 */

import type { ObjetivoCampana } from './campanasTypes';

export interface Montaje {
  palabra?: string | null;
  url_pagina?: string | null;
  pixel_id?: string | null;
  url_perfil?: string | null;
  presupuesto_diario?: number | null;
  dias_sostenidos?: number | null;
  dm_probado?: boolean | null;
  trabajo_claro?: boolean | null;
  url_anuncio_meta?: string | null;
  dominio?: string | null;
  url_formulario?: string | null;
  url_calendario?: string | null;
  /** Dónde corre la campaña. De acá sale la banda de CPM con la que se juzga
   *  su costo: `bandaDe([])` cae en la referencia de México, y así se le decía
   *  «caro» o «barato» a toda la cartera con la banda mexicana. */
  paises?: string[] | null;
}

export type IdCandado =
  | 'anuncios' | 'palabra' | 'dm' | 'pagina'
  | 'pixel' | 'perfil' | 'trabajo' | 'presupuesto';

/** Los días que hay que poder sostener el presupuesto sin tocarlo. */
export const DIAS_SIN_TOCAR = 14;

/**
 * Dónde queda anotada la fecha de encendido.
 *
 * Vive acá y no escrita a mano en cada pantalla: la escribe el Montaje y la
 * leen la activación y el tablero. Con el texto repetido, cambiarla en un
 * lugar deja a los otros leyendo una clave que ya nadie escribe — y eso se ve
 * igual que una campaña que nunca se encendió.
 */
export const CLAVE_ENCENDIDA = 'tcd_campana_encendida_v1';

/**
 * LOS CANDADOS QUE APLICAN A CADA MOTOR.
 *
 * Había ocho candados obligatorios «sin excepciones». Pero dos de ellos —la
 * palabra clave y el DM automático— son del motor de comentarios: alguien
 * escribe la palabra, le llega el DM, y el DM lo manda a la página.
 *
 * Una campaña de clientes potenciales va DIRECTO al video, sin palabra. Con los
 * ocho obligatorios, esa campaña nunca podía encender: le faltaban para siempre
 * dos candados que pedían configurar algo que no usa.
 */
export function candadosQueAplican(objetivo: ObjetivoCampana): IdCandado[] {
  const base: IdCandado[] = [
    'anuncios', 'pagina', 'pixel', 'perfil', 'presupuesto', 'trabajo',
  ];
  // Solo el motor de comentarios necesita la palabra y el DM probado.
  return objetivo === 'clientes_potenciales' ? base : [...base, 'palabra', 'dm'];
}

const hayTexto = (v: string | null | undefined): boolean =>
  typeof v === 'string' && v.trim().length > 0;

/**
 * Si un candado está cerrado, y por qué.
 *
 * `anuncios` no vive acá: sale de las piezas auditadas en el Constructor, y lo
 * resuelve quien llama.
 */
export function candadoCerrado(m: Montaje, id: IdCandado): boolean {
  switch (id) {
    case 'palabra': return hayTexto(m.palabra);
    case 'pagina': return hayTexto(m.url_pagina);
    case 'pixel': return hayTexto(m.pixel_id);
    case 'perfil': return hayTexto(m.url_perfil);
    case 'dm': return m.dm_probado === true;
    case 'trabajo': return m.trabajo_claro === true;
    case 'presupuesto':
      return (m.presupuesto_diario ?? 0) > 0
        && (m.dias_sostenidos ?? 0) >= DIAS_SIN_TOCAR;
    default: return false;
  }
}

/**
 * CUÁNTOS CANDADOS LE APLICAN, Y CUÁNTOS CERRÓ.
 *
 * Acá vivían `cuantosCerrados` y `puedeEncender` contando OCHO fijos. Eran la
 * cuenta vieja: dos de los ocho —la palabra y el DM probado— son del motor de
 * comentarios, y la campaña que la app monta va directo al video sin palabra.
 * Con los ocho obligatorios, al cliente le faltaban para siempre dos candados
 * que pedían configurar algo que no usa.
 *
 * La cuenta correcta está en `activacion.ts` (`candadosQueAplican`) y ahora es
 * la única. Esta función la usa en vez de repetirla: con dos cuentas en el
 * repo, el Admin le decía «6 de 8» al equipo mientras el cliente leía «6 de 6
 * · listo para encender» — y la discusión de quién tiene razón la termina
 * teniendo el que está delante del cliente.
 *
 * El objetivo es obligatorio a propósito. Un valor por omisión es exactamente
 * cómo esta pantalla quedó pidiendo ocho sin que nadie lo notara.
 */
export function cuantosCerrados(
  m: Montaje,
  objetivo: ObjetivoCampana,
  anunciosListos: boolean,
): number {
  return candadosQueAplican(objetivo).filter((id) =>
    id === 'anuncios' ? anunciosListos : candadoCerrado(m, id)).length;
}

/** Cuántos le aplican en total, para poder decir «4 de 6». */
export function cuantosAplican(objetivo: ObjetivoCampana): number {
  return candadosQueAplican(objetivo).length;
}

/** Listo para encender: los que le aplican, sin excepciones. */
export function puedeEncender(
  m: Montaje,
  objetivo: ObjetivoCampana,
  anunciosListos: boolean,
): boolean {
  return cuantosCerrados(m, objetivo, anunciosListos) === cuantosAplican(objetivo);
}

/**
 * Lo que le falta, dicho como se dice.
 *
 * En el orden en que conviene resolverlo: primero lo que sin ello la campaña
 * no puede funcionar, después lo que la hace medible. Y solo lo que le aplica:
 * antes le reclamaba al equipo «su palabra configurada» para una campaña que
 * no usa palabra, y el equipo se lo pedía al cliente.
 */
export function loQueFalta(
  m: Montaje,
  objetivo: ObjetivoCampana,
  anunciosListos: boolean,
): string[] {
  const aplican = new Set(candadosQueAplican(objetivo));
  const nombre: Array<[IdCandado, string]> = [
    ['anuncios', 'sus tres anuncios escritos y auditados'],
    ['pagina', 'su página de venta'],
    ['palabra', 'su palabra configurada'],
    ['dm', 'probar su DM desde otra cuenta'],
    ['pixel', 'el píxel en su página'],
    ['perfil', 'el link de su perfil'],
    ['presupuesto', `un presupuesto que sostenga ${DIAS_SIN_TOCAR} días`],
    ['trabajo', 'tener claro cuál es su único trabajo'],
  ];
  return nombre
    .filter(([id]) => aplican.has(id))
    .filter(([id]) => (id === 'anuncios' ? !anunciosListos : !candadoCerrado(m, id)))
    .map(([, texto]) => texto);
}

/**
 * La línea que lee el equipo en la ficha del cliente.
 *
 * El total sale de lo que le aplica y ya no está escrito a mano: decía «de 8»
 * aunque al cliente le pidiera seis, y el equipo leía «6 de 8» mientras el
 * cliente leía «listo para encender».
 */
export function comoVaElMontaje(
  m: Montaje,
  objetivo: ObjetivoCampana,
  anunciosListos: boolean,
): string {
  const total = cuantosAplican(objetivo);
  const n = cuantosCerrados(m, objetivo, anunciosListos);
  if (n === total) return `Tiene los ${total}. Puede encender.`;
  const primero = loQueFalta(m, objetivo, anunciosListos)[0];
  return n === total - 1
    ? `Le falta uno: ${primero}.`
    : `Tiene ${n} de ${total}. Lo primero que le falta: ${primero}.`;
}

// ── La pieza que el equipo necesita mirar ──────────────────────────

export interface LinkDeLaCampana { que: string; url: string }

/**
 * Los links que el equipo abre para revisar una campaña.
 *
 * Existe porque hasta hoy nada de esto se guardaba: para mirar el anuncio de
 * un cliente había que pedírselo por mensaje.
 */
export function linksDe(m: Montaje): LinkDeLaCampana[] {
  const links: LinkDeLaCampana[] = [];
  const poner = (que: string, url: string | null | undefined) => {
    if (hayTexto(url)) links.push({ que, url: url!.trim() });
  };
  poner('El anuncio corriendo', m.url_anuncio_meta);
  poner('Su página de venta', m.url_pagina);
  poner('Su perfil', m.url_perfil);
  poner('El formulario', m.url_formulario);
  poner('El calendario', m.url_calendario);
  return links;
}

/** Un dominio o un link, escrito como lo escribiría una persona apurada. */
export function comoUrl(valor: string): string {
  const v = valor.trim();
  if (!v) return v;
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

/**
 * CUÁNTOS DÍAS LLEVA ENCENDIDA.
 *
 * El cálculo estaba escrito en Campañas y lo necesita también la pantalla de
 * Hoy, que cambia de cara el día que el cliente enciende. Con dos copias, una
 * se arregla y la otra queda contando distinto, y entonces la app dice una
 * cosa en una pantalla y otra en la de al lado.
 *
 * `null` = todavía no encendió.
 */
export function diasEncendida(): number | null {
  try {
    const crudo = localStorage.getItem(CLAVE_ENCENDIDA);
    const fecha = crudo ? (JSON.parse(crudo) as string | null) : null;
    if (!fecha) return null;
    const dias = Math.floor((Date.now() - new Date(fecha).getTime()) / 86400000);
    return Number.isFinite(dias) ? Math.max(0, dias) : null;
  } catch { return null; }
}

/**
 * Si ya pasó de construir a sostener.
 *
 * Es el cambio de etapa del programa: de acá en adelante lo que manda son sus
 * números de la semana, no la sesión del día.
 */
export function yaEncendio(): boolean {
  return diasEncendida() !== null;
}
