import React, { useMemo, useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { SECTIONS, STEPS, TOTAL_STEPS, RESPONSABLE_SIGLA, RESPONSABLE_LABEL } from '../../../lib/preactivacionSteps';
import { type ExtrasByCliente, type EstadoCelda, extraDe, saveExtra, loadExtras, SIGUIENTE_ESTADO, ESTADO_LABEL } from '../../../lib/matrizExtras';
import {
  type ChecksByCliente,
  isChecked,
} from '../../../lib/preactivacionCheck';

export interface MatrizClienteRow {
  id: string;
  nombre: string;
  metodo?: string;
  initial: string;
}

interface MatrizGridProps {
  clientes: MatrizClienteRow[];
  checks: ChecksByCliente;
  onToggle: (clienteId: string, stepId: string, on: boolean) => void;
  caminoDone?: Map<string, Set<string>>;
}

type Orden = 'atrasados' | 'avanzados' | 'nombre';

export default function MatrizGrid({ clientes, checks, onToggle, caminoDone }: MatrizGridProps) {
  const [seccion, setSeccion] = useState<string>('todas');
  const [extras, setExtras] = useState<ExtrasByCliente>(new Map());
  React.useEffect(() => { void loadExtras().then(setExtras); }, []);

  const aplicar = (clienteId: string, stepId: string, cambio: { estado?: EstadoCelda; nota?: string; link?: string }) => {
    setExtras((prev) => {
      const n = new Map(prev);
      const m = new Map(n.get(clienteId) ?? []);
      m.set(stepId, { ...m.get(stepId), ...cambio });
      n.set(clienteId, m);
      return n;
    });
    void saveExtra(clienteId, stepId, cambio);
  };
  const pedirDetalle = (clienteId: string, stepId: string, titulo: string) => {
    const actual = extraDe(extras, clienteId, stepId);
    const link = window.prompt(`Link para «${titulo}» (Drive, doc, página, calendario). Vacío para quitarlo:`, actual.link ?? '');
    if (link === null) return;
    const nota = window.prompt(`Nota para «${titulo}» (qué falta, quién quedó a cargo). Vacío para quitarla:`, actual.nota ?? '');
    if (nota === null) { aplicar(clienteId, stepId, { link: link.trim() }); return; }
    aplicar(clienteId, stepId, { link: link.trim(), nota: nota.trim() });
  };
  const [orden, setOrden] = useState<Orden>('atrasados');
  const scroller = useRef<HTMLDivElement | null>(null);
  const arrastre = useRef<{ x: number; left: number } | null>(null);

  /** Solo las columnas de la sección elegida — de 32 a las justas. */
  const pasos = useMemo(
    () => (seccion === 'todas' ? STEPS : STEPS.filter((p) => p.sectionId === seccion)),
    [seccion],
  );
  const secciones = useMemo(
    () => (seccion === 'todas' ? SECTIONS : SECTIONS.filter((sec) => sec.id === seccion)),
    [seccion],
  );

  /** Quién está más atrasado primero: el orden que sirve para trabajar. */
  const filas = useMemo(() => {
    const c = [...clientes];
    if (orden === 'nombre') return c.sort((a, b) => a.nombre.localeCompare(b.nombre));
    const pctDe = (id: string) => {
      const m = extras.get(id);
      let l = 0, na = 0;
      for (const p of STEPS) {
        const auto = Boolean(p.meta && caminoDone?.get(id)?.has(p.meta));
        const e = m?.get(p.id)?.estado;
        if (e === 'na') { na++; continue; }
        if (auto || isChecked(checks, id, p.id) || e === 'listo') l++;
      }
      return Math.round((l / Math.max(1, TOTAL_STEPS - na)) * 100);
    };
    c.sort((a, b) => pctDe(a.id) - pctDe(b.id));
    return orden === 'avanzados' ? c.reverse() : c;
  }, [clientes, orden, checks, extras, caminoDone]);

  /** Cuántos clientes tienen cada paso — el cuello de botella a simple vista. */
  const totalPorPaso = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of pasos) {
      let n = 0;
      for (const cl of clientes) {
        const auto = Boolean(p.meta && caminoDone?.get(cl.id)?.has(p.meta));
        const ex = extras.get(cl.id)?.get(p.id);
        if (auto || isChecked(checks, cl.id, p.id) || ex?.estado === 'listo' || ex?.estado === 'na') n++;
      }
      m.set(p.id, n);
    }
    return m;
  }, [pasos, clientes, checks, caminoDone, extras]);

  const mover = (dir: -1 | 1) => scroller.current?.scrollBy({ left: dir * 420, behavior: 'smooth' });

  if (clientes.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-cream/55 text-sm">
        Sin clientes que coincidan
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <style>{`
        .matriz-scroll::-webkit-scrollbar { height: 14px; width: 14px; }
        .matriz-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.04); border-radius: 8px; }
        .matriz-scroll::-webkit-scrollbar-thumb { background: rgba(232,150,46,0.45); border-radius: 8px; border: 3px solid transparent; background-clip: content-box; }
        .matriz-scroll::-webkit-scrollbar-thumb:hover { background: rgba(232,150,46,0.75); background-clip: content-box; }
        .matriz-scroll { scrollbar-color: rgba(232,150,46,0.5) rgba(255,255,255,0.05); scrollbar-width: auto; }
      `}</style>

      {/* Barra: secciones · orden · flechas */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button type="button" onClick={() => setSeccion('todas')}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold uppercase tracking-wider border transition-colors ${seccion === 'todas' ? 'border-gold/60 bg-gold/10 text-gold' : 'border-cream/12 text-cream/60 hover:border-cream/30'}`}>
            Todas · {TOTAL_STEPS}
          </button>
          {SECTIONS.map((sec) => (
            <button key={sec.id} type="button" onClick={() => setSeccion(sec.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold uppercase tracking-wider border transition-colors ${seccion === sec.id ? 'border-gold/60 bg-gold/10 text-gold' : 'border-cream/12 text-cream/60 hover:border-cream/30'}`}
              title={sec.title}>
              {sec.short} · {sec.items.length}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <select value={orden} onChange={(e) => setOrden(e.target.value as Orden)}
            className="bg-surface/50 border border-cream/12 rounded-lg px-2.5 py-1.5 text-sm text-cream/80 outline-none focus:border-gold/40">
            <option value="atrasados">Más atrasados primero</option>
            <option value="avanzados">Más avanzados primero</option>
            <option value="nombre">Por nombre</option>
          </select>
          {seccion === 'todas' && (
            <>
              <button type="button" onClick={() => mover(-1)} title="Ver columnas anteriores"
                className="p-1.5 rounded-lg border border-cream/12 text-cream/60 hover:border-gold/50 hover:text-gold"><ChevronLeft className="w-4 h-4" /></button>
              <button type="button" onClick={() => mover(1)} title="Ver más columnas"
                className="p-1.5 rounded-lg border border-cream/12 text-cream/60 hover:border-gold/50 hover:text-gold"><ChevronRight className="w-4 h-4" /></button>
            </>
          )}
        </div>
      </div>

      <p className="text-sm text-cream/40">
        {seccion === 'todas' ? 'Arrastra la tabla con el mouse, usa la barra de abajo o Shift + rueda para moverte entre las 32 columnas.' : `Viendo solo ${SECTIONS.find((x) => x.id === seccion)?.title ?? ''}.`}
        {' '}Toca una celda para pasar de Pendiente → En proceso (•) → Listo (✓) → No aplica (–). El tilde dorado es automático: ya lo hizo en su Camino. Con ＋ pegas link y nota; con 🔗 clic derecho lo abres. La sigla dice quién lo hace: C cliente · A agencia · C+A ambos.</p>

    <div
      ref={scroller}
      className="matriz-scroll overflow-auto cursor-grab active:cursor-grabbing"
      style={{ height: 'calc(100vh - 250px)', minHeight: 380 }}
      onWheel={(e) => { if (e.shiftKey && scroller.current) { scroller.current.scrollLeft += e.deltaY; } }}
      onMouseDown={(e) => { if ((e.target as HTMLElement).closest('button')) return; arrastre.current = { x: e.clientX, left: scroller.current?.scrollLeft ?? 0 }; }}
      onMouseMove={(e) => { if (arrastre.current && scroller.current) scroller.current.scrollLeft = arrastre.current.left - (e.clientX - arrastre.current.x); }}
      onMouseUp={() => { arrastre.current = null; }}
      onMouseLeave={() => { arrastre.current = null; }}
    >
      <table
        className="border-separate"
        style={{ borderSpacing: 0, fontSize: 14 }}
      >
        <thead>
          {/* Group row */}
          <tr>
            <th
              className="sticky left-0 top-0 z-50 bg-[#0E0E0E]"
              style={{ minWidth: 240 }}
            />
            {secciones.map((sec, idx) => (
              <th
                key={sec.id}
                colSpan={sec.items.length}
                className="sticky top-0 z-30 bg-panel text-gold uppercase tracking-widest"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  padding: '10px 0',
                  textAlign: 'center',
                  borderBottom: '1px solid rgba(232,150,46,0.10)',
                  borderLeft: idx === 0 ? 'none' : '2px solid var(--matrix-section-divider)',
                }}
              >
                {sec.short}
              </th>
            ))}
            <th
              className="sticky right-0 top-0 z-40 bg-panel text-gold"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1.5,
                padding: '10px 10px',
                textAlign: 'center',
                borderBottom: '1px solid rgba(232,150,46,0.10)',
                borderLeft: '2px solid var(--matrix-section-divider)',
                textTransform: 'uppercase',
              }}
            >
              %
            </th>
          </tr>

          {/* Column labels */}
          <tr>
            <th
              className="sticky left-0 z-40 bg-[#0E0E0E]"
              style={{
                top: 40,
                minWidth: 240,
                borderBottom: '2px solid rgba(232,150,46,0.10)',
              }}
            />
            {pasos.map((step, idx) => {
              const isFirstOfSection =
                idx === 0 || pasos[idx - 1].sectionId !== step.sectionId;
              return (
                <th
                  key={step.id}
                  className="sticky z-20 bg-[#0F0F0F]"
                  style={{
                    top: 40,
                    padding: '10px 8px 12px',
                    fontWeight: 500,
                    verticalAlign: 'bottom',
                    borderBottom: '2px solid rgba(232,150,46,0.10)',
                    borderLeft: isFirstOfSection ? '2px solid var(--matrix-section-divider)' : 'none',
                  }}
                  title={step.title}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 12,
                      fontWeight: 500,
                      color: 'var(--matrix-header-text)',
                      lineHeight: 1.3,
                      textAlign: 'center',
                      minWidth: 84,
                      whiteSpace: 'pre-line',
                      wordBreak: 'keep-all',
                    }}
                  >
                    {step.lbl}
                  </div>
                  <div style={{ fontSize: 9, textAlign: 'center', marginTop: 3, letterSpacing: 0.5, color: step.quien === 'cliente' ? 'rgba(232,150,46,0.75)' : step.quien === 'ambos' ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.28)' }}>
                    {RESPONSABLE_SIGLA[step.quien]}
                  </div>
                </th>
              );
            })}
            <th
              className="sticky right-0 z-30 bg-[#0F0F0F]"
              style={{
                top: 40,
                padding: '10px 12px 12px',
                borderBottom: '2px solid rgba(232,150,46,0.10)',
                borderLeft: '2px solid var(--matrix-section-divider)',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'var(--matrix-header-text)',
                  textAlign: 'center',
                }}
              >
                Total
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          {filas.map((cl) => {
            // Como en la planilla: lo que no aplica no cuenta en el total.
            const mapa = extras.get(cl.id);
            let listos = 0, naCount = 0;
            for (const p of STEPS) {
              const auto = Boolean(p.meta && caminoDone?.get(cl.id)?.has(p.meta));
              const e = mapa?.get(p.id)?.estado;
              if (e === 'na') { naCount++; continue; }
              if (auto || isChecked(checks, cl.id, p.id) || e === 'listo') listos++;
            }
            const base = Math.max(1, TOTAL_STEPS - naCount);
            const pct = Math.round((listos / base) * 100);
            const done = listos;
            const isComplete = pct === 100;
            return (
              <tr key={cl.id} className="group">
                {/* Sticky client cell */}
                <td
                  className="sticky left-0 z-30 bg-ink group-hover:bg-panel transition-colors"
                  style={{
                    padding: '0 14px',
                    height: 56,
                    borderBottom: '1px solid var(--matrix-row-divider)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="rounded-md flex items-center justify-center shrink-0"
                      style={{
                        width: 36,
                        height: 36,
                        background: 'rgba(232,150,46,0.12)',
                        color: 'var(--color-gold)',
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      {cl.initial}
                    </div>
                    <div className="min-w-0">
                      <div
                        className="truncate font-semibold"
                        style={{ maxWidth: 175, fontSize: 14 }}
                        title={cl.nombre}
                      >
                        {cl.nombre}
                      </div>
                      {cl.metodo && (
                        <div
                          className="truncate"
                          style={{
                            color: 'var(--matrix-subtitle-text)',
                            fontSize: 12,
                            maxWidth: 175,
                          }}
                        >
                          {cl.metodo}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {pasos.map((step, idx) => {
                  const isFirstOfSection =
                    idx === 0 || pasos[idx - 1].sectionId !== step.sectionId;
                  const autoCamino = Boolean(step.meta && caminoDone?.get(cl.id)?.has(step.meta));
                  const on = autoCamino || isChecked(checks, cl.id, step.id);
                  return (
                    <td
                      key={step.id}
                      className="group-hover:bg-panel transition-colors"
                      style={{
                        padding: 0,
                        textAlign: 'center',
                        verticalAlign: 'middle',
                        height: 62,
                        borderBottom: '1px solid var(--matrix-row-divider)',
                        borderLeft: isFirstOfSection
                          ? '2px solid var(--matrix-section-divider)'
                          : '1px solid var(--matrix-cell-divider)',
                      }}
                    >
                      {(() => {
                        const ex = extraDe(extras, cl.id, step.id);
                        const estado: EstadoCelda = autoCamino || on ? 'listo' : (ex.estado ?? 'pendiente');
                        const color = estado === 'listo' ? 'var(--color-success)' : estado === 'proceso' ? 'var(--color-gold)' : estado === 'na' ? 'rgba(255,255,255,0.22)' : 'var(--matrix-checkbox-off)';
                        const relleno = estado === 'listo' ? 'var(--color-success)' : estado === 'proceso' ? 'rgba(232,150,46,0.22)' : 'transparent';
                        const avanzar = () => {
                          if (autoCamino) return;
                          const siguiente = SIGUIENTE_ESTADO[estado];
                          if (siguiente === 'listo') onToggle(cl.id, step.id, true);
                          if (estado === 'listo') onToggle(cl.id, step.id, false);
                          aplicar(cl.id, step.id, { estado: siguiente });
                        };
                        return (
                          <div className="flex flex-col items-center gap-0.5">
                            <button
                              type="button"
                              onClick={avanzar}
                              title={autoCamino
                                ? `${step.title} — ✓ completado en El Camino (automático)`
                                : `${step.title}\n${RESPONSABLE_LABEL[step.quien]} · ${ESTADO_LABEL[estado]} — toca para pasar a ${ESTADO_LABEL[SIGUIENTE_ESTADO[estado]]}${ex.nota ? '\nNota: ' + ex.nota : ''}`}
                              className="inline-flex items-center justify-center transition-all hover:border-gold/60"
                              style={{
                                width: 30, height: 30, borderRadius: 7,
                                border: `2px solid ${autoCamino ? 'var(--color-gold)' : color}`,
                                background: autoCamino ? 'var(--color-gold)' : relleno,
                                cursor: autoCamino ? 'default' : 'pointer',
                              }}
                            >
                              {estado === 'listo' && <Check className="w-4 h-4" style={{ color: 'var(--color-ink)', strokeWidth: 3 }} />}
                              {estado === 'proceso' && <span style={{ fontSize: 13, color: 'var(--color-gold)', fontWeight: 700, lineHeight: 1 }}>•</span>}
                              {estado === 'na' && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1 }}>–</span>}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); pedirDetalle(cl.id, step.id, step.title); }}
                              onContextMenu={(e) => { if (ex.link) { e.preventDefault(); window.open(ex.link, '_blank'); } }}
                              title={ex.link ? `Abrir: ${ex.link}  ·  (clic para editar)` : ex.nota ? `Nota: ${ex.nota}  ·  (clic para editar)` : 'Pegar un link o una nota'}
                              className="leading-none"
                              style={{ fontSize: 10, color: ex.link ? 'var(--color-gold)' : ex.nota ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.16)' }}
                            >
                              {ex.link ? '🔗' : ex.nota ? '📝' : '＋'}
                            </button>
                          </div>
                        );
                      })()}
                    </td>
                  );
                })}

                {/* Sticky total */}
                <td
                  className="sticky right-0 z-10 bg-ink group-hover:bg-panel transition-colors"
                  style={{
                    padding: '0 12px',
                    height: 56,
                    borderBottom: '1px solid var(--matrix-row-divider)',
                    borderLeft: '2px solid var(--matrix-section-divider)',
                    textAlign: 'center',
                    fontSize: 14,
                    minWidth: 84,
                    color: isComplete ? 'var(--color-success)' : 'var(--matrix-pct-text)',
                    fontWeight: isComplete ? 700 : 500,
                  }}
                  title={`${done} de ${TOTAL_STEPS - naCount} que aplican${naCount ? ` · ${naCount} N/A` : ''}`}
                >
                  {pct}%
                </td>
              </tr>
            );
          })}
        </tbody>

        {/* Totales por paso: dónde se traba TODO el mundo */}
        <tfoot>
          <tr>
            <td
              className="sticky left-0 bottom-0 z-30 bg-[#0E0E0E]"
              style={{ padding: '0 14px', height: 46, borderTop: '2px solid rgba(232,150,46,0.14)' }}
            >
              <span className="text-sm font-bold uppercase tracking-widest text-gold">Cuántos lo tienen</span>
            </td>
            {pasos.map((step, idx) => {
              const n = totalPorPaso.get(step.id) ?? 0;
              const pct = clientes.length ? Math.round((n / clientes.length) * 100) : 0;
              const isFirstOfSection = idx === 0 || pasos[idx - 1].sectionId !== step.sectionId;
              return (
                <td
                  key={step.id}
                  className="sticky bottom-0 z-20 bg-[#0E0E0E]"
                  style={{
                    height: 46,
                    textAlign: 'center',
                    borderTop: '2px solid rgba(232,150,46,0.14)',
                    borderLeft: isFirstOfSection ? '2px solid var(--matrix-section-divider)' : '1px solid var(--matrix-cell-divider)',
                  }}
                  title={`${n} de ${clientes.length} clientes · ${step.title}`}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: pct >= 70 ? 'var(--color-success)' : pct >= 30 ? 'var(--color-gold)' : 'var(--matrix-subtitle-text)',
                    }}
                  >
                    {n}
                  </span>
                </td>
              );
            })}
            <td
              className="sticky right-0 bottom-0 z-30 bg-[#0E0E0E]"
              style={{ height: 46, textAlign: 'center', borderTop: '2px solid rgba(232,150,46,0.14)', borderLeft: '2px solid var(--matrix-section-divider)' }}
            >
              <span className="text-sm font-bold text-cream/50">{clientes.length}</span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
    </div>
  );
}
