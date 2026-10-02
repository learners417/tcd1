/**
 * LO QUE HIZO AFUERA — cerrar una jornada que el cliente ya traía hecha.
 *
 * Varios vienen construyendo por su cuenta: el método en un Word, la oferta en
 * una presentación, el onboarding en otra herramienta. Para la app eso no
 * existe, así que aparecen con todo vencido y en rojo.
 *
 * Un tablero al que no se le cree deja de usarse en la primera semana. Por eso
 * quien acompaña puede cerrar esa jornada con dos toques: cuenta como cerrada
 * para el color, y queda marcada para el cierre de cuentas, donde la garantía
 * mide lo que el cliente entregó adentro.
 */
import { supabase, isSupabaseReady, guardarFila } from './supabase';

export interface JornadaHechaAfuera {
  clave: string;
  marcadoPor: string;
  marcadoEl: string;
}

/**
 * Marca la jornada como hecha afuera.
 *
 * Devuelve la clave `pilar-codigo` para sumarla al progreso en pantalla sin
 * esperar a que la base conteste.
 */
export async function marcarHechoAfuera(
  usuarioId: string,
  pilarNumero: number,
  metaCodigo: string,
  quien: string,
): Promise<string> {
  const clave = `${pilarNumero}-${metaCodigo}`;
  if (isSupabaseReady() && supabase) {
    // Por el helper de siempre: los upserts a mano rompen cuando la tabla no
    // tiene el índice único que ese atajo da por hecho.
    await guardarFila('hoja_de_ruta', {
      usuario_id: usuarioId,
      pilar_numero: pilarNumero,
      meta_codigo: metaCodigo,
      completada: true,
      hecho_afuera: true,
      marcado_por: quien,
      marcado_el: new Date().toISOString(),
      fecha_completada: new Date().toISOString().slice(0, 10),
    }, ['usuario_id', 'pilar_numero', 'meta_codigo']);
  }
  return clave;
}

/** Vuelve atrás: la jornada queda otra vez abierta. */
export async function desmarcarHechoAfuera(
  usuarioId: string,
  pilarNumero: number,
  metaCodigo: string,
): Promise<string> {
  const clave = `${pilarNumero}-${metaCodigo}`;
  if (isSupabaseReady() && supabase) {
    await supabase.from('hoja_de_ruta')
      .update({ completada: false, hecho_afuera: false, marcado_por: null, marcado_el: null, fecha_completada: null })
      .eq('usuario_id', usuarioId)
      .eq('pilar_numero', pilarNumero)
      .eq('meta_codigo', metaCodigo);
  }
  return clave;
}

/** Las jornadas que ese cliente cerró afuera, para distinguirlas en pantalla. */
export async function hechasAfuera(usuarioId: string): Promise<JornadaHechaAfuera[]> {
  if (!isSupabaseReady() || !supabase) return [];
  const { data, error } = await supabase
    .from('hoja_de_ruta')
    .select('pilar_numero, meta_codigo, marcado_por, marcado_el')
    .eq('usuario_id', usuarioId)
    .eq('hecho_afuera', true);
  if (error || !data) return [];
  return (data as Array<{ pilar_numero: number; meta_codigo: string; marcado_por: string | null; marcado_el: string | null }>)
    .map((f) => ({
      clave: `${f.pilar_numero}-${f.meta_codigo}`,
      marcadoPor: f.marcado_por ?? 'el equipo',
      marcadoEl: (f.marcado_el ?? '').slice(0, 10),
    }));
}

/** Lo que se le muestra a quien acompaña, para que sepa qué está haciendo. */
export const AVISO_HECHO_AFUERA =
  'Se cierra como hecha y queda anotado que vino de afuera. El color deja de marcarlo en rojo y el cierre de cuentas lo sigue distinguiendo.';
