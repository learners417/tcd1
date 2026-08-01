/**
 * EL MONTAJE — los 8 candados (T4 del Manual de Anuncios).
 * Nada se enciende hasta que TODO está tildado. Un solo punto flojo quema
 * el presupuesto entero. Al encender, se guarda la fecha: el tablero y la
 * regla de los 14 días cuentan desde ahí.
 */
import React, { useState } from 'react';
import TableroCupos from './TableroCupos';
import { estadoDeLasPiezas } from '../../lib/formulasAnuncios';
import TutorialTecnicoBox from '../TutorialTecnicoBox';
import { marcarEncendida, marcarPausada } from '../../lib/salaDeMandoStorage';
import { frenoDe } from '../../lib/frenos';
import Freno from '../Freno';
import NumerosDeLaSemana from '../admin/NumerosDeLaSemana';

const KEY = 'tcd_montaje_v1';
const KEY_ON = 'tcd_campana_encendida_v1';
/** Historial de encendidos. El tope no es capricho: el metodo pide UNA
 *  campana medida 14 dias, no diez a la vez. Tres da margen para pivotear
 *  dos veces sin que el cliente se escape de medir. */
const KEY_HIST = 'tcd_campanas_historial_v1';
const TOPE_CAMPANAS = 3;
const DIAS_MINIMOS = 14;

/**
 * Cada candado con LO QUE LO RESUELVE al lado.
 *
 * Antes eran ocho casillas para tildar y nada más. Un cliente que no sabe
 * instalar un píxel tildaba igual, o se quedaba trabado sin saber a quién
 * preguntarle. Ahora cada uno lleva o su herramienta dentro de la app, o el
 * paso a paso técnico, o la sesión del Camino donde se sella.
 */
type Candado = {
  id: string;
  titulo: string;
  detalle: string;
  /** Abre el Constructor de anuncios. */
  accion?: 'anuncios';
  /** Código de la sesión con el paso a paso técnico (TutorialTecnicoBox). */
  tutorial?: string;
  /** Sesión del Camino donde se sella esto, para poder nombrarla. */
  sesion?: string;
};

const CANDADOS: Candado[] = [
  { id: 'anuncios', titulo: 'Tus 3 anuncios escritos y auditados',
    detalle: 'Una de piedras, una de dolor o historia y una de resultado. Si las tres dijeran lo mismo, no sabrías cuál funcionó.',
    accion: 'anuncios' },
  { id: 'palabra', titulo: 'Tu PALABRA configurada y PROBADA',
    detalle: 'Comentaste desde otra cuenta y te llegó el mensaje. Si no la probaste, no está lista.',
    sesion: 'Tu PALABRA — la llave de tu campaña' },
  { id: 'dm', titulo: 'Tu DM con su pregunta + el seguimiento',
    detalle: 'La respuesta automática entra en menos de un minuto y hace UNA sola pregunta.',
    tutorial: 'P4.5-dm', sesion: 'Tu DM automático — el link y UNA pregunta' },
  { id: 'pagina', titulo: 'Tu página: precio, agenda y preguntas',
    detalle: 'Inversión visible, calendario y las preguntas que filtran antes de la llamada.',
    sesion: 'Tu página de venta — el precio en privado' },
  { id: 'pixel', titulo: 'El píxel activo en tu página',
    detalle: 'Instalado y verificado: cada visita tiene que quedar registrada o la campaña aprende a ciegas.',
    tutorial: 'P4.5-pixel' },
  { id: 'perfil', titulo: 'Tu perfil ordenado',
    detalle: 'El link de tu bio apunta a tu página de venta y tu historia está fijada arriba.',
    sesion: 'Tu perfil que convierte' },
  { id: 'trabajo', titulo: 'Tu único trabajo, claro',
    detalle: 'Atender las conversaciones de quienes comentan. Nada más, y todos los días.' },
  { id: 'presupuesto', titulo: 'Presupuesto definido: 14 días sin tocar',
    detalle: 'Una sola campaña, un presupuesto que puedas sostener dos semanas sin mirar el resultado.',
    tutorial: 'P4.4' },
];

function leer<T>(k: string, def: T): T {
  try { return JSON.parse(localStorage.getItem(k) ?? '') as T; } catch { return def; }
}

