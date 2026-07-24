/**
 * EL MONTAJE — los 8 candados (T4 del Manual de Anuncios).
 * Nada se enciende hasta que TODO está tildado. Un solo punto flojo quema
 * el presupuesto entero. Al encender, se guarda la fecha: el tablero y la
 * regla de los 14 días cuentan desde ahí.
 */
import React, { useState } from 'react';
import TableroCupos from './TableroCupos';

const KEY = 'tcd_montaje_v1';
const KEY_ON = 'tcd_campana_encendida_v1';

const CANDADOS: { id: string; titulo: string; detalle: string; accion?: 'anuncios' }[] = [
  { id: 'anuncios', titulo: 'Tus 3 anuncios escritos y auditados', detalle: 'Una de piedras, una de dolor o historia, una de resultado — cada una con su auditoría de ingredientes en verde.', accion: 'anuncios' },
  { id: 'palabra', titulo: 'Tu PALABRA configurada y PROBADA', detalle: 'Comentaste desde otra cuenta y llegó el DM con tu link. Si no llegó, no está lista.' },
  { id: 'dm', titulo: 'Tu DM con su pregunta + el seguimiento', detalle: 'La respuesta automática entrega tu página y hace UNA pregunta sobre su situación. El seguimiento de 24-48 h queda programado.' },
  { id: 'pagina', titulo: 'Tu página: precio, agenda y preguntas', detalle: 'Inversión visible («desde $X»), agenda DESPUÉS del precio y tus 3-4 preguntas de reserva activas.' },
  { id: 'pixel', titulo: 'El píxel activo en tu página', detalle: 'Instalado y verificado: cada visita queda registrada para tu público de mañana.' },
  { id: 'perfil', titulo: 'Tu perfil ordenado', detalle: 'El link de tu bio apunta a tu página de venta. Tus destacadas muestran quién eres y qué haces.' },
  { id: 'trabajo', titulo: 'Tu único trabajo, claro', detalle: 'Atender las conversaciones de quienes contestan tu pregunta. Nada más. La campaña hace el resto.' },
  { id: 'presupuesto', titulo: 'Presupuesto definido: 14 días sin tocar', detalle: 'Una sola campaña, un solo objetivo, 20-25 USD por día. Los primeros 14 días no se opina — se mide.' },
];

function leer<T>(k: string, def: T): T {
  try { return JSON.parse(localStorage.getItem(k) ?? '') as T; } catch { return def; }
}

export default function MontajeCupos({ onIrAnuncios }: { onIrAnuncios?: () => void }) {
  const [checks, setChecks] = useState<Record<string, boolean>>(() => leer(KEY, {}));
  const [encendida, setEncendida] = useState<string | null>(() => leer<string | null>(KEY_ON, null));

  const toggle = (id: string) => {
    const n = { ...checks, [id]: !checks[id] };
    setChecks(n);
    try { localStorage.setItem(KEY, JSON.stringify(n)); } catch { /* noop */ }
  };
  const listos = CANDADOS.filter((c) => checks[c.id]).length;
  const todo = listos === CANDADOS.length;

  const encender = () => {
    if (!todo) return;
    const fecha = new Date().toISOString();
    setEncendida(fecha);
    try { localStorage.setItem(KEY_ON, JSON.stringify(fecha)); } catch { /* noop */ }
  };

  if (encendida) {
    const dias = Math.max(1, Math.floor((Date.now() - new Date(encendida).getTime()) / 86400000) + 1);
    return (
      <div className="card-panel p-6 text-center space-y-3">
        <p className="text-4xl">🔴</p>
        <p className="text-xl text-cream" style={{ fontFamily: 'var(--font-display)' }}>Campaña viva — día {Math.min(dias, 99)}</p>
        {dias <= 14 ? (
          <p className="text-sm text-cream/70">Estás en los primeros 14 días: <strong className="text-gold">no se opina, se mide</strong>. Faltan {14 - dias + 1} días para decidir. Carga tus conversaciones cada día en el Tablero.</p>
        ) : (
          <p className="text-sm text-cream/70">Pasaste los 14 días: ahora las reglas deciden. Tu Tablero te dice qué se apaga, qué queda y cuándo refrescar el creativo.</p>
        )}
<TableroCupos diasCampana={dias} />
        <button onClick={() => { setEncendida(null); try { localStorage.removeItem(KEY_ON); } catch { /* noop */ } }}
          className="text-[11px] text-cream/40 underline underline-offset-2">Apagué la campaña — volver al montaje</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold mb-1">El montaje</p>
        <h2 className="text-xl text-cream" style={{ fontFamily: 'var(--font-display)' }}>Tus 8 candados — {listos} de 8</h2>
        <p className="text-sm text-cream/60 mt-1">Nada se enciende hasta que todo está tildado. Un solo punto flojo quema el presupuesto entero.</p>
      </div>
      <div className="space-y-2">
        {CANDADOS.map((c, i) => (
          <button key={c.id} onClick={() => toggle(c.id)}
            className={`w-full text-left rounded-2xl border p-4 transition-colors ${checks[c.id] ? 'border-success/40 bg-success/[0.05]' : 'border-cream/10 hover:border-cream/25'}`}>
            <div className="flex items-start gap-3">
              <span className={`mt-0.5 w-6 h-6 rounded-full border flex items-center justify-center text-xs shrink-0 ${checks[c.id] ? 'border-success bg-success text-black font-bold' : 'border-cream/25 text-cream/40'}`}>
                {checks[c.id] ? '✓' : i + 1}
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold text-cream">{c.titulo}</span>
                <span className="block text-xs text-cream/55 mt-0.5 leading-relaxed">{c.detalle}</span>
                {c.accion === 'anuncios' && onIrAnuncios && (
                  <span onClick={(e) => { e.stopPropagation(); onIrAnuncios(); }}
                    className="inline-block text-[11px] font-bold text-gold mt-1.5 hover:text-goldhi">Abrir el Constructor →</span>
                )}
              </span>
            </div>
          </button>
        ))}
      </div>
      <button onClick={encender} disabled={!todo}
        className="w-full btn-primary py-4 rounded-xl text-sm font-bold disabled:opacity-40">
        {todo ? '🚀 ENCENDER — y anotar la fecha' : `Faltan ${8 - listos} candados para encender`}
      </button>
    </div>
  );
}
