/**
 * EL JUEGO DEL SUR — el mismo juego en los libros, en el papel y acá.
 *
 * Aprobado por Javo el 15 de noviembre de 2026 (claude/ARQUITECTURA-
 * COLECCION.md §6). Cinco mecánicas, iguales en los seis libros, en El
 * Camino en papel y en la app:
 *
 *   1 · TU VASO      cada día hecho, una piedra; cada paso afuera, dos.
 *   2 · EL MAPA      los 90 días en cinco paisajes: se pinta el día hecho.
 *   3 · LA RACHA     días hábiles seguidos con paso afuera.
 *   4 · EL SELLO     uno por tramo cerrado.
 *   5 · LAS PALABRAS diez escondidas en los libros, dos por libro.
 *
 * ═══ LO QUE ESTE MÓDULO NO INVENTA ═══
 *
 * EL SELLO POR TRAMO NO ES UN PREMIO NUEVO. La app ya tiene sus grados, que
 * se ganan por evidencia al cerrar un tramo: eso ES el sello. Sumarle una
 * insignia al lado sería el sexto mapa para el mismo viaje, que es justo lo
 * que hay que sacar. En el libro el sello es una pegatina, porque el papel
 * no tiene grados.
 *
 * EL COLOR DE CADA DÍA LO DICE LA APP UNA SOLA VEZ, en `paisajeDelDia`. No
 * se copia una tabla de rangos acá —eso era el defecto de `estaciones.ts`— y
 * tampoco se lee el `sistema` de la jornada de ese día, que era el defecto
 * de este tablero: medido el 16 de noviembre, el `sistema` de la jornada y el
 * paisaje del día decían distinto en 55 de los 90 días, y 31 días no se
 * podían pintar nunca —el 90 entre ellos— porque su jornada no trae sistema.
 * El sistema de una jornada es de qué sistema es EL TRABAJO; el paisaje es
 * dónde está el cliente ese día. Son dos cosas, y el mapa pinta la segunda.
 *
 * ═══ QUÉ ABREN LAS DIEZ PALABRAS (lo definía APP) ═══
 *
 * El juego de la colección termina en la ecuación de la última página del
 * Bosque: CAJA ÷ HORA = ___. La respuesta no es una palabra escondida: es
 * SU número. Con las diez, la app abre TU CUENTA: su caja del mes dividida
 * por sus horas, al lado de la del día 1.
 *
 * Se eligió eso y no un bonus, un descuento ni un contenido extra porque es
 * el único premio que ya se ganó: el número por el que hizo los 90 días. Y
 * no cuesta nada de construir — los dos números ya están medidos, el día 1
 * y el día 74.
 */

import { PAISAJES, paisajeDelDia, tramoDelPaisaje } from './losCincoPaisajes';

/* ═══════════════ 1 · TU VASO ═══════════════ */

export const VASO = 100;
export const PIEDRA_POR_DIA = 1;
export const PIEDRA_POR_PASO_AFUERA = 2;

export interface MarcaDelVaso {
  en: number;
  nombre: string;
}

export const MARCAS: MarcaDelVaso[] = [
  { en: 33, nombre: 'La orilla' },
  { en: 66, nombre: 'La travesía' },
  { en: 100, nombre: 'La otra orilla' },
];

export function piedras(diasHechos: number, pasosAfueraHechos: number): number {
  return diasHechos * PIEDRA_POR_DIA + pasosAfueraHechos * PIEDRA_POR_PASO_AFUERA;
}

/*
 * LO QUE ENTRA EN EL VASO, QUE NO ES LO MISMO QUE LO QUE GANÓ.
 *
 * El Camino da para 120 piedras —64 días por una y 28 pasos afuera por dos—
 * y el vaso del libro tiene 100. Está bien así: se llena cerca del día 70 y
 * «lleno el vaso, cambias de nivel». Lo que estaba mal era la cuenta en
 * pantalla, que decía «120 piedras» debajo de una grilla de 100.
 */
export const piedrasEnElVaso = (ganadas: number): number => Math.min(ganadas, VASO);
export const vasoLleno = (ganadas: number): boolean => ganadas >= VASO;

