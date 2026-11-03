import { useState } from 'react';
import { ShieldCheck, ShieldAlert, ShieldX, Loader2 } from 'lucide-react';
import { revisarConRubrica, type VeredictoRubrica } from '../lib/criticoRubrica';
import { rubricaDe } from '../lib/rubricas';

/**
 * El Crítico, en pantalla.
 *
 * Aparece antes de sellar. No opina de estilo: mide contra la rúbrica de esa
 * pieza y, cuando bloquea, dice dónde se arregla.
 *
 * Si el Crítico no puede responder, el cliente avanza igual: un fallo de red
 * no puede dejarlo trabado en el día 15.
 */

interface Props {
  codigo: string;
  texto: string;
  /** Se avisa al padre para habilitar o no el sellado. */
  onVeredicto?: (v: VeredictoRubrica | null) => void;
}

export default function VeredictoCriticoPanel({ codigo, texto, onVeredicto }: Props) {
  const [v, setV] = useState<VeredictoRubrica | null>(null);
  const [cargando, setCargando] = useState(false);
  const rubrica = rubricaDe(codigo);
  if (!rubrica) return null;

  const revisar = async () => {
    setCargando(true);
    const r = await revisarConRubrica(codigo, texto);
    setV(r);
    onVeredicto?.(r);
    setCargando(false);
  };

  if (!v) {
    return (
      <div className="rounded-xl border border-cream/15 bg-cream/[0.03] px-4 py-3.5">
        <p className="text-sm text-cream/75 mb-3">
          Antes de sellar, pásalo por el revisor. Mide {rubrica.pieza} contra los{' '}
          {rubrica.criterios.length} criterios que deciden si vende.
        </p>
        <button
          type="button"
          onClick={revisar}
          disabled={cargando}
          className="w-full py-3 rounded-xl text-sm font-bold border border-gold/50 text-gold hover:bg-gold/10 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {cargando ? (<><Loader2 className="w-4 h-4 animate-spin" /> Revisando…</>) : 'Revisar antes de sellar'}
        </button>
      </div>
    );
  }

  if (v.problema) {
    return (
      <div className="rounded-xl border border-cream/15 bg-cream/[0.03] px-4 py-3.5">
        <p className="text-sm text-cream/70">{v.problema}</p>
        <button type="button" onClick={revisar} className="mt-2 text-xs font-bold text-gold">Intentar de nuevo</button>
      </div>
    );
  }

  const estilo = {
    sale:    { Icon: ShieldCheck, borde: 'border-emerald-500/40', fondo: 'bg-emerald-500/[0.07]', color: 'text-emerald-400', label: 'Sale' },
    reparos: { Icon: ShieldAlert, borde: 'border-gold/45',        fondo: 'bg-gold/[0.07]',        color: 'text-gold',        label: 'Sale con reparos' },
    no_sale: { Icon: ShieldX,     borde: 'border-red-500/40',     fondo: 'bg-red-500/[0.07]',     color: 'text-red-400',     label: 'No sale todavía' },
  }[v.veredicto];
  const { Icon } = estilo;

  return (
    <div className={`rounded-xl border ${estilo.borde} ${estilo.fondo} px-4 py-4`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-5 h-5 ${estilo.color}`} />
        <span className={`text-sm font-bold ${estilo.color}`}>{estilo.label}</span>
      </div>

      {v.motivo && <p className="text-sm text-cream/85 leading-relaxed mb-3">{v.motivo}</p>}

      {v.criterios.length > 0 && (
        <ul className="space-y-1.5 mb-3">
          {v.criterios.map((c, i) => (
            <li key={i} className="flex gap-2 text-sm leading-snug">
              <span className={c.cumple ? 'text-emerald-400' : 'text-red-400'}>{c.cumple ? '✓' : '✕'}</span>
              <span className="text-cream/70">
                {c.pregunta}
                {!c.cumple && c.motivo && <span className="block text-cream/50 mt-0.5">{c.motivo}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}

      {v.correccion && (
        <div className="rounded-lg border border-cream/15 bg-cream/[0.04] px-3 py-2.5 mb-3">
          <p className="text-xs font-bold text-gold uppercase tracking-wide mb-1.5">Así quedaría</p>
          <p className="text-sm text-cream/85 leading-relaxed whitespace-pre-wrap">{v.correccion}</p>
        </div>
      )}

      {v.donde_se_arregla && (
        <p className="text-sm text-cream/70 leading-relaxed border-t border-cream/10 pt-3">
          <strong className="text-cream/90">Dónde se arregla:</strong> {v.donde_se_arregla}
        </p>
      )}

      <button type="button" onClick={revisar} className="mt-3 text-xs font-bold text-cream/50 hover:text-cream">
        Revisar de nuevo
      </button>
    </div>
  );
}
