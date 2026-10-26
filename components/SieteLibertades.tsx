/**
 * SieteLibertades.tsx — la rueda, donde el cliente la vuelve a mirar.
 *
 * ═══ EL HUECO QUE CIERRA ═══
 *
 * La rueda se medía el día 1, en el onboarding, con esta frase en pantalla:
 * «el día 90 las vas a mirar».
 *
 * Y no había dónde. En el Diario del Director había un comentario del código
 * que decía «S5 — La Rueda de la Vida: el registro del fin, no solo del
 * medio», y debajo no había nada. Así que el cliente contestaba ocho
 * preguntas sobre su vida el primer día y nunca volvía a ver una.
 *
 * Una promesa que la app hace en voz alta y después no cumple es peor que no
 * haberla hecho.
 *
 * ═══ POR QUÉ BARRAS Y NO UNA RUEDA REDONDA ═══
 *
 * Una rueda radial de ocho rayos en un teléfono de 390 puntos obliga a letra
 * chica en las etiquetas, y acá la letra chica no entra. En barras se lee de
 * un vistazo, cada libertad lleva su color del paisaje, y la comparación
 * contra la foto de partida queda al lado del número.
 */
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import {
  DIMENSIONES_RUEDA,
  type ValoresRueda,
  ultimaMedicion,
  primeraMedicion,
  cuantasMediciones,
  guardarMedicion,
  getParaQue,
} from '../lib/rueda';

