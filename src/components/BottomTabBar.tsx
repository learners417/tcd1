/**
 * CP4 · Barra inferior de navegación — el shell que hace que se sienta app nativa.
 * Fija abajo, SOLO mobile (md:hidden). Respeta el safe-area del iPhone.
 * Los 5 destinos principales siempre visibles; "Más" abre el drawer con el resto.
 */
import { LayoutDashboard, Map, Sparkles, Trophy, Menu } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
}

const TABS: Tab[] = [
  { id: 'dashboard', label: 'Hoy', icon: LayoutDashboard },
  { id: 'roadmap', label: 'El Camino', icon: Map },
  { id: 'coach', label: 'Mentor', icon: Sparkles },
  { id: 'liga', label: 'La Liga', icon: Trophy },
];

interface Props {
  currentPage: string;
  setCurrentPage: (p: string) => void;
  onMore: () => void;
}

export default function BottomTabBar({ currentPage, setCurrentPage, onMore }: Props) {
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-gold/10 bg-ink/90 backdrop-blur-xl"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Navegación principal"
    >
      <div className="flex items-stretch justify-around px-1">
        {TABS.map((tab) => {
          const active = currentPage === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCurrentPage(tab.id)}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-1 flex-1 min-h-[3.5rem] pt-2 pb-1.5 transition-colors ${
                active ? 'text-gold' : 'text-cream/65 hover:text-cream/80'
              }`}
            >
              <Icon className="w-[22px] h-[22px]" strokeWidth={active ? 2.5 : 2} />
              <span className="text-[11px] font-medium leading-none">{tab.label}</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={onMore}
          className="flex flex-col items-center justify-center gap-1 flex-1 min-h-[3.5rem] pt-2 pb-1.5 text-cream/65 hover:text-cream/80 transition-colors"
        >
          <Menu className="w-[22px] h-[22px]" strokeWidth={2} />
          <span className="text-[11px] font-medium leading-none">Más</span>
        </button>
      </div>
    </nav>
  );
}
