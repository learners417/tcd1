import { useState } from 'react';

/**
 * TU SITUACIÓN — el paso que faltaba en el onboarding.
 *
 * Las ocho preguntas que el camino necesita y el wizard no hacía. Cada una que
 * puede doler lleva su salida: preguntar la garantía en seco a alguien que le
 * tiene miedo a la garantía devuelve "no sé" o, peor, una mentira prolija.
 *
 * Un "no sé" es un dato vacío. "Sí lo pensé y no me animo" es material de
 * primera: dice dónde está el dique antes del día uno.
 *
 * Todo en tú neutro.
 */

export interface Situacion {
  consultantes_semana: string;
  precio_sesion: string;
  horas_ocupadas: string;
  horas_libres: string;
  mercado: 'personas' | 'organizaciones' | 'ambas' | '';
  red_propia: string;
  vendio_al_precio: 'si' | 'parecido_barato' | 'no' | '';
  limites_certeza: 'si_claros' | 'creo_que_si' | 'ninguna' | '';
  limites_eticos: string;
  garantia_estado: 'definida' | 'miedo' | 'nunca' | 'no_puedo' | '';
  garantia: string;
  escalera: string;
  brecha: string;
}

export const SITUACION_VACIA: Situacion = {
  consultantes_semana: '', precio_sesion: '', horas_ocupadas: '', horas_libres: '',
  mercado: '', red_propia: '', vendio_al_precio: '', limites_certeza: '',
  limites_eticos: '', garantia_estado: '', garantia: '', escalera: '', brecha: '',
};

/** Lo mínimo para que el camino pueda decidir sus carriles. */
export function situacionCompleta(s: Situacion): boolean {
  return Boolean(
    s.consultantes_semana && s.precio_sesion && s.horas_libres &&
    s.mercado && s.red_propia && s.vendio_al_precio &&
    s.limites_certeza && s.garantia_estado && s.brecha.trim().length >= 10,
  );
}

const campo =
  'w-full bg-white/[0.03] border border-cream/15 rounded-xl px-4 py-3 text-base text-cream ' +
  'placeholder:text-cream/35 focus:border-gold focus:outline-none transition-colors';

function Rotulo({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-bold uppercase tracking-[0.12em] text-gold mb-2 leading-snug">
      {children}
    </label>
  );
}

function Opciones<T extends string>({
  valor, onChange, opciones,
}: {
  valor: T | '';
  onChange: (v: T) => void;
  opciones: Array<{ v: T; t: string }>;
}) {
  return (
    <div className="space-y-2">
      {opciones.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => onChange(o.v)}
          className={`w-full text-left px-4 py-3 rounded-xl border transition-colors text-base ${
            valor === o.v
              ? 'border-gold bg-gold/10 text-cream'
              : 'border-cream/15 text-cream/75 hover:border-cream/30'
          }`}
        >
          {o.t}
        </button>
      ))}
    </div>
  );
}

