/**
 * TableroDirector — T8 · Plan Maestro.
 * Visible en Hoy desde el día 29: el ROAS vivo (M3) y el Semáforo de la
 * Revisión D45 (M4) — la garantía que obliga. Los números que el fundador
 * carga se guardan localmente; las evidencias reales los respaldan.
 */
import React, { useEffect, useState } from 'react';

const KEY = 'tcd_tablero_director_v1';
interface Datos { invertido: number; facturado: number; conversaciones: number; llamadas: number }

export default function TableroDirector({ diaPrograma, completadasCount, metasEsperadas }: {
  diaPrograma: number; completadasCount: number; metasEsperadas: number;
}) {
  const [d, setD] = useState<Datos>({ invertido: 0, facturado: 0, conversaciones: 0, llamadas: 0 });
  const [editando, setEditando] = useState(false);
  useEffect(() => { try { const r = localStorage.getItem(KEY); if (r) setD(JSON.parse(r)); } catch { /* noop */ } }, []);
  const guardar = (n: Datos) => { setD(n); try { localStorage.setItem(KEY, JSON.stringify(n)); } catch { /* noop */ } };

  if (diaPrograma < 29) return null;

  const roas = d.invertido > 0 ? d.facturado / d.invertido : 0;
  const zona = roas >= 5 ? { c: '#22C55E', t: 'x5+ · objetivo cumplido 🏆' } : roas >= 4 ? { c: '#22C55E', t: 'x4 · retorno digno ✓' } : roas >= 3 ? { c: '#E8962E', t: 'x3 · se interviene — habla con tu Mentor' } : d.facturado > 0 ? { c: '#EF4444', t: 'bajo x3 · revisión de sistema' } : { c: '#F2EFE9', t: 'esperando la primera venta' };

  // Semáforo D45: camino al día + actividad de caza real
  const alDia = completadasCount >= metasEsperadas - 3;
  const actividad = d.conversaciones >= 30 || d.llamadas >= 8;
  const verde = alDia && (diaPrograma < 35 || actividad);
  const faltas: string[] = [];
  if (!alDia) faltas.push(`camino al día (${completadasCount}/${metasEsperadas} sesiones)`);
  if (diaPrograma >= 35 && !actividad) faltas.push('actividad de caza (≥30 conversaciones u 8 llamadas)');

  return (
    <div className="card-panel p-6 border border-white/[0.06]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[11px] font-bold text-cream tracking-widest uppercase">El tablero del director</h2>
        <button onClick={() => setEditando(!editando)} className="text-[11px] text-gold/70 hover:text-gold uppercase font-bold tracking-wider">{editando ? 'Listo ✓' : 'Actualizar números'}</button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {([['invertido', '💸 Invertido (USD)'], ['facturado', '💰 Facturado (USD)'], ['conversaciones', '💬 Conversaciones'], ['llamadas', '📞 Llamadas']] as const).map(([k, label]) => (
          <div key={k} className="rounded-xl bg-white/[0.03] border border-white/[0.07] p-3">
            <p className="text-[11px] text-white/55 uppercase font-bold tracking-wider mb-1">{label}</p>
            {editando ? (
              <input type="number" value={d[k]} onChange={(e) => guardar({ ...d, [k]: Math.max(0, Number(e.target.value) || 0) })}
                className="w-full bg-transparent text-lg text-cream focus:outline-none border-b border-gold/40" />
            ) : (
              <p className="text-lg text-cream">{k === 'invertido' || k === 'facturado' ? `$${d[k].toLocaleString()}` : d[k]}</p>
            )}
          </div>
        ))}
      </div>
      {/* ROAS vivo */}
      <div className="flex items-center justify-between rounded-xl px-4 py-3 mb-3" style={{ background: `${zona.c}12`, border: `1px solid ${zona.c}35` }}>
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: zona.c }}>Retorno: {d.invertido > 0 && d.facturado > 0 ? `x${roas.toFixed(1)}` : '—'}</p>
        <p className="text-[11px]" style={{ color: zona.c }}>{zona.t}</p>
      </div>
      {/* Semáforo de la Revisión D45 */}
      <div className={`rounded-xl px-4 py-3 border ${verde ? 'bg-success/[0.07] border-success/25' : 'bg-gold/[0.07] border-gold/25'}`}>
        <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${verde ? 'text-success' : 'text-gold'}`}>
          {verde ? '🟢 Tu Revisión de Sistema: EN VERDE' : '🟡 Tu Revisión de Sistema: en pausa'}
        </p>
        <p className="text-[11px] text-white/55 leading-relaxed">
          {verde
            ? diaPrograma >= 45 && d.facturado === 0
              ? 'Día 45+ sin primera venta y con todo cumplido: te corresponde la Revisión con el equipo. Escríbenos por WhatsApp — el sistema se audita contigo, por contrato.'
              : 'Si llegas al día 45 sin tu primera venta habiendo cumplido todo, el equipo revisa tu sistema contigo — por contrato. Sigue así.'
            : `Se desbloquea cumpliendo: ${faltas.join(' · ')}. Igual que los cinturones — la revisión se gana.`}
        </p>
      </div>
    </div>
  );
}
