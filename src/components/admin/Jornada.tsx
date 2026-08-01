import { useCallback, useEffect, useState } from 'react';
import { LogIn, LogOut, Check } from 'lucide-react';
import {
  iniciarJornada, cerrarJornada, minutosDe, estaAbierta, cuentasPisadas,
  type Jornada,
} from '../../lib/jornada';
import { ROLES, type Rol } from '../../lib/permisos';
import { calcularCarga } from '../../lib/roles';
import type { ItemCola } from '../../lib/colaExcepciones';
import { abrirJornada, cerrarJornadaEnBase, jornadaDeHoy } from '../../lib/jornadaStorage';
import { mensajeDeFalla } from '../../lib/conexion';
import Termino from '../Termino';

/**
 * HOY — la única pantalla que se abre todos los días.
 *
 * Tres partes, en el orden en que pasa el día:
 *
 *   1. **Entrada** — en qué vas a trabajar. Sirve para una sola cosa, pero
 *      importante: que dos personas no atiendan la misma cuenta sin saberlo.
 *   2. **Tu cola** — lo que hay que hacer, con la acción escrita.
 *   3. **Salida** — qué cerraste y **qué te trabó**.
 *
 * La traba es lo que más vale de todo esto. Si la misma aparece tres veces,
 * deja de ser un problema de esfuerzo y pasa a ser trabajo de desarrollo.
 */

const KEY = 'tcd_jornada_v1';

