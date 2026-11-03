/**
 * Visor de los modales del cliente — para medirlos en Chromium
 * (scripts/medir-app.py). El modal llega por la URL: ?m=freno
 *
 * ═══ POR QUÉ HACÍA FALTA ═══
 *
 * Las vistas del medidor fotografían pantallas. Un modal no es una pantalla:
 * se abre encima, muchas veces un solo día del programa —el certificado y la
 * foto del día 90 aparecen UNA vez en noventa días— así que ninguna lente los
 * había mirado nunca. El tablero semanal ya enseñó lo que pasa cuando algo
 * solo se ve en un día puntual: estuvo con los rótulos montados un arco
 * entero, en la pantalla principal del cliente, porque nada lo abría.
 *
 * ═══ CON DATOS REALES, NO RELLENO ═══
 *
 * Los frenos salen de `frenoDe()` y la comparación del día 90 de
 * `compararFotoPartida()`, que son las mismas funciones que usa la app. Medir
 * un modal con texto inventado mide el relleno: los textos de la casa son
 * largos y es justamente el largo lo que rompe los encabezados.
 */
import type React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/sora';
import '@fontsource-variable/fraunces/soft.css';
import '@fontsource-variable/fraunces/soft-italic.css';
import '../../src/index.css';

import Freno from '../../src/components/Freno';
import CertificadoModal from '../../src/components/CertificadoModal';
import FotoDia90 from '../../src/components/FotoDia90';
import PilarUnlockedModal from '../../src/components/PilarUnlockedModal';
import Graduacion from '../../src/components/Graduacion';
import TodoElMaterial from '../../src/components/TodoElMaterial';
import { frenoDe } from '../../src/lib/frenos';
import { compararFotoPartida } from '../../src/lib/diaValidator';
import { SEED_ROADMAP_V2 } from '../../src/lib/roadmapSeed';

localStorage.clear();
localStorage.setItem('sanar_admin_theme', 'light');

const nada = () => {};

/*
 * Un perfil con las piezas puestas: la comparación del día 90 se deriva del
 * ADN, y con el perfil vacío el modal muestra la versión sin datos, que no es
 * la que ve quien llega al día 90.
 */
const perfil = {
  nombre: 'Julia',
  historia_corta: 'Soy psicóloga hace doce años y me cansé de tener la agenda llena y la cuenta vacía.',
  proposito_frase: 'Que ninguna profesional de la salud tenga que elegir entre su vocación y su tiempo.',
  legado_declaracion: 'Dejar un método que otra pueda seguir sin mí.',
  metodo_nombre: 'Método RAÍZ',
  avatar_descripcion: 'Psicólogas de 35 a 50 con consultorio lleno y sin método propio.',
  oferta_promesa: 'Tu programa de alto valor instalado en 90 días.',
  oferta_precio: 1000,
};

/* Los títulos por día se arman igual que en la Biblioteca: del seed. */
const titulosPorDia: Record<number, string> = {};
for (const p of SEED_ROADMAP_V2) {
  for (const m of p.metas) if (m.dia_asignado) titulosPorDia[m.dia_asignado] = m.titulo;
}

const MODALES: Record<string, () => React.ReactElement> = {
  // El freno de escribir la palabra: el más largo de los tres niveles.
  freno: () => (
    <Freno
      freno={frenoDe('cambiar_precio', { nombreCliente: 'Julia', monto: 1000 })}
      onSeguir={nada}
      onCancelar={nada}
    />
  ),
  // Y el de encender la campaña, que es el que más veces se ve.
  'freno>campana': () => (
    <Freno
      freno={frenoDe('encender_campana', { nombreCliente: 'tu campaña', monto: 0 })}
      onSeguir={nada}
      onCancelar={nada}
    />
  ),
  certificado: () => (
    <CertificadoModal open onClose={nada} nombre="Julia Fernández" metodoNombre="Método RAÍZ" ventas={12} />
  ),
  foto90: () => (
    <FotoDia90
      open
      onClose={nada}
      comparacion={compararFotoPartida(perfil as never)}
      nombre="Julia"
      dia={90}
    />
  ),
  pilar: () => (
    <PilarUnlockedModal
      pilarCompletado="Tu número"
      pilarDesbloqueado="Tu programa"
      pilarNumero={1}
      cinturon={{ nombre: 'Semilla', emoji: '', metafora: 'Lo que plantaste ya tiene raíz.' }}
      mentorPregunta="¿Qué cambió en vos desde el día 1, más allá del número?"
      onClose={nada}
      onContinuar={nada}
    />
  ),
  graduacion: () => (
    <Graduacion
      nombre="Julia"
      ventas={12}
      onClose={nada}
      perfil={perfil as never}
      comparacion={compararFotoPartida(perfil as never)}
    />
  ),
  material: () => (
    <TodoElMaterial
      titulos={titulosPorDia}
      cargadosEnLaBase={{}}
      diaActual={40}
      bibliotecaAbierta
    />
  ),
};

const cual = new URLSearchParams(location.search).get('m') ?? 'freno';
const Elegido = MODALES[cual];

createRoot(document.getElementById('root')!).render(
  Elegido ? <Elegido /> : <p style={{ padding: 24 }}>No existe el modal «{cual}»</p>,
);