export default function SieteLibertades() {
  /*
   * El componente se mide a sí mismo. Mandar al cliente de vuelta al
   * onboarding para volver a medirse sería hacerlo pasar por nueve pantallas
   * que ya completó.
   */
  const [midiendo, setMidiendo] = useState(false);
  const [borrador, setBorrador] = useState<ValoresRueda>({});
  const [refresco, setRefresco] = useState(0);

  const ahora = ultimaMedicion();
  const partida = primeraMedicion();
  const veces = cuantasMediciones();
  const paraQue = getParaQue();
  void refresco; // vuelve a leer lo guardado después de medir

  const abrirMedicion = () => {
    setBorrador(ultimaMedicion()?.valores ?? {});
    setMidiendo(true);
  };

  if (midiendo) {
    const faltan = DIMENSIONES_RUEDA.filter((d) => typeof borrador[d.id] !== 'number').length;
    return (
      <div className="card-panel p-5 rounded-2xl">
        <p className="text-[15px] font-bold uppercase tracking-[0.16em] text-goldhi">Tus siete libertades, hoy</p>
        <p className="mt-2 text-[17px] text-cream">Un toque por libertad, del 1 al 10. Como está hoy, no como te gustaría.</p>

        <div className="mt-4 space-y-3">
          {DIMENSIONES_RUEDA.map((d) => {
            const v = borrador[d.id];
            return (
              <div key={d.id}>
                <div className="flex items-baseline justify-between gap-3 mb-1">
                  <p className="min-w-0 text-[15px] text-cream">
                    {d.label}
                    <span className="text-cream/55"> · {d.pregunta}</span>
                  </p>
                  <p className="shrink-0 text-[15px] text-cream/55" style={{ fontVariantNumeric: 'lining-nums tabular-nums' }}>
                    {typeof v === 'number' ? `${v}/10` : '—'}
                  </p>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setBorrador((p) => ({ ...p, [d.id]: i + 1 }))}
                      className="flex h-11 flex-1 items-center min-w-0"
                      aria-label={`${d.label} ${i + 1}`}
                    >
                      <span
                        className="h-4 w-full rounded transition-colors"
                        style={{
                          background:
                            typeof v === 'number' && i < v
                              ? d.color
                              : 'var(--matrix-cell-divider, rgba(43,39,36,0.10))',
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            disabled={faltan > 0}
            onClick={() => {
              guardarMedicion(borrador);
              setMidiendo(false);
              setRefresco((n) => n + 1);
            }}
            className="btn-ios-primary flex-1 disabled:opacity-50"
          >
            {faltan > 0 ? `Falta${faltan > 1 ? 'n' : ''} ${faltan}` : 'Guardar'}
          </button>
          <button
            type="button"
            onClick={() => setMidiendo(false)}
            className="min-h-[52px] rounded-[20px] border px-4 text-[17px] text-cream"
            style={{ borderColor: 'var(--line2, #DFD3BC)' }}
          >
            Dejarlo
          </button>
        </div>
      </div>
    );
  }

  if (!ahora) {
    return (
      <div className="card-panel p-5 rounded-2xl">
        <p className="text-[15px] font-bold uppercase tracking-[0.16em] text-goldhi">Tus siete libertades</p>
        <p className="mt-2 text-[17px] text-cream">
          Las mides una vez y las vuelves a mirar al final. Es el registro del fin, no del medio.
        </p>
        <button type="button" onClick={abrirMedicion} className="btn-ios-primary mt-4 w-full">
          Medirlas ahora
        </button>
      </div>
    );
  }

  /* Con una sola medición no hay contra qué comparar: se muestra el estado. */
  const hayConQueComparar = veces > 1 && partida !== null;

  return (
    <div className="card-panel p-5 rounded-2xl">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[15px] font-bold uppercase tracking-[0.16em] text-goldhi">Tus siete libertades</p>
        <p className="text-[15px] text-cream/55 shrink-0">{ahora.fecha}</p>
      </div>

      {hayConQueComparar && (
        <p className="mt-2 text-[15px] text-cream/70">
          Al lado de cada una, lo que se movió desde tu foto de partida.
        </p>
      )}

      <div className="mt-4 space-y-3">
        {DIMENSIONES_RUEDA.map((d) => {
          const v = ahora.valores[d.id];
          const antes = partida?.valores[d.id];
          const delta =
            hayConQueComparar && typeof v === 'number' && typeof antes === 'number' ? v - antes : null;
          return (
            <div key={d.id}>
              <div className="flex items-baseline justify-between gap-3">
                <p className="min-w-0 text-[15px] text-cream">{d.label}</p>
                <p className="shrink-0 text-[15px] text-cream/70" style={{ fontVariantNumeric: 'lining-nums tabular-nums' }}>
                  {typeof v === 'number' ? `${v} de 10` : 'sin medir'}
                  {delta !== null && delta !== 0 && (
                    <span className="ml-2" style={{ color: delta > 0 ? 'var(--tilde, #3D6A4A)' : 'var(--text-cream)' }}>
                      {delta > 0 ? `+${delta}` : delta}
                    </span>
                  )}
                </p>
              </div>
              {/*
                La barra siempre se dibuja entera: el tramo lleno con el color
                de la libertad y el resto como surco. Así se ve cuánto falta,
                que es la mitad de la información.
              */}
              <div
                className="mt-1.5 h-3 w-full overflow-hidden rounded-full"
                style={{ background: 'var(--matrix-cell-divider, rgba(43,39,36,0.10))' }}
                role="img"
                aria-label={`${d.label}: ${typeof v === 'number' ? v : 0} de 10`}
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: `${((v ?? 0) / 10) * 100}%`, background: d.color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {paraQue && (
        <div className="mt-5 border-t pt-4" style={{ borderColor: 'var(--line, rgba(142,104,36,0.18))' }}>
          <p className="text-[15px] font-bold uppercase tracking-[0.16em] text-goldhi">Tu para qué</p>
          <p className="mt-1.5 text-[17px] leading-relaxed text-cream" style={{ fontFamily: 'var(--font-display)' }}>
            {paraQue}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={abrirMedicion}
        className="mt-4 flex min-h-[44px] items-center gap-1.5 text-[15px] font-semibold text-goldhi"
      >
        Volver a medirlas <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
