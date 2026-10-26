/**
 * CreadorContenido.tsx — Creador de Contenido (v8)
 *
 * Tab nuevo introducido por v8 (mejoras.html · Anexo Cambio #10).
 *
 * Se abre al cerrar el tramo `PILAR_LLAVE` del Camino, que es donde queda
 * definido a quién le habla: antes de eso el creador no tiene con qué
 * escribir. El comentario viejo decía «Matriz A→B→C lista», y esa jornada ya
 * no existe en ningún tramo — ver `comoSeLlamaElTramo` en el seed.
 *
 * Regla v8 #3: este creador NO escribe en ADN. Sólo genera output para que
 * el sanador lo copie y publique manualmente. Si más adelante quiere persistir
 * borradores, va en otra tabla (no en `profiles`).
 *
 * Genera 3 tipos de pieza:
 *  - Post (Instagram/feed)
 *  - Carrusel (10 slides)
 *  - Prompt para imagen (a copiar a Midjourney/DALL-E/etc)
 *
 * Inputs del usuario:
 *  - Tipo de pieza
 *  - Nivel de awareness del avatar (N1 toma de conciencia · N2 protocolo de entrada · N3 venta directa)
 *  - Tema concreto (qué objeción, dolor o aspecto del método quiere abordar)
 *
 * Inputs implícitos (desde ADN):
 *  - Matriz A (dolores), B (obstáculos), C (transformación)
 *  - Nombre del método, pasos
 *  - Oferta principal (Mid)
 *  - Voz del fundador (historia, propósito)
 */

import { useEffect, useMemo, useState } from 'react';
import {
  Sparkles,
  PenLine,
  Image as ImageIcon,
  Layers,
  Copy,
  Loader2,
  CheckCircle2,
  RotateCcw,
  Lock,
  ArrowRight,
} from 'lucide-react';
import Markdown from 'react-markdown';
import { toast } from 'sonner';
import { mensajeDeFalla } from '../lib/conexion';
import type { ProfileV2 } from '../lib/supabase';
import { supabase, isSupabaseReady } from '../lib/supabase';
import { generateText } from '../lib/aiProvider';
import { getCompletadas, isPilarCompletado } from '../lib/agents/unlock';
import { comoSeLlamaElTramo } from '../lib/roadmapSeed';
import { primero } from '../lib/primero';
import { VOC } from '../lib/vocabulario';
import { copiar, NO_SE_PUDO_COPIAR } from '../lib/copiar';
import { unirProgreso, guardarProgresoLocal } from '../lib/progresoDelCliente';

interface CreadorContenidoProps {
  userId?: string;
  perfil?: Partial<ProfileV2>;
  setCurrentPage?: (page: string) => void;
}

type TipoPieza = 'post' | 'carrusel' | 'imagen';
type NivelAwareness = 'N1' | 'N2' | 'N3';

const TIPO_META: Record<TipoPieza, { label: string; icon: typeof PenLine; descripcion: string }> = {
  post: {
    label: 'Post (feed)',
    icon: PenLine,
    descripcion: 'Texto corto para Instagram / LinkedIn. 150-300 palabras con hook fuerte y CTA.',
  },
  carrusel: {
    label: 'Carrusel (10 slides)',
    icon: Layers,
    descripcion: 'Estructura completa para Instagram. Slide 1 (hook visual) → slides 2-9 (desarrollo) → slide 10 (CTA).',
  },
  imagen: {
    label: 'Prompt de imagen',
    icon: ImageIcon,
    descripcion: 'Prompt detallado para Midjourney / DALL-E / Sora. Especifica estilo, composición, paleta.',
  },
};

const NIVEL_META: Record<NivelAwareness, { label: string; descripcion: string }> = {
  N1: {
    label: 'N1 · Toma de conciencia',
    descripcion: 'El avatar está en A (no sabe que tiene el problema). Habla de dolores generales.',
  },
  N2: {
    label: 'N2 · Lead magnet',
    descripcion: 'El avatar está en B (sabe pero no avanza). Ofrece tu protocolo de entrada para activar conversación.',
  },
  N3: {
    label: 'N3 · Venta directa',
    descripcion: 'El avatar te conoce. Retargeting / venta de tu oferta principal.',
  },
};

