import { planLimitado } from '../lib/adnPiezas';
import { planActual, planPermitePilar } from '../lib/planes';
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Hexagon, Map as RoadmapIcon, MessageSquare, Settings, LogOut, Sparkles, Sun } from 'lucide-react';
import { SEED_ROADMAP_V2 } from '../lib/roadmapSeed';
import { cinturonDesdeProgreso, CINTURONES, type Cinturon } from '../lib/cinturones';

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  onOpenSettings: () => void;
  onSignOut: () => void;
  messageBadge?: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

function getSidebarData() {
  let profile = { nombre: 'Profesional', plan: 'Implementación', fecha_inicio: new Date().toISOString() };
  try {
    let p: { nombre?: string; fecha_inicio?: string; [k: string]: unknown } = {}; try { p = JSON.parse(localStorage.getItem('tcd_profile') || '{}'); } catch { /* noop */ }
    if (p.nombre) profile.nombre = p.nombre;
    if (p.fecha_inicio) profile.fecha_inicio = p.fecha_inicio;
  } catch { /* noop */ }

  let progress = 0;
  let hasPending = false;
  let cinturon: Cinturon = CINTURONES[0];
  try {
    const saved = localStorage.getItem('tcd_hoja_ruta_v2');
    const completadasSet = new Set<string>(saved ? JSON.parse(saved) : []);
    let total = 0;
    let comp = 0;
    for (const pil of SEED_ROADMAP_V2) {
      for (const meta of pil.metas ?? []) {
        total++;
        if (completadasSet.has(`${pil.numero}-${meta.codigo}`)) comp++;
        else hasPending = true;
      }
    }
    progress = total === 0 ? 0 : Math.round((comp / total) * 100);
    cinturon = cinturonDesdeProgreso(completadasSet);
  } catch { /* noop */ }

  const diff = Math.floor((new Date().getTime() - new Date(profile.fecha_inicio).getTime()) / (1000 * 60 * 60 * 24));
  const semana = Math.max(1, Math.min(13, Math.floor(diff / 7) + 1));
  const diaPrograma = Math.max(1, Math.min(90, diff + 1));

  return { profile, progress, hasPending, semana, diaPrograma, cinturon };
}

