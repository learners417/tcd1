/**
 * TarjetaDeHoy — "La única que importa" (10-DISENO §5 "Tarjeta de hoy").
 * La usan Hoy y El Camino: la misma tarjeta, el mismo botón, el mismo paso.
 * El segundo chip dice qué se lleva, no qué va a hacer.
 */
import React from 'react';
import { Clock, Check } from 'lucide-react';
import { VOC } from '../../lib/vocabulario';

export interface PasoDeHoy {
  codigo: string;
  titulo: string;
  descripcion?: string | null;
  tiempo?: string | null;
  salesCon?: string | null;
}

/** Primera oración, para que la descripción entre en una o dos líneas. */
export function primeraOracion(texto?: string | null, max = 110): string {
  if (!texto) return '';
  const t = texto.trim();
  const corte = t.search(/[.!?](\s|$)/);
  const frase = corte > 0 ? t.slice(0, corte + 1) : t;
  return frase.length > max ? `${frase.slice(0, max).replace(/\s+\S*$/, '')}…` : frase;
}

interface Props {
  hoy: PasoDeHoy;
  esFinde: boolean;
  onEmpezar: () => void;
}

export default function TarjetaDeHoy({ hoy, esFinde, onEmpezar }: Props) {
  return (
        <section className="card-panel p-5 sm:p-6" aria-label="Tu paso de hoy">
          <p className="text-[15px] font-bold uppercase tracking-[0.16em] text-goldhi">
            {esFinde ? 'Tu próximo paso' : 'Hoy'}
          </p>
          <h2 className="mt-2 text-[28px] leading-[1.15] text-cream" style={{ fontFamily: 'var(--font-display)', fontStyle: 'normal' }}>
            {VOC(hoy.titulo)}
          </h2>
          {hoy.descripcion && (
            <p className="mt-2 text-[17px] leading-relaxed text-cream/70">{VOC(primeraOracion(hoy.descripcion))}</p>
          )}
          {/*
            DOS COSAS DISTINTAS, DOS FORMAS DISTINTAS.
            Las dos iban en la misma píldora, con las mismas clases, y aun así
            se veían como elementos de dos sistemas: «75 min» entra en un
            renglón y «Sales con: tus seis números de entrada» en dos, así que
            la segunda crecía al ancho completo y su tilde quedaba flotando en
            el medio de las dos líneas.
            No son lo mismo. El tiempo es un metadato —corto, cerrado, cabe en
            una píldora— y lo que sale de la sesión es su resultado, que es lo
            que al cliente le importa: va como línea, con el tilde al principio
            y alineado con la primera palabra.
          */}
          {hoy.tiempo && (
            <div className="mt-4">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line2,#DFD3BC)] px-3 min-h-[36px] text-[15px] text-cream/80">
                <Clock className="w-4 h-4" /> {hoy.tiempo}
              </span>
            </div>
          )}
          {hoy.salesCon && (
            <p className="mt-3 flex items-start gap-2 text-[17px] leading-relaxed text-cream">
              <Check className="w-[18px] h-[18px] mt-[3px] shrink-0" style={{ color: 'var(--tilde, #4A7C59)' }} />
              <span>Sales con <strong className="font-semibold">{VOC(hoy.salesCon)}</strong></span>
            </p>
          )}
          {esFinde && (
            <p className="mt-3 text-[17px] text-cream/70">El fin de semana descansas. Si quieres adelantar, está listo.</p>
          )}
          <button type="button" onClick={onEmpezar} className="btn-ios-primary mt-5 w-full">
            Empezar
          </button>
        </section>
  );
}
