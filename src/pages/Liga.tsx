/**
 * Liga — T10 · EL JUEGO (Plan Maestro).
 * El hub del dojo: La Liga de Constancia (ranking por esfuerzo, jamás ventas),
 * El Muro de Hitos (logros de la cohorte, anónimos), la Perla del Maestro de
 * la etapa, y el Botón del Búnker (anti-abandono). Todo degrada con elegancia:
 * sin cohorte o sin RPC, muestra tu propio esfuerzo e hitos — nunca rompe.
 */
import React, { useEffect, useState } from 'react';
import { Trophy, Shield, Target, ChevronRight } from 'lucide-react';
import type { ProfileV2 } from '../lib/supabase';
import { fetchLigaSemanal, fetchMiEsfuerzo, type LigaEntry } from '../lib/ligaCalcs';
import { fetchMuroHitos, misHitos, type MuroEntry } from '../lib/muroHitos';
import { perlaParaEtapa } from '../lib/perlasMaestro';
import { calcularRacha } from '../lib/racha';
import { cinturonDesdeProgreso } from '../lib/cinturones';
import PerlaMaestro from '../components/PerlaMaestro';
import BunkerModal from '../components/BunkerModal';

function tiempoRelativo(iso: string): string {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const min = Math.floor((Date.now() - then) / 60000);
  if (min < 60) return `hace ${Math.max(1, min)} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.floor(h / 24)} d`;
}

