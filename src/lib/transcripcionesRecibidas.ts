/**
 * LA COLA DE LO QUE LLEGÓ Y NADIE REVISÓ — turno 14
 *
 * El webhook de Fathom deja las transcripciones acá; esto las trae a la
 * pantalla donde una persona las revisa. Sin esta mitad, la ruta sería una
 * tabla que se llena y que nadie mira — que es justo la clase de cosa que
 * este mapa viene encontrando turno tras turno: algo que se daba por andando
 * y estaba ciego.
 */
import { supabase, isSupabaseReady } from './supabase';

/** El mismo portón que el resto de las libs: sin base, no hay consulta. */
function db() {
  return isSupabaseReady() ? supabase : null;
}

export interface TranscripcionRecibida {
  id: string;
  origen: string;
  titulo: string | null;
  fecha: string;
  minutos: number | null;
  enlace: string | null;
  quien_la_dio: string | null;
  transcripcion: string;
  participantes: Array<{ nombre?: string; email?: string; deAfuera?: boolean }>;
  cliente_id: string | null;
  email_detectado: string | null;
  estado: 'pendiente' | 'cargada' | 'descartada';
}

const COLUMNAS =
  'id, origen, titulo, fecha, minutos, enlace, quien_la_dio, transcripcion, '
  + 'participantes, cliente_id, email_detectado, estado';

/**
 * Las que esperan revisión, de la más nueva a la más vieja.
 *
 * ═══ `null` ES «NO PUDE CONSULTAR», NO «NO HAY NINGUNA» ═══
 *
 * La misma distinción que `sesionesDe` tuvo que aprender a los golpes: un
 * arreglo vacío devuelto cuando la consulta falló se lee en pantalla como un
 * hecho —«no llegó nada»— y nadie va a buscar la sesión que sí llegó. Con
 * `null` la pantalla puede callarse en lugar de afirmar.
 *
 * Y la tabla puede no existir todavía: la migración la corre Javo. Eso
 * tampoco es «no hay ninguna».
 */
export async function pendientesDeRevisar(): Promise<TranscripcionRecibida[] | null> {
  const s = db();
  if (!s) return null;
  const { data, error } = await s
    .from('transcripciones_recibidas')
    .select(COLUMNAS)
    .eq('estado', 'pendiente')
    .order('fecha', { ascending: false })
    .limit(30);
  if (error || !data) return null;
  return data as unknown as TranscripcionRecibida[];
}

/** Quién la está revisando, si se puede saber. */
async function quienRevisa(): Promise<string | null> {
  try {
    const s = db();
    if (!s) return null;
    const { data } = await s.auth.getUser();
    return data?.user?.id ?? null;
  } catch {
    return null;
  }
}

/**
 * La saca de la cola.
 *
 * `cargada` = una persona la revisó y confirmó lo que salía de ella.
 * `descartada` = la miró y decidió que no era una sesión. Las dos salen de
 * la cola; ninguna se borra, porque el texto es la única copia que esta app
 * tiene de esa conversación.
 */
export async function sacarDeLaCola(
  id: string,
  estado: 'cargada' | 'descartada',
): Promise<boolean> {
  const s = db();
  if (!s || !id) return false;
  const { error } = await s
    .from('transcripciones_recibidas')
    .update({ estado, revisada_por: await quienRevisa(), revisada_el: new Date().toISOString() })
    .eq('id', id);
  return !error;
}

/** Cómo se nombra una que llegó sin cliente reconocido. */
export function deQuienEra(t: TranscripcionRecibida): string {
  if (t.cliente_id) return t.email_detectado ?? 'cliente reconocido';
  const afuera = (t.participantes ?? []).filter((p) => p.deAfuera !== false);
  const emails = (afuera.length ? afuera : (t.participantes ?? []))
    .map((p) => p.email).filter(Boolean) as string[];
  return emails.length
    ? `sin reconocer — ${emails.slice(0, 2).join(', ')}`
    : 'sin reconocer';
}
