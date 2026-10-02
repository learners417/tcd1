/**
 * Visor del onboarding — monta el WelcomeWizard real con un perfil nuevo y sin
 * base de datos, para mirarlo en Chromium. Solo verificación: no entra en la app.
 */
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/sora';
import '@fontsource-variable/fraunces/soft.css';
import '@fontsource-variable/fraunces/soft-italic.css';
import '../../src/index.css';
import WelcomeWizard from '../../src/components/WelcomeWizard';

localStorage.clear();
// El wizard recuerda su paso: así se puede mirar cualquiera sin recorrer todo.
const paso = new URLSearchParams(location.search).get('paso');
if (paso) localStorage.setItem('tcd_wizard_step_v1', paso);

const perfil = {
  id: 'cliente-nuevo', nombre: 'Ani', email: 'ani@test', especialidad: '',
  plan: 'implementacion', onboarding_completed: false,
};

createRoot(document.getElementById('root')!).render(
  // @ts-expect-error perfil parcial a propósito
  <WelcomeWizard profile={perfil} onComplete={() => {}} />,
);
