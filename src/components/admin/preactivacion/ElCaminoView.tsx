import { useState } from 'react';
import { Check } from 'lucide-react';
import { SECTIONS, STEPS, TOTAL_STEPS } from '../../../lib/preactivacionSteps';
import { type ChecksByCliente, isChecked } from '../../../lib/preactivacionCheck';
import type { MatrizClienteRow } from './MatrizGrid';

interface ElCaminoViewProps {
  clientes: MatrizClienteRow[];
  checks: ChecksByCliente;
  onToggle: (clienteId: string, stepId: string, on: boolean) => void;
  caminoDone?: Map<string, Set<string>>;
}

// Vista El Camino — mismo paso a paso que la matriz, por cliente, con
// tildado automático (desde El Camino) y manual (equipo). Coincide 1:1 con MatrizGrid.
export default function ElCaminoView({ clientes, checks, onToggle, caminoDone }: ElCaminoViewProps) {
  const [selectedId, setSelectedId] = useState<string>(clientes[0]?.id ?? '');

  if (clientes.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-cream/55 text-sm">
        Sin clientes que coincidan
      </div>
    );
  }

  const selected = clientes.find((c) => c.id === selectedId) ?? clientes[0];
  const cid = selected.id;
  const doneCount = STEPS.filter(
    (s) => (s.meta && caminoDone?.get(cid)?.has(s.meta)) || isChecked(checks, cid, s.id),
  ).length;
  const pct = Math.round((doneCount / TOTAL_STEPS) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl mb-2" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
          Lo mínimo indispensable <span style={{ color: 'var(--color-gold)' }}>para activar</span>
        </h2>
        <p className="text-sm text-cream/75 max-w-2xl leading-relaxed mb-4">
          Sin cada uno de estos pasos resueltos, prender Meta Ads es quemar dinero. No hay extras acá — solo lo que tiene que existir y funcionar. Los pasos del Camino se tildan solos; el resto los marca el equipo.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="input-field text-sm"
            style={{ minWidth: 220 }}
          >
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}{c.metodo ? ` · ${c.metodo}` : ''}</option>
            ))}
          </select>
          <div className="flex items-center gap-2 text-sm">
            <div className="h-2 w-40 rounded-full bg-cream/10 overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: pct === 100 ? 'var(--color-success)' : 'var(--color-gold)' }} />
            </div>
            <span className="font-semibold text-cream tabular-nums">{doneCount}/{TOTAL_STEPS}</span>
            {pct === 100 && <span className="text-success font-semibold">· listo ✓</span>}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {SECTIONS.map((sec, sectionIdx) => (
          <div key={sec.id} className="rounded-xl overflow-hidden border border-gold/10">
            <div className="flex items-center gap-3.5 px-5 py-3.5 bg-panel border-b border-gold/10">
              <div className="flex items-center justify-center rounded-lg shrink-0 text-gold font-bold" style={{ width: 32, height: 32, background: 'color-mix(in oklab, var(--color-gold) 12%, transparent)', fontSize: 13, border: '1px solid color-mix(in oklab, var(--color-gold) 10%, transparent)' }}>
                {String(sectionIdx + 1).padStart(2, '0')}
              </div>
              <h3 className="flex-1 text-base" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>{sec.title}</h3>
              <span className="text-xs text-cream/50">{sec.items.length} {sec.items.length === 1 ? 'paso' : 'pasos'}</span>
            </div>

            <div>
              {sec.items.map((item, itemIdx) => {
                const autoCamino = Boolean(item.meta && caminoDone?.get(cid)?.has(item.meta));
                const on = autoCamino || isChecked(checks, cid, item.id);
                return (
                  <div key={item.id} className="flex gap-3.5 items-start px-5 py-3.5 border-b border-cream/[0.05] last:border-b-0">
                    <button
                      type="button"
                      onClick={() => { if (!autoCamino) onToggle(cid, item.id, !on); }}
                      title={autoCamino ? `${item.title} — completado en El Camino (automático)` : `${item.title} — ${on ? 'destildar' : 'tildar'}`}
                      className="shrink-0 inline-flex items-center justify-center transition-all mt-0.5 hover:border-gold/60"
                      style={{
                        width: 26, height: 26, borderRadius: 7,
                        border: `2px solid ${autoCamino ? 'var(--color-gold)' : on ? 'var(--color-success)' : 'var(--matrix-checkbox-off, rgba(255,255,255,0.25))'}`,
                        background: autoCamino ? 'var(--color-gold)' : on ? 'var(--color-success)' : 'transparent',
                        cursor: autoCamino ? 'default' : 'pointer',
                      }}
                    >
                      {on && <Check className="w-3.5 h-3.5" style={{ color: '#080808', strokeWidth: 3 }} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-semibold text-cream mb-1 flex items-center gap-2 flex-wrap">
                        <span>{sectionIdx + 1}.{itemIdx + 1} · {item.title}</span>
                        {autoCamino && <span className="text-[11px] uppercase tracking-wider text-gold/80 font-bold">auto</span>}
                      </div>
                      <div className="text-[14px] leading-relaxed text-cream/65" dangerouslySetInnerHTML={{ __html: item.detail }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
