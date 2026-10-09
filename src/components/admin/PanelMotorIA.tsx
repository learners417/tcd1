import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase, db } from '../../lib/supabase';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { mensajeDeFalla, funcionQueNoExiste } from '../../lib/conexion';
import {
  costoPorCliente, comoVaElCosto, enPorciento,
  type GastoDeUno, type ClienteParaElCosto,
} from '../../lib/costoDelCliente';

/**
 * PANEL DEL MOTOR DE IA
 *
 * Para quien mantiene la app. Responde cinco preguntas y nada más: qué se está
 * usando, qué cuesta, a quién le cuesta, qué falla y qué tarda.
 *
 * La tercera se agregó después y es la que decide si el negocio cierra. El
 * total del motor dice si la cuenta del proveedor duele; el costo por cliente
 * dice a quién le duele. Cien dólares repartidos entre cuarenta clientes es el
 * costo de operar. Cien dólares de un solo cliente es un problema con nombre.
 *
 * Este es el tablero del motor, no el del negocio: sin él, optimizar es
 * adivinar.
 */

interface FilaModelo {
  modelo: string; tarea: string;
  llamadas: number; fallas: number; pct_falla: number | null;
  usd_total: number | null; ms_mediana: number | null; ms_p95: number | null;
}
interface FilaFalla {
  creado_en: string; user_id: string;
  modelo: string | null; tarea: string | null; feature: string | null; error: string | null;
}
interface Total {
  usd_total: number; usd_estimado: number;
  llamadas: number; fallas: number; clientes: number;
}

const DIAS = [1, 7, 30] as const;

const usd = (n: number | null | undefined) =>
  n == null ? '—' : `$${Number(n).toFixed(n < 1 ? 4 : 2)}`;
const ms = (n: number | null | undefined) =>
  n == null ? '—' : n >= 1000 ? `${(n / 1000).toFixed(1)} s` : `${Math.round(n)} ms`;

