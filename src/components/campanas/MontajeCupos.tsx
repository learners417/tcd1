/**
 * EL MONTAJE — los 8 candados (T4 del Manual de Anuncios).
 *
 * ESTA es la lista que decide si una campaña puede encender. Nada se enciende
 * hasta que todo está tildado: un solo punto flojo quema el presupuesto
 * entero. Y cada candado se tilda porque SU DATO está cargado —el píxel con
 * su id, el dominio verificado, el formulario probado— no porque alguien dijo
 * que sí.
 *
 * La matriz de 62 ítems del Admin es otra cosa: es el trabajo de preparación
 * del equipo. Las dos conviven a propósito y cada una dice lo que sabe. Antes
 * las dos decían «listo» sobre el mismo cliente con varas distintas, que es
 * la forma más rápida de enseñarle a alguien a no creerle a ninguna.
 *
 * Al encender se guarda la fecha: el tablero y la regla de los 14 días
 * cuentan desde ahí.
 */
import React, { useState, useEffect } from 'react';
import TableroCupos from './TableroCupos';
import { estadoDeLasPiezas } from '../../lib/formulasAnuncios';
import TutorialTecnicoBox from '../TutorialTecnicoBox';
import { marcarEncendida, marcarPausada } from '../../lib/salaDeMandoStorage';
import { frenoDe } from '../../lib/frenos';
import Freno from '../Freno';
import NumerosDeLaSemana from '../admin/NumerosDeLaSemana';
import {
  candadoCerrado, cuantosCerrados, comoUrl, DIAS_SIN_TOCAR,
  type Montaje, type IdCandado,
} from '../../lib/montajeCampana';
import { montajeDe, guardarMontaje } from '../../lib/montajeDatos';

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
  id: IdCandado;
  titulo: string;
  detalle: string;
  /** Abre el Constructor de anuncios. */
  accion?: 'anuncios';
  /** Código de la sesión con el paso a paso técnico (TutorialTecnicoBox). */
  tutorial?: string;
  /** Sesión del Camino donde se sella esto, para poder nombrarla. */
  sesion?: string;
  /**
   * El dato que lo prueba.
   *
   * Los que lo tienen NO se tildan a mano: se tildan porque el dato está
   * cargado. Antes eran ocho casillas vacías, y detrás de una casilla que
   * cualquiera podía marcar se enciende una campaña con dinero real.
   */
  pide?: { campo: keyof Montaje; etiqueta: string; ejemplo: string };
};

const CANDADOS: Candado[] = [
  { id: 'anuncios', titulo: 'Tus 3 anuncios escritos y auditados',
    detalle: 'Una de piedras, una de dolor o historia y una de resultado. Si las tres dijeran lo mismo, no sabrías cuál funcionó.',
    accion: 'anuncios' },
  { id: 'palabra', titulo: 'Tu PALABRA configurada y PROBADA',
    detalle: 'Comentaste desde otra cuenta y te llegó el mensaje. Si no la probaste, no está lista.',
    sesion: 'Tu PALABRA — tu recuperador',
    pide: { campo: 'palabra', etiqueta: 'Cuál es tu palabra', ejemplo: 'QUIERO' } },
  { id: 'dm', titulo: 'Tu DM con su pregunta + el seguimiento',
    detalle: 'La respuesta automática entra en menos de un minuto y hace UNA sola pregunta.',
    tutorial: 'P4.5-dm', sesion: 'Tu DM automático — el link y UNA pregunta' },
  { id: 'pagina', titulo: 'Tu página: precio, agenda y preguntas',
    detalle: 'Inversión visible, calendario y las preguntas que filtran antes de la llamada.',
    sesion: 'Tu página de venta — el precio en privado',
    pide: { campo: 'url_pagina', etiqueta: 'El link de tu página', ejemplo: 'tuclinica.com/programa' } },
  { id: 'pixel', titulo: 'El píxel activo en tu página',
    detalle: 'Instalado y verificado: cada visita tiene que quedar registrada o la campaña aprende a ciegas.',
    tutorial: 'P4.5-pixel',
    pide: { campo: 'pixel_id', etiqueta: 'El id de tu píxel', ejemplo: '1234567890123456' } },
  { id: 'perfil', titulo: 'Tu perfil ordenado',
    detalle: 'El link de tu bio apunta a tu página de venta y tu historia está fijada arriba.',
    sesion: 'Tu perfil que convierte',
    pide: { campo: 'url_perfil', etiqueta: 'El link de tu perfil', ejemplo: 'instagram.com/tumarca' } },
  { id: 'trabajo', titulo: 'Tu único trabajo, claro',
    detalle: 'Atender las conversaciones de quienes comentan. Nada más, y todos los días.' },
  { id: 'presupuesto', titulo: `Presupuesto definido: ${DIAS_SIN_TOCAR} días sin tocar`,
    detalle: 'Una sola campaña, un presupuesto que puedas sostener dos semanas sin mirar el resultado.',
    tutorial: 'P4.4' },
];