function buildPrompt(
  tipo: TipoPieza,
  nivel: NivelAwareness,
  tema: string,
  perfil: Partial<ProfileV2>,
): string {
  const contexto = [
    `Profesión: ${primero(perfil.especialidad) || 'profesional de la salud'}`,
    perfil.metodo_nombre ? `Método propio: ${perfil.metodo_nombre}` : '',
    perfil.metodo_pasos ? `Pasos del método: ${perfil.metodo_pasos}` : '',
    perfil.matriz_a ? `Matriz A (dolores del avatar): ${perfil.matriz_a}` : '',
    perfil.matriz_b ? `Matriz B (obstáculos): ${perfil.matriz_b}` : '',
    perfil.matriz_c ? `Matriz C (transformación): ${perfil.matriz_c}` : '',
    perfil.adn_usp ? `PUV: ${perfil.adn_usp}` : '',
    perfil.historia_50 ? `Historia personal corta: ${perfil.historia_50}` : '',
    perfil.proposito ? `Propósito: ${perfil.proposito}` : '',
    perfil.oferta_mid ? `Oferta principal (Mid): ${perfil.oferta_mid}` : '',
  ].filter(Boolean).join('\n');

  const nivelExplicacion = NIVEL_META[nivel].descripcion;

  if (tipo === 'post') {
    return `Genera un post para feed de Instagram de un profesional de la salud.

CONTEXTO DEL PROFESIONAL:
${contexto}

NIVEL DE AWARENESS: ${nivel}
${nivelExplicacion}

TEMA / ÁNGULO: ${tema}

FORMATO:
- Hook potente en los primeros 50 caracteres (paro el scroll)
- Desarrollo en 150-250 palabras
- Tono empático, en voz propia (NO marketinero)
- CTA al final acorde al nivel N${nivel.slice(1)}
- Sin emojis decorativos al inicio. Pueden usarse con criterio en el cuerpo.

NO escribas hashtags al final. NO uses promesas exageradas.`;
  }

  if (tipo === 'carrusel') {
    return `Genera un carrusel de 10 slides para Instagram de un profesional de la salud.

CONTEXTO DEL PROFESIONAL:
${contexto}

NIVEL DE AWARENESS: ${nivel}
${nivelExplicacion}

TEMA / ÁNGULO: ${tema}

FORMATO (cada slide titulado "Slide N · ..."):
- Slide 1: hook visual + título con curiosidad
- Slide 2: el problema en lenguaje del avatar
- Slide 3-4: por qué no funciona lo que vienen probando
- Slide 5-6: tu mirada / método (sin nombrar producto)
- Slide 7-8: aplicación práctica · pasos concretos
- Slide 9: caso o resultado real
- Slide 10: CTA acorde al nivel

Para cada slide: 30-50 palabras máximo. Tono empático, voz propia.`;
  }

  // imagen
  return `Genera un prompt detallado para Midjourney/DALL-E/Sora que acompañe contenido de Instagram de un profesional de la salud.

CONTEXTO DEL PROFESIONAL:
${contexto}

NIVEL DE AWARENESS: ${nivel}
TEMA / ÁNGULO: ${tema}

FORMATO DEL PROMPT:
- En inglés (para mejor performance de modelos de imagen)
- Especifica: composición, sujeto, estilo visual, paleta (alineada a la identidad del profesional si está definida en el ADN), iluminación, mood, aspect ratio (--ar 4:5 para feed o --ar 9:16 para reels/stories)
- Evita texto en la imagen
- Tono profesional pero humano (no stock photo genérico)

Devolveme el prompt listo para copiar.`;
}


/** Parsea el output de un carrusel en slides (Slide 1: ... / SLIDE 1 ...). */
function parseSlides(texto: string): { n: number; contenido: string }[] {
  const partes = texto.split(/(?:^|\n)\s*(?:\*\*)?(?:Slide|SLIDE)\s*(\d+)\s*(?:\*\*)?\s*[:·—-]?\s*/);
  const slides: { n: number; contenido: string }[] = [];
  for (let i = 1; i < partes.length; i += 2) {
    const n = parseInt(partes[i], 10);
    const contenido = (partes[i + 1] ?? '').trim().replace(/\*\*/g, '');
    if (n >= 1 && n <= 12 && contenido) slides.push({ n, contenido });
  }
  return slides;
}