export default function PanelMotorIA({
  clientes = [],
}: {
  clientes?: ClienteParaElCosto[];
}) {
  const [dias, setDias] = useState<number>(7);
  const [modelos, setModelos] = useState<FilaModelo[] | null>(null);
  const [fallas, setFallas] = useState<FilaFalla[] | null>(null);
  const [total, setTotal] = useState<Total | null>(null);
  const [gastos, setGastos] = useState<GastoDeUno[] | null>(null);
  const [cargando, setCargando] = useState(true);
  const [problema, setProblema] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setProblema(null);
    try {
      const [m, f, t, g] = await Promise.all([
        db().rpc('panel_ia_por_modelo', { p_dias: dias }),
        db().rpc('panel_ia_fallas', { p_limite: 20 }),
        db().rpc('panel_ia_total', { p_dias: dias }),
        db().rpc('gasto_ia_por_cliente', { p_dias: dias }),
      ]);

      // Dos causas que se veían iguales y se arreglan distinto. Antes, cualquier
      // error decía «corre sala-de-mando.sql»: después de haberlo corrido, eso
      // manda a repetir una migración y esconde la causa verdadera.
      const roto = [m.error, f.error, t.error, g.error].find(Boolean);
      if (roto) {
        setProblema(
          funcionQueNoExiste(roto)
            ? 'El motor todavía no tiene sus funciones en la base. Corre sala-de-mando.sql en Supabase.'
            : `La base rechazó la consulta del panel: ${roto.message}`,
        );
        setModelos([]); setFallas([]); setTotal(null); setGastos([]);
        return;
      }

      setModelos((m.data ?? []) as FilaModelo[]);
      setFallas((f.data ?? []) as FilaFalla[]);
      setTotal((Array.isArray(t.data) ? t.data[0] : t.data) as Total);
      setGastos((g.data ?? []) as GastoDeUno[]);
    } catch (err) {
      setProblema(mensajeDeFalla(err, 'cargar el panel'));
    } finally {
      setCargando(false);
    }
  }, [dias]);

  useEffect(() => { void cargar(); }, [cargar]);

  const porCliente = useMemo(
    () => costoPorCliente(gastos ?? [], clientes),
    [gastos, clientes],
  );

  const hayEstimado = (total?.usd_estimado ?? 0) > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-5">

      {/* ── Cabecera ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          {DIAS.map((d) => (
            <button key={d} onClick={() => setDias(d)}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                dias === d
                  ? 'bg-gold/20 border border-gold/50 text-gold'
                  : 'border border-cream/15 text-cream/60'}`}>
              {d === 1 ? 'Hoy' : `${d} días`}
            </button>
          ))}
        </div>
        <button onClick={() => void cargar()} disabled={cargando}
          className="flex items-center gap-2 text-sm text-cream/60 disabled:opacity-40">
          <RefreshCw size={13} className={cargando ? 'animate-spin' : ''} />
          {cargando ? 'Cargando…' : 'Actualizar'}
        </button>
      </div>

      {problema && (
        <div className="rounded-2xl border border-gold/30 bg-gold/[0.05] p-4">
          <p className="text-sm text-cream/85">{problema}</p>
        </div>
      )}

      {/* ── Los cuatro números ── */}
      {total && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            ['Gastado', usd(total.usd_total)],
            ['Llamadas', String(total.llamadas ?? 0)],
            ['Fallas', String(total.fallas ?? 0)],
            ['Clientes', String(total.clientes ?? 0)],
          ].map(([l, v]) => (
            <div key={l} className="rounded-2xl border border-cream/12 p-4 text-center">
              <p className="text-2xl text-cream" style={{ fontFamily: 'var(--font-display)' }}>{v}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-cream/45 mt-1">{l}</p>
            </div>
          ))}
        </div>
      )}

      {hayEstimado && (
        <p className="text-sm text-cream/45">
          {usd(total?.usd_estimado)} de ese total se calculó con precios <strong>estimados</strong>,
          no confirmados con el proveedor. Se corrigen cargando la variable PRECIOS_IA.
        </p>
      )}

      {/* ── Qué se usa y qué cuesta ── */}
      <div className="rounded-2xl border border-cream/12 overflow-hidden">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-gold px-4 pt-4 pb-3">
          Por modelo y tarea
        </p>
        {modelos === null ? (
          <p className="px-4 pb-4 text-sm text-cream/40">Cargando…</p>
        ) : modelos.length === 0 ? (
          <p className="px-4 pb-4 text-sm text-cream/40">Sin llamadas en este período.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-cream/45">
                  <th className="text-left font-semibold px-4 py-2">Modelo</th>
                  <th className="text-left font-semibold px-3 py-2">Tarea</th>
                  <th className="text-right font-semibold px-3 py-2">Llamadas</th>
                  <th className="text-right font-semibold px-3 py-2">Fallas</th>
                  <th className="text-right font-semibold px-3 py-2">Costo</th>
                  <th className="text-right font-semibold px-3 py-2">Mediana</th>
                  <th className="text-right font-semibold px-4 py-2">P95</th>
                </tr>
              </thead>
              <tbody>
                {modelos.map((r, i) => {
                  const malo = (r.pct_falla ?? 0) >= 10;
                  return (
                    <tr key={`${r.modelo}-${r.tarea}-${i}`}
                      className="border-t border-cream/[0.07]">
                      <td className="px-4 py-2 text-cream/85">{r.modelo}</td>
                      <td className="px-3 py-2 text-cream/60">{r.tarea}</td>
                      <td className="px-3 py-2 text-right text-cream/70">{r.llamadas}</td>
                      <td className={`px-3 py-2 text-right ${malo ? 'text-danger font-semibold' : 'text-cream/50'}`}>
                        {r.fallas > 0 ? `${r.fallas} (${r.pct_falla}%)` : '—'}
                      </td>
                      <td className="px-3 py-2 text-right text-gold">{usd(r.usd_total)}</td>
                      <td className="px-3 py-2 text-right text-cream/60">{ms(r.ms_mediana)}</td>
                      <td className="px-4 py-2 text-right text-cream/45">{ms(r.ms_p95)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-sm text-cream/40 px-4 py-3 border-t border-cream/[0.07]">
          La mediana dice cómo se siente normalmente. El P95 dice cuánto espera el cliente
          en el peor de cada veinte intentos — es el que hace abandonar.
        </p>
      </div>

      {/* ── A quién le cuesta ──
          El total de arriba dice si la cuenta duele. Esto dice a quién. */}
      <div className="rounded-2xl border border-cream/12 overflow-hidden">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-gold px-4 pt-4 pb-2">
          Lo que cuesta cada cliente
        </p>
        <p className="text-sm text-cream/70 px-4 pb-3 leading-relaxed">
          {gastos === null ? 'Cargando…' : comoVaElCosto(porCliente)}
        </p>
        {porCliente.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-cream/45">
                  <th className="text-left font-semibold px-4 py-2">Cliente</th>
                  <th className="text-right font-semibold px-3 py-2">Pagó</th>
                  <th className="text-right font-semibold px-3 py-2">Gastó en IA</th>
                  <th className="text-right font-semibold px-3 py-2">De su ticket</th>
                  <th className="text-right font-semibold px-4 py-2">Llamadas</th>
                </tr>
              </thead>
              <tbody>
                {porCliente.map((f) => (
                  <tr key={f.id} className="border-t border-cream/[0.07]">
                    <td className="px-4 py-2 text-cream/85">{f.nombre}</td>
                    <td className="px-3 py-2 text-right text-cream/50">${f.ticket.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right text-gold">{usd(f.usd)}</td>
                    <td className={`px-3 py-2 text-right font-semibold ${
                      f.senal === 'actuar' ? 'text-danger'
                      : f.senal === 'mirar' ? 'text-gold'
                      : 'text-cream/45'}`}>
                      {enPorciento(f.porcion)}
                    </td>
                    <td className="px-4 py-2 text-right text-cream/60">{f.llamadas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-sm text-cream/40 px-4 py-3 border-t border-cream/[0.07]">
          Un cliente que pagó una vez y consume IA durante noventa días es una
          suscripción al revés. Este cruce lo muestra ahora, no en el resumen de
          la tarjeta tres meses después.
        </p>
      </div>

      {/* ── Qué está fallando ── */}
      <div className="rounded-2xl border border-cream/12 p-4">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-gold mb-3">
          Últimas fallas
        </p>
        {fallas === null ? (
          <p className="text-sm text-cream/40">Cargando…</p>
        ) : fallas.length === 0 ? (
          <p className="text-sm text-success/70">Ninguna. El motor viene entero.</p>
        ) : (
          <div className="space-y-2">
            {fallas.map((f, i) => (
              <div key={i} className="flex gap-2 items-start border-b border-cream/[0.06] pb-2 last:border-0">
                <AlertTriangle size={13} className="text-danger mt-1 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-cream/45">
                    {new Date(f.creado_en).toLocaleString()} · {f.modelo ?? '—'} · {f.tarea ?? '—'}
                    {f.feature ? ` · ${f.feature}` : ''}
                  </p>
                  <p className="text-sm text-cream/80 break-words">{f.error ?? 'sin detalle'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="text-sm text-cream/40 mt-3">
          El número de arriba dice que algo falla. Esta lista dice por qué.
        </p>
      </div>
    </div>
  );
}
