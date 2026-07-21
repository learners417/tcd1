import { useEffect, useMemo, useRef, useState } from 'react';
import { Copy, Check, TrendingUp, Sparkles } from 'lucide-react';
import {
  type ElNumero, emptyNumero, calcPHR, agujeroAnual, gananciaAnual, gananciaMensual,
  getElNumero, saveElNumero, marcarNumeroEnElCamino,
} from '../../lib/elNumero';

const money = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');

function useCountUp(target: number, ms = 700) {
  const [val, setVal] = useState(target);
  const fromRef = useRef(target);
  useEffect(() => {
    const from = fromRef.current;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / ms);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(from + (target - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return val;
}

interface Props { userId?: string }

export default function NumeroPanel({ userId }: Props) {
  const uid = useMemo(() => {
    if (userId) return userId;
    try { return JSON.parse(localStorage.getItem('tcd_profile') ?? '{}')?.id as string | undefined; } catch { return undefined; }
  }, [userId]);

  const [n, setN] = useState<ElNumero>(emptyNumero());
  const [precioNuevo, setPrecioNuevo] = useState(0);
  const [cargado, setCargado] = useState(false);
  const [copiado, setCopiado] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const guardado = await getElNumero(uid);
      if (guardado) {
        setN(guardado);
        setPrecioNuevo(guardado.precio_nuevo ?? Math.round(guardado.phr || guardado.precio_sesion * 1.5));
      }
      setCargado(true);
    })();
  }, [uid]);

  // recalcula PHR y persiste al cambiar los inputs base
  function actualizarBase(patch: Partial<ElNumero>) {
    setN((prev) => {
      const next = { ...prev, ...patch };
      next.phr = calcPHR(next.precio_sesion, next.pacientes_semana, next.horas_semana);
      void saveElNumero(uid, next);
      if (!precioNuevo) setPrecioNuevo(Math.round(next.phr || next.precio_sesion * 1.5));
      return next;
    });
  }

  function sellarPrecioNuevo(valor: number) {
    setN((prev) => {
      const next = { ...prev, precio_nuevo: valor, fecha_cambio: new Date().toISOString() };
      void saveElNumero(uid, next);
      // EL NÚMERO es la puerta 1 del Camino: sella el precio → gana su primera punta
      void marcarNumeroEnElCamino(uid);
      return next;
    });
  }

  const gananciaAnio = gananciaAnual(precioNuevo, n.precio_sesion, n.pacientes_semana);
  const gananciaMes = gananciaMensual(precioNuevo, n.precio_sesion, n.pacientes_semana);
  const delta = Math.max(0, precioNuevo - n.precio_sesion);
  const agujero = agujeroAnual(n.precio_sesion, n.phr, n.horas_semana);
  const cuentaAnimada = useCountUp(gananciaAnio);

  const maxSlider = Math.max(n.phr * 2, n.precio_sesion * 3, precioNuevo, 100);

  const fechaTxt = n.fecha_cambio ? new Date(n.fecha_cambio).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' }) : 'esta semana';

  const msgPacientes =
    `Hola 👋 Te escribo para contarte algo con transparencia: a partir de ${fechaTxt} el valor de mis sesiones pasa a ser ${money(precioNuevo)}. ` +
    `Es una decisión que tomé para poder sostener mi trabajo con la calidad y la dedicación que merecés. ` +
    `Tu proceso y tu cuidado siguen siendo mi prioridad de siempre. Cualquier duda, acá estoy. Gracias por la confianza. 🙏`;

  const msgIG =
    `Un mensaje honesto:\n\n` +
    `Durante mucho tiempo cobré menos de lo que mi trabajo vale. Hoy elijo cobrar con dignidad — no por mí solo, sino para poder cuidarte mejor.\n\n` +
    `Mi valor a partir de ahora: ${money(precioNuevo)}.\n\n` +
    `Sanar también es aprender a recibir. 🌱`;

  function copiar(id: string, texto: string) {
    navigator.clipboard?.writeText(texto).then(() => {
      setCopiado(id);
      setTimeout(() => setCopiado(null), 1800);
    });
  }

  if (!cargado) {
    return <div className="flex items-center justify-center py-16 text-cream/55 text-sm">Cargando tu número…</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Inputs base — de acá sale el PHR */}
      <section className="rounded-2xl border border-gold/10 bg-panel p-5">
        <h2 className="text-lg font-semibold text-cream mb-1">Tu número, hoy</h2>
        <p className="text-sm text-cream/65 mb-4">Con esto calculamos tu <strong className="text-cream/90">PHR</strong> — lo que vale de verdad una hora tuya.</p>
        <div className="grid grid-cols-3 gap-3">
          {([
            ['Precio por sesión', 'precio_sesion'],
            ['Pacientes / semana', 'pacientes_semana'],
            ['Horas / semana', 'horas_semana'],
          ] as const).map(([label, key]) => (
            <label key={key} className="block">
              <span className="text-[11px] uppercase tracking-wider text-cream/55">{label}</span>
              <input
                type="number" inputMode="numeric" min={0}
                value={(n[key] as number) || ''}
                onChange={(e) => actualizarBase({ [key]: Number(e.target.value) } as Partial<ElNumero>)}
                className="input-field w-full mt-1 text-base"
                placeholder="0"
              />
            </label>
          ))}
        </div>
        {n.phr > 0 && (
          <div className="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-sm text-cream/65">Tu PHR real:</span>
            <span className="text-2xl font-semibold text-gold tabular-nums">{money(n.phr)}<span className="text-sm text-cream/55">/hora</span></span>
            {agujero > 0 && (
              <span className="text-sm text-danger/90 w-full">Cobrando por debajo, dejas ir <strong>{money(agujero)}</strong> al año.</span>
            )}
          </div>
        )}
      </section>

      {n.phr > 0 && (
        <>
          {/* Simulador de precio nuevo */}
          <section className="rounded-2xl border border-gold/10 bg-panel p-5">
            <div className="flex items-center gap-2 mb-1"><TrendingUp className="w-5 h-5 text-gold" /><h2 className="text-lg font-semibold text-cream">Simulá tu precio nuevo</h2></div>
            <p className="text-sm text-cream/65 mb-4">Movelo y mirá qué cambia. (Es una estimación, no una promesa.)</p>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-3xl font-semibold text-cream tabular-nums">{money(precioNuevo)}</span>
              {delta > 0 && <span className="text-sm text-success font-medium">+{money(delta)} vs hoy</span>}
            </div>
            <input
              type="range" min={n.precio_sesion} max={maxSlider} step={Math.max(1, Math.round(n.precio_sesion / 20))}
              value={precioNuevo}
              onChange={(e) => setPrecioNuevo(Number(e.target.value))}
              className="w-full accent-[var(--color-gold)]"
            />
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="rounded-xl bg-surface p-4 text-center">
                <p className="text-[11px] uppercase tracking-wider text-cream/55">Al mes</p>
                <p className="text-xl font-semibold text-cream tabular-nums">+{money(gananciaMes)}</p>
              </div>
              <div className="rounded-xl bg-surface p-4 text-center">
                <p className="text-[11px] uppercase tracking-wider text-cream/55">Al año</p>
                <p className="text-xl font-semibold text-gold tabular-nums">+{money(gananciaAnio)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => sellarPrecioNuevo(precioNuevo)}
              className="btn-primary w-full mt-4 rounded-xl bg-gold text-black font-bold py-3 hover:bg-goldhi transition-colors"
            >
              {n.precio_nuevo === precioNuevo ? 'Precio guardado ✓' : 'Este es mi precio nuevo'}
            </button>
          </section>

          {/* La cuenta que crece */}
          <section className="rounded-2xl border border-gold/20 bg-gold/[0.06] p-6 text-center">
            <p className="text-sm text-cream/70">Con tu precio nuevo, este año ganás</p>
            <p className="text-4xl md:text-5xl font-semibold text-gold tabular-nums my-2">+{money(cuentaAnimada)}</p>
            <p className="text-sm text-cream/55">más que hoy — con los mismos pacientes.</p>
          </section>

          {/* Antes / después (compartible por captura) */}
          <section className="rounded-2xl overflow-hidden border border-gold/10">
            <div className="bg-panel px-5 py-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-gold" /><h2 className="text-base font-semibold text-cream">Antes / después</h2></div>
            <div className="bg-ink p-6 grid grid-cols-2 gap-4 items-center text-center">
              <div className="opacity-70">
                <p className="text-[11px] uppercase tracking-wider text-cream/50">Tu hora, antes</p>
                <p className="text-2xl font-semibold text-cream/70 tabular-nums line-through decoration-danger/60">{money(n.phr)}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-gold/70">Tu precio, ahora</p>
                <p className="text-3xl font-semibold text-gold tabular-nums">{money(precioNuevo)}</p>
              </div>
            </div>
            <div className="bg-panel px-5 py-2.5 text-center text-[11px] text-cream/45">Sacale una captura y compartila. 🌱</div>
          </section>

          {/* Generador de mensajes */}
          <section className="rounded-2xl border border-gold/10 bg-panel p-5 space-y-4">
            <h2 className="text-lg font-semibold text-cream">Anuncialo hoy</h2>
            {([
              ['pac', 'Para tus pacientes actuales', msgPacientes],
              ['ig', 'Historia de Instagram', msgIG],
            ] as const).map(([id, label, texto]) => (
              <div key={id}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-cream/80">{label}</span>
                  <button type="button" onClick={() => copiar(id, texto)} className="btn-icon text-gold/90 hover:text-gold" title="Copiar">
                    {copiado === id ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="rounded-xl bg-surface p-3 text-[14px] leading-relaxed text-cream/80 whitespace-pre-line">{texto}</div>
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
