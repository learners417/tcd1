/**
 * EL TABLERO-SEMÁFORO (T5 del Manual de Anuncios).
 * Diario: UN número (conversaciones). Viernes: cuatro por anuncio.
 * El tablero no muestra métricas — DICE LA DECISIÓN, con las reglas:
 * >$0,07 por visita → se apaga · conversaciones sin agendas → es la página
 * o el DM · primeros 14 días → se mide, no se opina.
 */
import React, { useState } from 'react';
import { METRICAS_REGLAS } from '../../lib/formulasAnuncios';

const KEY_DIA = 'tcd_tablero_diario_v1';
const KEY_SEM = 'tcd_tablero_semana_v1';

interface FilaAnuncio { gasto: string; visitas: string; conversaciones: string; agendas: string }
const FILA0: FilaAnuncio = { gasto: '', visitas: '', conversaciones: '', agendas: '' };

function leer<T>(k: string, def: T): T {
  try { return JSON.parse(localStorage.getItem(k) ?? '') as T; } catch { return def; }
}
const hoy = () => new Date().toISOString().slice(0, 10);

export default function TableroCupos({ diasCampana }: { diasCampana: number }) {
  const [diario, setDiario] = useState<Record<string, number>>(() => leer(KEY_DIA, {}));
  const [convHoy, setConvHoy] = useState<string>(() => String(leer<Record<string, number>>(KEY_DIA, {})[hoy()] ?? ''));
  const [semana, setSemana] = useState<FilaAnuncio[]>(() => leer(KEY_SEM, [FILA0, FILA0, FILA0]));

  const guardarDia = () => {
    const n = { ...diario, [hoy()]: Math.max(0, parseInt(convHoy || '0', 10) || 0) };
    setDiario(n);
    try { localStorage.setItem(KEY_DIA, JSON.stringify(n)); } catch { /* noop */ }
  };
  const setFila = (i: number, k: keyof FilaAnuncio, v: string) => {
    const n = semana.map((f, j) => (j === i ? { ...f, [k]: v } : f));
    setSemana(n);
    try { localStorage.setItem(KEY_SEM, JSON.stringify(n)); } catch { /* noop */ }
  };

  const num = (v: string) => parseFloat(v || '0') || 0;
  const enMedicion = diasCampana <= METRICAS_REGLAS.diasSinOpinar;

  const veredicto = (f: FilaAnuncio): { color: string; texto: string } | null => {
    const g = num(f.gasto), vis = num(f.visitas), c = num(f.conversaciones), a = num(f.agendas);
    if (!g && !vis && !c) return null;
    const cpv = vis > 0 ? g / vis : null;
    if (cpv !== null && cpv > METRICAS_REGLAS.maxCostoPorVisitaUSD)
      return { color: 'text-danger', texto: `🔴 $${cpv.toFixed(2)} por visita (tope $${METRICAS_REGLAS.maxCostoPorVisitaUSD}) — apágalo. Refresca el creativo con otro hook.` };
    if (c >= 5 && a === 0)
      return { color: 'text-gold', texto: '🟡 Conversaciones sí, agendas no — el problema NO es el anuncio: revisa tu página y tu DM antes de tocar nada.' };
    if (c > 0 && a > 0)
      return { color: 'text-success', texto: `🟢 $${c ? (g / c).toFixed(2) : '—'} por conversación y agenda. Este queda.` };
    return { color: 'text-cream/60', texto: 'Cargando datos… con más números, el tablero decide.' };
  };

  const totalSemana = semana.reduce((t, f) => t + num(f.conversaciones), 0);

  return (
    <div className="space-y-4 text-left">
      {enMedicion ? (
        <div className="rounded-2xl border border-gold/25 bg-gold/[0.05] p-4">
          <p className="text-sm text-cream/85">⏳ <strong>Se mide, no se opina.</strong> Faltan {METRICAS_REGLAS.diasSinOpinar - diasCampana + 1} días para decidir. Hoy tu único trabajo es cargar y atender.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-cream/15 p-4">
          <p className="text-sm text-cream/85">✅ Pasaste los 14 días: las reglas de abajo deciden. {diasCampana >= 21 ? 'Y ya toca refrescar el creativo del ganador — mismo esqueleto, otro hook.' : ''}</p>
        </div>
      )}

      {/* CARGA DIARIA */}
      <div className="card-panel p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-cream/60 mb-2">Hoy · 30 segundos</p>
        <div className="flex items-center gap-3">
          <input inputMode="numeric" value={convHoy} onChange={(e) => setConvHoy(e.target.value)}
            placeholder="0"
            className="w-24 bg-surface/40 border border-cream/10 rounded-xl px-3 py-2 text-lg text-cream text-center focus:border-gold/40 outline-none" />
          <p className="text-sm text-cream/70 flex-1">conversaciones nuevas (comentarios con tu PALABRA + DMs)</p>
          <button onClick={guardarDia} className="btn-primary text-xs font-bold px-4 py-2 rounded-xl">Guardar</button>
        </div>
      </div>

      {/* CARGA DEL VIERNES */}
      <div className="card-panel p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-cream/60 mb-1">El viernes · por anuncio</p>
        <p className="text-xs text-cream/50 mb-3">Los números salen del administrador de anuncios y de tu agenda. Cuatro por anuncio, una vez por semana.</p>
        {semana.map((f, i) => {
          const v = veredicto(f);
          return (
            <div key={i} className="rounded-xl border border-cream/10 p-3 mb-2">
              <p className="text-xs font-bold text-cream mb-2">Anuncio {i + 1}</p>
              <div className="grid grid-cols-4 gap-2">
                {(['gasto', 'visitas', 'conversaciones', 'agendas'] as const).map((k) => (
                  <div key={k}>
                    <p className="text-[10px] text-cream/45 mb-1">{k === 'gasto' ? 'Gasto USD' : k === 'visitas' ? 'Visitas perfil' : k === 'conversaciones' ? 'Conversac.' : 'Agendas'}</p>
                    <input inputMode="decimal" value={f[k]} onChange={(e) => setFila(i, k, e.target.value)}
                      className="w-full bg-surface/40 border border-cream/10 rounded-lg px-2 py-1.5 text-sm text-cream text-center focus:border-gold/40 outline-none" />
                  </div>
                ))}
              </div>
              {v && <p className={`text-xs mt-2 leading-relaxed ${v.color}`}>{v.texto}{enMedicion ? ' (Aún no actúes: estás midiendo.)' : ''}</p>}
            </div>
          );
        })}
        {totalSemana > 0 && (
          <p className="text-[11px] text-cream/45 mt-1">La cuenta de los 10: ~5 conversaciones por día te dan las ~300 del mes — de ahí salen tus agendas y tus llamadas.</p>
        )}
      </div>
    </div>
  );
}
