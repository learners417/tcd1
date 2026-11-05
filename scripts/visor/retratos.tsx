/**
 * VISOR DE RETRATOS — para MIRARLOS antes de que lleguen a la app.
 *
 * Los nueve a los tres tamaños en que se usan: el de la tarjeta del
 * entrenador, el del chat y el chico de una lista. Un dibujo se aprueba
 * mirándolo, no leyendo su código.
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import '../../src/index.css';
import RetratoEntrenador from '../../src/components/RetratoEntrenador';

const QUIENES = ['sofi', 'caro', 'vera', 'ramiro', 'lucas', 'bruno', 'diego', 'mateo', 'mentor'];

function Visor() {
  return (
    <div style={{ padding: 24, background: 'var(--bg-root)', minHeight: '100vh' }}>
      {[72, 56, 36].map((t) => (
        <div key={t} style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--oro, #B0822E)', marginBottom: 10 }}>
            a {t} px
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            {QUIENES.map((q) => (
              <div key={q} style={{ textAlign: 'center' }}>
                <RetratoEntrenador quien={q} tam={t} />
                <p style={{ fontSize: 15, marginTop: 4, color: 'var(--tinta, #2B2723)' }}>{q}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><Visor /></React.StrictMode>);
