/**
 * Visor del Admin — monta el Admin real con un perfil de dirección armado a
 * mano y sin base de datos, para medirlo en Chromium (scripts/medir-app.py).
 * La pestaña llega por la URL: ?tab=clientes
 */
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/sora';
import '@fontsource-variable/fraunces/soft.css';
import '@fontsource-variable/fraunces/soft-italic.css';
import '../../src/index.css';
import Admin from '../../src/pages/Admin';

const tab = new URLSearchParams(location.search).get('tab') ?? 'clientes';
localStorage.clear();
localStorage.setItem('tcd_admin_main_tab', JSON.stringify(tab));
localStorage.setItem('sanar_admin_theme', 'light');

const perfil = {
  id: 'admin-visor', nombre: 'Lupe', email: 'lupe@test', especialidad: '', plan: 'DWY',
  fecha_inicio: '2026-07-01', rol: 'admin', admin_rol: 'owner',
};

createRoot(document.getElementById('root')!).render(
  // @ts-expect-error perfil parcial a propósito
  <Admin adminProfile={perfil} onSignOut={() => {}} />,
);
