import { db } from './supabase';
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
export async function listarDecisiones(soloVigentes = true): Promise<Decision[]> {
  let q = db().from('sala_decisiones')
    .select('id, titulo, criterio, contexto, decidida_en, vigente, cliente_id')
    .order('decidida_en', { ascending: false });
  if (soloVigentes) q = q.eq('vigente', true);
  const { data, error } = await q;
  if (error || !data) return [];
  return data as unknown as Decision[];
}

export async function guardarDecision(d: {
  titulo: string; criterio?: string; contexto?: string; clienteId?: string | null;
}): Promise<void> {
  const { error } = await db().from('sala_decisiones').insert({
    titulo: d.titulo,
    criterio: d.criterio ?? null,
    contexto: d.contexto ?? null,
    cliente_id: d.clienteId ?? null,
    decidida_en: new Date().toISOString(),
    vigente: true,
  });
  if (error) throw new Error(error.message);
}

/** Una decisión no se borra: se deja de aplicar. La historia importa. */
export async function derogarDecision(id: string): Promise<void> {
  const { error } = await db().from('sala_decisiones').update({ vigente: false }).eq('id', id);
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
      campana_desde: new Date().toISOString().slice(0, 10),
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
