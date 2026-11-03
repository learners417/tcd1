/**
 * PasesDeRenovacion.tsx — los tres pases, donde el Camino termina.
 *
 * ═══ POR QUÉ ACÁ ═══
 *
 * El día 91 el Camino se cierra. Hasta hoy, la pantalla del cierre mostraba
 * lo que hizo y lo que le faltó, y la conversación de qué sigue quedaba para
 * un mensaje de WhatsApp que alguien tenía que acordarse de mandar.
 *
 * Los tres pases van justo ahí, debajo de su cierre de cuentas: es el único
 * momento en que la persona tiene delante, al mismo tiempo, todo lo que
 * construyó y la pregunta de qué hace con eso.
 *
 * ═══ UNA SOLA OFERTA POR PANTALLA ═══
 *
 * Son tres pases, y eso NO son tres ofertas: es una, con tres niveles de
 * acompañamiento. Lo único que cambia entre ellos es cuánta presencia de Javo
 * viene adentro; la app es la misma. Por eso se leen como una escalera
 * —uno arriba del otro, de menor a mayor— y uno solo lleva la marca.
 */
import { ArrowUpRight, Check } from 'lucide-react';
import { PASES, cobroUrl, precioEnPantalla } from '../lib/renovacion';

interface Props {
  /** Para escribir cuando el cobro todavía no está cargado. */
  waLink?: string;
}

export default function PasesDeRenovacion({ waLink }: Props) {
  return (
    <section className="w-full max-w-[620px] space-y-3">
      <div>
        <p className="text-[15px] font-bold uppercase tracking-[0.16em] text-goldhi">Lo que sigue</p>
        {/* 20 y no 19: es el piso de esta Garamond. Debajo de ahí su altura
            de x la hace leer un cuerpo y medio más chica de lo que mide, y
            esta es la frase que presenta los tres pases. */}
        <p className="mt-1.5 text-xl leading-relaxed text-cream" style={{ fontFamily: 'var(--font-display)' }}>
          Tu sistema queda andando. Estos son los tres modos de seguir usándolo.
        </p>
      </div>

      <ul className="space-y-3">
        {PASES.map((p) => {
          const url = cobroUrl(p.id);
          const destino = url || waLink || '';
          return (
            <li
              key={p.id}
              className="card-panel rounded-2xl p-5"
              style={p.destacado ? { borderColor: 'var(--gold, #8E6824)' } : undefined}
            >
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-[15px] font-bold uppercase tracking-[0.16em] text-goldhi">{p.nombre}</p>
                {p.destacado && <p className="shrink-0 text-[15px] text-cream/70">El que recomiendo</p>}
              </div>

              <p
                className="mt-1.5 text-[26px] leading-none text-cream"
                style={{ fontFamily: 'var(--font-display)', fontVariantNumeric: 'lining-nums tabular-nums' }}
              >
                {p.precio}
                {/* La unidad va en la letra de cuerpo: el numeral es lo que
                    vive en la display —y en tabular—, las palabras se leen
                    mejor en el sans, y así el precio manda y la unidad
                    acompaña en vez de competir. */}
                <span className="ml-2 font-sans text-[17px] text-cream/70">dólares al mes</span>
              </p>

              <p className="mt-2 text-[17px] text-cream/80">{p.para}</p>

              <ul className="mt-3 space-y-1.5">
                {p.incluye.map((linea) => (
                  <li key={linea} className="flex gap-2 text-[15px] leading-relaxed text-cream">
                    <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--tilde, #3D6A4A)' }} />
                    <span className="min-w-0">{linea}</span>
                  </li>
                ))}
              </ul>

              {destino && (
                <a
                  href={destino}
                  target="_blank"
                  rel="noreferrer"
                  className={p.destacado ? 'btn-ios-primary mt-4 flex w-full items-center justify-center gap-1.5' : 'mt-3 inline-flex min-h-[44px] items-center gap-1.5 text-[15px] font-semibold text-goldhi'}
                  aria-label={`${p.nombre}, ${precioEnPantalla(p)}`}
                >
                  Seguir con este {!p.destacado && <ArrowUpRight className="h-4 w-4" />}
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
