/**
 * renovacion.ts — los tres pases del día 91.
 *
 * ═══ QUÉ SON ═══
 *
 * El Camino son noventa días y termina. Lo que sigue es la cuota: seguir
 * usando la app para sostener y expandir lo que quedó construido.
 *
 * Son tres, y lo único que cambia entre ellos es cuánto de Javo viene
 * adentro. La app es la misma en los tres.
 *
 * ═══ OJO CON LOS NÚMEROS ═══
 *
 * 497 y 997 también son los precios de `PRECIO_FUNDADOR` en planes.ts, y son
 * cosas distintas: allá es lo que se paga UNA VEZ para entrar al Camino
 * completo; acá es lo que se paga POR MES para seguir después del día 90.
 * Mismo número, significado distinto. Por eso cada pase dice «al mes» en
 * pantalla, siempre, y nunca se muestran las dos escaleras juntas.
 *
 * ═══ DÓNDE SE COBRA ═══
 *
 * Igual que los planes: el enlace de cobro se carga por variable de entorno,
 * sin tocar código. Sin enlace, el botón escribe por WhatsApp — que es lo que
 * pasa hoy, y es mejor que un botón que no lleva a ningún lado.
 */

export type PaseId = 'app' | 'grupal' | 'privado';

export interface Pase {
  id: PaseId;
  nombre: string;
  /** Dólares por mes. */
  precio: number;
  /** Qué resuelve, en una línea. */
  para: string;
  /** Lo que incluye, de mayor a menor peso. */
  incluye: string[];
  /** El que se recomienda primero. Uno solo. */
  destacado?: boolean;
}

export const PASES: Pase[] = [
  {
    id: 'app',
    nombre: 'La app',
    precio: 97,
    para: 'Para sostener solo lo que ya construiste.',
    incluye: [
      'Tu Camino completo y tu ADN, siempre abiertos',
      'Tus entrenadores: anuncios, textos, llamadas y números',
      'Tus campañas y tu tablero',
      'Tu propia app, con tus consultantes adentro',
    ],
  },
  {
    id: 'grupal',
    nombre: 'La app y el grupo',
    precio: 497,
    para: 'Para no decidir solo lo que viene.',
    destacado: true,
    incluye: [
      'Todo lo de La app',
      'Mentoría grupal en vivo, todas las semanas',
      'Tus preguntas respondidas delante de otros que están en lo mismo',
    ],
  },
  {
    id: 'privado',
    nombre: 'La app y yo',
    precio: 997,
    para: 'Para construir lo próximo con Javo mirando tu caso.',
    incluye: [
      'Todo lo del grupo',
      'Mentoría uno a uno con Javo',
      'Tus números y tus decisiones revisados en tu caso, no en general',
    ],
  },
];

/** Un pase por su id. */
export function pase(id: PaseId): Pase | undefined {
  return PASES.find((p) => p.id === id);
}

/*
 * Fuera del navegador —pruebas, scripts— estas variables no existen, así que
 * se leen con cuidado: importar este archivo nunca puede romper nada.
 */
const env = (import.meta as { env?: Record<string, string | undefined> }).env ?? {};

export const COBRO_URL: Record<PaseId, string> = {
  app: env.VITE_RENOVACION_APP || '',
  grupal: env.VITE_RENOVACION_GRUPAL || '',
  privado: env.VITE_RENOVACION_PRIVADO || '',
};

/** El enlace de cobro de un pase, vacío mientras no esté cargado. */
export function cobroUrl(id: PaseId): string {
  return COBRO_URL[id] || '';
}

/** Cómo se escribe un precio en pantalla. Siempre con «al mes». */
export function precioEnPantalla(p: Pase): string {
  return `${p.precio} dólares al mes`;
}
