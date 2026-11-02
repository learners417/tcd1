/**
 * TU TABLERO — la matemática de los 10, viva (ZIP C).
 * Tres números por semana. Un diagnóstico. Una acción.
 */
import { useState } from 'react';
import { VOC } from '../lib/vocabulario';
import {
  cadenaPara, metaSemanal, semanaActual, registrarSemana, ventasTotales,
  diagnosticar, META_PACIENTES,
} from '../lib/tablero';

export default function TableroNumeros({ dia = 30 }: { dia?: number }) {
  const hechas = ventasTotales();
  const total = cadenaPara(Math.max(1, META_PACIENTES - hechas));
  const meta = metaSemanal(dia, hechas);
  const yaCargada = semanaActual();

  const [abierto, setAbierto] = useState(false);
  const [conv, setConv] = useState(String(yaCargada?.conversaciones ?? ''));
  const [llam, setLlam] = useState(String(yaCargada?.llamadas ?? ''));
  const [vent, setVent] = useState(String(yaCargada?.ventas ?? ''));
  const [guardada, setGuardada] = useState<typeof yaCargada>(yaCargada);

  const dx = guardada ? diagnosticar(guardada, meta) : null;

  function guardar() {
    const s = { conversaciones: Number(conv) || 0, llamadas: Number(llam) || 0, ventas: Number(vent) || 0 };
    registrarSemana(s);
    setGuardada({ ...s, fecha: '' });
    setAbierto(false);
  }

  /*
   * ─── LA CADENA VA EN VERTICAL ──────────────────────────────────────────
   *
   * Los cuatro eslabones estaban en un renglón, repartiéndose el ancho del
   * teléfono: a 390 px le tocan unos 85 a cada uno, y «conversaciones» pide
   * más de 100. Los rótulos se montaban unos sobre otros —medido: la lente de
   * desborde caza los cuatro— en la pantalla principal del cliente.
   *
   * No se vio antes porque esta tarjeta solo aparece los días de cierre de
   * semana, y el medidor corría con el reloj de la máquina. Ahora el reloj va
   * fijo en un lunes, que es cuando se ve.
   *
   * En vertical cada rótulo tiene el ancho entero y los números quedan
   * alineados por su columna, que es como se lee una cadena: de arriba abajo,
   * viendo dónde se corta.
   */
  const Eslabon = ({ n, label }: { n: number; label: string }) => (
    <div className="flex items-baseline gap-3">
      <p className="w-16 shrink-0 text-right text-lg font-semibold text-gold num-tab"
         style={{ fontFamily: 'var(--font-display)' }}>{n}</p>
      <p className="text-xs text-cream/60">{label}</p>
    </div>
  );

  const esViernes = new Date().getDay() === 5;
  const pideNumeros = esViernes && !guardada;

  return (
    <div className={`card-panel p-5 ${pideNumeros ? 'border border-gold/40' : ''}`}>
      <div className="flex items-baseline justify-between mb-1">
        <p className="text-[15px] font-bold uppercase tracking-[0.16em] text-cream/60">Tu tablero</p>
        <p className="text-sm font-bold text-gold">{hechas} de {META_PACIENTES} pacientes</p>
      </div>
      <p className="text-xs text-cream/50 mb-4">
        {pideNumeros ? 'Hoy es viernes: carga tus 3 números y sabrás qué corregir.' : 'Lo que falta, en números — no en ganas.'}
      </p>

      {/* La línea de la izquierda hace de cadena: une los cuatro sin flechas
          que, en vertical, apuntarían al costado. */}
      <div className="space-y-2 border-l border-[var(--line2,#DFD3BC)] pl-3">
        <Eslabon n={total.conversaciones} label="conversaciones" />
        <Eslabon n={total.agendas} label="agendas" />
        <Eslabon n={total.llamadas} label="llamadas" />
        <Eslabon n={total.ventas} label={VOC('{{consultantes}}')} />
      </div>

      <p className="text-xs text-cream/70 mt-4 leading-relaxed border-t border-cream/10 pt-3">
        Esta semana: <strong className="text-cream">{meta.conversaciones} conversaciones</strong> (unas {Math.ceil(meta.conversaciones / 5)} por día),{' '}
        <strong className="text-cream">{meta.llamadas} llamadas</strong>. Tu agente atiende el chat; tú tomas las llamadas.
      </p>

      {dx && (
        <div className={`mt-4 rounded-xl border px-4 py-3 ${dx.cuello === 'ninguno' ? 'border-success/30 bg-success/[0.05]' : 'border-gold/30 bg-gold/[0.05]'}`}>
          <p className={`text-sm font-semibold ${dx.cuello === 'ninguno' ? 'text-success' : 'text-gold'}`}>{VOC(dx.titulo)}</p>
          <p className="text-xs text-cream/70 mt-1 leading-relaxed">{dx.detalle}</p>
          <p className="text-xs text-cream/85 mt-2 leading-relaxed"><strong>Esta semana:</strong> {dx.accion}</p>
        </div>
      )}

      {abierto ? (
        <div className="mt-4 space-y-2">
          {[
            { v: conv, set: setConv, l: 'Conversaciones nuevas' },
            { v: llam, set: setLlam, l: 'Llamadas que sí ocurrieron' },
            { v: vent, set: setVent, l: 'Pacientes que dijeron que sí' },
          ].map((c) => (
            <div key={c.l} className="flex items-center gap-3">
              <label className="text-xs text-cream/70 flex-1">{c.l}</label>
              <input type="number" min="0" inputMode="numeric" value={c.v} onChange={(e) => c.set(e.target.value)}
                className="w-20 bg-surface/50 border border-[var(--line, rgba(142,104,36,0.18))] rounded-xl px-3 py-2 text-sm text-cream text-center focus:outline-none focus:border-gold/50" />
            </div>
          ))}
          <button onClick={guardar} className="w-full btn-primary text-sm font-bold py-2.5 rounded-xl mt-1">Guardar mi semana</button>
        </div>
      ) : (
        <button onClick={() => setAbierto(true)} className="mt-3 text-xs font-bold text-gold hover:text-goldhi">
          {guardada ? 'Corregir mis números de esta semana →' : 'Cargar mis 3 números de esta semana →'}
        </button>
      )}
    </div>
  );
}
