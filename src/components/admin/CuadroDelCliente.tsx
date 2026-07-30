import { useMemo } from 'react';
import { Check } from 'lucide-react';
import { cuadroDe, avanceDe, ticketDe, TICKETS } from '../../lib/cuadroTickets';

/**
 * QUÉ LE FALTA INSTALAR, según lo que pagó.
 *
 * ═══ POR QUÉ ESTABA SUELTO ═══
 *
 * El cuadro estaba construido y probado, y **no se podía usar**: la app tenía
 * dos vocabularios de ticket que no se hablaban, así que no sabía que un
 * cliente «verde» es uno de $5.000. Por eso nunca se montó, y por eso el de
 * $5.000 no recibía nada distinto dentro de la app.
 *
 * Ahora el puente existe y esto muestra, para cada cliente, **solo los ítems
 * que le aplican** y quién hace cada uno.
 */
export default function CuadroDelCliente({
  plan,
  hechos = new Set(),
  onMarcar,
}: {
  plan: string | null | undefined;
  hechos?: Set<string>;
  onMarcar?: (id: string) => void;
}) {
  const ticket = ticketDe(plan);
  const def = TICKETS[ticket];
  const items = useMemo(() => cuadroDe(ticket), [ticket]);
  const avance = useMemo(() => avanceDe(ticket, hechos), [ticket, hechos]);

  const porQuien = useMemo(() => {
    const g = new Map<string, typeof items>();
    for (const i of items) {
      if (i.noAplica) continue;
      g.set(i.loHace, [...(g.get(i.loHace) ?? []), i]);
    }
    return [...g.entries()];
  }, [items]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gold/25 bg-gold/[0.04] p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold/70 mb-1">
          {def.nombre}
        </p>
        <p className="text-2xl text-cream" style={{ fontFamily: 'var(--font-display)' }}>
          {avance.hechos} de {avance.total}
        </p>
        <p className="text-sm text-cream/65 mt-1">
          {avance.pct === 100
            ? 'Tiene todo lo que su plan incluye.'
            : `Le faltan ${avance.total - avance.hechos} para poder encender.`}
        </p>
        <div className="h-1.5 rounded-full bg-cream/10 mt-3 overflow-hidden">
          <div className="h-full bg-gold transition-all" style={{ width: `${avance.pct}%` }} />
        </div>
      </div>

      {porQuien.map(([quien, suyos]) => (
        <div key={quien} className="rounded-2xl border border-cream/12 p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-cream/50 mb-3">
            {quien} · {suyos.filter((i) => hechos.has(i.id)).length} de {suyos.length}
          </p>
          <div className="space-y-1.5">
            {suyos.map((i) => (
              <button key={i.id}
                onClick={() => onMarcar?.(i.id)}
                disabled={!onMarcar}
                className={`w-full text-left flex items-start gap-2.5 rounded-lg p-2 transition ${
                  onMarcar ? 'hover:bg-cream/[0.04]' : ''}`}>
                <span className={`mt-0.5 shrink-0 ${
                  hechos.has(i.id) ? 'text-success' : 'text-cream/20'}`}>
                  <Check size={13} />
                </span>
                <span className={`text-sm ${
                  hechos.has(i.id) ? 'text-cream/50 line-through' : 'text-cream/85'}`}>
                  {i.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}

      <p className="text-[11px] text-cream/35 text-center">
        Solo se muestran los {avance.total} ítems que su plan incluye.
        Los demás no le aplican y no cuentan para su avance.
      </p>
    </div>
  );
}
