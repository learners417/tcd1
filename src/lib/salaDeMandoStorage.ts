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

