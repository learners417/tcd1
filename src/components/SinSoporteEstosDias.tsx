/**
 * SIN SOPORTE ESTOS DÍAS — lo que el cliente lee cuando el equipo no responde.
 *
 * Reemplaza al cartel que decía «El Camino está en pausa. Retoma el 19 de
 * enero». Eso era falso y además desalentaba: quien leía que su Camino estaba
 * parado dejaba de entrar, y el mes que compró se le iba igual.
 *
 * Dice las dos cosas que son verdad: su Camino sigue abierto, y su mensaje se
 * responde el primer día que el equipo vuelve.
 */
import { avisoDelCliente, type VentanaSinSoporte } from '../lib/ventanaSinSoporte';

export default function SinSoporteEstosDias({ ventana }: { ventana: VentanaSinSoporte }) {
  const { titulo, cuerpo } = avisoDelCliente(ventana);

  return (
    <section className="rounded-2xl border border-gold/35 bg-gold/10 p-5"
      aria-label="El soporte estos días">
      <p className="text-[16px] font-bold uppercase tracking-[0.16em] text-goldhi">
        Estos días no hay soporte
      </p>
      <h2 className="mt-2 text-[22px] font-bold leading-snug text-cream">{titulo}</h2>
      <p className="mt-3 text-[17px] leading-relaxed text-cream/80">{cuerpo}</p>
    </section>
  );
}
