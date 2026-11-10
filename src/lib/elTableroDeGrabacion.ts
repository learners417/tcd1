/**
 * ═══ EL TABLERO DE GRABACIÓN, POR DENTRO ═══
 *
 * Una fila por cosa que hay que grabar —43 piezas de Javo y 21 pasos a paso de
 * Lupe, 64 en total— y, para cada una, LA CLAVE CON LA QUE EL CAMINO LA BUSCA.
 *
 * ── Por qué este archivo existe (turno 12, 9 de noviembre) ──
 *
 * El Tablero guardaba el enlace en `programa_videos.pilar_id` usando el código
 * de la PIEZA (`P8.1`). El Camino busca el video por el código de la JORNADA
 * (`P2.d8`), que lleva el día adentro. Medido contra las funciones reales:
 *
 *   · **34 de las 43 piezas** guardaban un código que el Camino nunca busca.
 *     El enlace se guardaba bien, la tilde se ponía verde, y el cliente no
 *     veía el video nunca.
 *   · **Las 9 que sí caían en un código buscado eran las peores.** Ocho de
 *     esas nueve coinciden por casualidad con la jornada de OTRO día: el
 *     Tablero mostraba «P8.2 · día 39» cuando la pieza es del día 51, y el
 *     enlace aparecía en el día 39, en la jornada equivocada.
 *   · **El contador decía «13 de 64 con enlace» con 27 videos cargados.** Los
 *     14 de Javo vienen por archivo atados a su DÍA, y el Tablero los buscaba
 *     por el código de la pieza: sus propios videos le aparecían sin grabar.
 *
 * La causa es siempre la misma: dos copias de una regla. Acá hay una.
 * `claveEnElCamino` es la única respuesta a «¿dónde se guarda esto para que el
 * Camino lo encuentre?», y `mapaConLaBase` —en `videosCargados`— es la única
 * respuesta a «¿qué ve el Camino?». El Tablero y las lentes preguntan a las
 * mismas dos funciones.
 */
import { roadmap, codigoDelDia, SEED_ROADMAP_V2 } from './roadmapSeed';
import { enlacesPorClave } from './videosCargados';

/**
 * TODO CÓDIGO QUE EL CAMINO LEE: el de cada jornada y el de cada pilar.
 *
 * Hace falta para dos cosas distintas, y las dos muerden si se las saltea:
 * para saber si una clave llega al cliente, y para NO traducir una clave vieja
 * que resulta ser el código de una jornada de otro día.
 */
export function codigosQueLeeElCamino(): Set<string> {
  const out = new Set<string>();
  for (const p of SEED_ROADMAP_V2) {
    out.add(p.id);
    for (const m of p.metas) out.add(m.codigo);
  }
  return out;
}

export interface FilaDeGrabacion {
  /** El código de la pieza o del tutorial. Lo que Javo graba. */
  codigo: string;
  titulo: string;
  /** El día del Camino donde aparece. Sale de la pieza, no de un parecido. */
  dia: number;
  quien: 'Javo' | 'Lupe';
  minutos: number;
  donde?: string;
  /**
   * La clave con la que el Camino busca este video. Es por acá por donde se
   * guarda, y es lo único que hace que el enlace llegue al cliente.
   */
  clave: string;
  /**
   * Las otras piezas que caen en el MISMO día. El Camino muestra un video por
   * jornada: dos piezas del mismo día comparten lugar, y eso se dice en voz
   * alta en vez de que la segunda pise a la primera en silencio.
   */
  comparteCon: string[];
}

/**
 * La clave con la que el Camino busca el video de una fila.
 *
 * Los pasos a paso de Lupe se buscan por su propio código (`L-01`): el Camino
 * los pide así y por eso los 13 que ya están cargados sí se ven. Las piezas de
 * Javo se buscan por el código de la jornada de su día, que es lo único que
 * sigue siendo verdad cuando el Camino se reordena.
 */
