/**
 * TusNumeros — su meta, sus cobros y sus horas.
 *
 * Una pantalla, tres bloques, letra grande. Los cobros vienen de lo que ya
 * registró en el Camino; acá ve el acumulado, lo que le queda después de
 * impuestos y cuánto falta para su meta.
 */
import React, { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import {
  leerNumeros, guardarNumeros, balance, anotarHoras, lunesDe, lecturaDeLaHora,
  type Cobro, type MisNumeros,
} from '../lib/tusNumeros';
import { VOC } from '../lib/vocabulario';

interface Props {
  cobros: Cobro[];
  onCerrar: () => void;
  /** Abre el mismo cuadro de siempre para cargar un cobro. */
  onRegistrarCobro?: () => void;
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const fecha = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return y ? `${d} ${MESES[m - 1]}` : iso;
};

export default function TusNumeros({ cobros, onCerrar, onRegistrarCobro }: Props) {
  const [n, setN] = useState<MisNumeros>(() => leerNumeros());
  const [horasHoy, setHorasHoy] = useState<string>(() => {
    const semana = leerNumeros().horas.find((h) => h.lunes === lunesDe());
    return semana ? String(semana.horas) : '';
  });

  const b = useMemo(() => balance(cobros, n), [cobros, n]);
  const guardar = (next: MisNumeros) => { setN(next); guardarNumeros(next); };

  const ordenados = [...cobros].sort((a, c) => c.fecha.localeCompare(a.fecha));
  const neto = (monto: number) => Math.round(monto * (1 - (n.retencion || 0) / 100) * 100) / 100;

  return (
    <section className="card-panel p-5" aria-label="Tus números">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[15px] font-bold uppercase tracking-[0.16em] text-goldhi">Tus números</p>
          <h2 className="mt-2 text-[26px] leading-tight text-cream" style={{ fontFamily: 'var(--font-display)', fontStyle: 'normal' }}>
            Lo que llevas cobrado
          </h2>
        </div>
        <button type="button" onClick={onCerrar} aria-label="Cerrar" className="min-h-[48px] min-w-[48px] grid place-items-center">
          <X className="w-6 h-6 text-cream/70" />
        </button>
      </div>

      {/* ── Tu meta ── */}
      <div className="mt-4 rounded-2xl border border-[var(--line2,#DFD3BC)] p-4">
        <label htmlFor="meta" className="block text-[17px] font-semibold text-cream">Tu meta</label>
        <div className="mt-2 flex gap-2">
          <input
            id="meta" type="number" inputMode="decimal" placeholder="10000"
            value={n.meta ?? ''}
            onChange={(e) => guardar({ ...n, meta: e.target.value ? Number(e.target.value) : null })}
            className="w-1/2 min-h-[52px] rounded-xl border border-[var(--line2,#DFD3BC)] bg-transparent px-3 text-[19px] text-cream"
          />
          <input
            type="text" placeholder="para los 90 días"
            value={n.plazo}
            onChange={(e) => guardar({ ...n, plazo: e.target.value })}
            className="w-1/2 min-h-[52px] rounded-xl border border-[var(--line2,#DFD3BC)] bg-transparent px-3 text-[17px] text-cream"
          />
        </div>
        <label htmlFor="ret" className="mt-4 block text-[17px] text-cream">
          Lo que se lleva el estado de cada cobro
        </label>
        <div className="mt-2 flex items-center gap-2">
          <input
            id="ret" type="number" inputMode="decimal" placeholder="0"
            value={n.retencion || ''}
            onChange={(e) => guardar({ ...n, retencion: Number(e.target.value) || 0 })}
            className="w-24 min-h-[52px] rounded-xl border border-[var(--line2,#DFD3BC)] bg-transparent px-3 text-[19px] text-cream"
          />
          <span className="text-[17px] text-cream/70">por ciento</span>
        </div>
      </div>

      {/* ── Dónde vas ── */}
      <div className="mt-4 rounded-2xl border border-[var(--line2,#DFD3BC)] p-4">
        <p className="text-[38px] leading-none text-cream" style={{ fontFamily: 'var(--font-display)' }}>
          {b.neto}
        </p>
        <p className="mt-1 text-[17px] text-cream/70">
          te quedó de {b.bruto} cobrados en {b.cobros} {b.cobros === 1 ? 'pago' : 'pagos'}
        </p>
        {n.meta ? (
          <>
            <div className="mt-3 h-2 rounded-full" style={{ background: 'var(--line2, #DFD3BC)' }}>
              <div className="h-2 rounded-full" style={{ width: `${Math.round(b.avance * 100)}%`, background: 'var(--tilde, #4A7C59)' }} />
            </div>
            <p className="mt-2 text-[17px] text-cream">
              {b.falta > 0 ? `Te faltan ${b.falta} para tu meta${n.plazo ? ` ${n.plazo}` : ''}.` : 'Llegaste a tu meta.'}
            </p>
          </>
        ) : (
          <p className="mt-2 text-[17px] text-cream/70">Escribe tu meta arriba y vas a ver cuánto te falta.</p>
        )}
        {onRegistrarCobro && (
          <button
            type="button"
            onClick={onRegistrarCobro}
            className="mt-4 w-full min-h-[52px] rounded-[20px] text-[18px] font-semibold"
            style={{ background: 'var(--oro-d, #8E6824)', color: '#FFFDF7' }}
          >
            Anotar un cobro
          </button>
        )}
      </div>

      {/* ── Tus horas ── */}
      <div className="mt-4 rounded-2xl border border-[var(--line2,#DFD3BC)] p-4">
        <label htmlFor="horas" className="block text-[17px] font-semibold text-cream">
          Horas que trabajaste esta semana
        </label>
        <input
          id="horas" type="number" inputMode="decimal" placeholder="20"
          value={horasHoy}
          onChange={(e) => {
            setHorasHoy(e.target.value);
            guardar(anotarHoras(n, lunesDe(), Number(e.target.value) || 0));
          }}
          className="mt-2 w-32 min-h-[52px] rounded-xl border border-[var(--line2,#DFD3BC)] bg-transparent px-3 text-[19px] text-cream"
        />
        <p className="mt-3 text-[17px] text-cream">{VOC(lecturaDeLaHora(b))}</p>
        {b.horas > 0 && (
          <p className="mt-1 text-[15px] text-cream/60">{b.horas} horas anotadas en total</p>
        )}
      </div>

      {/* ── Tus cobros ── */}
      {ordenados.length > 0 && (
        <div className="mt-4">
          <p className="text-[17px] font-semibold text-cream">Tus cobros</p>
          <ul className="mt-2">
            {ordenados.map((c, i) => (
              <li key={`${c.fecha}-${i}`} className="flex items-baseline justify-between gap-3 border-t border-[var(--line2,#DFD3BC)] py-3">
                <span className="text-[17px] text-cream/70">{fecha(c.fecha)}</span>
                <span className="text-[19px] text-cream">
                  {neto(c.monto)}
                  {n.retencion > 0 && <span className="ml-2 text-[15px] text-cream/60">de {c.monto}</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
