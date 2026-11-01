import { planActual, planPermitePilar } from '../lib/planes';
import { DESTINOS } from '../lib/destinos';
import { useState, useEffect, useRef } from 'react';
import { UserCircle2, Search, Bell, X, MessageSquare, LayoutDashboard, Map, TrendingUp, BookOpen, Library, Menu, Megaphone, ChevronLeft, Sparkles, Hexagon, LifeBuoy } from 'lucide-react';
import { toast } from 'sonner';
import { obtenerNotificaciones, marcarLeida, marcarTodasLeidas, contarNoLeidas, type NotificacionDB } from '../lib/notifications';
import { comoSeVeElAviso } from '../lib/avisoVisual';
import { supabase, isSupabaseReady } from '../lib/supabase';
import { playNotificationSound } from '../lib/notificationSound';
import CreditsBadge from './credits/CreditsBadge';
import { CREDITS_ENABLED } from '../lib/featureFlags';
import { useConexion } from '../lib/conexion';
import { VOC } from '../lib/vocabulario';
import { sinLeerDelCliente } from '../lib/soporteDatos';

interface TopbarProps {
  currentPage?: string;
  onBack?: () => void;
  setCurrentPage: (page: string) => void;
  userId?: string;
  onMobileMenuToggle: () => void;
  /** Abre su cuenta: sus datos y el cerrar sesión. */
  onOpenSettings?: () => void;
}

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Hoy', roadmap: 'El Camino', coach: 'Tu Mentor', numero: 'Mi Número',
  mensajes: 'Acompañamiento', adn: 'Mi ADN', diario: 'Diario del Fundador',
  biblioteca: 'El Método', creador: 'Creador de Contenido',
  entrenadores: 'Entrenadores',
  campanas: 'Campañas', metrics: 'Métricas', manualNegocio: 'Manual del Negocio',
  // Faltaba, así que la barra quedaba sin título en esa pantalla: el cliente
  // veía la flecha de volver, el botón del Mentor, y nada en el medio.
  miclinica: 'Mi Clínica',
};

/**
 * El título en el teléfono.
 *
 * Al título le quedan 130 px en el teléfono más chico que la app aguanta
 * —360 px de ancho— y «Creador de Contenido» pide 176. Achicar la letra no
 * alcanza y además rompe el piso tipográfico. Así que acá manda el nombre
 * corto, y el largo sigue entero en el menú lateral, que es donde se elige a
 * dónde ir. En la barra el título no presenta la pantalla —el contenido ya se
 * ve— solo dice dónde está parado.
 *
 * Los que ya entran no se tocan: «El Camino» es «El Camino».
 *
 * Los tres nombres que no entran, medidos a 20 px en 360 px de ancho:
 * «Creador de Contenido» 176 · «Diario del Fundador» 157 · «Manual del
 * Negocio» 156. Y «Acompañamiento» pide 138, así que su forma corta también
 * se sostiene por ancho, no solo por lenguaje. El más largo de los que entran
 * es «Entrenadores», con 103: quedan 27 px de respiro.
 */
/*
 * LAS FORMAS CORTAS, Y POR QUÉ EXISTEN
 *
 * Un destino tiene UN nombre. Lo que cambia es cuánto lugar hay para
 * escribirlo: la barra del teléfono mide 56 píxeles de alto y comparte el
 * renglón con el botón del Mentor, así que «Creador de Contenido» no entra y
 * se escribe «Creador». Eso es una forma corta, no otro nombre, y tiene que
 * estar declarada acá para que se vea que es a propósito.
 *
 * `prueba-un-destino-un-nombre.ts` compara los tres lugares donde se escribe
 * cada destino —la barra de arriba, el buscador y la barra de abajo— y exige
 * que coincidan, salvo las formas cortas declaradas. Encontró cuatro
 * desacuerdos: «Soporte / Acompañamiento / Contacto» para la misma pantalla,
 * «Campañas y piezas» solo en el buscador, y «Contenido» con mayúscula en un
 * lado y minúscula en el otro.
 */
