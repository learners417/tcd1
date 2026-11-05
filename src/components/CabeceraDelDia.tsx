/**
 * LA CABECERA DE HOY — el paisaje en el que estás, y nada más.
 *
 * ═══ QUÉ REEMPLAZA ═══
 *
 * Una tarjeta beige con tres cosas: el saludo, el renglón del cinturón
 * («Cinturón Rojo punta negra · Controla la fuerza») y un párrafo de ritmo de
 * tres renglones. Cuarenta palabras, el mismo color que las otras ocho
 * tarjetas de la pantalla, y dos de las tres cosas repetidas tal cual en El
 * Camino.
 *
 * Medido sobre la app: Hoy abría con 192 palabras y 27 cosas tocables, y lo
 * único que tenía identidad propia en toda la app eran las cinco portadas de
 * los sistemas. Esta cabecera trae esa identidad al primer lugar donde mira
 * el cliente, y se lleva las palabras que sobraban.
 *
 * ═══ POR QUÉ EL TEXTO NO VA ENCIMA DEL DIBUJO ═══
 *
 * Porque el contraste sobre una ilustración no se puede garantizar: cambia
 * con cada paisaje y con cada franja del dibujo. El texto va sobre el lecho
 * —el color plano de la tapa del libro, medido 10 a 1 en blanco y 4,5 en el
 * oro— y el dibujo ocupa su propio marco al lado. Es la misma decisión que ya
 * había tomado la portada del sistema, y por la misma razón.
 *
 * ═══ EL CINTURÓN NO ESTÁ ACÁ, Y ES A PROPÓSITO ═══
 *
 * El grado vive en El Camino, al lado de su anillo, que es donde el grado ES
 * el progreso. Repetido en Hoy no agrega un dato: agrega un renglón.
 */
import type { Paisaje } from '../lib/losCincoPaisajes';
import PaisajeIlustrado from './PaisajeIlustrado';

export default function CabeceraDelDia({
  paisaje, saludo, nombre, dia, total = 90,
}: {
  paisaje: Paisaje;
  /** «Buenos días», «Buenas tardes» o «Buenas noches». Lo decide la hora. */
  saludo: string;
  nombre?: string | null;
  /** Qué día del Camino es hoy. */
  dia?: number | null;
  total?: number;
}) {
  return (
    <section className="rounded-2xl overflow-hidden border"
      style={{ borderColor: 'rgba(201,168,111,0.3)', background: paisaje.color.lecho }}
      aria-label="Tu día">
      <div className="flex flex-col sm:flex-row">
        {/* En el teléfono, una franja apaisada arriba, centrada en lo que
            cuenta de cada paisaje. En pantalla grande, una columna al costado
            —y más alta, porque acá hay lugar y el dibujo es lo que hace que
            esta pantalla no se parezca a ninguna otra app. */}
        <div className="shrink-0 w-full h-[132px] overflow-hidden sm:hidden">
          <PaisajeIlustrado paisaje={paisaje} alto={132} ancho="100%" apaisado
            className="w-full h-full" />
        </div>
        <div className="hidden sm:block shrink-0 w-[220px] overflow-hidden">
          <PaisajeIlustrado paisaje={paisaje} alto={220} ancho={220} className="h-full" />
        </div>

        <div className="flex-1 p-5 sm:p-7 flex flex-col justify-center">
          <p className="rotulo-libro oro-paisaje">{paisaje.sistema}</p>

          <h1 className="mt-2 sobre-paisaje"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 30, lineHeight: 1.1, fontWeight: 500, letterSpacing: '-0.01em',
            }}>
            {saludo}{nombre ? `, ${nombre}` : ''}.
          </h1>

          {/* La regla de 20 mm de la tapa, a escala. */}
          <div className="regla-libro regla-paisaje mt-3 mb-3" />

          <p className="prosa-libro sobre-paisaje-2" style={{ fontStyle: 'italic' }}>
            {paisaje.nombre} · {paisaje.ensena}
          </p>

          {/* El día va en numerales altos: la Cormorant trae cifras de estilo
              antiguo por defecto y «Día 11» se leería «Día ɪɪ». */}
          {typeof dia === 'number' && (
            <p className="mt-4 sobre-paisaje-3 num-tab"
              style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontVariantNumeric: 'lining-nums tabular-nums' }}>
              Día {dia} de {total}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
