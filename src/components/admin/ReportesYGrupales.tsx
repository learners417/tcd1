/**
 * LO QUE EL EQUIPO CARGA Y RESPONDE: los reportes y las mentorías.
 *
 * Dos trabajos que hasta ahora vivían afuera de la app:
 *
 *   LOS REPORTES — la vía de La Base. Llegan, se responden una vez, quedan
 *   cerrados. Acá está la cola, con el más vencido primero.
 *
 *   LAS MENTORÍAS — el link se pasaba a mano cada semana por Discord. Cargado
 *   acá, el cliente entra directo desde su calendario y la asistencia se marca
 *   sola al tocar «Entrar».
 */
import React, { useEffect, useState } from 'react';
import { Loader2, Send, CalendarPlus } from 'lucide-react';
import { toast } from 'sonner';
import {
  reportesQueEsperan, responderReporte, proximasGrupales, guardarGrupal,
  type Reporte, type SesionGrupal, type TemaGrupal,
} from '../../lib/acompanamientoDatos';
import { aDondeVa, A_DONDE_VA } from '../../lib/viaDeContacto';

const TEMAS: Array<{ id: TemaGrupal; label: string; dia: string }> = [
  { id: 'producto', label: 'Producto', dia: 'martes' },
  { id: 'marketing', label: 'Marketing', dia: 'miércoles' },
  { id: 'ventas', label: 'Ventas', dia: 'jueves' },
];

export default function ReportesYGrupales({ quienSoy, nombres }: {
  quienSoy: string;
  /** id → nombre, para no mostrar un uuid donde va una persona. */
  nombres: Record<string, string>;
}) {
  return (
    <div className="space-y-4">
      <LaCola quienSoy={quienSoy} nombres={nombres} />
      <LasGrupales />
    </div>
  );
}

/* ══════════════════ LA COLA DE REPORTES ══════════════════ */

