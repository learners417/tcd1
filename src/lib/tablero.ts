/**
 * tablero.ts — LA MATEMÁTICA DE LOS 10 (ZIP C).
 *
 * La promesa deja de ser una frase y pasa a ser una cuenta:
 *   306 conversaciones → 58 agendas → 40 llamadas → 10 pacientes.
 *
 * Acá decía «300 → 57 → 40 → 10», y eso NO es lo que la app le muestra. Las
 * 40 llamadas son exactas —10 / 0,25—; las agendas dan 57,14 y la cadena
 * redondea para ARRIBA, porque media agenda no agenda a nadie: 58. Y 58 /
 * 0,19 da 306. Los números lindos salen de redondear las agendas para abajo
 * —57 / 0,19 da 300 justo—, que es la cuenta de un folleto, no la de alguien
 * que tiene que juntar diez.
 *
 * Se corrige el comentario y no la cuenta: el 300 no está escrito en ninguna
 * pantalla ni en ninguna oferta —se midió, es el único lugar del repo donde
 * aparecía—, así que lo que el cliente lee hoy es 306. Si la oferta tiene que
 * decir 300, eso cambia una promesa y espera su clic.
 *
 * Los porcentajes no son optimismo: son los rangos que se miden en ventas
 * por llamada (cierre 21-29%) y en asistencia a citas agendadas (60-75%,
 * y 70-80% cuando hay confirmación de 24 h y 2 h antes).
 *
 * El tablero registra 3 números por semana y dice DÓNDE está la fuga.
 * Nada más. Tres números, un diagnóstico, una acción.
 */

import { semanaISO } from './bitacoraCampana';

export const META_PACIENTES = 10;
export const TASA_CIERRE = 0.25;      // de cada 4 llamadas reales, 1 dice que sí
export const TASA_ASISTENCIA = 0.70;  // 3 de cada 10 agendas no se presentan
export const TASA_AGENDA = 0.19;      // de las conversaciones, ~1 de cada 5 agenda

export interface CadenaMeta {
  ventas: number;
  llamadas: number;
  agendas: number;
  conversaciones: number;
}

/** La cadena completa para llegar a la meta. */
export function cadenaPara(ventas = META_PACIENTES): CadenaMeta {
  const llamadas = Math.ceil(ventas / TASA_CIERRE);
  const agendas = Math.ceil(llamadas / TASA_ASISTENCIA);
  const conversaciones = Math.ceil(agendas / TASA_AGENDA);
  return { ventas, llamadas, agendas, conversaciones };
}

/** La misma cadena, repartida en las semanas que le quedan de operación. */
export function metaSemanal(diaActual: number, ventasHechas = 0): CadenaMeta & { semanas: number } {
  const faltan = Math.max(0, META_PACIENTES - ventasHechas);
  const diasRestantes = Math.max(7, 90 - diaActual);
  const semanas = Math.max(1, Math.round(diasRestantes / 7));
  const total = cadenaPara(faltan);
  return {
    semanas,
    ventas: Math.round((total.ventas / semanas) * 10) / 10,
    llamadas: Math.ceil(total.llamadas / semanas),
    agendas: Math.ceil(total.agendas / semanas),
    conversaciones: Math.ceil(total.conversaciones / semanas),
  };
}

/* ══════════ El registro semanal (3 números, nada más) ══════════ */

export interface SemanaTablero {
  fecha: string;          // lunes de esa semana (ISO corto)
  conversaciones: number;
  llamadas: number;
  ventas: number;
}

const KEY = 'tcd_tablero_v1';

export function historialTablero(): SemanaTablero[] {
  try {
    const arr = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(arr) ? (arr as SemanaTablero[]) : [];
  } catch { return []; }
}

/**
 * La llave de la semana.
 *
 * Era el lunes en fecha corta —«2026-11-09»— y la base guarda la semana ISO
 * —«2026-W46»—. Dos llaves para la misma semana: el espejo local y la fila de
 * la base no se podían reconocer entre sí ni para leerse ni para pisarse. Es
 * la misma de `semanaISO` para que haya una sola.
 */
export function lunesDeEstaSemana(): string {
  return semanaISO();
}

export function registrarSemana(s: Omit<SemanaTablero, 'fecha'>): void {
  const fecha = lunesDeEstaSemana();
  const hist = historialTablero().filter((x) => x.fecha !== fecha);
  hist.push({ ...s, fecha });
  try { localStorage.setItem(KEY, JSON.stringify(hist.slice(-20))); } catch { /* noop */ }
}

export function semanaActual(): SemanaTablero | null {
  return historialTablero().find((x) => x.fecha === lunesDeEstaSemana()) ?? null;
}

export function ventasTotales(): number {
  return historialTablero().reduce((a, s) => a + (s.ventas || 0), 0);
}

/**
 * Deja en el espejo local lo que vino de la base.
 *
 * El espejo dejó de ser el dueño del dato y pasó a ser una copia: la base
 * manda. Hace falta porque la pantalla de Hoy decide sincrónicamente —en el
 * mismo render— si le pone al cliente el movimiento de su cuello, y no puede
 * esperar una consulta para armar la lista del día.
 */
