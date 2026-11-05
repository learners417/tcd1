/**
 * ═══ DONDE CAE LO QUE SE ROMPE ═══
 *
 * La pantalla de error le dice al cliente «ya nos llegó el aviso y lo estamos
 * mirando». Ese aviso salía SOLO por Sentry, y Sentry arranca únicamente si
 * existe `VITE_SENTRY_DSN` — vacía en `.env.example`. Sin esa variable cargada
 * en Vercel no se inicializa nada: la frase era una promesa que no cumplía
 * nadie, y del otro lado nadie se enteraba de que un cliente se quedó trabado.
 *
 * Esto escribe la falla en `fallas_vistas`, la tabla de la propia base. No
 * reemplaza a Sentry: si el DSN está, los dos reciben. Pero no depende de que
 * nadie configure nada, que es lo que hace falta la semana en que entran
 * clientes de verdad.
 *
 * ═══ LAS TRES REGLAS DE ESTE ARCHIVO ═══
 *
 * 1 · NUNCA TIRA. Esto corre DESPUÉS de que algo ya falló, y en el caso del
 *     ErrorBoundary, mientras se dibuja la pantalla de error. Si acá se
 *     escapara una excepción, el cliente vería una pantalla en blanco en vez
 *     de la pantalla que le explica qué pasó. Todo va envuelto.
 *
 * 2 · NO ESPERA. Nadie se queda mirando una pantalla rota mientras viaja un
 *     POST. Se dispara y sigue.
 *
 * 3 · NO GUARDA LO QUE EL CLIENTE ESCRIBIÓ. Ni su diario, ni su ADN, ni lo
 *     que le dijo al Mentor. Dónde se rompió y qué dijo el navegador alcanza
 *     para arreglarlo; lo otro sería llevarse su trabajo sin pedírselo.
 */
import { supabase, isSupabaseReady } from './supabase';
import { pantallaAbierta } from './pantallaActual';

/** Cuántas fallas se aceptan por carga de página. */
const TOPE = 8;

/*
 * EL TOPE EXISTE POR UN MOTIVO CONCRETO.
 *
 * Un error adentro de un render se repite en bucle: React reintenta, el
 * componente vuelve a fallar, y eso puede escribir miles de filas por minuto
 * contra la base del cliente. La primera falla es la que sirve para arreglar;
 * de la número nueve en adelante no hay información nueva, solo cuenta.
 *
 * Y la misma falla repetida tampoco se manda dos veces: el mismo mensaje en
 * la misma pantalla es la misma falla.
 */
let mandadas = 0;
const vistas = new Set<string>();

/** Qué tan grave fue: se cayó la pantalla entera, o falló algo suelto. */
export type ClaseDeFalla = 'rotura' | 'suelto';

/**
 * Deja constancia de una falla. Nunca tira y nunca hace esperar.
 *
 * @param error  lo que se rompió (un Error, o cualquier cosa que llegó al catch)
 * @param clase  'rotura' si se cayó la pantalla; 'suelto' si no
 */
export function avisarFalla(error: unknown, clase: ClaseDeFalla = 'rotura'): void {
  try {
    const mensaje = (error instanceof Error ? error.message : String(error ?? '')).slice(0, 500);
    if (!mensaje) return;

    const pantalla = pantallaAbierta();
    const huella = `${clase}·${pantalla}·${mensaje}`;
    if (vistas.has(huella) || mandadas >= TOPE) return;
    vistas.add(huella);
    mandadas += 1;

    if (!isSupabaseReady() || !supabase) return;

    /*
     * La pila se recorta a 4000. Una pila de React en producción puede pasar
     * los 50 kB, y lo que sirve para encontrar el archivo está en los
     * primeros renglones: el resto es el andamiaje del framework, igual en
     * todas las fallas.
     */
    const fila = {
      pantalla: pantalla || null,
      mensaje,
      pila: error instanceof Error && error.stack ? error.stack.slice(0, 4000) : null,
      navegador: navigator.userAgent.slice(0, 300),
      direccion: location.href.slice(0, 500),
      clase,
    };

    /*
     * `usuario_id` NO se manda desde acá. Lo pone la base: la columna tiene
     * `references auth.users`, y mandar un id desde el navegador sería creerle
     * al navegador quién es. Si hay sesión, el equipo la cruza por la hora y
     * la pantalla; si no la hay —que es el caso que más importa, el del alta—
     * no habría id de todos modos.
     *
     * Sin `await` a propósito (regla 2). El `.then` vacío es para que un
     * rechazo de la promesa no quede sin manejar y vaya a parar a la consola
     * del cliente.
     */
    void supabase.from('fallas_vistas').insert(fila).then(
      () => undefined,
      () => undefined,
    );
  } catch {
    /* Regla 1: de acá no sale nada. */
  }
}

/**
 * Engancha las dos fallas que NO pasan por el ErrorBoundary de React:
 * un error suelto en cualquier parte, y una promesa que nadie atajó.
 *
 * Son las que más se pierden: no tumban la pantalla, así que el cliente ve
 * un botón que no hace nada y se va sin decir nada.
 */
export function escucharFallasSueltas(): void {
  try {
    window.addEventListener('error', (e) => avisarFalla(e.error ?? e.message, 'suelto'));
    window.addEventListener('unhandledrejection', (e) => avisarFalla(e.reason, 'suelto'));
  } catch {
    /* noop */
  }
}
