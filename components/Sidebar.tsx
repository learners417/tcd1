import { planLimitado } from '../lib/adnPiezas';
import { otrosDestinos } from '../lib/destinos';
import { planActual, planPermitePilar } from '../lib/planes';
import React, { useState, useEffect } from 'react';
import { UserCircle2, ChevronLeft, ChevronRight, LifeBuoy, Map as RoadmapIcon, Sparkles, Sun, Megaphone } from 'lucide-react';
import { SEED_ROADMAP_V2 } from '../lib/roadmapSeed';
import { cinturonDesdeProgreso, CINTURONES, type Cinturon } from '../lib/cinturones';
import { diaDelPrograma, semanaDelPrograma, dondeVa } from '../lib/diaPrograma';
import { diaDeLaProximaJornada, jornadasCerradas } from '../lib/roadmapSeed';
import { destinoQueCambia } from '../lib/destinoDelMomento';

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

  const semana = semanaDelPrograma(profile.fecha_inicio, 13);
  const diaPrograma = diaDelPrograma(profile.fecha_inicio) ?? 1;
  // El cuarto destino se decide acá, junto al resto de lo que el menú lee una
  // sola vez: calcularlo en el render lo recalcularía en cada pintada.
  const cuarto = destinoQueCambia(
    dondeVa(profile.fecha_inicio, diaDeLaProximaJornada(jornadasCerradas())),
  );

  return { profile, progress, hasPending, semana, diaPrograma, cinturon, cuarto };
}

