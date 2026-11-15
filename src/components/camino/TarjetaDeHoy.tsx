import { useState } from 'react';
import { leerPasosAfuera, marcarPasoAfuera } from '../../lib/elJuegoDelSur';
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
  /**
   * AFUERA · el paso de diez minutos de este día, si lo tiene.
   *
   * Va acá y no solo dentro de la sesión porque el día que vale es justo el
   * día en que no va a hacer la sesión de setenta y cinco minutos: el que
   * abre la app con diez minutos cierra la app sin ver lo único que podía
   * hacer. Es el mismo paso, con la misma marca: no son dos cosas.
   */
  pasoAfuera?: string | null;
  /** El día del camino, que es con lo que se guarda la marca. */
  dia?: number | null;
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
  const dia = hoy.dia ?? null;
  const [afueraHecho, setAfueraHecho] = useState<boolean>(
    () => (dia ? leerPasosAfuera().includes(dia) : false),
  );
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
          {/*
            EL BOTÓN NO MIDE LO QUE MIDE LA PANTALLA.

            `w-full` dentro de una tarjeta de 892 px daba un «Empezar» de 846
            px de ancho: en un teléfono el botón ancho es lo correcto —el
            pulgar llega a cualquier parte—, pero en una computadora un bloque
            de tinta de casi un metro de pantalla para una palabra de siete
            letras no se lee como el botón principal, se lee como una franja.

            Desde `sm` se queda en 280, que es el ancho de un botón que se
            toca con el mouse y se mira sin recorrerlo.
          */}
          <button type="button" onClick={onEmpezar} className="btn-ios-primary mt-5 w-full sm:w-[280px]">
            Empezar
          </button>
          {/*
            Y debajo del botón, el paso de diez minutos. Debajo y no arriba:
            lo primero sigue siendo el trabajo del día. Pero queda a la vista
            sin entrar, que es de lo que se trata — el que tiene diez minutos
            cerraba la app sin enterarse de que había algo para él.
          */}
          {hoy.pasoAfuera && dia ? (
            <div className="mt-5 pt-4 border-t border-[var(--line2,#DFD3BC)] space-y-1.5">
              <p className="rotulo-libro">Afuera · tu paso</p>
              <p className="text-[17px] leading-snug text-cream">{hoy.pasoAfuera}</p>
              <button
                type="button"
                aria-pressed={afueraHecho}
                onClick={() => {
                  const lista = marcarPasoAfuera(dia, !afueraHecho);
                  setAfueraHecho(lista.includes(dia));
                }}
                className="min-h-[44px] inline-flex items-center gap-2 text-[17px] font-semibold text-goldhi"
              >
                <span
                  className="w-6 h-6 rounded-full grid place-items-center border"
                  style={afueraHecho
                    ? { background: 'var(--tilde, #4A7C59)', borderColor: 'var(--tilde, #4A7C59)' }
                    : { borderColor: 'var(--line2, #DFD3BC)' }}
                >
                  {afueraHecho && <Check className="w-4 h-4" style={{ color: '#FFFDF7' }} />}
                </span>
                {afueraHecho ? 'Lo hiciste' : 'Lo hice'}
              </button>
              <p className="text-[15px] leading-snug text-cream/70">
                Diez minutos. El día cierra igual.
              </p>
            </div>
          ) : null}
        </section>
  );
}
