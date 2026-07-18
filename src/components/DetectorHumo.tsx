/**
 * DetectorHumo — T9 · idea #13 del Plan Maestro.
 * En el tablero del equipo: quién lleva 48+ hs frío, en qué meta quedó,
 * y el mensaje de rescate en la voz de Javo — para que lo mande UN HUMANO
 * por WhatsApp. El automático está quemado; el humano con contexto, no.
 */
import React, { useEffect, useState } from 'react';
import { Flame, Copy, Check } from 'lucide-react';
import { supabase, isSupabaseReady } from '../lib/supabase';

interface Frio { nombre: string; email: string; horas: number; ultima: string }

export default function DetectorHumo() {
  const [frios, setFrios] = useState<Frio[]>([]);
  const [copiado, setCopiado] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!isSupabaseReady() || !supabase) return;
      try {
        const { data: perfiles } = await supabase.from('profiles').select('id, nombre, email').eq('rol', 'cliente').limit(200);
        const { data: logs } = await supabase.from('session_logs').select('user_id, created_at').order('created_at', { ascending: false }).limit(1000);
        if (!perfiles) return;
        const ultimaPor = new Map<string, string>();
        for (const l of (logs ?? []) as Array<{ user_id: string; created_at: string }>) {
          if (!ultimaPor.has(l.user_id)) ultimaPor.set(l.user_id, l.created_at);
        }
        const ahora = Date.now();
        const out: Frio[] = [];
        for (const p of perfiles as Array<{ id: string; nombre?: string; email?: string }>) {
          const u = ultimaPor.get(p.id);
          const horas = u ? Math.floor((ahora - new Date(u).getTime()) / 3600000) : 999;
          if (horas >= 48) out.push({ nombre: p.nombre ?? p.email ?? 'Cliente', email: p.email ?? '', horas: Math.min(horas, 999), ultima: u ? new Date(u).toLocaleDateString() : 'nunca' });
        }
        out.sort((a, b) => b.horas - a.horas);
        setFrios(out.slice(0, 12));
      } catch { /* esquema distinto o sin datos: el detector calla */ }
    })();
  }, []);

  if (frios.length === 0) return null;

  const msg = (n: string) => `Hola ${n.split(' ')[0]} 🥋 Vi que hace un par de días no entras al dojo — y no te escribo para retarte: te escribo porque los días sin ganas son exactamente los que te hacen cinturón negro. ¿Qué te frenó — la tarea, o lo que la tarea te hace sentir? Contame. ¿Te llamo 5 minutos hoy?`;

  return (
    <div className="card-panel p-5 border border-[#EF4444]/25 mb-6">
      <h2 className="text-[11px] font-bold text-[#EF4444] tracking-widest uppercase mb-3 flex items-center gap-2">
        <Flame className="w-4 h-4" /> Detector de humo — {frios.length} en riesgo (48h+ sin actividad)
      </h2>
      <div className="space-y-2">
        {frios.map((f) => (
          <div key={f.email} className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] border border-white/[0.06] px-3.5 py-2.5">
            <div className="min-w-0">
              <p className="text-sm text-[#F2EFE9] truncate">{f.nombre} <span className={`ml-2 text-[10px] font-bold ${f.horas >= 96 ? 'text-[#EF4444]' : 'text-[#E8962E]'}`}>{f.horas >= 999 ? 'sin sesiones' : `${Math.floor(f.horas / 24)}d frío`}</span></p>
              <p className="text-[10px] text-white/35">última sesión: {f.ultima}</p>
            </div>
            <button onClick={() => { try { void navigator.clipboard.writeText(msg(f.nombre)); setCopiado(f.email); setTimeout(() => setCopiado(null), 1800); } catch { /* noop */ } }}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#E8962E]/12 border border-[#E8962E]/30 text-[#E8962E] text-[10px] font-bold uppercase tracking-wider hover:bg-[#E8962E]/20 transition-colors">
              {copiado === f.email ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} rescate
            </button>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-white/30 mt-3">El mensaje se manda A MANO por WhatsApp — el rescate humano con contexto salva; el automático espanta.</p>
    </div>
  );
}
