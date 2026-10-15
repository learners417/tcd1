/**
 * LA ACTIVACIÓN — la pantalla que dice qué toca hoy, y qué no.
 *
 * Al terminar el Camino el cliente tiene todo escrito y quedaba solo frente a
 * seis pantallas de Campañas, sin saber qué va primero.
 *
 * Esto muestra UNA puerta: la de hoy. Las anteriores quedan cerradas arriba
 * para que vea el recorrido, y las siguientes dicen cuándo abren. Y cuando la
 * puerta tiene un «no toques», va en el mismo lugar — el aviso sirve en el
 * momento en que la tentación aparece, no en un manual del día 1 que nadie
 * recuerda al día 3.
 */
import { Check, Lock, AlertTriangle, ArrowRight } from 'lucide-react';
import {
  PUERTAS, dondeEsta, type Puerta,
} from '../../lib/activacion';
import { yaLlegoAlDia, faltaParaLlegar, type DondeVa } from '../../lib/diaPrograma';
import type { ObjetivoCampana } from '../../lib/campanasTypes';
import type { Montaje } from '../../lib/montajeCampana';
import { VOC } from '../../lib/vocabulario';

export default function LaActivacion({
  montaje,
  objetivo = 'clientes_potenciales',
  anunciosListos,
  diasEncendida,
  ventas,
  onIrAlMontaje,
  donde,
  onIrAlCamino,
}: {
  montaje: Montaje | null;
  objetivo?: ObjetivoCampana;
  anunciosListos: boolean;
  diasEncendida: number | null;
  /** null = no se consultaron. No saber no es no haber vendido. */
  ventas?: number | null;
  onIrAlMontaje?: () => void;
  /**
   * Dónde va de verdad: el día de su próxima jornada abierta, no el del
   * calendario. Sin esto la pantalla le presentaba el paso 1 del montaje como
   * la tarea de hoy, y a quien se atrasó le abría el montaje sin que tuviera
   * la página ni los anuncios.
   */
  donde?: DondeVa | null;
  onIrAlCamino?: () => void;
}) {
  const d = dondeEsta({ montaje, objetivo, anunciosListos, diasEncendida, ventas });
  const cerradas = new Set(d.cerradas);

  /**
   * TODAVÍA NO LE TOCA.
   *
   * Campañas es una de las cinco pestañas fijas, así que el cliente entra el
   * día 1. Y la pantalla no mira el día: con el montaje vacío, `dondeEsta`
   * devuelve la primera puerta y la presentaba como lo que toca hoy —«Montaje ·
   * paso 1 de 4 · Tu perfil, listo para recibir»— con un botón «Ir a
   * resolverlo».
   *
   * O sea que el día 1 la app lo mandaba a preparar su perfil para recibir
   * tráfico de una campaña que recién monta el día 29, en lugar de a su sesión.
   * Es la forma más rápida de que pierda el hilo del Camino en su primer día.
   *
   * El trabajo de Campañas empieza cuando el Camino lo trae: el día 29 es el
   * primer candado que puede cerrar. Antes de eso la pantalla se lo dice y lo
   * devuelve a donde sí tiene algo que hacer.
   */
  const DIA_EN_QUE_EMPIEZA = 29;
  const todaviaNo = !!donde
    && !yaLlegoAlDia(donde, DIA_EN_QUE_EMPIEZA)
    && diasEncendida === null
    && !anunciosListos;

  if (todaviaNo && donde) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <section className="card-panel p-6 sm:p-7 border border-gold/30">
          <p className="text-[16px] font-bold uppercase tracking-[0.16em] text-goldhi">
            Tu campaña
          </p>
          <h1 className="mt-2 text-[28px] leading-tight text-cream"
            style={{ fontFamily: 'var(--font-display)', fontStyle: 'normal' }}>
            Se monta el día {DIA_EN_QUE_EMPIEZA}
          </h1>
          {/* Se cuenta por SESIONES y no por días de almanaque: a quien se
              atrasó, «faltan 3 días» le dice algo que no depende de él. Las
              sesiones sí: puede hacerlas hoy. */}
          <p className="mt-3 text-[18px] leading-relaxed text-cream/85">
            Vas por la sesión del día {donde.diaDeTrabajo}.{' '}
            {faltaParaLlegar(donde, DIA_EN_QUE_EMPIEZA)} Lo que escribes hasta entonces es de donde salen tus anuncios. Tu
            método, tu oferta, tu precio y tu página. Con eso hecho, montar la
            campaña es una tarde.
          </p>
          <p className="mt-3 text-[17px] leading-relaxed text-cream/65">
            Cuando llegue el día, acá te espera el paso a paso: los nueve pasos
            del montaje en Meta, qué poner en cada campo y qué no tocar.
          </p>
          {onIrAlCamino && (
            <button onClick={onIrAlCamino}
              className="mt-5 w-full min-h-[44px] btn-primary rounded-xl text-[17px] font-bold">
              Ir a mi sesión de hoy
            </button>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">

      {/* ── LA PUERTA DE HOY ── */}
      <section className="card-panel p-6 sm:p-7 border border-gold/30"
        aria-label="Lo que toca hoy">
        <p className="text-[16px] font-bold uppercase tracking-[0.16em] text-goldhi">
          {d.puerta.tipo === 'montaje'
            ? `Montaje · paso ${d.puerta.n + 1} de 4`
            : diasEncendida !== null
              ? `Encendida hace ${diasEncendida} ${diasEncendida === 1 ? 'día' : 'días'}`
              : 'Tu campaña'}
        </p>
        <h1 className="mt-2 text-[28px] leading-tight text-cream"
          style={{ fontFamily: 'var(--font-display)', fontStyle: 'normal' }}>
          {VOC(d.puerta.titulo)}
        </h1>
        <p className="mt-3 text-[18px] leading-relaxed text-cream/85">
          {VOC(d.puerta.queHacer)}
        </p>

        {/* Lo que NO hay que tocar. Mismo lugar, distinto peso. */}
        {d.puerta.queNoTocar && (
          <div className="mt-4 rounded-xl border border-danger/40 bg-danger/[0.06] p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-danger" />
            <p className="text-[17px] leading-relaxed text-cream/90">
              {VOC(d.puerta.queNoTocar)}
            </p>
          </div>
        )}

        {d.puerta.tipo === 'montaje' && d.faltanCandados > 0 && onIrAlMontaje && (
          <button
            type="button"
            onClick={onIrAlMontaje}
            className="mt-5 min-h-[56px] w-full rounded-xl bg-gold px-6 text-[19px] font-bold text-espresso flex items-center justify-center gap-2.5 sm:w-auto"
          >
            Ir a resolverlo <ArrowRight className="w-5 h-5" />
          </button>
        )}

        {d.proxima && d.diasParaLaProxima > 0 && (
          <p className="mt-4 text-[17px] text-cream/55">
            {d.diasParaLaProxima === 1
              ? 'Mañana se abre: '
              : `En ${d.diasParaLaProxima} días se abre: `}
            {VOC(d.proxima.titulo)}
          </p>
        )}
      </section>

      {/* ── EL RECORRIDO ──
          Las nueve puertas, para que vea dónde está parado. La de hoy
          destacada, las pasadas tildadas, las que vienen con su fecha. */}
      <section className="card-panel p-5 sm:p-6" aria-label="El recorrido completo">
        <h2 className="text-[16px] font-bold uppercase tracking-[0.16em] text-goldhi mb-4">
          Todo el recorrido
        </h2>
        <ul className="divide-y divide-gold/10">
          {PUERTAS.map((p) => (
            <Fila
              key={p.n}
              puerta={p}
              estado={
                p.n === d.puerta.n ? 'hoy'
                : cerradas.has(p.n) ? 'hecha'
                : 'porVenir'
              }
            />
          ))}
        </ul>
      </section>
    </div>
  );
}

/**
 * Una fila del recorrido.
 *
 * Lo que viene se distingue por el candado y por el color del texto, NO
 * apagando la fila con `opacity`: la opacidad multiplica el contraste de todo
 * lo que hay dentro y dejaba estos títulos en 2.8:1, por debajo del mínimo
 * legible. Un paso futuro tiene que poder leerse: es lo que el cliente está
 * por hacer.
 */
function Fila({ puerta, estado }: { puerta: Puerta; estado: 'hecha' | 'hoy' | 'porVenir' }) {
  return (
    <li className="py-3.5 flex items-start gap-3">
      <span className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border ${
        estado === 'hecha' ? 'border-success/45 text-success'
        : estado === 'hoy' ? 'border-gold/50 bg-gold/15 text-goldhi'
        : 'border-cream/20 text-cream/55'}`}>
        {estado === 'hecha' ? <Check className="w-4 h-4" />
          : estado === 'porVenir' ? <Lock className="w-4 h-4" />
          : <span className="text-[17px] font-extrabold">{puerta.n}</span>}
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-[18px] leading-snug ${
          estado === 'hoy' ? 'text-cream font-semibold'
          : estado === 'hecha' ? 'text-cream/80'
          : 'text-cream/70'}`}>
          {VOC(puerta.titulo)}
        </span>
        {estado === 'porVenir' && puerta.diaQueAbre !== null && (
          <span className="block mt-0.5 text-[17px] text-cream/60">
            {puerta.diaQueAbre === 1 ? 'Al encender' : `Desde el día ${puerta.diaQueAbre}`}
          </span>
        )}
      </span>
    </li>
  );
}
