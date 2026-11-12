/**
 * LA RADIOGRAFÍA — todo lo que el cliente contesta al entrar, y que volver sea
 * seguir.
 *
 * ═══ EL FLANCO QUE ESTO CUIDA ═══
 *
 * Javo eligió el 8 de noviembre que la entrada sea UN solo tramo largo, y
 * aceptó su riesgo con nombre: «el que abandona a los 9 minutos se queda sin
 * dictamen, sin calendario y sin nada, y ya pagó». El mapa pedía por eso
 * «guardar cada tramo apenas se contesta, para que volver sea seguir y no
 * empezar de nuevo».
 *
 * ═══ LO QUE SE MIDIÓ ANTES DE TOCAR (9 de noviembre) ═══
 *
 * La bienvenida ya guardaba cada tramo al apretar el botón —en el teléfono y
 * en la base— y ya recordaba EN QUÉ PASO quedó (`tcd_wizard_step_v1`). Eso
 * estaba. Lo que no estaba era la vuelta:
 *
 *   1. De los veinte campos que el cliente contesta, UNO SOLO se volvía a
 *      leer al abrir: los seis números. Los otros diecinueve arrancaban
 *      vacíos. Así que el que recargaba —volver de WhatsApp, pestaña
 *      descartada, señal que cortó— caía en el paso correcto con el
 *      formulario EN BLANCO, y tenía que tipear de nuevo lo que ya había
 *      contestado y la app ya tenía guardado.
 *
 *   2. Y cuatro de esos campos no se guardaban en ninguna parte. El paso del
 *      perfil le pide su energía, su frustración, lo que facturó el mes y las
 *      horas de su semana; las cuatro respuestas se escribían en la pantalla
 *      y se perdían al avanzar. El comentario del archivo decía «lo que el
 *      cliente contesta en el wizard ya queda en su perfil» — para estas
 *      cuatro era falso. Cuatro preguntas al que acaba de pagar, tiradas.
 *
 * Esas dos cosas son el flanco, medidas. Esto las cierra.
 *
 * ═══ CÓMO ═══
 *
 * Un borrador propio, escrito a medida que el cliente tipea —no al apretar el
 * botón—, y una lectura que arma las respuestas con el borrador adelante y lo
 * ya guardado atrás. El borrador es lo más nuevo que hay (se escribe en cada
 * tecla); lo guardado cubre a quien completó la bienvenida antes de que esto
 * existiera.
 *
 * Lo que este módulo NO hace: no reemplaza ningún guardado. `tcd_situacion`,
 * `tcd_diagnostico`, `tcd_origen_v1`, la rueda, los seis números y el pacto
 * siguen siendo los dueños de su dato y siguen escribiéndose igual. Esto es la
 * red abajo, no otro piso.
 */
import { leerLetra, type LetraDeAvatar } from './laFotoYLaLetra';
import { getOrigen } from './origen';
import { getParaQue, ultimaMedicion, type ValoresRueda } from './rueda';
import { leer as leerMedicion, KEY_ENTRADA, type Medicion } from './medicion';
import { SITUACION_VACIA, type Situacion } from '../components/onboarding/PasoSituacion';

/** La llave del borrador. Solo este módulo la escribe. */
export const CLAVE_BORRADOR = 'tcd_radiografia_borrador_v1';

/** Las cuatro que no tenían dónde caer. */
export interface CuatroDelPerfil {
  /** Lo que facturó el último mes, tal cual lo tipeó. */
  ingresos_mensuales: string;
  /** Las horas que trabaja por semana, tal cual las tipeó. */
  horas_semana: string;
  /** Su frustración de hoy, en sus palabras. */
  frustracion: string;
  /** Su energía, de 1 a 10. */
  energia: number;
}

