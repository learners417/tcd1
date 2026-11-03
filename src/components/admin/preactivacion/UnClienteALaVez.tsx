/**
 * UN CLIENTE A LA VEZ — la activación que se puede trabajar desde el teléfono.
 *
 * ═══ POR QUÉ NO ES LA MISMA MATRIZ MÁS CHICA ═══
 *
 * La matriz cruza clientes × 62 ítems. En una computadora es la forma correcta
 * de ver: se compara una fila contra otra y se encuentra al que está trabado.
 *
 * En un teléfono no hay forma de que eso funcione. No es un problema de
 * tamaño de letra ni de scroll: 62 columnas en una pantalla de 390 px son 62
 * columnas de 6 px. Deslizar al costado durante cuatro segundos para llegar a
 * la columna del píxel, y perder de vista quién es el cliente en el camino, no
 * es «usable con esfuerzo»: es inservible.
 *
 * Lo que sí sirve en un teléfono es lo contrario: un cliente, sus 14 bloques
 * uno debajo del otro, y solo se desliza para abajo. Mismos estados, mismos
 * datos, misma base. Lo que cambia es qué pregunta contesta cada vista: la
 * matriz contesta «quién está trabado», esta contesta «qué le falta a este».
 */
import { useMemo, useState } from 'react';
import { ChevronDown, Check, Link2, StickyNote } from 'lucide-react';
import { SECTIONS, RESPONSABLE_SIGLA, type PreactivacionStep } from '../../../lib/preactivacionSteps';
import {
  ESTADO_LABEL, ESTADO_COLOR, ESTADO_MARCA, siguienteEstado,
  deQuienEsLaPelota, laPelota, type EstadoCelda, type ExtraCelda,
} from '../../../lib/matrizExtras';

export interface ClienteParaLista {
  id: string;
  nombre: string;
  /** Los ítems que no entran en lo que contrató. */
  noLeAplica: (stepId: string) => boolean;
  /** Los que ya cerró en su Camino: se muestran tildados y no se tocan. */
  porElCamino: (step: PreactivacionStep) => boolean;
  extra: (stepId: string) => ExtraCelda;
  tildado: (stepId: string) => boolean;
}

export default function UnClienteALaVez({
  cliente,
  onEstado,
  onDetalle,
}: {
  cliente: ClienteParaLista;
  onEstado: (stepId: string, estado: EstadoCelda) => void;
  onDetalle: (stepId: string, titulo: string) => void;
}) {
  const [abierta, setAbierta] = useState<string | null>(SECTIONS[0]?.id ?? null);

  /** El estado que corresponde mostrar en cada ítem. */
  const estadoDe = (step: PreactivacionStep): EstadoCelda => {
    if (cliente.porElCamino(step) || cliente.tildado(step.id)) return 'listo';
    if (cliente.noLeAplica(step.id)) return 'na';
    return cliente.extra(step.id).estado ?? 'pendiente';
  };

  /** De quién es la pelota, contando todo lo que sí le aplica. */
  const pelota = useMemo(() => {
    const estados = SECTIONS.flatMap((sec) =>
      sec.items
        .filter((it) => !cliente.noLeAplica(it.id))
        .map((it) => estadoDe({ ...it, sectionId: sec.id })));
    return deQuienEsLaPelota(estados);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cliente]);

  return (
    <div className="space-y-3">
      {/* LA LÍNEA DEL LUNES. De quién se está esperando, en palabras. Antes
          las dos cosas eran el mismo amarillo y había que preguntar por cada
          celda de quién era la demora. */}
      <p className="text-[18px] leading-relaxed text-cream/85">{laPelota(pelota)}</p>

      {SECTIONS.map((sec) => {
        const items = sec.items.filter((it) => !cliente.noLeAplica(it.id));
        if (items.length === 0) return null;

        const estados = items.map((it) => estadoDe({ ...it, sectionId: sec.id }));
        const listas = estados.filter((e) => e === 'listo').length;
        const completa = listas === items.length;
        const estaAbierta = abierta === sec.id;

        return (
          <section key={sec.id} className={`rounded-2xl border ${
            completa ? 'border-success/30' : 'border-cream/12'}`}>
            <button
              type="button"
              onClick={() => setAbierta(estaAbierta ? null : sec.id)}
              aria-expanded={estaAbierta}
              className="w-full min-h-[60px] px-4 py-3 flex items-center gap-3 text-left"
            >
              <span className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center border ${
                completa ? 'border-success/45 text-success' : 'border-cream/15 text-cream/45'}`}>
                {completa ? <Check className="w-4 h-4" /> : <span className="text-[15px] font-bold">{items.length - listas}</span>}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[18px] font-semibold leading-snug text-cream">{sec.title}</span>
                <span className="block text-[16px] text-cream/55">
                  {listas} de {items.length} listos
                </span>
              </span>
              <ChevronDown className={`w-5 h-5 shrink-0 text-cream/45 transition-transform ${
                estaAbierta ? 'rotate-180' : ''}`} />
            </button>

            {estaAbierta && (
              <ul className="px-4 pb-3 divide-y divide-cream/[0.07]">
                {items.map((it) => {
                  const step: PreactivacionStep = { ...it, sectionId: sec.id };
                  const estado = estadoDe(step);
                  const auto = cliente.porElCamino(step);
                  const ex = cliente.extra(it.id);
                  const c = ESTADO_COLOR[estado];
                  return (
                    <li key={it.id} className="py-3 flex items-start gap-3">
                      {/* El botón de estado: grande, porque se toca con el dedo. */}
                      <button
                        type="button"
                        disabled={auto}
                        onClick={() => onEstado(it.id, siguienteEstado(estado, it.quien))}
                        aria-label={`${it.title} — ${ESTADO_LABEL[estado]}`}
                        className={`shrink-0 w-11 h-11 rounded-xl border-2 flex items-center justify-center text-[17px] font-extrabold ${
                          auto ? 'border-gold bg-gold text-espresso' : `${c.borde} ${c.fondo} ${c.texto}`}`}
                      >
                        {auto ? <Check className="w-5 h-5" /> : ESTADO_MARCA[estado]}
                      </button>

                      <span className="min-w-0 flex-1">
                        <span className="block text-[17px] leading-snug text-cream">{it.title}</span>
                        <span className="block mt-0.5 text-[16px] text-cream/50">
                          {auto ? 'Ya lo hizo en su Camino' : `${ESTADO_LABEL[estado]} · ${RESPONSABLE_SIGLA[it.quien]}`}
                        </span>
                        {ex.nota && (
                          <span className="block mt-1 text-[16px] leading-relaxed text-cream/65">{ex.nota}</span>
                        )}
                      </span>

                      <span className="shrink-0 flex items-center gap-1">
                        {ex.link && (
                          <a
                            href={ex.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Abrir el link de ${it.title}`}
                            className="w-11 h-11 rounded-xl flex items-center justify-center text-gold"
                          >
                            <Link2 className="w-5 h-5" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => onDetalle(it.id, it.title)}
                          aria-label={`Nota o link de ${it.title}`}
                          className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                            ex.nota ? 'text-cream/70' : 'text-cream/30'}`}
                        >
                          <StickyNote className="w-5 h-5" />
                        </button>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
