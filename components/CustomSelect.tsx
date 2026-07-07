/**
 * CustomSelect.tsx
 * Dropdown estilizado con el tema dark de la app. Reemplaza los <select> nativos.
 */
import React, { useState, useRef, useEffect } from 'react';
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
          text-sm text-[#F2EFE9] text-left
          transition-all duration-150 outline-none
          ${open ? 'border-[#E8962E]/50 ring-1 ring-[#E8962E]/20' : 'border-[rgba(232,150,46,0.12)] hover:border-[rgba(232,150,46,0.18)]'}
        `}
      >
        <span className={value ? 'text-[#F2EFE9]' : 'text-[#F2EFE9]/40'}>{selectedLabel}</span>
        <ChevronDown
          className={`w-4 h-4 text-[#F2EFE9]/60 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          className={`absolute z-50 left-0 right-0 bg-[#111110] border border-[rgba(232,150,46,0.12)] rounded-xl shadow-xl shadow-black/50 overflow-y-auto ${openUp ? 'bottom-full mb-1.5' : 'top-full mt-1.5'}`}
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
                  ? 'bg-[#E8962E]/20 text-[#E8962E]'
                  : 'text-[#F2EFE9]/80 hover:bg-[#E8962E]/5 hover:text-[#F2EFE9]'
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
