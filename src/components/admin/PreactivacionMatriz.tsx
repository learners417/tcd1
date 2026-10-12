import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Loader2, RefreshCw, Search, CheckCircle2, Map as MapIcon, LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';
import {
  loadAllChecks,
  setCheck,
  applyToggle,
  type ChecksByCliente,
} from '../../lib/preactivacionCheck';
import { loadExtras, saveExtra, type ExtrasByCliente, type EstadoCelda } from '../../lib/matrizExtras';
import { avanceDelCuadro, noIncluye } from '../../lib/avanceDelCuadro';
import { servicioDe } from '../../lib/cuadroTickets';
import { isChecked } from '../../lib/preactivacionCheck';
import MatrizGrid, { type MatrizClienteRow } from './preactivacion/MatrizGrid';
import UnClienteALaVez from './preactivacion/UnClienteALaVez';
import ElCaminoView from './preactivacion/ElCaminoView';

type View = 'matriz' | 'camino';

interface Cliente {
  id: string;
  nombre: string;
  especialidad?: string;
  /** Qué contrató. Decide cuáles de los 62 ítems le aplican de verdad. */
  servicio_contratado?: string | null;
}

interface PreactivacionMatrizProps {
  clientes: Cliente[];
  adminId: string;
}

export default function PreactivacionMatriz({ clientes, adminId }: PreactivacionMatrizProps) {
  // L4 · Doble alimentación: las sesiones completadas del Camino tildan solas
  const [caminoDone, setCaminoDone] = React.useState<Map<string, Set<string>>>(new Map());
  React.useEffect(() => {
    (async () => {
      const { supabase } = await import('../../lib/supabase');
      if (!supabase) return;
      const { data } = await supabase.from('hoja_de_ruta').select('usuario_id, meta_codigo, completada');
      const m = new Map<string, Set<string>>();
      for (const t of data ?? []) {
        if (!t.completada) continue;
        if (!m.has(t.usuario_id)) m.set(t.usuario_id, new Set());
        m.get(t.usuario_id)!.add(t.meta_codigo);
      }
      setCaminoDone(m);
    })();
  }, []);
  const [view, setView] = useState<View>('matriz');

  /**
   * El cliente que se está viendo en el teléfono.
   *
   * En la matriz se ven todos a la vez; en la lista, uno. Arranca en el
   * primero en vez de vacío: una pantalla que pide elegir antes de mostrar
   * nada es un paso de más para algo que casi siempre es «el que vengo
   * trabajando».
   */
  const [clienteEnPantalla, setClienteEnPantalla] = useState<string>('');

  /** Qué ítems no le aplican, con la MISMA cuenta que usa la matriz. */
  const noAplicaDe = (servicio?: string | null) => noIncluye(servicioDe(servicio));

  /** La nota y el link de un ítem. El mismo flujo que en la matriz. */
  const pedirNotaYLink = (clienteId: string, stepId: string, titulo: string) => {
    const actual = extras.get(clienteId)?.get(stepId) ?? {};
    const link = window.prompt(`Link para «${titulo}» (Drive, doc, página, calendario). Vacío para quitarlo:`, actual.link ?? '');
    if (link === null) return;
    const nota = window.prompt(`Nota para «${titulo}» (qué falta, quién quedó a cargo). Vacío para quitarla:`, actual.nota ?? '');
    if (nota === null) { guardarExtra(clienteId, stepId, { link: link.trim() }); return; }
    guardarExtra(clienteId, stepId, { link: link.trim(), nota: nota.trim() });
  };
  const [checks, setChecks] = useState<ChecksByCliente>(new Map());
  // Los estados, notas y links de cada celda. Viven acá y no en la grilla
  // porque el cartel de arriba los necesita para contar igual que ella.
  const [extras, setExtras] = useState<ExtrasByCliente>(new Map());
  useEffect(() => { void loadExtras().then(setExtras).catch(() => { /* la grilla igual anda */ }); }, []);

  /**
   * Guarda el estado, la nota o el link de una celda.
   *
   * Si la base lo rechaza se avisa y se vuelve atrás en pantalla: antes esto
   * fallaba en silencio y lo cargado quedaba solo en el navegador de quien lo
   * escribió, aunque la pantalla lo prometiera compartido.
   */
  const guardarExtra = (clienteId: string, stepId: string, cambio: { estado?: EstadoCelda; nota?: string; link?: string }) => {
    const antes = extras;
    setExtras((prev) => {
      const n = new Map(prev);
      const m = new Map(n.get(clienteId) ?? []);
      m.set(stepId, { ...m.get(stepId), ...cambio });
      n.set(clienteId, m);
      return n;
    });
    void saveExtra(clienteId, stepId, cambio).catch((err: unknown) => {
      setExtras(antes);
      toast.error(err instanceof Error ? err.message : 'No se pudo guardar.');
    });
  };
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await loadAllChecks();
        if (alive) setChecks(data);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        toast.error(msg);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  async function refresh() {
    setRefreshing(true);
    try {
      const data = await loadAllChecks();
      setChecks(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      toast.error(msg);
    } finally {
      setRefreshing(false);
    }
  }

  async function handleToggle(clienteId: string, stepId: string, on: boolean) {
    // Optimistic update
    const prev = checks;
    setChecks(applyToggle(prev, clienteId, stepId, on));
    try {
      await setCheck(clienteId, stepId, on, adminId);
    } catch (err) {
      setChecks(prev);
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      toast.error(msg);
    }
  }

  const rows = useMemo<MatrizClienteRow[]>(() => {
    const q = search.trim().toLowerCase();
    return clientes
      .filter((c) => !q || c.nombre.toLowerCase().includes(q))
      .map<MatrizClienteRow>((c) => ({
        id: c.id,
        nombre: c.nombre,
        metodo: c.especialidad,
        initial: c.nombre.charAt(0).toUpperCase(),
        servicio: c.servicio_contratado,
      }));
  }, [clientes, search]);

  /**
   * El cliente de la lista del teléfono.
   *
   * Si el elegido se cae del filtro de búsqueda, se pasa al primero que quedó
   * en vez de dejar la pantalla vacía: buscar no debería borrar lo que se
   * estaba mirando.
   */
  const elegido = useMemo(
    () => rows.find((c) => c.id === clienteEnPantalla) ?? rows[0],
    [rows, clienteEnPantalla],
  );

  /**
   * El cartel cuenta IGUAL que la grilla.
   *
   * Antes contaba solo las filas tildadas en la base, mientras la grilla
   * sumaba además los tildes automáticos del Camino y las celdas puestas en
   * «listo» a mano. Dos números distintos para el mismo cliente, en la misma
   * pantalla, enseñan a no creerle a ninguno de los dos.
   */
  const stats = useMemo(() => {
    const total = clientes.length;
    let listos = 0;
    let sumaPct = 0;
    for (const c of clientes) {
      const a = avanceDelCuadro({
        tildados: checks.get(c.id),
        delCamino: caminoDone.get(c.id),
        estados: extras.get(c.id),
        servicio: c.servicio_contratado,
      });
      if (a.total > 0 && a.hechos === a.total) listos += 1;
      sumaPct += a.pct;
    }
    const avgPct = total === 0 ? 0 : Math.round(sumaPct / total);
    return { total, listos, avgPct };
  }, [clientes, checks, caminoDone, extras]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 px-4 md:px-6 py-3 border-b border-[rgba(255,255,255,0.05)] shrink-0">
        {/* View toggle */}
        <div className="inline-flex p-1 rounded-xl bg-[#0F0F0F] border border-gold/10">
          <button
            type="button"
            onClick={() => setView('matriz')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              view === 'matriz'
                ? 'bg-gold/15 text-gold'
                : 'text-cream/65 hover:text-cream/80'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Matriz
          </button>
          <button
            type="button"
            onClick={() => setView('camino')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              view === 'camino'
                ? 'bg-gold/15 text-gold'
                : 'text-cream/65 hover:text-cream/80'
            }`}
          >
            <MapIcon className="w-4 h-4" />
            El Camino
          </button>
        </div>

        {view === 'matriz' && (
          <>
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/45" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar cliente..."
                className="w-full bg-black/30 border border-gold/12 rounded-lg py-2.5 pl-10 pr-3 text-sm text-cream focus:outline-none focus:border-gold/50 transition-all"
              />
            </div>

            {/* Stats */}
            <div className="hidden md:flex items-center gap-5 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-sm text-cream/55 uppercase tracking-wider font-semibold">Clientes</span>
                <span className="text-cream font-bold text-base">{stats.total}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-cream/55 uppercase tracking-wider font-semibold">Listos</span>
                <span className="text-success font-bold text-base">{stats.listos}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-cream/55 uppercase tracking-wider font-semibold">Avance</span>
                <span className="text-gold font-bold text-base">{stats.avgPct}%</span>
              </div>
            </div>

            <button
              type="button"
              onClick={refresh}
              disabled={refreshing}
              className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg border border-gold/12 text-sm font-semibold text-gold hover:bg-gold/10 transition-all disabled:opacity-50"
              title="Refrescar"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refrescar
            </button>
          </>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {view === 'camino' ? (
          <ElCaminoView clientes={rows} checks={checks} onToggle={handleToggle} caminoDone={caminoDone} />
        ) : loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-6 h-6 text-gold animate-spin" />
          </div>
        ) : (
          <div className="px-4 md:px-6 py-4">
            {/* ── QUIÉN DECIDE QUE UNA CAMPAÑA PUEDE ENCENDER ──

                Este cartel decía «clientes listos para activar», y esta
                pantalla no mide eso. Mide las 62 tareas de preparación del
                equipo. Lo que decide el encendido son los 8 candados del
                Montaje, y cada uno se tilda porque SU DATO está cargado: el
                píxel con su id, el dominio verificado, el formulario probado.

                Dos listas que dicen «listo» sobre el mismo cliente, con dos
                varas distintas, enseñan a no creerle a ninguna. Así que esta
                dice lo que de verdad sabe, y nombra a la otra. */}
            {stats.listos > 0 && (
              <div className="mb-4 px-4 py-2.5 rounded-lg bg-success/8 border border-success/20 w-fit max-w-full">
                <p className="flex items-center gap-2 text-sm font-semibold text-success">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    {stats.listos} {stats.listos === 1 ? 'cliente' : 'clientes'} con
                    {' '}{stats.listos === 1 ? 'su' : 'todo su'} trabajo de preparación al día
                  </span>
                </p>
                <p className="mt-1 text-sm text-cream/60">
                  Encender se decide en el Montaje: ahí están los 8 candados, y
                  cada uno se tilda solo cuando su dato está cargado.
                </p>
              </div>
            )}
            {/* ── DOS VISTAS PARA DOS PREGUNTAS DISTINTAS ──

                La matriz cruza clientes × 62 ítems y contesta «quién está
                trabado»: se compara una fila contra otra. Es la forma correcta
                en una computadora.

                En un teléfono no hay forma de que funcione, y no es cuestión
                de letra ni de scroll: 62 columnas en 390 px son 62 columnas de
                6 px. Así que ahí se muestra un cliente a la vez, con sus
                bloques uno debajo del otro, y solo se desliza para abajo. La
                pregunta que contesta es «qué le falta a este». */}
            <div className="hidden lg:block">
              <MatrizGrid
                clientes={rows}
                checks={checks}
                onToggle={handleToggle}
                caminoDone={caminoDone}
                extras={extras}
                onExtra={guardarExtra}
              />
            </div>

            <div className="lg:hidden">
              <label className="block mb-4">
                <span className="block text-[17px] font-medium text-cream/80 mb-1.5">
                  Qué cliente
                </span>
                <select
                  value={clienteEnPantalla}
                  onChange={(e) => setClienteEnPantalla(e.target.value)}
                  className="min-h-[52px] w-full rounded-xl border border-cream/20 bg-espresso/60 px-4 text-[17px] text-cream"
                >
                  {rows.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </label>

              {elegido && (
                <UnClienteALaVez
                  cliente={{
                    id: elegido.id,
                    nombre: elegido.nombre,
                    noLeAplica: (stepId) => noAplicaDe(elegido.servicio).has(stepId),
                    porElCamino: (step) => Boolean(step.meta && caminoDone.get(elegido.id)?.has(step.meta)),
                    extra: (stepId) => extras.get(elegido.id)?.get(stepId) ?? {},
                    tildado: (stepId) => isChecked(checks, elegido.id, stepId),
                  }}
                  onEstado={(stepId, estado) => {
                    // El tilde de la base sigue al estado: así el porcentaje y
                    // el cartel de arriba cuentan lo mismo que esta lista.
                    if (estado === 'listo') handleToggle(elegido.id, stepId, true);
                    else if ((extras.get(elegido.id)?.get(stepId)?.estado ?? 'pendiente') === 'listo') {
                      handleToggle(elegido.id, stepId, false);
                    }
                    guardarExtra(elegido.id, stepId, { estado });
                  }}
                  onDetalle={(stepId, titulo) => pedirNotaYLink(elegido.id, stepId, titulo)}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
