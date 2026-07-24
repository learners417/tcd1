/**
 * TaskFiltersBar — barra horizontal compacta, una sola fila.
 * Estructura:
 *   [icono filtros + count] · scope chips · | · prioridad chips · | · personas (con su color) · [Limpiar]
 *
 * Wrapping natural si no entra. Sin labels en caps. Sin secciones gigantes.
 * Los chips de personas usan el mismo color que sus cards en el board.
 */
import { useMemo } from 'react';
import { Filter, X, UserCheck, UserPlus, AlertCircle, CalendarDays } from 'lucide-react';
import type { AdminTareaPrioridad, Profile } from '../../../lib/supabase';
import { ADMIN_TAREA_PRIORIDAD_LABELS } from '../../../lib/supabase';
import { getTeamColor, getInitials } from '../../../lib/teamColors';

export interface TaskFilters {
  asignadasAMi: boolean;
  creadasPorMi: boolean;
  vencidas: boolean;
  estaSemana: boolean;
  prioridades: Set<AdminTareaPrioridad>;
  asignados: Set<string>; // ids de teamMembers
}

export const EMPTY_FILTERS: TaskFilters = {
  asignadasAMi: false,
  creadasPorMi: false,
  vencidas: false,
  estaSemana: false,
  prioridades: new Set<AdminTareaPrioridad>(),
  asignados: new Set<string>(),
};

interface TaskFiltersBarProps {
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
  teamMembers: Profile[];
  currentUserId?: string;
}

const PRIORIDADES: AdminTareaPrioridad[] = ['urgente', 'alta', 'media', 'baja'];

const PRIORIDAD_CHIP_COLORS: Record<AdminTareaPrioridad, { active: string; idle: string; dot: string }> = {
  urgente: {
    active: 'bg-red-500/15 text-red-400 border-red-500/40',
    idle: 'border-transparent text-cream/55 hover:text-red-400 hover:bg-red-500/5',
    dot: 'bg-red-500',
  },
  alta: {
    active: 'bg-orange-500/20 text-orange-400 border-orange-500/45',
    idle: 'border-transparent text-cream/55 hover:text-orange-400 hover:bg-orange-500/8',
    dot: 'bg-orange-500',
  },
  media: {
    active: 'bg-gold/15 text-gold border-gold/40',
    idle: 'border-transparent text-cream/55 hover:text-gold hover:bg-gold/5',
    dot: 'bg-gold',
  },
  baja: {
    active: 'bg-success/15 text-success border-success/40',
    idle: 'border-transparent text-cream/55 hover:text-success hover:bg-success/5',
    dot: 'bg-success',
  },
};

const CHIP_BASE = 'h-7 inline-flex items-center gap-1.5 px-2.5 rounded-md text-xs font-semibold border transition-all whitespace-nowrap';

function Divider() {
  return <span className="w-px h-5 bg-cream/10 mx-0.5" aria-hidden />;
}

