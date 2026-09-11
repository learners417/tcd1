/**
 * perfilBloqueo.ts — En qué punto entra cada cliente.
 *
 * El bloqueo no es uno solo. Pedro llega sin recorrido y sin hábitos que
 * desarmar. Sharyll llega con veinte años y una defensa intelectual que
 * convierte cada ejercicio en análisis. Ani llega con el producto entero
 * armado. El camino de 90 días asume que todos empiezan en cero, y ninguno
 * de los tres empezó ahí.
 *
 * Las preguntas ya existen: están en el diagnóstico del wizard y en la Foto
 * de Partida. Lo que faltaba era leerlas.
 *
 * ORDEN DE PRIORIDAD: si aplican varias reglas, gana la primera. No es
 * casual. El que sabe demasiado y además está quemado necesita primero que
 * le rompan la defensa — si no, la sustracción también la argumenta.
 */

export type PerfilBloqueo =
  | 'sabe_demasiado'
  | 'da_todo'
  | 'quemado'
  | 'ya_pago'
  | 'recien_empieza';

export interface SenalesPerfil {
  anos_atendiendo?: number | null;
  horas_semana?: number | null;
  agenda_llena?: boolean | null;
  formacion_negocios?: boolean | null;
  invirtio_antes_sin_resultado?: boolean | null;
  personas_mes?: number | null;
  precio_sesion?: number | null;
  /** Ya trae método propio y oferta cerrada. El caso Ani. */
  trae_metodo?: boolean | null;
  trae_oferta?: boolean | null;
}

export function calcularPerfil(s: SenalesPerfil): PerfilBloqueo {
  const anos = s.anos_atendiendo ?? 0;
  const horas = s.horas_semana ?? 0;
  const personas = s.personas_mes ?? 0;
  const precio = s.precio_sesion ?? 0;

  // R1 · sabe demasiado — la defensa intelectual va primero
  if (anos >= 15 && s.formacion_negocios === true) return 'sabe_demasiado';
  // R2 · quemado — sin restar antes de sumar, abandona en la semana 2
  if (horas >= 45 && s.agenda_llena === true) return 'quemado';
  // R3 · ya pagó y no funcionó — mide en los primeros cinco días
  if (s.invirtio_antes_sin_resultado === true) return 'ya_pago';
  // R4 · da todo — mucho volumen, poco precio: el bloqueo es la culpa
  if (personas >= 25 && precio > 0 && precio <= 50) return 'da_todo';
  // R5 · recién empieza — no necesita romper, necesita construir
  if (anos <= 5 || (personas > 0 && personas <= 5)) return 'recien_empieza';

  return 'recien_empieza';
}

interface Registro {
  /** Cómo habla el Mentor con este perfil. */
  voz: string;
  /** La frase madre de ese registro. */
  frase: string;
  /** Cuántos días dura el sistema 1 para él. */
  dias_recipiente: number;
  /** Sesiones del sistema 1 que se saltean. */
  saltear: string[];
  /** Qué sesión va primero, si cambia el orden. */
  primero?: string;
  /** Longitud de las respuestas del Mentor. */
  longitud: 'corta' | 'normal';
  /** Regla extra propia del perfil. */
  regla?: string;
}

export const REGISTROS: Record<PerfilBloqueo, Registro> = {
  sabe_demasiado: {
    voz: 'Espejo. Le devuelves sus propias palabras y le señalas la contradicción. Nunca le expliques lo que ya sabe: le sobra información. Si te pide teoría, devuélvele la pregunta.',
    frase: 'Eso que acabas de decir, ¿es verdad o es la defensa?',
    dias_recipiente: 5,
    saltear: ['P0.3'],
    primero: 'P1.2b',
    longitud: 'corta',
    regla: 'Pídele una fecha pública de lanzamiento el primer día. Necesita una apuesta irreversible, no más contenido.',
  },
  da_todo: {
    voz: 'Permiso y calidez. Nunca la confrontes: ya se confronta sola de más. Tu trabajo es autorizar, no empujar.',
    frase: 'Honras su historia y eliges distinto. Las dos cosas caben.',
    dias_recipiente: 7,
    saltear: [],
    longitud: 'normal',
    regla: 'La transición de cartera es obligatoria y se adelanta: sin plan para los que ya atiende, el permiso no alcanza.',
  },
  quemado: {
    voz: 'Corto y práctico. Nada introspectivo antes del día 8. Una cosa por sesión y cierras.',
    frase: 'Hoy solo esto, y cerramos.',
    dias_recipiente: 7,
    saltear: [],
    longitud: 'corta',
    regla: 'Antes de sumar, resta. El primer día se define qué se saca de la semana, no qué se agrega.',
  },
  ya_pago: {
    voz: 'Prueba y transparencia. Muestra lo que ya quedó sellado y con qué fecha. Midió antes y le falló: va a medir esto también.',
    frase: 'Esto ya es tuyo, mira la fecha.',
    dias_recipiente: 7,
    saltear: [],
    longitud: 'normal',
    regla: 'El ADN visible desde el día 1, con las piezas apagadas y su fecha estimada.',
  },
  recien_empieza: {
    voz: 'Guía y enseña. No tiene veinte años de hábito que desarmar: no hay nada que romper, hay que construir.',
    frase: 'Vamos paso a paso, que esto se aprende haciendo.',
    dias_recipiente: 3,
    saltear: ['P1.3'],
    longitud: 'normal',
    regla: 'Gana una semana entera para el sistema de venta. No le hagas los siete días de desbloqueo a alguien sin bloqueo.',
  },
};

export function registroDe(p: PerfilBloqueo): Registro {
  return REGISTROS[p];
}

/** Bloque que se inyecta en el prompt del Mentor. */
export function bloqueMentor(p: PerfilBloqueo): string {
  const r = REGISTROS[p];
  return `REGISTRO CON ESTA PERSONA:
${r.voz}
Frase madre de tu registro: «${r.frase}»
Longitud de tus respuestas: ${r.longitud === 'corta' ? 'cortas. Dos o tres frases. Si necesita más, que lo pida.' : 'normales.'}
${r.regla ? `Regla propia de este caso: ${r.regla}` : ''}`.trim();
}
