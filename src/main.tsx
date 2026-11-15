import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {Toaster} from 'sonner';
import App from './App.tsx';
/* ═══ LAS TRES LETRAS DEL ECOSISTEMA (15 nov 2026) ═══════════════════
 *
 * Decidido por Javo para todo: páginas, libros, app y video. El detalle
 * está en claude/ARQUITECTURA-COLECCION.md §10.
 *
 *   Manrope    lo que se MIRA y se toca — títulos, números, botones,
 *              fichas, etiquetas. Es la letra de la home nueva
 *              (tuclinica.digital) y la de los reels.
 *   Literata   lo que se LEE — todo texto de más de dos líneas.
 *   Cormorant  lo que se CITA — epígrafes y frases de página entera,
 *              en itálica.
 *
 * Reemplazan a Sora (interfaz) y Lora (lectura). Las dos salen del
 * `package.json` en el turno 2, cuando ya no quede ninguna referencia.
 *
 * Van empaquetadas con la app: se ven igual sin conexión y sin depender
 * de Google.
 */
import '@fontsource-variable/manrope';
import '@fontsource-variable/literata';
import '@fontsource-variable/literata/wght-italic.css';
import '@fontsource-variable/cormorant-garamond';
import '@fontsource-variable/cormorant-garamond/wght-italic.css';
import './index.css';
import {initSentry, Sentry} from './lib/sentry';
import {installDomTranslationGuard} from './lib/domTranslationGuard';
import {avisarFalla, escucharFallasSueltas} from './lib/avisarFalla';

installDomTranslationGuard();
initSentry();
/*
 * Las fallas que NO tumban la pantalla —un error suelto, una promesa que
 * nadie atajó— no pasan por el ErrorBoundary de React. Son las que más se
 * pierden: el cliente ve un botón que no hace nada y se va sin decir nada.
 */
escucharFallasSueltas();

/*
 * LA PANTALLA QUE APARECE CUANDO ALGO SE ROMPE.
 *
 * Es la única de la app que se dibuja cuando ya falló todo lo demás, así que
 * va con los colores escritos a mano: si el error ocurrió antes de que cargara
 * la hoja de estilos, las variables del tema no existen.
 *
 * Eso mismo la había dejado fuera de todos los arreglos de tema. Era negra con
 * un botón en dorado brillante —el mismo que el sistema de la app prohíbe por
 * escrito— y aparecía así en medio de una app crema, en el peor momento
 * posible. Los valores de acá abajo son los literales del tema claro, que es
 * el único que ve el cliente.
 */
const FONDO = '#FAF5EA';   // el crema de la app
const TINTA = '#2A2118';   // el texto
const SUAVE = 'rgba(42, 33, 24, 0.72)';
const ORO = '#8E6824';     // el oro oscuro: el único que da contraste con blanco

function FallbackUI() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      padding: '2rem',
      paddingTop: 'calc(2rem + env(safe-area-inset-top, 0px))',
      textAlign: 'center',
      backgroundColor: FONDO,
      color: TINTA,
      fontFamily: '"Sora Variable", system-ui, sans-serif',
    }}>
      <h1 style={{fontSize: '26px', lineHeight: 1.2, margin: '0 0 10px', fontWeight: 600}}>
        Esta pantalla se trabó
      </h1>
      {/*
        LA FRASE ERA UNA PROMESA Y NO DABA NINGUNA SALIDA.

        Decía «ya nos llegó el aviso y lo estamos mirando» y el aviso salía
        solo por Sentry, que arranca únicamente si `VITE_SENTRY_DSN` está
        cargada en Vercel. Sin esa variable no salía nada: el cliente se
        quedaba esperando a alguien que no venía.

        Ahora el aviso sí sale —`onError` lo escribe en la base, abajo— así
        que la frase es cierta. Pero quedaba el otro problema: el único botón
        era «volver a cargar», y si la pantalla se traba otra vez, el cliente
        no tiene a dónde ir. La segunda salida es escribir, con el mensaje ya
        armado: él no tiene por qué saber explicar qué se rompió.
      */}
      <p style={{fontSize: '17px', lineHeight: 1.5, color: SUAVE, margin: '0 0 24px', maxWidth: '34ch'}}>
        Ya nos llegó el aviso y lo estamos mirando. Si tienes apuro, escríbenos.
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          padding: '14px 26px',
          minHeight: '48px',
          backgroundColor: ORO,
          color: '#FFFDF7',
          border: 'none',
          borderRadius: '999px',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '18px',
          fontFamily: 'inherit',
        }}
      >
        Volver a cargar
      </button>
      {/*
        El número va escrito acá y no importado de `lib/planes`: esta pantalla
        se dibuja cuando ya falló todo lo demás, y un import que no cargó es
        justamente una de las formas en que se llega hasta acá. Por eso
        también los colores están a mano más arriba.
      */}
      <a
        href={'https://wa.me/5492944411854?text=' + encodeURIComponent(
          'Hola, se me trabó una pantalla de la app y no puedo seguir.')}
        style={{
          marginTop: '14px',
          minHeight: '48px',
          display: 'inline-flex',
          alignItems: 'center',
          padding: '12px 20px',
          color: TINTA,
          fontWeight: 600,
          fontSize: '17px',
          textDecoration: 'underline',
          textUnderlineOffset: '4px',
        }}
      >
        Escribirle al equipo
      </a>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/*
      `onError` escribe la falla en la base, además de Sentry.

      Hace falta porque la frase de abajo —«ya nos llegó el aviso»— dependía
      de que `VITE_SENTRY_DSN` estuviera cargada en Vercel, y sin esa variable
      Sentry no arranca: no salía ningún aviso y nadie se enteraba de que un
      cliente se quedó trabado. Esto escribe con la misma conexión que la app
      ya usa para todo, así que no depende de que nadie configure nada.
    */}
    <Sentry.ErrorBoundary fallback={<FallbackUI />} onError={(e) => avisarFalla(e, 'rotura')}>
      <App />
      {/*
        Los avisos salían oscuros sobre una app crema, y abajo a la derecha,
        que en el teléfono es justo donde está la barra de pestañas. Ahora van
        claros y arriba, donde no tapan nada y se leen apenas aparecen.
        Los colores vivos se quedan: el rojo y el verde de un aviso son color
        con significado, no decoración.
      */}
      <Toaster theme="light" position="top-center" richColors />
    </Sentry.ErrorBoundary>
  </StrictMode>,
);
