/**
 * SemáforoClientes — la pantalla con la que Lupe abre la mañana.
 *
 * Una fila por cliente, rojos arriba. Cada fila dice lo mismo en el mismo
 * lugar: quién es, en qué semana va, qué jornada le falta y hace cuánto,
 * cuándo entró por última vez y cuántos días le quedan de ventana.
 *
 * Se toca la fila y se abre su detalle. Nada más: esto es para decidir a quién
 * escribir, no para leer.
 */
import React from 'react';
import { ChevronRight } from 'lucide-react';
import { conteo, type Color, type FilaDelSemaforo } from '../../lib/semaforo';

const COLOR: Record<Color, { punto: string; texto: string; borde: string }> = {
  rojo:     { punto: '#9C3626', texto: 'Hay que escribirle hoy',  borde: 'rgba(156,54,38,0.45)' },
  amarillo: { punto: '#B0822E', texto: 'Se está quedando atrás',  borde: 'rgba(176,130,46,0.45)' },
  verde:    { punto: '#2E6B4F', texto: 'En ritmo',                borde: 'rgba(46,107,79,0.35)' },
};

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
function fechaCorta(iso: string | null): string {
  if (!iso) return 'todavía no entró';
  const [y, m, d] = iso.split('-').map(Number);
  return y ? `${d} ${MESES[m - 1]}` : iso;
}

interface Props {
  filas: FilaDelSemaforo[];
  onAbrir: (id: string) => void;
}

export default function SemaforoClientes({ filas, onAbrir }: Props) {
  const c = conteo(filas);

  return (
    <section aria-label="Semáforo de clientes">
      <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
        <h2 className="text-[26px] leading-tight" style={{ fontFamily: 'var(--font-display)', fontStyle: 'normal' }}>
          Tus clientes hoy
        </h2>
        <p className="text-[17px] opacity-70">
          {c.rojo} para escribir · {c.amarillo} para mirar · {c.verde} en ritmo
        </p>
      </div>

      <ul className="mt-4 space-y-2">
        {filas.map((f) => (
          <li key={f.id}>
            <button
              type="button"
              onClick={() => onAbrir(f.id)}
              className="w-full min-h-[76px] rounded-2xl border px-4 py-3 text-left flex items-start gap-3"
              style={{ borderColor: COLOR[f.color].borde }}
            >
              <span
                className="mt-2 w-3 h-3 shrink-0 rounded-full"
                style={{ background: COLOR[f.color].punto }}
                aria-label={COLOR[f.color].texto}
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="text-[19px] font-semibold truncate">{f.nombre}</span>
                  <span className="text-[17px] opacity-70 shrink-0">
                    {f.semana > 0 ? `semana ${f.semana}` : 'sin arrancar'}
                  </span>
                </span>

                <span className="mt-1 block text-[17px] opacity-85">{f.porque}</span>

                <span className="mt-1 block text-[17px] opacity-60">
                  {[
                    `entró ${fechaCorta(f.ultimoIngreso)}`,
                    f.diasDeVentana !== null ? `${f.diasDeVentana} días de acceso` : 'acceso cerrado',
                  ].join(' · ')}
                </span>
              </span>
              <ChevronRight className="w-5 h-5 mt-2 shrink-0 opacity-50" />
            </button>
          </li>
        ))}
      </ul>

      {filas.length === 0 && (
        <p className="mt-6 text-[17px] opacity-70">Todavía no hay clientes con el Camino andando.</p>
      )}
    </section>
  );
}
