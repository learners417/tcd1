/**
 * EL LIBRO EN EL MÉTODO.
 *
 * Para el que es más teórico y quiere profundizar. Va junto a los videos, no
 * en su lugar: el video enseña a hacer, el capítulo explica por qué funciona.
 *
 * Se desbloquea por PILAR, igual que los videos. Quien está en el pilar 2 ve
 * los capítulos del 2; el resto en gris. No es para esconderlos: es porque
 * leer sobre la campaña antes de tener el método cerrado es la forma más
 * cómoda de no avanzar.
 */

export interface Capitulo {
  numero: number;
  titulo: string;
  /** Una línea: de qué trata, para que sepa si le sirve ahora. */
  sobre: string;
  /** Con qué pilar del Camino se abre. */
  pilar: number;
  /** Cuánto tarda en leerse, en minutos. */
  minutos: number;
}

/**
 * Los capítulos de *Sanadores Libres*.
 *
 * El mapa al pilar no es decorativo: cada capítulo responde la pregunta que
 * el sanador se está haciendo en ese momento del Camino. Leído antes, es
 * teoría; leído ahí, es la explicación de lo que le está pasando.
 */
export const CAPITULOS: Capitulo[] = [
  { numero: 1, titulo: 'El sanador que no cobra', pilar: 0, minutos: 12,
    sobre: 'Por qué quien más ayuda suele ser quien menos cobra, y qué tiene que ver con la culpa.' },
  { numero: 2, titulo: 'El dinero no es sucio', pilar: 1, minutos: 15,
    sobre: 'De dónde sale la idea de que cobrar por sanar está mal, y cómo se desarma.' },
  { numero: 3, titulo: 'Tu método ya existe', pilar: 2, minutos: 14,
    sobre: 'No hay que inventar nada: lo que haces con cada paciente ya es un método, falta nombrarlo.' },
  { numero: 4, titulo: 'La persona correcta', pilar: 2, minutos: 11,
    sobre: 'Por qué hablarle a todos es hablarle a nadie, y cómo se elige a quién.' },
  { numero: 5, titulo: 'El precio que sostiene', pilar: 3, minutos: 16,
    sobre: 'Qué precio te permite hacer bien tu trabajo, y por qué el barato te obliga a hacerlo mal.' },
  { numero: 6, titulo: 'La oferta que se entiende sola', pilar: 3, minutos: 13,
    sobre: 'La diferencia entre lo que haces y lo que la persona compra.' },
  { numero: 7, titulo: 'Mostrarse sin venderse', pilar: 4, minutos: 15,
    sobre: 'Cómo se habla en público de lo que uno hace, sin volverse un vendedor.' },
  { numero: 8, titulo: 'La conversación, no el anuncio', pilar: 4, minutos: 12,
    sobre: 'Dónde se decide de verdad una venta, y por qué casi nunca es en el anuncio.' },
  { numero: 9, titulo: 'Los números no juzgan', pilar: 4, minutos: 14,
    sobre: 'Cómo mirar un tablero sin que te diga quién eres.' },
  { numero: 10, titulo: 'Sostener a los que llegan', pilar: 5, minutos: 13,
    sobre: 'Conseguir clientes es la mitad. La otra mitad es que lleguen al resultado.' },
  { numero: 11, titulo: 'La libertad no es no trabajar', pilar: 5, minutos: 11,
    sobre: 'Qué es de verdad un sanador libre, y por qué no se parece a lo que se vende por ahí.' },
];

export interface CapituloConEstado extends Capitulo {
  abierto: boolean;
  /** Por qué está cerrado, cuando lo está. */
  motivo?: string;
}

/**
 * Los capítulos con su estado según dónde va el sanador.
 *
 * Se muestra el siguiente cerrado con su motivo, no todos: ver once títulos
 * en gris desalienta más de lo que motiva.
 */
export function capitulosPara(pilarActual: number): CapituloConEstado[] {
  return CAPITULOS.map((c) => ({
    ...c,
    abierto: c.pilar <= pilarActual,
    motivo: c.pilar <= pilarActual
      ? undefined
      : `Se abre en el pilar ${c.pilar}. Leerlo antes es teoría; leerlo ahí es la explicación de lo que te está pasando.`,
  }));
}

/** Cuántos puede leer ya, para decirlo en una línea. */
export function resumenLibro(pilarActual: number): string {
  const abiertos = CAPITULOS.filter((c) => c.pilar <= pilarActual);
  const minutos = abiertos.reduce((t, c) => t + c.minutos, 0);
  if (abiertos.length === 0) return 'Los capítulos se abren a medida que avanzas.';
  if (abiertos.length === CAPITULOS.length) {
    return `El libro completo: ${CAPITULOS.length} capítulos, unos ${minutos} minutos de lectura.`;
  }
  return `${abiertos.length} de ${CAPITULOS.length} capítulos abiertos · unos ${minutos} minutos.`;
}

