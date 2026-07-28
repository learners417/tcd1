// ═══════════════════════════════════════════════════════════════════════════
// LA CADENA DE VALOR · el modelo que decide dónde está el cuello de botella
//
// Principio de fondo: el negocio es una tubería con tres tramos —atracción,
// conversión y retención— y solo pasa el agua que permite el tramo más
// angosto. Medir solo el anuncio (costo por conversación) es mirar el primer
// tramo e ignorar los otros dos.
//
// EL DOMINÓ: la única cosa que, si se resuelve, mejora todo lo demás. Se
// encuentra buscando el número MÁS ALEJADO de su referencia — no el que peor
// se ve en absoluto, sino el que más lejos está de donde debería estar.
//
// Regla de lectura: un número dice DÓNDE mirar, nunca QUÉ arreglar. Para eso
// hay que ir a la conversación real.
// ═══════════════════════════════════════════════════════════════════════════

/** Los tres tramos de la tubería. */
export type Tramo = 'atraccion' | 'conversion' | 'retencion';

export const TRAMO_LABEL: Record<Tramo, string> = {
  atraccion: 'Atracción',
  conversion: 'Conversión',
  retencion: 'Retención',
};

/**
 * INDICADOR PREDICTIVO vs HISTÓRICO.
 *
 * Predictivo = una ACCIÓN que se puede ejecutar con las manos y lleva número
 * de cantidad: invertir X, publicar Y, mandar Z mensajes. Es lo único sobre
 * lo que se manda.
 *
 * Histórico = un RESULTADO, consecuencia de esas acciones. Nadie puede
 * "hacer 10 ventas": se hacen las acciones y las ventas ocurren. Ponerle
 * meta a un histórico sin mover el predictivo es pedir un milagro.
 */
export type TipoIndicador = 'predictivo' | 'historico';

// ── Lo que se carga ────────────────────────────────────────────────────────

/** Los números crudos de una semana. Todo lo demás se calcula. */
import { bandaDe } from './mercados';

export interface NumerosSemana {
  /** Precio del programa que vende. Manda sobre casi todas las referencias. */
  precio: number;

  /**
   * Dónde corre la pauta. NO es donde vive el sanador: puede vivir en Chile
   * y anunciar en Perú, Colombia y México. Sin esto, todos se miden con la
   * misma vara y el diagnóstico miente en las dos direcciones.
   */
  mercados?: string[];

  // ── Atracción (predictivos: se ejecutan) ──
  gasto: number;
  /** Cuántas veces se mostró el anuncio. De acá salen el CPM y la frecuencia. */
  impresiones: number;
  /** A cuánta gente distinta llegó. Con las impresiones da la frecuencia. */
  alcance: number;
  piezasPublicadas: number;
  mensajesEnviados: number;

  // ── Atracción (históricos: ocurren) ──
  comentarios: number;
  conversaciones: number;
  agendas: number;

  // ── Conversión ──
  llamadasTomadas: number;
  ofertasPresentadas: number;
  ventas: number;

  // ── Dinero ──
  facturado: number;        // lo firmado, incluye cuotas futuras
  cobrado: number;          // lo que entró de clientes nuevos
  cuotasPorCobrar: number;
  cuotasCobradas: number;

  // ── Retención ──
  clientesActivos: number;
  clientesQueTerminan: number;
  renovaciones: number;
  referidos: number;
  casosDeExito: number;
}

export const SEMANA_VACIA: NumerosSemana = {
  precio: 0, gasto: 0, impresiones: 0, alcance: 0, piezasPublicadas: 0, mensajesEnviados: 0,
  mercados: [],
  comentarios: 0, conversaciones: 0, agendas: 0,
  llamadasTomadas: 0, ofertasPresentadas: 0, ventas: 0,
  facturado: 0, cobrado: 0, cuotasPorCobrar: 0, cuotasCobradas: 0,
  clientesActivos: 0, clientesQueTerminan: 0, renovaciones: 0,
  referidos: 0, casosDeExito: 0,
};

// ── Las referencias ────────────────────────────────────────────────────────

