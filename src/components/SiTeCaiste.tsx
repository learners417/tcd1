/**
 * SI TE CAÍSTE — la regla de reenganche, dicha dentro de la app.
 *
 * ═══ QUÉ RESUELVE ═══
 *
 * La regla existe desde los libros y estaba decidida: «si te caíste, no
 * empiezas de nuevo». Vivía en `elJuegoDelSur.ts` como `SI_SE_CORTA` y
 * —verificado el 19 de noviembre— NINGUNA pantalla la leía: la constante
 * estaba escrita y no la mostraba nadie. Afuera iba a salir por el Sistema
 * (`sin_entrar_3_dias`); adentro, el cliente que volvía después de una semana
 * encontraba su paso atrasado y ninguna regla para entrarle.
 *
 * Eso es justo el momento en que una persona abandona: abre la app, ve lo que
 * dejó, calcula todo lo que le falta y cierra. La regla cambia la cuenta: no
 * son seis días, es un paso.
 *
 * ═══ POR QUÉ NO REPITE AL RITMO ═══
 *
 * La línea de ritmo ya dice qué paso toca y cuántos días lleva
 * (`mensajeDeRitmo`), y nunca dice «vas atrasado». Esto no vuelve a contar
 * días: dice qué se hace con eso. Aparece solo desde tres días hábiles de
 * atraso, que es el mismo umbral con el que el equipo recibe su alarma — un
 * solo criterio para los dos lados.
 *
 * El paso ESENCIAL del día no se nombra todavía: la app no lo tiene. El dato
 * vive en El Camino en papel, en negrita, y lo pasa LIBROS; `pasoEsencialDe`
 * se sacó del seed en noviembre justo porque devolvía el paso equivocado.
 * Mientras no esté, se nombra el día, que es cierto.
 */
import { RotateCcw } from 'lucide-react';
import { SI_SE_CORTA } from '../lib/elJuegoDelSur';

/** El mismo umbral que la alarma del equipo: tres días hábiles. */
export const DIAS_PARA_EL_REENGANCHE = 3;

export default function SiTeCaiste({
  diaDelPaso, atrasoHabil, onAbrirCamino,
}: {
  /** El día del primer paso sin terminar. */
  diaDelPaso: number | null;
  /** Días hábiles de atraso, ya calculados por quien dibuja Hoy. */
  atrasoHabil: number;
  onAbrirCamino: () => void;
}) {
  if (diaDelPaso === null || atrasoHabil < DIAS_PARA_EL_REENGANCHE) return null;

  return (
    <section className="card-panel p-5 sm:p-6 border border-gold/35"
             aria-label="Si te caíste">
      <div className="flex items-start gap-3">
        <span className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border border-gold/30 text-gold">
          <RotateCcw className="w-4 h-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-base leading-relaxed text-cream/90">{SI_SE_CORTA}</p>
          <button type="button" onClick={onAbrirCamino}
                  className="mt-3 btn-primary text-cream text-sm font-bold px-5 py-2.5 rounded-xl">
            Ir a tu paso del día {diaDelPaso} →
          </button>
        </div>
      </div>
    </section>
  );
}
