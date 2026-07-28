/**
 * LOS MICRO-PASOS — de un número roto a una persona que ayuda.
 *
 * ═══ POR QUÉ EXISTE ═══
 *
 * La cadena diagnostica bien, pero habla en idioma de tablero: «conversan
 * mucho y agendan poco». Eso es correcto y **no le alcanza a nadie para
 * organizarse**, porque quien atiende no piensa en indicadores: piensa en
 * ÁREAS DE TRABAJO. Y cada área se atiende distinto, con otra persona, y
 * muchas veces de a varias juntas.
 *
 * ═══ UNA SOLA FUENTE DE VERDAD ═══
 *
 * Este mapa hace dos cosas con la misma tabla:
 *
 *   1. **Agrupa la cola por área**, para que atender tres casos de setting
 *      salga más barato que saltar de setting a técnico y volver.
 *   2. **Enseña a los ocho entrenadores a derivar** lo que no es suyo. Antes
 *      cada uno tenía su lista escrita a mano en su prompt, desparejas, y
 *      Diego no tenía ninguna: contestaba de precio, de contenido y de
 *      técnica sin decir que no era lo suyo.
 *
 * Si mañana entra un entrenador nuevo, se agrega acá y las dos cosas quedan
 * al día solas.
 */

export type Area =
  | 'presupuesto' | 'anuncio' | 'tecnico' | 'setting'
  | 'confirmacion' | 'venta' | 'cobro' | 'entrega';

export type Entrenador =
  | 'ramiro' | 'mateo' | 'caro' | 'sofi' | 'diego' | 'bruno' | 'vera' | 'lucas';

export interface MicroPaso {
  /** El indicador de la cadena que lo detecta. */
  cuello: string;
  area: Area;
  /** Cómo se llama el paso en el embudo, en orden. */
  paso: string;
  /** Qué significa que falle, en una línea de negocio. */
  significa: string;
  /**
   * Quién entrena esto. `null` = no es de un entrenador: es del equipo
   * técnico o de dirección, y no tiene sentido mandarlo a hablar con nadie.
   */
  entrenador: Entrenador | null;
  /** Si no es de un entrenador, a quién va. */
  a?: 'dev' | 'direccion';
}

/**
 * El embudo, en orden. **El diagnóstico se detiene en el primero que falla**:
 * si el anuncio no trae gente, no tiene sentido hablar del cierre porque no
 * hay a quién cerrarle. Por eso el orden de esta lista importa.
 */
export const MICRO_PASOS: MicroPaso[] = [
  { cuello: 'gasto_ratio', area: 'presupuesto', paso: 'El presupuesto',
    significa: 'Invierte de menos para lo que quiere lograr.',
    entrenador: 'ramiro' },

  { cuello: 'cpm', area: 'anuncio', paso: 'El anuncio',
    significa: 'Le cuesta caro que lo vean: el primer segundo no para el scroll.',
    entrenador: 'mateo' },

  { cuello: 'frecuencia', area: 'anuncio', paso: 'El público',
    significa: 'El público ya lo vio demasiadas veces: se agotó. No es el creativo.',
    entrenador: 'ramiro' },

  { cuello: 'piezas', area: 'anuncio', paso: 'El banco de piezas',
    significa: 'Se le está terminando el material para publicar.',
    entrenador: 'caro' },

  { cuello: 'comentario_a_conversacion', area: 'tecnico', paso: 'El mensaje',
    significa: 'Comentan y no les llega nada: la palabra clave o la automatización.',
    entrenador: null, a: 'dev' },

  { cuello: 'costo_conversacion', area: 'anuncio', paso: 'El costo de conversar',
    significa: 'Trae poca gente para lo que gasta.',
    entrenador: 'mateo' },

  { cuello: 'costo_agenda', area: 'anuncio', paso: 'A quién le habla',
    significa: 'Trae gente, pero no la que reserva. Es el avatar del gancho.',
    entrenador: 'mateo' },

  { cuello: 'conv_a_agenda', area: 'setting', paso: 'La conversación',
    significa: 'El anuncio trae gente y el mensaje la pierde.',
    entrenador: 'sofi' },

  { cuello: 'mensajes', area: 'setting', paso: 'La prospección',
    significa: 'No está escribiendo a mano, solo esperando la pauta.',
    entrenador: 'sofi' },

  { cuello: 'show_rate', area: 'confirmacion', paso: 'La confirmación',
    significa: 'Agendan y no se presentan: no confirma el mismo día.',
    entrenador: 'sofi' },

  { cuello: 'offer_rate', area: 'venta', paso: 'La llamada',
    significa: 'Llega a la llamada y no dice el precio.',
    entrenador: 'lucas' },

  { cuello: 'close_rate', area: 'venta', paso: 'El cierre',
    significa: 'Dice el precio y no cierra.',
    entrenador: 'lucas' },

  { cuello: 'cac', area: 'venta', paso: 'El precio',
    significa: 'Conseguir un cliente le cuesta demasiado para lo que cobra.',
    entrenador: 'vera' },

  { cuello: 'pct_cobrado', area: 'cobro', paso: 'El cobro',
    significa: 'Vende y cobra poco por adelantado.',
    entrenador: 'vera' },

  { cuello: 'cobro_cuotas', area: 'cobro', paso: 'Las cuotas',
    significa: 'Tiene cuotas sin cobrar: dinero ya vendido que se pierde.',
    entrenador: 'vera' },

  { cuello: 'roi_cash', area: 'cobro', paso: 'El retorno',
    significa: 'Está invirtiendo más de lo que entra.',
    entrenador: 'ramiro' },

  { cuello: 'retencion', area: 'entrega', paso: 'La renovación',
    significa: 'Nadie renueva al terminar. Es cómo entrega, no la campaña.',
    entrenador: 'bruno' },

  { cuello: 'casos_exito', area: 'entrega', paso: 'Los testimonios',
    significa: 'Terminan y no queda registro de lo que lograron.',
    entrenador: 'caro' },

  { cuello: 'referidos', area: 'entrega', paso: 'Los referidos',
    significa: 'No está pidiendo referidos.',
    entrenador: 'sofi' },
];