/**
 * Lo que el equipo necesita para poder mirar tu campaña.
 *
 * No son candados: no frenan el encendido. Pero sin esto, revisar un anuncio
 * significaba pedírselo al cliente por mensaje.
 */
const PARA_EL_EQUIPO: Array<{ campo: keyof Montaje; etiqueta: string; ejemplo: string }> = [
  { campo: 'url_anuncio_meta', etiqueta: 'El anuncio corriendo', ejemplo: 'facebook.com/ads/…' },
  { campo: 'dominio', etiqueta: 'Tu dominio', ejemplo: 'tuclinica.com' },
  { campo: 'url_formulario', etiqueta: 'Tu formulario', ejemplo: 'el link que completan antes de la llamada' },
  { campo: 'url_calendario', etiqueta: 'Tu calendario', ejemplo: 'donde agendan contigo' },
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
  const [encendida, setEncendida] = useState<string | null>(() => leer<string | null>(KEY_ON, null));
  const [historial, setHistorial] = useState<string[]>(() => leer<string[]>(KEY_HIST, []));
  const restantes = TOPE_CAMPANAS - historial.length;
  /** Encender es lo más caro que hace la app: el gasto empieza ahí. */
  const [confirmando, setConfirmando] = useState(false);
  /**
   * Cuando el equipo no se pudo enterar de que encendió.
   *
   * Antes esto se descartaba con un `void`: si el identificador del cliente
   * llegaba vacío, el guardado se hacía contra un valor inválido, el error se
   * perdía, y el cliente veía su campaña encendida mientras el equipo lo
   * seguía viendo como «instalando» — con una cuenta ya gastando dinero.
   */
  const [sinAvisar, setSinAvisar] = useState(false);

  /**
   * Lo que montó, desde la base.
   *
   * Antes esto vivía solo en `localStorage`: cambiaba de teléfono y perdía los
   * ocho candados, y el equipo no veía nunca si estaba listo para encender.
   * Lo local queda como respaldo mientras carga y por si la base no responde.
   */
  const [montaje, setMontaje] = useState<Montaje>({});
  const [guardandoCampo, setGuardandoCampo] = useState<string | null>(null);
  const [fallaGuardar, setFallaGuardar] = useState<string | null>(null);

  useEffect(() => {
    if (!clienteId) return;
    let vivo = true;
    void montajeDe(clienteId).then((m) => { if (vivo) setMontaje(m); }).catch(() => { /* queda lo local */ });
    return () => { vivo = false; };
  }, [clienteId]);

  const guardarCampo = async (campo: keyof Montaje, valor: string | number | boolean | null) => {
    const antes = montaje;
    setMontaje((m) => ({ ...m, [campo]: valor }));
    if (!clienteId) { setFallaGuardar('Vuelve a entrar a tu cuenta para que esto quede guardado.'); return; }
    setGuardandoCampo(String(campo));
    setFallaGuardar(null);
    try {
      await guardarMontaje(clienteId, { [campo]: valor });
    } catch (err) {
      setMontaje(antes);
      setFallaGuardar(err instanceof Error ? err.message : 'No se pudo guardar.');
    } finally {
      setGuardandoCampo(null);
    }
  };

  /** Los dos candados que son una acción y no una cosa. */
  const toggle = (id: IdCandado) => {
    if (id === 'dm') void guardarCampo('dm_probado', !montaje.dm_probado);
    else if (id === 'trabajo') void guardarCampo('trabajo_claro', !montaje.trabajo_claro);
    // El resto se cierra cargando su dato, no tildando.
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

  const verificado = (id: IdCandado): boolean =>
    id === 'anuncios' ? estadoPiezas.listas : candadoCerrado(montaje, id);

  const listos = cuantosCerrados(montaje, estadoPiezas.listas);
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
    if (!clienteId) { setSinAvisar(true); return; }
    void marcarEncendida(clienteId)
      .then(() => setSinAvisar(false))
      .catch(() => setSinAvisar(true));
  };

  /** Cerrar la campana viva. Antes de los 14 dias no se puede: es la regla
   *  que protege el metodo, no un capricho de la app. */
  const cerrarCampana = (dias: number) => {
    if (dias <= DIAS_MINIMOS) return;
    setEncendida(null);
    try { localStorage.removeItem(KEY_ON); } catch { /* noop */ }
    // Lo que se reinicia es el presupuesto, que es de ESTA campaña. Su página,
    // su píxel y su perfil siguen siendo los mismos: antes se borraban los
    // ocho tildes al cerrar, y con datos reales eso sería tirar su trabajo.
    void guardarCampo('presupuesto_diario', null);
    void guardarCampo('dias_sostenidos', null);
    if (!clienteId) { setSinAvisar(true); return; }
    void marcarPausada(clienteId, true)
      .then(() => setSinAvisar(false))
      .catch(() => setSinAvisar(true));
  };

  if (encendida) {
    const dias = Math.max(1, Math.floor((Date.now() - new Date(encendida).getTime()) / 86400000) + 1);
    return (
      <div className="card-panel p-6 text-center space-y-3">
        <p className="text-4xl">🔴</p>
        <p className="text-xl text-cream" style={{ fontFamily: 'var(--font-display)' }}>Campaña viva — día {Math.min(dias, 99)}</p>
        {sinAvisar && (
          <p className="rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm font-medium text-goldhi">
            Tu campaña está encendida aquí, pero no pudimos avisarle al equipo.
            Escríbeles por Soporte para que lo registren y puedan acompañarte.
          </p>
        )}
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
        <p className="text-sm text-cream/60 mt-1">
          Cada candado se cierra cuando cargas lo que lo prueba. Nada se enciende
          hasta tener los ocho: un solo punto flojo quema el presupuesto entero.
        </p>
      </div>
      <div className="space-y-2">
        {CANDADOS.map((c, i) => (
          <div key={c.id}
            onClick={() => { if (c.id === 'dm' || c.id === 'trabajo') toggle(c.id); }}
            role={c.id === 'dm' || c.id === 'trabajo' ? 'button' : undefined}
            className={`w-full text-left rounded-2xl border p-4 transition-colors ${
              c.id === 'dm' || c.id === 'trabajo' ? 'cursor-pointer' : ''
            } ${verificado(c.id) ? 'border-success/40 bg-success/[0.05]' : 'border-cream/10 hover:border-cream/25'}`}>
            <div className="flex items-start gap-3">
              <span className={`mt-0.5 w-6 h-6 rounded-full border flex items-center justify-center text-sm shrink-0 ${verificado(c.id) ? 'border-success bg-success text-black font-bold' : 'border-cream/25 text-cream/40'}`}>
                {verificado(c.id) ? '✓' : i + 1}
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold text-cream">{c.titulo}</span>
                <span className="block text-sm text-cream/55 mt-0.5 leading-relaxed">{c.detalle}</span>

                {/* El dato que cierra este candado. No se tilda: se carga. */}
                {c.pide && (
                  <span className="block mt-2.5" onClick={(e) => e.stopPropagation()}>
                    <label className="block text-sm text-cream/60 mb-1">{c.pide.etiqueta}</label>
                    <input
                      defaultValue={(montaje[c.pide.campo] as string | null) ?? ''}
                      placeholder={c.pide.ejemplo}
                      onBlur={(e) => {
                        const v = e.target.value.trim();
                        const campo = c.pide!.campo;
                        const actual = (montaje[campo] as string | null) ?? '';
                        if (v === actual) return;
                        void guardarCampo(campo, v ? (campo === 'palabra' || campo === 'pixel_id' ? v : comoUrl(v)) : null);
                      }}
                      className="w-full bg-surface/50 border border-[rgba(232,150,46,0.15)] rounded-xl px-3.5 py-2.5 text-sm text-cream placeholder:text-cream/35 focus:outline-none focus:border-gold/50 min-h-[44px]" />
                    {guardandoCampo === String(c.pide.campo) && (
                      <span className="block text-sm text-cream/45 mt-1">Guardando…</span>
                    )}
                  </span>
                )}

                {/* El presupuesto son dos números, no un tilde. */}
                {c.id === 'presupuesto' && (
                  <span className="block mt-2.5 grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
                    <span className="block">
                      <label className="block text-sm text-cream/60 mb-1">Por día, en USD</label>
                      <input type="number" inputMode="decimal" min={0}
                        defaultValue={montaje.presupuesto_diario ?? ''}
                        onBlur={(e) => {
                          const n = Number(e.target.value);
                          if (Number.isFinite(n) && n !== (montaje.presupuesto_diario ?? 0)) {
                            void guardarCampo('presupuesto_diario', n > 0 ? n : null);
                          }
                        }}
                        className="w-full bg-surface/50 border border-[rgba(232,150,46,0.15)] rounded-xl px-3.5 py-2.5 text-sm text-cream focus:outline-none focus:border-gold/50 min-h-[44px]" />
                    </span>
                    <span className="block">
                      <label className="block text-sm text-cream/60 mb-1">Días que lo sostienes</label>
                      <input type="number" inputMode="numeric" min={0}
                        defaultValue={montaje.dias_sostenidos ?? ''}
                        onBlur={(e) => {
                          const n = Number(e.target.value);
                          if (Number.isFinite(n) && n !== (montaje.dias_sostenidos ?? 0)) {
                            void guardarCampo('dias_sostenidos', n > 0 ? Math.round(n) : null);
                          }
                        }}
                        className="w-full bg-surface/50 border border-[rgba(232,150,46,0.15)] rounded-xl px-3.5 py-2.5 text-sm text-cream focus:outline-none focus:border-gold/50 min-h-[44px]" />
                    </span>
                    {(montaje.dias_sostenidos ?? 0) > 0 && (montaje.dias_sostenidos ?? 0) < DIAS_SIN_TOCAR && (
                      <span className="col-span-2 block text-sm text-gold/85">
                        Con menos de {DIAS_SIN_TOCAR} días no alcanza a decirte nada. Baja el número de
                        por día hasta que puedas sostenerlo dos semanas.
                      </span>
                    )}
                  </span>
                )}
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
          </div>
        ))}
      </div>

      {fallaGuardar && (
        <p className="rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm font-medium text-goldhi">
          {fallaGuardar}
        </p>
      )}

      {/* Para que el equipo pueda mirar tu campaña sin pedirte nada.
          No frena el encendido: son los links que necesitan para revisarla. */}
      <div className="rounded-2xl border border-cream/10 p-4">
        <p className="text-sm font-semibold text-cream">Para que tu equipo pueda mirarla</p>
        <p className="text-sm text-cream/55 mt-0.5 mb-3 leading-relaxed">
          Con esto revisan tu campaña sin tener que pedirte nada. No hace falta para encender.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {PARA_EL_EQUIPO.map((f) => (
            <div key={String(f.campo)}>
              <label className="block text-sm text-cream/60 mb-1">{f.etiqueta}</label>
              <input
                defaultValue={(montaje[f.campo] as string | null) ?? ''}
                placeholder={f.ejemplo}
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if (v === ((montaje[f.campo] as string | null) ?? '')) return;
                  void guardarCampo(f.campo, v ? comoUrl(v) : null);
                }}
                className="w-full bg-surface/50 border border-[rgba(232,150,46,0.15)] rounded-xl px-3.5 py-2.5 text-sm text-cream placeholder:text-cream/35 focus:outline-none focus:border-gold/50 min-h-[44px]" />
            </div>
          ))}
        </div>
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
