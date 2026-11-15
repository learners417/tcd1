/**
 * MI PROTOCOLO — las 33 piezas, en El Camino.
 *
 * ═══ QUÉ RESUELVE ═══
 *
 * El Lago deja una pieza escrita por lección. En papel se escriben en la
 * guarda del libro; hasta hoy en la app no se escribían en ningún lado, así
 * que el que hacía el Camino sin el libro al lado terminaba los 90 días sin
 * su protocolo.
 *
 * ═══ EL ORDEN DE LA PANTALLA ═══
 *
 * Primero la pieza de HOY, abierta y lista para escribir: es la única que
 * se pide. Después las que ya escribió, para releerlas. Y al final las que
 * faltan, en gris y sin invitar a nada.
 *
 * No es una lista de 33 casillas: eso convierte un reset en una tarea
 * pendiente de 33 renglones, que es justo lo que el Lago viene a sacar.
 *
 * ═══ LO QUE NO HACE ═══
 *
 * No pone puntaje, no calcula un porcentaje de «protocolo completado» y no
 * avisa de lo que falta. La pieza se escribe el día que su lección se lee;
 * las demás esperan sin hacer ruido.
 */
import { useMemo, useState } from 'react';
import {
  PIEZAS, PIEZA_POR_NUMERO, HITOS, PISTA, EL_66, DE_JAVO,
  SENALES, CAMPOS_DE_LA_SENAL, FUENTE_DEL_BURNOUT,
  leerProtocolo, guardarPieza, leerSenales, guardarSenal,
  cuantasEscritas,
  type ProtocoloEscrito, type SenalesEscritas,
} from '../../lib/miProtocolo';

interface Props {
  /** Los números de lección que el cliente lee hoy. La pieza N es la de la lección N. */
  leccionesDeHoy: number[];
  /** Días seguidos sosteniendo el protocolo, para la pista de 66. */
  diasSostenidos?: number;
}

function Campo({ numero, valor, onGuardar }: {
  numero: number;
  valor: string;
  onGuardar: (t: string) => void;
}) {
  const pieza = PIEZA_POR_NUMERO[numero];
  const [texto, setTexto] = useState(valor);
  if (!pieza) return null;
  return (
    <div className="space-y-2">
      <p className="text-[19px] leading-snug text-cream">
        <span className="num-tab text-goldhi">{String(pieza.numero).padStart(2, '0')}</span>
        {' · '}
        {pieza.nombre}
      </p>
      <p className="text-[15px] leading-snug text-cream/70">{pieza.pie}</p>
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onBlur={() => onGuardar(texto)}
        rows={3}
        aria-label={pieza.nombre}
        className="w-full rounded-xl border border-[var(--line2,#DFD3BC)] bg-transparent p-3
                   text-[17px] leading-snug text-cream"
      />
    </div>
  );
}

