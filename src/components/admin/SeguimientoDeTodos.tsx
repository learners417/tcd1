/**
 * EL SEGUIMIENTO DE TODOS — una fila por cliente, y qué hacer con cada uno.
 *
 * ═══ EL PEDIDO, COMO LLEGÓ ═══
 *
 * «Tiene que ser más fácil para Lupe hacer el seguimiento, saber dónde está
 *  cada uno. Ella sola tiene que poder gestionar a todos los clientes.»
 *
 * ═══ QUÉ FALTABA ═══
 *
 * Había pantallas que contestaban preguntas distintas y ninguna contestaba
 * esta. El HOY muestra tareas, no clientes: si alguien no generó ninguna
 * tarea, no aparece — y el que no aparece es justamente el que se está yendo
 * en silencio. La matriz muestra 62 ítems por cliente, que sirve para saber
 * qué le falta, no para saber a quién llamar hoy.
 *
 * Esta contesta una sola: de los diez, ¿a quién tengo que ir a buscar?
 *
 * Y lo hace con lo que hasta ahora no estaba en ninguna parte: cuántas
 * mentorías seguidas se perdió. Alguien que faltó a tres encuentros seguidos
 * está por irse, y eso no se veía en ningún lado hasta que avisaba.
 *
 * ═══ POR QUÉ CADA FILA TIENE SUS BOTONES ═══
 *
 * Saber a quién hay que empujar y no poder empujarlo desde ahí es media
 * pantalla. Lupe tiene 6 horas por día para diez clientes: cada «anota el
 * nombre, sal, búscalo, ábrele el chat» son cuatro pasos que se pagan diez
 * veces por día.
 */
import { useEffect, useMemo, useState } from 'react';
import { Loader2, MessageSquare, FileText, Users } from 'lucide-react';
import { estadoDeAcompanamiento, type EstadoDeAcompanamiento } from '../../lib/acompanamientoDatos';
import { viaDe } from '../../lib/viaDeContacto';
import type { Ticket } from '../../lib/cuadroTickets';
import type { AperturaDeTarea } from '../../lib/cerebro';

/** Cuántas grupales seguidas perdidas ya son una señal y no una gripe. */
const FALTAS_QUE_PREOCUPAN = 3;

interface Fila extends EstadoDeAcompanamiento {
  /** Qué hacer con este, en una línea. Siempre hay algo o explícitamente nada. */
  queHacer: string;
  /** Cuánto corre. Ordena la pantalla. */
  urgencia: number;
}

/**
 * Qué hacer con cada uno, y cuánto corre.
 *
 * La urgencia está acá y no en el JSX a propósito: es la regla que decide el
 * orden de la pantalla, y escrita entre los colores no se puede probar ni
 * revisar.
 */
function loQueCorre(e: EstadoDeAcompanamiento): { queHacer: string; urgencia: number } {
  if (e.vencido) {
    return {
      queHacer: `Su reporte pasó las 48 horas. Responde primero este.`,
      urgencia: 100,
    };
  }
  if (e.grupales_seguidas_sin_entrar >= FALTAS_QUE_PREOCUPAN) {
    return {
      queHacer: `Se perdió ${e.grupales_seguidas_sin_entrar} encuentros seguidos. `
        + 'Escríbele hoy: a esta altura ya no vuelve solo.',
      urgencia: 90,
    };
  }
  if (e.reportes_sin_responder > 0) {
    return {
      queHacer: e.reportes_sin_responder === 1
        ? 'Tiene un reporte esperando.'
        : `Tiene ${e.reportes_sin_responder} reportes esperando.`,
      urgencia: 70,
    };
  }
  if (e.grupales_seguidas_sin_entrar > 0) {
    return {
      queHacer: `Faltó al último encuentro. Si falta al próximo, escríbele.`,
      urgencia: 40,
    };
  }
  // Decirlo explícitamente, en vez de dejar la fila muda: una fila sin texto
  // se lee como un dato que no cargó.
  return { queHacer: 'Al día. No hace falta nada hoy.', urgencia: 0 };
}

