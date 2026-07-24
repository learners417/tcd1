/**
 * TUTORIAL TÉCNICO — el paso a paso donde el fundador más se traba.
 * Se muestra dentro de la sesión que lo necesita (Business Manager, pixel,
 * agente, dominio, escalar). Cerrado por defecto: quien no lo necesita, no
 * lo ve; quien se traba, lo tiene ahí mismo sin salir del Camino.
 */
import React from 'react';
import { getTutoriales } from '../lib/tutorialesTecnicos';

export default function TutorialTecnicoBox({ codigo }: { codigo: string }) {
  const tutoriales = getTutoriales(codigo);
  if (!tutoriales.length) return null;

  return (
    <div className="space-y-2">
      {tutoriales.map((t) => (
        <details key={t.titulo} className="rounded-xl border border-gold/20 bg-gold/[0.03] px-4 py-3 open:bg-gold/[0.05]">
          <summary className="cursor-pointer text-[11px] font-bold uppercase tracking-wider text-gold list-none select-none">
            🛠️ Paso a paso: {t.titulo}
          </summary>
          <div className="mt-3 space-y-3">
            <p className="text-sm text-cream/75 leading-relaxed">{t.intro}</p>
            <ol className="space-y-2">
              {t.pasos.map((p, i) => (
                <li key={i} className="text-sm text-cream/80 leading-relaxed flex gap-2.5">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-gold/15 text-gold text-[11px] font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <span className="flex-1">{p}</span>
                </li>
              ))}
            </ol>
            {t.siFalla && (
              <p className="text-xs text-cream/60 leading-relaxed border-l-2 border-gold/30 pl-3">
                <strong className="text-cream/80">Si algo no sale:</strong> {t.siFalla}
              </p>
            )}
          </div>
        </details>
      ))}
    </div>
  );
}
