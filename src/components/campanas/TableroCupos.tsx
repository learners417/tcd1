/**
 * EL TABLERO-SEMÁFORO (T5 del Manual de Anuncios).
 * Diario: UN número (conversaciones). Viernes: cuatro por anuncio.
 * El tablero no muestra métricas — DICE LA DECISIÓN, con las reglas:
 * >$0,07 por visita → se apaga · conversaciones sin agendas → es la página
 * o el DM · primeros 14 días → se mide, no se opina.
 */
import React, { useState } from 'react';
import {
  METRICAS_REGLAS, UMBRALES, veredictoAnuncio, diasDeMedicion,
  type ObjetivoCampana,
} from '../../lib/formulasAnuncios';
import { decidirCampana } from '../../lib/decidirCampana';
import { proyectar, SEMANA_VACIA } from '../../lib/valueChain';
import {
  semanaISO, anotarSemana, leerBitacora, resumirBitacora,
  type EntradaBitacora,
} from '../../lib/bitacoraCampana';
import { formulaPorId } from '../../lib/formulasAnuncios';
import { subirNumerosDelCliente } from '../../lib/tableroSync';

const KEY_DIA = 'tcd_tablero_diario_v1';
const KEY_SEM = 'tcd_tablero_semana_v1';
/** La historia. Antes cada viernes pisaba al anterior y no se aprendía nada. */
const KEY_BIT = 'tcd_bitacora_campana_v1';

interface FilaAnuncio { gasto: string; visitas: string; conversaciones: string; agendas: string; ventas: string }
const FILA0: FilaAnuncio = { gasto: '', visitas: '', conversaciones: '', agendas: '', ventas: '' };

function leer<T>(k: string, def: T): T {
  try { return JSON.parse(localStorage.getItem(k) ?? '') as T; } catch { return def; }
}
const hoy = () => new Date().toISOString().slice(0, 10);

