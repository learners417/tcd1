import { db } from './supabase';
import { mensajesQueEsperan, saludDelSoporte, type MensajeSinResponder } from './soporte';
import { desdeElSoporte } from './cerebro';
import { crearDesdeElSistema } from './cerebroStorage';

/**
 * EL RELOJ DEL SOPORTE, CONECTADO.
 *
 * El modelo estaba probado y sin usar: un mensaje sin responder **no aparecía
 * en ningún lado**. Podía quedar tres días esperando sin que la cola, la
 * supervisión ni el marcador lo señalaran.
 *
 * En un producto de miles, tres días de silencio es la diferencia entre un
 * cliente y un reembolso.
 */

interface FilaMensaje {
  id: string;
  emisor_id: string;
  contenido: string;
  created_at: string;
  respondido?: boolean;
  tipo?: string;
}

/**
 * Los mensajes que esperan respuesta, con su reloj.
 *
 * Un mensaje está respondido si **el equipo escribió después de él** en la
 * misma conversación. No hace falta marcar nada a mano: marcar es una tarea
 * más que alguien olvida, y entonces el reloj miente.
 */
export async function mensajesEsperando(
  clientes: Array<{ id: string; nombre: string }>,
): Promise<MensajeSinResponder[]> {
  if (clientes.length === 0) return [];
  try {
    const { data, error } = await db()
      .from('mensajes')
      .select('id, emisor_id, receptor_id, contenido, created_at, tipo')
      .in('emisor_id', clientes.map((c) => c.id))
      .order('created_at', { ascending: false })
      .limit(200);

    if (error || !data) return [];

    const filas = data as unknown as Array<FilaMensaje & { receptor_id: string }>;
    // El último mensaje de cada cliente. Si lo último lo escribió él, espera.
    const ultimoDe = new Map<string, FilaMensaje>();
    for (const m of filas) {
      if (!ultimoDe.has(m.emisor_id)) ultimoDe.set(m.emisor_id, m);
    }

    const { data: respuestas } = await db()
      .from('mensajes')
      .select('receptor_id, created_at')
      .in('receptor_id', clientes.map((c) => c.id))
      .order('created_at', { ascending: false })
      .limit(200);

    const ultimaRespuesta = new Map<string, string>();
    for (const r of (respuestas ?? []) as unknown as Array<{ receptor_id: string; created_at: string }>) {
      if (!ultimaRespuesta.has(r.receptor_id)) ultimaRespuesta.set(r.receptor_id, r.created_at);
    }

    return mensajesQueEsperan(
      [...ultimoDe.values()].map((m) => {
        const resp = ultimaRespuesta.get(m.emisor_id);
        return {
          id: m.id,
          clienteId: m.emisor_id,
          nombre: clientes.find((c) => c.id === m.emisor_id)?.nombre ?? 'Cliente',
          tipo: m.tipo === 'roto' ? ('roto' as const) : ('duda' as const),
          texto: m.contenido,
          creadoEn: m.created_at,
          // Respondido = alguien del equipo escribió DESPUÉS.
          respondido: !!resp && resp > m.created_at,
        };
      }),
    );
  } catch { return []; }
}

/**
 * Convierte los que esperan en tareas reales.
 *
 * Se hace acá y no en la pantalla porque **una tarea tiene que existir aunque
 * nadie abra la pantalla**: si solo apareciera al mirar, el que no mira nunca
 * se entera — que es justo el problema.
 */
export async function crearTareasDeSoporte(
  esperando: MensajeSinResponder[],
  asignarA: string,
): Promise<number> {
  let creadas = 0;
  for (const m of esperando) {
    const t = desdeElSoporte({
      clienteId: m.clienteId, nombre: m.nombre, mensajeId: m.id,
      texto: m.texto, horas: m.horas, vencido: m.vencido,
      esRoto: m.tipo === 'roto',
    });
    if (await crearDesdeElSistema(t, asignarA)) creadas++;
  }
  return creadas;
}

/** Cómo viene el soporte, para el marcador de la semana. */
export async function saludDeEstaSemana(
  clientes: Array<{ id: string; nombre: string }>,
): Promise<ReturnType<typeof saludDelSoporte>> {
  const esperando = await mensajesEsperando(clientes);
  // Los respondidos a tiempo se cuentan aparte cuando exista el histórico;
  // por ahora la salud se calcula sobre lo que está esperando, que es lo que
  // se puede hacer algo al respecto.
  return saludDelSoporte({ esperando, respondidosATiempo: 0, respondidosTarde: 0 });
}
