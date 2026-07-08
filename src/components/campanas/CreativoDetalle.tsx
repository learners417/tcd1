import React, { useState, useMemo } from 'react';
import {
  ArrowLeft, Download, Trash2, ChevronLeft, ChevronRight, Copy, Check,
  CheckCircle, XCircle, RefreshCw, Wand2, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { ANGULO_LABELS, TIPO_LABELS } from '../../lib/campanasTypes';
import {
  deleteCreativo,
  downloadImage,
  updateCreativo,
  uploadCreativeImage,
  upsertCreativoAsset,
  fetchImageAsBase64,
} from '../../lib/campanasStorage';
import { generateImageWithFallback, editImage } from '../../lib/campanasImageGen';
import type { Creativo, CreativoAsset } from '../../lib/campanasTypes';

interface Props {
  creativo: Creativo;
  userId?: string;
  onBack: () => void;
  onDeleted: () => void;
}

function parseStoredPrompts(value: string | undefined | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter((p): p is string => typeof p === 'string');
  } catch {
    // fallback: texto plano guardado como prompt
  }
  return [value];
}

export default function CreativoDetalle({ creativo, userId, onBack, onDeleted }: Props) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [copied, setCopied] = useState(false);
  // Assets locales para refrescar el preview sin recargar historial
  const [liveAssets, setLiveAssets] = useState<CreativoAsset[]>(creativo.assets ?? []);
  const [urlBuster, setUrlBuster] = useState(0); // cache-bust cuando reemplazamos el archivo
  const [regenerating, setRegenerating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [editing, setEditing] = useState(false);

  const assets = liveAssets;
  const isCarousel = assets.length > 1;
  const storedPrompts = useMemo(() => parseStoredPrompts(creativo.prompt_imagen), [creativo.prompt_imagen]);
  const canRegenerate = storedPrompts.length > 0;

  const displayUrl = (asset: CreativoAsset): string => {
    if (!urlBuster) return asset.public_url;
    const sep = asset.public_url.includes('?') ? '&' : '?';
    return `${asset.public_url}${sep}v=${urlBuster}`;
  };

  const handleDelete = async () => {
    if (!userId || !window.confirm('Eliminar este creativo y todas sus imagenes?')) return;
    await deleteCreativo(creativo.id, userId);
    toast.success('Creativo eliminado');
    onDeleted();
  };

  const handleDownload = () => {
    const asset = assets[activeSlide];
    if (asset) {
      downloadImage(asset.public_url, `${creativo.nombre ?? 'creativo'}-slide${activeSlide + 1}.png`);
    }
  };

  const handleDownloadAll = () => {
    for (const asset of assets) {
      downloadImage(asset.public_url, `${creativo.nombre ?? 'creativo'}-slide${asset.slide_orden}.png`);
    }
    toast.success(`${assets.length} imagenes descargadas`);
  };

  const handleCopyCopy = () => {
    const text = `TEXTO PRINCIPAL:\n${creativo.texto_principal}\n\nTITULO:\n${creativo.titulo}\n\nDESCRIPCION:\n${creativo.descripcion ?? ''}\n\nCTA:\n${creativo.cta_texto ?? ''}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStatusChange = async (estado: 'aprobado' | 'descartado') => {
    await updateCreativo(creativo.id, { estado });
    toast.success(`Creativo marcado como ${estado}`);
  };

  // ─── Reemplaza el asset de la slide activa con una nueva imagen ──────────
  const replaceSlideImage = async (newBase64: string, newMimeType: string): Promise<void> => {
    if (!userId) throw new Error('Usuario no autenticado');
    const asset = assets[activeSlide];
    if (!asset) throw new Error('No hay slide activa');

    const uploaded = await uploadCreativeImage(
      userId,
      creativo.id,
      asset.slide_orden,
      newBase64,
      newMimeType,
    );
    if (!uploaded) throw new Error('No se pudo subir la imagen');

    const saved = await upsertCreativoAsset({
      creativo_id: creativo.id,
      usuario_id: userId,
      slide_orden: asset.slide_orden,
      storage_path: uploaded.storagePath,
      public_url: uploaded.publicUrl,
      width: asset.width,
      height: asset.height,
      mime_type: newMimeType,
    });

    setLiveAssets((prev) => {
      const next = [...prev];
      next[activeSlide] = saved ?? {
        ...asset,
        storage_path: uploaded.storagePath,
        public_url: uploaded.publicUrl,
        mime_type: newMimeType,
      };
      return next;
    });
    setUrlBuster(Date.now());
  };

  // ─── Regenerar la slide activa usando el prompt guardado ─────────────────
  const handleRegenerate = async () => {
    if (!canRegenerate) {
      toast.error('No hay prompt guardado para regenerar. Generalo de nuevo desde el panel.');
      return;
    }
    const asset = assets[activeSlide];
    if (!asset) return;

    const prompt = storedPrompts[activeSlide] ?? storedPrompts[0];
    if (!prompt) {
      toast.error('No se encontro el prompt para esta slide');
      return;
    }

    setRegenerating(true);
    try {
      const result = await generateImageWithFallback(prompt, undefined, undefined, {});
      await replaceSlideImage(result.imageBase64, result.mimeType);
      toast.success(isCarousel ? `Slide ${activeSlide + 1} regenerada` : 'Imagen regenerada');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      toast.error(`Error regenerando: ${msg}`);
    } finally {
      setRegenerating(false);
    }
  };

  // ─── Editar con IA la slide activa ───────────────────────────────────────
  const handleApplyEdit = async () => {
    if (!editPrompt.trim()) {
      toast.error('Describi el cambio que queres aplicar');
      return;
    }
    const asset = assets[activeSlide];
    if (!asset) return;

    setEditing(true);
    try {
      const baseImg = await fetchImageAsBase64(asset.public_url);
      const result = await editImage(
        baseImg,
        editPrompt.trim(),
        undefined,
        {},
      );
      await replaceSlideImage(result.imageBase64, result.mimeType);
      setEditPrompt('');
      setEditMode(false);
      toast.success('Edicion aplicada');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      toast.error(`Error en la edicion: ${msg}`);
    } finally {
      setEditing(false);
    }
  };

  const prev = () => setActiveSlide((i) => (i > 0 ? i - 1 : assets.length - 1));
  const next = () => setActiveSlide((i) => (i < assets.length - 1 ? i + 1 : 0));

  const busy = regenerating || editing;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-[#F2EFE9]/40 hover:text-[#F2EFE9] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-[#F2EFE9]">{creativo.nombre ?? creativo.titulo}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#E8962E]/10 text-[#E8962E]">
                {ANGULO_LABELS[creativo.angulo].titulo}
              </span>
              <span className="text-xs text-[#F2EFE9]/30">{TIPO_LABELS[creativo.tipo]}</span>
              <span className="text-xs text-[#F2EFE9]/20">
                {new Date(creativo.created_at).toLocaleDateString('es')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleStatusChange('aprobado')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#22C55E] bg-[#22C55E]/10 hover:bg-[#22C55E]/15 transition-colors"
          >
            <CheckCircle className="w-3.5 h-3.5" /> Aprobar
          </button>
          <button
            onClick={() => handleStatusChange('descartado')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#EF4444] bg-[#EF4444]/10 hover:bg-[#EF4444]/15 transition-colors"
          >
            <XCircle className="w-3.5 h-3.5" /> Descartar
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#EF4444] bg-[#EF4444]/5 hover:bg-[#EF4444]/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Eliminar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image viewer */}
        <div className="space-y-3">
          {assets.length > 0 ? (
            <>
              <div className="relative rounded-xl overflow-hidden border border-[rgba(232,150,46,0.10)] bg-black/30 flex items-center justify-center">
                <img
                  src={displayUrl(assets[activeSlide])}
                  alt={`Slide ${activeSlide + 1}`}
                  className="w-full h-auto max-h-[80vh] object-contain"
                />

                {/* Overlay de progreso cuando regeneramos/editamos */}
                {busy && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 text-[#E8962E]">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <p className="text-xs font-medium">
                      {regenerating ? 'Regenerando imagen…' : 'Aplicando edición con IA…'}
                    </p>
                  </div>
                )}

                {isCarousel && !busy && (
                  <>
                    <button
                      onClick={prev}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-[#F2EFE9] hover:bg-black/80 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={next}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-[#F2EFE9] hover:bg-black/80 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {assets.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveSlide(idx)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            activeSlide === idx ? 'bg-[#E8962E] w-4' : 'bg-[#F2EFE9]/40'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails for carousel */}
              {isCarousel && (
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {assets.map((asset, idx) => (
                    <button
                      key={asset.id}
                      onClick={() => setActiveSlide(idx)}
                      disabled={busy}
                      className={`w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all disabled:opacity-40 ${
                        activeSlide === idx ? 'border-[#E8962E]' : 'border-transparent opacity-50 hover:opacity-100'
                      }`}
                    >
                      <img loading="lazy" src={displayUrl(asset)} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Acciones sobre la imagen actual */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleDownload}
                  disabled={busy}
                  className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-[#E8962E] bg-[#E8962E]/10 hover:bg-[#E8962E]/15 transition-colors border border-[#E8962E]/20 disabled:opacity-40"
                >
                  <Download className="w-4 h-4" />
                  {isCarousel ? `Descargar slide ${activeSlide + 1}` : 'Descargar'}
                </button>
                {isCarousel && (
                  <button
                    onClick={handleDownloadAll}
                    disabled={busy}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-[#F2EFE9]/60 bg-[#F2EFE9]/5 hover:bg-[#F2EFE9]/10 transition-colors disabled:opacity-40"
                  >
                    <Download className="w-4 h-4" /> Todas ({assets.length})
                  </button>
                )}
                <button
                  onClick={handleRegenerate}
                  disabled={busy || !canRegenerate}
                  title={canRegenerate ? 'Regenera la imagen con el mismo prompt' : 'Sin prompt guardado — no se puede regenerar'}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-[#E8962E] bg-[#E8962E]/10 hover:bg-[#E8962E]/15 transition-colors border border-[#E8962E]/20 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {regenerating
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Regenerando…</>
                    : <><RefreshCw className="w-4 h-4" /> Regenerar</>
                  }
                </button>
                <button
                  onClick={() => setEditMode((v) => !v)}
                  disabled={busy}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border disabled:opacity-40 ${
                    editMode
                      ? 'text-[#E8962E] bg-[#E8962E]/20 border-[#E8962E]/50'
                      : 'text-[#E8962E] bg-[#E8962E]/10 hover:bg-[#E8962E]/15 border-[#E8962E]/20'
                  }`}
                >
                  <Wand2 className="w-4 h-4" /> Editar con IA
                </button>
              </div>

              {/* Panel de edicion con IA */}
              {editMode && (
                <div className="p-4 rounded-xl bg-[#111110] border border-[rgba(232,150,46,0.12)] space-y-2">
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-3.5 h-3.5 text-[#E8962E]" />
                    <span className="text-[10px] font-bold tracking-wider uppercase text-[#E8962E]">
                      Editar con IA {isCarousel ? `· slide ${activeSlide + 1}` : ''}
                    </span>
                    <span className="text-[9px] text-[#F2EFE9]/30 normal-case font-normal">
                      — retoque sutil, mantiene composicion
                    </span>
                  </div>
                  <textarea
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    rows={2}
                    placeholder="Ej: quita el logo de la esquina; cambia el color del boton a dorado; borra el icono del costado"
                    className="w-full bg-black/30 border border-[rgba(232,150,46,0.12)] rounded-xl p-2.5 text-[#F2EFE9] text-xs focus:border-[#E8962E]/50 focus:ring-1 focus:ring-[#E8962E]/30 placeholder-[#F2EFE9]/20 resize-none"
                    disabled={editing}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => { setEditMode(false); setEditPrompt(''); }}
                      disabled={editing}
                      className="px-3 py-1.5 rounded-lg text-xs text-[#F2EFE9]/50 hover:text-[#F2EFE9]/80 transition-colors disabled:opacity-40"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleApplyEdit}
                      disabled={editing || !editPrompt.trim()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E8962E]/15 text-[#E8962E] border border-[#E8962E]/40 text-xs font-semibold hover:bg-[#E8962E]/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {editing
                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Aplicando…</>
                        : <><Wand2 className="w-3.5 h-3.5" /> Aplicar edición</>
                      }
                    </button>
                  </div>
                </div>
              )}

              {!canRegenerate && (
                <p className="text-[10px] text-[#F2EFE9]/30">
                  Este creativo no tiene prompt guardado (creado antes del auto-save). Podés editarlo con IA,
                  pero para regenerarlo volvé a generarlo desde el panel.
                </p>
              )}
            </>
          ) : (
            <div className="aspect-square bg-[#111110] rounded-xl border border-[rgba(232,150,46,0.1)] flex items-center justify-center">
              <p className="text-sm text-[#F2EFE9]/20">Sin imagenes</p>
            </div>
          )}
        </div>

        {/* Copy details */}
        <div className="space-y-4">
          <div className="bg-[#111110] border border-[rgba(232,150,46,0.10)] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-[#F2EFE9]">Copy del Anuncio</h3>
              <button
                onClick={handleCopyCopy}
                className="flex items-center gap-1 text-xs text-[#F2EFE9]/40 hover:text-[#F2EFE9] transition-colors"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copiado' : 'Copiar todo'}
              </button>
            </div>

            <div>
              <label className="text-[10px] text-[#F2EFE9]/30 uppercase tracking-wider">Texto Principal</label>
              <p className="text-sm text-[#F2EFE9]/80 mt-1 whitespace-pre-line leading-relaxed">
                {creativo.texto_principal}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-[#F2EFE9]/30 uppercase tracking-wider">Titulo</label>
                <p className="text-sm font-medium text-[#F2EFE9] mt-1">{creativo.titulo}</p>
              </div>
              <div>
                <label className="text-[10px] text-[#F2EFE9]/30 uppercase tracking-wider">CTA</label>
                <p className="text-sm font-medium text-[#E8962E] mt-1">{creativo.cta_texto}</p>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-[#F2EFE9]/30 uppercase tracking-wider">Descripcion</label>
              <p className="text-sm text-[#F2EFE9]/60 mt-1">{creativo.descripcion}</p>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-[#111110] border border-[rgba(232,150,46,0.1)] rounded-xl p-4">
            <h3 className="text-xs font-medium text-[#F2EFE9]/40 mb-3">Metadata</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#F2EFE9]/30">Angulo</span>
                <span className="text-[#F2EFE9]/60">{ANGULO_LABELS[creativo.angulo].titulo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#F2EFE9]/30">Tipo</span>
                <span className="text-[#F2EFE9]/60">{TIPO_LABELS[creativo.tipo]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#F2EFE9]/30">Estado</span>
                <span className={`font-medium ${
                  creativo.estado === 'aprobado' ? 'text-[#22C55E]' :
                  creativo.estado === 'descartado' ? 'text-[#EF4444]' : 'text-[#E8962E]'
                }`}>
                  {creativo.estado.charAt(0).toUpperCase() + creativo.estado.slice(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#F2EFE9]/30">Creado</span>
                <span className="text-[#F2EFE9]/60">
                  {new Date(creativo.created_at).toLocaleString('es')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
