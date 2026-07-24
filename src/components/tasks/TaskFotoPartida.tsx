/**
 * TaskFotoPartida.tsx — Tarea P0.2 (v8 · Foto de Partida)
 *
 * Autoevaluación ciega 1-5 en 8 dimensiones que el usuario hace el día 1.
 * Al día 45 la app compara esta foto con el ADN real (efecto revelación
 * de "lo que no sabías que no sabías").
 *
 * Guarda en `profiles.adn_autoevaluacion_dia1` como `number[]` de longitud 8,
 * en el orden de `DIMENSIONES_FOTO_PARTIDA` (adnSchema.ts).
 */

import { useEffect, useState } from 'react';
import { Camera, CheckCircle2, Save } from 'lucide-react';
import { DIMENSIONES_FOTO_PARTIDA } from '../../lib/adnSchema';
import type { RoadmapMeta } from '../../lib/roadmapSeed';

interface TaskFotoPartidaProps {
  meta: RoadmapMeta;
  /**
   * Valor existente. Puede venir como `number[]` (formato correcto) o como `string`
   * (datos legacy que se guardaron como JSON.stringify por bug en handleSaveADN).
   * Parseamos defensivamente.
   */
  valorExistente?: number[] | string;
  /** Llamado al guardar. Output es JSON.stringify del array para reusar el flujo de outputs. */
  onSaveADN: (outputTexto: string, scores: number[]) => void;
  isCompleted: boolean;
}

/** Normaliza `valorExistente` que puede venir como array o como JSON string. */
function parseValorExistente(valor: number[] | string | undefined): number[] | undefined {
  if (!valor) return undefined;
  if (Array.isArray(valor)) {
    return valor.every((v) => typeof v === 'number') ? valor : undefined;
  }
  if (typeof valor === 'string') {
    try {
      const parsed = JSON.parse(valor);
      if (Array.isArray(parsed) && parsed.every((v) => typeof v === 'number')) {
        return parsed;
      }
    } catch {
      return undefined;
    }
  }
  return undefined;
}

const SCORE_LABELS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: 'No tengo nada',
  2: 'Apenas tengo idea',
  3: 'Tengo algo armado',
  4: 'Tengo bastante',
  5: 'Tengo muy claro',
};

export default function TaskFotoPartida({
  meta,
  valorExistente,
  onSaveADN,
  isCompleted,
}: TaskFotoPartidaProps) {
  // Inicializa con valor existente (parseado) o array de 3s (medio neutral).
  const [scores, setScores] = useState<number[]>(() => {
    const parsed = parseValorExistente(valorExistente);
    if (parsed && parsed.length === DIMENSIONES_FOTO_PARTIDA.length) {
      return [...parsed];
    }
    return DIMENSIONES_FOTO_PARTIDA.map(() => 3);
  });
  const [saved, setSaved] = useState(isCompleted);

  // Sincroniza si llega un valorExistente nuevo (ej. al re-abrir la tarea).
  useEffect(() => {
    const parsed = parseValorExistente(valorExistente);
    if (parsed && parsed.length === DIMENSIONES_FOTO_PARTIDA.length) {
      setScores([...parsed]);
      setSaved(isCompleted);
    }
  }, [valorExistente, isCompleted]);

  const handleScoreChange = (index: number, value: number) => {
    setScores((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    setSaved(false);
  };

  const handleSave = () => {
    // Persistimos como string JSON para reusar el storage de outputs
    // y como array tipado al ProfileV2.
    onSaveADN(JSON.stringify(scores), scores);
    setSaved(true);
  };

  const promedio = scores.length > 0
    ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
    : 0;

  return (
    <div className="space-y-6">
      <div className="border-b border-[rgba(232,150,46,0.10)] pb-4">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-[11px] font-mono text-gold uppercase tracking-widest font-bold">
            <Camera className="w-3 h-3 inline mr-1" />
            {meta.codigo} · Foto de Partida
          </span>
          {saved && (
            <span className="text-[11px] text-success uppercase tracking-widest font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Guardado
            </span>
          )}
        </div>
        <h3
          className="text-lg font-medium text-cream"
          style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}
        >
          {meta.titulo}
        </h3>
        <p className="text-sm text-cream/75 mt-1">{meta.descripcion}</p>
      </div>

      <div className="card-panel p-5 border border-gold/15 bg-gold/[0.03]">
        <p className="text-sm text-cream/70 leading-relaxed">
          Para cada dimensión, marca del 1 al 5 cuánto sientes que la tienes HOY.
          No hay respuesta correcta — es una foto del punto de partida.
          Al día 45 la vamos a comparar con tu ADN real.
        </p>
      </div>

      <div className="space-y-4">
        {DIMENSIONES_FOTO_PARTIDA.map((dim, index) => {
          const score = scores[index];
          return (
            <div
              key={dim.key}
              className="card-panel p-4 border border-[rgba(232,150,46,0.1)]"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <label className="text-sm font-medium text-cream flex-1">
                  {dim.label}
                </label>
                <span className="text-2xl font-mono text-gold font-bold leading-none">
                  {score}
                </span>
              </div>

              {/* Slider con 5 botones grandes */}
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => handleScoreChange(index, n)}
                    className={`py-2.5 rounded-lg border text-sm font-semibold transition-all ${
                      score === n
                        ? 'bg-gold border-gold text-ink'
                        : 'bg-surface/40 border-[rgba(232,150,46,0.10)] text-cream/65 hover:bg-gold/10 hover:text-cream/80 hover:border-gold/30'
                    }`}
                    aria-label={`Puntaje ${n} en ${dim.label}`}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <p className="text-xs text-cream/55 mt-2 italic">
                {SCORE_LABELS[score as 1 | 2 | 3 | 4 | 5] ?? ''}
              </p>
            </div>
          );
        })}
      </div>

      <div className="card-panel p-4 border border-[rgba(232,150,46,0.12)] bg-surface/30 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-cream/65 font-semibold">
            Promedio actual
          </p>
          <p className="text-3xl font-bold text-gold mt-1 leading-none">
            {promedio.toFixed(1)}
            <span className="text-base text-cream/55 font-normal ml-1">/ 5</span>
          </p>
        </div>
        <button
          onClick={handleSave}
          className="btn-primary flex items-center gap-2"
          aria-label="Guardar Foto de Partida"
        >
          {saved ? (
            <>
              <CheckCircle2 className="w-4 h-4" /> Guardado
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Guardar mi Foto de Partida
            </>
          )}
        </button>
      </div>
    </div>
  );
}
