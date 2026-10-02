/**
 * LAS PAUSAS, EN LA BASE — leerlas, ponerlas y levantarlas.
 *
 * El cálculo vive en pausaGlobal.ts, que no sabe nada de Supabase para poder
 * probarse solo. Este archivo es el puente: trae las pausas al abrir la app y
 * las deja a mano de todas las pantallas.
 *
 * Sin base (modo sin conexión) la app sigue andando: se guardan en el
 * navegador, así el cartel del cliente no desaparece por un rato sin señal.
 */
import { supabase, isSupabaseReady } from './supabase';
import { fijarPausas, hoyISO, type PausaGlobal } from './pausaGlobal';

export const CLAVE_LOCAL = 'tcd_pausas_globales_v1';

function guardadasEnElNavegador(): PausaGlobal[] {
  try {
    const crudo = localStorage.getItem(CLAVE_LOCAL);
    const lista = crudo ? JSON.parse(crudo) : [];
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

function dejarEnElNavegador(pausas: PausaGlobal[]): void {
  try {
    localStorage.setItem(CLAVE_LOCAL, JSON.stringify(pausas));
  } catch {
    /* sin espacio o en modo privado: no pasa nada */
  }
}

/** Trae las pausas y las deja a mano de toda la app. */
export async function cargarPausas(): Promise<PausaGlobal[]> {
  if (isSupabaseReady() && supabase) {
    const { data, error } = await supabase
      .from('pausas_globales')
      .select('id, desde, hasta, motivo, creada_por')
      .order('desde', { ascending: true });
    if (!error && data) {
      const pausas = data as PausaGlobal[];
      fijarPausas(pausas);
      dejarEnElNavegador(pausas);
      return pausas;
    }
  }
  const locales = guardadasEnElNavegador();
  fijarPausas(locales);
  return locales;
}

/** Pone una pausa nueva para todos. Devuelve la lista ya actualizada. */
export async function ponerPausa(
  desde: string,
  hasta: string,
  quien: string,
  motivo?: string,
): Promise<PausaGlobal[]> {
  if (isSupabaseReady() && supabase) {
    await supabase.from('pausas_globales').insert({
      desde,
      hasta,
      motivo: motivo ?? null,
      creada_por: quien,
    });
    return cargarPausas();
  }
  const pausas = [...guardadasEnElNavegador(), { desde, hasta, motivo, creada_por: quien }];
  fijarPausas(pausas);
  dejarEnElNavegador(pausas);
  return pausas;
}

/**
 * Levanta la pausa antes de tiempo: la corta en el día de ayer, así lo que ya
 * se corrió queda corrido y desde hoy el Camino vuelve a andar.
 *
 * Si todavía no había empezado, se borra entera.
 */
export async function levantarPausa(p: PausaGlobal, hoy: string = hoyISO()): Promise<PausaGlobal[]> {
  const ayer = (() => {
    const [y, m, d] = hoy.split('-').map(Number);
    const f = new Date(y, m - 1, d);
    f.setDate(f.getDate() - 1);
    return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`;
  })();
  const noEmpezó = p.desde > ayer;

  if (isSupabaseReady() && supabase && p.id) {
    if (noEmpezó) await supabase.from('pausas_globales').delete().eq('id', p.id);
    else await supabase.from('pausas_globales').update({ hasta: ayer }).eq('id', p.id);
    return cargarPausas();
  }

  const pausas = guardadasEnElNavegador()
    .filter((x) => !(noEmpezó && x.desde === p.desde && x.hasta === p.hasta))
    .map((x) => (x.desde === p.desde && x.hasta === p.hasta ? { ...x, hasta: ayer } : x));
  fijarPausas(pausas);
  dejarEnElNavegador(pausas);
  return pausas;
}
