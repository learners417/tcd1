/**
 * LO QUE MANDA FATHOM, LEÍDO SIN CONFIAR — turno 14
 *
 * ═══ QUÉ CIERRA ═══
 *
 * Fathom está vendido y contado: aparece en `cuadroTickets`, en el video
 * L-17 del día 23 y en `preactivacionSteps` como un paso del cliente
 * —«Grabando y transcribiendo sus llamadas»—. Y hasta hoy **no había
 * ninguna ruta que recibiera una transcripción**: terminaba la sesión y no
 * entraba nada. Lo que pasaba después era que alguien del equipo abría
 * Fathom, copiaba el texto a mano y lo pegaba en «Cargar sesión», o no lo
 * hacía, y la sesión se perdía.
 *
 * ═══ LO QUE ESTE MÓDULO NO HACE, A PROPÓSITO ═══
 *
 * No extrae nada. No escribe una decisión, ni un aviso, ni una ficha.
 * `transcripcion.ts` ya tiene la regla de la casa escrita en su encabezado y
 * no se toca:
 *
 *   «NADA SE GUARDA SIN QUE UN HUMANO LO CONFIRME. Una transcripción mal
 *    leída que se guarda sola es peor que no tenerla: se vuelve un dato
 *    falso con apariencia de registro.»
 *
 * Un webhook que extrajera y guardara solo rompería eso justo en el lugar
 * donde más cuesta —el registro de decisiones del negocio—. Así que la
 * transcripción entra, queda en la cola de lo que nadie revisó todavía, y la
 * pantalla que ya existe sigue siendo la que decide.
 *
 * ═══ POR QUÉ ESTO ES UN MÓDULO Y NO UNAS LÍNEAS EN LA RUTA ═══
 *
 * Porque el campo `transcript` de Fathom **no es un texto**: es un arreglo de
 * turnos de habla —`{ speaker: { display_name }, text, timestamp }`—. Un
 * `String(cuerpo.transcript)` guarda la cadena `[object Object]`: 15
 * caracteres que pasan cualquier chequeo de «vino algo» y que nadie puede
 * leer después. Aplanar eso es la mitad del trabajo de esta ruta, y se
 * prueba suelto en `scripts/prueba-fathom-entra.ts`.
 *
 * Los nombres de los campos son los del esquema `Meeting` de Fathom
 * (developers.fathom.ai, api-reference/openapi.yaml, leído el 11 nov 2026).
 */
/*
 * ═══ LOS DOS IMPORTS VAN CON `.js`, Y NO ES UN DESCUIDO ═══
 *
 * Este módulo lo carga `api/fathom-webhook.ts`, o sea Node en ESM puro, que
 * exige la extensión explícita en todo import relativo. Sin ella la función
 * muere en el arranque frío con ERR_MODULE_NOT_FOUND y el cliente recibe
 * FUNCTION_INVOCATION_FAILED sin una pista. Ya pasó en producción una vez, y
 * por eso existe `scripts/check-api-esm-imports.mjs` — que hasta hoy miraba
 * sólo los archivos de `api/` y no los de `src/` que `api/` alcanza. Ahora
 * sigue la cadena entera.
 *
 * Los dos son módulos sin imports propios, así que la cadena termina ahí.
 */
import { MINIMO_CARACTERES } from './transcripcion.js';
import { hoyISO } from './diaPrograma.js';

export interface ParticipanteDeFathom {
  nombre: string;
  email: string;
  /** `is_external`: el que NO es del dominio de la casa. El cliente es éste. */
  deAfuera: boolean;
}

export interface CargaDeFathom {
  /** `recording_id`. Es la llave contra la que esta ruta es idempotente. */
  externoId: string;
  titulo: string;
  /** YYYY-MM-DD, de `recording_start_time`. */
  fecha: string;
  minutos: number | null;
  /** `share_url`: el enlace para ir a escuchar el momento exacto. */
  enlace: string;
  /** `recorded_by`: quién dio la sesión, si vino. */
  quienLaDio: string;
  /** El arreglo de turnos, aplanado a texto legible. */
  transcripcion: string;
  participantes: ParticipanteDeFathom[];
}

