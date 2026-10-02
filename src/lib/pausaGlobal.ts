/**
 * LA PAUSA GLOBAL — parar el Camino de todos a la vez.
 *
 * Primer uso: del 15 de diciembre al 15 de enero. Durante esos días el Camino
 * se ve igual, pero nadie avanza de día, nadie acumula atraso y nadie aparece
 * en el semáforo. Al terminar, las fechas de todos se corren exactamente los
 * días que duró, con el progreso intacto.
 *
 * Cómo funciona, en una línea: en vez de mover la fecha de inicio de cada
 * cliente en la base —que borraría el histórico y hay que hacerlo uno por uno—
 * se le resta al día de hoy los días de pausa ya transcurridos. Eso da el
 * "hoy del Camino".
 *
 *   Durante la pausa: los días transcurridos crecen al mismo ritmo que el
 *   calendario, así que el hoy del Camino queda quieto en la víspera.
 *   Después:          el descuento queda fijo en lo que duró, y todo el
 *                     Camino de todos quedó corrido esos días.
 *
 * LA PAUSA SE MIDE EN SEMANAS ENTERAS. Si se pide del 15 de diciembre al 15 de
 * enero —treinta y dos días— se redondea a treinta y cinco. Es la única forma
 * de que cada jornada siga cayendo en el mismo día de la semana: con un
 * corrimiento suelto, el lunes de grabar caería en viernes y el fin de semana
 * libre quedaría en mitad de la semana. Se redondea siempre hacia arriba, así
 * que nadie pierde días: gana unos pocos.
 *
 * Nada toca el progreso: las jornadas cerradas siguen cerradas. Y si hay más
 * de una pausa a lo largo del año, los descuentos se suman.
 *
 * Lógica pura: no sabe nada de la base, así se puede probar sola. Quien lee y
 * escribe las pausas en Supabase es pausasDatos.ts.
 */

export interface PausaGlobal {
  id?: string;
  /** Primer día parado, aaaa-mm-dd. */
  desde: string;
  /** Último día que se pidió parar, aaaa-mm-dd. Se estira a la semana entera. */
  hasta: string;
  motivo?: string | null;
  creada_por?: string | null;
}

const DIA = 24 * 60 * 60 * 1000;