/* ══════════════════ EL PUENTE CON MICLÍNICA ══════════════════ */

/**
 * EL PUENTE MÍNIMO.
 *
 * El objetivo del sanador son **diez pacientes**, no diez ventas. La retención
 * es un tercio de la cadena de valor, y toda la app está construida para la
 * atracción y la conversación.
 *
 * Cuando cierra al tercero aparece la pregunta que hoy no tiene respuesta:
 * dónde ve a sus diez, quién está por terminar, quién no aparece hace dos
 * semanas, a quién pedirle el testimonio.
 *
 * Esto NO es MiClínica: es lo mínimo para que pueda **sostener** los diez que
 * consiguió. Cuando MCD tenga contenido propio, se conecta y esto se retira.
 */

export interface PacienteDelSanador {
  id: string;
  nombre: string;
  /** Cuándo empezó el programa. */
  desde: string;
  /** Cuántas semanas dura su programa. */
  semanasTotal: number;
}

export interface EstadoPaciente extends PacienteDelSanador {
  semanaActual: number;
  /** Cuántas semanas le quedan. */
  faltan: number;
  /** 'empezando' | 'en curso' | 'por terminar' | 'terminado' */
  momento: 'empezando' | 'en curso' | 'por terminar' | 'terminado';
  /** Qué hacer con este paciente ahora. */
  queHacer: string;
}

/** A partir de acá conviene hablar de la renovación y del testimonio. */
export const SEMANAS_ANTES_DEL_FINAL = 3;

const semanasDesde = (iso: string): number => {
  const d = new Date(iso).getTime();
  if (!Number.isFinite(d)) return 0;
  return Math.max(0, Math.floor((Date.now() - d) / (7 * 86400000)));
};

/**
 * En qué momento está cada paciente y qué hacer con él.
 *
 * La regla que importa: **se habla de la renovación antes de que termine, no
 * después.** Después ya decidió.
 */
export function estadoDePacientes(
  pacientes: PacienteDelSanador[],
): EstadoPaciente[] {
  const out = pacientes.map((p) => {
    const semanaActual = semanasDesde(p.desde) + 1;
    const faltan = Math.max(0, p.semanasTotal - semanaActual + 1);

    let momento: EstadoPaciente['momento'];
    let queHacer: string;

    if (semanaActual > p.semanasTotal) {
      momento = 'terminado';
      queHacer = 'Terminó. Pídele el testimonio ahora, mientras el resultado está fresco.';
    } else if (faltan <= SEMANAS_ANTES_DEL_FINAL) {
      momento = 'por terminar';
      queHacer = `Le quedan ${faltan} ${faltan === 1 ? 'semana' : 'semanas'}. Habla de la renovación AHORA: después ya decidió.`;
    } else if (semanaActual <= 2) {
      momento = 'empezando';
      queHacer = 'Recién empieza. Las dos primeras semanas deciden si termina: que sienta que avanza.';
    } else {
      momento = 'en curso';
      queHacer = `Semana ${semanaActual} de ${p.semanasTotal}. Va en camino.`;
    }

    return { ...p, semanaActual, faltan, momento, queHacer };
  });

  // Primero los que están por terminar: es lo único con fecha de vencimiento.
  const orden = { 'por terminar': 0, terminado: 1, empezando: 2, 'en curso': 3 };
  return out.sort((a, b) => orden[a.momento] - orden[b.momento]);
}

export interface ResumenPacientes {
  total: number;
  porTerminar: number;
  terminados: number;
  /** La frase de arriba. */
  titular: string;
}

export function resumirPacientes(
  estados: EstadoPaciente[],
  objetivo = 10,
): ResumenPacientes {
  const activos = estados.filter((e) => e.momento !== 'terminado');
  const porTerminar = estados.filter((e) => e.momento === 'por terminar').length;
  const terminados = estados.filter((e) => e.momento === 'terminado').length;

  let titular: string;
  if (estados.length === 0) {
    titular = `Todavía no cargaste ningún paciente. Tu objetivo son ${objetivo}.`;
  } else if (porTerminar > 0) {
    titular = porTerminar === 1
      ? 'Un paciente está por terminar. Habla de la renovación antes, no después.'
      : `${porTerminar} pacientes están por terminar. Habla de la renovación antes, no después.`;
  } else if (activos.length >= objetivo) {
    titular = `Tienes ${activos.length} pacientes activos. Llegaste.`;
  } else {
    const faltan = objetivo - activos.length;
    titular = `${activos.length} de ${objetivo} pacientes. Te faltan ${faltan}.`;
  }

  return { total: estados.length, porTerminar, terminados, titular };
}
