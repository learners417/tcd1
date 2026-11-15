/**
 * EL JUEGO DEL SUR — el tablero de los 90 días.
 *
 * El mismo juego que está en la guarda de los libros y en El Camino en
 * papel: el vaso, el mapa, la racha y las diez palabras. El quinto, el
 * sello por tramo, ya existe en la app con otro nombre —son sus grados—,
 * así que acá no se dibuja otro.
 *
 * ═══ POR QUÉ NO ES UN TABLERO DE PUNTOS ═══
 *
 * No hay puntaje, ni nivel con número, ni nada que se pierda. Cada piedra
 * es un día que hizo y cada palabra es un dibujo que miró con calma. Lo
 * único que se muestra de más es la marca que alcanzó, porque es la que
 * está dibujada en el vaso del libro.
 */
import { useEffect, useMemo, useState } from 'react';
import {
  VASO, MARCAS, piedras, piedrasEnElVaso, vasoLleno, marcaAlcanzada,
  rachaDe, SI_SE_CORTA, alMarcarPasoAfuera,
  PALABRAS, ECUACION, LO_QUE_ABRE,
  leerPalabras, encontrarPalabra, estanLasDiez,
} from '../../lib/elJuegoDelSur';

interface Props {
  /** Los días del Camino que ya cerró. */
  diasHechos: number[];
  /** Los días en que marcó su paso afuera. */
  pasosAfuera: number[];
  /** El día de programa en que va: sin él la racha no se puede cortar. */
  diaActual: number;
  /** Los días que tienen paso afuera, para medir la racha contra ellos. */
  diasConPasoAfuera: number[];
  /** Día del camino → número de sistema (1 a 5), para pintar el mapa. */
  sistemaPorDia: Record<number, number | null>;
  /** El color de cada sistema, en orden. */
  coloresDeSistema: string[];
  /** Su hora real de entrada y la de hoy, para lo que abren las diez palabras. */
  horaReal?: { entrada: number | null; hoy: number | null };
}

