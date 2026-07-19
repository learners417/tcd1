import React, { useCallback, useRef, useState } from 'react';
import {
  Loader2, Wand2, Upload, X, User, Image as ImageIcon, Download, Save, RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { editImage, base64ToDataUrl } from '../../lib/campanasImageGen';
import type { ImageGenProgress } from '../../lib/campanasImageGen';
import {
  fileToBase64, loadImageDimensions, detectClosestFormat, validateImageFile,
  resizeBase64ToExact, compressImageBase64, ACCEPT_ATTR,
} from '../../lib/imageUploadUtils';
import type { UploadedImageWithDimensions, UploadedImage } from '../../lib/imageUploadUtils';
import { saveCreativo, uploadCreativeImage, upsertCreativoAsset } from '../../lib/campanasStorage';
import { IMAGE_FORMAT_OPTIONS } from '../../lib/campanasTypes';
import type { Campana, Creativo, ImageFormat } from '../../lib/campanasTypes';
import type { ProfileV2 } from '../../lib/supabase';

interface Props {
  campana?: Campana;
  userId?: string;
  perfil: Partial<ProfileV2>;
  geminiKey?: string;
  onSaved?: (creativo: Creativo) => void;
}

interface EditedResult {
  base64: string;
  mimeType: string;
  modelUsed: string;
}

export default function CreativoEdicion({ campana, userId, geminiKey, onSaved }: Props) {
  const [baseImage, setBaseImage] = useState<UploadedImageWithDimensions | null>(null);
  const [characterRef, setCharacterRef] = useState<UploadedImage | null>(null);
  const [editInstruction, setEditInstruction] = useState('');
  const [result, setResult] = useState<EditedResult | null>(null);
  const [editing, setEditing] = useState(false);
  const [progress, setProgress] = useState<ImageGenProgress | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const baseInputRef = useRef<HTMLInputElement>(null);
  const charInputRef = useRef<HTMLInputElement>(null);

  const detectedFormat: ImageFormat | null = baseImage
    ? detectClosestFormat(baseImage.width, baseImage.height)
    : null;

  const handleBaseUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const validationError = validateImageFile(file);
    if (validationError) { toast.error(validationError); return; }
    try {
      const uploaded = await fileToBase64(file);
      const dims = await loadImageDimensions(uploaded.base64, uploaded.mimeType);
      setBaseImage({ ...uploaded, ...dims });
      setResult(null);
      setSavedId(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      toast.error(`No se pudo cargar la imagen: ${msg}`);
    }
  }, []);

  const handleCharUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const validationError = validateImageFile(file);
    if (validationError) { toast.error(validationError); return; }
    try {
      const uploaded = await fileToBase64(file);
      setCharacterRef(uploaded);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      toast.error(`No se pudo cargar la referencia: ${msg}`);
    }
  }, []);

  const runEdit = useCallback(async () => {
    if (!baseImage) { toast.error('Sumi la imagen a editar'); return; }
    if (!editInstruction.trim()) { toast.error('Describi el cambio que queres aplicar'); return; }

    setEditing(true);
    setResult(null);
    setSavedId(null);
    try {
      const format: ImageFormat = detectedFormat ?? '1:1';

      // Comprimir antes de enviar al backend: PNGs grandes (3-4MB) saturan el
      // limite de payload. Reducir a max 1536px lado mayor + JPEG q0.9 baja
      // a ~300-500KB sin perdida visual notable. Las dims originales se
      // preservan en baseImage para el resize final.
      const compressedBase = await compressImageBase64(
        baseImage.base64, baseImage.mimeType, 1536, 0.92,
      );
      const compressedChar = characterRef
        ? await compressImageBase64(characterRef.base64, characterRef.mimeType, 1024, 0.85)
        : null;

      // quality 'medium' es ~4x mas rapido que 'high' y suficiente para
      // retoques (la base ya tiene la composicion). 'high' con 2 refs
      // grandes hace timeout en 120s con frecuencia.
      const aiResult = await editImage(
        { base64: compressedBase.base64, mimeType: compressedBase.mimeType },
        editInstruction.trim(),
        setProgress,
        { geminiKey, format, quality: 'medium' },
        compressedChar
          ? { base64: compressedChar.base64, mimeType: compressedChar.mimeType }
          : undefined,
      );

      // Resize a las dimensiones EXACTAS del original. Usamos 'cover' porque
      // OpenAI solo acepta 1024x1024, 1024x1536 y 1536x1024 — formatos como
      // 4:5 (0.8) caen al preset 2:3 (0.667), mas vertical. Con 'contain' eso
      // generaba bandas oscuras a los costados que hacian ver el resultado mas
      // finito que el original. 'cover' recorta minimamente los bordes donde
      // el modelo extendio el canvas (no hay contenido critico ahi porque la
      // composicion sigue a la base) y devuelve la imagen exactamente con el
      // tamano del original sin bandas.
      const resized = await resizeBase64ToExact(
        aiResult.imageBase64,
        aiResult.mimeType,
        baseImage.width,
        baseImage.height,
        'cover',
      );

      setResult({
        base64: resized.base64,
        mimeType: resized.mimeType,
        modelUsed: aiResult.modelUsed,
      });
      toast.success('Edicion lista');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      toast.error(`Error en la edicion: ${msg}`);
    } finally {
      setEditing(false);
      setProgress(null);
    }
  }, [baseImage, characterRef, editInstruction, detectedFormat, geminiKey]);

  const persistAsNewCreativo = useCallback(async () => {
    if (!result || !baseImage) return;
    if (!userId) { toast.error('Sesion sin usuario — no se puede guardar'); return; }

    setSaving(true);
    try {
      const fechaCorta = new Date().toLocaleDateString('es-AR', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
      });
      const creativo = await saveCreativo({
        usuario_id: userId,
        campana_id: campana?.id,
        tipo: 'imagen_single',
        angulo: 'directo',
        texto_principal: '',
        titulo: `Edicion ${fechaCorta}`,
        nombre: campana ? `${campana.nombre} - Edicion ${fechaCorta}` : `Edicion ${fechaCorta}`,
        estado: 'generado',
        prompt_imagen: editInstruction.trim(),
      });
      if (!creativo) throw new Error('No se pudo crear el creativo');

      const uploaded = await uploadCreativeImage(userId, creativo.id, 1, result.base64, result.mimeType);
      if (uploaded) {
        await upsertCreativoAsset({
          creativo_id: creativo.id,
          usuario_id: userId,
          slide_orden: 1,
          storage_path: uploaded.storagePath,
          public_url: uploaded.publicUrl,
          width: baseImage.width,
          height: baseImage.height,
          mime_type: result.mimeType,
        });
      }

      setSavedId(creativo.id);
      onSaved?.(creativo);
      toast.success('Guardado como creativo nuevo');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      toast.error(`Error al guardar: ${msg}`);
    } finally {
      setSaving(false);
    }
  }, [result, baseImage, userId, campana, editInstruction, onSaved]);

  const downloadResult = useCallback(() => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = base64ToDataUrl(result.base64, result.mimeType);
    const ext = result.mimeType === 'image/jpeg' ? 'jpg' : 'png';
    a.download = `edicion-${Date.now()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [result]);

  const continueEditing = useCallback(async () => {
    if (!result) return;
    const dims = await loadImageDimensions(result.base64, result.mimeType);
    setBaseImage({
      base64: result.base64,
      mimeType: result.mimeType,
      fileName: 'edicion-previa',
      width: dims.width,
      height: dims.height,
    });
    setResult(null);
    setSavedId(null);
    setEditInstruction('');
  }, [result]);

  const reset = useCallback(() => {
    setBaseImage(null);
    setCharacterRef(null);
    setEditInstruction('');
    setResult(null);
    setSavedId(null);
  }, []);

  const formatLabel = detectedFormat ? IMAGE_FORMAT_OPTIONS[detectedFormat].label : null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h3 className="text-sm font-semibold text-cream">
          Edicion de imagen
        </h3>
        <p className="text-xs text-cream/40 mt-1">
          Sumi una imagen existente, escribi los cambios y opcionalmente una referencia de personaje. La salida mantiene el tamano original.
        </p>
      </div>

      {/* Drop zones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Imagen a editar */}
        <div className="card-panel p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-gold" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-cream/70">
                Imagen a editar
              </span>
              <span className="text-[9px] text-danger/70 normal-case font-normal tracking-normal">obligatorio</span>
            </div>
            {baseImage && (
              <button
                onClick={() => setBaseImage(null)}
                className="text-cream/30 hover:text-danger transition-colors"
                aria-label="Quitar imagen"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {baseImage ? (
            <div className="space-y-2">
              <div className="relative rounded-lg overflow-hidden border border-[rgba(232,150,46,0.12)]">
                <img
                  src={base64ToDataUrl(baseImage.base64, baseImage.mimeType)}
                  alt="Imagen a editar"
                  className="w-full h-40 object-contain bg-black/30"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[10px] text-cream/40">
                <span>{baseImage.width} × {baseImage.height}px</span>
                {formatLabel && (
                  <>
                    <span className="text-cream/20">•</span>
                    <span className="text-gold/80">{formatLabel}</span>
                  </>
                )}
                <span className="text-cream/20">•</span>
                <span className="truncate max-w-[140px]">{baseImage.fileName}</span>
              </div>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-2 p-6 border border-dashed border-gold/30 rounded-lg cursor-pointer hover:border-gold/60 hover:bg-gold/5 transition-colors min-h-[160px]">
              <Upload className="w-5 h-5 text-cream/30" />
              <span className="text-xs text-cream/50">Subir imagen</span>
              <span className="text-[10px] text-cream/25">JPG / PNG / WebP — max 10MB</span>
              <input
                ref={baseInputRef}
                type="file"
                accept={ACCEPT_ATTR}
                className="hidden"
                onChange={handleBaseUpload}
              />
            </label>
          )}
        </div>

        {/* Personaje de referencia */}
        <div className="card-panel p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-cream/40" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-cream/70">
                Personaje de referencia
              </span>
              <span className="text-[9px] text-cream/30 normal-case font-normal tracking-normal">opcional</span>
            </div>
            {characterRef && (
              <button
                onClick={() => setCharacterRef(null)}
                className="text-cream/30 hover:text-danger transition-colors"
                aria-label="Quitar referencia"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {characterRef ? (
            <div className="space-y-2">
              <div className="relative rounded-lg overflow-hidden border border-cream/10">
                <img
                  src={base64ToDataUrl(characterRef.base64, characterRef.mimeType)}
                  alt="Personaje de referencia"
                  className="w-full h-40 object-contain bg-black/30"
                />
              </div>
              <p className="text-[10px] text-cream/40 truncate">{characterRef.fileName}</p>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-2 p-6 border border-dashed border-cream/10 rounded-lg cursor-pointer hover:border-gold/30 hover:bg-cream/[0.02] transition-colors min-h-[160px]">
              <Upload className="w-5 h-5 text-cream/20" />
              <span className="text-xs text-cream/40">Subir referencia</span>
              <span className="text-[10px] text-cream/25">para reemplazar al personaje del slide</span>
              <input
                ref={charInputRef}
                type="file"
                accept={ACCEPT_ATTR}
                className="hidden"
                onChange={handleCharUpload}
              />
            </label>
          )}
        </div>
      </div>

      {/* Instrucciones */}
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-cream/40 mb-2">
          Indicaciones de cambio
        </label>
        <textarea
          value={editInstruction}
          onChange={(e) => setEditInstruction(e.target.value)}
          rows={4}
          aria-label="Indicaciones de cambio"
          placeholder="Ej: Cambia el titulo principal a 'NUEVO TITULO'. Reemplaza al personaje por la persona de la referencia. Cambia el fondo a azul oscuro manteniendo todo lo demas igual."
          className="w-full bg-black/20 border border-[rgba(232,150,46,0.14)] rounded-xl p-3 text-cream text-sm focus:border-gold/60 focus:ring-1 focus:ring-gold/30 transition-all placeholder-cream/20 resize-none"
          disabled={editing}
        />
        {characterRef && (
          <p className="text-[10px] text-gold/70 mt-1.5">
            La referencia de personaje se usara para reemplazar al personaje del slide manteniendo pose, iluminacion y composicion.
          </p>
        )}
      </div>

      {/* Acciones */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={runEdit}
          disabled={editing || !baseImage || !editInstruction.trim()}
          className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {editing
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Generando edicion...</>
            : <><Wand2 className="w-4 h-4" /> Editar imagen</>}
        </button>
        {(baseImage || characterRef || result) && !editing && (
          <button
            onClick={reset}
            className="px-4 py-2 rounded-xl border border-cream/10 text-xs text-cream/50 hover:border-cream/25 hover:text-cream/80 transition-all"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Progress */}
      {editing && progress && (
        <div className="p-4 rounded-xl bg-panel border border-[rgba(232,150,46,0.10)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-cream/60">
              Modelo: <span className="text-gold">{progress.modelName}</span>
            </span>
            <span className="text-xs text-cream/40">Intento {progress.attempt}/{progress.total}</span>
          </div>
          <div className="h-1.5 bg-cream/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gold rounded-full transition-all duration-500"
              style={{ width: `${(progress.attempt / progress.total) * 100}%` }}
            />
          </div>
          {progress.status === 'failed' && (
            <p className="text-xs text-danger/60 mt-1">Fallo, intentando siguiente modelo...</p>
          )}
        </div>
      )}

      {/* Resultado */}
      {result && baseImage && (
        <div className="space-y-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-cream/40">
            Resultado
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <p className="text-[10px] text-cream/40 uppercase tracking-wider">Original</p>
              <div className="rounded-xl overflow-hidden border border-cream/10">
                <img
                  src={base64ToDataUrl(baseImage.base64, baseImage.mimeType)}
                  alt="Original"
                  className="w-full h-auto block"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] text-gold uppercase tracking-wider">Editada</p>
              <div className="rounded-xl overflow-hidden border border-gold/30">
                <img
                  src={base64ToDataUrl(result.base64, result.mimeType)}
                  alt="Editada"
                  className="w-full h-auto block"
                />
              </div>
              <p className="text-[9px] text-cream/30">Modelo: {result.modelUsed}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={downloadResult}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-cream/15 text-xs text-cream/70 hover:border-gold/40 hover:text-gold transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Descargar
            </button>
            <button
              onClick={persistAsNewCreativo}
              disabled={saving || savedId !== null}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gold/15 text-gold border border-gold/40 text-xs font-semibold hover:bg-gold/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Guardando...</>
                : savedId
                  ? <><Save className="w-3.5 h-3.5" /> Guardado en historial</>
                  : <><Save className="w-3.5 h-3.5" /> Guardar en historial</>}
            </button>
            <button
              onClick={continueEditing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-cream/10 text-xs text-cream/50 hover:border-cream/25 hover:text-cream/80 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Editar de nuevo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