/**
 * LAS PREGUNTAS NUEVAS DEL TURNO 17 — y las dos que NO se agregaron.
 *
 * El turno pedía «FODA personal y profesional, sus archivos, su audio, qué
 * días le importan». Medido el 12 de noviembre, contra la regla de la casa de
 * que nada se pregunta dos veces:
 *
 *   · FODA · F — `fortaleza`. No estaba. Entra.
 *   · FODA · D — ya se pregunta DOS veces: `freno` («tu freno principal al
 *     arrancar», que además viaja a `adn_diagnostico_capa`) y `frustracion`.
 *     No entra: preguntarla de nuevo sería la tercera.
 *   · FODA · O — ya se pregunta con `nicho` y `llegan`. No entra.
 *   · FODA · A — `amenaza`. No estaba. Entra.
 *   · sus archivos — `enlaces` y `archivos`. No estaban. Entran.
 *   · su audio — YA EXISTÍA, y ya estaba en la bienvenida: `BotonAudio`
 *     (grabar → transcribir → el texto cae en la respuesta) colgaba de los
 *     tres campos del origen y del Para Qué. Lo que faltaba era ponerlo en los
 *     demás campos abiertos, que no es un campo nuevo. No hay nada acá.
 *   · qué días le importan — `dias_que_importan`. No estaba. Entra.
 */
export interface PreguntasDelTramo {
  /** FODA · F: lo que hace mejor que cualquiera de su especialidad. */
  fortaleza: string;
  /** FODA · A: lo de afuera que le puede sacar consultantes. */
  amenaza: string;
  /** Su web, su Instagram, su página: los enlaces, tal cual los pegó. */
  enlaces: string;
  /** Los caminos de Storage de lo que subió. Solo rutas, nunca el archivo. */
  archivos: string[];
  /** Los ids de paisaje que eligió — los de `estaciones.ts`, no texto libre. */
  dias_que_importan: string[];
}

/** Todo lo que la radiografía le pregunta. Un campo nuevo se agrega acá. */
export interface Respuestas extends CuatroDelPerfil, PreguntasDelTramo {
  especialidad: string;
  especialidad_otro: string;
  pais: string;
  situacion: Situacion;
  avatar: LetraDeAvatar | null;
  freno: string;
  nicho: string;
  dinero: string;
  tiempo: string;
  estilo: 'hueso' | 'guantes' | '';
  fe: 'si' | 'no' | '';
  llegan: string;
  entrega: string;
  publica: string;
  porque: string;
  herida: string;
  paciente: string;
  numeros: Medicion;
  rueda: ValoresRueda;
  para_que: string;
  pacto_texto: string;
  pacto_firma: string;
}

/** La energía arranca en el medio, que es lo que mostraba la pantalla. */
export const ENERGIA_POR_DEFECTO = 5;

export const RESPUESTAS_VACIAS: Respuestas = {
  ingresos_mensuales: '', horas_semana: '', frustracion: '', energia: ENERGIA_POR_DEFECTO,
  fortaleza: '', amenaza: '', enlaces: '', archivos: [], dias_que_importan: [],
  especialidad: '', especialidad_otro: '', pais: '',
  situacion: SITUACION_VACIA,
  avatar: null, freno: '', nicho: '', dinero: '', tiempo: '', estilo: '', fe: '',
  llegan: '', entrega: '', publica: '',
  porque: '', herida: '', paciente: '',
  numeros: {}, rueda: {}, para_que: '',
  pacto_texto: '', pacto_firma: '',
};

function leerJson<T>(clave: string): Partial<T> {
  try {
    const raw = localStorage.getItem(clave);
    if (!raw) return {};
    const v = JSON.parse(raw) as unknown;
    return v && typeof v === 'object' ? (v as Partial<T>) : {};
  } catch { return {}; }
}

/** El borrador crudo, sin mezclar con nada. */
export function leerBorrador(): Partial<Respuestas> {
  return leerJson<Respuestas>(CLAVE_BORRADOR);
}

/**
 * ANOTAR — se llama en cada tecla, no al apretar el botón.
 *
 * Mezcla, nunca reemplaza: anotar el freno no puede borrar el nicho. Es el
 * mismo error que el 8 de noviembre borraba `situacion` con un UPDATE de jsonb,
 * y acá no puede pasar porque hay un solo escritor.
 */
export function anotar(parcial: Partial<Respuestas>): void {
  try {
    const previo = leerBorrador();
    localStorage.setItem(CLAVE_BORRADOR, JSON.stringify({ ...previo, ...parcial }));
  } catch { /* sin teléfono que guarde, la sesión sigue igual */ }
}

/** Al cerrar la bienvenida el borrador ya no tiene trabajo. */
export function olvidarBorrador(): void {
  try { localStorage.removeItem(CLAVE_BORRADOR); } catch { /* noop */ }
}

