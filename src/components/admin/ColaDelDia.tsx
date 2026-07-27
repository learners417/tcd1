import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, ArrowRight, Copy, Check } from 'lucide-react';
import { comparativaSemana, rachasDeTodos } from '../../lib/mesaPlataStorage';
import { semanaISO } from '../../lib/bitacoraCampana';
import {
  armarCola, resumirCola, type ItemCola, type EntradaCola,
} from '../../lib/colaExcepciones';
import {
  planificarAvisos, anotarEnviado, mandarAviso, mandarMensajeDelEquipo,
  HISTORIAL_VACIO, type HistorialAvisos,
} from '../../lib/avisosCliente';
import { crearNotificacion } from '../../lib/notifications';
import { mensajeDeFalla, causaDe } from '../../lib/conexion';

/**
 * LA COLA — el trabajo del día, ya decidido.
 *
 * No es un tablero: es una lista de cosas para hacer. Quien la trabaja
 * ejecuta y no diagnostica, porque la persona que la va a usar empezó hace
 * dos meses y no sabe de pauta. Si tuviera que deducir qué hacer, la
 * respuesta sería preguntarle a alguien — y ese alguien es justo el cuello
 * de botella que estamos sacando.
 *
 * Las cuentas sanas NO aparecen. Si aparecieran todas volvería a ser un
 * tablero y habría que leerlo entero.
 */

interface Cliente {
  id: string;
  nombre: string;
  plan_comercial?: string | null;
}

const COLOR_QUIEN: Record<string, string> = {
  'la app': 'text-cream/45',
  'operador': 'text-gold',
  'dueño del criterio': 'text-danger',
};

