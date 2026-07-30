import { db } from './supabase';
import { semanaISO } from './bitacoraCampana';

/**
 * QUE LOS NÚMEROS DEL CLIENTE LLEGUEN AL EQUIPO.
 *
 * ═══ EL AGUJERO QUE CIERRA ═══
 *
 * El tablero del cliente guardaba sus números **solo en el navegador**. Y la
 * cola del equipo lee de la base.
 *
 * O sea que **el cliente podía cargar sus números todas las semanas y la cola
 * de Lupe quedaba ciega igual** — mostrando «todo bien» sobre una cuenta de la
 * que no sabía nada. Ese era el mismo agujero que resolvimos con la carga
 * compartida, pero del lado del cliente nunca se cableó.
 *
 * Es la peor forma de fallar: el cliente hizo su parte y el sistema no se
 * enteró.
 */

/**
 * La forma que usa el tablero.
 *
 * Se acepta con campos opcionales a propósito: este archivo NO define la forma
 * —la define el tablero— y duplicar el tipo terminaría en dos que se separan.
 * Lo único que hace falta acá es poder leer cuatro campos si están.
 */
interface FilaAnuncio {
  gasto?: string;
  visitas?: string;
  conversaciones?: string;
  agendas?: string;
}

const num = (v: string | undefined) => {
  const n = Number(String(v ?? '').replace(',', '.'));
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

/**
 * Sube la semana cargada por el cliente.
 *
 * Suma los tres anuncios: la cadena de valor mira la campaña entera, no cada
 * pieza. La comparación entre piezas la hace la bitácora, que es otra cosa.
 *
 * No lanza si falla: el cliente ya vio su número guardado localmente y
 * cortarle la pantalla por un problema de red sería peor. Devuelve si llegó,
 * para que quien lo llama pueda avisar.
 */
export async function subirNumerosDelCliente(
  clienteId: string | undefined,
  filas: FilaAnuncio[],
): Promise<boolean> {
  if (!clienteId || filas.length === 0) return false;

  const suma = (campo: keyof FilaAnuncio) =>
    filas.reduce((t, f) => t + num(f[campo]), 0);

  try {
    const { error } = await db().rpc('guardar_semana_cliente', {
      p_cliente: clienteId,
      p_semana: semanaISO(),
      p_datos: {
        gasto: suma('gasto'),
        conversaciones: suma('conversaciones'),
        agendas: suma('agendas'),
        // `visitas` es lo que el tablero llama a los comentarios del anuncio.
        comentarios: suma('visitas'),
      },
    });
    return !error;
  } catch {
    return false;
  }
}

// ── El brief y los anuncios generados ──────────────────────────────────────

/**
 * Lo que el cliente construyó en el Constructor.
 *
 * ═══ POR QUÉ ESTO TAMBIÉN ═══
 *
 * El brief y los anuncios generados vivían **solo en el navegador**. Y a
 * diferencia de un número, que se puede volver a cargar en treinta segundos,
 * **estas piezas las pagó con créditos**. Perderlas es perder algo que costó
 * dinero, y volver a generarlas cuesta dinero otra vez.
 *
 * Se guarda en la misma tabla que las respuestas de las sesiones: es lo mismo
 * —trabajo del cliente que no se puede reponer solo— y tener dos tablas para
 * la misma idea termina en dos comportamientos distintos.
 */
export async function guardarTrabajoDeCampanas(
  clienteId: string | undefined,
  que: 'brief' | 'anuncios',
  contenido: unknown,
): Promise<boolean> {
  if (!clienteId) return false;
  try {
    const { error } = await db().rpc('guardar_respuestas', {
      p_cliente: clienteId,
      // Con prefijo para no chocar con los códigos de sesión, que son P0.1 y
      // parecidos: si compartieran espacio, un brief podría pisar una sesión.
      p_meta: `campanas:${que}`,
      p_estado: { contenido },
    });
    return !error;
  } catch { return false; }
}

/** Lo que había guardado, para retomarlo en cualquier dispositivo. */
export async function leerTrabajoDeCampanas(
  clienteId: string | undefined,
  que: 'brief' | 'anuncios',
): Promise<unknown | null> {
  if (!clienteId) return null;
  try {
    const { data, error } = await db()
      .from('sesion_respuestas')
      .select('estado')
      .eq('cliente_id', clienteId)
      .eq('meta_codigo', `campanas:${que}`)
      .maybeSingle();
    if (error || !data) return null;
    return (data as { estado: { contenido?: unknown } }).estado?.contenido ?? null;
  } catch { return null; }
}
