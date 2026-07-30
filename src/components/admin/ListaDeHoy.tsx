import { useCallback, useEffect, useState } from 'react';
import { Check, Copy, Send, ArrowUpRight, Plus, AlertTriangle } from 'lucide-react';
import {
  ordenar, porArea, titularDelDia, comoSeResuelve, aQuienEscala,
  avisoDeEscalado, ETIQUETA_DESTINO, POR_QUE,
  type TareaDelCerebro, type TareaOrdenada, type AperturaDeTarea,
} from '../../lib/cerebro';
import { miListaDeHoy, cerrar, mandarleAlCliente } from '../../lib/cerebroStorage';
import { mensajeDeFalla } from '../../lib/conexion';
import Termino from '../Termino';

/**
 * LA LISTA ÚNICA — todo el trabajo del día, venga de donde venga.
 *
 * ═══ LO QUE CAMBIA ═══
 *
 * Antes había dos listas: la que la app calculaba —que desaparecía al
 * recargar— y la que alguien escribía a mano en otra tab. **Nunca se veían
 * juntas**, así que no había forma de entender el día completo ni de contestar
 * «¿por qué esta tarea?».
 *
 * Ahora es una sola, cada tarea dice de dónde vino, y **cada botón abre lo que
 * hace falta para resolverla**. Nunca «búscalo tú».
 */

export default function ListaDeHoy({
  personaId,
  onAbrir,
  onNuevaTarea,
}: {
  personaId: string;
  /** La pantalla que sabe navegar decide CÓMO; acá solo se dice QUÉ abrir. */
  onAbrir?: (a: AperturaDeTarea) => void;
  onNuevaTarea?: () => void;
}) {
  const [tareas, setTareas] = useState<TareaOrdenada[] | null>(null);
  const [problema, setProblema] = useState<string | null>(null);
  const [trabajando, setTrabajando] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      const crudas = await miListaDeHoy(personaId);
      setTareas(ordenar(crudas));
      setProblema(null);
    } catch (err) {
      setProblema(mensajeDeFalla(err, 'traer tu lista'));
      setTareas([]);
    }
  }, [personaId]);

  useEffect(() => {
    let vivo = true;
    void (async () => { if (vivo) await cargar(); })();
    return () => { vivo = false; };
  }, [cargar]);

  const mandar = async (t: TareaOrdenada) => {
    if (!t.clienteId || !t.textoListo) return;
    setTrabajando(t.id ?? '');
    const ok = await mandarleAlCliente({
      clienteId: t.clienteId, deQuien: personaId,
      texto: t.textoListo, tareaId: t.id,
    });
    setTrabajando(null);
    if (!ok) {
      // Se dice, no se calla: creer que el mensaje salió cuando no salió es
      // exactamente el error que esta pantalla vino a arreglar.
      setProblema('No se pudo mandar el mensaje. No salió: prueba de nuevo.');
      return;
    }
    await cargar();
  };

  const marcarHecha = async (t: TareaOrdenada) => {
    if (!t.id) return;
    setTrabajando(t.id);
    await cerrar(t.id, personaId);
    setTrabajando(null);
    await cargar();
  };

  // Sin persona no hay lista posible, y decirlo es mejor que un cargando
  // eterno: un «mirando…» que nunca termina parece que la app se colgó.
  if (!personaId) {
    return (
      <div className="rounded-2xl border border-cream/12 p-5">
        <p className="text-sm text-cream/70">
          No se pudo identificar tu usuario, así que no puedo traerte tu lista.
        </p>
        <p className="text-[11px] text-cream/45 mt-1">
          Sal y vuelve a entrar. Si sigue igual, avisale al equipo.
        </p>
      </div>
    );
  }

  if (tareas === null) {
    return (
      <div className="rounded-2xl border border-cream/12 p-5">
        <p className="text-sm text-cream/60">Mirando tu lista…</p>
        <p className="text-[11px] text-cream/35 mt-1">
          Traigo todo tu trabajo del día: lo que detectó la app, lo que
          escribiste tú y lo que te asignaron.
        </p>
      </div>
    );
  }

  const grupos = porArea(tareas);

  return (
    <div className="space-y-4">

      <div className={`rounded-2xl border p-5 ${
        tareas.some((t) => t.vencida) ? 'border-danger/40 bg-danger/[0.05]'
        : tareas.length > 0 ? 'border-gold/30 bg-gold/[0.05]'
        : 'border-success/30 bg-success/[0.05]'}`}>
        <p className="text-xl text-cream leading-snug" style={{ fontFamily: 'var(--font-display)' }}>
          {titularDelDia(tareas)}
        </p>
        {tareas.length > 0 && (
          <p className="text-[11px] text-cream/50 mt-1.5">
            Es la misma lista que ves en Tareas. Lo que agregues allá aparece acá.
          </p>
        )}
      </div>

      {problema && (
        <div className="rounded-xl border border-danger/40 bg-danger/[0.06] p-3">
          <p className="text-sm text-cream/85">{problema}</p>
        </div>
      )}

      {grupos.map((g) => (
        <div key={g.nombre} className="rounded-2xl border border-cream/12 p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-cream/50 mb-3">
            {g.nombre} · {g.tareas.length}
          </p>
          <div className="space-y-3">
            {g.tareas.map((t) => (
              <Tarjeta
                key={t.id ?? t.titulo}
                t={t}
                ocupado={trabajando === t.id}
                onMandar={() => void mandar(t)}
                onHecha={() => void marcarHecha(t)}
                onAbrir={onAbrir}
              />
            ))}
          </div>
        </div>
      ))}

      {onNuevaTarea && (
        <button onClick={onNuevaTarea}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed
            border-cream/20 py-3 text-sm text-cream/60 hover:text-cream/85 hover:border-cream/35">
          <Plus size={14} /> Agregar una tarea
        </button>
      )}
    </div>
  );
}

