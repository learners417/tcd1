/**
 * LO QUE MONTA ÉL — el Camino de La Base y El Ascenso.
 *
 * ═══ QUÉ PROBLEMA RESUELVE ═══
 *
 * El Camino tiene tres días donde dice «Se le habilita: Entrega N del Sistema».
 * Eso es verdad en un solo escalón: La Instalación, donde el equipo monta todo.
 *
 * En El Ascenso lo monta él, acompañado. El criterio del escalón ya lo decía
 * —«si el equipo termina haciéndolo por él, dejó de ser una mentoría»— pero el
 * Camino seguía prometiéndole una entrega. Llegaba al día 11, leía que le
 * habilitan su página y sus formularios, y esperaba. Nadie se los iba a montar.
 *
 * Así que en esos mismos días, según su escalón, lee una cosa o la otra:
 *
 *   La Instalación  →  «Esto te lo monta el equipo»
 *   El Ascenso      →  «Esto lo montas tú, en estos días, con estos tutoriales»
 *   La Base         →  no llega al 11: su Camino cierra en el día 12
 *
 * ═══ POR QUÉ NO SON DÍAS NUEVOS ═══
 *
 * Porque el número de día es carga: los códigos de las jornadas lo llevan
 * adentro, las rúbricas apuntan a ellos y los cinturones se ganan en días
 * fijos. Agregar tres días corre los noventa.
 *
 * Y porque no hace falta. El Camino YA tiene los días donde se monta cada
 * pieza, con sus tutoriales grabados: la página se publica el día 16, el
 * formulario y el calendario el 28, Meta y el pixel el 29, las respuestas
 * automáticas el 44. Lo único que faltaba era decírselo en el día donde él
 * esperaba una entrega. Esto no agrega trabajo: le muestra el que ya tiene.
 *
 * Los códigos de tutorial de acá existen en el seed. Los inventé una vez y
 * apuntaban al vacío: L-07 no es la plantilla de la página, es subir el video.
 */

/** Una pieza que monta él, en el día del Camino donde ya está. */
export interface PiezaQueMonta {
  /** El día del Camino donde la monta. */
  dia: number;
  que: string;
  /** Los códigos de tutorial del seed que la muestran hecha. */
  tutoriales: string[];
}

/** Lo que el equipo monta en ese día, y lo que hace él en su lugar. */
export interface LoQueMonta {
  /** El día donde el Camino promete la entrega. */
  dia: number;
  titulo: string;
  piezas: PiezaQueMonta[];
  /** Qué queda andando cuando están todas. En positivo y concreto. */
  queda: string;
}

export const LO_QUE_MONTA: LoQueMonta[] = [
  {
    dia: 0,
    titulo: 'Tus accesos, tu número y tu cobro',
    piezas: [
      { dia: 1, que: 'Entrar a TCD con el correo con el que compraste', tutoriales: ['L-01'] },
      { dia: 5, que: 'Tu link de pago, para cobrar tu precio nuevo', tutoriales: ['L-03'] },
      { dia: 17, que: 'Tu subcuenta cargada: consultantes, agenda y cobros', tutoriales: ['L-02', 'L-04'] },
    ],
    queda: 'Entras a las dos apps con tu correo, tienes número propio y puedes cobrar.',
  },
  {
    dia: 11,
    titulo: 'Tu página, tu formulario y tu calendario',
    piezas: [
      { dia: 16, que: 'Subir tu página y publicarla, con tu subdominio', tutoriales: ['L-05', 'L-06'] },
      { dia: 17, que: 'Tu video en la página, tu formulario de filtro y tu calendario en dos pasos', tutoriales: ['L-07', 'L-08', 'L-09', 'L-10'] },
      { dia: 25, que: 'Tu bandeja, tu embudo y tus respuestas automáticas', tutoriales: ['L-18', 'L-19'] },
    ],
    queda: 'Tienes una página publicada que recibe aplicaciones, agenda sola y contesta.',
  },
  {
    dia: 29,
    titulo: 'Meta, tu pixel y tus públicos',
    piezas: [
      { dia: 29, que: 'Tu página y tu perfil profesional, tu Business, tu cuenta publicitaria y tu forma de pago', tutoriales: ['L-11', 'L-12', 'L-13'] },
      { dia: 29, que: 'Tu pixel instalado y disparando', tutoriales: ['L-14'] },
      { dia: 31, que: 'Tu evento de agenda calificada y tu público de retargeting', tutoriales: ['L-15', 'L-16'] },
    ],
    queda: 'Tu pauta mide lo que importa y le habla a quien ya te vio.',
  },
];

export const montaEnElDia = (dia: number): LoQueMonta | null =>
  LO_QUE_MONTA.find((x) => x.dia === dia) ?? null;

/**
 * Quién monta lo técnico en este escalón.
 *
 * La Base y El Ascenso lo montan ellos, con los tutoriales. El Ascenso tiene
 * además las mentorías tres veces por semana, que es donde lo revisa en vivo.
 */
export function quienMonta(servicio?: string | null): 'el equipo' | 'tú' {
  return servicio === 'instalacion' ? 'el equipo' : 'tú';
}

/**
 * La frase de arriba del bloque, que dice de quién es el trabajo.
 *
 * Se dice completa y una sola vez. El que lee «lo montas tú» sin saber con qué
 * cierra la app y escribe al chat, y eso convierte una pantalla en una consulta.
 */
export function deQuienEsElTrabajo(servicio?: string | null): string {
  if (servicio === 'instalacion') {
    return 'Esto lo monta el equipo. Te avisamos cuando esté y sigues con tu jornada.';
  }
  if (servicio === 'ascenso') {
    return 'Esto lo montas tú, en los días que están abajo, con los tutoriales de cada paso. '
      + 'Lo llevas a la mentoría y lo revisamos en vivo.';
  }
  return 'Esto lo montas tú, en los días que están abajo, con los tutoriales de cada paso.';
}

/** Todos los tutoriales que necesita para esa entrega, sin repetidos. */
export function tutorialesDe(x: LoQueMonta): string[] {
  return [...new Set(x.piezas.flatMap((p) => p.tutoriales))];
}
