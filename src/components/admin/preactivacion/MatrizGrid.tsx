import { Check } from 'lucide-react';
import { SECTIONS, STEPS, TOTAL_STEPS } from '../../../lib/preactivacionSteps';
import {
  type ChecksByCliente,
  isChecked,
  progressPct,
  completedCount,
} from '../../../lib/preactivacionCheck';

export interface MatrizClienteRow {
  id: string;
  nombre: string;
  metodo?: string;
  initial: string;
}

interface MatrizGridProps {
  clientes: MatrizClienteRow[];
  checks: ChecksByCliente;
  onToggle: (clienteId: string, stepId: string, on: boolean) => void;
}

export default function MatrizGrid({ clientes, checks, onToggle }: MatrizGridProps) {
  if (clientes.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-[#F2EFE9]/40 text-sm">
        Sin clientes que coincidan
      </div>
    );
  }

  return (
    <div className="overflow-auto scrollbar-hide" style={{ maxHeight: 'calc(100vh - 220px)' }}>
      <table
        className="border-separate"
        style={{ borderSpacing: 0, fontSize: 14 }}
      >
        <thead>
          {/* Group row */}
          <tr>
            <th
              className="sticky left-0 top-0 z-50 bg-[#0E0E0E]"
              style={{ minWidth: 240 }}
            />
            {SECTIONS.map((sec, idx) => (
              <th
                key={sec.id}
                colSpan={sec.items.length}
                className="sticky top-0 z-30 bg-[#111110] text-[#E8962E] uppercase tracking-widest"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  padding: '10px 0',
                  textAlign: 'center',
                  borderBottom: '1px solid rgba(232,150,46,0.10)',
                  borderLeft: idx === 0 ? 'none' : '2px solid var(--matrix-section-divider)',
                }}
              >
                {sec.short}
              </th>
            ))}
            <th
              className="sticky right-0 top-0 z-40 bg-[#111110] text-[#E8962E]"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1.5,
                padding: '10px 10px',
                textAlign: 'center',
                borderBottom: '1px solid rgba(232,150,46,0.10)',
                borderLeft: '2px solid var(--matrix-section-divider)',
                textTransform: 'uppercase',
              }}
            >
              %
            </th>
          </tr>

          {/* Column labels */}
          <tr>
            <th
              className="sticky left-0 z-40 bg-[#0E0E0E]"
              style={{
                top: 40,
                minWidth: 240,
                borderBottom: '2px solid rgba(232,150,46,0.10)',
              }}
            />
            {STEPS.map((step, idx) => {
              const isFirstOfSection =
                idx === 0 || STEPS[idx - 1].sectionId !== step.sectionId;
              return (
                <th
                  key={step.id}
                  className="sticky bg-[#0F0F0F]"
                  style={{
                    top: 40,
                    padding: '10px 8px 12px',
                    fontWeight: 500,
                    verticalAlign: 'bottom',
                    borderBottom: '2px solid rgba(232,150,46,0.10)',
                    borderLeft: isFirstOfSection ? '2px solid var(--matrix-section-divider)' : 'none',
                  }}
                  title={step.title}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 12,
                      fontWeight: 500,
                      color: 'var(--matrix-header-text)',
                      lineHeight: 1.3,
                      textAlign: 'center',
                      minWidth: 84,
                      whiteSpace: 'pre-line',
                      wordBreak: 'keep-all',
                    }}
                  >
                    {step.lbl}
                  </div>
                </th>
              );
            })}
            <th
              className="sticky right-0 z-30 bg-[#0F0F0F]"
              style={{
                top: 40,
                padding: '10px 12px 12px',
                borderBottom: '2px solid rgba(232,150,46,0.10)',
                borderLeft: '2px solid var(--matrix-section-divider)',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'var(--matrix-header-text)',
                  textAlign: 'center',
                }}
              >
                Total
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          {clientes.map((cl) => {
            const pct = progressPct(checks, cl.id);
            const done = completedCount(checks, cl.id);
            const isComplete = pct === 100;
            return (
              <tr key={cl.id} className="group">
                {/* Sticky client cell */}
                <td
                  className="sticky left-0 z-20 bg-[#080808] group-hover:bg-[#111110] transition-colors"
                  style={{
                    padding: '0 14px',
                    height: 56,
                    borderBottom: '1px solid var(--matrix-row-divider)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="rounded-md flex items-center justify-center shrink-0"
                      style={{
                        width: 36,
                        height: 36,
                        background: 'rgba(232,150,46,0.12)',
                        color: '#E8962E',
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      {cl.initial}
                    </div>
                    <div className="min-w-0">
                      <div
                        className="truncate font-semibold"
                        style={{ maxWidth: 175, fontSize: 14 }}
                        title={cl.nombre}
                      >
                        {cl.nombre}
                      </div>
                      {cl.metodo && (
                        <div
                          className="truncate"
                          style={{
                            color: 'var(--matrix-subtitle-text)',
                            fontSize: 12,
                            maxWidth: 175,
                          }}
                        >
                          {cl.metodo}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {STEPS.map((step, idx) => {
                  const isFirstOfSection =
                    idx === 0 || STEPS[idx - 1].sectionId !== step.sectionId;
                  const on = isChecked(checks, cl.id, step.id);
                  return (
                    <td
                      key={step.id}
                      className="group-hover:bg-[#111110] transition-colors"
                      style={{
                        padding: 0,
                        textAlign: 'center',
                        verticalAlign: 'middle',
                        height: 56,
                        borderBottom: '1px solid var(--matrix-row-divider)',
                        borderLeft: isFirstOfSection
                          ? '2px solid var(--matrix-section-divider)'
                          : '1px solid var(--matrix-cell-divider)',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => onToggle(cl.id, step.id, !on)}
                        title={`${step.title} — ${on ? 'destildar' : 'tildar'}`}
                        className="inline-flex items-center justify-center transition-all hover:border-[#E8962E]/60"
                        style={{
                          width: 30,
                          height: 30,
                          border: `2px solid ${on ? '#22C55E' : 'var(--matrix-checkbox-off)'}`,
                          borderRadius: 7,
                          cursor: 'pointer',
                          background: on ? '#22C55E' : 'transparent',
                        }}
                      >
                        {on && <Check className="w-4 h-4" style={{ color: '#080808', strokeWidth: 3 }} />}
                      </button>
                    </td>
                  );
                })}

                {/* Sticky total */}
                <td
                  className="sticky right-0 z-10 bg-[#080808] group-hover:bg-[#111110] transition-colors"
                  style={{
                    padding: '0 12px',
                    height: 56,
                    borderBottom: '1px solid var(--matrix-row-divider)',
                    borderLeft: '2px solid var(--matrix-section-divider)',
                    textAlign: 'center',
                    fontSize: 14,
                    minWidth: 84,
                    color: isComplete ? '#22C55E' : 'var(--matrix-pct-text)',
                    fontWeight: isComplete ? 700 : 500,
                  }}
                  title={`${done}/${TOTAL_STEPS} pasos`}
                >
                  {pct}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
