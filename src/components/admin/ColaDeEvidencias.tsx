import { useCallback, useEffect, useState } from 'react';
import { ClipboardCheck, ExternalLink, Check, X } from 'lucide-react';
import {
  colaDeEvidencias, decidirEvidencia, type EnLaCola,
} from '../../lib/veredictoEvidencia';
import { urlEvidencia } from '../../lib/evidencia';
import { SEED_ROADMAP_V2 } from '../../lib/roadmapSeed';
import { mensajeDeFalla } from '../../lib/conexion';

/** Día y título de cada jornada, para que la fila diga de qué sesión habla. */
const JORNADAS = (() => {
  const m = new Map<string, { dia: number; titulo: string }>();
  for (const p of SEED_ROADMAP_V2) {
    for (const meta of p.metas) {
      m.set(meta.codigo, { dia: meta.dia_asignado ?? 0, titulo: meta.titulo });
    }
  }
  return m;
})();

/**
 * UNA FILA DE LA COLA.
 *
 * Sale del componente de arriba para que la prueba de humo la pueda montar:
 * el render estático no corre los efectos, así que con la cola vacía nunca se
 * dibujaba nada y la fila —que es la parte con el `.map`, el condicional
 * anidado y el textarea— no la miraba ninguna prueba.
 */
export function FilaDeLaCola({
  fila, ocupado, abriendo, rechazando, onAbrir, onDecidir, onEscribirRechazo, onAbrirCliente,
}: {
  fila: EnLaCola;
  ocupado: boolean;
  abriendo?: boolean;
  rechazando: { archivo: string; motivo: string } | null;
  onAbrir: (path: string) => void;
  onDecidir: (f: EnLaCola, estado: 'aprobada' | 'rechazada', motivo: string) => void;
  onEscribirRechazo: (v: { archivo: string; motivo: string } | null) => void;
  onAbrirCliente?: (clienteId: string) => void;
}) {
  const j = JORNADAS.get(fila.metaCodigo);
  const escribiendo = rechazando?.archivo === fila.archivo;
  return (
    <div className="rounded-2xl border border-cream/12 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-base text-cream/90">{fila.cliente}</p>
          <p className="text-sm text-cream/60 mt-1">
            {j ? `Día ${j.dia} · ${j.titulo}` : `Sesión ${fila.metaCodigo}`}
          </p>
        </div>
        <span className={`shrink-0 rounded-lg px-2.5 py-1 text-sm ${
          fila.estado === 'rechazada' ? 'bg-danger/15 text-danger' : 'bg-cream/[0.07] text-cream/60'}`}>
          {fila.estado === 'rechazada' ? 'El testigo la rechazó' : 'El testigo no la lee'}
        </span>
      </div>

      {fila.motivo && (
        <p className="text-sm text-cream/55 mt-2.5 leading-relaxed">«{fila.motivo}»</p>
      )}

      {/* Que la jornada ya haya cerrado cambia la conversación: no se reabre
          sola, porque una jornada vencida de hace cinco semanas en una
          pantalla que venía en verde es un castigo. Se habla. */}
      {fila.jornadaCerrada && (
        <p className="text-sm text-cream/70 mt-2 leading-relaxed">
          Esa jornada ya la cerró. Si la evidencia no sirve, háblalo con él.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2 mt-3">
        <button onClick={() => onAbrir(fila.archivo)}
          className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm bg-cream/[0.07] text-cream/80 hover:bg-cream/[0.12] transition-colors">
          <ExternalLink size={14} /> {abriendo ? 'Abriendo…' : 'Ver el archivo'}
        </button>
        <button disabled={ocupado}
          onClick={() => onDecidir(fila, 'aprobada', '')}
          className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold bg-success/15 text-success hover:bg-success/25 transition-colors disabled:opacity-50">
          <Check size={14} /> {ocupado ? 'Guardando…' : 'Aprobar'}
        </button>
        {!escribiendo && (
          <button disabled={ocupado}
            onClick={() => onEscribirRechazo({ archivo: fila.archivo, motivo: fila.motivo })}
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold bg-danger/12 text-danger hover:bg-danger/20 transition-colors disabled:opacity-50">
            <X size={14} /> Pedirle otra
          </button>
        )}
        {onAbrirCliente && (
          <button onClick={() => onAbrirCliente(fila.clienteId)}
            className="rounded-xl px-3 py-2 text-sm text-cream/60 hover:text-cream/90 transition-colors">
            Abrir su ficha
          </button>
        )}
      </div>

      {/* CONFIRMAR EL RECHAZO ES UN TOQUE.
          El motivo viene escrito por el testigo, así que confirmarlo no pide
          redactar nada. Y se puede cambiar, porque el motivo es lo que el
          cliente va a leer. */}
      {escribiendo && rechazando && (
        <div className="mt-3 rounded-xl border border-danger/25 bg-danger/[0.04] p-3">
          <label className="block text-sm text-cream/70 mb-2">
            Lo que va a leer {fila.cliente}:
          </label>
          <textarea
            value={rechazando.motivo}
            onChange={(e) => onEscribirRechazo({ archivo: fila.archivo, motivo: e.target.value })}
            rows={2}
            placeholder="Qué tiene que mostrar la foto que suba."
            className="w-full rounded-lg bg-cream/[0.05] border border-cream/15 px-3 py-2 text-sm text-cream/90 placeholder:text-cream/35"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            <button disabled={ocupado}
              onClick={() => onDecidir(fila, 'rechazada', rechazando.motivo)}
              className="rounded-xl px-3 py-2 text-sm font-bold bg-danger/15 text-danger hover:bg-danger/25 transition-colors disabled:opacity-50">
              {ocupado ? 'Guardando…' : 'Pedirle otra y avisarle'}
            </button>
            <button onClick={() => onEscribirRechazo(null)}
              className="rounded-xl px-3 py-2 text-sm text-cream/60 hover:text-cream/90 transition-colors">
              Dejarlo así
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * LAS EVIDENCIAS QUE ESPERAN UNA DECISIÓN.
 *
 * ═══ CÓMO SE REPARTE EL TRABAJO ═══
 *
 * Juzga la IA, y su veredicto queda guardado con su firma. Acá cae solo lo
 * que ella rechazó y lo que no puede mirar —el audio, el video, el PDF—, con
 * su motivo al lado. Un toque aprueba; un toque confirma el rechazo, porque
 * el motivo viene escrito y confirmarlo no pide redactar nada.
 *
 * ═══ POR QUÉ ACÁ Y NO EN LA FICHA ═══
 *
 * En la ficha del cliente también está, archivo por archivo. Pero encontrar
 * las dos que esperan abriendo treinta fichas es trabajo que nadie hace, y lo
 * que no se hace deja al cliente trabado sin que nadie se enterara.
 *
 * ═══ POR QUÉ SE CALLA CUANDO NO HAY NADA ═══
 *
 * Un panel que dice «0» todos los días se deja de leer, y entonces tampoco se
 * lee el día que dice algo.
 */
export default function ColaDeEvidencias({
  onAbrirCliente,
}: {
  onAbrirCliente?: (clienteId: string) => void;
}) {
  const [cola, setCola] = useState<EnLaCola[] | null>(null);
  const [problema, setProblema] = useState<string | null>(null);
  const [trabajando, setTrabajando] = useState<string | null>(null);
  /** El archivo cuya URL firmada se está pidiendo. */
  const [abriendo, setAbriendo] = useState<string | null>(null);
  /** El archivo cuyo rechazo se está confirmando, y el motivo escrito. */
  const [rechazando, setRechazando] = useState<{ archivo: string; motivo: string } | null>(null);

  const cargar = useCallback(async () => {
    try {
      setCola(await colaDeEvidencias());
      setProblema(null);
    } catch (err) {
      setProblema(mensajeDeFalla(err, 'ver las evidencias que esperan'));
      setCola([]);
    }
  }, []);

  useEffect(() => {
    let vivo = true;
    void (async () => { if (vivo) await cargar(); })();
    // Cada tres minutos: un cliente trabado no puede depender de que alguien
    // recargue la pantalla a mano.
    const t = setInterval(() => { if (vivo) void cargar(); }, 180_000);
    return () => { vivo = false; clearInterval(t); };
  }, [cargar]);

  /*
   * Abrir el archivo pide una URL firmada, y eso es un viaje a la base. Sin
   * decir que está en curso, quien no ve nada toca de nuevo y se le abren dos
   * pestañas.
   */
  const abrir = async (path: string) => {
    setAbriendo(path);
    const url = await urlEvidencia(path);
    setAbriendo(null);
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
    else setProblema('No pudimos abrir ese archivo. Recarga la pantalla e intenta de nuevo.');
  };

  const decidir = async (f: EnLaCola, estado: 'aprobada' | 'rechazada', motivo: string) => {
    setTrabajando(f.archivo);
    const ok = await decidirEvidencia(f.archivo, estado, motivo, f.clienteId, f.metaCodigo);
    setTrabajando(null);
    if (!ok) {
      setProblema('Esa decisión no se guardó. Recarga la pantalla e intenta de nuevo.');
      return;
    }
    setRechazando(null);
    // Sale de la cola, y el cliente ya tiene su aviso.
    setCola((c) => (c ?? []).filter((x) => x.archivo !== f.archivo));
  };

  // Mientras carga, y cuando no hay nada, no ocupa lugar.
  if (cola === null || (cola.length === 0 && !problema)) return null;

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-gold/30 bg-gold/[0.05] p-5">
        <div className="flex items-center gap-2">
          <ClipboardCheck size={18} className="text-gold" />
          <p className="text-base text-cream/90">
            {cola.length === 1
              ? 'Una evidencia espera tu decisión'
              : `${cola.length} evidencias esperan tu decisión`}
          </p>
        </div>
        <p className="text-sm text-cream/55 mt-2 leading-relaxed">
          El testigo juzga las imágenes y su veredicto queda guardado. Acá cae
          lo que rechazó y lo que no puede mirar: el audio, el video y los PDF.
        </p>
      </div>

      {problema && (
        <div className="rounded-xl border border-danger/40 bg-danger/[0.06] p-3">
          <p className="text-sm text-cream/85">{problema}</p>
        </div>
      )}

      {cola.map((f) => (
        <FilaDeLaCola
          key={f.archivo}
          fila={f}
          ocupado={trabajando === f.archivo}
          abriendo={abriendo === f.archivo}
          rechazando={rechazando}
          onAbrir={(path) => void abrir(path)}
          onDecidir={(fila, estado, motivo) => void decidir(fila, estado, motivo)}
          onEscribirRechazo={setRechazando}
          onAbrirCliente={onAbrirCliente}
        />
      ))}
    </div>
  );
}
