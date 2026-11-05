/**
 * LA PORTADA DE UN SISTEMA — el momento editorial del Camino.
 *
 * ═══ QUÉ REEMPLAZA ═══
 *
 * El Camino agrupaba las jornadas bajo un encabezado de texto: «Tu reset ·
 * Días 1-5». Correcto, y no dice nada. El cliente lee un rótulo de carpeta en
 * el lugar donde debería entender por qué esos cinco días van juntos.
 *
 * Acá entra el paisaje: el dato real del lago, lo que eso significa para su
 * trabajo, y la ilustración de la tapa del libro que trata ese sistema. Es la
 * misma imagen que va a encontrar en la landing, en el libro y en Bariloche.
 *
 * ═══ POR QUÉ ESTÁ ARMADA COMO UNA PÁGINA DE LIBRO ═══
 *
 * Versalita con tracking amplio arriba, título en Fraunces, una regla de 1px
 * en oro, y el cuerpo en Lora. La capitular del dato va en oro, como la
 * primera letra de cada capítulo.
 *
 * No es nostalgia tipográfica: es que un bloque que respira distinto se lee
 * distinto. El cliente está acostumbrado a saltearse las cabeceras de sección
 * porque las cabeceras de sección no dicen nada. Esta sí, y tiene que
 * parecerlo antes de leerla.
 */
import React from 'react';
import type { Paisaje } from '../lib/losCincoPaisajes';
import { COLECCION } from '../lib/losCincoPaisajes';
import PaisajeIlustrado from './PaisajeIlustrado';

export default function PortadaDeSistema(
  { paisaje, compacta = false }: { paisaje: Paisaje; compacta?: boolean },
) {
  if (compacta) return <Tira paisaje={paisaje} />;

  return (
    <section
      className="rounded-2xl overflow-hidden border"
      style={{ borderColor: 'rgba(201,168,111,0.3)', background: paisaje.color.lecho }}
    >
      <div className="flex flex-col sm:flex-row">
        {/* LA ILUSTRACIÓN.
            En el teléfono, una franja ancha arriba; en pantalla grande, una
            columna al costado. En los dos casos el dibujo LLENA su marco y
            recorta por abajo, que es donde cada paisaje tiene lo suyo: el
            agua, el río, las raíces. */}
        {/* En el teléfono, la franja apaisada centrada en lo que cuenta de
            cada paisaje. En pantalla grande, la tapa entera al costado. */}
        <div className="shrink-0 w-full h-[150px] overflow-hidden sm:hidden">
          <PaisajeIlustrado paisaje={paisaje} alto={150} ancho="100%" apaisado
            className="w-full h-full" />
        </div>
        <div className="hidden sm:block shrink-0 w-[200px] overflow-hidden">
          <PaisajeIlustrado paisaje={paisaje} alto={340} ancho={200} className="h-full" />
        </div>

        {/* El lecho: el color de la tapa, oscurecido hasta que el texto se
            lea. Medido: 10 a 1 en blanco y 4,5 en el oro, en los cinco.
            Lo pinta la section, una sola vez. Acá estaba repintado con el
            MISMO color: pintura muerta que el ojo no ve y la cuenta de
            superficies sí. */}
        <div className="flex-1 p-5 sm:p-6">
          <p className="rotulo-libro oro-paisaje">{COLECCION} · {paisaje.n}</p>

          <h2 className="mt-2 sobre-paisaje"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 28, lineHeight: 1.1, fontWeight: 500,
              letterSpacing: '-0.01em',
            }}>
            {paisaje.nombre}
          </h2>

          {/* La regla de 20 mm de la tapa, a escala. */}
          <div className="regla-libro regla-paisaje mt-3 mb-3" />

          <p className="prosa-libro sobre-paisaje-2" style={{ fontStyle: 'italic' }}>
            {paisaje.ensena}
          </p>

          {/* El dato lleva la capitular en oro: es la primera letra del
              capítulo, y es lo que hace que el ojo entre por acá. */}
          <p className="prosa-libro con-capitular sobre-paisaje mt-4">
            {paisaje.dato}
          </p>

          {/* LA BAJADA. Con el borde izquierdo de 1px en oro, que en el libro
              marca el bloque de «Tu acción»: lo que hay que hacer con lo que
              se acaba de leer. */}
          <p className="prosa-libro accion-libro accion-paisaje sobre-paisaje-2 mt-4">
            {paisaje.bajada}
          </p>

          <p className="rotulo-libro sobre-paisaje-3 mt-4">
            {paisaje.sistema} · {paisaje.dias}
          </p>
        </div>
      </div>
    </section>
  );
}

/**
 * La versión chica: una tira para arriba de una lista.
 *
 * Existe porque la portada entera, repetida en cada sección de una pantalla
 * larga, deja de ser un momento y pasa a ser ruido. El momento se gana una vez.
 */
function Tira({ paisaje }: { paisaje: Paisaje }) {
  return (
    <div className="flex items-center gap-4 rounded-xl overflow-hidden border"
      style={{ borderColor: 'rgba(201,168,111,0.24)', background: paisaje.color.lecho }}>
      {/*
        ERA DE 104 × 72 Y LA MONTAÑA PARECÍA UNA CALCOMANÍA.

        Estas cinco ilustraciones son lo mejor que tiene la casa —son las
        mismas de las tapas de imprenta— y acá entraban en un recorte del
        tamaño de un sello: del lago se veía una franja de agua, de la
        montaña una punta. A 140 × 96 la ilustración vuelve a leerse como un
        paisaje sin que la tira deje de ser una tira.

        Y sin `truncate` en la frase: «Mirarte antes de moverte» entra, pero
        «Subir por etapas hasta la cumbre» se cortaba en «Subir por etapas…».
        Es la enseñanza del sistema; cortada no enseña nada. Dos renglones.
      */}
      <div className="shrink-0 w-[140px] h-[96px] overflow-hidden">
        <PaisajeIlustrado paisaje={paisaje} alto={96} ancho={140} apaisado className="w-full h-full" />
      </div>
      <div className="flex-1 py-3 pr-4 min-w-0">
        <p className="rotulo-libro oro-paisaje truncate">{paisaje.nombre}</p>
        <p className="prosa-libro sobre-paisaje-2 leading-snug" style={{ fontStyle: 'italic' }}>
          {paisaje.ensena}
        </p>
      </div>
    </div>
  );
}
