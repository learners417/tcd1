import { TarjetaViernes, BonosNumero } from '../components/ExtrasNumero';
import MapaCincoDias from '../components/MapaCincoDias';
import TableroNumeros from '../components/TableroNumeros';
import GraduacionSemanaBlanca from '../components/GraduacionSemanaBlanca';
import CadenaADN from '../components/CadenaADN';
import type { Profile } from '../lib/supabase';
import { planDe, diasRestantes, NOMBRE_PLAN, PRECIO_FUNDADOR, waLink, usosSemana, TOPE_MENTOR_SEMANAL } from '../lib/planes';
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

      let rachaLocal = 0;
      try {
        const rawDiario = localStorage.getItem('tcd_diario_v3') || localStorage.getItem('tcd_diario_v2') || '[]';
        const d = JSON.parse(rawDiario);
        rachaLocal = Array.isArray(d) ? d.length : (Array.isArray(d?.entries) ? d.entries.length : 0);
      } catch { /* diario corrupto */ }

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


      {/* ═══ La Semana Blanca: el plan reservado + la cuenta regresiva ═══ */}
      {planDe(perfil) === 'blanco' && (() => {
        const d = diasRestantes(perfil);
        const reservado = (perfil?.plan_reservado ?? '') as string;
        const nombreRes = reservado && NOMBRE_PLAN[reservado as keyof typeof NOMBRE_PLAN] ? NOMBRE_PLAN[reservado as keyof typeof NOMBRE_PLAN] : null;
        const precioRes = reservado && PRECIO_FUNDADOR[reservado] ? PRECIO_FUNDADOR[reservado] : null;
        const urgente = d !== null && d <= 3;
        return (
          <div className={`card-panel rounded-3xl p-5 border ${urgente ? 'border-[rgba(232,150,46,0.4)]' : 'border-[rgba(232,150,46,0.15)]'}`} style={urgente ? { background: 'linear-gradient(135deg, rgba(232,150,46,0.08), transparent)' } : undefined}>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold mb-1.5">Tus 5 días</p>
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

      {/* ─── EL DOJO ─── día · cinturón · estado. Nada más. */}
      {(() => {
        let c; try { const saved = localStorage.getItem('tcd_hoja_ruta_v2'); c = cinturonDesdeProgreso(new Set(saved ? JSON.parse(saved) : [])); } catch { c = null; }
        const diaProg = proximoHito?.diaPrograma ?? 1;
        const diaTarea = data.tareasHoy[0]?.dia_asignado;
        const delta = typeof diaTarea === 'number' ? diaProg - diaTarea : 0;
        const estado = delta > 0
          ? { txt: `${delta} ${delta === 1 ? 'día' : 'días'} por recuperar — hoy te pones al día`, cls: 'text-goldhi' }
          : delta < 0
            ? { txt: `Adelantado ${Math.abs(delta)} ${Math.abs(delta) === 1 ? 'día' : 'días'}`, cls: 'text-success' }
            : { txt: 'Al día', cls: 'text-success' };
        return (
          <div className="card-panel p-6 sm:p-7 border border-gold/15">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <p className="text-2xl font-light text-cream" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>Buenos días, {nombreDisplay}.</p>
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold">Día {diaProg} de 90</p>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
              {c && <p className="text-sm text-cream/80">{c.emoji} Cinturón <strong className="text-cream">{c.nombre}</strong></p>}
              <p className={`text-sm font-medium ${estado.cls}`}>{estado.txt}</p>
            </div>
          </div>
        );
      })()}

      {/* ZIP E — El mapa de los 5 días: las palabras de la landing, adentro */}
      <MapaCincoDias />

      {/* C3 — la promesa completa: TU viernes + tus bonos */}
      <TarjetaViernes />
      <BonosNumero />

      {/* ZIP A — La graduación de los 5 días (solo plan EL NÚMERO, tras el día 5) */}
      <GraduacionSemanaBlanca />

      {/* S10 — La Cadena del ADN: el ikigai encendiéndose */}
      <CadenaADN onAbrir={() => setCurrentPage('adn')} />

      {/* LA SESIÓN — el único plato */}
      <div className="space-y-6">
        {(() => {
          const dow = new Date().getDay(); // 0=domingo, 6=sábado
          // ─── SÁBADO: descanso activo — la vida también es el camino ───
          if (dow === 6) {
            const hoyKey = new Date().toISOString().split('T')[0];
            let guardado = '';
            try { guardado = (JSON.parse(localStorage.getItem('tcd_descanso_v1') ?? '{}'))[hoyKey] ?? ''; } catch { /* noop */ }
            return (
              <div className="card-panel p-6 border border-success/25 bg-gradient-to-b from-success/[0.05] to-transparent">
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-success mb-2">Sábado · Descanso activo</p>
                <p className="text-sm text-cream/80 mb-1">Hoy no hay sesión. Hay vida.</p>
                <p className="text-xs text-cream/55 mb-4">Deja una línea de tu día — un momento compartido, un rato afuera, lo que te llenó. No viniste solo a hacer dinero: esto también es el camino.</p>
                {guardado ? (
                  <p className="text-sm text-cream/85 italic border-l-2 border-success/40 pl-3">“{guardado}” <span className="not-italic text-success text-xs ml-2">✓ guardado</span></p>
                ) : (
                  <DescansoInput onGuardar={(t) => {
                    try {
                      const all = JSON.parse(localStorage.getItem('tcd_descanso_v1') ?? '{}');
                      all[hoyKey] = t;
                      localStorage.setItem('tcd_descanso_v1', JSON.stringify(all));
                      window.dispatchEvent(new Event('storage'));
                    } catch { /* noop */ }
                  }} />
                )}
              </div>
            );
          }
          // ─── DOMINGO: el día del Fundador ───
          if (dow === 0) {
            return (
              <div className="card-panel p-6 border border-gold/25 bg-gradient-to-b from-gold/[0.05] to-transparent">
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold mb-2">Domingo · El día del Fundador</p>
                <p className="text-sm text-cream/80 mb-4">Quince minutos para ti: tu Diario, tu semana, tu intención. La transformación también se registra.</p>
                <button onClick={() => setCurrentPage('diario')} className="btn-primary text-sm font-bold px-5 py-2.5 rounded-xl">Abrir mi Diario →</button>
              </div>
            );
          }
          return null;
        })()}

        {/* Foco de Hoy (60%) */}
        <div className="card-panel p-6">
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
              (() => {
                let sv = false;
                try {
                  const saved = JSON.parse(localStorage.getItem('tcd_hoja_ruta_v2') ?? '[]') as string[];
                  sv = saved.includes('4-P4.5b') || saved.includes('4-P4.4');
                } catch { /* noop */ }
                if (!sv) return (
                  <div className="py-10 text-center border border-dashed border-[rgba(232,150,46,0.10)] rounded-xl bg-surface/30">
                    <CheckCircle2 className="w-8 h-8 text-success/50 mx-auto mb-3" />
                    <p className="text-sm text-cream/75">Todo al día. Estás libre.</p>
                    <p className="text-xs text-cream/45 mt-1">Mira El Camino para ver lo que sigue.</p>
                  </div>
                );
                return (
                  <div className="rounded-xl border border-gold/25 bg-gradient-to-b from-gold/[0.05] to-transparent p-5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold mb-1">Día de campo</p>
                    <p className="text-sm text-cream/85">Hoy no hay sesión nueva. Hoy se juega.</p>
                    <p className="text-xs text-cream/50 mt-1 mb-4">Tu sistema está vivo: esto es lo que mueve tus números hoy.</p>
                    <div className="space-y-2 mb-4">
                      {[
                        'Responde a quien te escribió — tu agente ya filtró',
                        'Confirma las citas de mañana: 24 h y 2 h antes',
                        'Atiende y entrega — tus pacientes primero',
                      ].map((t) => (
                        <p key={t} className="text-sm text-cream/75 pl-4 relative">
                          <span className="absolute left-0 text-gold">·</span>{t}
                        </p>
                      ))}
                    </div>
                    <button onClick={() => window.open('https://mcd-eight.vercel.app', '_blank')}
                      className="btn-primary text-sm font-bold px-5 py-2.5 rounded-xl">
                      Abrir Mi Clínica →
                    </button>
                  </div>
                );
              })()
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


        {(() => {
          const dow = new Date().getDay();
          if (dow === 0 || dow === 6) return null; // el finde tiene sus propias cartas
          let set = setDB ?? new Set<string>();
          if (!setDB) { try { const saved = localStorage.getItem('tcd_hoja_ruta_v2'); set = new Set(saved ? JSON.parse(saved) : []); } catch { /* noop */ } }
          const sistemaVivo = set.has('4-P4.5b') || set.has('4-P4.4');
          const sesionHecha = data.tareasHoy.length === 0;
          const mentorRestantes = Math.max(0, TOPE_MENTOR_SEMANAL - usosSemana('mentor'));
          const Fila = ({ n, done, titulo, meta, onClick }: { n: string; done?: boolean; titulo: string; meta: string; onClick?: () => void }) => (
            <button onClick={onClick} disabled={!onClick}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${done ? 'border-success/25 bg-success/[0.04] opacity-70' : 'border-[rgba(232,150,46,0.12)] bg-surface/30 hover:border-gold/30'}`}>
              <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${done ? 'bg-success text-black' : 'bg-gold/15 text-gold'}`}>{done ? '✓' : n}</span>
              <span className="flex-1 min-w-0">
                <span className={`block text-sm font-medium ${done ? 'text-cream/60 line-through' : 'text-cream/90'}`}>{titulo}</span>
                <span className="block text-[11px] text-cream/50">{meta}</span>
              </span>
              {onClick && <ChevronRight className="w-4 h-4 text-cream/40" />}
            </button>
          );
          return (
            <>
            <div className="card-panel p-5">
              <p className="text-[11px] font-bold uppercase tracking-widest text-cream/60 mb-3">Tu día, en orden</p>
              <div className="space-y-2">
                <Fila n="1" done={sesionHecha} titulo="Tu sesión del Camino" meta={sesionHecha ? 'Hecha — el dojo te vio hoy' : '20-30 min · el plato del día'} onClick={() => setCurrentPage('roadmap')} />
                {sistemaVivo && (
                  <Fila n="2" titulo="10 minutos de campo" meta="Responde a tus interesados y registra en Mi Clínica — y vuelve: el Camino te espera"
                    onClick={() => window.open('https://mcd-eight.vercel.app', '_blank')} />
                )}
                <Fila n={sistemaVivo ? '3' : '2'} titulo="Tu pregunta al Mentor" meta={mentorRestantes > 0 ? `Si algo te frena · te quedan ${mentorRestantes} esta semana` : 'Sin consultas esta semana — el lunes se renuevan'} onClick={() => setCurrentPage('coach')} />
                <Fila n={sistemaVivo ? '4' : '3'} titulo="El cierre del día" meta="3 min · tu Diario alimenta a tu Mentor" onClick={() => setCurrentPage('diario')} />
              </div>
            </div>
            {sistemaVivo && <TableroNumeros dia={proximoHito?.diaPrograma ?? 30} />}
            </>
          );
        })()}
      </div>

      {/* El modal único vive en El Camino — el Dashboard navega (G2) */}
    </div>
  );
}

function DescansoInput({ onGuardar }: { onGuardar: (t: string) => void }) {
  const [t, setT] = React.useState('');
  const [ok, setOk] = React.useState(false);
  if (ok) return <p className="text-sm text-success">Guardado. Que siga el buen día. ✓</p>;
  return (
    <div className="flex gap-2">
      <input value={t} onChange={(e) => setT(e.target.value)} placeholder="Hoy… (una línea alcanza)"
        className="flex-1 bg-surface/50 border border-[rgba(232,150,46,0.15)] rounded-xl px-3.5 py-2.5 text-sm text-cream placeholder:text-cream/35 focus:outline-none focus:border-gold/50 min-h-[44px]" />
      <button disabled={!t.trim()} onClick={() => { onGuardar(t.trim()); setOk(true); }}
        className="btn-primary text-sm font-bold px-4 rounded-xl disabled:opacity-40 min-h-[44px]">Guardar</button>
    </div>
  );
}
