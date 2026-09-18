/**
 * Entrenadores — la pestaña donde se practica (10-DISENO y 13-PLAN-DEFINITIVO).
 *
 * Arriba tu ADN, abajo los nueve entrenadores. Antes eran dos pestañas
 * distintas (ADN y Mentor) y el ADN además estaba duplicado en el Manual
 * del Negocio.
 *
 * El Mentor no vive acá: es el botón que está en todas las pantallas.
 */
import React, { useState } from 'react';
import type { ProfileV2 } from '../lib/supabase';
import ADN from './ADN';
import Agentes from './Agentes';

interface Props {
  userId?: string;
  perfil?: Partial<ProfileV2>;
  setCurrentPage?: (p: string) => void;
  onProfileFieldUpdate?: (fields: Record<string, unknown>) => void;
}

const VISTAS = [
  { id: 'adn' as const, label: 'Tu ADN', bajada: 'De acá sale todo lo que la app escribe' },
  { id: 'agentes' as const, label: 'Los nueve', bajada: 'Se practica contra algo que responde' },
];

export default function Entrenadores({ userId, perfil, setCurrentPage, onProfileFieldUpdate }: Props) {
  const [vista, setVista] = useState<'adn' | 'agentes'>(() => {
    try {
      const guardado = localStorage.getItem('tcd_entrenadores_vista');
      return guardado === 'agentes' ? 'agentes' : 'adn';
    } catch { return 'adn'; }
  });

  const cambiar = (v: 'adn' | 'agentes') => {
    setVista(v);
    try { localStorage.setItem('tcd_entrenadores_vista', v); } catch { /* noop */ }
  };

  const actual = VISTAS.find((v) => v.id === vista) ?? VISTAS[0];

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-12">
      <div className="grid grid-cols-2 gap-2">
        {VISTAS.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => cambiar(v.id)}
            aria-pressed={vista === v.id}
            className={`min-h-[52px] rounded-2xl border px-4 text-[17px] font-semibold transition-colors ${
              vista === v.id
                ? 'bg-[var(--card,#FFFDF7)] border-gold text-cream'
                : 'bg-transparent border-[var(--line2,#DFD3BC)] text-cream/70'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>
      <p className="px-1 text-[17px] text-cream/70">{actual.bajada}</p>

      {vista === 'adn' ? (
        <ADN perfil={perfil} userId={userId} setCurrentPage={setCurrentPage} onProfileFieldUpdate={onProfileFieldUpdate} />
      ) : (
        <Agentes userId={userId} perfil={perfil} setCurrentPage={setCurrentPage} />
      )}
    </div>
  );
}
