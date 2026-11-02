/**
 * Visor del Login — monta la pantalla de entrada real para medirla en
 * Chromium (scripts/medir-app.py).
 *
 * Es la PRIMERA pantalla que ve todo cliente, y era la única del recorrido
 * que ninguna lente había mirado nunca: el medidor entra a la app con sesión
 * puesta, así que el login le quedaba atrás.
 *
 * `?modal=recuperar` abre el modal de contraseña olvidada, que es el otro
 * camino que alguien toma el primer día.
 */
import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/sora';
import '@fontsource-variable/fraunces/soft.css';
import '@fontsource-variable/fraunces/soft-italic.css';
import '../../src/index.css';
import Login from '../../src/pages/Login';

localStorage.clear();
localStorage.setItem('sanar_admin_theme', 'light');

const modal = new URLSearchParams(location.search).get('modal');

function Visor() {
  useEffect(() => {
    if (modal !== 'recuperar') return;
    // El modal se abre desde el propio botón de la pantalla: así se mide lo
    // que el cliente ve de verdad, no un estado armado a mano.
    const t = setTimeout(() => {
      const b = [...document.querySelectorAll('button')]
        .find((x) => /olvidaste tu contraseña/i.test(x.textContent || ''));
      b?.click();
    }, 400);
    return () => clearTimeout(t);
  }, []);
  return <Login onLogin={() => {}} />;
}

createRoot(document.getElementById('root')!).render(<Visor />);
