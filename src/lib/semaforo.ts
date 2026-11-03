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
import { soporteCerrado, vuelveElSoporte, avisadosEntre, enPalabras } from './ventanaSinSoporte';
import { semanasSinCargar, type SemanaDeNumeros } from './numerosDelCliente';
import { diasReclamables, seEstaCayendo, ultima, type Sesion } from './sesionesHumanas';

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
  /** Las sesiones con personas que recibió. Vacío: todavía ninguna. */
  sesiones?: Sesion[];
  /** Qué contrató. Decide cada cuánto le toca una sesión. */
  servicio?: string | null;
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
  /** Hace cuántos días que no tiene una sesión. null: todavía no tuvo ninguna. */
  diasSinSesion: number | null;
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

  // El acompañamiento que compró y no está recibiendo.
  //
  // Los días en que el soporte estaba cerrado y avisado se descuentan: de esos
  // días el cliente estaba enterado y al equipo no se le pueden reclamar.
  const ultimaSesion = c.sesiones?.length ? ultima(c.sesiones) : null;
  const avisados = ultimaSesion ? avisadosEntre(ultimaSesion.fecha, hoy) : 0;
  const diasSinUna = c.sesiones?.length
    ? diasReclamables(c.sesiones, hoy, avisados)
    : null;
  const acompanamientoFlojo = c.sesiones?.length
    ? seEstaCayendo(c.sesiones, c.servicio, hoy, avisados)
    : false;
  const nuncaCargo = yaDebeMedir && (!c.numeros || c.numeros.length === 0);

  // EL SOPORTE CERRADO NO APAGA EL SEMÁFORO.
  //
  // Antes, una «pausa global» devolvía verde a toda la cartera y el semáforo
  // callaba un mes entero: el cliente que dejó de entrar en diciembre
  // reaparecía en rojo recién a fin de enero, cuando ya se había ido.
  //
  // El Camino no se para. Lo que se cierra son los días en que el equipo no
  // responde, y eso cambia UNA cosa: esos días no se le pueden reclamar al
  // equipo. Así que se descuentan de la cuenta de abandono y nada más. Todo
  // lo que depende del cliente —entrar, cerrar su día, cargar sus números—
  // se sigue midiendo igual.
  const cerrado = soporteCerrado(hoy);

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
  } else if (color === 'verde' && acompanamientoFlojo) {
    // VA ANTES QUE LA DE LOS NÚMEROS, a propósito.
    //
    // «No carga sus números» es algo que el cliente tiene que corregir. Esto
    // es lo que el EQUIPO le debe: compró acompañamiento y hace rato que no lo
    // recibe. De las dos, esta es la que hace que alguien se vaya — y es la
    // más silenciosa, porque el cliente que deja de recibir no se queja: se
    // va. Mostrar primero lo que él tiene que corregir, mientras le debemos
    // sesiones, es mirar para el lado equivocado.
    color = 'amarillo';
    porque = `Al día, pero hace ${diasSinUna} días que no tiene una sesión. Se le está cayendo el acompañamiento.`;
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

  // Si hoy el soporte está cerrado, el equipo tiene que saberlo antes de
  // escribirle: su mensaje va a esperar. No cambia el color —el problema del
  // cliente sigue ahí— pero cambia qué puede hacer hoy quien lo lee.
  if (cerrado && color !== 'verde') {
    porque += ` Hoy no hay soporte: se responde desde el ${enPalabras(vuelveElSoporte(cerrado))}.`;
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
    diasSinSesion: diasSinUna,
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
