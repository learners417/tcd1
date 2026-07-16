/**
 * CHECK-OUT — el cierre ritual de la Sesión Viva (liturgia de Javo):
 * "Emoción en la que te vas y compromisos para la próxima."
 */
import React, { useState } from 'react';
import { CheckCircle2, Plus, X } from 'lucide-react';
import { EMOCIONES_SALIDA, type EmocionSesion, formatoCrono } from '../../lib/sessionLog';

interface Props {
  metaTitulo: string;
  duracionSeg: number;
  emocionEntrada?: EmocionSesion | null;
  onCerrar: (checkout: { emocion: EmocionSesion; compromisos: string[] }) => void;
  cerrando?: boolean;
}

export default function CheckOutPanel({ metaTitulo, duracionSeg, emocionEntrada, onCerrar, cerrando }: Props) {
  const [emocion, setEmocion] = useState<EmocionSesion | null>(null);
  const [compromisos, setCompromisos] = useState<string[]>(['']);

  const compromisosLimpios = compromisos.map((c) => c.trim()).filter(Boolean);
  const entrada = EMOCIONES_SALIDA.find((e) => e.id === emocionEntrada);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#22C55E] mb-1">Cierre de sesión</p>
        <h3 className="text-lg font-bold text-white leading-snug">{metaTitulo}</h3>
        <p className="text-xs text-white/40 mt-1">
          Trabajaste {formatoCrono(duracionSeg)}{entrada ? <> · llegaste {entrada.emoji} {entrada.label.toLowerCase()}</> : null}.
          {' '}Lo que se abre, se cierra.
        </p>
      </div>

      <div>
        <p className="text-sm font-semibold text-white mb-2">¿Con qué emoción te vas?</p>
        <div className="flex flex-wrap gap-2">
          {EMOCIONES_SALIDA.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => setEmocion(e.id)}
              className={`px-3 py-2 rounded-xl border text-sm transition-all ${
                emocion === e.id
                  ? 'border-[#22C55E] bg-[#22C55E]/15 text-white'
                  : 'border-white/10 bg-white/5 text-white/70 hover:border-white/25'
              }`}
            >
              <span className="mr-1.5">{e.emoji}</span>
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-white mb-1">Compromisos para la próxima</p>
        <p className="text-xs text-white/40 mb-2">Concretos y chiquitos. Lo que prometés acá, tu mentor lo recuerda.</p>
        <div className="space-y-2">
          {compromisos.map((c, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={c}
                onChange={(ev) => {
                  const nuevos = [...compromisos];
                  nuevos[i] = ev.target.value;
                  setCompromisos(nuevos);
                }}
                placeholder={i === 0 ? 'Ej: terminar la carta al dinero antes del jueves' : 'Otro compromiso…'}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/25 focus:border-[#22C55E]/60 focus:outline-none"
              />
              {compromisos.length > 1 && (
                <button
                  type="button"
                  onClick={() => setCompromisos(compromisos.filter((_, j) => j !== i))}
                  className="px-2 text-white/40 hover:text-white/80"
                  aria-label="Quitar compromiso"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          {compromisos.length < 3 && (
            <button
              type="button"
              onClick={() => setCompromisos([...compromisos, ''])}
              className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80"
            >
              <Plus className="w-3.5 h-3.5" /> Agregar otro
            </button>
          )}
        </div>
      </div>

      <button
        type="button"
        disabled={!emocion || cerrando}
        onClick={() => emocion && onCerrar({ emocion, compromisos: compromisosLimpios })}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-[#22C55E] text-black hover:bg-[#3ddb70]"
      >
        <CheckCircle2 className="w-4 h-4" /> {cerrando ? 'Consolidando…' : 'Cerrar y consolidar la sesión'}
      </button>
    </div>
  );
}
