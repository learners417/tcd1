/**
 * TABLERO DE GRABACIÓN — dónde se cargan los enlaces de YouTube (C3).
 *
 * Una fila por video de Javo y por tutorial de Lupe, con el día de la jornada
 * donde aparece. Se pega el enlace y queda atado a esa sesión: no hay que
 * saber nada de pilares ni de tablas.
 *
 * Guarda en `programa_videos.pilar_id`, con LA CLAVE CON LA QUE EL CAMINO LO
 * BUSCA —el código de la jornada del día (`P2.d8`) para una pieza de Javo, y
 * el código propio (`L-01`) para un paso a paso de Lupe—. Sin migración de
 * base: lo que esté guardado con el código viejo de la pieza se traduce al
 * leer.
 *
 * Antes guardaba el código de la pieza, que el Camino no busca: 34 de las 43
 * piezas se guardaban bien y no se veían nunca, y el contador decía «13 de 64»
 * con 27 videos cargados. El por qué está en `src/lib/elTableroDeGrabacion.ts`,
 * que es ahora el único lugar donde vive esa regla.
 */
import { useEffect, useMemo, useState } from 'react';
import { Check, Link as LinkIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { enlacesPorClave, PDFS_POR_TUTORIAL, POR_REGRABAR } from '../../lib/videosCargados';
import { filasDeGrabacion, clavesLegadas, type FilaDeGrabacion } from '../../lib/elTableroDeGrabacion';

export default function TableroGrabacion() {
  const todas = useMemo(filasDeGrabacion, []);
  const legados = useMemo(clavesLegadas, []);
  // Lo que ya viene cargado por archivo se ve igual; lo de la base lo pisa.
  // Las dos cosas se guardan por la clave del Camino, no por la de la pieza.
  const [links, setLinks] = useState<Record<string, string>>(enlacesPorClave);
  const [ids, setIds] = useState<Record<string, string>>({});
  const [editando, setEditando] = useState<string | null>(null);
  const [borrador, setBorrador] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [quien, setQuien] = useState<'todos' | 'Javo' | 'Lupe'>('todos');

  useEffect(() => {
    void (async () => {
      if (!supabase) return;
      const { data } = await supabase.from('programa_videos').select('id, pilar_id, youtube_url');
      if (!data) return;
      const l: Record<string, string> = enlacesPorClave(); const i: Record<string, string> = {};
      for (const v of data as Array<{ id: string; pilar_id: string | null; youtube_url: string | null }>) {
        if (!v.pilar_id || !v.youtube_url) continue;
        // La clave vieja —el código de la pieza— se traduce a la de hoy.
        const clave = legados[v.pilar_id] ?? v.pilar_id;
        l[clave] = v.youtube_url; i[clave] = v.id;
      }
      setLinks(l); setIds(i);
    })();
  }, [legados]);

  const guardar = async (fila: FilaDeGrabacion) => {
    if (!supabase || !fila.clave) return;
    setGuardando(true);
    const url = borrador.trim();
    const existente = ids[fila.clave];
    const campos = {
      // Acá estaba el turno 12: iba `fila.codigo`, que el Camino no busca.
      pilar_id: fila.clave,
      titulo: fila.titulo,
      descripcion: `${fila.quien} · día ${fila.dia}`,
      youtube_url: url,
      duracion: `${fila.minutos} min`,
    };
    if (existente) await supabase.from('programa_videos').update(campos).eq('id', existente);
    else {
      const { data } = await supabase.from('programa_videos').insert(campos).select('id').single();
      if (data?.id) setIds((p) => ({ ...p, [fila.clave]: data.id as string }));
    }
    setLinks((p) => ({ ...p, [fila.clave]: url }));
    setEditando(null); setBorrador(''); setGuardando(false);
  };

  const lista = todas.filter((f) => quien === 'todos' || f.quien === quien);
  const cargados = lista.filter((f) => links[f.clave]).length;

  return (
    <div className="space-y-4">
      <div className="card-panel p-5">
        <p className="text-[15px] font-bold uppercase tracking-[0.16em] text-goldhi">Tablero de grabación</p>
        <p className="mt-2 text-[28px] leading-none text-cream" style={{ fontFamily: 'var(--font-display)' }}>
          {cargados} <span className="text-[17px] font-sans not-italic text-cream/60">de {lista.length} con enlace</span>
        </p>
        <p className="mt-2 text-[17px] text-cream/70">
          Pega el enlace de YouTube y el video queda en la sesión de ese día. Los que no tienen enlace no se anuncian:
          esa jornada se hace con su texto.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {(['todos', 'Javo', 'Lupe'] as const).map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setQuien(q)}
              className={`min-h-[44px] rounded-2xl border px-3 text-[15px] font-semibold ${
                quien === q ? 'border-gold bg-[var(--card,#FFFDF7)] text-cream' : 'border-[var(--line2,#DFD3BC)] text-cream/70'
              }`}
            >
              {q === 'todos' ? 'Todos' : q}
            </button>
          ))}
        </div>
      </div>

      <ul className="card-panel divide-y divide-[var(--line,#EBE1CF)]">
        {lista.map((f) => {
          const url = links[f.clave];
          const abierto = editando === f.codigo;
          return (
            <li key={f.codigo} className="p-4">
              <div className="flex items-start gap-3">
                <span
                  className="mt-1 w-6 h-6 shrink-0 rounded-full grid place-items-center border"
                  style={url
                    ? { background: 'var(--tilde, #4A7C59)', borderColor: 'var(--tilde, #4A7C59)' }
                    : { borderColor: 'var(--line2, #DFD3BC)' }}
                >
                  {url && <Check className="w-4 h-4" style={{ color: '#FFFDF7' }} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[17px] font-semibold text-cream">{f.titulo}</p>
                  <p className="text-[15px] text-cream/60">
                    {/* Las jornadas que ya tienen video y ninguna pieza nombra
                        no traen minutos: no se inventa un «0 min». */}
                    Día {f.dia} · {f.quien}{f.minutos > 0 ? ` · ${f.minutos} min` : ''}{f.donde ? ` · ${f.donde}` : ''}
                  </p>
                  {/* El video está cargado y su guion cambió: la tilde verde
                      sola haría pensar que esta jornada ya está lista. */}
                  {POR_REGRABAR[f.dia] && (
                    <p className="mt-1 text-[15px]" style={{ color: 'var(--tacha, #B4472E)' }}>
                      Para regrabar · {POR_REGRABAR[f.dia]}
                    </p>
                  )}
                  {/* El Camino muestra UN video por jornada. Dos piezas del
                      mismo día comparten ese lugar: se dice acá en vez de que
                      la segunda pise a la primera sin que se vea. */}
                  {f.comparteCon.length > 0 && (
                    <p className="mt-1 text-[15px] text-cream/60">
                      El día {f.dia} comparte su lugar en el Camino con {f.comparteCon.join(', ')}: se sube un video por jornada.
                    </p>
                  )}
                  {PDFS_POR_TUTORIAL[f.codigo] && (
                    <a href={PDFS_POR_TUTORIAL[f.codigo]} target="_blank" rel="noreferrer"
                      className="mt-1 mr-4 inline-flex items-center gap-1.5 min-h-[44px] text-[15px] text-goldhi">
                      PDF
                    </a>
                  )}
                  {url && !abierto && (
                    <a href={url} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1.5 min-h-[44px] text-[15px] text-goldhi">
                      <LinkIcon className="w-4 h-4" /> Ver el video
                    </a>
                  )}
                  {abierto && (
                    <div className="mt-2 space-y-2">
                      <input
                        value={borrador}
                        onChange={(e) => setBorrador(e.target.value)}
                        placeholder="https://youtu.be/…"
                        className="w-full min-h-[48px] rounded-xl border border-[var(--line2,#DFD3BC)] bg-transparent px-3 text-[17px] text-cream"
                      />
                      <div className="flex gap-2">
                        <button type="button" onClick={() => void guardar(f)} disabled={guardando} className="btn-ios-primary flex-1">
                          {guardando ? 'Guardando…' : 'Guardar'}
                        </button>
                        <button type="button" onClick={() => { setEditando(null); setBorrador(''); }}
                          className="min-h-[52px] px-4 rounded-[20px] border border-[var(--line2,#DFD3BC)] text-[17px] text-cream">
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                {!abierto && (
                  <button
                    type="button"
                    onClick={() => { setEditando(f.codigo); setBorrador(url ?? ''); }}
                    className="min-h-[44px] px-3 text-[15px] font-semibold text-goldhi shrink-0"
                  >
                    {url ? 'Cambiar' : 'Pegar enlace'}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
