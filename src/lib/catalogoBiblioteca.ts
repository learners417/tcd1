/**
 * EL CATÁLOGO DE LA BIBLIOTECA — todo lo que se puede mirar, en un solo lugar.
 *
 * ═══ EL HUECO QUE CIERRA ═══
 *
 * El material estaba repartido en cuatro lugares que no se hablaban:
 *
 *   · `VIDEOS_POR_JORNADA` — el video de cada día del Camino.
 *   · `COMPLEMENTOS` — las clases del método que no son de ningún día.
 *   · `TUTORIALES` (tutorialesTecnicos) — los pasos escritos de lo técnico.
 *   · `programa_videos` en la base — lo que el equipo carga, y que pisa lo
 *     anterior.
 *
 * La Biblioteca mostraba dos de los cuatro. Así que el cliente que buscaba
 * «el video donde se explica el precio» tenía que acordarse de qué día era y
 * volver a esa jornada. Y lo técnico no estaba en ninguna parte: vivía dentro
 * de la sesión del día, y pasado ese día no se podía volver a mirar.
 *
 * Acá se juntan los cuatro con su origen a la vista, y cada cosa dice de qué
 * día del Camino viene. Lógica pura: se prueba sola.
 */
import { VIDEOS_POR_JORNADA, COMPLEMENTOS, idDeYoutube } from './videosCargados';
import { TUTORIALES } from './tutorialesTecnicos';
import { diaDelCodigo } from './roadmapSeed';

export type Origen = 'jornada' | 'metodo' | 'tutorial';

export interface PiezaDeBiblioteca {
  /** Único en todo el catálogo. */
  id: string;
  titulo: string;
  origen: Origen;
  /** El día del Camino del que viene, si viene de uno. */
  dia: number | null;
  /** El enlace de YouTube, si tiene video. */
  url?: string;
  /** El id de YouTube, para el reproductor. */
  youtube?: string;
  /** El tema, para agrupar los del método. */
  tema?: string;
  /** Los pasos escritos, para los tutoriales técnicos. */
  pasos?: string[];
  intro?: string;
}

/** Cómo se nombra cada origen en pantalla. */
export const COMO_SE_LLAMA_EL_ORIGEN: Record<Origen, string> = {
  jornada: 'Del Camino',
  metodo: 'El método',
  tutorial: 'Paso a paso',
};

/**
 * Los títulos de las jornadas, para que un video no se llame «día 31».
 *
 * Quien llama los pasa desde el seed: este archivo no lo importa entero para
 * no arrastrar 91 jornadas a cada pantalla que solo quiere la lista.
 */
export type TitulosPorDia = Record<number, string>;

/**
 * Arma el catálogo completo.
 *
 * `cargadosEnLaBase` son los de `programa_videos`, y PISAN a los del archivo:
 * lo que el equipo carga manda sobre lo que vino escrito, que es la regla que
 * ya seguía el Camino. Si no se le pasan, el catálogo igual se arma con lo
 * del archivo: la Biblioteca nunca queda vacía por una consulta que falló.
 */
export function armarCatalogo(
  titulos: TitulosPorDia = {},
  cargadosEnLaBase: Record<string, string> = {},
): PiezaDeBiblioteca[] {
  const piezas: PiezaDeBiblioteca[] = [];

  // ── 1 · Los videos de las jornadas ──
  const porJornada: Record<string, string> = { ...VIDEOS_POR_JORNADA, ...cargadosEnLaBase };
  for (const [clave, url] of Object.entries(porJornada)) {
    if (!url) continue;
    const esTutorial = /^L-\d+$/i.test(clave);
    const dia = esTutorial ? diaDelCodigo(clave) : Number(clave);
    const diaReal = Number.isFinite(dia) && (dia as number) > 0 ? (dia as number) : null;
    piezas.push({
      id: `jornada:${clave}`,
      titulo: titulos[diaReal ?? -1] ?? (esTutorial ? `Paso a paso ${clave}` : `Día ${clave}`),
      origen: esTutorial ? 'tutorial' : 'jornada',
      dia: diaReal,
      url,
      youtube: idDeYoutube(url) ?? undefined,
    });
  }

  // ── 2 · Las clases del método ──
  // No son de ningún día: existen para profundizar cuando el cliente quiera.
  for (const c of COMPLEMENTOS) {
    piezas.push({
      id: `metodo:${idDeYoutube(c.url) ?? c.titulo}`,
      titulo: c.titulo,
      origen: 'metodo',
      dia: null,
      url: c.url,
      youtube: idDeYoutube(c.url) ?? undefined,
      tema: c.tema,
    });
  }

  // ── 3 · Los tutoriales con sus pasos escritos ──
  // Vivían dentro de la sesión de su día y pasado ese día no se podían volver
  // a mirar. Son justo los que el cliente necesita releer meses después.
  for (const [codigo, t] of Object.entries(TUTORIALES)) {
    piezas.push({
      id: `tutorial:${codigo}`,
      titulo: t.titulo,
      origen: 'tutorial',
      dia: t.dia ?? null,
      pasos: t.pasos,
      intro: t.intro,
    });
  }

  return ordenado(piezas);
}