/* ─────────────────────────────────────────────────────────────────────────
 * APLANAR EL ARREGLO DE TURNOS
 * ───────────────────────────────────────────────────────────────────────── */

/** Un objeto cualquiera, sin prometer nada de su contenido. */
type Bolsa = Record<string, unknown>;
const bolsa = (x: unknown): Bolsa => (x && typeof x === 'object' ? x as Bolsa : {});
const texto = (x: unknown): string => (typeof x === 'string' ? x.trim() : '');

/**
 * El arreglo de Fathom, a texto.
 *
 * Tolera las tres formas en que puede llegar, porque el plan de Fathom y la
 * versión de su webhook deciden cuál sale y eso no lo controla esta app:
 *
 *   1. el arreglo de turnos documentado;
 *   2. un texto plano ya armado (algunos reenvíos lo mandan así);
 *   3. `{ transcript: { text } }`.
 *
 * El nombre de quien habla se conserva: una transcripción sin quién dijo qué
 * no sirve para saber qué se decidió. Y las marcas de tiempo NO se conservan:
 * el prompt de extracción recorta a 24.000 caracteres, y un `00:14:22` por
 * renglón gasta ese presupuesto en algo que el modelo no usa.
 */
export function aplanarTranscripcion(bruto: unknown): string {
  if (typeof bruto === 'string') return bruto.trim();

  if (Array.isArray(bruto)) {
    const renglones: string[] = [];
    for (const turno of bruto) {
      const t = bolsa(turno);
      const dicho = texto(t.text) || texto(t.transcript) || texto(t.content);
      if (!dicho) continue;
      // `speaker` es un objeto con `display_name`; algunos reenvíos lo
      // mandan como cadena suelta.
      const quien = typeof t.speaker === 'string'
        ? t.speaker.trim()
        : texto(bolsa(t.speaker).display_name) || texto(bolsa(t.speaker).name);
      renglones.push(quien ? `${quien}: ${dicho}` : dicho);
    }
    return renglones.join('\n');
  }

  const b = bolsa(bruto);
  if (b.text || b.transcript) {
    // `{ transcript: [...] }` adentro de `{ transcript: {...} }`: una vuelta
    // más, nunca infinita.
    const dentro = b.text ?? b.transcript;
    return typeof dentro === 'string' || Array.isArray(dentro) ? aplanarTranscripcion(dentro) : '';
  }
  return '';
}

/* ─────────────────────────────────────────────────────────────────────────
 * LOS PARTICIPANTES
 * ───────────────────────────────────────────────────────────────────────── */

function leerParticipantes(bruto: unknown): ParticipanteDeFathom[] {
  if (!Array.isArray(bruto)) return [];
  const vistos = new Set<string>();
  const salida: ParticipanteDeFathom[] = [];
  for (const crudo of bruto) {
    const p = bolsa(crudo);
    const email = texto(p.email).toLowerCase();
    if (!email.includes('@') || vistos.has(email)) continue;
    vistos.add(email);
    salida.push({
      nombre: texto(p.name) || texto(p.matched_speaker_display_name),
      email,
      // Ausente ≠ falso: si Fathom no lo dice, no se afirma que sea de la
      // casa. `aQuienBuscar` igual lo prueba, sólo que después.
      deAfuera: p.is_external !== false,
    });
  }
  return salida;
}

/**
 * EN QUÉ ORDEN BUSCAR AL CLIENTE.
 *
 * Primero los de afuera, que es lo que el cliente es, y después el resto.
 * Si se buscara en el orden en que vienen, en una sesión donde Javo entró
 * primero el primer email que existe en `profiles` sería el de Javo, y la
 * transcripción quedaría colgada de la ficha de quien dio la sesión.
 *
 * Igual van todos: en una sesión grabada desde la cuenta del cliente, él
 * figura como interno y no habría a quién buscar.
 */
