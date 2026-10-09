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
}

export type IdCandado =
  | 'anuncios' | 'palabra' | 'dm' | 'pagina'
  | 'pixel' | 'perfil' | 'trabajo' | 'presupuesto';

/** Los días que hay que poder sostener el presupuesto sin tocarlo. */
export const DIAS_SIN_TOCAR = 14;

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

/** Cuántos de los ocho están cerrados, contando el de los anuncios. */
export function cuantosCerrados(m: Montaje, anunciosListos: boolean): number {
  const propios: IdCandado[] = ['palabra', 'dm', 'pagina', 'pixel', 'perfil', 'trabajo', 'presupuesto'];
  return propios.filter((id) => candadoCerrado(m, id)).length + (anunciosListos ? 1 : 0);
}

/** Listo para encender: los ocho, sin excepciones. */
export function puedeEncender(m: Montaje, anunciosListos: boolean): boolean {
  return cuantosCerrados(m, anunciosListos) === 8;
}

/**
 * Lo que le falta, dicho como se dice.
 *
 * En el orden en que conviene resolverlo: primero lo que sin ello la campaña
 * no puede funcionar, después lo que la hace medible.
 */
export function loQueFalta(m: Montaje, anunciosListos: boolean): string[] {
  const falta: string[] = [];
  if (!anunciosListos) falta.push('sus tres anuncios escritos y auditados');
  if (!candadoCerrado(m, 'pagina')) falta.push('su página de venta');
  if (!candadoCerrado(m, 'palabra')) falta.push('su palabra configurada');
  if (!candadoCerrado(m, 'dm')) falta.push('probar su DM desde otra cuenta');
  if (!candadoCerrado(m, 'pixel')) falta.push('el píxel en su página');
  if (!candadoCerrado(m, 'perfil')) falta.push('el link de su perfil');
  if (!candadoCerrado(m, 'presupuesto')) falta.push(`un presupuesto que sostenga ${DIAS_SIN_TOCAR} días`);
  if (!candadoCerrado(m, 'trabajo')) falta.push('tener claro cuál es su único trabajo');
  return falta;
}

/** La línea que lee el equipo en la ficha del cliente. */
export function comoVaElMontaje(m: Montaje, anunciosListos: boolean): string {
  const n = cuantosCerrados(m, anunciosListos);
  if (n === 8) return 'Tiene los ocho. Puede encender.';
  const falta = loQueFalta(m, anunciosListos);
  const primero = falta[0];
  return n === 7
    ? `Le falta uno: ${primero}.`
    : `Tiene ${n} de 8. Lo primero que le falta: ${primero}.`;
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
