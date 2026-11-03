/**
 * EspejoIdentidadModal.tsx — el cierre de la primera fase.
 *
 * El sanador ve juntas, por primera vez, las cuatro piezas de su identidad
 * —historia, propósito, legado y los cinco NO— y se le pregunta si se
 * reconoce. Sobrio y reflexivo, no celebratorio.
 *
 * ═══ POR QUÉ ACÁ SE ESCRIBE Y NO SOLO SE LEE ═══
 *
 * La pantalla mostraba las cuatro y, cuando una faltaba, mandaba a buscarla a
 * la jornada donde se escribía. Tres de esas cuatro jornadas ya no existen:
 * el propósito, el legado y los cinco NO quedaron de una versión anterior del
 * método y hoy no se escriben en ningún día del Camino. Así que el espejo
 * mandaba a un lugar que no está.
 *
 * Había tres salidas. Volver a crear tres jornadas, y el Camino se alarga tres
 * días. Sacar las piezas del espejo, y se pierden justo las tres que más
 * dicen quién es. O escribirlas acá.
 *
 * Se escriben acá. Es menos pasos que ir a buscarlas, no suma un solo día al
 * Camino, y sobre todo es el momento en que el cliente sabe qué poner: se
 * está mirando entero, que es exactamente para lo que existe esta pantalla.
 */

import { useEffect, useState } from 'react';
import { Sparkles, ChevronRight, Edit3 } from 'lucide-react';
import type { AdnCincoNo } from '../lib/supabase';

interface EspejoIdentidadModalProps {
  /** Historia corta (50 palabras) · `profiles.historia_50`. */
  historiaCorta?: string;
  /** Propósito en una frase · `profiles.proposito`. */
  propositoFrase?: string;
  /** Declaración de legado · `profiles.legado`. */
  legadoDeclaracion?: string;
  /** 5 NOs · `profiles.adn_cinco_no`. */
  cincoNo?: AdnCincoNo | null;
  /** Confirma y cierra (continúa a F2). */
  onConfirmar: () => void;
  /** Va al editor a corregir antes de cerrar F1. */
  onEditar: () => void;
  /** Guarda una pieza escrita acá mismo. Sin esto, el espejo solo se lee. */
  onGuardarPieza?: (campos: Record<string, unknown>) => void;
}

export default function EspejoIdentidadModal({
  historiaCorta,
  propositoFrase,
  legadoDeclaracion,
  cincoNo,
  onConfirmar,
  onEditar,
  onGuardarPieza,
}: EspejoIdentidadModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleClose = (action: () => void) => {
    setVisible(false);
    setTimeout(action, 200);
  };

  const nos = cincoNo?.nos?.filter((n) => n && n.trim()) ?? [];

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center px-4 transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ background: 'rgba(0, 0, 0, 0.85)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="espejo-titulo"
    >
      <div
        className={`max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl border border-gold/30 bg-ink p-8 shadow-2xl transition-transform duration-300 ${
          visible ? 'scale-100' : 'scale-95'
        }`}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-gold" />
          </div>
          <p className="text-sm uppercase tracking-widest text-gold font-bold mb-2">
            Cierre de Fase 1 · Identidad
          </p>
          <h2
            id="espejo-titulo"
            className="text-2xl md:text-3xl font-light text-cream tracking-tight leading-tight"
            style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}
          >
            Espejo de Identidad
          </h2>
        </div>

        {/* 4 piezas */}
        <div className="space-y-5">
          {/* El código de la meta es del equipo: el cliente ve el día, igual
              que en el Camino. Si algún día cambia de lugar, el texto lo sigue. */}
          <Pieza
            titulo="Tu historia"
            valor={historiaCorta}
            pedido="De dónde vienes y por qué esta profesión, en cincuenta palabras."
            onGuardar={onGuardarPieza ? (t) => onGuardarPieza({ historia_50: t }) : undefined}
          />
          <Pieza
            titulo="Tu propósito"
            valor={propositoFrase}
            pedido="En una frase: para qué haces lo que haces. Es lo que sostiene tu precio cuando tiemblas."
            filas={2}
            onGuardar={onGuardarPieza ? (t) => onGuardarPieza({ proposito: t }) : undefined}
          />
          <Pieza
            titulo="Tu legado"
            valor={legadoDeclaracion}
            pedido="Qué quieres que quede cuando tú ya no estés en la sala."
            onGuardar={onGuardarPieza ? (t) => onGuardarPieza({ legado: t }) : undefined}
          />

          {/* 5 NOs · lista */}
          <div className="card-panel p-5 border border-gold/15 bg-gold/[0.03]">
            <p className="text-sm uppercase tracking-widest font-bold text-gold mb-3">
              Tus 5 NO
            </p>
            {nos.length > 0 ? (
              <ul className="space-y-2">
                {nos.map((no, idx) => (
                  <li
                    key={idx}
                    className="text-sm text-cream/90 leading-relaxed flex gap-3"
                  >
                    <span className="text-gold font-mono text-xs mt-0.5">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="flex-1">{no}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <CincoNo onGuardar={onGuardarPieza ? (lista) => onGuardarPieza({ adn_cinco_no: { nos: lista } }) : undefined} />
            )}
          </div>
        </div>

        {/* Cita central */}
        <div className="my-8 py-6 border-y border-gold/15 text-center">
          <p
            className="text-lg md:text-xl text-cream/90 leading-relaxed"
            style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}
          >
            Esto es lo que eres. Esto es lo que viniste a hacer.
            <br />
            Esto es lo que va a quedar.
          </p>
          <p
            className="text-2xl md:text-3xl text-gold mt-4 font-light tracking-tight"
            style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}
          >
            ¿Te reconoces?
          </p>
        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => handleClose(onEditar)}
            className="flex-1 btn-secondary flex items-center justify-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            Quiero editar algo
          </button>
          <button
            type="button"
            onClick={() => handleClose(onConfirmar)}
            className="flex-1 btn-primary flex items-center justify-center gap-2"
          >
            Confirmar y seguir a Fase 2
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Los cinco NO: a quién no atiendes, qué no haces, qué no aceptas.
 *
 * Se escriben los cinco de una, porque uno solo no es un filtro. El botón
 * guarda recién cuando están los cinco: tres NO dejan pasar lo que el cuarto
 * hubiera frenado.
 */
