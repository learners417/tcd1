/**
 * GraduacionComprobantes — T11 · Plan Maestro.
 * Los comprobantes de los 10, juntos en la graduación. Se leen de la evidencia
 * que el fundador subió en los hitos de venta. Sin comprobantes, un mensaje
 * cálido — nunca rompe.
 */
import React, { useEffect, useState } from 'react';
import { Receipt } from 'lucide-react';
import { fetchComprobantes, type Comprobante } from '../lib/graduacion';

export default function GraduacionComprobantes({ userId }: { userId?: string }) {
  const [items, setItems] = useState<Comprobante[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let vivo = true;
    (async () => {
      if (userId) {
        const c = await fetchComprobantes(userId);
        if (vivo) setItems(c);
      }
      if (vivo) setCargando(false);
    })();
    return () => {
      vivo = false;
    };
  }, [userId]);

  return (
    <div className="rounded-xl border border-cream/10 bg-[#0F0F0F] p-4 text-left">
      <div className="flex items-center gap-2 mb-3">
        <Receipt className="w-4 h-4 text-gold" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-gold">
          Tus comprobantes{items.length > 0 ? ` · ${items.length}` : ''}
        </p>
      </div>
      {items.length > 0 ? (
        <div className="grid grid-cols-4 gap-2">
          {items.slice(0, 12).map((c, i) =>
            c.esImagen && c.url ? (
              <a
                key={i}
                href={c.url}
                target="_blank"
                rel="noreferrer"
                className="block aspect-square rounded-lg overflow-hidden border border-gold/20"
              >
                <img src={c.url} alt="comprobante" className="w-full h-full object-cover" />
              </a>
            ) : (
              <a
                key={i}
                href={c.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center aspect-square rounded-lg border border-gold/20 bg-gold/[0.06] text-[9px] text-gold/70 text-center px-1"
              >
                comprobante
              </a>
            ),
          )}
        </div>
      ) : (
        <p className="text-xs text-cream/50 leading-relaxed">
          {cargando
            ? 'Buscando tus comprobantes…'
            : 'Acá se juntan los comprobantes de los 10 que cargaste en el Camino. Cada pago que registraste, en un solo lugar.'}
        </p>
      )}
    </div>
  );
}
