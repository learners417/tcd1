/**
 * EncabezadoCamino — la parte de arriba de El Camino (10-DISENO §5).
 *
 * Una sola acción por pantalla: el anillo dice dónde estás, la tarjeta de hoy
 * dice qué hacer, y el botón es el único importante.
 *
 *   Cinturón Blanco                 [tira]
 *   La semilla bajo la nieve
 *        ( anillo de 5 sistemas )
 *        15 de 91 pasos
 *   Sistema 1 de 5 · Tú
 *   Día 71 de 90 · tu próximo paso…
 *
 *   ┌ HOY ─────────────────────────┐
 *   │ Título                        │
 *   │ Una línea de qué es           │
 *   │ [20 min] [Sales con: …]       │
 *   │ [        Empezar          ]   │
 *   └───────────────────────────────┘
 *   0 de 10 pacientes        Registrar venta
 *
 * Sin degradé, sin porcentaje, sin mayúsculas espaciadas de más.
 * El único movimiento: el arco que avanza al completar un paso (400 ms).
 */
import React from 'react';
import { Phone, Stethoscope, BarChart3, CalendarDays } from 'lucide-react';
import TarjetaDeHoy, { type PasoDeHoy } from './TarjetaDeHoy';
import CintaCinturon from '../CintaCinturon';
import type { Cinturon } from '../../lib/cinturones';
import { VOC } from '../../lib/vocabulario';
import type { TonoRitmo } from '../../lib/diaPrograma';

export interface SistemaAvance {
  n: number;
  nombre: string;
  /** false para "La operación": las jornadas de campo y ciclo, sin sistema. */
  esSistema: boolean;
  hechas: number;
  total: number;
}

export type { PasoDeHoy };

interface Props {
  cinturon: Cinturon;
  sistemas: SistemaAvance[];
  sistemaActual: number | null;
  ritmo: { tono: TonoRitmo; texto: string };
  hoy: PasoDeHoy | null;
  esFinde: boolean;
  faseAutonomia: boolean;
  ventas: number;
  onEmpezar: () => void;
  onRegistrarVenta: () => void;
}

