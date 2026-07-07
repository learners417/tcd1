import React, { useState, useCallback } from 'react';
import { Loader2, Sparkles, Copy, Check, RotateCcw } from 'lucide-react';
import { streamText } from '../../lib/aiProvider';
import Markdown from 'react-markdown';
import { toast } from 'sonner';
import { buildGuiaCampanaPrompt } from '../../lib/campanasPrompts';
import { getUserKnowledgeBase } from '../../lib/userKnowledgeBase';
import type { CampanaFormState } from '../../lib/campanasTypes';
import type { ProfileV2 } from '../../lib/supabase';

interface Props {
  form: CampanaFormState;
  perfil: Partial<ProfileV2>;
  geminiKey?: string;
  userId?: string;
  guia: string;
  onGuiaChange: (guia: string) => void;
}

export default function WizardStepGuia({ form, perfil, geminiKey, userId, guia, onGuiaChange }: Props) {
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateGuia = useCallback(async () => {
    setGenerating(true);
    onGuiaChange('');

    try {
      const kb = await getUserKnowledgeBase(userId);
      const prompt = buildGuiaCampanaPrompt(form, perfil, kb);

      let fullText = '';
      for await (const chunk of streamText({ prompt })) {
        fullText += chunk;
        onGuiaChange(fullText);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      toast.error(`Error generando guia: ${msg}`);
    } finally {
      setGenerating(false);
    }
  }, [form, perfil, geminiKey, userId, onGuiaChange]);

  const handleCopy = () => {
    navigator.clipboard.writeText(guia);
    setCopied(true);
    toast.success('Guia copiada al portapapeles');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[#F2EFE9] mb-1">Guia de Configuracion</h3>
        <p className="text-sm text-[#F2EFE9]/50">
          La IA genera un paso a paso detallado para configurar tu campana en Meta Ads Manager
        </p>
      </div>

      {!guia && !generating && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#E8962E]/10 border border-[#E8962E]/20 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-[#E8962E]" />
          </div>
          <p className="text-[#F2EFE9]/60 mb-6 text-sm">
            Genera la guia personalizada basada en tu campana y perfil
          </p>
          <button onClick={generateGuia} className="btn-primary inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Generar Guia con IA
          </button>
        </div>
      )}

      {generating && !guia && (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-[#E8962E] animate-spin mx-auto mb-4" />
          <p className="text-[#F2EFE9]/60 text-sm">Generando guia personalizada...</p>
        </div>
      )}

      {guia && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {generating && <Loader2 className="w-4 h-4 text-[#E8962E] animate-spin" />}
              <span className="text-xs text-[#F2EFE9]/40">{generating ? 'Generando...' : 'Guia generada'}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                disabled={generating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#F2EFE9]/60 hover:text-[#F2EFE9] bg-[#F2EFE9]/5 hover:bg-[#F2EFE9]/10 transition-colors disabled:opacity-40"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
              <button
                onClick={generateGuia}
                disabled={generating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#E8962E]/60 hover:text-[#E8962E] bg-[#E8962E]/5 hover:bg-[#E8962E]/10 transition-colors disabled:opacity-40"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Regenerar
              </button>
            </div>
          </div>

          <div className="bg-[#111110] border border-[rgba(232,150,46,0.10)] rounded-xl p-6 max-h-[500px] overflow-y-auto scrollbar-hide">
            <div className="prose prose-invert prose-sm max-w-none prose-headings:text-[#E8962E] prose-strong:text-[#F2EFE9] prose-li:text-[#F2EFE9]/70">
              <Markdown>{guia}</Markdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
