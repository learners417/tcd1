/**
 * TaskHerramientaIA.tsx
 * Inline herramienta IA component for the roadmap task flow.
 * Shows form fields → generates with AI (or saves directly if usa_ia=false) → user edits → saves to ADN.
 */
import TutorialTecnicoBox from '../TutorialTecnicoBox';
import BotonAudio from '../sesion/BotonAudio';
import type { FaseOpcion, FaseBloque } from '../../lib/herramientas';
import { listarEvidencias, subirEvidencia } from '../../lib/evidencia';
import { notificarAdminsEvidencia } from '../../lib/notifications';
import React, { useState, useCallback, useRef } from 'react';
import {
  Loader2, RotateCcw, CheckCircle2, Edit3, Sparkles, Save,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import type { ProfileV2 } from '../../lib/supabase';
import { getHerramienta, type CampoInput, type Herramienta } from '../../lib/herramientas';
import type { RoadmapMeta } from '../../lib/roadmapSeed';
import TaskChecklist from './TaskChecklist';
import { generateText } from '../../lib/aiProvider';
import { toast } from 'sonner';
import Markdown from 'react-markdown';

/**
 * Fallback v8 · construye un prompt genérico cuando la herramienta de la tarea
 * NO está registrada en el catálogo `herramientas.ts`. Usa el título + descripción
 * de la tarea + el contexto del ADN para que la IA genere algo útil. Esto evita
 * que el botón "Generar con IA" quede inactivo silenciosamente.
 */
function buildPromptGenerico(meta: RoadmapMeta, perfil: Partial<ProfileV2>): string {
  const contexto = [
    perfil.especialidad ? `Profesión: ${perfil.especialidad}` : '',
    perfil.nicho ? `Nicho: ${perfil.nicho}` : '',
    perfil.metodo_nombre ? `Método propio: ${perfil.metodo_nombre}` : '',
    perfil.metodo_pasos ? `Pasos del método: ${perfil.metodo_pasos}` : '',
    perfil.matriz_a ? `Matriz A (dolores): ${perfil.matriz_a}` : '',
    perfil.matriz_b ? `Matriz B (obstáculos): ${perfil.matriz_b}` : '',
    perfil.matriz_c ? `Matriz C (transformación): ${perfil.matriz_c}` : '',
    perfil.adn_usp ? `PUV: ${perfil.adn_usp}` : '',
    perfil.proposito ? `Propósito: ${perfil.proposito}` : '',
    perfil.historia_50 ? `Historia corta: ${perfil.historia_50}` : '',
    perfil.oferta_mid ? `Oferta principal (Mid): ${perfil.oferta_mid}` : '',
  ].filter(Boolean).join('\n');

  return `Genera el output requerido para esta tarea del programa de 90 días para sanadores.

TAREA: ${meta.codigo} · ${meta.titulo}

DESCRIPCIÓN / INSTRUCCIONES:
${meta.descripcion}

CONTEXTO DEL PROFESIONAL (su ADN):
${contexto || '(ADN aún incompleto · genera algo útil con la información disponible)'}

FORMATO DE RESPUESTA:
- Texto en markdown, listo para copiar al ADN del cliente
- Sin disclaimers ("aquí está...", "te dejo...")
- Voz del profesional, no de la IA
- Si la tarea pide un formato específico (lista, párrafos, tabla), respetalo
- Largo apropiado para el tipo de contenido (no inventes datos que no estén en el ADN)`;
}


/** Abre el output en una ventana lista para imprimir → "Guardar como PDF". */
function abrirParaImprimir(titulo: string, texto: string) {
  const w = window.open('', '_blank');
  if (!w) return;
  const safe = texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  w.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>${titulo}</title>
<style>
  body{max-width:720px;margin:40px auto;padding:0 24px;font-family:Georgia,'Times New Roman',serif;color:#1a1a1a;line-height:1.65;font-size:15px}
  h1{font-size:22px;border-bottom:2px solid #E8962E;padding-bottom:8px}
  pre{white-space:pre-wrap;font-family:inherit;font-size:inherit}
  @media print{body{margin:16px auto}}
</style></head><body><h1>${titulo}</h1><pre>${safe}</pre>
<script>window.onload=()=>setTimeout(()=>window.print(),300)<\/script></body></html>`);
  w.document.close();
}

/* ══ S9 · EL SELLO DEL ADN — lo grabado, grabado queda ══ */
interface SelloADN { fecha: string; eleccion: FaseOpcion; bloques: FaseBloque[]; texto: string }
function getSello(herramientaId: string): SelloADN | null {
  try { return (JSON.parse(localStorage.getItem('tcd_adn_sellos_v1') ?? '{}'))[herramientaId] ?? null; } catch { return null; }
}
function guardarSelloLocal(herramientaId: string, sello: SelloADN): void {
  try {
    const all = JSON.parse(localStorage.getItem('tcd_adn_sellos_v1') ?? '{}');
    all[herramientaId] = sello;
    localStorage.setItem('tcd_adn_sellos_v1', JSON.stringify(all));
  } catch { /* noop */ }
}
function parseJsonArray<T>(texto: string): T[] | null {
  try {
    const limpio = texto.replace(/```json|```/g, '').trim();
    const ini = limpio.indexOf('['); const fin = limpio.lastIndexOf(']');
    if (ini < 0 || fin <= ini) return null;
    const arr = JSON.parse(limpio.slice(ini, fin + 1));
    return Array.isArray(arr) && arr.length ? arr as T[] : null;
  } catch { return null; }
}

interface TaskHerramientaIAProps {
  meta: RoadmapMeta;
  perfil?: Partial<ProfileV2>;
  geminiKey?: string;
  outputExistente?: string;
  onSaveADN: (outputTexto: string) => void;
  isCompleted: boolean;
}

type Modo = 'form' | 'generando' | 'revision' | 'edicion' | 'guardado' | 'opciones' | 'bloques' | 'revisionc' | 'sellado';

export default function TaskHerramientaIA({
  meta, perfil, geminiKey, outputExistente, onSaveADN, isCompleted,
}: TaskHerramientaIAProps) {
  // ── Evidencia obligatoria (F2) ──
  const [evidCount, setEvidCount] = React.useState<number>(-1);
  const [evidSubiendo, setEvidSubiendo] = React.useState(false);
  const [evidError, setEvidError] = React.useState<string | null>(null);
  const [evidUid, setEvidUid] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!meta.evidencia_requerida) return;
    (async () => {
      const { supabase } = await import('../../lib/supabase');
      const { data } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
      const userId = data.user?.id ?? null;
      setEvidUid(userId);
      setEvidCount(userId ? (await listarEvidencias(userId, meta.codigo)).length : 0);
    })();
  }, [meta.codigo, meta.evidencia_requerida]);
  const evidLista = !meta.evidencia_requerida || isCompleted || evidCount > 0;
  const handleEvidSubir = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !evidUid || evidSubiendo) return;
    setEvidSubiendo(true);
    setEvidError(null);
    const res = await subirEvidencia(evidUid, meta.codigo, file);
    if (res.ok) {
      setEvidCount((n) => Math.max(0, n) + 1);
      try { const p = JSON.parse(localStorage.getItem('tcd_profile') ?? '{}'); void notificarAdminsEvidencia(p?.nombre ?? 'Un cliente', meta.codigo); } catch { /* noop */ }
    } else {
      setEvidError((res as { ok: false; motivo: string }).motivo);
    }
    setEvidSubiendo(false);
  };
  const herramienta = meta.herramienta_id ? getHerramienta(meta.herramienta_id) : null;
  const inputs = herramienta?.inputs ?? [];
  // Si hay herramienta registrada, respeta su flag `usa_ia`. Si no hay, cae a
  // `meta.usa_ia` del seed (v8: P0.3 y P1.2b son false; el resto true).
  const usaIA = herramienta
    ? (herramienta as { usa_ia?: boolean }).usa_ia !== false
    : meta.usa_ia !== false;

  const [modo, setModo] = useState<Modo>(
    isCompleted && outputExistente ? 'guardado' : 'form'
  );
  // ── S9: el Constructor (opciones → bloques → revisión → sello) ──
  const [opciones, setOpciones] = React.useState<FaseOpcion[]>([]);
  const [eleccion, setEleccion] = React.useState<FaseOpcion | null>(null);
  const [bloques, setBloques] = React.useState<FaseBloque[]>([]);
  const [editIdx, setEditIdx] = React.useState<number | null>(null);
  const [regenIdx, setRegenIdx] = React.useState<number | null>(null);
  const [propuseOtra, setPropuseOtra] = React.useState(false);
  const [selloExistente, setSelloExistente] = React.useState<SelloADN | null>(null);
  React.useEffect(() => {
    if (!herramienta?.constructorFases) return;
    const sello = getSello(herramienta.id);
    if (sello) { setSelloExistente(sello); setEleccion(sello.eleccion); setBloques(sello.bloques); setModo('sellado'); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [herramienta?.id]);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [output, setOutput] = useState(outputExistente || '');
  const [editOutput, setEditOutput] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));
  const outputRef = useRef<HTMLDivElement>(null);

  const handleFieldChange = useCallback((fieldId: string, value: string) => {
    setFormValues(prev => ({ ...prev, [fieldId]: value }));
  }, []);

  const toggleSection = (idx: number) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  // ─── Generate with AI ─────────────────────────────────────────────────────
  const handleGenerate = async () => {
    // ── S9: flujo Constructor — la IA propone, el fundador elige ──
    if (herramienta?.constructorFases) {
      const faltan = herramienta.inputs.filter((c) => c.required && !(formValues[c.id] || '').trim());
      if (faltan.length) { toast.error('Completa: ' + faltan.map((c) => c.label).join(', ')); return; }
      setModo('generando');
      try {
        const out = await generateText({ prompt: herramienta.constructorFases.promptOpciones(formValues, perfil ?? {}) });
        const arr = parseJsonArray<FaseOpcion>(out ?? '');
        if (arr) { setOpciones(arr.slice(0, 5)); setModo('opciones'); return; }
      } catch { /* cae al flujo clásico */ }
      // sin JSON válido: degrada con gracia al flujo de siempre
    }
    // Fallback v8: si la herramienta NO está registrada en el catálogo
    // (`herramientas.ts`), igual permitimos avanzar. Dos sub-casos:
    //   a) meta.usa_ia !== false → IA genérica con título+descripción+ADN
    //   b) meta.usa_ia === false → guardar el texto que el usuario escribió
    //      en el textarea libre (modo escritura pura · P0.3, P1.2b)
    if (!herramienta) {
      if (!usaIA) {
        const libre = (formValues.__libre__ || '').trim();
        if (!libre) {
          toast.error('Escribe algo antes de guardar');
          return;
        }
        setOutput(libre);
        setModo('revision');
        return;
      }
      setModo('generando');
      try {
        const promptGenerico = buildPromptGenerico(meta, perfil ?? {});
        const text = await generateText({
          prompt: promptGenerico,
          systemInstruction:
            'Eres un copywriter especialista en profesionales de la salud. Generas contenido auténtico, en voz del profesional, sin promesas exageradas. Empatía primero. Tono Argentino/voseo si no se especifica otro país.',
        });
        setOutput(text);
        setModo('revision');
        setTimeout(() => outputRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        toast.error(`Error al generar: ${msg}. Intenta de nuevo.`);
        setModo('form');
      }
      return;
    }

    if (usaIA) {
      setModo('generando');
      try {
        const prompt = herramienta.promptTemplate(formValues, perfil ?? {});
        const text = await generateText({ prompt });
        setOutput(text);
        setModo('revision');
        setTimeout(() => outputRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        toast.error(`Error al generar: ${msg}. Intenta de nuevo.`);
        setModo('form');
      }
    } else {
      // No AI — just save the form values as the output
      const combined = inputs.map(inp => {
        const val = formValues[inp.id] || '';
        return `## ${inp.label}\n${val}`;
      }).join('\n\n');
      setOutput(combined);
      setModo('revision');
    }
  };

  // ─── Save to ADN ──────────────────────────────────────────────────────────
  const handleSave = () => {
    const finalOutput = modo === 'edicion' ? editOutput : output;
    setOutput(finalOutput);
    setModo('guardado');
    onSaveADN(finalOutput);
    // ZIP E — el ADN viaja de vuelta: lo que esta herramienta produce queda en
    // su perfil, y todas las herramientas siguientes lo reciben en su contexto.
    const campo = herramienta?.campoPerfil;
    if (campo && finalOutput.trim()) {
      const patch = { [campo]: finalOutput.trim() };
      try {
        const raw = JSON.parse(localStorage.getItem('tcd_profile') ?? '{}');
        localStorage.setItem('tcd_profile', JSON.stringify({ ...raw, ...patch }));
      } catch { /* noop */ }
      void (async () => {
        try {
          const { supabase } = await import('../../lib/supabase');
          const { data } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
          if (data.user?.id && supabase) await supabase.from('profiles').update(patch).eq('id', data.user.id);
        } catch { /* sin red: el local ya quedó */ }
      })();
    }
    toast.success('Guardado en tu ADN');
  };

  // ─── Regenerate ───────────────────────────────────────────────────────────
  const handleRegenerate = () => {
    setModo('form');
    setOutput('');
  };

  // ── S9: elegir opción → construir bloques ──
  const elegirOpcion = async (op: FaseOpcion) => {
    if (!herramienta?.constructorFases) return;
    setEleccion(op);
    setModo('generando');
    try {
      const out = await generateText({ prompt: herramienta.constructorFases.promptBloques(op, formValues, perfil ?? {}) });
      const arr = parseJsonArray<FaseBloque>(out ?? '');
      if (arr) { setBloques(arr); setModo('bloques'); return; }
      toast.error('No pude armar las piezas — intenta de nuevo');
      setModo('opciones');
    } catch { toast.error('No pude armar las piezas — intenta de nuevo'); setModo('opciones'); }
  };

  const proponerOtras = async () => {
    if (!herramienta?.constructorFases || propuseOtra) return;
    setPropuseOtra(true);
    setModo('generando');
    try {
      const out = await generateText({ prompt: herramienta.constructorFases.promptOpciones(formValues, perfil ?? {}) + '\n\nIMPORTANTE: propone opciones DISTINTAS a estas, con otro ángulo: ' + opciones.map((o) => o.titulo).join(' · ') });
      const arr = parseJsonArray<FaseOpcion>(out ?? '');
      if (arr) setOpciones(arr.slice(0, 5));
    } catch { /* noop */ }
    setModo('opciones');
  };

  const regenerarBloque = async (idx: number) => {
    if (!herramienta?.constructorFases || !eleccion) return;
    setRegenIdx(idx);
    try {
      const b = bloques[idx];
      const out = await generateText({ prompt: herramienta.constructorFases.promptBloques(eleccion, formValues, perfil ?? {}) + `\n\nIMPORTANTE: regenera SOLO esta pieza, distinta y mejor: "${b.titulo}". Mantén coherencia con las demás: ${bloques.filter((_, i) => i !== idx).map((x) => x.titulo).join(' · ')}. Responde SOLO un JSON array con UN objeto: [{"titulo":"...","contenido":"..."}]` });
      const arr = parseJsonArray<FaseBloque>(out ?? '');
      if (arr?.[0]) setBloques((prev) => prev.map((x, i) => (i === idx ? arr[0] : x)));
    } catch { /* noop */ }
    setRegenIdx(null);
  };

  const sellarADN = async () => {
    if (!herramienta || !eleccion) return;
    const texto = `# ${eleccion.titulo}\n${eleccion.significado}\n\n` + bloques.map((b) => `## ${b.titulo}\n${b.contenido}`).join('\n\n');
    const sello: SelloADN = { fecha: new Date().toISOString().split('T')[0], eleccion, bloques, texto };
    guardarSelloLocal(herramienta.id, sello);
    setSelloExistente(sello);
    // El ADN viaja de vuelta: los campos del perfil se escriben (local + base)
    const campos = herramienta.constructorFases?.camposPerfil;
    if (campos) {
      const patch: Record<string, string> = {};
      if (campos.principal) patch[campos.principal] = eleccion.titulo;
      if (campos.bloques) patch[campos.bloques] = bloques.map((b) => `${b.titulo}: ${b.contenido}`).join('\n');
      try {
        const raw = JSON.parse(localStorage.getItem('tcd_profile') ?? '{}');
        localStorage.setItem('tcd_profile', JSON.stringify({ ...raw, ...patch }));
      } catch { /* noop */ }
      try {
        const { supabase } = await import('../../lib/supabase');
        const { data } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
        if (data.user?.id && supabase) await supabase.from('profiles').update(patch).eq('id', data.user.id);
      } catch { /* sin red: el local ya quedó */ }
    }
    setOutput(texto);
    onSaveADN(texto);
    toast.success('🧬 Sellado en tu ADN — sobre esto se construye todo');
    setModo('sellado');
  };

  // ─── Render field ─────────────────────────────────────────────────────────
  const renderField = (campo: CampoInput) => {
    const value = formValues[campo.id] || '';

    if (campo.tipo === 'textarea') {
      return (
        <textarea
          value={value}
          onChange={e => handleFieldChange(campo.id, e.target.value)}
          placeholder={campo.placeholder}
          rows={4}
          className="w-full input-field resize-y min-h-[100px]"
        />
      );
    }

    if (campo.tipo === 'select' && campo.opciones) {
      return (
        <select
          value={value}
          onChange={e => handleFieldChange(campo.id, e.target.value)}
          className="w-full custom-select"
        >
          <option value="">Selecciona...</option>
          {campo.opciones!.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={campo.tipo === 'number' ? 'number' : 'text'}
        value={value}
        onChange={e => handleFieldChange(campo.id, e.target.value)}
        placeholder={campo.placeholder}
        className="w-full input-field"
      />
    );
  };

  // Check if form has enough data to submit
  const requiredFieldsFilled = inputs.length === 0 || inputs.some(inp => (formValues[inp.id] || '').trim().length > 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[11px] uppercase font-bold px-2 py-0.5 rounded-full bg-success/15 text-success border border-success/25 tracking-wider">
            HERRAMIENTA {usaIA ? 'IA' : ''}
          </span>
          {modo === 'guardado' && (
            <span className="text-[11px] uppercase font-bold px-2 py-0.5 rounded-full bg-success/15 text-success border border-success/25 tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Guardado en ADN
            </span>
          )}
        </div>
        <h3 className="text-lg font-medium text-cream" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
          {meta.titulo}
        </h3>
        <p className="text-sm text-cream/75 mt-1">{meta.descripcion}</p>
        <TutorialTecnicoBox codigo={meta.codigo} />
        {meta.video_youtube_id && !meta.video_youtube_id.startsWith('PLACEHOLDER') && (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-[rgba(232,150,46,0.12)] bg-black mt-4">
            <iframe
              src={`https://www.youtube.com/embed/${meta.video_youtube_id}`}
              title={`Tutorial: ${meta.titulo}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        )}
        {meta.evidencia_requerida && (
          <div className={`card-panel p-4 border mt-3 ${evidLista && evidCount > 0 ? 'border-success/30 bg-success/[0.04]' : 'border-gold/30 bg-gold/[0.04]'}`}>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-2 text-gold">
              {evidCount > 0 ? '✓ Evidencia recibida' : '📎 Evidencia requerida para completar'}
            </p>
            <p className="text-sm text-cream/75 leading-relaxed mb-3">{meta.evidencia_requerida.descripcion}</p>
            {!isCompleted && (
              <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${evidCount > 0 ? 'bg-success/15 text-success hover:bg-success/25' : 'bg-gold text-black hover:bg-goldhi'}`}>
                {evidSubiendo ? 'Subiendo…' : evidCount > 0 ? `✓ ${evidCount} subida${evidCount > 1 ? 's' : ''} · agregar otra` : 'Subir mi evidencia'}
                <input type="file" accept="image/*,audio/*,video/*,.pdf" className="hidden" onChange={handleEvidSubir} disabled={evidSubiendo} />
              </label>
            )}
            {evidError && <p className="text-xs text-danger mt-2">⚠️ {evidError}</p>}
          </div>
        )}
        {meta.checklist && meta.checklist.length > 0 && (
          <TaskChecklist codigo={meta.codigo} items={meta.checklist} />
        )}
      </div>

      {/* ─── FORM MODE ─────────────────────────────────────────────────────── */}
      {modo === 'form' && (
        <div className="space-y-5">
          {inputs.length > 0 ? (
            <>
              {inputs.length <= 5 ? (
                // Simple form — all fields visible
                inputs.map(campo => (
                  <div key={campo.id}>
                    <label className="block text-xs text-cream/75 mb-1.5 font-medium">
                      {campo.label}
                    </label>
                    {renderField(campo)}
                  </div>
                ))
              ) : (
                // Complex form — collapsible sections (group by 3s)
                Array.from({ length: Math.ceil(inputs.length / 3) }).map((_, groupIdx) => {
                  const groupInputs = inputs.slice(groupIdx * 3, (groupIdx + 1) * 3);
                  const isExpanded = expandedSections.has(groupIdx);
                  return (
                    <div key={groupIdx} className="card-panel border border-[rgba(232,150,46,0.10)]">
                      <button
                        onClick={() => toggleSection(groupIdx)}
                        className="w-full flex items-center justify-between p-4 text-left"
                      >
                        <span className="text-sm font-medium text-cream/80">
                          {groupInputs[0]?.label?.split(' ').slice(0, 3).join(' ')}...
                        </span>
                        {isExpanded
                          ? <ChevronUp className="w-4 h-4 text-cream/55" />
                          : <ChevronDown className="w-4 h-4 text-cream/55" />
                        }
                      </button>
                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-4">
                          {groupInputs.map(campo => (
                            <div key={campo.id}>
                              <label className="block text-xs text-cream/75 mb-1.5 font-medium">
                                {campo.label}
                              </label>
                              {renderField(campo)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </>
          ) : !herramienta && !usaIA ? (
            // v8 fallback · sin herramienta registrada y sin IA · textarea libre
            <div className="space-y-2">
              <label className="block text-xs text-cream/75 mb-1.5 font-medium">
                Escribe acá tu respuesta
              </label>
              <textarea
                value={formValues.__libre__ || ''}
                onChange={(e) => handleFieldChange('__libre__', e.target.value)}
                placeholder={meta.descripcion.slice(0, 120) + '...'}
                rows={8}
                className="w-full input-field resize-y min-h-[180px]"
              />
            </div>
          ) : (
            // No inputs — herramienta uses previous ADN data
            <div className="card-panel p-5 border border-gold/15 bg-gold/[0.03]">
              <p className="text-sm text-cream/70">
                Esta herramienta usa los datos que ya completaste en pasos anteriores para generar el resultado.
              </p>
              {meta.requiere_datos_de && meta.requiere_datos_de.length > 0 && (
                <p className="text-xs text-cream/55 mt-2">
                  Datos de: {meta.requiere_datos_de.join(', ')}
                </p>
              )}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={!requiredFieldsFilled && herramienta !== null}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {usaIA ? (
              <>
                <Sparkles className="w-4 h-4" />
                Generar con IA
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar
              </>
            )}
          </button>
        </div>
      )}

      {/* ─── GENERATING ────────────────────────────────────────────────────── */}
      {modo === 'generando' && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-gold animate-spin mb-4" />
          <p className="text-sm text-cream/75">Generando con IA...</p>
          <p className="text-xs text-cream/45 mt-1">Esto puede tomar unos segundos</p>
        </div>
      )}

      {/* ─── REVIEW MODE ───────────────────────────────────────────────────── */}
      {/* ══ S9 · CONSTRUCTOR — ACTO 1: ELEGIR ══ */}
      {modo === 'opciones' && herramienta?.constructorFases && (
        <div className="space-y-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold mb-1">Construido desde tu ADN</p>
            <h3 className="text-lg font-bold text-cream">{herramienta.constructorFases.etiquetaOpciones}</h3>
            <p className="text-xs text-cream/55 mt-1">Toca la que te suene a ti. Después armamos las piezas — y editas lo que quieras antes de sellar.</p>
          </div>
          <div className="space-y-2.5">
            {opciones.map((op, i2) => (
              <button key={i2} type="button" onClick={() => setEleccion(op)}
                className={`w-full text-left rounded-2xl border p-4 transition-all ${eleccion?.titulo === op.titulo ? 'border-gold bg-gold/10 ring-1 ring-gold/40' : 'border-cream/10 bg-surface/30 hover:border-gold/30'}`}>
                <p className="text-base font-semibold text-cream" style={{ fontFamily: 'var(--font-display)' }}>{op.titulo}</p>
                <p className="text-xs text-cream/60 mt-1 leading-relaxed">{op.significado}</p>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {!propuseOtra && (
              <button type="button" onClick={proponerOtras} className="text-xs font-bold text-cream/55 hover:text-cream">🔄 Proponme otras</button>
            )}
            <button type="button" disabled={!eleccion} onClick={() => eleccion && elegirOpcion(eleccion)}
              className="flex-1 btn-primary py-3 rounded-xl text-sm font-bold disabled:opacity-40">Continuar con esta →</button>
          </div>
        </div>
      )}

      {/* ══ ACTO 2: CONSTRUIR — bloques editables, uno por uno ══ */}
      {modo === 'bloques' && eleccion && (
        <div className="space-y-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold mb-1">Tus piezas — edita lo que quieras</p>
            <h3 className="text-lg font-bold text-cream" style={{ fontFamily: 'var(--font-display)' }}>{eleccion.titulo}</h3>
            <p className="text-xs text-cream/55 mt-1">✏️ edita con tus palabras · 🔄 regenera solo esa pieza · 🎤 habla en vez de escribir</p>
          </div>
          <div className="space-y-2.5">
            {bloques.map((b, i2) => (
              <div key={i2} className="rounded-2xl border border-cream/10 bg-surface/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-cream flex-1">{b.titulo}</p>
                  <div className="flex gap-1.5 shrink-0">
                    <button type="button" onClick={() => setEditIdx(editIdx === i2 ? null : i2)} title="Editar"
                      className="text-xs px-2 py-1 rounded-lg border border-cream/15 text-cream/65 hover:text-cream hover:border-gold/40">✏️</button>
                    <button type="button" onClick={() => regenerarBloque(i2)} disabled={regenIdx !== null} title="Regenerar solo esta pieza"
                      className="text-xs px-2 py-1 rounded-lg border border-cream/15 text-cream/65 hover:text-cream hover:border-gold/40 disabled:opacity-40">{regenIdx === i2 ? '…' : '🔄'}</button>
                  </div>
                </div>
                {editIdx === i2 ? (
                  <div className="mt-2">
                    <textarea value={b.contenido} onChange={(e) => setBloques((prev) => prev.map((x, j) => (j === i2 ? { ...x, contenido: e.target.value } : x)))} rows={3}
                      className="w-full bg-white/[0.04] border border-gold/30 rounded-xl px-3 py-2.5 text-sm text-cream/90 focus:outline-none focus:border-gold/60" />
                    <div className="flex items-center justify-between mt-1.5">
                      <BotonAudio onTexto={(t) => setBloques((prev) => prev.map((x, j) => (j === i2 ? { ...x, contenido: (x.contenido ? x.contenido + '\n' : '') + t } : x)))} />
                      <button type="button" onClick={() => setEditIdx(null)} className="text-xs font-bold text-gold">Listo ✓</button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-cream/75 leading-relaxed mt-1.5 whitespace-pre-wrap">{b.contenido}</p>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => { setModo('opciones'); setEditIdx(null); }} className="px-4 py-3 rounded-xl text-xs font-bold text-cream/55 hover:text-cream">← Elegir otro</button>
            <button type="button" onClick={() => { setEditIdx(null); setModo('revisionc'); }} className="flex-1 btn-primary py-3 rounded-xl text-sm font-bold">Revisar y sellar →</button>
          </div>
        </div>
      )}

      {/* ══ ACTO 3: REVISAR — al grabar, queda grabado ══ */}
      {modo === 'revisionc' && eleccion && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-gold/25 bg-gradient-to-br from-gold/[0.06] to-transparent p-5">
            <p className="text-xl font-semibold text-cream" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>{eleccion.titulo}</p>
            <p className="text-xs text-cream/60 mt-1">{eleccion.significado}</p>
            <div className="mt-4 space-y-3">
              {bloques.map((b, i2) => (
                <div key={i2}>
                  <p className="text-sm font-semibold text-cream/90">{b.titulo}</p>
                  <p className="text-sm text-cream/70 leading-relaxed whitespace-pre-wrap">{b.contenido}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-gold/40 bg-gold/[0.06] px-4 py-3">
            <p className="text-xs text-cream/85"><strong className="text-gold">Revísalo bien.</strong> Al grabar en tu ADN, queda grabado — sobre esto se construye todo lo que sigue.</p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setModo('bloques')} className="px-4 py-3 rounded-xl text-xs font-bold text-cream/55 hover:text-cream">← Volver a ajustar</button>
            <button type="button" onClick={sellarADN} className="flex-1 btn-primary py-3.5 rounded-xl text-sm font-bold">🧬 GRABAR EN MI ADN</button>
          </div>
        </div>
      )}

      {/* ══ ACTO 4: SELLADO — 🔒 lo grabado, grabado queda ══ */}
      {modo === 'sellado' && eleccion && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/[0.08] to-transparent p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold mb-2">🔒 Sellado en tu ADN{(selloExistente?.fecha) ? ` · ${selloExistente.fecha}` : ''}</p>
            <p className="text-xl font-semibold text-cream" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>{eleccion.titulo}</p>
            <div className="mt-4 space-y-3">
              {bloques.map((b, i2) => (
                <div key={i2}>
                  <p className="text-sm font-semibold text-cream/90">{b.titulo}</p>
                  <p className="text-sm text-cream/70 leading-relaxed whitespace-pre-wrap">{b.contenido}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[11px] text-cream/45 text-center">Lo sellado no se edita: se construye encima. Todo lo que sigue lo hereda.</p>
          <button type="button" onClick={() => abrirParaImprimir(meta.titulo, selloExistente?.texto ?? output)}
            className="w-full btn-secondary py-3 rounded-xl text-sm font-bold">Imprimir / PDF</button>
        </div>
      )}

      {modo === 'revision' && (
        <div className="space-y-5" ref={outputRef}>
          <div className="card-panel p-5 border border-[rgba(232,150,46,0.12)]">
            <p className="text-[11px] text-gold uppercase tracking-widest font-bold mb-3">
              {usaIA ? 'Resultado generado' : 'Tu contenido'}
            </p>
            <div className="text-sm text-cream/90 leading-relaxed prose prose-invert max-w-none prose-a:text-gold prose-headings:text-gold prose-headings:font-semibold prose-strong:text-cream prose-strong:font-bold prose-p:leading-relaxed prose-li:my-0.5 prose-hr:border-[rgba(232,150,46,0.10)]">
              <Markdown>{output}</Markdown>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => abrirParaImprimir(meta.titulo, output)}
              className="flex-1 btn-secondary flex items-center justify-center gap-2 text-sm"
            >
              Imprimir / PDF
            </button>
            <button
              onClick={() => { setEditOutput(output); setModo('edicion'); }}
              className="flex-1 btn-secondary flex items-center justify-center gap-2"
            >
              <Edit3 className="w-4 h-4" /> Editar
            </button>
            {usaIA && (
              <button
                onClick={handleRegenerate}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-cream/65 hover:text-cream transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Rehacer
              </button>
            )}
            <button
              onClick={handleSave}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> Guardar en mi ADN
            </button>
          </div>
        </div>
      )}

      {/* ─── EDIT MODE ─────────────────────────────────────────────────────── */}
      {modo === 'edicion' && (
        <div className="space-y-5">
          <textarea
            value={editOutput}
            onChange={e => setEditOutput(e.target.value)}
            rows={15}
            className="w-full input-field resize-y min-h-[200px] font-mono text-sm"
          />
          <div className="flex gap-3">
            <button
              onClick={() => setModo('revision')}
              className="flex-1 btn-secondary flex items-center justify-center gap-2"
            >
              Cancelar edición
            </button>
            <button
              onClick={handleSave}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> Guardar en mi ADN
            </button>
          </div>
        </div>
      )}

      {/* ─── SAVED MODE ────────────────────────────────────────────────────── */}
      {modo === 'guardado' && (
        <div className="space-y-5">
          <div className="card-panel p-5 border border-success/20 bg-success/[0.03]">
            <p className="text-[11px] text-success uppercase tracking-widest font-bold mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Guardado en tu ADN
            </p>
            <div className="text-sm text-cream/80 leading-relaxed prose prose-invert max-w-none prose-a:text-gold prose-headings:text-gold prose-headings:font-semibold prose-strong:text-cream prose-strong:font-bold prose-p:leading-relaxed prose-li:my-0.5 prose-hr:border-[rgba(232,150,46,0.10)]">
              <Markdown>{output}</Markdown>
            </div>
          </div>

          <button
            onClick={() => { setEditOutput(output); setModo('edicion'); }}
            className="btn-secondary flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" /> Editar resultado
          </button>
        </div>
      )}
    </div>
  );
}
