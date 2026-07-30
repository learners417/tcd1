import { useState } from 'react';
import { AlertTriangle, Eye, ShieldAlert } from 'lucide-react';
import { puedeSeguir, type Freno as FrenoDef } from '../lib/frenos';

/**
 * EL DIÁLOGO QUE FRENA.
 *
 * Tres niveles, con tres pesos distintos a propósito: si todos se vieran
 * igual, el de encender una campaña se contestaría con la misma velocidad que
 * el de apagar un anuncio, y ahí el freno deja de servir.
 */
export default function Freno({
  freno, onSeguir, onCancelar,
}: {
  freno: FrenoDef;
  onSeguir: () => void;
  onCancelar: () => void;
}) {
  const [escrito, setEscrito] = useState('');
  const listo = puedeSeguir(freno, escrito);

  const color = freno.nivel === 'escribir' ? 'danger'
    : freno.nivel === 'testigo' ? 'gold' : 'cream';
  const Icono = freno.nivel === 'escribir' ? ShieldAlert
    : freno.nivel === 'testigo' ? Eye : AlertTriangle;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className={`w-full max-w-md rounded-2xl border p-6 bg-[#0d0d0d] ${
        freno.nivel === 'escribir' ? 'border-danger/50'
        : freno.nivel === 'testigo' ? 'border-gold/45' : 'border-cream/20'}`}>

        <div className="flex items-start gap-3">
          <Icono size={20} className={`shrink-0 mt-0.5 text-${color}`} />
          <div>
            {/* El título dice QUÉ VA A PASAR. No pregunta si está seguro:
                preguntar si está seguro no informa nada. */}
            <p className="text-base text-cream leading-snug"
              style={{ fontFamily: 'var(--font-display)' }}>
              {freno.titulo}
            </p>
            <p className="text-sm text-cream/70 mt-2 leading-relaxed">{freno.detalle}</p>
            {freno.queda && (
              <p className="text-xs text-gold/80 mt-2.5 leading-relaxed">{freno.queda}</p>
            )}
          </div>
        </div>

        {freno.nivel === 'escribir' && (
          <div className="mt-4">
            <p className="text-xs text-cream/60 mb-1.5">
              Escribe <strong className="text-danger">{freno.palabra}</strong> para confirmar.
            </p>
            <input
              value={escrito}
              onChange={(e) => setEscrito(e.target.value)}
              autoFocus
              className="w-full bg-surface/40 border border-cream/20 rounded-xl px-3 py-2
                text-sm text-cream tracking-widest uppercase"
            />
          </div>
        )}

        <div className="flex gap-2 mt-5">
          <button onClick={onCancelar}
            className="flex-1 rounded-xl border border-cream/20 py-2.5 text-sm text-cream/75">
            Cancelar
          </button>
          <button onClick={onSeguir} disabled={!listo}
            className={`flex-1 rounded-xl py-2.5 text-sm font-bold disabled:opacity-35 ${
              freno.nivel === 'escribir'
                ? 'bg-danger/85 text-white' : 'btn-primary'}`}>
            {freno.nivel === 'escribir' ? freno.palabra : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}
