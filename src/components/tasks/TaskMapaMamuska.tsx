/**
 * TaskMapaMamuska.tsx — Tarea P8.8 (v8 · Mapa Mamuska)
 *
 * Verificación cruzada del cierre de F3. Cada fila:
 *   Obstáculo (Matriz B) → Paso del Método → En qué oferta lo resuelve → Nivel conciencia
 *
 * Si quedan filas vacías o inconsistentes, la app señala el gap antes de pasar a F4.
 * Reusa el array `adn_metodo_mapeo_obstaculos` que ya armó el usuario en P7.4,
 * y agrega las columnas "oferta" y "nivel_conciencia" para el cierre de F3.
 *
 * Se guarda como JSON estructurado en `adn_metodo_mapeo_obstaculos`.
 */

import { useEffect, useMemo, useState } from 'react';
import { Grid3X3, CheckCircle2, Save, Plus, Trash2, AlertCircle } from 'lucide-react';
import type { AdnMapeoObstaculos, ProfileV2 } from '../../lib/supabase';
import type { RoadmapMeta } from '../../lib/roadmapSeed';

type MamuskaFila = Required<Pick<AdnMapeoObstaculos, 'obstaculo' | 'paso_metodo'>> &
  Pick<AdnMapeoObstaculos, 'oferta' | 'nivel_conciencia' | 'nota'>;

/** Fila con id estable para React keys (evita reuso incorrecto de DOM al borrar). */
interface MamuskaFilaConId extends MamuskaFila {
  _id: string;
}

let _filaIdCounter = 0;
function nuevoId(): string {
  _filaIdCounter += 1;
  return `mamuska-${Date.now().toString(36)}-${_filaIdCounter}`;
}

interface TaskMapaMamuskaProps {
  meta: RoadmapMeta;
  perfil?: Partial<ProfileV2>;
  /**
   * Valor existente. Puede venir como `AdnMapeoObstaculos[]` (correcto) o como
   * `string` (datos legacy guardados como JSON.stringify). Parseamos defensivo.
   */
  valorExistente?: MamuskaFila[] | string;
  onSaveADN: (outputTexto: string, filas: MamuskaFila[]) => void;
  isCompleted: boolean;
}

/** Normaliza `valorExistente` que puede venir como array o como JSON string. */
function parseValorExistente(valor: MamuskaFila[] | string | undefined): MamuskaFila[] | undefined {
  if (!valor) return undefined;
  if (Array.isArray(valor)) return valor;
  if (typeof valor === 'string') {
    try {
      const parsed = JSON.parse(valor);
      if (Array.isArray(parsed)) return parsed as MamuskaFila[];
    } catch {
      return undefined;
    }
  }
  return undefined;
}

const OFERTA_LABELS: Record<MamuskaFila['oferta'], string> = {
  '': 'Elegir…',
  lead_magnet: 'Lead Magnet ($0)',
  ultralow: 'Ultra Low ($17-47)',
  low: 'Low ($100-500)',
  mid: 'Mid ($1K-5K · principal)',
  high: 'High ($5K+)',
};

const CONCIENCIA_LABELS: Record<MamuskaFila['nivel_conciencia'], string> = {
  '': 'Elegir…',
  A_unaware: 'A · Unaware (no sabe que tiene problema)',
  B_solution: 'B · Solution aware (sabe, pero con obstáculos)',
  C_most: 'C · Most aware (busca tu solución específica)',
};

function filaVacia(obstaculo = '', paso_metodo = ''): MamuskaFilaConId {
  return {
    _id: nuevoId(),
    obstaculo,
    paso_metodo,
    oferta: '',
    nivel_conciencia: '',
  };
}

/** Asigna id estable a filas que vienen del schema (sin `_id`). */
function conId(fila: MamuskaFila): MamuskaFilaConId {
  return { ...filaVacia(), ...fila };
}

