/**
 * EstanteDeLibros.tsx — los libros, en la Biblioteca.
 *
 * ═══ POR QUÉ ═══
 *
 * La Biblioteca juntaba los videos del Camino, las clases del método y los
 * pasos escritos, y no tenía concepto de libro. Pero los libros son la
 * fuente: Sanadores Libres explica esta app, y las siete libertades son lo
 * que hay detrás de todo. El cliente que quiere entender por qué el Camino
 * está en este orden no lo encontraba en ninguna pantalla.
 *
 * Va arriba del buscador: son cuatro piezas, ocupan poco, y son de donde sale
 * todo lo que hay debajo.
 *
 * ═══ LO QUE NO HACE ═══
 *
 * No vende. Dice qué libro es, qué explica, y lleva a donde vive. Los precios
 * y la forma de entrega se deciden fuera de la app y cambian más seguido que
 * esta pantalla.
 */
import { ArrowUpRight } from 'lucide-react';
import { estante, COMO_SE_LLAMA_EL_ROL, faltanDelSur } from '../lib/libros';

export default function EstanteDeLibros() {
  const libros = estante();
  const faltan = faltanDelSur();

  return (
    <section className="space-y-3">
      <div>
        <p className="text-[15px] font-bold uppercase tracking-[0.16em] text-goldhi">Los libros</p>
        <p className="mt-1 text-[17px] text-cream/75">
          De acá sale todo lo que vas a encontrar debajo.
        </p>
      </div>

      <ul className="space-y-3">
        {libros.map((l) => (
          <li key={l.id} className="card-panel rounded-2xl p-5">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[15px] font-bold uppercase tracking-[0.16em] text-goldhi">
                {COMO_SE_LLAMA_EL_ROL[l.rol]}
                {l.rol === 'coleccion' && typeof l.orden === 'number' ? ` · ${l.orden}` : ''}
              </p>
              {l.estado === 'escribiendo' && (
                <p className="shrink-0 text-[15px] text-cream/55">En escritura</p>
              )}
            </div>

            <h3
              className="mt-1.5 text-[22px] leading-tight text-cream"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {l.titulo}
            </h3>

            <p className="mt-2 text-[17px] leading-relaxed text-cream/80">{l.queExplica}</p>

            {l.enlace && (
              <a
                href={l.enlace}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 text-[15px] font-semibold text-goldhi"
              >
                Abrirlo <ArrowUpRight className="h-4 w-4" />
              </a>
            )}
          </li>
        ))}
      </ul>

      {faltan > 0 && (
        <p className="text-[15px] text-cream/55">
          La colección del sur son cinco libros, uno por cada sistema del Camino.
          {faltan === 1 ? ' Falta uno por salir.' : ` Faltan ${faltan} por salir.`}
        </p>
      )}
    </section>
  );
}
