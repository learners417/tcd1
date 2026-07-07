/**
 * ComparacionDia45.tsx — Banner de comparación Foto de Partida (P0.2) vs ADN actual
 *
 * Se muestra en el Roadmap cuando el usuario llega al día 45 y tiene la Foto
 * de Partida tomada. Es el "efecto revelación" descripto en mejoras.html:
 * muchas dimensiones que el usuario se autocalificó alto el día 1 bajan al
 * día 45 porque al ver el ADN real toma dimensión de lo que faltaba.
 *
 * Si no hay Foto de Partida, no renderiza nada (silencioso).
 */

import { Camera, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { ComparacionDia45 as Comparacion } from '../lib/diaValidator';

interface ComparacionDia45Props {
  comparacion: Comparacion;
  diaActual: number;
}

export default function ComparacionDia45({ comparacion, diaActual }: ComparacionDia45Props) {
  if (!comparacion.tieneFotoPartida) return null;

  const { dimensiones, promedioDia1, promedioDia45, deltaPromedio } = comparacion;

  return (
    <div className="rounded-2xl border border-[#E8962E]/30 bg-[#E8962E]/[0.04] p-5 space-y-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#E8962E]/15 border border-[#E8962E]/30 flex items-center justify-center flex-shrink-0">
          <Camera className="w-5 h-5 text-[#E8962E]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#E8962E] mb-1">
            Día {diaActual} · Foto de Partida vs ADN real
          </p>
          <h3 className="text-lg font-medium text-[#F2EFE9] tracking-tight mb-1">
            Mira cuánto cambió tu percepción
          </h3>
          <p className="text-sm text-[#F2EFE9]/60">
            El día 1 te autoevaluaste sin saber lo que no sabías. Hoy, con el ADN
            real adelante, vas a ver cómo se mueven los puntajes. Donde más bajó
            es donde más aprendiste.
          </p>
        </div>
      </div>

      {/* Promedio global */}
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Día 1 · promedio" valor={promedioDia1.toFixed(1)} suffix="/ 5" />
        <Stat label={`Día ${diaActual} · promedio`} valor={promedioDia45.toFixed(1)} suffix="/ 5" />
        <Stat
          label="Delta"
          valor={`${deltaPromedio >= 0 ? '+' : ''}${deltaPromedio.toFixed(1)}`}
          tono={deltaPromedio > 0 ? 'verde' : deltaPromedio < 0 ? 'amarillo' : 'neutro'}
        />
      </div>

      {/* Por dimensión */}
      <div className="space-y-2">
        {dimensiones.map((dim) => (
          <DimensionRow key={dim.key} dim={dim} />
        ))}
      </div>

      <p className="text-xs text-[#F2EFE9]/40 italic pt-2 border-t border-[#E8962E]/10">
        Los puntajes del día actual se derivan automáticamente del estado de tu ADN.
        Completa los pilares pendientes para mejorarlos.
      </p>
    </div>
  );
}

// ── Sub-componentes ──────────────────────────────────────────────────────────

interface StatProps {
  label: string;
  valor: string;
  suffix?: string;
  tono?: 'verde' | 'amarillo' | 'rojo' | 'neutro';
}

function Stat({ label, valor, suffix, tono = 'neutro' }: StatProps) {
  const color =
    tono === 'verde' ? 'text-[#22C55E]'
      : tono === 'amarillo' ? 'text-[#F0B429]'
      : tono === 'rojo' ? 'text-[#ff5e5e]'
      : 'text-[#E8962E]';
  return (
    <div className="card-panel p-3 border border-[rgba(232,150,46,0.10)] bg-[#1A1917]/30 text-center">
      <p className="text-[10px] uppercase tracking-widest text-[#F2EFE9]/40 font-semibold mb-1">
        {label}
      </p>
      <p className={`text-2xl font-bold ${color} leading-none`}>
        {valor}
        {suffix && <span className="text-sm text-[#F2EFE9]/40 font-normal ml-1">{suffix}</span>}
      </p>
    </div>
  );
}

interface DimensionRowProps {
  dim: {
    key: string;
    label: string;
    dia1: number;
    dia45: number;
    delta: number;
  };
}

function DimensionRow({ dim }: DimensionRowProps) {
  const { label, dia1, dia45, delta } = dim;
  const TrendIcon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  const trendColor = delta > 0 ? 'text-[#22C55E]' : delta < 0 ? 'text-[#F0B429]' : 'text-[#F2EFE9]/40';

  return (
    <div className="card-panel p-3 border border-[rgba(232,150,46,0.1)] bg-[#1A1917]/30 flex items-center gap-4">
      <p className="flex-1 min-w-0 text-sm text-[#F2EFE9]/90 truncate">{label}</p>

      {/* Barras visuales */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <ScorePill score={dia1} label="D1" />
        <span className="text-[#F2EFE9]/30">→</span>
        <ScorePill score={dia45} label="hoy" highlight />
      </div>

      <div className={`flex items-center gap-1 ${trendColor} flex-shrink-0 w-14 justify-end`}>
        <TrendIcon className="w-3.5 h-3.5" />
        <span className="text-sm font-mono font-semibold">
          {delta > 0 ? '+' : ''}{delta}
        </span>
      </div>
    </div>
  );
}

interface ScorePillProps {
  score: number;
  label: string;
  highlight?: boolean;
}

function ScorePill({ score, label, highlight }: ScorePillProps) {
  return (
    <div className="flex flex-col items-center">
      <span
        className={`text-lg font-bold font-mono leading-none ${
          highlight ? 'text-[#E8962E]' : 'text-[#F2EFE9]/60'
        }`}
      >
        {score}
      </span>
      <span className="text-[9px] uppercase tracking-widest text-[#F2EFE9]/30 font-semibold mt-0.5">
        {label}
      </span>
    </div>
  );
}
