/**
 * EL SEMÁFORO DE CLIENTES — a quién hay que buscar hoy.
 *
 * Una fila por cliente y un color que se calcula solo, todos los días. Es la
 * pantalla con la que Lupe abre la mañana: mira los rojos, después los
 * amarillos, y los verdes los deja tranquilos.
 *
 * El color no opina: sale de tres cosas medibles — si tiene jornadas vencidas
 * sin cerrar, hace cuánto que no entra, y si su Camino está cerrado esperando
 * un pago.
 *
 * El atraso se cuenta en días hábiles, igual que en el resto de la app: el
 * cliente descansa sábado y domingo, así que esos días no le suman atraso.
 */
import { SEED_ROADMAP_V2 } from './roadmapSeed';
import { diaDelPrograma, diasHabilesDeAtraso, esPasoDelCliente } from './diaPrograma';
import { accesoDelPerfil, estadoDeAcceso, type Acceso } from './ventanaDeAcceso';
import { pausaActiva, retomaEl, enPalabras } from './pausaGlobal';
import { semanasSinCargar, type SemanaDeNumeros } from './numerosDelCliente';

export type Color = 'rojo' | 'amarillo' | 'verde';

/** Las varas, en un solo lugar para que se puedan mover sin buscarlas. */
export const ATRASO_AMARILLO = 3;
export const ATRASO_ROJO = 7;
export const DIAS_SIN_ENTRAR_ROJO = 5;
/** Desde qué día del Camino ya se le pidió cargar sus números. */
export const DIA_EN_QUE_YA_MIDE = 26;
/** Semanas sin cargar a partir de las cuales hay que escribirle. */
export const SEMANAS_SIN_NUMEROS = 3;

export interface ClienteParaSemaforo {
  id: string;
  nombre: string;
  fecha_inicio?: string | null;
  acceso_tipo?: string;
  acceso_cuotas?: Array<{ vence: string; pagada: boolean }>;
  acceso_dias_devueltos?: number;
  /** Las claves `pilar-codigo` que ya cerró con evidencia. */
  completadas: Set<string>;
  /** La última vez que abrió la app, en aaaa-mm-dd. */
  ultimoIngreso?: string | null;
  /** Las semanas de números que cargó. Vacío es que todavía no cargó ninguna. */
  numeros?: SemanaDeNumeros[];
}

export interface FilaDelSemaforo {
  id: string;
  nombre: string;
  color: Color;
  /** En qué semana del Camino va. */
  semana: number;
  dia: number;
  /** La jornada abierta más vieja, si hay. */
  jornadaAtrasada: { dia: number; titulo: string; diasDeAtraso: number } | null;
  diasSinEntrar: number | null;
  ultimoIngreso: string | null;
  /** Hace cuántas semanas que no carga sus números. null: nunca cargó o no corresponde. */
  semanasSinNumeros: number | null;
  /** Los días que le quedan de ventana, o null si ya se cerró. */
  diasDeVentana: number | null;
  /** Por qué está en ese color, en una línea. */
  porque: string;
}

const DIA = 24 * 60 * 60 * 1000;