export default function Liga({ userId, perfil }: { userId?: string; perfil?: Partial<ProfileV2> }) {
  const [liga, setLiga] = useState<LigaEntry[] | null>(null);
  const [muro, setMuro] = useState<MuroEntry[] | null>(null);
  const [mi, setMi] = useState<{ dias_activos: number; sesiones: number; puntos: number }>({
    dias_activos: 0,
    sesiones: 0,
    puntos: 0,
  });
  const [bunker, setBunker] = useState(false);

  // Progreso local → racha, cinturón, hitos propios (siempre disponibles).
  const completadasSet = (() => {
    try {
      return new Set<string>(JSON.parse(localStorage.getItem('tcd_hoja_ruta_v2') || '[]'));
    } catch {
      return new Set<string>();
    }
  })();
  const racha = (() => {
    try {
      return calcularRacha();
    } catch {
      return 0;
    }
  })();
  const cinturon = (() => {
    try {
      return cinturonDesdeProgreso(completadasSet);
    } catch {
      return null;
    }
  })();
  const mios = misHitos();
  const perla = perlaParaEtapa(mios.map((h) => h.codigo));

  useEffect(() => {
    let vivo = true;
    (async () => {
      if (userId) {
        const e = await fetchMiEsfuerzo(userId);
        if (vivo) setMi(e);
      }
      const l = await fetchLigaSemanal();
      if (vivo) setLiga(l);
      const m = await fetchMuroHitos();
      if (vivo) setMuro(m);
    })();
    return () => {
      vivo = false;
    };
  }, [userId]);

  const miPuntos = liga?.find((e) => e.es_tu)?.puntos ?? mi.puntos;
  const miPos = liga ? liga.findIndex((e) => e.es_tu) + 1 : 0;

  const tarjetas: Array<[string, string]> = [
    ['Días esta semana', String(mi.dias_activos)],
    ['Sesiones', String(mi.sesiones)],
    ['Puntos de esfuerzo', String(miPuntos)],
    ['Racha', `${racha} 🔥`],
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-light text-cream tracking-tight flex items-center gap-2">
          <Trophy className="w-6 h-6 text-gold" /> La Liga
        </h1>
        <p className="text-sm text-cream/65 mt-1">
          El dojo se mide por constancia, jamás por ventas. Se corre contra vos mismo — y en buena
          compañía.
        </p>
        {cinturon ? (
          <p className="text-[11px] text-cream/65 mt-2">
            {cinturon.emoji} Tu cinturón actual: <span className="text-gold font-medium">{cinturon.nombre}</span>
          </p>
        ) : null}
      </div>

      {/* Mi esfuerzo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {tarjetas.map(([label, value]) => (
          <div key={label} className="card-panel p-4">
            <p className="text-[11px] text-cream/55 uppercase tracking-widest mb-1 font-semibold">
              {label}
            </p>
            <p className="text-2xl font-light text-cream">{value}</p>
          </div>
        ))}
      </div>

      {/* Perla del Maestro (de la etapa actual) */}
      {perla ? <PerlaMaestro perla={perla.perla} /> : null}

      {/* La Liga de Constancia */}
      <div className="card-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[11px] font-bold text-cream tracking-widest uppercase flex items-center gap-2">
            <Trophy className="w-4 h-4 text-gold" /> Liga de Constancia · esta semana
          </h2>
          {miPos > 0 ? (
            <span className="text-[11px] text-gold font-bold uppercase tracking-wider">
              Vas #{miPos}
            </span>
          ) : null}
        </div>
        {liga && liga.length > 0 ? (
          <div className="space-y-1.5">
            {liga.map((e, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 border ${
                  e.es_tu ? 'bg-gold/[0.10] border-gold/30' : 'bg-white/[0.03] border-white/[0.06]'
                }`}
              >
                <span
                  className={`w-6 text-center text-sm font-bold ${
                    i === 0 ? 'text-gold' : 'text-cream/55'
                  }`}
                >
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${e.es_tu ? 'text-gold font-bold' : 'text-cream'}`}>
                    {e.es_tu ? 'Vos' : e.alias}
                  </p>
                  <p className="text-[11px] text-cream/55">
                    {e.dias_activos} días · {e.sesiones} sesiones
                  </p>
                </div>
                <span className="text-sm font-bold text-cream">{e.puntos}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 text-center">
            <p className="text-sm text-cream/70 mb-1">
              Tu esfuerzo de la semana: <span className="text-gold font-bold">{mi.puntos} puntos</span>
            </p>
            <p className="text-[11px] text-cream/55">
              La tabla de la cohorte se enciende cuando tus compañeros empiecen a sumar. Vos ya estás
              corriendo.
            </p>
          </div>
        )}
        <p className="text-[11px] text-cream/45 mt-3">
          Puntos = días activos + sesiones. Nunca ventas: acá se premia aparecer, no facturar.
        </p>
      </div>

      {/* El Muro de Hitos */}
      <div className="card-panel p-6">
        <h2 className="text-[11px] font-bold text-cream tracking-widest uppercase flex items-center gap-2 mb-4">
          <Target className="w-4 h-4 text-gold" /> El Muro de Hitos
        </h2>
        {muro && muro.length > 0 ? (
          <div className="space-y-2">
            {muro.map((h, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.06] px-3.5 py-2.5"
              >
                <span className="text-lg">{h.emoji}</span>
                <p className="flex-1 text-sm text-cream/85">
                  <span className={h.es_tu ? 'text-gold font-bold' : 'font-medium'}>
                    {h.es_tu ? 'Vos' : h.alias}
                  </span>{' '}
                  {h.label}
                </p>
                <span className="text-[11px] text-cream/35 shrink-0">{tiempoRelativo(h.cuando)}</span>
              </div>
            ))}
          </div>
        ) : mios.length > 0 ? (
          <div className="space-y-2">
            <p className="text-[11px] text-cream/45 mb-2">Tus hitos alcanzados:</p>
            {mios.map((h, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl bg-gold/[0.06] border border-gold/15 px-3.5 py-2.5"
              >
                <span className="text-lg">{h.emoji}</span>
                <p className="flex-1 text-sm text-cream/85">
                  <span className="text-gold font-bold">Vos</span> {h.label}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-cream/65">
            Todavía no hay hitos. El primero está cerca: tu Foto de Partida. Cada quiebre del camino
            aparece acá.
          </p>
        )}
        <p className="text-[11px] text-cream/45 mt-3">
          Los hitos de la cohorte son anónimos. Se celebra el logro, no el nombre.
        </p>
      </div>

      {/* Botón del Búnker */}
      <button
        onClick={() => setBunker(true)}
        className="w-full flex items-center justify-between gap-3 card-panel p-5 border border-gold/20 hover:border-gold/40 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-gold" />
          <div>
            <p className="text-sm text-cream font-medium">¿Día difícil? Entra al Búnker</p>
            <p className="text-[11px] text-cream/45">
              La voz de Javo, tu por qué y los compromisos que firmaste. Para los días que pesan.
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-cream/45" />
      </button>

      <BunkerModal open={bunker} onClose={() => setBunker(false)} perfil={perfil} />
    </div>
  );
}
