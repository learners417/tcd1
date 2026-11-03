/**
 * LA VENTANA SIN SOPORTE — los días en que el equipo no responde.
 *
 * ═══ ESTO ERA AL REVÉS ═══
 *
 * Antes este archivo se llamaba pausaGlobal.ts y PARABA EL CAMINO DE TODOS:
 * congelaba el día de cada cliente, corría la fecha de cierre treinta y cinco
 * días, movía las fechas de la hoja de ruta y apagaba el semáforo. Al cliente
 * le mostraba un cartel que decía «El Camino retoma el 19 de enero».
 *
 * La app no corta nunca. Lo único que corta esos días es el soporte.
 *
 * La diferencia no es de matiz. Parar el Camino le quita al cliente el mes que
 * compró y le corre el cierre sin que él lo haya pedido: quien tenía ganas de
 * avanzar en enero se encontraba con que su día no se movía. Avisar que el
 * equipo no responde le deja el Camino entero y solo le dice la verdad sobre
 * una cosa: durante esos días, si escribe, la respuesta llega después.
 *
 * Por eso tampoco se estira a semanas enteras. Eso existía para que cada
 * jornada siguiera cayendo en su mismo día de la semana cuando todo se corría.
 * Nada se corre: la ventana son exactamente los días que se pidieron.
 *
 * Lo que sí hace, y es lo que importa: estos días NO cuentan como abandono. Un
 * cliente que pasó enero sin una sesión no fue abandonado si enero estaba
 * avisado, y el semáforo no puede acusar al equipo por eso.
 *
 * Lógica pura: no sabe nada de la base, así se prueba sola. Quien la lee y la
 * escribe en Supabase es soporteSinVentana en ventanasDatos.ts.
 */

export interface VentanaSinSoporte {
  id?: string;
  /** Primer día sin soporte, aaaa-mm-dd. */
  desde: string;
  /** Último día sin soporte, aaaa-mm-dd. Incluido. */
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

/** Cuántos días dura, de punta a punta, contando los dos extremos. */
export function cuantosDias(v: VentanaSinSoporte): number {
  return Math.round((aFecha(v.hasta).getTime() - aFecha(v.desde).getTime()) / DIA) + 1;
}

/** El día en que el equipo vuelve a responder. */
export function vuelveElSoporte(v: VentanaSinSoporte): string {
  return sumar(v.hasta, 1);
}

/** La ventana que está corriendo hoy, si hay alguna. */
export function sinSoporteHoy(
  ventanas: VentanaSinSoporte[],
  hoy: string = hoyISO(),
): VentanaSinSoporte | null {
  return ventanas.find((v) => v.desde <= hoy && hoy <= v.hasta) ?? null;
}

/** La próxima que todavía no empezó, si hay alguna. */
export function laQueViene(
  ventanas: VentanaSinSoporte[],
  hoy: string = hoyISO(),
): VentanaSinSoporte | null {
  return ventanas
    .filter((v) => v.desde > hoy)
    .sort((a, b) => a.desde.localeCompare(b.desde))[0] ?? null;
}

/**
 * Cuántos de los días entre dos fechas estaban avisados.
 *
 * ES LA FUNCIÓN QUE IMPORTA. El semáforo dice «hace 29 días que no tiene una
 * sesión» y lo usa para marcar al equipo. Si 21 de esos 29 días el soporte
 * estaba cerrado y avisado, el equipo no abandonó a nadie: el reclamo real son
 * 8 días. Sin este descuento, cada enero enciende en amarillo a toda la
 * cartera por una ventana que el cliente conocía desde que compró.
 *
 * Cuenta los dos extremos y no suma dos veces un día que caiga en dos ventanas.
 */
export function diasAvisadosEntre(
  ventanas: VentanaSinSoporte[],
  desde: string,
  hasta: string,
): number {
  if (!desde || !hasta || desde > hasta) return 0;
  const dias = new Set<string>();
  for (const v of ventanas) {
    const inicio = v.desde > desde ? v.desde : desde;
    const fin = v.hasta < hasta ? v.hasta : hasta;
    if (inicio > fin) continue;
    let d = inicio;
    while (d <= fin) { dias.add(d); d = sumar(d, 1); }
  }
  return dias.size;
}

// ── El registro que toda la app consulta ────────────────────────────────
//
// Se carga una vez al abrir la app y queda a mano, para que el semáforo y los
// carteles no tengan que recibirla por parámetro en veinte pantallas.

let registro: VentanaSinSoporte[] = [];

/** Deja las ventanas a mano para todo el resto de la app. */
export function fijarVentanas(ventanas: VentanaSinSoporte[]): void {
  registro = [...ventanas];
}

/** Las ventanas que hay cargadas ahora mismo. */
export function ventanasActuales(): VentanaSinSoporte[] {
  return registro;
}

/** Si el soporte está cerrado ahora mismo. */
export function soporteCerrado(hoy: string = hoyISO()): VentanaSinSoporte | null {
  return sinSoporteHoy(registro, hoy);
}

/** Cuántos de esos días estaban avisados, según el registro cargado. */
export function avisadosEntre(desde: string, hasta: string): number {
  return diasAvisadosEntre(registro, desde, hasta);
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

/**
 * El aviso que ve el cliente mientras el soporte está cerrado.
 *
 * Dice lo que SÍ pasa: el Camino sigue abierto y su mensaje se responde al
 * volver. Nada de «está en pausa», que es justo lo que no ocurre.
 */
export function avisoDelCliente(v: VentanaSinSoporte): {
  titulo: string;
  cuerpo: string;
} {
  return {
    titulo: `Respondemos desde el ${enPalabras(vuelveElSoporte(v))}.`,
    cuerpo:
      'Tu Camino sigue abierto y corriendo: avanza todo lo que quieras estos días. ' +
      'Si escribes, tu mensaje queda guardado y lo contestamos el primer día que volvemos.',
  };
}

/** El aviso de la que viene, para que se entere antes y no en el momento. */
export function avisoDeLaQueViene(v: VentanaSinSoporte): string {
  return `Del ${enPalabras(v.desde)} al ${enPalabras(v.hasta)} no hay soporte. ` +
    'Tu Camino sigue andando igual.';
}

/** Lo que ve el equipo cuando la ventana ya está puesta. */
export function resumenParaElEquipo(v: VentanaSinSoporte): string {
  return `El soporte está cerrado desde el ${enPalabras(v.desde)} y vuelve el ` +
    `${enPalabras(vuelveElSoporte(v))}: ${cuantosDias(v)} días. ` +
    'El Camino de todos sigue corriendo y nadie queda marcado por estos días.';
}

/** Lo que ve el equipo antes de confirmar, para que sepa qué va a pasar. */
export function loQueVaAPasar(desde: string, hasta: string, cuantos: number): string {
  const v: VentanaSinSoporte = { desde, hasta };
  if (desde > hasta) return 'La fecha de cierre tiene que ser posterior a la de apertura.';
  return `El soporte queda cerrado del ${enPalabras(desde)} al ${enPalabras(hasta)} ` +
    `—${cuantosDias(v)} días— y vuelve el ${enPalabras(vuelveElSoporte(v))}. ` +
    `El Camino de ${cuantos} ${cuantos === 1 ? 'cliente' : 'clientes'} sigue corriendo: ` +
    'nadie pierde días ni se le corre la fecha de cierre. Y el semáforo no va a ' +
    'marcar a nadie por los días de esta ventana.';
}
