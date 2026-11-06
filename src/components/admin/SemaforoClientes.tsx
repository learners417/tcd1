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

/*
 * ═══ «ENTRÓ TODAVÍA NO ENTRÓ» ═══
 *
 * Esta función devolvía DOS cosas distintas con el mismo tipo: un pedazo de
 * fecha —«12 nov»— que necesita que alguien le ponga el «entró» adelante, y
 * una frase entera —«todavía no entró»— que no lo necesita. El que llamaba
 * no tenía cómo distinguirlas, así que le ponía el prefijo a las dos:
 *
 *     `entró ${fechaCorta(f.ultimoIngreso)}`   →   «entró todavía no entró»
 *
 * Eso se leía en las tarjetas de los seis clientes, en la pantalla que el
 * equipo abre todas las mañanas. No se había visto nunca porque el visor del
 * Admin no tenía clientes: medía el estado vacío.
 *
 * Ahora devuelve `null` cuando no hay fecha, y la frase entera la arma quien
 * la va a escribir, que es el único que sabe cómo sigue.
 */
function fechaCorta(iso: string | null): string | null {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  return y ? `${d} ${MESES[m - 1]}` : iso;
}

/**
 * La segunda línea de cada tarjeta: cuándo entró y cuánto acceso le queda.
 *
 * Exportada para que `prueba-frases-que-se-arman.ts` la pueda ejercer con
 * los casos de borde. Una frase que se arma con pedazos condicionales hay
 * que poder correrla; si vive suelta adentro del JSX, la única forma de
 * verla es que alguien abra esa pantalla con los datos justos — que es
 * exactamente lo que no pasó durante meses.
 */
export function lineaDeEstado(ultimoIngreso: string | null, diasDeVentana: number | null): string {
  const cuando = fechaCorta(ultimoIngreso);
  return [
    cuando ? `entró ${cuando}` : 'todavía no entró',
    diasDeVentana !== null ? `${diasDeVentana} días de acceso` : 'acceso cerrado',
  ].join(' · ');
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
                  {lineaDeEstado(f.ultimoIngreso, f.diasDeVentana)}
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
