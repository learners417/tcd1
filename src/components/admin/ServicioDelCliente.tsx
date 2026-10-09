/**
 * EL SERVICIO QUE CONTRATÓ, Y QUÉ LE FALTA.
 *
 * ═══ POR QUÉ EXISTE ESTA PANTALLA ═══
 *
 * Hasta hoy el escalón de servicio se adivinaba a partir del plan de acceso:
 * quien había pagado $497 por entrar a la app figuraba como si tuviera
 * contratada la instalación de $5.000. Nadie lo había marcado nunca, porque no
 * había dónde.
 *
 * Acá se marca, y queda registrado quién lo marcó. Es una decisión de plata:
 * de esto depende cuánto trabajo le debe el equipo a esta persona.
 *
 * Debajo, el cuadro de los ítems que ese servicio incluye, con los tildes que
 * el equipo ya cargó en la matriz —los mismos, no una copia— así que tildar acá
 * o allá es lo mismo.
 */
import { useCallback, useEffect, useState } from 'react';
import { Mountain } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { TICKETS, CIMA, servicioDe, type Ticket } from '../../lib/cuadroTickets';
import { cierreDeLaVentana, type TipoDeAcceso } from '../../lib/ventanaDeAcceso';
import { loadAllChecks, setCheck, applyToggle, type ChecksByCliente } from '../../lib/preactivacionCheck';
import CuadroDelCliente from './CuadroDelCliente';

const ESCALONES: Ticket[] = ['base', 'ascenso', 'instalacion'];

interface Props {
  clienteId: string;
  nombre: string;
  /** Lo que dice la base hoy. */
  servicio: string | null | undefined;
  cima?: boolean | null;
  /** Treinta días, noventa, o en cuotas. */
  acceso?: string | null;
  /** El lunes de arranque, para calcular hasta cuándo llega. */
  inicio?: string | null;
  adminId: string;
  /** Para que la ficha se entere de que cambió. */
  onCambio?: (servicio: Ticket, cima: boolean) => void;
}

const VENTANAS: Array<{ id: TipoDeAcceso; label: string }> = [
  { id: 'noventa', label: '90 días' },
  { id: 'treinta', label: '30 días' },
  { id: 'cuotas', label: 'En cuotas' },
];

