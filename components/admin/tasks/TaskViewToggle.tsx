/**
 * TaskViewToggle — tabs para alternar entre Kanban / Lista / Por persona / Mis tareas.
 */
import { LayoutGrid, List, UserCircle, Users } from 'lucide-react';

export type TaskView = 'kanban' | 'list' | 'people' | 'mine';

interface TaskViewToggleProps {
  value: TaskView;
  onChange: (v: TaskView) => void;
  myCount?: number;
}

const TABS: { id: TaskView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'people', label: 'Por persona', icon: Users },
  { id: 'kanban', label: 'Kanban', icon: LayoutGrid },
  { id: 'list', label: 'Lista', icon: List },
  { id: 'mine', label: 'Mis tareas', icon: UserCircle },
];

export default function TaskViewToggle({ value, onChange, myCount }: TaskViewToggleProps) {
  return (
    <div className="inline-flex items-center bg-[#0F0F0F] border border-[rgba(232,150,46,0.10)] rounded-xl p-1">
      {TABS.map(t => {
        const active = value === t.id;
        const Icon = t.icon;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`
              flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all
              ${active
                ? 'bg-[#E8962E] text-black'
                : 'text-[#F2EFE9]/55 hover:text-[#F2EFE9] hover:bg-[#F2EFE9]/5'
              }
            `}
          >
            <Icon className="w-4 h-4" />
            <span>{t.label}</span>
            {t.id === 'mine' && typeof myCount === 'number' && myCount > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-black/20 text-black' : 'bg-[#E8962E]/20 text-[#E8962E]'}`}>
                {myCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
