/**
 * CONSTRUCTOR "TUS 3 ANUNCIOS" (T2 del Manual de Anuncios).
 *
 * El corazón de Campañas: autocompleta el brief con lo que el sanador YA
 * selló en su ADN, aplica la regla del test (1 de piedras + 1 de dolor o
 * historia + 1 de resultado o método), genera los 3 guiones + la secuencia
 * de 3 stories con IA, y audita cada pieza contra los 8 ingredientes.
 */
import { useEffect, useMemo, useState } from 'react';
import {
  FAMILIAS_TEST, NOMBRE_FAMILIA, FORMULA_STORIES,
  recomendarFormulas, formulasBloqueadas,
  type Familia3, type RecomendacionTrio, type SenalesSanador,
  LAS_7_REGLAS, REGLAS_META, auditarPieza, revisarPoliticas, armarCarrusel, formulaPorId,
  type FormulaAnuncio,
} from '../../lib/formulasAnuncios';
import { generateText } from '../../lib/aiProvider';
import { primero } from '../../lib/primero';
import { armarPaquete } from '../../lib/paqueteCampana';
import { revisarPieza, type VeredictoCritico } from '../../lib/criticoPieza';
import { guardarTrabajoDeCampanas, leerTrabajoDeCampanas } from '../../lib/tableroSync';
import { VOC } from '../../lib/vocabulario';
import BotonCopiar from '../BotonCopiar';
import {
  estadoDePieza, leerAprobadas, estaAprobada, aprobar, desaprobar,
  COMO_FUNCIONA_LA_AUDITORIA,
} from '../../lib/aprobacionAnuncio';
import {
  primerIntento, promptDeCampos, leerRespuesta, revisarCampos, paraPegar,
  type CamposMeta,
} from '../../lib/camposMeta';

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
  avatar: 'Tu avatar',
  piedras: 'La quema',
  frases: 'Las palabras de {{tu_consultante}}',
  metodo: 'Genera tu método (nombre + pasos)',
  oferta: 'Diseña tu oferta principal',
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
  { k: 'avatar', label: 'A quién le hablas', ayuda: 'Qué hace un día normal, cómo cobra, qué persigue hoy. Sin nombrar profesiones.' },
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