/** Las 10 tarjetas estilo Instagram — el carrusel VISTO, no leído. */
function CarruselPreview({ texto }: { texto: string }) {
  const slides = parseSlides(texto);
  if (slides.length < 3) return null;
  return (
    <div className="mb-6">
      <p className="text-sm font-bold uppercase tracking-[0.3em] text-gold mb-3">Así se ve tu carrusel</p>
      <div className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory">
        {slides.map((s) => (
          <div key={s.n} className="snap-start shrink-0 w-[240px] h-[240px] rounded-2xl border border-[var(--line2, rgba(142,104,36,0.30))] bg-[var(--bg-card,#17150F)] p-4 flex flex-col relative overflow-hidden" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.35)' }}>
            <span className="absolute top-3 right-3 text-sm font-bold text-gold/60 num-tab">{s.n}/{slides.length}</span>
            <div className="flex-1 flex items-center">
              <p className={`leading-snug text-cream ${s.n === 1 ? 'text-base font-semibold' : 'text-[15px] text-cream/85'}`} style={s.n === 1 ? { fontFamily: 'var(--font-display)', fontStyle: 'italic' } : undefined}>
                {s.contenido.length > 200 ? s.contenido.slice(0, 200) + '…' : s.contenido}
              </p>
            </div>
            {s.n === slides.length && <p className="text-sm font-bold uppercase tracking-widest text-gold mt-2">→ Tu llamado a la acción</p>}
            {/* La línea de oro es de 1px y plana: la vara de la casa no degrada el oro. */}
            <div className="absolute bottom-0 left-0 w-1/3 h-px" style={{ background: 'var(--oro, #B0822E)' }} />
          </div>
        ))}
      </div>
      {/* Era una instrucción de uso al 35% de opacidad, en itálica: la letra de
                lo que no importa, para lo único que dice cómo se usa esto. Y
                «slides» en inglés, teniendo «láminas». */}
            <p className="text-sm text-cream/75 mt-1">Desliza para ver las {slides.length} láminas · el texto completo queda abajo para copiar.</p>
    </div>
  );
}

/** El tramo del Camino que abre el Creador. En pantalla se nombra por el seed. */
const PILAR_LLAVE = 'P6' as const;

