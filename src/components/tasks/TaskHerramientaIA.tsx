/**
 * TaskHerramientaIA.tsx
 * Inline herramienta IA component for the roadmap task flow.
 * Shows form fields → generates with AI (or saves directly if usa_ia=false) → user edits → saves to ADN.
 */
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

  return `Generá el output requerido para esta tarea del programa de 90 días para sanadores.

TAREA: ${meta.codigo} · ${meta.titulo}

DESCRIPCIÓN / INSTRUCCIONES:
${meta.descripcion}

CONTEXTO DEL PROFESIONAL (su ADN):
${contexto || '(ADN aún incompleto · generá algo útil con la información disponible)'}

FORMATO DE RESPUESTA:
- Texto en markdown, listo para copiar al ADN del cliente
- Sin disclaimers ("aquí está...", "te dejo...")
- Voz del profesional, no de la IA
- Si la tarea pide un formato específico (lista, párrafos, tabla), respetalo
- Largo apropiado para el tipo de contenido (no inventes datos que no estén en el ADN)`;
}

interface TaskHerramientaIAProps {
  meta: RoadmapMeta;
  perfil?: Partial<ProfileV2>;
  geminiKey?: string;
  outputExistente?: string;
  onSaveADN: (outputTexto: string) => void;
  isCompleted: boolean;
}

type Modo = 'form' | 'generando' | 'revision' | 'edicion' | 'guardado';

export default function TaskHerramientaIA({
  meta, perfil, geminiKey, outputExistente, onSaveADN, isCompleted,
}: TaskHerramientaIAProps) {
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
    // Fallback v8: si la herramienta NO está registrada en el catálogo
    // (`herramientas.ts`), igual permitimos avanzar. Dos sub-casos:
    //   a) meta.usa_ia !== false → IA genérica con título+descripción+ADN
    //   b) meta.usa_ia === false → guardar el texto que el usuario escribió
    //      en el textarea libre (modo escritura pura · P0.3, P1.2b)
    if (!herramienta) {
      if (!usaIA) {
        const libre = (formValues.__libre__ || '').trim();
        if (!libre) {
          toast.error('Escribí algo antes de guardar');
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
            'Sos un copywriter especialista en profesionales de la salud. Generás contenido auténtico, en voz del profesional, sin promesas exageradas. Empatía primero. Tono Argentino/voseo si no se especifica otro país.',
        });
        setOutput(text);
        setModo('revision');
        setTimeout(() => outputRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        toast.error(`Error al generar: ${msg}. Intentá de nuevo.`);
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
        toast.error(`Error al generar: ${msg}. Intentá de nuevo.`);
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
    toast.success('Guardado en tu ADN');
  };

  // ─── Regenerate ───────────────────────────────────────────────────────────
  const handleRegenerate = () => {
    setModo('form');
    setOutput('');
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
          <option value="">Seleccioná...</option>
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
          <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/25 tracking-wider">
            HERRAMIENTA {usaIA ? 'IA' : ''}
          </span>
          {modo === 'guardado' && (
            <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/25 tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Guardado en ADN
            </span>
          )}
        </div>
        <h3 className="text-lg font-medium text-[#FFFFFF]" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
          {meta.titulo}
        </h3>
        <p className="text-sm text-[#FFFFFF]/60 mt-1">{meta.descripcion}</p>
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
                    <label className="block text-xs text-[#FFFFFF]/60 mb-1.5 font-medium">
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
                    <div key={groupIdx} className="card-panel border border-[rgba(245,166,35,0.15)]">
                      <button
                        onClick={() => toggleSection(groupIdx)}
                        className="w-full flex items-center justify-between p-4 text-left"
                      >
                        <span className="text-sm font-medium text-[#FFFFFF]/80">
                          {groupInputs[0]?.label?.split(' ').slice(0, 3).join(' ')}...
                        </span>
                        {isExpanded
                          ? <ChevronUp className="w-4 h-4 text-[#FFFFFF]/40" />
                          : <ChevronDown className="w-4 h-4 text-[#FFFFFF]/40" />
                        }
                      </button>
                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-4">
                          {groupInputs.map(campo => (
                            <div key={campo.id}>
                              <label className="block text-xs text-[#FFFFFF]/60 mb-1.5 font-medium">
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
              <label className="block text-xs text-[#FFFFFF]/60 mb-1.5 font-medium">
                Escribí acá tu respuesta
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
            <div className="card-panel p-5 border border-[#F5A623]/15 bg-[#F5A623]/[0.03]">
              <p className="text-sm text-[#FFFFFF]/70">
                Esta herramienta usa los datos que ya completaste en pasos anteriores para generar el resultado.
              </p>
              {meta.requiere_datos_de && meta.requiere_datos_de.length > 0 && (
                <p className="text-xs text-[#FFFFFF]/40 mt-2">
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
          <Loader2 className="w-8 h-8 text-[#F5A623] animate-spin mb-4" />
          <p className="text-sm text-[#FFFFFF]/60">Generando con IA...</p>
          <p className="text-xs text-[#FFFFFF]/30 mt-1">Esto puede tomar unos segundos</p>
        </div>
      )}

      {/* ─── REVIEW MODE ───────────────────────────────────────────────────── */}
      {modo === 'revision' && (
        <div className="space-y-5" ref={outputRef}>
          <div className="card-panel p-5 border border-[rgba(245,166,35,0.2)]">
            <p className="text-[10px] text-[#F5A623] uppercase tracking-widest font-bold mb-3">
              {usaIA ? 'Resultado generado' : 'Tu contenido'}
            </p>
            <div className="text-sm text-[#FFFFFF]/90 leading-relaxed prose prose-invert max-w-none prose-a:text-[#F5A623] prose-headings:text-[#F5A623] prose-headings:font-semibold prose-strong:text-[#FFFFFF] prose-strong:font-bold prose-p:leading-relaxed prose-li:my-0.5 prose-hr:border-[rgba(245,166,35,0.15)]">
              <Markdown>{output}</Markdown>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setEditOutput(output); setModo('edicion'); }}
              className="flex-1 btn-secondary flex items-center justify-center gap-2"
            >
              <Edit3 className="w-4 h-4" /> Editar
            </button>
            {usaIA && (
              <button
                onClick={handleRegenerate}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[#FFFFFF]/50 hover:text-[#FFFFFF] transition-colors"
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
          <div className="card-panel p-5 border border-[#22C55E]/20 bg-[#22C55E]/[0.03]">
            <p className="text-[10px] text-[#22C55E] uppercase tracking-widest font-bold mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Guardado en tu ADN
            </p>
            <div className="text-sm text-[#FFFFFF]/80 leading-relaxed prose prose-invert max-w-none prose-a:text-[#F5A623] prose-headings:text-[#F5A623] prose-headings:font-semibold prose-strong:text-[#FFFFFF] prose-strong:font-bold prose-p:leading-relaxed prose-li:my-0.5 prose-hr:border-[rgba(245,166,35,0.15)]">
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
