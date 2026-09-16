/**
 * Visor del Camino — monta la pantalla REAL con un cliente armado a mano,
 * para medirla en un navegador de verdad (jsdom no calcula tamaños).
 * Lo usa scripts/prueba-movil.py. El escenario llega por la URL:
 *   ?dias=71&hechas=15&esp=Psicóloga
 */
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/sora';
import '@fontsource-variable/fraunces/soft.css';
import '@fontsource-variable/fraunces/soft-italic.css';
import '../../src/index.css';
import Roadmap from '../../src/pages/Roadmap';
import { SEED_ROADMAP_V2 } from '../../src/lib/roadmapSeed';
import { setFamiliaActual } from '../../src/lib/vocabulario';

const q = new URLSearchParams(location.search);
const dias = Number(q.get('dias') ?? 71);
const hechas = Number(q.get('hechas') ?? 15);
const esp = q.get('esp') ?? 'Psicóloga';
const hasta = q.get('hasta'); // marca hechas todas las metas de antes de ese día

const inicio = new Date();
inicio.setDate(inicio.getDate() - (dias - 1));
const fecha = `${inicio.getFullYear()}-${String(inicio.getMonth() + 1).padStart(2, '0')}-${String(inicio.getDate()).padStart(2, '0')}`;

const claves: string[] = [];
for (const p of SEED_ROADMAP_V2) for (const m of p.metas) claves.push(`${p.numero}-${m.codigo}`);
localStorage.clear();
const marcadas = hasta
  ? SEED_ROADMAP_V2.flatMap((p) => p.metas.filter((m) => (m.dia_asignado ?? 0) < Number(hasta)).map((m) => `${p.numero}-${m.codigo}`))
  : claves.slice(0, hechas);
localStorage.setItem('tcd_hoja_ruta_v2', JSON.stringify(marcadas));
const perfil = { nombre: 'Julia', especialidad: esp, fecha_inicio: fecha, plan: 'DWY', dia_programa: 37 }; // 37 = el valor congelado de la base; no debe verse
localStorage.setItem('tcd_profile', JSON.stringify(perfil));
setFamiliaActual(esp);

createRoot(document.getElementById('root')!).render(
  <div className="min-h-screen bg-ink px-4 py-4">
    {/* @ts-expect-error perfil parcial a propósito */}
    <Roadmap perfil={perfil} onNavigate={() => {}} onProfileFieldUpdate={() => {}} />
  </div>,
);