/** En qué marca va: la última alcanzada, o null si todavía no llegó a la primera. */
export function marcaAlcanzada(piedras: number): MarcaDelVaso | null {
  let ultima: MarcaDelVaso | null = null;
  for (const m of MARCAS) if (piedras >= m.en) ultima = m;
  return ultima;
}

/* ═══════════════ 2 · EL MAPA ═══════════════
 *
 * Los 90 días en cinco paisajes. Se pinta el día hecho, con el color del
 * paisaje en el que está ese día.
 *
 * ═══ POR QUÉ NO SALE DEL `sistema` DE LA JORNADA ═══
 *
 * Es lo que hacía, y pintaba mal. El `sistema` de una jornada dice de qué
 * sistema es el trabajo de ese día, y el trabajo del sistema 1 vuelve a
 * aparecer en el día 80. El paisaje dice dónde está el cliente, y en el día
 * 80 está en el río. Medido el 16 de noviembre, sobre el código que estaba
 * en main:
 *
 *   · 55 de los 90 días pintaban un color distinto del que la app muestra
 *     ese mismo día en Hoy, en la tarjeta y en la cabecera;
 *   · 31 días no podían pintarse nunca, porque su jornada no trae sistema
 *     (o trae 0): los días 48, 49, 55, 56, 62, 63, 69, 70, 75 a 77, 81 a 84
 *     y 87 a 90. El último día del Camino se quedaba gris después de
 *     cerrarlo.
 *
 * `paisajeDelDia` ya contesta esto para toda la app, y parsea los tramos del
 * seed en un solo lugar. El mapa pregunta ahí.
 */

/** El color con que se pinta el día `dia`, si está hecho. */
export function colorDelDia(dia: number): string | undefined {
  return paisajeDelDia(dia)?.color.fondo;
}

/** Los cinco tramos del mapa, con su nombre y sus días. Para la leyenda. */
export function tramosDelMapa(): { id: string; nombre: string; desde: number; hasta: number; color: string }[] {
  return PAISAJES.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    ...tramoDelPaisaje(p.id),
    color: p.color.fondo,
  }));
}

/* ═══════════════ 3 · LA RACHA ═══════════════
 *
 * Días hábiles seguidos con su paso afuera. Si se corta, NO vuelve a cero:
 * la regla de reenganche del Camino dice que se vuelve al primer día sin
 * terminar, y la racha dice lo mismo con otras palabras — por eso guarda
 * también la más larga, que no se pierde nunca.
 */
export interface Racha {
  /** Días seguidos hasta hoy. */
  actual: number;
  /** La más larga que consiguió. No baja nunca. */
  mejor: number;
}

/**
 * La racha, contada contra HOY.
 *
 * ═══ POR QUÉ HACE FALTA EL DÍA DE HOY ═══
 *
 * Sin él, «actual» era el largo de la última corrida, por vieja que fuera: el
 * que hizo los días 1 a 5 y desapareció un mes seguía leyendo «5 días
 * seguidos». Y como siempre había una corrida, `actual` nunca llegaba a cero,
 * así que el mensaje de reenganche —«si te caíste, no empiezas de nuevo»— no
 * se podía dibujar nunca: estaba escrito y muerto.
 *
 * La racha corre hasta el último día con paso que ya pasó, y se corta si
 * desde ahí hubo un día posible sin marcar.
 */
export function rachaDe(diasConPaso: number[], diasPosibles: number[], hoy: number): Racha {
  const hechos = new Set(diasConPaso);
  const orden = [...diasPosibles].sort((a, b) => a - b).filter((d) => d <= hoy);
  let corriendo = 0;
  let mejor = 0;
  for (const d of orden) {
    corriendo = hechos.has(d) ? corriendo + 1 : 0;
    if (corriendo > mejor) mejor = corriendo;
  }
  return { actual: corriendo, mejor };
}

export const SI_SE_CORTA =
  'Si te caíste, no empiezas de nuevo. Vuelves al primer día sin terminar y haces solo su paso esencial.';

/* ═══════════════ 5 · LAS DIEZ PALABRAS ═══════════════
 *
 * Las diez del sistema, dos escondidas en las ilustraciones de cada libro
 * del sur. El orden es el de la colección, no alfabético.
 */