export interface Indicador {
  id: string;
  label: string;
  tramo: Tramo;
  tipo: TipoIndicador;
  /** Valor medido. null = no hay datos suficientes para calcularlo. */
  valor: number | null;
  /** Referencia sana [mín, máx]. */
  ref: [number, number];
  formato: 'porcentaje' | 'dinero' | 'veces' | 'entero';
  direccion: Direccion;
  /** Qué mirar cuando este número está mal. Nunca "qué arreglar": dónde ir. */
  dondeMirar: string;
  /** Distancia relativa a la referencia. 0 = dentro. Cuanto más alto, peor. */
  brecha: number;
  estado: 'sin_datos' | 'sano' | 'atencion' | 'roto';
  /** Cuántos datos hacen falta para que este número signifique algo, y
   *  cuántos hay. Si no alcanzan, el indicador no opina ni puede ser dominó. */
  muestra?: { tiene: number; necesita: number; suficiente: boolean };
}

/**
 * Hacia qué lado duele estar fuera de la zona.
 * - `menor_mejor`: costos. Gastar menos de lo esperado NO es un problema.
 * - `mayor_mejor`: tasas y retornos. Pasarse para arriba nunca es problema.
 * - `ambos`: la inversión, donde quedarse corto mata el volumen y pasarse
 *   quema el margen.
 */
export type Direccion = 'menor_mejor' | 'mayor_mejor' | 'ambos';

/**
 * Cuán lejos está un valor de su zona sana, mirando solo el lado que duele.
 *
 * Se mide en VECES, no en anchos de la zona. Medirlo en anchos hacía que las
 * brechas no fueran comparables entre sí: un costo puede estar cinco veces
 * por encima de su tope, pero una tasa nunca puede estar más de un 100% por
 * debajo. Con la medida vieja, cualquier costo desviado tapaba siempre a
 * cualquier tasa rota, y el dominó señalaba mal.
 *
 * Resultado: 1 = está al doble de lo aceptable (o a la mitad). Comparable
 * entre cualquier par de indicadores.
 */
const BRECHA_MAX = 9;

function calcularBrecha(
  v: number | null, [min, max]: [number, number], dir: Direccion,
): number {
  if (v === null) return 0;
  if (v > max && dir !== 'mayor_mejor' && max > 0) {
    return Math.min(v / max - 1, BRECHA_MAX);
  }
  if (v < min && dir !== 'menor_mejor' && min > 0) {
    // Un cero es el peor caso posible: no divide, satura.
    if (v <= 0) return BRECHA_MAX;
    return Math.min(min / v - 1, BRECHA_MAX);
  }
  return 0;
}

function estadoDe(brecha: number, sinDatos: boolean): Indicador['estado'] {
  if (sinDatos) return 'sin_datos';
  if (brecha === 0) return 'sano';
  return brecha <= 0.5 ? 'atencion' : 'roto';
}

const div = (a: number, b: number): number | null => (b > 0 ? a / b : null);

/**
 * Calcula la cadena completa.
 *
 * Las referencias que dependen del precio se derivan de él, no se hardcodean:
 * una llamada calificada no puede costar lo mismo en un programa de $1.000
 * que en uno de $10.000.
 */
