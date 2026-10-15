/**
 * EL VEREDICTO DE CADA EVIDENCIA — quién lo dictó y si cuenta.
 *
 * ═══ EL AGUJERO QUE CIERRA ═══
 *
 * El testigo —la visión IA— ya miraba la foto. Su respuesta vivía en un
 * `useState` de la pantalla de la tarea, y el archivo rechazado quedaba en
 * Storage. `listarEvidencias` cuenta los archivos de la carpeta.
 *
 * Entonces el cliente subía la foto equivocada, la IA la rechazaba, la
 * pantalla le pedía otra, él recargaba, y la jornada se destrababa con la
 * foto que la IA había rechazado.
 *
 * ═══ LA REGLA DE LA PUERTA ═══
 *
 * ▸ `aprobada`   cuenta.
 * ▸ `pendiente`  cuenta también. Es lo que la IA no mira —el audio, el video,
 *                el PDF— y lo que espera a una persona. Que el cliente quede
 *                trabado hasta que alguien abra el Admin convierte el método
 *                en una sala de espera.
 * ▸ `rechazada`  no cuenta. Es la única que frena.
 * ▸ sin fila     cuenta. Son las evidencias que ya estaban subidas antes de
 *                esta tabla: nadie pierde lo que ya tenía hecho.
 */
import { supabase, isSupabaseReady } from './supabase';

export type EstadoEvidencia = 'aprobada' | 'pendiente' | 'rechazada';

export interface Veredicto {
  archivo: string;
  clienteId: string;
  metaCodigo: string;
  estado: EstadoEvidencia;
  /** 'ia' o 'equipo': quién lo dictó. */
  quien: 'ia' | 'equipo';
  motivo: string;
  decididoEn: string;
}

/** El estado de una evidencia frena la jornada solo si está rechazada. */
export function cuenta(estado: EstadoEvidencia | null | undefined): boolean {
  return estado !== 'rechazada';
}

/** Lo que el cliente lee cuando el veredicto frena su jornada. */
export function loQueDiceElVeredicto(v: Veredicto | null | undefined): string {
  if (!v || v.estado !== 'rechazada') return '';
  const motivo = v.motivo?.trim();
  const base = v.quien === 'equipo'
    ? 'La revisamos y necesita otra foto'
    : 'Tu testigo no pudo confirmarla';
  return motivo ? `${base}: ${motivo}` : `${base}.`;
}

/** Los veredictos de esa meta, por path de archivo. */
export async function veredictosDe(
  clienteId: string,
  metaCodigo: string,
): Promise<Map<string, Veredicto>> {
  const vacio = new Map<string, Veredicto>();
  if (!isSupabaseReady() || !supabase || !clienteId) return vacio;
  const { data, error } = await supabase
    .from('evidencia_veredictos')
    .select('archivo, cliente_id, meta_codigo, estado, quien, motivo, decidido_en')
    .eq('cliente_id', clienteId)
    .eq('meta_codigo', metaCodigo);
  if (error || !data) return vacio;
  return new Map(
    (data as Array<Record<string, unknown>>).map((f) => [
      String(f.archivo),
      {
        archivo: String(f.archivo),
        clienteId: String(f.cliente_id),
        metaCodigo: String(f.meta_codigo),
        estado: String(f.estado) as EstadoEvidencia,
        quien: String(f.quien) === 'equipo' ? 'equipo' : 'ia',
        motivo: String(f.motivo ?? ''),
        decididoEn: String(f.decidido_en ?? ''),
      },
    ]),
  );
}

/**
 * Todos los veredictos de un cliente, por path de archivo.
 *
 * Es lo que la ficha necesita: la pestaña muestra sus evidencias de las
 * noventa y una jornadas juntas, y pedir el veredicto meta por meta serían
 * noventa y una consultas para dibujar una pantalla.
 */
export async function veredictosDelCliente(
  clienteId: string,
): Promise<Map<string, Veredicto>> {
  const vacio = new Map<string, Veredicto>();
  if (!isSupabaseReady() || !supabase || !clienteId) return vacio;
  const { data, error } = await supabase
    .from('evidencia_veredictos')
    .select('archivo, cliente_id, meta_codigo, estado, quien, motivo, decidido_en')
    .eq('cliente_id', clienteId);
  if (error || !data) return vacio;
  return new Map(
    (data as Array<Record<string, unknown>>).map((f) => [
      String(f.archivo),
      {
        archivo: String(f.archivo),
        clienteId: String(f.cliente_id),
        metaCodigo: String(f.meta_codigo),
        estado: String(f.estado) as EstadoEvidencia,
        quien: String(f.quien) === 'equipo' ? 'equipo' : 'ia',
        motivo: String(f.motivo ?? ''),
        decididoEn: String(f.decidido_en ?? ''),
      },
    ]),
  );
}

