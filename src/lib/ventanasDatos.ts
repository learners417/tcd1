/**
 * LAS VENTANAS SIN SOPORTE, EN LA BASE — leerlas, ponerlas y levantarlas.
 *
 * El cálculo vive en ventanaSinSoporte.ts, que no sabe nada de Supabase para
 * poder probarse solo. Este archivo es el puente.
 *
 * La tabla se sigue llamando `pausas_globales` por historia: es la misma, con
 * las mismas columnas, y renombrarla obligaría a una migración que no agrega
 * nada. Lo que cambió no es dónde se guarda: es qué hace la app con eso.
 *
 * Sin base (modo sin conexión) la app sigue andando: se guardan en el
 * navegador, así el aviso del cliente no desaparece por un rato sin señal.
 */
import { supabase, isSupabaseReady } from './supabase';
import { fijarVentanas, hoyISO, type VentanaSinSoporte } from './ventanaSinSoporte';

const CLAVE_LOCAL = 'tcd_pausas_globales_v1';

function guardadasEnElNavegador(): VentanaSinSoporte[] {
  try {
    const crudo = localStorage.getItem(CLAVE_LOCAL);
    const lista = crudo ? JSON.parse(crudo) : [];
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

function dejarEnElNavegador(ventanas: VentanaSinSoporte[]): void {
  try {
    localStorage.setItem(CLAVE_LOCAL, JSON.stringify(ventanas));
  } catch {
    /* sin espacio o en modo privado: no pasa nada */
  }
}

/** Trae las ventanas y las deja a mano de toda la app. */
export async function cargarVentanas(): Promise<VentanaSinSoporte[]> {
  if (isSupabaseReady() && supabase) {
    const { data, error } = await supabase
      .from('pausas_globales')
      .select('id, desde, hasta, motivo, creada_por')
      .order('desde', { ascending: true });
    if (!error && data) {
      const ventanas = data as VentanaSinSoporte[];
      fijarVentanas(ventanas);
      dejarEnElNavegador(ventanas);
      return ventanas;
    }
  }
  const locales = guardadasEnElNavegador();
  fijarVentanas(locales);
  return locales;
}

/** Cierra el soporte en un tramo de días. Devuelve la lista ya actualizada. */
export async function cerrarSoporte(
  desde: string,
  hasta: string,
  quien: string,
  motivo?: string,
): Promise<VentanaSinSoporte[]> {
  if (isSupabaseReady() && supabase) {
    await supabase.from('pausas_globales').insert({
      desde, hasta, motivo: motivo ?? null, creada_por: quien,
    });
    return cargarVentanas();
  }
  const ventanas = [...guardadasEnElNavegador(), { desde, hasta, motivo, creada_por: quien }];
  fijarVentanas(ventanas);
  dejarEnElNavegador(ventanas);
  return ventanas;
}

/**
 * Reabre el soporte antes de tiempo: la ventana se corta ayer.
 *
 * Los días que ya pasaron siguen estando avisados —el cliente de verdad no
 * tuvo respuesta esos días, y el semáforo no debe acusar al equipo por ellos—
 * y desde hoy se vuelve a responder. Si todavía no había empezado, se borra.
 */
export async function reabrirSoporte(
  v: VentanaSinSoporte,
  hoy: string = hoyISO(),
): Promise<VentanaSinSoporte[]> {
  const [y, m, d] = hoy.split('-').map(Number);
  const f = new Date(y, m - 1, d);
  f.setDate(f.getDate() - 1);
  const ayer = `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`;
  const noEmpezo = v.desde > ayer;

  if (isSupabaseReady() && supabase && v.id) {
    if (noEmpezo) await supabase.from('pausas_globales').delete().eq('id', v.id);
    else await supabase.from('pausas_globales').update({ hasta: ayer }).eq('id', v.id);
    return cargarVentanas();
  }

  const ventanas = guardadasEnElNavegador()
    .filter((x) => !(noEmpezo && x.desde === v.desde && x.hasta === v.hasta))
    .map((x) => (x.desde === v.desde && x.hasta === v.hasta ? { ...x, hasta: ayer } : x));
  fijarVentanas(ventanas);
  dejarEnElNavegador(ventanas);
  return ventanas;
}
