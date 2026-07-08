import React, { useEffect, useState } from 'react';
import { ChevronRight, CheckCircle2, Clock, Calendar, Target, Play, Wrench, MessageCircle, Bot, Sparkles } from 'lucide-react';
import { supabase, isSupabaseReady } from '../lib/supabase';
import { getActiveDaysThisWeek } from '../lib/activity';
import { cinturonDesdeProgreso, CINTURONES } from '../lib/cinturones';
import { calcularRacha, esDiaDescanso, hoyTieneSesion } from '../lib/racha';
import ReporteDirector from '../components/ReporteDirector';
import CintaCinturon from '../components/CintaCinturon';
import { SEED_ROADMAP_V2 } from '../lib/roadmapSeed';
import type { RoadmapMeta } from '../lib/roadmapSeed';

function getTypeBadge(tipo?: string) {
  switch (tipo) {
    case 'VIDEO': return 'bg-[#E8962E]/15 text-[#E8962E] border-[#E8962E]/25';
    case 'HERRAMIENTA': return 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/25';
    case 'COACH': return 'bg-[#F2EFE9]/10 text-[#F2EFE9]/70 border-[#F2EFE9]/15';
    default: return 'bg-[#F2EFE9]/5 text-[#F2EFE9]/50 border-[#F2EFE9]/10';
  }
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="card-panel p-5">
      <p className="text-[10px] text-[#F2EFE9]/40 uppercase tracking-widest mb-2 font-semibold">{label}</p>
      <p className="text-2xl font-light text-[#F2EFE9] tracking-tight">{value}</p>
      <p className="text-xs text-[#F2EFE9]/50 mt-1">{sub}</p>
    </div>
  );
}

interface TareaHoy extends RoadmapMeta {
  pilarNumero: number;
  pilarTitulo: string;
}

interface ProximoHito {
  titulo: string;
  subtitulo: string;
  pilarNumero: number;
  metasTotal: number;
  metasCompletadas: number;
  hitoMensaje?: string;
  tareasRestantes: { titulo: string; tipo: string }[];
  diaPrograma: number;
}

