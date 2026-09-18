/**
 * TU ADN — la página (ZIP B).
 * Cada pieza dice EXACTO en qué sesión se sella, y esa sesión es la única
 * forma de cambiarla. Lo bloqueado se ve con su nombre y su resultado:
 * esa vista es la puerta al camino completo.
 */
import React, { useState } from 'react';
import { planActual, planPermitePilar, planParaPilar, NOMBRE_PLAN, PRECIO_FUNDADOR } from '../lib/planes';
import { Lock, ChevronRight, Check, Circle } from 'lucide-react';
import { PIEZAS_ADN, estadoPieza, resumenADN, planLimitado, contenidoDePieza, esEscribibleAqui, guardarOrigen, type PiezaADN } from '../lib/adnPiezas';
import type { ProfileV2 } from '../lib/supabase';
import { VOC } from '../lib/vocabulario';

interface ADNProps {
  perfil?: Partial<ProfileV2>;
  userId?: string;
  setCurrentPage?: (p: string) => void;
  onProfileFieldUpdate?: (fields: Record<string, unknown>) => void;
}

function Pieza({ p, onIr }: { p: PiezaADN; onIr?: () => void }) {
  const { sellada, fecha, bloqueada } = estadoPieza(p);
  const [abierta, setAbierta] = useState(false);
  const [texto, setTexto] = useState(() => contenidoDePieza(p));
  const [editando, setEditando] = useState(false);
  const [borrador, setBorrador] = useState('');
  const puedeEscribir = esEscribibleAqui(p) && !bloqueada;

  const guardar = () => {
    if (guardarOrigen(p, borrador)) setTexto(borrador.trim());
    setEditando(false);
  };

  return (
    <div className={`rounded-2xl border p-4 ${
      sellada ? 'border-gold/40 bg-[var(--card,#FFFDF7)]'
      : bloqueada ? 'border-[var(--line,#EBE1CF)]'
      : 'border-[var(--line2,#DFD3BC)]'}`}>
      <button
        type="button"
        onClick={() => setAbierta((v) => !v)}
        aria-expanded={abierta}
        className="w-full min-h-[52px] flex items-start gap-3 text-left"
      >
        <span className="mt-0.5 shrink-0">
          {sellada ? <Check className="w-5 h-5" style={{ color: 'var(--tilde, #4A7C59)' }} />
            : bloqueada ? <Lock className="w-5 h-5 text-cream/45" />
            : <Circle className="w-5 h-5 text-cream/45" />}
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-[17px] font-semibold text-cream">{VOC(p.titulo)}</span>
          <span className="block text-[15px] text-cream/70 leading-snug">{p.que}</span>
        </span>
        <ChevronRight className={`w-5 h-5 shrink-0 mt-1 text-cream/55 transition-transform ${abierta ? 'rotate-90' : ''}`} />
      </button>

      {abierta && (
        <div className="mt-3 space-y-3">
          {texto && !editando && (
            <p className="text-[17px] leading-relaxed text-cream whitespace-pre-line">{texto}</p>
          )}
          {editando && (
            <div className="space-y-2">
              <textarea
                value={borrador}
                onChange={(e) => setBorrador(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-[var(--line2,#DFD3BC)] bg-transparent p-3 text-[17px] text-cream"
                placeholder="Escríbelo con tus palabras"
              />
              <div className="flex gap-2">
                <button type="button" onClick={guardar} className="btn-ios-primary flex-1">Guardar</button>
                <button type="button" onClick={() => setEditando(false)}
                  className="min-h-[52px] px-4 rounded-[20px] border border-[var(--line2,#DFD3BC)] text-[17px] text-cream">
                  Cancelar
                </button>
              </div>
            </div>
          )}
          {!editando && (
            sellada ? (
              <p className="text-[15px] text-cream/70">
                Sellado{fecha ? ' · ' + fecha : ''}. Para cambiarlo, rehaces su sesión: {p.sesion}.
              </p>
            ) : bloqueada ? (
              <p className="text-[15px] text-cream/70">Se abre con el camino completo.</p>
            ) : puedeEscribir ? (
              <button
                type="button"
                onClick={() => { setBorrador(texto); setEditando(true); }}
                className="min-h-[44px] text-[17px] font-semibold text-goldhi"
              >
                {texto ? 'Cambiar lo que escribiste' : 'Escribirlo ahora'}
              </button>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <p className="text-[15px] text-cream/70">Se completa en: {p.sesion}</p>
                {onIr && (
                  <button onClick={onIr} className="shrink-0 min-h-[44px] text-[17px] font-semibold text-goldhi">
                    Ir al Camino
                  </button>
                )}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default function ADN({ setCurrentPage }: ADNProps) {
  const { selladas, total } = resumenADN();
  const limitado = planLimitado();
  const planHoy = planActual();
  const faltantes = PIEZAS_ADN.filter((p) => !planPermitePilar(planHoy, p.pilar));
  const nivelQueSigue = faltantes.length ? planParaPilar(Math.min(...faltantes.map((p) => p.pilar))) : null;
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
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-cream/60">Sellado</p>
          <p className="text-sm font-bold text-gold">{selladas} de {total}{selladas === total ? ' — completo' : ''}</p>
        </div>
        <div className="flex gap-1">
          {PIEZAS_ADN.map((p) => (
            <div key={p.id} title={VOC(p.titulo)}
              className={`h-1.5 flex-1 rounded-full ${estadoPieza(p).sellada ? 'bg-gold' : 'bg-cream/15'}`} />
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-gold mb-2">Quién eres</p>
        <p className="text-xs text-cream/45 mb-3">En orden: tu historia trae tus dones, tus dones señalan a quién sirves, y de ahí nace tu oferta. Nunca al revés.</p>
        <div className="space-y-2">{alma.map((p) => <Pieza key={p.id} p={p} onIr={irAlCamino} />)}</div>
      </div>

      <div>
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-gold mb-2">Lo que usas todos los días</p>
        <div className="space-y-2">{activos.map((p) => <Pieza key={p.id} p={p} onIr={irAlCamino} />)}</div>
      </div>

      {nivelQueSigue && faltantes.length > 0 && (
        <div className="card-panel p-5 border border-gold/30 bg-gradient-to-b from-gold/[0.07] to-transparent">
          <p className="text-sm text-cream/85 leading-relaxed">
            Te faltan <strong className="text-gold">{faltantes.length} piezas</strong> de tu ADN. Se abren con <strong className="text-cream">{NOMBRE_PLAN[nivelQueSigue]}</strong> ({PRECIO_FUNDADOR[nivelQueSigue]}) — son las que convierten lo que ya sellaste en pacientes que lo pagan.</p>
        </div>
      )}

      <p className="text-sm text-cream/40 text-center leading-relaxed">
        Lo sellado no se edita por fuera: se cambia rehaciendo esa sesión.<br />
        Así tu ADN nunca se contradice con lo que la app construye.
      </p>
    </div>
  );
}