export default function SeguimientoDeTodos({ onAbrir }: {
  onAbrir?: (a: AperturaDeTarea) => void;
}) {
  const [crudo, setCrudo] = useState<EstadoDeAcompanamiento[] | null>(null);
  const [falla, setFalla] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    void estadoDeAcompanamiento()
      .then((x) => { if (vivo) { setCrudo(x); setFalla(null); } })
      .catch((e: unknown) => {
        if (!vivo) return;
        setCrudo([]);
        // Se dice, no se calla: una pantalla de seguimiento vacía se lee como
        // «no hay nada que hacer», que es lo contrario de lo que pasa cuando
        // la consulta falló.
        setFalla(e instanceof Error ? e.message : 'No pude traer el seguimiento.');
      });
    return () => { vivo = false; };
  }, []);

  const filas: Fila[] = useMemo(() => (crudo ?? [])
    .map((e) => ({ ...e, ...loQueCorre(e) }))
    .sort((a, b) => b.urgencia - a.urgencia || a.nombre.localeCompare(b.nombre)),
  [crudo]);

  const corriendo = filas.filter((f) => f.urgencia >= 70).length;

  if (crudo === null) {
    return (
      <section className="rounded-2xl border border-cream/12 p-5">
        <p className="text-[17px] text-cream/70 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Mirando cómo va cada uno…
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-gold/25 bg-espresso/40 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
        <h3 className="text-[19px] font-bold text-cream flex items-center gap-2">
          <Users className="w-5 h-5 text-gold/70" /> Cómo va cada uno
        </h3>
        <span className="text-[16px] text-cream/55">
          {filas.length} {filas.length === 1 ? 'cliente' : 'clientes'}
        </span>
      </div>

      {/* La línea que se lee de parada, antes de mirar la lista. */}
      <p className="text-[17px] leading-relaxed text-cream/75 mb-4">
        {falla ? falla
          : filas.length === 0 ? 'Todavía no hay clientes cargados.'
          : corriendo === 0 ? 'Nadie está esperando respuesta. Todos al día.'
          : corriendo === 1 ? 'Uno necesita algo hoy. Está primero en la lista.'
          : `${corriendo} necesitan algo hoy. Están primeros en la lista.`}
      </p>

      <div className="space-y-2">
        {filas.map((f) => {
          const via = viaDe(f.servicio as Ticket);
          return (
            <div key={f.cliente_id}
              className={`rounded-xl border p-4 ${
                f.urgencia >= 90 ? 'border-danger/40 bg-danger/[0.05]'
                : f.urgencia >= 70 ? 'border-gold/35 bg-gold/[0.04]'
                : f.urgencia > 0 ? 'border-cream/15'
                : 'border-success/20'}`}>
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                {/* EL NOMBRE PRIMERO Y GRANDE. Es lo que se buscaba y lo que
                    no estaba: «no me aclara bien quién es». */}
                <p className="text-[18px] font-bold text-cream">
                  {f.nombre || 'Sin nombre cargado'}
                </p>
                <span className="text-[15px] text-cream/50">· {via.nombre}</span>
              </div>

              <p className="text-[17px] leading-relaxed text-cream/80 mt-1">
                {f.queHacer}
              </p>

              {/* LAS ACCIONES, EN LA MISMA FILA.
                  Sin esto hay que anotar el nombre, salir, buscarlo y abrirle
                  el chat: cuatro pasos por empujón, diez veces por día. */}
              {onAbrir && (
                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    onClick={() => onAbrir({
                      tab: 'mensajes', clienteId: f.cliente_id, seccion: 'conversacion',
                    })}
                    className="min-h-[44px] px-4 rounded-xl border border-gold/35 text-gold text-[16px] font-bold inline-flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    {f.reportes_sin_responder > 0 ? 'Responderle' : 'Escribirle'}
                  </button>
                  <button
                    onClick={() => onAbrir({
                      tab: 'clientes', clienteId: f.cliente_id, seccion: 'activacion',
                    })}
                    className="min-h-[44px] px-4 rounded-xl border border-cream/20 text-cream/75 text-[16px] font-bold inline-flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Ver su activación
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