export function calcularCadena(n: NumerosSemana): Indicador[] {
  const p = n.precio || 0;
  const out: Indicador[] = [];

  /**
   * `muestra` es cuántos datos hacen falta para que el número signifique algo.
   *
   * Sin esto, la app juzgaba una tasa de cierre sobre DOS llamadas y le decía
   * al sanador que su cuello de botella era la llamada. Eso no es medir: es
   * leer ruido y mandarlo a arreglar lo que no está roto. Peor todavía con la
   * retención: en la semana 3 nadie terminó el programa, así que la
   * renovación es cero por construcción — y el dominó apuntaba ahí, a lo
   * único que el sanador no puede tocar.
   *
   * Con muestra insuficiente el indicador queda en `sinDatos` y NO PUEDE SER
   * EL DOMINÓ. Se muestra igual, para que vea cuánto le falta.
   */
  const add = (
    id: string, label: string, tramo: Tramo, tipo: TipoIndicador,
    valor: number | null, ref: [number, number],
    formato: Indicador['formato'], direccion: Direccion, dondeMirar: string,
    muestra?: { tiene: number; necesita: number },
  ) => {
    const insuficiente = !!muestra && muestra.tiene < muestra.necesita;
    const brecha = insuficiente ? 0 : calcularBrecha(valor, ref, direccion);
    out.push({
      id, label, tramo, tipo,
      valor: insuficiente ? null : valor,
      ref, formato, direccion, dondeMirar, brecha,
      estado: estadoDe(brecha, valor === null || insuficiente),
      muestra: muestra ? { ...muestra, suficiente: !insuficiente } : undefined,
    });
  };

  // ══ ATRACCIÓN ══════════════════════════════════════════════════════════
  // La inversión es el único predictivo puro de este tramo: se decide, no
  // se espera. Referencia: entre el 20% y el 35% de lo que se quiere facturar.
  const objetivoMes = p * 4;
  add('gasto_ratio', 'Inversión sobre objetivo', 'atraccion', 'predictivo',
    objetivoMes > 0 ? (n.gasto * 4) / objetivoMes : null, [0.20, 0.35], 'porcentaje', 'ambos',
    'Presupuesto de juguete da resultado de juguete. Si está abajo, el problema no es el anuncio: es que no hay volumen.');

  add('piezas', 'Piezas publicadas', 'atraccion', 'predictivo',
    n.piezasPublicadas || null, [5, 14], 'entero', 'mayor_mejor',
    'La consistencia es lo primero que se cae y lo que más rápido devuelve resultado cuando vuelve.');

  // La referencia NO es un número de mercado: se deriva del precio y de la
  // propia cadena. Si una agenda puede costar hasta el 5% del precio y una de
  // cada tres conversaciones agenda, entonces una conversación puede costar
  // hasta ~1% del precio y el negocio sigue cerrando. Usar el benchmark de
  // comercio electrónico ($0,25-0,70) contra un programa de miles apagaba
  // campañas rentables.
  // El eslabón que detecta la automatización rota: si comenta y no llega el
  // DM, la palabra clave o el bot están caídos. No es un problema de anuncio
  // — el anuncio hizo su trabajo.
  add('comentario_a_conversacion', 'Comentario → conversación', 'atraccion', 'historico',
    div(n.conversaciones, n.comentarios), [0.60, 0.95], 'porcentaje', 'mayor_mejor',
    'La cadena está cortada: comentan y no les llega el mensaje. Revisa la palabra clave y la automatización — no toques el anuncio.',
    { tiene: n.comentarios, necesita: 10 });

  add('mensajes', 'Mensajes enviados', 'atraccion', 'predictivo',
    n.mensajesEnviados || null, [20, 150], 'entero', 'mayor_mejor',
    'En orgánico no se proyecta gasto: se proyecta actividad. Este número lo decides tú.');

  // ── EL CPM Y LA FRECUENCIA ──
  //
  // La banda del CPM sale del MERCADO donde corre la pauta, no de una
  // referencia única: el techo argentino está por debajo del piso español, y
  // medirlos igual se equivoca en las dos direcciones.
  const banda = bandaDe(n.mercados ?? []);

  add('cpm', 'Costo por mil impresiones', 'atraccion', 'historico',
    div(n.gasto * 1000, n.impresiones), [banda.cpmMin, banda.cpmMax], 'dinero', 'menor_mejor',
    'Alto con pocos comentarios: el creativo no para el scroll. Alto con muchos: la audiencia es cara pero funciona, y no hay que tocarla.',
    { tiene: n.impresiones, necesita: 1000 });

  // La frecuencia es el número que evita tirar un creativo que está bien.
  // Con presupuesto y público chicos sube rapidísimo, y sin verla parece que
  // la pieza se gastó cuando el problema es que el público es muy angosto.
  add('frecuencia', 'Veces que cada uno lo vio', 'atraccion', 'historico',
    div(n.impresiones, n.alcance), [1, 3], 'veces', 'menor_mejor',
    'Arriba de 3 en una semana, la audiencia se agotó: ampliar el público o sumar otro país. No es el creativo.',
    { tiene: n.alcance, necesita: 500 });

  add('costo_conversacion', 'Costo por conversación', 'atraccion', 'historico',
    div(n.gasto, n.conversaciones), [p * 0.001, p * 0.01], 'dinero', 'menor_mejor',
    'Si está caro, el problema es el creativo — es la palanca más barata de todas.',
    { tiene: n.conversaciones, necesita: 5 });

  // La agenda es la unidad que de verdad se compra. Referencia dura del
  // playbook: no debería costar más del 5% del precio del programa.
  add('costo_agenda', 'Costo por agenda', 'atraccion', 'historico',
    div(n.gasto, n.agendas), [p * 0.01, p * 0.05], 'dinero', 'menor_mejor',
    'Arriba del 5% del precio, la máquina se come el margen. Revisa oferta, mensaje y formato del creativo.',
    { tiene: n.agendas, necesita: 3 });

  add('conv_a_agenda', 'Conversación → agenda', 'atraccion', 'historico',
    div(n.agendas, n.conversaciones), [0.25, 0.60], 'porcentaje', 'mayor_mejor',
    'El anuncio trae gente y el DM la pierde. Escucha las conversaciones reales, no el resumen.',
    { tiene: n.conversaciones, necesita: 8 });

  // ══ CONVERSIÓN ═════════════════════════════════════════════════════════
  add('show_rate', 'Asistencia a la llamada', 'conversion', 'historico',
    div(n.llamadasTomadas, n.agendas), [0.65, 0.75], 'porcentaje', 'mayor_mejor',
    'Confirmación el mismo día, recordatorios, y poca disponibilidad hacia adelante: que no agenden para dentro de una semana.',
    { tiene: n.agendas, necesita: 5 });

  add('offer_rate', 'Llegó a la oferta', 'conversion', 'historico',
    div(n.ofertasPresentadas, n.llamadasTomadas), [0.80, 0.90], 'porcentaje', 'mayor_mejor',
    'Si no llega a decir el precio, la llamada se está yendo por otro lado. Escucha una entera, con silencios.',
    { tiene: n.llamadasTomadas, necesita: 5 });

  add('close_rate', 'Cierre', 'conversion', 'historico',
    div(n.ventas, n.llamadasTomadas), [0.25, 0.35], 'porcentaje', 'mayor_mejor',
    'Antes de tocar el guion, verifica que las agendas sean del cliente correcto. Un cierre bajo suele ser un filtro roto arriba.',
    { tiene: n.ofertasPresentadas, necesita: 5 });

  add('cac', 'Costo de adquirir un cliente', 'conversion', 'historico',
    div(n.gasto, n.ventas), [p * 0.10, p * 0.30], 'dinero', 'menor_mejor',
    'Arriba del 30% del precio no hay escala posible: o sube el precio o mejora el cierre.',
    { tiene: n.ventas, necesita: 2 });

  // ══ DINERO ═════════════════════════════════════════════════════════════
  add('pct_cobrado', 'Cobrado por adelantado', 'conversion', 'historico',
    div(n.cobrado, n.facturado), [0.40, 0.60], 'porcentaje', 'mayor_mejor',
    'Vender no es cobrar. Si se firma mucho y entra poco, el problema está en cómo se ofrece el pago.',
    { tiene: n.ventas, necesita: 2 });

  add('roi_cash', 'Retorno sobre lo cobrado', 'conversion', 'historico',
    div(n.cobrado, n.gasto), [2, 5], 'veces', 'mayor_mejor',
    'Debajo de 2 no se puede reinvertir: cada peso que entra a pauta tarda demasiado en volver.');

  add('cobro_cuotas', 'Cuotas que entraron', 'retencion', 'historico',
    div(n.cuotasCobradas, n.cuotasPorCobrar), [0.80, 0.90], 'porcentaje', 'mayor_mejor',
    'La cuota que rebota es dinero ya vendido que se pierde. Suele ser un problema de servicio, no de cobranza.',
    { tiene: n.cuotasPorCobrar, necesita: 1 });

  // ══ RETENCIÓN ══════════════════════════════════════════════════════════
  add('retencion', 'Renuevan al terminar', 'retencion', 'historico',
    div(n.renovaciones, n.clientesQueTerminan), [0.20, 0.30], 'porcentaje', 'mayor_mejor',
    'Sin renovación, cada mes se arranca de cero y el costo de adquisición pesa el doble.',
    { tiene: n.clientesQueTerminan, necesita: 3 });

  add('casos_exito', 'Llegan al resultado', 'retencion', 'historico',
    div(n.casosDeExito, n.clientesQueTerminan), [0.30, 0.70], 'porcentaje', 'mayor_mejor',
    'Sin casos de éxito no hay prueba, y sin prueba el anuncio de arriba trabaja el doble por la mitad.',
    { tiene: n.clientesQueTerminan, necesita: 3 });

  add('referidos', 'Traen un referido', 'retencion', 'historico',
    div(n.referidos, n.clientesActivos), [0.10, 0.30], 'porcentaje', 'mayor_mejor',
    'El referido es el cliente más barato que existe. Si es cero, no se está pidiendo.',
    // La base NO son los clientes activos: son los que TERMINARON. A alguien
    // que empezó hace dos semanas no se le pide un referido — se le pide a
    // quien ya llegó a un resultado. Con la base equivocada, este indicador
    // se ponía rojo en la semana 3 y era el dominó de una cuenta sana.
    { tiene: n.clientesQueTerminan, necesita: 3 });

  return out;
}

