/**
 * LA GRADUACIÓN DE LOS 5 DÍAS — ZIP A/B.
 * Aparece cuando el comprador de EL NÚMERO ($27) completa su día 5.
 * Lee la taxonomía única del ADN: muestra lo que selló y lo que sigue
 * apagado, con el resultado de cada pieza. Es la puerta, no el muro.
 */
import React from 'react';
import { waLink } from '../lib/planes';
import { PIEZAS_ADN, estadoPieza, planLimitado } from '../lib/adnPiezas';

function completadas(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem('tcd_hoja_ruta_v2') ?? '[]') as string[]); } catch { return new Set(); }
}

export default function GraduacionSemanaBlanca() {
  if (!planLimitado() || !completadas().has('1-P1.5')) return null;

  const suyas = PIEZAS_ADN.filter((p) => p.plan === 'elnumero');
  const faltan = PIEZAS_ADN.filter((p) => p.plan === 'completo');
  const selladas = suyas.filter((p) => estadoPieza(p).sellada);

  return (
    <div className="card-panel p-6 sm:p-7 border border-gold/35 bg-gradient-to-b from-gold/[0.09] to-transparent">
      <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold mb-2">🥋 Terminaste tus 5 días</p>
      <p className="text-lg text-cream leading-snug" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
        Hace cinco días tu precio no decía lo que vale tu trabajo.
      </p>
      <p className="text-sm text-cream/70 mt-1">Hoy tienes tu número, tu anuncio y tus respuestas. Eso ya no se discute.</p>

      <div className="mt-5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-cream/55 mb-2">
          Lo que queda grabado en tu ADN — {selladas.length} de {suyas.length}
        </p>
        <div className="space-y-1.5">
          {suyas.map((p) => {
            const on = estadoPieza(p).sellada;
            return (
              <div key={p.id} className={`flex items-start gap-2.5 ${on ? '' : 'opacity-45'}`}>
                <span className={`text-sm mt-0.5 ${on ? 'text-success' : 'text-cream/30'}`}>{on ? '✓' : '○'}</span>
                <p className="text-sm text-cream/85 flex-1">{p.titulo} <span className="text-cream/45">— {p.que}</span></p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 pt-5 border-t border-cream/10">
        <p className="text-[11px] font-bold uppercase tracking-wider text-cream/55 mb-2">Lo que sigue apagado — {faltan.length} piezas</p>
        <div className="space-y-1.5">
          {faltan.map((p) => (
            <div key={p.id} className="flex items-start gap-2.5">
              <span className="text-cream/30 text-sm mt-0.5">🔒</span>
              <p className="text-sm text-cream/55 flex-1">{p.titulo} <span className="text-cream/35">— {p.que}</span></p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 pt-5 border-t border-cream/10">
        <p className="text-[11px] font-bold uppercase tracking-wider text-gold mb-2">🎁 Y te dejo dos sesiones más, abiertas</p>
        <p className="text-sm text-cream/70 leading-relaxed">
          <strong className="text-cream/90">El dinero en el cuerpo</strong> — para que tu precio también lo sostenga tu voz, no solo tu cabeza.<br />
          <strong className="text-cream/90">Tu creencia nueva y el Estandarte</strong> — la frase que vas a leer cada vez que dudes.
        </p>
        <p className="text-[11px] text-cream/45 mt-2">Están en tu Camino. Hazlas cuando quieras.</p>
      </div>

      <p className="text-sm text-cream/85 mt-5 leading-relaxed">
        Subiste tu precio. <strong className="text-gold">Lo que sigue es quién te lo paga:</strong> tu método, tu oferta y el sistema que llena tu agenda — los 90 días completos, hasta tus primeros 10 a tu precio nuevo.
      </p>

      <a href={waLink('Hola · Terminé mis 5 días y quiero seguir el camino completo')} target="_blank" rel="noreferrer"
        className="inline-block mt-4 btn-primary text-[#1a1206] text-sm font-bold px-5 py-3 rounded-xl">
        Quiero seguir el camino →
      </a>
    </div>
  );
}
