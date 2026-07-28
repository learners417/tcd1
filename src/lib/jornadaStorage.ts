import { db } from './supabase';
import type { Jornada } from './jornada';

/**
 * Las consultas de la jornada.
 *
 * Vive aparte de jornada.ts por la regla que ya mordió tres veces: **la
 * lógica que hay que probar no vive en el archivo que habla con la base.**
 * Importar supabase arrastra `import.meta.env`, y ninguna prueba puede
 * siquiera cargar el archivo.
 */

interface FilaJornada {
  persona_id: string;
  dia: string;
  inicio: string;
  fin: string | null;
  planeados: string[] | null;
  atendidos: string[] | null;
  traba: string | null;
  traba_cliente: string | null;
}

const aJornada = (f: FilaJornada): Jornada => ({
  personaId: f.persona_id,
  dia: f.dia,
  inicio: f.inicio,
  fin: f.fin ?? undefined,
  planeados: f.planeados ?? [],
  cerradas: [],
  atendidos: f.atendidos ?? [],
  traba: f.traba ?? undefined,
  trabaCliente: f.traba_cliente ?? undefined,
});

/** Abre el día. Si ya estaba abierto, actualiza lo planeado. */
export async function abrirJornada(
  personaId: string,
  planeados: string[],
): Promise<void> {
  const { error } = await db().rpc('abrir_jornada', {
    p_persona: personaId,
    p_planeados: planeados,
  });
  if (error) throw new Error(error.message);
}

/** Cierra el día con lo atendido y la traba, si la hubo. */
export async function cerrarJornadaEnBase(
  personaId: string,
  x: { atendidos: string[]; traba?: string; trabaCliente?: string },
): Promise<void> {
  const { error } = await db().rpc('cerrar_jornada', {
    p_persona: personaId,
    p_atendidos: x.atendidos,
    p_traba: x.traba ?? null,
    p_traba_cliente: x.trabaCliente ?? null,
  });
  if (error) throw new Error(error.message);
}

/**
 * Las jornadas de los últimos días, de todo el equipo.
 *
 * Es lo que hace que la lista de trabas del viernes tenga sentido: si cada
 * uno viera solo las suyas, no habría forma de notar que la misma traba le
 * pasó a tres personas.
 */
export async function jornadasRecientes(dias = 7): Promise<Jornada[]> {
  const { data, error } = await db().rpc('jornadas_recientes', { p_dias: dias });
  if (error || !data) return [];
  return (data as unknown as FilaJornada[]).map(aJornada);
}

/** La jornada de hoy de esta persona, si la abrió. */
export async function jornadaDeHoy(personaId: string): Promise<Jornada | null> {
  const { data, error } = await db()
    .from('jornadas')
    .select('persona_id, dia, inicio, fin, planeados, atendidos, traba, traba_cliente')
    .eq('persona_id', personaId)
    .eq('dia', new Date().toISOString().slice(0, 10))
    .maybeSingle();
  if (error || !data) return null;
  return aJornada(data as unknown as FilaJornada);
}
