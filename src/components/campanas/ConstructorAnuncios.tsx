/**
 * CONSTRUCTOR "TUS 3 ANUNCIOS" (T2 del Manual de Anuncios).
 *
 * El corazón de Campañas: autocompleta el brief con lo que el sanador YA
 * selló en su ADN, aplica la regla del test (1 de piedras + 1 de dolor o
 * historia + 1 de resultado o método), genera los 3 guiones + la secuencia
 * de 3 stories con IA, y audita cada pieza contra los 8 ingredientes.
 */
import React, { useMemo, useState } from 'react';
import {
  FORMULAS_ANUNCIOS, FAMILIAS_TEST, NOMBRE_FAMILIA, FORMULA_STORIES,
  recomendarFormulas, formulasBloqueadas,
  type Familia3, type RecomendacionTrio, type SenalesSanador,
  LAS_7_REGLAS, REGLAS_META, auditarPieza, revisarPoliticas, armarCarrusel, formulaPorId,
  type FamiliaFormula, type FormulaAnuncio,
} from '../../lib/formulasAnuncios';
import { generateText } from '../../lib/aiProvider';
import { primero } from '../../lib/primero';
import { armarPaquete } from '../../lib/paqueteCampana';
import { revisarPieza, type VeredictoCritico } from '../../lib/criticoPieza';

/* ── El brief: 7 insumos, autocompletados desde lo sellado ── */

interface Brief {
  avatar: string; piedras: string; frases: string; prueba: string;
  metodo: string; oferta: string; palabra: string;
}

const BRIEF_KEY = 'tcd_brief_anuncios_v1';
const OUT_KEY = 'tcd_anuncios_v1';

function leerJSON<T>(k: string, def: T): T {
  try { return JSON.parse(localStorage.getItem(k) ?? '') as T; } catch { return def; }
}

/** adn_avatar es un OBJETO ({edad, dolores, objeciones...}): aplanarlo.
 *  String(objeto) devolvia "[object Object]" en la cara del cliente. */
function textoAvatar(v: unknown): string {
  if (!v) return '';
  if (typeof v === 'string') return v.trim();
  if (typeof v === 'object') {
    return Object.values(v as Record<string, unknown>)
      .map((x) => (Array.isArray(x) ? x.join(', ') : String(x ?? '')))
      .map((x) => x.trim()).filter(Boolean).join(' · ');
  }
  return '';
}

/** Las notas de sesion vienen como markdown ("## pregunta\nrespuesta").
 *  Al brief va la respuesta, no el volcado entero. */
function limpiarNota(v: unknown): string {
  return String(v ?? '').split('\n').filter((l) => !l.startsWith('##'))
    .join(' ').replace(/\s+/g, ' ').trim().slice(0, 400);
}

/** Que sesion sella cada campo — para poder decirle al cliente que le falta
 *  en vez de mostrarle un formulario vacio prometiendo que lo trajimos. */
const ORIGEN: Record<string, string> = {
  avatar: 'Tu Avatar (P2.3)',
  piedras: 'La Quema (P0.3)',
  frases: 'Las palabras de tu paciente (P2.3b)',
  metodo: 'Genera tu metodo (nombre + pasos)',
  oferta: 'Disena tu oferta principal',
};

/** Mejor esfuerzo: junta lo que la app ya sabe. Todo queda editable. */
function briefDesdeADN(): Brief {
  const guardado = leerJSON<Partial<Brief>>(BRIEF_KEY, {});
  const perfil = leerJSON<Record<string, unknown>>('tcd_profile', {});
  const notas = leerJSON<Record<string, string>>('tcd_notas_sesion_v1', {});
  return {
    avatar: primero(guardado.avatar, textoAvatar(perfil.adn_avatar)),
    piedras: primero(guardado.piedras, limpiarNota(notas['P0.3'])),
    frases: primero(guardado.frases, limpiarNota(notas['P2.3b'])),
    prueba: primero(guardado.prueba),
    metodo: primero(guardado.metodo, perfil.metodo_nombre as string, perfil.adn_metodo as string),
    oferta: primero(guardado.oferta, perfil.oferta_mid as string, perfil.adn_oferta as string),
    palabra: primero(guardado.palabra),
  };
}

