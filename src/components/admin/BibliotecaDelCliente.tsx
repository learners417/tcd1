/**
 * LA BIBLIOTECA DE ESTE CLIENTE — abrirla o cerrarla desde la ficha.
 *
 * Hasta acá lo único que decidía qué material veía un cliente era su avance en
 * el Camino. Eso está bien como regla, pero no dejaba hacer lo que el equipo
 * necesita a cada rato: darle acceso completo a uno puntual. Al de La
 * Instalación, que no recorre el Camino. Al que renovó. Al que pidió ver una
 * clase que todavía no le toca.
 *
 * Un interruptor, con lo que implica escrito al lado y la firma de quién lo
 * dio. Un permiso que nadie puede explicar cuando hay que revisarlo es un
 * permiso que termina abierto para todos.
 */
import { useState } from 'react';
import { Library, Check } from 'lucide-react';
import { marcarBiblioteca } from '../../lib/bibliotecaDatos';

interface Props {
  clienteId: string;
  nombre: string;
  abierta: boolean;
  /** Quién la abrió y cuándo, si está abierta. */
  abiertaEl?: string | null;
  quienCarga?: string;
  /** Para que la ficha refresque sin recargar la pantalla. */
  onCambio?: (abierta: boolean) => void;
}

export default function BibliotecaDelCliente({
  clienteId, nombre, abierta, abiertaEl, quienCarga, onCambio,
}: Props) {
  const [valor, setValor] = useState(abierta);
  const [guardando, setGuardando] = useState(false);
  const [problema, setProblema] = useState<string | null>(null);

  async function cambiar(nuevo: boolean) {
    if (guardando || !quienCarga) {
      if (!quienCarga) setProblema('Vuelve a entrar: no se pudo identificar quién lo marca.');
      return;
    }
    setGuardando(true);
    setProblema(null);
    // Optimista, y se vuelve atrás si la base lo rechaza: así el interruptor
    // nunca queda mostrando un permiso que no se guardó.
    setValor(nuevo);
    const r = await marcarBiblioteca(clienteId, nuevo, quienCarga);
    setGuardando(false);
    if (!r.ok) {
      setValor(!nuevo);
      setProblema(r.problema ?? 'No se pudo guardar.');
      return;
    }
    onCambio?.(nuevo);
  }

  return (
    <section className={`rounded-2xl border p-5 ${
      valor ? 'border-gold/40 bg-gold/[0.06]' : 'border-cream/12'}`}>
      <div className="flex items-start gap-3">
        <span className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border ${
          valor ? 'border-gold/40 text-gold' : 'border-cream/15 text-cream/40'}`}>
          <Library className="w-5 h-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[19px] font-bold text-cream">La Biblioteca completa</h3>
          <p className="mt-1 text-[17px] leading-relaxed text-cream/70">
            {valor
              ? `${nombre} ve todas las clases y tutoriales, sin esperar su día del Camino.`
              : `${nombre} ve el material hasta el día del Camino en que va. Las clases del método las ve siempre.`}
          </p>
        </div>
      </div>

      <button
        type="button"
        disabled={guardando}
        onClick={() => void cambiar(!valor)}
        className={`mt-4 min-h-[52px] w-full rounded-xl px-5 text-[17px] font-bold disabled:opacity-50 sm:w-auto ${
          valor
            ? 'border border-cream/25 text-cream/85'
            : 'bg-gold text-espresso'}`}
      >
        {guardando ? 'Guardando…' : valor ? 'Volver a lo de su día' : 'Abrirle todo el material'}
      </button>

      {valor && abiertaEl && (
        <p className="mt-3 flex items-center gap-2 text-[17px] text-cream/55">
          <Check className="w-4 h-4 shrink-0 text-success" />
          Abierta el {new Date(abiertaEl).toLocaleDateString()}
        </p>
      )}

      {problema && (
        <p className="mt-3 rounded-xl border border-danger/40 bg-danger/[0.06] px-4 py-3 text-[17px] text-cream/90">
          No se guardó: {problema}
        </p>
      )}
    </section>
  );
}