function ScopeChip({
  active, onClick, icon: Icon, children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`${CHIP_BASE} ${active
        ? 'bg-gold/15 text-gold border-gold/40'
        : 'border-transparent text-cream/55 hover:text-cream hover:bg-cream/5'
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {children}
    </button>
  );
}

export default function TaskFiltersBar({ filters, onChange, teamMembers, currentUserId }: TaskFiltersBarProps) {
  const activeCount = useMemo(() => {
    let n = 0;
    if (filters.asignadasAMi) n++;
    if (filters.creadasPorMi) n++;
    if (filters.vencidas) n++;
    if (filters.estaSemana) n++;
    n += filters.prioridades.size;
    n += filters.asignados.size;
    return n;
  }, [filters]);

  function togglePrioridad(p: AdminTareaPrioridad) {
    const next = new Set(filters.prioridades);
    if (next.has(p)) next.delete(p); else next.add(p);
    onChange({ ...filters, prioridades: next });
  }

  function toggleAsignado(id: string) {
    const next = new Set(filters.asignados);
    if (next.has(id)) next.delete(id); else next.add(id);
    onChange({ ...filters, asignados: next });
  }

  function reset() {
    onChange({ ...EMPTY_FILTERS, prioridades: new Set(), asignados: new Set() });
  }

  // Ordenar miembros: el currentUser primero
  const sortedMembers = useMemo(() => {
    if (!currentUserId) return teamMembers;
    const me = teamMembers.find(m => m.id === currentUserId);
    const others = teamMembers
      .filter(m => m.id !== currentUserId)
      .sort((a, b) => (a.nombre ?? '').localeCompare(b.nombre ?? ''));
    return me ? [me, ...others] : teamMembers;
  }, [teamMembers, currentUserId]);

  return (
    <div className="bg-[#0F0F0F] border border-[rgba(255,255,255,0.06)] rounded-xl px-2.5 py-2">
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Filter indicator */}
        <div className="flex items-center gap-1.5 pl-1 pr-2 h-7 text-cream/55">
          <Filter className="w-3.5 h-3.5" />
          {activeCount > 0 && (
            <span className="text-[11px] font-bold bg-gold/20 text-gold px-1.5 py-0.5 rounded-full leading-none">
              {activeCount}
            </span>
          )}
        </div>

        <Divider />

        {/* Scope chips */}
        <ScopeChip
          active={filters.asignadasAMi}
          onClick={() => onChange({ ...filters, asignadasAMi: !filters.asignadasAMi })}
          icon={UserCheck}
        >
          Para mí
        </ScopeChip>
        <ScopeChip
          active={filters.creadasPorMi}
          onClick={() => onChange({ ...filters, creadasPorMi: !filters.creadasPorMi })}
          icon={UserPlus}
        >
          Creé yo
        </ScopeChip>
        <ScopeChip
          active={filters.vencidas}
          onClick={() => onChange({ ...filters, vencidas: !filters.vencidas })}
          icon={AlertCircle}
        >
          Vencidas
        </ScopeChip>
        <ScopeChip
          active={filters.estaSemana}
          onClick={() => onChange({ ...filters, estaSemana: !filters.estaSemana })}
          icon={CalendarDays}
        >
          Esta semana
        </ScopeChip>

        <Divider />

        {/* Prioridad chips con dot de color */}
        {PRIORIDADES.map(p => {
          const active = filters.prioridades.has(p);
          const colors = PRIORIDAD_CHIP_COLORS[p];
          return (
            <button
              key={p}
              onClick={() => togglePrioridad(p)}
              className={`${CHIP_BASE} ${active ? colors.active : colors.idle}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
              {ADMIN_TAREA_PRIORIDAD_LABELS[p]}
            </button>
          );
        })}

        {sortedMembers.length > 0 && <Divider />}

        {/* Personas con su color de equipo */}
        {sortedMembers.map(m => {
          const active = filters.asignados.has(m.id);
          const color = getTeamColor(m.id, currentUserId);
          const name = (m.nombre ?? m.email ?? '?').split(' ')[0];
          return (
            <button
              key={m.id}
              onClick={() => toggleAsignado(m.id)}
              style={active
                ? { backgroundColor: color.bg, borderColor: color.border, color: color.text }
                : { borderColor: 'transparent' }
              }
              className={`${CHIP_BASE} ${active
                ? ''
                : 'text-cream/55 hover:bg-cream/5 hover:text-cream'
              }`}
            >
              <span
                style={active
                  ? { backgroundColor: color.solid, color: '#080808' }
                  : { backgroundColor: color.bg, color: color.text }
                }
                className="w-4 h-4 rounded-full flex items-center justify-center text-[11px] font-bold leading-none"
              >
                {getInitials(m.nombre)}
              </span>
              {name}
            </button>
          );
        })}

        {/* Reset alineado a la derecha */}
        {activeCount > 0 && (
          <button
            onClick={reset}
            className="ml-auto h-7 inline-flex items-center gap-1 px-2 text-xs text-cream/55 hover:text-gold transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Limpiar
          </button>
        )}
      </div>
    </div>
  );
}
