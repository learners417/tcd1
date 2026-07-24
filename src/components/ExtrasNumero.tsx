/**
 * EXTRAS DEL NÚMERO (Cirugía 3) — lo que la landing promete, visible en HOY:
 * la tarjeta de TU viernes en vivo (con el corte del jueves 12:00) y los
 * 🎁 bonos con dónde se cobra cada uno. Solo para el plan EL NÚMERO.
 */
import React from 'react';
import { planLimitado } from '../lib/adnPiezas';
import { RADAR_PRECIOS } from '../lib/radarPrecios';

/** Próximo viernes según el corte: compró antes del jueves 12:00 ART → ESTE viernes. */
function proximoViernes(): { fecha: string; esEsteViernes: boolean } {
  const ahora = new Date();
  const art = new Date(ahora.getTime() - 3 * 3600000); // ART = UTC-3
  const dia = art.getUTCDay(); // 0=dom … 5=vie
  let delta = (5 - dia + 7) % 7;
  const pasoCorte = dia > 4 || (dia === 4 && art.getUTCHours() >= 12); // jueves 12:00 en adelante
  if (delta === 0 && pasoCorte) delta = 7;
  if (pasoCorte && dia === 4) delta = 8; // jueves tarde → viernes de la próxima
  const v = new Date(ahora);
  v.setDate(v.getDate() + delta);
  const fecha = v.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
  return { fecha: fecha.charAt(0).toUpperCase() + fecha.slice(1), esEsteViernes: delta <= 4 };
}

export function TarjetaViernes() {
  if (!planLimitado()) return null;
  const { fecha } = proximoViernes();
  return (
    <div className="card-panel p-5 border border-gold/30 bg-gradient-to-r from-gold/[0.08] to-transparent">
      <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold mb-1">🔴 Tu sesión en vivo</p>
      <p className="text-lg text-cream" style={{ fontFamily: 'var(--font-display)' }}>{fecha}</p>
      <p className="text-xs text-cream/55 mt-1">
        1 hora, en vivo conmigo. Llega con tus 5 días hechos: ahí revisamos tu precio y respondo lo tuyo.
      </p>
    </div>
  );
}

export function BonosNumero() {
  const [abierto, setAbierto] = React.useState<string | null>(null);
  if (!planLimitado()) return null;
  return (
    <div className="card-panel p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-cream/60 mb-3">🎁 Tus bonos — incluidos en tu compra</p>
      <div className="space-y-2.5">
        <div className="text-sm text-cream/80">
          <span className="font-semibold text-cream">El Guion de tu Anuncio</span>
          <span className="text-cream/45"> — se crea contigo en tu Día 5, listo para enviar.</span>
        </div>
        <div className="text-sm text-cream/80">
          <span className="font-semibold text-cream">Tu Lista de Precios Nueva</span>
          <span className="text-cream/45"> — sale de EL NÚMERO: tu precio sellado, negro sobre blanco.</span>
        </div>
        <div>
          <button onClick={() => setAbierto(abierto ? null : 'radar')} className="text-sm text-left w-full">
            <span className="font-semibold text-cream">Precios Dignos por Especialidad</span>
            <span className="text-gold text-xs font-bold"> {abierto ? '· ocultar' : '· ver ahora →'}</span>
          </button>
          {abierto && (
            <div className="mt-2 rounded-xl border border-cream/10 bg-surface/30 p-3 space-y-1.5">
              {(RADAR_PRECIOS as Array<{ familia: string; rango: string }>).map((r) => (
                <div key={r.familia} className="flex items-baseline justify-between gap-3 text-xs">
                  <span className="text-cream/70">{r.familia}</span>
                  <span className="text-gold font-semibold whitespace-nowrap">{r.rango}</span>
                </div>
              ))}
              <p className="text-[10px] text-cream/40 pt-1">Rangos dignos de referencia — tu número exacto sale de TU meta, no de la tabla.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