const TITULOS_CORTOS: Record<string, string> = {
  diario: 'Diario',
  creador: 'Creador',
  manualNegocio: 'Manual',
  /*
   * «Acompañamiento» es el nombre del destino y es la palabra del programa,
   * pero es la más larga de todas y en la barra de 56 píxeles se corta con el
   * botón del Mentor al lado. Arriba y abajo dicen «Contacto» —que es donde
   * se toca— y el encabezado de la pantalla dice «Acompañamiento», que es lo
   * que es. Las dos palabras conviven porque cada una contesta algo distinto.
   */
  mensajes: 'Contacto',
  /*
   * «Entrenadores» son doce letras. Medido a 320 px, que es el piso de los
   * Android chicos: el título recibe 90 y a 20 px pide 103, así que salía con
   * puntos suspensivos. La barra se reparte así: el grupo de la derecha —el
   * botón del Mentor y la campana— se lleva 156 de los 320, y quitarle la
   * etiqueta a MENTOR habría dado los píxeles repitiendo un error que esta
   * casa ya corrigió: Soporte vivía en un salvavidas sin etiqueta y nadie lo
   * encontraba.
   *
   * Bajar el título a 17 px también lo hacía entrar, y rompía el otro piso: el
   * serif de display no baja de 20 —su altura de x lo hace leer como una
   * mancha—. Así que lo que cede es la palabra, no el cuerpo ni el botón.
   *
   * «Entrenar» guarda la raíz y es lo que el cliente va a hacer ahí. Arriba y
   * abajo dicen «Entrenar»; el menú lateral, que tiene 256 px, dice
   * «Entrenadores». Igual que «Contacto» y «Acompañamiento».
   */
  entrenadores: 'Entrenar',
  // Las de la barra de abajo se declaran en BottomTabBar, con su
  // `nombreCompleto`: ahí el lugar es otro y las formas cortas son otras.
  // `agentes` salió de acá: era la ruta vieja de esta misma pantalla, no
  // estaba en ningún menú, y nombrarla en los títulos con «Entrenadores IA»
  // hacía parecer que eran dos lugares distintos. Los avisos que todavía
  // mandan a '/agentes' se redirigen abajo.
};

/**
 * El buscador respeta el plan: nadie llega por acá a lo que no compró.
 *
 * La lista vivía acá y solo la usaba este buscador, que se esconde en pantalla
 * chica. Diez pantallas quedaban sin ninguna puerta en el teléfono. Ahora vive
 * en `lib/destinos` y la usan las dos puertas: esta y el cajón del menú.
 */
const searchablePages = DESTINOS;


/**
 * A dónde lleva cada aviso.
 *
 * Si un destino NO está acá, el botón «Ver» no aparece y el clic no hace
 * nada: el aviso queda mudo. Pasó con 18 de los 26 destinos que la app
 * escribía —incluidos los once avisos automáticos que apuntan a Campañas—,
 * y no se veía porque nada rompía: simplemente no pasaba nada.
 *
 * REGLA: todo `accion_url` que se escriba en cualquier parte del repo tiene
 * que estar en este mapa. Lo verifica la lente 6.36 de auditoria.py.
 */
const URL_TO_PAGE: Record<string, string> = {
  '/dashboard': 'dashboard',
  '/hoja-de-ruta': 'roadmap',
  '/diario': 'diario',
  '/campanas': 'campanas',
  '/creador': 'creador',
  '/miclinica': 'campanas',   // MiClínica todavía es un enlace externo:
                              // el puente vive dentro de Campañas.
  '/metricas': 'metrics',
  '/numero': 'numero',
  '/adn': 'adn',
  '/coach': 'coach',
  // Cuatro avisos del cliente mandan a '/agentes', que era la ruta vieja de
  // la pantalla de Entrenadores. Al unificar las dos rutas se quedó sin
  // destino, y un aviso sin destino no dibuja el botón «Ver»: el clic no hace
  // nada. Son justo los cuatro que lo mandan a hablar con un entrenador.
  '/agentes': 'entrenadores',
  '/entrenadores': 'entrenadores',
  '/biblioteca': 'biblioteca',
  '/mensajes': 'mensajes',
  '/admin/clientes': 'admin-clientes',
  '/admin/mensajes': 'admin-mensajes',
  '/admin': 'admin-clientes',
};