export function sembrarEspejo(s: Omit<SemanaTablero, 'fecha'>): void {
  registrarSemana(s);
}

/* ══════════ El diagnóstico: dónde está la fuga ══════════ */

export interface Diagnostico {
  cuello: 'volumen' | 'filtro' | 'cierre' | 'ninguno';
  titulo: string;
  detalle: string;
  accion: string;
}

export function diagnosticar(s: SemanaTablero, meta: CadenaMeta): Diagnostico {
  if (s.conversaciones < meta.conversaciones * 0.7) {
    return {
      cuello: 'volumen',
      titulo: 'Tu cuello es el volumen',
      detalle: `Tuviste ${s.conversaciones} conversaciones y necesitas ~${meta.conversaciones} por semana. No es tu técnica: es que no te está escribiendo suficiente personas.`,
      accion: 'Sube el presupuesto de tu anuncio o publica más esta semana. Es lo único que mueve este número.',
    };
  }
  if (s.llamadas < meta.llamadas * 0.7) {
    return {
      cuello: 'filtro',
      titulo: 'Tu cuello está entre el chat y la agenda',
      detalle: `Te escribieron ${s.conversaciones} pero solo agendaste ${s.llamadas} llamadas. Las personas llegan y no avanzan.`,
      accion: 'Revisa dos cosas: que tu agente responda en menos de un minuto, y que tu mensaje hable del dolor de tu paciente, no de tu técnica. Y confirma cada cita 24 h y 2 h antes: sin eso, 3 de cada 10 no se presentan.',
    };
  }
  if (s.ventas < meta.ventas * 0.7) {
    return {
      cuello: 'cierre',
      titulo: 'Tu cuello es el cierre',
      detalle: `Hiciste ${s.llamadas} llamadas y cerraste ${s.ventas}. Las conversaciones llegan; la decisión no.`,
      accion: 'Practica un roleplay con tu Mentor esta semana y revisa dos reglas: que esté quien decide, y que las objeciones salgan ANTES del precio.',
    };
  }
  return {
    cuello: 'ninguno',
    titulo: 'Vas en ritmo',
    detalle: 'Tus tres números están donde tienen que estar.',
    accion: 'No cambies nada. Repite exactamente lo mismo la semana que viene.',
  };
}

/* ══════════ Y el día siguiente viene con el trabajo de ese cuello ══════════ */

/**
 * ═══ LA PATA QUE FALTABA ═══
 *
 * El diagnóstico moría dentro de la tarjeta. `diagnosticar` no la llamaba
 * nadie más que `TableroNumeros`: el cliente leía «tu cuello es el cierre» el
 * viernes y el sábado la app volvía a abrir igual que el día 3, sin una sola
 * línea que se acordara de lo que acababa de medir.
 *
 * El destino no se inventa acá: es el mismo al que ya mandan los avisos
 * escritos para ese cuello en `avisosCliente.ts`, y los entrenadores viven en
 * Agentes. Un movimiento que lleva a otro lado sería un tercer criterio para
 * la misma situación.
 */
export interface TrabajoDelCuello {
  titulo: string;
  meta: string;
  /** La página de la app, con el nombre que usa el router. */
  destino: 'campanas' | 'entrenadores';
}

export const TRABAJO_POR_CUELLO: Record<
  Exclude<Diagnostico['cuello'], 'ninguno'>,
  TrabajoDelCuello
> = {
  volumen: {
    titulo: 'Tu cuello de esta semana: el volumen',
    meta: 'Te escriben pocas personas. Sube el presupuesto o publica más — es lo único que mueve ese número',
    destino: 'campanas',
  },
  filtro: {
    titulo: 'Tu cuello de esta semana: entre el chat y la llamada',
    meta: 'Llegan y no avanzan. Sofi revisa tus DM; y confirma cada cita 24 h y 2 h antes',
    destino: 'entrenadores',
  },
  cierre: {
    titulo: 'Tu cuello de esta semana: el cierre',
    meta: 'Las llamadas ocurren y la decisión no. Un roleplay con Lucas antes de la próxima',
    destino: 'entrenadores',
  },
};

/**
 * El cuello que le toca hoy, leído del espejo. Sincrónico a propósito.
 *
 * null cuando no cargó la semana —no se le inventa un cuello a quien no dio
 * números— y cuando está en ritmo: «no cambies nada» no es un movimiento del
 * día, y ponerlo como uno le daría trabajo donde la app acaba de decirle que
 * no hace falta.
 */
export function trabajoDeHoy(diaActual: number): TrabajoDelCuello | null {
  const s = semanaActual();
  if (!s) return null;
  const dx = diagnosticar(s, metaSemanal(diaActual, ventasTotales()));
  if (dx.cuello === 'ninguno') return null;
  return TRABAJO_POR_CUELLO[dx.cuello];
}
