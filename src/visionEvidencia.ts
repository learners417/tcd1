/**
 * tablero.ts — LA MATEMÁTICA DE LOS 10 (ZIP C).
 *
 * La promesa deja de ser una frase y pasa a ser una cuenta:
 *   300 conversaciones → 57 agendas → 40 llamadas → 10 pacientes.
 *
 * Los porcentajes no son optimismo: son los rangos que se miden en ventas
 * por llamada (cierre 21-29%) y en asistencia a citas agendadas (60-75%,
 * y 70-80% cuando hay confirmación de 24 h y 2 h antes).
 *
 * El tablero registra 3 números por semana y dice DÓNDE está la fuga.
 * Nada más. Tres números, un diagnóstico, una acción.
 */

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

export function lunesDeEstaSemana(): string {
  const d = new Date();
  const diff = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - diff);
  return d.toISOString().split('T')[0];
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
      detalle: `Tuviste ${s.conversaciones} conversaciones y necesitas ~${meta.conversaciones} por semana. No es tu técnica: es que no te está escribiendo suficiente gente.`,
      accion: 'Sube el presupuesto de tu anuncio o publica más esta semana. Es lo único que mueve este número.',
    };
  }
  if (s.llamadas < meta.llamadas * 0.7) {
    return {
      cuello: 'filtro',
      titulo: 'Tu cuello está entre el chat y la agenda',
      detalle: `Te escribieron ${s.conversaciones} pero solo agendaste ${s.llamadas} llamadas. La gente llega y no avanza.`,
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
