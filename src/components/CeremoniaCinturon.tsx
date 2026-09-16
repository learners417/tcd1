/**
 * CeremoniaCinturon — cuando sube el grado (10-DISENO §5 "Tira de cinturón").
 *
 * "Sin pantalla completa, sin confeti, sin sonido. La seriedad es la recompensa."
 * Una tarjeta abajo, sobre la barra: la tira con el color nuevo, qué significa,
 * con qué se ganó, y la carta de Javo plegada para quien quiera leerla.
 *
 * Reglas:
 * - En el PRIMER ingreso no se dispara: se anota el grado actual en silencio.
 *   Antes se disparaba para el Blanco, que es el grado con el que se empieza.
 * - Las cartas van por id de grado (los 11 actuales), no por número de orden:
 *   la tabla vieja era de los 9 cinturones anteriores y quedó corrida.
 */
import React, { useEffect, useState } from 'react';
import { X, Check } from 'lucide-react';
import { cinturonDesdeProgreso, type Cinturon } from '../lib/cinturones';
import CintaCinturon from './CintaCinturon';
import { VOC } from '../lib/vocabulario';

export const KEY_ULTIMO = 'tcd_ultimo_cinturon_visto';

/** Con qué se ganó cada grado, dicho a la persona. */
export const GANADO_CON: Record<string, string> = {
  '9gup': 'Tu hora real neta, escrita a mano',
  '8gup': 'Tu primer cobro al precio nuevo',
  '7gup': 'Tu método, aprobado por el Crítico',
  '6gup': 'Tu oferta completa en una página',
  '5gup': 'El enlace vivo de tu página',
  '4gup': 'Agendarte a ti mismo, de punta a punta',
  '3gup': 'Tu campaña activa, con fecha y hora',
  '2gup': 'El cobro de alguien que no te conocía',
  '1gup': 'La captura desde el teléfono de {{tu_consultante}}',
  '1dan': 'Tus dos números, lado a lado',
};

/** La voz de Javo al cruzar cada puerta. */
export const CARTAS: Record<string, string> = {
  '9gup': 'Diste el primer paso real: pusiste tu hora en números. Desde hoy decides con datos, no con cansancio.',
  '8gup': 'Cobraste a tu precio nuevo. Todo lo que viene se apoya en esto.',
  '7gup': 'Tu método ya tiene nombre y aprobación. Pasa de ser «lo que haces» a ser un activo con tu firma. Desde aquí, todo lo que construyas lo firma él.',
  '6gup': 'Oferta, precio y garantía en una página. Ahora se entrena: a la llamada real se llega entrenado.',
  '5gup': 'Tu página está viva. Tu clínica ya tiene dirección propia.',
  '4gup': 'Recorriste tu agenda de punta a punta. Ya sabes exactamente lo que va a vivir {{tu_consultante}}.',
  '3gup': 'Tu campaña está encendida. Ahora se caza: tres números por semana y paciencia de cazador.',
  '2gup': 'Te pagó alguien que no te conocía. Ese comprobante lo ganaste con método y precio propio. Los siguientes ya tienen el camino marcado.',
  '1gup': 'Tu trabajo ya se ve desde el teléfono de {{tu_consultante}}. Eso es una clínica funcionando.',
  '1dan': 'Los dos números lado a lado: el del primer día y el de hoy. El negro es el permiso de enseñarlo. Tu clínica sigue el día 91.',
};

/** Decide qué mostrar. Lógica pura para poder probarla. */
export function gradoParaCelebrar(actual: Cinturon, ultimoGuardado: string | null): { mostrar: Cinturon | null; guardar: string | null } {
  // Primer ingreso: se anota el grado de partida sin celebrar nada.
  if (ultimoGuardado === null) return { mostrar: null, guardar: String(actual.orden) };
  const ultimo = parseInt(ultimoGuardado, 10);
  if (!Number.isFinite(ultimo)) return { mostrar: null, guardar: String(actual.orden) };
  if (actual.orden > ultimo && actual.orden > 1) return { mostrar: actual, guardar: null };
  return { mostrar: null, guardar: null };
}

