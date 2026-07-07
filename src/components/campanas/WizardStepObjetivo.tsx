import React from 'react';
import { Send, MessageCircle, UserCheck } from 'lucide-react';
import type { ObjetivoCampana } from '../../lib/campanasTypes';
import { OBJETIVO_LABELS } from '../../lib/campanasTypes';

interface Props {
  value: ObjetivoCampana;
  onChange: (v: ObjetivoCampana) => void;
}

const ICONS: Record<ObjetivoCampana, React.ElementType> = {
  trafico_perfil: Send,
  mensajes_retargeting: MessageCircle,
  clientes_potenciales: UserCheck,
};

export default function WizardStepObjetivo({ value, onChange }: Props) {
  const objetivos: ObjetivoCampana[] = ['trafico_perfil', 'mensajes_retargeting', 'clientes_potenciales'];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[#F2EFE9] mb-1">Objetivo de la Campaña</h3>
        <p className="text-sm text-[#F2EFE9]/50">Selecciona el tipo de campaña que queres crear</p>
      </div>

      <div className="grid gap-4">
        {objetivos.map((obj) => {
          const Icon = ICONS[obj];
          const { titulo, descripcion } = OBJETIVO_LABELS[obj];
          const isSelected = value === obj;

          return (
            <button
              key={obj}
              onClick={() => onChange(obj)}
              className={`w-full text-left p-5 rounded-xl border transition-all ${
                isSelected
                  ? 'border-[#E8962E] bg-[#E8962E]/10 shadow-[0_0_20px_rgba(232,150,46,0.10)]'
                  : 'border-[rgba(232,150,46,0.10)] bg-[#111110] hover:border-[rgba(232,150,46,0.18)] hover:bg-[#1A1917]'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  isSelected ? 'bg-[#E8962E]/20' : 'bg-[#F2EFE9]/5'
                }`}>
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-[#E8962E]' : 'text-[#F2EFE9]/40'}`} />
                </div>
                <div>
                  <p className={`font-medium text-[15px] mb-1 ${isSelected ? 'text-[#E8962E]' : 'text-[#F2EFE9]'}`}>
                    {titulo}
                  </p>
                  <p className="text-sm text-[#F2EFE9]/50 leading-relaxed">{descripcion}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 shrink-0 ml-auto mt-1 flex items-center justify-center ${
                  isSelected ? 'border-[#E8962E]' : 'border-[#F2EFE9]/20'
                }`}>
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#E8962E]" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