export default function MontajeCupos(
  { onIrAnuncios, clienteId }: {
    onIrAnuncios?: () => void;
    /** Se pasa hasta el tablero: sin esto sus números no llegan al equipo. */
    clienteId?: string;
  },
) {
  const [checks, setChecks] = useState<Record<string, boolean>>(() => leer(KEY, {}));
  const [encendida, setEncendida] = useState<string | null>(() => leer<string | null>(KEY_ON, null));
  const [historial, setHistorial] = useState<string[]>(() => leer<string[]>(KEY_HIST, []));
  const restantes = TOPE_CAMPANAS - historial.length;
  /** Encender es lo más caro que hace la app: el gasto empieza ahí. */
  const [confirmando, setConfirmando] = useState(false);

  const toggle = (id: string) => {
    const n = { ...checks, [id]: !checks[id] };
    setChecks(n);
    try { localStorage.setItem(KEY, JSON.stringify(n)); } catch { /* noop */ }
  };
  /**
   * El candado de los anuncios NO se tilda a mano: se lee de las piezas.
   * Antes era una casilla que cualquiera podía marcar, y detrás de esa
   * casilla se enciende una campaña con dinero real.
   */
  const piezasGuardadas = leer<Record<number, { formulaId: number; texto: string }>>(
    'tcd_anuncios_v1', {});
  const selGuardada = leer<Record<string, number> | null>('tcd_anuncios_v1_sel', null);
  const idsElegidos = selGuardada
    ? [selGuardada.piedras, selGuardada.dolor_historia, selGuardada.resultado_metodo].filter(Boolean)
    : Object.values(piezasGuardadas).map((x) => x.formulaId).slice(0, 3);
  const briefGuardado = leer<{ palabra?: string }>('tcd_brief_anuncios_v1', {});
  const estadoPiezas = estadoDeLasPiezas(
    piezasGuardadas, idsElegidos, briefGuardado.palabra ?? '');

  const verificado = (id: string): boolean =>
    id === 'anuncios' ? estadoPiezas.listas : !!checks[id];

  const listos = CANDADOS.filter((c) => verificado(c.id)).length;
  const todo = listos === CANDADOS.length;

  const encender = () => {
    if (!todo || restantes <= 0) return;
    // No enciende directo: el gasto empieza en este momento y no se recupera.
    setConfirmando(true);
  };

  const encenderDeVerdad = () => {
    setConfirmando(false);
    const fecha = new Date().toISOString();
    const hist = [...historial, fecha];
    setEncendida(fecha);
    setHistorial(hist);
    try {
      localStorage.setItem(KEY_ON, JSON.stringify(fecha));
      localStorage.setItem(KEY_HIST, JSON.stringify(hist));
    } catch { /* noop */ }
    // Y A LA BASE. Sin esto el cliente enciende y el equipo no se entera:
    // queda como «instalando» para siempre, su diagnóstico de campaña nunca
    // se activa, y nadie mira una cuenta que ya está gastando dinero.
    void marcarEncendida(clienteId ?? '');
  };

  /** Cerrar la campana viva. Antes de los 14 dias no se puede: es la regla
   *  que protege el metodo, no un capricho de la app. */
  const cerrarCampana = (dias: number) => {
    if (dias <= DIAS_MINIMOS) return;
    setEncendida(null);
    setChecks({});
    try {
      localStorage.removeItem(KEY_ON);
      localStorage.setItem(KEY, JSON.stringify({}));
    } catch { /* noop */ }
    void marcarPausada(clienteId ?? '', true);
  };

  if (encendida) {
    const dias = Math.max(1, Math.floor((Date.now() - new Date(encendida).getTime()) / 86400000) + 1);
    return (
      <div className="card-panel p-6 text-center space-y-3">
        <p className="text-4xl">🔴</p>
        <p className="text-xl text-cream" style={{ fontFamily: 'var(--font-display)' }}>Campaña viva — día {Math.min(dias, 99)}</p>
        {dias <= 14 ? (
          <p className="text-sm text-cream/70">Estás en los primeros 14 días: <strong className="text-gold">no se opina, se mide</strong>. Faltan {14 - dias + 1} días para decidir. Carga tus conversaciones cada día en el Tablero.</p>
        ) : (
          <p className="text-sm text-cream/70">Pasaste los 14 días: ahora las reglas deciden. Tu Tablero te dice qué se apaga, qué queda y cuándo refrescar el creativo.</p>
        )}
      {/* LA SEGUNDA PUERTA.
          Se llamaba «un formulario, dos puertas» y solo tenía una: el equipo.
          El cliente cargaba en otro lado, y los dos lados no se enteraban.
          Ahora los dos escriben acá, y cada campo dice quién lo cargó. */}
      {clienteId && (
        <div className="mb-6">
          <NumerosDeLaSemana
            clienteId={clienteId}
            nombreCliente=""
            quienCarga={clienteId}
            nombreQuienCarga="tú"
          />
        </div>
      )}


<TableroCupos diasCampana={dias} clienteId={clienteId} onIrAnuncios={onIrAnuncios} />
        {dias <= DIAS_MINIMOS ? (
          <p className="text-sm text-cream/40">
            Esta campaña se puede cerrar a partir del día {DIAS_MINIMOS + 1}. Antes, los números no dicen nada todavía.
          </p>
        ) : restantes > 0 ? (
          <button onClick={() => cerrarCampana(dias)}
            className="text-sm text-cream/40 underline underline-offset-2">
            Cerrar esta campaña y montar la próxima — te {restantes === 1 ? 'queda 1' : `quedan ${restantes}`}
          </button>
        ) : (
          <p className="text-sm text-cream/40">
            Es tu campaña 3 de 3. Si esta no trae pacientes, el problema no está en el anuncio: escríbele a Soporte.
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      {/* El freno más caro de la app: acá empieza el gasto. */}
      {confirmando && (
        <Freno
          freno={frenoDe('encender_campana', { nombreCliente: 'tu campaña', monto: 0 })}
          onSeguir={encenderDeVerdad}
          onCancelar={() => setConfirmando(false)}
        />
      )}
    <div className="space-y-4">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-gold mb-1">El montaje</p>
        <h2 className="text-xl text-cream" style={{ fontFamily: 'var(--font-display)' }}>Tus 8 candados — {listos} de 8</h2>
        <p className="text-sm text-gold mt-1">Campaña {Math.min(historial.length + 1, TOPE_CAMPANAS)} de {TOPE_CAMPANAS}</p>
        <p className="text-sm text-cream/60 mt-1">Nada se enciende hasta que todo está tildado. Un solo punto flojo quema el presupuesto entero.</p>
      </div>
      <div className="space-y-2">
        {CANDADOS.map((c, i) => (
          <button key={c.id}
            onClick={() => { if (c.id !== 'anuncios') toggle(c.id); }}
            className={`w-full text-left rounded-2xl border p-4 transition-colors ${verificado(c.id) ? 'border-success/40 bg-success/[0.05]' : 'border-cream/10 hover:border-cream/25'}`}>
            <div className="flex items-start gap-3">
              <span className={`mt-0.5 w-6 h-6 rounded-full border flex items-center justify-center text-sm shrink-0 ${checks[c.id] ? 'border-success bg-success text-black font-bold' : 'border-cream/25 text-cream/40'}`}>
                {verificado(c.id) ? '✓' : i + 1}
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold text-cream">{c.titulo}</span>
                <span className="block text-sm text-cream/55 mt-0.5 leading-relaxed">{c.detalle}</span>
                {c.id === 'anuncios' && (
                  <span className="block text-sm mt-1.5 leading-relaxed">
                    {estadoPiezas.listas ? (
                      <span className="text-success/80">
                        Las 3 escritas y auditadas. Este candado se marca solo.
                      </span>
                    ) : (
                      <span className="text-gold/85">
                        {estadoPiezas.escritas}/3 escritas · {estadoPiezas.aprobadas}/3 auditadas.
                        {estadoPiezas.pendientes.slice(0, 3).map((x) => (
                          <span key={x.formulaId} className="block text-cream/55">
                            · {x.nombre}: {x.falta.join(', ')}
                          </span>
                        ))}
                        <span className="block text-cream/40 mt-1">
                          Este candado no se tilda a mano: se marca cuando las 3 pasen la auditoría.
                        </span>
                      </span>
                    )}
                  </span>
                )}
                {c.sesion && !verificado(c.id) && (
                  <span className="block text-sm text-cream/45 mt-1">
                    Se sella en la sesión «{c.sesion}» de tu Camino.
                  </span>
                )}
                {c.tutorial && !verificado(c.id) && (
                  <span className="block mt-2" onClick={(e) => e.stopPropagation()}>
                    <TutorialTecnicoBox clave={c.tutorial} />
                  </span>
                )}
                {c.accion === 'anuncios' && onIrAnuncios && (
                  <span onClick={(e) => { e.stopPropagation(); onIrAnuncios(); }}
                    className="inline-block text-sm font-bold text-gold mt-1.5 hover:text-goldhi">Abrir el Constructor →</span>
                )}
              </span>
            </div>
          </button>
        ))}
      </div>
      <button onClick={encender} disabled={!todo || restantes <= 0}
        className="w-full btn-primary py-4 rounded-xl text-sm font-bold disabled:opacity-40">
        {restantes <= 0
          ? 'Usaste tus 3 campañas — habla con Soporte'
          : todo ? '🚀 ENCENDER — y anotar la fecha' : `Faltan ${8 - listos} candados para encender`}
      </button>
    </div>
    </>
  );
}
