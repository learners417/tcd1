import { db } from './supabase';
import { semanaISO } from './bitacoraCampana';
import { cargarSemana } from './mesaPlataStorage';
import { SEMANA_VACIA, type NumerosSemana } from './valueChain';

/**
 * LOS TRES NÚMEROS DEL VIERNES, EN LA BASE.
 *
 * ═══ EL AGUJERO QUE CIERRA ═══
 *
 * El cliente tiene DOS tableros en la misma pantalla de Hoy.
 *
 * `TableroDeLaSemana` lee la base: seis números y la frase que dice dónde se
 * corta. `TableroNumeros` —la matemática de los 10— le pide los tres números
 * el viernes, lo diagnostica y lo guarda **solo en el navegador**.
 *
 * Nunca se tocaron. O sea que el cliente cargaba sus tres números el viernes
 * y, dos tarjetas más arriba, la app le seguía diciendo «todavía no cargaste
 * tus números». La cola del equipo lo marcaba sin datos, el cron le mandaba
 * el aviso de que faltaban, y su cuenta de «X de 10» se iba a cero el día que
 * abría la app en el teléfono.
 *
 * Y no era por falta de cañería: la migración `20261021_sus_numeros_son_suyos`
 * abrió la tabla y el RPC **exactamente para esto** —«ahora cada uno lee y
 * carga los suyos»— y este tablero, que es el que se lo pide, nunca se cableó.
 *
 * ═══ POR QUÉ HAY QUE FUSIONAR Y NO ESCRIBIR ═══
 *
 * `guardar_semana_cliente` es un UPSERT que pisa **las veintiuna columnas**
 * con lo que venga en el JSON, y lo que no venga entra en cero por el
 * `coalesce`. Así que escribir tres números borra los otros dieciocho: el
 * gasto que cargó en el Constructor, lo facturado y lo cobrado que anotó Lupe
 * en la Mesa de plata, las agendas del tablero de cupos.
 *
 * Por eso todo lo que escribe acá pasa primero por `fusionar`: se trae la
 * semana que está, se le encima lo que esta pantalla sabe, y se devuelve la
 * fila entera. Nadie escribe campos sueltos contra ese RPC.
 */

/** Los tres que pide el viernes, con los nombres de la cadena. */
export const LOS_TRES = ['conversaciones', 'llamadasTomadas', 'ventas'] as const;
export type LosTres = Pick<NumerosSemana, (typeof LOS_TRES)[number]>;

const sano = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : 0;
};

/**
 * La semana de la base con lo nuevo encima. PURA, y por eso se puede probar.
 *
 * `base` en null es la primera carga de esa semana: se parte de la fila vacía,
 * no de un objeto a medias, para que ninguna columna llegue como `undefined`
 * —que en el RPC es lo mismo que cero, pero sin que nadie lo haya decidido.
 */
export function fusionar(
  base: NumerosSemana | null,
  parcial: Partial<NumerosSemana>,
): NumerosSemana {
  const salida: NumerosSemana = { ...SEMANA_VACIA, ...(base ?? {}) };
  for (const [k, v] of Object.entries(parcial)) {
    if (v === undefined || v === null) continue;
    (salida as unknown as Record<string, number>)[k] = sano(v);
  }
  return salida;
}

/**
 * Escribe la semana fusionada.
 *
 * No lanza: el cliente ya vio su número guardado en el espejo local, y
 * cortarle la pantalla por un problema de red sería peor que no subirlo.
 * Devuelve si llegó, para que quien llama pueda avisar.
 */
export async function guardarFusionado(
  clienteId: string | undefined,
  parcial: Partial<NumerosSemana>,
  semana = semanaISO(),
): Promise<boolean> {
  if (!clienteId) return false;
  try {
    const actual = await cargarSemana(clienteId, semana);
    const numeros = fusionar(actual?.numeros ?? null, parcial);
    const { error } = await db().rpc('guardar_semana_cliente', {
      p_cliente_id: clienteId,
      p_semana_iso: semana,
      p_datos: { ...numeros, objetivo: actual?.objetivo ?? 'mensajes' },
    });
    if (error) {
      // Que no se lo coma el silencio: éste es el que estuvo ciego.
      console.error('[losDiez] no se pudieron guardar los números:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('[losDiez] excepción guardando los números:', e);
    return false;
  }
}

/** Los tres de esta semana, como están en la base. null = no hay fila. */
export async function leerLosTres(
  clienteId: string | undefined,
  semana = semanaISO(),
): Promise<LosTres | null> {
  if (!clienteId) return null;
  try {
    const s = await cargarSemana(clienteId, semana);
    if (!s) return null;
    return {
      conversaciones: s.numeros.conversaciones,
      llamadasTomadas: s.numeros.llamadasTomadas,
      ventas: s.numeros.ventas,
    };
  } catch { return null; }
}

/**
 * Cuántos consultantes lleva vendidos, sumando todas sus semanas.
 *
 * Esto es lo que decía «X de 10» leyendo el navegador: en otro dispositivo
 * arrancaba de cero y la cadena que le mostraba era la de los diez enteros,
 * con seis ya hechos.
 */
export async function ventasAcumuladas(
  clienteId: string | undefined,
  cuantas = 26,
): Promise<number | null> {
  if (!clienteId) return null;
  try {
    const { data, error } = await db()
      .from('sala_metricas_semana')
      .select('ventas')
      .eq('cliente_id', clienteId)
      .is('anuncio', null)
      .order('semana_iso', { ascending: false })
      .limit(cuantas);
    if (error || !data) return null;
    return (data as Array<{ ventas: number | null }>)
      .reduce((t, f) => t + sano(f.ventas), 0);
  } catch { return null; }
}
