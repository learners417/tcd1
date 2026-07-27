import { useCallback, useEffect, useMemo, useState } from 'react';
import { cargarSemana, guardarSemana, historialCliente, type SemanaCliente } from '../../lib/mesaPlataStorage';
import { semanaISO } from '../../lib/bitacoraCampana';
import { mensajeDeFalla } from '../../lib/conexion';
import {
  calcularCadena, encontrarDomino, proyectar, formatear, formatearRef, validarNumeros,
  TRAMO_LABEL, SEMANA_VACIA,
  type NumerosSemana, type Indicador, type Tramo,
} from '../../lib/valueChain';

/**
 * TABLERO DE PLATA — la cadena de valor de una cuenta, de punta a punta.
 *
 * No es un panel de métricas. Es un diagnóstico: carga los números de la
 * semana y responde una sola pregunta — dónde está el cuello de botella.
 *
 * Carga manual a propósito. Mientras la API de Meta no entregue estos números
 * sola, una persona los copia de Ads Manager. Son diez campos y dos minutos.
 */

const CAMPOS: Array<{ k: keyof NumerosSemana; label: string; ayuda: string; grupo: string }> = [
  { k: 'precio', label: 'Precio del programa', ayuda: 'Lo que cobra por su programa', grupo: 'Base' },
  { k: 'gasto', label: 'Invertido', ayuda: 'Lo que le pagó a Meta esta semana', grupo: 'Base' },
  { k: 'piezasPublicadas', label: 'Piezas publicadas', ayuda: 'Reels y carruseles que salieron', grupo: 'Base' },

  { k: 'mensajesEnviados', label: 'Mensajes enviados', ayuda: 'Prospección propia, fuera de pauta', grupo: 'Base' },

  { k: 'comentarios', label: 'Comentarios', ayuda: 'Con la palabra clave', grupo: 'Atracción' },
  { k: 'conversaciones', label: 'Conversaciones', ayuda: 'DMs nuevos que empezaron', grupo: 'Atracción' },
  { k: 'agendas', label: 'Agendas', ayuda: 'Reservaron día y hora', grupo: 'Atracción' },

  { k: 'llamadasTomadas', label: 'Llamadas tomadas', ayuda: 'Se presentaron de verdad', grupo: 'Conversión' },
  { k: 'ofertasPresentadas', label: 'Llegó al precio', ayuda: 'Llamadas donde dijo el precio', grupo: 'Conversión' },
  { k: 'ventas', label: 'Ventas', ayuda: 'Dijeron que sí', grupo: 'Conversión' },

  { k: 'facturado', label: 'Facturado', ayuda: 'Lo firmado, cuotas futuras incluidas', grupo: 'Dinero' },
  { k: 'cobrado', label: 'Cobrado', ayuda: 'Lo que entró de verdad esta semana', grupo: 'Dinero' },
  { k: 'cuotasPorCobrar', label: 'Cuotas que tocaban', ayuda: 'De clientes de antes', grupo: 'Dinero' },
  { k: 'cuotasCobradas', label: 'Cuotas que entraron', ayuda: 'De esas, cuántas se cobraron', grupo: 'Dinero' },

  { k: 'clientesActivos', label: 'Clientes activos', ayuda: 'Trabajando con él ahora', grupo: 'Retención' },
  { k: 'clientesQueTerminan', label: 'Terminan', ayuda: 'Se les acaba el servicio', grupo: 'Retención' },
  { k: 'renovaciones', label: 'Renovaron', ayuda: 'De esos, cuántos siguieron', grupo: 'Retención' },
  { k: 'casosDeExito', label: 'Casos de éxito', ayuda: 'Llegaron al resultado prometido', grupo: 'Retención' },
  { k: 'referidos', label: 'Referidos', ayuda: 'Gente nueva que trajo un cliente', grupo: 'Retención' },
];

const COLOR: Record<Indicador['estado'], string> = {
  sano: 'text-success',
  atencion: 'text-gold',
  roto: 'text-danger',
  sin_datos: 'text-cream/35',
};

