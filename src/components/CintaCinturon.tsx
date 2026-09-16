/**
 * CintaCinturon.tsx — la tira del grado (10-DISENO §5 "Tira de cinturón").
 *
 * El color sale del DATO del grado (roadmap.seed.json: color y punta), no de una
 * tabla propia. La tabla vieja estaba indexada por los 9 cinturones anteriores y,
 * con los 11 grados, pintaba al Blanco como "blanco con punta amarilla".
 *
 * Color plano, borde de 1 px al 16% de negro, punta como rectángulo pegado a la
 * derecha. Sin degradé, sin brillo. Al cambiar de grado, el color pasa en 400 ms.
 */
import React from 'react';
import type { Cinturon } from '../lib/cinturones';

interface CintaCinturonProps {
  cinturon: Cinturon;
  /** hero: ancho completo, 14 px · linea: ancho completo, 8 px · tira: 54 × 16 */
  variante?: 'hero' | 'linea' | 'tira';
  className?: string;
}

export default function CintaCinturon({ cinturon, variante = 'hero', className = '' }: CintaCinturonProps) {
  const alto = variante === 'hero' ? 14 : variante === 'tira' ? 16 : 8;
  const ancho = variante === 'tira' ? 54 : undefined;
  const transicion = 'background-color 400ms ease';

  return (
    <div
      role="img"
      className={`relative overflow-hidden shrink-0 ${variante === 'tira' ? '' : 'w-full'} ${className}`}
      style={{
        height: alto,
        width: ancho,
        borderRadius: 99,
        backgroundColor: cinturon.color,
        border: '1px solid rgba(0, 0, 0, 0.16)',
        transition: transicion,
      }}
      title={`Cinturón ${cinturon.nombre}: ${cinturon.metafora}`}
      aria-label={`Tu cinturón: ${cinturon.nombre}`}
      data-cinturon={cinturon.id}
    >
      {cinturon.punta && (
        <div
          className="absolute inset-y-0 right-0"
          style={{ width: variante === 'tira' ? 16 : '16%', backgroundColor: cinturon.punta, transition: transicion }}
        />
      )}
    </div>
  );
}