export default function ColaDelDia({ clientes }: { clientes: Cliente[] }) {
  const [items, setItems] = useState<ItemCola[] | null>(null);
  const [resumen, setResumen] = useState<ReturnType<typeof resumirCola> | null>(null);
  /** Arranca en true: el primer dibujo tiene que decir qué está pasando.
   *  Con false, la pantalla mostraba un guion hasta que llegaban los datos. */
  const [cargando, setCargando] = useState(true);
  const [problema, setProblema] = useState<string | null>(null);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [hechos, setHechos] = useState<Set<string>>(new Set());
  /** Qué avisos ya salieron. En el navegador alcanza: es del equipo, no del cliente. */
  const [histAvisos, setHistAvisos] = useState<HistorialAvisos>(() => {
    try { return JSON.parse(localStorage.getItem('tcd_avisos_enviados_v1') ?? '') as HistorialAvisos; }
    catch { return HISTORIAL_VACIO; }
  });
  const [enviando, setEnviando] = useState<string | null>(null);
  const [enviado, setEnviado] = useState<Set<string>>(new Set());

  const cargar = useCallback(async () => {
    if (clientes.length === 0) { setItems([]); setResumen(resumirCola([], 0)); return; }
    setCargando(true);
    setProblema(null);
    try {
      const ids = clientes.map((c) => c.id);
      const [comparativa, rachas] = await Promise.all([
        comparativaSemana(ids),
        rachasDeTodos(ids),
      ]);
      const porId = new Map(clientes.map((c) => [c.id, c]));
      const entradas: EntradaCola[] = comparativa.map((f) => {
        const c = porId.get(f.clienteId);
        return {
          ...f,
          nombre: c?.nombre ?? 'Cliente',
          plan: (c?.plan_comercial as EntradaCola['plan']) ?? 'blanco',
          // Semanas seguidas con el MISMO cuello. Es lo que decide si algo
          // escala de la app a una persona: quien lleva un mes trabado es el
          // único que necesita que alguien entre.
          semanasIgual: Math.max(0, (rachas.get(f.clienteId) ?? 1) - 1),
        };
      });
      const cola = armarCola(entradas);
      setItems(cola);
      setResumen(resumirCola(cola, clientes.length));
    } catch (err) {
      // Si es del servidor, lo más probable es que falte correr el SQL.
      setProblema(
        causaDe(err) === 'servidor'
          ? `${mensajeDeFalla(err, 'armar la cola')} Si es la primera vez, falta correr sala-de-mando.sql en Supabase.`
          : mensajeDeFalla(err, 'armar la cola'),
      );
      setItems([]);
    } finally {
      setCargando(false);
    }
  }, [clientes]);

  /** La guarda evita tocar estado de un componente que ya no está en pantalla:
   *  si el admin cambia de tab mientras carga, la respuesta llega a la nada. */
  useEffect(() => {
    let vivo = true;
    void (async () => { if (vivo) await cargar(); })();
    return () => { vivo = false; };
  }, [cargar]);

  /**
   * Manda el aviso al cliente DENTRO de la app.
   *
   * Antes esto viajaba por WhatsApp: se mezclaba con la conversación
   * personal, se perdía entre mensajes, y a la semana siguiente nadie podía
   * decir si se le había avisado. Adentro de la app queda y aterriza en la
   * pantalla donde se resuelve.
   */
  const mandar = async (item: ItemCola) => {
    setEnviando(item.clienteId);
    const ok = await mandarMensajeDelEquipo(
      item.clienteId, 'Tu equipo', item.como, '/campanas', crearNotificacion,
    );
    setEnviando(null);
    if (ok) {
      setEnviado((e) => new Set(e).add(item.clienteId));
      setHechos((h) => new Set(h).add(item.clienteId));
    }
  };

  /** Los avisos que la app manda sola, de una vez. */
  const mandarLosAutomaticos = async () => {
    if (!items) return;
    const plan = planificarAvisos(items, histAvisos, semanaISO());
    let h = histAvisos;
    for (const aviso of plan.aMandar) {
      const ok = await mandarAviso(aviso, crearNotificacion);
      if (ok) h = anotarEnviado(h, aviso, semanaISO());
    }
    setHistAvisos(h);
    try { localStorage.setItem('tcd_avisos_enviados_v1', JSON.stringify(h)); } catch { /* noop */ }
    await cargar();
  };

  const copiar = (item: ItemCola) => {
    void navigator.clipboard?.writeText(item.como);
    setCopiado(item.clienteId);
    setTimeout(() => setCopiado(null), 2000);
  };

  const marcar = (id: string) => {
    setHechos((h) => {
      const n = new Set(h);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const pendientes = (items ?? []).filter((i) => !hechos.has(i.clienteId));
  const paraPersona = pendientes.filter((i) => i.quien !== 'la app');
  const paraLaApp = pendientes.filter((i) => i.quien === 'la app');

  return (
    <div className="max-w-4xl mx-auto space-y-4">

      {/* ── EL TITULAR ── */}
      <div className={`rounded-2xl border p-6 ${
        !resumen || resumen.paraPersona === 0
          ? 'border-success/30 bg-success/[0.05]'
          : 'border-gold/35 bg-gold/[0.05]'}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-cream/50 mb-2">
              Hoy · semana {semanaISO()}
            </p>
            <h3 className="text-2xl text-cream leading-snug" style={{ fontFamily: 'var(--font-display)' }}>
              {cargando || !resumen ? 'Mirando las cuentas…' : resumen.titular}
            </h3>
            {resumen && resumen.enRiesgo > 0 && (
              <p className="text-sm text-cream/65 mt-2">
                ${resumen.enRiesgo.toLocaleString()} en juego si no se atiende.
              </p>
            )}
          </div>
          <button onClick={() => void cargar()} disabled={cargando}
            className="flex items-center gap-2 text-xs text-cream/50 disabled:opacity-40 shrink-0">
            <RefreshCw size={13} className={cargando ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>
      </div>

      {problema && (
        <div className="rounded-2xl border border-gold/30 bg-gold/[0.05] p-4">
          <p className="text-sm text-cream/85">{problema}</p>
        </div>
      )}

      {/* ── LO QUE NECESITA UNA PERSONA ── */}
      {paraPersona.length > 0 && (
        <div className="space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold">
            Para hacer hoy
          </p>
          {paraPersona.map((i) => (
            <div key={i.clienteId} className="rounded-2xl border border-cream/15 p-4">
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <span className="text-base text-cream" style={{ fontFamily: 'var(--font-display)' }}>
                  {i.nombre}
                </span>
                <span className="text-[11px] text-cream/40 shrink-0">
                  ${i.enRiesgo.toLocaleString()} en juego
                  {i.semanasIgual > 0 && ` · ${i.semanasIgual + 1}ª semana igual`}
                </span>
              </div>

              <p className="text-xs text-cream/55 mb-3">{i.situacion}</p>

              <div className="rounded-xl bg-gold/[0.06] border border-gold/25 p-3">
                <p className="text-sm text-cream font-semibold mb-1.5">
                  <ArrowRight size={13} className="inline mb-0.5 mr-1 text-gold" />
                  {i.accion}
                </p>
                <p className="text-xs text-cream/70 leading-relaxed">{i.como}</p>
                <div className="flex items-center gap-3 mt-2.5">
                  <button onClick={() => copiar(i)}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-gold hover:text-goldhi">
                    {copiado === i.clienteId ? <Check size={11} /> : <Copy size={11} />}
                    {copiado === i.clienteId ? 'Copiado' : 'Copiar el mensaje'}
                  </button>
                  <button onClick={() => void mandar(i)}
                    disabled={enviando === i.clienteId || enviado.has(i.clienteId)}
                    className="text-[11px] font-bold text-gold hover:text-goldhi disabled:opacity-40">
                    {enviando === i.clienteId ? 'Enviando…'
                      : enviado.has(i.clienteId) ? 'Enviado ✓'
                      : 'Mandárselo en la app'}
                  </button>
                  <button onClick={() => marcar(i.clienteId)}
                    className="text-[11px] text-cream/45 underline underline-offset-2">
                    Ya lo hice
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── LO QUE RESUELVE LA APP ── */}
      {paraLaApp.length > 0 && (
        <div className="rounded-2xl border border-cream/10 p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-cream/45 mb-1">
            La app se ocupa
          </p>
          <p className="text-xs text-cream/45 mb-3">
            Estas cuentas reciben el aviso solas. Si el problema sigue después de dos avisos,
            suben a la lista de arriba.
          </p>
          <button onClick={() => void mandarLosAutomaticos()}
            className="text-[11px] font-bold text-gold hover:text-goldhi mb-3">
            Mandar los {paraLaApp.length} avisos ahora
          </button>
          <div className="space-y-1.5">
            {paraLaApp.map((i) => (
              <p key={i.clienteId} className={`text-xs ${COLOR_QUIEN['la app']}`}>
                <strong className="text-cream/70">{i.nombre}</strong> — {i.accion.toLowerCase()}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* ── LO HECHO ── */}
      {hechos.size > 0 && (
        <p className="text-[11px] text-success/70">
          {hechos.size} {hechos.size === 1 ? 'atendida' : 'atendidas'} hoy.
        </p>
      )}

      {items !== null && items.length === 0 && !problema && (
        <p className="text-sm text-cream/45 text-center py-6">
          Nada que atender. Las cuentas sanas no aparecen acá a propósito:
          si aparecieran todas, habría que leer la lista entera.
        </p>
      )}
    </div>
  );
}
