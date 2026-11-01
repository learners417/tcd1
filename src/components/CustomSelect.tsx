/**
 * CustomSelect.tsx
 * Dropdown estilizado con el tema dark de la app. Reemplaza los <select> nativos.
 */
import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
  placeholder?: string;
}

const DROPDOWN_MAX_HEIGHT = 240;

export default function CustomSelect({
  value,
  onChange,
  options,
  className = '',
  placeholder,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (!open || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    setOpenUp(spaceBelow < DROPDOWN_MAX_HEIGHT && spaceAbove > spaceBelow);
  }, [open]);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? placeholder ?? value;

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`
          w-full flex items-center justify-between gap-2
          bg-black/20 border rounded-xl px-3 py-3
          text-sm text-cream text-left
          transition-all duration-150 outline-none
          ${open ? 'elegido' : 'border-[var(--line, rgba(142,104,36,0.18))] hover:border-[var(--line2, rgba(142,104,36,0.30))]'}
        `}
      >
        <span className={value ? 'text-cream' : 'text-cream/55'}>{selectedLabel}</span>
        <ChevronDown
          className={`w-4 h-4 text-cream/75 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          className={`absolute z-50 left-0 right-0 bg-panel border border-[var(--line, rgba(142,104,36,0.18))] rounded-xl shadow-xl shadow-black/50 overflow-y-auto ${openUp ? 'bottom-full mb-1.5' : 'top-full mt-1.5'}`}
          style={{ maxHeight: `${DROPDOWN_MAX_HEIGHT}px` }}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`
                w-full px-3 py-2.5 text-sm text-left transition-colors duration-100
                ${opt.value === value
                  ? 'bg-gold/20 text-gold'
                  : 'text-cream/80 hover:bg-gold/5 hover:text-cream'
                }
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
