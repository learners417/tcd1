/**
 * BunkerModal — T10 · El Botón del Búnker (Plan Maestro).
 * El anti-abandono: cuando un día pesa, la voz de Javo (VOZ MAESTRO) + el
 * por qué que escribió + los compromisos que firmó. No le pedimos todo:
 * le pedimos un episodio. El audio es un SLOT (subí el MP3 cuando lo grabes).
 */
import React, { useState } from 'react';
import { X, ShieldAlert, Play, Pause, Flame } from 'lucide-react';
import type { ProfileV2 } from '../lib/supabase';

/** Slot: pegá acá la URL del MP3 del Búnker (VOZ MAESTRO, ~90 seg). */
const BUNKER_AUDIO_URL = '';

export default function BunkerModal({
  open,
  onClose,
  perfil,
}: {
  open: boolean;
  onClose: () => void;
  perfil?: Partial<ProfileV2>;
}) {
  const [audio] = useState<HTMLAudioElement | null>(() =>
    typeof Audio !== 'undefined' && BUNKER_AUDIO_URL ? new Audio(BUNKER_AUDIO_URL) : null,
  );
  const [sonando, setSonando] = useState(false);

  if (!open) return null;

  const nombre = (perfil?.nombre ?? '').split(' ')[0] || 'Fundador';
  const porque = perfil?.proposito || perfil?.por_que_oficial || '';
  const cartaRaw = perfil?.adn_carta_futuro || perfil?.carta_dia91 || '';
  const carta = cartaRaw.length > 280 ? `${cartaRaw.slice(0, 280)}…` : cartaRaw;
  const compromisos = perfil?.adn_cinco_no?.nos ?? [];

  const toggle = () => {
    if (!audio) return;
    if (sonando) {
      audio.pause();
      setSonando(false);
    } else {
      audio.onended = () => setSonando(false);
      void audio.play().then(() => setSonando(true)).catch(() => setSonando(false));
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg card-panel border border-[#E8962E]/30 rounded-3xl p-6 max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#E8962E]" />
            <h2 className="text-sm font-bold text-[#F2EFE9] uppercase tracking-widest">El Búnker</h2>
          </div>
          <button onClick={onClose} className="text-[#F2EFE9]/40 hover:text-[#F2EFE9] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* VOZ MAESTRO */}
        <div className="rounded-2xl bg-[#E8962E]/[0.06] border border-[#E8962E]/20 p-4 mb-4">
          <p className="text-[9px] font-bold text-[#E8962E] uppercase tracking-widest mb-2">
            Javo, en persona
          </p>
          <p className="text-[15px] text-[#F2EFE9] leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
            {nombre}, si abriste esto es porque hoy pesa. No viniste a rendirte — viniste a que te
            recuerde quién sos. Los días sin ganas son exactamente los que te hacen cinturón negro.
            No te pido que hagas todo. Te pido un episodio. Uno solo. Hoy.
          </p>
          {BUNKER_AUDIO_URL ? (
            <button
              onClick={toggle}
              className="mt-3 flex items-center gap-2 px-4 py-2 rounded-lg bg-[#E8962E]/15 border border-[#E8962E]/30 text-[#E8962E] text-xs font-bold uppercase tracking-wider"
            >
              {sonando ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {sonando ? 'Pausar' : 'Escuchar a Javo'}
            </button>
          ) : null}
        </div>

        {/* Por qué empezaste */}
        {porque ? (
          <div className="mb-3">
            <p className="text-[9px] font-bold text-[#F2EFE9]/40 uppercase tracking-widest mb-1">
              Por qué empezaste
            </p>
            <p className="text-sm text-[#F2EFE9]/80 leading-relaxed">{porque}</p>
          </div>
        ) : null}

        {/* Los NO que firmaste */}
        {compromisos.length > 0 ? (
          <div className="mb-3">
            <p className="text-[9px] font-bold text-[#F2EFE9]/40 uppercase tracking-widest mb-2">
              Los NO que firmaste
            </p>
            <ul className="space-y-1.5">
              {compromisos.slice(0, 5).map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#F2EFE9]/75">
                  <Flame className="w-3.5 h-3.5 text-[#E8962E] mt-0.5 shrink-0" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Tu carta al futuro */}
        {carta ? (
          <div className="mb-4 rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
            <p className="text-[9px] font-bold text-[#F2EFE9]/40 uppercase tracking-widest mb-1">
              Tu carta al futuro
            </p>
            <p className="text-sm text-[#F2EFE9]/70 leading-relaxed italic">{carta}</p>
          </div>
        ) : null}

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-[#E8962E] text-[#080808] text-sm font-bold uppercase tracking-wider hover:bg-[#F4B65C] transition-colors"
        >
          Me quedo un día más 🥋
        </button>
      </div>
    </div>
  );
}