export default function Sidebar({ currentPage, setCurrentPage, onOpenSettings, onSignOut, messageBadge = 0, collapsed, onToggleCollapse, mobileOpen, onMobileClose }: SidebarProps) {
  const [data, setData] = useState(getSidebarData());

  useEffect(() => {
    const interval = setInterval(() => {
      setData(getSidebarData());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  /**
   * MENU V5 — cinco destinos, y nada mas.
   *
   * La regla que ordena esto: si algo se usa en UN dia especifico del camino,
   * no va aca — va en ese dia. El menu es solo para lo que se usa cualquier dia.
   *
   * Por eso salieron Campanas, Creador de Contenido y El Metodo: son
   * herramientas de una sesion concreta, y tenerlas sueltas obliga al cliente a
   * preguntarse "esto lo tengo que usar ahora?" noventa veces.
   *
   * Y salio "Lo que sigue": era Hoy con otro nombre, y dos nombres para la
   * misma cosa hacen dudar cual mirar.
   *
   * Los nombres siguen un solo sistema: todo es suyo. Tu Camino, Tu ADN,
   * Tu Mentor, Tu Clinica.
   */
  type MenuItem = {
    id: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    badge?: boolean;
    minPilar?: number;
    minCinturon?: number;
    action?: () => void;
  };

  const sections = [
    {
      title: '',
      items: [
        { id: 'dashboard', icon: Sun, label: 'Hoy' } as MenuItem,
        { id: 'roadmap', icon: RoadmapIcon, label: 'Tu Camino', badge: data.hasPending } as MenuItem,
        { id: 'adn', icon: Sparkles, label: 'Tu ADN' } as MenuItem,
        { id: 'coach', icon: MessageSquare, label: 'Tu Mentor' } as MenuItem,
        { id: 'miclinica', icon: Hexagon, label: 'Tu Clínica', minPilar: 6, action: () => window.open('https://mcd-eight.vercel.app', '_blank') } as MenuItem,
      ]
    },
  ];

  const initial = data.profile.nombre.charAt(0).toUpperCase();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:inset-auto md:translate-x-0 md:z-20 ${collapsed ? 'md:w-16' : 'md:w-64'} h-full flex flex-col py-6 transition-all duration-300 shrink-0 overflow-x-hidden border-r border-[rgba(232,150,46,0.10)] bg-ink/90 backdrop-blur-xl`}
    >
      {/* Logo */}
      <div className={`flex items-center mb-8 ${collapsed ? 'justify-center px-0' : 'px-6'}`}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2" style={{ borderColor: 'rgba(232,150,46,0.45)', background: 'radial-gradient(circle at 30% 25%, rgba(244,182,92,0.22), rgba(232,150,46,0.06) 70%)' }}>
          {/* El brote: la semilla del método que crece — de Blanco a Negro */}
          <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none">
            <path d="M12 20V11" stroke="#B0822E" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M12 12C12 8.5 9.5 6.5 6 6.5C6 10 8.5 12 12 12Z" fill="#B0822E" fillOpacity="0.85" />
            <path d="M12 10C12 7 14.2 5 17.5 5C17.5 8.2 15.2 10.2 12 10Z" fill="#C79A45" fillOpacity="0.9" />
            <path d="M8 20h8" stroke="#B0822E" strokeWidth="1.6" strokeLinecap="round" strokeOpacity="0.5" />
          </svg>
        </div>
        {!collapsed && (
          <span className="ml-3 font-semibold text-sm tracking-wide text-cream truncate">
            Tu Clínica Digital
          </span>
        )}
      </div>

      {/* User profile */}
      {!collapsed && (
        <div className="px-5 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center shrink-0 text-xs font-bold text-gold">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="text-cream text-sm font-medium truncate">{data.profile.nombre}</p>
              <p className="text-sm text-cream/55 uppercase tracking-wider truncate">Prog: {data.profile.plan}</p>
            </div>
          </div>

          <div className="bg-surface/60 border border-[rgba(232,150,46,0.10)] rounded-xl p-3 relative group">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-cream/65 font-medium tracking-wide">{data.cinturon.emoji} {data.cinturon.nombre} · Día {data.diaPrograma} de 90</span>
              <span className="text-sm text-cream font-medium">{data.progress}%</span>
            </div>
            <div className="h-1 bg-cream/10 rounded-full overflow-hidden">
              <div className="h-full bg-gold rounded-full transition-all duration-1000" style={{ width: `${data.progress}%` }} />
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-full left-0 mt-2 w-full bg-surface border border-[rgba(232,150,46,0.12)] text-sm text-cream/70 p-2 rounded-lg shadow-xl pointer-events-none z-50">
              ADN del Negocio: {data.progress}% completado
            </div>
          </div>
        </div>
      )}

      {/* Collapsed avatar */}
      {collapsed && (
        <div className="flex justify-center mb-6">
          <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-xs font-bold text-gold">
            {initial}
          </div>
        </div>
      )}

      {/* Nav */}
      <div className="flex-1 w-full space-y-6 overflow-y-auto scrollbar-hide">
        {sections.map((section, sidx) => (
          <div key={sidx} className="w-full">
            {!collapsed && section.title && (
              <h3 className="px-6 text-sm font-bold text-cream/25 uppercase tracking-[0.1em] mb-2">
                {section.title}
              </h3>
            )}
            {collapsed && sidx > 0 && <div className="mx-3 border-t border-[rgba(232,150,46,0.1)] mb-2" />}
            <nav className="space-y-1.5">
              {section.items.filter((item) => planPermitePilar(planActual(), (item as { minPilar?: number }).minPilar ?? 0)).map((item) => {
                const isActive = currentPage === item.id;
                const modulosOverride = ((data.profile as { modulos_activos?: string[] })?.modulos_activos) ?? [];
                const moduloKey = item.id === 'creador' ? 'creativos' : item.id;
                const lockedPorCinturon = typeof (item as { minCinturon?: number }).minCinturon === 'number' && data.cinturon.orden < (item as { minCinturon?: number }).minCinturon!;
                const locked = lockedPorCinturon && !modulosOverride.includes(moduloKey);
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (locked) return;
                      if (item.action) item.action();
                      else setCurrentPage(item.id);
                      onMobileClose();
                    }}
                    title={locked ? 'Se desbloquea con el Cinturón Verde (tu oferta aprobada)' : (collapsed ? item.label : undefined)}
                    className={`w-full flex items-center transition-all relative group ${
                      collapsed ? 'justify-center px-0 py-4' : 'px-5 py-4 mx-3 rounded-2xl'
                    } ${locked ? 'opacity-40 cursor-not-allowed' : ''} ${isActive ? 'bg-gold/15' : 'bg-transparent hover:bg-gold/5'}`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] bg-gold rounded-r-full" />
                    )}
                    <div className="relative">
                      <item.icon className={`w-[22px] h-[22px] transition-colors ${
                        isActive ? 'text-gold' : 'text-cream/55 group-hover:text-cream/75'
                      }`} />
                      {item.badge && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-danger rounded-full shadow-[0_0_8px_rgba(232,85,85,0.8)] border border-ink" />
                      )}
                    </div>
                    {!collapsed && (
                      <span className={`ml-4 text-[17px] tracking-wide ${
                        isActive ? 'text-cream font-semibold' : 'text-cream/75 font-medium group-hover:text-cream/80'
                      }`}>
                        {item.label}
                      </span>
                    )}
                    {/* Tooltip on collapse */}
                    {collapsed && (
                      <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-surface border border-[rgba(232,150,46,0.12)] text-[15px] text-cream rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        {item.label}
                      </div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Toggle collapse button */}
      <button
        onClick={onToggleCollapse}
        className={`mt-6 flex items-center justify-center gap-2 text-cream/55 hover:text-cream transition-colors py-2 ${collapsed ? 'px-0' : 'px-6'}`}
        title={collapsed ? 'Expandir menú' : 'Contraer menú'}
      >
        {collapsed
          ? <ChevronRight className="w-4 h-4" />
          : <><ChevronLeft className="w-4 h-4" /><span className="text-sm">Contraer</span></>
        }
      </button>
    </aside>
  );
}