export default function TableroCupos(
  { diasCampana, onIrAnuncios, clienteId }: {
    diasCampana: number;
    onIrAnuncios?: () => void;
    /** Sin esto, lo que carga vive solo en este navegador y la cola del
     *  equipo queda ciega aunque él haya cargado. */
    clienteId?: string;
  },
) {
  const [diario, setDiario] = useState<Record<string, number>>(() => leer(KEY_DIA, {}));
  const [convHoy, setConvHoy] = useState<string>(() => String(leer<Record<string, number>>(KEY_DIA, {})[hoy()] ?? ''));
  const [semana, setSemana] = useState<FilaAnuncio[]>(() => leer(KEY_SEM, [FILA0, FILA0, FILA0]));
  const [bitacora, setBitacora] = useState<EntradaBitacora[]>(() => leer(KEY_BIT, []));
  const [verHistoria, setVerHistoria] = useState(false);
  /**
   * La carga del viernes, de a un dato por pantalla.
   *
   * Antes eran 12 casillas en una grilla de 4 columnas: en un teléfono cada
   * una queda de dos centímetros y se carga mal o no se carga. Y el orden
   * importa: en el administrador de anuncios los números se leen POR COLUMNA
   * (ves el gasto de los tres juntos), no anuncio por anuncio. Preguntar en
   * ese orden es copiar de una pantalla a la otra sin ir y volver.
   */
  const [paso, setPaso] = useState(0);
  const [verTabla, setVerTabla] = useState(false);
  /** Con que regla se juzga esta campana. Por defecto mensajes: es lo que
   *  vende el sistema de cupos (comentario → DM → pagina). */
  /**
   * Con qué regla se mide esta campaña.
   *
   * Si el sanador todavía no lo eligió acá, se deriva de LA PUERTA que eligió
   * al armar la campaña: esa decisión se guardaba en 'tcd_campana_objetivo' y
   * NADIE LA LEÍA — elegía una puerta y se tiraba. Ahora preselecciona la
   * regla correcta, que es justo para lo que servía.
   */
  const [objetivo, setObjetivo] = useState<ObjetivoCampana>(() => {
    const propio = leer<ObjetivoCampana | null>('tcd_objetivo_campana_v1', null);
    if (propio) return propio;
    const puerta = leer<string | null>('tcd_campana_objetivo', null);
    // 'seguidores' compra visitas al perfil; 'comunidad' y 'ventas', conversaciones.
    return puerta === 'seguidores' ? 'perfil' : 'mensajes';
  });
  const cambiarObjetivo = (o: ObjetivoCampana) => {
    setObjetivo(o);
    try { localStorage.setItem('tcd_objetivo_campana_v1', JSON.stringify(o)); } catch { /* noop */ }
  };

  const [guardado, setGuardado] = useState(false);
  const guardarDia = () => {
    const n = { ...diario, [hoy()]: Math.max(0, parseInt(convHoy || '0', 10) || 0) };
    setDiario(n);
    try { localStorage.setItem(KEY_DIA, JSON.stringify(n)); } catch { /* noop */ }
    // Un botón que no dice nada al tocarlo parece roto: el cliente vuelve a
    // tocarlo, duda si se guardó, y termina cargando dos veces o ninguna.
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2500);
  };

  /** Días seguidos cargando, hasta hoy. Es lo único que sostiene el hábito. */
  const racha = (() => {
    let n = 0;
    const d = new Date();
    for (let i = 0; i < 60; i++) {
      const clave = d.toISOString().slice(0, 10);
      if (diario[clave] === undefined) break;
      n++;
      d.setDate(d.getDate() - 1);
    }
    return n;
  })();
  const setFila = (i: number, k: keyof FilaAnuncio, v: string) => {
    const n = semana.map((f, j) => (j === i ? { ...f, [k]: v } : f));
    setSemana(n);
    try { localStorage.setItem(KEY_SEM, JSON.stringify(n)); } catch { /* noop */ }
    // Y a la base. Sin esto, el cliente podía cargar sus números todas las
    // semanas y LA COLA DEL EQUIPO QUEDABA CIEGA IGUAL: la cola lee de la
    // base, y estos números nunca llegaban.
    void subirNumerosDelCliente(clienteId, n);
  };

  const num = (v: string) => parseFloat(v || '0') || 0;
  const gastoSemana = semana.reduce((t, f) => t + num(f.gasto), 0);

  /** Lo que la app decide hoy, en lugar del sanador. */
  /**
   * SU MARCADOR DE LOS 90 DÍAS.
   *
   * La proyección existía pero vivía en el Admin: el sanador nunca veía la
   * frase que ordena sus tres meses. Sin ella, el número que carga cada día
   * no significa nada — con ella, cada día tiene un marcador.
   *
   * Las tasas salen de SU realidad si ya tiene datos; si no, de las de
   * referencia. Se recalcula solo a medida que carga.
   */
  const objetivoVentas = num(leer<{ objetivoVentas?: string }>(
    'tcd_objetivo_90dias_v1', {}).objetivoVentas ?? '10') || 10;
  const precioPrograma = num(leer<{ precio?: string }>(
    'tcd_brief_anuncios_v1', {}).precio ?? '1000') || 1000;

  const realAcumulada = {
    ...SEMANA_VACIA,
    precio: precioPrograma,
    gasto: gastoSemana,
    conversaciones: semana.reduce((t, f) => t + num(f.conversaciones), 0),
    agendas: semana.reduce((t, f) => t + num(f.agendas), 0),

    ventas: semana.reduce((t, f) => t + num(f.ventas), 0),
  };
  // 13 semanas en 90 días.
  const proyeccion = proyectar(objetivoVentas / 13, realAcumulada);
  const convsEstaSemana = realAcumulada.conversaciones;

  const filasBitacora = leerBitacora(bitacora);
  const resumen = resumirBitacora(bitacora);

  /** Semanas seguidas que el mismo anuncio viene marcado como ganador. */
  const semanasGanando = (() => {
    const ganadoras = filasBitacora.filter((f) => f.estado === 'ganador');
    if (ganadoras.length === 0) return 0;
    const cual = ganadoras[0].indice;
    let n = 0;
    for (const f of filasBitacora) {
      if (f.indice !== cual) continue;
      if (f.estado !== 'ganador') break;
      n++;
    }
    return n;
  })()
  const decision = decidirCampana({
    objetivo,
    precio: num(leer<{ precio?: string }>('tcd_brief_anuncios_v1', {}).precio ?? '1000') || 1000,
    diasEncendida: diasCampana,
    anuncios: semana.map((f, i) => ({
      nombre: `Anuncio ${i + 1}`,
      gasto: num(f.gasto), visitas: num(f.visitas),
      conversaciones: num(f.conversaciones), agendas: num(f.agendas),
      ventas: num(f.ventas),
    })),
    /**
     * Las semanas que lleva GANANDO ese anuncio, no las que lleva corriendo
     * la campaña. Con la edad de la campaña, el día que la app descubría al
     * ganador le decía "lleva 2 semanas, refréscalo" — justo lo contrario de
     * lo que hay que hacer con un creativo que recién demostró que funciona.
     *
     * Se lee de la bitácora: desde cuándo ese anuncio viene marcado ganador.
     */
    semanasDelGanador: semanasGanando,
  });
  /**
   * Guarda la semana en la bitácora con el veredicto que le dio el motor.
   *
   * Se anota a pedido y no en cada tecla: durante el viernes el sanador
   * carga, corrige y vuelve a cargar, y guardar cada pulsación llenaría la
   * historia de estados intermedios que no significan nada.
   */
  const guardarEnBitacora = () => {
    const sel = leer<Record<string, number> | null>('tcd_anuncios_v1_sel', null);
    const ids = sel ? [sel.piedras, sel.dolor_historia, sel.resultado_metodo] : [];
    const entradas: EntradaBitacora[] = semana.map((f, i) => ({
      semana: semanaISO(),
      indice: i,
      formula: formulaPorId(ids[i] ?? 0)?.nombre ?? `Anuncio ${i + 1}`,
      queSeProbo: '',
      gasto: num(f.gasto), conversaciones: num(f.conversaciones),
      agendas: num(f.agendas), ventas: num(f.ventas),
      estado: decision.decisiones[i]?.estado ?? 'sin_datos',
      anotadaEn: new Date().toISOString(),
    })).filter((e) => e.gasto > 0 || e.conversaciones > 0);

    if (entradas.length === 0) return;
    const n = anotarSemana(bitacora, entradas);
    setBitacora(n);
    try { localStorage.setItem(KEY_BIT, JSON.stringify(n)); } catch { /* noop */ }
    setVerHistoria(true);
  };


