import { AlertTriangle, ArrowDown, ArrowUp, Minus } from 'lucide-react';
import {
  tablaDeFunciones, tituloDeLaSemana, deudaPorCliente,
  type ObservacionFuncion, type HitoDeAbsorcion, type MinutosDeFuncion,
} from '../../lib/funciones';

/**
 * LA TABLA DE FUNCIONES — si el negocio está escalando o solo trabajando menos.
 *
 * La app ya medía los minutos de humano por cliente en total. Y en total no
 * sirve para decidir nada: si bajaron de 44 a 38, **¿fue porque una
 * instalación terminó o porque un aviso automático destrabó tres cuentas?**
 * La primera es aritmética. La segunda es que el negocio escaló.
 *
 * Esta pantalla contesta esa pregunta, y nada más.
 */

const FLECHA: Record<string, React.ReactNode> = {
  baja: <ArrowDown size={13} className="text-success" />,
  sube: <ArrowUp size={13} className="text-danger" />,
  igual: <Minus size={13} className="text-cream/30" />,
};

const ETIQUETA_DESTINO: Record<string, string> = {
  permanente: 'queda humana',
  debe_morir: 'debe morir',
  debe_encogerse: 'debe encogerse',
  crece: 'crece',
};

export default function TablaFunciones({
  estaSemana,
  semanasAnteriores,
  clientesActivos,
  hitos,
  clientes = [],
}: {
  estaSemana: ObservacionFuncion[];
  semanasAnteriores: ObservacionFuncion[][];
  clientesActivos: number;
  hitos: HitoDeAbsorcion[];
  clientes?: Array<{ id: string; nombre: string; ticket: string; minutos: number }>;
}) {
  const tabla = tablaDeFunciones({ estaSemana, semanasAnteriores, clientesActivos, hitos });
  const titular = tituloDeLaSemana(tabla);
  const deudas = deudaPorCliente(clientes).filter((d) => d.exceso > 0);
  const hayAlerta = tabla.some((t) => t.alerta);

  return (
    <div className="space-y-4">

      {/* ── LA ÚNICA PREGUNTA DE LA REUNIÓN ── */}
      <div className={`rounded-2xl border p-5 ${
        hayAlerta ? 'border-gold/35 bg-gold/[0.05]' : 'border-success/30 bg-success/[0.05]'}`}>
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-cream/50 mb-2">
          ¿Qué función bajó sus minutos, y por qué?
        </p>
        <p className="text-lg text-cream leading-snug" style={{ fontFamily: 'var(--font-display)' }}>
          {titular}
        </p>
      </div>

      {/* ── LA TABLA ── */}
      <div className="rounded-2xl border border-cream/12 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-cream/45">
                <th className="text-left font-semibold px-4 py-2.5">Función</th>
                <th className="text-right font-semibold px-2 py-2.5">Minutos</th>
                <th className="text-right font-semibold px-2 py-2.5">Por cliente</th>
                <th className="text-center font-semibold px-2 py-2.5">Cambio</th>
                <th className="text-left font-semibold px-3 py-2.5">Qué significa</th>
              </tr>
            </thead>
            <tbody>
              {tabla.map((f) => (
                <Fila key={f.funcion} f={f} />
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-cream/40 px-4 py-3 border-t border-cream/[0.07]">
          La columna que importa es la última: distingue haber trabajado menos
          de haber construido algo.
        </p>
      </div>

      {/* ── LA DEUDA POR CLIENTE ── */}
      {deudas.length > 0 && (
        <div className="rounded-2xl border border-cream/12 p-4">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-cream/50">
            Los que cuestan más de lo que su ticket permite
          </p>
          <p className="text-sm text-cream/45 mb-3">
            No son clientes pesados: son deuda técnica con nombre. Cada uno es
            una tarea para la función que absorbe.
          </p>
          <div className="space-y-2">
            {deudas.map((d) => (
              <div key={d.clienteId}
                className="border-b border-cream/[0.06] pb-2 last:border-0">
                <p className="text-sm text-cream/90">
                  {d.nombre}
                  <span className="text-cream/45 text-sm ml-2">
                    {d.minutos}′ este mes · su ticket permite {d.permitidos}′
                  </span>
                </p>
                <p className="text-sm text-cream/60 mt-0.5">{d.lectura}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Fila({ f }: { f: MinutosDeFuncion }) {
  const dir = f.cambio === null ? 'igual'
    : f.cambio < -0.1 ? 'baja'
    : f.cambio > 0.1 ? 'sube' : 'igual';

  return (
    <tr className={`border-t border-cream/[0.07] ${f.alerta ? 'bg-gold/[0.03]' : ''}`}>
      <td className="px-4 py-2.5">
        <span className="text-cream/85">{f.nombre}</span>
        <span className="block text-xs text-cream/35">
          {ETIQUETA_DESTINO[f.destino]}
        </span>
      </td>
      <td className="px-2 py-2.5 text-right text-cream/70">{f.minutos}′</td>
      <td className="px-2 py-2.5 text-right text-cream/70">{f.porCliente}′</td>
      <td className="px-2 py-2.5 text-center">
        <span className="inline-flex items-center gap-1">
          {FLECHA[dir]}
          {f.cambio !== null && dir !== 'igual' && (
            <span className="text-sm text-cream/50">
              {Math.abs(Math.round(f.cambio * 100))}%
            </span>
          )}
        </span>
      </td>
      <td className="px-3 py-2.5">
        <div className="flex items-start gap-1.5">
          {f.alerta && <AlertTriangle size={12} className="text-gold mt-0.5 shrink-0" />}
          <span className="text-sm text-cream/70 leading-relaxed">{f.lectura}</span>
        </div>
        {f.hitos.length > 0 && (
          <p className="text-sm text-success/70 mt-1">
            {f.hitos.map((h) => h.que).join(' · ')}
          </p>
        )}
      </td>
    </tr>
  );
}
