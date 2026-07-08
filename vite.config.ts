import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {sentryVitePlugin} from '@sentry/vite-plugin';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');

  // Sentry source map upload solo si tenemos el auth token.
  // En dev local sin token, salteamos para no romper el build.
  const sentryAuthToken = env.SENTRY_AUTH_TOKEN || process.env.SENTRY_AUTH_TOKEN;
  const sentryOrg = env.SENTRY_ORG || process.env.SENTRY_ORG || 'learners-t3';
  const sentryProject = env.SENTRY_PROJECT || process.env.SENTRY_PROJECT || 'tuclinicadigital';
  const enableSentryUpload = Boolean(sentryAuthToken);

  return {
    plugins: [
      react(),
      tailwindcss(),
      ...(enableSentryUpload ? [sentryVitePlugin({
        org: sentryOrg,
        project: sentryProject,
        authToken: sentryAuthToken,
        sourcemaps: {
          // Subir todos los source maps generados por Vite.
          filesToDeleteAfterUpload: ['./dist/**/*.map'],
        },
        release: {
          // Usa el commit SHA de Vercel como nombre del release.
          name: env.VERCEL_GIT_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA,
        },
      })] : []),
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      // Inyecta el commit SHA como release de Sentry. Tiene que coincidir con
      // el release que usa @sentry/vite-plugin para subir source maps, sino
      // Sentry no sabe matchear los errores con los maps.
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(
        env.VERCEL_GIT_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || 'dev'
      ),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      // Generar source maps (necesario para que Sentry los pueda subir).
      // Despues del upload, el plugin los borra del bundle (filesToDeleteAfterUpload).
      sourcemap: true,
      // Optimización: separar las librerías grandes en chunks propios.
      // Reduce el bundle inicial → la app carga más rápido en la primera visita.
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'charts': ['recharts'],
            'sentry': ['@sentry/react'],
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify - file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
