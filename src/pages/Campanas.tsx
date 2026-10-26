/**
 * Campanas.tsx — Orquestador principal del modulo de campanas
 * Sub-nav horizontal + router de vistas
 */
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import CampanasSubNav from '../components/campanas/CampanasSubNav';
import AnunciosQueAgendan from '../components/campanas/AnunciosQueAgendan';
import ConstructorAnuncios from '../components/campanas/ConstructorAnuncios';
import CampanasHome from '../components/campanas/CampanasHome';
import CopiesView from '../components/campanas/CopiesView';
import DiagnosticoView from '../components/campanas/DiagnosticoView';
import AsesorDeMontaje from '../components/campanas/AsesorDeMontaje';
import MontajeCupos from '../components/campanas/MontajeCupos';
import HistorialView from '../components/campanas/HistorialView';
import GanadoresView from '../components/campanas/GanadoresView';
import CreativoStudio from '../components/campanas/CreativoStudio';
import CreativoDetalle from '../components/campanas/CreativoDetalle';
import { fetchCampanas, fetchCreativos } from '../lib/campanasStorage';
import type { CampanasView, Campana, Creativo } from '../lib/campanasTypes';
import LaActivacion from '../components/campanas/LaActivacion';
import { montajeDe } from '../lib/montajeDatos';
import { numerosDe } from '../lib/numerosDatos';
import { diasEncendida as diasEncendidaDeLaCuenta, type Montaje } from '../lib/montajeCampana';
import { dondeVa } from '../lib/diaPrograma';
import { diaDeLaProximaJornada, jornadasCerradas } from '../lib/roadmapSeed';
import type { ProfileV2 } from '../lib/supabase';

interface CampanasProps {
  userId?: string;
  perfil?: Partial<ProfileV2>;
  /** Para devolverlo a su sesión cuando todavía no le toca montar. */
  onIrAlCamino?: () => void;
}

