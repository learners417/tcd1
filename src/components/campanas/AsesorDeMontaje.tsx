/**
 * EL ASESOR DE MONTAJE — nueve pasos, uno por vez, y nada más.
 *
 * ═══ QUÉ REEMPLAZA ═══
 *
 * A «Nueva campaña», que era un chat de seis fases: cliente, estrategia,
 * audiencias, copies, creativos, montaje.
 *
 * Cuatro de esas seis fases hacían trabajo que ya está hecho en otra pantalla,
 * y peor:
 *   · «copies» y «creativos» — los escribe el Constructor, que además los
 *     audita contra las reglas de Meta. Acá salían sin auditar.
 *   · «cliente» y «estrategia» — se sellaron en el Camino. Preguntarle de nuevo
 *     su ticket y su avatar, y después recomendarle una estrategia según lo que
 *     contestó, es abrir una campaña distinta cada vez que entra.
 *
 * Y la fase de audiencias le ofrecía «intereses, custom audiences, lookalikes»,
 * que con 30 USD al día es lo que hace que la campaña no arranque nunca.
 *
 * Queda lo único que no vive en ninguna otra pantalla: el montaje, paso por
 * paso, con la receta ya decidida. El asesor no la elige. La explica.
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { Send, ArrowLeft, Check, Circle, ShieldAlert } from 'lucide-react';
import Markdown from 'react-markdown';
import { toast } from 'sonner';
import { streamText } from '../../lib/aiProvider';
import {
  LA_RECETA, GRUPOS_DE_PAISES, promptDelAsesor, revisarPaises,
  loQueVaAGastar, A_DONDE_MANDAR, PRESUPUESTO_DIARIO, CUANTOS_ANUNCIOS,
  PAISES_MAX, DIAS_DE_APRENDIZAJE,
} from '../../lib/recetaCampana';
import BotonCopiar from '../BotonCopiar';
import { guardarMontaje } from '../../lib/montajeDatos';

const CLAVE = 'tcd_asesor_montaje_v1';

interface Mensaje { id: string; de: 'yo' | 'asesor'; texto: string }

interface Guardado {
  paso: number;
  hechos: number[];
  paises: string[];
}

function leer(): Guardado {
  try {
    const x = JSON.parse(localStorage.getItem(CLAVE) ?? '') as Partial<Guardado>;
    return {
      paso: typeof x.paso === 'number' ? x.paso : 1,
      hechos: Array.isArray(x.hechos) ? x.hechos.filter((n): n is number => typeof n === 'number') : [],
      paises: Array.isArray(x.paises) ? x.paises.filter((s): s is string => typeof s === 'string') : [],
    };
  } catch {
    return { paso: 1, hechos: [], paises: [] };
  }
}

export default function AsesorDeMontaje(
  { onVolver, clienteId }: { onVolver: () => void; clienteId?: string },
) {
  const inicial = leer();
  /** Los pasos tildados. SE GUARDAN: antes el progreso del chat vivía en la
   *  conversación, y al salir y volver empezaba de cero sin avisar. */
  const [hechos, setHechos] = useState<Set<number>>(new Set(inicial.hechos));
  const [paises, setPaises] = useState<string[]>(inicial.paises);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [entrada, setEntrada] = useState('');
  const [escribiendo, setEscribiendo] = useState(false);
  const abajo = useRef<HTMLDivElement>(null);

  /** El paso en el que está: el primero sin tildar. No hay forma de quedar
   *  trabado, porque tildar es a mano y no depende de que yo detecte nada. */
  const pasoActual = LA_RECETA.find((p) => !hechos.has(p.n)) ?? LA_RECETA[LA_RECETA.length - 1];
  const terminado = hechos.size === LA_RECETA.length;

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify({
        paso: pasoActual.n, hechos: [...hechos], paises,
      }));
    } catch { /* sigue en memoria */ }
  }, [hechos, paises, pasoActual.n]);

  /**
   * Y A LA BASE, porque los países no son solo del montaje.
   *
   * De acá sale la banda de CPM con la que se juzga si su costo está caro o
   * barato. Guardados solo en este navegador, el diagnóstico recibía una lista
   * vacía y caía en la referencia de México: se le decía «caro» o «barato» a
   * toda la cartera con la banda mexicana, en silencio.
   */
  useEffect(() => {
    if (!clienteId || paises.length === 0) return;
    void guardarMontaje(clienteId, { paises }).catch(() => {
      /* queda lo local: el montaje sigue, y la banda cae en la de referencia */
    });
  }, [clienteId, paises]);

  useEffect(() => { abajo.current?.scrollIntoView({ behavior: 'smooth' }); }, [mensajes]);

  const tildar = (n: number) => {
    setHechos((h) => {
      const nuevo = new Set(h);
      if (nuevo.has(n)) nuevo.delete(n); else nuevo.add(n);
      return nuevo;
    });
  };

  const preguntar = useCallback(async (texto: string) => {
    const t = texto.trim();
    if (!t || escribiendo) return;
    const mio: Mensaje = { id: `yo-${Date.now()}`, de: 'yo', texto: t };
    setMensajes((m) => [...m, mio]);
    setEntrada('');
    setEscribiendo(true);

    const historia = [...mensajes, mio].map((m) => ({
      role: m.de === 'yo' ? ('user' as const) : ('assistant' as const),
      content: m.texto,
    }));

    const id = `as-${Date.now()}`;
    setMensajes((m) => [...m, { id, de: 'asesor', texto: '' }]);

    try {
      let todo = '';
      for await (const trozo of streamText({
        feature: 'campana_chat', tarea: 'chat',
        systemInstruction: promptDelAsesor({ paises, paso: pasoActual.n }),
        messages: historia,
      })) {
        todo += trozo;
        setMensajes((m) => {
          const c = [...m];
          c[c.length - 1] = { ...c[c.length - 1], texto: todo };
          return c;
        });
      }
      if (!todo.trim()) {
        // Sin esto quedaba una burbuja vacía y parecía que no había contestado.
        setMensajes((m) => {
          const c = [...m];
          c[c.length - 1] = {
            ...c[c.length - 1],
            texto: 'No me llegó la respuesta. Vuelve a preguntarme.',
          };
          return c;
        });
      }
    } catch {
      setMensajes((m) => m.slice(0, -1));
      toast.error('No pude responderte. Vuelve a intentarlo en un momento.');
    } finally {
      setEscribiendo(false);
    }
  }, [mensajes, escribiendo, paises, pasoActual.n]);

  const revision = revisarPaises(paises);

  return (
    <div className="animate-in fade-in duration-500">
      <button onClick={onVolver}
        className="flex items-center gap-2 min-h-[44px] text-sm text-cream/55 hover:text-cream mb-4">
        <ArrowLeft className="w-4 h-4" /> Volver
      </button>

      {/* LO QUE SE VA A MONTAR, ANTES DE EMPEZAR ──────────────────────────
          Antes la primera pantalla preguntaba qué quería hacer. Ahora dice qué
          se hace: es lo que contrató. */}
      <div className="card-panel p-5 mb-4">
        <p className="text-sm font-bold text-cream mb-2">Lo que vamos a montar</p>
        <p className="text-sm text-cream/75 leading-relaxed">
          Una campaña, un conjunto, {CUANTOS_ANUNCIOS} anuncios.
          {' '}{PRESUPUESTO_DIARIO} USD al día, solo en Instagram, público abierto,
          directo a tu video. Hasta {PAISES_MAX} países del mismo grupo.
        </p>
        <p className="text-sm text-cream/55 mt-2 leading-relaxed">
          {loQueVaAGastar(DIAS_DE_APRENDIZAJE)}
        </p>
      </div>

      {/* LOS PAÍSES, CON LA REVISIÓN ───────────────────────────────────────
          Es la decisión que más plata mueve y la que nadie le explicaba. */}
      <div className="card-panel p-5 mb-4">
        <p className="text-sm font-bold text-cream mb-1">¿Dónde corre?</p>
        <p className="text-sm text-cream/65 leading-relaxed mb-3">
          Meta gasta donde llegar a una persona sale más barato, no donde vendes mejor.
          Por eso los países van de a grupos: mezclados, el presupuesto se va casi
          entero al más barato y te quedas sin saber si el otro funcionaba.
        </p>

        {GRUPOS_DE_PAISES.map((g) => (
          <div key={g.id} className="mb-3">
            <p className="text-sm font-bold text-gold/80">{g.nombre}</p>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {g.paises.map((p) => {
                const puesto = paises.includes(p);
                return (
                  <button key={p}
                    onClick={() => setPaises((ps) =>
                      puesto ? ps.filter((x) => x !== p) : [...ps, p])}
                    className={`min-h-[44px] px-3 rounded-xl text-sm font-bold border transition-all ${
                      puesto
                        ? 'border-success/45 bg-success/10 text-success'
                        : 'border-cream/15 text-cream/70'}`}>
                    {p}
                  </button>
                );
              })}
            </div>
            <p className="text-sm text-cream/50 mt-1.5 leading-relaxed">{g.nota}</p>
          </div>
        ))}

        {paises.length > 0 && (
          <p className={`text-sm mt-1 leading-relaxed ${
            revision.ok ? 'text-success' : 'text-gold'}`}>
            {revision.ok
              ? `Listo: ${paises.join(', ')}. Todos del mismo grupo.`
              : revision.aviso}
          </p>
        )}
      </div>

      {/* LOS NUEVE PASOS — SE TILDAN A MANO ───────────────────────────────
          Tildar no depende de que yo detecte nada en lo que escribió. Eso es
          lo que dejaba al cliente volviendo a hacer el mismo paso. */}
      <div className="card-panel p-5 mb-4">
        <div className="flex items-baseline justify-between gap-2 mb-3">
          <p className="text-sm font-bold text-cream">El montaje, paso por paso</p>
          <span className="text-sm text-cream/55">{hechos.size} de {LA_RECETA.length}</span>
        </div>

        {terminado && (
          <p className="text-sm text-success mb-3 leading-relaxed">
            Los nueve están. Ahora ve a Activación: ahí está la verificación final
            y el botón de encender.
          </p>
        )}

        <div className="space-y-2">
          {LA_RECETA.map((p) => {
            const hecho = hechos.has(p.n);
            const aqui = p.n === pasoActual.n && !terminado;
            return (
              <div key={p.n}
                className={`rounded-xl border p-3 ${
                  hecho ? 'border-success/25 bg-success/[0.04]'
                  : aqui ? 'border-gold/40 bg-gold/[0.05]'
                  : 'border-cream/12'}`}>
                <button onClick={() => tildar(p.n)}
                  className="w-full flex items-start gap-3 text-left min-h-[44px]">
                  {hecho
                    ? <Check className="w-5 h-5 text-success shrink-0 mt-0.5" />
                    : <Circle className="w-5 h-5 text-cream/30 shrink-0 mt-0.5" />}
                  <span className="flex-1">
                    <span className="block text-xs uppercase tracking-wider text-cream/45">
                      {p.donde}
                    </span>
                    <span className={`block text-sm font-bold ${
                      hecho ? 'text-cream/60' : 'text-cream'}`}>
                      {p.titulo}
                    </span>
                  </span>
                </button>

                {/* Abierto solo el que le toca: nueve pasos desplegados son una
                    pared, y una pared se posterga. */}
                {aqui && (
                  <div className="mt-2 pl-8 space-y-2">
                    <p className="text-sm text-cream/85 leading-relaxed">{p.queHacer}</p>
                    <p className="text-sm text-cream/60 leading-relaxed">{p.porQue}</p>
                    {p.queNoTocar && (
                      <p className="text-sm text-danger/85 leading-relaxed flex gap-2">
                        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{p.queNoTocar}</span>
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button onClick={() => tildar(p.n)}
                        className="min-h-[44px] px-4 rounded-xl border border-success/40 text-success text-sm font-bold">
                        Ya lo hice
                      </button>
                      <button
                        onClick={() => void preguntar(
                          `No me queda claro el paso ${p.n}: ${p.titulo}. Explícamelo.`)}
                        disabled={escribiendo}
                        className="min-h-[44px] px-4 rounded-xl border border-cream/20 text-cream/75 text-sm font-bold disabled:opacity-50">
                        No entiendo este paso
                      </button>
                      <BotonCopiar texto={`${p.donde}\n${p.titulo}\n\n${p.queHacer}`}
                        className="min-h-[44px] px-3 inline-flex items-center gap-1.5 text-sm font-bold text-gold" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* EL ASESOR ────────────────────────────────────────────────────────── */}
      <div className="card-panel p-5">
        <p className="text-sm font-bold text-cream mb-1">Pregúntame del montaje</p>
        <p className="text-sm text-cream/55 leading-relaxed mb-3">
          Solo del montaje. Lo demás tiene su lugar y te digo cuál es:
          tu oferta y tu precio en la mentoría, tus anuncios en «Tus 3 anuncios»,
          tus mensajes con Sofi, y cuándo apagar o hacer crecer en Activación.
        </p>

        {mensajes.length > 0 && (
          <div className="space-y-3 mb-3 max-h-[50vh] overflow-y-auto overscroll-contain">
            {mensajes.map((m) => (
              <div key={m.id} className={`flex ${m.de === 'yo' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] rounded-2xl px-4 py-3 ${
                  m.de === 'yo'
                    ? 'burbuja-mia rounded-br-sm'
                    : 'bg-surface border border-cream/8 rounded-bl-sm'}`}>
                  {m.texto ? (
                    <div className="prose prose-invert max-w-none text-sm text-cream/85 leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:my-1.5 [&_strong]:text-cream">
                      <Markdown>{m.texto}</Markdown>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse"
                          style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={abajo} />
          </div>
        )}

        <div className="flex gap-2">
          <input
            value={entrada}
            onChange={(e) => setEntrada(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void preguntar(entrada); } }}
            placeholder={`Sobre el paso ${pasoActual.n}…`}
            disabled={escribiendo}
            className="flex-1 min-h-[44px] bg-black/20 border border-gold/15 rounded-xl px-4 text-cream text-sm focus:border-gold/50 placeholder-cream/25" />
          <button onClick={() => void preguntar(entrada)} disabled={escribiendo || !entrada.trim()}
            className="min-h-[44px] px-4 rounded-xl btn-primary disabled:opacity-40">
            <Send className="w-4 h-4" />
          </button>
        </div>

        {mensajes.length === 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              '¿Por qué público abierto y no por intereses?',
              '¿Por qué no Facebook también?',
              '¿Puedo empezar con menos presupuesto?',
            ].map((q) => (
              <button key={q} onClick={() => void preguntar(q)}
                className="min-h-[44px] px-3 rounded-xl text-sm border border-cream/12 text-cream/70">
                {q}
              </button>
            ))}
          </div>
        )}

        <details className="mt-4">
          <summary className="text-sm font-bold text-cream/60 cursor-pointer min-h-[44px] flex items-center">
            ¿Y si pregunto otra cosa?
          </summary>
          <div className="mt-2 space-y-1.5">
            {A_DONDE_MANDAR.map((x) => (
              <p key={x.cuando} className="text-sm text-cream/65 leading-relaxed">
                <span className="text-cream/85">{x.cuando}</span> — {x.aDonde}
              </p>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}
