/**
 * HABILITAR MIGRACIONES — el equipo da la llave, el cliente hace el trabajo.
 *
 * El asistente de migración del Admin sigue ahí para los casos en que haga
 * falta hacerla por alguien. Esto es lo otro: encender la llave y que se la
 * haga él.
 *
 * ═══ LA COLUMNA QUE IMPORTA ═══
 *
 * «Piezas» es con cuántas de las cinco que una campaña necesita quedó. Alguien
 * marcado como migrado con dos de cinco no está migrado: llega a Campañas y
 * sus tres anuncios salen de un avatar vacío, una oferta vacía y un método sin
 * nombre. Y eso no se nota hasta tres semanas después, cuando la campaña ya
 * gastó y no se puede saber por qué no funcionó.
 *
 * Por eso la pantalla no dice «migrado: sí». Dice con cuántas quedó.
 */
import { useEffect, useState } from 'react';
import { Loader2, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import {
  estadoDeMigraciones, habilitarMigracion,
  type EstadoDeMigracionCliente,
} from '../../lib/migracionDatos';
import { CAMPOS_PARA_CAMPANAS } from '../../lib/migracionDelCliente';

export default function HabilitarMigraciones() {
  const [filas, setFilas] = useState<EstadoDeMigracionCliente[] | null>(null);
  const [tocando, setTocando] = useState<string | null>(null);
  const [falla, setFalla] = useState<string | null>(null);

  const cargar = () => {
    void estadoDeMigraciones()
      .then((x) => { setFilas(x); setFalla(null); })
      .catch((e: unknown) => {
        setFilas([]);
        // Se dice: una lista vacía se lee como «no hay clientes», que es lo
        // contrario de lo que pasa cuando la consulta falló.
        setFalla(e instanceof Error ? e.message : 'No pude traer el estado.');
      });
  };
  useEffect(cargar, []);

  const tocar = async (f: EstadoDeMigracionCliente) => {
    setTocando(f.cliente_id);
    try {
      await habilitarMigracion(f.cliente_id, !f.habilitada);
      cargar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo cambiar.');
    } finally {
      setTocando(null);
    }
  };

  if (filas === null) {
    return (
      <section className="rounded-2xl border border-cream/12 p-5">
        <p className="text-[17px] text-cream/70 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Mirando quién puede migrarse…
        </p>
      </section>
    );
  }

  const habilitados = filas.filter((f) => f.habilitada && !f.migrado_en).length;
  const total = CAMPOS_PARA_CAMPANAS.length;

  return (
    <section className="rounded-2xl border border-gold/25 bg-espresso/40 p-5">
      <h3 className="text-[19px] font-bold text-cream flex items-center gap-2 mb-1">
        <KeyRound className="w-5 h-5 text-gold/70" /> Que se migren solos
      </h3>
      <p className="text-[17px] leading-relaxed text-cream/75 mb-4">
        {falla ? falla
          : habilitados === 0
            ? 'Nadie tiene la migración abierta. Enciéndela y el cliente trae su propio material.'
            : `${habilitados} ${habilitados === 1 ? 'cliente puede' : 'clientes pueden'} migrarse ahora.`}
      </p>

      <div className="space-y-2">
        {filas.map((f) => (
          <div key={f.cliente_id} className={`rounded-xl border p-4 ${
            f.migrado_en
              ? f.piezas_para_campanas === total ? 'border-success/25' : 'border-gold/35'
              : f.habilitada ? 'border-gold/25' : 'border-cream/12'}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-[18px] font-bold text-cream">
                {f.nombre || 'Sin nombre cargado'}
              </p>
              <span className="text-[16px] text-cream/55 shrink-0">
                {f.piezas_para_campanas} de {total} piezas
              </span>
            </div>

            <p className="text-[17px] leading-relaxed text-cream/75 mt-1">
              {f.migrado_en
                ? f.piezas_para_campanas === total
                  ? `Migrado el ${new Date(f.migrado_en).toLocaleDateString('es', { day: 'numeric', month: 'long' })}. Puede activar.`
                  : `Migrado, pero le faltan ${total - f.piezas_para_campanas} piezas: sus anuncios saldrían de campos vacíos. Falta trabajarlo en la mentoría.`
                : f.habilitada
                  ? 'Le aparece la tarjeta en su HOY. Lo hace él.'
                  : 'Todavía no le aparece.'}
            </p>

            {/* Una vez migrado no se vuelve a abrir desde acá: ofrecerle migrar
                de nuevo a alguien que ya tiene su ADN cargado es invitarlo a
                pisar su propio trabajo con un texto pegado apurado. */}
            {!f.migrado_en && (
              <button onClick={() => void tocar(f)} disabled={tocando === f.cliente_id}
                className={`mt-3 min-h-[44px] px-4 rounded-xl text-[16px] font-bold border disabled:opacity-50 ${
                  f.habilitada
                    ? 'border-cream/20 text-cream/75'
                    : 'border-gold/35 text-gold'}`}>
                {tocando === f.cliente_id ? 'Cambiando…'
                  : f.habilitada ? 'Cerrarle la migración' : 'Abrirle la migración'}
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