export function claveEnElCamino(fila: { codigo: string; dia: number; quien: 'Javo' | 'Lupe' }): string {
  if (fila.quien === 'Lupe') return fila.codigo;
  return codigoDelDia(fila.dia);
}

/** Las 64 filas, ordenadas por día. */
export function filasDeGrabacion(): FilaDeGrabacion[] {
  const piezasPorDia = new Map<number, string[]>();
  for (const p of roadmap.piezas) {
    piezasPorDia.set(p.dia, [...(piezasPorDia.get(p.dia) ?? []), p.codigo]);
  }

  const sin = <T extends { codigo: string; dia: number; quien: 'Javo' | 'Lupe' }>(f: T) => ({
    ...f,
    clave: claveEnElCamino(f),
  });

  const piezas: FilaDeGrabacion[] = roadmap.piezas.map((p) => ({
    ...sin({ codigo: p.codigo, dia: p.dia, quien: 'Javo' as const }),
    titulo: p.titulo,
    minutos: p.minutos,
    donde: p.set,
    comparteCon: (piezasPorDia.get(p.dia) ?? []).filter((c) => c !== p.codigo),
  }));

  const tutos: FilaDeGrabacion[] = roadmap.tutoriales.map((t) => ({
    ...sin({ codigo: t.codigo, dia: t.dia, quien: 'Lupe' as const }),
    titulo: t.titulo,
    minutos: t.minutos,
    donde: t.donde,
    comparteCon: [],
  }));

  /*
   * ── LOS DÍAS QUE YA TIENEN VIDEO Y NO TIENEN PIEZA ──
   *
   * Cuatro videos del archivo caen en jornadas que ninguna pieza del seed
   * nombra (los días 10, 11, 30 y 32). El cliente los ve; el Tablero no los
   * listaba, así que Javo no podía ni mirarlos ni cambiarles el enlace. Se
   * listan por su jornada, que es lo que el cliente ve.
   */
  const yaConPieza = new Set(roadmap.piezas.map((p) => p.dia));
  const extras: FilaDeGrabacion[] = [];
  for (const clave of Object.keys(enlacesPorClave())) {
    const j = roadmap.jornadas.find((x) => claveEnElCamino({ codigo: clave, dia: x.dia, quien: 'Javo' }) === clave);
    if (!j || yaConPieza.has(j.dia) || roadmap.tutoriales.some((t) => t.codigo === clave)) continue;
    if (extras.some((e) => e.dia === j.dia)) continue;
    extras.push({
      codigo: clave, titulo: j.titulo, dia: j.dia, quien: 'Javo', minutos: 0,
      donde: undefined, clave, comparteCon: [],
    });
  }

  return [...piezas, ...tutos, ...extras].sort((a, b) => a.dia - b.dia || a.codigo.localeCompare(b.codigo));
}

/**
 * LAS CLAVES VIEJAS → LA CLAVE DE HOY.
 *
 * Un enlace que alguien pegó antes de este turno está guardado con el código
 * de la pieza. Se traduce al leer, así que nada de lo ya pegado se pierde ni
 * hay que correr una migración de base.
 *
 * ── La excepción, que la primera versión de esto se comió ──
 *
 * Nueve códigos de pieza son, además, el código de la jornada de OTRO día:
 * `P1.4` es la pieza del día 5 y la jornada del día 3. Traducirlos a ciegas
 * desviaba el video del día 3 al día 5 —siete días quedaron ciegos así en la
 * primera corrida de la lente—. Un código que el Camino ya lee se deja donde
 * está: ahí la clave vieja y la nueva son indistinguibles, y mover el video es
 * peor que dejarlo.
 */
export function clavesLegadas(): Record<string, string> {
  const delCamino = codigosQueLeeElCamino();
  const out: Record<string, string> = {};
  for (const f of filasDeGrabacion()) {
    if (f.quien !== 'Javo' || !f.clave || f.clave === f.codigo) continue;
    if (delCamino.has(f.codigo)) continue;
    out[f.codigo] = f.clave;
  }
  return out;
}
