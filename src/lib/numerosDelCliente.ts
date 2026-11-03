/**
 * LOS NÚMEROS DEL CLIENTE — lo que el equipo necesita leer de un vistazo.
 *
 * El cliente carga nueve números por semana en su pestaña de métricas. Nueve
 * números sueltos no dicen nada; lo que dice algo es lo que sale de cruzarlos:
 * cuánto le cuesta una agenda, cuánto una venta, cuántas de las personas que
 * agendan aparecen, y cuánto vuelve por cada peso que puso.
 *
 * Acá se calculan esos cruces y se escribe, en una línea, qué está pasando.
 * Esa línea es con la que quien acompaña abre el mensaje.
 *
 * Lógica pura: no toca la base, así se puede probar sola.
 */

export interface SemanaDeNumeros {
  semana: string;
  met_fecha_inicio?: string | null;
  met_fecha_fin?: string | null;
  gasto_ads?: number | null;
  mensajes_recibidos?: number | null;
  formularios_completados?: number | null;
  agendados?: number | null;
  shows?: number | null;
  llamadas_tomadas?: number | null;
  ventas_cerradas?: number | null;
  ingresos_cobrados?: number | null;
  horas_trabajadas_semana?: number | null;
  met_diagnostico?: string | null;
}

const n = (v: number | null | undefined): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0);

/** Divide sin romper: sin denominador no hay número, y eso se dice. */
function entre(a: number, b: number): number | null {
  return b > 0 ? a / b : null;
}

export interface Cruces {
  /** Cuánto le cuesta que una persona agende. */
  costoPorAgenda: number | null;
  /** Cuánto le cuesta una venta. */
  costoPorVenta: number | null;
  /** De cada diez que agendan, cuántas aparecen. */
  tasaDeShow: number | null;
  /** De cada diez llamadas que toma, cuántas cierra. */
  tasaDeCierre: number | null;
  /** Cuánto deja cada venta. */
  ticket: number | null;
  /** Por cada peso puesto en anuncios, cuánto volvió. */
  retorno: number | null;
}

export function cruces(s: SemanaDeNumeros): Cruces {
  const gasto = n(s.gasto_ads);
  return {
    costoPorAgenda: entre(gasto, n(s.agendados)),
    costoPorVenta: entre(gasto, n(s.ventas_cerradas)),
    tasaDeShow: entre(n(s.shows), n(s.agendados)),
    tasaDeCierre: entre(n(s.ventas_cerradas), n(s.llamadas_tomadas)),
    ticket: entre(n(s.ingresos_cobrados), n(s.ventas_cerradas)),
    retorno: entre(n(s.ingresos_cobrados), gasto),
  };
}

/** Si esa semana trae algo cargado, o está vacía. */
export function tieneDatos(s: SemanaDeNumeros): boolean {
  return [s.gasto_ads, s.mensajes_recibidos, s.formularios_completados, s.agendados,
    s.shows, s.llamadas_tomadas, s.ventas_cerradas, s.ingresos_cobrados]
    .some((v) => n(v) > 0);
}

/** Las semanas cargadas, de la más nueva a la más vieja. */
export function ordenadas(filas: SemanaDeNumeros[]): SemanaDeNumeros[] {
  return [...filas]
    .filter(tieneDatos)
    .sort((a, b) => (b.met_fecha_inicio ?? b.semana).localeCompare(a.met_fecha_inicio ?? a.semana));
}

/** La última semana que cargó, si cargó alguna. */
export function ultimaCargada(filas: SemanaDeNumeros[]): SemanaDeNumeros | null {
  return ordenadas(filas)[0] ?? null;
}

const DIA = 24 * 60 * 60 * 1000;

