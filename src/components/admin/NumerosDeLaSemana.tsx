import { useCallback, useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import {
  hastaDondePuedoOpinar, completitud, firmaDe, NOMBRE_CAMPO, SE_ESPERA_DE,
  type CargaSemanal, type Campo,
} from '../../lib/cargaCompartida';
import { db } from '../../lib/supabase';
import { semanaISO } from '../../lib/bitacoraCampana';
import { mensajeDeFalla } from '../../lib/conexion';

/**
 * LOS NÚMEROS DE LA SEMANA — un formulario, dos puertas.
 *
 * ═══ LO QUE ARREGLA ═══
 *
 * Había dos tableros cargando lo mismo: el cliente en Campañas y el equipo en
 * la Mesa de plata. No se enteraban uno del otro. Y si ninguno cargaba, **la
 * cola quedaba ciega** — no mostraba menos, mostraba que todo estaba bien.
 *
 * Acá cada campo dice **quién lo cargó y cuándo**. El que entra ve qué falta y
 * lo completa. No hay reglas de quién carga qué, no hay que coordinar, no hay
 * que preguntar: **lo que falta se ve.**
 */

const ORDEN: Campo[] = [
  'gasto', 'impresiones', 'alcance', 'comentarios',
  'conversaciones', 'agendas', 'llamadasTomadas',
  'ofertasPresentadas', 'ventas', 'facturado', 'cobrado',
];

export default function NumerosDeLaSemana({
  clienteId,
  nombreCliente,
  quienCarga,
  nombreQuienCarga,
}: {
  clienteId: string;
  nombreCliente: string;
  quienCarga: string;
  nombreQuienCarga: string;
}) {
  const [carga, setCarga] = useState<CargaSemanal>({});
  const [cargando, setCargando] = useState(true);
  const [problema, setProblema] = useState<string | null>(null);
  const [guardando, setGuardando] = useState<Campo | null>(null);

  const traer = useCallback(async () => {
    try {
      const { data, error } = await db().rpc('carga_de_semana', {
        p_cliente: clienteId, p_semana: semanaISO(),
      });
      if (error) throw new Error(error.message);
      const c: CargaSemanal = {};
      for (const f of (data ?? []) as unknown as Array<{
        campo: string; valor: number; por_quien: string;
        nombre_quien: string | null; cargado_en: string;
      }>) {
        c[f.campo as Campo] = {
          valor: Number(f.valor), porQuien: f.por_quien,
          nombre: f.nombre_quien ?? 'alguien', cuando: f.cargado_en,
        };
      }
      setCarga(c);
      setProblema(null);
    } catch (err) {
      setProblema(mensajeDeFalla(err, 'traer los números'));
    } finally {
      setCargando(false);
    }
  }, [clienteId]);

  useEffect(() => {
    let vivo = true;
    void (async () => { if (vivo) await traer(); })();
    return () => { vivo = false; };
  }, [traer]);

  const guardar = async (campo: Campo, valor: number) => {
    setGuardando(campo);
    try {
      const { error } = await db().rpc('guardar_campo', {
        p_cliente: clienteId, p_semana: semanaISO(), p_campo: campo,
        p_valor: valor, p_quien: quienCarga, p_nombre: nombreQuienCarga,
      });
      if (error) throw new Error(error.message);
      setCarga((c) => ({
        ...c,
        [campo]: {
          valor, porQuien: quienCarga,
          nombre: nombreQuienCarga, cuando: new Date().toISOString(),
        },
      }));
      setProblema(null);
    } catch (err) {
      // Se dice: creer que se guardó cuando no se guardó es peor que un error.
      setProblema(`${mensajeDeFalla(err, 'guardar')} Ese número no quedó.`);
    } finally {
      setGuardando(null);
    }
  };

  if (cargando) {
    return <p className="text-sm text-cream/55">Trayendo los números de {nombreCliente}…</p>;
  }

  const alcance = hastaDondePuedoOpinar(carga);
  const comp = completitud(carga);

  return (
    <div className="space-y-4">

      {/* ── HASTA DÓNDE SE PUEDE OPINAR ── */}
      <div className={`rounded-2xl border p-4 ${
        alcance.hasta === 0 ? 'border-gold/35 bg-gold/[0.05]'
        : alcance.faltan.length === 0 ? 'border-success/30 bg-success/[0.05]'
        : 'border-cream/12'}`}>
        <p className="text-base text-cream/90 leading-snug">{alcance.frase}</p>
        <p className="text-sm text-cream/45 mt-1.5">
          {comp.cargados} de {comp.total} cargados
          {comp.faltanDelEquipo.length > 0 && ` · ${comp.faltanDelEquipo.length} los carga el equipo`}
        </p>
      </div>

      {problema && (
        <div className="rounded-xl border border-danger/40 bg-danger/[0.06] p-3">
          <p className="text-sm text-cream/85">{problema}</p>
        </div>
      )}

      {/* ── LOS CAMPOS, CON SU FIRMA ── */}
      <div className="rounded-2xl border border-cream/12 divide-y divide-cream/[0.07]">
        {ORDEN.map((campo) => {
          const v = carga[campo];
          return (
            <div key={campo} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-base text-cream/85 capitalize">
                  {NOMBRE_CAMPO[campo]}
                </p>
                {/* Quién lo cargó. Es lo que hace que no haya que coordinar. */}
                <p className={`text-sm mt-0.5 ${
                  v ? 'text-cream/40' : 'text-gold/70'}`}>
                  {firmaDe(v)}
                  {!v && SE_ESPERA_DE[campo] === 'equipo' && ' · lo carga el equipo'}
                  {!v && SE_ESPERA_DE[campo] === 'solo' && ' · entra solo'}
                </p>
              </div>

              <input
                type="number"
                inputMode="decimal"
                defaultValue={v?.valor ?? ''}
                placeholder="—"
                onBlur={(e) => {
                  const n = Number(e.target.value);
                  if (e.target.value !== '' && Number.isFinite(n) && n !== v?.valor) {
                    void guardar(campo, n);
                  }
                }}
                className="w-24 shrink-0 bg-surface/40 border border-cream/15 rounded-xl
                  px-3 py-2 text-base text-cream text-right"
              />

              {guardando === campo && (
                <span className="text-sm text-cream/40 shrink-0">…</span>
              )}
              {v && guardando !== campo && (
                <Check size={16} className="text-success/60 shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      <p className="text-sm text-cream/35 text-center">
        Se guarda solo al salir de cada campo. Cualquiera puede cargar cualquiera:
        lo que dice arriba es de quién se espera, no quién puede.
      </p>
    </div>
  );
}
