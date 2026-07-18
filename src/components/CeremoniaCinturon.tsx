/**
 * CeremoniaCinturon — T7 · Plan Maestro.
 * El momento más importante del dojo, tratado como lo que es: pantalla
 * completa, la metáfora, la carta de Javo, qué se desbloquea, compartible.
 * Se dispara sola cuando el cinturón sube (compara contra el último visto).
 */
import React, { useEffect, useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { cinturonDesdeProgreso, type Cinturon } from '../lib/cinturones';

const KEY_ULTIMO = 'tcd_ultimo_cinturon_visto';

/** Las cartas de etapa — la voz de Javo al cruzar cada puerta. */
const CARTAS: Record<number, string> = {
  1: 'Diste el primer paso real — el que la mayoría no da nunca. Tu punta amarilla dice una cosa: la semilla ya no es solo semilla. Se abre tu ADN del Negocio: ahí va a vivir todo lo que firmes. Cuidalo — es tu clínica naciendo.',
  2: 'Amarillo. El sol ya pega en la tierra. Sanaste lo que nadie ve — el cuarto del dinero — y por eso lo que viene se sostiene. Se abren tu Diario y El Método: escribí lo que te pasa, no solo lo que haces. Firmeza y amorosidad, siempre juntas.',
  3: 'Punta verde. Tu método ya tiene nombre — deja de ser «lo que haces» y empieza a ser un activo con tu firma. De acá en adelante, todo lo que construyas lo firma ÉL. No lo muevas. No lo muevas. No lo muevas.',
  4: 'Verde. El árbol echó raíces: oferta, precio, garantía — todo firmado. Se abre tu Sala de Entrenamiento: ahí no se estudia, SE ENTRENA. Cámara, ventas, objeciones. A la llamada real se llega entrenado — nunca improvisando.',
  5: 'Verde punta azul. Tu sistema respira: página, agente, piezas con tu cara. Se abren el Creador y las Campañas — tus fábricas. Recordá la doctrina: los cortos dicen lo que NO, el largo dice el SÍ. Primero se lanza, después se arregla.',
  6: 'Azul. La campaña está ENCENDIDA — tu clínica le habla al mundo mientras dormís. Ahora empieza la caza: tres números por semana, paciencia de cazador, y el precio se dice UNA vez. El que pregunta, dirige.',
  7: 'ROJO. El fruto maduro. Entró el primer pago de $1.000 — y ese comprobante nadie te lo regaló: lo cazaste con método, precio digno y sistema propio. El primero es el más difícil. Los otros nueve ya saben el camino. Enmarcá este día.',
  8: 'NEGRO. Directora. Director. Diez pacientes, máquina propia, libertad clínica de verdad. El cinturón negro no es el final del camino — es el permiso de enseñarlo. Tu clínica sigue el día 91, y vos ya no sos la Foto de Partida. Gracias por la confianza. Nos vemos del otro lado. 🥋',
};

const DESBLOQUEOS: Record<number, string> = {
  1: '🧬 Se abrió: tu ADN del Negocio',
  2: '📔 Se abrieron: tu Diario del Fundador y El Método',
  4: '🥊 Se abrió: tu Sala de Entrenamiento',
  5: '🏭 Se abrieron: el Creador de Contenido y las Campañas',
};

export default function CeremoniaCinturon() {
  const [cinturon, setCinturon] = useState<Cinturon | null>(null);
  const [copiado, setCopiado] = useState(false);

  // Detectar subida de cinturón (poll liviano: al montar y al volver el foco)
  useEffect(() => {
    const check = () => {
      try {
        const saved = localStorage.getItem('tcd_hoja_ruta_v2');
        const c = cinturonDesdeProgreso(new Set(saved ? JSON.parse(saved) : []));
        const ultimo = parseInt(localStorage.getItem(KEY_ULTIMO) ?? '0', 10);
        if (c.orden > ultimo) setCinturon(c);
      } catch { /* noop */ }
    };
    check();
    window.addEventListener('focus', check);
    window.addEventListener('storage', check);
    const iv = window.setInterval(check, 4000);
    return () => { window.removeEventListener('focus', check); window.removeEventListener('storage', check); window.clearInterval(iv); };
  }, []);

  if (!cinturon || cinturon.orden === 0) return null;

  const cerrar = () => {
    try { localStorage.setItem(KEY_ULTIMO, String(cinturon.orden)); } catch { /* noop */ }
    setCinturon(null);
  };
  const compartir = () => {
    const texto = `🥋 Acabo de ganar mi Cinturón ${cinturon.nombre} en Tu Clínica Digital — ${cinturon.metafora}. Cada cinturón se gana con pruebas reales: nadie lo regala.`;
    try { void navigator.clipboard.writeText(texto); setCopiado(true); setTimeout(() => setCopiado(false), 2000); } catch { /* noop */ }
  };

  return (
    <div className="fixed inset-0 z-[95] bg-[#0D0C0B] overflow-y-auto animate-in fade-in duration-700">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#E8962E]/12 blur-[140px] rounded-full pointer-events-none" />
      <button onClick={cerrar} className="absolute top-4 right-4 text-white/30 hover:text-white/70 transition-colors z-10"><X className="w-6 h-6" /></button>
      <div className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 py-14 max-w-lg mx-auto">
        <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-[#E8962E] mb-8 animate-in slide-in-from-top-4 duration-700">Ceremonia de cinturón</p>
        <p className="text-[90px] leading-none mb-6 animate-in zoom-in-50 duration-700">{cinturon.emoji}</p>
        <h1 className="text-4xl font-light text-[#F2EFE9] mb-2" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
          Cinturón {cinturon.nombre}
        </h1>
        <p className="text-sm text-[#E8962E] italic mb-8">{cinturon.metafora}</p>
        {CARTAS[cinturon.orden] && (
          <div className="rounded-2xl border border-[#E8962E]/25 bg-gradient-to-b from-[#E8962E]/[0.06] to-transparent p-6 mb-6 text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#E8962E]/70 mb-3">Una carta para ti</p>
            <p className="text-sm text-white/80 leading-relaxed whitespace-pre-line">{CARTAS[cinturon.orden]}</p>
            <p className="text-xs text-[#E8962E]/80 mt-4 text-right" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>— Javo</p>
          </div>
        )}
        {DESBLOQUEOS[cinturon.orden] && (
          <p className="text-sm text-[#22C55E] font-medium mb-8 animate-pulse">{DESBLOQUEOS[cinturon.orden]}</p>
        )}
        <div className="flex gap-3 w-full">
          <button onClick={compartir} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/[0.06] border border-white/15 text-white/75 text-sm font-bold hover:bg-white/10 transition-colors">
            {copiado ? <Check className="w-4 h-4 text-[#22C55E]" /> : <Copy className="w-4 h-4" />} {copiado ? 'Copiado' : 'Compartirlo'}
          </button>
          <button onClick={cerrar} className="flex-1 py-3 rounded-2xl bg-[#E8962E] text-black text-sm font-bold hover:bg-[#F4B65C] transition-colors">
            Seguir el camino →
          </button>
        </div>
      </div>
    </div>
  );
}