/**
 * Cómo se lee cada estado en la pantalla del equipo.
 *
 * No se llama `comoSeLee`: ese nombre ya es de `soporteDatos`, donde contesta
 * otra pregunta —qué mandó el cliente por soporte— y las dos conviven en el
 * Admin.
 */
export function lecturaDelVeredicto(v: Veredicto | null | undefined): {
  texto: string; tono: 'bien' | 'frena' | 'espera' | 'nadie';
} {
  if (!v) return { texto: 'Nadie la juzgó', tono: 'nadie' };
  const firma = v.quien === 'equipo' ? 'el equipo' : 'el testigo';
  if (v.estado === 'aprobada') return { texto: `Aprobada por ${firma}`, tono: 'bien' };
  if (v.estado === 'rechazada') return { texto: `Rechazada por ${firma}`, tono: 'frena' };
  return { texto: 'Espera tu decisión', tono: 'espera' };
}

/**
 * Guarda lo que dictó la visión IA.
 *
 * Por el RPC y no con un insert: la tabla no deja que el cliente escriba sus
 * propios veredictos —si lo dejara, «la IA me rechazó» se volvería «yo me
 * aprobé»— y la función comprueba que el archivo esté en su carpeta.
 */
export async function guardarVeredictoIA(
  clienteId: string,
  metaCodigo: string,
  archivo: string,
  estado: EstadoEvidencia,
  motivo: string,
): Promise<boolean> {
  if (!isSupabaseReady() || !supabase) return false;
  const { error } = await supabase.rpc('guardar_veredicto_ia', {
    p_archivo: archivo,
    p_cliente_id: clienteId,
    p_meta_codigo: metaCodigo,
    p_estado: estado,
    p_motivo: motivo || null,
  });
  if (error) {
    console.error('[veredicto] no se guardó:', error.message);
    return false;
  }
  return true;
}

/**
 * Las evidencias de esa meta que cuentan para abrir la jornada.
 *
 * Esta es la función que reemplaza al conteo de archivos. Devuelve también lo
 * que frena, para que la pantalla pueda decir por qué.
 */
export async function evidenciasQueCuentan(
  clienteId: string,
  metaCodigo: string,
  archivos: Array<{ path: string }>,
): Promise<{ cuentan: number; frena: Veredicto | null }> {
  if (archivos.length === 0) return { cuentan: 0, frena: null };
  const veredictos = await veredictosDe(clienteId, metaCodigo);
  let cuentan = 0;
  let frena: Veredicto | null = null;
  for (const a of archivos) {
    const v = veredictos.get(a.path);
    if (cuenta(v?.estado)) cuentan++;
    else if (!frena || v!.decididoEn > frena.decididoEn) frena = v!;
  }
  return { cuentan, frena };
}

// ════════════════════════════════════════════════════════════════════════
//  LA COLA DEL EQUIPO
// ════════════════════════════════════════════════════════════════════════

export interface EnLaCola extends Veredicto {
  cliente: string;
  /** Si esa jornada ya cerró. Cambia la conversación, así que se muestra. */
  jornadaCerrada: boolean;
}

/** Lo que espera una decisión, de todos los clientes, en una consulta. */
export async function colaDeEvidencias(): Promise<EnLaCola[]> {
  if (!isSupabaseReady() || !supabase) return [];
  const { data, error } = await supabase.rpc('cola_de_evidencias');
  if (error || !data) {
    if (error) console.error('[veredicto] la cola no cargó:', error.message);
    return [];
  }
  return (data as Array<Record<string, unknown>>).map((f) => ({
    archivo: String(f.archivo),
    clienteId: String(f.cliente_id),
    cliente: String(f.cliente ?? 'Un cliente'),
    metaCodigo: String(f.meta_codigo),
    estado: String(f.estado) as EstadoEvidencia,
    quien: String(f.quien) === 'equipo' ? 'equipo' : 'ia',
    motivo: String(f.motivo ?? ''),
    decididoEn: String(f.decidido_en ?? ''),
    jornadaCerrada: f.jornada_cerrada === true,
  }));
}

/**
 * El equipo aprueba o confirma el rechazo. El aviso al cliente sale adentro
 * del RPC: así no existe el caso de la decisión guardada y el aviso que no
 * salió.
 */
export async function decidirEvidencia(
  archivo: string,
  estado: 'aprobada' | 'rechazada',
  motivo: string,
  /* El cliente y la meta hacen falta para decidir sobre una evidencia que la
     IA no miró: de esas no hay fila todavía. */
  clienteId?: string,
  metaCodigo?: string,
): Promise<boolean> {
  if (!isSupabaseReady() || !supabase) return false;
  const { error } = await supabase.rpc('decidir_evidencia', {
    p_archivo: archivo,
    p_estado: estado,
    p_motivo: motivo || null,
    p_cliente_id: clienteId ?? null,
    p_meta_codigo: metaCodigo ?? null,
  });
  if (error) {
    console.error('[veredicto] la decisión no se guardó:', error.message);
    return false;
  }
  return true;
}
