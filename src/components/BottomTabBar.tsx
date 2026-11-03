/**
 * CP4 · Barra inferior de navegación — el shell que hace que se sienta app nativa.
 * Fija abajo, SOLO mobile (md:hidden). Respeta el safe-area del iPhone.
 * Los 5 destinos principales siempre visibles; "Más" abre el drawer con el resto.
 */
import { useEffect, useState } from 'react';
import { Sun, Map, Dna, Dumbbell, Megaphone, LifeBuoy } from 'lucide-react';
import { sinLeerDelCliente } from '../lib/soporteDatos';
import { destinoQueCambia } from '../lib/destinoDelMomento';
import type { DondeVa } from '../lib/diaPrograma';
import { supabase, isSupabaseReady } from '../lib/supabase';

interface Tab {
  id: string;
  label: string;
  /**
   * El nombre completo del destino, cuando esta barra lo escribe más corto.
   *
   * Con cinco pestañas en 390 píxeles no entra «Acompañamiento» ni «El
   * Camino», así que acá van cortos. Declararlo lo vuelve un sistema en vez
   * de un desacuerdo: `prueba-un-destino-un-nombre.ts` compara los tres
   * lugares donde se escribe cada destino —esta barra, la de arriba y el
   * buscador— y la diferencia solo pasa si está escrita acá.
   */
  nombreCompleto?: string;
  icon: typeof Sun;
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
  { id: 'dashboard', label: 'Hoy', icon: Sun },
  { id: 'roadmap', label: 'Camino', nombreCompleto: 'El Camino', icon: Map },
  /*
   * Pesas, no hélice: acá se entrena una habilidad. La hélice es de Mi ADN.
   *
   * ═══ POR QUÉ «ENTRENAR» Y NO «ENTRENADORES» ═══
   *
   * «Entrenadores» son doce letras y mide 98 px a 15, que es el piso de la
   * casa. Medido: las cinco etiquetas piden 334 px y un Android de 320 deja
   * 316, así que la última se iba de la pantalla — y la última es Contacto,
   * la única forma que tiene el cliente de llegar al equipo. A 360 entraba
   * justo, sin aire.
   *
   * Achicar la letra estaba descartado. Acortar la más larga es el mismo
   * mecanismo que esta barra ya usa para «Acompañamiento → Contacto» y para
   * «El Camino → Camino»: el nombre completo queda declarado y el menú
   * lateral, donde hay ancho, lo muestra entero.
   *
   * «Entrenar» guarda la raíz —se ve de dónde viene— es neutro en toda
   * Latinoamérica, y es lo que el cliente va a hacer ahí.
   */
  { id: 'entrenadores', label: 'Entrenar', nombreCompleto: 'Entrenadores', icon: Dumbbell },
  // Este cambia: hasta que le toque montar es Mi ADN, que es lo que está
  // construyendo. Ver «Campañas» cuatro semanas diciendo «todavía no» gasta
  // uno de los cinco destinos justo cuando recién aprende a usar la app.
  { id: 'campanas', label: 'Campañas', icon: Megaphone },
  // «Acompañamiento» es el nombre del destino, y en la barra de abajo no
  // entra: con cinco pestañas en 390 px se sale de la pantalla. Acá va corto
  // y en el menú lateral, donde hay ancho, va completo. El medidor lo cazó en
  // las quince pantallas del cliente a la vez.
  { id: 'mensajes', label: 'Contacto', nombreCompleto: 'Acompañamiento', icon: LifeBuoy },
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
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[var(--line,rgba(176,130,46,0.2))] bg-[var(--bg-root)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Navegación principal"
    >
      {/* ═══ CADA PALABRA SU ANCHO, Y EL AIRE SOBRANTE PAREJO ═══
          
          Antes cada pestaña declaraba a mano cuánto ancho se llevaba —0.8, 1,
          1.6, 1.25, 1.1— y esos números estaban mal en todos los anchos.
          Medido a 360 px, que es el ancho más común de un Android de hoy:
          «Hoy» recibía 50 px para una palabra de 29 y «Campañas» recibía 77
          para una de 79, así que «Campañas» y «Contacto» ya salían cortadas
          mientras sobraban 21 px al principio de la barra. A 390 zafaba por
          casualidad, y a 320 «Contacto» se iba de la pantalla.
          
          Ahora ningún número: cada botón mide lo que mide su palabra
          —`flex: 0 1 auto`— y los píxeles que sobran se reparten entre ellas
          como aire, que es para lo que sirve `justify-between`. Se corrige
          solo si una palabra cambia, y a cualquier ancho de teléfono.
          
          El piso de 44 px es la zona táctil: «Hoy» mide 29 y sin eso quedaría
          un blanco que no se puede tocar.
          
          Y el aire va TAMBIÉN en las puntas. Con `justify-between` la primera
          etiqueta queda contra el filo izquierdo y la última contra el
          derecho: medido a 390, «Contacto» terminaba a dos píxeles del borde y
          se leía como cortada. `justify-evenly` reparte el sobrante en los
          seis lugares —las cuatro juntas y las dos puntas— así que a 390 cada
          una respira seis píxeles y a 320, donde no sobra nada, se comporta
          igual que antes.
          
          La letra sigue en 15, que es el piso de la casa. Achicarla habría
          sido la salida fácil y la peor, porque esta barra es lo que más se
          mira de la app. */}
      {/* ═══ SIN `gap`, Y ESTÁ MEDIDO ═══
            Se probó con `gap-1` para garantizar cuatro píxeles entre
            etiquetas. A 320 px no entra: el contenido pide 298, pero «Hoy»
            está forzada a 44 por el piso táctil aunque su palabra mida 29, así
            que lo efectivo es 313 de 316. Los dieciséis píxeles del gap
            recortaron CUATRO etiquetas tres o cuatro píxeles cada una.
            Cuatro palabras cortadas es peor que cuatro palabras cerca. A 320 el
            aire que sobra es medio píxel por lugar, y a 390 son nueve: el
            reparto es lo mejor que se puede hacer con cinco etiquetas a 15 px y
            una zona táctil de 44. */}
        <div className="flex items-stretch justify-evenly px-0.5">
        {TABS.map((crudo) => {
          /*
            El cuarto destino cambia de nombre, de id Y DE ÍCONO con el
            avance. El ícono faltaba: la pestaña pasaba a decir «Mi ADN» y
            heredaba el megáfono de Campañas. Y como «Entrenadores» llevaba la
            hélice de ADN, las dos metáforas quedaban intercambiadas.
          */
          const tab = crudo.id === 'campanas'
            ? { ...crudo, id: cuarto.id, label: cuarto.etiquetaCorta, icon: cuarto.icono === 'Dna' ? Dna : Megaphone }
            : crudo;
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
               * Y ACÁ VA QUÉ GOBIERNA ESTA REGLA, porque leída suelta se
               * contradice con el resto de la app: las pestañas de adentro
               * —Campañas, Métricas, el Diario, la Biblioteca,
               * Acompañamiento— marcan su activo con un lavado de oro al diez
               * o quince por ciento, y son cuarenta y cinco controles.
               *
               * No es un olvido, son dos problemas distintos. Esta barra está
               * SIEMPRE en pantalla, sobre el papel, con cinco destinos
               * peleando 320 píxeles: cada fondo que se agregue acá compite
               * con la etiqueta por el mismo lugar, y cinco píldoras en fila
               * son una regla de más. Las pestañas de adentro son un grupo
               * chico dentro de una pantalla, donde el lavado contesta «acá
               * estás» sin quitarle lugar a nada.
               *
               * La regla del oro —«solo en líneas de 1px, versalitas y
               * numerales, nunca relleno»— apunta al oro usado como
               * SUPERFICIE para parecer caro, que fue el botón principal y ya
               * se arregló. Un lavado al diez por ciento sobre papel crema se
               * lee como papel. El lente del medidor caza desde el 35%.
               */
              //
              // Cada una se lleva el ancho de su palabra, y la zona táctil
              // queda por encima de los 44 px en los dos lados.
              className="flex flex-col items-center justify-center gap-1 min-w-[44px] min-h-[4.5rem] pt-2.5 pb-2 text-cream/70"
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
        {/* V5: con cinco destinos no hace falta un boton "mas". Lo que no
            esta aca, vive adentro de la sesion que lo necesita. */}
      </div>
    </nav>
  );
}
