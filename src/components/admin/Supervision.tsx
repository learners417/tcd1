import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { supervision, type FilaSupervision, type Semaforo } from '../../lib/mesaPlataStorage';
import { semanaISO } from '../../lib/bitacoraCampana';
import { mensajeDeFalla, causaDe } from '../../lib/conexion';
import { situacionDe } from '../../lib/salaDeMando';
import { marcarEncendida } from '../../lib/salaDeMandoStorage';
import Termino from '../Termino';

/**
 * SUPERVISIÓN — todas las cuentas a la vez, lo rojo arriba.
 *
 * Existe porque el Admin no supervisaba: montaba EL MISMO COMPONENTE DEL
 * CLIENTE con su id, así que veía lo que ve el cliente. Eso sirve para
 * ayudarlo con algo puntual, no para saber a quién atender entre once.
 *
 * La diferencia es el ancho. La pregunta que contesta esta pantalla no es
 * «cómo va esta cuenta» sino «cuál primero» — y esa no se puede contestar
 * mirando de a una.
 */

interface Cliente {
  id: string;
  nombre: string;
  /** Desde cuándo corre su campaña. Sin esto queda como «instalando». */
  campana_desde?: string | null;
  campana_pausada?: boolean;
}

const PUNTO: Record<Semaforo, string> = {
  verde: 'bg-success',
  amarillo: 'bg-gold',
  rojo: 'bg-danger',
  sin_datos: 'bg-cream/15',
};

const TITULO: Record<Semaforo, string> = {
  verde: 'sano',
  amarillo: 'para mirar',
  rojo: 'roto',
  sin_datos: 'sin datos',
};