/**
 * El orden: primero lo que tiene día, por día; después lo que no.
 *
 * Lo del método va al final a propósito. No es menos importante: es que quien
 * busca algo lo busca por el momento del Camino en que lo vio, y lo que no
 * tiene día no se puede buscar así.
 */
function ordenado(piezas: PiezaDeBiblioteca[]): PiezaDeBiblioteca[] {
  return [...piezas].sort((a, b) => {
    if (a.dia !== null && b.dia !== null) return a.dia - b.dia;
    if (a.dia !== null) return -1;
    if (b.dia !== null) return 1;
    return a.titulo.localeCompare(b.titulo);
  });
}

/**
 * Qué puede mirar este cliente.
 *
 * Con la Biblioteca abierta, todo. Si no, lo de su día del Camino y antes —
 * lo del método incluido, que no depende del avance.
 *
 * El criterio para lo que tiene día es «hasta el día que va», no «hasta el
 * día que cerró»: quien está en el día 31 puede volver a mirar el video del
 * 30 aunque no haya cerrado la jornada. Negarle eso sería castigarlo por
 * estar atrasado justo cuando necesita el material.
 */
export function loQuePuedeVer(
  catalogo: PiezaDeBiblioteca[],
  x: { diaActual: number | null; bibliotecaAbierta: boolean },
): PiezaDeBiblioteca[] {
  if (x.bibliotecaAbierta) return catalogo;
  const hasta = x.diaActual ?? 0;
  return catalogo.filter((p) => p.dia === null || p.dia <= hasta);
}

/** Cuántas piezas quedan por delante, para decirlo sin mostrarlas. */
export function cuantasFaltan(
  catalogo: PiezaDeBiblioteca[],
  x: { diaActual: number | null; bibliotecaAbierta: boolean },
): number {
  return catalogo.length - loQuePuedeVer(catalogo, x).length;
}

/** Agrupa por origen, para las tres secciones de la pantalla. */
export function porOrigen(piezas: PiezaDeBiblioteca[]): Record<Origen, PiezaDeBiblioteca[]> {
  const out: Record<Origen, PiezaDeBiblioteca[]> = { jornada: [], metodo: [], tutorial: [] };
  for (const p of piezas) out[p.origen].push(p);
  return out;
}

/**
 * Busca por título. Sin tildes y sin mayúsculas, porque nadie las escribe
 * cuando busca.
 */
export function buscar(piezas: PiezaDeBiblioteca[], texto: string): PiezaDeBiblioteca[] {
  const q = sinTildes(texto);
  if (!q) return piezas;
  return piezas.filter((p) =>
    sinTildes(p.titulo).includes(q)
    || sinTildes(p.tema ?? '').includes(q)
    || sinTildes(p.intro ?? '').includes(q));
}

function sinTildes(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
}

/**
 * La línea de arriba de la Biblioteca.
 *
 * A quien la tiene abierta se lo dice: es un permiso que alguien le dio y
 * conviene que lo sepa, porque explica por qué ve cosas que su día todavía no
 * desbloqueó.
 */
export function comoLaVe(
  catalogo: PiezaDeBiblioteca[],
  x: { diaActual: number | null; bibliotecaAbierta: boolean },
): string {
  const puede = loQuePuedeVer(catalogo, x).length;
  if (x.bibliotecaAbierta) {
    return `${catalogo.length} clases y tutoriales, todos disponibles.`;
  }
  const faltan = cuantasFaltan(catalogo, x);
  if (faltan === 0) return `${puede} clases y tutoriales, todos disponibles.`;
  return `${puede} disponibles. Las otras ${faltan} se abren a medida que avanzas.`;
}