function Anillo({ sistemas, actual }: { sistemas: SistemaAvance[]; actual: number | null }) {
  const tam = 188;
  const c = tam / 2;
  const r = 78;
  const grueso = 10;
  const hueco = 10; // grados entre sistemas
  const n = Math.max(1, sistemas.length);
  const porcion = 360 / n;
  const hechas = sistemas.reduce((s, x) => s + x.hechas, 0);
  const total = sistemas.reduce((s, x) => s + x.total, 0);

  const arco = (desde: number, grados: number) => {
    const a0 = ((desde - 90) * Math.PI) / 180;
    const a1 = ((desde + grados - 90) * Math.PI) / 180;
    const x0 = c + r * Math.cos(a0), y0 = c + r * Math.sin(a0);
    const x1 = c + r * Math.cos(a1), y1 = c + r * Math.sin(a1);
    return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${grados > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
  };

  return (
    <div className="relative mx-auto" style={{ width: tam, height: tam }}>
      <svg width={tam} height={tam} viewBox={`0 0 ${tam} ${tam}`} aria-hidden="true">
        {sistemas.map((s, i) => {
          const desde = i * porcion + hueco / 2;
          const largo = porcion - hueco;
          const lleno = s.total > 0 ? largo * Math.min(1, s.hechas / s.total) : 0;
          const esActual = s.n === actual;
          return (
            <g key={s.n}>
              <path d={arco(desde, largo)} fill="none" stroke="var(--line2, #DFD3BC)" strokeWidth={grueso} strokeLinecap="round" />
              {lleno > 0.5 && (
                <path
                  d={arco(desde, lleno)}
                  fill="none"
                  stroke={esActual ? 'var(--oro, #B0822E)' : 'var(--oro-d, #8E6824)'}
                  strokeWidth={grueso}
                  strokeLinecap="round"
                  style={{ transition: 'd 400ms ease' }}
                />
              )}
            </g>
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[52px] leading-none text-goldhi" style={{ fontFamily: 'var(--font-display)', fontVariantNumeric: 'lining-nums' }}>
          {hechas}
        </span>
        <span className="mt-1 text-[15px] text-cream/65">de {total} pasos</span>
      </div>
    </div>
  );
}

export default function EncabezadoCamino({
  cinturon, sistemas, sistemaActual, ritmo, hoy, esFinde, faseAutonomia, ventas, onEmpezar, onRegistrarVenta,
}: Props) {
  const sis = sistemas.find((s) => s.n === sistemaActual) ?? null;

  return (
    <div className="space-y-4">
      {/* ── Dónde estás ── */}
      <section className="card-panel p-5 sm:p-6" aria-label="Tu avance">
        {/* El nombre de la pantalla ya está en la barra de arriba: acá va el grado. */}
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-[26px] leading-tight text-cream" style={{ fontFamily: 'var(--font-display)', fontStyle: 'normal' }}>
            Cinturón {cinturon.nombre}
          </h1>
          <CintaCinturon cinturon={cinturon} variante="tira" />
        </div>
        <p className="mt-1 text-[17px] text-cream/70">{cinturon.metafora}</p>

        <div className="mt-5">
          <Anillo sistemas={sistemas} actual={sistemaActual} />
        </div>

        {sis && (
          <p className="mt-4 text-center text-[17px] text-cream">
            {sis.esSistema
              ? <>Sistema {sis.n} de {sistemas.filter((x) => x.esSistema).length} · <span className="font-semibold">{sis.nombre}</span></>
              : <span className="font-semibold">{sis.nombre}</span>}
          </p>
        )}
        <p
          data-ritmo={ritmo.tono}
          className="mt-2 text-center text-[17px] leading-snug"
          style={{ color: ritmo.tono === 'al_dia' ? 'var(--tilde, #4A7C59)' : 'var(--oro-d, #8E6824)' }}
        >
          {ritmo.texto}{ritmo.tono === 'al_dia' ? ' ✓' : ''}
        </p>
      </section>

      {/* ── Qué hacer ── */}
      {hoy && <TarjetaDeHoy hoy={hoy} esFinde={esFinde} onEmpezar={onEmpezar} />}

      {/* ── La semana tipo, cuando el camino ya está construido ── */}
      {faseAutonomia && (
        <section className="card-panel p-5 sm:p-6" aria-label="Tu semana tipo">
          <p className="text-[15px] font-bold uppercase tracking-[0.16em]" style={{ color: 'var(--tilde, #4A7C59)' }}>
            Tu semana tipo
          </p>
          <ul className="mt-3 space-y-3 text-[17px] text-cream">
            <li className="flex items-center gap-3"><Phone className="w-5 h-5 text-gold shrink-0" /> Llamadas con interesados</li>
            <li className="flex items-center gap-3"><Stethoscope className="w-5 h-5 text-gold shrink-0" /> Entrega con tu protocolo</li>
            <li className="flex items-center gap-3"><BarChart3 className="w-5 h-5 text-gold shrink-0" /> Métricas y ajuste de campaña</li>
            <li className="flex items-center gap-3"><CalendarDays className="w-5 h-5 text-gold shrink-0" /> Tu revisión semanal, 20 minutos</li>
          </ul>
          <p className="mt-3 text-[17px] text-cream/70">{VOC('Tu clínica ya está construida. Ahora se opera: cada {{consultante}} nuevo aparece en tu tablero.')}</p>
        </section>
      )}

      {/* ── La meta, en una fila tranquila ── */}
      <div className="flex items-center justify-between gap-3 px-1">
        <p className="text-[17px] text-cream whitespace-nowrap">
          <span className="text-[24px] text-goldhi" style={{ fontFamily: 'var(--font-display)' }}>{ventas}</span> de 10 {VOC('{{consultantes}}')}
        </p>
        <button type="button" onClick={onRegistrarVenta} className="min-h-[44px] px-2 text-[17px] font-semibold text-goldhi whitespace-nowrap">
          Registrar venta
        </button>
      </div>
    </div>
  );
}