const PUNTO: Record<Indicador['estado'], string> = {
  sano: 'bg-success', atencion: 'bg-gold', roto: 'bg-danger', sin_datos: 'bg-cream/20',
};

export default function TableroPlata({
  nombreCliente,
  clienteId,
  inicial,
}: {
  nombreCliente?: string;
  /** Sin esto el tablero calcula pero no guarda: no sabe de quién es la semana. */
  clienteId?: string;
  inicial?: Partial<NumerosSemana>;
}) {
  const [n, setN] = useState<NumerosSemana>({ ...SEMANA_VACIA, ...inicial });
  const [objetivo, setObjetivo] = useState(4);
  const [semana] = useState(() => semanaISO());
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState<string | null>(null);
  const [problema, setProblema] = useState<string | null>(null);
  const [historial, setHistorial] = useState<SemanaCliente[]>([]);
  const [verHistorial, setVerHistorial] = useState(false);

  /** Al cambiar de cliente se trae SU semana. Sin esto, el tablero mostraría
   *  los números del cliente anterior, que es la peor forma de equivocarse. */
  useEffect(() => {
    if (!clienteId) return;
    let vivo = true;
    setCargando(true);
    setProblema(null);
    setGuardado(null);
    (async () => {
      try {
        const [sem, hist] = await Promise.all([
          cargarSemana(clienteId, semana),
          historialCliente(clienteId, 12),
        ]);
        if (!vivo) return;
        setN(sem ? sem.numeros : { ...SEMANA_VACIA, ...inicial });
        setHistorial(hist);
      } catch (err) {
        if (vivo) setProblema(mensajeDeFalla(err, 'cargar la semana'));
      } finally {
        if (vivo) setCargando(false);
      }
    })();
    return () => { vivo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteId, semana]);

  const guardar = useCallback(async () => {
    if (!clienteId) return;
    setGuardando(true);
    setProblema(null);
    try {
      await guardarSemana(clienteId, n, 'mensajes', semana);
      setGuardado(new Date().toLocaleTimeString());
      setHistorial(await historialCliente(clienteId, 12));
    } catch (err) {
      // Nunca se limpia el formulario ante un error: perder veinte minutos de
      // carga por un problema de red es la forma más rápida de que dejen de cargar.
      // El error técnico no le sirve a nadie: se traduce a qué pasó y qué hacer.
      setProblema(`${mensajeDeFalla(err, 'guardar la semana')} Tus números siguen acá.`);
    } finally {
      setGuardando(false);
    }
  }, [clienteId, n, semana]);

  const errores = useMemo(() => validarNumeros(n), [n]);
  const cadena = useMemo(() => calcularCadena(n), [n]);
  const domino = useMemo(() => encontrarDomino(cadena), [cadena]);
  const proy = useMemo(() => proyectar(objetivo, n), [objetivo, n]);

  const set = (k: keyof NumerosSemana, v: string) =>
    setN((prev) => ({ ...prev, [k]: Math.max(0, parseFloat(v) || 0) }));

  const grupos = [...new Set(CAMPOS.map((c) => c.grupo))];
  const porTramo = (t: Tramo) => cadena.filter((i) => i.tramo === t);

  const hayDatos = n.conversaciones > 0 || n.gasto > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-5">

      {/* ── LO QUE NO CIERRA ── frena antes de diagnosticar sobre datos imposibles */}
      {errores.length > 0 && (
        <div className="rounded-2xl border border-danger/40 bg-danger/[0.06] p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-danger mb-2">
            Estos números no cierran
          </p>
          <ul className="space-y-1 mb-2">
            {errores.map((e) => (
              <li key={e.campos.join('-')} className="text-sm text-cream/85">· {e.texto}</li>
            ))}
          </ul>
          <p className="text-xs text-cream/50">
            El diagnóstico de abajo está calculado sobre estos números. Corrígelos antes de
            decidir nada.
          </p>
        </div>
      )}

      {/* ── EL DOMINÓ ── */}
      <div className={`rounded-2xl border p-6 ${
        domino.indicador
          ? 'border-danger/40 bg-danger/[0.06]'
          : 'border-success/30 bg-success/[0.05]'}`}>
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-cream/50 mb-2">
          El dominó{nombreCliente ? ` · ${nombreCliente}` : ''}
        </p>
        <h3 className="text-2xl text-cream mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          {domino.titulo}
          {domino.indicador && (
            <span className={`ml-3 ${COLOR[domino.indicador.estado]}`}>
              {formatear(domino.indicador.valor, domino.indicador.formato)}
            </span>
          )}
        </h3>
        {domino.indicador && (
          <p className="text-xs text-cream/45 mb-2">
            Debería estar entre {formatearRef(domino.indicador.ref, domino.indicador.formato)}
            {domino.tramo && ` · tramo de ${TRAMO_LABEL[domino.tramo].toLowerCase()}`}
          </p>
        )}
        <p className="text-sm text-cream/80">{domino.porque}</p>
        {domino.indicador && (
          <p className="text-[11px] text-cream/40 mt-3 border-t border-cream/10 pt-3">
            Este número dice <strong className="text-cream/60">dónde</strong> mirar, no qué arreglar.
            Para saber qué arreglar hay que ver la conversación real: el DM entero, la llamada con
            sus silencios. Ninguna planilla guarda eso.
          </p>
        )}
      </div>

      {/* ── LA CADENA ── */}
      <div className="grid md:grid-cols-3 gap-4">
        {(['atraccion', 'conversion', 'retencion'] as Tramo[]).map((t) => (
          <div key={t} className="rounded-2xl border border-cream/12 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold mb-3">
              {TRAMO_LABEL[t]}
            </p>
            <div className="space-y-3">
              {porTramo(t).map((i) => (
                <div key={i.id} className="flex items-start gap-2">
                  <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${PUNTO[i.estado]}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-2 items-baseline">
                      <span className="text-[13px] text-cream/80 truncate">{i.label}</span>
                      <span className={`text-sm font-semibold shrink-0 ${COLOR[i.estado]}`}>
                        {formatear(i.valor, i.formato)}
                      </span>
                    </div>
                    <p className="text-[10px] text-cream/35">
                      {formatearRef(i.ref, i.formato)}
                      {i.tipo === 'predictivo' && ' · lo decides tú'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── PROYECCIÓN HACIA ATRÁS ── */}
      {hayDatos && (
        <div className="rounded-2xl border border-gold/25 bg-gold/[0.04] p-5">
          <div className="flex items-baseline justify-between flex-wrap gap-3 mb-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold">
              Para llegar a
            </p>
            <div className="flex items-center gap-2">
              <input type="number" inputMode="numeric" min={1} value={objetivo}
                onChange={(e) => setObjetivo(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-16 bg-surface border border-cream/15 rounded-lg px-2 py-1 text-sm text-cream text-center" />
              <span className="text-sm text-cream/70">ventas por semana</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            {[
              ['Conversaciones', proy.conversacionesNecesarias],
              ['Agendas', proy.agendasNecesarias],
              ['Llamadas', proy.llamadasNecesarias],
              ['Inversión', `$${proy.inversionNecesaria}`],
            ].map(([l, v]) => (
              <div key={String(l)} className="rounded-xl bg-ink/40 py-3">
                <p className="text-xl text-cream" style={{ fontFamily: 'var(--font-display)' }}>{v}</p>
                <p className="text-[10px] uppercase tracking-wider text-cream/45">{l}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-cream/60 mt-3">
            Calculado con <strong className="text-cream">sus tasas reales</strong>
            {!proy.usandoRealidad && ' (todavía no hay suficientes, se usan las de referencia)'} y
            un colchón del 30%: se mueve el cuerpo apuntando más alto para aterrizar en el número
            comprometido. <strong className="text-gold">{proy.gobierna}</strong> es lo que gobierna
            la semana — no las ventas, que son consecuencia.
          </p>
        </div>
      )}

      {/* ── CÓMO VIENE ESTA CUENTA ── */}
      {historial.length > 1 && (
        <div className="rounded-2xl border border-cream/12 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-cream/50">
                Cómo viene esta cuenta
              </p>
              <p className="text-xs text-cream/50 mt-1">
                {historial.length} semanas cargadas. La Mesa de plata no es mirar hoy:
                es ver cómo se movió desde la semana pasada.
              </p>
            </div>
            <button onClick={() => setVerHistorial((v) => !v)}
              className="text-[11px] text-cream/40 underline underline-offset-2 shrink-0">
              {verHistorial ? 'Ocultar' : 'Ver'}
            </button>
          </div>

          {verHistorial && (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-cream/40">
                    <th className="text-left font-semibold py-1.5">Semana</th>
                    <th className="text-right font-semibold py-1.5">Invertido</th>
                    <th className="text-right font-semibold py-1.5">Conversaciones</th>
                    <th className="text-right font-semibold py-1.5">Ventas</th>
                    <th className="text-right font-semibold py-1.5">Cobrado</th>
                    <th className="text-left font-semibold py-1.5 pl-3">Cuello de botella</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((h) => {
                    const d = encontrarDomino(calcularCadena(h.numeros));
                    return (
                      <tr key={h.semana} className="border-t border-cream/[0.06]">
                        <td className="py-1.5 text-cream/60">{h.semana}</td>
                        <td className="py-1.5 text-right text-cream/70">${h.numeros.gasto}</td>
                        <td className="py-1.5 text-right text-cream/70">{h.numeros.conversaciones}</td>
                        <td className="py-1.5 text-right text-cream/70">{h.numeros.ventas || '—'}</td>
                        <td className="py-1.5 text-right text-gold">${h.numeros.cobrado}</td>
                        <td className="py-1.5 pl-3 text-cream/60">{d.titulo}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="text-[11px] text-cream/35 mt-2">
                Si el cuello de botella se repite tres semanas seguidas, el problema no es
                la campaña: es lo que hay detrás.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── CARGA ── */}
      <div className="rounded-2xl border border-cream/12 p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-cream/50 mb-1">
          Los números de la semana
        </p>
        <p className="text-xs text-cream/45 mb-4">
          De Meta Business y de lo que reportó el cliente. Dos minutos.
        </p>
        {grupos.map((g) => (
          <div key={g} className="mb-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gold/70 mb-2">{g}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {CAMPOS.filter((c) => c.grupo === g).map((c) => (
                <div key={c.k}>
                  <label className="block text-[11px] text-cream/60 mb-1" htmlFor={`f-${c.k}`}>
                    {c.label}
                  </label>
                  <input id={`f-${c.k}`} type="number" inputMode="numeric" min={0} value={n[c.k] || ''}
                    onChange={(e) => set(c.k, e.target.value)}
                    placeholder="0"
                    className={`w-full bg-surface rounded-lg px-3 py-2 text-sm text-cream border ${
                      errores.some((e) => e.campos.includes(c.k))
                        ? 'border-danger/60' : 'border-cream/15'}`} />
                  <p className="text-[10px] text-cream/30 mt-0.5">{c.ayuda}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
        {clienteId ? (
          <>
            <button onClick={() => void guardar()} disabled={guardando || cargando}
              className="w-full btn-primary py-3 rounded-xl text-sm font-bold mt-2 disabled:opacity-50">
              {guardando ? 'Guardando…' : cargando ? 'Cargando…' : `Guardar la semana ${semana}`}
            </button>
            {guardado && (
              <p className="text-[11px] text-success/80 mt-2">
                Guardado a las {guardado}. Queda en el historial de esta cuenta.
              </p>
            )}
            {problema && (
              <p className="text-[11px] text-danger/90 mt-2">{problema}</p>
            )}
          </>
        ) : (
          <p className="text-[11px] text-cream/45 mt-2">
            Elige un cliente arriba para poder guardar esta semana.
          </p>
        )}
      </div>
    </div>
  );
}
