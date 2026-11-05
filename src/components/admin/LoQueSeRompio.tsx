/**
 * LO QUE SE ROMPIÓ — las fallas de los clientes, donde el equipo las ve.
 *
 * ═══ POR QUÉ EXISTE ═══
 *
 * La pantalla de error le promete al cliente «ya nos llegó el aviso y lo
 * estamos mirando». Ese aviso salía solo por Sentry, y Sentry arranca
 * únicamente si `VITE_SENTRY_DSN` está cargada en Vercel — en `.env.example`
 * está vacía. Sin esa variable no se inicializaba nada: la frase era una
 * promesa que no cumplía nadie.
 *
 * Ahora cada falla cae en `fallas_vistas`, en la propia base, y se lee acá.
 * Sin tableros de afuera y sin nada que configurar.
 *
 * ═══ QUÉ SE VE Y QUÉ NO ═══
 *
 * La pantalla donde pasó, qué dijo el navegador y cuándo. Nada de lo que el
 * cliente escribió. Las repetidas se juntan en una sola línea con su cuenta,
 * porque un error adentro de un render escribe la misma falla muchas veces y
 * lo que importa es cuántas personas la tocaron, no cuántas filas hay.
 */
import { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { supabase, isSupabaseReady } from '../../lib/supabase';

interface Falla {
  id: string;
  pantalla: string | null;
  mensaje: string;
  pila: string | null;
  direccion: string | null;
  clase: string;
  creado_en: string;
}

/** Una falla y las veces que apareció. */
interface Agrupada {
  mensaje: string;
  pantalla: string | null;
  clase: string;
  veces: number;
  ultima: string;
  pila: string | null;
}

function agrupar(filas: Falla[]): Agrupada[] {
  const mapa = new Map<string, Agrupada>();
  for (const f of filas) {
    const clave = `${f.pantalla ?? ''}·${f.mensaje}`;
    const ya = mapa.get(clave);
    if (ya) {
      ya.veces += 1;
      if (f.creado_en > ya.ultima) ya.ultima = f.creado_en;
      if (!ya.pila && f.pila) ya.pila = f.pila;
    } else {
      mapa.set(clave, {
        mensaje: f.mensaje, pantalla: f.pantalla, clase: f.clase,
        veces: 1, ultima: f.creado_en, pila: f.pila,
      });
    }
  }
  return [...mapa.values()].sort((a, b) => (a.ultima > b.ultima ? -1 : 1));
}

function cuando(iso: string): string {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return 'recién';
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} ${h === 1 ? 'hora' : 'horas'}`;
  const d = Math.round(h / 24);
  return `hace ${d} ${d === 1 ? 'día' : 'días'}`;
}

export default function LoQueSeRompio() {
  const [filas, setFilas] = useState<Falla[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [abierta, setAbierta] = useState<string | null>(null);

  const cargar = async () => {
    setFilas(null); setError(null);
    if (!isSupabaseReady() || !supabase) { setError('Sin conexión a la base.'); return; }
    /*
     * Se poda antes de leer: una tabla de errores sin poda se come la base, y
     * este panel es el único momento en que alguien la mira. Si la función no
     * está —porque la migración todavía no corrió— se sigue igual: podar es
     * mantenimiento, leer es el trabajo.
     */
    try { await supabase.rpc('podar_fallas_viejas'); } catch { /* noop */ }

    const { data, error: err } = await supabase
      .from('fallas_vistas')
      .select('id, pantalla, mensaje, pila, direccion, clase, creado_en')
      .order('creado_en', { ascending: false })
      .limit(200);
    if (err) { setError(err.message); return; }
    setFilas((data ?? []) as Falla[]);
  };

  useEffect(() => { void cargar(); }, []);

  const grupos = filas ? agrupar(filas) : [];

  return (
    <section className="card-panel p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-gold/70">Lo que se rompió</p>
          <p className="text-sm text-cream/60 mt-1">
            Lo que le falló a un cliente en los últimos 30 días. Lo que escribió no se guarda.
          </p>
        </div>
        <button type="button" onClick={() => void cargar()}
          className="shrink-0 min-h-[44px] px-3 flex items-center gap-2 text-sm font-semibold text-gold">
          <RefreshCw className="w-4 h-4" /> Actualizar
        </button>
      </div>

      {error && <p className="text-sm text-cream/70">{error}</p>}
      {filas === null && !error && <p className="text-sm text-cream/55">Buscando…</p>}

      {filas !== null && grupos.length === 0 && (
        /* En positivo: esto es lo que se quiere ver. */
        <p className="text-sm text-cream/70">Ningún cliente se trabó en los últimos 30 días.</p>
      )}

      {grupos.map((g) => {
        const clave = `${g.pantalla ?? ''}·${g.mensaje}`;
        const abiertaEsta = abierta === clave;
        return (
          <div key={clave} className="rounded-xl border border-[var(--line2,#DFD3BC)] p-3">
            <button type="button" onClick={() => setAbierta(abiertaEsta ? null : clave)}
              aria-expanded={abiertaEsta}
              className="w-full min-h-[44px] flex items-start gap-3 text-left">
              <AlertTriangle className={`w-4 h-4 mt-1 shrink-0 ${g.clase === 'rotura' ? 'text-danger' : 'text-gold'}`} />
              <span className="flex-1 min-w-0">
                <span className="block text-sm text-cream break-words">{g.mensaje}</span>
                <span className="block text-sm text-cream/55 mt-0.5">
                  {g.pantalla ? `en ${g.pantalla}` : 'antes de entrar'}
                  {' · '}{g.clase === 'rotura' ? 'tumbó la pantalla' : 'falló sin tumbarla'}
                  {' · '}{cuando(g.ultima)}
                  {g.veces > 1 ? ` · ${g.veces} veces` : ''}
                </span>
              </span>
            </button>
            {abiertaEsta && g.pila && (
              <pre className="mt-3 overflow-x-auto rounded-lg bg-black/20 p-3 text-sm leading-snug text-cream/70">
                {g.pila}
              </pre>
            )}
          </div>
        );
      })}
    </section>
  );
}