export default function Supervision({ clientes }: { clientes: Cliente[] }) {
  const [filas, setFilas] = useState<FilaSupervision[] | null>(null);
  const [cargando, setCargando] = useState(true);
  const [problema, setProblema] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (clientes.length === 0) { setFilas([]); return; }
    setCargando(true);
    setProblema(null);
    try {
      setFilas(await supervision(clientes.map((c) => c.id)));
    } catch (err) {
      setProblema(
        causaDe(err) === 'servidor'
          ? `${mensajeDeFalla(err, 'cargar las cuentas')} Si es la primera vez, falta correr sala-de-mando.sql en Supabase.`
          : mensajeDeFalla(err, 'cargar las cuentas'),
      );
      setFilas([]);
    } finally {
      setCargando(false);
    }
  }, [clientes]);

  /** La guarda evita tocar estado de un componente que ya no está en pantalla:
   *  si se cambia de tab mientras carga, la respuesta llega a la nada. */
  useEffect(() => {
    let vivo = true;
    void (async () => { if (vivo) await cargar(); })();
    return () => { vivo = false; };
  }, [cargar]);

  const nombre = (id: string) => clientes.find((c) => c.id === id)?.nombre ?? 'Cliente';
  const cliente = (id: string) => clientes.find((c) => c.id === id);

  /**
   * Encender la campaña. Sin esto, `situacionDe` nunca recibe una fecha y
   * todos quedan como «instalando» para siempre: el diagnóstico de campaña
   * no se activa nunca.
   */
  const [encendiendo, setEncendiendo] = useState<string | null>(null);
  const encender = async (id: string) => {
    if (!window.confirm('¿La campaña de este cliente ya está corriendo?')) return;
    setEncendiendo(id);
    try {
      await marcarEncendida(id);
      await cargar();
    } catch (err) {
      setProblema(mensajeDeFalla(err, 'marcar la campaña'));
    } finally {
      setEncendiendo(null);
    }
  };

  const sinCargar = (filas ?? []).filter((f) => f.sinCargar).length;
  const rotas = (filas ?? []).filter(
    (f) => !f.sinCargar && [f.atraccion, f.conversion, f.retencion].includes('rojo'),
  ).length;
  const sanas = (filas ?? []).filter(
    (f) => !f.sinCargar && ![f.atraccion, f.conversion, f.retencion].some((x) => x !== 'verde'),
  ).length;

  return (
    <div className="max-w-5xl mx-auto space-y-4">

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-cream/70">
            {cargando ? 'Mirando las cuentas…'
              : filas === null ? '—'
              : `${sanas} sanas · ${rotas} rotas · ${sinCargar} sin cargar · semana ${semanaISO()}`}
          </p>
          <p className="text-[11px] text-cream/40 mt-0.5">
            Ordenadas por dinero en riesgo. Las que no cargaron van primero: sin datos
            no se puede decidir nada sobre esa cuenta.
          </p>
        </div>
        <button onClick={() => void cargar()} disabled={cargando}
          className="flex items-center gap-2 text-xs text-cream/50 disabled:opacity-40 shrink-0">
          <RefreshCw size={13} className={cargando ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {problema && (
        <div className="rounded-2xl border border-gold/30 bg-gold/[0.05] p-4">
          <p className="text-sm text-cream/85">{problema}</p>
        </div>
      )}

      <div className="rounded-2xl border border-cream/12 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-cream/45">
                <th className="text-left font-semibold px-4 py-2.5">Cliente</th>
                <th className="font-semibold px-2 py-2.5" title="Atracción">Atrae</th>
                <th className="font-semibold px-2 py-2.5" title="Conversión">Convierte</th>
                <th className="font-semibold px-2 py-2.5" title="Retención">Retiene</th>
                <th className="text-left font-semibold px-3 py-2.5">Situación</th>
                <th className="text-left font-semibold px-3 py-2.5">
                  <Termino p="cuello de botella">Dónde se traba</Termino>
                </th>
                <th className="text-right font-semibold px-3 py-2.5">Ventas</th>
                <th className="text-right font-semibold px-4 py-2.5">Cobrado</th>
              </tr>
            </thead>
            <tbody>
              {filas === null ? (
                <tr><td colSpan={8} className="px-4 py-6 text-sm text-cream/40">Cargando…</td></tr>
              ) : filas.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-6 text-sm text-cream/40">
                  Todavía no hay cuentas con números cargados.
                </td></tr>
              ) : filas.map((f) => (
                <tr key={f.clienteId}
                  className={`border-t border-cream/[0.07] ${f.sinCargar ? 'bg-cream/[0.02]' : ''}`}>
                  <td className="px-4 py-2.5 text-cream/85">{nombre(f.clienteId)}</td>
                  {(['atraccion', 'conversion', 'retencion'] as const).map((t) => (
                    <td key={t} className="px-2 py-2.5 text-center">
                      <span title={TITULO[f[t]]}
                        className={`inline-block w-2.5 h-2.5 rounded-full ${PUNTO[f[t]]}`} />
                    </td>
                  ))}
                  <td className="px-3 py-2.5">
                    {(() => {
                      const c = cliente(f.clienteId);
                      const sit = situacionDe({
                        campanaDesde: c?.campana_desde,
                        campanaPausada: c?.campana_pausada,
                      });
                      if (sit.estado === 'instalando') {
                        return (
                          <button onClick={() => void encender(f.clienteId)}
                            disabled={encendiendo === f.clienteId}
                            className="text-[11px] text-cream/45 hover:text-gold underline underline-offset-2 disabled:opacity-40">
                            {encendiendo === f.clienteId ? 'Marcando…' : 'Instalando · marcar encendida'}
                          </button>
                        );
                      }
                      return (
                        <span className={`text-[11px] ${
                          sit.estado === 'pausado' ? 'text-cream/40' : 'text-success/80'}`}>
                          {sit.linea}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-3 py-2.5 text-cream/70">
                    {f.cuello}
                    {f.semanasIgual > 1 && (
                      <span className="text-danger ml-2 text-xs">
                        {f.semanasIgual}ª semana igual
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right text-cream/70">{f.ventas || '—'}</td>
                  <td className="px-4 py-2.5 text-right text-gold">
                    {f.cobrado ? `$${f.cobrado.toLocaleString()}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-cream/40 px-4 py-3 border-t border-cream/[0.07]">
          Tres puntos por cuenta: atrae, convierte, retiene. Solo pasa el agua que
          permite el tramo más angosto — por eso alcanza con mirar cuál está apagado.
        </p>
      </div>
    </div>
  );
}
