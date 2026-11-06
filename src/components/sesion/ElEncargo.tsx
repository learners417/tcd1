/**
 * EL ENCARGO — dentro de la jornada que lo necesita, y en ningún otro lado.
 *
 * ═══ QUÉ ES ═══
 *
 * Lo que el cliente le pasa a Claude ese día, ya escrito y ya con sus datos:
 * su promesa, su método, su avatar, su país. Se copia con un toque y se pega.
 *
 * ═══ POR QUÉ NO ES UNA PESTAÑA ═══
 *
 * Porque una pestaña de herramientas es un catálogo, y un catálogo con
 * noventa días por delante es la invitación a pasarlos construyendo en vez
 * de vendiendo. El encargo aparece en el paso que lo necesita, se usa, y se
 * va. No hay índice, no hay «mira qué más se puede hacer».
 *
 * ═══ LO QUE FALTA SE DICE ═══
 *
 * Si el cliente todavía no selló su promesa, el encargo sale con el hueco a
 * la vista —«[tu promesa: todavía sin sellar]»— y arriba se avisa cuáles
 * son. Un encargo al que le falta un dato tiene que decirlo: si se borrara en
 * silencio, la salida vendría coja y el cliente no sabría por qué.
 *
 * No bloquea. Puede completarlo a mano en la conversación y seguir; el
 * Camino sella esas piezas a su tiempo y no es este día el que tiene que
 * frenarse por eso.
 */
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { copiar as copiarAlPortapapeles } from '../../lib/copiar';
import { encargoDe } from '../../lib/elEncargo';

export default function ElEncargo({ codigo }: { codigo: string }) {
  const encargo = encargoDe(codigo);
  const [copiado, setCopiado] = useState(false);

  if (!encargo) return null;

  /*
   * Por `lib/copiar`, que es la única puerta al portapapeles en esta casa:
   * tiene la caída para los navegadores que lo niegan sin aviso. Llamar a
   * `navigator.clipboard` por mi cuenta era saltarme esa caída — y el botón
   * habría dicho «Copiado» sin haber copiado nada.
   */
  const copiar = async () => {
    if (await copiarAlPortapapeles(encargo.texto)) {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    }
  };

  return (
    <section className="card-panel p-5 space-y-3" aria-label="Lo que le pasas a Claude">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[15px] font-bold uppercase tracking-[0.16em] text-goldhi">
            Para pegarle a Claude
          </p>
          <p className="mt-1 text-[17px] text-cream/70 leading-snug">
            Ya lleva tus datos adentro. Cópialo, pégalo, y lo que salga vuelve acá.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void copiar()}
          className="shrink-0 min-h-[44px] px-3 flex items-center gap-2 text-[15px] font-semibold text-goldhi"
        >
          {copiado ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copiado ? 'Copiado' : 'Copiar'}
        </button>
      </div>

      {encargo.faltan.length > 0 && (
        /*
          En positivo y sin frenar: dice qué va a salir mejor cuando esas
          piezas estén, no qué está mal ahora.
        */
        <p className="text-[15px] leading-snug text-cream/70 border-l-2 pl-3"
          style={{ borderColor: 'var(--oro, #B0822E)' }}>
          Sale más afinado cuando selles {encargo.faltan.join(', ')}. Mientras
          tanto, complétalo en la conversación y sigue.
        </p>
      )}

      {/*
        `whitespace-pre-wrap`: el encargo tiene renglones y numeración que
        importan — es lo que hace que la salida venga ordenada. Aplastado en un
        párrafo, deja de ser un encargo y pasa a ser un deseo.
      */}
      <pre className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed text-cream/85
                      max-h-72 overflow-y-auto rounded-xl bg-black/15 p-4">
        {encargo.texto}
      </pre>
    </section>
  );
}
