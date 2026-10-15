import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft, ChevronRight, Check, X, Plus, Trash2, Copy,
  Download, Loader2, Sparkles, ScanLine,
} from 'lucide-react';
import type { ProfileV2 } from '../../lib/supabase';
import { copiar as copiarTexto, NO_SE_PUDO_COPIAR } from '../../lib/copiar';
import {
  REGLAS, CASO_REAL, PLANTILLAS, completitud, marcasAlInstante, puntaje, cuentaDeAgenda, exportarFicha,
  type Ficha, type AnuncioEscrito, type ColorSemaforo, type MarcaDeRevision,
} from '../../lib/anunciosQueAgendan';
import {
  misFichas, guardarFicha, borrarFicha, fichaDesdeElADN, vinoDelADN,
  proponerVeintes, escribirAnuncios, revisarAnuncio,
  SinDatos, OFERTAS, DESTINOS, VOCES,
} from '../../lib/anunciosStorage';

/**
 * ANUNCIOS QUE AGENDAN — la herramienta de anuncios, entera.
 *
 * ═══ QUÉ REEMPLAZA ═══
 *
 * Al Constructor. Hacía una sola cosa —escribir— y el cliente llegaba a ella
 * sin saber qué separa un anuncio que trae agendas de uno que trae curiosos.
 * Así, lo que salía era correcto y olvidable, y la culpa parecía del generador.
 *
 * Ahora son seis pantallas y el orden importa: primero entiende las reglas con
 * el ejemplo al lado, después elige la estructura, y recién entonces escribe.
 * Con el revisor aparte, para los anuncios que ya tenía escritos.
 *
 * ═══ LAS DOS REVISIONES ═══
 *
 * Lo que se puede medir —los 125 caracteres del gancho, la palabra prohibida,
 * la condición personal que Meta frena— se marca MIENTRAS escribe, sin pedirle
 * nada a nadie. La lectura contra las veinte reglas tarda unos segundos y es
 * aparte, porque esa necesita criterio.
 *
 * Separarlas es lo que hace que la primera sirva: una revisión que tarda no se
 * pide mientras se escribe, y entonces los errores de medida se descubren
 * cuando el anuncio ya está armado.
 */

type Pestania = 'inicio' | 'aprende' | 'plantillas' | 'crear' | 'revisar' | 'probar';

const PESTANIAS: Array<[Pestania, string]> = [
  ['inicio', 'Empieza'], ['aprende', 'Aprende'], ['plantillas', 'Plantillas'],
  ['crear', 'Crear'], ['revisar', 'Revisar'], ['probar', 'Probar'],
];

const COLOR_CHIP: Record<ColorSemaforo, string> = {
  si: 'bg-success/15 text-success border-success/30',
  amb: 'bg-gold/15 text-gold border-gold/30',
  no: 'bg-danger/15 text-danger border-danger/30',
};
const ROTULO: Record<ColorSemaforo, string> = { si: 'Bien', amb: 'Revisar', no: 'Corregir' };

const idCorto = () => Math.random().toString(36).slice(2, 9);

/* ══════════════════ PIEZAS CHICAS ══════════════════ */

function Rotulo({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[15px] font-bold uppercase tracking-[0.2em] text-gold">{children}</p>
  );
}

