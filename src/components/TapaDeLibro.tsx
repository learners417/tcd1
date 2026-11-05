/**
 * LA TAPA DE UN LIBRO — un libro se reconoce por su tapa, no por su párrafo.
 *
 * ═══ QUÉ REEMPLAZA ═══
 *
 * El estante eran ocho tarjetas de texto, una debajo de otra: una versalita,
 * el título, y dos o tres renglones explicando de qué trata. Doscientas
 * palabras para decir ocho títulos, en la pantalla de los LIBROS — que es lo
 * más visual que tiene esta casa y lo único que ya estaba ilustrado.
 *
 * Porque las cinco ilustraciones ya existían: son las de los cinco paisajes,
 * las mismas de las tapas de imprenta, y estaban usándose solo como cabecera
 * de sección dentro del Camino. El id de cada libro de la colección ES el id
 * de su paisaje —lago, montaña, viento, río, bosque—, así que la tapa de cada
 * uno estaba a una línea de distancia.
 *
 * ═══ LAS DOS FAMILIAS DE TAPA ═══
 *
 * · Los cinco del sur llevan su paisaje, con el color de su lecho.
 * · Los otros tres —la raíz, el de esta app y el compañero— llevan tapa
 *   tipográfica: tinta, una regla de oro de 1px y el título en la serif. Es
 *   la misma convención de una colección de ensayo, y evita inventarles una
 *   ilustración que no existe.
 *
 * En los dos casos la proporción es 2:3, que es la de un libro de verdad. Una
 * tapa cuadrada se lee como un ícono.
 */
import { paisajePorId, TINTA_LIBRO, COLECCION } from '../lib/losCincoPaisajes';
import PaisajeIlustrado from './PaisajeIlustrado';

export default function TapaDeLibro({
  id, titulo, orden, ancho = 150,
}: {
  /** El id del libro. Para los cinco del sur, es también el de su paisaje. */
  id: string;
  titulo: string;
  /** Su número en la colección, cuando pertenece a una. */
  orden?: number;
  ancho?: number;
}) {
  const alto = Math.round(ancho * 1.5);
  const paisaje = paisajePorId(id);

  if (paisaje) {
    return (
      <div
        className="relative overflow-hidden rounded-[10px] border"
        style={{ width: ancho, height: alto, background: paisaje.color.lecho, borderColor: 'rgba(201,168,111,0.35)' }}
      >
        {/* La ilustración ocupa los dos tercios de arriba, que es donde va en
            la tapa impresa. Abajo queda el lecho para el texto. */}
        <div className="absolute inset-x-0 top-0 overflow-hidden" style={{ height: Math.round(alto * 0.62) }}>
          <PaisajeIlustrado paisaje={paisaje} alto={Math.round(alto * 0.62)} ancho={ancho} apaisado
            className="w-full h-full" />
        </div>
        {/*
          LA TAPA DECÍA EL NOMBRE DE LA COLECCIÓN Y NO EL DEL LIBRO.

          Arriba iba «LO QUE EL SUR TE ENSEÑA · 1» en versalita espaciada. A
          150 px de ancho eso son TRES renglones, y los tres se comían el 38%
          de abajo entero: el nombre corto —«El lago»— quedaba fuera del
          recorte. Así que las cinco tapas de la colección se veían iguales,
          con el mismo rótulo repetido, y para saber cuál era cada una había
          que leer el pie de abajo.

          En una colección impresa el número va solo, chico, arriba del
          título: el nombre de la colección está en el lomo y en la
          contratapa, no compitiendo con el título en la tapa. Acá igual —el
          número, la regla, y el nombre del libro, que es lo que se busca.
        */}
        <div className="absolute inset-x-0 bottom-0 px-3 pb-3" style={{ top: Math.round(alto * 0.62) }}>
          {typeof orden === 'number' && (
            <p className="rotulo-libro oro-paisaje" style={{ fontSize: 15 }} title={COLECCION}>
              {orden}
            </p>
          )}
          <div className="regla-libro regla-paisaje my-1.5" />
          <p className="sobre-paisaje leading-tight"
            style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500 }}>
            {paisaje.nombre}
          </p>
        </div>
      </div>
    );
  }

  /* Tapa tipográfica: para los que no tienen paisaje propio. */
  return (
    <div
      className="relative overflow-hidden rounded-[10px] border flex flex-col justify-end px-3 pb-3"
      style={{ width: ancho, height: alto, background: TINTA_LIBRO.tinta, borderColor: 'rgba(201,168,111,0.35)' }}
    >
      {/* La regla de la colección, arriba: es lo que hace que una tapa sin
          dibujo siga perteneciendo al mismo estante. */}
      <div className="absolute left-3 right-3 top-4 h-px" style={{ background: TINTA_LIBRO.oro, opacity: 0.8 }} />
      <p className="leading-tight"
        style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500, color: TINTA_LIBRO.papel }}>
        {titulo}
      </p>
    </div>
  );
}
