/**
 * LA COMUNIDAD, DENTRO DE HOY — el encuentro, su canal y dónde contarlo.
 *
 * ═══ QUÉ RESUELVE ═══
 *
 * La app y la comunidad son los dos espacios del mismo programa y no se
 * señalaban entre sí. En la app, el único puente era el botón «Comunidad» del
 * menú, que lleva a la puerta del grupo: adentro, el cliente tiene que
 * buscar su canal entre quince y sus encuentros en otra pestaña.
 *
 * Tres datos, en la pantalla donde ya está. Sin una línea de más: los
 * títulos y el botón, porque todo texto nuevo que el cliente lee espera el
 * visto de Javo y un renglón de adorno no vale esa espera.
 *
 *
 *   · cuándo es el próximo encuentro y por dónde entra
 *   · el link directo a SU canal, el que es suyo
 *   · y cuando hay algo que contar, dónde se cuenta
 *
 * ═══ POR QUÉ CADA PARTE SE CALLA CUANDO NO TIENE QUÉ DECIR ═══
 *
 * Un panel con tres renglones vacíos enseña a ignorar el panel. El canal no
 * se dibuja hasta que su link está guardado en su perfil; «Cuéntalo en
 * Victorias» solo aparece el día que hay un logro —cerró el día 5, registró
 * una venta o encendió su campaña—, porque un botón que pide una victoria
 * todos los días deja de pedir nada. Y si no queda ninguna de las tres, la
 * sección entera no existe.
 */
import { useEffect, useState } from 'react';
import { CalendarClock, MessageSquare, Trophy } from 'lucide-react';
import { proximasGrupales, type SesionGrupal } from '../lib/acompanamientoDatos';
import {
  proximoEncuentroAcordado, cuandoSeDice, type Encuentro,
} from '../lib/elProximoEncuentro';
import { VICTORIAS } from '../lib/miComunidad';

export default function LaComunidadEnHoy({
  canal, hayLogro,
}: {
  /** El link directo a su canal en la comunidad, guardado en su perfil. */
  canal?: string | null;
  /** Si hoy tiene algo que contar: día 5 cerrado, una venta o su campaña viva. */
  hayLogro?: boolean;
}) {
  const [encuentro, setEncuentro] = useState<Encuentro | null>(null);

  useEffect(() => {
    let vivo = true;
    /*
     * Primero lo que cargó el equipo, que es la verdad; si no hay nada, el
     * calendario acordado. Una grupal cargada tiene su propio link, y puede
     * no ser la sala de siempre.
     */
    void proximasGrupales(1)
      .then((lista: SesionGrupal[]) => {
        if (!vivo) return;
        const s = lista[0];
        setEncuentro(s
          ? { cuando: new Date(s.empieza_en), link: s.url_reunion, fuente: 'cargado' }
          : proximoEncuentroAcordado());
      })
      .catch(() => { if (vivo) setEncuentro(proximoEncuentroAcordado()); });
    return () => { vivo = false; };
  }, []);

  const muestraEncuentro = encuentro !== null && !!encuentro.link;
  const muestraCanal = !!canal;
  const muestraVictoria = !!hayLogro;
  if (!muestraEncuentro && !muestraCanal && !muestraVictoria) return null;

  return (
    <section className="card-panel p-5 sm:p-6 border border-gold/15" aria-label="Tu comunidad">
      <ul className="divide-y divide-gold/10">
        {muestraEncuentro && encuentro && (
          <li className="py-3 flex items-start gap-3">
            <span className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border border-gold/30 text-gold">
              <CalendarClock className="w-4 h-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold uppercase tracking-[0.14em] text-goldhi">
                Tu próximo encuentro
              </span>
              <span className="block text-base text-cream/90 break-words">{cuandoSeDice(encuentro.cuando)}</span>
            </span>
            <a href={encuentro.link} target="_blank" rel="noreferrer"
               className="shrink-0 btn-primary text-cream text-sm font-bold px-4 py-2 rounded-xl">
              Entrar
            </a>
          </li>
        )}

        {muestraCanal && (
          <li className="py-3 flex items-start gap-3">
            <span className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border border-gold/30 text-gold">
              <MessageSquare className="w-4 h-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold uppercase tracking-[0.14em] text-goldhi">
                Tu canal
              </span>
            </span>
            <a href={canal as string} target="_blank" rel="noreferrer"
               className="shrink-0 min-h-[44px] inline-flex items-center text-sm font-bold text-gold underline underline-offset-4 px-3">
              Abrir
            </a>
          </li>
        )}

        {muestraVictoria && (
          <li className="py-3 flex items-start gap-3">
            <span className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border border-gold/30 text-gold">
              <Trophy className="w-4 h-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold uppercase tracking-[0.14em] text-goldhi">
                Cuéntalo en Victorias
              </span>
            </span>
            <a href={VICTORIAS} target="_blank" rel="noreferrer"
               className="shrink-0 min-h-[44px] inline-flex items-center text-sm font-bold text-gold underline underline-offset-4 px-3">
              Contarlo
            </a>
          </li>
        )}
      </ul>
    </section>
  );
}