// ── Coherencia de lo cargado ───────────────────────────────────────────────

/**
 * La cadena es un embudo: cada escalón solo puede tener MENOS que el anterior.
 * Si alguien carga más agendas que conversaciones, no hay un negocio raro —
 * hay un dedo equivocado, y el diagnóstico de abajo sale con cara de certeza
 * sobre números imposibles. Vale más frenar que opinar.
 */
export interface Inconsistencia {
  campos: string[];
  texto: string;
}

export function validarNumeros(n: NumerosSemana): Inconsistencia[] {
  const malas: Inconsistencia[] = [];
  type Regla = {
    hijo: keyof NumerosSemana; padre: keyof NumerosSemana;
    texto: (a: number, b: number) => string;
  };
  const reglas: Regla[] = [
    { hijo: 'agendas', padre: 'conversaciones',
      texto: (a, b) => `No puede haber más agendas (${a}) que conversaciones (${b}).` },
    { hijo: 'llamadasTomadas', padre: 'agendas',
      texto: (a, b) => `No se pueden tomar más llamadas (${a}) que las agendadas (${b}).` },
    { hijo: 'ofertasPresentadas', padre: 'llamadasTomadas',
      texto: (a, b) => `No se puede decir el precio en más llamadas (${a}) que las tomadas (${b}).` },
    { hijo: 'ventas', padre: 'ofertasPresentadas',
      texto: (a, b) => `No puede haber más ventas (${a}) que llamadas donde se dijo el precio (${b}).` },
    { hijo: 'cobrado', padre: 'facturado',
      texto: (a, b) => `No se puede cobrar más ($${a}) de lo que se facturó ($${b}).` },
    { hijo: 'cuotasCobradas', padre: 'cuotasPorCobrar',
      texto: (a, b) => `No pueden entrar más cuotas ($${a}) que las que tocaban ($${b}).` },
    { hijo: 'renovaciones', padre: 'clientesQueTerminan',
      texto: (a, b) => `No pueden renovar más clientes (${a}) que los que terminan (${b}).` },
    { hijo: 'casosDeExito', padre: 'clientesQueTerminan',
      texto: (a, b) => `No puede haber más casos de éxito (${a}) que clientes que terminan (${b}).` },
  ];
  for (const r of reglas) {
    const a = n[r.hijo] as number;
    const b = n[r.padre] as number;
    if (a > 0 && b > 0 && a > b) {
      malas.push({ campos: [r.hijo as string, r.padre as string], texto: r.texto(a, b) });
    }
  }
  if (n.precio <= 0 && (n.gasto > 0 || n.conversaciones > 0)) {
    malas.push({
      campos: ['precio'],
      texto: 'Sin el precio del programa no se pueden calcular los topes de costo ni el retorno.',
    });
  }
  return malas;
}

