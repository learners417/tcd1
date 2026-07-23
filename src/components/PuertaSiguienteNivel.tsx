/**
 * PUERTA AL SIGUIENTE NIVEL (Bloque 2).
 *
 * Para quien compró un tramo intermedio (Tu Sistema $497): le muestra lo que
 * ya selló, las piezas que le faltan con el nombre de la sesión donde se ganan,
 * y la puerta al nivel que sigue. El del $27 no la ve: tiene su propia
 * graduación de los 5 días.
 */
import React from 'react';
import { PIEZAS_ADN, estadoPieza } from '../lib/adnPiezas';
import { planActual, planPermitePilar, planParaPilar, NOMBRE_PLAN, PRECIO_FUNDADOR, checkoutUrl, waLink } from '../lib/planes';

export default function PuertaSiguienteNivel() {
  const plan = planActual();
  // Solo tramos intermedios: el de los 5 días tiene su graduación propia.
  if (plan !== 'verde' && plan !== 'amarillo') return null;

  const faltan = PIEZAS_ADN.filter((p) => !planPermitePilar(plan, p.pilar));
  if (!faltan.length) return null;

  const suyas = PIEZAS_ADN.filter((p) => planPermitePilar(plan, p.pilar));
  const selladas = suyas.filter((p) => estadoPieza(p).sellada).length;
  const nivel = planParaPilar(Math.min(...faltan.map((p) => p.pilar)));
  const completo = selladas === suyas.length;

  const abrir = () => {
    const url = checkoutUrl(nivel);
    window.open(url || waLink(`Hola · Quiero abrir ${NOMBRE_PLAN[nivel]} (${PRECIO_FUNDADOR[nivel]})`), '_blank');
  };

  return (
    <div className="card-panel p-5 border border-gold/25 bg-gradient-to-b from-gold/[0.06] to-transparent">
      <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold mb-1">
        {completo ? 'Terminaste tu tramo' : 'Tu tramo'}
      </p>
      <p className="text-lg text-cream" style={{ fontFamily: 'var(--font-display)' }}>
        {selladas} de {suyas.length} piezas selladas
      </p>
      {completo && (
        <p className="text-sm text-cream/70 mt-1.5 leading-relaxed">
          Tienes tu precio, tu método, tu oferta y tu sistema. Lo que sigue es lo que los sostiene todos los días.
        </p>
      )}

      <div className="mt-4 space-y-1.5">
        {faltan.map((p) => (
          <div key={p.id} className="flex items-baseline gap-2 text-sm">
            <span className="text-cream/30">🔒</span>
            <span className="text-cream/75 flex-1">{p.titulo}</span>
            <span className="text-[11px] text-cream/40 text-right">{p.sesion}</span>
          </div>
        ))}
      </div>

      <button onClick={abrir} className="w-full btn-primary py-3.5 rounded-xl text-sm font-bold mt-4">
        Abrir {NOMBRE_PLAN[nivel]} · {PRECIO_FUNDADOR[nivel]} →
      </button>
    </div>
  );
}