;

  const diasMedicion = diasDeMedicion(gastoSemana / 7);
  const enMedicion = diasCampana <= diasMedicion;

  const COLOR: Record<string, string> = {
    rojo: 'text-danger', amarillo: 'text-gold',
    verde: 'text-success', sin_datos: 'text-cream/60',
  };
  const PASOS: Array<{
    k: keyof FilaAnuncio; titulo: string; ayuda: string; donde: string;
  }> = [
    { k: 'gasto', titulo: '¿Cuánto gastó cada anuncio?', ayuda: 'En dólares, esta semana.',
      donde: 'Columna «Importe gastado» del administrador de anuncios.' },
    { k: 'visitas', titulo: '¿Cuánta gente los vio?', ayuda: 'Personas alcanzadas.',
      donde: 'Columna «Alcance».' },
    { k: 'conversaciones', titulo: '¿Cuántas conversaciones se abrieron?', ayuda: 'Comentarios con tu palabra o mensajes nuevos.',
      donde: 'Los cuentas tú, o la columna de mensajes iniciados.' },
    { k: 'agendas', titulo: '¿Cuántas reservaron día y hora?', ayuda: 'Solo las que agendaron de verdad.',
      donde: 'Tu calendario.' },
    { k: 'ventas', titulo: '¿Cuántas compraron?', ayuda: 'Las que ya pagaron, no las que dijeron que sí.',
      donde: 'Tu cuenta de cobros. Es el número que decide cuál gana.' },
  ];

  const veredicto = (f: FilaAnuncio): { color: string; texto: string } | null => {
    const d = {
      gasto: num(f.gasto), visitas: num(f.visitas),
      conversaciones: num(f.conversaciones), agendas: num(f.agendas),
    };
    if (!d.gasto && !d.visitas && !d.conversaciones) return null;
    const v = veredictoAnuncio(objetivo, d);
    const icono = { rojo: '🔴 ', amarillo: '🟡 ', verde: '🟢 ', sin_datos: '' }[v.estado];
    return { color: COLOR[v.estado], texto: icono + v.texto };
  };

  const totalSemana = semana.reduce((t, f) => t + num(f.conversaciones), 0);

  const u = UMBRALES[objetivo];

  const COLOR_ESTADO: Record<string, string> = {
    muerto: 'text-danger', ganador: 'text-success',
    sigue: 'text-cream/75', midiendo: 'text-gold', sin_datos: 'text-cream/40',
  };

  return (
    <div className="space-y-4 text-left">

      {/* LO ÚNICO QUE HAY QUE HACER HOY */}
      <div className={`rounded-2xl border p-5 ${
        decision.fase === 'midiendo' ? 'border-gold/30 bg-gold/[0.05]'
        : decision.decisiones.some((d) => d.estado === 'muerto')
          ? 'border-danger/35 bg-danger/[0.05]'
          : 'border-success/25 bg-success/[0.05]'}`}>
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-cream/50 mb-2">
          Hoy
        </p>
        <p className="text-base text-cream leading-snug">{decision.accionPrincipal}</p>

        {/* Cuando hay ganador, el siguiente paso es UNO y está acá. */}
        {decision.ganador !== null && onIrAnuncios && (
          <button onClick={onIrAnuncios}
            className="w-full btn-primary py-2.5 rounded-xl text-sm font-bold mt-3">
            Generar dos piezas más con la fórmula que ganó
          </button>
        )}
      </div>

      {/* QUÉ PASA CON CADA ANUNCIO */}
      {decision.decisiones.some((d) => d.estado !== 'sin_datos') && (
        <div className="rounded-2xl border border-cream/12 p-4">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-cream/50 mb-3">
            Tus 3 anuncios
          </p>
          <div className="space-y-3">
            {decision.decisiones.map((d) => (
              <div key={d.i} className="border-b border-cream/[0.06] pb-3 last:border-0 last:pb-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm text-cream/85">{d.nombre}</span>
                  <span className={`text-sm font-bold uppercase tracking-wider ${COLOR_ESTADO[d.estado]}`}>
                    {d.estado === 'sin_datos' ? 'sin datos'
                      : d.estado === 'midiendo' ? 'midiendo'
                      : d.estado === 'muerto' ? 'apagar'
                      : d.estado === 'ganador' ? 'ganador' : 'sigue'}
                  </span>
                </div>
                <p className="text-sm text-cream/55 mt-0.5">{d.porQue}</p>
                <p className="text-sm text-cream/75 mt-1">{d.queHacer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CON QUÉ REGLA SE TE MIDE — sin esto, el número no significa nada */}
      <div className="rounded-2xl border border-cream/15 p-4">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-cream/55 mb-2">
          Qué compra tu campaña
        </p>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {(Object.keys(UMBRALES) as ObjetivoCampana[]).map((o) => (
            <button key={o} onClick={() => cambiarObjetivo(o)}
              className={`rounded-lg px-2 py-2 text-sm font-semibold transition ${
                objetivo === o
                  ? 'bg-gold/20 border border-gold/50 text-gold'
                  : 'border border-cream/15 text-cream/60'}`}>
              {UMBRALES[o].etiqueta}
            </button>
          ))}
        </div>
        <p className="text-sm text-cream/70">
          Se te mide por <strong className="text-cream">costo por {u.unidad}</strong>.
          Sano entre ${u.sano[0].toFixed(2)} y ${u.sano[1].toFixed(2)} · se apaga arriba de ${u.alarma.toFixed(2)}.
        </p>
        <p className="text-sm text-cream/45 mt-1">{u.nota}</p>
      </div>

      {enMedicion ? (
        <div className="rounded-2xl border border-gold/25 bg-gold/[0.05] p-4">
          <p className="text-sm text-cream/85">⏳ <strong>Se mide, no se opina.</strong> Faltan {diasMedicion - diasCampana + 1} días para decidir. Hoy tu único trabajo es cargar y atender.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-cream/15 p-4">
          <p className="text-sm text-cream/85">✅ Pasaste los {diasMedicion} días: las reglas de abajo deciden. {diasCampana >= 21 ? 'Y ya toca refrescar el creativo del ganador — mismo esqueleto, otro hook.' : ''}</p>
        </div>
      )}

      {/* SU MARCADOR DE LOS 90 DÍAS */}
      <div className="rounded-2xl border border-gold/30 bg-gold/[0.05] p-5">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-gold/70 mb-2">
          Tus 90 días
        </p>
        <p className="text-lg text-cream leading-snug" style={{ fontFamily: 'var(--font-display)' }}>
          Para {objetivoVentas} ventas necesitas{' '}
          <span className="text-gold">{proyeccion.conversacionesNecesarias} conversaciones</span>
          {' '}por semana.
        </p>
        <p className="text-sm text-cream/70 mt-1">
          {convsEstaSemana === 0
            ? 'Esta semana todavía no cargaste ninguna.'
            : convsEstaSemana >= proyeccion.conversacionesNecesarias
              ? `Esta semana llevas ${convsEstaSemana}. Vas por encima.`
              : `Esta semana llevas ${convsEstaSemana}. Te faltan ${proyeccion.conversacionesNecesarias - convsEstaSemana}.`}
        </p>

        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            ['Agendas', proyeccion.agendasNecesarias],
            ['Llamadas', proyeccion.llamadasNecesarias],
            ['Inversión', `$${proyeccion.inversionNecesaria}`],
          ].map(([l, v]) => (
            <div key={String(l)} className="text-center">
              <p className="text-base text-cream">{v}</p>
              <p className="text-xs uppercase tracking-wider text-cream/40">{l}</p>
            </div>
          ))}
        </div>

        <p className="text-sm text-cream/45 mt-3">
          {proyeccion.usandoRealidad
            ? 'Calculado con TUS tasas reales, no con promedios.'
            : 'Con tasas de referencia. Cuando cargues unas semanas, se recalcula con las tuyas.'}
          {proyeccion.inversionTope
            ? ` Puedes llegar hasta $${proyeccion.inversionTope} por semana sin salirte de lo sano.`
            : ''}
        </p>
      </div>

      {/* LA BITÁCORA — qué se probó y qué pasó */}
      <div className="rounded-2xl border border-cream/12 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-cream/50">
              Lo que ya probaste
            </p>
            <p className="text-sm text-cream/50 mt-1">
              {resumen.semanas === 0
                ? 'Todavía no guardaste ninguna semana. Sin historia no se aprende de una a la otra.'
                : `${resumen.semanas} ${resumen.semanas === 1 ? 'semana' : 'semanas'} · $${resumen.gastoTotal} · ${resumen.ventasTotal} ventas`}
            </p>
          </div>
          <button onClick={guardarEnBitacora}
            className="text-sm font-bold text-gold hover:text-goldhi shrink-0">
            Guardar esta semana
          </button>
        </div>

        {resumen.semanas > 0 && (
          <>
            <div className="mt-3 space-y-1">
              {resumen.costoVentaAcumulado !== null && (
                <p className="text-sm text-cream/80">
                  Cada venta te costó <strong className="text-gold">
                    ${resumen.costoVentaAcumulado.toFixed(0)}
                  </strong> en promedio.
                </p>
              )}
              {resumen.mejorFormula && (
                <p className="text-sm text-cream/80">
                  La que más te funciona es <strong className="text-success">
                    {resumen.mejorFormula.formula}
                  </strong> ({resumen.mejorFormula.veces} {resumen.mejorFormula.veces === 1 ? 'vez' : 'veces'}).
                </p>
              )}
              {resumen.formulasQueFallaron.length > 0 && (
                <p className="text-sm text-cream/70">
                  Ya probaste sin resultado: {resumen.formulasQueFallaron.join(', ')}.
                  No vale la pena repetirlas.
                </p>
              )}
            </div>

            <button onClick={() => setVerHistoria((v) => !v)}
              className="text-sm text-cream/40 underline underline-offset-2 mt-3">
              {verHistoria ? 'Ocultar el detalle' : 'Ver semana por semana'}
            </button>

            {verHistoria && (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs uppercase tracking-wider text-cream/40">
                      <th className="text-left font-semibold py-1.5">Semana</th>
                      <th className="text-left font-semibold py-1.5">Qué se probó</th>
                      <th className="text-right font-semibold py-1.5">Por conversación</th>
                      <th className="text-right font-semibold py-1.5">Ventas</th>
                      <th className="text-right font-semibold py-1.5">Resultado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filasBitacora.map((f) => (
                      <tr key={`${f.semana}-${f.indice}`} className="border-t border-cream/[0.06]">
                        <td className="py-1.5 text-cream/60">{f.semana}</td>
                        <td className="py-1.5 text-cream/80">{f.formula}</td>
                        <td className="py-1.5 text-right text-cream/70">
                          {f.costoConversacion === null ? '—' : `$${f.costoConversacion.toFixed(2)}`}
                          {f.tendencia === 'mejora' && <span className="text-success ml-1">↓</span>}
                          {f.tendencia === 'empeora' && <span className="text-danger ml-1">↑</span>}
                        </td>
                        <td className="py-1.5 text-right text-cream/70">{f.ventas || '—'}</td>
                        <td className={`py-1.5 text-right ${COLOR_ESTADO[f.estado] ?? 'text-cream/50'}`}>
                          {f.estado === 'ganador' ? 'ganó'
                            : f.estado === 'muerto' ? 'se apagó'
                            : f.estado === 'midiendo' ? 'midiendo' : 'siguió'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-sm text-cream/35 mt-2">
                  La flecha compara cada anuncio contra su propia semana anterior, no contra los otros.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* CARGA DIARIA */}
      <div className="card-panel p-4">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-cream/60 mb-2">Hoy · 30 segundos</p>
        <div className="flex items-center gap-3">
          <input inputMode="numeric" value={convHoy} onChange={(e) => setConvHoy(e.target.value)}
            placeholder="0"
            className="w-24 bg-surface/40 border border-cream/10 rounded-xl px-3 py-2 text-lg text-cream text-center focus:border-gold/40 outline-none" />
          <p className="text-sm text-cream/70 flex-1">conversaciones nuevas (comentarios con tu PALABRA + DMs)</p>
          <button onClick={guardarDia}
            className="btn-primary text-sm font-bold px-4 py-2 rounded-xl shrink-0">
            {guardado ? 'Guardado ✓' : 'Guardar'}
          </button>
        </div>
        {racha > 0 && (
          <p className="text-sm text-cream/50 mt-2">
            {racha === 1
              ? 'Primer día cargado. Mañana son dos.'
              : `${racha} días seguidos cargando. Esto es lo que hace que el tablero sirva.`}
          </p>
        )}
      </div>

      {/* CARGA DEL VIERNES — de a un dato por pantalla */}
      <div className="card-panel p-4">
        <div className="flex items-start justify-between gap-3 mb-1">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-cream/60">
            El viernes · 2 minutos
          </p>
          <button onClick={() => setVerTabla((v) => !v)}
            className="text-xs text-cream/40 underline underline-offset-2 shrink-0">
            {verTabla ? 'Guiado' : 'Ver la tabla'}
          </button>
        </div>

        {verTabla ? (
          <>
            <p className="text-sm text-cream/50 mb-3">
              Los números salen del administrador de anuncios y de tu calendario.
            </p>
            {semana.map((f, i) => {
              const v = veredicto(f);
              return (
                <div key={i} className="rounded-xl border border-cream/10 p-3 mb-2">
                  <p className="text-sm font-bold text-cream mb-2">Anuncio {i + 1}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PASOS.map((ps) => (
                      <div key={ps.k}>
                        <p className="text-xs text-cream/45 mb-1">
                          {ps.k === 'gasto' ? 'Gasto USD' : ps.k === 'visitas' ? 'Alcance'
                            : ps.k === 'conversaciones' ? 'Conversaciones'
                            : ps.k === 'agendas' ? 'Agendas' : 'Ventas'}
                        </p>
                        <input inputMode="decimal" value={f[ps.k]}
                          onChange={(e) => setFila(i, ps.k, e.target.value)}
                          className="w-full bg-surface/40 border border-cream/10 rounded-lg px-2 py-1.5 text-sm text-cream" />
                      </div>
                    ))}
                  </div>
                  {v && <p className={`text-sm mt-2 leading-relaxed ${v.color}`}>{v.texto}</p>}
                </div>
              );
            })}
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5 mb-3">
              {PASOS.map((_, i) => (
                <span key={i} className={`h-1 flex-1 rounded-full ${
                  i < paso ? 'bg-success/60' : i === paso ? 'bg-gold' : 'bg-cream/12'}`} />
              ))}
            </div>

            <p className="text-lg text-cream leading-snug" style={{ fontFamily: 'var(--font-display)' }}>
              {PASOS[paso].titulo}
            </p>
            <p className="text-sm text-cream/55 mt-1">{PASOS[paso].ayuda}</p>
            <p className="text-sm text-gold/75 mt-1">{PASOS[paso].donde}</p>

            <div className="space-y-2 mt-4">
              {semana.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm text-cream/55 w-20 shrink-0">Anuncio {i + 1}</span>
                  <input
                    inputMode="decimal"
                    value={f[PASOS[paso].k]}
                    onChange={(e) => setFila(i, PASOS[paso].k, e.target.value)}
                    placeholder="0"
                    className="flex-1 bg-surface/40 border border-cream/15 rounded-xl px-4 py-3 text-xl text-cream text-center" />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-4">
              {paso > 0 && (
                <button onClick={() => setPaso((p) => p - 1)}
                  className="px-4 py-2.5 rounded-xl border border-cream/15 text-cream/70 text-sm">
                  Atrás
                </button>
              )}
              {paso < PASOS.length - 1 ? (
                <button onClick={() => setPaso((p) => p + 1)}
                  className="flex-1 btn-primary py-2.5 rounded-xl text-sm font-bold">
                  Siguiente
                </button>
              ) : (
                <button onClick={() => setVerTabla(true)}
                  className="flex-1 btn-primary py-2.5 rounded-xl text-sm font-bold">
                  Ver el veredicto
                </button>
              )}
            </div>
            <p className="text-sm text-cream/35 mt-2">
              Se guarda solo a medida que escribes. Puedes salir y volver.
            </p>
          </>
        )}

        {totalSemana > 0 && (
          <p className="text-sm text-cream/45 mt-1">La cuenta de los 10: ~5 conversaciones por día te dan las ~300 del mes — de ahí salen tus agendas y tus llamadas.</p>
        )}
      </div>
    </div>
  );
}
