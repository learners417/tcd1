/**
 * LA MEDICIÓN — seis números al entrar y los mismos seis al salir.
 *
 * Es lo que convierte noventa días en algo comparable. Al entrar se piden
 * antes de generar su ADN, porque sin punto de partida no hay nada contra qué
 * comparar después. Al salir se piden el día 83, para que el número llegue a
 * la sesión de cierre.
 *
 * Los seis están elegidos para que la mejora se vea aunque facture parecido:
 * si cobra más por sesión, atiende menos horas y responde menos WhatsApp, su
 * vida cambió aunque el total del mes sea similar. Por eso la app calcula
 * también lo que le queda por hora, que es el número que resume todo.
 */

export type Sentido = 'mas' | 'menos';

export interface CampoDeMedicion {
  id: string;
  /** Cómo se le pregunta, en su idioma. */
  pregunta: string;
  /** Qué unidad es, para mostrarla al lado. */
  unidad: string;
  /** Hacia dónde es mejor que se mueva. */
  mejor: Sentido;
  /** Lo que la app le dice cuando ese número mejora. */
  cuandoMejora: string;
}

export const CAMPOS: CampoDeMedicion[] = [
  { id: 'facturacion', pregunta: 'Cuánto facturaste el último mes', unidad: 'USD', mejor: 'mas',
    cuandoMejora: 'Estás facturando más que cuando empezaste.' },
  { id: 'precio_sesion', pregunta: 'Cuánto cobras por sesión', unidad: 'USD', mejor: 'mas',
    cuandoMejora: 'Tu hora vale más que el primer día.' },
  { id: 'consultantes', pregunta: 'Cuántos consultantes atendiste el último mes', unidad: 'personas', mejor: 'mas',
    cuandoMejora: 'Llegas a más personas.' },
  { id: 'horas_atendiendo', pregunta: 'Cuántas horas por semana pasas atendiendo', unidad: 'horas', mejor: 'menos',
    cuandoMejora: 'Recuperaste horas de tu semana.' },
  { id: 'horas_whatsapp', pregunta: 'Cuántas horas por semana pasas en WhatsApp con tus consultantes', unidad: 'horas', mejor: 'menos',
    cuandoMejora: 'Tu teléfono dejó de ser tu consultorio.' },
  { id: 'sistemas', pregunta: 'Cuántos de los cinco sistemas tienes andando', unidad: 'de 5', mejor: 'mas',
    cuandoMejora: 'Tienes más sistemas funcionando solos.' },
];

export type Medicion = Record<string, number>;

export const KEY_ENTRADA = 'tcd_medicion_entrada_v1';
export const KEY_SALIDA = 'tcd_medicion_salida_v1';

/** Está completa cuando los seis tienen un número, aunque alguno sea cero. */
export function estaCompleta(m: Medicion | null | undefined): boolean {
  if (!m) return false;
  return CAMPOS.every((c) => typeof m[c.id] === 'number' && !Number.isNaN(m[c.id]));
}

/** Lo que falta contestar, para decírselo sin que adivine. */
export function loQueFalta(m: Medicion | null | undefined): CampoDeMedicion[] {
  return CAMPOS.filter((c) => !m || typeof m[c.id] !== 'number' || Number.isNaN(m[c.id]));
}

export function guardar(clave: string, m: Medicion): void {
  try { localStorage.setItem(clave, JSON.stringify(m)); } catch { /* noop */ }
}

export function leer(clave: string): Medicion | null {
  try {
    const raw = localStorage.getItem(clave);
    return raw ? (JSON.parse(raw) as Medicion) : null;
  } catch {
    return null;
  }
}

/** Lo que le queda por hora: el número que resume los otros cinco. */
export function horaReal(m: Medicion | null | undefined): number | null {
  if (!m) return null;
  const horas = (m.horas_atendiendo ?? 0) + (m.horas_whatsapp ?? 0);
  if (!horas || !m.facturacion) return null;
  return Math.round((m.facturacion / (horas * 4.33)) * 100) / 100;
}

export interface Par {
  campo: CampoDeMedicion;
  entrada: number | null;
  salida: number | null;
  /** Salida menos entrada, en crudo. */
  diferencia: number | null;
  /** Se movió hacia donde tenía que moverse. */
  mejoro: boolean;
  /** Lo que se le muestra al lado del par. */
  lectura: string;
}

/** Los seis pares, para la pantalla de antes y después. */
export function comparar(entrada: Medicion | null, salida: Medicion | null): Par[] {
  return CAMPOS.map((campo) => {
    const a = entrada?.[campo.id];
    const b = salida?.[campo.id];
    const hay = typeof a === 'number' && typeof b === 'number';
    const dif = hay ? Math.round((b - a) * 100) / 100 : null;
    const mejoro = hay && (campo.mejor === 'mas' ? b > a : b < a);
    let lectura = 'Falta medirlo.';
    if (hay) {
      if (mejoro) lectura = campo.cuandoMejora;
      else if (dif === 0) lectura = 'Quedó igual.';
      else lectura = campo.mejor === 'mas' ? 'Bajó desde que empezaste.' : 'Subió desde que empezaste.';
    }
    return { campo, entrada: hay ? a : null, salida: hay ? b : null, diferencia: dif, mejoro, lectura };
  });
}

/** Cuántos de los seis mejoraron, para el encabezado del cierre. */
export function cuantosMejoraron(pares: Par[]): number {
  return pares.filter((p) => p.mejoro).length;
}

/** La frase de cierre, con el número que resume todo. */
export function lecturaDelCierre(entrada: Medicion | null, salida: Medicion | null): string {
  const antes = horaReal(entrada);
  const ahora = horaReal(salida);
  if (antes === null || ahora === null) return 'Carga los seis números al entrar y al salir para ver tu cambio completo.';
  if (ahora > antes) return `Tu hora pasó de ${antes} a ${ahora}. Eso es lo que cambió de verdad.`;
  if (ahora === antes) return `Tu hora quedó en ${ahora}, igual que al empezar.`;
  return `Tu hora está en ${ahora} y empezaste en ${antes}. Hoy hay más horas adentro de cada peso.`;
}
