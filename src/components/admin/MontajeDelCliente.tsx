/**
 * LO QUE MONTÓ, Y LOS LINKS PARA MIRARLO.
 *
 * ═══ POR QUÉ NO EXISTÍA ═══
 *
 * Los ocho candados vivían en el navegador del cliente, así que el equipo no
 * veía nunca si alguien estaba listo para encender — aunque son el único gate
 * real del botón. Y la pieza de la campaña no se guardaba en ningún lado: para
 * mirar el anuncio de un cliente había que pedírselo por mensaje.
 *
 * Esto es solo de lectura, a propósito. Lo monta el cliente: si el equipo lo
 * cargara por él, el tilde dejaría de querer decir que está hecho.
 */
import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import {
  cuantosCerrados, loQueFalta, comoVaElMontaje, linksDe, candadoCerrado,
  DIAS_SIN_TOCAR, type Montaje,
} from '../../lib/montajeCampana';
import { montajeDe } from '../../lib/montajeDatos';

interface Props {
  clienteId: string;
  nombre: string;
  /** Si sus tres anuncios ya pasaron la auditoría. */
  anunciosListos?: boolean;
}

export default function MontajeDelCliente({ clienteId, nombre, anunciosListos = false }: Props) {
  const [montaje, setMontaje] = useState<Montaje | null>(null);

  useEffect(() => {
    let vivo = true;
    void montajeDe(clienteId).then((m) => { if (vivo) setMontaje(m); }).catch(() => { if (vivo) setMontaje({}); });
    return () => { vivo = false; };
  }, [clienteId]);

  if (montaje === null) {
    return (
      <section className="rounded-2xl border border-cream/12 p-5">
        <p className="text-base text-cream/70">Mirando qué montó…</p>
      </section>
    );
  }

  const listos = cuantosCerrados(montaje, anunciosListos);
  const falta = loQueFalta(montaje, anunciosListos);
  const links = linksDe(montaje);
  const nada = listos === 0 && links.length === 0;

  return (
    <section className="rounded-2xl border border-gold/25 bg-espresso/40 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-[19px] font-bold text-cream">Su montaje</h3>
        <span className="text-[16px] text-cream/55">{listos} de 8</span>
      </div>

      {nada ? (
        <p className="mt-2 text-[17px] leading-relaxed text-cream/70">
          {nombre} todavía no cargó nada de su montaje. Lo carga él, desde su
          pantalla de Campañas.
        </p>
      ) : (
        <>
          <p className="mt-3 text-[18px] font-bold leading-snug text-cream">
            {comoVaElMontaje(montaje, anunciosListos)}
          </p>

          <div className="mt-3 h-1.5 rounded-full bg-cream/10 overflow-hidden">
            <div className="h-full bg-gold transition-all" style={{ width: `${(listos / 8) * 100}%` }} />
          </div>

          {falta.length > 1 && (
            <ul className="mt-4 space-y-1.5">
              {falta.map((f) => (
                <li key={f} className="text-[17px] text-cream/70">· Le falta {f}</li>
              ))}
            </ul>
          )}

          {/* El presupuesto, que es lo que decide si la campaña puede decir algo. */}
          {(montaje.presupuesto_diario ?? 0) > 0 && (
            <p className="mt-4 text-[17px] text-cream/80">
              Puso {Math.round(montaje.presupuesto_diario!).toLocaleString('es')} USD por día,
              y dice sostenerlo {montaje.dias_sostenidos ?? 0} días.
              {!candadoCerrado(montaje, 'presupuesto') && (
                <span className="text-goldhi"> Con menos de {DIAS_SIN_TOCAR} no alcanza a decirle nada.</span>
              )}
            </p>
          )}

          {montaje.pixel_id ? (
            <p className="mt-2 text-[17px] text-cream/70">Píxel {montaje.pixel_id}</p>
          ) : null}
          {montaje.palabra ? (
            <p className="mt-1 text-[17px] text-cream/70">Su palabra: {montaje.palabra}</p>
          ) : null}

          {links.length > 0 && (
            <div className="mt-5 border-t border-cream/10 pt-4">
              <p className="text-[17px] font-bold text-cream/70 mb-2">Para mirar</p>
              <ul className="space-y-2">
                {links.map((l) => (
                  <li key={l.que}>
                    <a href={l.url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 text-[17px] text-gold hover:text-goldhi min-h-[44px]">
                      <ExternalLink className="w-4 h-4 shrink-0" />
                      {l.que}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}
