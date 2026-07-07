import React, { useState } from 'react';
import { Image as ImageIcon, Layers, Download, Trash2, Eye, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { ANGULO_LABELS, TIPO_LABELS } from '../../lib/campanasTypes';
import { deleteCreativo, downloadImage } from '../../lib/campanasStorage';
import type { Creativo, AnguloCreativo, TipoCreativo } from '../../lib/campanasTypes';

interface Props {
  creativos: Creativo[];
  onSelect: (creativo: Creativo) => void;
  onRefresh: () => void;
  userId?: string;
  compact?: boolean;
}

type FilterType = 'all' | TipoCreativo;
type FilterAngulo = 'all' | AnguloCreativo;

export default function CreativoGallery({ creativos, onSelect, onRefresh, userId, compact }: Props) {
  const [filterTipo, setFilterTipo] = useState<FilterType>('all');
  const [filterAngulo, setFilterAngulo] = useState<FilterAngulo>('all');

  const filtered = creativos.filter((c) => {
    if (filterTipo !== 'all' && c.tipo !== filterTipo) return false;
    if (filterAngulo !== 'all' && c.angulo !== filterAngulo) return false;
    return true;
  });

  const handleDelete = async (e: React.MouseEvent, creativo: Creativo) => {
    e.stopPropagation();
    if (!userId || !window.confirm('Eliminar este creativo?')) return;
    await deleteCreativo(creativo.id, userId);
    toast.success('Creativo eliminado');
    onRefresh();
  };

  const handleDownload = (e: React.MouseEvent, creativo: Creativo) => {
    e.stopPropagation();
    if (creativo.assets?.[0]?.public_url) {
      downloadImage(creativo.assets[0].public_url, `${creativo.nombre ?? 'creativo'}.png`);
    }
  };

  if (creativos.length === 0) {
    return (
      <div className="text-center py-12">
        <ImageIcon className="w-12 h-12 text-[#F2EFE9]/10 mx-auto mb-3" />
        <p className="text-sm text-[#F2EFE9]/30">No hay creativos todavia</p>
        <p className="text-xs text-[#F2EFE9]/20 mt-1">Genera tu primer creativo en el Studio</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      {!compact && (
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#F2EFE9]/30" />
            <span className="text-xs text-[#F2EFE9]/30">Tipo:</span>
            {(['all', 'imagen_single', 'carrusel'] as FilterType[]).map((t) => (
              <button
                key={t}
                onClick={() => setFilterTipo(t)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
                  filterTipo === t
                    ? 'bg-[#E8962E]/15 text-[#E8962E]'
                    : 'bg-[#F2EFE9]/5 text-[#F2EFE9]/30 hover:text-[#F2EFE9]/50'
                }`}
              >
                {t === 'all' ? 'Todos' : TIPO_LABELS[t]}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[#F2EFE9]/30">Angulo:</span>
            <button
              onClick={() => setFilterAngulo('all')}
              className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
                filterAngulo === 'all'
                  ? 'bg-[#E8962E]/15 text-[#E8962E]'
                  : 'bg-[#F2EFE9]/5 text-[#F2EFE9]/30 hover:text-[#F2EFE9]/50'
              }`}
            >
              Todos
            </button>
            {(Object.keys(ANGULO_LABELS) as AnguloCreativo[]).map((a) => (
              <button
                key={a}
                onClick={() => setFilterAngulo(a)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
                  filterAngulo === a
                    ? 'bg-[#E8962E]/15 text-[#E8962E]'
                    : 'bg-[#F2EFE9]/5 text-[#F2EFE9]/30 hover:text-[#F2EFE9]/50'
                }`}
              >
                {ANGULO_LABELS[a].titulo}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      <div className={`grid gap-4 ${compact ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
        {(compact ? filtered.slice(0, 8) : filtered).map((creativo) => {
          const firstAsset = creativo.assets?.[0];
          const slideCount = creativo.assets?.length ?? 0;

          return (
            <button
              key={creativo.id}
              onClick={() => onSelect(creativo)}
              className="group text-left bg-[#111110] border border-[rgba(232,150,46,0.1)] rounded-xl overflow-hidden hover:border-[rgba(232,150,46,0.18)] transition-all"
            >
              {/* Image */}
              <div className="relative aspect-square bg-[#080808]">
                {firstAsset ? (
                  <img src={firstAsset.public_url} alt={creativo.nombre ?? 'Creativo'} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-[#F2EFE9]/10" />
                  </div>
                )}

                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#F2EFE9]/10 flex items-center justify-center text-[#F2EFE9] hover:bg-[#F2EFE9]/20 transition-colors">
                    <Eye className="w-4 h-4" />
                  </div>
                  {firstAsset && (
                    <div
                      onClick={(e) => handleDownload(e, creativo)}
                      className="w-9 h-9 rounded-full bg-[#F2EFE9]/10 flex items-center justify-center text-[#F2EFE9] hover:bg-[#F2EFE9]/20 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </div>
                  )}
                  <div
                    onClick={(e) => handleDelete(e, creativo)}
                    className="w-9 h-9 rounded-full bg-[#EF4444]/10 flex items-center justify-center text-[#EF4444] hover:bg-[#EF4444]/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </div>
                </div>

                {/* Badges */}
                {creativo.tipo === 'carrusel' && slideCount > 0 && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 text-xs text-[#F2EFE9]">
                    <Layers className="w-3 h-3" /> {slideCount}
                  </div>
                )}
              </div>

              {/* Info */}
              {!compact && (
                <div className="p-3 space-y-1">
                  <p className="text-sm font-medium text-[#F2EFE9] truncate">{creativo.titulo}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E8962E]/10 text-[#E8962E]">
                      {ANGULO_LABELS[creativo.angulo].titulo}
                    </span>
                    <span className="text-[10px] text-[#F2EFE9]/30">
                      {TIPO_LABELS[creativo.tipo]}
                    </span>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
