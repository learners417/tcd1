import type { NumerosSemana } from './valueChain';

/**
 * LA CARGA COMPARTIDA — un formulario, dos puertas.
 *
 * ═══ EL PROBLEMA QUE RESUELVE ═══
 *
 * Había DOS tableros que cargaban lo mismo: el cliente en Campañas, el equipo
 * en la Mesa de plata. Dos formularios con los mismos cinco datos, que no se
 * enteraban uno del otro. Si el cliente cargaba, ella no lo veía. Si ella
 * cargaba, él no lo veía.
 *
 * Y lo peor: **si ninguno cargaba, la cola quedaba ciega.** No mostraba
 * menos — mostraba que todo estaba bien.
 *
 * ═══ LA MECÁNICA ═══
 *
 * Un solo lugar, y **cada campo sabe quién lo cargó y cuándo**. El que entra
 * ve qué falta y lo completa. No hay reglas de quién carga qué, no hay que
 * coordinar, no hay que preguntar. **Lo que falta se ve.**
 */

export type Campo =
  | 'gasto' | 'impresiones' | 'alcance' | 'comentarios'
  | 'conversaciones' | 'agendas' | 'llamadasTomadas'
  | 'ofertasPresentadas' | 'ventas' | 'facturado' | 'cobrado';

export interface ValorConFirma {
  valor: number;
  /** Quién lo cargó: el id de la persona, o 'webhook' si entró solo. */
  porQuien: string;
  /** El nombre para mostrar. */
  nombre: string;
  cuando: string;
}

export type CargaSemanal = Partial<Record<Campo, ValorConFirma>>;

/** Cómo se llama cada campo cuando hay que pedirlo. */
export const NOMBRE_CAMPO: Record<Campo, string> = {
  gasto: 'lo que gastaste en pauta',
  impresiones: 'las impresiones',
  alcance: 'a cuánta gente llegó',
  comentarios: 'los comentarios',
  conversaciones: 'las conversaciones nuevas',
  agendas: 'las agendas',
  llamadasTomadas: 'las llamadas que se presentaron',
  ofertasPresentadas: 'a cuántos les dijiste el precio',
  ventas: 'las ventas',
  facturado: 'lo facturado',
  cobrado: 'lo cobrado',
};

/**
 * De quién se espera cada campo.
 *
 * «Se espera» no es «solamente». Cualquiera puede cargar cualquier cosa —
 * esto sirve para saber **a quién recordarle** lo que falta, no para
 * bloquear a nadie.
 */
export const SE_ESPERA_DE: Record<Campo, 'cliente' | 'equipo' | 'solo'> = {
  // Están en el administrador de Meta, donde el equipo ya entra.
  gasto: 'equipo',
  impresiones: 'equipo',
  alcance: 'equipo',
  comentarios: 'equipo',
  // Están en su DM: nadie más las ve.
  conversaciones: 'cliente',
  // Entra por el webhook de GHL. Si no está conectado, la carga el cliente.
  agendas: 'solo',
  // Solo él sabe si el otro se presentó y si le pagó.
  llamadasTomadas: 'cliente',
  ofertasPresentadas: 'cliente',
  ventas: 'cliente',
  facturado: 'cliente',
  cobrado: 'cliente',
};

/** Convierte la carga con firmas en los números que la cadena entiende. */
export function aNumeros(
  carga: CargaSemanal,
  base: NumerosSemana,
): NumerosSemana {
  const v = (c: Campo) => carga[c]?.valor ?? 0;
  return {
    ...base,
    gasto: v('gasto'),
    impresiones: v('impresiones'),
    alcance: v('alcance'),
    comentarios: v('comentarios'),
    conversaciones: v('conversaciones'),
    agendas: v('agendas'),
    llamadasTomadas: v('llamadasTomadas'),
    ofertasPresentadas: v('ofertasPresentadas'),
    ventas: v('ventas'),
    facturado: v('facturado'),
    cobrado: v('cobrado'),
  };
}

/** Cómo se muestra la firma de un campo. */
export function firmaDe(v: ValorConFirma | undefined): string {
  if (!v) return 'nadie lo cargó todavía';
  if (v.porQuien === 'webhook') return 'entró solo';
  const cuando = new Date(v.cuando);
  const dias = Math.floor((Date.now() - cuando.getTime()) / 86400000);
  const cuandoTexto = dias === 0 ? 'hoy' : dias === 1 ? 'ayer' : `hace ${dias} días`;
  return `lo cargó ${v.nombre} ${cuandoTexto}`;
}

// ── EL DIAGNÓSTICO PARCIAL ─────────────────────────────────────────────────

/**
 * Los tramos del embudo, y qué campos hacen falta para poder opinar de cada uno.
 *
 * El orden importa: se va de arriba hacia abajo y se dice hasta dónde se
 * llega. Si falta un campo del medio, se puede opinar de lo de arriba y se
 * pide lo que falta para seguir.
 */
