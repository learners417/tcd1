/**
 * LA RUEDA DE LA VIDA — 8 dimensiones, 8 toques, 2 minutos.
 * El domingo se re-mide; el resto de la semana se contempla.
 */
import React, { useState } from 'react';
import { DIMENSIONES_RUEDA, type ValoresRueda, ultimaMedicion, guardarMedicion, getParaQue, setParaQue, momentosDescanso } from '../lib/rueda';
import BotonAudio from './sesion/BotonAudio';

export default function RuedaVida() {
  const anterior = ultimaMedicion();
  const esDomingo = new Date().getDay() === 0;
  const hoy = new Date().toISOString().split('T')[0];
  const medidaHoy = anterior?.fecha === hoy;
  const [valores, setValores] = useState<ValoresRueda>(anterior?.valores ?? {});
  const [guardada, setGuardada] = useState(medidaHoy);
  const [paraQue, setPQ] = useState(getParaQue());
  const [pqOk, setPqOk] = useState(false);
  const momentos = momentosDescanso().slice(0, 4);

  const completas = DIMENSIONES_RUEDA.filter((d) => typeof valores[d.id] === 'number').length;

  return (
    <div className={`card-panel p-6 space-y-6 ${esDomingo && !guardada ? 'border border-gold/40' : ''}`}>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold mb-1">Tu Rueda de la Vida</p>
        <p className="text-xs text-cream/60">
          {esDomingo && !guardada ? 'Hoy toca: 8 toques, 2 minutos. La transformación también se mide.' : 'De profesional independiente a director de clínica — en tu vida entera, no solo en tu cuenta.'}
        </p>
      </div>

      <div className="space-y-3">
        {DIMENSIONES_RUEDA.map((d) => {
          const v = valores[d.id];
          const prev = anterior && anterior.fecha !== hoy ? anterior.valores[d.id] : undefined;
          return (
            <div key={d.id}>
              <div className="flex items-baseline justify-between mb-1">
                <p className="text-xs text-cream/80">{d.emoji} {d.label}</p>
                <p className="text-[11px] text-cream/50">
                  {typeof v === 'number' ? `${v}/10` : '—'}
                  {typeof prev === 'number' && typeof v === 'number' && v !== prev && (
                    <span className={v > prev ? 'text-success ml-1' : 'text-danger ml-1'}>{v > prev ? `↑${v - prev}` : `↓${prev - v}`}</span>
                  )}
                </p>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <button key={i} type="button" onClick={() => { setValores((p) => ({ ...p, [d.id]: i + 1 })); setGuardada(false); }}
                    className={`h-5 flex-1 rounded transition-colors min-w-0 ${typeof v === 'number' && i < v ? 'bg-gold' : 'bg-cream/10 hover:bg-cream/20'}`}
                    aria-label={`${d.label} ${i + 1}`} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {guardada ? (
        <p className="text-sm text-success text-center">Tu Rueda quedó grabada en tu ADN ✓</p>
      ) : (
        <button type="button" disabled={completas < 4} onClick={() => { guardarMedicion(valores); setGuardada(true); }}
          className="w-full btn-primary text-sm font-bold py-3 rounded-xl disabled:opacity-40">
          Grabar mi Rueda en el ADN {completas < 8 ? `(${completas}/8)` : ''}
        </button>
      )}

      <div className="pt-4 border-t border-cream/10">
        <p className="text-xs font-semibold text-cream/80 mb-2">Tu Para Qué — ¿qué vas a crear con el tiempo, el dinero y la energía que recuperes?</p>
        <textarea value={paraQue} onChange={(e) => { setPQ(e.target.value); setPqOk(false); }} rows={3}
          placeholder="No viniste solo a hacer dinero. ¿Para qué es todo esto?"
          className="w-full bg-surface/50 border border-[rgba(232,150,46,0.15)] rounded-xl px-3.5 py-2.5 text-sm text-cream placeholder:text-cream/35 focus:outline-none focus:border-gold/50" />
        <div className="flex items-center justify-between mt-2">
          <BotonAudio onTexto={(t) => { setPQ((p) => (p ? p + '\n' + t : t)); setPqOk(false); }} />
          {pqOk ? <span className="text-xs text-success">Grabado en tu ADN ✓</span> : (
            <button type="button" disabled={!paraQue.trim()} onClick={() => { setParaQue(paraQue.trim()); setPqOk(true); }}
              className="text-xs font-bold text-gold hover:text-goldhi disabled:opacity-40">Grabar en mi ADN →</button>
          )}
        </div>
      </div>

      {momentos.length > 0 && (
        <div className="pt-4 border-t border-cream/10">
          <p className="text-xs font-semibold text-cream/80 mb-2">Tus momentos — la vida pasando</p>
          <div className="space-y-1.5">
            {momentos.map((m) => (
              <p key={m.fecha} className="text-xs text-cream/60 italic">“{m.texto}” <span className="not-italic text-cream/35">· {m.fecha}</span></p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
