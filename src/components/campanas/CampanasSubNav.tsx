/**
 * CampanasSubNav.tsx — Las diez pestañas de Campañas.
 *
 * Son diez y en un teléfono entran tres, así que la tira se desplaza. Dos
 * cosas hacían que eso se viera como un error en vez de como una tira:
 *
 *   · la tira arrancaba siempre en la primera, así que estando en «Ganadores»
 *     —la última— la pestaña marcada quedaba fuera de vista: el cliente veía
 *     tres pestañas, ninguna encendida, y la suya en ningún lado;
 *   · el último chip visible se cortaba contra el borde a mitad de palabra
 *     («Tus 3» de «Tus 3 anuncios»), que se lee como texto truncado.
 *
 * Ahora la tira se mueve sola hasta la pestaña activa, y termina con aire a
 * la derecha para que el corte caiga en el hueco entre dos chips.
 */
import { useEffect, useRef } from 'react';
import {
  Home, Rocket, Target, PenTool, PenLine, BarChart3, Wrench, FolderOpen, Trophy, Sparkles } from 'lucide-react';
import type { CampanasView } from '../../lib/campanasTypes';

interface NavItem {
  id: CampanasView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  // Primero la activación: es donde se aterriza y la que dice qué toca hoy.
  // Sin su botón acá, aterrizar en ella era un callejón sin vuelta.
  { id: 'activacion', label: 'Activación', icon: Rocket },
  { id: 'escribir', label: 'Escribir', icon: PenLine },
  { id: 'anuncios', label: 'Tus 3 anuncios', icon: Sparkles },
  { id: 'home', label: 'Inicio', icon: Home },
  { id: 'nueva', label: 'Montar en Meta', icon: Target },
  // «Copies» es como la publicidad llama a los textos de un anuncio. Esta es
  // una pestaña de la casa, no un campo de Meta: va en castellano.
  { id: 'copies', label: 'Textos', icon: PenTool },
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
  const activa = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    activa.current?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [currentView]);

  // Hide sub-nav on drill-down views
  if (currentView === 'studio' || currentView === 'detail') return null;

  return (
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide pb-4 pr-6 mb-2 border-b border-[var(--line, rgba(142,104,36,0.18))]">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            ref={isActive ? activa : undefined}
            onClick={() => onNavigate(item.id)}
            /*
              `font-semibold` y no `font-medium`: a 17 píxeles el 500 y el 600
              son el mismo gesto, y con las diez pestañas en 500 estas
              pantallas hablaban CUATRO pesos sobre un mismo cuerpo —400, 500,
              600 y 700—, uno más del techo que la casa se puso. Pasadas al
              600 que ya usa el énfasis, quedan tres. Y una pestaña se lee
              mejor en semibold.
            */
            className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
              isActive
                ? 'bg-gold/15 text-gold border border-gold/30'
                : 'text-cream/65 hover:text-cream/80 hover:bg-cream/5 border border-transparent'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {item.label}
            {item.badge && (
              <span className="text-sm font-bold px-1.5 py-0.5 rounded-full bg-azure/15 text-azure border border-azure/25">
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