export default function TaskMapaMamuska({
  meta,
  perfil,
  valorExistente,
  onSaveADN,
  isCompleted,
}: TaskMapaMamuskaProps) {
  // Si hay valor existente lo usamos. Sino, pre-llenamos con los mapeos de P7.4
  // (adn_metodo_mapeo_obstaculos) extendiendo cada fila con oferta + conciencia vacíos.
  const seedInicial = useMemo<MamuskaFilaConId[]>(() => {
    const parsed = parseValorExistente(valorExistente);
    if (parsed && parsed.length > 0) {
      return parsed.map(conId);
    }
    const mapeoP7 = perfil?.adn_metodo_mapeo_obstaculos;
    if (Array.isArray(mapeoP7) && mapeoP7.length > 0) {
      return mapeoP7.map((m) => filaVacia(m.obstaculo, m.paso_metodo));
    }
    return [filaVacia(), filaVacia(), filaVacia()];
  }, [valorExistente, perfil?.adn_metodo_mapeo_obstaculos]);

  const [filas, setFilas] = useState<MamuskaFilaConId[]>(seedInicial);
  const [saved, setSaved] = useState(isCompleted);

  useEffect(() => {
    const parsed = parseValorExistente(valorExistente);
    if (parsed && parsed.length > 0) {
      setFilas(parsed.map(conId));
      setSaved(isCompleted);
    }
  }, [valorExistente, isCompleted]);

  const handleField = <K extends keyof MamuskaFila>(
    id: string,
    field: K,
    value: MamuskaFila[K],
  ) => {
    setFilas((prev) =>
      prev.map((f) => (f._id === id ? { ...f, [field]: value } : f)),
    );
    setSaved(false);
  };

  const agregarFila = () => {
    setFilas((prev) => [...prev, filaVacia()]);
    setSaved(false);
  };

  const borrarFila = (id: string) => {
    setFilas((prev) => prev.filter((f) => f._id !== id));
    setSaved(false);
  };

  // Gaps: fila completa = todos los 4 campos requeridos llenos.
  const gaps = useMemo(() => {
    return filas.filter((fila) =>
      !fila.obstaculo.trim()
        || !fila.paso_metodo.trim()
        || !fila.oferta
        || !fila.nivel_conciencia,
    );
  }, [filas]);

  const handleSave = () => {
    // Filtramos filas completamente vacías al guardar (no las contamos).
    // Stripeamos el `_id` interno (es sólo para React keys, no va al ADN).
    const filasUtiles: MamuskaFila[] = filas
      .filter(
        (f) => f.obstaculo.trim() || f.paso_metodo.trim() || f.oferta || f.nivel_conciencia,
      )
      .map(({ _id: _ignored, ...resto }) => resto);
    onSaveADN(JSON.stringify(filasUtiles, null, 2), filasUtiles);
    setSaved(true);
  };

  const puedeGuardar = filas.some((f) => f.obstaculo.trim() && f.paso_metodo.trim());

  return (
    <div className="space-y-6">
      <div className="border-b border-[rgba(245,166,35,0.15)] pb-4">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-[10px] font-mono text-[#F5A623] uppercase tracking-widest font-bold">
            <Grid3X3 className="w-3 h-3 inline mr-1" />
            {meta.codigo} · Mapa Mamuska
          </span>
          {saved && (
            <span className="text-[10px] text-[#22C55E] uppercase tracking-widest font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Guardado
            </span>
          )}
        </div>
        <h3
          className="text-lg font-medium text-[#FFFFFF]"
          style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}
        >
          {meta.titulo}
        </h3>
        <p className="text-sm text-[#FFFFFF]/60 mt-1">{meta.descripcion}</p>
      </div>

      {gaps.length > 0 && (
        <div className="card-panel p-4 border border-[#F0B429]/40 bg-[#F0B429]/[0.05]">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-[#F0B429] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs uppercase tracking-widest font-bold text-[#F0B429] mb-1">
                {gaps.length} {gaps.length === 1 ? 'fila tiene' : 'filas tienen'} gaps
              </p>
              <p className="text-sm text-[#FFFFFF]/70">
                Cada fila necesita los 4 campos llenos: obstáculo, paso del método,
                oferta y nivel de conciencia. Si algo queda vacío te falta cubrir
                ese obstáculo en tu escalera.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {filas.map((fila, idx) => {
          const tieneGap = !fila.obstaculo.trim()
            || !fila.paso_metodo.trim()
            || !fila.oferta
            || !fila.nivel_conciencia;
          return (
            <div
              key={fila._id}
              className={`card-panel p-4 border ${
                tieneGap
                  ? 'border-[#F0B429]/25 bg-[#1C1C1C]/30'
                  : 'border-[#22C55E]/25 bg-[#22C55E]/[0.03]'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-[#FFFFFF]/40 uppercase tracking-widest">
                  Fila {idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => borrarFila(fila._id)}
                  className="text-[#FFFFFF]/30 hover:text-[#ff5e5e] transition-colors p-1"
                  aria-label={`Borrar fila ${idx + 1}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#FFFFFF]/50 mb-1 font-semibold">
                    Obstáculo (Matriz B)
                  </label>
                  <textarea
                    value={fila.obstaculo}
                    onChange={(e) => handleField(fila._id, 'obstaculo', e.target.value)}
                    placeholder="Ej: cree que va a ser caro"
                    rows={2}
                    className="w-full input-field resize-y text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#FFFFFF]/50 mb-1 font-semibold">
                    Paso del Método que lo resuelve
                  </label>
                  <textarea
                    value={fila.paso_metodo}
                    onChange={(e) => handleField(fila._id, 'paso_metodo', e.target.value)}
                    placeholder="Ej: paso 3 · diagnóstico personalizado con plan de costos"
                    rows={2}
                    className="w-full input-field resize-y text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#FFFFFF]/50 mb-1 font-semibold">
                    En qué oferta lo resuelve
                  </label>
                  <select
                    value={fila.oferta}
                    onChange={(e) =>
                      handleField(fila._id, 'oferta', e.target.value as MamuskaFila['oferta'])
                    }
                    className="w-full input-field text-sm"
                  >
                    {(Object.keys(OFERTA_LABELS) as MamuskaFila['oferta'][]).map((k) => (
                      <option key={k} value={k}>
                        {OFERTA_LABELS[k]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#FFFFFF]/50 mb-1 font-semibold">
                    Nivel de conciencia del avatar
                  </label>
                  <select
                    value={fila.nivel_conciencia}
                    onChange={(e) =>
                      handleField(
                        fila._id,
                        'nivel_conciencia',
                        e.target.value as MamuskaFila['nivel_conciencia'],
                      )
                    }
                    className="w-full input-field text-sm"
                  >
                    {(
                      Object.keys(CONCIENCIA_LABELS) as MamuskaFila['nivel_conciencia'][]
                    ).map((k) => (
                      <option key={k} value={k}>
                        {CONCIENCIA_LABELS[k]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={agregarFila}
        className="w-full btn-secondary flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Agregar fila
      </button>

      <button
        type="button"
        onClick={handleSave}
        disabled={!puedeGuardar}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {saved ? (
          <>
            <CheckCircle2 className="w-4 h-4" /> Mapa Mamuska guardado
          </>
        ) : (
          <>
            <Save className="w-4 h-4" /> Guardar Mapa Mamuska
          </>
        )}
      </button>
    </div>
  );
}
