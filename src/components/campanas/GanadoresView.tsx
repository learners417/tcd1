/**
 * GanadoresView.tsx — Grid de creativos aprobados (mejores performers)
 */
import { Trophy } from 'lucide-react';
import type { Creativo } from '../../lib/campanasTypes';
import { ANGULO_LABELS } from '../../lib/campanasTypes';

interface Props {
  creativos: Creativo[];
  onSelectCreativo: (creativo: Creativo) => void;
}

export default function GanadoresView({ creativos, onSelectCreativo }: Props) {
  const ganadores = creativos.filter((c) => c.estado === 'aprobado');

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="mb-5">
        <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-gold mb-1">
          Top performers
        </p>
        <h2 className="text-xl font-light text-cream">
          <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }} className="text-gold">
            Ganadores
          </span>
        </h2>
      </div>

      {ganadores.length === 0 ? (
        <div className="card-panel p-12 text-center">
          <Trophy className="w-10 h-10 text-cream/15 mx-auto mb-3" />
          <p className="text-sm text-cream/55 mb-1">Todavia no hay creativos ganadores.</p>
          <p className="text-xs text-cream/25">
            Aprueba creativos desde el estudio para que aparezcan aca.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ganadores.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelectCreativo(c)}
              className="card-panel p-4 text-left hover:border-gold/40 transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-gold to-goldhi" />

              {/* Image placeholder */}
              {c.assets?.[0]?.public_url ? (
                <img
                  src={c.assets[0].public_url}
                  alt={c.titulo}
                  className="w-full aspect-[4/5] object-cover rounded-lg mb-3 bg-surface"
                />
              ) : (
                <div className="w-full aspect-[4/5] rounded-lg mb-3 bg-surface border border-dashed border-cream/10 flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-cream/10" />
                </div>
              )}

              <div className="text-[11px] text-cream/45 mb-0.5">
                {ANGULO_LABELS[c.angulo].titulo}
              </div>
              <div className="text-sm font-semibold text-cream mb-2 line-clamp-2">
                {c.titulo || c.nombre || 'Sin titulo'}
              </div>
              <div className="flex gap-3 text-[11px] text-cream/45">
                <span>
                  Angulo: <strong className="text-gold">{c.angulo}</strong>
                </span>
                <span>
                  Tipo: <strong className="text-cream/65">{c.tipo === 'carrusel' ? 'Carrusel' : 'Single'}</strong>
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
