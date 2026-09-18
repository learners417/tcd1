/**
 * TABLERO DE GRABACIÓN — dónde se cargan los enlaces de YouTube (C3).
 *
 * Una fila por video de Javo y por tutorial de Lupe, con el día de la jornada
 * donde aparece. Se pega el enlace y queda atado a esa sesión: no hay que
 * saber nada de pilares ni de tablas.
 *
 * Guarda en `programa_videos`, usando `pilar_id` para el código de la jornada
 * (P1.0) o del tutorial (L-01). Sin migración de base.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Check, Link as LinkIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { roadmap, SEED_ROADMAP_V2 } from '../../lib/roadmapSeed';
import { VIDEOS_POR_JORNADA, PDFS_POR_TUTORIAL } from '../../lib/videosCargados';

interface Fila {
  codigo: string;
  titulo: string;
  dia: number;
  quien: 'Javo' | 'Lupe';
  minutos: number;
  donde?: string;
}

function filas(): Fila[] {
  const metasPorPieza = new Map<string, { titulo: string; dia: number }>();
  for (const p of SEED_ROADMAP_V2) {
    for (const m of p.metas) metasPorPieza.set(m.codigo, { titulo: m.titulo, dia: m.dia_asignado ?? 0 });
  }
  const piezas: Fila[] = roadmap.piezas.map((p) => ({
    codigo: p.codigo,
    titulo: p.titulo,
    dia: metasPorPieza.get(p.codigo)?.dia ?? p.dia ?? 0,
    quien: 'Javo' as const,
    minutos: p.minutos,
    donde: p.set,
  }));
  const tutos: Fila[] = roadmap.tutoriales.map((t) => ({
    codigo: t.codigo,
    titulo: t.titulo,
    dia: t.dia,
    quien: 'Lupe' as const,
    minutos: t.minutos,
    donde: t.donde,
  }));
  return [...piezas, ...tutos].sort((a, b) => a.dia - b.dia || a.codigo.localeCompare(b.codigo));
}

export default function TableroGrabacion() {
  const todas = useMemo(filas, []);
  // Lo que ya viene cargado por archivo se ve igual; lo de la base lo pisa.
  const [links, setLinks] = useState<Record<string, string>>({ ...VIDEOS_POR_JORNADA });
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
      const l: Record<string, string> = { ...VIDEOS_POR_JORNADA }; const i: Record<string, string> = {};
      for (const v of data as Array<{ id: string; pilar_id: string | null; youtube_url: string | null }>) {
        if (v.pilar_id && v.youtube_url) { l[v.pilar_id] = v.youtube_url; i[v.pilar_id] = v.id; }
      }
      setLinks(l); setIds(i);
    })();
  }, []);

  const guardar = async (fila: Fila) => {
    if (!supabase) return;
    setGuardando(true);
    const url = borrador.trim();
    const existente = ids[fila.codigo];
    const campos = {
      pilar_id: fila.codigo,
      titulo: fila.titulo,
      descripcion: `${fila.quien} · día ${fila.dia}`,
      youtube_url: url,
      duracion: `${fila.minutos} min`,
    };
    if (existente) await supabase.from('programa_videos').update(campos).eq('id', existente);
    else {
      const { data } = await supabase.from('programa_videos').insert(campos).select('id').single();
      if (data?.id) setIds((p) => ({ ...p, [fila.codigo]: data.id as string }));
    }
    setLinks((p) => ({ ...p, [fila.codigo]: url }));
    setEditando(null); setBorrador(''); setGuardando(false);
  };

  const lista = todas.filter((f) => quien === 'todos' || f.quien === quien);
  const cargados = lista.filter((f) => links[f.codigo]).length;

  return (
    <div className="space-y-4">
      <div className="card-panel p-5">
        <p className="text-[15px] font-bold uppercase tracking-[0.16em] text-goldhi">Tablero de grabación</p>
        <p className="mt-2 text-[28px] leading-none text-cream" style={{ fontFamily: 'var(--font-display)' }}>
          {cargados} <span className="text-[17px] text-cream/60">de {lista.length} con enlace</span>
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
          const url = links[f.codigo];
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
                    Día {f.dia} · {f.quien} · {f.minutos} min{f.donde ? ` · ${f.donde}` : ''}
                  </p>
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
