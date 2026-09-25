/**
 * EL GLOSARIO — la palabra explicada donde aparece.
 *
 * ═══ POR QUÉ NO ES UN DOCUMENTO ═══
 *
 * Conté cuántas veces aparecen en pantalla los conceptos de los que depende
 * todo el diagnóstico: **«cuello de botella» 2 veces, «dominó» 1, «cadena de
 * valor» 1.** Están en el código, en los planes y en la cabeza de quien los
 * escribió — **no donde alguien podría aprenderlos.**
 *
 * Un glosario aparte no se lee. Uno que aparece junto a la palabra sí, porque
 * llega en el momento en que hace falta.
 *
 * ═══ Y ES LO QUE HACE POSIBLE LA INDUCCIÓN DE 72 HORAS ═══
 *
 * Sin esto, los doce términos habría que enseñarlos antes de empezar. Con
 * esto, se aprenden trabajando. Es la divulgación progresiva de Nielsen
 * aplicada a un vocabulario, no a una interfaz.
 *
 * DOCE TÉRMINOS Y NO MÁS. Si crece, deja de ser un glosario y se vuelve otro
 * documento que nadie lee.
 */

export interface Termino {
  /** La palabra, como aparece en pantalla. */
  palabra: string;
  /** Qué es, en una o dos frases. Sin jerga. */
  que: string;
  /** Por qué está definido así. Es lo que evita que alguien lo afloje. */
  porQue?: string;
}

export const GLOSARIO: Record<string, Termino> = {
  cuello_de_botella: {
    palabra: 'cuello de botella',
    que: 'El único número que, si se arregla, mejora todos los de abajo.',
    porQue: 'Hay uno solo por vez a propósito: arreglar dos cosas a la vez no deja saber cuál funcionó.',
  },
  domino: {
    palabra: 'dominó',
    que: 'El número más alejado de su referencia. Es el que se elige como cuello de botella.',
    porQue: 'Se elige por distancia y no por posición: un número malo abajo casi siempre es consecuencia de uno malo arriba.',
  },
  brecha: {
    palabra: 'brecha',
    que: 'Cuántas veces está un número fuera de su referencia. 1 significa al doble de lo aceptable, o a la mitad.',
    porQue: 'Se mide en veces y no en porcentaje para poder comparar un costo con una tasa: un costo puede estar cinco veces arriba, una tasa nunca puede estar más de 100% abajo.',
  },
  micro_paso: {
    palabra: 'micro-paso',
    que: 'Uno de los siete tramos del embudo: presupuesto, anuncio, mensaje, conversación, confirmación, llamada, cierre, cobro.',
    porQue: 'El diagnóstico va de arriba hacia abajo y se detiene en el primero que falla: si el anuncio no trae gente, no hay a quién cerrarle.',
  },
  traba: {
    palabra: 'traba',
    que: 'Algo que frenó a alguien del equipo durante el día. Se anota al cerrar, en una línea.',
    porQue: 'No se discute cuando aparece: se mira el viernes con todas juntas. Y si la misma aparece tres veces, deja de ser esfuerzo y pasa a ser trabajo de desarrollo.',
  },
  excepcion: {
    palabra: 'excepción',
    que: 'Una cuenta que necesita que entre una persona porque el aviso automático no alcanzó.',
    porQue: 'Las cuentas sanas no aparecen en la cola. Si aparecieran todas, habría que leer la lista entera.',
  },
  cupo: {
    palabra: 'cupo',
    que: 'La cantidad de lugares que el sanador abre en su programa. Es lo que hace que la oferta tenga un límite real.',
  },
  lanzado: {
    palabra: 'lanzado',
    que: 'Tiene campaña corriendo ahora. Se le miran resultados.',
    porQue: 'Es distinto de la etapa: alguien puede estar en la etapa 6 con la campaña pausada hace dos semanas.',
  },
  instalando: {
    palabra: 'instalando',
    que: 'Todavía no encendió. Se le mira qué le falta, no sus números.',
    porQue: 'No tiene conversaciones: hablarle de su costo por conversación lo distrae de terminar de instalar.',
  },
  racha: {
    palabra: 'racha',
    que: 'Cuántas semanas seguidas viene con el MISMO cuello de botella.',
    porQue: 'Es lo que decide si algo escala de la app a una persona: quien lleva un mes trabado es el único que necesita que alguien entre.',
  },
  cpm: {
    palabra: 'CPM',
    que: 'Cuánto cuesta que mil personas vean el anuncio.',
    porQue: 'Alto con pocos comentarios: el creativo no para el scroll. Alto con muchos: la audiencia es cara pero funciona, y no hay que tocarla. Y la banda depende del país donde corre la pauta.',
  },
  frecuencia: {
    palabra: 'frecuencia',
    que: 'Cuántas veces vio cada persona el mismo anuncio en la semana.',
    porQue: 'Arriba de 3 el público se agotó. NO es que el creativo dejó de servir: es que el público es muy chico. Sin este número se tira una pieza que estaba bien.',
  },
};

export const TERMINOS = Object.keys(GLOSARIO);

/** El tope. Si se pasa, deja de ser un glosario. */
export const MAXIMO_TERMINOS = 12;

/** Busca un término por su palabra, sin importar acentos ni mayúsculas. */
export function buscarTermino(palabra: string): Termino | null {
  const limpio = palabra.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '_');
  return GLOSARIO[limpio] ?? Object.values(GLOSARIO).find(
    (t) => t.palabra.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') === limpio.replace(/_/g, ' '),
  ) ?? null;
}
