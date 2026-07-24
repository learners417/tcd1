/**
 * CintaCinturon.tsx — EL SIGNATURE de Sanar OS (Dojo Premium · E2)
 * La cinta de tela del cinturón actual del cliente: su rango, vivo en la interfaz.
 */
import React from 'react';
import type { Cinturon } from '../lib/cinturones';

const TELAS: Record<number, { base: string; punta?: string; brillo: string }> = {
  0: { base: '#E9E4D8', brillo: 'rgba(255,255,255,0.5)' },
  1: { base: '#E9E4D8', punta: '#D9A62E', brillo: 'rgba(255,255,255,0.5)' },
  2: { base: '#D9A62E', brillo: 'rgba(255,240,200,0.45)' },
  3: { base: '#D9A62E', punta: '#3E9B57', brillo: 'rgba(255,240,200,0.45)' },
  4: { base: '#3E9B57', brillo: 'rgba(220,255,230,0.35)' },
  5: { base: '#3E9B57', punta: '#3D7BD9', brillo: 'rgba(220,255,230,0.35)' },
  6: { base: '#3D7BD9', brillo: 'rgba(210,230,255,0.35)' },
  7: { base: '#B93A32', brillo: 'rgba(255,215,210,0.30)' },
  8: { base: '#151412', brillo: 'rgba(232,150,46,0.35)' },
};

interface CintaCinturonProps {
  cinturon: Cinturon;
  variante?: 'hero' | 'linea';
  className?: string;
}

export default function CintaCinturon({ cinturon, variante = 'hero', className = '' }: CintaCinturonProps) {
  const tela = TELAS[cinturon.orden] ?? TELAS[0];
  const alto = variante === 'hero' ? 14 : 8;
  const esNegro = cinturon.orden === 8;

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      style={{ height: alto, borderRadius: alto / 2 }}
      title={`Cinturón ${cinturon.nombre} — ${cinturon.metafora}`}
      aria-label={`Tu cinturón: ${cinturon.nombre}`}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `
            repeating-linear-gradient(90deg, rgba(0,0,0,0.10) 0 1px, transparent 1px 5px),
            repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 3px),
            linear-gradient(180deg, ${tela.base} 0%, ${sombra(tela.base)} 100%)
          `,
          boxShadow: esNegro
            ? 'inset 0 1px 0 rgba(232,150,46,0.25), inset 0 -2px 4px rgba(0,0,0,0.6)'
            : 'inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -2px 4px rgba(0,0,0,0.35)',
        }}
      />
      {tela.punta && (
        <div
          className="absolute inset-y-0 right-0"
          style={{ width: '16%', background: `linear-gradient(180deg, ${tela.punta} 0%, ${sombra(tela.punta)} 100%)`, boxShadow: 'inset 2px 0 3px rgba(0,0,0,0.25)' }}
        />
      )}
      <div
        className="absolute inset-0 cinta-brillo"
        style={{ background: `linear-gradient(105deg, transparent 20%, ${tela.brillo} 50%, transparent 80%)`, backgroundSize: '300% 100%' }}
      />
      {variante === 'hero' && (
        <div
          className="absolute inset-y-0"
          style={{ left: '8%', width: alto * 1.6, background: `linear-gradient(180deg, ${sombra(tela.base)} 0%, ${tela.base} 45%, ${sombra(tela.base)} 100%)`, borderLeft: '1px solid rgba(0,0,0,0.3)', borderRight: '1px solid rgba(0,0,0,0.3)' }}
        />
      )}
    </div>
  );
}

function sombra(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.max(0, Math.round(v * 0.82));
  const r = f((n >> 16) & 255), g = f((n >> 8) & 255), b = f(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
