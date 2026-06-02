import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {Toaster} from 'sonner';
import App from './App.tsx';
import './index.css';
import {initSentry, Sentry} from './lib/sentry';
import {installDomTranslationGuard} from './lib/domTranslationGuard';

installDomTranslationGuard();
initSentry();

function FallbackUI() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      padding: '2rem',
      textAlign: 'center',
      backgroundColor: '#0a0a0a',
      color: '#fff',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <h1 style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>Algo salió mal</h1>
      <p style={{opacity: 0.7, marginBottom: '1.5rem'}}>
        Ya nos enteramos del error y lo estamos revisando.
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          padding: '0.6rem 1.2rem',
          backgroundColor: '#d4af37',
          color: '#000',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        Recargar
      </button>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<FallbackUI />}>
      <App />
      <Toaster theme="dark" position="bottom-right" richColors />
    </Sentry.ErrorBoundary>
  </StrictMode>,
);