export default function Dashboard({ setCurrentPage, userId }: { setCurrentPage: (page: string) => void, userId?: string }) {
  const [data, setData] = useState({
    profile: { nombre: '', fecha_inicio: new Date().toISOString() },
    semanaActual: 1,
    totalTareas: 0,
    completadas: 0,
    pilaresCompletados: 0,
    tareasHoy: [] as TareaHoy[],
    racha: 0,
    diasConectados: 0,
  });
  const [proximoHito, setProximoHito] = useState<ProximoHito | null>(null);
  // G2: las sesiones se abren en El Camino (un solo lugar, con evidencia y checklist)
  // G3: el valor visible — las ventas del sistema
  const [ventasTotal, setVentasTotal] = useState<{ suma: number; count: number }>({ suma: 0, count: 0 });
  const [showReporte, setShowReporte] = useState(false);
  useEffect(() => {
    if (!isSupabaseReady() || !supabase || !userId) return;
    supabase.from('ventas_registradas').select('monto').eq('usuario_id', userId).then(({ data }) => {
      const montos = (data ?? []).map((v: { monto: number | null }) => Number(v.monto) || 0);
      setVentasTotal({ suma: montos.reduce((a: number, b: number) => a + b, 0), count: montos.length });
    });
  }, [userId]);

  useEffect(() => {
    async function loadData() {
      let p: { fecha_inicio?: string; nombre?: string; [k: string]: unknown } = {}; try { p = JSON.parse(localStorage.getItem('tcd_profile') || '{}'); } catch { /* perfil corrupto: usar vacío */ }
      const dInicio = p.fecha_inicio ? new Date(p.fecha_inicio) : new Date();
      const diff = Math.floor((new Date().getTime() - dInicio.getTime()) / (1000 * 60 * 60 * 24));
      const semActual = Math.max(1, Math.min(13, Math.floor(diff / 7) + 1));

      let completadasSet: Set<string>;
      try {
        const saved = localStorage.getItem('tcd_hoja_ruta_v2');
        completadasSet = saved ? new Set(JSON.parse(saved)) : new Set();
      } catch {
        completadasSet = new Set();
      }

      let tot = 0;
      let comp = 0;
      let pilaresComp = 0;
      const tareasHoy: TareaHoy[] = [];

      for (const pil of SEED_ROADMAP_V2) {
        const metasPilar = pil.metas ?? [];
        const completadasPilar = metasPilar.filter((m) => completadasSet.has(`${pil.numero}-${m.codigo}`)).length;
        tot += metasPilar.length;
        comp += completadasPilar;
        if (completadasPilar >= metasPilar.length && metasPilar.length > 0) pilaresComp++;

        if (tareasHoy.length < 3) {
          for (const meta of metasPilar) {
            if (!completadasSet.has(`${pil.numero}-${meta.codigo}`) && tareasHoy.length < 3) {
              tareasHoy.push({ ...meta, pilarNumero: pil.numero, pilarTitulo: pil.titulo });
            }
          }
        }
      }

      const diaPrograma = Math.max(1, diff + 1);

      let hito: ProximoHito | null = null;
      for (const pil of SEED_ROADMAP_V2) {
        const metasPilar = pil.metas ?? [];
        const completadasPilar = metasPilar.filter((m) => completadasSet.has(`${pil.numero}-${m.codigo}`)).length;
        if (completadasPilar < metasPilar.length) {
          const pendientes = metasPilar
            .filter((m) => !completadasSet.has(`${pil.numero}-${m.codigo}`))
            .slice(0, 3)
            .map((m) => ({ titulo: m.titulo, tipo: m.tipo || '' }));
          hito = {
            titulo: pil.titulo,
            subtitulo: pil.subtitulo,
            pilarNumero: pil.numero,
            metasTotal: metasPilar.length,
            metasCompletadas: completadasPilar,
            hitoMensaje: (pil as any).hito_mensaje,
            tareasRestantes: pendientes,
            diaPrograma,
          };
          break;
        }
      }

      let diary: { entries?: unknown[] } = {}; try { diary = JSON.parse(localStorage.getItem('tcd_diario_v2') || '{}'); } catch { /* diario corrupto */ }
      const rachaLocal = Array.isArray(diary.entries) ? diary.entries.length : 0;

      setData({
        profile: { nombre: p.nombre || '', fecha_inicio: p.fecha_inicio || new Date().toISOString() },
        semanaActual: semActual,
        totalTareas: tot,
        completadas: comp,
        pilaresCompletados: pilaresComp,
        tareasHoy,
        racha: rachaLocal,
        diasConectados: 0,
      });
      setProximoHito(hito);

      if (isSupabaseReady() && supabase && userId) {
        const { data: hrRows } = await supabase
          .from('hoja_de_ruta')
          .select('pilar_numero, meta_codigo, completada')
          .eq('usuario_id', userId);

        if (hrRows && hrRows.length > 0) {
          const sbSet = new Set<string>(
            hrRows.filter((r: any) => r.completada).map((r: any) => `${r.pilar_numero}-${r.meta_codigo}`)
          );

          let sTot = 0, sComp = 0, sPilaresComp = 0;
          const sTareasHoy: TareaHoy[] = [];
          let sHito: ProximoHito | null = null;

          for (const pil of SEED_ROADMAP_V2) {
            const metasPilar = pil.metas ?? [];
            const completadasPilar = metasPilar.filter((m) => sbSet.has(`${pil.numero}-${m.codigo}`)).length;
            sTot += metasPilar.length;
            sComp += completadasPilar;
            if (completadasPilar >= metasPilar.length && metasPilar.length > 0) sPilaresComp++;

            if (sTareasHoy.length < 3) {
              for (const meta of metasPilar) {
                if (!sbSet.has(`${pil.numero}-${meta.codigo}`) && sTareasHoy.length < 3) {
                  sTareasHoy.push({ ...meta, pilarNumero: pil.numero, pilarTitulo: pil.titulo });
                }
              }
            }
          }

          for (const pil of SEED_ROADMAP_V2) {
            const metasPilar = pil.metas ?? [];
            const completadasPilar = metasPilar.filter((m) => sbSet.has(`${pil.numero}-${m.codigo}`)).length;
            if (completadasPilar < metasPilar.length) {
              const pendientes = metasPilar
                .filter((m) => !sbSet.has(`${pil.numero}-${m.codigo}`))
                .slice(0, 3)
                .map((m) => ({ titulo: m.titulo, tipo: m.tipo || '' }));
              sHito = {
                titulo: pil.titulo,
                subtitulo: pil.subtitulo,
                pilarNumero: pil.numero,
                metasTotal: metasPilar.length,
                metasCompletadas: completadasPilar,
                hitoMensaje: (pil as any).hito_mensaje,
                tareasRestantes: pendientes,
                diaPrograma: Math.max(1, diff + 1),
              };
              break;
            }
          }

          setData(prev => ({ ...prev, totalTareas: sTot, completadas: sComp, pilaresCompletados: sPilaresComp, tareasHoy: sTareasHoy }));
          setProximoHito(sHito);
        }

        const { data: qd } = await supabase.from('diario_entradas').select('id').eq('user_id', userId);
        if (qd) setData(prev => ({ ...prev, racha: qd.length }));

        const diasConectados = await getActiveDaysThisWeek(userId);
        setData(prev => ({ ...prev, diasConectados }));
      }
    }
    loadData();
  }, [userId]);

  const pctTareas = data.totalTareas > 0 ? Math.round((data.completadas / data.totalTareas) * 100) : 0;
  const pctHito = proximoHito && proximoHito.metasTotal > 0
    ? Math.round((proximoHito.metasCompletadas / proximoHito.metasTotal) * 100)
    : 0;
  const tareasRestantesHito = proximoHito ? proximoHito.metasTotal - proximoHito.metasCompletadas : 0;

  const nombreDisplay = data.profile.nombre || 'bienvenida';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 anímate-in fade-in duration-500">

      {/* ZONA A — Header contextual */}
      <div className="relative overflow-hidden card-panel p-8 border border-[#E8962E]/20 bg-gradient-to-br from-[#E8962E]/[0.05] to-transparent">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#E8962E]/10 blur-[100px] rounded-full" />
        <div className="relative z-10">
          <p className="text-2xl font-light text-[#F2EFE9] mb-2" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>Buenos días, {nombreDisplay}.</p>
          <p className="text-sm text-[#F2EFE9]/60 max-w-lg mb-6 leading-relaxed">
            Llevas <strong className="text-[#F2EFE9]/90">{(() => { try { const saved = localStorage.getItem('tcd_hoja_ruta_v2'); const c = cinturonDesdeProgreso(new Set(saved ? JSON.parse(saved) : [])); return `${c.emoji} Cinturón ${c.nombre} — ${c.metafora}`; } catch { return '⬜ Cinturón Blanco'; } })()}</strong>. Hoy tienes <strong className="text-[#E8962E]">{data.tareasHoy.length} {data.tareasHoy.length === 1 ? 'paso' : 'pasos'}</strong> para acercarte al siguiente.
          </p>
          {(() => {
            try {
              const saved = localStorage.getItem('tcd_hoja_ruta_v2');
              const c = cinturonDesdeProgreso(new Set(saved ? JSON.parse(saved) : []));
              return <div className="mt-5 max-w-md"><CintaCinturon cinturon={c} variante="hero" /></div>;
            } catch { return null; }
          })()}
          <button onClick={() => setCurrentPage('roadmap')} className="text-[11px] font-bold text-[#E8962E] hover:text-[#F4B65C] transition-colors flex items-center gap-1.5 uppercase tracking-widest bg-[#E8962E]/10 px-4 py-2 rounded-lg border border-[#E8962E]/20 w-max">
            Ver hoja de ruta <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ZONA B — 4 tarjetas de métricas clave */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {(() => {
          let cint = CINTURONES[0];
          try { const saved = localStorage.getItem('tcd_hoja_ruta_v2'); cint = cinturonDesdeProgreso(new Set(saved ? JSON.parse(saved) : [])); } catch { /* noop */ }
          const prox = CINTURONES.find((c) => c.orden === cint.orden + 1);
          return (
            <>
              <MetricCard label="Tu cinturón" value={`${cint.emoji} ${cint.nombre}`} sub={cint.metafora} />
              <MetricCard label="El que sigue" value={prox ? `${prox.emoji} ${prox.nombre}` : '⬛ ¡Lo lograste!'} sub={prox ? prox.metafora : 'Sanador Libre'} />
            </>
          );
        })()}
        <MetricCard label="Pasos del camino" value={`${data.completadas}/${data.totalTareas}`} sub={`${pctTareas}% recorrido`} />
        <MetricCard label="Racha" value={`${(() => { try { const p = JSON.parse(localStorage.getItem('tcd_profile') ?? '{}'); return calcularRacha(p?.fecha_inicio ?? null); } catch { return 0; } })()} 🔥`} sub={(() => { const wd = new Date().getDay(); if (wd === 0 || wd === 6) return "El dojo respira 🌿 · nos vemos el lunes"; return hoyTieneSesion() ? "Días hábiles seguidos · seguí así" : "Hacé tu sesión de hoy para sumar"; })()} />
        <MetricCard label="Días conectados" value={`${data.diasConectados}/7`} sub={data.diasConectados > 0 ? 'Esta semana' : 'Empieza hoy'} />
      </div>

      {/* ═══ G3 · EL VALOR VISIBLE ═══ */}
      {ventasTotal.count > 0 && (
        <div className="rounded-2xl border border-[#22C55E]/30 bg-gradient-to-r from-[#22C55E]/[0.08] to-transparent p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#22C55E]">Tu sistema, en números</p>
            <p className="text-2xl font-light text-[#F2EFE9] mt-1">${ventasTotal.suma.toLocaleString()} <span className="text-sm text-[#F2EFE9]/50">facturados · {ventasTotal.count} paciente{ventasTotal.count !== 1 ? 's' : ''}</span></p>
          </div>
          <div className="text-right">
            <button onClick={() => setShowReporte(true)} className="text-[10px] font-bold uppercase tracking-widest text-[#E8962E] hover:text-[#F4B65C] transition-colors mb-1 block ml-auto">📄 Reporte del Director</button>
            <p className="text-[10px] uppercase tracking-widest text-[#F2EFE9]/40">Tu inversión</p>
            <p className={`text-lg font-semibold ${ventasTotal.suma >= 2000 ? 'text-[#22C55E]' : 'text-[#E8962E]'}`}>
              {ventasTotal.suma >= 2000 ? `Recuperada ${(ventasTotal.suma / 2000).toFixed(1)}×` : `${Math.round((ventasTotal.suma / 2000) * 100)}% recuperada`}
            </p>
          </div>
        </div>
      )}

      {/* G3 · Día 75: Tu clínica sigue */}
      {(() => {
        let diaG3 = 1;
        try { const p = JSON.parse(localStorage.getItem('tcd_profile') ?? '{}'); if (p?.fecha_inicio) diaG3 = Math.max(1, Math.floor((Date.now() - new Date(p.fecha_inicio).getTime()) / 86400000) + 1); } catch { /* noop */ }
        if (diaG3 < 75) return null;
        return (
          <div className="rounded-2xl border border-[#E8962E]/35 bg-gradient-to-br from-[#E8962E]/[0.08] to-transparent p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#E8962E] mb-2">🏥 Tu clínica sigue</p>
            <p className="text-lg text-[#F2EFE9]/90 font-light" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>El día 90 termina El Camino — pero tu clínica no se apaga.</p>
            <p className="text-sm text-[#F2EFE9]/60 mt-2 leading-relaxed">Tu agente de WhatsApp, tu agenda, el portal de tus pacientes, tus métricas y tus créditos siguen trabajando con <strong className="text-[#F2EFE9]/90">MiClínica Digital · $147/mes</strong>. Todo lo que construiste, funcionando — sin que tengas que tocar nada.</p>
            <button onClick={() => setCurrentPage('coach')} className="mt-4 px-5 py-2.5 rounded-xl bg-[#E8962E] text-black text-sm font-bold hover:bg-[#F4B65C] transition-colors">Quiero que mi clínica siga →</button>
          </div>
        );
      })()}

      {/* ZONA C — Dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Foco de Hoy (60%) */}
        <div className="lg:col-span-7 card-panel p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[11px] font-bold text-[#F2EFE9] tracking-widest uppercase">Tu sesión de hoy</h2>
            <button onClick={() => setCurrentPage('roadmap')} className="text-[10px] text-[#F2EFE9]/40 hover:text-[#E8962E] uppercase font-bold tracking-wider transition-colors">
              Ir a tareas →
            </button>
          </div>

          <div className="space-y-3">
            {(() => {
              // Día de descanso del programa: el dojo respira
              const diaProg = (() => { try { const p = JSON.parse(localStorage.getItem('tcd_profile') ?? '{}'); if (p?.fecha_inicio) return Math.max(1, Math.floor((Date.now() - new Date(p.fecha_inicio).getTime()) / 86400000) + 1); } catch { /* noop */ } return 1; })();
              if (esDiaDescanso(diaProg) && data.tareasHoy.length > 0) {
                return (
                  <div className="py-12 text-center border border-[#22C55E]/20 rounded-2xl bg-gradient-to-b from-[#22C55E]/[0.06] to-transparent">
                    <p className="text-4xl mb-3">🌿</p>
                    <p className="text-base text-[#F2EFE9]/85 font-medium">Día de descanso — el dojo también respira</p>
                    <p className="text-xs text-[#F2EFE9]/45 mt-2">Tu racha está protegida 🛡️ · Si quieres adelantar, El Camino está abierto — pero descansar también es entrenar.</p>
                  </div>
                );
              }
              return null;
            })()}
            {data.tareasHoy.length === 0 ? (
              <div className="py-10 text-center border border-dashed border-[rgba(232,150,46,0.10)] rounded-xl bg-[#1A1917]/30">
                <CheckCircle2 className="w-8 h-8 text-[#22C55E]/50 mx-auto mb-3" />
                <p className="text-sm text-[#F2EFE9]/60">Todo al día. Estás libre.</p>
                <p className="text-xs text-[#F2EFE9]/30 mt-1">Mira El Camino para ver lo que sigue.</p>
              </div>
            ) : (
              <>
              {/* LA SESIÓN DE HOY — el hero del dojo */}
              {data.tareasHoy[0] && (
                <button
                  onClick={() => { try { localStorage.setItem('tcd_abrir_pilar', String(data.tareasHoy[0].pilarNumero ?? '')); } catch { /* noop */ } setCurrentPage('roadmap'); }}
                  className="w-full text-left rounded-2xl border-2 border-[#E8962E]/40 bg-gradient-to-br from-[#E8962E]/[0.10] to-transparent p-6 hover:border-[#E8962E]/70 hover:shadow-[0_0_30px_rgba(232,150,46,0.10)] transition-all group"
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#E8962E] mb-2">▶ Tu sesión de hoy</p>
                  <p className="text-xl font-medium text-[#F2EFE9] mb-1" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>{data.tareasHoy[0].titulo}</p>
                  <p className="text-xs text-[#F2EFE9]/50 mb-4">{data.tareasHoy[0].tiempo_estimado} · {data.tareasHoy[0].tipo === 'VIDEO' ? 'Contenido' : data.tareasHoy[0].tipo === 'HERRAMIENTA' ? 'Producción' : 'Sesión de trabajo'}</p>
                  <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E8962E] text-black text-sm font-bold group-hover:bg-[#F4B65C] transition-colors">COMENZAR →</span>
                </button>
              )}
              {data.tareasHoy.slice(1).map((t, idx) => (
              <div
                key={idx}
                className="group flex items-start gap-4 p-4 rounded-xl bg-[#1A1917]/30 border border-[rgba(232,150,46,0.1)] hover:bg-[#1A1917]/60 hover:border-[rgba(232,150,46,0.14)] transition-all cursor-pointer"
                onClick={() => { try { localStorage.setItem('tcd_abrir_pilar', String(t.pilarNumero ?? '')); } catch { /* noop */ } setCurrentPage('roadmap'); }}
              >
                <div className="shrink-0 mt-0.5">
                  <div className="w-5 h-5 rounded-full border border-[#F2EFE9]/20 group-hover:border-[#E8962E] transition-colors flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-transparent group-hover:bg-[#E8962E] rounded-full" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#F2EFE9]/90">{t.titulo}</p>
                  <p className="text-[10px] text-[#F2EFE9]/40 mt-1">{t.pilarTitulo}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border tracking-wider ${getTypeBadge(t.tipo)}`}>
                      {t.tipo || `Pilar ${t.pilarNumero}`}
                    </span>
                    <span className="text-[10px] text-[#F2EFE9]/40 flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3" /> {t.tiempo_estimado || '15–30 min'}
                    </span>
                    {t.herramienta_id && (
                      <span className="text-[9px] text-[#E8962E] font-bold uppercase tracking-wider">Ver herramienta →</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
              </>
            )}
          </div>
        </div>

        {/* Inspiración del Día */}
        <div className="lg:col-span-5 card-panel p-6 relative overflow-hidden flex flex-col justify-between border-[#E8962E]/15 bg-gradient-to-br from-[#E8962E]/[0.05] to-transparent">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#E8962E]/10 blur-[50px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#22C55E]/5 blur-[40px] rounded-full" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[11px] font-bold text-[#E8962E] tracking-widest uppercase flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E8962E] ring-4 ring-[#E8962E]/20" /> Inspiración del día
              </h2>
              <div className="flex items-center gap-1.5 bg-[#E8962E]/10 px-3 py-1 rounded-full border border-[#E8962E]/20">
                <Sparkles className="w-3 h-3 text-[#E8962E]" />
                <span className="text-[10px] font-bold text-[#E8962E]">Día {proximoHito?.diaPrograma ?? 1}/90</span>
              </div>
            </div>

            {(() => {
              const QUOTES = [
                { text: "El éxito no se mide por lo que lográs, sino por los obstáculos que superás.", author: "Booker T. Washington" },
                { text: "La mejor manera de predecir el futuro es creándolo.", author: "Peter Drucker" },
                { text: "No esperes las condiciones perfectas. Empieza con lo que tienes.", author: "Arthur Ashe" },
                { text: "Tu consultorio es tu empresa. Tratalo como tal y los resultados van a cambiar.", author: "Método CLÍNICA" },
                { text: "El profesional que domina su negocio, libera tiempo para su vocación.", author: "Método CLÍNICA" },
                { text: "Cada paciente que llega es el resultado de un sistema, no de la suerte.", author: "Método CLÍNICA" },
                { text: "La disciplina es el puente entre las metas y los logros.", author: "Jim Rohn" },
                { text: "No se trata de trabajar más horas, sino de construir mejores sistemas.", author: "Método CLÍNICA" },
                { text: "Lo que no se mide, no se mejora. Lo que no se mejora, se deteriora.", author: "William Thomson" },
                { text: "El precio es lo que pagás. El valor es lo que recibís.", author: "Warren Buffett" },
                { text: "Un sistema sin ventas es un hobby. Un profesional sin sistema está atrapado.", author: "Método CLÍNICA" },
                { text: "El liderazgo es la capacidad de traducir visión en realidad.", author: "Warren Bennis" },
                { text: "Automatizar lo repetitivo te libera para lo que realmente importa: tus pacientes.", author: "Método CLÍNICA" },
                { text: "La clave no es priorizar tu agenda, sino agendar tus prioridades.", author: "Stephen Covey" },
                { text: "Tu historia personal es tu mayor activo de marketing. Contala.", author: "Método CLÍNICA" },
                { text: "Haz lo que tienes que hacer hasta que puedas hacer lo que quieres hacer.", author: "Oprah Winfrey" },
                { text: "El emprendedor siempre busca el cambio, responde a él y lo explota como una oportunidad.", author: "Peter Drucker" },
                { text: "Si tu oferta no es irresistible, el problema no es el mercado. Es la oferta.", author: "Método CLÍNICA" },
                { text: "La simplicidad es la máxima sofisticación.", author: "Leonardo da Vinci" },
                { text: "Tu legado profesional se construye una decisión a la vez.", author: "Método CLÍNICA" },
                { text: "Primero te ignoran, después se ríen de ti, después pelean contigo, y entonces ganas.", author: "Mahatma Gandhi" },
                { text: "La confianza en uno mismo es el primer secreto del éxito.", author: "Ralph Waldo Emerson" },
                { text: "Un paciente bien atendido es la mejor estrategia de captación.", author: "Método CLÍNICA" },
                { text: "La innovación distingue al líder del seguidor.", author: "Steve Jobs" },
                { text: "No necesitas más pacientes. Necesitás un mejor sistema para los que ya tienes.", author: "Método CLÍNICA" },
                { text: "Invertir en ti mismo es la mejor inversión que jamás harás.", author: "Warren Buffett" },
                { text: "El secreto de avanzar es empezar.", author: "Mark Twain" },
                { text: "Cada día que construís tu sistema es un día menos de depender de la suerte.", author: "Método CLÍNICA" },
                { text: "El que tiene un porqué para vivir puede soportar casi cualquier cómo.", author: "Friedrich Nietzsche" },
                { text: "Tu clínica digital no es un gasto. Es la infraestructura de tu libertad.", author: "Método CLÍNICA" },
              ];
              const TIPS = [
                "Completa tu diario hoy — 5 minutos que transforman tu semana.",
                "Revisa tus métricas semanales para saber qué ajustar.",
                "Define tu oferta irresistible antes de invertir en publicidad.",
                "Tu avatar ideal determina toda tu comunicación. ¿Ya lo tienes claro?",
                "El seguimiento post-consulta es donde se ganan las recomendaciones.",
                "Medí tu tasa de cierre: ¿cuántos leads se convierten en pacientes?",
                "Un embudo simple y funcional vale más que uno complejo sin resultados.",
                "Escribe tu historia en 3 formatos: 300, 150 y 50 palabras.",
                "Tu propósito es tu filtro de decisiones. Todo lo demás es ruido.",
                "Cada tarea completada es un ladrillo de tu clínica digital.",
              ];
              const dayIndex = (proximoHito?.diaPrograma ?? 1) - 1;
              const quote = QUOTES[dayIndex % QUOTES.length];
              const tip = TIPS[dayIndex % TIPS.length];
              return (
                <>
                  <div className="mb-6">
                    <div className="text-4xl text-[#E8962E]/20 mb-2 leading-none" style={{ fontFamily: 'Georgia, serif' }}>"</div>
                    <p className="text-[15px] text-white/90 leading-relaxed italic mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                      {quote.text}
                    </p>
                    <p className="text-xs text-white/40 font-medium">— {quote.author}</p>
                  </div>

                  <div className="px-3 py-3 rounded-xl bg-[#22C55E]/[0.06] border border-[#22C55E]/15">
                    <p className="text-[10px] text-[#22C55E] font-bold uppercase tracking-widest mb-1">Tip del día</p>
                    <p className="text-[12px] text-white/70 leading-relaxed">{tip}</p>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Day progress mini-bar */}
          <div className="relative z-10 mt-5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Progreso general</span>
              <span className="text-[10px] text-white bg-white/10 px-2 py-0.5 rounded-full">{pctTareas}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#E8962E] to-[#F4B65C] rounded-full transition-all duration-500" style={{ width: `${pctTareas}%` }} />
            </div>
          </div>
        </div>
      </div>

      {showReporte && (
        <ReporteDirector
          nombre={(() => { try { return JSON.parse(localStorage.getItem('tcd_profile') ?? '{}')?.nombre ?? 'Director'; } catch { return 'Director'; } })()}
          diaPrograma={(() => { try { const p = JSON.parse(localStorage.getItem('tcd_profile') ?? '{}'); if (p?.fecha_inicio) return Math.max(1, Math.floor((Date.now() - new Date(p.fecha_inicio).getTime()) / 86400000) + 1); } catch { /* noop */ } return 1; })()}
          completadas={(() => { try { const saved = localStorage.getItem('tcd_hoja_ruta_v2'); return new Set<string>(saved ? JSON.parse(saved) : []); } catch { return new Set<string>(); } })()}
          ventas={ventasTotal}
          racha={(() => { try { const p = JSON.parse(localStorage.getItem('tcd_profile') ?? '{}'); return calcularRacha(p?.fecha_inicio ?? null); } catch { return 0; } })()}
          onClose={() => setShowReporte(false)}
        />
      )}
      {/* El modal único vive en El Camino — el Dashboard navega (G2) */}
    </div>
  );
}
