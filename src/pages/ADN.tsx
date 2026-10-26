/**
 * TU ADN — la página (ZIP B).
 * Cada pieza dice EXACTO en qué sesión se sella, y esa sesión es la única
 * forma de cambiarla. Lo bloqueado se ve con su nombre y su resultado:
 * esa vista es la puerta al camino completo.
 */
import { useState } from 'react';
import { planActual, planPermitePilar, planParaPilar, NOMBRE_PLAN, PRECIO_FUNDADOR } from '../lib/planes';
import { Lock, ChevronRight, Check, Circle, FileText } from 'lucide-react';
import { PIEZAS_ADN, estadoPieza, resumenADN, planLimitado, contenidoDePieza, esEscribibleAqui, guardarOrigen, type PiezaADN } from '../lib/adnPiezas';
import type { ProfileV2 } from '../lib/supabase';
import { VOC } from '../lib/vocabulario';
import ManualNegocio from './ManualNegocio';

interface ADNProps {
  perfil?: Partial<ProfileV2>;
  userId?: string;
  setCurrentPage?: (p: string) => void;
  onProfileFieldUpdate?: (fields: Record<string, unknown>) => void;
}

function Pieza({ p, onIr }: { p: PiezaADN; onIr?: () => void }) {
  const { sellada, fecha, bloqueada } = estadoPieza(p);
  const [abierta, setAbierta] = useState(false);
  const [texto, setTexto] = useState(() => contenidoDePieza(p));
  const [editando, setEditando] = useState(false);
  const [borrador, setBorrador] = useState('');
  const puedeEscribir = esEscribibleAqui(p) && !bloqueada;

  const guardar = () => {
    if (guardarOrigen(p, borrador)) setTexto(borrador.trim());
    setEditando(false);
  };

  return (
    <div className={`rounded-2xl border p-4 ${
      sellada ? 'border-gold/40 bg-[var(--card,#FFFDF7)]'
      : bloqueada ? 'border-[var(--line,#EBE1CF)]'
      : 'border-[var(--line2,#DFD3BC)]'}`}>
      <button
        type="button"
        onClick={() => setAbierta((v) => !v)}
        aria-expanded={abierta}
        className="w-full min-h-[52px] flex items-start gap-3 text-left"
      >
        <span className="mt-0.5 shrink-0">
          {sellada ? <Check className="w-5 h-5" style={{ color: 'var(--tilde, #4A7C59)' }} />
            : bloqueada ? <Lock className="w-5 h-5 text-cream/45" />
            : <Circle className="w-5 h-5 text-cream/45" />}
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-[17px] font-semibold text-cream">{VOC(p.titulo)}</span>
          <span className="block text-[15px] text-cream/70 leading-snug">{VOC(p.que)}</span>
        </span>
        <ChevronRight className={`w-5 h-5 shrink-0 mt-1 text-cream/55 transition-transform ${abierta ? 'rotate-90' : ''}`} />
      </button>

      {abierta && (
        <div className="mt-3 space-y-3">
          {texto && !editando && (
            <p className="text-[17px] leading-relaxed text-cream whitespace-pre-line">{texto}</p>
          )}
          {editando && (
            <div className="space-y-2">
              <textarea
                value={borrador}
                onChange={(e) => setBorrador(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-[var(--line2,#DFD3BC)] bg-transparent p-3 text-[17px] text-cream"
                placeholder="Escríbelo con tus palabras"
              />
              <div className="flex gap-2">
                <button type="button" onClick={guardar} className="btn-ios-primary flex-1">Guardar</button>
                <button type="button" onClick={() => setEditando(false)}
                  className="min-h-[52px] px-4 rounded-[20px] border border-[var(--line2,#DFD3BC)] text-[17px] text-cream">
                  Cancelar
                </button>
              </div>
            </div>
          )}
          {!editando && (
            sellada ? (
              <p className="text-[15px] text-cream/70">
                Sellado{fecha ? ' · ' + fecha : ''}. Para cambiarlo, rehaces su sesión: {p.sesion}.
              </p>
            ) : bloqueada ? (
              <p className="text-[15px] text-cream/70">Se abre con el camino completo.</p>
            ) : puedeEscribir ? (
              <button
                type="button"
                onClick={() => { setBorrador(texto); setEditando(true); }}
                className="min-h-[44px] text-[17px] font-semibold text-goldhi"
              >
                {texto ? 'Cambiar lo que escribiste' : 'Escribirlo ahora'}
              </button>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <p className="text-[15px] text-cream/70">Se completa en: {p.sesion}</p>
                {onIr && (
                  <button onClick={onIr} className="shrink-0 min-h-[44px] text-[17px] font-semibold text-goldhi">
                    Ir al Camino
                  </button>
                )}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default function ADN({ perfil, userId, setCurrentPage, onProfileFieldUpdate }: ADNProps) {
  /*
   * Esta pantalla recibía `perfil`, `userId` y `onProfileFieldUpdate` desde
   * App.tsx y los ignoraba: solo desestructuraba `setCurrentPage`. Y las
   * piezas leen de localStorage, que espeja apenas tres campos del perfil.
   *
   * Del otro lado, ManualNegocio muestra los veintiocho campos del ADN con
   * su contenido, el selector del país del profesional —de donde sale el
   * tono de sus landings y sus anuncios— y los enlaces al paso exacto del
   * Camino que completa cada campo. Quedó inalcanzable cuando el alias de
   * `manualNegocio` empezó a redirigir acá, y con él se fueron diecinueve
   * campos que el cliente genera y después no tiene dónde leer, y la única
   * forma que tenía de cambiar su país después del primer día.
   *
   * Las piezas siguen siendo la puerta —es la pantalla del menú— y el ADN
   * completo vive un toque más adentro, con lo que ya estaba construido.
   */
  const [verCompleto, setVerCompleto] = useState(false);
  const { selladas, total } = resumenADN();
  const limitado = planLimitado();
  const planHoy = planActual();
  const faltantes = PIEZAS_ADN.filter((p) => !planPermitePilar(planHoy, p.pilar));
  const nivelQueSigue = faltantes.length ? planParaPilar(Math.min(...faltantes.map((p) => p.pilar))) : null;
  const alma = PIEZAS_ADN.filter((p) => p.grupo === 'alma');
  const activos = PIEZAS_ADN.filter((p) => p.grupo === 'activo');
  const irAlCamino = setCurrentPage ? () => setCurrentPage('roadmap') : undefined;
  const bloqueadas = PIEZAS_ADN.filter((p) => estadoPieza(p).bloqueada).length;

  if (verCompleto && setCurrentPage) {
    return (
      <ManualNegocio
        perfil={perfil ?? {}}
        userId={userId}
        setCurrentPage={setCurrentPage}
        onProfileFieldUpdate={onProfileFieldUpdate}
        onVolver={() => setVerCompleto(false)}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-14 animate-in fade-in duration-300 space-y-6">
      <div>
        {/* Un turno anterior vio que la barra de arriba dice «Mi ADN» a cien
            píxeles de acá y lo resolvió igualando el posesivo: decía «Tu ADN»
            y pasó a «Mi ADN». Quedaba el mismo nombre dos veces, uno encima
            del otro. Ahora la pantalla abre con lo que el ADN ES para el
            cliente, que es lo que viene abajo.

            Iba como `<p>` con el serif a 24 píxeles: se veía título y no lo
            era. Por eso el lente del nombre doble no lo marcaba, y la pantalla
            no tenía ningún encabezado. El lente ahora mira también los títulos
            que no usan etiqueta de título. */}
        <p className="text-sm text-cream/55">Todo lo que esta app construye sale de acá: tus textos, tus anuncios, tu oferta, tu clínica.</p>
      </div>

      <div className="card-panel px-5 py-4">
        <div className="flex items-baseline justify-between mb-2.5">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-cream/60">Sellado</p>
          <p className="text-sm font-bold text-gold">{selladas} de {total}{selladas === total ? ' — completo' : ''}</p>
        </div>
        {/*
          Catorce segmentos de 1,5 píxeles de alto, separados, y en cero
          sellados los catorce vacíos: lo que se ve no es una barra, es una
          línea punteada rota. Y es lo primero que mira el cliente nuevo en su
          ADN, que justo arranca en cero.
          Ahora miden 4 y su vacío tiene la línea del panel: siguen siendo uno
          por pieza —cada uno dice el nombre de la suya al tocarlo— pero el
          conjunto se lee como la barra que es.
        */}
        <div className="flex gap-[3px]">
          {PIEZAS_ADN.map((p) => (
            <div key={p.id} title={VOC(p.titulo)}
              className={`h-1 flex-1 rounded-full ${estadoPieza(p).sellada ? 'bg-gold' : ''}`}
              style={estadoPieza(p).sellada ? undefined : { background: 'var(--line2, #DFD3BC)' }} />
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-gold mb-2">Quién eres</p>
        <p className="text-xs text-cream/45 mb-3">En orden: tu historia trae tus dones, tus dones señalan a quién sirves, y de ahí nace tu oferta. Nunca al revés.</p>
        <div className="space-y-2">{alma.map((p) => <Pieza key={p.id} p={p} onIr={irAlCamino} />)}</div>
      </div>

      <div>
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-gold mb-2">Lo que usas todos los días</p>
        <div className="space-y-2">{activos.map((p) => <Pieza key={p.id} p={p} onIr={irAlCamino} />)}</div>
      </div>

      {setCurrentPage && (
        <button
          type="button"
          onClick={() => setVerCompleto(true)}
          className="w-full card-panel px-5 min-h-[44px] py-4 flex items-center gap-3 text-left hover:bg-gold/[0.06] transition-colors"
        >
          <FileText className="w-5 h-5 text-gold shrink-0" />
          <span className="flex-1 min-w-0">
            <span className="block text-sm font-semibold text-cream">Mi ADN completo</span>
            <span className="block text-[15px] text-cream/55 mt-0.5">Los veintiocho campos con su contenido, tu país, y el paso que completa cada uno</span>
          </span>
          <ChevronRight className="w-4 h-4 text-cream/45 shrink-0" />
        </button>
      )}

      {nivelQueSigue && faltantes.length > 0 && (
        <div className="card-panel p-5 border border-gold/30 bg-gold/[0.05]">
          <p className="text-sm text-cream/85 leading-relaxed">
            Te faltan <strong className="text-gold">{faltantes.length} piezas</strong> de tu ADN. Se abren con <strong className="text-cream">{NOMBRE_PLAN[nivelQueSigue]}</strong> ({PRECIO_FUNDADOR[nivelQueSigue]}) — son las que convierten lo que ya sellaste en pacientes que lo pagan.</p>
        </div>
      )}

      <p className="text-sm text-cream/40 text-center leading-relaxed">
        Lo sellado no se edita por fuera: se cambia rehaciendo esa sesión.<br />
        Así tu ADN nunca se contradice con lo que la app construye.
      </p>
    </div>
  );
}
