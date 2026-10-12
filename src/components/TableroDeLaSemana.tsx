import { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, Loader2 } from 'lucide-react';
import { cargarSemana, historialCliente } from '../lib/mesaPlataStorage';
import { semanaISO } from '../lib/bitacoraCampana';
import { calcularCadena, encontrarDomino, type NumerosSemana } from '../lib/valueChain';

/**
 * TU SEMANA, EN SEIS NÚMEROS.
 *
 * ═══ QUÉ PROBLEMA RESUELVE ═══
 *
 * El día que el cliente enciende sus campañas cambia de trabajo: deja de
 * construir y empieza a sostener. La app no se enteraba. Seguía abriendo con
 * la sesión del día, el mismo menú y la misma pantalla de Hoy que el día 3.
 *
 * Sus números existían —el equipo los miraba en la Mesa de plata— y él no los
 * veía: la tabla solo la podía leer el equipo. Para saber cómo venía su semana
 * tenía que preguntar.
 *
 * ═══ POR QUÉ SEIS Y NO VEINTE ═══
 *
 * Porque son los seis que mueven el resultado, y porque un tablero de veinte
 * números no se mira. Gasto, conversaciones, agendas, llamadas, ventas y
 * cobrado: la cadena entera, de lo que paga a lo que entra.
 *
 * Y una sola frase debajo, que dice dónde se corta. Seis números sin esa frase
 * son seis números: el cliente los lee, no sabe cuál mirar, y vuelve a
 * preguntar. El diagnóstico es el mismo que ve el equipo en su cola, sobre la
 * misma tabla: lo que la app le dice a él y lo que nos muestra a nosotros no
 * pueden ser dos lecturas distintas.
 */

const CAMPOS: Array<[keyof NumerosSemana, string, 'dinero' | 'entero']> = [
  ['gasto', 'Invertido', 'dinero'],
  ['conversaciones', 'Conversaciones', 'entero'],
  ['agendas', 'Agendas', 'entero'],
  ['llamadasTomadas', 'Llamadas', 'entero'],
  ['ventas', 'Ventas', 'entero'],
  ['cobrado', 'Cobrado', 'dinero'],
];

const fmt = (n: number, tipo: 'dinero' | 'entero') =>
  tipo === 'dinero' ? `$${Math.round(n).toLocaleString('es')}` : String(Math.round(n));

export default function TableroDeLaSemana(
  { clienteId, paises = [] }: { clienteId?: string; paises?: string[] },
) {
  const [semana, setSemana] = useState<NumerosSemana | null>(null);
  const [previa, setPrevia] = useState<NumerosSemana | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!clienteId) { setCargando(false); return; }
    let vivo = true;
    void (async () => {
      try {
        const [ahora, historial] = await Promise.all([
          cargarSemana(clienteId, semanaISO()),
          historialCliente(clienteId, 2),
        ]);
        if (!vivo) return;
        setSemana(ahora?.numeros ?? null);
        // La anterior es la segunda del historial: la primera es esta misma.
        setPrevia(historial.find((h) => h.semana !== semanaISO())?.numeros ?? null);
      } catch { /* el tablero no rompe la pantalla */ }
      if (vivo) setCargando(false);
    })();
    return () => { vivo = false; };
  }, [clienteId]);

  if (cargando) {
    return (
      <div className="card-panel p-5 flex items-center gap-3 text-[17px] text-cream/70">
        <Loader2 className="w-5 h-5 animate-spin" /> Trayendo tu semana…
      </div>
    );
  }

  // Sin números cargados, el tablero dice qué hacer en vez de mostrar seis ceros.
  if (!semana) {
    return (
      <div className="card-panel p-5 border border-gold/30">
        <p className="text-[15px] font-bold uppercase tracking-[0.2em] text-gold">Tu semana</p>
        <p className="mt-2 text-[21px] text-cream" style={{ fontFamily: 'var(--font-display)' }}>
          Todavía no cargaste tus números.
        </p>
        <p className="mt-2 text-[17px] text-cream/65">
          Son seis datos y dos minutos. Sin ellos, tu tablero no puede decirte dónde se corta.
        </p>
      </div>
    );
  }

  const cadena = calcularCadena(semana, paises);
  const domino = encontrarDomino(cadena);

  return (
    <section className="card-panel p-5 border border-gold/30">
      <p className="text-[15px] font-bold uppercase tracking-[0.2em] text-gold">
        Tu semana · {semanaISO()}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-4 mt-4">
        {CAMPOS.map(([k, label, tipo]) => {
          const v = Number(semana[k] ?? 0);
          const antes = previa ? Number(previa[k] ?? 0) : null;
          const sube = antes === null ? null : v > antes ? true : v < antes ? false : null;
          return (
            <div key={String(k)} className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[15px] text-cream/55">{label}</span>
              <span className="flex items-baseline gap-1.5 min-w-0">
                <b className="text-cream tabular-nums truncate"
                  style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, lineHeight: 1.1 }}>
                  {fmt(v, tipo)}
                </b>
                {antes !== null && (
                  sube === true ? <ArrowUpRight className="w-4 h-4 text-success shrink-0" aria-label="más que la semana pasada" />
                  : sube === false ? <ArrowDownRight className="w-4 h-4 text-danger shrink-0" aria-label="menos que la semana pasada" />
                  : <Minus className="w-4 h-4 text-cream/35 shrink-0" aria-label="igual que la semana pasada" />
                )}
              </span>
            </div>
          );
        })}
      </div>

      {/* La frase que convierte seis números en una decisión. */}
      <div className="mt-5 pt-4 border-t border-gold/40">
        <p className="text-[15px] font-bold uppercase tracking-[0.2em] text-gold">Dónde se corta</p>
        <p className="mt-1.5 text-[19px] leading-snug text-cream">{domino.titulo}</p>
        {domino.porque && <p className="mt-1 text-[17px] text-cream/65">{domino.porque}</p>}
      </div>
    </section>
  );
}