export function aQuienBuscar(participantes: ParticipanteDeFathom[]): string[] {
  return [
    ...participantes.filter((p) => p.deAfuera).map((p) => p.email),
    ...participantes.filter((p) => !p.deAfuera).map((p) => p.email),
  ];
}

/* ─────────────────────────────────────────────────────────────────────────
 * LA CARGA ENTERA
 * ───────────────────────────────────────────────────────────────────────── */

const SOLO_FECHA = /^\d{4}-\d{2}-\d{2}/;

/**
 * `recording_start_time` → YYYY-MM-DD. Lo que no se entiende es hoy.
 *
 * Con `hoyISO`, que es el único helper de la casa para la fecha de un día: un
 * `toISOString().slice(0, 10)` devuelve el día en UTC, y de las 21:00 en
 * adelante en UTC−3 eso es mañana. Estaba escrito así en quince lugares y de
 * esas fechas sale el atraso con el que se decide si la garantía corre.
 */
function fechaDe(bruto: unknown): string {
  const t = texto(bruto);
  if (SOLO_FECHA.test(t)) return t.slice(0, 10);
  const d = t ? new Date(t) : new Date(NaN);
  return hoyISO(Number.isNaN(d.getTime()) ? new Date() : d);
}

/** Los minutos reales de la grabación. `null` cuando no se puede saber. */
export function minutosEntre(inicio: unknown, fin: unknown): number | null {
  const a = new Date(texto(inicio));
  const b = new Date(texto(fin));
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return null;
  const m = Math.round((b.getTime() - a.getTime()) / 60000);
  // Una sesión de cero minutos o de dos días no es un dato, es un error de
  // reloj: mejor sin minutos que con un número que alguien va a creer.
  return m > 0 && m < 24 * 60 ? m : null;
}

export type Lectura =
  | { carga: CargaDeFathom; porque?: undefined }
  | { carga: null; porque: string };

/**
 * Lee el cuerpo del webhook. No tira: devuelve el motivo.
 *
 * El motivo se devuelve en castellano porque termina en el renglón de la
 * respuesta que Fathom muestra en su panel de webhooks, y lo lee Javo.
 */
export function leerCargaDeFathom(cuerpo: unknown): Lectura {
  const b = bolsa(cuerpo);
  // Algunos reenvíos envuelven el pago en `{ data: ... }`.
  const m = bolsa(b.meeting ?? b.data ?? b);

  const transcripcion = aplanarTranscripcion(m.transcript ?? b.transcript);
  if (!transcripcion) {
    return { carga: null, porque: 'no vino ninguna transcripción legible en `transcript`' };
  }
  if (transcripcion.length < MINIMO_CARACTERES) {
    return {
      carga: null,
      porque: `la transcripción tiene ${transcripcion.length} caracteres y menos de ${MINIMO_CARACTERES} no es una sesión`,
    };
  }

  const externoId = texto(m.recording_id) || texto(m.id) || texto(m.share_url) || texto(m.url);
  if (!externoId) {
    // Sin llave no hay idempotencia, y un webhook que Fathom reintenta
    // dejaría la misma sesión tres veces en la cola de revisión.
    return { carga: null, porque: 'no vino `recording_id`: sin él la misma sesión entraría repetida' };
  }

  return {
    carga: {
      externoId,
      titulo: texto(m.meeting_title) || texto(m.title) || 'Sesión sin título',
      fecha: fechaDe(m.recording_start_time ?? m.scheduled_start_time ?? m.created_at),
      minutos: minutosEntre(m.recording_start_time, m.recording_end_time),
      enlace: texto(m.share_url) || texto(m.url) || texto(m.meeting_url),
      quienLaDio: texto(bolsa(m.recorded_by).name) || texto(bolsa(m.recorded_by).email) || texto(m.recorded_by),
      transcripcion,
      participantes: leerParticipantes(m.calendar_invitees ?? m.invitees ?? m.participants),
    },
  };
}
