/**
 * CARGAR UNA SESIÓN CON PERSONAS.
 *
 * ═══ QUÉ SE PUEDE CARGAR ACÁ Y NO EN «CARGAR SESIÓN» ═══
 *
 * La otra pantalla toma una transcripción y extrae las DECISIONES. Es útil y
 * se queda. Pero si una sesión no produjo una decisión, no quedaba nada — y
 * el hecho de que la sesión ocurrió es lo que sostiene la promesa de
 * acompañamiento, además de ser lo único que el cliente puede ver.
 *
 * Y las grupales no entraban en ningún lado: son tres por semana con varios
 * clientes a la vez.
 */
import { useState } from 'react';
import { Check, Loader2, Users } from 'lucide-react';
import { cargarSesion } from '../../lib/sesionesDatos';
import { COMO_SE_LLAMA, type TipoDeSesion } from '../../lib/sesionesHumanas';

const TIPOS: TipoDeSesion[] = ['grupal', 'uno_a_uno', 'arranque'];

function hoyISO(): string {
  const f = new Date();
  return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`;
}

export default function CargarSesionHumana({
  clientes, quienLaDio, onCargada,
}: {
  clientes: Array<{ id: string; nombre: string }>;
  quienLaDio: string;
  onCargada?: () => void;
}) {
  const [tipo, setTipo] = useState<TipoDeSesion>('grupal');
  const [fecha, setFecha] = useState(hoyISO());
  const [elegidos, setElegidos] = useState<Set<string>>(new Set());
  const [notas, setNotas] = useState('');
  const [pendiente, setPendiente] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [falla, setFalla] = useState<string | null>(null);
  const [listo, setListo] = useState(false);

  const alternar = (id: string) => {
    setElegidos((p) => {
      const n = new Set(p);
      // En una sesión individual hay una sola persona: elegir otra reemplaza.
      if (tipo !== 'grupal') { n.clear(); if (!p.has(id)) n.add(id); return n; }
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const guardar = async () => {
    if (!elegidos.size || guardando) return;
    setGuardando(true);
    setFalla(null);
    try {
      await cargarSesion({
        tipo, fecha, quienLaDio,
        clientes: [...elegidos],
        notas: notas.trim() || undefined,
        pendiente: pendiente.trim() || undefined,
      });
      setListo(true);
      setElegidos(new Set());
      setNotas('');
      setPendiente('');
      onCargada?.();
      window.setTimeout(() => setListo(false), 3500);
    } catch (err) {
      setFalla(err instanceof Error ? err.message : 'No se pudo guardar.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="rounded-2xl border border-gold/25 bg-espresso/40 p-5 space-y-4">
      <div>
        <h3 className="text-[19px] font-bold text-cream">Cargar una sesión</h3>
        <p className="text-[17px] text-cream/60 mt-1 leading-relaxed">
          Queda registrada para el cliente y cuenta como acompañamiento recibido.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {TIPOS.map((t) => (
          <button key={t} type="button"
            onClick={() => { setTipo(t); if (t !== 'grupal') setElegidos(new Set()); }}
            className={`min-h-[44px] rounded-xl border px-4 text-[17px] font-bold transition-colors ${
              tipo === t ? 'border-gold/50 bg-gold/10 text-gold'
                         : 'border-cream/10 bg-surface/30 text-cream/60 hover:border-cream/25'
            }`}>
            {COMO_SE_LLAMA[t]}
          </button>
        ))}
      </div>

      <div>
        <label className="block text-[16px] text-cream/60 mb-1">Cuándo fue</label>
        <input type="date" value={fecha} max={hoyISO()}
          onChange={(e) => setFecha(e.target.value)}
          className="w-full bg-surface/50 border border-[rgba(232,150,46,0.15)] rounded-xl px-3.5 py-2.5 text-[17px] text-cream focus:outline-none focus:border-gold/50 min-h-[44px]" />
      </div>

      <div>
        <p className="text-[16px] text-cream/60 mb-2">
          {tipo === 'grupal' ? 'Quiénes estuvieron' : 'Con quién fue'}
          {elegidos.size > 0 && <span className="text-gold"> · {elegidos.size}</span>}
        </p>
        <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
          {clientes.map((c) => {
            const puesto = elegidos.has(c.id);
            return (
              <button key={c.id} type="button" onClick={() => alternar(c.id)}
                className={`w-full min-h-[44px] flex items-center gap-3 rounded-xl border px-3.5 text-left transition-colors ${
                  puesto ? 'border-gold/50 bg-gold/10' : 'border-cream/10 hover:border-cream/25'
                }`}>
                <span className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                  puesto ? 'border-gold bg-gold text-black' : 'border-cream/25'
                }`}>
                  {puesto && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                </span>
                <span className="text-[17px] text-cream/85">{c.nombre}</span>
              </button>
            );
          })}
          {clientes.length === 0 && (
            <p className="text-[17px] text-cream/45 py-4">Todavía no hay clientes cargados.</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-[16px] text-cream/60 mb-1">Qué pasó</label>
        <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={3}
          placeholder="En dos líneas, para que el próximo que lo lea entienda."
          className="w-full bg-surface/50 border border-[rgba(232,150,46,0.15)] rounded-xl px-3.5 py-2.5 text-[17px] text-cream placeholder:text-cream/35 focus:outline-none focus:border-gold/50" />
      </div>

      <div>
        <label className="block text-[16px] text-cream/60 mb-1">Qué quedó para la próxima</label>
        <input value={pendiente} onChange={(e) => setPendiente(e.target.value)}
          placeholder="Lo que tiene que estar hecho antes de la siguiente."
          className="w-full bg-surface/50 border border-[rgba(232,150,46,0.15)] rounded-xl px-3.5 py-2.5 text-[17px] text-cream placeholder:text-cream/35 focus:outline-none focus:border-gold/50 min-h-[44px]" />
      </div>

      {falla && <p className="text-[17px] text-danger">{falla}</p>}
      {listo && (
        <p className="text-[17px] text-success flex items-center gap-2">
          <Check className="w-4 h-4" /> Cargada. Ya la ven en su app.
        </p>
      )}

      <button type="button" onClick={() => void guardar()}
        disabled={!elegidos.size || guardando}
        className="w-full btn-primary min-h-[44px] rounded-xl text-[17px] font-bold disabled:opacity-40 flex items-center justify-center gap-2">
        {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
        {elegidos.size === 0
          ? 'Elige quién estuvo'
          : `Guardar la sesión de ${elegidos.size === 1 ? 'una persona' : `${elegidos.size} personas`}`}
      </button>
    </section>
  );
}
