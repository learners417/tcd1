/**
 * TaskChecklist.tsx — Capa 4 · rediseño 4 fases (jul 2026)
 * El checklist interno de una tarea: los sub-pasos tildables que hacen
 * posible la autonomía. Cada casilla es una micro-dopamina.
 * Persistencia local por tarea (se conserva entre sesiones del dispositivo).
 */
import React, { useState } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

interface TaskChecklistProps {
  /** Código de la tarea (P4.5, P1.3...) — clave de persistencia. */
  codigo: string;
  items: string[];
}

function loadChecked(codigo: string): boolean[] {
  try {
    const raw = localStorage.getItem(`tcd_checklist_${codigo}`);
    if (raw) return JSON.parse(raw);
  } catch { /* noop */ }
  return [];
}

export default function TaskChecklist({ codigo, items }: TaskChecklistProps) {
  const [checked, setChecked] = useState<boolean[]>(() => {
    const saved = loadChecked(codigo);
    return items.map((_, i) => Boolean(saved[i]));
  });

  if (!items || items.length === 0) return null;

  const toggle = (i: number) => {
    setChecked((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      try {
        localStorage.setItem(`tcd_checklist_${codigo}`, JSON.stringify(next));
      } catch { /* noop */ }
      return next;
    });
  };

  const done = checked.filter(Boolean).length;

  return (
    <div className="mt-4 rounded-xl border border-[#E8962E]/20 bg-[#0F0F0F] p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#E8962E]">
          Paso a paso
        </span>
        <span className="text-[10px] text-[#F2EFE9]/40 font-medium">
          {done}/{items.length}
        </span>
      </div>
      <div className="h-1 rounded-full bg-[#F2EFE9]/10 mb-4 overflow-hidden">
        <div
          className="h-full bg-[#E8962E] rounded-full transition-all duration-500"
          style={{ width: `${items.length === 0 ? 0 : Math.round((done / items.length) * 100)}%` }}
        />
      </div>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => toggle(i)}
              className="flex items-start gap-2.5 text-left w-full group"
            >
              {checked[i] ? (
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#22C55E]" />
              ) : (
                <Circle className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#F2EFE9]/25 group-hover:text-[#E8962E]/60 transition-colors" />
              )}
              <span
                className={`text-xs leading-relaxed transition-colors ${
                  checked[i] ? 'text-[#F2EFE9]/35 line-through' : 'text-[#F2EFE9]/75'
                }`}
              >
                {item}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
