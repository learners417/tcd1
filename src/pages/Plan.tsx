/**
 * Plan.tsx — EL PLAN (Lote C · jul 2026)
 * El norte del sanador: 10 pacientes de $1.000 en 90 días, vivo y personalizado.
 * NO es una tab de datos — es el "para qué" que sostiene el "qué hago hoy".
 * El Camino ejecuta el Plan; el Plan da sentido al Camino.
 */
import React, { useEffect, useState } from 'react';
import { Target, TrendingUp, Flag } from 'lucide-react';
import { supabase, isSupabaseReady } from '../lib/supabase';
import type { ProfileV2 } from '../lib/supabase';
import CintaCinturon from '../components/CintaCinturon';
import { cinturonDesdeProgreso } from '../lib/cinturones';

interface PlanProps {
  perfil: Partial<ProfileV2>;
  userId?: string;
  setCurrentPage: (p: string) => void;
}

const META_PACIENTES = 10;
const PRECIO_OBJETIVO = 1000;

export default function Plan({ perfil, userId, setCurrentPage }: PlanProps) {
  const [ventas, setVentas] = useState<{ suma: number; count: number }>({ suma: 0, count: 0 });
  const [diaPrograma, setDiaPrograma] = useState(1);

  useEffect(() => {
    if (!isSupabaseReady() || !supabase || !userId) return;
    supabase.from('ventas_registradas').select('monto').eq('usuario_id', userId).then(({ data }) => {
      const montos = (data ?? []).map((v: { monto: number | null }) => Number(v.monto) || 0);
      setVentas({ suma: montos.reduce((a: number, b: number) => a + b, 0), count: montos.length });
    });
  }, [userId]);

  useEffect(() => {
    try {
      const fi = perfil?.fecha_inicio;
      if (fi) setDiaPrograma(Math.max(1, Math.min(90, Math.floor((Date.now() - new Date(fi).getTime()) / 86400000) + 1)));
    } catch { /* noop */ }
  }, [perfil]);

  const cint = (() => { try { const s = localStorage.getItem('tcd_hoja_ruta_v2'); return cinturonDesdeProgreso(new Set(s ? JSON.parse(s) : [])); } catch { return cinturonDesdeProgreso(new Set()); } })();
  const nombre = perfil?.nombre?.split(' ')[0] ?? '';
  const pacientesRestantes = Math.max(0, META_PACIENTES - ventas.count);
  const facturacionMeta = META_PACIENTES * PRECIO_OBJETIVO;
  const pctPacientes = Math.min(100, (ventas.count / META_PACIENTES) * 100);
  const diasRestantes = Math.max(0, 90 - diaPrograma);

  // El nicho/oferta del ADN si ya lo definió
  const nicho = (perfil as { adn_nicho?: string })?.adn_nicho;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Encabezado ceremonial */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-gold">Tu norte</p>
        <h1 className="text-3xl md:text-4xl font-light text-cream mt-2" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
          {nombre ? `El plan de ${nombre}` : 'Tu Plan'}
        </h1>
        <p className="text-sm text-cream/55 mt-2 leading-relaxed max-w-xl">
          10 pacientes a tu precio digno en 90 días — y el sistema para repetirlo. Cada sesión de El Camino te acerca a este número.
        </p>
        <div className="mt-4 max-w-md"><CintaCinturon cinturon={cint} variante="hero" /></div>
      </div>

      {/* La meta grande — la barra de pacientes */}
      <div className="rounded-3xl border border-[rgba(232,150,46,0.14)] bg-gradient-to-br from-gold/[0.06] to-transparent p-7">
        <div className="flex items-center gap-3 mb-5">
          <Target className="w-5 h-5 text-gold" />
          <p className="text-sm font-semibold text-cream/90 uppercase tracking-wider">La meta</p>
        </div>

        <div className="flex items-end justify-between mb-3">
          <div>
            <span className="text-5xl font-light text-cream" style={{ fontVariantNumeric: 'tabular-nums' }}>{ventas.count}</span>
            <span className="text-2xl font-light text-cream/55"> / {META_PACIENTES}</span>
          </div>
          <p className="text-sm text-cream/65">pacientes</p>
        </div>

        {/* Barra segmentada en 10 */}
        <div className="flex gap-1.5 mb-4">
          {Array.from({ length: META_PACIENTES }).map((_, i) => (
            <div key={i} className="flex-1 h-3 rounded-full transition-all" style={{
              background: i < ventas.count ? 'linear-gradient(180deg, #F4B65C, #E8962E)' : 'rgba(242,239,233,0.08)',
              boxShadow: i < ventas.count ? '0 0 8px rgba(232,150,46,0.4)' : 'none',
            }} />
          ))}
        </div>

        <p className="text-sm text-cream/75">
          {ventas.count === 0 && '¡Empieza! Tu primer paciente está del otro lado del sistema que estás construyendo.'}
          {ventas.count > 0 && ventas.count < META_PACIENTES && `Te faltan ${pacientesRestantes} para ser Sanador Libre. Vas a llegar.`}
          {ventas.count >= META_PACIENTES && '🎉 ¡Lo lograste! 10 pacientes. Sos Sanador Libre.'}
        </p>
      </div>

      {/* Las 3 métricas del plan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-[rgba(232,150,46,0.1)] bg-panel p-5">
          <TrendingUp className="w-4 h-4 text-gold mb-2" />
          <p className="text-2xl font-light text-cream" style={{ fontVariantNumeric: 'tabular-nums' }}>${ventas.suma.toLocaleString()}</p>
          <p className="text-[11px] text-cream/45 mt-1">de ${facturacionMeta.toLocaleString()} objetivo</p>
        </div>
        <div className="rounded-2xl border border-[rgba(232,150,46,0.1)] bg-panel p-5">
          <Flag className="w-4 h-4 text-gold mb-2" />
          <p className="text-2xl font-light text-cream" style={{ fontVariantNumeric: 'tabular-nums' }}>Día {diaPrograma}</p>
          <p className="text-[11px] text-cream/45 mt-1">{diasRestantes} días para tu meta</p>
        </div>
        <div className="rounded-2xl border border-[rgba(232,150,46,0.1)] bg-panel p-5">
          <Target className="w-4 h-4 text-gold mb-2" />
          <p className="text-2xl font-light text-cream" style={{ fontVariantNumeric: 'tabular-nums' }}>{Math.round(pctPacientes)}%</p>
          <p className="text-[11px] text-cream/45 mt-1">del camino recorrido</p>
        </div>
      </div>

      {/* Cómo cada fase te acerca */}
      <div className="rounded-2xl border border-[rgba(232,150,46,0.1)] bg-panel p-6">
        <p className="text-[11px] font-bold uppercase tracking-widest text-gold mb-4">Cómo llegás</p>
        <div className="space-y-3 text-sm text-cream/70 leading-relaxed">
          <p><strong className="text-cream/90">Sanás tu relación con el dinero</strong> — para poder cobrar tu precio digno sin culpa.</p>
          <p><strong className="text-cream/90">Nombrás tu método y armás tu oferta</strong> — {nicho ? `para ${nicho}` : 'para tu paciente ideal'}, a $1.000.</p>
          <p><strong className="text-cream/90">Instalás el sistema</strong> — que atrae y agenda pacientes sin vos encima.</p>
          <p><strong className="text-cream/90">Vendés y entregás</strong> — con tu guión y tu protocolo, sin quemarte.</p>
        </div>
        <button
          onClick={() => setCurrentPage('roadmap')}
          className="mt-5 px-5 py-2.5 rounded-xl bg-gold text-ink text-sm font-bold hover:bg-goldhi transition-colors"
        >
          Ir a mi sesión de hoy →
        </button>
      </div>

      <p className="text-[11px] text-cream/25 text-center italic">
        El Camino ejecuta el Plan. Una sesión por día. Los imparables se construyen de días comunes.
      </p>
    </div>
  );
}
