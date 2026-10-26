/**
 * LOS NÚMEROS DEL CLIENTE — el panel de su ficha.
 *
 * Arriba, la frase con la que se abre el mensaje: qué está pasando esta
 * semana. Debajo, el embudo y los cuatro cruces que importan. Al final, las
 * semanas anteriores, para ver si va para arriba o para abajo.
 *
 * Nada se edita desde acá: los números los carga el cliente. Eso es parte de
 * lo que se le enseña.
 */
import React from 'react';
import {
  cruces, elEmbudo, queEstaPasando, ordenadas, ultimaCargada,
  semanasSinCargar, avisoDeCarga, comparado, usd, pct, enPalabras,
  type SemanaDeNumeros,
} from '../../lib/numerosDelCliente';

interface Props {
  nombre: string;
  filas: SemanaDeNumeros[];
  /** aaaa-mm-dd. Se pasa para poder probarlo con una fecha fija. */
  hoy?: string;
}

function hoyISO(): string {
  const f = new Date();
  return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`;
}

function Cruce({ que, valor }: { que: string; valor: string }) {
  return (
    <div className="rounded-xl border border-gold/20 bg-espresso/30 px-4 py-3">
      <p className="text-[16px] text-cream/60">{que}</p>
      <p className="mt-1 text-[20px] font-bold text-cream">{valor}</p>
    </div>
  );
}

export default function NumerosDelCliente({ nombre, filas, hoy = hoyISO() }: Props) {
  const semanas = ordenadas(filas);
  const ultima = ultimaCargada(filas);
  const sinCargar = semanasSinCargar(filas, hoy);
  const aviso = avisoDeCarga(sinCargar, semanas.length === 0);

  if (!ultima) {
    return (
      <section className="rounded-2xl border border-gold/25 bg-espresso/40 p-5">
        <h3 className="text-[19px] font-bold text-cream">Sus números</h3>
        <p className="mt-2 text-[17px] leading-relaxed text-cream/70">
          {nombre} todavía no cargó ninguna semana. Sus números se cargan desde su pestaña
          de Métricas, y el Camino se los pide el día 26.
        </p>
      </section>
    );
  }

  const c = cruces(ultima);
  const cambio = comparado(filas);

  return (
    <section className="rounded-2xl border border-gold/25 bg-espresso/40 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-[19px] font-bold text-cream">Sus números</h3>
        <span className="text-[16px] text-cream/55">
          {ultima.met_fecha_inicio ? `semana del ${enPalabras(ultima.met_fecha_inicio)}` : ultima.semana}
        </span>
      </div>

      {aviso ? (
        <p className="mt-3 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-[17px] font-medium text-goldhi">
          {aviso}
        </p>
      ) : null}

      {/* La frase con la que se abre el mensaje. */}
      <p className="mt-3 text-[18px] font-bold leading-snug text-cream">{queEstaPasando(ultima)}</p>
      <p className="mt-2 text-[17px] leading-relaxed text-cream/70">{elEmbudo(ultima)}</p>
      {cambio ? <p className="mt-2 text-[17px] text-cream/70">{cambio}</p> : null}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Cruce que="Le cuesta una agenda" valor={c.costoPorAgenda !== null ? usd(c.costoPorAgenda) : '—'} />
        <Cruce que="Le cuesta una venta" valor={c.costoPorVenta !== null ? usd(c.costoPorVenta) : '—'} />
        <Cruce que="De los que agendan, aparece" valor={c.tasaDeShow !== null ? pct(c.tasaDeShow) : '—'} />
        <Cruce que="Por cada peso, vuelven" valor={c.retorno !== null ? `${c.retorno.toFixed(1)}` : '—'} />
      </div>

      {ultima.met_diagnostico ? (
        <div className="mt-4 rounded-xl border border-cream/15 bg-espresso/30 p-4">
          <p className="text-[16px] font-bold uppercase tracking-[0.14em] text-goldhi">Su última lectura</p>
          <p className="mt-2 whitespace-pre-line text-[17px] leading-relaxed text-cream/80">
            {ultima.met_diagnostico.slice(0, 600)}
          </p>
        </div>
      ) : null}

      {semanas.length > 1 ? (
        <div className="mt-5 border-t border-cream/10 pt-4">
          <p className="text-[17px] font-bold text-cream/70">Las semanas anteriores</p>
          <ul className="mt-2 space-y-2">
            {semanas.slice(1, 5).map((s) => {
              const cc = cruces(s);
              return (
                <li key={s.semana} className="flex flex-wrap items-baseline justify-between gap-3">
                  <span className="text-[17px] text-cream/85">
                    {s.met_fecha_inicio ? enPalabras(s.met_fecha_inicio) : s.semana}
                  </span>
                  <span className="text-[17px] text-cream/60">
                    {elEmbudo(s)}
                    {cc.costoPorAgenda !== null ? ` · agenda a ${usd(cc.costoPorAgenda)}` : ''}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
