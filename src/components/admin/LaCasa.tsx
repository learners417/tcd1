import { useState } from 'react';
import { Check, Clock } from 'lucide-react';
import {
  OBJETIVO, PRINCIPIOS, jornadasDeInduccion,
  MINUTOS_DE_CONTENIDO, SE_APRENDE_EN_EL_LUGAR,
  HISTORIA, SISTEMA_POR_DENTRO, VALORES,
} from '../../lib/casa';

/**
 * LA CASA — el objetivo, los principios y la inducción, dentro de la app.
 *
 * Había nueve documentos de plan en la raíz del repo. Nadie lee nueve planes,
 * y un archivo en la raíz de un repositorio no lo abre nadie que no sea
 * programador. Esto es lo mismo, donde se trabaja.
 */

const KEY = 'tcd_induccion_v1';

export default function LaCasa() {
  const [hechas, setHechas] = useState<Set<number>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]') as number[]); }
    catch { return new Set(); }
  });
  const [vista, setVista] = useState<
    'induccion' | 'objetivo' | 'principios' | 'historia' | 'sistema'>('induccion');

  const marcar = (n: number) => {
    setHechas((h) => {
      const s = new Set(h);
      if (s.has(n)) s.delete(n); else s.add(n);
      try { localStorage.setItem(KEY, JSON.stringify([...s])); } catch { /* noop */ }
      return s;
    });
  };

  const jornadas = jornadasDeInduccion();
  const total = jornadas.reduce((t, j) => t + j.sesiones.length, 0);

  return (
    <div className="max-w-3xl mx-auto space-y-4">

      <div className="flex gap-2">
        {([
          ['induccion', 'Tus primeros 3 días'],
          ['objetivo', 'Qué prometemos'],
          ['principios', 'Cómo se decide'],
          ['historia', 'Por qué Javo'],
          ['sistema', 'El sistema por dentro'],
        ] as const).map(([id, label]) => (
          <button key={id} onClick={() => setVista(id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
              vista === id
                ? 'bg-gold/20 border border-gold/50 text-gold'
                : 'border border-cream/15 text-cream/60'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ── LA INDUCCIÓN ── */}
      {vista === 'induccion' && (
        <>
          <div className="rounded-2xl border border-gold/25 bg-gold/[0.04] p-5">
            <p className="text-lg text-cream leading-snug" style={{ fontFamily: 'var(--font-display)' }}>
              {hechas.size === total
                ? 'Terminaste. Lo que falta se aprende trabajando.'
                : `${hechas.size} de ${total} sesiones · ${MINUTOS_DE_CONTENIDO} minutos en total`}
            </p>
            <p className="text-sm text-cream/65 mt-1">
              Dos horas de contenido en tres días. El resto del tiempo es trabajo real:
              la app te va explicando lo demás donde aparece.
            </p>
          </div>

          {jornadas.map((j) => (
            <div key={j.dia} className="rounded-2xl border border-cream/12 p-4">
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-cream/50">
                Día {j.dia} · {j.titulo}
              </p>
              <p className="text-sm text-cream/40 mb-3">
                <Clock size={10} className="inline mb-0.5 mr-1" />
                {j.minutos} minutos de contenido
              </p>

              <div className="space-y-2.5">
                {j.sesiones.map((s) => (
                  <button key={s.numero} onClick={() => marcar(s.numero)}
                    className={`w-full text-left flex items-start gap-3 rounded-xl border p-3 transition ${
                      hechas.has(s.numero)
                        ? 'border-success/30 bg-success/[0.05]' : 'border-cream/12'}`}>
                    <span className={`mt-0.5 shrink-0 ${
                      hechas.has(s.numero) ? 'text-success' : 'text-cream/25'}`}>
                      <Check size={14} />
                    </span>
                    <span>
                      <span className={`text-sm block ${
                        hechas.has(s.numero) ? 'text-cream/60' : 'text-cream/90'}`}>
                        {s.titulo}
                      </span>
                      <span className="text-sm text-cream/60 block mt-0.5">
                        {s.queQuedaClaro}
                      </span>
                      <span className="text-sm text-gold/75 block mt-1.5">
                        → {s.accion}
                      </span>
                      <span className="text-sm text-cream/40 block mt-1">
                        {s.porQueAntes}
                      </span>

                      {/* Los números concretos, no «esto importa». */}
                      {s.datos && s.datos.length > 0 && (
                        <span className="block mt-2 space-y-0.5">
                          {s.datos.map((d) => (
                            <span key={d} className="block text-sm text-cream/55">· {d}</span>
                          ))}
                        </span>
                      )}

                      {/* El espacio del video existe aunque el video no.
                          Así se sabe qué falta en vez de no saber que faltaba. */}
                      <span className={`block mt-2 rounded-lg border border-dashed p-2.5 text-center ${
                        s.video ? 'border-gold/30' : 'border-cream/12'}`}>
                        <span className="text-sm text-cream/45">
                          {s.video ? '▶ Ver el video (3-5 min)' : 'Video pendiente de grabar'}
                        </span>
                      </span>
                    </span>
                  </button>
                ))}
              </div>

              <p className="text-sm text-cream/55 mt-3 pt-3 border-t border-cream/[0.07]">
                <strong className="text-cream/75">Después:</strong> {j.despues}
              </p>
            </div>
          ))}

          <div className="rounded-2xl border border-cream/10 p-4">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-cream/45 mb-1">
              Lo que no está acá a propósito
            </p>
            <p className="text-sm text-cream/40 mb-3">
              No es un olvido: se aprende mejor cuando aparece.
            </p>
            <div className="space-y-1.5">
              {SE_APRENDE_EN_EL_LUGAR.map((x) => (
                <p key={x.que} className="text-sm text-cream/60">
                  <strong className="text-cream/80">{x.que}</strong> — {x.donde}
                </p>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── EL OBJETIVO ── */}
      {vista === 'objetivo' && (
        <div className="space-y-3">
          {([
            ['Qué prometemos', OBJETIVO.quePrometemos],
            ['A quién', OBJETIVO.aQuien],
            ['Cómo lo hacemos', OBJETIVO.comoLoHacemos],
          ] as const).map(([t, c]) => (
            <div key={t} className="rounded-2xl border border-cream/12 p-4">
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-cream/50 mb-1.5">{t}</p>
              <p className="text-sm text-cream/85 leading-relaxed">{c}</p>
            </div>
          ))}
          <div className="rounded-2xl border border-gold/30 bg-gold/[0.05] p-5">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-gold/70 mb-1.5">
              El único número que dice si funciona
            </p>
            <p className="text-base text-cream leading-snug">{OBJETIVO.elNumero}</p>
            <p className="text-sm text-cream/60 mt-2 leading-relaxed">{OBJETIVO.porQueEseNumero}</p>
          </div>
        </div>
      )}

      {/* ── POR QUÉ JAVO ── */}
      {vista === 'historia' && (
        <div className="space-y-3">
          <p className="text-sm text-cream/50">
            Sin esto, el equipo vende un sistema. Con esto, vende una convicción.
          </p>
          {HISTORIA.map((c) => (
            <div key={c.titulo}
              className={`rounded-2xl border p-4 ${
                c.pendiente ? 'border-dashed border-gold/25' : 'border-cream/12'}`}>
              <p className="text-sm text-cream/90 leading-snug"
                style={{ fontFamily: 'var(--font-display)' }}>
                {c.titulo}
              </p>
              <p className={`text-sm mt-1.5 leading-relaxed ${
                c.pendiente ? 'text-gold/60 italic' : 'text-cream/70'}`}>
                {c.texto}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── EL SISTEMA POR DENTRO ── */}
      {vista === 'sistema' && (
        <div className="space-y-4">
          <div className="space-y-3">
            <p className="text-sm text-cream/50">
              Esto es lo que te deja defender una decisión de la app frente a un
              cliente que la cuestiona. Sin esto, la única respuesta posible es
              «porque lo dice la app» — y esa no la acepta nadie que pagó.
            </p>
            {SISTEMA_POR_DENTRO.map((p) => (
              <div key={p.pregunta} className="rounded-2xl border border-cream/12 p-4">
                <p className="text-sm text-cream/90 leading-snug">{p.pregunta}</p>
                <p className="text-sm text-cream/65 mt-1.5 leading-relaxed">{p.respuesta}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-gold/25 bg-gold/[0.04] p-4">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-gold/70 mb-1">
              Los valores, con lo que cuestan
            </p>
            <p className="text-sm text-cream/45 mb-3">
              Un valor sin costo es una frase.
            </p>
            <div className="space-y-3">
              {VALORES.map((v) => (
                <div key={v.valor} className="border-b border-cream/[0.07] pb-3 last:border-0">
                  <p className="text-sm text-cream/90">{v.valor}</p>
                  <p className="text-sm text-cream/55 mt-1">
                    <strong className="text-cream/70">Cuesta:</strong> {v.cuestaEsto}
                  </p>
                  <p className="text-sm text-cream/55 mt-0.5">
                    <strong className="text-cream/70">Lo aceptamos porque:</strong> {v.loAceptamosPorque}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── LOS PRINCIPIOS ── */}
      {vista === 'principios' && (
        <div className="space-y-3">
          <p className="text-sm text-cream/50">
            No son valores de pared. Cada uno resuelve una discusión que se repite,
            y está escrito para no volver a tenerla.
          </p>
          {PRINCIPIOS.map((p) => (
            <div key={p.id} className="rounded-2xl border border-cream/12 p-4">
              <p className="text-sm text-cream/90 leading-snug">{p.dice}</p>
              <p className="text-sm text-cream/55 mt-1.5 leading-relaxed">
                <strong className="text-cream/70">Resuelve:</strong> {p.resuelve}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
