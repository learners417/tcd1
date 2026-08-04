import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Clock, Inbox, Loader2 } from 'lucide-react';
import { supabase, isSupabaseReady } from '../../lib/supabase';

/**
 * BANDEJA "QUIÉN ESPERA RESPUESTA" — Turno 1 (el cableado).
 *
 * Lista los clientes con mensajes entrantes SIN responder, ordenados por
 * antigüedad (el que espera hace más, arriba). El reloj manda.
 *
 * Fuente de verdad: mensajes con respondido_en IS NULL. El reloj se apaga
 * solo cuando el trigger de la base marca respondido_en al responder.
 *
 * Reutilizable: hoy vive en el panel de Mensajes; en Turno 2 va dentro de
 * "Mi día" de cada asiento (por eso recibe onOpenCliente por props).
 */

type FilaEspera = {
  clienteId: string;
  nombre: string;
  especialidad: string | null;
  desde: number;        // timestamp del mensaje más viejo sin responder
  pendientes: number;   // cuántos mensajes esperan
  ultimo: string;       // preview del último mensaje
};

const CANALES_HUMANOS = ['privado', 'consultas', 'Consultas Generales'];

function formatEspera(ms: number): string {
  const min = Math.floor(ms / 60000);
  if (min < 1) return 'recién';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h < 24) return m > 0 ? `${h} h ${m} min` : `${h} h`;
  const d = Math.floor(h / 24);
  return `${d} d`;
}

// Semáforo del reloj: calmo · atención (≥1h) · urgente (≥4h). El estado es
// un chip, no un párrafo. El dorado queda reservado para la acción primaria.
function relojClase(ms: number): string {
  const h = ms / 3600000;
  if (h >= 4) return 'bg-red-500/15 text-red-300 border-red-500/25';
  if (h >= 1) return 'bg-amber-500/15 text-amber-300 border-amber-500/25';
  return 'bg-surface/60 text-cream/60 border-gold/12';
}

export default function BandejaEspera({
  onOpenCliente,
  activeClienteId,
}: {
  onOpenCliente: (clienteId: string) => void;
  activeClienteId?: string;
}) {
  const [filas, setFilas] = useState<FilaEspera[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const nowRef = useRef(now);
  nowRef.current = now;

  const cargar = useCallback(async () => {
    if (!isSupabaseReady() || !supabase) { setLoading(false); return; }
    const { data } = await supabase
      .from('mensajes')
      .select('emisor_id, contenido, created_at, emisor:profiles!emisor_id(nombre, especialidad)')
      .is('respondido_en', null)
      .is('receptor_id', null)
      .in('canal', CANALES_HUMANOS)
      .order('created_at', { ascending: true });

    // Agrupar por cliente: el más viejo define el reloj.
    const porCliente = new Map<string, FilaEspera>();
    for (const m of (data ?? []) as any[]) {
      if (!m.emisor_id) continue;
      const emisor = Array.isArray(m.emisor) ? m.emisor[0] : m.emisor;
      const existente = porCliente.get(m.emisor_id);
      const ts = new Date(m.created_at).getTime();
      if (existente) {
        existente.pendientes += 1;
        existente.ultimo = m.contenido;         // el último en llegar (orden asc)
      } else {
        porCliente.set(m.emisor_id, {
          clienteId: m.emisor_id,
          nombre: emisor?.nombre ?? 'Cliente',
          especialidad: emisor?.especialidad ?? null,
          desde: ts,
          pendientes: 1,
          ultimo: m.contenido,
        });
      }
    }
    const lista = [...porCliente.values()].sort((a, b) => a.desde - b.desde);
    setFilas(lista);
    setLoading(false);
  }, []);

  useEffect(() => {
    void cargar();
    if (!supabase) return;
    // Cualquier INSERT en mensajes (nuevo entrante o una respuesta) puede
    // cambiar la bandeja → recargar. Barato y siempre consistente.
    const ch = supabase
      .channel('bandeja-espera')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensajes' }, () => { void cargar(); })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'mensajes' }, () => { void cargar(); })
      .subscribe();
    return () => { void supabase?.removeChannel(ch); };
  }, [cargar]);

  // Reloj vivo: re-render cada 30 s para que la espera avance sola.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  const total = useMemo(() => filas.reduce((s, f) => s + f.pendientes, 0), [filas]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6 border-b border-gold/12 bg-black/20">
        <Loader2 className="w-4 h-4 text-gold animate-spin" />
      </div>
    );
  }

  if (filas.length === 0) {
    return (
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gold/12 bg-black/20">
        <Inbox className="w-4 h-4 text-cream/40" />
        <p className="text-sm text-cream/55">Nadie esperando respuesta. Bandeja en cero.</p>
      </div>
    );
  }

  return (
    <div className="border-b border-gold/12 bg-black/20 shrink-0">
      <div className="flex items-center gap-2 px-6 pt-4 pb-2">
        <Clock className="w-4 h-4 text-gold" />
        <p className="text-[11px] font-bold uppercase tracking-widest text-cream/70">
          Esperan respuesta · {filas.length} {filas.length === 1 ? 'persona' : 'personas'}
          {total > filas.length && <span className="text-cream/45"> · {total} mensajes</span>}
        </p>
      </div>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide px-6 pb-4">
        {filas.map(f => {
          const espera = nowRef.current - f.desde;
          const activo = activeClienteId === f.clienteId;
          return (
            <button
              key={f.clienteId}
              onClick={() => onOpenCliente(f.clienteId)}
              className={`shrink-0 w-[220px] text-left rounded-xl border p-3 transition-all ${
                activo ? 'bg-gold/10 border-gold/30' : 'bg-surface/40 border-gold/12 hover:bg-surface/60'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-sm font-semibold text-cream truncate">{f.nombre}</span>
                <span className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${relojClase(espera)}`}>
                  {formatEspera(espera)}
                </span>
              </div>
              <p className="text-[12px] text-cream/55 truncate">{f.ultimo}</p>
              {f.pendientes > 1 && (
                <p className="text-[11px] text-cream/40 mt-1">{f.pendientes} mensajes sin responder</p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
