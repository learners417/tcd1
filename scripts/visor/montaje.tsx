/**
 * Visor del Montaje — los 8 candados del cliente, sin base de datos, para
 * mirarlos en Chromium.
 */
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/sora';
import '@fontsource-variable/fraunces/soft.css';
import '@fontsource-variable/fraunces/soft-italic.css';
import '../../src/index.css';
import MontajeCupos from '../../src/components/campanas/MontajeCupos';

localStorage.clear();
localStorage.setItem('sanar_theme', 'light');

createRoot(document.getElementById('root')!).render(
  <div className="min-h-screen bg-ink p-4">
    <MontajeCupos clienteId="cliente-visor" />
  </div>,
);
