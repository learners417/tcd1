/**
 * CampanasHome.tsx — Tu Máquina de Pacientes
 * Una pregunta, tres puertas, un paso por pantalla.
 * Regla de producto: TRES tipos de campaña. Ni cuatro, ni "avanzado". La claridad ES el producto.
 */
import { useMemo, useState } from 'react';
import {
  UserPlus, Gift, Wallet, Lock, ArrowRight,
  Sparkles, FolderOpen, Trophy, ChevronLeft,
} from 'lucide-react';
import type { CampanasView, Campana, Creativo } from '../../lib/campanasTypes';
import { cinturonDesdeProgreso } from '../../lib/cinturones';

type PuertaId = 'seguidores' | 'comunidad' | 'ventas';

const PUERTAS: Array<{
  id: PuertaId;
  emoji: string;
  icon: React.ComponentType<{ className?: string }>;
  titulo: string;
  promesa: string;
  detalle: string;
}> = [
  {
    id: 'seguidores',
    emoji: '🌱',
    icon: UserPlus,
    titulo: 'Seguidores',
    promesa: 'Que te conozcan las personas correctas',
    detalle: 'Tráfico a tu perfil · desde 3 USD/día',
  },
  {
    id: 'comunidad',
    emoji: '🎁',
    icon: Gift,
    titulo: 'Comunidad',
    promesa: 'Entrega tu recurso gratuito por mensaje y arma tu grupo',
    detalle: 'Mensajes a Instagram · desde 5 USD/día',
  },
  {
    id: 'ventas',
    emoji: '💰',
    icon: Wallet,
    titulo: 'Primeras Ventas',
    promesa: 'Pacientes que escriben listos para tu protocolo',
    detalle: 'Anuncios a tu WhatsApp · desde 10 USD/día',
  },
];

const PREGUNTAS: Array<{
  id: string;
  q: string;
  opts: Array<{ v: string; l: string }>;
}> = [
  {
    id: 'protocolo',
    q: '¿Ya tienes tu protocolo con precio definido?',
    opts: [
      { v: 'validado', l: 'Sí, validado' },
      { v: 'armando', l: 'Lo estoy armando' },
      { v: 'no', l: 'Todavía no' },
    ],
  },
  {
    id: 'recurso',
    q: '¿Tienes un recurso gratuito para regalar? (guía, masterclass, plantilla)',
    opts: [
      { v: 'si', l: 'Sí' },
      { v: 'no', l: 'No' },
    ],
  },
  {
    id: 'seguidores',
    q: '¿Cuántos seguidores reales tienes hoy?',
    opts: [
      { v: 'pocos', l: 'Menos de 500' },
      { v: 'medios', l: '500 a 3.000' },
      { v: 'muchos', l: 'Más de 3.000' },
    ],
  },
  {
    id: 'presupuesto',
    q: '¿Cuánto puedes invertir por mes sin sufrir?',
    opts: [
      { v: 'bajo', l: 'Menos de 100 USD' },
      { v: 'medio', l: '100 a 300 USD' },
      { v: 'alto', l: 'Más de 300 USD' },
    ],
  },
  {
    id: 'experiencia',
    q: '¿Ya pusiste anuncios alguna vez?',
    opts: [
      { v: 'nunca', l: 'Nunca' },
      { v: 'fallo', l: 'Probé y no funcionó' },
      { v: 'exito', l: 'Sí, con resultados' },
    ],
  },
];

interface Props {
  campanas: Campana[];
  creativos: Creativo[];
  perfil?: { nombre?: string; modulos_activos?: string[] };
  onNavigate: (view: CampanasView) => void;
  onSelectCampana: (campana: Campana) => void;
}

