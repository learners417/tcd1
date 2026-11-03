/**
 * MI CLÍNICA — la pantalla que explica qué es, antes de mandarlo.
 *
 * Reemplaza al botón que hacía `window.open` a otra app sin una palabra. El
 * cliente lo tocaba y se le abría un sistema que nunca vio.
 *
 * Tres bloques y un botón: la distinción entre las dos apps, qué hace allá, y
 * qué de su trabajo ya la está esperando. El botón va al final, cuando ya
 * entendió a dónde va.
 */
import { ExternalLink, Check, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { sincronizarArtefactos, hayArtefactos } from '../lib/puenteMCD';
import {
  URL_MI_CLINICA, LAS_DOS_LLAVES, QUE_HACE_ALLA,
  loQueSeLleva, comoLoEncuentra, ANTES_DE_ABRIR,
} from '../lib/miClinica';
import type { ProfileV2 } from '../lib/supabase';
import { VOC } from '../lib/vocabulario';

export default function MiClinica(
  { perfil, userId }: { perfil?: Partial<ProfileV2> | null; userId?: string },
) {
  const lleva = loQueSeLleva(perfil);

  const [enviando, setEnviando] = useState(false);

  /**
   * MANDAR SU TRABAJO ALLÁ, Y DESPUÉS ABRIR.
   *
   * Esta pantalla le dice, en presente: «Lo que escribas en el Camino va a ir
   * apareciendo acá». Y `sincronizarArtefactos` —la única función del repo que
   * escribe en la tabla que lee Mi Clínica— no la llamaba nadie.
   *
   * O sea que `loQueSeLleva` calculaba los cuatro tildes en memoria, se los
   * mostraba, y el cliente abría Mi Clínica y la encontraba vacía. Después de
   * que la app le afirmó que su trabajo ya estaba ahí.
   *
   * Se sincroniza al tocar el botón y no al cargar la pantalla: así lo que
   * viaja es lo último que escribió, y si falla se puede decir antes de
   * mandarlo a una clínica vacía.
   */
  const abrir = async () => {
    if (userId && hayArtefactos(perfil ?? {})) {
      setEnviando(true);
      const ok = await sincronizarArtefactos(userId, perfil ?? {});
      setEnviando(false);
      if (!ok) {
        // Se dice. Abrirle una clínica vacía después de prometerle que su
        // trabajo estaba ahí es peor que no abrirla.
        toast.error('No pude mandar tu trabajo. Vuelve a tocar el botón en un momento.');
        return;
      }
    }
    window.open(URL_MI_CLINICA, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-12">

      {/* ── LAS DOS LLAVES ── */}
      <section className="card-panel p-6 sm:p-7" aria-label="Qué es Mi Clínica">
        {/*
          Eran una versalita con la idea y un titular con el nombre, y el
          nombre ya estaba en la barra de arriba. Ahora el titular ES la idea:
          lo que el cliente tiene, que es lo único que esta tarjeta vino a
          decir.
        */}
        <h1 className="text-[30px] leading-tight text-cream"
          style={{ fontFamily: 'var(--font-display)', fontStyle: 'normal' }}>
          Tienes dos llaves
        </h1>
        <p className="mt-3 text-[18px] leading-relaxed text-cream/80">
          {VOC(comoLoEncuentra(perfil))}
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[LAS_DOS_LLAVES.camino, LAS_DOS_LLAVES.clinica].map((l, i) => (
            <div key={l.nombre}
              className={`rounded-2xl border p-5 ${
                i === 1 ? 'elegido' : 'border-cream/12'}`}>
              <p className="text-[17px] font-bold text-cream">{l.nombre}</p>
              {/* Era serif de display a 19: con la altura de x de Cormorant eso lee
                  como un sans de 15. Es una etiqueta de categoría, no un título
                  editorial, así que va en el sans de la casa, donde 17 se lee
                  como 17. */}
              <p className={`mt-1 text-[17px] leading-snug ${i === 1 ? 'text-goldhi' : 'text-cream/85'}`}>
                {l.que}
              </p>
              <p className="mt-2 text-[17px] leading-relaxed text-cream/65">{VOC(l.como)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── QUÉ HACE ALLÁ ── */}
      <section className="card-panel p-6 sm:p-7" aria-label="Qué haces en Mi Clínica">
        <h2 className="text-[16px] font-bold uppercase tracking-[0.16em] text-goldhi">
          Qué haces en tu Clínica
        </h2>
        <ul className="mt-4 space-y-4">
          {QUE_HACE_ALLA.map((x) => (
            <li key={x.que} className="flex gap-3">
              <ArrowRight className="w-5 h-5 shrink-0 mt-1 text-gold/70" />
              <span className="min-w-0">
                <span className="block text-[18px] font-semibold leading-snug text-cream">
                  {VOC(x.que)}
                </span>
                <span className="block mt-1 text-[17px] leading-relaxed text-cream/65">
                  {VOC(x.porque)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── LO QUE SE LLEVA DEL CAMINO ──
          Lo que ya escribió, con su jornada al lado para lo que falta. A quien
          no tiene nada no se le muestra una lista de cuatro tachados: se le
          dice en qué día del Camino se escribe cada cosa. */}
      <section className="card-panel p-6 sm:p-7" aria-label="Lo que se lleva del Camino">
        <h2 className="text-[16px] font-bold uppercase tracking-[0.16em] text-goldhi">
          Lo que tu Clínica usa de tu Camino
        </h2>
        <ul className="mt-4 divide-y divide-gold/10">
          {lleva.map((x) => (
            <li key={x.que} className="py-3.5 flex items-start gap-3">
              <span className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center border ${
                x.listo ? 'border-success/40 text-success' : 'border-cream/15 text-cream/30'}`}>
                {x.listo ? <Check className="w-4 h-4" /> : <span className="text-[17px]">·</span>}
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block text-[18px] leading-snug ${
                  x.listo ? 'text-cream font-semibold' : 'text-cream/70'}`}>
                  {VOC(x.que)}
                </span>
                {!x.listo && (
                  <span className="block mt-1 text-[17px] text-cream/50">
                    Se escribe en: {x.dondeSeEscribe}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── EL BOTÓN, AL FINAL ── */}
      <section className="card-panel p-6 sm:p-7 border border-gold/25">
        <p className="text-[17px] leading-relaxed text-cream/75">{ANTES_DE_ABRIR}</p>
        <button
          type="button"
          onClick={() => void abrir()}
          disabled={enviando}
          className="mt-4 min-h-[56px] w-full rounded-xl bg-gold px-6 text-[19px] font-bold text-espresso flex items-center justify-center gap-2.5 active:scale-[0.99] transition-transform sm:w-auto"
        >
          Abrir Mi Clínica <ExternalLink className="w-5 h-5" />
        </button>
      </section>
    </div>
  );
}
