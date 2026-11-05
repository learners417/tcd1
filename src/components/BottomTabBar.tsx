/**
 * LA NAVEGACIÓN — cuatro destinos, los mismos en todos lados, siempre.
 *
 * ═══ QUÉ CAMBIÓ Y POR QUÉ ═══
 *
 * Había DOS navegaciones distintas: una barra lateral de 256 px en la
 * computadora y esta barra de cinco destinos en el teléfono. Y el cuarto
 * destino cambiaba de nombre, de ícono y de pantalla según el avance.
 *
 * Tres problemas, medidos sobre la app de verdad:
 *
 *   1. La barra lateral se comía 256 px y partía «IMPLEMENTACIÓN» en dos
 *      renglones, mientras el contenido seguía en una sola columna angosta
 *      con el tercio derecho vacío. Ancho gastado en no decir nada.
 *   2. Quien aprendía la app en el teléfono la volvía a aprender en la
 *      computadora: otro orden, otros nombres, otra forma.
 *   3. El cuarto destino se movía solo. Lo que ayer estaba cuarto hoy es
 *      otra cosa.
 *
 * Ahora es una sola barra para los dos anchos. En el teléfono va pegada
 * abajo, de lado a lado, que es donde llega el pulgar. En la computadora la
 * misma barra se vuelve una isla centrada, separada del piso: mismos cuatro,
 * mismo orden, mismas palabras.
 *
 * Lo que salió de la barra vive dentro de El Camino. El criterio es el de
 * siempre: si algo se usa en UN día concreto del camino, no va acá — va en
 * ese día.
 */
import { useEffect, useState } from 'react';
import { Sun, Map, Dumbbell, LifeBuoy } from 'lucide-react';
import { sinLeerDelCliente } from '../lib/soporteDatos';
import { supabase, isSupabaseReady } from '../lib/supabase';

interface Tab {
  id: string;
  label: string;
  /**
   * El nombre completo del destino, cuando esta barra lo escribe más corto.
   *
   * Declararlo lo vuelve un sistema en vez de un desacuerdo:
   * `prueba-un-destino-un-nombre.ts` compara los lugares donde se escribe cada
   * destino —esta barra, la de arriba y el buscador— y la diferencia solo pasa
   * si está escrita acá.
   */
  nombreCompleto?: string;
  icon: typeof Sun;
}

const TABS: Tab[] = [
  { id: 'dashboard', label: 'Hoy', icon: Sun },
  { id: 'roadmap', label: 'Camino', nombreCompleto: 'El Camino', icon: Map },
  /*
   * Pesas, no hélice: acá se entrena una habilidad. La hélice es de Mi ADN.
   *
   * «Entrenar» y no «Entrenadores»: guarda la raíz —se ve de dónde viene—, es
   * neutro en toda Latinoamérica, y es lo que el cliente va a hacer ahí.
   */
  { id: 'entrenadores', label: 'Entrenar', nombreCompleto: 'Entrenadores', icon: Dumbbell },
  /*
   * «Acompañamiento» es el nombre del destino y en la barra no entra. Acá va
   * corto y el encabezado, donde hay ancho, lo dice entero.
   */
  { id: 'mensajes', label: 'Contacto', nombreCompleto: 'Acompañamiento', icon: LifeBuoy },
];

interface Props {
  currentPage: string;
  setCurrentPage: (p: string) => void;
  /** Para el contador de respuestas sin abrir sobre Contacto. */
  userId?: string;
}