export default function Jornada({
  personaId,
  rol,
  items,
  jornadasDelEquipo = [],
  children,
}: {
  personaId: string;
  rol: Rol;
  items: ItemCola[];
  /** Las jornadas abiertas de los demás, para avisar si se pisan. */
  jornadasDelEquipo?: Jornada[];
  /** La cola, que se dibuja en el medio. */
  children?: React.ReactNode;
}) {
  /**
   * Arranca de lo que hay en el navegador para que la pantalla no parpadee,
   * y enseguida se corrige con lo que dice la base. La base manda: si abrió
   * el día desde el teléfono y ahora entra desde la computadora, tiene que
   * ver su día abierto, no uno nuevo.
   */
  const [jornada, setJornada] = useState<Jornada | null>(() => {
    try {
      const j = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Jornada | null;
      return j && j.dia === new Date().toISOString().slice(0, 10) ? j : null;
    } catch { return null; }
  });
  const [problema, setProblema] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [elegidos, setElegidos] = useState<Set<string>>(new Set());
  const [cerrando, setCerrando] = useState(false);
  const [traba, setTraba] = useState('');
  const [trabaCliente, setTrabaCliente] = useState('');

  const guardarLocal = useCallback((j: Jornada | null) => {
    setJornada(j);
    try {
      if (j) localStorage.setItem(KEY, JSON.stringify(j));
      else localStorage.removeItem(KEY);
    } catch { /* noop */ }
  }, []);

  // La base manda sobre el navegador.
  useEffect(() => {
    let vivo = true;
    void (async () => {
      try {
        const dela = await jornadaDeHoy(personaId);
        if (vivo && dela) guardarLocal(dela);
      } catch { /* sin conexión se sigue con lo local */ }
    })();
    return () => { vivo = false; };
  }, [personaId, guardarLocal]);

  const empezar = async () => {
    setGuardando(true);
    setProblema(null);
    const local = iniciarJornada(personaId, [...elegidos]);
    // Se guarda local primero: si falla la red, el día igual arranca.
    guardarLocal(local);
    try {
      await abrirJornada(personaId, [...elegidos]);
    } catch (err) {
      setProblema(`${mensajeDeFalla(err, 'abrir el día')} Tu día arrancó igual.`);
    } finally {
      setGuardando(false);
    }
  };

  const cerrar = async () => {
    if (!jornada) return;
    setGuardando(true);
    setProblema(null);
    const datos = {
      cerradas: [],
      atendidos: [...elegidos],
      traba: traba.trim() || undefined,
      trabaCliente: trabaCliente || undefined,
    };
    guardarLocal(cerrarJornada(jornada, datos));
    try {
      await cerrarJornadaEnBase(personaId, datos);
    } catch (err) {
      // La traba es lo más valioso del cierre: si no subió, hay que decirlo.
      setProblema(
        `${mensajeDeFalla(err, 'cerrar el día')}${
          datos.traba ? ' Tu traba no llegó al equipo: vuelve a cerrar cuando tengas señal.' : ''}`,
      );
    } finally {
      setGuardando(false);
    }
  };

  const abierta = jornada !== null && estaAbierta(jornada);
  const cerrada = jornada !== null && !!jornada.fin;

  const pisadas = cuentasPisadas([
    ...jornadasDelEquipo,
    ...(abierta && jornada ? [jornada] : []),
  ]);

  const carga = calcularCarga(rol as never, {
    excepciones: items.filter((i) => i.quien !== 'la app').length,
    sesiones: 0,
    enInstalacion: 0,
  });

  // ── ENTRADA ──────────────────────────────────────────────────────────────
  if (!jornada) {
    const conNombre = items.filter((i) => i.quien !== 'la app');
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="rounded-2xl border border-gold/30 bg-gold/[0.05] p-6">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-gold/70 mb-2">
            Empezar el día
          </p>
          <h3 className="text-2xl text-cream leading-snug" style={{ fontFamily: 'var(--font-display)' }}>
            {conNombre.length === 0
              ? 'Hoy no hay cuentas que necesiten que entres.'
              : conNombre.length === 1
                ? 'Hay una cuenta esperándote.'
                : `Hay ${conNombre.length} cuentas esperándote.`}
          </h3>
          <p className="text-sm text-cream/60 mt-1">
            Marca en cuáles vas a trabajar. Sirve para que nadie atienda dos veces lo mismo.
          </p>
        </div>

        {conNombre.length > 0 && (
          <div className="rounded-2xl border border-cream/12 p-4 space-y-2">
            {conNombre.map((i) => (
              <button key={i.clienteId}
                onClick={() => setElegidos((e) => {
                  const n = new Set(e);
                  if (n.has(i.clienteId)) n.delete(i.clienteId); else n.add(i.clienteId);
                  return n;
                })}
                className={`w-full text-left flex items-start gap-3 rounded-xl border p-3 transition ${
                  elegidos.has(i.clienteId)
                    ? 'border-gold/45 bg-gold/[0.06]' : 'border-cream/12'}`}>
                <span className={`mt-0.5 shrink-0 ${elegidos.has(i.clienteId) ? 'text-gold' : 'text-cream/25'}`}>
                  <Check size={14} />
                </span>
                <span>
                  <span className="text-sm text-cream/90 block">{i.nombre}</span>
                  <span className="text-sm text-cream/50">{i.accion}</span>
                </span>
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => void empezar()} disabled={guardando}
          className="w-full btn-primary py-3 rounded-xl text-sm font-bold disabled:opacity-50">
          <LogIn size={14} className="inline mb-0.5 mr-1.5" />
          {guardando ? 'Abriendo…' : 'Empezar'}
        </button>
        {problema && <p className="text-sm text-danger/90">{problema}</p>}
      </div>
    );
  }

  // ── CERRADA ──────────────────────────────────────────────────────────────
  if (cerrada) {
    const min = minutosDe(jornada);
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="rounded-2xl border border-success/30 bg-success/[0.05] p-6">
          <p className="text-lg text-cream" style={{ fontFamily: 'var(--font-display)' }}>
            Día cerrado.
          </p>
          <p className="text-sm text-cream/70 mt-1">
            {Math.floor(min / 60)} h {min % 60} min · {jornada.atendidos.length}{' '}
            {jornada.atendidos.length === 1 ? 'cuenta atendida' : 'cuentas atendidas'}
            {jornada.traba && ' · una traba anotada'}
          </p>
          {jornada.traba && (
            <p className="text-sm text-cream/55 mt-2">
              Lo que anotaste se mira el viernes, junto con lo de todos.
            </p>
          )}
        </div>
        <button onClick={() => guardarLocal(null)}
          className="text-sm text-cream/45 underline underline-offset-2">
          Volver a abrir el día
        </button>
      </div>
    );
  }

  // ── TRABAJANDO ───────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto space-y-4">

      {pisadas.length > 0 && (
        <div className="rounded-2xl border border-gold/35 bg-gold/[0.05] p-4">
          <p className="text-sm text-cream/85">
            {pisadas.length === 1 ? 'Una cuenta' : `${pisadas.length} cuentas`} las está
            atendiendo otra persona ahora mismo. Hablen antes de escribirle al cliente.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-cream/50">{carga.lectura}</p>
        <button onClick={() => setCerrando(true)}
          className="flex items-center gap-1.5 text-sm font-bold text-gold hover:text-goldhi shrink-0">
          <LogOut size={12} /> Cerrar el día
        </button>
      </div>

      {/* La cola va en el medio */}
      {children}

      {/* ── SALIDA ── */}
      {cerrando && (
        <div className="rounded-2xl border border-gold/30 bg-gold/[0.05] p-5 space-y-3">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-gold/70">
            Cerrar el día
          </p>

          <div>
            <p className="text-sm text-cream/85 mb-2">¿Qué cuentas atendiste?</p>
            <div className="space-y-1.5">
              {items.filter((i) => i.quien !== 'la app').map((i) => (
                <button key={i.clienteId}
                  onClick={() => setElegidos((e) => {
                    const n = new Set(e);
                    if (n.has(i.clienteId)) n.delete(i.clienteId); else n.add(i.clienteId);
                    return n;
                  })}
                  className={`w-full text-left flex items-center gap-2 rounded-lg border p-2 text-sm ${
                    elegidos.has(i.clienteId)
                      ? 'border-success/40 bg-success/[0.06] text-cream/90'
                      : 'border-cream/12 text-cream/60'}`}>
                  <Check size={12} className={elegidos.has(i.clienteId) ? 'text-success' : 'text-cream/25'} />
                  {i.nombre}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-cream/85 mb-1">¿Alguna <Termino p="traba" />?</p>
            <p className="text-sm text-cream/45 mb-2">
              Una línea. No se discute ahora: se mira el viernes con todo lo demás.
              Si algo se repite tres veces, deja de ser cuestión de insistir.
            </p>
            <input value={traba} onChange={(e) => setTraba(e.target.value)}
              placeholder="Ej: no le llega el DM automático al cliente"
              className="w-full bg-surface/40 border border-cream/15 rounded-xl px-3 py-2 text-sm text-cream" />
            {traba.trim().length > 4 && (
              <select value={trabaCliente} onChange={(e) => setTrabaCliente(e.target.value)}
                className="w-full bg-surface/40 border border-cream/15 rounded-xl px-3 py-2 text-sm text-cream mt-2">
                <option value="">¿De qué cliente? (opcional)</option>
                {items.map((i) => (
                  <option key={i.clienteId} value={i.clienteId}>{i.nombre}</option>
                ))}
              </select>
            )}
          </div>

          <div className="flex gap-2">
            <button onClick={() => setCerrando(false)}
              className="px-4 py-2.5 rounded-xl border border-cream/15 text-cream/70 text-sm">
              Todavía no
            </button>
            <button
              onClick={() => void cerrar()} disabled={guardando}
              className="flex-1 btn-primary py-2.5 rounded-xl text-sm font-bold disabled:opacity-50">
              {guardando ? 'Cerrando…' : 'Cerrar'}
            </button>
          </div>
        </div>
      )}

      <p className="text-sm text-cream/30 text-center">
        {ROLES[rol].nombre} · empezaste a las{' '}
        {new Date(jornada.inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  );
}
