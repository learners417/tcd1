/**
 * fechas.ts — cómo se escribe una fecha donde la lee el cliente.
 *
 * Cada pantalla tenía su propio `toLocaleDateString` con sus propias
 * opciones, y el cierre del Camino ni eso: mostraba la fecha cruda, como
 * viene de la base. «Se cerró el 2026-10-14» es lo que lee alguien a quien se
 * le terminó el programa, en la pantalla donde se le cuenta qué hizo y se le
 * ofrece seguir. Nadie habla así.
 */

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/**
 * «14 de octubre». Sin año, porque dentro del programa siempre es este.
 *
 * Toma la fecha como viene de la base —2026-10-14— y la parte a mano en vez
 * de pasarla por `new Date`: ese constructor la lee como medianoche UTC y en
 * Argentina, que va tres horas atrás, devuelve el día anterior.
 */
export function fechaEnPalabras(iso?: string | null): string {
  if (!iso) return '';
  const [a, m, d] = iso.slice(0, 10).split('-').map(Number);
  if (!a || !m || !d) return iso;
  const mes = MESES[m - 1];
  if (!mes) return iso;
  const hoy = new Date();
  const esteAnio = hoy.getFullYear() === a;
  return esteAnio ? `${d} de ${mes}` : `${d} de ${mes} de ${a}`;
}
