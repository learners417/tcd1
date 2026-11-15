/**
 * SESIÓN VIVA — cinco pantallas, una idea por pantalla (C2 del plan definitivo).
 *
 *   Te llevas · Mira · Haz · Sube · Listo
 *
 * Reemplaza la versión con check-in de emoción y cronómetro a la vista:
 *   - Nadie declara cómo llega para poder empezar. La emoción queda para los
 *     días de protocolo, que la piden por su cuenta.
 *   - Un reloj corriendo apura y no ayuda: el tiempo se dice una vez, al inicio.
 *   - Sin video, la pantalla "Mira" no existe: no se anuncia lo que falta.
 *
 * La sesión queda registrada igual y sobrevive a cerrar la app.
 */
import React, { useEffect, useMemo, useState } from 'react';
import ElEncargo from './ElEncargo';
import LaPuerta from './LaPuerta';
import { Check, Clock, ArrowLeft, ArrowRight } from 'lucide-react';
import { leerPasosAfuera, marcarPasoAfuera } from '../../lib/elJuegoDelSur';
import {
  type SesionEnCurso,
  getSesionEnCurso, setSesionEnCurso, segundosDeSesion,
  abrirSessionLog, cerrarSessionLog,
} from '../../lib/sessionLog';

const KEY_ULTIMA = 'tcd_ultima_sesion_v1';
export interface UltimaSesion {
  metaCodigo: string;
  metaTitulo: string;
  compromisos: string[];
  fecha: string;
}
export function getUltimaSesion(): UltimaSesion | null {
  try {
    const raw = localStorage.getItem(KEY_ULTIMA);
    return raw ? (JSON.parse(raw) as UltimaSesion) : null;
  } catch { return null; }
}

export type PantallaSesion = 'llevas' | 'mira' | 'haz' | 'sube' | 'listo';

interface Props {
  metaKey: string;
  metaCodigo: string;
  metaTitulo: string;
  teLlevas?: string;
  pasos?: string[];
  /**
   * Cómo se empieza cada paso: micro[i] son los de pasos[i].
   *
   * Se dibujan SOLO los del paso en curso —el primero sin tildar—. Los
   * trece del día 1 juntos son una pared igual que la que vinieron a
   * sacar; de a uno, son el próximo movimiento y nada más.
   */
  micro?: string[][];
  /**
   * El día del camino de esta jornada. Lo pide el paso afuera: sin número,
   * marcarlo no se puede guardar, y sin eso la racha y el vaso del juego del
   * sur no tienen nada que contar.
   */
  diaDelPaso?: number | null;
  pide?: string;
  seAbre?: string;
  /** Lo que ya contestó en el onboarding para esta jornada. */
  base?: { etiqueta: string; valor: string } | null;
  /**
   * LOS TRES HILOS DE ESTE DÍA · adentro, afuera y sistema.
   *
   * El tercero —el sistema— ya estaba: son los `pasos`. Lo que faltaba era
   * lo de adentro (la lección del libro y la pausa de 5) y lo de afuera (el
   * paso afuera, diez minutos, opcional y solo los días en que la app no
   * pide nada visible). Llegan ya traducidos por el vocabulario: esta
   * pantalla muestra, no deduce.
   *
   * Nada de esto se anuncia cuando no está: la lección de Montaña, Viento,
   * Río y Bosque todavía no la pasó LIBROS, así que en la mayoría de los
   * días el bloque no existe.
   */
  hilos?: {
    lecciones: { clave: string; texto: string; logro: string }[];
    pausa: { texto: string; marca: string } | null;
    pasoAfuera: string | null;
  } | null;
  tiempoEstimado?: string | null;
  isCompleted: boolean;
  userId?: string;
  children: React.ReactNode;
  video?: React.ReactNode;
  evidencia?: React.ReactNode;
  /**
   * Para abrir la pantalla que este día necesita —Mi Número el día del
   * precio, Campañas el día que enciende. Esas pantallas salieron del menú y
   * su única puerta en el recorrido es esta.
   */
  onIr?: (destino: string) => void;
}

