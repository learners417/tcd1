import { useEffect, useRef, useState } from 'react';
import { Paperclip, Upload, Loader2, Trash2, Download, FileText, FileImage, FileArchive, File as FileIcon } from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchTareaAdjuntos,
  uploadTareaAdjunto,
  deleteTareaAdjunto,
  getTareaAdjuntoSignedUrl,
  MAX_ATTACHMENT_BYTES,
  type TareaAdjunto,
} from '../../lib/adminTasks';

interface TaskAttachmentsProps {
  tareaId?: string;
  currentUserId: string;
  /**
   * Modo "pendiente": cuando no hay tareaId todavía (creación), los archivos
   * se mantienen en memoria local y luego el padre los sube tras crear la tarea.
   */
  pendingFiles?: File[];
  onPendingFilesChange?: (files: File[]) => void;
}

function formatSize(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mime: string | null) {
  if (!mime) return FileIcon;
  if (mime.startsWith('image/')) return FileImage;
  if (mime.includes('zip') || mime.includes('rar') || mime.includes('7z')) return FileArchive;
  if (mime.startsWith('text/') || mime.includes('pdf') || mime.includes('document') || mime.includes('sheet')) return FileText;
  return FileIcon;
}

export default function TaskAttachments({
  tareaId,
  currentUserId,
  pendingFiles,
  onPendingFilesChange,
}: TaskAttachmentsProps) {
  const isPending = !tareaId;
  const [adjuntos, setAdjuntos] = useState<TareaAdjunto[]>([]);
  const [loading, setLoading] = useState(!isPending);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!tareaId) {
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    fetchTareaAdjuntos(tareaId)
      .then(rows => { if (alive) setAdjuntos(rows); })
      .catch(err => {
        console.error('Error cargando adjuntos:', err);
        if (alive) toast.error('No se pudieron cargar los adjuntos');
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [tareaId]);

  async function handleFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;

    if (isPending) {
      const valid: File[] = [];
      for (const file of list) {
        if (file.size > MAX_ATTACHMENT_BYTES) {
          toast.error(`"${file.name}" supera los 25 MB`);
          continue;
        }
        valid.push(file);
      }
      if (valid.length > 0 && onPendingFilesChange) {
        onPendingFilesChange([...(pendingFiles ?? []), ...valid]);
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploading(true);
    try {
      for (const file of list) {
        if (file.size > MAX_ATTACHMENT_BYTES) {
          toast.error(`"${file.name}" supera los 25 MB`);
          continue;
        }
        try {
          const adj = await uploadTareaAdjunto({ tarea_id: tareaId!, autor_id: currentUserId, file });
          setAdjuntos(prev => [adj, ...prev]);
          toast.success(`"${file.name}" subido`);
        } catch (err) {
          console.error('Error subiendo archivo:', err);
          toast.error(`No se pudo subir "${file.name}"`);
        }
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleRemovePending(index: number) {
    if (!onPendingFilesChange) return;
    const next = [...(pendingFiles ?? [])];
    next.splice(index, 1);
    onPendingFilesChange(next);
  }

  async function handleDownload(adj: TareaAdjunto) {
    const url = await getTareaAdjuntoSignedUrl(adj.storage_path);
    if (!url) {
      toast.error('No se pudo abrir el archivo');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  async function handleDelete(adj: TareaAdjunto) {
    if (adj.autor_id !== currentUserId) return;
    if (deletingId) return;
    setDeletingId(adj.id);
    const snapshot = adjuntos;
    setAdjuntos(prev => prev.filter(x => x.id !== adj.id));
    try {
      await deleteTareaAdjunto(adj);
    } catch {
      setAdjuntos(snapshot);
      toast.error('No se pudo eliminar el archivo');
    } finally {
      setDeletingId(null);
    }
  }

  const pendingList = pendingFiles ?? [];
  const totalCount = isPending ? pendingList.length : adjuntos.length;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 text-[10px] font-bold text-cream/40 uppercase tracking-wider">
        <Paperclip className="w-3.5 h-3.5" />
        Archivos
        {totalCount > 0 && (
          <span className="text-[10px] bg-gold/15 text-gold px-1.5 py-0.5 rounded-full normal-case tracking-normal font-semibold">
            {totalCount}
          </span>
        )}
      </div>

      {/* Lista de pendientes (modo creación) */}
      {isPending && pendingList.length > 0 && (
        <div className="space-y-1.5">
          {pendingList.map((file, idx) => {
            const Icon = getFileIcon(file.type);
            return (
              <div
                key={`${file.name}-${idx}`}
                className="flex items-center gap-2 bg-[#0F0F0F] border border-[rgba(255,255,255,0.06)] rounded-xl px-3 py-2 hover:border-gold/30 transition-colors"
              >
                <div className="w-8 h-8 shrink-0 rounded-md bg-gold/10 text-gold flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-cream truncate">{file.name}</div>
                  <div className="text-[10px] text-cream/40 flex items-center gap-2">
                    <span>{formatSize(file.size)}</span>
                    <span className="text-gold/70">· se subirá al crear la tarea</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemovePending(idx)}
                  className="p-1.5 rounded-md text-cream/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Quitar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Lista existente (modo edición) */}
      {!isPending && (loading ? (
        <div className="text-xs text-cream/30 italic px-1">Cargando…</div>
      ) : adjuntos.length > 0 && (
        <div className="space-y-1.5">
          {adjuntos.map(adj => {
            const Icon = getFileIcon(adj.mime_type);
            const isMine = adj.autor_id === currentUserId;
            return (
              <div
                key={adj.id}
                className="flex items-center gap-2 bg-[#0F0F0F] border border-[rgba(255,255,255,0.06)] rounded-xl px-3 py-2 hover:border-gold/30 transition-colors group"
              >
                <div className="w-8 h-8 shrink-0 rounded-md bg-gold/10 text-gold flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-cream truncate">{adj.file_name}</div>
                  <div className="text-[10px] text-cream/40 flex items-center gap-2">
                    <span>{formatSize(adj.size_bytes)}</span>
                    {adj.autor_nombre && <span>· subido por {adj.autor_nombre}</span>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownload(adj)}
                  className="p-1.5 rounded-md text-cream/40 hover:text-gold hover:bg-gold/10 transition-colors"
                  title="Descargar"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                {isMine && (
                  <button
                    type="button"
                    onClick={() => handleDelete(adj)}
                    disabled={deletingId === adj.id}
                    className="p-1.5 rounded-md text-cream/30 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* Dropzone */}
      <label
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
        }}
        className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl border-2 border-dashed cursor-pointer text-xs transition-all ${
          dragOver
            ? 'border-gold bg-gold/8 text-gold'
            : 'border-[rgba(255,255,255,0.08)] text-cream/45 hover:border-gold/40 hover:text-gold'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => { if (e.target.files) handleFiles(e.target.files); }}
        />
        {uploading ? (
          <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Subiendo…</>
        ) : (
          <><Upload className="w-3.5 h-3.5" /> Arrastrá archivos o haz clic para subir <span className="text-cream/25">(máx. 25 MB)</span></>
        )}
      </label>
    </div>
  );
}
