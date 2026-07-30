import { agruparTrabas } from './cierreDelDia';

/**
 * EL CRITERIO ESCRITO — las tres situaciones que hoy llegan a dirección.
 *
 * ═══ POR QUÉ ESTAS TRES ═══
 *
 * De las diez situaciones que van a pasar, siete ya las resuelve la cola: son
 * de destrabar, de instalación o de producir, y tienen su acción y su mensaje.
 *
 * **Las tres que quedan son todas de criterio.** Y eso explica por qué hoy
 * terminan en una pregunta hacia arriba: **no hay criterio escrito para
 * ellas.** No es que Lupe no sepa — es que nadie decidió qué se hace.
 *
 * Escribirlas es lo que hace que dejen de llegar. Y el objetivo de esta
 * función es exactamente ese: que los minutos de criterio bajen porque el
 * criterio ya está escrito, no porque nadie pregunte.
 *
 * ═══ LO QUE NO HACE ═══
 *
 * Esto no reemplaza el juicio. Da **la salida por defecto y su condición**.
 * Cuando el caso no encaja, se escala — y esa excepción es información: si la
 * misma excepción aparece tres veces, el criterio está incompleto.
 */

export type SituacionDeCriterio =
  | 'trabado_en_su_metodo'
  | 'pide_fuera_de_plan'
  | 'quiere_pausar';

export interface Criterio {
  id: SituacionDeCriterio;
  /** Cómo se reconoce. */
  cuando: string;
  /** Lo que casi siempre está pasando de verdad. */
  loQuePasa: string;
  /** La salida por defecto. */
  queSeHace: string;
  /** Lo que se le dice, listo para mandar. */
  comoSeDice: string;
  /** El límite: hasta dónde se sostiene esta salida. */
  hastaCuando: string;
  /** Qué NO se hace, con el motivo. */
  loQueNo: Array<{ que: string; porque: string }>;
  /** Cuándo deja de ser una excepción y pasa a ser problema de producto. */
  cuandoEsSenal: string;
}