function Tarjeta({
  t, ocupado, onMandar, onHecha, onAbrir,
}: {
  t: TareaOrdenada;
  ocupado: boolean;
  onMandar: () => void;
  onHecha: () => void;
  onAbrir?: (a: AperturaDeTarea) => void;
}) {
  const [copiado, setCopiado] = useState(false);
  const apertura = comoSeResuelve(t);
  const escala = t.destino === 'escalar' ? aQuienEscala(t) : null;

  return (
    <div className={`rounded-xl border p-3.5 ${
      t.vencida ? 'border-danger/35 bg-danger/[0.04]' : 'border-cream/12'}`}>

      <div className="flex items-start gap-2.5">
        {t.vencida && <AlertTriangle size={14} className="text-danger mt-0.5 shrink-0" />}
        <div className="min-w-0 flex-1">
          <p className="text-sm text-cream/90 leading-snug">{t.titulo}</p>
          <p className="text-xs text-cream/60 mt-1 leading-relaxed">{t.descripcion}</p>

          {/* Por qué esta tarea, y por qué acá. Es lo que faltaba. */}
          <p className="text-[11px] text-cream/35 mt-1.5">
            {t.porQueAca} · {POR_QUE[t.origen]}
          </p>
        </div>
      </div>

      {/* El mensaje ya escrito */}
      {t.destino === 'mensaje' && t.textoListo && (
        <p className="text-xs text-cream/70 bg-surface/30 rounded-lg p-2.5 mt-2.5 leading-relaxed">
          {t.textoListo}
        </p>
      )}

      {/* Lo que pasa si se escala */}
      {escala && (
        <p className="text-xs text-cream/55 mt-2 leading-relaxed">
          {escala.porque}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2 mt-3">
        {t.destino === 'mensaje' && t.textoListo && (
          <>
            <button onClick={onMandar} disabled={ocupado}
              className="btn-primary rounded-lg px-3 py-1.5 text-xs font-bold disabled:opacity-50">
              <Send size={11} className="inline mb-0.5 mr-1" />
              {ocupado ? 'Mandando…' : 'Mandárselo'}
            </button>
            <button
              onClick={() => {
                void navigator.clipboard?.writeText(t.textoListo ?? '');
                setCopiado(true);
                setTimeout(() => setCopiado(false), 1800);
              }}
              className="rounded-lg border border-cream/15 px-3 py-1.5 text-xs text-cream/70">
              <Copy size={11} className="inline mb-0.5 mr-1" />
              {copiado ? 'Copiado' : 'Copiar'}
            </button>
          </>
        )}

        {apertura && onAbrir && (
          <button onClick={() => onAbrir(apertura)}
            className="btn-primary rounded-lg px-3 py-1.5 text-xs font-bold">
            {ETIQUETA_DESTINO[t.destino]}
            <ArrowUpRight size={11} className="inline mb-0.5 ml-1" />
          </button>
        )}

        {escala && (
          <button onClick={onHecha} disabled={ocupado}
            className="btn-primary rounded-lg px-3 py-1.5 text-xs font-bold disabled:opacity-50">
            <ArrowUpRight size={11} className="inline mb-0.5 mr-1" />
            Pasar a {escala.rol === 'desarrollo' ? 'desarrollo' : 'dirección'}
          </button>
        )}

        <button onClick={onHecha} disabled={ocupado}
          className="text-[11px] text-cream/45 underline underline-offset-2 disabled:opacity-50">
          <Check size={10} className="inline mb-0.5 mr-0.5" />
          Ya lo hice
        </button>
      </div>

      {apertura?.aviso && (
        <p className="text-[11px] text-cream/40 mt-2">{apertura.aviso}</p>
      )}
    </div>
  );
}
