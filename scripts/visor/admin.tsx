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

const pedido = new URLSearchParams(location.search).get('tab') ?? 'clientes';
localStorage.clear();

/*
 * La Sala de Mando tiene cuatro vistas adentro y el visor solo sabía abrir la
 * pestaña, así que siempre se medía el Marcador: las otras tres no pasaron
 * nunca por una lente de pantalla. Con `?tab=sala-motor` se abre la Sala en
 * Mi Motor, por la misma clave que usa la pantalla para recordar dónde estaba.
 */
const tab = pedido.startsWith('sala-') ? 'sala' : pedido;
if (pedido.startsWith('sala-')) {
  localStorage.setItem('tcd_sala_vista', pedido.slice('sala-'.length));
}
localStorage.setItem('tcd_admin_main_tab', JSON.stringify(tab));
localStorage.setItem('sanar_admin_theme', 'light');
if (new URLSearchParams(location.search).get('pausa')) {
  const a = new Date(); a.setDate(a.getDate() - 2);
  const b = new Date(); b.setDate(b.getDate() + 12);
  const iso = (x: Date) => x.toISOString().slice(0, 10);
  localStorage.setItem('tcd_pausas_globales_v1', JSON.stringify([{ desde: iso(a), hasta: iso(b), motivo: 'Fiestas de fin de año' }]));
}

const perfil = {
  id: 'admin-visor', nombre: 'Lupe', email: 'lupe@test', especialidad: '', plan: 'DWY',
  fecha_inicio: '2026-07-01', rol: 'admin', admin_rol: 'owner',
};

createRoot(document.getElementById('root')!).render(
  // @ts-expect-error perfil parcial a propósito
  <Admin adminProfile={perfil} onSignOut={() => {}} />,
);