function aFecha(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Cuántas semanas hace que no carga nada.
 *
 * Sin ninguna carga devuelve null: no es que se haya atrasado, es que todavía
 * no empezó. Quien llama decide qué hacer con eso.
 */
export function semanasSinCargar(filas: SemanaDeNumeros[], hoy: string): number | null {
  const u = ultimaCargada(filas);
  const desde = u?.met_fecha_fin ?? u?.met_fecha_inicio;
  if (!desde) return null;
  const dias = Math.floor((aFecha(hoy).getTime() - aFecha(desde).getTime()) / DIA);
  return Math.max(0, Math.floor(dias / 7));
}

// ── Lo que se lee de un vistazo ─────────────────────────────────────

const usd = (v: number): string => `${Math.round(v).toLocaleString('es')} USD`;
const pct = (v: number): string => `${Math.round(v * 100)}%`;

/** El embudo de la semana, dicho como se dice. */
export function elEmbudo(s: SemanaDeNumeros): string {
  const partes: string[] = [];
  if (n(s.gasto_ads) > 0) partes.push(`puso ${usd(n(s.gasto_ads))}`);
  if (n(s.agendados) > 0) partes.push(n(s.agendados) === 1 ? '1 agendó' : `${n(s.agendados)} agendaron`);
  if (n(s.shows) > 0) partes.push(n(s.shows) === 1 ? '1 apareció' : `${n(s.shows)} aparecieron`);
  if (n(s.ventas_cerradas) > 0) partes.push(n(s.ventas_cerradas) === 1 ? '1 compró' : `${n(s.ventas_cerradas)} compraron`);
  if (n(s.ingresos_cobrados) > 0) partes.push(`cobró ${usd(n(s.ingresos_cobrados))}`);
  return partes.length ? partes.join(' · ') : 'Semana cargada sin movimiento.';
}

/**
 * Qué está pasando, en una frase. Es la línea con la que se abre el mensaje:
 * nombra lo que mueve la aguja y deja afuera lo demás.
 */
export function queEstaPasando(s: SemanaDeNumeros): string {
  const c = cruces(s);
  const gasto = n(s.gasto_ads);
  const agend = n(s.agendados);
  const llam = n(s.llamadas_tomadas);
  const ventas = n(s.ventas_cerradas);

  if (gasto === 0 && agend === 0) return 'Cargó la semana sin anuncios ni agendas.';
  if (gasto > 0 && agend === 0) return `Puso ${usd(gasto)} y todavía no agendó a nadie. Lo primero es el anuncio y la página.`;
  if (c.retorno !== null && c.retorno >= 2) {
    return `Por cada peso en anuncios le vuelven ${c.retorno.toFixed(1)}. Esto se sostiene y se sube.`;
  }
  if (agend > 0 && c.tasaDeShow !== null && c.tasaDeShow < 0.5) {
    return `Agenda bien, pero solo aparece ${pct(c.tasaDeShow)}. El problema está entre agendar y la llamada.`;
  }
  if (llam >= 3 && ventas === 0) {
    return `Tomó ${llam} llamadas y no cerró ninguna. El problema está en la llamada, no en los anuncios.`;
  }
  if (c.costoPorVenta !== null && c.ticket !== null && c.costoPorVenta > c.ticket) {
    return `Cada venta le cuesta ${usd(c.costoPorVenta)} y deja ${usd(c.ticket)}. Así pierde en cada una.`;
  }
  if (ventas > 0) {
    return `${ventas} ${ventas === 1 ? 'venta' : 'ventas'} esta semana${c.ticket !== null ? `, de ${usd(c.ticket)} cada una` : ''}.`;
  }
  return 'Va cargando, todavía sin ventas en la semana.';
}

/** El aviso cuando hace rato que no carga. */
export function avisoDeCarga(semanas: number | null, nuncaCargo: boolean): string | null {
  if (nuncaCargo) return 'Todavía no cargó sus números ni una vez.';
  if (semanas === null || semanas < 2) return null;
  return `Hace ${semanas} semanas que no carga sus números.`;
}

/** Lo que cambió entre la última semana y la anterior. */
export function comparado(filas: SemanaDeNumeros[]): string | null {
  const [hoy, antes] = ordenadas(filas);
  if (!hoy || !antes) return null;
  const a = cruces(antes).costoPorAgenda;
  const h = cruces(hoy).costoPorAgenda;
  if (a === null || h === null) return null;
  if (Math.abs(h - a) / a < 0.1) return 'Su costo por agenda se mantiene.';
  return h < a
    ? `Su costo por agenda bajó de ${usd(a)} a ${usd(h)}.`
    : `Su costo por agenda subió de ${usd(a)} a ${usd(h)}.`;
}

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/** "21 de septiembre" — la fecha como la diría una persona. */
export function enPalabras(iso: string | null | undefined): string {
  if (!iso) return '';
  const f = aFecha(iso);
  return `${f.getDate()} de ${MESES[f.getMonth()]}`;
}

export { usd, pct };
