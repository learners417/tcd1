import { useEffect, useState } from 'react';
import { Loader, X } from 'lucide-react';
import {
  pendientesDeRevisar, sacarDeLaCola, deQuienEra,
  type TranscripcionRecibida,
} from '../../lib/transcripcionesRecibidas';

/**
 * LO QUE LLEGÓ DE FATHOM Y NADIE REVISÓ — turno 14
 *
 * El webhook deja las transcripciones en una cola; esto las pone arriba de
 * «Cargar sesión», que es la pantalla donde una persona ya las revisa. Sin
 * esta lista, la ruta nueva sería una tabla que se llena sola y que nadie
 * abre nunca.
 *
 * No muestra el texto entero: una transcripción de una hora son veinte mil
 * caracteres y taparía la pantalla. Muestra de quién era, cuándo, cuánto
 * duró, y el primer renglón — lo suficiente para decidir si es la que se
 * busca.
 */
export default function LoQueLlegoDeFathom({
  onElegir,
}: {
  /** La transcripción elegida se carga en «Cargar sesión», acá al lado. */
  onElegir: (t: TranscripcionRecibida) => void;
}) {
  const [lista, setLista] = useState<TranscripcionRecibida[] | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let vivo = true;
    void pendientesDeRevisar().then((r) => {
      if (!vivo) return;
      setLista(r);
      setCargando(false);
    });
    return () => { vivo = false; };
  }, []);

  const descartar = async (t: TranscripcionRecibida) => {
    if (!await sacarDeLaCola(t.id, 'descartada')) return;
    setLista((l) => (l ?? []).filter((x) => x.id !== t.id));
  };

  // Nada que mostrar: ni cuando no se pudo consultar —`null`, y afirmar que
  // no llegó nada sería mentir— ni cuando la cola está vacía, que es el
  // estado normal de casi todos los días.
  if (cargando) {
    return (
      <p className="text-sm text-cream/40">
        <Loader size={12} className="inline animate-spin mr-1" />
        Buscando lo que llegó de Fathom…
      </p>
    );
  }
  if (!lista || lista.length === 0) return null;

  return (
    <div className="rounded-2xl border border-gold/30 bg-gold/[0.04] p-4 space-y-3">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-cream/55">
          Llegó de Fathom
        </p>
        <p className="text-sm text-cream/50">
          {lista.length === 1
            ? 'Una transcripción entró sola y espera que la revises.'
            : `${lista.length} transcripciones entraron solas y esperan que las revises.`}
          {' '}Nada se guardó todavía.
        </p>
      </div>

      <div className="space-y-2">
        {lista.map((t) => (
          <div key={t.id} className="rounded-xl border border-cream/15 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-cream/85 font-bold">
                  {t.titulo || 'Sesión sin título'}
                </p>
                <p className="text-sm text-cream/45">
                  {[
                    t.fecha,
                    t.minutos ? `${t.minutos} min` : null,
                    deQuienEra(t),
                  ].filter(Boolean).join(' · ')}
                </p>
                <p className="text-sm text-cream/40 mt-1 line-clamp-2">
                  {t.transcripcion.slice(0, 180)}…
                </p>
              </div>
              <button
                onClick={() => void descartar(t)}
                title="No era una sesión"
                className="shrink-0 text-cream/40 hover:text-danger p-1">
                <X size={14} />
              </button>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => onElegir(t)}
                className="btn-primary px-3 py-1.5 rounded-xl text-sm font-bold">
                Revisar esta
              </button>
              {t.enlace && (
                <a href={t.enlace} target="_blank" rel="noreferrer"
                  className="text-sm font-bold text-gold hover:text-goldhi">
                  Escucharla en Fathom
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
