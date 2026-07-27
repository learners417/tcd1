import { useMemo } from 'react';
import { ROLES, calcularCarga, TRASPASO, type Rol } from '../../lib/roles';

/**
 * MI ROL — qué me toca, qué no, y cuánto llevo encima.
 *
 * Existe porque un rol que solo esconde tabs no es un rol. Las tres preguntas
 * que contesta son las que hacen que dos personas no hagan lo mismo y que una
 * tercera cosa no se quede sin hacer.
 *
 * La del techo es la que decide si el negocio escala: si se pasa, el aviso no
 * es «trabaja más» — es que subió el porcentaje de cuentas en rojo y hay que
 * arreglar lo que las rompe.
 */

export default function MiRol({
  rol,
  excepciones = 0,
  sesiones = 0,
  enInstalacion = 0,
}: {
  rol: Rol;
  excepciones?: number;
  sesiones?: number;
  enInstalacion?: number;
}) {
  const def = ROLES[rol];
  const carga = useMemo(
    () => calcularCarga(rol, { excepciones, sesiones, enInstalacion }),
    [rol, excepciones, sesiones, enInstalacion],
  );

  return (
    <div className="max-w-3xl mx-auto space-y-4">

      {/* ── QUIÉN SOY ACÁ ── */}
      <div className="rounded-2xl border border-gold/25 bg-gold/[0.04] p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold/70 mb-1">
          Tu rol
        </p>
        <h3 className="text-2xl text-cream leading-snug" style={{ fontFamily: 'var(--font-display)' }}>
          {def.nombre}
        </h3>
        <p className="text-sm text-cream/75 mt-1">{def.proposito}</p>
      </div>

      {/* ── LA CARGA ── */}
      <div className={`rounded-2xl border p-5 ${
        carga.pasado ? 'border-danger/40 bg-danger/[0.06]'
        : carga.ocupacion >= 0.6 ? 'border-gold/30 bg-gold/[0.04]'
        : 'border-cream/12'}`}>
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-cream/50 mb-2">
          Tu semana
        </p>
        <div className="h-2 rounded-full bg-cream/10 overflow-hidden">
          <div className={`h-full rounded-full transition-all ${
            carga.pasado ? 'bg-danger' : carga.ocupacion >= 0.6 ? 'bg-gold' : 'bg-success'}`}
            style={{ width: `${Math.min(100, carga.ocupacion * 100)}%` }} />
        </div>
        <p className="text-sm text-cream/85 mt-2">{carga.lectura}</p>

        {(excepciones > 0 || sesiones > 0 || enInstalacion > 0) && (
          <p className="text-[11px] text-cream/45 mt-1.5">
            {[
              excepciones > 0 && `${excepciones} ${excepciones === 1 ? 'excepción' : 'excepciones'}`,
              sesiones > 0 && `${sesiones} ${sesiones === 1 ? 'sesión' : 'sesiones'}`,
              enInstalacion > 0 && `${enInstalacion} en instalación`,
            ].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>

      {/* ── EL NÚMERO QUE TE MIDE ── */}
      <div className="rounded-2xl border border-cream/12 p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-cream/50 mb-2">
          Cómo sabes que va bien
        </p>
        <p className="text-sm text-cream/85 leading-relaxed">{def.indicador}</p>
      </div>

      {/* ── LO QUE NO TE TOCA ── */}
      <div className="rounded-2xl border border-cream/12 p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-cream/50 mb-1">
          Lo que NO te toca
        </p>
        <p className="text-xs text-cream/45 mb-3">
          No es una restricción: es lo que evita que dos personas hagan lo mismo
          y una tercera cosa no la haga nadie.
        </p>
        <div className="space-y-2.5">
          {def.noLeToca.map((n) => (
            <div key={n.que}>
              <p className="text-sm text-cream/85">{n.que}</p>
              <p className="text-xs text-cream/55 mt-0.5 leading-relaxed">{n.porque}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── EL TRASPASO ── */}
      <div className="rounded-2xl border border-cream/12 p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-cream/50 mb-1">
          Si entra alguien nuevo a este rol
        </p>
        <p className="text-xs text-cream/45 mb-3">
          Que herede una lista y no una conversación: una conversación se olvida,
          y el que la dio se vuelve necesario para siempre.
        </p>
        <ol className="space-y-2.5">
          {TRASPASO[rol].map((p, i) => (
            <li key={p.que} className="flex gap-3">
              <span className="text-gold/60 text-sm shrink-0">{i + 1}</span>
              <div>
                <p className="text-sm text-cream/85">{p.que}</p>
                <p className="text-xs text-cream/55 mt-0.5 leading-relaxed">{p.porque}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