const CAMPOS: { k: keyof Brief; label: string; ayuda: string }[] = [
  { k: 'avatar', label: 'Tu cliente, por CONDUCTA', ayuda: 'Qué hace un día normal, cómo cobra, qué persigue hoy. Sin nombrar profesiones.' },
  { k: 'piedras', label: 'Las 3 tácticas que ya intentó', ayuda: 'Lo que probó y no le funcionó — lo que quemaste en tu QUEMA sirve acá.' },
  { k: 'frases', label: 'Frases TEXTUALES de tus clientes', ayuda: '2-3 frases exactas que dicen al llegar. Su lenguaje interno.' },
  { k: 'prueba', label: 'Una prueba real (con permiso)', ayuda: 'Un resultado o testimonio de un cliente tuyo. Si aún no tienes, déjalo vacío.' },
  { k: 'metodo', label: 'El nombre propio de tu método', ayuda: 'El que creaste en tu Camino. Con nombre suena a sistema.' },
  { k: 'oferta', label: 'Tu oferta concreta', ayuda: 'Qué es, cuándo empieza, cuántos lugares, desde qué inversión.' },
  { k: 'palabra', label: 'Tu PALABRA clave', ayuda: 'Una sola, corta, en mayúsculas, ligada a tu oferta. Nunca "INFO".' },
];

/* ── Selección con la regla 1+1+1 ── */

const FAMILIAS: Familia3[] = ['piedras', 'dolor_historia', 'resultado_metodo'];

interface Pieza { formulaId: number; texto: string }

