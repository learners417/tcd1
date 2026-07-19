/**
 * CHECK-OUT — el cierre ritual de la Sesión Viva (liturgia de Javo):
 * "Emoción en la que te vas y compromisos para la próxima."
 */
import React, { useState } from 'react';
import { CheckCircle2, Plus, X, FileText } from 'lucide-react';
import { EMOCIONES_SALIDA, type EmocionSesion, formatoCrono } from '../../lib/sessionLog';
import { descargarSesionDePapel } from '../../lib/sesionDePapel';

interface Props {
  metaTitulo: string;
  duracionSeg: number;
  emocionEntrada?: EmocionSesion | null;
  onCerrar: (checkout: { emocion: EmocionSesion; compromisos: string[]; diario?: string }) => void;
  cerrando?: boolean;
}

export default function CheckOutPanel({ metaTitulo, duracionSeg, emocionEntrada, onCerrar, cerrando }: Props) {
  const [emocion, setEmocion] = useState<EmocionSesion | null>(null);
  const [compromisos, setCompromisos] = useState<string[]>(['']);
  const [diario, setDiario] = useState('');
  const esViernes = new Date().getDay() === 5;

  const compromisosLimpios = compromisos.map((c) => c.trim()).filter(Boolean);
  const entrada = EMOCIONES_SALIDA.find((e) => e.id === emocionEntrada);

  const descargarPapel = () => {
    let nombre: string | undefined;
    let dia: number | undefined;
    try {
      const p = JSON.parse(localStorage.getItem('tcd_profile') || '{}');
      if (p?.nombre) nombre = p.nombre;
      if (p?.fecha_inicio) {
        dia = Math.max(1, Math.floor((Date.now() - new Date(p.fecha_inicio).getTime()) / 86400000) + 1);
      }
    } catch {
      /* noop */
    }
    void descargarSesionDePapel({ titulo: metaTitulo, nombre, dia });
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-success mb-1">Cierre de sesión</p>
        <h3 className="text-lg font-bold text-white leading-snug">{metaTitulo}</h3>
        <p className="text-xs text-white/55 mt-1">
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
                  ? 'border-success bg-success/15 text-white'
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
        <p className="text-xs text-white/55 mb-2">Concretos y chiquitos. Lo que prometés acá, tu mentor lo recuerda.</p>
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
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/25 focus:border-success/60 focus:outline-none"
              />
              {compromisos.length > 1 && (
                <button
                  type="button"
                  onClick={() => setCompromisos(compromisos.filter((_, j) => j !== i))}
                  className="px-2 text-white/55 hover:text-white/80"
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
              className="flex items-center gap-1.5 text-xs text-white/65 hover:text-white/80"
            >
              <Plus className="w-3.5 h-3.5" /> Agregar otro
            </button>
          )}
        </div>
      </div>

      {esViernes && (
        <div className="mb-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold mb-2">🪞 El Espejo del viernes</p>
          <p className="text-xs text-white/45 mb-2">Una línea para tu Diario del Fundador — la semana en una frase:</p>
          <textarea value={diario} onChange={(e) => setDiario(e.target.value)} rows={2}
            placeholder="Esta semana yo…"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 focus:border-gold/60 focus:outline-none resize-none" />
        </div>
      )}
      <button
        type="button"
        disabled={!emocion || cerrando}
        onClick={() => emocion && onCerrar({ emocion, compromisos: compromisosLimpios , diario: esViernes && diario.trim() ? diario.trim() : undefined })}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-success text-black hover:bg-[#3ddb70]"
      >
        <CheckCircle2 className="w-4 h-4" /> {cerrando ? 'Consolidando…' : 'Cerrar y consolidar la sesión'}
      </button>
      <button
        type="button"
        onClick={descargarPapel}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gold/25 text-gold text-xs font-bold uppercase tracking-wider hover:bg-gold/10 transition-colors"
      >
        <FileText className="w-4 h-4" /> Sesión de Papel · para el cuaderno
      </button>
    </div>
  );
}