export default function CeremoniaCinturon() {
  const [cinturon, setCinturon] = useState<Cinturon | null>(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    const check = () => {
      try {
        const saved = localStorage.getItem('tcd_hoja_ruta_v2');
        const actual = cinturonDesdeProgreso(new Set(saved ? JSON.parse(saved) : []));
        const { mostrar, guardar } = gradoParaCelebrar(actual, localStorage.getItem(KEY_ULTIMO));
        if (guardar !== null) localStorage.setItem(KEY_ULTIMO, guardar);
        if (mostrar) setCinturon(mostrar);
      } catch { /* noop */ }
    };
    check();
    window.addEventListener('focus', check);
    window.addEventListener('storage', check);
    const iv = window.setInterval(check, 4000);
    return () => { window.removeEventListener('focus', check); window.removeEventListener('storage', check); window.clearInterval(iv); };
  }, []);

  if (!cinturon) return null;

  const cerrar = () => {
    try { localStorage.setItem(KEY_ULTIMO, String(cinturon.orden)); } catch { /* noop */ }
    setCinturon(null);
  };
  const compartir = () => {
    const texto = `Acabo de ganar mi Cinturón ${cinturon.nombre} en Tu Clínica Digital: ${cinturon.metafora}. Cada grado se gana con evidencia.`;
    try { void navigator.clipboard.writeText(texto); setCopiado(true); setTimeout(() => setCopiado(false), 2000); } catch { /* noop */ }
  };
  const carta = CARTAS[cinturon.id];
  const ganado = GANADO_CON[cinturon.id];

  return (
    <div
      role="dialog"
      aria-label={`Nuevo grado: Cinturón ${cinturon.nombre}`}
      className="fixed inset-x-3 z-[95] mx-auto max-w-md md:bottom-6"
      style={{ bottom: 'calc(env(safe-area-inset-bottom) + 76px)' }}
    >
      <div className="card-panel p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[15px] font-bold uppercase tracking-[0.16em] text-goldhi">Nuevo grado</p>
          <button onClick={cerrar} aria-label="Cerrar" className="-mt-3 -mr-3 w-11 h-11 flex items-center justify-center text-cream/60">
            <X className="w-5 h-5" />
          </button>
        </div>
        <CintaCinturon cinturon={cinturon} variante="hero" className="mt-2" />
        <h2 className="mt-4 text-[26px] leading-tight text-cream" style={{ fontFamily: 'var(--font-display)' }}>
          Cinturón {cinturon.nombre}
        </h2>
        <p className="mt-1 text-[17px] text-cream/70">{cinturon.metafora}</p>
        {ganado && (
          <p className="mt-3 flex items-start gap-2 text-[17px] text-cream">
            <Check className="w-5 h-5 mt-0.5 shrink-0" style={{ color: 'var(--tilde, #4A7C59)' }} />
            <span>Lo ganaste con: {VOC(ganado)}</span>
          </p>
        )}
        {carta && (
          <details className="mt-3 group">
            <summary className="min-h-[44px] flex items-center cursor-pointer text-[17px] font-semibold text-goldhi">
              Leer la carta de Javo
            </summary>
            <p className="pb-2 text-[17px] leading-relaxed text-cream/80">{VOC(carta)}</p>
          </details>
        )}
        <div className="mt-4 flex gap-3">
          <button onClick={compartir} className="flex-1 min-h-[52px] rounded-[20px] border border-[var(--line2,#DFD3BC)] text-[17px] font-semibold text-cream">
            {copiado ? 'Copiado' : 'Compartir'}
          </button>
          <button onClick={cerrar} className="btn-ios-primary flex-1">
            Seguir
          </button>
        </div>
      </div>
    </div>
  );
}
