import { useEffect, useState } from 'react';

/**
 * LA CONEXIÓN — que el cliente sepa por qué algo no funcionó.
 *
 * Hasta ahora, sin internet la app no se enteraba: los pedidos fallaban con
 * mensajes técnicos («Failed to fetch», «NetworkError») y el sanador quedaba
 * mirando un error que no le decía nada. Y el que carga sus números desde el
 * teléfono, en el subte o con mala señal, es exactamente el caso.
 *
 * La diferencia importa porque la acción es distinta: sin internet hay que
 * esperar; con el servidor caído hay que avisar. Confundirlas hace que el
 * cliente reintente veinte veces o que abandone cuando solo tenía que
 * caminar media cuadra.
 */

export type EstadoRed = 'conectado' | 'sin_internet';

/** Si el navegador dice que no hay red, no hay red. */
export function hayInternet(): boolean {
  return typeof navigator === 'undefined' || navigator.onLine !== false;
}

/**
 * Escucha los cambios de conexión.
 *
 * `navigator.onLine` miente hacia arriba (puede decir que hay red cuando la
 * señal no llega a ningún lado), pero nunca hacia abajo: si dice que no hay,
 * seguro que no hay. Por eso solo se usa para el caso negativo.
 */
export function useConexion(): EstadoRed {
  const [estado, setEstado] = useState<EstadoRed>(
    () => (hayInternet() ? 'conectado' : 'sin_internet'));

  useEffect(() => {
    const online = () => setEstado('conectado');
    const offline = () => setEstado('sin_internet');
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
    };
  }, []);

  return estado;
}

/** Las señales de que el problema es la red y no el servidor. */
const SENALES_DE_RED = [
  'failed to fetch', 'networkerror', 'network request failed',
  'load failed', 'err_internet', 'err_network', 'err_name_not_resolved',
  'fetch failed', 'aborted',
];

export type CausaFalla = 'sin_internet' | 'servidor' | 'permiso' | 'desconocida';

export function causaDe(err: unknown): CausaFalla {
  if (!hayInternet()) return 'sin_internet';
  const msg = (err instanceof Error ? err.message : String(err ?? '')).toLowerCase();
  const status = (err as { status?: number })?.status;

  if (SENALES_DE_RED.some((s) => msg.includes(s))) return 'sin_internet';
  if (status === 401 || status === 403 || msg.includes('jwt') || msg.includes('sesión')) {
    return 'permiso';
  }
  if (typeof status === 'number' && status >= 500) return 'servidor';
  if (msg.includes('supabase') || msg.includes('database') || msg.includes('rpc')) {
    return 'servidor';
  }
  return 'desconocida';
}

/**
 * El mensaje que ve el sanador, con la acción que le corresponde.
 *
 * Nunca se le muestra el error técnico: no puede hacer nada con él y solo
 * transmite que algo está roto sin decirle qué hacer.
 */
export function mensajeDeFalla(err: unknown, queEstabaHaciendo = 'guardar'): string {
  switch (causaDe(err)) {
    case 'sin_internet':
      return `Parece que te quedaste sin internet. Lo que escribiste no se perdió: vuelve a intentar ${queEstabaHaciendo} cuando tengas señal.`;
    case 'permiso':
      return 'Tu sesión venció. Vuelve a entrar y sigue donde estabas.';
    case 'servidor':
      return `No pudimos ${queEstabaHaciendo} en este momento. No es tu conexión: prueba de nuevo en un minuto.`;
    default:
      return `No pudimos ${queEstabaHaciendo}. Prueba de nuevo; si sigue pasando, escríbenos.`;
  }
}