/** Un texto cuenta si tiene algo que no sea espacio. */
const hay = (v: unknown): boolean => typeof v === 'string' ? v.trim().length > 0 : v !== null && v !== undefined;

/** El primero de los dos que tenga algo; si ninguno, el vacío declarado. */
function primero<T>(borrador: T | undefined, guardado: T | undefined, vacio: T): T {
  if (hay(borrador)) return borrador as T;
  if (hay(guardado)) return guardado as T;
  return vacio;
}

/**
 * LO YA GUARDADO, de los dueños de cada dato.
 *
 * Esto no inventa fuentes: lee exactamente las llaves que los pasos de la
 * bienvenida escriben hoy. `tcd_diagnostico` guarda el nicho bajo `nicho` y la
 * base lo guarda bajo `nicho_hipotesis` — las dos se miran, porque las dos
 * existen en teléfonos de clientes reales.
 */
function loGuardado(): Partial<Respuestas> {
  const dx = leerJson<Record<string, string>>('tcd_diagnostico') as Record<string, string>;
  const sit = leerJson<Situacion>('tcd_situacion');
  const pacto = leerJson<{ texto?: string; firma?: string }>('tcd_pacto');
  const og = getOrigen();
  let estilo = '';
  let fe = '';
  try {
    estilo = localStorage.getItem('tcd_estilo_mentor') ?? '';
    fe = localStorage.getItem('tcd_fe') ?? '';
  } catch { /* noop */ }
  const rueda = ultimaMedicion();
  return {
    situacion: Object.keys(sit).length > 0 ? { ...SITUACION_VACIA, ...sit } : undefined,
    avatar: leerLetra(),
    freno: dx.freno, nicho: dx.nicho ?? dx.nicho_hipotesis,
    dinero: dx.dinero, tiempo: dx.tiempo,
    estilo: estilo === 'hueso' || estilo === 'guantes' ? estilo : '',
    fe: fe === 'si' || fe === 'no' ? fe : '',
    llegan: dx.llegan, entrega: dx.entrega, publica: dx.publica,
    porque: og.porque, herida: og.herida, paciente: og.paciente,
    numeros: leerMedicion(KEY_ENTRADA) ?? undefined,
    rueda: rueda?.valores,
    para_que: getParaQue(),
    pacto_texto: pacto.texto, pacto_firma: pacto.firma,
  };
}

/**
 * LAS RESPUESTAS, armadas. Esto es lo que la bienvenida usa para arrancar.
 *
 * El borrador adelante porque es lo más nuevo que hay; lo guardado atrás
 * porque es lo único que tiene quien completó la bienvenida antes.
 */