export default function CreadorContenido({ userId, perfil, setCurrentPage }: CreadorContenidoProps) {
  const [tipo, setTipo] = useState<TipoPieza>('post');
  const [nivel, setNivel] = useState<NivelAwareness>('N1');
  const [tema, setTema] = useState('');
  const [output, setOutput] = useState('');
  const [editOutput, setEditOutput] = useState('');
  const [editando, setEditando] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  // ── Lo que lo abre ─────────────────────────────────────────────────────
  // Inicializamos desde localStorage (cache rapido) y refrescamos desde Supabase
  // como fuente autoritativa para que no quede bloqueado el usuario en otro
  // dispositivo o despues de limpiar cache.
  const [completadas, setCompletadas] = useState<Set<string>>(() => getCompletadas());
  const [verificandoUnlock, setVerificandoUnlock] = useState(true);

  useEffect(() => {
    let cancelado = false;
    async function refrescarDesdeDB() {
      if (!isSupabaseReady() || !supabase || !userId) {
        setVerificandoUnlock(false);
        return;
      }
      const { data, error } = await supabase
        .from('hoja_de_ruta')
        .select('pilar_numero, meta_codigo, completada')
        .eq('usuario_id', userId);
      if (cancelado) return;
      if (error || !data) {
        setVerificandoUnlock(false);
        return;
      }
      /*
       * Escribía el resultado de la base TAL CUAL encima del espejo local. La
       * consulta que falla ya estaba cubierta arriba, pero la que responde
       * BIEN con cero filas no lo estaba: escribía `[]` encima de todo. Ahora
       * se une — lo cerrado suma, lo desmarcado abre, y lo que la base no
       * nombra queda como está.
       */
      const unido = unirProgreso(data);
      setCompletadas(unido);
      // Y el espejo local queda al día para las otras pantallas —agentes,
      // barra lateral— sin que tengan que volver a consultar.
      guardarProgresoLocal(unido);
      setVerificandoUnlock(false);
    }
    refrescarDesdeDB();
    return () => {
      cancelado = true;
    };
  }, [userId]);

  /*
   * El tramo que lo abre, nombrado con las palabras del Camino. `PILAR_LLAVE`
   * es el identificador de la base; su nombre en pantalla sale del seed.
   */
  const desbloqueado = useMemo(
    () => isPilarCompletado(PILAR_LLAVE, completadas),
    [completadas],
  );
  const tramoQueLoAbre = useMemo(() => comoSeLlamaElTramo(PILAR_LLAVE), []);

  // Cleanup del feedback de "copiado"
  useEffect(() => {
    if (!copiado) return;
    const t = setTimeout(() => setCopiado(false), 2000);
    return () => clearTimeout(t);
  }, [copiado]);

  const handleGenerar = async () => {
    if (!tema.trim()) {
      toast.error('Escribe un tema o ángulo concreto');
      return;
    }
    setGenerando(true);
    setOutput('');
    try {
      const prompt = buildPrompt(tipo, nivel, tema, perfil ?? {});
      const result = await generateText({ feature: 'creativo', tarea: 'guion',
        prompt,
        systemInstruction:
          'Eres un copywriter especialista en marketing de profesionales de la salud. Tu trabajo es generar contenido auténtico, en la voz del profesional, basado en su método propio y su ADN. Sin promesas exageradas, sin lenguaje marketinero genérico. Empatía primero.',
      });
      setOutput(result);
    } catch (err) {
      toast.error(mensajeDeFalla(err, 'generar el contenido'));
    } finally {
      setGenerando(false);
    }
  };

  const handleCopiar = async () => {
    try {
      const ok = await copiar(editando ? editOutput : output);
      if (!ok) { toast.error(NO_SE_PUDO_COPIAR); return; }
      setCopiado(true);
      toast.success('Copiado al portapapeles');
    } catch {
      toast.error('No se pudo copiar');
    }
  };

  // ── VERIFICANDO UNLOCK (primer fetch a DB) ────────────────────────────
  if (verificandoUnlock && !desbloqueado) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        <div className="card-panel p-8 border border-gold/20 bg-surface/40 text-center space-y-3">
          <Loader2 className="w-6 h-6 text-gold animate-spin mx-auto" />
          <p className="text-sm text-cream/75">Verificando estado del programa…</p>
        </div>
      </div>
    );
  }

  // ── BLOQUEADO ─────────────────────────────────────────────────────────
  if (!desbloqueado) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        {/*
          ESTA PANTALLA ERA UNA NOTA DE DESARROLLO.

          Lo que leía el cliente, textual: «v8 · Herramienta nueva» —el número
          de versión del producto—, «Necesitas completar P6 (Matriz A→B→C)»
          —un identificador de la base, y una jornada que ya no existe en
          ningún tramo del Camino, así que la instrucción no se podía
          seguir—, «NO escribe en tu ADN · sólo genera output», que es la
          regla de arquitectura de por qué no persiste nada, escrita para
          quien programa y no para quien usa.

          Ahora dice lo que hace, con qué se abre —derivado del seed, para que
          siga siendo verdad cuando el camino se reordene— y por qué ese es el
          momento. En positivo y con las palabras del Camino, que ya dice «se
          abre» en todas sus puertas.
        */}
        <div className="space-y-3">
          {/* La barra de arriba dice «Creador». Acá decía «Creador de
              Contenido» otra vez, en treinta y dos píxeles de alto. La
              pantalla abre con lo que hace. */}
          <p className="text-cream/75 max-w-xl">
            Escribe posts, carruseles y pedidos de imagen con lo que ya tienes
            cargado en tu ADN. Lo que sale queda para que lo copies y lo
            publiques desde tu cuenta.
          </p>
        </div>

        <div className="card-panel p-8 border border-gold/20 bg-surface/40 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center">
            <Lock className="w-6 h-6 text-gold" />
          </div>
          <div>
            <p className="text-lg font-medium text-cream">
              {tramoQueLoAbre
                ? `Se abre al cerrar ${tramoQueLoAbre.tramo.toLowerCase()} del Camino`
                : 'Se abre más adelante en el Camino'}
            </p>
            <p className="text-sm text-cream/75 mt-2 max-w-md mx-auto">
              {tramoQueLoAbre ? `${tramoQueLoAbre.sistema}. ` : ''}
              Ahí queda definido a quién le hablas, y eso es lo que este
              creador usa para escribir.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCurrentPage?.('roadmap')}
            className="btn-primary inline-flex items-center gap-2"
          >
            Ir a El Camino
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ── HABILITADO ────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <p className="text-sm text-gold uppercase tracking-widest font-semibold">
          v8 · Herramienta · usa tu ADN
        </p>
        {/* Igual que arriba: el nombre ya está en la barra. */}
        <p className="text-cream/75 max-w-2xl">
          Genera posts, carruseles o prompts de imagen alineados a tu método propio,
          tu avatar y tu nivel de awareness. Esta herramienta NO escribe en tu ADN —
          el output queda acá para que lo copies y publiques.
        </p>
      </div>

      {/* Selector de tipo */}
      <div className="card-panel p-5 space-y-4">
        <p className="text-sm uppercase tracking-widest text-gold font-bold">
          1 · ¿Qué quieres generar?
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(Object.entries(TIPO_META) as [TipoPieza, typeof TIPO_META.post][]).map(
            ([key, meta]) => {
              const Icon = meta.icon;
              const activo = tipo === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTipo(key)}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    activo
                      ? 'bg-gold/10 border-gold/50'
                      : 'bg-surface/40 border-[var(--line, rgba(142,104,36,0.18))] hover:border-gold/30'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 mb-2 ${
                      activo ? 'text-gold' : 'text-cream/75'
                    }`}
                  />
                  <p
                    className={`text-sm font-semibold ${
                      activo ? 'text-cream' : 'text-cream/80'
                    }`}
                  >
                    {meta.label}
                  </p>
                  <p className="text-xs text-cream/65 mt-1 leading-relaxed">
                    {VOC(meta.descripcion)}
                  </p>
                </button>
              );
            },
          )}
        </div>
      </div>

      {/* Selector de nivel */}
      <div className="card-panel p-5 space-y-4">
        <p className="text-sm uppercase tracking-widest text-gold font-bold">
          2 · ¿Para qué nivel de awareness?
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(Object.entries(NIVEL_META) as [NivelAwareness, typeof NIVEL_META.N1][]).map(
            ([key, meta]) => {
              const activo = nivel === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setNivel(key)}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    activo
                      ? 'bg-gold/10 border-gold/50'
                      : 'bg-surface/40 border-[var(--line, rgba(142,104,36,0.18))] hover:border-gold/30'
                  }`}
                >
                  <p
                    className={`text-sm font-semibold ${
                      activo ? 'text-cream' : 'text-cream/80'
                    }`}
                  >
                    {meta.label}
                  </p>
                  <p className="text-xs text-cream/65 mt-1 leading-relaxed">
                    {VOC(meta.descripcion)}
                  </p>
                </button>
              );
            },
          )}
        </div>
      </div>

      {/* Tema */}
      <div className="card-panel p-5 space-y-3">
        <p className="text-sm uppercase tracking-widest text-gold font-bold">
          3 · Tema · ángulo · objeción a abordar
        </p>
        <textarea
          value={tema}
          onChange={(e) => setTema(e.target.value)}
          placeholder='Ej: "el mito de que se necesita más fuerza de voluntad" · "por qué los planes restrictivos fallan" · "qué le digo a alguien que ya probó todo"'
          rows={3}
          className="w-full input-field resize-y text-sm"
        />
      </div>

      {/* Generar */}
      <button
        type="button"
        onClick={handleGenerar}
        disabled={!tema.trim() || generando}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {generando ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generando…
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Generar contenido
          </>
        )}
      </button>

      {/* Output */}
      {output && (
        <div className="card-panel p-5 border border-[var(--line, rgba(142,104,36,0.18))] space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm uppercase tracking-widest text-gold font-bold">
              Resultado · {TIPO_META[tipo].label} · {nivel}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditOutput(output);
                  setEditando(true);
                }}
                className="text-xs text-cream/65 hover:text-cream transition-colors px-3 py-1.5 rounded-lg border border-[var(--line, rgba(142,104,36,0.18))]"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={handleGenerar}
                className="text-xs text-cream/65 hover:text-cream transition-colors px-3 py-1.5 rounded-lg border border-[var(--line, rgba(142,104,36,0.18))] flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Rehacer
              </button>
              <button
                type="button"
                onClick={handleCopiar}
                className="btn-primary text-xs flex items-center gap-1.5"
              >
                {copiado ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copiar
                  </>
                )}
              </button>
            </div>
          </div>

          {editando ? (
            <div className="space-y-3">
              <textarea
                value={editOutput}
                onChange={(e) => setEditOutput(e.target.value)}
                rows={18}
                className="w-full input-field resize-y min-h-[300px] font-mono text-sm"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setEditando(false)}
                  className="btn-secondary text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOutput(editOutput);
                    setEditando(false);
                  }}
                  className="btn-primary text-xs"
                >
                  Aplicar cambios
                </button>
              </div>
            </div>
          ) : (
            <div>
              {tipo === 'carrusel' && <CarruselPreview texto={output} />}
              <div className="prose prose-invert prose-sm max-w-none text-cream/90 leading-relaxed prose-headings:text-gold prose-strong:text-cream prose-strong:font-bold">
                <Markdown>{output}</Markdown>
              </div>
            </div>
          )}
        </div>
      )}

      {/*
        Tres cosas en una frase: «Regla v8» era el número de versión del
        producto, «no escribe en tu ADN» es la razón de arquitectura por la
        que nada se guarda —escrita para quien programa—, y «publicalo» iba
        sin tilde. Todo en itálica al 45%, centrado: la letra con que se
        escribe lo que no importa, para decir lo que el cliente necesita
        saber antes de copiar.
      */}
      <p className="text-sm text-cream/75 text-center pt-4">
        Lo que sale queda acá para que lo copies. Publícalo desde tu cuenta
        cuando estés listo.
      </p>
    </div>
  );
}
