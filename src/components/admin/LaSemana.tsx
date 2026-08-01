import { useMemo } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { armarMarcador, comoVaElCirculo, minutosDe, type Jornada, type Marcador } from '../../lib/jornada';
import { agruparTrabas, type CierreDelDia } from '../../lib/cierreDelDia';
import { puedeVer, type Rol } from '../../lib/permisos';
import TablaFunciones from './TablaFunciones';
import { MINUTOS_POR, type ObservacionFuncion, type HitoDeAbsorcion } from '../../lib/funciones';
import Termino from '../Termino';

/**
 * LA SEMANA — la reunión, ya preparada.
 *
 * Se abre una vez por semana, el mismo día y a la misma hora. Nadie prepara
 * nada: la app llega con la agenda armada.
 *
 * ═══ EL ORDEN NO ES DECORATIVO ═══
 *
 *   1. **El marcador** — un solo objetivo: que todos los clientes vendan.
 *   2. **Cómo va el círculo** — venden más *y* cuestan menos trabajo, o no.
 *   3. **Las trabas** — lo repetido primero, porque es lo que hay que
 *      arreglar de raíz aunque suene menos urgente que lo de ayer.
 *   4. **Las cuentas frenadas** — ordenadas por dinero en riesgo.
 *
 * Lo que ve cada uno depende de su rol. El dinero de TCD y el rendimiento
 * del equipo NO se dibujan para nadie que no sea dirección — no en gris, no
 * con candado: no se dibujan.
 */

interface CuentaFrenada {
  clienteId: string;
  nombre: string;
  cuello: string;
  semanasIgual: number;
  enRiesgo: number;
}