export default function ServicioDelCliente({
  clienteId, nombre, servicio, cima, acceso, inicio, adminId, onCambio,
}: Props) {
  const [elegido, setElegido] = useState<Ticket>(servicioDe(servicio));
  const [conCima, setConCima] = useState<boolean>(cima === true);
  const [ventana, setVentana] = useState<TipoDeAcceso>(
    acceso === 'treinta' || acceso === 'cuotas' ? acceso : 'noventa',
  );
  const [guardando, setGuardando] = useState(false);
  const [falla, setFalla] = useState<string | null>(null);
  const [checks, setChecks] = useState<ChecksByCliente>(new Map());

  // La base manda: si alguien más lo cambió, esto lo refleja.
  useEffect(() => { setElegido(servicioDe(servicio)); }, [servicio]);
  useEffect(() => { setConCima(cima === true); }, [cima]);
  useEffect(() => {
    setVentana(acceso === 'treinta' || acceso === 'cuotas' ? acceso : 'noventa');
  }, [acceso]);

  const arranque = inicio ?? new Date().toISOString().slice(0, 10);
  const cierra = cierreDeLaVentana({ tipo: ventana, inicio: arranque });

  const guardarVentana = useCallback(async (nueva: TipoDeAcceso) => {
    const antes = ventana;
    setVentana(nueva);
    setGuardando(true);
    setFalla(null);
    try {
      if (!supabase) throw new Error('sin conexión');
      const { error } = await supabase.rpc('marcar_acceso', {
        p_cliente: clienteId,
        p_tipo: nueva,
        p_hasta: cierreDeLaVentana({ tipo: nueva, inicio: arranque }),
      });
      if (error) throw new Error(error.message);
    } catch {
      setVentana(antes);
      setFalla('No se pudo guardar la ventana de acceso. Si sigue, falta correr la migración del servicio contratado.');
    } finally {
      setGuardando(false);
    }
  }, [clienteId, ventana, arranque]);

  useEffect(() => {
    let vivo = true;
    void loadAllChecks().then((data) => { if (vivo) setChecks(data); });
    return () => { vivo = false; };
  }, []);

  const guardar = useCallback(async (nuevo: Ticket, nuevaCima: boolean) => {
    const antesServicio = elegido;
    const antesCima = conCima;
    setElegido(nuevo);
    setConCima(nuevaCima);
    setGuardando(true);
    setFalla(null);
    try {
      if (!supabase) throw new Error('sin conexión');
      const { error } = await supabase.rpc('marcar_servicio', {
        p_cliente: clienteId, p_servicio: nuevo, p_cima: nuevaCima,
      });
      if (error) throw new Error(error.message);
      onCambio?.(nuevo, nuevaCima);
    } catch (err) {
      // Volver atrás en pantalla: dejarlo marcado sin que se haya guardado es
      // peor que no poder marcarlo, porque nadie lo vuelve a mirar.
      setElegido(antesServicio);
      setConCima(antesCima);
      setFalla(
        err instanceof Error && /marcar el servicio/.test(err.message)
          ? 'Tu usuario no tiene permiso para marcar el servicio.'
          : 'No se pudo guardar. Reintenta — si sigue, falta correr la migración del servicio contratado.',
      );
    } finally {
      setGuardando(false);
    }
  }, [clienteId, elegido, conCima, onCambio]);

  const marcarItem = useCallback(async (stepId: string) => {
    const hechos = checks.get(clienteId) ?? new Set<string>();
    const on = !hechos.has(stepId);
    const antes = checks;
    setChecks(applyToggle(checks, clienteId, stepId, on));
    try {
      await setCheck(clienteId, stepId, on, adminId);
    } catch {
      setChecks(antes);
    }
  }, [checks, clienteId, adminId]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-cream/12 p-5">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-cream/50 mb-1">
          Qué contrató {nombre}
        </p>
        <p className="text-sm text-cream/60 mb-4 leading-relaxed">
          Esto decide cuánto trabajo le debe el equipo. No se deduce de su plan
          de acceso a la app: se marca acá, a mano.
        </p>

        <div className="grid gap-2 sm:grid-cols-3">
          {ESCALONES.map((t) => {
            const def = TICKETS[t];
            const activo = elegido === t;
            return (
              <button key={t} type="button" disabled={guardando}
                onClick={() => { if (!activo) void guardar(t, conCima); }}
                className={`min-h-[44px] rounded-xl border px-4 py-3 text-left transition-colors disabled:opacity-50 ${
                  activo
                    ? 'border-gold/50 bg-gold/10'
                    : 'border-cream/10 bg-surface/30 hover:border-cream/25'
                }`}>
                <p className={`text-[17px] font-bold ${activo ? 'text-gold' : 'text-cream/80'}`}>
                  {def.nombre}
                </p>
                <p className="text-sm text-cream/55">{def.precio.toLocaleString('es')} USD</p>
              </button>
            );
          })}
        </div>

        <button type="button" disabled={guardando}
          onClick={() => void guardar(elegido, !conCima)}
          className={`mt-3 min-h-[44px] w-full rounded-xl border px-4 flex items-center justify-center gap-2 text-[17px] font-bold transition-colors disabled:opacity-50 ${
            conCima
              ? 'border-gold/50 bg-gold/10 text-gold'
              : 'border-cream/10 bg-surface/30 text-cream/60 hover:border-cream/25'
          }`}>
          <Mountain className="w-5 h-5" />
          {conCima ? `Con ${CIMA.nombre}` : `Sumar ${CIMA.nombre}`}
          <span className="text-sm font-normal text-cream/50">
            · {CIMA.dias} días · {CIMA.precio.toLocaleString('es')} USD
          </span>
        </button>

        <p className="text-sm text-cream/55 mt-3 leading-relaxed">{TICKETS[elegido].criterio}</p>

        {/* Hasta cuándo tiene la app. Hasta hoy esto solo se podía poner a mano
            en la base, así que casi nadie la tenía cargada. */}
        <div className="mt-5 border-t border-cream/10 pt-4">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-cream/50 mb-3">
            Hasta cuándo tiene la app
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {VENTANAS.map((v) => {
              const activa = ventana === v.id;
              return (
                <button key={v.id} type="button" disabled={guardando}
                  onClick={() => { if (!activa) void guardarVentana(v.id); }}
                  className={`min-h-[44px] rounded-xl border px-4 text-[17px] font-bold transition-colors disabled:opacity-50 ${
                    activa ? 'border-gold/50 bg-gold/10 text-gold'
                           : 'border-cream/10 bg-surface/30 text-cream/60 hover:border-cream/25'
                  }`}>
                  {v.label}
                </button>
              );
            })}
          </div>
          <p className="text-sm text-cream/55 mt-3">
            Arrancó el {arranque} y su acceso cierra el{' '}
            <strong className="text-cream/80">{cierra}</strong>.
            {ventana === 'cuotas' ? ' Cada cuota se carga aparte.' : ''}
          </p>
        </div>

        {falla ? <p className="text-sm text-danger mt-2">{falla}</p> : null}
      </div>

      <CuadroDelCliente
        servicio={elegido}
        hechos={checks.get(clienteId) ?? new Set<string>()}
        onMarcar={marcarItem}
      />
    </div>
  );
}
