/**
 * EspejoIdentidadModal.tsx — Pantalla de cierre F1 (v8 · Sprint de Identidad)
 *
 * Se muestra al completar P3 (Legado). Es el momento más importante de F1:
 * el sanador ve junto, por primera vez, las 4 piezas de su identidad —
 * historia, propósito, legado y los 5 NO — y se le pregunta si se reconoce.
 *
 * Diseño: sobrio y reflexivo (no celebratorio festivo). Inspirado por la pantalla
 * del Espejo de Identidad descripta en mejoras.html · cierre F1.
 */

import { useEffect, useState } from 'react';
import { Sparkles, ChevronRight, Edit3 } from 'lucide-react';
import type { AdnCincoNo } from '../lib/supabase';

interface EspejoIdentidadModalProps {
  /** Historia corta (50 palabras) · `profiles.historia_50`. */
  historiaCorta?: string;
  /** Propósito en una frase · `profiles.proposito`. */
  propositoFrase?: string;
  /** Declaración de legado · `profiles.legado`. */
  legadoDeclaracion?: string;
  /** 5 NOs · `profiles.adn_cinco_no`. */
  cincoNo?: AdnCincoNo | null;
  /** Confirma y cierra (continúa a F2). */
  onConfirmar: () => void;
  /** Va al editor a corregir antes de cerrar F1. */
  onEditar: () => void;
}

export default function EspejoIdentidadModal({
  historiaCorta,
  propositoFrase,
  legadoDeclaracion,
  cincoNo,
  onConfirmar,
  onEditar,
}: EspejoIdentidadModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleClose = (action: () => void) => {
    setVisible(false);
    setTimeout(action, 200);
  };

  const nos = cincoNo?.nos?.filter((n) => n && n.trim()) ?? [];

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center px-4 transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ background: 'rgba(0, 0, 0, 0.85)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="espejo-titulo"
    >
      <div
        className={`max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl border border-gold/30 bg-ink p-8 shadow-2xl transition-transform duration-300 ${
          visible ? 'scale-100' : 'scale-95'
        }`}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-gold" />
          </div>
          <p className="text-[10px] uppercase tracking-widest text-gold font-bold mb-2">
            Cierre de Fase 1 · Identidad
          </p>
          <h2
            id="espejo-titulo"
            className="text-2xl md:text-3xl font-light text-cream tracking-tight leading-tight"
            style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}
          >
            Espejo de Identidad
          </h2>
        </div>

        {/* 4 piezas */}
        <div className="space-y-5">
          <Pieza titulo="Tu historia" valor={historiaCorta} fallback="Vuelve a P1.3 para escribir tu historia de 50 palabras." />
          <Pieza titulo="Tu propósito" valor={propositoFrase} fallback="Vuelve a P2.3 para destilar tu propósito." />
          <Pieza titulo="Tu legado" valor={legadoDeclaracion} fallback="Vuelve a P3.3 para escribir tu declaración de legado." />

          {/* 5 NOs · lista */}
          <div className="card-panel p-5 border border-gold/15 bg-gold/[0.03]">
            <p className="text-[10px] uppercase tracking-widest font-bold text-gold mb-3">
              Tus 5 NO
            </p>
            {nos.length > 0 ? (
              <ul className="space-y-2">
                {nos.map((no, idx) => (
                  <li
                    key={idx}
                    className="text-sm text-cream/90 leading-relaxed flex gap-3"
                  >
                    <span className="text-gold font-mono text-xs mt-0.5">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="flex-1">{no}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-cream/40 italic">
                Vuelve a P2.5 para definir tus 5 NO.
              </p>
            )}
          </div>
        </div>

        {/* Cita central */}
        <div className="my-8 py-6 border-y border-gold/15 text-center">
          <p
            className="text-lg md:text-xl text-cream/90 leading-relaxed"
            style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}
          >
            Esto es lo que eres. Esto es lo que viniste a hacer.
            <br />
            Esto es lo que va a quedar.
          </p>
          <p
            className="text-2xl md:text-3xl text-gold mt-4 font-light tracking-tight"
            style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}
          >
            ¿Te reconocés?
          </p>
        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => handleClose(onEditar)}
            className="flex-1 btn-secondary flex items-center justify-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            Quiero editar algo
          </button>
          <button
            type="button"
            onClick={() => handleClose(onConfirmar)}
            className="flex-1 btn-primary flex items-center justify-center gap-2"
          >
            Confirmar y seguir a Fase 2
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface PiezaProps {
  titulo: string;
  valor?: string;
  fallback: string;
}

function Pieza({ titulo, valor, fallback }: PiezaProps) {
  const tieneValor = typeof valor === 'string' && valor.trim().length > 0;
  return (
    <div className="card-panel p-5 border border-[rgba(232,150,46,0.1)]">
      <p className="text-[10px] uppercase tracking-widest font-bold text-gold mb-2">
        {titulo}
      </p>
      {tieneValor ? (
        <p className="text-base text-cream/90 leading-relaxed whitespace-pre-wrap break-words">
          {valor}
        </p>
      ) : (
        <p className="text-sm text-cream/40 italic">{fallback}</p>
      )}
    </div>
  );
}
