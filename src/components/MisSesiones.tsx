/**
 * TUS SESIONES — lo que el cliente ve de su acompañamiento.
 *
 * Compró noventa días de acompañamiento humano y no tenía dónde verlo: ni
 * cuántas sesiones llevaba, ni qué quedó pendiente de la última. Lo único que
 * le quedaba era su memoria y el chat.
 *
 * Esto no es un reporte: es lo que necesita antes de la próxima. Arriba, lo
 * que quedó para esta semana; debajo, lo que ya recorrió.
 */
import { useEffect, useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import {
  ordenadas, ultima, COMO_SE_LLAMA, enPalabras, queIncluye, type Sesion,
} from '../lib/sesionesHumanas';
import { sesionesDe } from '../lib/sesionesDatos';

export default function MisSesiones({
  userId, servicio,
}: {
  userId?: string;
  servicio?: string | null;
}) {
  const [sesiones, setSesiones] = useState<Sesion[] | null>(null);

  useEffect(() => {
    if (!userId) { setSesiones([]); return; }
    let vivo = true;
    void sesionesDe(userId)
      .then((s) => { if (vivo) setSesiones(s); })
      .catch(() => { if (vivo) setSesiones([]); });
    return () => { vivo = false; };
  }, [userId]);

  if (sesiones === null || sesiones.length === 0) return null;

  const lista = ordenadas(sesiones);
  const ult = ultima(sesiones);

  return (
    <section className="card-panel p-6 sm:p-7 border border-gold/15" aria-label="Tus sesiones">
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
        <h2 className="text-[15px] font-bold uppercase tracking-[0.16em] text-goldhi"
          style={{ fontFamily: 'var(--font-body)' }}>
          Tus sesiones
        </h2>
        <p className="text-sm text-cream/60">
          {lista.length} {lista.length === 1 ? 'hasta ahora' : 'hasta ahora'}
        </p>
      </div>

      {/* Lo que quedó de la última: es lo único que hay que hacer antes de la próxima. */}
      {ult?.pendiente && (
        <div className="rounded-xl border border-gold/35 bg-gold/[0.07] px-4 py-3 mb-4">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-goldhi mb-1">
            Quedó para esta semana
          </p>
          <p className="text-base leading-relaxed text-cream/90">{ult.pendiente}</p>
        </div>
      )}

      <ul className="divide-y divide-gold/10">
        {lista.slice(0, 8).map((s, i) => (
          <li key={s.id ?? i} className="py-3.5 flex items-start gap-3">
            <span className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border border-gold/30 text-gold">
              <CalendarCheck className="w-4 h-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-base font-semibold text-cream">
                {COMO_SE_LLAMA[s.tipo]}
              </span>
              <span className="block text-sm text-cream/60">
                {enPalabras(s.fecha)} · con {s.quien_la_dio}
              </span>
              {s.notas && (
                <span className="block text-sm text-cream/70 mt-1 leading-relaxed">{s.notas}</span>
              )}
            </span>
          </li>
        ))}
      </ul>

      <p className="text-sm text-cream/45 mt-4 leading-relaxed">{queIncluye(servicio)}</p>
    </section>
  );
}
