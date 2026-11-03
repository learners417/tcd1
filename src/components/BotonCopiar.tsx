/**
 * BOTÓN DE COPIAR — copia y dice si copió.
 *
 * Los dieciocho botones de copiar de la app llamaban a
 * `navigator.clipboard` sin catch: donde esa API no está o rechaza —el
 * navegador del teléfono, seguido— el botón no hacía nada y no avisaba. El
 * cliente tocaba, no pasaba nada, y después pegaba en Meta lo que tenía
 * antes.
 */
import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { copiar, NO_SE_PUDO_COPIAR } from '../lib/copiar';

export default function BotonCopiar({
  texto,
  etiqueta = 'Copiar',
  className,
  disabled,
  title,
}: {
  texto: string;
  etiqueta?: string;
  className?: string;
  disabled?: boolean;
  title?: string;
}) {
  const [estado, setEstado] = useState<'listo' | 'copiado' | 'falló'>('listo');

  const alTocar = async () => {
    const ok = await copiar(texto);
    setEstado(ok ? 'copiado' : 'falló');
    // Vuelve a su estado para que se pueda copiar de nuevo. Dos segundos
    // alcanzan para leerlo y no dejan el botón mintiendo.
    window.setTimeout(() => setEstado('listo'), 2200);
  };

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => void alTocar()}
        disabled={disabled}
        title={title}
        className={className ?? 'min-h-[44px] px-3 inline-flex items-center gap-1.5 text-[17px] font-bold text-gold disabled:opacity-40'}
      >
        {estado === 'copiado'
          ? <><Check className="w-4 h-4" /> Copiado</>
          : <><Copy className="w-4 h-4" /> {etiqueta}</>}
      </button>
      {estado === 'falló' && (
        <span className="text-[16px] leading-snug text-cream/70 max-w-[22rem] text-right">
          {NO_SE_PUDO_COPIAR}
        </span>
      )}
    </span>
  );
}
