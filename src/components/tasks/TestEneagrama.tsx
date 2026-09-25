/**
 * TestEneagrama — la herramienta de la jornada del día 3.
 *
 * Cuarenta y cinco preguntas de a una por pantalla, cuatro respuestas, sin
 * punto medio. Si los dos primeros tipos quedan cerca, pide tres elecciones
 * más. El resultado queda en su ADN y cambia cómo le habla el Mentor.
 */
import React, { useMemo, useState } from 'react';
import { ITEMS, RESPUESTAS, TIPOS, resultadoDe, desempate, tipo as tipoDe } from '../../lib/eneagrama';

export const KEY_ENEAGRAMA = 'tcd_eneagrama_v1';

interface Props {
  /** Guarda el tipo en el ADN del cliente. */
  onResultado?: (tipoId: number) => void;
}

export default function TestEneagrama({ onResultado }: Props) {
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});
  const [i, setI] = useState(0);
  const [elegidoDesempate, setElegidoDesempate] = useState<number[]>([]);
  const [cerrado, setCerrado] = useState<number | null>(() => {
    try {
      const guardado = localStorage.getItem(KEY_ENEAGRAMA);
      return guardado ? Number(JSON.parse(guardado).tipo) : null;
    } catch { return null; }
  });

  const completo = Object.keys(respuestas).length === ITEMS.length;
  const resultado = useMemo(() => (completo ? resultadoDe(respuestas) : null), [completo, respuestas]);
  const preguntasEmpate = resultado?.empateCon ? desempate(resultado.tipo, resultado.empateCon) : [];

  const guardar = (tipoId: number) => {
    try { localStorage.setItem(KEY_ENEAGRAMA, JSON.stringify({ tipo: tipoId })); } catch { /* noop */ }
    setCerrado(tipoId);
    onResultado?.(tipoId);
  };

  const responder = (valor: number) => {
    setRespuestas((prev) => ({ ...prev, [i]: valor }));
    if (i < ITEMS.length - 1) setI(i + 1);
  };

  const cerrarDesempate = (elecciones: number[]) => {
    if (!resultado?.empateCon) return;
    const porA = elecciones.filter((x) => x === 0).length;
    guardar(porA >= 2 ? resultado.tipo : resultado.empateCon);
  };

  // ── Ya lo hizo: se muestra su tipo ──
  if (cerrado !== null) {
    const t = tipoDe(cerrado);
    if (!t) return null;
    return (
      <section className="card-panel p-5" aria-label="Tu tipo">
        <p className="text-[15px] font-bold uppercase tracking-[0.16em] text-goldhi">Tu tipo</p>
        <h3 className="mt-2 text-[26px] leading-tight text-cream" style={{ fontFamily: 'var(--font-display)', fontStyle: 'normal' }}>
          {t.nombre}
        </h3>
        <p className="mt-3 text-[17px] text-cream"><span className="font-semibold">Cuando estás entero:</span> {t.entero}</p>
        <p className="mt-2 text-[17px] text-cream"><span className="font-semibold">Cuando estás cansado:</span> {t.cansado}</p>
        <p className="mt-2 text-[17px] text-cream"><span className="font-semibold">Con el dinero:</span> {t.conElDinero}</p>
        <button
          type="button"
          onClick={() => { setCerrado(null); setRespuestas({}); setI(0); setElegidoDesempate([]); }}
          className="mt-4 min-h-[48px] text-[17px] font-semibold text-goldhi"
        >
          Hacerlo de nuevo
        </button>
      </section>
    );
  }

  // ── Desempate: tres elecciones entre los dos que quedaron cerca ──
  if (resultado?.empateCon && preguntasEmpate.length) {
    const paso = elegidoDesempate.length;
    if (paso < preguntasEmpate.length) {
      const p = preguntasEmpate[paso];
      return (
        <section className="card-panel p-5" aria-label="Desempate">
          <p className="text-[15px] font-bold uppercase tracking-[0.16em] text-goldhi">
            Desempate · {paso + 1} de {preguntasEmpate.length}
          </p>
          <h3 className="mt-2 text-[24px] leading-tight text-cream" style={{ fontFamily: 'var(--font-display)', fontStyle: 'normal' }}>
            ¿Cuál te describe más?
          </h3>
          {[p.a, p.b].map((texto, idx) => (
            <button
              key={texto}
              type="button"
              onClick={() => {
                const next = [...elegidoDesempate, idx];
                setElegidoDesempate(next);
                if (next.length === preguntasEmpate.length) cerrarDesempate(next);
              }}
              className="mt-3 w-full min-h-[64px] rounded-2xl border border-[var(--line2,#DFD3BC)] px-4 py-3 text-left text-[17px] text-cream"
            >
              {texto}
            </button>
          ))}
        </section>
      );
    }
  }

  // ── El test ──
  const item = ITEMS[i];
  return (
    <section className="card-panel p-5" aria-label="Test del eneagrama">
      <p className="text-[15px] font-bold uppercase tracking-[0.16em] text-goldhi">
        Pregunta {i + 1} de {ITEMS.length}
      </p>
      <h3 className="mt-2 text-[24px] leading-snug text-cream" style={{ fontFamily: 'var(--font-display)', fontStyle: 'normal' }}>
        {item.texto}
      </h3>
      <div className="mt-4 space-y-2">
        {RESPUESTAS.map((r) => (
          <button
            key={r.valor}
            type="button"
            aria-pressed={respuestas[i] === r.valor}
            onClick={() => responder(r.valor)}
            className={`w-full min-h-[56px] rounded-2xl border px-4 text-left text-[17px] text-cream ${
              respuestas[i] === r.valor ? 'border-gold bg-[var(--card,#FFFDF7)]' : 'border-[var(--line2,#DFD3BC)]'
            }`}
          >
            {r.texto}
          </button>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setI(Math.max(0, i - 1))}
          disabled={i === 0}
          className="min-h-[48px] text-[17px] font-semibold text-goldhi disabled:text-cream/40"
        >
          Anterior
        </button>
        {completo && !resultado?.empateCon && (
          <button
            type="button"
            onClick={() => resultado && guardar(resultado.tipo)}
            className="min-h-[48px] px-5 rounded-[20px] text-[17px] font-semibold"
            style={{ background: 'var(--oro-d, #8E6824)', color: '#FFFDF7' }}
          >
            Ver mi tipo
          </button>
        )}
      </div>
      <p className="mt-3 text-[15px] text-cream/60">
        {TIPOS.length} tipos · contesta con lo que te pasa hoy, no con lo que te gustaría
      </p>
    </section>
  );
}