export function leerRespuestas(): Respuestas {
  const b = leerBorrador();
  const g = loGuardado();
  const sit = { ...SITUACION_VACIA, ...(g.situacion ?? {}), ...(b.situacion ?? {}) };
  return {
    ingresos_mensuales: primero(b.ingresos_mensuales, g.ingresos_mensuales, ''),
    horas_semana: primero(b.horas_semana, g.horas_semana, ''),
    frustracion: primero(b.frustracion, g.frustracion, ''),
    energia: typeof b.energia === 'number' ? b.energia : ENERGIA_POR_DEFECTO,
    especialidad: primero(b.especialidad, g.especialidad, ''),
    especialidad_otro: primero(b.especialidad_otro, g.especialidad_otro, ''),
    pais: primero(b.pais, g.pais, ''),
    situacion: sit,
    avatar: primero(b.avatar, g.avatar, null),
    freno: primero(b.freno, g.freno, ''),
    nicho: primero(b.nicho, g.nicho, ''),
    dinero: primero(b.dinero, g.dinero, ''),
    tiempo: primero(b.tiempo, g.tiempo, ''),
    estilo: primero(b.estilo, g.estilo, '' as const),
    fe: primero(b.fe, g.fe, '' as const),
    llegan: primero(b.llegan, g.llegan, ''),
    entrega: primero(b.entrega, g.entrega, ''),
    publica: primero(b.publica, g.publica, ''),
    porque: primero(b.porque, g.porque, ''),
    herida: primero(b.herida, g.herida, ''),
    paciente: primero(b.paciente, g.paciente, ''),
    numeros: { ...(g.numeros ?? {}), ...(b.numeros ?? {}) },
    rueda: { ...(g.rueda ?? {}), ...(b.rueda ?? {}) },
    para_que: primero(b.para_que, g.para_que, ''),
    pacto_texto: primero(b.pacto_texto, g.pacto_texto, ''),
    pacto_firma: primero(b.pacto_firma, g.pacto_firma, ''),
    /*
     * LAS CINCO DEL TURNO 17. Solo borrador: no tienen dueño en `loGuardado()`
     * porque no hay ninguna llave vieja que las tenga —son nuevas— y viajan a
     * la base dentro de `diagnostico`, por el único compositor. El día que
     * alguna tenga su propia llave local, se agrega a `loGuardado()` y entra
     * acá con `primero(...)` como el resto.
     *
     * Las dos se copian por prolijidad, no por seguridad: `leerBorrador()` hace
     * `JSON.parse`, así que cada llamada ya devuelve objetos nuevos y mutar lo
     * que sale de acá no puede ensuciar el borrador. Se midió el 12 de
     * noviembre, justamente porque la primera versión de la lente afirmaba lo
     * contrario y salía verde con la copia puesta Y quitada: una mirada que no
     * puede fallar no está mirando.
     */
    fortaleza: primero(b.fortaleza, undefined, ''),
    amenaza: primero(b.amenaza, undefined, ''),
    enlaces: primero(b.enlaces, undefined, ''),
    archivos: Array.isArray(b.archivos) ? [...b.archivos] : [],
    dias_que_importan: Array.isArray(b.dias_que_importan) ? [...b.dias_que_importan] : [],
  };
}

/**
 * LOS TRAMOS, y si cada uno tiene algo contestado.
 *
 * Sirve para dos cosas: que la lente pueda preguntar «¿esto vuelve?» tramo por
 * tramo, y que la bienvenida pueda decirle al que vuelve qué le falta.
 */
export const TRAMOS = [
  { id: 'perfil', nombre: 'Quién eres y cómo estás hoy',
    campos: ['especialidad', 'pais', 'frustracion', 'ingresos_mensuales', 'horas_semana'] as const },
  { id: 'situacion', nombre: 'Tu situación', campos: ['situacion'] as const },
  { id: 'diagnostico', nombre: 'Tu diagnóstico',
    campos: ['avatar', 'freno', 'nicho', 'dinero', 'tiempo', 'llegan', 'entrega', 'publica'] as const },
  { id: 'loTuyo', nombre: 'Lo tuyo y tus días',
    campos: ['fortaleza', 'amenaza', 'enlaces', 'archivos', 'dias_que_importan'] as const },
  { id: 'origen', nombre: 'Por qué esta profesión', campos: ['porque', 'herida', 'paciente'] as const },
  { id: 'numeros', nombre: 'Tus seis números', campos: ['numeros'] as const },
  { id: 'rueda', nombre: 'Tu rueda', campos: ['rueda', 'para_que'] as const },
  { id: 'pacto', nombre: 'Tu pacto', campos: ['pacto_texto', 'pacto_firma'] as const },
] as const;

export type IdDeTramo = typeof TRAMOS[number]['id'];

function tieneAlgo(valor: unknown): boolean {
  if (valor === null || valor === undefined) return false;
  if (typeof valor === 'string') return valor.trim().length > 0;
  if (typeof valor === 'number') return true;
  if (typeof valor === 'object') return Object.values(valor as object).some(tieneAlgo);
  return Boolean(valor);
}

/** Los tramos que el cliente ya empezó a contestar. */
export function tramosConRespuesta(r: Respuestas = leerRespuestas()): IdDeTramo[] {
  return TRAMOS
    .filter((t) => t.campos.some((c) => tieneAlgo((r as unknown as Record<string, unknown>)[c])))
    .map((t) => t.id);
}

/** Los que todavía están en blanco — lo que le falta al que vuelve. */
export function tramosEnBlanco(r: Respuestas = leerRespuestas()): IdDeTramo[] {
  const con = new Set(tramosConRespuesta(r));
  return TRAMOS.map((t) => t.id).filter((id) => !con.has(id));
}