const ROTULO: Record<PantallaSesion, string> = {
  llevas: 'Te llevas', mira: 'Mira', haz: 'Haz', sube: 'Sube', listo: 'Listo',
};

export default function SesionViva({
  metaKey, metaCodigo, metaTitulo, teLlevas, pasos, micro, diaDelPaso, pide, seAbre, base,
  tiempoEstimado, isCompleted, userId, children, video, evidencia, onIr, hilos,
}: Props) {
  const [pasoAfueraHecho, setPasoAfueraHecho] = useState<boolean>(
    () => (diaDelPaso ? leerPasosAfuera().includes(diaDelPaso) : false),
  );
  const orden = useMemo<PantallaSesion[]>(
    () => ['llevas', ...(video ? (['mira'] as PantallaSesion[]) : []), 'haz', 'sube', 'listo'],
    [video],
  );
  const [pantalla, setPantalla] = useState<PantallaSesion>(() => {
    const s = getSesionEnCurso();
    return s && s.metaKey === metaKey ? 'haz' : 'llevas';
  });
  const [sesion, setSesion] = useState<SesionEnCurso | null>(() => {
    const s = getSesionEnCurso();
    return s && s.metaKey === metaKey ? s : null;
  });
  const [hechos, setHechos] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (isCompleted && pantalla !== 'listo') setPantalla('listo');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCompleted]);

  const abrir = async () => {
    setPantalla(orden[1] ?? 'haz');
    if (sesion) return;
    const nueva: SesionEnCurso = {
      metaKey, metaCodigo, metaTitulo,
      checkinEmocion: null, checkinObjetivo: '',
      segundosAcumulados: 0, corriendoDesde: Date.now(), pausas: 0,
      iniciadaEn: new Date().toISOString(),
    };
    setSesionEnCurso(nueva); setSesion(nueva);
    if (userId) {
      const logId = await abrirSessionLog(userId, { codigo: metaCodigo, titulo: metaTitulo }, { emocion: null, objetivo: '' });
      if (logId) { const conLog = { ...nueva, logId }; setSesionEnCurso(conLog); setSesion(conLog); }
    }
  };

  useEffect(() => {
    if (pantalla !== 'listo' || !sesion) return;
    const s = sesion;
    void (async () => {
      await cerrarSessionLog(s.logId, {
        checkout_emocion: null, compromisos: [],
        duracion_seg: segundosDeSesion(s), pausas: s.pausas,
      });
      try {
        localStorage.setItem(KEY_ULTIMA, JSON.stringify({
          metaCodigo, metaTitulo, compromisos: [], fecha: new Date().toISOString(),
        } as UltimaSesion));
      } catch { /* noop */ }
      setSesionEnCurso(null); setSesion(null);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pantalla]);

  const i = Math.max(0, orden.indexOf(pantalla));
  const ir = (delta: number) => {
    const n = orden[i + delta];
    if (n) { setPantalla(n); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  };

  return (
    <div className="space-y-4">
      <div aria-label={`Paso ${i + 1} de ${orden.length}`}>
        <div className="flex items-center gap-2">
          {orden.map((p, n) => (
            <div key={p} className="flex-1 h-1.5 rounded-full"
              style={{ background: n <= i ? 'var(--oro-d, #8E6824)' : 'var(--line, #EBE1CF)' }} />
          ))}
        </div>
        <p className="mt-2 text-[15px] font-semibold text-cream">
          {ROTULO[pantalla]} · paso {i + 1} de {orden.length}
        </p>
      </div>

      {pantalla === 'llevas' && (
        <section className="card-panel p-5 sm:p-6">
          <h2 className="text-[28px] leading-[1.15] text-cream" style={{ fontFamily: 'var(--font-display)', fontStyle: 'normal' }}>
            {metaTitulo}
          </h2>
          {teLlevas && <p className="mt-3 text-[19px] leading-relaxed text-cream">Te llevas: {teLlevas}</p>}
          {base && (
            <p className="mt-3 text-[17px] leading-relaxed text-cream/75">
              {base.etiqueta}: <span className="text-cream font-semibold">{base.valor}</span>. Hoy lo trabajamos desde ahí.
            </p>
          )}
          {/*
            ─── LOS DOS HILOS QUE NO ESTABAN ───────────────────────────────

            El día mostraba el título, lo que se lleva, los minutos y los
            pasos: los tres el hilo del SISTEMA. Lo de adentro —la lección y
            la pausa— y lo de afuera no tenían dónde aparecer.

            Van acá, en la primera pantalla, porque es donde el día se abre:
            el cliente lee qué se lleva y con qué se acompaña ANTES de
            empezar, no al final. Cada hilo, una línea; el logro de la
            lección en la línea de abajo, más suave, porque es lo que la
            lección le deja, no la orden de hoy.
          */}
          {hilos && (hilos.lecciones.length > 0 || hilos.pausa || hilos.pasoAfuera) && (
            <div className="mt-5 space-y-4">
              {hilos.lecciones.length > 0 && (
                <div>
                  <p className="text-[15px] font-bold uppercase tracking-[0.16em] text-goldhi">
                    Tu lección
                  </p>
                  {hilos.lecciones.map((l) => (
                    <div key={l.clave} className="mt-1">
                      <p className="text-[17px] leading-snug text-cream">{l.texto}</p>
                      <p className="text-[15px] leading-snug text-cream/70">{l.logro}</p>
                    </div>
                  ))}
                </div>
              )}
              {hilos.pausa && (
                <div>
                  <p className="text-[15px] font-bold uppercase tracking-[0.16em] text-goldhi">
                    Tu pausa de 5
                  </p>
                  {/*
                    La marca va PEGADA al nombre, nunca el nombre solo: es la
                    regla de los libros —● sólido, ◐ prometedor, ○ juego o
                    tradición— y lo que no tiene marca no es un dato.
                  */}
                  <p className="mt-1 text-[17px] leading-snug text-cream">
                    {hilos.pausa.texto} {hilos.pausa.marca}
                  </p>
                </div>
              )}
              {hilos.pasoAfuera && (
                <div>
                  <p className="text-[15px] font-bold uppercase tracking-[0.16em] text-goldhi">
                    Tu paso afuera · 10 min
                  </p>
                  <p className="mt-1 text-[17px] leading-snug text-cream">{hilos.pasoAfuera}</p>
                  {/*
                    UN SOLO TOQUE, y solo acá. El paso afuera sigue sin tilde
                    en la lista del día —el día cierra con sus cinco cosas, no
                    con seis—, pero el juego del sur necesita saber que pasó:
                    es lo que cuenta la racha y lo que vale dos piedras. Sin
                    este toque, las dos mecánicas quedaban dibujadas y en cero
                    para siempre.
                  */}
                  {diaDelPaso ? (
                    <button
                      type="button"
                      aria-pressed={pasoAfueraHecho}
                      onClick={() => {
                        const lista = marcarPasoAfuera(diaDelPaso, !pasoAfueraHecho);
                        setPasoAfueraHecho(lista.includes(diaDelPaso));
                      }}
                      className="mt-2 min-h-[44px] inline-flex items-center gap-2 text-[17px] font-semibold text-goldhi"
                    >
                      <span
                        className="w-6 h-6 rounded-full grid place-items-center border"
                        style={pasoAfueraHecho
                          ? { background: 'var(--tilde, #4A7C59)', borderColor: 'var(--tilde, #4A7C59)' }
                          : { borderColor: 'var(--line2, #DFD3BC)' }}
                      >
                        {pasoAfueraHecho && <Check className="w-4 h-4" style={{ color: '#FFFDF7' }} />}
                      </span>
                      {pasoAfueraHecho ? 'Lo hiciste' : 'Lo hice'}
                    </button>
                  ) : null}
                  {/* La misma bajada que en Hoy: es el mismo paso, y decirlo
                      con dos frases distintas lo convierte en dos cosas. */}
                  <p className="text-[15px] leading-snug text-cream/70">
                    Diez minutos. El día cierra igual.
                  </p>
                </div>
              )}
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {tiempoEstimado && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line2,#DFD3BC)] px-3 py-1.5 text-[15px] text-cream/80">
                <Clock className="w-4 h-4" /> {tiempoEstimado}
              </span>
            )}
          </div>
          <button type="button" onClick={abrir} className="btn-ios-primary mt-5 w-full">
            {video ? 'Ver el video' : 'Empezar'}
          </button>
        </section>
      )}

      {pantalla === 'mira' && video && (
        <section className="card-panel p-5 sm:p-6 space-y-4">
          {video}
          <button type="button" onClick={() => ir(1)} className="btn-ios-primary w-full">
            Ya lo vi, vamos a hacerlo
          </button>
        </section>
      )}

      {pantalla === 'haz' && (
        <section className="space-y-4">
          {/*
            El encargo va ANTES del paso a paso, cuando esa jornada tiene uno.
            El orden es el del trabajo: primero se copia y se pega, después se
            revisa lo que volvió. Abajo del paso a paso quedaría después de la
            revisión, que es tarde.
          */}
          <ElEncargo codigo={metaCodigo} />
          {/*
            Y la puerta, cuando este día abre una pantalla. Va con el encargo
            y antes del paso a paso porque es la herramienta con la que se
            hace el trabajo de hoy, no algo que se mira al final.
          */}
          {onIr && <LaPuerta codigo={metaCodigo} onIr={onIr} />}
          {pasos && pasos.length > 0 && (
            <div className="card-panel p-5 sm:p-6">
              <p className="text-[15px] font-bold uppercase tracking-[0.16em] text-goldhi">Paso a paso</p>
              <ul className="mt-3 space-y-1">
                {pasos.map((paso, n) => {
                  const hecho = hechos.has(n);
                  /* El paso en curso es el primero que queda sin tildar. Los
                     micro de ESE se ven; los demás esperan su turno. */
                  const enCurso = !hecho && pasos.findIndex((_, i) => !hechos.has(i)) === n;
                  const arranque = enCurso ? (micro?.[n] ?? []) : [];
                  return (
                    <li key={n}>
                      <button
                        type="button"
                        aria-pressed={hecho}
                        onClick={() => setHechos((prev) => {
                          const s = new Set(prev);
                          if (s.has(n)) s.delete(n); else s.add(n);
                          return s;
                        })}
                        className="w-full min-h-[52px] flex items-start gap-3 py-2 text-left"
                      >
                        <span
                          className="mt-0.5 w-7 h-7 shrink-0 rounded-full grid place-items-center border"
                          style={hecho
                            ? { background: 'var(--tilde, #4A7C59)', borderColor: 'var(--tilde, #4A7C59)' }
                            : { borderColor: 'var(--line2, #DFD3BC)' }}
                        >
                          {hecho && <Check className="w-4 h-4" style={{ color: '#FFFDF7' }} />}
                        </span>
                        <span className={`text-[17px] leading-snug ${hecho ? 'text-cream/60' : 'text-cream'}`}>{paso}</span>
                      </button>
                      {/* Y debajo, por dónde se empieza. Sin tilde propia: si
                          cada movimiento tuviera la suya, el día pasaría de
                          cinco cosas que cerrar a trece, y el que llega
                          cansado no cierra ninguna. */}
                      {arranque.length > 0 && (
                        <ul className="ml-10 mb-2 space-y-1.5">
                          {arranque.map((m, k) => (
                            <li key={k} className="flex gap-2 text-[15px] leading-snug text-cream/75">
                              <span aria-hidden="true" className="text-goldhi">·</span>
                              <span>{m}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {children}
        </section>
      )}

      {pantalla === 'sube' && (
        <section className="card-panel p-5 sm:p-6 space-y-4">
          <p className="text-[15px] font-bold uppercase tracking-[0.16em] text-goldhi">Terminaste cuando</p>
          <p className="text-[19px] leading-relaxed text-cream">{pide ?? 'Subes lo que hiciste hoy.'}</p>
          {evidencia}
        </section>
      )}

      {/*
        ─── LA ÚLTIMA PANTALLA NO PUEDE MENTIR ──────────────────────────────

        Decía «Listo · Queda registrado en tu Camino» SIEMPRE: era texto fijo,
        sin mirar una sola vez si la jornada se había cerrado. Y a esta
        pantalla se llega con el botón «Siguiente» de abajo, que no pide nada.

        Caminado el 9 de noviembre, los cinco días en pantalla: el día 4 pide
        una foto para cerrarse —es la única de las cinco cuya evidencia es un
        archivo—, así que «Marcar como completado» queda apagado. El cliente
        toca «Siguiente», llega acá, lee que su jornada quedó registrada, y
        cierra la app. No quedó registrada nada: al otro día el día 4 lo
        esperaba abierto y su Camino seguía diciendo 3 de 64.

        Lo mismo valía para los otros cuatro días: alcanzaba con tocar
        «Siguiente» dos veces en vez del botón verde.

        Ahora esta pantalla dice lo que pasó. Si la jornada está cerrada, el
        texto de siempre; si no, lo dice y devuelve al paso donde se cierra.
      */}
      {pantalla === 'listo' && (
        <section className="card-panel p-5 sm:p-6">
          <p className={`text-[15px] font-bold uppercase tracking-[0.16em] ${isCompleted ? '' : 'text-goldhi'}`}
            style={isCompleted ? { color: 'var(--tilde, #4A7C59)' } : undefined}>
            {isCompleted ? 'Listo' : 'Todavía no'}
          </p>
          <h2 className="mt-2 text-[26px] leading-tight text-cream" style={{ fontFamily: 'var(--font-display)', fontStyle: 'normal' }}>
            {metaTitulo}
          </h2>
          {isCompleted ? (
            <>
              {seAbre && <p className="mt-2 text-[19px] leading-relaxed text-cream">{seAbre}</p>}
              <p className="mt-2 text-[17px] text-cream/70">Queda registrado en tu Camino. Mañana sigue el paso que toca.</p>
            </>
          ) : (
            <>
              <p className="mt-2 text-[19px] leading-relaxed text-cream">
                Esta jornada todavía no quedó registrada en tu Camino.
              </p>
              <p className="mt-2 text-[17px] text-cream/70">
                Vuelve al paso «{ROTULO.haz}» y márcala como completada. Si te pide una
                evidencia, ahí mismo la subes.
              </p>
              <button type="button" onClick={() => setPantalla('haz')}
                className="mt-4 min-h-[52px] w-full rounded-[20px] border border-[var(--line2,#DFD3BC)] text-[17px] font-semibold text-cream">
                Volver a cerrarla <ArrowRight className="w-4 h-4 inline ml-1" />
              </button>
            </>
          )}
        </section>
      )}

      {pantalla !== 'llevas' && (
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => ir(-1)} disabled={i === 0}
            className="min-h-[52px] rounded-[20px] border border-[var(--line2,#DFD3BC)] text-[17px] font-semibold text-cream disabled:opacity-40">
            <ArrowLeft className="w-4 h-4 inline mr-1" /> Anterior
          </button>
          <button type="button" onClick={() => ir(1)} disabled={i >= orden.length - 1}
            className="min-h-[52px] rounded-[20px] border border-[var(--line2,#DFD3BC)] text-[17px] font-semibold text-cream disabled:opacity-40">
            Siguiente <ArrowRight className="w-4 h-4 inline ml-1" />
          </button>
        </div>
      )}
    </div>
  );
}
