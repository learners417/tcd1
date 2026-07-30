import { microPasoDe } from './microPasos';
import type { Indicador } from './valueChain';

/**
 * EL CEREBRO DEL CLIENTE — su trabajo, en una sola lista.
 *
 * ═══ EL MISMO PROBLEMA, DEL OTRO LADO ═══
 *
 * El equipo tenía dos listas que no se hablaban. El cliente tiene **cinco
 * lugares distintos**: su Camino, su cuadro de instalación, su tablero de
 * números, sus piezas por publicar y los avisos que le llegan.
 *
 * Cada uno le dice algo cierto, y ninguno le dice **qué hacer ahora**. Y el
 * que abre la app sin saber qué hacer, cierra la app.
 *
 * ═══ LA DIFERENCIA CON EL LADO DEL EQUIPO ═══
 *
 * El equipo trabaja sobre veinte cuentas y necesita saber **cuál** atender.
 * El cliente trabaja sobre una —la suya— y necesita saber **qué paso sigue**.
 *
 * Por eso acá el orden no es por dinero en riesgo: es por **qué lo desbloquea
 * antes**. Y por eso la lista es corta a propósito: tres cosas, no quince.
 */

export type OrigenCliente =
  | 'camino' | 'instalacion' | 'numeros' | 'pieza' | 'aviso' | 'sesion';

export type DestinoCliente =
  | 'sesion' | 'tablero' | 'constructor' | 'entrenador' | 'perfil' | 'ninguno';

export interface TareaDelCliente {
  id: string;
  titulo: string;
  /** Por qué esto y no otra cosa. En su idioma, no en el nuestro. */
  porQue: string;
  origen: OrigenCliente;
  destino: DestinoCliente;
  /** A qué entrenador lleva, si el destino es un entrenador. */
  entrenador?: string;
  /** Cuánto lo acerca a sus diez pacientes. Decide el orden. */
  peso: number;
  /** Minutos que le va a llevar. Se dice siempre: no saberlo es lo que frena. */
  minutos: number;
}

/** Cuántas cosas se le muestran a la vez. Más que esto paraliza. */
export const CUANTAS_A_LA_VEZ = 3;

/**
 * Lo único que hay que hacer hoy, en orden.
 *
 * ═══ POR QUÉ SOLO TRES ═══
 *
 * Un sanador que abre la app y ve quince pendientes no elige el más
 * importante: cierra la app. **La lista larga no informa: paraliza.**
 *
 * Las otras doce no desaparecen — están donde siempre estuvieron. Lo que
 * cambia es que no compiten por su atención cuando lo que necesita es empezar.
 */
