import { yaLlegoAlDia, type DondeVa } from './diaPrograma';

/**
 * EL DESTINO QUE CAMBIA.
 *
 * ═══ QUÉ PROBLEMA RESUELVE ═══
 *
 * Las dos navegaciones tienen cinco destinos, y uno de ellos era Campañas
 * desde el día 1. Durante las primeras cuatro semanas —casi un tercio del
 * programa— esa pantalla solo decía cuántas sesiones faltaban para montar.
 *
 * Un destino que no sirve es un destino que se deja de mirar, y los cinco son
 * todo lo que el cliente ve. Perder uno de cinco durante un tercio del
 * programa es perder el 20 % de la navegación justo cuando más se está
 * aprendiendo a usar la app.
 *
 * ═══ QUÉ HACE ═══
 *
 * Ese lugar lo ocupa Mi ADN hasta que le toque montar: es exactamente lo que
 * está construyendo en esas semanas, y es de donde después salen sus anuncios.
 * El día que llega a la sesión del montaje, se convierte en Campañas.
 *
 * No es esconder una función: es que el cuarto destino diga siempre lo que al
 * cliente le sirve HOY. El ADN sigue estando después, en el menú de arriba.
 */

/** El día del Camino en que empieza el trabajo de Campañas. */
export const DIA_EN_QUE_EMPIEZA_CAMPANAS = 29;

export interface DestinoQueCambia {
  id: 'adn' | 'campanas';
  etiqueta: string;
  /** Corto, para la barra de abajo. */
  etiquetaCorta: string;
  /**
   * Su ícono. Antes no venía, así que la barra cambiaba la etiqueta y
   * heredaba el ícono del destino anterior: «Mi ADN» salía con un megáfono.
   */
  icono: 'Dna' | 'Megaphone';
}

/**
 * Qué va en el cuarto destino.
 *
 * Sin `donde` —todavía no se sabe dónde va— manda Campañas: es lo que había
 * antes, y es mejor mostrar de más que dejar el lugar vacío mientras carga.
 */
export function destinoQueCambia(donde: DondeVa | null | undefined): DestinoQueCambia {
  const montando = !donde || yaLlegoAlDia(donde, DIA_EN_QUE_EMPIEZA_CAMPANAS);
  return montando
    ? { id: 'campanas', etiqueta: 'Campañas', etiquetaCorta: 'Campañas', icono: 'Megaphone' }
    : { id: 'adn', etiqueta: 'Mi ADN', etiquetaCorta: 'Mi ADN', icono: 'Dna' };
}

/**
 * El aviso del día en que cambia.
 *
 * Un destino que se transforma sin decir nada se lee como un error de la app.
 * Esto sale una sola vez, el día que pasa.
 */
export function avisoDelCambio(donde: DondeVa | null | undefined): string | null {
  if (!donde) return null;
  return donde.diaDeTrabajo === DIA_EN_QUE_EMPIEZA_CAMPANAS
    ? 'Campañas se abrió en tu menú. Ahí está el paso a paso para montar en Meta.'
    : null;
}
