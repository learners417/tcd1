import { db } from './supabase';
import { hoyISO } from './diaPrograma';
import type { Decision } from './salaDeMando';

/**
 * Las consultas de la Sala de Mando.
 *
 * Vive aparte de salaDeMando.ts a propósito: ese archivo tiene la lógica —las
 * nueve etapas, quién está frenado, el veredicto del motor— y tiene que poder
 * probarse sin levantar medio sistema. Importar supabase arrastra
 * `import.meta.env`, que no existe fuera del navegador, y la prueba no puede
 * ni cargar el archivo.
 */

/** Mueve un cliente de etapa. Guarda desde cuándo, para poder medir el atraso. */
export async function moverDeEtapa(clienteId: string, etapa: number): Promise<void> {
  const { error } = await db()
    .from('profiles')
    .update({ etapa_actual: etapa, etapa_desde: new Date().toISOString() })
    .eq('id', clienteId);
  if (error) throw new Error(error.message);
}


/**
 * El registro de lo que se decidió.
 *
 * Existe porque el criterio que no se escribe se vuelve a discutir. Y cada
 * vez que se vuelve a discutir, alguien tiene que estar presente para
 * decidirlo otra vez — que es exactamente lo que la Sala existe para evitar.
 */
/**
 * LOS NOMBRES DE LA TABLA NO SON LOS DEL TIPO, Y ESO SE TRADUCE ACÁ.
 *
 * `sala_decisiones` la crea `sala-de-mando.sql` con `texto`, `motivo`,
 * `estado` y `created_at`. El código pedía `titulo`, `criterio`, `vigente` y
 * `decidida_en`: cinco columnas que no existen en ninguna parte. PostgREST no
 * ignora la columna que no conoce —contesta 400 con 42703 y la sentencia
 * entera no corre—, así que el panel «Decisiones» salía vacío por su propio
 * `return []` y guardar una decisión tiraba el error del motor en la cara.
 * Medido el 17 de noviembre.
 *
 * Se traduce acá con los alias de PostgREST y no se renombra la tabla: las
 * filas que ya están cargadas en la base de Javo hablan el idioma de la
 * tabla, y la pantalla habla el del tipo `Decision`. `contexto` es la única
 * que no tenía equivalente y se agrega por migración.
 */
const COLUMNAS_DECISION =
  'id, titulo:texto, criterio:motivo, contexto, decidida_en:created_at, cliente_id, estado';

/** `estado` es una lista cerrada de tres; la pantalla solo quiere un booleano. */
const VIGENTE = 'vigente';
const DEROGADA = 'revertida';

export async function listarDecisiones(soloVigentes = true): Promise<Decision[]> {
  let q = db().from('sala_decisiones')
    .select(COLUMNAS_DECISION)
    .order('created_at', { ascending: false });
  if (soloVigentes) q = q.eq('estado', VIGENTE);
  const { data, error } = await q;
  if (error || !data) return [];
  return (data as unknown as Array<Omit<Decision, 'vigente'> & { estado: string | null }>)
    .map(({ estado, ...resto }) => ({ ...resto, vigente: estado === VIGENTE }));
}

export async function guardarDecision(d: {
  titulo: string; criterio?: string; contexto?: string; clienteId?: string | null;
}): Promise<void> {
  const { error } = await db().from('sala_decisiones').insert({
    texto: d.titulo,
    motivo: d.criterio ?? null,
    contexto: d.contexto ?? null,
    cliente_id: d.clienteId ?? null,
    estado: VIGENTE,
    // `created_at` y `fecha` los pone la base por defecto: la hora de la
    // decisión es cuando se guarda, no cuando el navegador cree que es.
  });
  if (error) throw new Error(error.message);
}

/** Una decisión no se borra: se deja de aplicar. La historia importa. */
export async function derogarDecision(id: string): Promise<void> {
  const { error } = await db().from('sala_decisiones')
    .update({ estado: DEROGADA }).eq('id', id);
  if (error) throw new Error(error.message);
}


// ── Encender y pausar la campaña ───────────────────────────────────────────

/**
 * Marca que la campaña de un cliente está corriendo desde hoy.
 *
 * Sin esto, `situacionDe` nunca recibe una fecha y TODOS quedan como
 * «instalando» para siempre — el diagnóstico de campaña no se activa nunca y
 * la ficha abre siempre en Activación. El modelo estaba construido y suelto.
 */
export async function marcarEncendida(clienteId: string): Promise<void> {
  const { error } = await db()
    .from('profiles')
    .update({
      campana_desde: hoyISO(),
      campana_pausada: false,
    })
    .eq('id', clienteId);
  if (error) throw new Error(error.message);
}

/**
 * Pausa la campaña sin borrar desde cuándo estuvo al aire.
 *
 * Se conserva la fecha a propósito: al reanudar, saber que ya estuvo veinte
 * días corriendo cambia el diagnóstico — no es una campaña nueva que necesita
 * su período de medición.
 */
export async function marcarPausada(clienteId: string, pausada: boolean): Promise<void> {
  const { error } = await db()
    .from('profiles')
    .update({ campana_pausada: pausada })
    .eq('id', clienteId);
  if (error) throw new Error(error.message);
}

/** Los mercados donde corre la pauta. No es donde vive el sanador. */
export async function guardarMercados(
  clienteId: string,
  mercados: string[],
): Promise<void> {
  const { error } = await db()
    .from('profiles')
    .update({ mercados })
    .eq('id', clienteId);
  if (error) throw new Error(error.message);
}
