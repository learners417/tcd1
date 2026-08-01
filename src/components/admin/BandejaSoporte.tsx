import { useCallback, useEffect, useState } from 'react';
import { Clock, AlertTriangle, Wrench } from 'lucide-react';
import { db } from '../../lib/supabase';
import {
  mensajesQueEsperan, saludDelSoporte, COMPROMISO,
  type MensajeSinResponder,
} from '../../lib/soporte';
import { mensajeDeFalla } from '../../lib/conexion';

/**
 * QUIÉN ESTÁ ESPERANDO RESPUESTA.
 *
 * ═══ EL HUECO QUE CIERRA ═══
 *
 * El circuito de soporte funcionaba de punta a punta: el cliente escribe, el
 * equipo ve, responde, y el cliente recibe el aviso en tiempo real.
 *
 * Lo que faltaba era lo que lo vuelve confiable: **si nadie responde, nada lo
 * señalaba.** Un mensaje podía quedar tres días sin respuesta sin aparecer en
 * ningún lado.
 *
 * En un producto de miles, **tres días de silencio es la diferencia entre un
 * cliente y un reembolso.**
 */

interface FilaMensaje {
  id: string;
  emisor_id: string;
  contenido: string;
  created_at: string;
  tipo?: string | null;
  emisor?: { nombre?: string } | null;
}

export default function BandejaSoporte({
  onAbrirConversacion,
}: {
  onAbrirConversacion?: (clienteId: string) => void;
}) {
  const [esperando, setEsperando] = useState<MensajeSinResponder[] | null>(null);
  const [problema, setProblema] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      // Los mensajes de clientes que todavía no tienen respuesta del equipo.
      const { data, error } = await db()
        .from('mensajes')
        .select('id, emisor_id, contenido, created_at, tipo, emisor:profiles!emisor_id(nombre)')
        .eq('canal', 'humano')
        .is('respondido_en', null)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw new Error(error.message);

      const filas = (data ?? []) as unknown as FilaMensaje[];
      setEsperando(mensajesQueEsperan(filas.map((m) => ({
        id: m.id,
        clienteId: m.emisor_id,
        nombre: m.emisor?.nombre ?? 'Cliente',
        tipo: m.tipo === 'roto' ? 'roto' : 'duda',
        texto: m.contenido,
        creadoEn: m.created_at,
        respondido: false,
      }))));
      setProblema(null);
    } catch (err) {
      setProblema(mensajeDeFalla(err, 'ver quién está esperando'));
      setEsperando([]);
    }
  }, []);

  useEffect(() => {
    let vivo = true;
    void (async () => { if (vivo) await cargar(); })();
    // Cada dos minutos: alguien esperando no puede depender de que se recargue
    // la pantalla a mano.
    const t = setInterval(() => { if (vivo) void cargar(); }, 120_000);
    return () => { vivo = false; clearInterval(t); };
  }, [cargar]);

  if (esperando === null) {
    // El primer dibujo tiene que decir qué está pasando Y qué se promete: si
    // solo dice «mirando…», alguien que abre por primera vez no sabe si esta
    // pantalla le sirve para algo.
    return (
      <div className="rounded-2xl border border-cream/12 p-5">
        <p className="text-base text-cream/70">Mirando quién está esperando respuesta…</p>
        <p className="text-sm text-cream/45 mt-2 leading-relaxed">
          Acá aparece todo el que escribió y todavía no recibió respuesta.
          Prometemos {COMPROMISO.duda.horas} horas para una duda y{' '}
          {COMPROMISO.roto.horas} para algo que se rompió, y lo vencido va primero.
        </p>
      </div>
    );
  }

  const salud = saludDelSoporte({
    esperando,
    respondidosATiempo: 0,
    respondidosTarde: 0,
  });

  return (
    <div className="space-y-4">
      <div className={`rounded-2xl border p-5 ${
        salud.vencidos > 0 ? 'border-danger/40 bg-danger/[0.05]'
        : esperando.length > 0 ? 'border-gold/30 bg-gold/[0.04]'
        : 'border-success/30 bg-success/[0.04]'}`}>
        <p className="text-4xl leading-none text-cream"
          style={{ fontFamily: 'var(--font-display)' }}>
          {esperando.length}
        </p>
        <p className="text-sm text-cream/50 mt-1.5">
          {esperando.length === 1 ? 'persona esperando' : 'personas esperando'}
        </p>
        <p className="text-base text-cream/85 mt-3 leading-snug">{salud.titular}</p>
        <p className="text-sm text-cream/45 mt-2">
          Prometemos {COMPROMISO.duda.horas} horas para una duda y{' '}
          {COMPROMISO.roto.horas} para algo roto.
        </p>
      </div>

      {problema && (
        <div className="rounded-xl border border-danger/40 bg-danger/[0.06] p-3">
          <p className="text-sm text-cream/85">{problema}</p>
        </div>
      )}

      {esperando.map((m) => (
        <div key={m.id}
          className={`rounded-2xl border p-4 ${
            m.vencido ? 'border-danger/35 bg-danger/[0.04]' : 'border-cream/12'}`}>

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-base text-cream/90">{m.nombre}</p>
              <p className="text-sm text-cream/60 mt-1 leading-relaxed">
                «{m.texto.slice(0, 140)}{m.texto.length > 140 ? '…' : ''}»
              </p>
            </div>
            <span className={`shrink-0 flex items-center gap-1.5 rounded-lg px-2.5 py-1
              text-sm ${m.vencido ? 'bg-danger/15 text-danger'
                : m.tipo === 'roto' ? 'bg-gold/15 text-gold' : 'bg-cream/[0.07] text-cream/60'}`}>
              {m.tipo === 'roto' ? <Wrench size={13} />
                : m.vencido ? <AlertTriangle size={13} /> : <Clock size={13} />}
              {m.horas}h
            </span>
          </div>

          <p className={`text-sm mt-2.5 leading-relaxed ${
            m.vencido ? 'text-danger/90' : 'text-cream/55'}`}>
            {m.lectura}
          </p>

          {onAbrirConversacion && (
            <button onClick={() => onAbrirConversacion(m.clienteId)}
              className="btn-primary rounded-xl px-4 py-2 text-sm font-bold mt-3">
              Responderle
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