export interface PalabraEscondida {
  palabra: string;
  /** El libro en cuyas ilustraciones está. */
  libro: string;
}

export const PALABRAS: PalabraEscondida[] = [
  { palabra: 'HORA', libro: 'El lago' },
  { palabra: 'PRECIO', libro: 'El lago' },
  { palabra: 'PROTOCOLO', libro: 'La montaña' },
  { palabra: 'MODELO', libro: 'La montaña' },
  { palabra: 'CAJA', libro: 'El viento' },
  { palabra: 'SISTEMA', libro: 'El viento' },
  { palabra: 'LIBRES', libro: 'El río' },
  { palabra: 'IMPOSTOR', libro: 'El río' },
  { palabra: 'BOT', libro: 'El bosque' },
  { palabra: 'ESCÁNER', libro: 'El bosque' },
];

export const ECUACION = 'CAJA ÷ HORA = ';

/** La respuesta de la ecuación no es una palabra: es su número. */
export const LO_QUE_ABRE = {
  titulo: 'Tu cuenta',
  dice: 'Tu caja de este mes, dividida por tus horas. Al lado de la del día 1.',
} as const;

/* ═══════════════ LO QUE ESCRIBE EL CLIENTE ═══════════════ */

const CLAVE_PALABRAS = 'tcd_juego_palabras_v1';
const CLAVE_PASOS = 'tcd_juego_pasos_afuera_v1';

export function leerPalabras(): string[] {
  try {
    const raw = localStorage.getItem(CLAVE_PALABRAS);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

/*
 * SE ESCRIBE EN UN TELÉFONO, Y UNA DE LAS DIEZ LLEVA TILDE.
 *
 * «ESCÁNER» se tipea «escaner» nueve de diez veces, y la comparación exacta
 * la rechazaba sin decir nada: el campo se vaciaba y no pasaba nada. El
 * cliente no podía saber si la había sumado o si la palabra estaba mal.
 * Ahora la tilde no decide, y quien pregunta recibe un sí o un no.
 */
const sinTilde = (t: string): string =>
  t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();

/** La de las diez que coincide con lo escrito, sin que la tilde decida. */
export function cualDeLasDiez(escrito: string): string | null {
  const limpia = sinTilde(escrito.trim());
  if (!limpia) return null;
  return PALABRAS.find((p) => sinTilde(p.palabra) === limpia)?.palabra ?? null;
}

/** Marca una palabra como encontrada. Devuelve la lista nueva. */
export function encontrarPalabra(palabra: string): string[] {
  const cual = cualDeLasDiez(palabra);
  if (!cual) return leerPalabras();
  const todas = new Set(leerPalabras());
  todas.add(cual);
  const lista = [...todas];
  try { localStorage.setItem(CLAVE_PALABRAS, JSON.stringify(lista)); } catch { /* noop */ }
  return lista;
}

export function estanLasDiez(encontradas: string[]): boolean {
  return PALABRAS.every((p) => encontradas.includes(p.palabra));
}

/** Los días en que marcó su paso afuera. Es lo único que el paso pide. */
export function leerPasosAfuera(): number[] {
  try {
    const raw = localStorage.getItem(CLAVE_PASOS);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

/*
 * Quien marca el paso afuera es la sesión del día; quien lo cuenta es el
 * tablero, que está en la misma pantalla. `localStorage` no avisa a nadie
 * dentro de la misma ventana, así que el vaso y la racha se quedaban
 * quietos hasta recargar: el cliente tocaba «Lo hice» y no pasaba nada.
 */
type Oyente = (dias: number[]) => void;
const oyentes = new Set<Oyente>();

export function alMarcarPasoAfuera(f: Oyente): () => void {
  oyentes.add(f);
  return () => { oyentes.delete(f); };
}

export function marcarPasoAfuera(dia: number, hecho: boolean): number[] {
  const todos = new Set(leerPasosAfuera());
  if (hecho) todos.add(dia);
  else todos.delete(dia);
  const lista = [...todos].sort((a, b) => a - b);
  try { localStorage.setItem(CLAVE_PASOS, JSON.stringify(lista)); } catch { /* noop */ }
  for (const f of oyentes) { try { f(lista); } catch { /* un oyente roto no frena a los otros */ } }
  return lista;
}
