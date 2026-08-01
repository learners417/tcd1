import { useState } from 'react';
import { Check, X, Loader } from 'lucide-react';
import { generateText } from '../../lib/aiProvider';
import { crearNotificacion } from '../../lib/notifications';
import { guardarDecision } from '../../lib/salaDeMandoStorage';
import { mensajeDeFalla } from '../../lib/conexion';
import {
  promptDeExtraccion, leerExtraccion, puedeExtraerse, resumirExtraccion,
  EXTRACCION_VACIA, type Extraccion, type Pendiente,
} from '../../lib/transcripcion';

/**
 * CARGAR LA SESIÓN.
 *
 * Se pega la transcripción, la app propone tres cosas, y **quien dio la
 * sesión confirma o corrige antes de que se guarde nada**. Ese paso no es
 * burocracia: una transcripción mal leída que se guarda sola se convierte en
 * un dato falso con apariencia de registro, y después alguien decide sobre
 * él.
 *
 * Lo que se guarda cuando confirma:
 *   · las decisiones → al registro de decisiones
 *   · los pendientes del cliente → un aviso dentro de su app
 *   · el resumen → se lo lleva él, escrito para él
 */

const ETIQUETA_DUENO: Record<Pendiente['dueno'], string> = {
  cliente: 'lo hace el cliente',
  equipo: 'lo hace el equipo',
  sin_asignar: 'sin dueño',
};