export default function ConstructorAnuncios(
  { clienteId }: {
    /** Sin esto, el brief y los anuncios que PAGÓ CON CRÉDITOS viven solo en
     *  este navegador. Perderlos significa volver a pagar por generarlos. */
    clienteId?: string;
  } = {},
) {
  const [brief, setBrief] = useState<Brief>(() => briefDesdeADN());
  /**
   * RECUPERAR LO QUE YA PAGÓ, DE LA BASE.
   *
   * El Constructor guardaba el brief y las piezas en Supabase —
   * `guardarTrabajoDeCampanas` corre en los dos lugares — y rehidrataba SOLO
   * de localStorage. `leerTrabajoDeCampanas` existía, con su consulta escrita,
   * y nadie la llamaba.
   *
   * O sea: el cliente cambiaba de teléfono, limpiaba la caché o entraba en
   * modo incógnito, y perdía anuncios que había pagado con créditos — estando
   * guardados en la base. Y volvía a gastar créditos para rehacerlos.
   *
   * Lo local sigue siendo el arranque, porque es instantáneo. Esto llega
   * después y solo rellena lo que falta: si lo de la base pisara lo local,
   * alguien que acaba de escribir algo lo vería desaparecer.
   */
  useEffect(() => {
    if (!clienteId) return;
    let vivo = true;
    void (async () => {
      const [b, a] = await Promise.all([
        leerTrabajoDeCampanas(clienteId, 'brief'),
        leerTrabajoDeCampanas(clienteId, 'anuncios'),
      ]);
      if (!vivo) return;
      if (b && typeof b === 'object') {
        setBrief((actual) => {
          const guardado = b as Partial<Brief>;
          const mezcla = { ...actual };
          for (const k of Object.keys(mezcla) as Array<keyof Brief>) {
            // Solo lo que está vacío acá: lo que el cliente tiene escrito
            // ahora mismo gana siempre.
            if (!mezcla[k]?.trim() && guardado[k]?.trim()) mezcla[k] = guardado[k]!;
          }
          return mezcla;
        });
      }
      if (a && typeof a === 'object') {
        const guardadas = a as Record<number, Pieza>;
        setPiezas((actual) => (Object.keys(actual).length > 0 ? actual : guardadas));
      }
    })();
    return () => { vivo = false; };
  }, [clienteId]);

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
  /** Las piezas que el cliente aprobó a mano, por huella del texto: si edita el
   *  anuncio, la aprobación se cae sola y se la vuelvo a pedir. */
  const [aprobadas, setAprobadas] = useState<Record<string, string>>(() => leerAprobadas());
  /** El titular y la descripción de cada pieza, por id de fórmula. */
  const [campos, setCampos] = useState<Record<number, CamposMeta>>({});
  const [armandoCampos, setArmandoCampos] = useState<number | null>(null);

  const revisar = async (id: number, texto: string) => {
    setRevisando(id);
    try {
      const v = await revisarPieza(texto, brief.palabra);
      setRevision((p) => ({ ...p, [id]: v }));
    } finally {
      setRevisando(null);
    }
  };

  /**
   * EL TITULAR Y LA DESCRIPCIÓN QUE META PIDE.
   *
   * Meta no pide «el anuncio»: pide tres campos. La app escribía el cuerpo y
   * el cliente llegaba al administrador con dos campos vacíos delante, así que
   * escribía cualquier cosa ahí mismo — y eso es lo que lee quien duda si
   * tocar. El primer intento sale del gancho sin gastar una llamada; el botón
   * está para cuando ese intento no alcanza.
   */
  const pedirCampos = async (id: number, texto: string) => {
    setArmandoCampos(id);
    try {
      const crudo = await generateText({
        feature: 'campana_chat', tarea: 'guion',
        prompt: promptDeCampos({
          textoDelAnuncio: texto, oferta: brief.oferta, aQuien: brief.avatar,
        }),
      });
      const leido = leerRespuesta(crudo);
      if (!leido) {
        // Sin esto el botón quedaba girando y después no pasaba nada: el
        // cliente no sabía si tenía que volver a tocarlo.
        setFallo('No pude escribir el titular. Vuelve a tocar el botón.');
        return;
      }
      setCampos((c) => ({
        ...c,
        [id]: { ...primerIntento(texto, brief.oferta), ...leido },
      }));
    } catch {
      setFallo('No pude escribir el titular. Vuelve a tocar el botón.');
    } finally {
      setArmandoCampos(null);
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
      void guardarTrabajoDeCampanas(clienteId, 'anuncios', nuevo);
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
    void guardarTrabajoDeCampanas(clienteId, 'brief', b);
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

  // Tres pantallas, una idea por pantalla: el brief, las piezas, el paquete.
  // Antes era un solo scroll enorme: nadie sabía dónde estaba parado.
  const PANTALLAS = [
    { id: 'brief' as const, label: 'Tu brief' },
    { id: 'piezas' as const, label: 'Tus 3 anuncios' },
    { id: 'paquete' as const, label: 'Para encender' },
  ];
  const [pantalla, setPantalla] = useState<'brief' | 'piezas' | 'paquete'>('brief');
  const iPantalla = PANTALLAS.findIndex((x) => x.id === pantalla);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-gold mb-1">El Constructor</p>
        <h2 className="text-[26px] leading-tight text-cream" style={{ fontFamily: 'var(--font-display)' }}>Tus 3 anuncios</h2>
        <p className="text-sm text-cream/60 mt-1">Tres fórmulas que atacan distinto, completadas con TU caso. La regla: una de piedras, una de dolor o historia, una de resultado.</p>
      </div>

      <div>
        <div className="flex items-center gap-2">
          {PANTALLAS.map((x, n) => (
            <div key={x.id} className="flex-1 h-1.5 rounded-full"
              style={{ background: n <= iPantalla ? 'var(--oro-d, #8E6824)' : 'var(--line, #EBE1CF)' }} />
          ))}
        </div>
        <p className="mt-2 text-[15px] font-semibold text-cream">
          {PANTALLAS[iPantalla]?.label} · paso {iPantalla + 1} de {PANTALLAS.length}
        </p>
      </div>

      {pantalla === 'brief' && (<>
      {/* EL BRIEF */}
      <div className="card-panel p-5">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-cream/60 mb-1">
          1 · Tu brief{faltantes.length === 0 ? ' — lo trajimos de tu ADN, ajústalo' : ''}
        </p>
        {faltantes.length > 0 && (
          <div className="mb-4 mt-2 rounded-xl border border-gold/25 bg-gold/5 px-4 py-3">
            <p className="text-sm text-cream font-semibold mb-1">
              Todavía no puedo traerlo de tu ADN.
            </p>
            <p className="text-sm text-cream/70 mb-2">
              Estos anuncios salen de lo que ya sellaste en tu Camino. Te
              {faltantes.length === 1 ? ' falta esta sesión' : ` faltan ${faltantes.length} sesiones`}:
            </p>
            <ul className="space-y-1">
              {faltantes.map((k) => (
                <li key={k} className="text-sm text-gold">· {VOC(ORIGEN[k])}</li>
              ))}
            </ul>
            <p className="text-sm text-cream/50 mt-2">
              Puedes escribirlo a mano igual — pero si lo sellas en el Camino, entra solo y queda en tu ADN.
            </p>
          </div>
        )}
        <div className="grid sm:grid-cols-2 gap-4">
          {CAMPOS.map((c) => (
            <div key={c.k} className={c.k === 'avatar' || c.k === 'oferta' ? 'sm:col-span-2' : ''}>
              <p className="text-sm font-semibold text-cream mb-1">{c.label}</p>
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

      </>)}

      {pantalla === 'piezas' && (<>
      {/* LO QUE LA APP ELIGIÓ POR TI */}
      <div className="card-panel p-5">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-cream/60 mb-1">
          2 · Tus 3 anuncios
        </p>
        <p className="text-sm text-cream/55 mb-4">{VOC('Elegidas con lo que ya sellaste. Una ataca lo que tu {{consultante}} probó, otra su dolor y otra tu resultado: si las tres dijeran lo mismo, no sabrías cuál funcionó.')}</p>

        <div className="space-y-2.5">
          {FAMILIAS.map((fam) => {
            const r = recomendado[fam];
            const cambiada = elegidas[fam] !== r.id;
            const f = formulaPorId(elegidas[fam])!;
            return (
              <div key={fam} className="rounded-xl border border-gold/25 bg-gold/[0.04] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-gold/70 mb-1">
                  {NOMBRE_FAMILIA[fam]}
                </p>
                <p className="text-sm font-semibold text-cream mb-1">
                  {f.id} · {f.nombre}
                  {cambiada && <span className="text-xs text-cream/40 font-normal ml-2">— la cambiaste tú</span>}
                </p>
                <p className="text-sm text-cream/70">{cambiada ? f.cuando : r.porQue}</p>
              </div>
            );
          })}
        </div>

        {/* Lo que todavía no le sirve, con el motivo */}
        {bloqueadas.length > 0 && (
          <div className="mt-4 rounded-xl border border-cream/12 p-4">
            <p className="text-sm text-cream/55 mb-2">
              Hay {bloqueadas.length} fórmulas que todavía no te conviene usar:
            </p>
            <ul className="space-y-1.5">
              {bloqueadas.map((b) => (
                <li key={b.id} className="text-sm text-cream/60">
                  <strong className="text-cream/80">{b.nombre}</strong> — {b.porQue}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* La puerta a las 18, para quien ya tiene criterio */}
        <button onClick={() => setVerTodas((v) => !v)}
          className="text-sm text-cream/45 underline underline-offset-2 mt-4">
          {verTodas ? 'Ocultar las demás' : 'Prefiero elegirlas yo'}
        </button>

        {verTodas && (
          <div className="grid sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-cream/10">
            {FAMILIAS.map((fam) => (
              <div key={fam}>
                <p className="text-sm font-semibold text-gold mb-2">{NOMBRE_FAMILIA[fam]}</p>
                <div className="space-y-1.5">
                  {FAMILIAS_TEST[fam].map((id) => {
                    const f = formulaPorId(id)!;
                    const impedida = bloqueadas.find((b) => b.id === id);
                    const activa = elegidas[fam] === id;
                    const sugerida = recomendado[fam].id === id;
                    return (
                      <button key={id} onClick={() => elegir(fam, id)}
                        className={`w-full text-left rounded-xl border px-3 py-2 text-sm transition ${
                          activa ? 'border-gold/60 bg-gold/10 text-cream'
                                 : 'border-cream/12 text-cream/60 hover:border-cream/30'}`}>
                        <span className="font-semibold">{f.id} · {f.nombre}</span>
                        {sugerida && <span className="block text-xs text-gold/70 mt-0.5">La que te recomendamos</span>}
                        {impedida && <span className="block text-xs text-danger/80 mt-0.5">{impedida.porQue}</span>}
                        {activa && !sugerida && <span className="block text-xs text-cream/50 mt-0.5">{f.cuando}</span>}
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
      {fallo && <p className="text-sm text-danger">{fallo}</p>}

      {/* CÓMO FUNCIONA LA AUDITORÍA — solo cuando ya hay algo que auditar.
          Antes no se explicaba en ninguna parte quién aprobaba qué, así que el
          cliente leía «todavía no está lista» y suponía que lo miraba alguien. */}
      {FAMILIAS.some((f) => piezas[elegidas[f]]?.texto) && (
        <div className="card-panel p-5">
          <p className="text-sm font-bold text-cream mb-3">Cómo se aprueba un anuncio</p>
          <div className="space-y-3">
            {COMO_FUNCIONA_LA_AUDITORIA.map((x) => (
              <div key={x.titulo}>
                <p className="text-sm font-bold text-gold/80">{x.titulo}</p>
                <p className="text-sm text-cream/70 leading-relaxed">{x.texto}</p>
              </div>
            ))}
          </div>
        </div>
      )}

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
        /** El veredicto vive en `aprobacionAnuncio.ts`, no acá: antes esta
         *  cuenta estaba escrita en el JSX y por eso nadie vio que la única
         *  salida era volver a escribir el anuncio. */
        const estado = estadoDePieza({
          audit,
          bloqueantes: bloqueantes.length,
          alertasMeta: rev?.alertasMeta?.length ?? 0,
          aprobadaAMano: estaAprobada(aprobadas, pieza.formulaId, pieza.texto),
        });
        const listaParaPublicar = estado.sePuedePublicar;
        return (
          <div key={fam} className="card-panel p-5">
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="text-sm font-bold text-cream">{f.id} · {f.nombre}</p>
              <BotonCopiar
                texto={pieza.texto}
                disabled={!listaParaPublicar}
                title={listaParaPublicar ? '' : estado.queSigue}
                className="min-h-[44px] px-3 inline-flex items-center gap-1.5 text-[17px] font-bold text-gold shrink-0 disabled:opacity-30 disabled:cursor-not-allowed" />
            </div>
            {carrusel.problema ? (
              <>
                <pre className="whitespace-pre-wrap text-sm text-cream/85 font-[inherit] leading-relaxed">{pieza.texto}</pre>
                <p className="text-sm text-gold mt-2">{carrusel.problema}</p>
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
                      <span className="text-xs uppercase tracking-[0.2em] text-cream/45">
                        {l.tipo === 'portada' ? 'Portada' : l.tipo === 'cierre' ? 'Cierre' : `Lámina ${l.n}`}
                        {l.larga && <span className="text-gold ml-2">· muy larga para el teléfono</span>}
                      </span>
                      <BotonCopiar texto={l.texto} className="min-h-[44px] px-2 inline-flex items-center gap-1.5 text-[17px] font-bold text-gold shrink-0" />
                    </div>
                    <p className="text-sm text-cream/85 whitespace-pre-wrap leading-relaxed">{l.texto}</p>
                  </div>
                ))}

                {carrusel.caption && (
                  <div className="rounded-xl border border-cream/12 p-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs uppercase tracking-[0.2em] text-cream/45">
                        Texto del post
                      </span>
                      <BotonCopiar texto={carrusel.caption} className="min-h-[44px] px-2 inline-flex items-center gap-1.5 text-[17px] font-bold text-gold shrink-0" />
                    </div>
                    <p className="text-sm text-cream/85 whitespace-pre-wrap leading-relaxed">{carrusel.caption}</p>
                  </div>
                )}

                {!carrusel.palabraPresente && (
                  <p className="text-sm text-danger/85">
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
                <p className="text-sm font-bold uppercase tracking-wider mb-2 text-cream/70">
                  {bloqueantes.length > 0
                    ? 'Esto no se puede publicar así'
                    : 'Revisa esto antes de publicar'}
                </p>
                <div className="space-y-2.5">
                  {politicas.map((a) => (
                    <div key={a.id}>
                      <p className="text-sm text-cream/85">
                        <strong className={a.gravedad === 'bloquea' ? 'text-danger' : 'text-gold'}>
                          «{a.que}»
                        </strong> — {a.porQue}
                      </p>
                      <p className="text-sm text-cream/55 mt-0.5">{a.comoSeArregla}</p>
                      <p className="text-xs text-cream/35 mt-0.5 italic">{a.fragmento}</p>
                    </div>
                  ))}
                </div>
                {bloqueantes.length > 0 && (
                  <p className="text-sm text-cream/45 mt-2.5 border-t border-cream/10 pt-2">
                    Lo que está en juego es tu cuenta publicitaria. Recuperarla lleva semanas.
                  </p>
                )}
              </div>
            )}

            <div className={`mt-3 rounded-xl border p-3 ${
              estado.veredicto === 'bloqueada' ? 'border-danger/45 bg-danger/[0.07]'
              : listaParaPublicar ? 'border-success/25 bg-success/[0.05]'
              : 'border-gold/30 bg-gold/[0.05]'}`}>
              <p className="text-sm font-bold uppercase tracking-wider mb-1 text-cream/70">
                {estado.titulo}
              </p>
              {/* Lo que sigue, SIEMPRE. El cartel viejo decía «todavía no está
                  lista» y ahí terminaba: el cliente quedaba mirando una pieza
                  escrita sin saber qué se esperaba de él. */}
              <p className="text-sm text-cream/80">{estado.queSigue}</p>
              <p className="text-sm text-cream/60 mt-1">{audit.nota}</p>
              {audit.faltantes.length > 0 && (
                <p className="text-sm text-cream/60 mt-1">Le falta: {audit.faltantes.join(' · ')}</p>
              )}

              {/* SALIDA 1 · Que se lo escriba: otro modelo, y escribe lo que falta */}
              {audit.faltantes.length > 0 && !rev && (
                <button onClick={() => void revisar(pieza.formulaId, pieza.texto)}
                  disabled={revisando === pieza.formulaId}
                  className="mt-3 w-full min-h-[44px] rounded-lg border border-gold/40 text-gold text-sm font-bold disabled:opacity-50">
                  {revisando === pieza.formulaId ? 'Revisando…' : 'Que la revise y escriba lo que falta'}
                </button>
              )}

              {/* SALIDA 2 · La que no existía. Los ocho ingredientes se detectan
                  por las palabras con que SUELEN escribirse: quien escribió su
                  analogía con otras palabras quedaba trabado para siempre, y el
                  botón de copiar deshabilitado. El que decide es el que escribe. */}
              {estado.puedeAprobarAMano && (
                <button
                  onClick={() => setAprobadas((a) => aprobar(a, pieza.formulaId, pieza.texto))}
                  className="mt-2 w-full min-h-[44px] rounded-lg border border-success/40 text-success text-sm font-bold">
                  Ya está como la quiero · aprobarla igual
                </button>
              )}

              {estado.veredicto === 'aprobada_a_mano' && (
                <button
                  onClick={() => setAprobadas((a) => desaprobar(a, pieza.formulaId))}
                  className="mt-2 min-h-[44px] text-sm font-bold text-cream/55">
                  Deshacer mi aprobación
                </button>
              )}

              {rev?.problema && (
                <p className="text-sm text-danger/85 mt-2">{rev.problema}</p>
              )}

              {rev?.alertasMeta && rev.alertasMeta.length > 0 && (
                <div className="mt-3 rounded-lg border border-danger/40 bg-danger/[0.06] p-3">
                  <p className="text-sm font-bold uppercase tracking-wider text-danger mb-1">
                    Esto te lo pueden rechazar
                  </p>
                  <ul className="space-y-1">
                    {rev.alertasMeta.map((a, i) => (
                      <li key={i} className="text-sm text-cream/85">· {a}</li>
                    ))}
                  </ul>
                </div>
              )}

              {rev?.correcciones && rev.correcciones.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm text-cream/55">
                    Escribe lo que faltaba. Míralo y agrégalo si te suena tuyo:
                  </p>
                  {rev.correcciones.map((c) => (
                    <div key={c.ingrediente} className="rounded-lg border border-cream/12 p-3">
                      <p className="text-xs uppercase tracking-wider text-gold/70 mb-1">
                        {c.ingrediente}{c.donde ? ` · ${c.donde}` : ''}
                      </p>
                      <p className="text-sm text-cream/85 mb-2">{c.linea}</p>
                      <button onClick={() => aplicar(pieza.formulaId, c.linea, c.ingrediente, c.posicion)}
                        className="text-sm font-bold text-gold">
                        Agregarlo a mi anuncio
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {rev?.correcciones && rev.correcciones.length === 0 && !rev.problema && (
                <p className="text-sm text-cream/55 mt-2">
                  El revisor no encontró nada más que agregar.
                </p>
              )}
            </div>

            {/* LOS TRES CAMPOS QUE META PIDE ────────────────────────────────
                Solo cuando la pieza ya se puede publicar: antes de eso el
                titular sale de un anuncio que todavía va a cambiar. */}
            {listaParaPublicar && (() => {
              const c = campos[pieza.formulaId] ?? primerIntento(pieza.texto, brief.oferta);
              const revisados = revisarCampos(c);
              return (
                <div className="mt-3 rounded-xl border border-cream/12 p-3">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <p className="text-sm font-bold uppercase tracking-wider text-cream/70">
                      Para pegar en Meta
                    </p>
                    <BotonCopiar texto={paraPegar(c)}
                      className="min-h-[44px] px-2 inline-flex items-center gap-1.5 text-sm font-bold text-gold shrink-0" />
                  </div>
                  <p className="text-sm text-cream/55 leading-relaxed mb-3">
                    Meta pide tres campos, no uno. En el reel el titular y la descripción
                    casi no se ven, pero el mismo anuncio aparece en Feed y en Explorar,
                    donde sí. Lo que decide en el reel son tus tres primeros segundos.
                  </p>

                  <div className="space-y-2.5">
                    {revisados.map((x) => (
                      <div key={x.id}>
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-xs uppercase tracking-wider text-gold/70">
                            {x.etiqueta}
                          </span>
                          <BotonCopiar texto={x.valor}
                            className="min-h-[44px] px-2 inline-flex items-center gap-1.5 text-sm font-bold text-gold shrink-0" />
                        </div>
                        <p className="text-sm text-cream/85 whitespace-pre-wrap leading-relaxed">
                          {x.valor || '—'}
                        </p>
                        {x.aviso && <p className="text-sm text-gold mt-0.5">{x.aviso}</p>}
                        <p className="text-sm text-cream/45 mt-0.5 leading-relaxed">{x.dondeSeVe}</p>
                      </div>
                    ))}
                  </div>

                  <button onClick={() => void pedirCampos(pieza.formulaId, pieza.texto)}
                    disabled={armandoCampos === pieza.formulaId}
                    className="mt-3 w-full min-h-[44px] rounded-lg border border-gold/40 text-gold text-sm font-bold disabled:opacity-50">
                    {armandoCampos === pieza.formulaId
                      ? 'Escribiendo…'
                      : campos[pieza.formulaId]
                        ? 'Escribir otro titular'
                        : 'Que escriba el titular y la descripción'}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      })}

      {stories && (
        <div className="card-panel p-5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <p className="text-sm font-bold text-cream">12 · La secuencia de 3 stories — acompaña siempre</p>
            <BotonCopiar texto={stories} className="min-h-[44px] px-3 inline-flex items-center gap-1.5 text-[17px] font-bold text-gold shrink-0" />
          </div>
          <pre className="whitespace-pre-wrap text-sm text-cream/85 font-[inherit] leading-relaxed">{stories}</pre>
          <p className="text-sm text-cream/45 mt-2">Se publican el mismo día, con horas de diferencia. Repetible 2-3 veces por semana con distinto ángulo.</p>
        </div>
      )}

      {listas && (
        <p className="text-sm text-cream/55 text-center">Tus 3 anuncios están listos. El paso que sigue vive en tu Camino: grabarlos y montar tu campaña.</p>
      )}

      </>)}

      {pantalla === 'paquete' && (<>
      {/* EL PAQUETE — todo junto, listo para encender */}
      {paquete.piezas.some((x) => x.contenido) && (
        <div className="card-panel p-5">
          <div className="flex items-start justify-between gap-3 mb-1">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-cream/60">
                4 · Tu paquete para encender
              </p>
              <p className="text-sm text-cream/55 mt-1">
                Todo lo que necesitas, junto. No hace falta que armes nada a mano.
              </p>
            </div>
            {paquete.textoCompleto && (
              <BotonCopiar texto={paquete.textoCompleto} etiqueta="Copiar todo"
                className="min-h-[44px] px-3 inline-flex items-center gap-1.5 text-[17px] font-bold text-gold shrink-0" />
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
                    {!x.obligatoria && <span className="text-xs text-cream/35 ml-2">opcional</span>}
                  </span>
                  {x.contenido && (
                    <BotonCopiar texto={x.contenido}
                      className="min-h-[44px] px-2 inline-flex items-center gap-1.5 text-[17px] font-bold text-gold shrink-0" />
                  )}
                </div>
                {x.aviso && <p className="text-sm text-danger/85 mt-1">{x.aviso}</p>}
                {!x.contenido && <p className="text-sm text-cream/45 mt-1">{x.donde}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
      </>)}

      {/* Anterior y siguiente: el constructor se recorre */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setPantalla(PANTALLAS[Math.max(0, iPantalla - 1)].id)}
          disabled={iPantalla === 0}
          className="min-h-[52px] rounded-[20px] border border-[var(--line2,#DFD3BC)] text-[17px] font-semibold text-cream disabled:opacity-40"
        >
          ‹ Anterior
        </button>
        <button
          type="button"
          onClick={() => setPantalla(PANTALLAS[Math.min(PANTALLAS.length - 1, iPantalla + 1)].id)}
          disabled={iPantalla >= PANTALLAS.length - 1}
          className="min-h-[52px] rounded-[20px] border border-[var(--line2,#DFD3BC)] text-[17px] font-semibold text-cream disabled:opacity-40"
        >
          Siguiente ›
        </button>
      </div>
    </div>
  );
}
