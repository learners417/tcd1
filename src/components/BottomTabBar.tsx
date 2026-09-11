/**
 * CP4 · Barra inferior de navegación — el shell que hace que se sienta app nativa.
 * Fija abajo, SOLO mobile (md:hidden). Respeta el safe-area del iPhone.
 * Los 5 destinos principales siempre visibles; "Más" abre el drawer con el resto.
 */
import { Sun, Map, Dna, MessageSquare, Hexagon } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: typeof Sun;
}

/**
 * Los MISMOS cinco destinos del menu lateral, en el mismo orden.
 * Dos navegaciones distintas en la misma app es la forma mas rapida de
 * que alguien se pierda.
 */
const TABS: Tab[] = [
  { id: 'dashboard', label: 'Hoy', icon: Sun },
  { id: 'roadmap', label: 'Camino', icon: Map },
  { id: 'adn', label: 'ADN', icon: Dna },
  { id: 'coach', label: 'Mentor', icon: MessageSquare },
  { id: 'miclinica', label: 'Clínica', icon: Hexagon },
];

interface Props {
  currentPage: string;
  setCurrentPage: (p: string) => void;
  /** @deprecated V5: con cinco destinos no hay boton "mas". */
  onMore?: () => void;
}

export default function BottomTabBar({ currentPage, setCurrentPage }: Props) {
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-gold/20 bg-[var(--bg-root)]/95 backdrop-blur-xl"
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
              onClick={() => {
                // Tu Clinica no es una pagina de esta app: es la otra app.
                if (tab.id === 'miclinica') { window.open('https://mcd-eight.vercel.app', '_blank'); return; }
                setCurrentPage(tab.id);
              }}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-1.5 flex-1 min-h-[4rem] pt-2.5 pb-2 transition-colors ${
                active ? 'text-gold' : 'text-cream/65 hover:text-cream/80'
              }`}
            >
              <Icon className="w-[25px] h-[25px]" strokeWidth={active ? 2.2 : 1.7} />
              <span className="text-[12.5px] font-medium leading-none tracking-tight">{tab.label}</span>
            </button>
          );
        })}
        {/* V5: con cinco destinos no hace falta un boton "mas". Lo que no
            esta aca, vive adentro de la sesion que lo necesita. */}
      </div>
    </nav>
  );
}