function aFecha(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function aISO(f: Date): string {
  return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`;
}

export function hoyISO(): string {
  return aISO(new Date());
}

function sumar(iso: string, dias: number): string {
  const f = aFecha(iso);
  f.setDate(f.getDate() + dias);
  return aISO(f);
}

/** Los días que se pidieron parar, de punta a punta. */
export function diasPedidos(p: PausaGlobal): number {
  return Math.round((aFecha(p.hasta).getTime() - aFecha(p.desde).getTime()) / DIA) + 1;
}

/** Lo que dura de verdad: semanas enteras, redondeando hacia arriba. */
export function diasQueDura(p: PausaGlobal): number {
  return Math.ceil(diasPedidos(p) / 7) * 7;
}

/** El último día parado de verdad, ya estirado a la semana entera. */
export function ultimoDiaParado(p: PausaGlobal): string {
  return sumar(p.desde, diasQueDura(p) - 1);
}

/** El día en que el Camino vuelve a correr. */
export function retomaEl(p: PausaGlobal): string {
  return sumar(p.desde, diasQueDura(p));
}

/** La pausa que está corriendo hoy, si hay alguna. */
export function pausaVigente(pausas: PausaGlobal[], hoy: string = hoyISO()): PausaGlobal | null {
  return pausas.find((p) => p.desde <= hoy && hoy <= ultimoDiaParado(p)) ?? null;
}

/** La próxima pausa que todavía no empezó, si hay alguna. */
export function pausaQueViene(pausas: PausaGlobal[], hoy: string = hoyISO()): PausaGlobal | null {
  const futuras = pausas.filter((p) => p.desde > hoy).sort((a, b) => a.desde.localeCompare(b.desde));
  return futuras[0] ?? null;
}

/**
 * Cuántos días hay que descontarle al calendario para saber en qué día del
 * Camino está cada uno. Suma los días ya transcurridos de cada pausa: las
 * terminadas cuentan completas, la que está corriendo cuenta lo que lleva.
 */
export function diasDeCorrimiento(pausas: PausaGlobal[], hoy: string = hoyISO()): number {
  let total = 0;
  for (const p of pausas) {
    if (hoy < p.desde) continue;
    const fin = ultimoDiaParado(p);
    const corte = hoy < fin ? hoy : fin;
    total += Math.round((aFecha(corte).getTime() - aFecha(p.desde).getTime()) / DIA) + 1;
  }
  return total;
}

/** El "hoy" con el que el Camino cuenta los días. */
export function hoyDelCamino(pausas: PausaGlobal[], hoy: Date = new Date()): Date {
  const corridos = diasDeCorrimiento(pausas, aISO(hoy));
  const f = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  if (corridos <= 0) return f;
  f.setDate(f.getDate() - corridos);
  return f;
}

/**
 * La fecha de cierre de un cliente, ya corrida por las pausas que hubo.
 *
 * Cuentan completas todas las que ya empezaron: una pausa en curso igual va a
 * terminar, y el cliente merece ver desde el primer día hasta cuándo se le
 * estiró su Camino.
 */
export function cierreCorrido(cierreOriginal: string, pausas: PausaGlobal[], hoy: string = hoyISO()): string {
  let dias = 0;
  for (const p of pausas) if (p.desde <= hoy) dias += diasQueDura(p);
  return dias > 0 ? sumar(cierreOriginal, dias) : cierreOriginal;
}

// ── El registro que toda la app consulta ────────────────────────────────
//
// Se carga una vez al abrir la app y queda a mano. Así el cálculo del día
// —que vive en diaPrograma.ts y no puede tocar la base— sabe de las pausas
// sin que haya que pasárselas por parámetro en cada una de las pantallas.

let registro: PausaGlobal[] = [];

/** Deja las pausas a mano para todo el resto de la app. */
export function fijarPausas(pausas: PausaGlobal[]): void {
  registro = [...pausas];
}

/** Las pausas que hay cargadas ahora mismo. */
export function pausasActuales(): PausaGlobal[] {
  return registro;
}

/** Cuántos días lleva descontados el Camino hoy. */
export function corrimientoActual(hoy: string = hoyISO()): number {
  return diasDeCorrimiento(registro, hoy);
}

/** Si el Camino está parado ahora mismo. */
export function pausaActiva(hoy: string = hoyISO()): PausaGlobal | null {
  return pausaVigente(registro, hoy);
}

// ── Lo que lee el cliente ───────────────────────────────────────────────

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/** "15 de enero" — la fecha dicha como la diría una persona. */
export function enPalabras(iso: string): string {
  const f = aFecha(iso);
  return `${f.getDate()} de ${MESES[f.getMonth()]}`;
}

/** El cartel de la pantalla de inicio mientras el Camino está parado. */
export function cartelDeLaPausa(p: PausaGlobal, cierreOriginal?: string | null): {
  titulo: string;
  cuerpo: string;
  cierre: string | null;
} {
  const cierre = cierreOriginal ? cierreCorrido(cierreOriginal, [p], p.desde) : null;
  return {
    titulo: `El Camino retoma el ${enPalabras(retomaEl(p))}.`,
    cuerpo:
      'Tu Camino está en pausa. Todo lo que hiciste queda donde lo dejaste y las fechas se corren solas. ' +
      'Si tienes ganas de avanzar estos días, adelante: nadie te va a marcar atrasado.',
    cierre: cierre ? `Tu Camino ahora cierra el ${enPalabras(cierre)}.` : null,
  };
}

/** Lo que ve el equipo cuando la pausa ya está puesta. */
export function resumenParaElEquipo(p: PausaGlobal): string {
  return `El Camino de todos está parado desde el ${enPalabras(p.desde)}. ` +
    `Retoma el ${enPalabras(retomaEl(p))}: ${diasQueDura(p)} días corridos para todos.`;
}

/** Lo que ve el equipo antes de confirmar, para que sepa qué va a pasar. */
export function loQueVaAPasar(desde: string, hasta: string, cuantos: number): string {
  const p: PausaGlobal = { desde, hasta };
  const pedidos = diasPedidos(p);
  const reales = diasQueDura(p);
  const estira = reales > pedidos
    ? ` Se estira de ${pedidos} a ${reales} días para cerrar semanas enteras, así cada jornada sigue cayendo en su mismo día de la semana.`
    : '';
  return `El Camino de ${cuantos} ${cuantos === 1 ? 'cliente' : 'clientes'} se para el ${enPalabras(desde)} ` +
    `y retoma el ${enPalabras(retomaEl(p))}.${estira} A todos se les corre la fecha de cierre ${reales} días.`;
}
