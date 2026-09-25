/**
 * EL ADN COINCIDENTE — que todo diga lo mismo.
 *
 * Su avatar, su método, su oferta y su precio son la fuente. De ahí salen sus
 * guiones, su página, sus anuncios, su llamada y su preventa.
 *
 * Cuando cambia una fuente, lo que salió de ella queda viejo. Sin esto, el
 * cliente corrige su oferta el día 46 y sigue con anuncios que prometen otra
 * cosa: su página dice una, su video dice otra y la llamada dice una tercera.
 *
 * Acá no se rehace nada solo. La app le avisa qué quedó viejo y él decide
 * cuándo lo corrige.
 */

export const KEY_SELLOS = 'tcd_adn_sellos_v1';

export interface Fuente {
  /** El día donde se define. */
  dia: number;
  /** Cómo se llama en su idioma. */
  nombre: string;
  /** Los días que salen de esta fuente. */
  derivados: number[];
}

export const FUENTES: Fuente[] = [
  { dia: 5, nombre: 'tu precio', derivados: [10, 19, 24] },
  { dia: 8, nombre: 'tu avatar', derivados: [11, 15, 16, 19, 24] },
  { dia: 9, nombre: 'tu método', derivados: [10, 11, 16] },
  { dia: 10, nombre: 'tu oferta', derivados: [11, 15, 16, 19, 24] },
];

/** Cómo se llama cada cosa que puede quedar vieja. */
export const DERIVADOS: Record<number, string> = {
  10: 'tu oferta',
  11: 'tus guiones',
  15: 'tus videos grabados',
  16: 'tu página y tu perfil',
  19: 'tu llamada',
  24: 'tu preventa',
};

type Sellos = Record<string, number>;

function leer(): Sellos {
  try {
    const raw = localStorage.getItem(KEY_SELLOS);
    return raw ? (JSON.parse(raw) as Sellos) : {};
  } catch {
    return {};
  }
}

function guardar(s: Sellos): void {
  try { localStorage.setItem(KEY_SELLOS, JSON.stringify(s)); } catch { /* noop */ }
}

/** Se sella cada vez que termina una jornada: queda la hora de esa versión. */
export function sellarDia(dia: number, cuando: number = Date.now()): void {
  const s = leer();
  s[String(dia)] = cuando;
  guardar(s);
}

export function selloDe(dia: number, sellos: Sellos = leer()): number | null {
  const v = sellos[String(dia)];
  return typeof v === 'number' ? v : null;
}

export interface Desfasaje {
  /** Lo que quedó viejo. */
  dia: number;
  nombre: string;
  /** Lo que cambió después. */
  porque: string;
  diaFuente: number;
}

/**
 * Lo que quedó viejo: un derivado que se hizo ANTES de que su fuente cambiara.
 * Si todavía no lo hizo, no hay nada que avisar.
 */
export function desactualizados(sellos: Sellos = leer()): Desfasaje[] {
  const out: Desfasaje[] = [];
  for (const f of FUENTES) {
    const selloFuente = selloDe(f.dia, sellos);
    if (selloFuente === null) continue;
    for (const d of f.derivados) {
      const selloDerivado = selloDe(d, sellos);
      if (selloDerivado === null) continue;
      if (selloDerivado < selloFuente) {
        out.push({ dia: d, nombre: DERIVADOS[d] ?? `lo del día ${d}`, porque: f.nombre, diaFuente: f.dia });
      }
    }
  }
  // Uno por cosa vieja: le alcanza con saber qué rehacer y por qué.
  const vistos = new Set<number>();
  return out.filter((x) => (vistos.has(x.dia) ? false : vistos.add(x.dia)));
}

/** El aviso, escrito como se lo diría una persona. */
export function avisoDe(d: Desfasaje): string {
  return `Cambiaste ${d.porque} después de hacer ${d.nombre}. Revísalo para que digan lo mismo.`;
}
