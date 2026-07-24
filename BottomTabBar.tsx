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
  LAS_7_REGLAS, REGLAS_META, auditarPieza, formulaPorId,
  type FamiliaFormula, type FormulaAnuncio,
} from '../../lib/formulasAnuncios';
import { generateText } from '../../lib/aiProvider';

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

/** Mejor esfuerzo: junta lo que la app ya sabe. Todo queda editable. */
function briefDesdeADN(): Brief {
  const guardado = leerJSON<Partial<Brief>>(BRIEF_KEY, {});
  const perfil = leerJSON<Record<string, unknown>>('tcd_profile', {});
  const notas = leerJSON<Record<string, string>>('tcd_notas_sesion_v1', {});
  const str = (v: unknown) => String(v ?? '').trim();
  return {
    avatar: guardado.avatar ?? str(perfil.adn_avatar) ?? '',
    piedras: guardado.piedras ?? str(notas['P0.3']).slice(0, 400),
    frases: guardado.frases ?? str(notas['P2.3b']).slice(0, 400),
    prueba: guardado.prueba ?? '',
    metodo: guardado.metodo ?? str(perfil.metodo_nombre ?? perfil.adn_metodo),
    oferta: guardado.oferta ?? str(perfil.oferta ?? perfil.adn_oferta),
    palabra: guardado.palabra ?? '',
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

type Familia3 = Exclude<FamiliaFormula, 'acompana'>;
const FAMILIAS: Familia3[] = ['piedras', 'dolor_historia', 'resultado_metodo'];

interface Pieza { formulaId: number; texto: string }

export default function ConstructorAnuncios() {
  const [brief, setBrief] = useState<Brief>(() => briefDesdeADN());
  const [sel, setSel] = useState<Record<Familia3, number>>(() =>
    leerJSON(OUT_KEY + '_sel', { piedras: 1, dolor_historia: 15, resultado_metodo: 10 }));
  const [piezas, setPiezas] = useState<Record<number, Pieza>>(() => leerJSON(OUT_KEY, {}));
  const [stories, setStories] = useState<string>(() => leerJSON(OUT_KEY + '_st', ''));
  const [generando, setGenerando] = useState<string | null>(null);
  const [fallo, setFallo] = useState<string | null>(null);

  const sinPrueba = !brief.prueba.trim();

  const setCampo = (k: keyof Brief, v: string) => {
    const b = { ...brief, [k]: v };
    setBrief(b);
    try { localStorage.setItem(BRIEF_KEY, JSON.stringify(b)); } catch { /* noop */ }
  };

  const elegir = (fam: Familia3, id: number) => {
    const s = { ...sel, [fam]: id };
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
    const ids = [sel.piedras, sel.dolor_historia, sel.resultado_metodo];
    for (const id of ids) {
      const f = formulaPorId(id);
      if (!f) continue;
      setGenerando(f.nombre);
      try {
        const texto = await generateText({
          systemInstruction: 'Eres un redactor de anuncios de venta directa en castellano neutro. Sigues la fórmula al pie de la letra. Nunca inventas datos ni pruebas.',
          prompt: promptDe(f),
        });
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
      const st = await generateText({
        systemInstruction: 'Eres un redactor de anuncios en castellano neutro. Texto plano.',
        prompt: `Escribe la secuencia de 3 stories (texto sobre fondo, sin cámara) para acompañar la campaña.\nEstructura: ${FORMULA_STORIES.estructura.join(' | ')}\nBrief: método ${brief.metodo || '[MI MÉTODO]'} · oferta ${brief.oferta || '(cupos limitados)'} · cliente ${brief.avatar || '(quien atiende uno a uno)'} · palabra ${brief.palabra || 'PALABRA'}.\nFormato: STORY 1: … / STORY 2: … / STORY 3: …`,
      });
      const limpio = String(st ?? '').trim();
      setStories(limpio);
      try { localStorage.setItem(OUT_KEY + '_st', JSON.stringify(limpio)); } catch { /* noop */ }
    } catch { /* las stories no frenan el resultado principal */ }
    setGenerando(null);
  };

  const listas = FAMILIAS.every((f) => piezas[sel[f]]?.texto);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold mb-1">El Constructor</p>
        <h2 className="text-xl text-cream" style={{ fontFamily: 'var(--font-display)' }}>Tus 3 anuncios</h2>
        <p className="text-sm text-cream/60 mt-1">Tres fórmulas que atacan distinto, completadas con TU caso. La regla: una de piedras, una de dolor o historia, una de resultado.</p>
      </div>

      {/* EL BRIEF */}
      <div className="card-panel p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-cream/60 mb-3">1 · Tu brief — lo trajimos de tu ADN, ajústalo</p>
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

      {/* LA ELECCIÓN 1+1+1 */}
      <div className="card-panel p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-cream/60 mb-3">2 · Tus 3 fórmulas — una por familia</p>
        <div className="grid sm:grid-cols-3 gap-4">
          {FAMILIAS.map((fam) => (
            <div key={fam}>
              <p className="text-xs font-semibold text-gold mb-2">{NOMBRE_FAMILIA[fam]}</p>
              <div className="space-y-1.5">
                {FAMILIAS_TEST[fam].map((id) => {
                  const f = formulaPorId(id)!;
                  const advertir = sinPrueba && (id === 4 || id === 9);
                  const activa = sel[fam] === id;
                  return (
                    <button key={id} onClick={() => elegir(fam, id)}
                      className={`w-full text-left rounded-xl border px-3 py-2 text-xs transition-colors ${activa ? 'border-gold/60 bg-gold/[0.08] text-cream' : 'border-cream/10 text-cream/70 hover:border-cream/25'}`}>
                      <span className="font-semibold">{f.id} · {f.nombre}</span>
                      {advertir && <span className="block text-[10px] text-danger/80 mt-0.5">Necesita prueba real — sin ella, mejor la {fam === 'dolor_historia' ? '15' : '18'}</span>}
                      {activa && <span className="block text-[10px] text-cream/50 mt-0.5">{f.cuando}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* GENERAR */}
      <button onClick={() => void generar()} disabled={!!generando}
        className="w-full btn-primary py-3.5 rounded-xl text-sm font-bold disabled:opacity-60">
        {generando ? `Escribiendo: ${generando}…` : '✨ Generar mis 3 anuncios + stories'}
      </button>
      {fallo && <p className="text-xs text-danger">{fallo}</p>}

      {/* LAS PIEZAS */}
      {FAMILIAS.map((fam) => {
        const pieza = piezas[sel[fam]];
        if (!pieza) return null;
        const f = formulaPorId(pieza.formulaId)!;
        const audit = auditarPieza(pieza.texto);
        return (
          <div key={fam} className="card-panel p-5">
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="text-sm font-bold text-cream">{f.id} · {f.nombre}</p>
              <button onClick={() => void navigator.clipboard?.writeText(pieza.texto)}
                className="text-[11px] font-bold text-gold hover:text-goldhi shrink-0">Copiar ↗</button>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-cream/85 font-[inherit] leading-relaxed">{pieza.texto}</pre>
            <div className={`mt-3 rounded-xl border p-3 ${audit.aprobada ? 'border-success/25 bg-success/[0.05]' : 'border-danger/25 bg-danger/[0.05]'}`}>
              <p className="text-[11px] font-bold uppercase tracking-wider mb-1 text-cream/70">Auditoría de ingredientes</p>
              <p className="text-xs text-cream/70">{audit.nota}</p>
              {!audit.aprobada && <p className="text-xs text-cream/60 mt-1">Faltan: {audit.faltantes.join(' · ')}</p>}
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
    </div>
  );
}