/** Cómo se llama cada área cuando hay que mostrarla. */
export const NOMBRE_AREA: Record<Area, string> = {
  presupuesto: 'Presupuesto',
  anuncio: 'Anuncio',
  tecnico: 'Técnico',
  setting: 'Conversación',
  confirmacion: 'Confirmación',
  venta: 'Venta',
  cobro: 'Cobro',
  entrega: 'Entrega',
};

/** De qué se ocupa cada entrenador, para poder derivarle. */
/**
 * De qué se ocupa cada uno, tomado del TÍTULO DE SU CONFIGURACIÓN.
 *
 * Los saqué primero del texto de las tarjetas y estaba mal en tres: la
 * tarjeta de Diego dice «vender sin presionar» pero su config dice
 * «Constructor de Producto», y quien entrena la venta es Lucas. Con el mapa
 * equivocado, el cliente iba a caer en el entrenador que no era.
 */
export const DE_QUE_SE_OCUPA: Record<Entrenador, string> = {
  sofi: 'filtrar pacientes: el DM, la conversación, la confirmación y pedir referidos',
  lucas: 'la consulta de venta: la llamada, decir el precio y cerrar',
  vera: 'el pricing y la oferta: cuánto cobrar y qué incluye',
  diego: 'construir el producto: convertir la oferta en videos, ejercicios y sesiones',
  mateo: 'el contenido: guiones, ganchos y qué publicar',
  caro: 'la cámara y la presencia: grabar sin sufrir, y los testimonios',
  ramiro: 'leer los números: el presupuesto, la pauta y el embudo',
  bruno: 'el servicio post-venta: sostener al paciente hasta el resultado',
};

const PORCUELLO = new Map(MICRO_PASOS.map((m) => [m.cuello, m]));

export function microPasoDe(cuello: string): MicroPaso | null {
  return PORCUELLO.get(cuello) ?? null;
}

// ── El briefing del entrenador ─────────────────────────────────────────────

/**
 * Lo que el entrenador sabe ANTES de la primera palabra.
 *
 * Hoy el cliente entra a Sofi y empieza de cero: tiene que explicarle su
 * situación. **Y el que no sabe qué preguntar es justamente el que más ayuda
 * necesita.**
 *
 * Con esto, el entrenador abre diciendo lo que ve y pidiendo lo que necesita
 * para ayudar de verdad.
 */
