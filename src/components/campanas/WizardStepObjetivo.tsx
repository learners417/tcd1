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
        <h3 className="text-lg font-semibold text-cream mb-1">Objetivo de la Campaña</h3>
        <p className="text-sm text-cream/65">Selecciona el tipo de campaña que queres crear</p>
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
                  ? 'border-gold bg-gold/10 shadow-[0_0_20px_rgba(232,150,46,0.10)]'
                  : 'border-[rgba(232,150,46,0.10)] bg-panel hover:border-[rgba(232,150,46,0.18)] hover:bg-surface'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  isSelected ? 'bg-gold/20' : 'bg-cream/5'
                }`}>
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-gold' : 'text-cream/55'}`} />
                </div>
                <div>
                  <p className={`font-medium text-[15px] mb-1 ${isSelected ? 'text-gold' : 'text-cream'}`}>
                    {titulo}
                  </p>
                  <p className="text-sm text-cream/65 leading-relaxed">{descripcion}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 shrink-0 ml-auto mt-1 flex items-center justify-center ${
                  isSelected ? 'border-gold' : 'border-cream/20'
                }`}>
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-gold" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