export default function CampanasHome({ campanas, perfil, onNavigate }: Props) {
  const nombre = perfil?.nombre?.split(' ')[0] ?? 'Doc';
  const [modo, setModo] = useState<'puertas' | 'diagnostico'>('puertas');
  const [resp, setResp] = useState<Record<string, string>>({});

  // Primeras Ventas se abre con la oferta aprobada (Cinturón Verde) o si el mentor habilitó el módulo.
  const ventasAbierta = useMemo(() => {
    try {
      const saved = localStorage.getItem('tcd_hoja_ruta_v2');
      const set = new Set<string>(saved ? JSON.parse(saved) : []);
      if ((cinturonDesdeProgreso(set)?.orden ?? 0) >= 5) return true;
    } catch { /* noop */ }
    return (perfil?.modulos_activos ?? []).includes('campanas');
  }, [perfil]);

  const respondidas = PREGUNTAS.every((p) => resp[p.id]);

  const recomendada: PuertaId = useMemo(() => {
    if (resp.protocolo === 'validado' && resp.presupuesto !== 'bajo' && ventasAbierta) return 'ventas';
    if (resp.recurso === 'si' && resp.presupuesto !== 'bajo') return 'comunidad';
    if (resp.protocolo === 'validado' && resp.presupuesto !== 'bajo') return 'comunidad';
    return 'seguidores';
  }, [resp, ventasAbierta]);

  const razonRecomendada: string = useMemo(() => {
    if (recomendada === 'ventas') return 'Tu oferta está validada y tienes presupuesto: estás lista para cobrar. Lo demás puede esperar.';
    if (recomendada === 'comunidad') {
      const extra = resp.protocolo === 'validado' && !ventasAbierta
        ? ' Y cuando Vera apruebe tu oferta, pasamos directo a Primeras Ventas.'
        : '';
      return `Tienes algo para dar: armemos tu audiencia propia antes de pedirle nada.${extra}`;
    }
    return 'Primero que te conozcan las personas correctas. Con tu punto de partida, esta es la puerta que rinde.';
  }, [recomendada, resp, ventasAbierta]);

  function elegir(p: PuertaId) {
    if (p === 'ventas' && !ventasAbierta) return;
    try { localStorage.setItem('tcd_campana_objetivo', p); } catch { /* noop */ }
    onNavigate('nueva');
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-500">

      {/* Hero */}
      <div>
        <p className="text-[11px] font-bold text-gold/70 uppercase tracking-[0.2em] mb-2">
          Tu Máquina de Pacientes
        </p>
        <h1 className="text-3xl font-medium text-cream tracking-tight">
          Hola, {nombre}.
        </h1>
        <p className="text-xl text-gold mt-1">¿Qué quieres lograr con tus anuncios?</p>
        <p className="text-sm text-cream/55 mt-2">
          Elige una puerta y te llevamos paso a paso: qué decir, qué mostrar y dónde hacer clic. Nada más.
        </p>
      </div>

      {modo === 'puertas' && (
        <>
          {/* Las 3 puertas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PUERTAS.map((p) => {
              const bloqueada = p.id === 'ventas' && !ventasAbierta;
              const Icon = bloqueada ? Lock : p.icon;
              return (
                <button
                  key={p.id}
                  onClick={() => elegir(p.id)}
                  disabled={bloqueada}
                  className={`text-left rounded-2xl border p-5 transition-all group ${
                    bloqueada
                      ? 'bg-[#0d0d0c] border-cream/8 cursor-not-allowed'
                      : 'bg-panel border-[rgba(232,150,46,0.15)] hover:border-gold/50 hover:bg-[#161512]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-2xl ${bloqueada ? 'opacity-30 grayscale' : ''}`}>{p.emoji}</span>
                    <Icon className={`w-4 h-4 ${bloqueada ? 'text-cream/25' : 'text-gold/60 group-hover:text-gold'} transition-colors`} />
                  </div>
                  <h3 className={`text-base font-semibold ${bloqueada ? 'text-cream/35' : 'text-cream'}`}>
                    {p.titulo}
                  </h3>
                  <p className={`text-xs mt-1 leading-relaxed ${bloqueada ? 'text-cream/25' : 'text-cream/55'}`}>
                    {p.promesa}
                  </p>
                  <p className={`text-[11px] uppercase tracking-wider mt-3 font-semibold ${bloqueada ? 'text-cream/20' : 'text-gold/70'}`}>
                    {p.detalle}
                  </p>
                  {bloqueada && (
                    <p className="text-[11px] text-gold/50 mt-2 italic leading-relaxed">
                      Se desbloquea cuando Vera apruebe tu oferta — anunciar sin oferta lista quema dinero.
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          {/* Diagnóstico */}
          <div className="flex justify-center">
            <button
              onClick={() => setModo('diagnostico')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[rgba(232,150,46,0.25)] text-sm text-gold hover:bg-gold/10 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              ¿No sabes cuál te toca? Hacer mi diagnóstico (2 min)
            </button>
          </div>
        </>
      )}

      {modo === 'diagnostico' && (
        <div className="space-y-5">
          <button
            onClick={() => { setModo('puertas'); setResp({}); }}
            className="flex items-center gap-1.5 text-xs text-cream/55 hover:text-cream transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Volver a las puertas
          </button>

          {PREGUNTAS.map((p, i) => (
            <div key={p.id} className="bg-panel border border-[rgba(232,150,46,0.1)] rounded-2xl p-5">
              <p className="text-sm text-cream/80 font-medium mb-3">
                <span className="text-gold/60 mr-2">{i + 1}.</span>{p.q}
              </p>
              <div className="flex flex-wrap gap-2">
                {p.opts.map((o) => (
                  <button
                    key={o.v}
                    onClick={() => setResp((prev) => ({ ...prev, [p.id]: o.v }))}
                    className={`px-3.5 py-1.5 rounded-full text-xs border transition-all ${
                      resp[p.id] === o.v
                        ? 'bg-gold text-black border-gold font-semibold'
                        : 'border-cream/15 text-cream/65 hover:text-cream hover:border-cream/30'
                    }`}
                  >
                    {o.l}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {respondidas && (() => {
            const p = PUERTAS.find((x) => x.id === recomendada)!;
            return (
              <div className="bg-[#161310] border border-gold/30 rounded-2xl p-6 animate-in fade-in duration-300">
                <p className="text-[11px] font-bold text-gold/70 uppercase tracking-[0.2em] mb-2">
                  Tu campaña es
                </p>
                <h3 className="text-2xl font-medium text-cream">
                  {p.emoji} {p.titulo}
                </h3>
                <p className="text-sm text-cream/75 mt-2 leading-relaxed">{razonRecomendada}</p>
                {resp.experiencia === 'fallo' && (
                  <p className="text-xs text-gold/70 mt-2 italic">
                    Y algo importante: casi nunca es Meta — es la oferta o la puntería. Esta vez vamos paso a paso.
                  </p>
                )}
                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => elegir(recomendada)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gold hover:bg-goldhi text-black text-sm font-bold transition-all"
                  >
                    Empezar <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { setModo('puertas'); }}
                    className="px-5 py-2.5 rounded-xl border border-[rgba(232,150,46,0.15)] text-sm text-cream/75 hover:text-cream transition-colors"
                  >
                    Prefiero elegir yo
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Mis campañas · Ganadores */}
      <div className="flex flex-wrap gap-3 pt-2 border-t border-[rgba(232,150,46,0.08)]">
        <button
          onClick={() => onNavigate('historial')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-cream/10 text-xs text-cream/65 hover:text-cream hover:border-cream/25 transition-all"
        >
          <FolderOpen className="w-3.5 h-3.5" />
          Mis campañas
          {campanas.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-gold/15 text-gold text-[11px] font-bold">
              {campanas.length}
            </span>
          )}
        </button>
        <button
          onClick={() => onNavigate('ganadores')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-cream/10 text-xs text-cream/65 hover:text-cream hover:border-cream/25 transition-all"
        >
          <Trophy className="w-3.5 h-3.5" />
          Ganadores
        </button>
      </div>
    </div>
  );
}