export default function Campanas({ userId, perfil, onIrAlCamino }: CampanasProps) {
  /**
   * Se aterriza en la ACTIVACIÓN, no en el Constructor de anuncios.
   *
   * Al terminar el Camino, «andá a Campañas» dejaba al cliente en una
   * pantalla para escribir anuncios, que es el paso 1 de cuatro — y sin nada
   * que le dijera que había un paso 0, ni qué venía después, ni qué no tocar.
   * La activación contesta las tres cosas y desde ahí se va a lo que toque.
   */
  /**
   * DÓNDE VA DE VERDAD.
   *
   * El día del calendario queda para decir el ritmo. Lo que abre y lo que
   * cierra sale del trabajo cerrado: quien está en la sesión del día 15 ve el
   * día 15, aunque hayan pasado treinta y uno desde el alta.
   */
  const donde = useMemo(
    () => dondeVa(perfil?.fecha_inicio, diaDeLaProximaJornada(jornadasCerradas())),
    [perfil?.fecha_inicio],
  );

  const [view, setView] = useState<CampanasView>('activacion');
  const [previousView, setPreviousView] = useState<CampanasView>('home');
  const [campanas, setCampanas] = useState<Campana[]>([]);
  const [creativos, setCreativos] = useState<Creativo[]>([]);
  const [selectedCampana, setSelectedCampana] = useState<Campana | null>(null);
  const [selectedCreativo, setSelectedCreativo] = useState<Creativo | null>(null);
  const [loading, setLoading] = useState(true);
  const topRef = useRef<HTMLDivElement>(null);

  /**
   * Lo que la pantalla de activación necesita saber: sus candados, si tiene
   * los tres anuncios y hace cuántos días encendió.
   *
   * Vive acá y no adentro de la pantalla porque el montaje y el encendido ya
   * los leen otras vistas de Campañas: dos lugares pidiendo lo mismo es cómo
   * terminan mostrando cosas distintas.
   */
  const [montaje, setMontaje] = useState<Montaje | null>(null);
  const [diasEncendida, setDiasEncendida] = useState<number | null>(null);
  /** Las ventas que cargó. null mientras no se consultaron. */
  const [ventas, setVentas] = useState<number | null>(null);
  useEffect(() => {
    if (!userId) return;
    let vivo = true;
    void montajeDe(userId)
      .then((m) => { if (vivo) setMontaje(m); })
      .catch(() => { /* la pantalla funciona igual: muestra el primer paso */ });
    // Las ventas salen de los números que él mismo carga. Si la consulta
    // falla queda en null, y la puerta de pivotear no se dispara: decirle que
    // su oferta está mal por una consulta que no se hizo sería peor que no
    // decir nada.
    void numerosDe(userId)
      .then((semanas) => {
        if (!vivo) return;
        setVentas(semanas.reduce((t, s) => t + (s.ventas_cerradas ?? 0), 0));
      })
      .catch(() => { /* queda en null */ });
    // El cálculo vive en montajeCampana: la pantalla de Hoy lo necesita igual,
    // y dos copias terminan contando distinto.
    setDiasEncendida(diasEncendidaDeLaCuenta());
    return () => { vivo = false; };
  }, [userId]);

  const loadData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      const [camp, crea] = await Promise.all([
        fetchCampanas(userId),
        fetchCreativos(userId),
      ]);
      setCampanas(camp);
      setCreativos(crea);
    } catch {
      // Fallback handled inside fetch functions
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Scroll to top whenever view changes
  useEffect(() => {
    const el = topRef.current;
    if (!el) return;
    let parent = el.parentElement;
    while (parent) {
      const { overflowY } = getComputedStyle(parent);
      if (overflowY === 'auto' || overflowY === 'scroll') {
        parent.scrollTop = 0;
        break;
      }
      parent = parent.parentElement;
    }
  }, [view]);

  const navigateTo = (target: CampanasView) => {
    setPreviousView(view);
    setView(target);
  };

  const handleSelectCampana = (campana: Campana) => {
    setSelectedCampana(campana);
    navigateTo('studio');
  };

  const handleSelectCreativo = (creativo: Creativo) => {
    setSelectedCreativo(creativo);
    navigateTo('detail');
  };

  // `handleCampanaCreated` vivía acá: lo llamaba el chat de seis fases al
  // terminar, para guardar una campaña armada con la estrategia que el propio
  // cliente eligió en la conversación. Ese chat se fue y la estrategia ya no se
  // elige, así que no hay nada que guardar: el montaje se verifica en la
  // Activación, contra los candados.

  const handleCreativoSaved = (creativo: Creativo) => {
    setCreativos((prev) => [creativo, ...prev]);
  };

  const handleBack = () => {
    setSelectedCampana(null);
    setSelectedCreativo(null);
    setView(previousView === 'studio' || previousView === 'detail' ? 'home' : previousView);
    loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="fade-rise">
      {/* Invisible anchor for scroll-to-top */}
      <div ref={topRef} />

      {/* El header ceremonial (Lote 5 · la piel) */}
      {/* «Anuncios que Agendan» reemplaza al Constructor. El Constructor hacía
          una sola cosa —escribir— y el cliente llegaba sin saber qué separa un
          anuncio que trae agendas de uno que trae curiosos: lo que salía era
          correcto y olvidable, y la culpa parecía del generador. Acá primero
          entiende las reglas con el ejemplo al lado, después elige el ángulo, y
          recién entonces escribe. */}
      {/* ESCRIBIR va antes que montar. El Constructor sigue siendo el que
          aprueba y arma los campos de Meta; acá se decide QUÉ decir, que es lo
          que antes nadie enseñaba y por eso lo que salía era olvidable. */}
      {view === 'escribir' && <AnunciosQueAgendan clienteId={userId} perfil={perfil} />}
      {view === 'anuncios' && <ConstructorAnuncios clienteId={userId} />}
        {view === 'home' && (
        <div className="mb-6">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-gold">Tu máquina de pacientes</p>
          {/* «Campañas & Creativos»: el «&» no es castellano y «Creativos» es la
            palabra con que la publicidad llama a sus piezas. El destino se
            llama «Campañas» en la barra, en el buscador y en el menú. */}
          <h1 className="text-2xl sm:text-3xl font-light text-cream mt-1.5" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>Campañas</h1>
          <p className="text-sm text-cream/65 mt-1">Tus anuncios, con tu marca, listos para encender. La primera campaña casi nunca es la ganadora — se mide, se ajusta y se vuelve a encender.</p>
        </div>
      )}

      {/* Sub-nav */}
      <CampanasSubNav currentView={view} onNavigate={navigateTo} />

      {/* Back button for drill-down views */}
      {(view === 'studio' || view === 'detail') && (
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-sm text-cream/65 hover:text-cream transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
      )}

      {/* Views */}
      {view === 'home' && (
        <CampanasHome
          campanas={campanas}
          creativos={creativos}
          perfil={perfil}
          onNavigate={navigateTo}
          onSelectCampana={handleSelectCampana}
        />
      )}

      {view === 'nueva' && (
        <AsesorDeMontaje onVolver={() => navigateTo('home')} clienteId={userId} />
      )}

      {view === 'copies' && (
        <CopiesView perfil={perfil ?? {}} />
      )}

      {view === 'diagnostico' && (
        <DiagnosticoView perfil={perfil ?? {}} />
      )}

      {view === 'montaje' && <MontajeCupos clienteId={userId} onIrAnuncios={() => setView('anuncios')} />}

      {/* LA ACTIVACIÓN: la primera pantalla al llegar del Camino.
          Dice qué toca hoy y, sobre todo, qué NO tocar todavía. */}
      {view === 'activacion' && (
        <LaActivacion
          montaje={montaje}
          anunciosListos={creativos.length >= 3}
          diasEncendida={diasEncendida}
          ventas={ventas}
          onIrAlMontaje={() => setView('montaje')}
          /* El día decide si le toca montar o si todavía está escribiendo lo
             que su campaña va a necesitar. Y es el día DEL TRABAJO, no el del
             calendario: quien se atrasó dos semanas leía «enciende tus
             campañas» sin tener la página hecha ni los anuncios escritos. */
          donde={donde}
          onIrAlCamino={() => { window.location.hash = ''; onIrAlCamino?.(); }}
        />
      )}

      {view === 'historial' && (
        <HistorialView
          campanas={campanas}
          onSelectCampana={handleSelectCampana}
          onRefresh={loadData}
        />
      )}

      {view === 'ganadores' && (
        <GanadoresView
          creativos={creativos}
          onSelectCreativo={handleSelectCreativo}
        />
      )}

      {view === 'studio' && selectedCampana && (
        <CreativoStudio
          campana={selectedCampana}
          userId={userId}
          perfil={perfil}
          onBack={handleBack}
          onSaved={handleCreativoSaved}
        />
      )}

      {view === 'detail' && selectedCreativo && (
        <CreativoDetalle
          creativo={selectedCreativo}
          userId={userId}
          onBack={handleBack}
          onDeleted={handleBack}
        />
      )}
    </div>
  );
}
