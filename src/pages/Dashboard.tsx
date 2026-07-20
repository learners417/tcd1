import type { Profile } from '../lib/supabase';
import ModoHueco from '../components/ModoHueco';
import { planDe, diasRestantes, NOMBRE_PLAN, PRECIO_FUNDADOR, waLink } from '../lib/planes';
import React, { useEffect, useState } from 'react';
import { ChevronRight, CheckCircle2, Clock, Calendar, Target, Play, Wrench, MessageCircle, Bot, Sparkles } from 'lucide-react';
import { supabase, isSupabaseReady } from '../lib/supabase';
import { getActiveDaysThisWeek } from '../lib/activity';
import { cinturonDesdeProgreso, CINTURONES } from '../lib/cinturones';
import { calcularRacha, calcularRachaDesdeFechas, esDiaDescanso, hoyTieneSesion } from '../lib/racha';
import ReporteDirector from '../components/ReporteDirector';
import { SEED_ROADMAP_V2 } from '../lib/roadmapSeed';
import type { RoadmapMeta } from '../lib/roadmapSeed';

function getTypeBadge(tipo?: string) {
  switch (tipo) {
    case 'VIDEO': return 'bg-gold/15 text-gold border-gold/25';
    case 'HERRAMIENTA': return 'bg-success/15 text-success border-success/25';
    case 'COACH': return 'bg-cream/10 text-cream/70 border-cream/15';
    default: return 'bg-cream/5 text-cream/65 border-cream/10';
  }
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="card-panel p-5">
      <p className="text-[11px] text-cream/55 uppercase tracking-widest mb-2 font-semibold">{label}</p>
      <p className="text-2xl font-light text-cream tracking-tight">{value}</p>
      <p className="text-xs text-cream/65 mt-1">{sub}</p>
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

export default function Dashboard({ setCurrentPage, userId, perfil }: { setCurrentPage: (page: string) => void, userId?: string, perfil?: Partial<Profile> }) {
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
  const [rachaDB, setRachaDB] = useState<number | null>(null);
  const [setDB, setSetDB] = useState<Set<string> | null>(null);
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

      // Lote 4 · EL PUENTE MCD: el Rojo automático. Si MCD verificó un cobro
      // de este email, el Cinturón Rojo llega solo (un cobro allá = el hito acá).
      try {
        const email = p?.email ?? (await supabase?.auth.getUser())?.data.user?.email;
        if (email) {
          const r = await fetch(`/api/mcd-bridge?email=${encodeURIComponent(String(email))}`);
          if (r.ok) {
            const j = await r.json();
            if (j?.cobro_verificado) {
              const saved = localStorage.getItem('tcd_hoja_ruta_v2');
              const set = new Set<string>(saved ? JSON.parse(saved) : []);
              if (!set.has('6-P6.3')) {
                set.add('6-P6.3');
                localStorage.setItem('tcd_hoja_ruta_v2', JSON.stringify([...set]));
                if (isSupabaseReady() && supabase && userId) {
                  await supabase.from('hoja_de_ruta').upsert(
                    { usuario_id: userId, pilar_numero: 6, meta_codigo: 'P6.3', completada: true, fecha_completada: new Date().toISOString() },
                    { onConflict: 'usuario_id,pilar_numero,meta_codigo' },
                  );
                }
              }
            }
          }
        }
      } catch { /* MCD puede no responder — no bloquea el Dashboard */ }

      // Lote 2 · La racha desde la DB (cross-device, la misma fuente que el admin)
      if (isSupabaseReady() && supabase && userId) {
        supabase.from('hoja_de_ruta')
          .select('pilar_numero, meta_codigo, completada, fecha_completada')
          .eq('usuario_id', userId)
          .eq('completada', true)
          .then(({ data: hr }) => {
            const rows = hr ?? [];
            const fechas = rows.filter((r: { fecha_completada?: string | null }) => r.fecha_completada).map((r: { fecha_completada?: string | null }) => String(r.fecha_completada));
            setRachaDB(calcularRachaDesdeFechas(fechas));
            // El set real desde la DB: hitos + sesión de hoy correctos en CUALQUIER dispositivo.
            const keys = rows.map((r: { pilar_numero: number; meta_codigo: string }) => `${r.pilar_numero}-${r.meta_codigo}`);
            setSetDB(new Set(keys));
            try { localStorage.setItem('tcd_hoja_ruta_v2', JSON.stringify(keys)); } catch { /* noop */ }
          });
      }

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

        if (tareasHoy.length < 1) {
          for (const meta of metasPilar) {
            if (!completadasSet.has(`${pil.numero}-${meta.codigo}`) && tareasHoy.length < 1) {
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
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">

      {/* ═══ Modo Hueco: 10-15 minutos, una acción completable (T12) ═══ */}
      <ModoHueco onNavigate={setCurrentPage} />

      {/* ═══ La Semana Blanca: el plan reservado + la cuenta regresiva ═══ */}
      {planDe(perfil) === 'blanco' && (() => {
        const d = diasRestantes(perfil);
        const reservado = (perfil?.plan_reservado ?? '') as string;
        const nombreRes = reservado && NOMBRE_PLAN[reservado as keyof typeof NOMBRE_PLAN] ? NOMBRE_PLAN[reservado as keyof typeof NOMBRE_PLAN] : null;
        const precioRes = reservado && PRECIO_FUNDADOR[reservado] ? PRECIO_FUNDADOR[reservado] : null;
        const urgente = d !== null && d <= 3;
        return (
          <div className={`card-panel rounded-3xl p-5 border ${urgente ? 'border-[rgba(232,150,46,0.4)]' : 'border-[rgba(232,150,46,0.15)]'}`} style={urgente ? { background: 'linear-gradient(135deg, rgba(232,150,46,0.08), transparent)' } : undefined}>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold mb-1.5">Tu Semana Blanca</p>
            {d !== null && d > 0 ? (
              <p className="text-sm text-cream/85">
                {urgente ? (d === 1 ? 'Tu último día' : `Te quedan ${d} días`) : 'Tu semana avanza, un día a la vez'}
                {nombreRes ? <> · tu plan <span className="text-goldhi font-semibold">{nombreRes}</span> te espera{precioRes && <> ({precioRes} de fundador · 50% off de por vida)</>}</> : null}
              </p>
            ) : (
              <p className="text-sm text-cream/85">Tu semana está completa. Lo que construiste queda guardado — y tu lugar de fundador sigue reservado.</p>
            )}
            {(urgente || (d !== null && d <= 0)) && (
              <a href={waLink(('Hola · Quiero continuar mi camino con el plan ' + (nombreRes ?? '')).trim())} target="_blank" rel="noreferrer"
                 className="inline-block mt-3 btn-primary text-[#1a1206] text-sm font-bold px-5 py-2.5 rounded-xl">
                Continuar mi camino →
              </a>
            )}
          </div>
        );
      })()}

      {/* ZONA A — Header contextual */}
      <div className="relative overflow-hidden card-panel p-8 border border-gold/20 bg-gradient-to-br from-gold/[0.05] to-transparent">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 blur-[100px] rounded-full" />
        <div className="relative z-10">
          <p className="text-2xl font-light text-cream mb-2" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>Buenos días, {nombreDisplay}.</p>
          <p className="text-sm text-cream/75 max-w-lg mb-6 leading-relaxed">
            Llevas <strong className="text-cream/90">{(() => { try { const saved = localStorage.getItem('tcd_hoja_ruta_v2'); const c = cinturonDesdeProgreso(new Set(saved ? JSON.parse(saved) : [])); return `${c.emoji} Cinturón ${c.nombre} — ${c.metafora}`; } catch { return '⬜ Cinturón Blanco'; } })()}</strong>. Racha: <strong className="text-gold">{rachaDB ?? calcularRacha(null)} 🔥</strong> · hoy te espera <strong className="text-gold">una sesión</strong> para acercarte al siguiente.
          </p>
          {(() => {
            try {
              const saved = localStorage.getItem('tcd_hoja_ruta_v2');
              const c = cinturonDesdeProgreso(new Set(saved ? JSON.parse(saved) : []));
              return null
            } catch { return null; }
          })()}
          <button onClick={() => setCurrentPage('roadmap')} className="text-[11px] font-bold text-gold hover:text-goldhi transition-colors flex items-center gap-1.5 uppercase tracking-widest bg-gold/10 px-4 py-2 rounded-lg border border-gold/20 w-max">
            Ver El Camino <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ZONA A2 — EL VISUALBOARD · lo que quieres lograr, tildándose solo */}
      {(() => {
        let set = setDB ?? new Set<string>();
        if (!setDB) { try { const saved = localStorage.getItem('tcd_hoja_ruta_v2'); set = new Set(saved ? JSON.parse(saved) : []); } catch { /* noop */ } }
        const hitos = [
          { emoji: '🧬', label: 'Método con nombre', done: set.has('2-P2.4') },
          { emoji: '💎', label: 'Oferta lista', done: set.has('3-P3.4') },
          { emoji: '⚙️', label: 'Sistema instalado', done: set.has('4-P4.5b') },
          { emoji: '📣', label: 'Campaña encendida', done: set.has('4-P4.4') },
          { emoji: '💰', label: 'Primer pago', done: set.has('6-P6.3') },
        ];
        const pct = data.totalTareas > 0 ? Math.round((data.completadas / data.totalTareas) * 100) : 0;
        return (
          <div className="card-ios p-6 sm:p-7">
            <div className="flex items-center justify-between mb-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-gold">Tu norte · 10 pacientes de $1.000 en 90 días</p>
              <p className="text-[11px] text-cream/55 num-tab">{pct}% del camino</p>
            </div>
            {/* La barra de 10 pacientes */}
            <div className="flex items-end justify-between mb-2">
              <div><span className="text-4xl font-light text-cream num-tab">{ventasTotal.count}</span><span className="text-xl font-light text-cream/35"> / 10</span><span className="text-xs text-cream/45 ml-2">pacientes</span></div>
              <p className="text-sm text-cream/75 num-tab">${ventasTotal.suma.toLocaleString()} <span className="text-cream/35">de $10.000</span></p>
            </div>
            <div className="flex gap-1.5 mb-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex-1 h-2.5 rounded-full transition-all" style={{ background: i < ventasTotal.count ? 'linear-gradient(180deg, #F4B65C, #E8962E)' : 'rgba(242,239,233,0.08)', boxShadow: i < ventasTotal.count ? '0 0 8px rgba(232,150,46,0.4)' : 'none' }} />
              ))}
            </div>
            {/* Los 5 hitos */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {hitos.map((h) => (
                <div key={h.label} className={`rounded-xl border px-3 py-2.5 text-center transition-all ${h.done ? 'border-gold/40 bg-gold/10' : 'border-[rgba(242,239,233,0.07)] bg-black/20 opacity-60'}`}>
                  <p className="text-lg leading-none mb-1">{h.done ? '✓' : h.emoji}</p>
                  <p className={`text-[11px] leading-tight ${h.done ? 'text-goldhi font-semibold' : 'text-cream/45'}`}>{h.label}</p>
                </div>
              ))}
            </div>
            {/* El tiempo recuperado — la otra mitad de la promesa */}
            {(() => {
              let horas = 0;
              if (set.has('4-P4.5b')) horas += 4; // el asistente responde solo
              if (set.has('4-P4.4')) horas += 3;  // la campaña trae interesados sin vos
              if (set.has('6-P6.2') || set.has('6-P6.3')) horas += 3; // el protocolo entrega sin improvisar
              return (
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-[rgba(242,239,233,0.07)] bg-black/20 px-4 py-3">
                  <span className="text-xl">⏰</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-cream/80"><span className="font-semibold text-goldhi num-tab">{horas}h</span> por semana que tu sistema ya trabaja por ti <span className="text-cream/35">· meta: 10h</span></p>
                    <div className="h-1 rounded-full bg-[rgba(242,239,233,0.06)] overflow-hidden mt-1.5">
                      <div className="h-full rounded-full" style={{ width: `${Math.min(100, horas * 10)}%`, background: 'linear-gradient(90deg, #5A9170, #3D6B4F)' }} />
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 📔 El cierre del día — el diario es parte del método */}
            {(() => {
              try {
                const hoyStr = new Date().toISOString().slice(0, 10);
                const raw = localStorage.getItem('tcd_diario_v3');
                const entradas = raw ? JSON.parse(raw) : [];
                const hoyHecho = Array.isArray(entradas) && entradas.some((e: { fecha?: string }) => String(e.fecha ?? '').slice(0, 10) === hoyStr);
                if (hoyHecho) return null;
                return (
                  <button onClick={() => setCurrentPage('diario')} className="mt-3 w-full text-left rounded-xl border border-[rgba(232,150,46,0.18)] bg-gold/5 hover:bg-gold/10 px-4 py-2.5 transition-colors">
                    <p className="text-[12px] text-cream/75">📔 <span className="font-medium text-goldhi">Tu cierre del día</span> · 5 min — todavía pendiente. El diario alimenta a tu Mentor.</p>
                  </button>
                );
              } catch { return null; }
            })()}

            {/* Las horas del viaje: el esfuerzo también se ve */}
            {(() => {
              const parseMin = (t?: string) => { if (!t) return 20; const h = t.match(/([\d.]+)\s*h/); if (h) return Math.round(parseFloat(h[1]) * 60); const m2 = t.match(/(\d+)\s*min/); return m2 ? parseInt(m2[1], 10) : 20; };
              let hechas = 0, totales = 0;
              for (const pil of SEED_ROADMAP_V2) for (const m of pil.metas) { const mins = parseMin((m as { tiempo_estimado?: string }).tiempo_estimado); totales += mins; if (set.has(`${pil.numero}-${m.codigo}`)) hechas += mins; }
              return (
                <p className="mt-3 text-[11px] text-cream/45">⚒ Llevas <span className="text-goldhi font-semibold num-tab">{(hechas / 60).toFixed(1)}h</span> de ~{Math.round(totales / 60)}h de construcción total — cada micro-sesión suma.</p>
              );
            })()}

            {/* Tu inversión, recuperándose */}
            {ventasTotal.suma > 0 && (
              <p className="mt-3 text-[11px] text-cream/65">Tu inversión: <span className={`font-semibold ${ventasTotal.suma >= 2000 ? 'text-success' : 'text-goldhi'}`}>{ventasTotal.suma >= 2000 ? `recuperada ${(ventasTotal.suma / 2000).toFixed(1)}×` : `${Math.round((ventasTotal.suma / 2000) * 100)}% recuperada`}</span> · <button onClick={() => setShowReporte(true)} className="underline underline-offset-2 hover:text-gold">📄 Reporte del Director</button></p>
            )}

            {/* La barra Sanador Libre */}
            <div className="mt-5">
              <div className="h-1.5 rounded-full bg-[rgba(242,239,233,0.06)] overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #E8962E, #F4B65C)' }} />
              </div>
              <p className="text-[11px] text-cream/35 mt-1.5 italic">Estás al {pct}% de ser Sanador Libre — cada sesión suma.</p>
            </div>
          </div>
        );
      })()}

      

      {/* G3 · Día 75: Tu clínica sigue */}
      {(() => {
        let diaG3 = 1;
        try { const p = JSON.parse(localStorage.getItem('tcd_profile') ?? '{}'); if (p?.fecha_inicio) diaG3 = Math.max(1, Math.floor((Date.now() - new Date(p.fecha_inicio).getTime()) / 86400000) + 1); } catch { /* noop */ }
        if (diaG3 < 75) return null;
        return (
          <div className="rounded-2xl border border-gold/35 bg-gradient-to-br from-gold/[0.08] to-transparent p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold mb-2">🏥 Tu clínica sigue</p>
            <p className="text-lg text-cream/90 font-light" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>El día 90 termina El Camino — pero tu clínica no se apaga.</p>
            <p className="text-sm text-cream/75 mt-2 leading-relaxed">Tu agente de WhatsApp, tu agenda, el portal de tus pacientes, tus métricas y tus créditos siguen trabajando con <strong className="text-cream/90">MiClínica Digital · $147/mes</strong>. Todo lo que construiste, funcionando — sin que tengas que tocar nada.</p>
            <button onClick={() => setCurrentPage('coach')} className="mt-4 px-5 py-2.5 rounded-xl bg-gold text-black text-sm font-bold hover:bg-goldhi transition-colors">Quiero que mi clínica siga →</button>
          </div>
        );
      })()}

      {/* ZONA C — Dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Foco de Hoy (60%) */}
        <div className="lg:col-span-7 card-panel p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[11px] font-bold text-cream tracking-widest uppercase">Tu sesión de hoy</h2>
            <button onClick={() => setCurrentPage('roadmap')} className="text-[11px] text-cream/55 hover:text-gold uppercase font-bold tracking-wider transition-colors">
              Ir a tareas →
            </button>
          </div>

          <div className="space-y-3">
            {(() => {
              // Día de descanso del programa: el dojo respira
              const diaProg = (() => { try { const p = JSON.parse(localStorage.getItem('tcd_profile') ?? '{}'); if (p?.fecha_inicio) return Math.max(1, Math.floor((Date.now() - new Date(p.fecha_inicio).getTime()) / 86400000) + 1); } catch { /* noop */ } return 1; })();
              if (esDiaDescanso(diaProg) && data.tareasHoy.length > 0) {
                return (
                  <div className="py-12 text-center border border-success/20 rounded-2xl bg-gradient-to-b from-success/[0.06] to-transparent">
                    <p className="text-4xl mb-3">🌿</p>
                    <p className="text-base text-cream/85 font-medium">Día de descanso — el dojo también respira</p>
                    <p className="text-xs text-cream/45 mt-2">Tu racha está protegida 🛡️ · Si quieres adelantar, El Camino está abierto — pero descansar también es entrenar.</p>
                  </div>
                );
              }
              return null;
            })()}
            {data.tareasHoy.length === 0 ? (
              <div className="py-10 text-center border border-dashed border-[rgba(232,150,46,0.10)] rounded-xl bg-surface/30">
                <CheckCircle2 className="w-8 h-8 text-success/50 mx-auto mb-3" />
                <p className="text-sm text-cream/75">Todo al día. Estás libre.</p>
                <p className="text-xs text-cream/45 mt-1">Mira El Camino para ver lo que sigue.</p>
              </div>
            ) : (
              <>
              {/* LA SESIÓN DE HOY — el hero del dojo */}
              {data.tareasHoy[0] && (
                <button
                  onClick={() => { try { localStorage.setItem('tcd_abrir_pilar', String(data.tareasHoy[0].pilarNumero ?? '')); } catch { /* noop */ } setCurrentPage('roadmap'); }}
                  className="w-full text-left rounded-2xl border-2 border-gold/40 bg-gradient-to-br from-gold/[0.10] to-transparent p-6 hover:border-gold/70 hover:shadow-[0_0_30px_rgba(232,150,46,0.10)] transition-all group"
                >
                  <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold mb-2">▶ Tu sesión de hoy</p>
                  <p className="text-xl font-medium text-cream mb-1" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>{data.tareasHoy[0].titulo}</p>
                  <p className="text-xs text-cream/65 mb-4">{data.tareasHoy[0].tiempo_estimado} · {data.tareasHoy[0].tipo === 'VIDEO' ? 'Contenido' : data.tareasHoy[0].tipo === 'HERRAMIENTA' ? 'Producción' : 'Sesión de trabajo'}</p>
                  <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold text-black text-sm font-bold group-hover:bg-goldhi transition-colors">COMENZAR →</span>
                </button>
              )}
              {data.tareasHoy.slice(1).map((t, idx) => (
              <div
                key={idx}
                className="group flex items-start gap-4 p-4 rounded-xl bg-surface/30 border border-[rgba(232,150,46,0.1)] hover:bg-surface/60 hover:border-[rgba(232,150,46,0.14)] transition-all cursor-pointer"
                onClick={() => { try { localStorage.setItem('tcd_abrir_pilar', String(t.pilarNumero ?? '')); } catch { /* noop */ } setCurrentPage('roadmap'); }}
              >
                <div className="shrink-0 mt-0.5">
                  <div className="w-5 h-5 rounded-full border border-cream/20 group-hover:border-gold transition-colors flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-transparent group-hover:bg-gold rounded-full" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-cream/90">{t.titulo}</p>
                  <p className="text-[11px] text-cream/55 mt-1">{t.pilarTitulo}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <span className={`text-[11px] uppercase font-bold px-2 py-0.5 rounded-full border tracking-wider ${getTypeBadge(t.tipo)}`}>
                      {t.tipo || `Pilar ${t.pilarNumero}`}
                    </span>
                    <span className="text-[11px] text-cream/55 flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3" /> {t.tiempo_estimado || '15–30 min'}
                    </span>
                    {t.herramienta_id && (
                      <span className="text-[11px] text-gold font-bold uppercase tracking-wider">Ver herramienta →</span>
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
        <div className="lg:col-span-5 card-panel p-6 relative overflow-hidden flex flex-col justify-between border-gold/15 bg-gradient-to-br from-gold/[0.05] to-transparent">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-gold/10 blur-[50px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-success/5 blur-[40px] rounded-full" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[11px] font-bold text-gold tracking-widest uppercase flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold ring-4 ring-gold/20" /> Inspiración del día
              </h2>
              <div className="flex items-center gap-1.5 bg-gold/10 px-3 py-1 rounded-full border border-gold/20">
                <Sparkles className="w-3 h-3 text-gold" />
                <span className="text-[11px] font-bold text-gold">Día {proximoHito?.diaPrograma ?? 1}/90</span>
              </div>
            </div>

            {(() => {
              const QUOTES = [
                { text: "Puedes tener todo lo que quieras en la vida si ayudas a suficientes personas a conseguir lo que ellas quieren.", author: "Zig Ziglar" },
                { text: "La gente olvidará lo que dijiste y lo que hiciste, pero nunca olvidará cómo la hiciste sentir.", author: "Maya Angelou" },
                { text: "El precio es lo que pagas. El valor es lo que recibes.", author: "Warren Buffett" },
                { text: "Si cambias la forma en que miras las cosas, las cosas que miras cambian.", author: "Wayne Dyer" },
                { text: "Nadie se ha hecho pobre por dar.", author: "Ana Frank" },
                { text: "Ganamos con lo que recibimos, pero hacemos una vida con lo que damos.", author: "Winston Churchill" },
                { text: "El dinero es un excelente sirviente, pero un pésimo amo.", author: "Francis Bacon" },
                { text: "Quien tiene un porqué puede soportar casi cualquier cómo.", author: "Viktor Frankl" },
                { text: "El mejor modo de encontrarte a ti mismo es perderte en el servicio a los demás.", author: "Gandhi" },
                { text: "Cobrar bien no es quitarle a tu paciente: es poder seguir estando para el próximo.", author: "Método CLINICA" },
              ];
              const TIPS = [
                "Completa tu diario hoy — 5 minutos que transforman tu semana.",
                "Revisa tus métricas semanales para saber qué ajustar.",
                "Define tu oferta irresistible antes de invertir en publicidad.",
                "Tu avatar ideal determina toda tu comunicación. ¿Ya lo tienes claro?",
                "El seguimiento post-consulta es donde se ganan las recomendaciones.",
                "Medí tu tasa de cierre: ¿cuántos leads se convierten en pacientes?",
                "Un sistema simple y funcional vale más que uno complejo sin resultados.",
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
                    <div className="text-4xl text-gold/20 mb-2 leading-none" style={{ fontFamily: 'Georgia, serif' }}>"</div>
                    <p className="text-[15px] text-white/90 leading-relaxed italic mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                      {quote.text}
                    </p>
                    <p className="text-xs text-white/55 font-medium">— {quote.author}</p>
                  </div>

                  <div className="px-3 py-3 rounded-xl bg-success/[0.06] border border-success/15">
                    <p className="text-[11px] text-success font-bold uppercase tracking-widest mb-1">Tip del día</p>
                    <p className="text-[12px] text-white/70 leading-relaxed">{tip}</p>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Day progress mini-bar */}
          <div className="relative z-10 mt-5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] text-white/55 font-bold uppercase tracking-wider">Progreso general</span>
              <span className="text-[11px] text-white bg-white/10 px-2 py-0.5 rounded-full">{pctTareas}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-gold to-goldhi rounded-full transition-all duration-500" style={{ width: `${pctTareas}%` }} />
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
          racha={rachaDB ?? calcularRacha(null)}
          onClose={() => setShowReporte(false)}
        />
      )}
      {/* El modal único vive en El Camino — el Dashboard navega (G2) */}
    </div>
  );
}
