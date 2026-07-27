import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, ArrowRight, Plus, X } from 'lucide-react';
import {
  ETAPAS, ETAPA_CON_CANDADO, armarRecorrido, veredictoMotor,
  DIAS_PAUTA_SIN_AGENDA, type ClienteEnRecorrido, type EstadoMotor,
} from '../../lib/salaDeMando';
import {
  moverDeEtapa, listarDecisiones, guardarDecision, derogarDecision,
} from '../../lib/salaDeMandoStorage';
import type { Decision } from '../../lib/salaDeMando';
import { comparativaSemana } from '../../lib/mesaPlataStorage';
import { mensajeDeFalla } from '../../lib/conexion';

/**
 * LA SALA DE MANDO.
 *
 * No es un tablero: es la máquina que se instala sola, con un equipo
 * atendiendo excepciones. Contesta una sola pregunta cada mañana: **qué está
 * frenado y quién lo destraba**.
 *
 * Tres de las diez vistas de la especificación ya viven fuera de acá porque
 * se usan todos los días y merecen su propia tab: Hoy (la cola), Supervisión
 * y Tareas. Acá están las otras: el recorrido, las decisiones, el motor
 * propio y el marcador.
 */

type Vista = 'marcador' | 'recorrido' | 'decisiones' | 'motor';

interface Cliente {
  id: string;
  nombre: string;
  etapa_actual?: number | null;
  etapa_desde?: string | null;
  fecha_venta?: string | null;
}

const VISTAS: Array<{ id: Vista; label: string }> = [
  { id: 'marcador', label: 'Marcador' },
  { id: 'recorrido', label: 'Recorrido' },
  { id: 'decisiones', label: 'Decisiones' },
  { id: 'motor', label: 'Mi Motor' },
];

const MOTOR_KEY = 'tcd_motor_javo_v1';
const MOTOR_VACIO: EstadoMotor = {
  cobrado: 0, objetivo: 30000, conversaciones: 0, calificados: 0,
  agendas: 0, llamadasTomadas: 0, cerradas: 0, gastoPauta: 0, diasSinAgenda: 0,
};

