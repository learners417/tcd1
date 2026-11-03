/**
 * LO QUE CUESTA CADA CLIENTE — el número que dice si el negocio cierra.
 *
 * La base ya anota cada llamada a la IA con su costo en dólares, y hay una
 * función que lo agrupa por cliente. Nadie la llamaba nunca: el panel mostraba
 * el gasto total del motor, que sirve para saber si la cuenta de Anthropic
 * duele, pero no para saber a quién le duele.
 *
 * Y es la pregunta que importa. Un cliente que pagó mil dólares una vez y
 * consume doscientos en IA mientras recorre sus noventa días no es un cliente:
 * es una suscripción al revés. Sin este cruce eso se descubre con el resumen de
 * la tarjeta, tres meses tarde.
 *
 * Acá vive solo el cruce. Lógica pura: se prueba sola.
 */
import { TICKETS, servicioDe } from './cuadroTickets';

/** Lo que devuelve la base por cada cliente que usó la IA. */
export interface GastoDeUno {
  user_id: string;
  usd_total: number | null;
  llamadas: number;
  usd_estimado: number | null;
  ultima: string | null;
}

export interface ClienteParaElCosto {
  id: string;
  nombre: string;
  servicio?: string | null;
}

/**
 * Cuánto del ticket se lleva la IA antes de preocuparse.
 *
 * Los dos números son deliberadamente holgados. El margen de una mentoría de
 * mil dólares es enorme y la IA debería costar centavos: si llega al 5 % algo
 * cambió —un cliente que descubrió el Mentor y lo usa todo el día, o una tarea
 * que se quedó en un modelo caro— y vale la pena mirarlo. Al 15 % ya no es
 * curiosidad: ese cliente deja de rendir.
 */
export const MIRAR = 0.05;
export const ACTUAR = 0.15;

export type Senal = 'bien' | 'mirar' | 'actuar';

export interface CostoDeUno {
  id: string;
  nombre: string;
  ticket: number;
  usd: number;
  llamadas: number;
  /** Qué porción del ticket se llevó la IA, de 0 a 1. */
  porcion: number;
  senal: Senal;
  ultima: string | null;
  /** Cuánto de ese gasto se calculó con precios sin confirmar. */
  usdEstimado: number;
}

function senalDe(porcion: number): Senal {
  if (porcion >= ACTUAR) return 'actuar';
  if (porcion >= MIRAR) return 'mirar';
  return 'bien';
}

/**
 * Cruza lo que gastó cada uno con lo que pagó.
 *
 * Los que no aparecen en el gasto quedan fuera: una fila en cero por cada
 * cliente que todavía no tocó la IA llena la tabla de nada. Y un gasto cuyo
 * cliente ya no está en la lista se muestra igual, con el id a la vista: es
 * plata que se fue y tiene que poder rastrearse.
 */
export function costoPorCliente(
  gastos: GastoDeUno[],
  clientes: ClienteParaElCosto[],
): CostoDeUno[] {
  const porId = new Map(clientes.map((c) => [c.id, c]));

  return gastos
    .map((g): CostoDeUno => {
      const c = porId.get(g.user_id);
      const ticket = TICKETS[servicioDe(c?.servicio)].precio;
      const gastado = Number(g.usd_total ?? 0);
      const porcion = ticket > 0 ? gastado / ticket : 0;
      return {
        id: g.user_id,
        nombre: c?.nombre ?? `Sin nombre · ${g.user_id.slice(0, 8)}`,
        ticket,
        usd: gastado,
        llamadas: g.llamadas ?? 0,
        porcion,
        senal: senalDe(porcion),
        ultima: g.ultima ?? null,
        usdEstimado: Number(g.usd_estimado ?? 0),
      };
    })
    .sort((a, b) => b.usd - a.usd);
}

/** Cuántos están pasados de cada señal. */
export function cuantosEn(filas: CostoDeUno[], senal: Senal): number {
  return filas.filter((f) => f.senal === senal).length;
}

/**
 * La línea de arriba del panel.
 *
 * Dice la plata y, si hay alguien pasado, lo nombra. El total solo no alcanza:
 * cien dólares repartidos entre cuarenta clientes es el costo de operar, y cien
 * dólares de un solo cliente es un problema con nombre.
 */
export function comoVaElCosto(filas: CostoDeUno[]): string {
  if (filas.length === 0) return 'Todavía nadie usó la IA en este período.';

  const total = filas.reduce((s, f) => s + f.usd, 0);
  const plata = `$${total.toFixed(total < 10 ? 2 : 0)} en ${filas.length} ${filas.length === 1 ? 'cliente' : 'clientes'}`;

  const actuar = filas.filter((f) => f.senal === 'actuar');
  if (actuar.length > 0) {
    const quienes = actuar.slice(0, 3).map((f) => f.nombre).join(', ');
    return `${plata}. ${quienes} ${actuar.length === 1 ? 'se lleva' : 'se llevan'} más del ${Math.round(ACTUAR * 100)} % de lo que ${actuar.length === 1 ? 'pagó' : 'pagaron'}.`;
  }

  const mirar = cuantosEn(filas, 'mirar');
  if (mirar > 0) {
    return `${plata}. ${mirar} ${mirar === 1 ? 'pasa' : 'pasan'} el ${Math.round(MIRAR * 100)} % de su ticket: vale mirarlo.`;
  }

  return `${plata}. Ninguno pasa el ${Math.round(MIRAR * 100)} % de lo que pagó.`;
}

/** "0,4 %" — la porción dicha corta, sin decimales de más. */
export function enPorciento(porcion: number): string {
  const pct = porcion * 100;
  if (pct === 0) return '0 %';
  if (pct < 1) return `${pct.toFixed(1)} %`;
  return `${Math.round(pct)} %`;
}