function LaCola({ quienSoy, nombres }: {
  quienSoy: string; nombres: Record<string, string>;
}) {
  const [cola, setCola] = useState<Reporte[] | null>(null);
  const [abierto, setAbierto] = useState<string | null>(null);
  const [texto, setTexto] = useState('');
  const [mandando, setMandando] = useState(false);

  const cargar = () => {
    void reportesQueEsperan().then(setCola).catch(() => setCola([]));
  };
  useEffect(cargar, []);

  const responder = async (r: Reporte) => {
    const t = texto.trim();
    if (!t) return;
    setMandando(true);
    try {
      await responderReporte({ id: r.id, respuesta: t, quienResponde: quienSoy });
      setTexto(''); setAbierto(null);
      cargar();
      toast.success('Respondido.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo responder.');
    } finally {
      setMandando(false);
    }
  };

  if (cola === null) {
    return (
      <section className="rounded-2xl border border-cream/12 p-5">
        <p className="text-[17px] text-cream/70 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Buscando los reportes…
        </p>
      </section>
    );
  }

  const vencidos = cola.filter((r) => new Date(r.vence_en).getTime() < Date.now()).length;

  return (
    <section className="rounded-2xl border border-gold/25 bg-espresso/40 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
        <h3 className="text-[19px] font-bold text-cream">Reportes esperando</h3>
        <span className="text-[16px] text-cream/55">{cola.length}</span>
      </div>

      <p className="text-[17px] leading-relaxed text-cream/75 mb-4">
        {cola.length === 0 ? 'Ninguno esperando. La cola está vacía.'
          : vencidos > 0
            ? `${vencidos} pasaron las 48 horas. Están primeros.`
            : 'Todos dentro de las 48 horas.'}
      </p>

      <div className="space-y-2">
        {cola.map((r) => {
          const vencido = new Date(r.vence_en).getTime() < Date.now();
          const sugerido = aDondeVa(
            `${r.donde_estoy} ${r.que_trabo} ${r.que_necesito}`);
          return (
            <div key={r.id} className={`rounded-xl border p-4 ${
              vencido ? 'border-danger/40 bg-danger/[0.05]' : 'border-cream/15'}`}>
              <div className="flex flex-wrap items-baseline gap-x-2">
                <p className="text-[18px] font-bold text-cream">
                  {nombres[r.cliente_id] ?? 'Sin nombre cargado'}
                </p>
                <span className={`text-[15px] ${vencido ? 'text-danger' : 'text-cream/50'}`}>
                  · {vencido ? 'pasó las 48 horas' : 'dentro de plazo'}
                </span>
              </div>

              {r.donde_estoy && (
                <p className="text-[17px] text-cream/85 mt-2 leading-relaxed">
                  <span className="text-cream/50">Dónde está:</span> {r.donde_estoy}
                </p>
              )}
              {r.que_trabo && (
                <p className="text-[17px] text-cream/85 mt-1 leading-relaxed">
                  <span className="text-cream/50">Qué trabó:</span> {r.que_trabo}
                </p>
              )}
              {r.que_necesito && (
                <p className="text-[17px] text-cream/85 mt-1 leading-relaxed">
                  <span className="text-cream/50">Qué necesita:</span> {r.que_necesito}
                </p>
              )}

              {/* A DÓNDE VA, SUGERIDO.
                  «Que ella los redirija a dónde corresponde»: el atajo que le
                  evita escribir la misma redirección por décima vez. Es una
                  sugerencia y no una respuesta automática — adivinar mal y
                  mandarlo al lugar equivocado es peor que no sugerir nada. */}
              {sugerido && (
                <p className="text-[16px] text-gold/85 mt-2 leading-relaxed">
                  Esto se resuelve en: {sugerido.donde}
                  {sugerido.quien ? ` · ${sugerido.quien}` : ''}
                </p>
              )}

              {abierto === r.id ? (
                <div className="mt-3">
                  <textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={4}
                    placeholder="Tu respuesta. Una sola: no hay ida y vuelta en esta vía."
                    className="w-full bg-black/20 border border-gold/20 rounded-xl px-3 py-2.5 text-cream text-[17px] focus:border-gold/50 placeholder-cream/25" />

                  {/* Las redirecciones listas, para no escribirlas a mano. */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {A_DONDE_VA.slice(0, 5).map((d) => (
                      <button key={d.loQueTrae}
                        onClick={() => setTexto((x) =>
                          `${x}${x ? '\n\n' : ''}Eso se resuelve en ${d.donde}`
                          + `${d.quien ? ` con ${d.quien}` : ''}.`)}
                        className="min-h-[44px] px-3 rounded-xl border border-cream/15 text-cream/70 text-[15px]">
                        + {d.donde}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button onClick={() => void responder(r)} disabled={mandando || !texto.trim()}
                      className="min-h-[44px] px-4 rounded-xl btn-primary text-[16px] font-bold disabled:opacity-40 inline-flex items-center gap-2">
                      <Send className="w-4 h-4" /> {mandando ? 'Mandando…' : 'Responder'}
                    </button>
                    <button onClick={() => { setAbierto(null); setTexto(''); }}
                      className="min-h-[44px] px-4 rounded-xl border border-cream/20 text-cream/70 text-[16px] font-bold">
                      Dejarlo para después
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => { setAbierto(r.id); setTexto(''); }}
                  className="mt-3 min-h-[44px] px-4 rounded-xl border border-gold/35 text-gold text-[16px] font-bold">
                  Responderle
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ══════════════════ LAS MENTORÍAS ══════════════════ */

function LasGrupales() {
  const [sesiones, setSesiones] = useState<SesionGrupal[] | null>(null);
  const [tema, setTema] = useState<TemaGrupal>('producto');
  const [cuando, setCuando] = useState('');
  const [url, setUrl] = useState('');
  const [grupo, setGrupo] = useState('grupo_1');
  const [guardando, setGuardando] = useState(false);

  const cargar = () => {
    void proximasGrupales(12).then(setSesiones).catch(() => setSesiones([]));
  };
  useEffect(cargar, []);

  const guardar = async () => {
    if (!cuando || !url.trim()) {
      toast.error('Falta la fecha o el link.');
      return;
    }
    setGuardando(true);
    try {
      await guardarGrupal({
        tema, grupo,
        empieza_en: new Date(cuando).toISOString(),
        url_reunion: url.trim(),
      });
      setCuando(''); setUrl('');
      cargar();
      toast.success('Cargada. Ya le aparece en su calendario.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo guardar.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="rounded-2xl border border-gold/25 bg-espresso/40 p-5">
      <h3 className="text-[19px] font-bold text-cream mb-1">Las mentorías grupales</h3>
      <p className="text-[17px] leading-relaxed text-cream/75 mb-4">
        El link se cargaba a mano cada semana. Cargado acá, entra directo desde
        su calendario y la asistencia se marca sola al tocar «Entrar».
      </p>

      <div className="rounded-xl border border-cream/15 p-4 mb-4">
        <p className="text-[17px] font-bold text-cream mb-3 flex items-center gap-2">
          <CalendarPlus className="w-5 h-5 text-gold/70" /> Cargar una
        </p>

        <div className="flex flex-wrap gap-2 mb-3">
          {TEMAS.map((x) => (
            <button key={x.id} onClick={() => setTema(x.id)}
              className={`min-h-[44px] px-4 rounded-xl text-[16px] font-bold border ${
                tema === x.id
                  ? 'border-gold/45 bg-gold/10 text-gold'
                  : 'border-cream/15 text-cream/70'}`}>
              {x.label} · {x.dia}
            </button>
          ))}
        </div>

        <label className="block text-[16px] font-bold text-cream/80 mb-1">Cuándo</label>
        <input type="datetime-local" value={cuando} onChange={(e) => setCuando(e.target.value)}
          className="w-full min-h-[44px] bg-black/20 border border-gold/15 rounded-xl px-3 text-cream text-[17px] mb-3" />

        <label className="block text-[16px] font-bold text-cream/80 mb-1">El link</label>
        <input value={url} onChange={(e) => setUrl(e.target.value)}
          placeholder="El de la videollamada"
          className="w-full min-h-[44px] bg-black/20 border border-gold/15 rounded-xl px-3 text-cream text-[17px] mb-3 placeholder-cream/25" />

        <div className="flex flex-wrap gap-2 mb-3">
          {['grupo_1', 'grupo_2'].map((g) => (
            <button key={g} onClick={() => setGrupo(g)}
              className={`min-h-[44px] px-4 rounded-xl text-[16px] font-bold border ${
                grupo === g ? 'border-gold/45 bg-gold/10 text-gold' : 'border-cream/15 text-cream/70'}`}>
              {g === 'grupo_1' ? 'Grupo 1 · 13 hs' : 'Grupo 2 · 15:30'}
            </button>
          ))}
        </div>

        <button onClick={() => void guardar()} disabled={guardando}
          className="w-full min-h-[44px] btn-primary rounded-xl text-[16px] font-bold disabled:opacity-50">
          {guardando ? 'Guardando…' : 'Cargarla'}
        </button>
      </div>

      {sesiones === null ? (
        <p className="text-[17px] text-cream/70">Buscando…</p>
      ) : sesiones.length === 0 ? (
        <p className="text-[17px] text-cream/70 leading-relaxed">
          Todavía no hay ninguna cargada. Hasta que cargues la primera, el
          cliente ve su calendario sin encuentros.
        </p>
      ) : (
        <div className="space-y-2">
          {sesiones.map((s) => (
            <div key={s.id} className="rounded-xl border border-cream/12 p-3">
              <p className="text-[17px] font-bold text-cream">
                {TEMAS.find((x) => x.id === s.tema)?.label ?? s.tema}
                {' · '}
                {new Date(s.empieza_en).toLocaleDateString('es', { day: 'numeric', month: 'long' })}
                {' '}
                {new Date(s.empieza_en).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-[15px] text-cream/50 mt-0.5">
                {s.grupo === 'grupo_1' ? 'Grupo 1' : 'Grupo 2'}
                {s.url_grabacion ? ' · con grabación' : ''}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
