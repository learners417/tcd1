/**
 * PUNTO DE PARTIDA — para el cliente que ya viene con cosas hechas.
 *
 * Tus clientes actuales ya tienen método, oferta, página o campaña corriendo.
 * Entrar por el día 1 los hace abandonar en la primera semana. Acá eligen UNA
 * cosa —lo último que ya lograron— y el Camino los deja en el día que les
 * corresponde, con su cinturón ganado.
 *
 * Reglas:
 * - Una sola decisión. Nada de marcar noventa casillas.
 * - Lo que se marca es lo que YA TIENE, no lo que promete hacer.
 * - Nunca marca jornadas que dependen de que otro pague: esas se ganan.
 * - Se puede elegir "empiezo desde cero" y no pasa nada.
 *
 * Lógica pura: no toca la base ni el navegador, así se puede probar.
 */
import { CINTURONES, type Cinturon } from './cinturones';
import { esPasoDelCliente } from './diaPrograma';
import type { RoadmapPilar } from './roadmapSeed';

export interface OpcionDePartida {
  /** id del grado que ya está ganado con eso */
  id: string;
  /** Lo que el cliente ya tiene, dicho en su idioma */
  loQueYaTienes: string;
  nombreGrado: string;
  dia: number;
}

/** Lo que ya tiene, en palabras del cliente. Sale de la forma de cada grado. */
const EN_SU_IDIOMA: Record<string, string> = {
  '10gup': 'Tengo mi lugar y mi hora fija de trabajo',
  '9gup': 'Sé cuánto gano por hora, de verdad',
  '8gup': 'Ya cobré a mi precio nuevo',
  '7gup': 'Tengo mi método escrito, con sus pasos',
  '6gup': 'Tengo mi oferta completa en una página',
  '5gup': 'Mi página está publicada y se puede visitar',
  '4gup': 'Tengo mi agenda andando de punta a punta',
  '3gup': 'Tengo una campaña corriendo',
  '2gup': 'Ya me pagó alguien que no me conocía',
  '1gup': 'Mis consultantes ya entran a mi app',
  '1dan': 'Terminé el camino completo',
};

export function opcionesDePartida(): OpcionDePartida[] {
  return CINTURONES
    .filter((c) => c.orden > 1 && EN_SU_IDIOMA[c.id])
    .map((c: Cinturon & { dia?: number }) => ({
      id: c.id,
      loQueYaTienes: EN_SU_IDIOMA[c.id],
      nombreGrado: c.nombre,
      dia: c.dia ?? 1,
    }));
}

/** El día hasta el que se marca todo, según lo que el cliente ya tiene. */
export function diaDeLaOpcion(id: string): number | null {
  const c = (CINTURONES as Array<Cinturon & { dia?: number }>).find((x) => x.id === id);
  return c ? (c.dia ?? null) : null;
}

/**
 * Las jornadas que quedan marcadas al elegir una opción: todo lo del cliente
 * hasta ese día. Devuelve las claves de progreso `${pilar}-${codigo}`.
 */
export function jornadasHasta(pilares: RoadmapPilar[], dia: number): Array<{ clave: string; pilarNumero: number; codigo: string; esEstrella: boolean }> {
  const out: Array<{ clave: string; pilarNumero: number; codigo: string; esEstrella: boolean }> = [];
  for (const pilar of pilares) {
    for (const m of pilar.metas ?? []) {
      if (!esPasoDelCliente(m)) continue;              // lo del equipo no se marca
      if (m.evidencia_requerida?.del_mercado) continue; // lo que depende de que otro pague, se gana
      if ((m.dia_asignado ?? 0) > dia) continue;
      out.push({
        clave: `${pilar.numero}-${m.codigo}`,
        pilarNumero: pilar.numero,
        codigo: m.codigo,
        esEstrella: Boolean(m.es_estrella),
      });
    }
  }
  return out;
}

/** Resumen para confirmar antes de tocar nada. */
export function resumenDePartida(pilares: RoadmapPilar[], id: string): { dia: number; jornadas: number; nombreGrado: string } | null {
  const dia = diaDeLaOpcion(id);
  const opcion = opcionesDePartida().find((o) => o.id === id);
  if (dia === null || !opcion) return null;
  return { dia, jornadas: jornadasHasta(pilares, dia).length, nombreGrado: opcion.nombreGrado };
}

/**
 * La fecha de inicio que le corresponde a quien entra por el día N.
 *
 * Sin esto, un cliente que empieza hoy en el día 31 ve "vas 30 días atrás":
 * la app cuenta desde su fecha de inicio real. Al elegir su punto de partida,
 * la fecha se corre hacia atrás tantos días como trae hechos.
 */
export function fechaInicioParaDia(dia: number, hoy: Date = new Date()): string {
  const d = new Date(hoy);
  d.setDate(d.getDate() - Math.max(0, dia - 1));
  return d.toISOString().slice(0, 10);
}
