/**
 * LA CADENA DEL ADN — el ikigai encendiéndose en HOY.
 * Consume la taxonomía única (adnPiezas): muestra las 9 piezas del alma y
 * el contador de las 14. Un toque lleva al ADN completo.
 */
import React from 'react';
import { PIEZAS_ADN, estadoPieza, resumenADN } from '../lib/adnPiezas';

export default function CadenaADN({ onAbrir }: { onAbrir?: () => void }) {
  const alma = PIEZAS_ADN.filter((p) => p.grupo === 'alma');
  const { selladas, total } = resumenADN();
  const completo = selladas === total;

  return (
    <button onClick={onAbrir} disabled={!onAbrir} className="card-panel px-5 py-4 w-full text-left disabled:cursor-default">
      <div className="flex items-baseline justify-between mb-2.5">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-cream/60">🧬 Tu ADN</p>
        <p className="text-[11px] font-bold text-gold">
          {completo ? 'Completo — listo para grabar y lanzar' : `${selladas} de ${total} sellados`}
        </p>
      </div>
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {alma.map((p, i) => {
          const on = estadoPieza(p).sellada;
          const prevOn = i > 0 ? estadoPieza(alma[i - 1]).sellada : false;
          return (
            <React.Fragment key={p.id}>
              {i > 0 && <div className={`h-px w-2 shrink-0 ${on && prevOn ? 'bg-gold/60' : 'bg-cream/15'}`} />}
              <div className="shrink-0 text-center" title={p.titulo}>
                <div className={`w-3 h-3 rounded-full mx-auto ${on ? 'bg-gold ring-2 ring-gold/25' : 'bg-cream/15'}`} />
                <p className={`text-[9px] mt-1 whitespace-nowrap ${on ? 'text-cream/75' : 'text-cream/35'}`}>
                  {p.titulo.replace('Tu ', '').replace('Tus ', '')}
                </p>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </button>
  );
}
