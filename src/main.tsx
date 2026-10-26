import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {Toaster} from 'sonner';
import App from './App.tsx';
// Fuentes empaquetadas con la app: se ven igual sin conexión y sin depender de Google.
import '@fontsource-variable/sora';
// Cormorant Garamond: la letra de la tapa de «Las 7 libertades fundamentales».
// Es la que da el aire de libro —fina, con contraste de trazo, con versalitas
// que respiran— y pasa a ser la letra de los títulos de toda la app, para que
// abrirla y abrir el libro se sientan la misma cosa.
import '@fontsource-variable/cormorant-garamond';
import '@fontsource-variable/cormorant-garamond/wght-italic.css';
// Lora: la letra con la que están impresos los libros de la colección. Va solo
// donde el cliente LEE —el dato del paisaje, un tutorial, una lección— y no
// donde opera. Sora sigue siendo la de la interfaz: botones, datos y números
// se leen mejor en una sans, y una app entera en serif se lee como un PDF.
import '@fontsource-variable/lora';
import '@fontsource-variable/lora/wght-italic.css';
import './index.css';
import {initSentry, Sentry} from './lib/sentry';
import {installDomTranslationGuard} from './lib/domTranslationGuard';

installDomTranslationGuard();
initSentry();

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
      <p style={{fontSize: '17px', lineHeight: 1.5, color: SUAVE, margin: '0 0 24px', maxWidth: '34ch'}}>
        Ya nos llegó el aviso y lo estamos mirando.
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
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<FallbackUI />}>
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
