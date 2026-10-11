/**
 * TODO EL MATERIAL — las clases y los tutoriales en un solo lugar.
 *
 * ═══ POR QUÉ EXISTE ═══
 *
 * El material estaba repartido en cuatro lugares que no se hablaban: el video
 * de cada jornada, las clases del método, los tutoriales con sus pasos
 * escritos, y lo que el equipo carga en la base. La Biblioteca mostraba dos.
 *
 * Los tutoriales eran el peor caso: vivían dentro de la sesión de su día, y
 * pasado ese día no se podían volver a mirar. Son justo los que alguien
 * necesita releer meses después, cuando tiene que repetir algo que hizo una
 * vez y no se acuerda cómo.
 *
 * Esto va arriba de la Biblioteca por etapas, que sigue intacta: una lista
 * para buscar algo puntual, y debajo la organización para recorrer.
 */
import { useMemo, useState } from 'react';
import { Search, Play, ListOrdered, X } from 'lucide-react';
import {
  armarCatalogo, loQuePuedeVer, porOrigen, buscar, comoLaVe,
  COMO_SE_LLAMA_EL_ORIGEN, type PiezaDeBiblioteca, type Origen, type TitulosPorDia,
} from '../lib/catalogoBiblioteca';
import { VOC } from '../lib/vocabulario';

const ORDEN_SECCIONES: Origen[] = ['jornada', 'tutorial', 'metodo'];

export default function TodoElMaterial({
  titulos,
  cargadosEnLaBase,
  diaActual,
  bibliotecaAbierta,
}: {
  titulos: TitulosPorDia;
  cargadosEnLaBase: Record<string, string>;
  diaActual: number | null;
  bibliotecaAbierta: boolean;
}) {
  const [texto, setTexto] = useState('');
  const [abierto, setAbierto] = useState<PiezaDeBiblioteca | null>(null);

  const catalogo = useMemo(
    () => armarCatalogo(titulos, cargadosEnLaBase),
    [titulos, cargadosEnLaBase],
  );
  const suyas = useMemo(
    () => loQuePuedeVer(catalogo, { diaActual, bibliotecaAbierta }),
    [catalogo, diaActual, bibliotecaAbierta],
  );
  const encontradas = useMemo(() => buscar(suyas, texto), [suyas, texto]);
  const grupos = useMemo(() => porOrigen(encontradas), [encontradas]);

  return (
    <section className="card-panel p-5 sm:p-6 mb-5" aria-label="Todo el material">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-[15px] font-bold uppercase tracking-[0.16em] text-goldhi">
          Todo el material
        </h2>
        <p className="text-[17px] text-cream/60">
          {VOC(comoLaVe(catalogo, { diaActual, bibliotecaAbierta }))}
        </p>
      </div>

      {/* El buscador. Nadie se acuerda de qué día era el video que busca: se
          acuerda de cómo se llamaba. */}
      <label className="mt-4 flex items-center gap-3 rounded-xl border border-cream/15 bg-surface/40 px-4">
        <Search className="w-5 h-5 shrink-0 text-cream/45" />
        <input
          type="search"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Busca por nombre: precio, método, anuncios…"
          aria-label="Buscar en el material"
          className="min-h-[52px] w-full bg-transparent text-[17px] text-cream placeholder:text-cream/35 outline-none"
        />
      </label>

      {encontradas.length === 0 ? (
        <p className="mt-5 text-[17px] leading-relaxed text-cream/60">
          No hay nada con ese nombre. Prueba con una palabra sola.
        </p>
      ) : (
        ORDEN_SECCIONES.map((origen) => {
          const piezas = grupos[origen];
          if (piezas.length === 0) return null;
          return (
            <div key={origen} className="mt-6">
              <p className="text-[17px] font-bold text-cream/70">
                {COMO_SE_LLAMA_EL_ORIGEN[origen]}
                <span className="ml-2 font-normal text-cream/45">{piezas.length}</span>
              </p>
              <ul className="mt-2 divide-y divide-gold/10">
                {piezas.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => setAbierto(p)}
                      className="w-full text-left py-3.5 flex items-start gap-3 active:opacity-70"
                    >
                      <span className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border border-gold/25 text-gold">
                        {p.youtube ? <Play className="w-4 h-4" /> : <ListOrdered className="w-4 h-4" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[18px] leading-snug text-cream">{VOC(p.titulo)}</span>
                        {(p.dia !== null || p.tema) && (
                          <span className="block mt-0.5 text-[17px] text-cream/50">
                            {p.dia !== null ? `Día ${p.dia}` : p.tema}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })
      )}

      {/* Lo que se abre al tocar: el video, o los pasos escritos. */}
      {abierto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-start sm:items-center justify-center p-4 overflow-y-auto"
          onClick={() => setAbierto(null)}
          role="dialog"
          aria-modal="true"
          aria-label={abierto.titulo}
        >
          <div
            className="w-full max-w-2xl card-panel p-5 sm:p-6 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-[22px] leading-snug text-cream"
                style={{ fontFamily: 'var(--font-display)', fontStyle: 'normal' }}>
                {VOC(abierto.titulo)}
              </h3>
              <button
                type="button"
                onClick={() => setAbierto(null)}
                aria-label="Cerrar"
                className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-cream/70"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {abierto.youtube && (
              <div className="mt-4 aspect-video rounded-xl overflow-hidden bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${abierto.youtube}`}
                  title={abierto.titulo}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            )}

            {abierto.intro && (
              <p className="mt-4 text-[17px] leading-relaxed text-cream/80">{VOC(abierto.intro)}</p>
            )}

            {abierto.pasos && abierto.pasos.length > 0 && (
              <ol className="mt-4 space-y-3">
                {abierto.pasos.map((paso, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="shrink-0 text-[17px] font-bold text-gold/70">{i + 1}</span>
                    <span className="text-[17px] leading-relaxed text-cream/85">{VOC(paso)}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
