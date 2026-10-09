/**
 * CUÁNTO LLEVA CADA CLIENTE — una sola cuenta para toda la pantalla.
 *
 * ═══ POR QUÉ EXISTE ═══
 *
 * El cartel de arriba decía «3 clientes listos para activar» y la grilla, para
 * los mismos clientes, mostraba otros porcentajes. No era un error de cálculo:
 * eran **dos cuentas distintas**. El cartel contaba solo las filas tildadas en
 * la base; la grilla sumaba además los tildes automáticos del Camino y las
 * celdas marcadas como listas a mano, y restaba las marcadas como «no aplica».
 *
 * Dos números distintos para el mismo cliente, en la misma pantalla, enseñan a
 * no creerle a ninguno de los dos. Así que la cuenta vive acá, una sola vez.
 *
 * Lógica pura: no toca la base, así se puede probar sola.
 */
import { STEPS } from './preactivacionSteps';
import { cuadroDe, servicioDe, type Ticket } from './cuadroTickets';

/** Lo que hay que saber de un cliente para contar su avance. */
export interface LoQueLleva {
  /** Los pasos tildados en la base. */
  tildados?: Set<string>;
  /** Las metas del Camino que ya cerró: tildan pasos solas. */
  delCamino?: Set<string>;
  /** El estado puesto a mano en cada celda. */
  estados?: Map<string, { estado?: string }>;
  /** Qué contrató. Decide cuáles de los 62 le aplican. */
  servicio?: string | null;
}

export interface Avance {
  hechos: number;
  /** Los que le aplican, que no son 62 para todos. */
  total: number;
  pct: number;
  /** Los que su servicio no incluye. */
  noAplican: number;
}

/** Los pasos que un escalón de servicio no incluye. Se calcula una vez. */
const SIN_APLICAR = new Map<Ticket, Set<string>>();
function noIncluye(ticket: Ticket): Set<string> {
  let s = SIN_APLICAR.get(ticket);
  if (!s) {
    s = new Set(cuadroDe(ticket).filter((i) => i.noAplica).map((i) => i.id));
    SIN_APLICAR.set(ticket, s);
  }
  return s;
}

/**
 * Cuánto lleva, contando solo lo que le aplica.
 *
 * Un paso cuenta como hecho si está tildado en la base, si lo cerró en el
 * Camino, o si alguien lo marcó como listo en su celda. Las tres formas son
 * reales y las tres valen: ignorar una hacía que el avance de un cliente
 * cambiara según qué pantalla lo mirara.
 */
export function avanceDelCuadro(x: LoQueLleva): Avance {
  const fuera = noIncluye(servicioDe(x.servicio));
  let hechos = 0;
  let noAplican = 0;

  for (const p of STEPS) {
    if (fuera.has(p.id)) { noAplican++; continue; }
    const estado = x.estados?.get(p.id)?.estado;
    if (estado === 'na') { noAplican++; continue; }
    const porElCamino = Boolean(p.meta && x.delCamino?.has(p.meta));
    if (porElCamino || x.tildados?.has(p.id) || estado === 'listo') hechos++;
  }

  const total = STEPS.length - noAplican;
  return {
    hechos,
    total,
    pct: total > 0 ? Math.round((hechos / total) * 100) : 0,
    noAplican,
  };
}

/** Listo para encender: tiene todo lo que su servicio incluye. */
export function estaListo(x: LoQueLleva): boolean {
  const a = avanceDelCuadro(x);
  return a.total > 0 && a.hechos === a.total;
}
