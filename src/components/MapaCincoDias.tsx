/**
 * EL MAPA DE TUS 5 DÍAS — ZIP E.
 * Lo primero que ve el comprador de EL NÚMERO, con las MISMAS palabras que
 * leyó antes de pagar. Sin sorpresas: lo que le prometimos afuera es lo que
 * encuentra adentro.
 */
import React from 'react';
import { planLimitado } from '../lib/adnPiezas';

const DIAS = [
  { d: 'Día 1', t: 'Tu número', s: 'lo calculas hoy mismo, en minutos' },
  { d: 'Días 2-4', t: 'Sostener tu precio', s: 'la parte que nadie te enseñó' },
  { d: 'Día 5', t: 'Tu precio y tu anuncio', s: 'lo sellas y sale el mensaje, listo para enviar' },
  { d: 'Viernes', t: 'En vivo conmigo', s: 'revisamos tu precio, respondo tus dudas' },
  { d: 'Lunes', t: 'Lo cobras', s: 'con guion y sin culpa' },
];

export default function MapaCincoDias() {
  let hecho = false;
  try { hecho = (JSON.parse(localStorage.getItem('tcd_hoja_ruta_v2') ?? '[]') as string[]).includes('1-P1.5'); } catch { /* noop */ }
  if (!planLimitado() || hecho) return null;

  return (
    <div className="card-panel p-5 border border-gold/20">
      <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold mb-1">Tus 5 días, guiados</p>
      <p className="text-xs text-cream/55 mb-4">Tu número lo sacas hoy, en minutos. Los 5 días son para lo difícil: sostenerlo.</p>
      <div className="space-y-2.5">
        {DIAS.map((x) => (
          <div key={x.d} className="flex items-baseline gap-3">
            <span className="text-[11px] font-bold text-gold w-16 shrink-0">{x.d}</span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm text-cream/90 font-medium">{x.t}</span>
              <span className="block text-[11px] text-cream/45">{x.s}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
