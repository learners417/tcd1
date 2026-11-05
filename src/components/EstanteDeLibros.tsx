/**
 * EstanteDeLibros.tsx — los libros, en la Biblioteca.
 *
 * ═══ POR QUÉ ═══
 *
 * La Biblioteca juntaba los videos del Camino, las clases del método y los
 * pasos escritos, y no tenía concepto de libro. Pero los libros son la
 * fuente: Sanadores Libres explica esta app, y las siete libertades son lo
 * que hay detrás de todo.
 *
 * ═══ ERAN OCHO PÁRRAFOS, AHORA ES UN ESTANTE ═══
 *
 * Cada libro era una tarjeta con su versalita, su título y dos o tres
 * renglones explicando de qué trata: doscientas palabras para decir ocho
 * títulos. Medido, esta pantalla abría con 492 palabras y 52 cosas tocables,
 * y era —junto al Camino— la más pesada de la app.
 *
 * Un libro se reconoce por su tapa. Ahora son tapas en una grilla, con la
 * proporción de un libro de verdad, y el título debajo. Lo que explicaba el
 * párrafo lo explica el libro cuando se abre.
 *
 * ═══ LO QUE NO HACE ═══
 *
 * No vende. Dice qué libro es y lleva a donde vive. Los precios y la forma de
 * entrega se deciden fuera de la app y cambian más seguido que esta pantalla.
 */
import { ArrowUpRight } from 'lucide-react';
import { estante, faltanDelSur } from '../lib/libros';
import TapaDeLibro from './TapaDeLibro';

export default function EstanteDeLibros() {
  const libros = estante();
  const faltan = faltanDelSur();

  return (
    <section className="space-y-3">
      <p className="text-[15px] font-bold uppercase tracking-[0.16em] text-goldhi">Los libros</p>

      {/*
        Dos columnas en el teléfono y cuatro en pantalla grande. Con una sola
        columna las tapas quedan enormes y el estante vuelve a ser una lista
        larga, que es justo de lo que se venía.
      */}
      <ul className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-6">
        {libros.map((l) => {
          const cuerpo = (
            <>
              <TapaDeLibro id={l.id} titulo={l.titulo} orden={l.orden} ancho={150} />
              {/*
                El pie SOLO para los cinco del sur. Su tapa dice el nombre
                corto —«El lago»— y el título entero es «Lo que el lago te
                enseña», así que el pie agrega algo. En los otros tres la tapa
                ya lleva el título completo, y repetirlo debajo era leer dos
                veces lo mismo a dos centímetros.
              */}
              {l.rol === 'coleccion' && (
                <p className="mt-2 text-[17px] leading-tight text-cream">{l.titulo}</p>
              )}
              {/*
                «En escritura» va acá y no sobre la tapa: sobre la tapa tapa el
                dibujo, y de los ocho libros hay seis que todavía se están
                escribiendo — seis carteles encima de seis tapas es la pantalla
                diciendo «todavía no» seis veces.
              */}
              {l.estado === 'escribiendo' && (
                <p className="mt-1 text-[15px] text-cream/55">En escritura</p>
              )}
            </>
          );
          return (
            <li key={l.id} className="flex flex-col items-start">
              {l.enlace ? (
                <a href={l.enlace} target="_blank" rel="noreferrer"
                  className="group flex flex-col items-start">
                  {cuerpo}
                  <span className="mt-1 inline-flex min-h-[44px] items-center gap-1.5 text-[15px] font-semibold text-goldhi">
                    Abrirlo <ArrowUpRight className="h-4 w-4" />
                  </span>
                </a>
              ) : cuerpo}
            </li>
          );
        })}
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
