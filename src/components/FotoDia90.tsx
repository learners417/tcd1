/**
 * FotoDia90 — T11 · La Foto del Día 90 (Plan Maestro, idea #9).
 * La tarjeta antes/después en formato premium, para compartir. Reusa el mismo
 * comparador que la Foto de Partida (compararFotoPartida): Día 1 vs presente.
 * Pensada para captura de pantalla (el formato que la gente comparte en IG).
 */
import React from 'react';
import { X, Camera, TrendingUp, ArrowRight } from 'lucide-react';
import type { ComparacionDia45 as Comparacion } from '../lib/diaValidator';

export default function FotoDia90({
  open,
  onClose,
  comparacion,
  nombre,
  dia,
}: {
  open: boolean;
  onClose: () => void;
  comparacion?: Comparacion;
  nombre?: string;
  dia?: number;
}) {
  if (!open) return null;
  const tiene = !!comparacion?.tieneFotoPartida;
  const dims = comparacion?.dimensiones ?? [];
  const topCambios = [...dims].sort((a, b) => b.delta - a.delta).slice(0, 3);

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div className="w-full max-w-md my-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-end mb-2">
          <button onClick={onClose} className="text-[#F2EFE9]/50 hover:text-[#F2EFE9] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* La tarjeta compartible */}
        <div className="rounded-3xl overflow-hidden border border-[#E8962E]/40 bg-gradient-to-b from-[#141210] to-[#080808]">
          <div className="p-6 text-center">
            <div className="text-4xl mb-2">⬛</div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#E8962E] mb-1">
              Día {dia ?? 90} · Sanador Libre
            </p>
            <h2
              className="text-2xl font-medium text-[#F2EFE9]"
              style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}
            >
              {nombre ? `${nombre}, ` : ''}90 días después
            </h2>
          </div>

          {tiene && comparacion ? (
            <div className="px-6 pb-6 space-y-4">
              {/* Promedios Día 1 → hoy */}
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#F2EFE9]/50 font-mono">
                    {comparacion.promedioDia1.toFixed(1)}
                  </p>
                  <p className="text-[9px] uppercase tracking-widest text-[#F2EFE9]/40 mt-1">Día 1</p>
                </div>
                <ArrowRight className="w-5 h-5 text-[#E8962E]" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#E8962E] font-mono">
                    {comparacion.promedioDia45.toFixed(1)}
                  </p>
                  <p className="text-[9px] uppercase tracking-widest text-[#F2EFE9]/40 mt-1">Hoy</p>
                </div>
              </div>

              {/* Los cambios más grandes */}
              <div className="space-y-1.5">
                {topCambios.map((d) => (
                  <div
                    key={d.key}
                    className="flex items-center justify-between rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2"
                  >
                    <span className="text-xs text-[#F2EFE9]/80 truncate">{d.label}</span>
                    <span className="flex items-center gap-1 text-[#22C55E] text-xs font-mono font-bold">
                      <TrendingUp className="w-3 h-3" />
                      {d.delta > 0 ? '+' : ''}
                      {d.delta}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="px-6 pb-6">
              <p className="text-sm text-[#F2EFE9]/60 text-center leading-relaxed">
                Tu Foto del Día 90 se completa cuando tenés cargada tu Foto de Partida del Día 1. Es
                el antes y el después de tu transformación.
              </p>
            </div>
          )}

          <div className="border-t border-[#E8962E]/15 px-6 py-3 flex items-center justify-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-[#E8962E]/70" />
            <span className="text-[9px] uppercase tracking-widest text-[#F2EFE9]/40">
              Tu Clínica Digital · Sanadores Libres
            </span>
          </div>
        </div>

        <p className="text-center text-[10px] text-[#F2EFE9]/40 mt-3">
          Sacá una captura de esta tarjeta para compartir tu logro.
        </p>
      </div>
    </div>
  );
}
