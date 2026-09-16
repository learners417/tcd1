/**
 * Dia45Banner.tsx — Banner del Día 45 (Regla #5 v7)
 *
 * Se muestra cuando el PASO en el que va ya es de la Fase 4 (día 45 o más del Camino) y tiene campos críticos del ADN
 * incompletos. Bloquea visualmente el avance a Fase 4 y lista los campos
 * faltantes agrupados por pilar, con un link para volver a cada uno.
 */

import { ArrowRight, Lock } from 'lucide-react';
import type { ValidacionDia45 } from '../lib/diaValidator';
import { agruparFaltantesPorPilar } from '../lib/diaValidator';

interface Dia45BannerProps {
  validacion: ValidacionDia45;
  diaActual: number;
  onIrAPilar?: (pilarId: string) => void;
}

export default function Dia45Banner({ validacion, onIrAPilar }: Dia45BannerProps) {
  if (!validacion.debeBloquearFase4) return null;

  const grupos = agruparFaltantesPorPilar(validacion.camposFaltantes);
  const n = validacion.camposFaltantes.length;

  // En positivo y en oro: es lo que falta completar, no una falta.
  return (
    <div className="rounded-2xl border border-gold/40 bg-gold/5 p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center flex-shrink-0">
          <Lock className="w-5 h-5 text-gold" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-cream tracking-tight mb-1">
            La Fase 4 se abre con tu ADN completo
          </h3>
          <p className="text-base text-cream/75">
            Te {n === 1 ? 'falta' : 'faltan'} <span className="text-cream font-semibold">{n}</span> {n === 1 ? 'dato clave' : 'datos clave'}.
            Con ellos tus anuncios salen escritos desde tu historia. Tócalos y los completas en su pilar.
          </p>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="h-1.5 bg-gold/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gold rounded-full transition-all"
          style={{ width: `${validacion.porcentajeCompleto}%` }}
        />
      </div>

      {/* Grupos por pilar */}
      <div className="space-y-2">
        {grupos.map(({ pilar, campos }) => (
          <button
            key={pilar}
            type="button"
            onClick={() => onIrAPilar?.(pilar)}
            className="w-full text-left rounded-xl border border-gold/20 bg-surface/40 hover:bg-gold/5 hover:border-gold/40 transition-colors p-3 flex items-center gap-3 group"
          >
            <span className="text-sm text-gold font-semibold flex-shrink-0">
              {pilar}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-cream/80">
                {campos.map((c) => c.label).join(' · ')}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-cream/55 group-hover:text-gold transition-colors flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