export function loQueSigue(x: {
  /** Su etapa del Camino y la sesión pendiente. */
  sesionPendiente?: { codigo: string; titulo: string; minutos: number };
  /** Ítems del cuadro que le tocan a él y no están hechos. */
  faltaInstalar: Array<{ id: string; titulo: string }>;
  /** true = ya encendió la campaña. */
  lanzado: boolean;
  /** Días desde que encendió. */
  diasLanzado: number;
  /** Cuántos números le faltan cargar esta semana. */
  numerosSinCargar: number;
  /** Su cuello de botella, si ya hay datos. */
  cuello?: Indicador | null;
  /** Cuántas piezas le quedan sin publicar. */
  piezasSinPublicar: number;
}): TareaDelCliente[] {
  const tareas: TareaDelCliente[] = [];

  // ── 1. Cargar los números gana a todo lo demás ──
  //
  // No porque sea lo más importante, sino porque **sin números la app no
  // puede decirle nada más**. Es la única tarea que desbloquea a las otras.
  if (x.lanzado && x.numerosSinCargar > 0 && x.diasLanzado >= 3) {
    tareas.push({
      id: 'cargar_numeros',
      titulo: `Cargar ${x.numerosSinCargar === 1 ? 'el número que falta' : `los ${x.numerosSinCargar} números que faltan`}`,
      porQue: 'Sin esto no puedo decirte dónde se está perdiendo la gente. Es lo único que me falta para ayudarte.',
      origen: 'numeros',
      destino: 'tablero',
      peso: 1000,
      minutos: 2,
    });
  }

  // ── 2. El cuello de botella, si ya hay datos ──
  if (x.cuello && x.cuello.brecha > 0) {
    const m = microPasoDe(x.cuello.id);
    tareas.push({
      id: `cuello_${x.cuello.id}`,
      titulo: m ? `Arreglar ${m.paso.toLowerCase()}` : 'Arreglar lo que está frenando',
      porQue: m
        ? `${m.significa} Es lo único que, si se arregla, mejora todo lo que viene después.`
        : 'Es el número más lejos de donde debería estar.',
      origen: 'aviso',
      destino: m?.entrenador ? 'entrenador' : 'tablero',
      entrenador: m?.entrenador ?? undefined,
      peso: 900,
      minutos: 25,
    });
  }

  // ── 3. Terminar de instalar, si todavía no encendió ──
  if (!x.lanzado && x.faltaInstalar.length > 0) {
    const primero = x.faltaInstalar[0];
    tareas.push({
      id: `instalar_${primero.id}`,
      titulo: primero.titulo,
      porQue: x.faltaInstalar.length === 1
        ? 'Es lo último que te falta para poder encender.'
        : `Te faltan ${x.faltaInstalar.length} cosas para encender. Esta es la que sigue.`,
      origen: 'instalacion',
      destino: 'perfil',
      peso: 800,
      minutos: 15,
    });
  }

  // ── 4. La sesión que sigue ──
  if (x.sesionPendiente) {
    tareas.push({
      id: `sesion_${x.sesionPendiente.codigo}`,
      titulo: x.sesionPendiente.titulo,
      porQue: 'Es el paso que sigue en tu camino.',
      origen: 'camino',
      destino: 'sesion',
      peso: 700,
      minutos: x.sesionPendiente.minutos,
    });
  }

  // ── 5. Publicar lo que ya tiene hecho ──
  //
  // Va último a propósito: **generar piezas nuevas es más fácil que publicar
  // las que ya tiene**, y por eso mucha gente se queda generando. Si le
  // sobran piezas sin publicar, generar más no es lo que necesita.
  if (x.piezasSinPublicar > 0 && x.lanzado) {
    tareas.push({
      id: 'publicar',
      titulo: `Publicar ${x.piezasSinPublicar === 1 ? 'la pieza que tienes lista' : `una de las ${x.piezasSinPublicar} piezas que tienes listas`}`,
      porQue: 'Ya está hecha. Generar otra no sirve si esta no salió.',
      origen: 'pieza',
      destino: 'constructor',
      peso: 400,
      minutos: 5,
    });
  }

  return tareas
    .sort((a, b) => b.peso - a.peso)
    .slice(0, CUANTAS_A_LA_VEZ);
}

/** La frase de arriba. Una sola, en su idioma. */
export function titularDelCliente(
  tareas: TareaDelCliente[],
  x: { lanzado: boolean; diasLanzado: number },
): string {
  // Los primeros días van PRIMERO, aunque no haya tareas.
  //
  // «Todo al día» al día uno es técnicamente cierto y es el mensaje
  // equivocado: el que recién encendió no necesita que lo feliciten, necesita
  // que le digan que no toque nada. Sin eso, apaga la campaña el martes
  // porque «no estaba pasando nada».
  if (x.lanzado && x.diasLanzado < 3) {
    return `Tu campaña lleva ${x.diasLanzado} ${x.diasLanzado === 1 ? 'día' : 'días'}. Todavía no hay nada que mirar: déjala correr.`;
  }

  if (tareas.length === 0) {
    return x.lanzado
      ? 'Todo al día. Tu campaña está corriendo y no hay nada trabado.'
      : 'Todo al día. Sigue cuando quieras.';
  }

  const minutos = tareas.reduce((t, s) => t + s.minutos, 0);
  return tareas.length === 1
    ? `Una cosa hoy. Te lleva ${minutos} minutos.`
    : `${tareas.length} cosas hoy. En total, ${minutos} minutos.`;
}

/** Qué dice el botón de cada tarea. */
export const QUE_HACE: Record<DestinoCliente, string> = {
  sesion: 'Empezar la sesión',
  tablero: 'Ir a mis números',
  constructor: 'Ir a mis anuncios',
  entrenador: 'Hablar con quien sabe',
  perfil: 'Ir a hacerlo',
  ninguno: 'Marcar hecho',
};
