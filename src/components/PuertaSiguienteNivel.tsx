/**
 * PUERTA AL SIGUIENTE NIVEL (Bloque 2).
 *
 * Para quien tiene un tramo intermedio de acceso: le muestra lo que ya selló,
 * las piezas que le faltan con el nombre de la sesión donde se ganan, y la
 * puerta al nivel que sigue. El del $27 no la ve: tiene su propia graduación
 * de los 5 días.
 *
 * La oferta de la puerta sale de `laOfertaQueSigue`, no de los nombres de
 * acceso: quién ve qué y qué se le vende son dos preguntas distintas.
 */
import React from 'react';
import { Lock } from 'lucide-react';
import { PIEZAS_ADN, estadoPieza } from '../lib/adnPiezas';
import { planActual, planPermitePilar, waLink } from '../lib/planes';
import { laOfertaQueSigue } from '../lib/laOfertaQueSigue';
import { VOC } from '../lib/vocabulario';

export default function PuertaSiguienteNivel() {
  const plan = planActual();
  // Solo tramos intermedios: el de los 5 días tiene su graduación propia.
  if (plan !== 'verde' && plan !== 'amarillo') return null;

  const faltan = PIEZAS_ADN.filter((p) => !planPermitePilar(plan, p.pilar));
  if (!faltan.length) return null;

  const suyas = PIEZAS_ADN.filter((p) => planPermitePilar(plan, p.pilar));
  const selladas = suyas.filter((p) => estadoPieza(p).sellada).length;
  const oferta = laOfertaQueSigue(Math.min(...faltan.map((p) => p.pilar)));
  const completo = selladas === suyas.length;

  const abrir = () => {
    window.open(oferta.checkout || waLink(oferta.mensaje), '_blank');
  };

  return (
    <div className="card-panel p-5 border border-gold/25 bg-gold/[0.06]">
      <p className="text-sm font-bold uppercase tracking-[0.25em] text-gold mb-1">
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
            <Lock className="w-4 h-4 text-cream/30 shrink-0" />
            <span className="text-cream/75 flex-1">{VOC(p.titulo)}</span>
            <span className="text-sm text-cream/40 text-right">{p.sesion}</span>
          </div>
        ))}
      </div>

      {/* Qué abre, antes del botón: el que no sabe qué compra, no compra. */}
      <p className="text-[15px] text-cream/65 mt-4 leading-relaxed">{oferta.abre}</p>
      <button onClick={abrir} className="w-full btn-primary py-3.5 rounded-xl text-[17px] font-bold mt-3">
        {oferta.boton} →
      </button>
    </div>
  );
}