/*
 * Los avisos de tarea arman la dirección con parámetros —
 * `/admin?tab=tareas&tareaId=…`— y una búsqueda por clave exacta nunca la
 * encuentra: el aviso llega, pero sin el botón «Ver», así que el clic no
 * hace nada. El panel del Admin ya lo resolvía con `includes`; de este lado
 * se buscaba la clave entera. Ahora la dirección se parte antes del `?`, que
 * es lo que hace cualquier navegador.
 */
function pantallaDe(accionUrl: string | null | undefined): string | undefined {
  if (!accionUrl) return undefined;
  const sinParametros = accionUrl.split('?')[0];
  return URL_TO_PAGE[accionUrl] ?? URL_TO_PAGE[sinParametros];
}

function tiempoRelativo(fechaISO: string): string {
  const ahora = Date.now();
  const fecha = new Date(fechaISO).getTime();
  const diffMs = ahora - fecha;
  const minutos = Math.floor(diffMs / 60_000);

  if (minutos < 1) return 'ahora';
  if (minutos < 60) return `hace ${minutos} min`;

  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;

  const dias = Math.floor(horas / 24);
  if (dias < 30) return `hace ${dias} d`;

  const meses = Math.floor(dias / 30);
  return `hace ${meses} mes${meses > 1 ? 'es' : ''}`;
}

