/**
 * PuntoDePartida — "¿qué ya tienes andando?".
 *
 * Aparece una sola vez, cuando el Camino está en cero. Él marca lo que ya
 * tiene hecho y esas jornadas pasan a revisión: las hace igual, más cortas y
 * con el Crítico midiendo lo que trae.
 *
 * Nadie se salta el Camino. El que llega con la agenda llena y el que empieza
 * de cero recorren lo mismo: es el recorrido el que los convierte en directores
 * de su clínica. Antes esta pantalla daba ochenta jornadas por hechas.
 */
import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { YA_TIENES, KEY_YA_TIENES } from '../lib/yaTienes';
import { VOC } from '../lib/vocabulario';

export const KEY_PARTIDA = 'tcd_punto_de_partida_v1';

interface Props {
  /** Guarda lo que ya tiene, local y en la base. */
  onGuardar: (ids: string[]) => void;
  onCerrar: () => void;
}

export default function PuntoDePartida({ onGuardar, onCerrar }: Props) {
  const [elegidas, setElegidas] = useState<string[]>([]);

  const alternar = (id: string) =>
    setElegidas((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const confirmar = () => {
    try {
      localStorage.setItem(KEY_YA_TIENES, JSON.stringify(elegidas));
      localStorage.setItem(KEY_PARTIDA, elegidas.length ? 'con-base' : 'cero');
    } catch { /* noop */ }
    onGuardar(elegidas);
    onCerrar();
  };

  return (
    <section className="card-panel p-5 sm:p-6" aria-label="Lo que ya tienes">
      <p className="text-[15px] font-bold uppercase tracking-[0.16em] text-goldhi">Antes de empezar</p>
      <h2 className="mt-2 text-[28px] leading-tight text-cream" style={{ fontFamily: 'var(--font-display)', fontStyle: 'normal' }}>
        ¿Qué ya tienes andando?
      </h2>
      <p className="mt-2 text-[17px] text-cream/70">
        Marca todo lo que ya está hecho. Esos días los haces igual, más cortos: en vez de
        construir, revisas lo que traes y corriges lo que falte.
      </p>

      <ul className="mt-4 space-y-2">
        {YA_TIENES.map((o) => {
          const activa = elegidas.includes(o.id);
          return (
            <li key={o.id}>
              <button
                type="button"
                aria-pressed={activa}
                onClick={() => alternar(o.id)}
                className={`w-full min-h-[56px] flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${
                  activa ? 'border-gold bg-[var(--card,#FFFDF7)]' : 'border-[var(--line2,#DFD3BC)]'
                }`}
              >
                <span
                  className="w-7 h-7 shrink-0 rounded-full grid place-items-center border"
                  style={activa
                    ? { background: 'var(--tilde, #4A7C59)', borderColor: 'var(--tilde, #4A7C59)' }
                    : { borderColor: 'var(--line2, #DFD3BC)' }}
                >
                  {activa && <Check className="w-4 h-4" style={{ color: '#FFFDF7' }} />}
                </span>
                <span className="text-[17px] leading-snug text-cream">{VOC(o.loQueTiene)}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-[17px] text-cream">
        {elegidas.length === 0
          ? 'Empiezas desde el día 1, con todo por construir.'
          : `Empiezas desde el día 1. ${elegidas.length} ${elegidas.length === 1 ? 'jornada va' : 'jornadas van'} en modo revisión.`}
      </p>

      <button
        type="button"
        onClick={confirmar}
        className="mt-4 w-full min-h-[52px] rounded-[20px] text-[18px] font-semibold"
        style={{ background: 'var(--oro-d, #8E6824)', color: '#FFFDF7' }}
      >
        Empezar el día 1
      </button>
    </section>
  );
}