// ── El dominó ──────────────────────────────────────────────────────────────

export interface Domino {
  indicador: Indicador | null;
  tramo: Tramo | null;
  titulo: string;
  porque: string;
}

/**
 * El dominó es el indicador más alejado de su referencia — y se busca desde
 * ARRIBA de la cadena hacia abajo, porque un número malo abajo suele ser
 * consecuencia de uno malo arriba. Arreglar el cierre cuando las agendas no
 * están calificadas es arreglar lo que no está roto.
 */
export function encontrarDomino(cadena: Indicador[]): Domino {
  const rotos = cadena.filter((i) => i.estado === 'roto' || i.estado === 'atencion');
  if (rotos.length === 0) {
    const conDatos = cadena.filter((i) => i.estado !== 'sin_datos');
    if (conDatos.length === 0) {
      return {
        indicador: null, tramo: null,
        titulo: 'Todavía no hay números',
        porque: 'Sin datos cargados no hay diagnóstico. Cargar es el primer trabajo.',
      };
    }
    return {
      indicador: null, tramo: null,
      titulo: 'La cadena está sana',
      porque: 'Ningún número está fuera de su zona. Lo que falta es volumen: más inversión y más piezas publicadas.',
    };
  }

  // Manda la MAGNITUD de la brecha: el número más alejado de su referencia.
  // El tramo de arriba solo desempata cuando las brechas son comparables,
  // porque un número malo abajo suele ser consecuencia de uno malo arriba:
  // arreglar el cierre con agendas sin calificar es arreglar lo que no está roto.
  const maxBrecha = Math.max(...rotos.map((i) => i.brecha));
  const orden: Tramo[] = ['atraccion', 'conversion', 'retencion'];
  const candidatos = rotos.filter((i) => i.brecha >= maxBrecha * 0.7);
  const peor = candidatos.reduce((a, b) =>
    orden.indexOf(b.tramo) < orden.indexOf(a.tramo) ? b : a);

  return {
    indicador: peor,
    tramo: peor.tramo,
    titulo: peor.label,
    porque: peor.dondeMirar,
  };
}

