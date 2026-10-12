/**
 * CP4 · Barra inferior de navegación — el shell que hace que se sienta app nativa.
 * Fija abajo, SOLO mobile (md:hidden). Respeta el safe-area del iPhone.
 * Los 5 destinos principales siempre visibles; "Más" abre el drawer con el resto.
 */
import { useEffect, useState } from 'react';
import { Sun, Map, Dna, Megaphone, LifeBuoy } from 'lucide-react';
import { sinLeerDelCliente } from '../lib/soporteDatos';
import { destinoQueCambia } from '../lib/destinoDelMomento';
import type { DondeVa } from '../lib/diaPrograma';
import { supabase, isSupabaseReady } from '../lib/supabase';

interface Tab {
  id: string;
  label: string;
  icon: typeof Sun;
  /**
   * Cuánto ancho se lleva, proporcional a su palabra.
   *
   * Con las cinco pestañas repartiendo en partes iguales, «Entrenadores» se
   * salía de su botón y se montaba encima de «Campañas»: las etiquetas se
   * leían pegadas, «EntrenadoresCampañasContacto». Repartir parejo solo
   * funciona si las palabras miden parecido, y acá van de tres a doce letras.
   *
   * Medido a 15 px, que es el piso: achicar la letra habría sido la salida
   * fácil y la peor, porque esta barra es lo que más se mira de la app.
   */
  ancho: number;
}

/**
 * Los MISMOS cinco destinos del menu lateral, en el mismo orden.
 * Dos navegaciones distintas en la misma app es la forma mas rapida de
 * que alguien se pierda.
 *
 * ═══ POR QUÉ SOPORTE ESTÁ ACÁ Y CLÍNICA NO ═══
 *
 * Soporte es la única forma que tiene el cliente de llegar al equipo desde
 * que Discord salió. Vivía en un icono de salvavidas arriba a la derecha, sin
 * etiqueta, entre otros iconos: tecnicamente accesible, en la practica nadie
 * lo encontraba. Un canal de soporte que no se encuentra manda al cliente a
 * buscar al equipo afuera de la app, que es exactamente lo que se queria
 * terminar.
 *
 * Clinica salio de la barra porque no era un destino de esta app: era un
 * window.open a otra. Tocarla te sacaba de TCD sin aviso, y hasta el pilar 6
 * ni eso. Ahora es una pantalla que explica que es, con el boton para abrirla
 * al final.
 */
const TABS: Tab[] = [
  { id: 'dashboard', label: 'Hoy', icon: Sun, ancho: 0.8 },
  { id: 'roadmap', label: 'Camino', icon: Map, ancho: 1 },
  { id: 'entrenadores', label: 'Entrenadores', icon: Dna, ancho: 1.6 },
  // Este cambia: hasta que le toque montar es Mi ADN, que es lo que está
  // construyendo. Ver «Campañas» cuatro semanas diciendo «todavía no» gasta
  // uno de los cinco destinos justo cuando recién aprende a usar la app.
  { id: 'campanas', label: 'Campañas', icon: Megaphone, ancho: 1.25 },
  // «Acompañamiento» es el nombre del destino, y en la barra de abajo no
  // entra: con cinco pestañas en 390 px se sale de la pantalla. Acá va corto
  // y en el menú lateral, donde hay ancho, va completo. El medidor lo cazó en
  // las quince pantallas del cliente a la vez.
  { id: 'mensajes', label: 'Contacto', icon: LifeBuoy, ancho: 1.1 },
];

interface Props {
  currentPage: string;
  setCurrentPage: (p: string) => void;
  /** Para el contador de respuestas sin abrir sobre Contacto. */
  userId?: string;
  /** Dónde va en el Camino: decide qué dice el cuarto destino. */
  donde?: DondeVa | null;
  /** @deprecated V5: con cinco destinos no hay boton "mas". */
  onMore?: () => void;
}

export default function BottomTabBar({ currentPage, setCurrentPage, userId, donde }: Props) {
  const cuarto = destinoQueCambia(donde);
  /**
   * LAS RESPUESTAS SIN ABRIR, SOBRE EL DESTINO.
   *
   * El contador vivía en un salvavidas arriba a la derecha, al lado de otros
   * tres botones. Dos problemas: el aviso estaba lejos de la pantalla que
   * resuelve —había que acordarse de que ese ícono era Soporte— y los cuatro
   * botones se llevaban 249 de los 390 px de la barra, así que el título de
   * la pantalla quedaba cortado en doce vistas.
   *
   * Acá el número está sobre la pestaña que se toca, que es donde se busca.
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

  // Al entrar a Soporte, el contador vuelve a cero: ya las vio.
  useEffect(() => { if (currentPage === 'mensajes') setSinLeer(0); }, [currentPage]);

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[var(--line,rgba(176,130,46,0.2))] bg-[var(--bg-root)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Navegación principal"
    >
      {/* Sin separación lateral y sin hueco entre pestañas: con cinco
          destinos a 15 px en 390 px, cada píxel que se va en márgenes es un
          píxel que le falta a «Entrenadores». Las etiquetas quedaban pegadas
          una a la otra —«EntrenadoresCampañasContacto»— porque cada botón era
          más angosto que su palabra. El aire entre ellas lo da ahora el ancho
          que a cada una le sobra. */}
      <div className="flex items-stretch justify-between px-0.5">
        {TABS.map((crudo) => {
          // El cuarto destino cambia de nombre y de id con el avance.
          const tab = crudo.id === 'campanas'
            ? { ...crudo, id: cuarto.id, label: cuarto.etiquetaCorta }
            : crudo;
          const active = currentPage === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCurrentPage(tab.id)}
              aria-current={active ? 'page' : undefined}
              // 10-DISENO §4: el activo cambia el trazo del ícono a oro y el peso
              // de la etiqueta a 700. Nada más: sin fondo, sin píldora.
              //
              // Cada una se lleva el ancho de su palabra (ver `ancho`), y la
              // zona táctil sigue por encima de los 44 px de alto.
              className="flex flex-col items-center justify-center gap-1 min-w-0 min-h-[4.5rem] pt-2.5 pb-2 text-cream/70"
              style={{ flex: `${tab.ancho} 1 0%` }}
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
        {/* V5: con cinco destinos no hace falta un boton "mas". Lo que no
            esta aca, vive adentro de la sesion que lo necesita. */}
      </div>
    </nav>
  );
}
