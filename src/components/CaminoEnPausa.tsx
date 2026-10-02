/**
 * EL CARTEL DE LA PAUSA — lo primero que ve el cliente cuando el Camino está
 * parado para todos.
 *
 * Tres cosas en tres líneas: cuándo retoma, que no pierde nada, y su fecha de
 * cierre nueva. Nada más: el Camino sigue abierto debajo por si quiere avanzar.
 */
import React from 'react';
import { cartelDeLaPausa, type PausaGlobal } from '../lib/pausaGlobal';

interface Props {
  pausa: PausaGlobal;
  /** La fecha en que cerraba su Camino antes de la pausa, aaaa-mm-dd. */
  cierreOriginal?: string | null;
}

export default function CaminoEnPausa({ pausa, cierreOriginal }: Props) {
  const { titulo, cuerpo, cierre } = cartelDeLaPausa(pausa, cierreOriginal);

  return (
    <section className="rounded-2xl border border-gold/35 bg-gold/10 p-5">
      <p className="text-[16px] font-bold uppercase tracking-[0.16em] text-goldhi">En pausa</p>
      <h2 className="mt-2 text-[22px] font-bold leading-snug text-cream">{titulo}</h2>
      <p className="mt-3 text-[17px] leading-relaxed text-cream/80">{cuerpo}</p>
      {cierre ? (
        <p className="mt-3 border-t border-gold/25 pt-3 text-[17px] font-medium text-goldhi">{cierre}</p>
      ) : null}
    </section>
  );
}