export default function ConstructorAnuncios() {
  const [brief, setBrief] = useState<Brief>(() => briefDesdeADN());
  /** Lo que la app sabe del sanador, leído de su brief. */
  const senales: SenalesSanador = useMemo(() => ({
    tienePrueba: !!brief.prueba.trim(),
    marcaPersonal: !!brief.avatar.trim() && !!brief.metodo.trim(),
    tieneFrases: !!brief.frases.trim(),
    metodoConNombre: !!brief.metodo.trim(),
    tienePiedras: !!brief.piedras.trim(),
  }), [brief]);

  const recomendado: RecomendacionTrio = useMemo(
    () => recomendarFormulas(senales), [senales]);
  const bloqueadas = useMemo(() => formulasBloqueadas(senales), [senales]);

  /** Arranca con lo recomendado. Solo se aparta si el sanador lo cambia. */
  const [sel, setSel] = useState<Record<Familia3, number> | null>(
    () => leerJSON<Record<Familia3, number> | null>(OUT_KEY + '_sel', null));
  const [verTodas, setVerTodas] = useState(false);
  /** El veredicto del crítico por pieza. Se pide a demanda, no al generar. */
  const [revision, setRevision] = useState<Record<number, VeredictoCritico>>({});
  const [revisando, setRevisando] = useState<number | null>(null);

  const revisar = async (id: number, texto: string) => {
    setRevisando(id);
    try {
      const v = await revisarPieza(texto, brief.palabra);
      setRevision((p) => ({ ...p, [id]: v }));
    } finally {
      setRevisando(null);
    }
  };

  /** Aplica una línea escrita por el crítico, DONDE corresponde.
   *  Antes todo iba al final: si lo que faltaba era el gancho, el anuncio
   *  quedaba con la apertura al pie. */
  const aplicar = (id: number, linea: string, ingrediente: string, posicion: 'inicio' | 'final' = 'final') => {
    setPiezas((p) => {
      const actual = p[id];
      if (!actual) return p;
      const texto = posicion === 'inicio'
        ? `${linea}\n\n${actual.texto.trimStart()}`
        : `${actual.texto.trimEnd()}\n\n${linea}`;
      const nuevo = { ...p, [id]: { ...actual, texto } };
      try { localStorage.setItem(OUT_KEY, JSON.stringify(nuevo)); } catch { /* noop */ }
      return nuevo;
    });
    // Lo aplicado sale de la lista: no se ofrece dos veces lo mismo.
    setRevision((p) => {
      const v = p[id];
      if (!v?.correcciones) return p;
      return { ...p, [id]: { ...v, correcciones: v.correcciones.filter((c) => c.ingrediente !== ingrediente) } };
    });
  };

  const elegidas: Record<Familia3, number> = sel ?? {
    piedras: recomendado.piedras.id,
    dolor_historia: recomendado.dolor_historia.id,
    resultado_metodo: recomendado.resultado_metodo.id,
  };
  const [piezas, setPiezas] = useState<Record<number, Pieza>>(() => leerJSON(OUT_KEY, {}));
  const [stories, setStories] = useState<string>(() => leerJSON(OUT_KEY + '_st', ''));

  const paquete = useMemo(() => armarPaquete({
    piezas, elegidas: [elegidas.piedras, elegidas.dolor_historia, elegidas.resultado_metodo],
    stories, brief,
    notas: leerJSON<Record<string, string>>('tcd_notas_sesion_v1', {}),
  }), [piezas, elegidas, stories, brief]);

  const [generando, setGenerando] = useState<string | null>(null);
  const [fallo, setFallo] = useState<string | null>(null);

  const sinPrueba = !brief.prueba.trim();
  /** Los campos del ADN que siguen vacios, con la sesion que los sella. */
  const faltantes = Object.keys(ORIGEN).filter((k) => !brief[k as keyof Brief].trim());

  const setCampo = (k: keyof Brief, v: string) => {
    const b = { ...brief, [k]: v };
    setBrief(b);
    try { localStorage.setItem(BRIEF_KEY, JSON.stringify(b)); } catch { /* noop */ }
  };

  const elegir = (fam: Familia3, id: number) => {
    const s = { ...elegidas, [fam]: id };
    setSel(s);
    try { localStorage.setItem(OUT_KEY + '_sel', JSON.stringify(s)); } catch { /* noop */ }
  };

  const promptDe = (f: FormulaAnuncio) => {
    const reglas = LAS_7_REGLAS.map((r) => `- ${r.titulo}: ${r.texto}`).join('\n');
    const meta = REGLAS_META.map((r) => `- ${r}`).join('\n');
    return `Escribe UN anuncio para Instagram (carrusel) siguiendo EXACTAMENTE esta fórmula.

FÓRMULA «${f.nombre}» — estructura obligatoria, pantalla por pantalla:
${f.estructura.map((e, i) => `${i + 1}. ${e}`).join('\n')}
Caption base: ${f.caption}
Error a evitar: ${f.errorComun}

EL BRIEF (datos reales de esta persona — usa SOLO esto, no inventes):
- Cliente por conducta: ${brief.avatar || '(no dado — describe conducta genérica de quien atiende uno a uno)'}
- Tácticas que ya intentó (piedras): ${brief.piedras || '(no dadas)'}
- Frases textuales de sus clientes: ${brief.frases || '(no dadas)'}
- Prueba real: ${brief.prueba || 'NO HAY PRUEBA — no inventes ninguna; omite ese bloque o usa la aclaración honesta en su lugar'}
- Método (nombre propio): ${brief.metodo || '(sin nombre — usa "[MI MÉTODO]")'}
- Oferta: ${brief.oferta || '(no dada)'}
- Palabra clave: ${brief.palabra || 'PALABRA'}

REGLAS INQUEBRANTABLES:
${reglas}
APROBACIÓN DE META:
${meta}

REGISTRO: castellano neutro (tú/tienes), hablado y natural, frases cortas, un golpe por línea. Cero jerga de oficio. Filtro por conducta, jamás listando profesiones. Nada de precio en el anuncio.

FORMATO DE SALIDA (texto plano, sin explicaciones):
PANTALLA 1: …
PANTALLA 2: …
(una por paso de la estructura)
CAPTION: …`;
  };

  const generar = async () => {
    setFallo(null);
    const ids = [elegidas.piedras, elegidas.dolor_historia, elegidas.resultado_metodo];
    /**
     * UNA TANDA CUESTA UN CRÉDITO, no cuatro.
     *
     * El bucle recorre las tres fórmulas y cada llamada declaraba
     * `feature: 'constructor'`, así que cobraba una por cada una — más otra
     * por las historias. Cuatro créditos donde la app promete uno: con treinta
     * al mes el sanador hacía siete tandas en vez de treinta, y la app le
     * cobraba distinto de lo que le dice.
     *
     * Cobra la primera; las otras dos y las historias viajan sin `feature`,
     * que en el guardián significa "no se cobra ni se cuenta".
     */
    let primera = true;
    for (const id of ids) {
      const f = formulaPorId(id);
      if (!f) continue;
      setGenerando(f.nombre);
      try {
        const texto = await generateText({ tarea: 'guion',
          ...(primera ? { feature: 'constructor' } : {}),
          systemInstruction: 'Eres un redactor de anuncios de venta directa en castellano neutro. Sigues la fórmula al pie de la letra. Nunca inventas datos ni pruebas.',
          prompt: promptDe(f),
        });
        primera = false;
        setPiezas((p) => {
          const n = { ...p, [id]: { formulaId: id, texto: String(texto ?? '').trim() } };
          try { localStorage.setItem(OUT_KEY, JSON.stringify(n)); } catch { /* noop */ }
          return n;
        });
      } catch {
        setFallo(`No pudimos generar «${f.nombre}». Revisa tu conexión y toca Generar de nuevo — lo ya creado se conserva.`);
        setGenerando(null);
        return;
      }
    }
    // La secuencia de 3 stories acompaña siempre
    setGenerando('Secuencia de stories');
    try {
      // Sin feature: las historias acompañan a los anuncios y van dentro
      // de la misma tanda, que ya se cobró arriba.
      const st = await generateText({ tarea: 'guion',
        systemInstruction: 'Eres un redactor de anuncios en castellano neutro. Texto plano.',
        prompt: `Escribe la secuencia de 3 stories (texto sobre fondo, sin cámara) para acompañar la campaña.\nEstructura: ${FORMULA_STORIES.estructura.join(' | ')}\nBrief: método ${brief.metodo || '[MI MÉTODO]'} · oferta ${brief.oferta || '(cupos limitados)'} · cliente ${brief.avatar || '(quien atiende uno a uno)'} · palabra ${brief.palabra || 'PALABRA'}.\nFormato: STORY 1: … / STORY 2: … / STORY 3: …`,
      });
      const limpio = String(st ?? '').trim();
      setStories(limpio);
      try { localStorage.setItem(OUT_KEY + '_st', JSON.stringify(limpio)); } catch { /* noop */ }
    } catch { /* las stories no frenan el resultado principal */ }
    setGenerando(null);
  };

  const listas = FAMILIAS.every((f) => piezas[elegidas[f]]?.texto);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold mb-1">El Constructor</p>
        <h2 className="text-xl text-cream" style={{ fontFamily: 'var(--font-display)' }}>Tus 3 anuncios</h2>
        <p className="text-sm text-cream/60 mt-1">Tres fórmulas que atacan distinto, completadas con TU caso. La regla: una de piedras, una de dolor o historia, una de resultado.</p>
      </div>

      {/* EL BRIEF */}
      <div className="card-panel p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-cream/60 mb-1">
          1 · Tu brief{faltantes.length === 0 ? ' — lo trajimos de tu ADN, ajústalo' : ''}
        </p>
        {faltantes.length > 0 && (
          <div className="mb-4 mt-2 rounded-xl border border-gold/25 bg-gold/5 px-4 py-3">
            <p className="text-sm text-cream font-semibold mb-1">
              Todavía no puedo traerlo de tu ADN.
            </p>
            <p className="text-xs text-cream/70 mb-2">
              Estos anuncios salen de lo que ya sellaste en tu Camino. Te
              {faltantes.length === 1 ? ' falta esta sesión' : ` faltan ${faltantes.length} sesiones`}:
            </p>
            <ul className="space-y-1">
              {faltantes.map((k) => (
                <li key={k} className="text-xs text-gold">· {ORIGEN[k]}</li>
              ))}
            </ul>
            <p className="text-[11px] text-cream/50 mt-2">
              Puedes escribirlo a mano igual — pero si lo sellas en el Camino, entra solo y queda en tu ADN.
            </p>
          </div>
        )}
        <div className="grid sm:grid-cols-2 gap-4">
          {CAMPOS.map((c) => (
            <div key={c.k} className={c.k === 'avatar' || c.k === 'oferta' ? 'sm:col-span-2' : ''}>
              <p className="text-xs font-semibold text-cream mb-1">{c.label}</p>
              <textarea
                value={brief[c.k]}
                onChange={(e) => setCampo(c.k, e.target.value)}
                placeholder={c.ayuda}
                rows={c.k === 'palabra' ? 1 : 2}
                className="w-full bg-surface/40 border border-cream/10 rounded-xl px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold/40 outline-none resize-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* LO QUE LA APP ELIGIÓ POR TI */}
      <div className="card-panel p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-cream/60 mb-1">
          2 · Tus 3 anuncios
        </p>
        <p className="text-xs text-cream/55 mb-4">
          Elegidas con lo que ya sellaste. Una ataca lo que tu paciente probó, otra su dolor
          y otra tu resultado: si las tres dijeran lo mismo, no sabrías cuál funcionó.
        </p>

        <div className="space-y-2.5">
          {FAMILIAS.map((fam) => {
            const r = recomendado[fam];
            const cambiada = elegidas[fam] !== r.id;
            const f = formulaPorId(elegidas[fam])!;
            return (
              <div key={fam} className="rounded-xl border border-gold/25 bg-gold/[0.04] p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-gold/70 mb-1">
                  {NOMBRE_FAMILIA[fam]}
                </p>
                <p className="text-sm font-semibold text-cream mb-1">
                  {f.id} · {f.nombre}
                  {cambiada && <span className="text-[10px] text-cream/40 font-normal ml-2">— la cambiaste tú</span>}
                </p>
                <p className="text-xs text-cream/70">{cambiada ? f.cuando : r.porQue}</p>
              </div>
            );
          })}
        </div>

        {/* Lo que todavía no le sirve, con el motivo */}
        {bloqueadas.length > 0 && (
          <div className="mt-4 rounded-xl border border-cream/12 p-4">
            <p className="text-[11px] text-cream/55 mb-2">
              Hay {bloqueadas.length} fórmulas que todavía no te conviene usar:
            </p>
            <ul className="space-y-1.5">
              {bloqueadas.map((b) => (
                <li key={b.id} className="text-xs text-cream/60">
                  <strong className="text-cream/80">{b.nombre}</strong> — {b.porQue}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* La puerta a las 18, para quien ya tiene criterio */}
        <button onClick={() => setVerTodas((v) => !v)}
          className="text-[11px] text-cream/45 underline underline-offset-2 mt-4">
          {verTodas ? 'Ocultar las demás' : 'Prefiero elegirlas yo'}
        </button>

        {verTodas && (
          <div className="grid sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-cream/10">
            {FAMILIAS.map((fam) => (
              <div key={fam}>
                <p className="text-xs font-semibold text-gold mb-2">{NOMBRE_FAMILIA[fam]}</p>
                <div className="space-y-1.5">
                  {FAMILIAS_TEST[fam].map((id) => {
                    const f = formulaPorId(id)!;
                    const impedida = bloqueadas.find((b) => b.id === id);
                    const activa = elegidas[fam] === id;
                    const sugerida = recomendado[fam].id === id;
                    return (
                      <button key={id} onClick={() => elegir(fam, id)}
                        className={`w-full text-left rounded-xl border px-3 py-2 text-xs transition ${
                          activa ? 'border-gold/60 bg-gold/10 text-cream'
                                 : 'border-cream/12 text-cream/60 hover:border-cream/30'}`}>
                        <span className="font-semibold">{f.id} · {f.nombre}</span>
                        {sugerida && <span className="block text-[10px] text-gold/70 mt-0.5">La que te recomendamos</span>}
                        {impedida && <span className="block text-[10px] text-danger/80 mt-0.5">{impedida.porQue}</span>}
                        {activa && !sugerida && <span className="block text-[10px] text-cream/50 mt-0.5">{f.cuando}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* GENERAR */}
      <button onClick={() => void generar()} disabled={!!generando}
        className="w-full btn-primary py-3.5 rounded-xl text-sm font-bold disabled:opacity-60">
        {generando ? `Escribiendo: ${generando}…` : '✨ Generar mis 3 anuncios + stories'}
      </button>
      {fallo && <p className="text-xs text-danger">{fallo}</p>}

      {/* LAS PIEZAS */}
      {FAMILIAS.map((fam) => {
        const pieza = piezas[elegidas[fam]];
        if (!pieza) return null;
        const f = formulaPorId(pieza.formulaId)!;
        const audit = auditarPieza(pieza.texto);
        const rev = revision[pieza.formulaId];
        /** Chequeo determinista de políticas: gratis, siempre, en cada tecla.
         *  Lo que se juega es la cuenta publicitaria del sanador. */
        const politicas = revisarPoliticas(pieza.texto);
        /** El guion ya viene marcado "PANTALLA N:" — esto solo lo lee. */
        const carrusel = armarCarrusel(pieza.texto, brief.palabra);
        const bloqueantes = politicas.filter((a) => a.gravedad === 'bloquea');
        const listaParaPublicar =
          audit.aprobada && bloqueantes.length === 0 && (rev?.alertasMeta?.length ?? 0) === 0;
        return (
          <div key={fam} className="card-panel p-5">
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="text-sm font-bold text-cream">{f.id} · {f.nombre}</p>
              <button
                onClick={() => void navigator.clipboard?.writeText(pieza.texto)}
                disabled={!listaParaPublicar}
                title={
                  listaParaPublicar ? ''
                  : bloqueantes.length > 0
                    ? `No se puede publicar así: ${bloqueantes[0].que}`
                    : 'Todavía le falta algo. Revísala antes de publicarla.'
                }
                className="text-[11px] font-bold text-gold hover:text-goldhi shrink-0 disabled:opacity-30 disabled:cursor-not-allowed">
                Copiar ⧉
              </button>
            </div>
            {carrusel.problema ? (
              <>
                <pre className="whitespace-pre-wrap text-sm text-cream/85 font-[inherit] leading-relaxed">{pieza.texto}</pre>
                <p className="text-[11px] text-gold mt-2">{carrusel.problema}</p>
              </>
            ) : (
              <div className="space-y-2">
                {carrusel.laminas.map((l) => (
                  <div key={l.n}
                    className={`rounded-xl border p-3 ${
                      l.tipo === 'portada' ? 'border-gold/35 bg-gold/[0.05]'
                      : l.tipo === 'cierre' ? 'border-success/25 bg-success/[0.04]'
                      : 'border-cream/12'}`}>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-cream/45">
                        {l.tipo === 'portada' ? 'Portada' : l.tipo === 'cierre' ? 'Cierre' : `Lámina ${l.n}`}
                        {l.larga && <span className="text-gold ml-2">· muy larga para el teléfono</span>}
                      </span>
                      <button onClick={() => void navigator.clipboard?.writeText(l.texto)}
                        className="text-[10px] font-bold text-gold hover:text-goldhi shrink-0">
                        Copiar
                      </button>
                    </div>
                    <p className="text-sm text-cream/85 whitespace-pre-wrap leading-relaxed">{l.texto}</p>
                  </div>
                ))}

                {carrusel.caption && (
                  <div className="rounded-xl border border-cream/12 p-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-cream/45">
                        Texto del post
                      </span>
                      <button onClick={() => void navigator.clipboard?.writeText(carrusel.caption)}
                        className="text-[10px] font-bold text-gold hover:text-goldhi shrink-0">
                        Copiar
                      </button>
                    </div>
                    <p className="text-sm text-cream/85 whitespace-pre-wrap leading-relaxed">{carrusel.caption}</p>
                  </div>
                )}

                {!carrusel.palabraPresente && (
                  <p className="text-[11px] text-danger/85">
                    {brief.palabra
                      ? `Tu palabra «${brief.palabra}» no aparece ni en el cierre ni en el texto del post. Sin eso, el comentario no dispara el mensaje automático y la campaña no puede funcionar.`
                      : 'Todavía no configuraste tu palabra clave. Es lo que dispara el mensaje automático cuando alguien comenta.'}
                  </p>
                )}
              </div>
            )}

            {politicas.length > 0 && (
              <div className={`mt-3 rounded-xl border p-3 ${
                bloqueantes.length > 0
                  ? 'border-danger/45 bg-danger/[0.07]'
                  : 'border-gold/30 bg-gold/[0.05]'}`}>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-2 text-cream/70">
                  {bloqueantes.length > 0
                    ? 'Esto no se puede publicar así'
                    : 'Revisa esto antes de publicar'}
                </p>
                <div className="space-y-2.5">
                  {politicas.map((a) => (
                    <div key={a.id}>
                      <p className="text-xs text-cream/85">
                        <strong className={a.gravedad === 'bloquea' ? 'text-danger' : 'text-gold'}>
                          «{a.que}»
                        </strong> — {a.porQue}
                      </p>
                      <p className="text-[11px] text-cream/55 mt-0.5">{a.comoSeArregla}</p>
                      <p className="text-[10px] text-cream/35 mt-0.5 italic">{a.fragmento}</p>
                    </div>
                  ))}
                </div>
                {bloqueantes.length > 0 && (
                  <p className="text-[11px] text-cream/45 mt-2.5 border-t border-cream/10 pt-2">
                    Lo que está en juego es tu cuenta publicitaria. Recuperarla tarda semanas
                    y a veces no se recupera.
                  </p>
                )}
              </div>
            )}

            <div className={`mt-3 rounded-xl border p-3 ${
              listaParaPublicar ? 'border-success/25 bg-success/[0.05]' : 'border-gold/30 bg-gold/[0.05]'}`}>
              <p className="text-[11px] font-bold uppercase tracking-wider mb-1 text-cream/70">
                {listaParaPublicar ? 'Lista para publicar' : 'Todavía no está lista'}
              </p>
              <p className="text-xs text-cream/70">{audit.nota}</p>
              {!audit.aprobada && (
                <p className="text-xs text-cream/60 mt-1">Le falta: {audit.faltantes.join(' · ')}</p>
              )}

              {/* La segunda revisión: otro modelo, y escribe lo que falta */}
              {!audit.aprobada && !rev && (
                <button onClick={() => void revisar(pieza.formulaId, pieza.texto)}
                  disabled={revisando === pieza.formulaId}
                  className="mt-3 w-full py-2 rounded-lg border border-gold/40 text-gold text-xs font-bold disabled:opacity-50">
                  {revisando === pieza.formulaId ? 'Revisando…' : 'Que la revise y escriba lo que falta'}
                </button>
              )}

              {rev?.problema && (
                <p className="text-xs text-danger/85 mt-2">{rev.problema}</p>
              )}

              {rev?.alertasMeta && rev.alertasMeta.length > 0 && (
                <div className="mt-3 rounded-lg border border-danger/40 bg-danger/[0.06] p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-danger mb-1">
                    Esto te lo pueden rechazar
                  </p>
                  <ul className="space-y-1">
                    {rev.alertasMeta.map((a, i) => (
                      <li key={i} className="text-xs text-cream/85">· {a}</li>
                    ))}
                  </ul>
                </div>
              )}

              {rev?.correcciones && rev.correcciones.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-[11px] text-cream/55">
                    Escribí lo que faltaba. Míralo y agrégalo si te suena tuyo:
                  </p>
                  {rev.correcciones.map((c) => (
                    <div key={c.ingrediente} className="rounded-lg border border-cream/12 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-gold/70 mb-1">
                        {c.ingrediente}{c.donde ? ` · ${c.donde}` : ''}
                      </p>
                      <p className="text-sm text-cream/85 mb-2">{c.linea}</p>
                      <button onClick={() => aplicar(pieza.formulaId, c.linea, c.ingrediente, c.posicion)}
                        className="text-[11px] font-bold text-gold">
                        Agregarlo a mi anuncio
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {rev?.correcciones && rev.correcciones.length === 0 && !rev.problema && (
                <p className="text-xs text-cream/55 mt-2">
                  El revisor no encontró nada más que agregar.
                </p>
              )}
            </div>
          </div>
        );
      })}

      {stories && (
        <div className="card-panel p-5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <p className="text-sm font-bold text-cream">12 · La secuencia de 3 stories — acompaña siempre</p>
            <button onClick={() => void navigator.clipboard?.writeText(stories)}
              className="text-[11px] font-bold text-gold hover:text-goldhi shrink-0">Copiar ↗</button>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-cream/85 font-[inherit] leading-relaxed">{stories}</pre>
          <p className="text-[11px] text-cream/45 mt-2">Se publican el mismo día, con horas de diferencia. Repetible 2-3 veces por semana con distinto ángulo.</p>
        </div>
      )}

      {listas && (
        <p className="text-xs text-cream/55 text-center">Tus 3 anuncios están listos. El paso que sigue vive en tu Camino: grabarlos y montar tu campaña.</p>
      )}

      {/* EL PAQUETE — todo junto, listo para encender */}
      {paquete.piezas.some((x) => x.contenido) && (
        <div className="card-panel p-5">
          <div className="flex items-start justify-between gap-3 mb-1">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-cream/60">
                4 · Tu paquete para encender
              </p>
              <p className="text-xs text-cream/55 mt-1">
                Todo lo que necesitas, junto. No hace falta que armes nada a mano.
              </p>
            </div>
            {paquete.textoCompleto && (
              <button onClick={() => void navigator.clipboard?.writeText(paquete.textoCompleto)}
                className="text-[11px] font-bold text-gold hover:text-goldhi shrink-0">
                Copiar todo
              </button>
            )}
          </div>

          <div className={`mt-3 rounded-xl border p-3 ${
            paquete.completo
              ? 'border-success/25 bg-success/[0.05]'
              : 'border-gold/30 bg-gold/[0.05]'}`}>
            <p className="text-sm text-cream">
              {paquete.completo
                ? 'Está todo. Puedes encender.'
                : `Faltan ${paquete.faltan.length}: ${paquete.faltan.join(' · ')}`}
            </p>
          </div>

          <div className="space-y-2 mt-3">
            {paquete.piezas.map((x) => (
              <div key={x.id}
                className={`rounded-xl border p-3 ${
                  x.estado === 'listo' ? 'border-cream/12'
                  : x.estado === 'revisar' ? 'border-danger/35 bg-danger/[0.04]'
                  : 'border-cream/[0.08] bg-cream/[0.02]'}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-cream/85">
                    <span className={
                      x.estado === 'listo' ? 'text-success' :
                      x.estado === 'revisar' ? 'text-danger' : 'text-cream/30'}>
                      {x.estado === 'listo' ? '✓' : x.estado === 'revisar' ? '!' : '○'}
                    </span>{' '}
                    {x.titulo}
                    {!x.obligatoria && <span className="text-[10px] text-cream/35 ml-2">opcional</span>}
                  </span>
                  {x.contenido && (
                    <button onClick={() => void navigator.clipboard?.writeText(x.contenido)}
                      className="text-[10px] font-bold text-gold hover:text-goldhi shrink-0">
                      Copiar
                    </button>
                  )}
                </div>
                {x.aviso && <p className="text-[11px] text-danger/85 mt-1">{x.aviso}</p>}
                {!x.contenido && <p className="text-[11px] text-cream/45 mt-1">{x.donde}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
