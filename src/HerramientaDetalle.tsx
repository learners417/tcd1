/**
 * TU ADN — la página (ZIP B).
 * Cada pieza dice EXACTO en qué sesión se sella, y esa sesión es la única
 * forma de cambiarla. Lo bloqueado se ve con su nombre y su resultado:
 * esa vista es la puerta al camino completo.
 */
import React from 'react';
import { Lock, ChevronRight } from 'lucide-react';
import { PIEZAS_ADN, estadoPieza, resumenADN, planLimitado, type PiezaADN } from '../lib/adnPiezas';
import type { ProfileV2 } from '../lib/supabase';

interface ADNProps {
  perfil?: Partial<ProfileV2>;
  userId?: string;
  setCurrentPage?: (p: string) => void;
  onProfileFieldUpdate?: (fields: Record<string, unknown>) => void;
}

function Pieza({ p, onIr }: { p: PiezaADN; onIr?: () => void }) {
  const { sellada, fecha, bloqueada } = estadoPieza(p);
  return (
    <div className={`rounded-2xl border p-4 transition-colors ${
      sellada ? 'border-gold/30 bg-gold/[0.05]'
      : bloqueada ? 'border-cream/10 bg-surface/20'
      : 'border-[rgba(232,150,46,0.14)] bg-surface/30'}`}>
      <div className="flex items-start gap-3">
        <span className="text-base mt-0.5 shrink-0">
          {sellada ? '🔒' : bloqueada ? <Lock className="w-4 h-4 text-cream/25" /> : '○'}
        </span>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${sellada ? 'text-cream' : bloqueada ? 'text-cream/45' : 'text-cream/85'}`}>{p.titulo}</p>
          <p className={`text-xs mt-0.5 leading-relaxed ${sellada ? 'text-cream/60' : 'text-cream/40'}`}>{p.que}</p>
          {sellada ? (
            <p className="text-[11px] text-success mt-2">Sellado{fecha ? ' · ' + fecha : ''} — se cambia rehaciendo su sesión</p>
          ) : bloqueada ? (
            <p className="text-[11px] text-cream/35 mt-2">Se abre con el camino completo</p>
          ) : (
            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="text-[11px] text-cream/55">Se completa en: <span className="text-gold font-medium">{p.sesion}</span></p>
              {onIr && (
                <button onClick={onIr} className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold text-gold hover:text-goldhi">
                  Ir <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ADN({ setCurrentPage }: ADNProps) {
  const { selladas, total } = resumenADN();
  const limitado = planLimitado();
  const alma = PIEZAS_ADN.filter((p) => p.grupo === 'alma');
  const activos = PIEZAS_ADN.filter((p) => p.grupo === 'activo');
  const irAlCamino = setCurrentPage ? () => setCurrentPage('roadmap') : undefined;
  const bloqueadas = PIEZAS_ADN.filter((p) => estadoPieza(p).bloqueada).length;

  return (
    <div className="max-w-2xl mx-auto pb-14 animate-in fade-in duration-300 space-y-6">
      <div>
        <p className="text-2xl font-light text-cream" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>Tu ADN</p>
        <p className="text-sm text-cream/55 mt-1">Todo lo que esta app construye sale de acá: tus textos, tus anuncios, tu oferta, tu clínica.</p>
      </div>

      <div className="card-panel px-5 py-4">
        <div className="flex items-baseline justify-between mb-2.5">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-cream/60">Sellado</p>
          <p className="text-[11px] font-bold text-gold">{selladas} de {total}{selladas === total ? ' — completo' : ''}</p>
        </div>
        <div className="flex gap-1">
          {PIEZAS_ADN.map((p) => (
            <div key={p.id} title={p.titulo}
              className={`h-1.5 flex-1 rounded-full ${estadoPieza(p).sellada ? 'bg-gold' : 'bg-cream/15'}`} />
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold mb-2">El alma — quién eres</p>
        <p className="text-xs text-cream/45 mb-3">En orden: tu historia trae tus dones, tus dones señalan a quién sirves, y de ahí nace tu oferta. Nunca al revés.</p>
        <div className="space-y-2">{alma.map((p) => <Pieza key={p.id} p={p} onIr={irAlCamino} />)}</div>
      </div>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold mb-2">Los activos — lo que opera</p>
        <div className="space-y-2">{activos.map((p) => <Pieza key={p.id} p={p} onIr={irAlCamino} />)}</div>
      </div>

      {limitado && bloqueadas > 0 && (
        <div className="card-panel p-5 border border-gold/30 bg-gradient-to-b from-gold/[0.07] to-transparent">
          <p className="text-sm text-cream/85 leading-relaxed">
            Te faltan <strong className="text-gold">{bloqueadas} piezas</strong>: tu método, tu oferta y el sistema que las vende. Son las que convierten tu precio nuevo en pacientes que lo pagan.
          </p>
        </div>
      )}

      <p className="text-[11px] text-cream/40 text-center leading-relaxed">
        Lo sellado no se edita por fuera: se cambia rehaciendo esa sesión.<br />
        Así tu ADN nunca se contradice con lo que la app construye.
      </p>
    </div>
  );
}