export default function Topbar({ currentPage, onBack, setCurrentPage, userId, onMobileMenuToggle, onOpenSettings }: TopbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<NotificacionDB[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [shaking, setShaking] = useState(false);
  /**
   * Respuestas del equipo que el cliente todavía no abrió.
   *
   * Vive acá y no en App porque el botón vive acá: antes el contador era un
   * cero escrito a mano dentro de la pantalla de Soporte, así que el cliente
   * solo se enteraba de que le habían respondido si entraba por las dudas.
   */
  const [soporteSinLeer, setSoporteSinLeer] = useState(0);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const profile = (() => {
    try {
      const saved = localStorage.getItem('tcd_profile');
      return saved ? JSON.parse(saved) : { nombre: 'Profesional', especialidad: '' };
    } catch { return { nombre: 'Profesional', especialidad: '' }; }
  })();

  // Load notifications + real-time subscription
  useEffect(() => {
    let alive = true;
    async function load() {
      if (!userId) return;
      const notifs = await obtenerNotificaciones(userId, 20);
      if (!alive) return;
      setNotifications(notifs);
      const count = await contarNoLeidas(userId);
      if (!alive) return;
      setUnreadCount(count);
    }
    load();

    if (isSupabaseReady() && supabase && userId) {
      const channel = supabase.channel(`notif-realtime-${userId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notificaciones',
          filter: `usuario_id=eq.${userId}`,
        }, (payload) => {
          if (!alive) return;
          const n = payload.new as NotificacionDB;
          setNotifications(prev => [n, ...prev].slice(0, 20));
          setUnreadCount(prev => prev + 1);
          setShaking(true);
          window.setTimeout(() => { if (alive) setShaking(false); }, 900);
          playNotificationSound();
          const page = pantallaDe(n.accion_url);
          toast(n.titulo, {
            description: n.descripcion ?? undefined,
            duration: 6000,
            action: page
              ? { label: 'Ver', onClick: () => setCurrentPage(page) }
              : undefined,
          });
        })
        .subscribe();

      return () => {
        alive = false;
        if (supabase) supabase.removeChannel(channel);
      };
    }
    return () => { alive = false; };
  }, [userId, setCurrentPage]);

  // Las respuestas del equipo sin abrir, y el aviso en vivo cuando llega una.
  useEffect(() => {
    if (!userId) return;
    let vivo = true;
    void sinLeerDelCliente(userId).then((n) => { if (vivo) setSoporteSinLeer(n); });

    if (!isSupabaseReady() || !supabase) return () => { vivo = false; };
    const canal = supabase.channel(`soporte-sin-leer-${userId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'mensajes',
        filter: `receptor_id=eq.${userId}`,
      }, () => { if (vivo) setSoporteSinLeer((n) => n + 1); })
      .subscribe();

    return () => { vivo = false; if (supabase) supabase.removeChannel(canal); };
  }, [userId]);

  /*
   * El contador se apagaba con solo estar en la pantalla, y la pantalla abre
   * en el canal de comunidad: el cliente entraba, el globo desaparecía, y se
   * iba sin ver la respuesta. Al recargar volvía, porque en la base seguía
   * sin leer — o sea que el contador mentía justo cuando importaba.
   *
   * Ahora se vuelve a preguntar a la base. `marcarLeidos` corre cuando abre
   * la conversación de verdad, así que el globo se apaga cuando la leyó.
   */
  useEffect(() => {
    if (currentPage !== 'mensajes' || !userId) return;
    const t = setInterval(() => {
      void sinLeerDelCliente(userId).then(setSoporteSinLeer).catch(() => { /* queda el que había */ });
    }, 4000);
    return () => clearInterval(t);
  }, [currentPage, userId]);


  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(prev => !prev);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
        setShowNotifications(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (showSearch) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery('');
    }
  }, [showSearch]);

  // La Biblioteca se esconde por plan, salvo que el equipo se la haya abierto
  // a este cliente. Sin esta excepción el permiso se podía dar y el cliente no
  // tenía ninguna forma de llegar: el destino quedaba escondido igual.
  const bibliotecaAbierta = Boolean((profile as { biblioteca_abierta?: boolean }).biblioteca_abierta);
  const filteredPages = searchablePages.filter((p) =>
    (p.id === 'biblioteca' && bibliotecaAbierta)
    || planPermitePilar(planActual(), (p as { minPilar?: number }).minPilar ?? 0)).filter(p =>
    p.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const markAllRead = async () => {
    if (!userId) return;
    await marcarTodasLeidas(userId);
    setNotifications(prev => prev.map(n => ({ ...n, leida: true })));
    setUnreadCount(0);
  };

  const handleNotificationClick = async (notif: NotificacionDB) => {
    if (!notif.leida) {
      await marcarLeida(notif.id);
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, leida: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    if (notif.accion_url) {
      const page = pantallaDe(notif.accion_url);
      if (page) {
        setCurrentPage(page);
      }
    }

    setShowNotifications(false);
  };

  /** Sin esto, quedarse sin señal se veía como errores sueltos sin explicación:
   *  el sanador que carga sus números desde el teléfono es justo el caso. */
  const conexion = useConexion();

  return (
    <>
      {conexion === 'sin_internet' && (
        <div className="bg-danger/90 text-white text-center text-sm py-1.5 px-3">
          Sin internet. Lo que escribas queda guardado acá y sube solo cuando vuelva la señal.
        </div>
      )}
      <header className="h-14 md:h-20 px-4 md:px-8 flex items-center justify-between z-20 relative">
        {/* Back (sub-páginas) o menú (home) + título de pantalla — mobile */}
        {/*
          `flex-1` y no solo `min-w-0`: con `justify-between` el grupo del
          título tomaba su ancho natural y el de la derecha lleva `shrink-0`,
          así que lo que había a la derecha se quedaba con todo y al título le
          sobraban CERO píxeles. Medido en la barra de verdad: el grupo de la
          derecha ocupaba 355 de los 358 útiles, y el h1 tenía clientWidth 0 —
          el nombre de la pantalla no se veía en ningún destino del teléfono.

          Con `flex-1` el título reclama el hueco y la derecha se queda con lo
          suyo; el que se achica cuando falta lugar es el título, que para eso
          tiene `una-linea`. El lente `recortado` del medidor mide que el
          nombre entre: si algo vuelve a esta barra y lo empuja, falla ahí.
        */}
        <div className="md:hidden flex flex-1 items-center gap-1.5 min-w-0">
          {currentPage && currentPage !== 'dashboard' && onBack ? (
            <button onClick={onBack} className="btn-icon -ml-2 shrink-0" aria-label="Volver">
              <ChevronLeft className="w-6 h-6" />
            </button>
          ) : (
            <button onClick={onMobileMenuToggle} className="btn-icon -ml-2 shrink-0" aria-label="Abrir menú">
              <Menu className="w-5 h-5" />
            </button>
          )}
          {/* `una-linea` y no `truncate` a secas: la barra mide 56 px y el
              título que pasa a dos renglones se monta sobre los botones de la
              derecha. «El Camino» salía partido en tres. */}
          <h1 className="text-xl leading-tight text-cream una-linea not-italic" style={{ fontFamily: 'var(--font-display)' }}>
            {(currentPage && (TITULOS_CORTOS[currentPage] ?? PAGE_TITLES[currentPage])) || ''}
          </h1>
        </div>

        <div
          onClick={() => setShowSearch(true)}
          className="hidden md:flex items-center w-96 card-panel px-4 py-2 cursor-pointer hover:bg-surface transition-colors"
        >
          <Search className="w-4 h-4 text-cream/55" />
          <span className="bg-transparent text-sm text-cream/55 ml-3">Buscar secciones, tareas...</span>
          <div className="flex items-center justify-center w-8 h-5 rounded bg-cream/10 text-sm text-cream/65 font-mono ml-auto">
            ⌘K
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          {/* El Mentor está en todas las pantallas: es un botón, no una pestaña. */}
          {currentPage !== 'coach' && setCurrentPage && (
            <button
              type="button"
              onClick={() => setCurrentPage('coach')}
              aria-label="Hablar con tu Mentor"
              /*
                De relleno de oro macizo a línea de 1px.
                Era el elemento más saturado de la app, en las 23 pantallas, y
                en un quinto oro escrito a mano que ninguna regla del tema
                alcanzaba. Siendo lo único relleno de oro en reposo, el oro de
                la marca pasó a significar «chat».
                Y la palabra estaba oculta en el teléfono: quedaba una pastilla
                dorada con un ícono, en el lugar de más jerarquía.

                Queda la palabra sola, en versalitas: con la palabra escrita el
                ícono no agrega nada, y sacarlo devuelve los 28 píxeles que le
                estaban comiendo el nombre de la pantalla a su izquierda.
                El tono es --oro-t y no --oro-d porque este botón se apoya en el
                panel de la barra, no en el papel: ahí el oro medio daba 4,0:1.
              */
              className="min-h-[44px] px-3 rounded-full text-[15px] font-semibold uppercase tracking-[0.06em] flex items-center shrink-0"
              style={{
                background: 'transparent',
                color: 'var(--oro-t, #74551C)',
                border: '1px solid var(--oro, #B0822E)',
              }}
            >
              Mentor
            </button>
          )}
          {/* El salvavidas se queda SOLO en pantalla grande.
              En el teléfono, el contador de respuestas sin abrir se mudó
              encima de la pestaña Contacto, que es donde se busca y donde se
              toca. Acá ocupaba 56 px de los 390 de la barra, y entre los
              cuatro botones dejaban 91 px para el título: «El Camino» salía
              cortado, y «Entrenadores» no entraba ni por asomo. */}
          {currentPage !== 'mensajes' && setCurrentPage && (
            <button
              type="button"
              onClick={() => setCurrentPage('mensajes')}
              aria-label={soporteSinLeer > 0
                ? `Soporte (${soporteSinLeer} sin leer)`
                : 'Soporte: escríbele al equipo'}
              className={`hidden md:flex w-12 h-12 rounded-full card-panel items-center justify-center transition-colors active:scale-95 relative ${
                soporteSinLeer > 0
                  ? 'text-gold ring-1 ring-gold/30 hover:text-goldhi'
                  : 'text-cream/75 hover:text-cream'
              }`}
            >
              <LifeBuoy className="w-6 h-6" />
              {soporteSinLeer > 0 && (
                <span className="badge-pulse absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1.5 bg-gold text-black text-sm font-extrabold rounded-full flex items-center justify-center border-2 border-ink">
                  {soporteSinLeer > 9 ? '9+' : soporteSinLeer}
                </span>
              )}
            </button>
          )}
          {/* ── TU CUENTA ──
                 Solo en pantalla grande. En el teléfono se llega por el menú
                 lateral, que se abre con el botón de la izquierda y tiene la
                 misma entrada.
                 Acá ocupaba 48 px de los 390 de la barra, y el título volvía a
                 salir cortado: «El Camino», «Entrenadores», «El Método» y
                 «Campañas». Es el mismo problema que ya se arregló una vez
                 sacando un botón de esta barra. */}
          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              aria-label="Tu cuenta"
              className="hidden md:flex w-12 h-12 rounded-full card-panel items-center justify-center
                text-cream/75 hover:text-cream transition-colors active:scale-95"
            >
              <UserCircle2 className="w-6 h-6" />
            </button>
          )}

          {/* Credits balance · click → modal de compra · oculto via flag mientras el sistema esta apagado */}
          {CREDITS_ENABLED && <CreditsBadge userId={userId} variant="expanded" />}

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`w-12 h-12 rounded-full card-panel flex items-center justify-center transition-all duration-300 active:scale-95 relative ${
                showNotifications
                  ? 'text-cream bg-surface ring-1 ring-gold/40'
                  : unreadCount > 0
                    ? 'text-gold ring-1 ring-gold/30 hover:text-goldhi'
                    : 'text-cream/75 hover:text-cream'
              }`}
              aria-label={unreadCount > 0 ? `Notificaciones (${unreadCount} sin leer)` : 'Notificaciones'}
            >
              <Bell
                className={`w-6 h-6 transition-transform duration-300 ${showNotifications ? 'scale-110' : 'hover:scale-110'} ${shaking ? 'bell-shake' : ''}`}
                fill={unreadCount > 0 ? 'currentColor' : 'none'}
              />
              {unreadCount > 0 && (
                <span className="badge-pulse absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1.5 bg-gold text-black text-sm font-extrabold rounded-full flex items-center justify-center border-2 border-ink">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-[calc(100vw-2rem)] md:w-80 card-panel border border-[var(--line, rgba(142,104,36,0.18))] rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200 z-50">
                <div className="p-4 border-b border-[var(--line, rgba(142,104,36,0.18))] flex items-center justify-between bg-surface/50">
                  <h3 className="font-medium text-cream">Notificaciones</h3>
                  {unreadCount > 0 && (
                    <span onClick={markAllRead} className="text-xs text-gold cursor-pointer hover:text-goldhi">Marcar todas como leidas</span>
                  )}
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length === 0 && (
                    <div className="py-12 text-center">
                      <Bell className="w-8 h-8 text-cream/20 mx-auto mb-3" />
                      <p className="text-sm text-cream/55">Sin notificaciones</p>
                    </div>
                  )}
                  {notifications.map(notif => {
                    const { Icono: IconComponent, color: colors } = comoSeVeElAviso(notif.tipo);

                    return (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-4 border-b border-[var(--line, rgba(142,104,36,0.18))] hover:bg-surface/50 transition-colors cursor-pointer flex gap-3 ${notif.leida ? 'opacity-60' : ''}`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${colors.bg}`}>
                          <IconComponent className={`w-4 h-4 ${colors.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2">
                            <p className="text-sm font-medium text-cream/90 mb-0.5">{VOC(notif.titulo)}</p>
                            {!notif.leida && (
                              <span className="w-2 h-2 rounded-full bg-danger shrink-0 mt-1.5" />
                            )}
                          </div>
                          {notif.descripcion && (
                            <p className="text-xs text-cream/65 line-clamp-2">{VOC(notif.descripcion)}</p>
                          )}
                          <p className="text-sm text-cream/45 mt-2">{tiempoRelativo(notif.created_at)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="p-3 text-center border-t border-[var(--line, rgba(142,104,36,0.18))] bg-surface/50">
                  <button onClick={() => setShowNotifications(false)} className="text-xs text-cream/65 hover:text-cream transition-colors">
                    Cerrar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/*
            La inicial en su círculo es DECORACIÓN: no es un botón, no tiene
            acción, y al tocarla no pasa nada. Le mostraba al cliente la
            primera letra de su propio nombre y se llevaba 53 de los 358
            píxeles útiles de la barra del teléfono — más que los dos botones
            que ya salieron de acá por comerle el nombre a la pantalla, y esos
            al menos hacían algo.

            Queda en pantalla grande, donde el lugar sobra y acompaña a «Tu
            cuenta». En el teléfono la cuenta se abre por el menú lateral, que
            es donde está su nombre entero y el cerrar sesión.
          */}
          <div className="hidden md:flex items-center gap-2 pl-4 border-l border-[var(--line, rgba(142,104,36,0.18))]">
            {(() => {
              const avatarUrl = localStorage.getItem('tcd_avatar');
              const initial = (profile.nombre || 'P').charAt(0).toUpperCase();
              return avatarUrl ? (
                <img loading="lazy" src={avatarUrl} alt="Profile" className="w-9 h-9 rounded-full border border-[var(--line2, rgba(142,104,36,0.30))] object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-sm font-bold text-gold">
                  {initial}
                </div>
              );
            })()}
          </div>
        </div>
      </header>

      {/* Search Modal ⌘K */}
      {showSearch && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm animate-in fade-in duration-150" onClick={() => setShowSearch(false)}>
          <div className="w-full max-w-lg bg-surface border border-[var(--line, rgba(142,104,36,0.18))] rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 p-4 border-b border-[var(--line, rgba(142,104,36,0.18))]">
              <Search className="w-5 h-5 text-cream/55" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="¿A dónde quieres ir?"
                className="bg-transparent border-none outline-none text-cream text-sm w-full placeholder-cream/40"
              />
              <button onClick={() => setShowSearch(false)} className="text-cream/55 hover:text-cream">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[300px] overflow-y-auto p-2">
              {filteredPages.map(page => (
                <button
                  key={page.id}
                  onClick={() => {
                    setCurrentPage(page.id);
                    setShowSearch(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-gold/10 transition-colors"
                >
                  <page.icon className="w-5 h-5 text-cream/55" />
                  <div>
                    <p className="text-sm font-medium text-cream/90">{page.label}</p>
                    <p className="text-xs text-cream/55">{page.desc}</p>
                  </div>
                </button>
              ))}
              {filteredPages.length === 0 && (
                <p className="text-sm text-cream/55 text-center py-8">No se encontraron resultados</p>
              )}
            </div>
            <div className="p-3 border-t border-[var(--line, rgba(142,104,36,0.18))] flex items-center gap-4 text-sm text-cream/55">
              <span>↑↓ Navegar</span>
              <span>↵ Abrir</span>
              <span>esc Cerrar</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