export default function Sidebar({ currentPage, setCurrentPage, onOpenSettings, messageBadge = 0, collapsed, onToggleCollapse, mobileOpen, onMobileClose }: SidebarProps) {
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
        { id: 'roadmap', icon: RoadmapIcon, label: 'Camino', badge: data.hasPending } as MenuItem,
        { id: 'entrenadores', icon: Sparkles, label: 'Entrenadores' } as MenuItem,
        // El cuarto cambia con el avance: hasta que le toque montar es Mi ADN.
        // Los dos menús preguntan lo mismo, así que siguen diciendo lo mismo.
        { id: data.cuarto.id, icon: Megaphone, label: data.cuarto.etiqueta } as MenuItem,
        { id: 'mensajes', icon: LifeBuoy, label: 'Acompañamiento' } as MenuItem,
        // SOPORTE ENTRÓ Y CLÍNICA SALIÓ.
        //
        // Siguen siendo cinco y siguen siendo los mismos que la barra de
        // abajo. Lo que cambió es cuál: Soporte es la única forma de llegar al
        // equipo desde que Discord salió, y vivía en un icono sin etiqueta
        // arriba a la derecha que nadie encontraba. Un canal de soporte que no
        // se encuentra manda al cliente a buscar al equipo afuera de la app.
        //
        // Clínica no era un destino de esta app: era un window.open a otra,
        // bloqueado hasta el pilar 6. Ahora es una pantalla que explica qué
        // es, y el botón para abrirla va al final.
      ]
    },
    /*
     * TODO LO DEMÁS.
     *
     * Los cinco de arriba son los de siempre y no se tocan. Lo que faltaba era
     * una puerta para las otras diez pantallas: vivían en una lista que solo
     * alimentaba al buscador, y el buscador se esconde en pantalla chica. En
     * el teléfono —que es desde donde entra el cliente— El Método, el Diario,
     * Métricas, Mi Clínica, el Creador y Mi Número no tenían forma de
     * abrirse. La biblioteca, donde vive el libro que la página promete,
     * tenía cero entradas.
     *
     * El filtro de abajo ya respeta el plan y el cinturón de cada uno, así
     * que acá no aparece nada que al tocarlo lleve a otro lado.
     */
    {
      title: 'Todo lo demás',
      items: otrosDestinos().map((d) => ({
        id: d.id,
        icon: d.icon,
        label: d.label,
        minPilar: d.minPilar,
        minCinturon: d.minCinturon,
      })) as MenuItem[],
    },
  ];

  const initial = data.profile.nombre.charAt(0).toUpperCase();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:inset-auto md:translate-x-0 md:z-20 ${collapsed ? 'md:w-16' : 'md:w-64'} h-full flex flex-col py-6 transition-all duration-300 shrink-0 overflow-x-hidden border-r border-[var(--line, rgba(142,104,36,0.18))] bg-ink/90 backdrop-blur-xl`}
    >
      {/* Logo */}
      <div className={`flex items-center mb-8 ${collapsed ? 'justify-center px-0' : 'px-6'}`}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2" style={{ borderColor: 'var(--oro, #B0822E)', background: 'radial-gradient(circle at 30% 25%, rgba(244,182,92,0.22), var(--line, rgba(142,104,36,0.18)) 70%)' }}>
          {/* El brote: la semilla del método que crece — de Blanco a Negro */}
          <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none">
            <path d="M12 20V11" stroke="#B0822E" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M12 12C12 8.5 9.5 6.5 6 6.5C6 10 8.5 12 12 12Z" fill="#B0822E" fillOpacity="0.85" />
            <path d="M12 10C12 7 14.2 5 17.5 5C17.5 8.2 15.2 10.2 12 10Z" fill="var(--oro, #B0822E)" fillOpacity="0.9" />
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

          {/* En el teléfono esta tarjeta se va: su dato —cinturón y día— ya
              está en Hoy, y acá se comía 110 px del alto del menú, que es lo
              único que esta pantalla tiene que hacer bien. */}
          <div className="hidden md:block bg-surface/60 border border-[var(--line, rgba(142,104,36,0.18))] rounded-xl p-3 relative group">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-cream/65 font-medium tracking-wide">Cinturón {data.cinturon.nombre} · Día {data.diaPrograma} de 90</span>
              <span className="text-sm text-cream font-medium">{data.progress}%</span>
            </div>
            <div className="h-1 bg-cream/10 rounded-full overflow-hidden">
              <div className="h-full bg-gold rounded-full transition-all duration-1000" style={{ width: `${data.progress}%` }} />
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-full left-0 mt-2 w-full bg-surface border border-[var(--line, rgba(142,104,36,0.18))] text-sm text-cream/70 p-2 rounded-lg shadow-xl pointer-events-none z-50">
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

      {/* Nav.
          La barra de desplazamiento se oculta en pantalla grande, donde el
          menú entra entero. En el teléfono se deja a la vista: con doce
          destinos hay más de lo que cabe, y sin barra no hay ninguna señal de
          que exista «todo lo demás» más abajo. */}
      <div className="flex-1 w-full space-y-6 overflow-y-auto md:scrollbar-hide">
        {sections.map((section, sidx) => (
          <div key={sidx} className="w-full">
            {!collapsed && section.title && (
              <h3 className="px-6 text-sm font-bold text-cream/25 uppercase tracking-[0.1em] mb-2">
                {section.title}
              </h3>
            )}
            {collapsed && sidx > 0 && <div className="mx-3 border-t border-[var(--line, rgba(142,104,36,0.18))] mb-2" />}
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
                    } ${locked ? 'opacity-40 cursor-not-allowed' : ''} ${isActive ? 'elegido' : 'bg-transparent hover:bg-gold/5'}`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] bg-gold rounded-r-full" />
                    )}
                    <div className="relative">
                      <item.icon className={`w-[22px] h-[22px] transition-colors ${
                        isActive ? 'text-gold' : 'text-cream/55 group-hover:text-cream/75'
                      }`} />
                      {item.badge && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-danger rounded-full border border-ink" />
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
                      <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-surface border border-[var(--line, rgba(142,104,36,0.18))] text-[15px] text-cream rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
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

      {/* ── TU CUENTA ──
             Los ajustes se abrían SOLO desde acá, y este archivo recibía la
             función y no la usaba. O sea que el modal existía completo —con
             sus pestañas y su botón de cerrar sesión— y nada lo abría: el
             cliente no tenía por dónde salir de su cuenta. */}
      <button
        onClick={onOpenSettings}
        className={`mt-6 flex items-center gap-3 text-cream/75 hover:text-cream transition-colors min-h-[44px] ${collapsed ? 'justify-center px-0' : 'px-6'}`}
        title="Tu cuenta"
      >
        <UserCircle2 className="w-5 h-5 shrink-0" />
        {!collapsed && <span className="text-[17px]">Tu cuenta</span>}
      </button>

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