function CincoNo({ onGuardar }: { onGuardar?: (lista: string[]) => void }) {
  const [lista, setLista] = useState<string[]>(['', '', '', '', '']);
  const [editando, setEditando] = useState(false);
  const listos = lista.filter((n) => n.trim()).length;

  if (!onGuardar) {
    return <p className="text-[15px] text-cream/55">Todavía no los tienes escritos.</p>;
  }

  if (!editando) {
    return (
      <div>
        <p className="text-[17px] text-cream/70">
          Cinco cosas que ya no aceptas: a quién no atiendes, qué no haces, en qué horario no estás.
        </p>
        <button type="button" onClick={() => setEditando(true)} className="btn-ios-primary mt-3 w-full">
          Escribirlos ahora
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {lista.map((n, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-6 shrink-0 text-[15px] text-goldhi" style={{ fontVariantNumeric: 'lining-nums tabular-nums' }}>
            {String(i + 1).padStart(2, '0')}
          </span>
          <input
            value={n}
            onChange={(e) => setLista((p) => p.map((x, j) => (j === i ? e.target.value : x)))}
            placeholder="No…"
            className="min-h-[48px] w-full min-w-0 rounded-xl border bg-transparent px-3 text-[17px] text-cream focus:outline-none"
            style={{ borderColor: 'var(--line2, #DFD3BC)' }}
          />
        </div>
      ))}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          disabled={listos < 5}
          onClick={() => { onGuardar(lista.map((n) => n.trim())); setEditando(false); }}
          className="btn-ios-primary flex-1 disabled:opacity-50"
        >
          {listos < 5 ? `Falta${5 - listos > 1 ? 'n' : ''} ${5 - listos}` : 'Guardar los cinco'}
        </button>
        <button
          type="button"
          onClick={() => setEditando(false)}
          className="min-h-[52px] rounded-[20px] border px-4 text-[17px] text-cream"
          style={{ borderColor: 'var(--line2, #DFD3BC)' }}
        >
          Dejarlo
        </button>
      </div>
    </div>
  );
}

interface PiezaProps {
  titulo: string;
  valor?: string;
  /** Lo que se le pide escribir cuando la pieza está vacía. */
  pedido: string;
  /** Guarda lo escrito. Sin esto la pieza solo se lee. */
  onGuardar?: (texto: string) => void;
  filas?: number;
}

/**
 * Una pieza del espejo. Si está escrita, se lee. Si no, se escribe acá mismo.
 *
 * Antes mandaba a otra pantalla, y a tres de las cuatro las mandaba a
 * jornadas que ya no existen. Escribirla en el momento en que el cliente ve
 * que falta es menos pasos que ir a buscarla, y es el momento en que sabe
 * qué poner: se está mirando entero.
 */
function Pieza({ titulo, valor, pedido, onGuardar, filas = 3 }: PiezaProps) {
  const tieneValor = typeof valor === 'string' && valor.trim().length > 0;
  const [borrador, setBorrador] = useState('');
  const [editando, setEditando] = useState(false);

  const guardar = () => {
    const t = borrador.trim();
    if (!t) return;
    onGuardar?.(t);
    setEditando(false);
  };

  return (
    <div className="card-panel p-5 border border-[var(--line, rgba(142,104,36,0.18))]">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[15px] uppercase tracking-[0.16em] font-bold text-goldhi">{titulo}</p>
        {tieneValor && onGuardar && !editando && (
          <button
            type="button"
            onClick={() => { setBorrador(valor ?? ''); setEditando(true); }}
            className="shrink-0 min-h-[44px] text-[15px] font-semibold text-goldhi"
          >
            Cambiarla
          </button>
        )}
      </div>

      {tieneValor && !editando && (
        <p className="mt-2 text-[17px] text-cream leading-relaxed whitespace-pre-wrap break-words">{valor}</p>
      )}

      {!tieneValor && !editando && (
        <div className="mt-2">
          <p className="text-[17px] text-cream/70">{pedido}</p>
          {onGuardar ? (
            <button type="button" onClick={() => setEditando(true)} className="btn-ios-primary mt-3 w-full">
              Escribirla ahora
            </button>
          ) : (
            <p className="mt-2 text-[15px] text-cream/55">Todavía no la tienes escrita.</p>
          )}
        </div>
      )}

      {editando && (
        <div className="mt-2 space-y-2">
          <p className="text-[15px] text-cream/70">{pedido}</p>
          <textarea
            value={borrador}
            onChange={(e) => setBorrador(e.target.value)}
            rows={filas}
            autoFocus
            className="w-full rounded-xl border bg-transparent px-3.5 py-2.5 text-[17px] text-cream focus:outline-none"
            style={{ borderColor: 'var(--line2, #DFD3BC)' }}
          />
          <div className="flex gap-2">
            <button type="button" onClick={guardar} disabled={!borrador.trim()} className="btn-ios-primary flex-1 disabled:opacity-50">
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setEditando(false)}
              className="min-h-[52px] rounded-[20px] border px-4 text-[17px] text-cream"
              style={{ borderColor: 'var(--line2, #DFD3BC)' }}
            >
              Dejarlo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
