/**
 * primero() — el primer valor con CONTENIDO real.
 *
 * Existe por un bug que se repitio en varios archivos: `a ?? b` solo cae a
 * `b` cuando `a` es null o undefined. Un string vacio ('') NO es nullish, asi
 * que un campo guardado vacio se lleva puesto todo el resto de la cadena y el
 * fallback no corre nunca. Con datos que vienen de formularios y de la base,
 * '' es el estado mas comun de "no hay nada" — no undefined.
 *
 * Usar SIEMPRE que la intencion sea "el primero que tenga algo".
 */
export function primero(...vs: unknown[]): string {
  for (const v of vs) {
    const t = String(v ?? '').trim();
    if (t) return t;
  }
  return '';
}