export default function LaSemana({
  rol,
  jornadas,
  clientesActivos,
  clientesQueVendieron,
  cuentasFrenadas,
  facturadoClientes,
  marcadorAnterior = null,
  hitos = [],
  clientesConMinutos = [],
}: {
  rol: Rol;
  jornadas: Jornada[];
  clientesActivos: number;
  clientesQueVendieron: number;
  cuentasFrenadas: CuentaFrenada[];
  facturadoClientes: number;
  marcadorAnterior?: Marcador | null;
  /** Lo que se declaró que dejó de necesitar humano. */
  hitos?: HitoDeAbsorcion[];
  clientesConMinutos?: Array<{ id: string; nombre: string; ticket: string; minutos: number }>;
}) {
  const cierres: CierreDelDia[] = useMemo(
    () => jornadas.filter((j) => j.fin).map((j) => ({
      personaId: j.personaId,
      fecha: j.dia,
      atendidos: j.atendidos,
      traba: j.traba,
      trabaCliente: j.trabaCliente,
      minutos: minutosDe(j),
    })),
    [jornadas],
  );

  const trabas = useMemo(() => agruparTrabas(cierres), [cierres]);
  const delSistema = trabas.filter((t) => t.esDelSistema).length;

  const marcador = useMemo(() => armarMarcador({
    clientesActivos,
    clientesQueVendieron,
    clientesEnRojo: cuentasFrenadas.length,
    facturadoClientes,
    minutosTotales: cierres.reduce((t, c) => t + c.minutos, 0),
    trabasDelSistema: delSistema,
  }), [clientesActivos, clientesQueVendieron, cuentasFrenadas.length,
       facturadoClientes, cierres, delSistema]);

  const circulo = comoVaElCirculo(marcador, marcadorAnterior);

  // El dinero de TCD y el costo por cliente solo para dirección.
  const veDinero = puedeVer(rol, 'dinero_tcd');
  const veRendimiento = puedeVer(rol, 'rendimiento_equipo');

  return (
    <div className="max-w-4xl mx-auto space-y-4">

      {/* ── 1 · EL TITULAR ── */}
      <div className={`rounded-2xl border p-6 ${
        marcador.trabasDelSistema > 0 ? 'border-danger/40 bg-danger/[0.06]'
        : marcador.enRojo > 0 ? 'border-gold/35 bg-gold/[0.05]'
        : 'border-success/30 bg-success/[0.05]'}`}>
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-cream/50 mb-2">
          Esta semana
        </p>
        <h3 className="text-2xl text-cream leading-snug" style={{ fontFamily: 'var(--font-display)' }}>
          {marcador.titular}
        </h3>
      </div>

      {/* ── LA TABLA DE FUNCIONES ──
          Solo para quien ve el rendimiento del equipo: es la pantalla que
          dice si el negocio escaló o si simplemente hubo menos trabajo. */}
      {veRendimiento && (
        <TablaFunciones
          estaSemana={cierres.flatMap((c): ObservacionFuncion[] => [
            { funcion: MINUTOS_POR.excepcion.funcion, minutos: c.minutos },
          ])}
          semanasAnteriores={[]}
          clientesActivos={clientesActivos}
          hitos={hitos}
          clientes={clientesConMinutos}
        />
      )}

      {/* ── 2 · EL MARCADOR ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Numero
          valor={`${marcador.pctVendiendo}%`}
          etiqueta="Clientes vendiendo"
          sub={`${marcador.vendieron} de ${marcador.activos}`}
          destacado />
        <Numero
          valor={String(marcador.enRojo)}
          etiqueta="Frenados"
          sub={marcador.enRojo === 1 ? 'cuenta' : 'cuentas'} />
        {veDinero && (
          <Numero
            valor={`$${marcador.facturadoClientes.toLocaleString()}`}
            etiqueta="Facturaron"
            sub="entre todos" />
        )}
        {veRendimiento && (
          <Numero
            valor={`${marcador.minutosPorCliente}′`}
            etiqueta="Humano por cliente"
            sub="tiene que bajar" />
        )}
      </div>

      {/* ── 3 · CÓMO VA EL CÍRCULO ── */}
      {veRendimiento && (
        <div className={`rounded-2xl border p-4 ${
          circulo.sano ? 'border-success/25 bg-success/[0.04]' : 'border-gold/30 bg-gold/[0.04]'}`}>
          <div className="flex items-start gap-2.5">
            <span className={`mt-0.5 shrink-0 ${circulo.sano ? 'text-success' : 'text-gold'}`}>
              {circulo.sano ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
            </span>
            <p className="text-sm text-cream/85 leading-relaxed">{circulo.texto}</p>
          </div>
        </div>
      )}

      {/* ── 4 · LAS TRABAS ── */}
      <div className="rounded-2xl border border-cream/12 p-4">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-cream/50">
          Lo que trabó — <Termino p="traba">qué es esto</Termino>
        </p>
        <p className="text-sm text-cream/45 mb-3">
          Lo que se repite va primero: es lo que hay que arreglar de raíz,
          aunque suene menos urgente que lo de ayer.
        </p>

        {trabas.length === 0 ? (
          <p className="text-sm text-cream/45">
            Nadie anotó ninguna traba esta semana.
          </p>
        ) : (
          <div className="space-y-2.5">
            {trabas.map((t) => (
              <div key={t.texto}
                className={`rounded-xl border p-3 ${
                  t.esDelSistema ? 'border-danger/35 bg-danger/[0.05]' : 'border-cream/12'}`}>
                <div className="flex items-start gap-2.5">
                  {t.esDelSistema && (
                    <AlertTriangle size={14} className="text-danger mt-0.5 shrink-0" />
                  )}
                  <div>
                    <p className="text-sm text-cream/90">{t.texto}</p>
                    <p className="text-sm text-cream/50 mt-0.5">
                      {t.veces === 1 ? 'una vez' : `${t.veces} veces`}
                      {t.clientes.length > 0 && ` · ${t.clientes.length} ${t.clientes.length === 1 ? 'cliente' : 'clientes'}`}
                    </p>
                    {t.esDelSistema && (
                      <p className="text-sm text-danger/90 mt-1.5">
                        Esta ya no se arregla insistiendo. Va a desarrollo.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 5 · LAS CUENTAS FRENADAS ── */}
      {cuentasFrenadas.length > 0 && (
        <div className="rounded-2xl border border-cream/12 p-4">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-cream/50 mb-3">
            Las cuentas frenadas
          </p>
          <div className="space-y-2">
            {cuentasFrenadas.map((c) => (
              <div key={c.clienteId}
                className="flex items-baseline justify-between gap-3 border-b border-cream/[0.06] pb-2 last:border-0">
                <div className="min-w-0">
                  <p className="text-sm text-cream/90">{c.nombre}</p>
                  <p className="text-sm text-cream/50">
                    {c.cuello}
                    {c.semanasIgual > 1 && (
                      <span className="text-danger ml-1.5">· {c.semanasIgual}ª semana igual</span>
                    )}
                  </p>
                </div>
                {veDinero && (
                  <span className="text-sm text-cream/40 shrink-0">
                    ${c.enRiesgo.toLocaleString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-sm text-cream/30 text-center">
        Lo que se decida acá queda escrito en Decisiones. El criterio que no se
        escribe se vuelve a discutir.
      </p>
    </div>
  );
}

function Numero(
  { valor, etiqueta, sub, destacado }: {
    valor: string; etiqueta: string; sub: string; destacado?: boolean;
  },
) {
  return (
    <div className={`rounded-2xl border p-4 text-center ${
      destacado ? 'border-gold/35 bg-gold/[0.05]' : 'border-cream/12'}`}>
      <p className={`text-2xl ${destacado ? 'text-gold' : 'text-cream'}`}
        style={{ fontFamily: 'var(--font-display)' }}>
        {valor}
      </p>
      <p className="text-xs uppercase tracking-[0.2em] text-cream/45 mt-1">{etiqueta}</p>
      <p className="text-xs text-cream/30">{sub}</p>
    </div>
  );
}