export default function PasoSituacion({
  valor, onChange,
}: {
  valor: Situacion;
  onChange: (s: Situacion) => void;
}) {
  const [s, setS] = useState<Situacion>(valor);
  const set = (p: Partial<Situacion>) => {
    const n = { ...s, ...p };
    setS(n);
    onChange(n);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2
          className="text-3xl font-light text-cream mb-2"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Tu situación hoy
        </h2>
        <p className="text-base text-cream/65">
          Con esto el camino se arma para ti. Nada de lo que escribas acá se comparte.
        </p>
      </div>

      {/* ── la consulta ── */}
      <div className="space-y-4">
        <Rotulo>Tu consulta hoy</Rotulo>
        <p className="text-sm text-cream/60 -mt-1">
          A cuántas personas atiendes por semana y cuánto cobras por sesión. Los dos
          números, aunque sean irregulares.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <input className={campo} inputMode="numeric" placeholder="Personas por semana"
            value={s.consultantes_semana} onChange={(e) => set({ consultantes_semana: e.target.value })} />
          <input className={campo} placeholder="Precio por sesión"
            value={s.precio_sesion} onChange={(e) => set({ precio_sesion: e.target.value })} />
        </div>
      </div>

      {/* ── las horas ── */}
      <div className="space-y-4">
        <Rotulo>Tus horas</Rotulo>
        <p className="text-sm text-cream/60 -mt-1">
          Cuántas horas a la semana estás atendiendo, y cuántas te quedan libres de
          verdad — descontando lo que ya tienes comprometido.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <input className={campo} inputMode="numeric" placeholder="Horas atendiendo"
            value={s.horas_ocupadas} onChange={(e) => set({ horas_ocupadas: e.target.value })} />
          <input className={campo} inputMode="numeric" placeholder="Horas libres reales"
            value={s.horas_libres} onChange={(e) => set({ horas_libres: e.target.value })} />
        </div>
      </div>

      {/* ── el mercado ── */}
      <div className="space-y-3">
        <Rotulo>¿A quién le vendes?</Rotulo>
        <Opciones
          valor={s.mercado}
          onChange={(v) => set({ mercado: v })}
          opciones={[
            { v: 'personas', t: 'A personas, una por una' },
            { v: 'organizaciones', t: 'A organizaciones, empresas o instituciones' },
            { v: 'ambas', t: 'A las dos, pero una manda' },
          ]}
        />
      </div>

      {/* ── la red ── */}
      <div className="space-y-3">
        <Rotulo>Tu red</Rotulo>
        <p className="text-sm text-cream/60 -mt-1">
          A cuántas personas podrías escribirles hoy mismo por privado y te
          contestarían. Pacientes, colegas, egresados, contactos del rubro.
        </p>
        <input className={campo} inputMode="numeric" placeholder="Un número aproximado"
          value={s.red_propia} onChange={(e) => set({ red_propia: e.target.value })} />
      </div>

      {/* ── ya vendió ── */}
      <div className="space-y-3">
        <Rotulo>¿Ya vendiste esto?</Rotulo>
        <p className="text-sm text-cream/60 -mt-1">
          Si alguna vez le vendiste esta oferta, al precio que quieres cobrar, a alguien.
        </p>
        <Opciones
          valor={s.vendio_al_precio}
          onChange={(v) => set({ vendio_al_precio: v })}
          opciones={[
            { v: 'si', t: 'Sí, al menos una vez' },
            { v: 'parecido_barato', t: 'Vendí algo parecido pero más barato' },
            { v: 'no', t: 'No, todavía no' },
          ]}
        />
      </div>

      {/* ── límites ── */}
      <div className="space-y-3">
        <Rotulo>Límites profesionales y éticos</Rotulo>
        <p className="text-sm text-cream/60 -mt-1">
          Si tu código de ética, tu colegio o el tipo de población con la que trabajas
          te impide mostrar, prometer o decir algo públicamente.
        </p>
        <Opciones
          valor={s.limites_certeza}
          onChange={(v) => set({ limites_certeza: v })}
          opciones={[
            { v: 'si_claros', t: 'Sí, y los tengo claros' },
            { v: 'creo_que_si', t: 'Creo que sí, pero no estoy seguro de cuáles' },
            { v: 'ninguna', t: 'No tengo ninguna restricción formal' },
          ]}
        />
        {s.limites_certeza === 'si_claros' && (
          <textarea className={`${campo} min-h-[96px]`} placeholder="Cuáles, en tus palabras"
            value={s.limites_eticos} onChange={(e) => set({ limites_eticos: e.target.value })} />
        )}
      </div>

      {/* ── garantía ── */}
      <div className="space-y-3">
        <Rotulo>Tu garantía</Rotulo>
        <p className="text-sm text-cream/60 -mt-1">
          Si alguien te paga y no obtiene lo que le prometiste, ¿qué pasa?
        </p>
        <Opciones
          valor={s.garantia_estado}
          onChange={(v) => set({ garantia_estado: v })}
          opciones={[
            { v: 'definida', t: 'La tengo definida y la sostengo' },
            { v: 'miedo', t: 'La pensé, pero me da miedo ofrecerla' },
            { v: 'nunca', t: 'Nunca se me ocurrió' },
            { v: 'no_puedo', t: 'Creo que en mi profesión no puedo dar garantías' },
          ]}
        />
        {s.garantia_estado === 'definida' && (
          <textarea className={`${campo} min-h-[96px]`} placeholder="Descríbela"
            value={s.garantia} onChange={(e) => set({ garantia: e.target.value })} />
        )}
      </div>

      {/* ── escalera ── */}
      <div className="space-y-3">
        <Rotulo>Tu escalera</Rotulo>
        <p className="text-sm text-cream/60 -mt-1">
          Qué podría comprarte alguien que todavía no está listo para tu programa
          principal, y qué le venderías al que ya lo terminó. Si no tienes ninguno de
          los dos, escribe qué te gustaría que existiera.
        </p>
        <textarea className={`${campo} min-h-[96px]`} placeholder="Antes y después"
          value={s.escalera} onChange={(e) => set({ escalera: e.target.value })} />
      </div>

      {/* ── la brecha ── la pregunta más importante del formulario ── */}
      <div className="space-y-3">
        <Rotulo>Lo que ya sabías</Rotulo>
        <p className="text-sm text-cream/60 -mt-1">
          De todo esto: ¿qué es algo que ya sabías que tenías que hacer y todavía no
          hiciste? ¿Hace cuánto lo sabes?
        </p>
        <textarea className={`${campo} min-h-[120px]`}
          placeholder="Lo que sea, con el tiempo que lleva"
          value={s.brecha} onChange={(e) => set({ brecha: e.target.value })} />
      </div>
    </div>
  );
}