function Chip({ c, children }: { c?: ColorSemaforo | 'oro'; children: React.ReactNode }) {
  const cls = c === 'oro'
    ? 'border-gold/40 text-gold'
    : c ? COLOR_CHIP[c] : 'border-cream/20 text-cream/70';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[15px] font-semibold whitespace-nowrap ${cls}`}>
      {children}
    </span>
  );
}

/** La regla de 1px en oro. El único lugar donde el oro es una línea. */
function Regla() { return <div className="h-px w-14 bg-gold" />; }

function Titulo({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-cream" style={{ fontFamily: 'var(--font-display)', fontSize: 30, lineHeight: 1.15, fontWeight: 500 }}>
      {children}
    </h2>
  );
}

/** Las dos columnas: lo que trae curiosos y lo que agenda. */
function Par({ tipo, items }: { tipo: 'no' | 'si'; items: Array<[string, string]> }) {
  const no = tipo === 'no';
  return (
    <div className={`rounded-2xl p-5 flex flex-col gap-3 ${no ? 'bg-danger/10' : 'bg-success/10'}`}>
      <div className={`flex items-center gap-2.5 text-[17px] font-bold ${no ? 'text-danger' : 'text-success'}`}>
        <span className={`w-7 h-7 rounded-full grid place-items-center ${no ? 'bg-danger text-ink' : 'bg-success text-ink'}`}>
          {no ? <X className="w-4 h-4" strokeWidth={3} /> : <Check className="w-4 h-4" strokeWidth={3} />}
        </span>
        {no ? 'Trae curiosos' : 'Agenda'}
      </div>
      {items.length === 0 && <p className="text-[15px] text-cream/55">Nada para marcar.</p>}
      {items.map(([frase, quien], i) => (
        <div key={i}>
          <p className={`text-[19px] leading-snug font-semibold text-cream ${no ? 'line-through decoration-danger decoration-2' : ''}`}>
            {frase}
          </p>
          <p className="text-[15px] text-cream/55 mt-0.5">{quien}</p>
        </div>
      ))}
    </div>
  );
}

function Marcas({ lista }: { lista: MarcaDeRevision[] }) {
  return (
    <div className="flex flex-col gap-2">
      {lista.map((m, i) => (
        <div key={i} className="flex gap-2.5 items-start text-[16px] text-cream/85">
          <Chip c={m.tipo}>{ROTULO[m.tipo]}</Chip>
          <span className="pt-1">{m.texto}</span>
        </div>
      ))}
    </div>
  );
}

function Anillo({ valor, pie }: { valor: number; pie: string }) {
  const k: ColorSemaforo = valor >= 80 ? 'si' : valor >= 55 ? 'amb' : 'no';
  const col = k === 'si' ? 'var(--success, #4E8C63)' : k === 'amb' ? 'var(--oro)' : 'var(--danger, #B23A2B)';
  const C = 2 * Math.PI * 26;
  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 64 64" className="w-16 h-16 -rotate-90" aria-hidden="true">
        <circle cx="32" cy="32" r="26" fill="none" strokeWidth="6" stroke="currentColor" className="text-cream/12" />
        <circle cx="32" cy="32" r="26" fill="none" strokeWidth="6" strokeLinecap="round"
          stroke={col} strokeDasharray={C.toFixed(1)} strokeDashoffset={(C * (1 - valor / 100)).toFixed(1)} />
      </svg>
      <div>
        <b className="block text-cream tabular-nums" style={{ fontFamily: 'var(--font-display)', fontSize: 26, lineHeight: 1 }}>{valor}</b>
        <span className="text-[15px] text-cream/55">{pie}</span>
      </div>
    </div>
  );
}

function Epic({ e }: { e: Partial<Record<'E' | 'P' | 'I' | 'C', string>> }) {
  const N = { E: 'Entretenido', P: 'Personalizado', I: 'Irrefutable', C: 'Claro' } as const;
  if (!e || Object.keys(e).length === 0) return null;
  return (
    <div className="flex gap-2 flex-wrap">
      {(['E', 'P', 'I', 'C'] as const).map((k) => {
        const v = e[k] ?? '';
        const c: ColorSemaforo | undefined = v === 'ok' ? 'si' : v === 'parcial' ? 'amb' : v === 'falla' ? 'no' : undefined;
        return <Chip key={k} c={c}>{N[k]}{v && v !== 'ok' ? ` · ${v}` : ''}</Chip>;
      })}
    </div>
  );
}

/** Cómo se ve en el feed, con el corte real de Meta a los 125. */
function Feed({ marca, lineas, titular }: { marca: string; lineas: string[]; titular: string }) {
  const t = lineas.join('\n');
  const visible = t.slice(0, 125);
  const resto = t.slice(125);
  const nombre = marca || 'Tu marca';
  return (
    <div className="rounded-xl border border-cream/12 overflow-hidden bg-surface">
      <div className="flex gap-2.5 items-center p-3">
        <span className="w-9 h-9 rounded-full border border-gold grid place-items-center text-[17px] font-bold text-gold shrink-0">
          {nombre.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <b className="block text-[16px] text-cream leading-tight truncate">{nombre}</b>
          <small className="text-[15px] text-cream/55">Publicidad</small>
        </div>
      </div>
      <p className="px-3 pb-3 text-[16px] leading-relaxed whitespace-pre-wrap break-words">
        <span className="text-cream underline decoration-gold decoration-2 underline-offset-4">{visible}</span>
        {resto && <><span className="text-cream/55"> … ver más</span><span className="text-cream/40">{'\n' + resto}</span></>}
      </p>
      <div className="h-[150px] grid place-items-center text-center p-4 text-[15px] text-cream/55 border-y border-cream/12">
        Video 4:5 · lo importante en los primeros 3 segundos, con subtítulos
      </div>
      <div className="flex gap-2.5 justify-between items-center p-3">
        <b className="text-[16px] text-cream break-words min-w-0">{titular || 'Titular'}</b>
        <span className="border border-cream/20 px-3 py-1.5 rounded-lg text-[15px] font-bold text-cream/85 whitespace-nowrap">Ver más</span>
      </div>
    </div>
  );
}

/* ══════════════════ LA PANTALLA ══════════════════ */

export default function AnunciosQueAgendan(
  { clienteId, perfil }: { clienteId?: string; perfil?: Partial<ProfileV2> },
) {
  const [pest, setPest] = useState<Pestania>('inicio');
  const [pagina, setPagina] = useState<Record<string, number>>({ aprende: 0, plantillas: 0, crear: 0, probar: 0 });
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [curId, setCurId] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardado, setGuardado] = useState('');
  const [trabajando, setTrabajando] = useState<string | null>(null);
  const [aviso, setAviso] = useState('');
  const [nota, setNota] = useState('');
  const reloj = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cur = fichas.find((f) => f.id === curId) ?? null;

  /* ── Traer lo guardado, o abrir una ficha con el ADN ── */
  useEffect(() => {
    let vivo = true;
    void (async () => {
      const ls = clienteId ? await misFichas(clienteId) : [];
      if (!vivo) return;
      if (ls.length) { setFichas(ls); setCurId(ls[0].id); }
      else {
        const nueva = fichaDesdeElADN(crypto.randomUUID(), perfil ?? null);
        setFichas([nueva]); setCurId(nueva.id);
      }
      setCargando(false);
    })();
    return () => { vivo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteId]);

  const guardarPronto = useCallback((f: Ficha) => {
    if (!clienteId) { setGuardado('Entra con tu cuenta para guardar'); return; }
    setGuardado('Guardando…');
    if (reloj.current) clearTimeout(reloj.current);
    reloj.current = setTimeout(() => {
      void guardarFicha(clienteId, f).then((ok) => setGuardado(ok ? 'Guardado' : 'No se pudo guardar'));
    }, 700);
  }, [clienteId]);

  const tocar = useCallback((cambio: Partial<Ficha>) => {
    setFichas((prev) => {
      const next = prev.map((f) => (f.id === curId ? { ...f, ...cambio } : f));
      const f = next.find((x) => x.id === curId);
      if (f) guardarPronto(f);
      return next;
    });
  }, [curId, guardarPronto]);

  const correr = useCallback(async (etiqueta: string, trabajo: () => Promise<void>) => {
    if (trabajando) return;
    setAviso(''); setTrabajando(etiqueta);
    try { await trabajo(); } catch (e) {
      setAviso(e instanceof SinDatos ? e.message
        : e instanceof Error && e.message ? e.message
        : 'Falló la conexión. Toca de nuevo.');
    } finally { setTrabajando(null); }
  }, [trabajando]);

  const avisar = (t: string) => { setNota(t); setTimeout(() => setNota(''), 2200); };

  // Con el helper de la casa y no con la API a mano: en Safari, y en cualquier
  // pestaña donde el portapapeles esté bloqueado, `navigator.clipboard` falla
  // en silencio. El helper cae a un respaldo que sí funciona ahí.
  const copiar = async (t: string) => {
    avisar(await copiarTexto(t) ? 'Copiado' : NO_SE_PUDO_COPIAR);
  };

  const descargar = (f: Ficha) => {
    const blob = new Blob([exportarFicha(f)], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anuncios-${(f.nombre || 'cliente').replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ── Cuántas pantallas tiene cada pestaña ── */
  const cuantas = useMemo<Record<string, number>>(() => ({
    aprende: REGLAS.length + 2, plantillas: PLANTILLAS.length + 1, crear: 4, probar: 3,
  }), []);

  const pasar = (d: number) => {
    const n = cuantas[pest];
    if (!n) return;
    setPagina((p) => ({ ...p, [pest]: Math.max(0, Math.min(n - 1, (p[pest] ?? 0) + d)) }));
    setAviso('');
  };

  if (cargando) {
    return (
      <div className="flex items-center gap-3 text-[17px] text-cream/70 p-10 justify-center">
        <Loader2 className="w-5 h-5 animate-spin" /> Trayendo tus fichas…
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto">
      {/* ── Las seis pestañas ── */}
      <nav className="flex gap-1 overflow-x-auto scrollbar-hide border-b border-gold/40 mb-6" aria-label="Secciones">
        {PESTANIAS.map(([id, label]) => (
          <button key={id} type="button" onClick={() => { setPest(id); setAviso(''); }}
            aria-current={pest === id ? 'page' : undefined}
            className={`px-3.5 py-3 text-[17px] font-bold whitespace-nowrap border-b-[3px] min-h-[44px] transition-colors ${
              pest === id ? 'text-cream border-cream' : 'text-cream/55 border-transparent hover:text-cream/80'}`}>
            {label}
          </button>
        ))}
        <span className="ml-auto self-center text-[15px] text-cream/50 pl-3 whitespace-nowrap">{guardado}</span>
      </nav>

      {trabajando && (
        <div className="rounded-xl bg-gold/10 border border-gold/30 px-4 py-3 mb-5 flex items-center gap-3 text-[16px] text-cream/90">
          <Loader2 className="w-5 h-5 animate-spin text-gold" /> {trabajando}…
        </div>
      )}
      {aviso && (
        <div className="rounded-xl bg-danger/10 border border-danger/30 px-4 py-3 mb-5 text-[16px] text-cream/90" role="alert">
          {aviso}
        </div>
      )}

      <div className="pb-28">
        {pest === 'inicio' && <Inicio ir={setPest} />}
        {pest === 'aprende' && <Aprende i={pagina.aprende ?? 0} ir={setPest} pasar={pasar}
          alFinal={() => setPagina((p) => ({ ...p, aprende: REGLAS.length + 1 }))} />}
        {pest === 'plantillas' && cur && (
          <Plantillas i={pagina.plantillas ?? 0}
            abrir={(j) => setPagina((p) => ({ ...p, plantillas: j }))}
            usar={(id) => {
              const ya = cur.plantillas.includes(id);
              const lista = ya ? cur.plantillas : [...cur.plantillas, id].slice(-3);
              tocar({ plantillas: lista });
              setPest('crear'); setPagina((p) => ({ ...p, crear: 2 }));
            }} />
        )}
        {pest === 'crear' && cur && (
          <Crear
            f={cur} fichas={fichas} i={pagina.crear ?? 0}
            irPaso={(j) => setPagina((p) => ({ ...p, crear: j }))}
            cambiar={setCurId} tocar={tocar}
            nueva={() => {
              const n = fichaDesdeElADN(crypto.randomUUID(), perfil ?? null);
              setFichas((p) => [n, ...p]); setCurId(n.id); guardarPronto(n);
              setPagina((p) => ({ ...p, crear: 0 }));
            }}
            eliminar={() => {
              if (fichas.length < 2) { setAviso('Es tu única ficha. Crea otra antes de eliminar esta.'); return; }
              void borrarFicha(cur.id);
              const resto = fichas.filter((x) => x.id !== cur.id);
              setFichas(resto); setCurId(resto[0]?.id ?? null);
            }}
            buscar20={() => correr('Buscando el 20', async () => {
              const vs = await proponerVeintes(cur);
              tocar({ veintes: [...cur.veintes, ...vs] });
            })}
            escribir={() => correr(`Escribiendo ${cur.plantillas.length} anuncio${cur.plantillas.length > 1 ? 's' : ''}`, async () => {
              const as = await escribirAnuncios(cur);
              tocar({ anuncios: [...as, ...cur.anuncios] });
              setPagina((p) => ({ ...p, crear: 3 }));
            })}
            copiar={copiar} descargar={() => descargar(cur)}
            aRevisar={(a) => { tocar({ rev: { texto: a.lineas.join('\n'), titular: a.titular, res: null } }); setPest('revisar'); }}
          />
        )}
        {pest === 'revisar' && cur && (
          <Revisar f={cur} tocar={tocar} copiar={copiar}
            revisar={() => correr('Revisando', async () => {
              const r = await revisarAnuncio(cur);
              tocar({ rev: { ...cur.rev, res: r } });
            })} />
        )}
        {pest === 'probar' && cur && (
          <Probar f={cur} i={pagina.probar ?? 0} tocar={tocar} />
        )}
      </div>

      {/* ── El paginador: una idea por pantalla ── */}
      {cuantas[pest] && (
        <div className="fixed left-0 right-0 bottom-0 z-30 bg-[var(--bg-root)] border-t border-gold/40 px-4 pt-3"
          style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}>
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-3 md:pb-0 pb-[4.5rem]">
            <button type="button" onClick={() => pasar(-1)} disabled={(pagina[pest] ?? 0) === 0}
              className="rounded-full border border-cream/20 px-4 min-h-[48px] flex items-center gap-2 text-[17px] font-bold text-cream disabled:opacity-40">
              <ChevronLeft className="w-5 h-5" /><span className="hidden sm:inline">Anterior</span>
            </button>
            <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
              <span className="text-[16px] font-bold text-cream/60 tabular-nums">
                {(pagina[pest] ?? 0) + 1} / {cuantas[pest]}
              </span>
              <span className="w-full max-w-[260px] h-[3px] bg-cream/15 rounded-full overflow-hidden">
                <i className="block h-full bg-gold transition-[width] duration-300"
                  style={{ width: `${Math.round((((pagina[pest] ?? 0) + 1) / cuantas[pest]) * 100)}%` }} />
              </span>
            </div>
            <button type="button" onClick={() => pasar(1)} disabled={(pagina[pest] ?? 0) >= cuantas[pest] - 1}
              className="rounded-full bg-gold text-ink px-4 min-h-[48px] flex items-center gap-2 text-[17px] font-bold disabled:opacity-40">
              <span className="hidden sm:inline">Siguiente</span><ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {nota && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-[7rem] z-40 bg-cream text-ink px-5 py-2.5 rounded-full text-[16px] font-bold">
          {nota}
        </div>
      )}
    </div>
  );
}

/* ══════════════════ EMPIEZA ══════════════════ */

function Inicio({ ir }: { ir: (p: Pestania) => void }) {
  const PASOS: Array<[string, string]> = [
    ['Frena el dedo con algo que le pasó', 'Un logro con su obstáculo, dicho directo, sin anunciarlo.'],
    ['Le deja una sola idea que no había visto', 'El 20. Sale de tu historia o de tu herramienta: por eso nadie te confunde con otro.'],
    ['Lo lleva al paso siguiente', 'Dice qué pasa al tocar. El resto lo cuenta el video, el mensaje o la página.'],
  ];
  const MOMENTOS: Array<[string, string, boolean]> = [
    ['No la vio', 'Todavía no sabe que puede lograrlo. Piezas de «¿sabías que…?».', false],
    ['Interesado', 'Consume tips y errores. Hay que romperle un mito.', false],
    ['Urgente', 'Ya lo decidió y busca quién se lo resuelva. A este se le pauta.', true],
  ];
  const PUERTAS: Array<[Pestania, string, string]> = [
    ['aprende', 'Aprende', '20 reglas con el ejemplo que agenda y el que trae curiosos. Y un caso real en el semáforo.'],
    ['plantillas', 'Plantillas', 'Siete estructuras. Cada una es un ángulo distinto.'],
    ['crear', 'Crear', 'Ficha, el 20, tres plantillas y los anuncios escritos.'],
    ['revisar', 'Revisar', 'Pegas un anuncio y te dice si agenda, con puntaje.'],
  ];
  return (
    <section className="flex flex-col gap-7">
      <div className="flex flex-col gap-2">
        <Rotulo>Método del momento exacto</Rotulo>
        <h1 className="text-cream" style={{ fontFamily: 'var(--font-display)', fontSize: 38, lineHeight: 1.1, fontWeight: 500 }}>
          Un anuncio que agenda hace tres cosas.
        </h1>
      </div>
      <div className="flex flex-col">
        {PASOS.map(([t, d], i) => (
          <div key={t} className={`grid grid-cols-[52px_1fr] gap-x-4 gap-y-1 py-4 ${i ? 'border-t border-cream/12' : ''}`}>
            <span className="w-11 h-11 rounded-full border border-gold grid place-items-center text-[19px] font-bold text-gold row-span-2">{i + 1}</span>
            <h3 className="text-[21px] font-bold text-cream">{t}</h3>
            <p className="text-[17px] text-cream/65">{d}</p>
          </div>
        ))}
      </div>
      <Regla />
      <div className="flex flex-col gap-3">
        <p className="text-cream" style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 500 }}>
          Tu público está en uno de tres momentos.
        </p>
        <p className="text-[19px] text-cream/65 max-w-[58ch]">Escribes para los tres. Pautas solo para el urgente.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {MOMENTOS.map(([t, d, on]) => (
          <div key={t} className={`card-panel p-5 flex flex-col gap-2 ${on ? 'border-gold/50' : ''}`}>
            <b className="text-[21px] font-bold text-cream">{t}</b>
            <p className="text-[17px] text-cream/65">{d}</p>
            {on && <span className="self-start"><Chip c="si">Se pauta</Chip></span>}
          </div>
        ))}
      </div>
      <Regla />
      <p className="text-cream" style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 500 }}>Por dónde empezar</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {PUERTAS.map(([id, t, d]) => (
          <button key={id} type="button" onClick={() => ir(id)}
            className="card-panel p-5 text-left flex flex-col gap-2 hover:border-gold/40 transition-colors min-h-[44px]">
            <b className="text-[20px] font-bold text-cream">{t} →</b>
            <span className="text-[16px] text-cream/65">{d}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════ APRENDE ══════════════════ */

function Aprende(
  { i, ir, pasar, alFinal }:
  { i: number; ir: (p: Pestania) => void; pasar: (d: number) => void; alFinal: () => void },
) {
  if (i === 0) {
    return (
      <section className="flex flex-col gap-7">
        <Rotulo>Aprende</Rotulo>
        <h1 className="text-cream" style={{ fontFamily: 'var(--font-display)', fontSize: 38, lineHeight: 1.1, fontWeight: 500 }}>
          Lo que agenda y lo que trae curiosos.
        </h1>
        <p className="text-[19px] text-cream/65 max-w-[58ch]">
          Una regla por pantalla: a un lado lo que no funciona, al otro lo que sí, y abajo por qué.
          La última pantalla analiza once anuncios reales.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Par tipo="no" items={[
            ['Dolor y miseria en el gancho', 'Atrae a quien está hundido'],
            ['Explicar el método o las razones', 'Lo mira el que quiere aprender gratis'],
            ['Tu historia antes de que se sienta nombrado', 'Habla de ti, no de él'],
          ]} />
          <Par tipo="si" items={[
            ['Un logro con su obstáculo', 'Atrae al que ya está avanzando'],
            ['Una idea nueva atada a tu historia', 'El 20 que solo tú puedes decir'],
            ['Un llamado que dice qué pasa al tocar', 'Lleva al paso siguiente'],
          ]} />
        </div>
        <div className="flex gap-3 flex-wrap">
          <button type="button" onClick={() => pasar(1)}
            className="rounded-full bg-gold text-ink px-5 min-h-[48px] text-[17px] font-bold">Primera regla →</button>
          <button type="button" onClick={alFinal}
            className="rounded-full border border-cream/20 px-5 min-h-[48px] text-[17px] font-bold text-cream">Ver el caso real</button>
        </div>
      </section>
    );
  }

  if (i === REGLAS.length + 1) {
    const cnt = { si: 0, amb: 0, no: 0 } as Record<ColorSemaforo, number>;
    CASO_REAL.forEach((s) => { cnt[s.color]++; });
    return (
      <section className="flex flex-col gap-6">
        <Rotulo>Caso real · Tu Clínica Digital</Rotulo>
        <Titulo>Once anuncios de una mentoría, en el semáforo.</Titulo>
        <div className="flex gap-2 flex-wrap">
          <Chip c="si">{cnt.si} salen</Chip>
          <Chip c="amb">{cnt.amb} con un arreglo</Chip>
          <Chip c="no">{cnt.no} fuera del frío</Chip>
        </div>
        <p className="text-[19px] text-cream/65 max-w-[58ch]">
          Toca cada uno para ver por qué y el arreglo. Las mismas reglas valen para cualquier rubro.
        </p>
        <div className="flex flex-col">
          {CASO_REAL.map((s, j) => (
            <details key={j} className="border-t border-cream/12 last:border-b">
              <summary className="list-none cursor-pointer grid grid-cols-[auto_1fr_auto] gap-x-4 items-center py-4 min-h-[44px]">
                <span className={`w-4 h-4 rounded-full ${s.color === 'si' ? 'bg-success' : s.color === 'amb' ? 'bg-gold' : 'bg-danger'}`} aria-hidden="true" />
                <b className="text-[18px] font-bold text-cream leading-snug">
                  {s.n === 'Control' ? 'Control' : `Anuncio ${s.n}`} · {s.titulo}
                </b>
                <Chip c={s.color}>{s.color === 'si' ? 'Sale' : s.color === 'amb' ? 'Arreglo' : 'Fuera del frío'}</Chip>
              </summary>
              <div className="pb-5 pl-9 pr-1 flex flex-col gap-2.5">
                <p className="text-[19px] font-semibold text-cream leading-snug">«{s.gancho}»</p>
                <p className="text-[17px] text-cream/75">{s.porque}</p>
                <p className="text-[17px] text-cream/85 border-l-2 border-gold pl-3.5">{s.arreglo}</p>
              </div>
            </details>
          ))}
        </div>
        <div>
          <button type="button" onClick={() => ir('crear')}
            className="rounded-full bg-gold text-ink px-5 min-h-[48px] text-[17px] font-bold">Crear con esto →</button>
        </div>
      </section>
    );
  }

  const r = REGLAS[i - 1];
  return (
    <section className="flex flex-col gap-6">
      <div className="flex gap-3 items-center flex-wrap">
        <Chip c="oro">{r.fuente}</Chip>
        <span className="text-[15px] text-cream/55">Regla {i} de {REGLAS.length}</span>
      </div>
      <Titulo>{r.titulo}</Titulo>
      <div className="grid gap-4 sm:grid-cols-2">
        <Par tipo="no" items={r.mal} />
        <Par tipo="si" items={r.bien} />
      </div>
      <div className="border-t border-gold pt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 items-baseline">
        <b className="text-[15px] font-bold uppercase tracking-[0.1em] text-gold">Por qué</b>
        <p className="text-[19px] text-cream/90 leading-relaxed">{r.porque}</p>
      </div>
    </section>
  );
}

/* ══════════════════ PLANTILLAS ══════════════════ */

function Plantillas(
  { i, abrir, usar }: { i: number; abrir: (j: number) => void; usar: (id: string) => void },
) {
  if (i === 0) {
    return (
      <section className="flex flex-col gap-6">
        <Rotulo>Plantillas</Rotulo>
        <h1 className="text-cream" style={{ fontFamily: 'var(--font-display)', fontSize: 38, lineHeight: 1.1, fontWeight: 500 }}>
          Siete estructuras, siete ángulos.
        </h1>
        <p className="text-[19px] text-cream/65 max-w-[58ch]">
          Para un test eliges tres distintas. Cada anuncio habla desde otro momento del mismo cliente,
          y los resultados te dicen cuál agenda.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {PLANTILLAS.map((p, j) => (
            <button key={p.id} type="button" onClick={() => abrir(j + 1)}
              className="card-panel p-5 text-left flex flex-col gap-2 hover:border-gold/40 transition-colors">
              <span className="text-[15px] font-bold text-gold">{p.origen} · {p.estado}</span>
              <b className="text-[20px] font-bold text-cream leading-snug">{p.nombre}</b>
              <span className="text-[16px] text-cream/65">{p.cuando}</span>
            </button>
          ))}
        </div>
      </section>
    );
  }
  const p = PLANTILLAS[i - 1];
  return (
    <section className="flex flex-col gap-6">
      <div className="flex gap-2 items-center flex-wrap">
        <Chip c="oro">{p.origen}</Chip>
        <Chip>Público: {p.estado}</Chip>
        <span className="text-[15px] text-cream/55">Plantilla {i} de {PLANTILLAS.length}</span>
      </div>
      <Titulo>{p.nombre}</Titulo>
      <p className="text-[19px] text-cream/65 max-w-[58ch]">Úsala cuando: {p.cuando}</p>
      <div className="flex flex-col">
        {p.pasos.map(([t, eg], j) => (
          <div key={j} className={`grid grid-cols-[52px_1fr] gap-x-4 gap-y-1 py-4 ${j ? 'border-t border-cream/12' : ''}`}>
            <span className="w-11 h-11 rounded-full border border-gold grid place-items-center text-[19px] font-bold text-gold row-span-2">{j + 1}</span>
            <h3 className="text-[20px] font-bold text-cream">{t}</h3>
            <p className="text-[17px] text-cream/85 border-l-2 border-gold pl-3.5">{eg}</p>
          </div>
        ))}
      </div>
      <div>
        <button type="button" onClick={() => usar(p.id)}
          className="rounded-full bg-gold text-ink px-5 min-h-[48px] text-[17px] font-bold">Usar esta en Crear →</button>
      </div>
    </section>
  );
}

/* ══════════════════ CREAR ══════════════════ */

const PASOS_CREAR = ['Ficha', 'El 20', 'Plantillas', 'Anuncios'];

function Crear(props: {
  f: Ficha; fichas: Ficha[]; i: number;
  irPaso: (j: number) => void; cambiar: (id: string) => void;
  tocar: (c: Partial<Ficha>) => void;
  nueva: () => void; eliminar: () => void;
  buscar20: () => void; escribir: () => void;
  copiar: (t: string) => void; descargar: () => void;
  aRevisar: (a: AnuncioEscrito) => void;
}) {
  const { f, fichas, i, irPaso, cambiar, tocar, nueva, eliminar, buscar20, escribir, copiar, descargar, aRevisar } = props;
  const k = completitud(f);
  const hechos = [k.hechos >= 5, f.sel20.length > 0, f.plantillas.length > 0, f.anuncios.length > 0];
  const delADN = vinoDelADN(f);

  const Campo = (
    { campo, label, ayuda, area, ph, clave }:
    { campo: keyof Ficha; label: string; ayuda?: string; area?: boolean | 'ancho'; ph?: string; clave?: boolean },
  ) => (
    <label className={`flex flex-col gap-1.5 min-w-0 ${area === 'ancho' ? 'sm:col-span-2' : ''}`}>
      <span className="text-[18px] font-bold text-cream flex gap-2 items-center flex-wrap">
        {label}
        {clave && <i className="not-italic text-[15px] font-bold uppercase tracking-[0.08em] text-gold">Clave</i>}
      </span>
      {ayuda && <em className="not-italic text-[16px] text-cream/55">{ayuda}</em>}
      {area ? (
        <textarea rows={3} value={String(f[campo] ?? '')} placeholder={ph}
          onChange={(e) => tocar({ [campo]: e.target.value } as Partial<Ficha>)}
          className="rounded-xl bg-surface border border-cream/15 px-3.5 py-3 text-[17px] text-cream leading-relaxed focus:border-gold outline-none resize-y" />
      ) : (
        <input value={String(f[campo] ?? '')} placeholder={ph}
          onChange={(e) => tocar({ [campo]: e.target.value } as Partial<Ficha>)}
          className="rounded-xl bg-surface border border-cream/15 px-3.5 py-3 text-[17px] text-cream focus:border-gold outline-none min-h-[48px]" />
      )}
    </label>
  );

  const Elegir = ({ campo, label, opciones }: { campo: keyof Ficha; label: string; opciones: readonly string[] }) => (
    <label className="flex flex-col gap-1.5 min-w-0">
      <span className="text-[18px] font-bold text-cream">{label}</span>
      <select value={String(f[campo] ?? '')} onChange={(e) => tocar({ [campo]: e.target.value } as Partial<Ficha>)}
        className="rounded-xl bg-surface border border-cream/15 px-3.5 py-3 text-[17px] text-cream focus:border-gold outline-none min-h-[48px]">
        {opciones.map((v) => <option key={v} value={v}>{v}</option>)}
      </select>
    </label>
  );

  const pasos = (
    <nav className="flex items-center overflow-x-auto scrollbar-hide mb-2" aria-label="Pasos">
      {PASOS_CREAR.map((t, j) => (
        <span key={t} className="flex items-center">
          {j > 0 && <span className="w-7 h-px bg-gold mx-1.5 shrink-0" />}
          <button type="button" onClick={() => irPaso(j)} aria-current={j === i ? 'step' : undefined}
            className={`flex items-center gap-2.5 px-1 py-1.5 text-[17px] font-bold whitespace-nowrap min-h-[44px] ${j === i ? 'text-cream' : 'text-cream/55'}`}>
            <i className={`w-9 h-9 rounded-full border grid place-items-center not-italic ${
              j === i ? 'bg-gold border-gold text-ink' : hechos[j] ? 'bg-success/20 border-transparent text-success' : 'border-gold text-gold'}`}>
              {hechos[j] && j !== i ? <Check className="w-4 h-4" strokeWidth={3} /> : j + 1}
            </i>
            {t}
          </button>
        </span>
      ))}
    </nav>
  );

  /* ── Paso 1 · La ficha ── */
  if (i === 0) {
    return (
      <section className="flex flex-col gap-6">
        {pasos}
        <Titulo>¿Para quién es el anuncio?</Titulo>

        <div className="flex gap-3 items-end flex-wrap">
          <label className="flex flex-col gap-1.5 flex-1 min-w-[240px]">
            <span className="text-[18px] font-bold text-cream">Ficha</span>
            <select value={f.id} onChange={(e) => cambiar(e.target.value)}
              className="rounded-xl bg-surface border border-cream/15 px-3.5 py-3 text-[17px] text-cream focus:border-gold outline-none min-h-[48px]">
              {fichas.map((x) => <option key={x.id} value={x.id}>{x.nombre || 'Ficha sin nombre'}</option>)}
            </select>
          </label>
          <button type="button" onClick={nueva}
            className="rounded-full border border-cream/20 px-5 min-h-[48px] text-[17px] font-bold text-cream flex items-center gap-2">
            <Plus className="w-4 h-4" /> Otra ficha
          </button>
        </div>

        {delADN.length > 0 && (
          <div className="rounded-2xl border border-dashed border-gold/50 px-4 py-3.5 text-[16px] text-cream/85">
            Ya traje de tu ADN: <b className="text-cream">{delADN.join(', ')}</b>. Corrige lo que quieras decir distinto en el anuncio.
          </div>
        )}

        <div className="flex items-center gap-3.5 flex-wrap">
          <b className="text-cream" style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600 }}>
            Ficha {k.hechos} / {k.total}
          </b>
          <span className="flex-1 min-w-[160px] max-w-[320px] h-2 bg-cream/15 rounded-full overflow-hidden">
            <i className="block h-full bg-gold rounded-full transition-[width] duration-300" style={{ width: `${Math.round((k.hechos / k.total) * 100)}%` }} />
          </span>
          {k.faltan.length
            ? <span className="text-[15px] text-cream/55">Falta: {k.faltan.join(', ')}</span>
            : <Chip c="si">Completa</Chip>}
        </div>

        <div className="flex flex-col gap-4 pt-5 border-t border-cream/12">
          <h3 className="text-[21px] font-bold text-cream flex gap-3 items-baseline flex-wrap">
            La oferta <small className="text-[17px] font-normal text-cream/55">define el llamado y si va el precio</small>
          </h3>
          <div className="grid gap-5 sm:grid-cols-2">
            <Campo campo="nombre" label="Marca" ayuda="Como aparece en el anuncio." ph="Nombre y apellido o marca" />
            <Campo campo="rubro" label="A qué se dedica" ayuda="Lo que vende, en una línea." ph="Mentoría de 90 días para…" clave />
            <Elegir campo="oferta" label="Tipo de oferta" opciones={OFERTAS} />
            <Elegir campo="destino" label="Adónde lleva el anuncio" opciones={DESTINOS} />
            {f.destino === DESTINOS[1] && (
              <Campo campo="palabra" label="Palabra clave" ayuda="Una sola, corta, en mayúsculas." ph="CLAVE" />
            )}
            <Elegir campo="voz" label="Cómo les habla" opciones={VOCES} />
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-5 border-t border-cream/12">
          <h3 className="text-[21px] font-bold text-cream flex gap-3 items-baseline flex-wrap">
            Su cliente <small className="text-[17px] font-normal text-cream/55">por lo que hace, nunca por la profesión</small>
          </h3>
          <div className="grid gap-5 sm:grid-cols-2">
            <Campo campo="avatar" label="Cliente ideal" ayuda="Qué hizo en los últimos 3 meses." area
              ph="Lo ascendieron este año y sigue haciendo el trabajo de antes." clave />
            <Campo campo="avance" label="Avance" ayuda="Un logro que ya tuvo: un hecho, no un estado." area
              ph="Corrió publicidad. Llenó la agenda." clave />
            <Campo campo="obstaculo" label="Obstáculo" ayuda="Lo que le aparece justo ahí." area clave />
            <Campo campo="error" label="Error de la mayoría" ayuda="Lo que casi todos hacen para resolverlo." area clave />
            <Campo campo="frases" label="Frases de sus clientes" ayuda="Textuales, entre comillas. El copy se encuentra acá."
              area="ancho" ph="«Me ascendieron y ahora tengo dos trabajos.»" />
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-5 border-t border-cream/12">
          <h3 className="text-[21px] font-bold text-cream flex gap-3 items-baseline flex-wrap">
            Lo que solo tiene esta marca <small className="text-[17px] font-normal text-cream/55">de acá sale el 20</small>
          </h3>
          <div className="grid gap-5 sm:grid-cols-2">
            <Campo campo="metodo" label="Método con nombre propio" area clave />
            <Campo campo="propio" label="Herramientas e historias propias"
              ayuda="Momentos con fecha, frases, objetos, herramientas con nombre." area clave />
            <Campo campo="prueba" label="Prueba real" ayuda="De X a Y, sin nombre del cliente." area clave />
            <Campo campo="cta" label="Qué pasa al tocar" area ph="Toca abajo, mira el video y responde 4 preguntas." />
            <Campo campo="cupos" label="Cupos y fechas reales" ayuda="Solo lo que es verdad." area="ancho" />
          </div>
        </div>

        <div className="flex gap-3 items-center flex-wrap">
          <button type="button" onClick={() => irPaso(1)}
            className="rounded-full bg-gold text-ink px-5 min-h-[48px] text-[17px] font-bold">Buscar el 20 →</button>
          <button type="button" onClick={eliminar}
            className="text-[17px] font-bold text-cream/60 underline underline-offset-4 px-2 min-h-[44px] flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> Eliminar esta ficha
          </button>
        </div>
      </section>
    );
  }

  /* ── Paso 2 · El 20 ── */
  if (i === 1) {
    const alternar = (id: string) => {
      const on = f.sel20.includes(id);
      const sel = on ? f.sel20.filter((x) => x !== id) : [...f.sel20, id].slice(-3);
      tocar({ sel20: sel });
    };
    return (
      <section className="flex flex-col gap-6">
        {pasos}
        <Titulo>Primero la idea. Después el gancho.</Titulo>
        <p className="text-[19px] text-cream/65 max-w-[58ch]">
          Julio piensa primero el 20 y recién después arma el gancho. Elige hasta tres:
          cada una puede ir a un anuncio distinto.
        </p>
        <div className="flex gap-3 items-center flex-wrap">
          <button type="button" onClick={buscar20}
            className="rounded-full bg-gold text-ink px-5 min-h-[48px] text-[17px] font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> {f.veintes.length ? 'Proponer 6 más' : 'Proponer 6 ideas'}
          </button>
          <button type="button"
            onClick={() => tocar({ veintes: [...f.veintes, { id: idCorto(), texto: '', de: '', porque: '' }] })}
            className="rounded-full border border-cream/20 px-5 min-h-[48px] text-[17px] font-bold text-cream">Escribir la mía</button>
          <span className="text-[15px] text-cream/55">{f.sel20.length} de 3 elegidas</span>
        </div>
        {f.veintes.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {f.veintes.map((v) => {
              const on = f.sel20.includes(v.id);
              return (
                <div key={v.id}
                  className={`card-panel p-5 flex flex-col gap-2 ${on ? 'border-gold/60' : ''}`}>
                  <button type="button" onClick={() => alternar(v.id)} aria-pressed={on}
                    className="text-left text-[15px] font-bold text-gold min-h-[44px] flex items-center">
                    {on ? 'Elegida' : 'Tocar para elegir'}
                  </button>
                  {v.texto ? (
                    <span className="text-cream" style={{ fontFamily: 'var(--font-display)', fontSize: 20, lineHeight: 1.35, fontWeight: 600 }}>
                      {v.texto}
                    </span>
                  ) : (
                    <textarea rows={3} value={v.texto} placeholder="Tu idea, en una frase corta"
                      onChange={(e) => tocar({ veintes: f.veintes.map((x) => (x.id === v.id ? { ...x, texto: e.target.value } : x)) })}
                      className="rounded-xl bg-surface border border-cream/15 px-3.5 py-3 text-[17px] text-cream focus:border-gold outline-none" />
                  )}
                  {v.de && <span className="text-[16px] text-cream/65">Sale de: {v.de}</span>}
                  {v.porque && <span className="text-[16px] text-cream/65">Da vuelta: {v.porque}</span>}
                  <button type="button"
                    onClick={() => tocar({ veintes: f.veintes.filter((x) => x.id !== v.id), sel20: f.sel20.filter((x) => x !== v.id) })}
                    className="self-start text-[16px] text-cream/50 underline underline-offset-4 min-h-[44px]">Quitar</button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gold/50 p-7 flex flex-col gap-3 items-start">
            <p className="text-cream" style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 500 }}>Todavía no hay ideas.</p>
            <p className="text-[17px] text-cream/65">Se proponen seis a partir del material propio de la ficha.</p>
          </div>
        )}
        <div>
          <button type="button" onClick={() => irPaso(2)}
            className="rounded-full bg-gold text-ink px-5 min-h-[48px] text-[17px] font-bold">Elegir plantillas →</button>
        </div>
      </section>
    );
  }

  /* ── Paso 3 · Las plantillas ── */
  if (i === 2) {
    const alternar = (id: string) => {
      const on = f.plantillas.includes(id);
      tocar({ plantillas: on ? f.plantillas.filter((x) => x !== id) : [...f.plantillas, id].slice(-3) });
    };
    return (
      <section className="flex flex-col gap-6">
        {pasos}
        <Titulo>Elige hasta tres ángulos.</Titulo>
        <p className="text-[19px] text-cream/65 max-w-[58ch]">
          Distintos entre sí. Se escribe un anuncio por cada uno.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {PLANTILLAS.map((p) => {
            const on = f.plantillas.includes(p.id);
            return (
              <button key={p.id} type="button" onClick={() => alternar(p.id)} aria-pressed={on}
                className={`card-panel p-5 text-left flex flex-col gap-2 transition-colors ${on ? 'border-gold/60' : 'hover:border-gold/40'}`}>
                <span className="text-[15px] font-bold text-gold">{on ? 'Elegida · ' : ''}{p.origen} · {p.estado}</span>
                <b className="text-[20px] font-bold text-cream leading-snug">{p.nombre}</b>
                <span className="text-[16px] text-cream/65">{p.cuando}</span>
              </button>
            );
          })}
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          <button type="button" onClick={escribir} disabled={!f.plantillas.length}
            className="rounded-full bg-gold text-ink px-5 min-h-[48px] text-[17px] font-bold disabled:opacity-40 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Escribir {f.plantillas.length} anuncio{f.plantillas.length === 1 ? '' : 's'} →
          </button>
          <span className="text-[15px] text-cream/55">{f.plantillas.length} de 3</span>
        </div>
      </section>
    );
  }

  /* ── Paso 4 · Los anuncios ── */
  return (
    <section className="flex flex-col gap-6">
      {pasos}
      <div className="flex justify-between items-center gap-3 flex-wrap">
        <Titulo>Anuncios</Titulo>
        <div className="flex gap-2 flex-wrap">
          <button type="button" onClick={escribir}
            className="rounded-full bg-gold text-ink px-5 min-h-[48px] text-[17px] font-bold">Escribir otra tanda</button>
          {f.anuncios.length > 0 && (
            <button type="button" onClick={descargar}
              className="rounded-full border border-cream/20 px-5 min-h-[48px] text-[17px] font-bold text-cream flex items-center gap-2">
              <Download className="w-4 h-4" /> Descargar todo
            </button>
          )}
        </div>
      </div>
      {f.anuncios.length ? f.anuncios.map((a, j) => (
        <TarjetaAnuncio key={a.id} f={f} a={a} j={j} tocar={tocar} copiar={copiar} aRevisar={aRevisar} />
      )) : (
        <div className="rounded-2xl border border-dashed border-gold/50 p-7 flex flex-col gap-3 items-start">
          <p className="text-cream" style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 500 }}>Acá aparecen los anuncios.</p>
          <p className="text-[17px] text-cream/65">Completa la ficha, elige el 20 y hasta tres plantillas.</p>
          <button type="button" onClick={() => irPaso(2)}
            className="rounded-full border border-cream/20 px-5 min-h-[48px] text-[17px] font-bold text-cream">Elegir plantillas</button>
        </div>
      )}
    </section>
  );
}

function TarjetaAnuncio(
  { f, a, j, tocar, copiar, aRevisar }:
  { f: Ficha; a: AnuncioEscrito; j: number; tocar: (c: Partial<Ficha>) => void;
    copiar: (t: string) => void; aRevisar: (a: AnuncioEscrito) => void },
) {
  const pl = PLANTILLAS.find((p) => p.id === a.plantilla);
  const marcas = marcasAlInstante(f, a.lineas, a.titular);
  const cambiar = (c: Partial<AnuncioEscrito>) =>
    tocar({ anuncios: f.anuncios.map((x) => (x.id === a.id ? { ...x, ...c } : x)) });

  return (
    <article className="card-panel p-5 flex flex-col gap-5">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <Chip c="oro">{pl ? pl.nombre : 'Anuncio'}</Chip>
        <Epic e={a.epic} />
      </div>

      {a.veinte && (
        <div className="rounded-2xl border border-gold px-5 py-4 flex flex-col gap-1.5">
          <Rotulo>El 20</Rotulo>
          <p className="text-cream" style={{ fontFamily: 'var(--font-display)', fontSize: 24, lineHeight: 1.3, fontWeight: 500 }}>
            {a.veinte}
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)] items-start">
        <div className="flex flex-col gap-4 min-w-0">
          <label className="flex flex-col gap-1.5">
            <span className="text-[18px] font-bold text-cream">Texto para Meta</span>
            <em className="not-italic text-[16px] text-cream/55">
              Una idea por renglón. Lo subrayado es lo que se ve sin tocar «ver más».
            </em>
            <textarea rows={6} value={a.lineas.join('\n')}
              onChange={(e) => cambiar({ lineas: e.target.value.split('\n') })}
              className="rounded-xl bg-surface border border-cream/15 px-3.5 py-3 text-[17px] text-cream leading-relaxed focus:border-gold outline-none resize-y" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[18px] font-bold text-cream">Titular</span>
            <input value={a.titular} onChange={(e) => cambiar({ titular: e.target.value })}
              className="rounded-xl bg-surface border border-cream/15 px-3.5 py-3 text-[17px] text-cream focus:border-gold outline-none min-h-[48px]" />
          </label>
          <div className="flex gap-2 flex-wrap">
            <button type="button" onClick={() => copiar(a.lineas.join('\n'))}
              className="rounded-full border border-cream/20 px-4 min-h-[48px] text-[17px] font-bold text-cream flex items-center gap-2">
              <Copy className="w-4 h-4" /> Copiar texto
            </button>
            <button type="button"
              onClick={() => copiar(a.pasos.map(([p, t]) => `${p}: ${t}`).join('\n'))}
              className="rounded-full border border-cream/20 px-4 min-h-[48px] text-[17px] font-bold text-cream">Copiar guion</button>
            <button type="button" onClick={() => aRevisar(a)}
              className="rounded-full border border-cream/20 px-4 min-h-[48px] text-[17px] font-bold text-cream flex items-center gap-2">
              <ScanLine className="w-4 h-4" /> Revisar a fondo
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-3.5 min-w-0">
          <Anillo valor={puntaje(marcas)} pie="de 100 en medidas y palabras" />
          <Feed marca={f.nombre} lineas={a.lineas} titular={a.titular} />
          <Marcas lista={marcas} />
        </div>
      </div>

      {a.pasos.length > 0 && (
        <div>
          <Rotulo>Guion a cámara</Rotulo>
          <div className="flex flex-col mt-1.5">
            {a.pasos.map(([p, t], n) => (
              <div key={n} className={`grid sm:grid-cols-[160px_minmax(0,1fr)] gap-x-4 gap-y-1 py-3 ${n ? 'border-t border-cream/12' : ''}`}>
                <b className="text-[16px] font-bold text-gold">{p}</b>
                <span className="text-[17px] text-cream/85">{t}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {a.visual && <p className="border-l-2 border-gold pl-4 text-[17px] text-cream/65"><b className="text-cream">Cómo grabarlo:</b> {a.visual}</p>}
      {a.nota && <p className="border-l-2 border-gold pl-4 text-[17px] text-cream/65"><b className="text-cream">Lo que más falta:</b> {a.nota}</p>}
      {a.pendiente && <p className="border-l-2 border-gold pl-4 text-[17px] text-cream/65"><b className="text-cream">Antes de publicar:</b> {a.pendiente}</p>}

      <div>
        <button type="button" onClick={() => tocar({ anuncios: f.anuncios.filter((x) => x.id !== a.id) })}
          className="text-[16px] text-cream/50 underline underline-offset-4 min-h-[44px] flex items-center gap-2">
          <Trash2 className="w-4 h-4" /> Quitar este anuncio {j + 1 > 0 ? '' : ''}
        </button>
      </div>
    </article>
  );
}

/* ══════════════════ REVISAR ══════════════════ */

function Revisar(
  { f, tocar, copiar, revisar }:
  { f: Ficha; tocar: (c: Partial<Ficha>) => void; copiar: (t: string) => void; revisar: () => void },
) {
  const lineas = f.rev.texto.split('\n').filter((x) => x.trim());
  const res = f.rev.res;
  const marcas = marcasAlInstante(f, lineas, f.rev.titular);

  return (
    <section className="flex flex-col gap-6">
      <Rotulo>Revisar · {f.nombre || 'Sin marca'}</Rotulo>
      <Titulo>Pega un anuncio. Te digo si agenda.</Titulo>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)] items-start">
        <div className="flex flex-col gap-4 min-w-0">
          <label className="flex flex-col gap-1.5">
            <span className="text-[18px] font-bold text-cream">Texto</span>
            <textarea rows={7} value={f.rev.texto} placeholder="Pega acá el texto del anuncio"
              onChange={(e) => tocar({ rev: { ...f.rev, texto: e.target.value } })}
              className="rounded-xl bg-surface border border-cream/15 px-3.5 py-3 text-[17px] text-cream leading-relaxed focus:border-gold outline-none resize-y" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[18px] font-bold text-cream">Titular</span>
            <input value={f.rev.titular} onChange={(e) => tocar({ rev: { ...f.rev, titular: e.target.value } })}
              className="rounded-xl bg-surface border border-cream/15 px-3.5 py-3 text-[17px] text-cream focus:border-gold outline-none min-h-[48px]" />
          </label>
          <div>
            <button type="button" onClick={revisar}
              className="rounded-full bg-gold text-ink px-5 min-h-[48px] text-[17px] font-bold flex items-center gap-2">
              <ScanLine className="w-4 h-4" /> Revisar a fondo
            </button>
          </div>
          <p className="text-[16px] text-cream/55">
            Las medidas y las palabras prohibidas se marcan al instante. La lectura contra las veinte reglas tarda unos segundos.
          </p>
        </div>
        <div className="flex flex-col gap-3.5 min-w-0">
          {lineas.length ? (
            <>
              <Anillo valor={puntaje(marcas)} pie="de 100 en medidas y palabras" />
              <Feed marca={f.nombre} lineas={lineas} titular={f.rev.titular} />
              <Marcas lista={marcas} />
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-gold/50 p-6">
              <p className="text-[17px] text-cream/65">
                La vista del feed, el puntaje y las marcas aparecen cuando pegas el texto.
              </p>
            </div>
          )}
        </div>
      </div>

      {res && (
        <>
          <Regla />
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <Anillo
              valor={res.puntos.length ? Math.round((res.puntos.filter((p) => p.ok).length / res.puntos.length) * 100) : 0}
              pie="reglas que cumple" />
            <span className="text-[18px]">
              <Chip c={res.veredicto === 'agenda' ? 'si' : res.veredicto === 'mixto' ? 'amb' : 'no'}>
                {res.veredicto === 'agenda' ? 'Agenda' : res.veredicto === 'mixto' ? 'Mixto' : 'Trae curiosos'}
              </Chip>
            </span>
          </div>
          <p className="text-cream" style={{ fontFamily: 'var(--font-display)', fontSize: 24, lineHeight: 1.3, fontWeight: 500 }}>
            {res.resumen}
          </p>
          <Epic e={res.epic} />
          <div className="rounded-2xl border border-gold px-5 py-4 flex flex-col gap-1.5">
            <Rotulo>Su 20</Rotulo>
            <p className="text-cream" style={{ fontFamily: 'var(--font-display)', fontSize: 22, lineHeight: 1.3, fontWeight: 500 }}>
              {res.veinte || 'Todavía no tiene una idea central. Es lo primero a sumar.'}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Par tipo="no" items={res.puntos.filter((p) => !p.ok).map((p) => [`${p.regla}: ${p.porque}`, `Arreglo: ${p.arreglo}`])} />
            <Par tipo="si" items={res.puntos.filter((p) => p.ok).map((p) => [p.regla, p.porque])} />
          </div>
          {res.reescritura.lineas.length > 0 && (
            <div className="card-panel p-5 flex flex-col gap-3">
              <Rotulo>Reescrito, cambiando lo mínimo</Rotulo>
              <p className="text-cream whitespace-pre-wrap" style={{ fontFamily: 'var(--font-display)', fontSize: 21, lineHeight: 1.4, fontWeight: 500 }}>
                {res.reescritura.lineas.join('\n')}
              </p>
              {res.reescritura.titular && (
                <p className="text-[17px] text-cream/85"><b className="text-cream">Titular:</b> {res.reescritura.titular}</p>
              )}
              <div className="flex gap-2 flex-wrap">
                <button type="button"
                  onClick={() => tocar({ rev: { texto: res.reescritura.lineas.join('\n'), titular: res.reescritura.titular || f.rev.titular, res: null } })}
                  className="rounded-full border border-cream/20 px-4 min-h-[48px] text-[17px] font-bold text-cream">Pasar al editor</button>
                <button type="button" onClick={() => copiar(res.reescritura.lineas.join('\n'))}
                  className="rounded-full border border-cream/20 px-4 min-h-[48px] text-[17px] font-bold text-cream flex items-center gap-2">
                  <Copy className="w-4 h-4" /> Copiar
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

/* ══════════════════ PROBAR ══════════════════ */

function Probar({ f, i, tocar }: { f: Ficha; i: number; tocar: (c: Partial<Ficha>) => void }) {
  if (i === 0) {
    const DIAS: Array<[string, string]> = [
      ['Día 0', 'Una sola campaña. Tres anuncios de plantillas distintas más el anuncio que ya funcionó, como control.'],
      ['Día 1 y 2', 'No tocas nada. Solo apagas el que gastó y no trajo ni una conversación.'],
      ['Día 4 y 5', 'Eliges ganador: el que trae agendas más baratas, no el de más clics. Cada ángulo tiene dos intentos de creativo antes de darlo por muerto.'],
      ['Día 5 al 19', 'Catorce días sin tocar el ganador. Cada cambio grande reinicia el aprendizaje.'],
      ['Después', 'Al ganador le grabas tres variantes del mismo 20. Refresca el creativo cada 2 a 4 semanas.'],
    ];
    return (
      <section className="flex flex-col gap-6">
        <Rotulo>Probar</Rotulo>
        <h1 className="text-cream" style={{ fontFamily: 'var(--font-display)', fontSize: 38, lineHeight: 1.1, fontWeight: 500 }}>
          Tres anuncios distintos y un control.
        </h1>
        <p className="text-[19px] text-cream/65 max-w-[58ch]">
          El ganador no se adivina: se encuentra. Pruebas ideas distintas, no diseños distintos de la misma idea.
        </p>
        <div className="flex flex-col">
          {DIAS.map(([d, t], j) => (
            <div key={d} className={`grid sm:grid-cols-[120px_1fr] gap-x-5 gap-y-1.5 py-4 ${j ? 'border-t border-cream/12' : ''}`}>
              <b className="text-[18px] font-bold text-gold">{d}</b>
              <p className="text-[17px] text-cream/85">{t}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (i === 1) {
    const FILAS: Array<[string, string, string]> = [
      ['Pocos clics (menos de 1,5 de cada 100)', 'El gancho', 'Otro gancho para el mismo 20'],
      ['Clics caros y pocas conversaciones', 'El anuncio entero', 'Otro ángulo: otra plantilla'],
      ['Muchas conversaciones y cero agendas', 'Lo que pasa después del clic', 'Arregla el video, el mensaje o la página'],
      ['Agendas que no compran', 'El filtro', 'Más filtro en el video y en las preguntas'],
      ['Un ganador que se cansa', 'El creativo', 'Tres variantes nuevas del mismo 20'],
    ];
    return (
      <section className="flex flex-col gap-6">
        <Rotulo>Probar</Rotulo>
        <Titulo>Cómo leer los resultados</Titulo>
        <p className="text-[19px] text-cream/65 max-w-[58ch]">Antes de cambiar el anuncio, mira dónde se corta.</p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[560px]">
            <thead>
              <tr>
                {['Lo que ves', 'Dónde está el problema', 'Qué haces'].map((h) => (
                  <th key={h} className="text-left py-3.5 px-3 text-[15px] font-bold uppercase tracking-[0.08em] text-gold border-b border-gold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FILAS.map((r, j) => (
                <tr key={j}>
                  {r.map((celda, n) => (
                    <td key={n} className="text-left py-3.5 px-3 text-[17px] text-cream/85 border-b border-cream/12 align-top">{celda}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  const cuenta = cuentaDeAgenda(f.plan);
  const fmt = (n: number) => (Number.isFinite(n) ? Math.round(n).toLocaleString('es') : '—');
  const CAMPOS: Array<[keyof Ficha['plan'], string]> = [
    ['ticket', 'Precio de la oferta'],
    ['parte', 'Parte del precio que invertirías por cliente (%)'],
    ['cierre', 'De cada 10 llamadas, cuántas compran'],
    ['agendas', 'Agendas por semana que buscas'],
  ];

  return (
    <section className="flex flex-col gap-6">
      <Rotulo>Probar · {f.nombre}</Rotulo>
      <Titulo>¿Cuánto puedes pagar por una agenda?</Titulo>
      <p className="text-[19px] text-cream/65 max-w-[58ch]">
        Primero decides cuánto vale traer un cliente; después pautas.
      </p>
      <div className="grid gap-5 sm:grid-cols-2">
        {CAMPOS.map(([k, label]) => (
          <label key={k} className="flex flex-col gap-1.5">
            <span className="text-[18px] font-bold text-cream">{label}</span>
            <input inputMode="decimal" value={f.plan[k]}
              onChange={(e) => tocar({ plan: { ...f.plan, [k]: e.target.value } })}
              className="rounded-xl bg-surface border border-cream/15 px-3.5 py-3 text-[17px] text-cream focus:border-gold outline-none min-h-[48px]" />
          </label>
        ))}
      </div>
      {cuenta.sirve ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 border-y border-gold">
            {([
              ['Por cliente nuevo', fmt(cuenta.porCliente), false],
              ['Máximo por agenda', cuenta.porAgenda > 0 ? fmt(cuenta.porAgenda) : '—', true],
              ['Por semana', cuenta.porSemana > 0 ? fmt(cuenta.porSemana) : '—', false],
              ['Por día', cuenta.porDia > 0 ? fmt(cuenta.porDia) : '—', false],
            ] as Array<[string, string, boolean]>).map(([l, v, clave]) => (
              <div key={l} className="py-4 px-4 flex flex-col gap-1">
                <b className="text-[15px] font-bold text-cream/55">{l}</b>
                <span className={`tabular-nums ${clave ? 'text-gold' : 'text-cream'}`}
                  style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
          <p className="border-l-2 border-gold pl-4 text-[17px] text-cream/65">
            Si Meta te cobra más por agenda que ese máximo, el problema está en el anuncio o en el paso
            siguiente, no en el presupuesto.
          </p>
        </>
      ) : (
        <p className="text-[17px] text-cream/55">
          Completa el precio y la parte que invertirías para ver los números.
        </p>
      )}
    </section>
  );
}