export default function ElJuegoDelSur({
  diasHechos, pasosAfuera, diasConPasoAfuera, diaActual, sistemaPorDia, coloresDeSistema, horaReal,
}: Props) {
  /* Lo que marca la sesión, en la misma pantalla: sin esto el vaso y la racha
     se quedaban quietos hasta recargar. */
  const [marcados, setMarcados] = useState<number[]>(pasosAfuera);
  useEffect(() => setMarcados(pasosAfuera), [pasosAfuera]);
  useEffect(() => alMarcarPasoAfuera(setMarcados), []);
  const [palabras, setPalabras] = useState<string[]>(() => leerPalabras());
  const [escribiendo, setEscribiendo] = useState('');

  const ganadas = piedras(diasHechos.length, marcados.length);
  const cuantas = piedrasEnElVaso(ganadas);
  const marca = marcaAlcanzada(cuantas);
  const racha = useMemo(
    () => rachaDe(marcados, diasConPasoAfuera, diaActual),
    [marcados, diasConPasoAfuera, diaActual],
  );
  const hechos = useMemo(() => new Set(diasHechos), [diasHechos]);
  const lasDiez = estanLasDiez(palabras);

  return (
    <section className="space-y-7">
      <div>
        <p className="rotulo-libro">El juego del sur</p>
        <p className="text-[17px] leading-snug text-cream/75">
          El mismo que está en la guarda de tus libros.
        </p>
      </div>

      {/* ─── TU VASO ─── */}
      <div className="space-y-2">
        <p className="rotulo-libro">Tu vaso</p>
        <div className="flex flex-wrap gap-[3px]" aria-hidden="true">
          {Array.from({ length: VASO }, (_, i) => (
            <span
              key={i}
              className="rounded-full"
              style={{
                width: 'calc((100% - 57px) / 20)',
                aspectRatio: '1',
                minWidth: 8,
                /* Las que faltan, apenas marcadas: cien puntos del mismo gris
                   son una pared antes de que haya una sola piedra, y el vaso
                   del libro es un contorno, no un bloque lleno. */
                background: i < cuantas ? 'var(--oro-t2, #74551C)' : 'var(--line2, #DFD3BC)',
                opacity: i < cuantas ? 1 : 0.4,
              }}
            />
          ))}
        </div>
        <p className="text-[17px] leading-snug text-cream">
          {/* Se dice lo que hay EN EL VASO, no lo que ganó: el Camino da para
              120 y el vaso tiene 100. Lleno es lleno. */}
          {vasoLleno(ganadas) ? `${VASO} de ${VASO}` : `${cuantas} ${cuantas === 1 ? 'piedra' : 'piedras'}`}
          {marca ? ` · ${marca.nombre}` : ''}
        </p>
        <p className="text-[15px] leading-snug text-cream/60">
          Cada día hecho, una piedra. Cada paso afuera, dos.{' '}
          {MARCAS.map((m) => `${m.en} ${m.nombre.toLowerCase()}`).join(' · ')}.
        </p>
      </div>

      {/* ─── EL MAPA ─── */}
      <div className="space-y-2">
        <p className="rotulo-libro">Tu mapa de 90 días</p>
        <div className="grid grid-cols-10 gap-[3px]" aria-hidden="true">
          {Array.from({ length: 90 }, (_, i) => {
            const dia = i + 1;
            const sis = sistemaPorDia[dia];
            const color = sis ? coloresDeSistema[sis - 1] : undefined;
            return (
              <span
                key={dia}
                className="rounded-[3px]"
                style={{
                  aspectRatio: '1',
                  background: hechos.has(dia) && color ? color : 'var(--line2, #DFD3BC)',
                  opacity: hechos.has(dia) ? 1 : 0.3,
                }}
              />
            );
          })}
        </div>
        <p className="text-[15px] leading-snug text-cream/60">
          Se pinta el día que hiciste, con el color de su paisaje.
        </p>
      </div>

      {/* ─── LA RACHA ─── */}
      <div className="space-y-1.5">
        <p className="rotulo-libro">Tu racha</p>
        <p className="text-[19px] leading-snug text-cream">
          {racha.actual === 0
            ? 'Empieza con tu primer paso afuera'
            : `${racha.actual} ${racha.actual === 1 ? 'día seguido' : 'días seguidos'}`}
          {racha.mejor > racha.actual ? ` · tu mejor, ${racha.mejor}` : ''}
        </p>
        {racha.mejor > 0 && racha.actual === 0 && (
          <p className="text-[15px] leading-snug text-cream/70">{SI_SE_CORTA}</p>
        )}
      </div>

      {/* ─── LAS DIEZ PALABRAS ─── */}
      <div className="space-y-3">
        <p className="rotulo-libro">Tus diez palabras</p>
        <p className="text-[15px] leading-snug text-cream/70">
          Dos escondidas en los dibujos de cada libro del sur. Escribe la que encuentres.
        </p>
        {!lasDiez && (
          <form
            onSubmit={(e) => { e.preventDefault(); setPalabras(encontrarPalabra(escribiendo)); setEscribiendo(''); }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={escribiendo}
              onChange={(e) => setEscribiendo(e.target.value)}
              aria-label="La palabra que encontraste"
              className="flex-1 min-w-0 min-h-[44px] rounded-xl border border-[var(--line2,#DFD3BC)]
                         bg-transparent px-3 text-[17px] text-cream"
            />
            <button type="submit" className="min-h-[44px] px-4 rounded-full text-[17px] font-semibold"
              style={{ background: 'var(--tinta-boton, #2B4E68)', color: 'var(--papel-boton, #FFFFFF)' }}>
              Sumar
            </button>
          </form>
        )}
        <div className="flex flex-wrap gap-2">
          {PALABRAS.map((p) => {
            const esta = palabras.includes(p.palabra);
            return (
              <span
                key={p.palabra}
                className="rounded-full px-3 py-1 text-[15px]"
                style={esta
                  ? { background: 'var(--oro-t2, #74551C)', color: 'var(--papel-boton, #FFFFFF)' }
                  : { border: '1px solid var(--line2, #DFD3BC)', color: 'var(--text-muted, #5A534C)' }}
              >
                {esta ? p.palabra : '· · ·'}
              </span>
            );
          })}
        </div>

        {/* La ecuación del Bosque, y lo que abre cuando están las diez. */}
        <div className="rounded-2xl border border-gold/20 p-4 space-y-2">
          <p className="text-[19px] leading-snug text-cream">
            {ECUACION}
            {lasDiez && horaReal?.hoy != null ? (
              <span className="text-goldhi font-semibold">{Math.round(horaReal.hoy)}</span>
            ) : (
              <span className="text-cream/40">———</span>
            )}
          </p>
          {lasDiez ? (
            <>
              <p className="rotulo-libro">{LO_QUE_ABRE.titulo}</p>
              <p className="text-[17px] leading-snug text-cream/75">{LO_QUE_ABRE.dice}</p>
              {horaReal?.entrada != null && horaReal.hoy != null && (
                <p className="text-[19px] leading-snug text-cream">
                  Día 1: {Math.round(horaReal.entrada)} · hoy: {Math.round(horaReal.hoy)}
                </p>
              )}
            </>
          ) : (
            <p className="text-[15px] leading-snug text-cream/60">
              La respuesta es tu número, y llega con las diez.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