// ── Proyección hacia atrás ─────────────────────────────────────────────────

export interface Proyeccion {
  /** Hasta dónde puede llegar la inversión sin salirse de la banda sana. */
  inversionTope?: number;
  ventasObjetivo: number;
  llamadasNecesarias: number;
  agendasNecesarias: number;
  conversacionesNecesarias: number;
  inversionNecesaria: number;
  /** El número que gobierna la semana: el input, no el resultado. */
  gobierna: string;
  usandoRealidad: boolean;
}

/**
 * Se proyecta hacia ATRÁS: del resultado que se quiere al input que lo
 * dispara, y SIEMPRE con las tasas reales, nunca con las deseadas. Proyectar
 * con las tasas que a uno le gustaría tener no es proyectar: es desear.
 *
 * El colchón existe porque siempre se rompe algo: se mueve el cuerpo apuntando
 * más alto para aterrizar en el piso comprometido.
 */
export function proyectar(
  ventasObjetivo: number,
  real: NumerosSemana,
  colchon = 1.3,
): Proyeccion {
  const conObjetivo = ventasObjetivo * colchon;
  const usandoRealidad =
    real.llamadasTomadas > 0 && real.agendas > 0 && real.conversaciones > 0;

  // Tasas reales si existen; si no, las de referencia (mitad de la zona sana).
  const cierre = real.llamadasTomadas > 0 ? real.ventas / real.llamadasTomadas : 0.30;
  const show = real.agendas > 0 ? real.llamadasTomadas / real.agendas : 0.70;
  const aAgenda = real.conversaciones > 0 ? real.agendas / real.conversaciones : 0.35;
  /**
   * Cuánto puede costar una conversación.
   *
   * Antes acá había un 0,50 escrito a mano — el benchmark de comercio
   * electrónico que ya habíamos rechazado en la cadena y que había quedado
   * vivo justo en la proyección. Con ese número la app le decía al sanador
   * que con SIETE DÓLARES POR SEMANA llegaba a diez ventas. Presupuestaba
   * siete, invertía ochenta y ocho en tres meses, no vendía nada, y concluía
   * que el sistema no funciona.
   *
   * La derivación va al revés de como estaba: el costo de adquirir un cliente
   * tiene que caer en el 10-30% del precio, y de esta misma cadena sale
   * cuántas conversaciones hacen falta por venta. De ahí se despeja cuánto
   * puede pagarse por conversación. La cadena se dice a sí misma cuánto puede
   * gastar.
   *
   * Y se usa el extremo CONSERVADOR (el 30%), no el optimista: una proyección
   * es el piso que se cumple sí o sí. Proyectar con el mejor caso da un piso
   * que en realidad es un techo, y el sanador se queda corto de presupuesto
   * justo cuando la campaña necesita aire.
   */
  // La banda sana del costo de adquirir un cliente: 10% a 30% del precio.
  const CAC_MEDIO = 0.20;
  const CAC_MAX = 0.30;
  const convsPorVenta = cierre > 0 && show > 0 && aAgenda > 0
    ? 1 / (cierre * show * aAgenda)
    : 0;
  const costoConvReferencia = real.precio > 0 && convsPorVenta > 0
    ? (real.precio * CAC_MEDIO) / convsPorVenta
    : 0;
  const costoConv = real.conversaciones > 0 && real.gasto > 0
    ? real.gasto / real.conversaciones
    : costoConvReferencia;

  const llamadas = cierre > 0 ? conObjetivo / cierre : 0;
  const agendas = show > 0 ? llamadas / show : 0;
  const conversaciones = aAgenda > 0 ? agendas / aAgenda : 0;

  return {
    ventasObjetivo,
    llamadasNecesarias: Math.ceil(llamadas),
    agendasNecesarias: Math.ceil(agendas),
    conversacionesNecesarias: Math.ceil(conversaciones),
    /**
     * EL COLCHÓN VA A LA ACTIVIDAD, NO AL PRESUPUESTO.
     *
     * Las conversaciones llevan el 30% de más porque se apunta más alto para
     * aterrizar en el número comprometido. Pero multiplicar ese volumen
     * inflado por un costo ya conservador cuenta la prudencia dos veces: daba
     * $300 semanales donde hacen falta $154, y un presupuesto inflado asusta
     * tanto como uno de juguete.
     *
     * La inversión se calcula sobre las ventas COMPROMETIDAS, con el costo de
     * adquisición en la mitad de la banda sana.
     */
    inversionNecesaria: Math.ceil(
      real.gasto > 0 && real.conversaciones > 0
        ? conversaciones * costoConv
        : ventasObjetivo * real.precio * CAC_MEDIO,
    ),
    /** Lo mismo en el peor caso aceptable, para que sepa hasta dónde puede ir. */
    inversionTope: Math.ceil(ventasObjetivo * real.precio * CAC_MAX),
    gobierna: `${Math.ceil(agendas)} agendas`,
    usandoRealidad,
  };
}

// ── Formato ────────────────────────────────────────────────────────────────

export function formatear(v: number | null, f: Indicador['formato']): string {
  if (v === null) return '—';
  switch (f) {
    case 'porcentaje': return `${Math.round(v * 100)}%`;
    case 'dinero': return `$${v.toFixed(2)}`;
    case 'veces': return `${v.toFixed(1)}×`;
    case 'entero': return String(Math.round(v));
  }
}

export function formatearRef([a, b]: [number, number], f: Indicador['formato']): string {
  return `${formatear(a, f)} – ${formatear(b, f)}`;
}