export default function BottomTabBar({ currentPage, setCurrentPage, userId }: Props) {
  /**
   * LAS RESPUESTAS SIN ABRIR, SOBRE EL DESTINO.
   *
   * El contador vivía en un salvavidas arriba a la derecha, al lado de otros
   * tres botones: el aviso estaba lejos de la pantalla que resuelve. Acá el
   * número está sobre la pestaña que se toca, que es donde se busca.
   */
  const [sinLeer, setSinLeer] = useState(0);
  useEffect(() => {
    if (!userId) return;
    let vivo = true;
    void sinLeerDelCliente(userId).then((n) => { if (vivo) setSinLeer(n); });
    if (!isSupabaseReady() || !supabase) return () => { vivo = false; };
    const canal = supabase.channel(`tabs-sin-leer-${userId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'mensajes',
        filter: `receptor_id=eq.${userId}`,
      }, () => { if (vivo) setSinLeer((n) => n + 1); })
      .subscribe();
    return () => { vivo = false; void supabase?.removeChannel(canal); };
  }, [userId]);

  /*
   * No se apaga por estar en la pantalla: se apaga cuando la conversación
   * quedó leída en la base. Apagarlo al entrar lo hacía desaparecer antes de
   * que el cliente viera la respuesta, porque la pantalla abre en el canal de
   * comunidad.
   */
  useEffect(() => {
    if (currentPage !== 'mensajes' || !userId) return;
    const t = setInterval(() => {
      void sinLeerDelCliente(userId).then(setSinLeer).catch(() => { /* queda el que había */ });
    }, 4000);
    return () => clearInterval(t);
  }, [currentPage, userId]);

  return (
    <nav
      /*
       * ═══ LA MISMA BARRA, DOS FORMAS ═══
       *
       * Teléfono: pegada abajo, de lado a lado, con el borde superior que la
       * separa del contenido y el respeto por el área segura del iPhone.
       *
       * Computadora: isla centrada a 24 px del piso, con su propio borde
       * redondo y una sombra neutra —no dorada— que la levanta del papel. Es
       * la misma lista, el mismo orden y las mismas palabras: lo único que
       * cambia es que ya no toca los bordes.
       */
      className="fixed bottom-0 inset-x-0 z-40 border-t border-[var(--line,rgba(176,130,46,0.2))] bg-[var(--bg-root)]
                 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:bottom-6 md:border md:rounded-[28px]
                 md:px-2 md:shadow-[0_10px_40px_-12px_rgba(43,39,35,0.28)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Navegación principal"
    >
      {/* ═══ CADA PALABRA SU ANCHO, Y EL AIRE SOBRANTE PAREJO ═══

          Ningún ancho escrito a mano: cada botón mide lo que mide su palabra
          —`flex: 0 1 auto`— y los píxeles que sobran se reparten como aire.
          `justify-evenly` lo reparte también en las puntas, así que la primera
          y la última no quedan contra el filo.

          El piso de 44 px es la zona táctil: «Hoy» mide 29 y sin eso quedaría
          un blanco que no se puede tocar. La letra sigue en 15, el piso de la
          casa: esta barra es lo que más se mira de la app.

          Con cuatro palabras en vez de cinco el aire alcanza de sobra hasta en
          un Android de 320, donde antes «Contacto» se iba de la pantalla. */}
      <div className="flex items-stretch justify-evenly px-0.5 md:gap-2 md:px-1">
        {TABS.map((tab) => {
          const active = currentPage === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCurrentPage(tab.id)}
              aria-current={active ? 'page' : undefined}
              /*
               * ═══ EL ACTIVO, EN ESTA BARRA ═══
               *
               * Cambia el trazo del ícono a oro y el peso de la etiqueta a
               * 700. Nada más: sin fondo, sin píldora.
               *
               * La regla del oro —«solo en líneas de 1px, versalitas y
               * numerales, nunca relleno»— apunta al oro usado como SUPERFICIE
               * para parecer caro. Un trazo dorado sobre papel crema es tinta,
               * que es justo para lo que está.
               */
              className="flex flex-col items-center justify-center gap-1 min-w-[44px] min-h-[4.5rem]
                         pt-2.5 pb-2 text-cream/70 md:min-h-[4rem] md:px-4 md:rounded-[22px]
                         md:transition-colors md:hover:bg-gold/[0.06]"
              style={{ flex: '0 1 auto' }}
            >
              <span className="relative">
                <Icon className={`w-[25px] h-[25px] ${active ? 'text-gold' : ''}`} strokeWidth={active ? 2.2 : 1.7} />
                {tab.id === 'mensajes' && sinLeer > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[20px] h-[20px] px-1.5 bg-gold text-black text-sm font-extrabold rounded-full flex items-center justify-center"
                    aria-label={`${sinLeer} sin leer`}>
                    {sinLeer > 9 ? '9+' : sinLeer}
                  </span>
                )}
              </span>
              <span className={`text-[15px] leading-[1.1] text-center tracking-tight hyphens-none ${active ? 'font-bold text-cream' : 'font-normal'}`}
                style={{ overflowWrap: 'normal', wordBreak: 'keep-all' }}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