export const CRITERIOS: Record<SituacionDeCriterio, Criterio> = {

  trabado_en_su_metodo: {
    id: 'trabado_en_su_metodo',
    cuando: 'Lleva tres semanas o más sin cerrar la sesión de su método, y la abrió más de una vez.',
    loQuePasa:
      'No le falta información: le da miedo comprometerse. Elegir un método es cerrar puertas, '
      + 'y mientras no elige, sigue siendo todo lo que podría llegar a ser.',
    queSeHace:
      'Se elige por él, en una sesión de 30 minutos, y se elige LO MÁS CHICO QUE SE PUEDA PROBAR. '
      + 'Su método es lo que ya hace con cada paciente: se le nombra eso y se sale.',
    comoSeDice:
      'Tu método no lo tienes que inventar: ya lo estás haciendo con cada paciente. Lo que falta '
      + 'es ponerle nombre y salir a probarlo. Reservemos 30 minutos, lo cerramos juntos, y si en '
      + '30 días no te convence lo cambiamos. Nada de esto es para siempre.',
    hastaCuando:
      'Seis semanas. Si a las seis no eligió, la cuenta se pausa — no como castigo: pagar por algo '
      + 'que no se usa se vuelve resentimiento, y ese resentimiento es más caro que la pausa.',
    loQueNo: [
      { que: 'Mandarle más contenido o otra sesión del Camino',
        porque: 'El problema no es que no sepa. Más material le da más motivos para seguir sin decidir.' },
      { que: 'Dejarlo correr «hasta que se decida»',
        porque: 'Cada semana trabado es una semana sin vender, y la ventana de 90 días no se estira.' },
    ],
    cuandoEsSenal:
      'Si en un mes tres clientes se traban en la misma sesión, el problema no son ellos: '
      + 'esa sesión pide una decisión demasiado grande y hay que partirla.',
  },

  pide_fuera_de_plan: {
    id: 'pide_fuera_de_plan',
    cuando: 'Pide algo que su ticket no incluye: una landing propia, que le editen el video, una sesión.',
    loQuePasa:
      'Casi nunca quiere lo que pidió: quiere resolver algo. Y muchas veces lo que compró YA lo '
      + 'resuelve de otra forma, pero no lo encontró.',
    queSeHace:
      'Primero se busca qué SÍ tiene para eso, y se le muestra. Si de verdad no lo tiene, se dice '
      + 'qué le costaría tenerlo — con el número, sin vueltas.',
    comoSeDice:
      'Para eso tienes [lo que sí tiene], que hace lo mismo de otra manera. Si igual quieres que lo '
      + 'hagamos nosotros, es parte del plan de [ticket], y pasar cuesta [diferencia]. Tú decides '
      + 'y ninguna de las dos está mal.',
    hastaCuando:
      'La segunda vez que pide lo mismo, se le ofrece el cambio de plan de frente. Repetir «no está '
      + 'incluido» tres veces desgasta más que decir el precio una vez.',
    loQueNo: [
      { que: 'Decirle «no está en tu plan» y nada más',
        porque: 'Suena a que la app le niega algo. Y casi siempre hay una forma de resolverlo con lo que ya tiene.' },
      { que: 'Hacerlo «esta vez como excepción»',
        porque: 'La excepción se vuelve la expectativa, y el que paga el ticket alto se enteró de que no hacía falta.' },
    ],
    cuandoEsSenal:
      'Si tres clientes piden lo mismo en un mes, eso NO es una excepción: es una señal de producto. '
      + 'O falta en el plan, o está y no se encuentra — y las dos son trabajo de la función que absorbe.',
  },

  quiere_pausar: {
    id: 'quiere_pausar',
    cuando: 'Pide pausar, congelar o darse de baja.',
    loQuePasa:
      'Hay DOS motivos y se atienden distinto. «No me está funcionando» es un problema de '
      + 'diagnóstico: hay un cuello sin resolver. «No tengo tiempo o plata» es una circunstancia, '
      + 'y ahí pausar es lo correcto.',
    queSeHace:
      'Se pregunta cuál de los dos es, antes de aceptar nada. Si es «no funciona», se mira su cadena '
      + 'ANTES de hablar de la baja: casi siempre hay un cuello señalado que nunca se atendió. Si es '
      + 'circunstancia, se pausa con FECHA DE VUELTA declarada.',
    comoSeDice:
      'Antes de tocar nada quiero entender una cosa: ¿es que no te está funcionando, o es que ahora '
      + 'no puedes dedicarle el tiempo? Son dos cosas distintas y se resuelven distinto. Si es lo '
      + 'primero, dame diez minutos para mirar tus números: puede haber algo trabado que no viste.',
    hastaCuando:
      'Una pausa sin fecha de vuelta es una baja que nadie quiso decir. Si no puede poner una fecha, '
      + 'es una baja, y conviene tratarla como tal: ordenada, con el testimonio pedido si hubo resultado.',
    loQueNo: [
      { que: 'Retenerlo con un descuento',
        porque: 'Arruina el precio para todos los demás y no arregla el motivo. El que se va por un descuento se va igual el mes que viene.' },
      { que: 'Aceptar la baja sin mirar su cadena',
        porque: 'Si se va porque no le funciona y había un cuello sin atender, eso no fue una baja: fue una falla de seguimiento.' },
      { que: 'Pausar sin fecha',
        porque: 'Deja la cuenta en un limbo que nadie revisa y ocupa un lugar que otro podría usar.' },
    ],
    cuandoEsSenal:
      'Si dos clientes se van en un mes por «no me funciona» y los dos tenían el mismo cuello sin '
      + 'atender, el problema no es la retención: es que ese cuello no está llegando a la cola.',
  },
};

/** Las tres, en orden de cuánto cuesta no tenerlas escritas. */
export const TODAS: SituacionDeCriterio[] =
  ['quiere_pausar', 'trabado_en_su_metodo', 'pide_fuera_de_plan'];

