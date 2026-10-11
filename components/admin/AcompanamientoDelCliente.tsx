/**
 * EL ACOMPAÑAMIENTO QUE RECIBIÓ — y el que todavía se le debe.
 *
 * La promesa que se vende es acompañamiento humano durante 90 días. Esta
 * pantalla contesta, para cada cliente, la única pregunta que sostiene esa
 * promesa: **cuántas sesiones tuvo de verdad, y hace cuánto que no tiene una.**
 *
 * Hasta hoy no había forma de saberlo: ninguna sesión dejaba rastro.
 */
import { useEffect, useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import {
  comoViene, loQueSeLeDebe, queIncluye, seEstaCayendo, ordenadas,
  loQuePrometimos, cumplimosNuestraParte,
  COMO_SE_LLAMA, enPalabras, type Sesion,
} from '../../lib/sesionesHumanas';
import { sesionesDe } from '../../lib/sesionesDatos';

function hoyISO(): string {
  const f = new Date();
  return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`;
}

export default function AcompanamientoDelCliente({
  clienteId, servicio, hoy = hoyISO(), recarga = 0,
}: {
  clienteId: string;
  servicio: string | null | undefined;
  /** Se pasa para poder probarlo con una fecha fija. */
  hoy?: string;
  /** Cambia cuando se carga una sesión nueva, para volver a leer. */
  recarga?: number;
}) {
  const [sesiones, setSesiones] = useState<Sesion[] | null>(null);

  useEffect(() => {
    let vivo = true;
    void sesionesDe(clienteId)
      .then((s) => { if (vivo) setSesiones(s); })
      .catch(() => { if (vivo) setSesiones([]); });
    return () => { vivo = false; };
  }, [clienteId, recarga]);

  if (sesiones === null) {
    return (
      <section className="rounded-2xl border border-cream/12 p-5">
        <p className="text-[17px] text-cream/70">Mirando sus sesiones…</p>
      </section>
    );
  }

  const cayendo = seEstaCayendo(sesiones, servicio, hoy);
  const debe = loQueSeLeDebe(sesiones, servicio);
  const lista = ordenadas(sesiones).slice(0, 5);
  const prometidas = loQuePrometimos(servicio);
  // Acá sí se consultaron: el panel no se dibuja hasta que vuelven.
  const cumplimos = cumplimosNuestraParte(sesiones, servicio);

  return (
    <section className={`rounded-2xl border p-5 ${
      cayendo ? 'border-gold/45 bg-gold/[0.06]' : 'border-gold/25 bg-espresso/40'
    }`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-[19px] font-bold text-cream">Su acompañamiento</h3>
        <span className="text-[16px] text-cream/55">{sesiones.length}</span>
      </div>

      <p className={`mt-3 text-[18px] font-bold leading-snug ${cayendo ? 'text-goldhi' : 'text-cream'}`}>
        {comoViene(sesiones, servicio, hoy)}
      </p>
      <p className="mt-2 text-[17px] leading-relaxed text-cream/65">{queIncluye(servicio)}</p>

      {debe.length > 0 && (
        <p className="mt-3 text-[17px] text-cream/80">
          Le debemos {debe.join(' y ')}.
        </p>
      )}

      {/* LA MITAD DE LA GARANTÍA QUE ERA NUESTRA.
          Antes el cierre de cuentas medía con datos lo que el cliente
          entregó y daba por hecho lo que le dimos. Si él cumplió y nosotros
          no dimos las sesiones, la garantía corre a nuestro cargo — y nadie
          se iba a enterar, porque el único número a la vista era el suyo. */}
      {prometidas > 0 && (
        <p className={`mt-3 rounded-xl border px-4 py-3 text-[17px] leading-relaxed ${
          cumplimos ? 'border-cream/12 text-cream/70' : 'border-danger/40 bg-danger/[0.06] text-cream/90'}`}>
          {sesiones.length} de {prometidas} sesiones dadas.{' '}
          {cumplimos
            ? 'Su parte de la garantía la podemos pedir.'
            : 'Con esto la garantía corre a nuestro cargo: no se le puede reclamar nada.'}
        </p>
      )}

      {lista.length > 0 && (
        <div className="mt-5 border-t border-cream/10 pt-4">
          <p className="text-[17px] font-bold text-cream/70 mb-2">Las últimas</p>
          <ul className="space-y-2.5">
            {lista.map((s, i) => (
              <li key={s.id ?? i}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-[17px] text-cream/85 flex items-center gap-2">
                    <CalendarCheck className="w-4 h-4 text-gold/70 shrink-0" />
                    {COMO_SE_LLAMA[s.tipo]}
                  </span>
                  <span className="text-[16px] text-cream/55">
                    {enPalabras(s.fecha)} · {s.quien_la_dio}
                  </span>
                </div>
                {s.notas && (
                  <p className="mt-1 ml-6 text-[17px] leading-relaxed text-cream/60">{s.notas}</p>
                )}
                {s.pendiente && (
                  <p className="mt-1 ml-6 text-[17px] text-goldhi/90">Quedó: {s.pendiente}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
