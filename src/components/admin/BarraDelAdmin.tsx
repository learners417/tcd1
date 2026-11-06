/**
 * LA NAVEGACIÓN DEL ADMIN — los mismos destinos, siempre a la vista.
 *
 * ═══ POR QUÉ EXISTE ═══
 *
 * El Admin ya tenía bien resuelto lo difícil: diecisiete entradas planas se
 * habían agrupado en cuatro momentos —Hoy, La Semana, Clientes, El Negocio—
 * y lo de adentro vive en pestañas arriba del contenido. Eso estaba hecho.
 *
 * Lo que faltaba era dónde viven esos cuatro. Vivían en una barra lateral en
 * computadora y detrás de una hamburguesa en el teléfono: un toque de
 * distancia, y ningún momento a la vista hasta que lo abres. Es exactamente
 * el patrón que el lado del cliente abandonó cuando se decidió «cuatro
 * destinos fijos, iguales en teléfono y en computadora» — y por el que se
 * borró `Sidebar.tsx`.
 *
 * El que opera la app abre esto todos los días. Si los cuatro momentos están
 * escondidos, cada cambio de momento cuesta dos toques en vez de uno, y el
 * que recién entra al equipo no ve el mapa: ve un título y una rayita.
 *
 * ═══ POR QUÉ NO ES `BottomTabBar` ═══
 *
 * Esa barra lleva adentro el contador de respuestas sin abrir del cliente,
 * con su suscripción a `mensajes` por `receptor_id`. Nada de eso aplica acá,
 * y meterle una bandera para apagarlo haría un componente que sirve a dos
 * amos. Lo que se comparte es la FORMA —misma posición, mismo alto, mismo
 * activo de trazo dorado sin relleno— y la forma se comparte copiándola, que
 * cuesta cincuenta líneas y no ata dos pantallas distintas entre sí.
 */
import type { ElementType } from 'react';

export interface DestinoDelAdmin {
  id: string;
  label: string;
  icon: ElementType;
  /** El Negocio es solo para la dirección. */
  ownerOnly?: boolean;
}

export default function BarraDelAdmin({
  destinos, actual, ir,
}: {
  destinos: DestinoDelAdmin[];
  actual: string;
  ir: (id: string) => void;
}) {
  if (destinos.length === 0) return null;

  return (
    <nav
      /*
       * Teléfono: pegada abajo, de lado a lado, respetando el área segura.
       * Computadora: isla centrada a 24 px del piso. Misma lista, mismo
       * orden, mismas palabras — igual que del lado del cliente, para que
       * quien usa las dos no tenga que aprender dos cosas.
       */
      className="fixed bottom-0 inset-x-0 z-40 border-t border-[var(--line,rgba(176,130,46,0.2))] bg-[var(--bg-root)]
                 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:bottom-6 md:border md:rounded-[28px]
                 md:px-2 md:shadow-[0_10px_40px_-12px_rgba(43,39,35,0.28)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Navegación del panel"
    >
      <div className="flex items-stretch justify-evenly px-0.5 md:gap-2 md:px-1">
        {destinos.map((d) => {
          const activo = actual === d.id;
          const Icono = d.icon;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => ir(d.id)}
              aria-current={activo ? 'page' : undefined}
              className="flex flex-col items-center justify-center gap-1 min-w-[44px] min-h-[4.5rem]
                         pt-2.5 pb-2 text-cream/70 md:min-h-[4rem] md:px-4 md:rounded-[22px]
                         md:transition-colors md:hover:bg-gold/[0.06]"
            >
              {/*
                El activo cambia el trazo del ícono a oro y el peso de la
                etiqueta a 700. Sin fondo y sin píldora: la regla del oro
                apunta al oro usado como SUPERFICIE para parecer caro; un
                trazo dorado sobre papel es tinta.
              */}
              <Icono
                className={`w-6 h-6 shrink-0 ${activo ? 'text-gold' : 'text-cream/60'}`}
                strokeWidth={activo ? 2 : 1.75}
              />
              <span
                className="text-[15px] leading-none whitespace-nowrap"
                /*
                  600 y no 500 para el inactivo. La barra del cliente usa 500,
                  y acá eso agregaba un CUARTO peso a pantallas que ya usan
                  400, 600 y 700 — el techo de la casa son tres por pantalla,
                  y `admin:videos` lo pasó apenas se montó la barra. Una barra
                  de navegación no es lugar para estrenar un peso: usa los que
                  la pantalla ya tiene.
                */
                style={{ fontWeight: activo ? 700 : 600, color: activo ? 'var(--text-cream)' : undefined }}
              >
                {d.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