const TRAMOS: Array<{
  nombre: string;
  necesita: Campo[];
  /** Lo que se puede afirmar si están todos. */
  loQueDice: string;
}> = [
  { nombre: 'si el anuncio trae gente',
    necesita: ['gasto', 'impresiones', 'alcance', 'comentarios'],
    loQueDice: 'si el anuncio para el scroll y a qué costo' },
  { nombre: 'si el mensaje abre conversaciones',
    necesita: ['comentarios', 'conversaciones'],
    loQueDice: 'si la automatización está entregando' },
  { nombre: 'si la conversación agenda',
    necesita: ['conversaciones', 'agendas'],
    loQueDice: 'si el problema es el setting' },
  { nombre: 'si se presentan',
    necesita: ['agendas', 'llamadasTomadas'],
    loQueDice: 'si el problema es la confirmación' },
  { nombre: 'si la llamada cierra',
    necesita: ['llamadasTomadas', 'ventas'],
    loQueDice: 'si el problema es la venta' },
  { nombre: 'si cobra lo que vende',
    necesita: ['ventas', 'cobrado'],
    loQueDice: 'si el problema es cómo ofrece el pago' },
];

export interface Alcance {
  /** Hasta qué tramo se puede diagnosticar, de 0 a 6. */
  hasta: number;
  /** Lo que ya se puede decir. */
  puedoDecir: string[];
  /** Qué campos faltan para llegar más lejos. */
  faltan: Campo[];
  /** A quién pedírselos. */
  aQuien: 'cliente' | 'equipo' | 'nadie';
  /** La frase que se muestra. Nunca vacía. */
  frase: string;
}

/** Un campo cargado en cero cuenta como cargado: cero es un dato. */
const tiene = (carga: CargaSemanal, c: Campo) => carga[c] !== undefined;

/**
 * Hasta dónde se puede opinar con lo que hay.
 *
 * ═══ LA REGLA QUE EVITA EL SILENCIO ═══
 *
 * **Nunca se calla y nunca inventa.** Dice hasta dónde llega y qué le falta
 * para llegar más lejos — y eso convierte el dato que falta en una tarea
 * concreta en vez de un vacío.
 *
 * Sin esto, la cola mostraba «todo bien» cuando en realidad no sabía nada.
 */
export function hastaDondePuedoOpinar(carga: CargaSemanal): Alcance {
  const puedoDecir: string[] = [];
  let hasta = 0;
  let faltan: Campo[] = [];

  for (const t of TRAMOS) {
    const ausentes = t.necesita.filter((c) => !tiene(carga, c));
    if (ausentes.length === 0) {
      puedoDecir.push(t.loQueDice);
      hasta++;
      continue;
    }
    faltan = ausentes;
    break;
  }

  // A quién pedírselos: si los que faltan son de uno solo, es de ese.
  const deQuien = new Set(faltan.map((c) => SE_ESPERA_DE[c]));
  const aQuien: Alcance['aQuien'] =
    faltan.length === 0 ? 'nadie'
    : deQuien.has('cliente') && !deQuien.has('equipo') ? 'cliente'
    : deQuien.has('equipo') && !deQuien.has('cliente') ? 'equipo'
    : 'cliente';

  let frase: string;
  if (hasta === 0) {
    frase = `Todavía no puedo decirte nada: faltan ${listar(faltan)}.`;
  } else if (faltan.length === 0) {
    frase = 'Tengo todo lo que necesito para diagnosticarte la semana entera.';
  } else {
    frase = `Con lo que tengo puedo decirte ${puedoDecir[puedoDecir.length - 1]}. `
      + `Para seguir me ${faltan.length === 1 ? 'falta' : 'faltan'} ${listar(faltan)}.`;
  }

  return { hasta, puedoDecir, faltan, aQuien, frase };
}

function listar(campos: Campo[]): string {
  const nombres = campos.map((c) => NOMBRE_CAMPO[c]);
  if (nombres.length === 0) return 'nada';
  if (nombres.length === 1) return nombres[0];
  return `${nombres.slice(0, -1).join(', ')} y ${nombres[nombres.length - 1]}`;
}

/** Cuánto está cargado, para mostrarlo de un vistazo. */
export function completitud(carga: CargaSemanal): {
  cargados: number; total: number; pct: number; faltanDelCliente: Campo[]; faltanDelEquipo: Campo[];
} {
  const todos = Object.keys(NOMBRE_CAMPO) as Campo[];
  const cargados = todos.filter((c) => tiene(carga, c));
  const faltantes = todos.filter((c) => !tiene(carga, c));
  return {
    cargados: cargados.length,
    total: todos.length,
    pct: Math.round((cargados.length / todos.length) * 100),
    faltanDelCliente: faltantes.filter((c) => SE_ESPERA_DE[c] === 'cliente'),
    faltanDelEquipo: faltantes.filter((c) => SE_ESPERA_DE[c] === 'equipo'),
  };
}
