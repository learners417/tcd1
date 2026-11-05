/**
 * LAS PARTES DE EL CAMINO — la puerta de todo lo que no está en la barra.
 *
 * ═══ POR QUÉ EXISTE ═══
 *
 * La navegación pasó de cinco destinos que cambiaban a cuatro fijos, y la
 * barra lateral de la computadora se fue entera. Con eso, ocho pantallas se
 * quedaron sin puerta en el teléfono: Mi ADN, Tus números, El Método, el
 * Diario, Métricas, Campañas, el Creador y Mi Clínica.
 *
 * No volvieron a la barra a propósito. El criterio de esa barra es viejo y es
 * bueno: si algo se usa en UN día concreto del Camino, no va ahí — va en ese
 * día. Lo que son, todas, es PARTES de El Camino: Mi ADN es lo que vas
 * sellando, Campañas y el Creador son las herramientas de los días que te
 * toquen, el Método son los libros que lo explican.
 *
 * ═══ POR QUÉ SOLO EL NOMBRE ═══
 *
 * Cada una tenía su renglón de descripción —«tu meta y tus cobros», «lo que
 * ya sellaste»— y eran tres botones. Con ocho, esos renglones son ocho
 * explicaciones de algo que el nombre ya dice, en la pantalla que ya era la
 * más pesada de la app: 545 palabras medidas.
 *
 * El nombre y el ícono alcanzan. Lo que no se entiende por el nombre se
 * entiende entrando, que cuesta un toque y no cuesta leer.
 *
 * ═══ EL CANDADO ═══
 *
 * Lo que todavía no le toca se ve, apagado, con el candado y lo que hay que
 * hacer para abrirlo. Esconderlo haría más corta la pantalla y más larga la
 * pregunta «¿dónde está lo que me vendieron?».
 */
import type { LucideIcon } from 'lucide-react';
import { Lock } from 'lucide-react';
import { destinosDelCamino } from '../lib/destinos';
import { planActual, planPermitePilar } from '../lib/planes';

/**
 * Lo que se abre DENTRO de esta misma pantalla en vez de llevar a otra: la
 * meta con sus cobros y los noventa días. Van en la misma grilla y con la
 * misma forma que el resto, porque para el cliente son lo mismo —una parte de
 * su Camino— y dos formas distintas para la misma cosa es lo que hace que una
 * pantalla se sienta armada de retazos.
 */
export interface ParteLocal {
  id: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}

export default function PartesDelCamino({
  cinturonOrden, modulosActivos = [], locales = [], onIr,
}: {
  /** En qué grado va: decide qué está abierto. */
  cinturonOrden: number;
  /** Lo que el equipo le abrió a mano, por encima del grado. */
  modulosActivos?: string[];
  locales?: ParteLocal[];
  onIr: (id: string) => void;
}) {
  const partes = destinosDelCamino()
    .filter((d) => planPermitePilar(planActual(), d.minPilar ?? 0));

  if (partes.length === 0 && locales.length === 0) return null;

  const caja = 'min-h-[88px] rounded-2xl border px-3 py-3 flex flex-col items-start justify-between text-left transition-colors';

  return (
    <section aria-label="Las partes de tu Camino">
      <p className="text-[15px] font-bold uppercase tracking-[0.16em] text-gold">Tu Camino por dentro</p>
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {locales.map((l) => {
          const Icono = l.icon;
          return (
            <button key={l.id} type="button" onClick={l.onClick}
              className={`${caja} border-[var(--line2,#DFD3BC)] hover:bg-gold/[0.05]`}>
              <Icono className="w-[22px] h-[22px] text-gold" strokeWidth={1.7} />
              <span className="text-[17px] font-semibold text-cream leading-tight">{l.label}</span>
            </button>
          );
        })}
        {partes.map((d) => {
          /* El mismo nombre del módulo que usa el permiso del equipo: el
             Creador se guarda como «creativos». */
          const clave = d.id === 'creador' ? 'creativos' : d.id;
          const cerrado = typeof d.minCinturon === 'number'
            && cinturonOrden < d.minCinturon
            && !modulosActivos.includes(clave);
          const Icono = d.icon;
          return (
            <button
              key={d.id}
              type="button"
              disabled={cerrado}
              onClick={() => { if (!cerrado) onIr(d.id); }}
              title={cerrado ? 'Se abre al ganar el grado que lo pide' : undefined}
              /*
                ═══ LO CERRADO SE LEE IGUAL DE BIEN ═══

                Primero esto bajaba la opacidad de la tarjeta entera al 45%.
                El medidor lo cazó: el nombre quedaba en 2,5 a 1 contra el
                papel, y el piso es 4,5. O sea que «El Método» y «Diario del
                Fundador» —justo los dos que un cliente nuevo todavía no tiene
                abiertos— eran los dos que no se podían leer.

                Apagar el texto no es la forma de decir «todavía no». El
                candado lo dice, y el borde punteado lo dice otra vez. El
                nombre se lee entero, que es lo único que hace falta para
                saber qué le espera.
              */
              className={`${caja} ${cerrado
                  ? 'border-dashed border-[var(--line2,#DFD3BC)] cursor-not-allowed'
                  : 'border-[var(--line2,#DFD3BC)] hover:bg-gold/[0.05]'}`}
            >
              {cerrado
                ? <Lock className="w-[20px] h-[20px] text-cream/60" />
                : <Icono className="w-[22px] h-[22px] text-gold" strokeWidth={1.7} />}
              <span className="text-[17px] font-semibold text-cream leading-tight">{d.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