export default function MiProtocolo({ leccionesDeHoy, diasSostenidos = 0 }: Props) {
  const [escrito, setEscrito] = useState<ProtocoloEscrito>(() => leerProtocolo());
  const [senales, setSenales] = useState<SenalesEscritas>(() => leerSenales());
  const [abierta, setAbierta] = useState<number | null>(null);
  /* Las que faltan arrancan cerradas: la pantalla no empieza pidiendo 31 cosas. */
  const [verFaltan, setVerFaltan] = useState(false);

  const hoy = useMemo(
    () => leccionesDeHoy.filter((n) => PIEZA_POR_NUMERO[n]),
    [leccionesDeHoy],
  );
  const escritas = cuantasEscritas(escrito);
  /* Las que ya tienen texto y no son las de hoy: se releen, no se piden. */
  const hechas = PIEZAS.filter((p) => (escrito[p.numero] ?? '') && !hoy.includes(p.numero));
  const faltan = PIEZAS.filter((p) => !(escrito[p.numero] ?? '') && !hoy.includes(p.numero));

  const guardar = (n: number, t: string) => setEscrito(guardarPieza(n, t));

  return (
    <section className="space-y-6">
      <div>
        <p className="rotulo-libro">Mi protocolo</p>
        <p className="text-[17px] leading-snug text-cream/75">
          {escritas === 0
            ? 'Cada lección del Lago deja una pieza escrita. Las 33 juntas son tu protocolo.'
            : `${escritas} de 33 escritas.`}
        </p>
      </div>

      {hoy.length > 0 && (
        <div className="rounded-2xl border border-gold/20 p-5 space-y-5">
          <p className="rotulo-libro">{hoy.length === 1 ? 'Tu pieza de hoy' : 'Tus piezas de hoy'}</p>
          {hoy.map((n) => (
            <Campo key={n} numero={n} valor={escrito[n] ?? ''} onGuardar={(t) => guardar(n, t)} />
          ))}
        </div>
      )}

      {hechas.length > 0 && (
        <div className="space-y-3">
          <p className="rotulo-libro">Lo que ya escribiste</p>
          {hechas.map((p) => (
            <div key={p.numero}>
              <button
                type="button"
                onClick={() => setAbierta(abierta === p.numero ? null : p.numero)}
                aria-expanded={abierta === p.numero}
                className="w-full min-h-[52px] flex items-start gap-3 py-2 text-left"
              >
                <span className="num-tab text-goldhi shrink-0">{String(p.numero).padStart(2, '0')}</span>
                <span className="text-[17px] leading-snug text-cream">{p.nombre}</span>
              </button>
              {abierta === p.numero && (
                <div className="pl-10 pb-3">
                  <Campo numero={p.numero} valor={escrito[p.numero] ?? ''}
                         onGuardar={(t) => guardar(p.numero, t)} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {faltan.length > 0 && (
        /* Las que faltan se cuentan, no se listan: medido en el teléfono, los
           31 nombres seguidos son un párrafo de seis renglones que no se puede
           hacer nada con él, y empuja hacia abajo lo que sí.

           PERO TIENEN QUE TENER ENTRADA. Hasta el 15 de noviembre esto era
           solo el renglón de abajo, y entonces la única pieza que se podía
           escribir era la de hoy: el que no escribía la suya el día que su
           lección caía la perdía para siempre, y las 33 tenían una sola
           oportunidad cada una. Por eso el renglón abre la lista, cerrada de
           entrada: quieto por defecto, con camino de vuelta. */
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setVerFaltan(!verFaltan)}
            aria-expanded={verFaltan}
            className="min-h-[44px] text-left text-[15px] leading-snug text-cream/60 underline
                       decoration-gold/30 underline-offset-4"
          >
            {faltan.length === 1
              ? 'Queda una, y llega con su lección.'
              : `Quedan ${faltan.length}, y cada una llega con su lección.`}
            {' '}
            {verFaltan ? 'Cerrar.' : 'Verlas.'}
          </button>
          {verFaltan && (
            <div className="space-y-3">
              {faltan.map((p) => (
                <div key={p.numero}>
                  <button
                    type="button"
                    onClick={() => setAbierta(abierta === p.numero ? null : p.numero)}
                    aria-expanded={abierta === p.numero}
                    className="w-full min-h-[52px] flex items-start gap-3 py-2 text-left"
                  >
                    <span className="num-tab text-cream/50 shrink-0">{String(p.numero).padStart(2, '0')}</span>
                    <span className="text-[17px] leading-snug text-cream/60">{p.nombre}</span>
                  </button>
                  {abierta === p.numero && (
                    <div className="pl-10 pb-3">
                      <Campo numero={p.numero} valor={escrito[p.numero] ?? ''}
                             onGuardar={(t) => guardar(p.numero, t)} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── LA PISTA DE 66 ─── */}
      <div className="space-y-2">
        <p className="rotulo-libro">Sostenerlo</p>
        <div className="flex gap-[2px]" aria-hidden="true">
          {Array.from({ length: PISTA }, (_, i) => {
            const dia = i + 1;
            const hito = HITOS.some((h) => h.dia === dia);
            return (
              <span
                key={dia}
                className="flex-1 rounded-full"
                style={{
                  height: hito ? 14 : 8,
                  background: dia <= diasSostenidos ? 'var(--oro-t2, #74551C)' : 'var(--line2, #DFD3BC)',
                }}
              />
            );
          })}
        </div>
        <p className="text-[15px] leading-snug text-cream/75">
          {diasSostenidos > 0 ? `${diasSostenidos} días seguidos. ` : ''}
          {HITOS.map((h) => `${h.dia} · ${h.nombre}`).join('  ·  ')}
        </p>
        {HITOS.filter((h) => h.dice).map((h) => (
          <p key={h.dia} className="text-[15px] leading-snug text-cream/60">{h.dice}</p>
        ))}
        {/*
          LA FUENTE ES DEL 66, Y DE NADA MÁS. Una sola línea debajo de los tres
          números se los atribuía a Lally — incluido el 21, que es justo la
          cifra popular que ESE estudio contradice, y que además lo eligió Javo.
          Y el rango va en pantalla: 66 es la mediana de 18 a 254 días. Sin eso,
          un número redondo se lee como una promesa.
        */}
        <p className="text-[15px] leading-snug text-cream/60">{EL_66.dice}</p>
        <p className="text-[15px] leading-snug text-cream/55">
          Fuente del 66: {EL_66.fuente}. {DE_JAVO}
        </p>
      </div>

      {/* ─── EL TABLERO CONTRA EL BURNOUT ─── */}
      <div className="space-y-4">
        <div>
          <p className="rotulo-libro">Lo único que te puede detener</p>
          <p className="text-[17px] leading-snug text-cream/75">
            Escribe cómo se te nota cada señal y qué haces ese día.
          </p>
        </div>
        {SENALES.map((s) => (
          <div key={s.numero} className="rounded-2xl border border-[var(--line2,#DFD3BC)] p-4 space-y-3">
            <p className="text-[17px] leading-snug text-cream">
              <span className="num-tab text-goldhi">{s.numero}</span>{' · '}{s.nombre}
            </p>
            {CAMPOS_DE_LA_SENAL.map((etiqueta, i) => (
              <label key={etiqueta} className="block space-y-1">
                <span className="text-[15px] text-cream/70">{etiqueta}</span>
                <input
                  type="text"
                  defaultValue={(senales[s.numero] ?? ['', ''])[i]}
                  onBlur={(e) => setSenales(guardarSenal(s.numero, i as 0 | 1, e.target.value))}
                  className="w-full min-h-[44px] rounded-xl border border-[var(--line2,#DFD3BC)]
                             bg-transparent px-3 text-[17px] text-cream"
                />
              </label>
            ))}
          </div>
        ))}
        <p className="text-[15px] leading-snug text-cream/55">Las tres señales: {FUENTE_DEL_BURNOUT}.</p>
      </div>
    </section>
  );
}
