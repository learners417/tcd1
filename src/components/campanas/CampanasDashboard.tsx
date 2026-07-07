import React from 'react';
import { Plus, Send, MessageCircle, UserCheck, Megaphone, Image as ImageIcon } from 'lucide-react';
import { OBJETIVO_LABELS, ESTADO_COLORS } from '../../lib/campanasTypes';
import type { Campana, Creativo, ObjetivoCampana } from '../../lib/campanasTypes';
import CreativoGallery from './CreativoGallery';

interface Props {
  campanas: Campana[];
  creativos: Creativo[];
  onNewCampana: () => void;
  onSelectCampana: (campana: Campana) => void;
  onSelectCreativo: (creativo: Creativo) => void;
  onRefresh: () => void;
  userId?: string;
}

const OBJETIVO_ICONS: Record<ObjetivoCampana, React.ElementType> = {
  trafico_perfil: Send,
  mensajes_retargeting: MessageCircle,
  clientes_potenciales: UserCheck,
};

export default function CampanasDashboard({
  campanas,
  creativos,
  onNewCampana,
  onSelectCampana,
  onSelectCreativo,
  onRefresh,
  userId,
}: Props) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-[#F2EFE9]"
            style={{ fontFamily: "'DM Serif Display', serif", fontStyle: 'italic' }}
          >
            Campañas & Creativos
          </h1>
          <p className="text-sm text-[#F2EFE9]/40 mt-1">
            Crea campañas de Meta Ads y genera creativos con IA
          </p>
        </div>
        <button onClick={onNewCampana} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nueva Campaña
        </button>
      </div>

      {/* Campanas grid */}
      <div>
        <h2 className="text-sm font-medium text-[#F2EFE9]/60 uppercase tracking-wider mb-4">
          Mis Campanas ({campanas.length})
        </h2>

        {campanas.length === 0 ? (
          <div className="text-center py-16 bg-[#111110] border border-[rgba(232,150,46,0.1)] rounded-2xl">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#E8962E]/10 border border-[#E8962E]/20 flex items-center justify-center">
              <Megaphone className="w-8 h-8 text-[#E8962E]" />
            </div>
            <p className="text-[#F2EFE9]/60 mb-2">Todavia no tenes campanas</p>
            <p className="text-sm text-[#F2EFE9]/30 mb-6">
              Crea tu primera campana para empezar a generar creativos con IA
            </p>
            <button onClick={onNewCampana} className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Crear Primera Campana
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {campanas.map((campana) => {
              const Icon = OBJETIVO_ICONS[campana.objetivo];
              const creativoCount = creativos.filter((c) => c.campana_id === campana.id).length;

              return (
                <button
                  key={campana.id}
                  onClick={() => onSelectCampana(campana)}
                  className="text-left bg-[#111110] border border-[rgba(232,150,46,0.1)] rounded-xl p-5 hover:border-[rgba(232,150,46,0.18)] transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-[#E8962E]/10 border border-[#E8962E]/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#E8962E]" />
                    </div>
                    <span
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${ESTADO_COLORS[campana.estado]}15`,
                        color: ESTADO_COLORS[campana.estado],
                      }}
                    >
                      {campana.estado.charAt(0).toUpperCase() + campana.estado.slice(1)}
                    </span>
                  </div>

                  <h3 className="text-sm font-medium text-[#F2EFE9] mb-1 group-hover:text-[#E8962E] transition-colors truncate">
                    {campana.nombre}
                  </h3>
                  <p className="text-xs text-[#F2EFE9]/40 mb-3">
                    {OBJETIVO_LABELS[campana.objetivo].titulo}
                  </p>

                  <div className="flex items-center justify-between text-xs text-[#F2EFE9]/30">
                    <div className="flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      <span>{creativoCount} creativos</span>
                    </div>
                    {campana.presupuesto_diario && (
                      <span>${campana.presupuesto_diario}/dia</span>
                    )}
                  </div>
                </button>
              );
            })}

            {/* Add new card */}
            <button
              onClick={onNewCampana}
              className="flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed border-[rgba(232,150,46,0.10)] hover:border-[rgba(232,150,46,0.18)] transition-all min-h-[160px]"
            >
              <Plus className="w-6 h-6 text-[#F2EFE9]/20 mb-2" />
              <span className="text-sm text-[#F2EFE9]/30">Nueva Campaña</span>
            </button>
          </div>
        )}
      </div>

      {/* Creativos recientes */}
      {creativos.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-[#F2EFE9]/60 uppercase tracking-wider mb-4">
            Creativos Recientes
          </h2>
          <CreativoGallery
            creativos={creativos}
            onSelect={onSelectCreativo}
            onRefresh={onRefresh}
            userId={userId}
            compact
          />
        </div>
      )}
    </div>
  );
}
