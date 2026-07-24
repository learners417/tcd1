/**
 * CampanasSubNav.tsx — Tabs horizontales para navegar modulos de campanas
 */
import {
  Home, Target, PenTool, BarChart3, Wrench, FolderOpen, Trophy, Sparkles } from 'lucide-react';
import type { CampanasView } from '../../lib/campanasTypes';

interface NavItem {
  id: CampanasView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'anuncios', label: 'Tus 3 anuncios', icon: Sparkles },
  { id: 'home', label: 'Inicio', icon: Home },
  { id: 'nueva', label: 'Nueva campaña', icon: Target },
  { id: 'copies', label: 'Copies', icon: PenTool },
  { id: 'diagnostico', label: 'Diagnosticar', icon: BarChart3 },
  { id: 'montaje', label: 'Montaje', icon: Wrench },
  { id: 'historial', label: 'Historial', icon: FolderOpen },
  { id: 'ganadores', label: 'Ganadores', icon: Trophy },
];

interface Props {
  currentView: CampanasView;
  onNavigate: (view: CampanasView) => void;
}

export default function CampanasSubNav({ currentView, onNavigate }: Props) {
  // Hide sub-nav on drill-down views
  if (currentView === 'studio' || currentView === 'detail') return null;

  return (
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide pb-4 mb-2 border-b border-[rgba(232,150,46,0.1)]">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              isActive
                ? 'bg-gold/15 text-gold border border-gold/30'
                : 'text-cream/65 hover:text-cream/80 hover:bg-cream/5 border border-transparent'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {item.label}
            {item.badge && (
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-azure/15 text-azure border border-azure/25">
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