export default function CargarSesion({
  clienteId,
  nombreCliente,
  quienLaDio,
  onGuardada,
}: {
  clienteId: string;
  nombreCliente: string;
  quienLaDio: string;
  onGuardada?: () => void;
}) {
  const [texto, setTexto] = useState('');
  const [extraccion, setExtraccion] = useState<Extraccion | null>(null);
  const [leyendo, setLeyendo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [problema, setProblema] = useState<string | null>(null);
  const [listo, setListo] = useState(false);

  /** Lo que quien cargó desmarcó: no se guarda. */
  const [fuera, setFuera] = useState<Set<string>>(new Set());
  const toggle = (k: string) => setFuera((f) => {
    const n = new Set(f);
    if (n.has(k)) n.delete(k); else n.add(k);
    return n;
  });

  const validacion = puedeExtraerse(texto);

  const leer = async () => {
    setLeyendo(true);
    setProblema(null);
    try {
      const bruto = await generateText({
        // Tarea 'estructura': no necesita voz, necesita obedecer el esquema
        // y no inventar. Lo que se invente acá termina en el registro.
        tarea: 'estructura',
        feature: 'sesion',
        systemInstruction:
          'Extraes información de transcripciones. Respondes SOLO JSON válido, ' +
          'sin markdown. Nunca inventas: si algo no está en el texto, no está.',
        prompt: promptDeExtraccion(texto, nombreCliente),
      });
      setExtraccion(leerExtraccion(String(bruto ?? '')));
    } catch (err) {
      setProblema(mensajeDeFalla(err, 'leer la sesión'));
    } finally {
      setLeyendo(false);
    }
  };

  const guardar = async () => {
    if (!extraccion) return;
    setGuardando(true);
    setProblema(null);
    try {
      // Las decisiones que sobrevivieron a la revisión.
      for (const [i, d] of extraccion.decisiones.entries()) {
        if (fuera.has(`d${i}`)) continue;
        await guardarDecision({
          titulo: d,
          contexto: `Sesión con ${nombreCliente}, con ${quienLaDio}.`,
          clienteId,
        });
      }

      // Lo que le toca al cliente le llega adentro de la app.
      const suyos = extraccion.pendientes.filter(
        (p, i) => p.dueno === 'cliente' && !fuera.has(`p${i}`));
      if (suyos.length > 0 || extraccion.resumenParaElCliente) {
        await crearNotificacion({
          usuario_id: clienteId,
          tipo: 'admin',
          titulo: `Lo que acordaron con ${quienLaDio}`,
          descripcion: [
            extraccion.resumenParaElCliente,
            ...suyos.map((p) => `· ${p.que}${p.cuando ? ` (${p.cuando})` : ''}`),
          ].filter(Boolean).join('\n').slice(0, 500),
          accion_url: '/dashboard',
        });
      }

      setListo(true);
      onGuardada?.();
    } catch (err) {
      // El trabajo de la sesión no se pierde por un problema de red.
      setProblema(`${mensajeDeFalla(err, 'guardar la sesión')} Lo leído sigue acá.`);
    } finally {
      setGuardando(false);
    }
  };

  if (listo) {
    return (
      <div className="rounded-2xl border border-success/30 bg-success/[0.05] p-5">
        <p className="text-sm text-cream/85">
          Guardado. Las decisiones quedaron en el registro y {nombreCliente} ya
          tiene el resumen de lo acordado en su app.
        </p>
        <button
          onClick={() => {
            setListo(false); setTexto(''); setExtraccion(null); setFuera(new Set());
          }}
          className="text-sm font-bold text-gold hover:text-goldhi mt-2">
          Cargar otra sesión
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* ── PEGAR ── */}
      {!extraccion && (
        <div className="rounded-2xl border border-cream/12 p-4">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-cream/50 mb-1">
            La sesión con {nombreCliente}
          </p>
          <p className="text-sm text-cream/50 mb-3">
            Pega la transcripción completa. Lo que no se carga vive en la cabeza
            de quien dio la sesión, y el que sigue arranca de cero.
          </p>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={8}
            placeholder="Pega acá la transcripción de Fathom, Fireflies, o de donde la tengas…"
            className="w-full bg-surface/40 border border-cream/15 rounded-xl px-3 py-2 text-sm text-cream" />

          <div className="flex items-center justify-between gap-3 mt-2">
            <p className="text-sm text-cream/40">
              {validacion.puede
                ? `${texto.trim().length.toLocaleString()} caracteres`
                : validacion.porque}
            </p>
            <button onClick={() => void leer()} disabled={!validacion.puede || leyendo}
              className="btn-primary px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-40 shrink-0">
              {leyendo ? <><Loader size={12} className="inline animate-spin mr-1" />Leyendo…</> : 'Leer la sesión'}
            </button>
          </div>
        </div>
      )}

      {problema && (
        <div className="rounded-2xl border border-danger/35 bg-danger/[0.06] p-4">
          <p className="text-sm text-cream/85">{problema}</p>
        </div>
      )}

      {/* ── REVISAR ── */}
      {extraccion && (
        <>
          <div className="rounded-2xl border border-gold/30 bg-gold/[0.04] p-4">
            <p className="text-sm text-cream">{resumirExtraccion(extraccion)}</p>
            <p className="text-sm text-cream/50 mt-1">
              Desmarca lo que esté mal leído. Nada se guarda sin que lo mires.
            </p>
          </div>

          {extraccion.decisiones.length > 0 && (
            <Bloque titulo="Lo que se decidió"
              nota="Va al registro de decisiones del negocio.">
              {extraccion.decisiones.map((d, i) => (
                <Fila key={`d${i}`} texto={d}
                  fuera={fuera.has(`d${i}`)} onToggle={() => toggle(`d${i}`)} />
              ))}
            </Bloque>
          )}

          {extraccion.pendientes.length > 0 && (
            <Bloque titulo="Lo que queda pendiente"
              nota="Lo del cliente le llega adentro de su app.">
              {extraccion.pendientes.map((p, i) => (
                <Fila key={`p${i}`}
                  texto={`${p.que}${p.cuando ? ` — ${p.cuando}` : ''}`}
                  sub={ETIQUETA_DUENO[p.dueno]}
                  fuera={fuera.has(`p${i}`)} onToggle={() => toggle(`p${i}`)} />
              ))}
            </Bloque>
          )}

          {extraccion.cambios.length > 0 && (
            <Bloque titulo="Lo que cambió en su situación"
              nota="Para actualizar su ficha.">
              {extraccion.cambios.map((c, i) => (
                <Fila key={`c${i}`} texto={c}
                  fuera={fuera.has(`c${i}`)} onToggle={() => toggle(`c${i}`)} />
              ))}
            </Bloque>
          )}

          {extraccion.resumenParaElCliente && (
            <div className="rounded-2xl border border-cream/12 p-4">
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-cream/50 mb-1">
                Lo que va a leer {nombreCliente}
              </p>
              <p className="text-sm text-cream/85 leading-relaxed">
                {extraccion.resumenParaElCliente}
              </p>
            </div>
          )}

          {extraccion.vacia && (
            <p className="text-sm text-cream/55">
              No se pudo sacar nada en limpio de esta transcripción. Puede pasar
              con audios cortados o con sesiones que fueron sobre todo escucha.
            </p>
          )}

          <div className="flex gap-2">
            <button onClick={() => { setExtraccion(null); setFuera(new Set()); }}
              className="px-4 py-2.5 rounded-xl border border-cream/15 text-cream/70 text-sm">
              Volver
            </button>
            <button onClick={() => void guardar()}
              disabled={guardando || extraccion.vacia}
              className="flex-1 btn-primary py-2.5 rounded-xl text-sm font-bold disabled:opacity-40">
              {guardando ? 'Guardando…' : 'Confirmar y guardar'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function Bloque(
  { titulo, nota, children }: { titulo: string; nota: string; children: React.ReactNode },
) {
  return (
    <div className="rounded-2xl border border-cream/12 p-4">
      <p className="text-sm font-bold uppercase tracking-[0.25em] text-cream/50">{titulo}</p>
      <p className="text-sm text-cream/40 mb-3">{nota}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Fila(
  { texto, sub, fuera, onToggle }: {
    texto: string; sub?: string; fuera: boolean; onToggle: () => void;
  },
) {
  return (
    <button onClick={onToggle}
      className={`w-full text-left flex gap-2.5 items-start rounded-xl border p-3 transition ${
        fuera ? 'border-cream/[0.08] opacity-40' : 'border-cream/15'}`}>
      <span className={`mt-0.5 shrink-0 ${fuera ? 'text-cream/30' : 'text-success'}`}>
        {fuera ? <X size={13} /> : <Check size={13} />}
      </span>
      <span>
        <span className={`text-sm block ${fuera ? 'text-cream/45 line-through' : 'text-cream/85'}`}>
          {texto}
        </span>
        {sub && <span className="text-sm text-cream/45">{sub}</span>}
      </span>
    </button>
  );
}