/**
 * ¿Alguna de las tres aplica a este cliente?
 *
 * Solo detecta la primera —la del método— porque es la única que se puede leer
 * de los datos. Las otras dos las trae la persona: no hay dato que diga
 * «pidió algo fuera de su plan».
 */
export function criterioQueAplica(x: {
  semanasEnMetodo?: number;
  etapa?: number | null;
}): SituacionDeCriterio | null {
  const SEMANAS_PARA_INTERVENIR = 3;
  if ((x.semanasEnMetodo ?? 0) >= SEMANAS_PARA_INTERVENIR && (x.etapa ?? 0) <= 1) {
    return 'trabado_en_su_metodo';
  }
  return null;
}

/**
 * Cuándo una excepción deja de serlo.
 *
 * El mismo umbral que la traba del sistema, y por el mismo motivo: **tres
 * veces ya no es un caso, es un patrón.** Sam Carpenter lo dice al revés y
 * llega al mismo lugar: si el problema es infrecuente, no hace falta escribir
 * un procedimiento; si se repite, sí.
 */
export const VECES_PARA_SER_PRODUCTO = 3;

export interface ExcepcionRegistrada {
  situacion: SituacionDeCriterio | 'otra';
  detalle: string;
  clienteId: string;
  cuando: string;
}

export interface PatronDetectado {
  situacion: string;
  veces: number;
  clientes: string[];
  /** La lectura: qué significa que se repita. */
  lectura: string;
}

/**
 * Las excepciones que se repitieron lo suficiente para ser problema de producto.
 *
 * Es la única forma de que el criterio no crezca para siempre: cada patrón que
 * se detecta se escribe una vez y deja de llegar.
 */
export function patronesDeExcepciones(
  registro: ExcepcionRegistrada[],
): PatronDetectado[] {
  const conocidas = new Map<string, ExcepcionRegistrada[]>();
  const otras: ExcepcionRegistrada[] = [];

  for (const e of registro) {
    if (e.situacion === 'otra') { otras.push(e); continue; }
    conocidas.set(e.situacion, [...(conocidas.get(e.situacion) ?? []), e]);
  }

  // Para las nuevas se REUSA el agrupador de trabas en vez de escribir otro.
  // Ya me pasó: escribir un segundo agrupador de texto parecido termina en
  // dos que agrupan distinto, y entonces el mismo pedido cuenta como dos.
  //
  // SU LÍMITE, dicho: agrupa por PALABRAS PARECIDAS, no por significado. «Que
  // nos hagan las historias» y «que hagamos sus historias» se agrupan; «hacer
  // sus historias» no, porque no comparte ninguna palabra significativa con
  // las otras dos. Para agrupar por significado haría falta una llamada de
  // modelo, y para una lista semanal de diez excepciones eso agrega costo e
  // imprevisibilidad sin ganar nada: quien la lee ve las dos filas juntas y
  // entiende que son lo mismo.
  const mapa = new Map(conocidas);
  for (const grupo of agruparTrabas(otras.map((e) => ({
    personaId: e.clienteId, fecha: e.cuando, atendidos: [],
    minutos: 0, traba: e.detalle, trabaCliente: e.clienteId,
  })))) {
    mapa.set(`otra:${grupo.texto}`,
      otras.filter((e) => grupo.clientes.includes(e.clienteId)));
  }

  return [...mapa.entries()]
    .filter(([, es]) => es.length >= VECES_PARA_SER_PRODUCTO)
    .map(([clave, es]) => {
      const conocida = clave in CRITERIOS;
      return {
        situacion: conocida ? CRITERIOS[clave as SituacionDeCriterio].cuando : es[0].detalle,
        veces: es.length,
        clientes: [...new Set(es.map((e) => e.clienteId))],
        lectura: conocida
          ? CRITERIOS[clave as SituacionDeCriterio].cuandoEsSenal
          : `Apareció ${es.length} veces y no hay criterio escrito. Escribirlo es lo que hace que deje de llegar.`,
      };
    })
    .sort((a, b) => b.veces - a.veces);
}
