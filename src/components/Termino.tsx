import { useState } from 'react';
import { buscarTermino } from '../lib/glosario';

/**
 * LA PALABRA CON SU EXPLICACIÓN AL LADO.
 *
 * Se usa así:  Su <Termino p="cuello de botella" /> es la conversación.
 *
 * Y hace una sola cosa: subraya la palabra y, al tocarla, muestra qué es. Es
 * la divulgación progresiva de Nielsen aplicada al vocabulario — y es lo que
 * permite que la inducción dure 72 horas en vez de un mes, porque los doce
 * términos se aprenden trabajando en vez de antes de empezar.
 *
 * Si la palabra no está en el glosario, se dibuja como texto normal. Nunca
 * rompe una frase por un término que falta.
 */
export default function Termino({ p, children }: { p: string; children?: React.ReactNode }) {
  const [abierto, setAbierto] = useState(false);
  const t = buscarTermino(p);
  const texto = children ?? p;

  if (!t) return <>{texto}</>;

  return (
    <span className="relative inline-block">
      <button
        onClick={(e) => { e.stopPropagation(); setAbierto((v) => !v); }}
        className="underline decoration-dotted decoration-cream/40 underline-offset-2 hover:decoration-gold"
        aria-label={`Qué es ${t.palabra}`}>
        {texto}
      </button>

      {abierto && (
        <span className="absolute left-0 top-full mt-1.5 z-30 block w-72 rounded-xl
          border border-gold/30 bg-[#0d0d0d] p-3 text-left shadow-xl">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-gold/70 mb-1">
            {t.palabra}
          </span>
          <span className="block text-xs text-cream/85 leading-relaxed">{t.que}</span>
          {t.porQue && (
            <span className="block text-xs text-cream/55 leading-relaxed mt-1.5">
              {t.porQue}
            </span>
          )}
          <button onClick={(e) => { e.stopPropagation(); setAbierto(false); }}
            className="block text-[10px] text-cream/35 mt-2 underline underline-offset-2">
            cerrar
          </button>
        </span>
      )}
    </span>
  );
}