function aFecha(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function hoyISO(): string {
  const f = new Date();
  return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`;
}

/** Cuántos días pasaron desde que entró por última vez. */
export function diasSinEntrar(ultimoIngreso: string | null | undefined, hoy: string = hoyISO()): number | null {
  if (!ultimoIngreso) return null;
  return Math.max(0, Math.round((aFecha(hoy).getTime() - aFecha(ultimoIngreso).getTime()) / DIA));
}

/** Las jornadas que le tocaban y todavía no cerró, de la más vieja a la más nueva. */
export function jornadasAbiertas(c: ClienteParaSemaforo, hoy: string = hoyISO()) {
  const dia = diaDelPrograma(c.fecha_inicio, aFecha(hoy)) ?? 0;
  const out: Array<{ dia: number; titulo: string; diasDeAtraso: number }> = [];
  for (const p of SEED_ROADMAP_V2) {
    for (const m of p.metas) {
      const d = m.dia_asignado;
      if (d === null || d < 1 || d > dia) continue;
      if (!esPasoDelCliente(m)) continue;
      if (c.completadas.has(`${p.numero}-${m.codigo}`)) continue;
      out.push({ dia: d, titulo: m.titulo, diasDeAtraso: diasHabilesDeAtraso(c.fecha_inicio, d, dia) });
    }
  }
  return out.sort((a, b) => a.dia - b.dia);
}

/** La fila completa de un cliente: su color y los seis datos que se ven. */
export function filaDe(c: ClienteParaSemaforo, hoy: string = hoyISO()): FilaDelSemaforo {
  const dia = diaDelPrograma(c.fecha_inicio, aFecha(hoy)) ?? 0;
  const abiertas = jornadasAbiertas(c, hoy);
  const peor = abiertas.length ? abiertas.reduce((m, j) => (j.diasDeAtraso > m.diasDeAtraso ? j : m)) : null;
  const sinEntrar = diasSinEntrar(c.ultimoIngreso, hoy);

  const acceso: Acceso | null = accesoDelPerfil(c);
  const estado = acceso ? estadoDeAcceso(acceso, hoy) : null;
  const cerradoPorPago = Boolean(estado && !estado.abierto && estado.motivo === 'esperando el pago de tu cuota');

  // Hace cuántas semanas que no carga sus números. Solo cuenta a partir del
  // día en que el Camino se los pidió: antes de eso no hay nada que cargar.
  const yaDebeMedir = dia >= DIA_EN_QUE_YA_MIDE;
  const sinNumeros = yaDebeMedir
    ? (c.numeros && c.numeros.length ? semanasSinCargar(c.numeros, hoy) : Infinity)
    : null;
  const numerosFlojos = sinNumeros !== null && sinNumeros >= SEMANAS_SIN_NUMEROS;
  const nuncaCargo = yaDebeMedir && (!c.numeros || c.numeros.length === 0);

  // Con el Camino parado para todos, el semáforo calla: nadie está atrasado
  // de algo que nadie podía hacer. La única luz que sigue encendida es la del
  // pago, porque esa no depende de la pausa.
  const parado = pausaActiva(hoy);
  if (parado && !cerradoPorPago) {
    return {
      id: c.id,
      nombre: c.nombre,
      color: 'verde',
      semana: dia > 0 ? Math.floor((dia - 1) / 7) + 1 : 0,
      dia,
      jornadaAtrasada: null,
      diasSinEntrar: sinEntrar,
      ultimoIngreso: c.ultimoIngreso ?? null,
      diasDeVentana: estado && estado.abierto ? estado.diasRestantes : null,
      semanasSinNumeros: Number.isFinite(sinNumeros as number) ? (sinNumeros as number) : null,
      porque: `El Camino está en pausa. Retoma el ${enPalabras(retomaEl(parado))}.`,
    };
  }

  let color: Color = 'verde';
  let porque = 'Al día y entrando.';

  if (peor && peor.diasDeAtraso > ATRASO_AMARILLO) {
    color = 'amarillo';
    porque = `Le falta cerrar el día ${peor.dia}, hace ${peor.diasDeAtraso} días hábiles.`;
  }
  if (cerradoPorPago) {
    color = 'rojo';
    porque = 'Su Camino está cerrado esperando el pago de la cuota.';
  } else if (peor && peor.diasDeAtraso > ATRASO_ROJO) {
    color = 'rojo';
    porque = `Le falta cerrar el día ${peor.dia}, hace ${peor.diasDeAtraso} días hábiles.`;
  } else if (sinEntrar !== null && sinEntrar >= DIAS_SIN_ENTRAR_ROJO) {
    color = 'rojo';
    porque = `Hace ${sinEntrar} días que no entra.`;
  } else if (color === 'verde' && numerosFlojos) {
    // Al día con las jornadas, pero sin mirar sus propios números. Nadie
    // corrige una campaña que no mira.
    color = 'amarillo';
    porque = nuncaCargo
      ? 'Al día, pero todavía no cargó sus números ni una vez.'
      : `Al día, pero hace ${sinNumeros} semanas que no carga sus números.`;
  } else if (color === 'verde' && sinEntrar !== null && sinEntrar >= DIAS_SIN_ENTRAR_ROJO) {
    color = 'rojo';
  }

  return {
    id: c.id,
    nombre: c.nombre,
    color,
    semana: dia > 0 ? Math.floor((dia - 1) / 7) + 1 : 0,
    dia,
    jornadaAtrasada: peor,
    diasSinEntrar: sinEntrar,
    ultimoIngreso: c.ultimoIngreso ?? null,
    diasDeVentana: estado && estado.abierto ? estado.diasRestantes : null,
    semanasSinNumeros: Number.isFinite(sinNumeros as number) ? (sinNumeros as number) : null,
    porque,
  };
}

const ORDEN: Record<Color, number> = { rojo: 0, amarillo: 1, verde: 2 };

/** El tablero del día: rojos arriba, y dentro de cada color, el más atrasado primero. */
export function semaforoDe(clientes: ClienteParaSemaforo[], hoy: string = hoyISO()): FilaDelSemaforo[] {
  return clientes
    .map((c) => filaDe(c, hoy))
    .sort((a, b) =>
      ORDEN[a.color] - ORDEN[b.color] ||
      (b.jornadaAtrasada?.diasDeAtraso ?? 0) - (a.jornadaAtrasada?.diasDeAtraso ?? 0) ||
      a.nombre.localeCompare(b.nombre));
}

/** Cuántos hay de cada color, para el encabezado. */
export function conteo(filas: FilaDelSemaforo[]): Record<Color, number> {
  return {
    rojo: filas.filter((f) => f.color === 'rojo').length,
    amarillo: filas.filter((f) => f.color === 'amarillo').length,
    verde: filas.filter((f) => f.color === 'verde').length,
  };
}
