/**
 * LA CADENA DEL ADN — el ikigai encendiéndose en HOY.
 * Consume la taxonomía única (adnPiezas): muestra las 9 piezas del alma y
 * el contador de las 14. Un toque lleva al ADN completo.
 */
import React from 'react';
import { PIEZAS_ADN, estadoPieza, resumenADN } from '../lib/adnPiezas';
import { VOC } from '../lib/vocabulario';

export default function CadenaADN({ onAbrir }: { onAbrir?: () => void }) {
  const alma = PIEZAS_ADN.filter((p) => p.grupo === 'alma');
  const { selladas, total } = resumenADN();
  const completo = selladas === total;

  return (
    <button onClick={onAbrir} disabled={!onAbrir} className="card-panel px-5 py-4 w-full text-left disabled:cursor-default">
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <p className="text-[15px] font-bold uppercase tracking-[0.16em] text-cream/60">Tu ADN</p>
        <p className="text-[17px] font-semibold text-goldhi">
          {completo ? 'Completo — listo para grabar y lanzar' : `${selladas} de ${total} sellados`}
        </p>
      </div>
      {/* Las nueve piezas a la vista, sin desplazamiento: la lista termina. */}
      <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
        {alma.map((p) => {
          const on = estadoPieza(p).sellada;
          return (
            <li key={p.id} className="flex items-center gap-2 min-w-0" title={VOC(p.titulo)}>
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: on ? 'var(--tilde, #4A7C59)' : 'var(--line2, #DFD3BC)' }}
              />
              <span className={`text-[15px] leading-tight ${on ? 'text-cream' : 'text-cream/55'}`}>
                {p.titulo.replace('Tu ', '').replace('Tus ', '')}
              </span>
            </li>
          );
        })}
      </ul>
    </button>
  );
}