export default function SalaDeMando({ clientes }: { clientes: Cliente[] }) {
  const [vista, setVista] = useState<Vista>('marcador');
  const [problema, setProblema] = useState<string | null>(null);

  const recorrido = useMemo(() => armarRecorrido(clientes), [clientes]);

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex gap-2 flex-wrap">
        {VISTAS.map((v) => (
          <button key={v.id} onClick={() => setVista(v.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              vista === v.id
                ? 'bg-gold/20 border border-gold/50 text-gold'
                : 'border border-cream/15 text-cream/60'}`}>
            {v.label}
          </button>
        ))}
      </div>

      {problema && (
        <div className="rounded-2xl border border-danger/35 bg-danger/[0.06] p-4">
          <p className="text-sm text-cream/85">{problema}</p>
        </div>
      )}

      {vista === 'marcador' && <Marcador clientes={clientes} recorrido={recorrido} />}
      {vista === 'recorrido' && <Recorrido recorrido={recorrido} onProblema={setProblema} />}
      {vista === 'decisiones' && <Decisiones onProblema={setProblema} />}
      {vista === 'motor' && <MiMotor />}
    </div>
  );
}

/* ══════════════════ MARCADOR ══════════════════ */

function Marcador(
  { clientes, recorrido }: { clientes: Cliente[]; recorrido: ClienteEnRecorrido[] },
) {
  const [semana, setSemana] = useState<{ ventas: number; facturado: number } | null>(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (clientes.length === 0) return;
    let vivo = true;
    setCargando(true);
    void (async () => {
      try {
        const filas = await comparativaSemana(clientes.map((c) => c.id));
        if (!vivo) return;
        setSemana({
          ventas: filas.reduce((t, f) => t + (f.ventas || 0), 0),
          facturado: filas.reduce((t, f) => t + (f.facturado || 0), 0),
        });
      } catch { /* el marcador funciona igual sin la semana */ }
      finally { if (vivo) setCargando(false); }
    })();
    return () => { vivo = false; };
  }, [clientes]);

  const frenados = recorrido.filter((r) => r.atrasado || r.fueraDeVentana).length;
  const enRitmo = recorrido.filter((r) => r.etapa >= 7).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          ['Ventas de clientes', cargando ? '…' : String(semana?.ventas ?? '—'), 'esta semana'],
          ['Facturado', cargando ? '…' : semana ? `$${semana.facturado.toLocaleString()}` : '—', 'esta semana'],
          ['Frenados', String(frenados), frenados === 1 ? 'cuenta' : 'cuentas'],
          ['En ritmo propio', String(enRitmo), `de ${recorrido.length}`],
        ].map(([l, v, sub]) => (
          <div key={l} className="rounded-2xl border border-cream/12 p-4 text-center">
            <p className="text-2xl text-cream" style={{ fontFamily: 'var(--font-display)' }}>{v}</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-cream/45 mt-1">{l}</p>
            <p className="text-[10px] text-cream/30">{sub}</p>
          </div>
        ))}
      </div>

      <div className={`rounded-2xl border p-5 ${
        frenados === 0 ? 'border-success/30 bg-success/[0.05]' : 'border-gold/35 bg-gold/[0.05]'}`}>
        <p className="text-lg text-cream leading-snug" style={{ fontFamily: 'var(--font-display)' }}>
          {frenados === 0
            ? 'Ninguna cuenta está frenada.'
            : frenados === 1
              ? 'Hay una cuenta frenada en su etapa.'
              : `Hay ${frenados} cuentas frenadas en su etapa.`}
        </p>
        <p className="text-xs text-cream/55 mt-1">
          {frenados === 0
            ? 'Todo el mundo está dentro del tiempo de su etapa.'
            : 'Están en Recorrido, con el criterio que les falta y quién lo destraba.'}
        </p>
      </div>
    </div>
  );
}

/* ══════════════════ RECORRIDO ══════════════════ */

function Recorrido(
  { recorrido, onProblema }: {
    recorrido: ClienteEnRecorrido[];
    onProblema: (m: string | null) => void;
  },
) {
  const [moviendo, setMoviendo] = useState<string | null>(null);
  const [local, setLocal] = useState(recorrido);
  useEffect(() => setLocal(recorrido), [recorrido]);

  const mover = async (c: ClienteEnRecorrido, hacia: number) => {
    // De la etapa 4 no se sale sin el cobro de prueba: encender una campaña
    // con la cadena sin probar es tirar el presupuesto.
    if (c.etapa === ETAPA_CON_CANDADO && hacia > ETAPA_CON_CANDADO) {
      const ok = window.confirm(
        'De «Prueba de cadena» no se sale sin el cobro de prueba completo y verificado.\n\n' +
        '¿Confirmas que el comentario llegó al mensaje, el mensaje al link, el link al ' +
        'checkout y el checkout cobró de verdad?',
      );
      if (!ok) return;
    }
    setMoviendo(c.id);
    onProblema(null);
    try {
      await moverDeEtapa(c.id, hacia);
      setLocal((l) => l.map((x) => x.id === c.id
        ? { ...x, etapa: hacia, diasEnEtapa: 0, atrasado: false,
            criterioSalida: ETAPAS[hacia].criterioSalida, dueno: ETAPAS[hacia].dueno }
        : x));
    } catch (err) {
      onProblema(mensajeDeFalla(err, 'mover de etapa'));
    } finally {
      setMoviendo(null);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-cream/45">
        Cada cliente vive en una sola etapa. Nadie avanza sin cumplir el criterio de salida.
      </p>

      {ETAPAS.map((e) => {
        const aqui = local.filter((c) => c.etapa === e.numero);
        if (aqui.length === 0) return null;
        return (
          <div key={e.numero} className="rounded-2xl border border-cream/12 p-4">
            <div className="flex items-baseline justify-between gap-3 mb-1">
              <p className="text-sm font-semibold text-cream">
                {e.numero} · {e.nombre}
                <span className="text-[11px] text-cream/40 font-normal ml-2">{e.dueno}</span>
              </p>
              <span className="text-[11px] text-cream/35 shrink-0">
                {aqui.length} {aqui.length === 1 ? 'cliente' : 'clientes'}
              </span>
            </div>
            <p className="text-[11px] text-cream/45 mb-3">Para salir: {e.criterioSalida}</p>

            <div className="space-y-2">
              {aqui.map((c) => (
                <div key={c.id}
                  className={`rounded-xl border p-3 ${
                    c.fueraDeVentana ? 'border-danger/40 bg-danger/[0.05]'
                    : c.atrasado ? 'border-gold/35 bg-gold/[0.04]'
                    : 'border-cream/10'}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm text-cream/90">{c.nombre}</p>
                      <p className="text-[11px] text-cream/45">
                        {c.diasEnEtapa} {c.diasEnEtapa === 1 ? 'día' : 'días'} en esta etapa
                        {c.fueraDeVentana && (
                          <span className="text-danger ml-2">
                            · {c.diasDesdeVenta} días desde la venta, sin activar
                          </span>
                        )}
                        {!c.fueraDeVentana && c.atrasado && (
                          <span className="text-gold ml-2">· pasó el tiempo de la etapa</span>
                        )}
                      </p>
                    </div>
                    {c.etapa < ETAPAS.length - 1 && (
                      <button onClick={() => void mover(c, c.etapa + 1)}
                        disabled={moviendo === c.id}
                        className="flex items-center gap-1 text-[11px] font-bold text-gold hover:text-goldhi disabled:opacity-40 shrink-0">
                        {moviendo === c.id ? 'Moviendo…' : <>Avanzar <ArrowRight size={11} /></>}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {local.length === 0 && (
        <p className="text-sm text-cream/40 text-center py-6">
          Todavía no hay clientes cargados.
        </p>
      )}
    </div>
  );
}

/* ══════════════════ DECISIONES ══════════════════ */

function Decisiones({ onProblema }: { onProblema: (m: string | null) => void }) {
  const [lista, setLista] = useState<Decision[] | null>(null);
  const [buscar, setBuscar] = useState('');
  const [abriendo, setAbriendo] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [criterio, setCriterio] = useState('');
  const [cargando, setCargando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    try { setLista(await listarDecisiones(true)); }
    catch (err) { onProblema(mensajeDeFalla(err, 'cargar las decisiones')); setLista([]); }
    finally { setCargando(false); }
  }, [onProblema]);

  useEffect(() => { void cargar(); }, [cargar]);

  const guardar = async () => {
    if (titulo.trim().length < 5) return;
    try {
      await guardarDecision({ titulo: titulo.trim(), criterio: criterio.trim() || undefined });
      setTitulo(''); setCriterio(''); setAbriendo(false);
      await cargar();
    } catch (err) { onProblema(mensajeDeFalla(err, 'guardar la decisión')); }
  };

  const filtradas = (lista ?? []).filter((d) =>
    !buscar.trim()
    || `${d.titulo} ${d.criterio ?? ''}`.toLowerCase().includes(buscar.toLowerCase()));

  return (
    <div className="space-y-3">
      <p className="text-xs text-cream/45">
        El criterio que no se escribe se vuelve a discutir. Y cada vez que se vuelve a
        discutir, alguien tiene que estar presente para decidirlo otra vez.
      </p>

      <div className="flex gap-2">
        <input value={buscar} onChange={(e) => setBuscar(e.target.value)}
          placeholder="Buscar una decisión…"
          className="flex-1 bg-surface/40 border border-cream/15 rounded-xl px-3 py-2 text-sm text-cream" />
        <button onClick={() => setAbriendo((a) => !a)}
          className="flex items-center gap-1 btn-primary px-3 py-2 rounded-xl text-xs font-bold shrink-0">
          {abriendo ? <X size={13} /> : <Plus size={13} />}
          {abriendo ? 'Cerrar' : 'Anotar'}
        </button>
      </div>

      {abriendo && (
        <div className="rounded-2xl border border-gold/25 bg-gold/[0.04] p-4 space-y-2">
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)}
            placeholder="Qué se decidió"
            className="w-full bg-surface/40 border border-cream/15 rounded-xl px-3 py-2 text-sm text-cream" />
          <textarea value={criterio} onChange={(e) => setCriterio(e.target.value)}
            placeholder="El criterio: por qué, y cuándo vuelve a aplicar"
            rows={3}
            className="w-full bg-surface/40 border border-cream/15 rounded-xl px-3 py-2 text-sm text-cream" />
          <button onClick={() => void guardar()} disabled={titulo.trim().length < 5}
            className="w-full btn-primary py-2 rounded-xl text-xs font-bold disabled:opacity-40">
            Guardar
          </button>
        </div>
      )}

      {lista === null || cargando ? (
        <p className="text-sm text-cream/40">Cargando…</p>
      ) : filtradas.length === 0 ? (
        <p className="text-sm text-cream/40 py-4">
          {buscar ? 'Ninguna decisión coincide.' : 'Todavía no hay decisiones anotadas.'}
        </p>
      ) : (
        <div className="space-y-2">
          {filtradas.map((d) => (
            <div key={d.id} className="rounded-xl border border-cream/12 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-cream/90">{d.titulo}</p>
                  {d.criterio && (
                    <p className="text-xs text-cream/60 mt-1 leading-relaxed">{d.criterio}</p>
                  )}
                  <p className="text-[11px] text-cream/35 mt-1">
                    {new Date(d.decidida_en).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => {
                    // Una decisión no se borra: se deja de aplicar. La historia importa.
                    if (window.confirm('¿Esta decisión deja de aplicar?')) {
                      void derogarDecision(d.id).then(cargar);
                    }
                  }}
                  className="text-[11px] text-cream/35 hover:text-cream/60 shrink-0">
                  Ya no aplica
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════ MI MOTOR ══════════════════ */

function MiMotor() {
  const [e, setE] = useState<EstadoMotor>(() => {
    try { return { ...MOTOR_VACIO, ...JSON.parse(localStorage.getItem(MOTOR_KEY) ?? '{}') }; }
    catch { return MOTOR_VACIO; }
  });
  const [guardado, setGuardado] = useState(false);

  const set = (k: keyof EstadoMotor, v: string) => {
    const n = { ...e, [k]: Math.max(0, parseFloat(v) || 0) };
    setE(n);
    try { localStorage.setItem(MOTOR_KEY, JSON.stringify(n)); } catch { /* noop */ }
    setGuardado(true);
    setTimeout(() => setGuardado(false), 1500);
  };

  const v = veredictoMotor(e);
  const pct = e.objetivo > 0 ? Math.min(100, Math.round((e.cobrado / e.objetivo) * 100)) : 0;

  const CAMPOS: Array<[keyof EstadoMotor, string]> = [
    ['cobrado', 'Cobrado'], ['objetivo', 'Objetivo'],
    ['conversaciones', 'Conversaciones'], ['calificados', 'Calificados'],
    ['agendas', 'Agendas'], ['llamadasTomadas', 'Llamadas tomadas'],
    ['cerradas', 'Cerradas'], ['gastoPauta', 'Gasto en pauta'],
    ['diasSinAgenda', 'Días de pauta sin agenda'],
  ];

  return (
    <div className="space-y-4">
      <div className={`rounded-2xl border p-5 ${
        v.cortar ? 'border-danger/45 bg-danger/[0.07]'
        : v.faltaParaObjetivo === 0 ? 'border-success/30 bg-success/[0.05]'
        : 'border-gold/35 bg-gold/[0.05]'}`}>
        <p className="text-xl text-cream leading-snug" style={{ fontFamily: 'var(--font-display)' }}>
          {v.titular}
        </p>
        {v.accion && <p className="text-sm text-cream/75 mt-2">{v.accion}</p>}

        <div className="mt-4">
          <div className="h-2 rounded-full bg-cream/10 overflow-hidden">
            <div className="h-full bg-gold rounded-full transition-all"
              style={{ width: `${pct}%` }} />
          </div>
          <p className="text-[11px] text-cream/50 mt-1.5">
            ${e.cobrado.toLocaleString()} de ${e.objetivo.toLocaleString()} · {pct}%
          </p>
        </div>
      </div>

      {e.cerradas > 0 && !v.cortar && (
        <p className="text-xs text-cream/55">
          De cada venta vuelven $1.000 a pauta, con tope de $3.000.
          Con {e.cerradas} {e.cerradas === 1 ? 'venta' : 'ventas'} puedes reinvertir
          hasta <strong className="text-gold">${v.reinversionDisponible.toLocaleString()}</strong>.
        </p>
      )}

      {e.diasSinAgenda > 0 && e.diasSinAgenda < DIAS_PAUTA_SIN_AGENDA && (
        <p className="text-xs text-gold/85">
          {e.diasSinAgenda} de {DIAS_PAUTA_SIN_AGENDA} días sin agendas. Al séptimo se corta.
        </p>
      )}

      <div className="rounded-2xl border border-cream/12 p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-cream/50">
            Tus números
          </p>
          {guardado && <span className="text-[11px] text-success/80">Guardado ✓</span>}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {CAMPOS.map(([k, label]) => (
            <div key={k}>
              <label className="block text-[10px] text-cream/45 mb-1">{label}</label>
              <input inputMode="decimal" value={String(e[k] ?? 0)}
                onChange={(ev) => set(k, ev.target.value)}
                className="w-full bg-surface/40 border border-cream/12 rounded-lg px-2 py-1.5 text-sm text-cream" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
