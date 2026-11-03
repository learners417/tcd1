/**
 * Visor de Soporte — monta la pantalla real del cliente, sin base de datos,
 * para mirarla en Chromium. Con ?tab=humano abre la pestaña del equipo, que es
 * la que reemplaza a Discord.
 */
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/sora';
import '@fontsource-variable/fraunces/soft.css';
import '@fontsource-variable/fraunces/soft-italic.css';
import '../../src/index.css';
import Mensajes from '../../src/pages/Mensajes';

localStorage.clear();
localStorage.setItem('sanar_theme', 'light');
localStorage.setItem('tcd_profile', JSON.stringify({ nombre: 'Ana Martínez' }));

const quiere = new URLSearchParams(location.search).get('tab');

createRoot(document.getElementById('root')!).render(
  <div className="min-h-screen bg-ink p-4">
    <Mensajes userId="cliente-visor" />
  </div>,
);

// La pestaña se elige con un clic, igual que lo haría una persona: el
// componente guarda ese estado adentro y no lo expone por props.
if (quiere === 'humano') {
  window.setTimeout(() => {
    const botones = [...document.querySelectorAll('button')];
    botones.find((b) => /Soporte Humano/.test(b.textContent ?? ''))?.click();
  }, 120);
}
