/**
 * MI CLÍNICA — qué es, dicho antes de mandarlo.
 *
 * ═══ EL HUECO QUE CIERRA ═══
 *
 * «Clínica» era un botón en la barra de abajo que hacía `window.open` a otra
 * app. El cliente lo tocaba, se le abría una pestaña con un sistema que nunca
 * vio, sin saber qué es, qué hace ahí ni por qué lo sacaron de donde estaba.
 *
 * Son dos apps y la distinción es el producto entero: **El Camino es donde se
 * construye. Mi Clínica es donde opera.** Eso está dicho en los guiones de
 * los videos y no estaba en ninguna pantalla.
 *
 * Acá vive lo que esa pantalla dice, y qué de su trabajo ya la está esperando.
 * Lógica pura: se prueba sola.
 */
import type { ProfileV2 } from './supabase';
import { construirArtefactos, type ArtefactosClinica } from './puenteMCD';

/** Donde vive Mi Clínica. Una sola constante: estaba escrita en dos pantallas. */
export const URL_MI_CLINICA = 'https://mcd-eight.vercel.app';

/**
 * La distinción, en las palabras con las que se vendió.
 *
 * Sale de los guiones del Camino —«tienes dos llaves»— para que el cliente
 * lea acá exactamente lo que escuchó en el video del primer día.
 */
export const LAS_DOS_LLAVES = {
  camino: {
    nombre: 'El Camino',
    que: 'Donde te construyes',
    como: 'Una sesión por día, cuarenta y cinco minutos. Acá armas tu método, tu oferta, tu página y tus campañas.',
  },
  clinica: {
    nombre: 'Mi Clínica',
    que: 'Donde operas',
    como: 'Acá atiendes. Tus consultantes, sus protocolos, su seguimiento y sus pagos, todo en un lugar.',
  },
} as const;

/** Lo que va a encontrar allá, concreto. */
export const QUE_HACE_ALLA: Array<{ que: string; porque: string }> = [
  {
    que: 'Carga a cada consultante con su ficha',
    porque: 'Dejas de tener su historia repartida entre WhatsApp, un cuaderno y tu memoria.',
  },
  {
    que: 'Le asigna el protocolo que escribiste acá',
    porque: 'Cada uno sigue sus pasos solo, y tú ves dónde va sin preguntarle.',
  },
  {
    que: 'Ve quién avanzó y quién se quedó',
    porque: 'La semana que alguien se frena te enteras esa semana, no cuando deja de venir.',
  },
  {
    que: 'Cobra y da de alta sin que tú estés',
    porque: 'Entregas transformación, no disponibilidad.',
  },
];

/**
 * Lo que de su trabajo del Camino ya está listo para su Clínica.
 *
 * No es una promesa de lo que va a construir: es lo que YA escribió en estos
 * noventa días. Si todavía no escribió nada, la pantalla no le muestra una
 * lista vacía: le dice qué sesión del Camino la llena.
 */
export interface LoQueSeLleva {
  que: string;
  /** La jornada del Camino donde se escribe, para quien todavía no la tiene. */
  dondeSeEscribe: string;
  listo: boolean;
}

export function loQueSeLleva(perfil: Partial<ProfileV2> | null | undefined): LoQueSeLleva[] {
  const a: ArtefactosClinica = construirArtefactos(perfil ?? {});
  return [
    {
      que: 'Tu método, con su nombre',
      dondeSeEscribe: 'Tu método, escrito con sus etapas · día 9',
      listo: Boolean(a.metodo_nombre),
    },
    {
      que: 'Tu protocolo de atención',
      dondeSeEscribe: 'Tu protocolo, escrito por ti · día 4',
      listo: Boolean(a.protocolo),
    },
    {
      que: 'Tu consultante ideal',
      dondeSeEscribe: 'A quién le hablas · día 8',
      listo: Boolean(a.paciente_ideal),
    },
    {
      que: 'Tus programas y sus precios',
      dondeSeEscribe: 'Tu programa de 1.000 USD · día 10',
      listo: a.catalogo.length > 0,
    },
  ];
}

/** Cuántas de esas cuatro ya tiene escritas. */
export function cuantasListas(perfil: Partial<ProfileV2> | null | undefined): number {
  return loQueSeLleva(perfil).filter((x) => x.listo).length;
}

/**
 * La línea de arriba de la pantalla.
 *
 * Dice lo que SÍ tiene. A quien no tiene nada todavía no se le dice «te
 * faltan cuatro»: se le dice qué es Mi Clínica y que su trabajo va a ir
 * llegando solo.
 */
export function comoLoEncuentra(perfil: Partial<ProfileV2> | null | undefined): string {
  const total = loQueSeLleva(perfil).length;
  const listas = cuantasListas(perfil);

  if (listas === 0) {
    return 'Tu Clínica está lista para abrir. Lo que escribas en el Camino va a ir apareciendo acá.';
  }
  if (listas === total) {
    return 'Todo lo que escribiste en el Camino está listo para tu Clínica.';
  }
  return `${listas} de las ${total} cosas que tu Clínica usa ya están escritas.`;
}

/**
 * Qué decirle del lado práctico, antes de que toque el botón.
 *
 * Es la frase que faltaba: tocaba «Clínica» y aparecía otra app sin aviso. Que
 * entra con la misma cuenta es lo único que necesita saber para no pensar que
 * se perdió.
 */
export const ANTES_DE_ABRIR =
  'Mi Clínica se abre aparte y entras con esta misma cuenta. El Camino te espera acá como lo dejaste.';