export function briefingPara(x: {
  cuello: string;
  nombreCliente: string;
  /** Los dos números que explican el cuello, ya redactados. */
  evidencia: string;
  semanasIgual?: number;
}): string | null {
  const m = microPasoDe(x.cuello);
  if (!m || !m.entrenador) return null;

  const insistencia = (x.semanasIgual ?? 0) > 1
    ? ` Es la ${x.semanasIgual}ª semana con lo mismo, así que lo de siempre no está alcanzando.`
    : '';

  return [
    `CONTEXTO QUE YA TIENES SOBRE ${x.nombreCliente.toUpperCase()} — no se lo preguntes, ya lo sabes:`,
    `· Su cuello de botella esta semana es ${m.paso.toLowerCase()}: ${m.significa}`,
    `· Los números: ${x.evidencia}${insistencia}`,
    '',
    'ABRE LA CONVERSACIÓN con lo que ves y pidiendo lo que necesitas para ayudar.',
    'No preguntes «en qué te ayudo»: ya sabes en qué. Y no repitas los números',
    'como un informe — úsalos para pedir lo concreto que te falta ver.',
  ].join('\n');
}

// ── La derivación ──────────────────────────────────────────────────────────

/**
 * El bloque que se inyecta en los OCHO prompts.
 *
 * Antes cada entrenador tenía su lista escrita a mano, desparejas entre sí, y
 * **Diego no tenía ninguna**: contestaba de precio, de contenido y de técnica
 * sin decir que no era lo suyo.
 *
 * Un entrenador que contesta de todo deja de ser un especialista y se vuelve
 * un buscador con opinión — que es exactamente lo que el sanador ya tiene y
 * no le sirve.
 */
export function bloqueDeDerivacion(yo: Entrenador): string {
  const otros = (Object.keys(DE_QUE_SE_OCUPA) as Entrenador[])
    .filter((e) => e !== yo)
    .map((e) => `· ${cap(e)} — ${DE_QUE_SE_OCUPA[e]}`);

  return [
    'LO QUE NO ES TUYO:',
    `Tú entrenas ${DE_QUE_SE_OCUPA[yo]}. Nada más.`,
    '',
    'Si te preguntan por otra cosa, NO improvises una respuesta: di de quién es',
    'y por qué, en una línea, y ofrece seguir con lo tuyo. Contestar de todo te',
    'convierte en un buscador con opinión, que es lo que ya tiene y no le sirve.',
    '',
    ...otros,
    '· El equipo técnico — cuando algo está roto en la instalación o la automatización',
    '· Javo — cuando la duda es sobre el método, la oferta o hacia dónde va el negocio',
  ].join('\n');
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// ── La cola por área ───────────────────────────────────────────────────────

export interface GrupoDeArea<T> {
  area: Area;
  nombre: string;
  items: T[];
  /** El entrenador que resuelve la mayoría de este grupo, si hay uno. */
  entrenador: Entrenador | null;
}

/**
 * Agrupa por área en vez de por cliente.
 *
 * Tres casos de setting juntos cuestan menos que saltar de setting a técnico
 * y volver a setting: es el mismo tema, el mismo criterio y la misma cabeza.
 */
export function agruparPorArea<T extends { cuello: string }>(
  items: T[],
): GrupoDeArea<T>[] {
  const mapa = new Map<Area, T[]>();
  const sinArea: T[] = [];

  for (const it of items) {
    const m = microPasoDe(it.cuello);
    if (!m) { sinArea.push(it); continue; }
    mapa.set(m.area, [...(mapa.get(m.area) ?? []), it]);
  }

  // El orden es el del embudo: se atiende de arriba hacia abajo.
  const orden = [...new Set(MICRO_PASOS.map((m) => m.area))];
  const grupos: GrupoDeArea<T>[] = orden
    .filter((a) => mapa.has(a))
    .map((area) => {
      const items = mapa.get(area)!;
      const entrenadores = items
        .map((i) => microPasoDe(i.cuello)?.entrenador)
        .filter(Boolean) as Entrenador[];
      return {
        area, nombre: NOMBRE_AREA[area], items,
        entrenador: entrenadores.length > 0 ? entrenadores[0] : null,
      };
    });

  // Lo que no mapea a ningún área no se pierde: va al final, visible.
  if (sinArea.length > 0) {
    grupos.push({ area: 'entrega', nombre: 'Otros', items: sinArea, entrenador: null });
  }
  return grupos;
}
