/**
 * CierreDelCamino — lo que ve cuando su ventana se cierra.
 *
 * Nada se borra: su trabajo queda a la vista. Y arriba, el cierre de cuentas:
 * qué hizo, qué le faltó y cuánto se atrasó. Desde ese número sale la
 * conversación de la garantía, la renovación o el paso siguiente.
 */
import React, { useMemo } from 'react';
import { cierreDeCuentas, veredictoDeGarantia, loQueLeDimos } from '../lib/cierreDeCuentas';
import PasesDeRenovacion from './PasesDeRenovacion';
import { fechaEnPalabras } from '../lib/fechas';
import { VOC } from '../lib/vocabulario';
import { sesionesDe } from '../lib/sesionesDatos';
import { PIEZAS_ADN, estadoPieza, contenidoDePieza, resumenADN } from '../lib/adnPiezas';
import type { Sesion } from '../lib/sesionesHumanas';

interface Props {
  nombre?: string;
  /** Por qué se cerró, en su idioma. */
  motivo: string;
  desde: string;
  completadas: Set<string>;
  fechaInicio?: string | null;
  entregas?: Record<string, string>;
  /** Para escribirle: el número de WhatsApp de la casa. */
  waLink?: string;
  /** Para verificar la mitad del equipo: las sesiones que recibió. */
  userId?: string;
  servicio?: string | null;
}

export default function CierreDelCamino({
  nombre, motivo, desde, completadas, fechaInicio, entregas, waLink, userId, servicio,
}: Props) {
  // Las sesiones que de verdad recibió. Sin esto la garantía solo medía su
  // mitad: lo que él entregó, dando por hecho lo que le dimos nosotros.
  // null hasta que la consulta vuelve: si se arrancara en [], el cierre leería
  // «te dimos 0 de 36 sesiones» en el primer render de todo el mundo.
  const [sesiones, setSesiones] = React.useState<Sesion[] | null>(null);
  React.useEffect(() => {
    // Sin usuario tampoco se sabe: queda en `null`, que es con lo que arranca.
    // Ponerlo en `[]` acá decía lo mismo que el comentario de arriba advierte
    // —«te dimos 0 de 36 sesiones»— pero solo para quien entra sin sesión
    // iniciada, que es justo quien menos puede desmentirlo.
    if (!userId) return;
    let vivo = true;
    void sesionesDe(userId)
      .then((s) => { if (vivo) setSesiones(s); })
      .catch(() => { /* la pantalla funciona igual sin ellas */ });
    return () => { vivo = false; };
  }, [userId]);

  /*
   * ═══ LO QUE SELLÓ, CON SUS PALABRAS ═══
   *
   * El subtítulo promete «Todo tu trabajo queda acá» y la pantalla mostraba un
   * número: las jornadas hechas. Lo que el cliente construyó en noventa días
   * —su método, su oferta, su precio, su promesa— vive en su ADN y no aparecía
   * acá, que es donde decide si sigue.
   *
   * De los dos lados que esta pantalla pone sobre la mesa, el de lo que falta
   * tenía una cita con línea de oro y una lista de ocho días; el de lo que hizo,
   * una cifra. Esto empareja la balanza con algo que ya existe y es suyo.
   *
   * Cuatro piezas, no catorce: las comerciales, que son las que sostienen la
   * conversación de la renovación. Y con sus palabras, no con las nuestras.
   */
  const sellado = useMemo(() => {
    const resumen = resumenADN();
    if (resumen.selladas === 0) return null;
    const COMERCIALES = ['metodo', 'oferta', 'precio', 'puv'];
    const muestras = PIEZAS_ADN
      .filter((p) => COMERCIALES.includes(p.id) && estadoPieza(p).sellada)
      .map((p) => ({ titulo: p.titulo, dice: contenidoDePieza(p).trim() }))
      .filter((m) => m.dice.length > 0);
    return { resumen, muestras };
  }, []);

  const c = useMemo(
    () => cierreDeCuentas(completadas, fechaInicio, entregas ?? {}, sesiones, servicio),
    [completadas, fechaInicio, entregas, sesiones, servicio],
  );

  return (
    /*
     * `flex` sin dirección pone en FILA, y los dos hijos de este contenedor son
     * el cierre de cuentas y los tres pases: a 390 píxeles se repartían el
     * ancho y quedaban dos columnas de tres palabras por renglón, con los
     * precios cortados por la derecha. Era la pantalla donde se vende la
     * renovación —el momento comercial más importante del programa— y estaba
     * rota en el teléfono porque nadie la había medido nunca.
     */
    <div className="min-h-screen bg-ink text-cream flex flex-col items-center gap-6 p-6">
      <section className="w-full max-w-[620px] card-panel p-6" aria-label="Tu cierre">
        <p className="text-[15px] font-bold uppercase tracking-[0.16em] text-goldhi">Tu Camino, cerrado</p>
        <h1 className="mt-2 text-[30px] leading-tight" style={{ fontFamily: 'var(--font-display)', fontStyle: 'normal' }}>
          {nombre ? `${nombre}, esto es lo que hiciste` : 'Esto es lo que hiciste'}
        </h1>
        <p className="mt-2 text-[17px] text-cream/70">
          Se cerró el {fechaEnPalabras(desde)}: {motivo}. Todo tu trabajo queda acá.
        </p>

        {/*
          UN NUMERAL, NO DOS.

          Eran dos cajas del mismo tamaño con un numeral de 34 cada una: la
          primera contaba lo que hizo y la segunda —«quedaron sin entregar»—
          lo que no. En la pantalla donde se le muestra a alguien su trabajo de
          noventa días, sus faltas tenían la misma jerarquía tipográfica que
          sus logros, y «quedaron sin entregar» suena además a que el que no
          entregó fue el programa.

          Ahora es un dato: la cifra y su total, como las tarjetas de Métricas.
          El detalle de lo que falta sigue abajo, en la lista, que es donde
          sirve para decidir qué sigue — y ahí no compite con nada.
        */}
        <div className="mt-5 rounded-2xl border border-[var(--line2,#DFD3BC)] p-4">
          <p className="text-[34px] leading-none" style={{ fontFamily: 'var(--font-display)', fontVariantNumeric: 'lining-nums tabular-nums' }}>{c.hechas}</p>
          <p className="mt-1 text-[17px] text-cream/70">
            de {c.hechas + c.sinEvidencia.length} jornadas{c.hechas === 1 ? ' hecha' : ' hechas'}
          </p>
        </div>

        {sellado && (
          <section className="mt-3 rounded-2xl border border-[var(--line2,#DFD3BC)] p-4" aria-label="Lo que sellaste">
            <p className="text-[15px] font-bold uppercase tracking-[0.16em] text-goldhi">Lo que sellaste</p>
            <p className="mt-1 text-[17px] text-cream/70">
              {sellado.resumen.selladas} de {sellado.resumen.total} piezas de tu ADN. Quedan escritas, con tus palabras.
            </p>
            {sellado.muestras.length > 0 && (
              <ul className="mt-3 space-y-2">
                {sellado.muestras.map((m) => (
                  <li key={m.titulo} className="text-[17px] text-cream leading-relaxed">
                    <span className="text-cream/70">{m.titulo} · </span>
                    {m.dice.length > 90 ? `${m.dice.slice(0, 90)}…` : m.dice}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* Lo que le dimos NOSOTROS. Va al lado de su número, no escondido:
            la garantía tiene dos partes y antes solo se mostraba la suya. */}
        {c.sesionesPrometidas > 0 && (
          <p className={`mt-3 rounded-2xl border p-4 text-[17px] leading-relaxed ${
            c.cumplimosNuestraParte
              ? 'border-[var(--line2,#DFD3BC)] text-cream/75'
              : 'border-gold/40 bg-gold/[0.07] text-cream/90'}`}>
            {loQueLeDimos(c)}
          </p>
        )}

        {/*
          «Tu atraso más grande fue de 0 días» con cero jornadas hechas no dice
          nada: no hay atraso que medir cuando no se empezó. Y con todo al día
          tampoco hace falta decirlo. La frase aparece cuando hubo un atraso de
          verdad, que es cuando significa algo.
        */}
        {c.hechas > 0 && c.atrasoMayor > 0 && (
          <p className="mt-4 text-[17px] text-cream">
            Tu atraso más grande fue de {c.atrasoMayor} {c.atrasoMayor === 1 ? 'día' : 'días'}.
          </p>
        )}

        <p className="mt-4 text-[18px] leading-relaxed text-cream" style={{ borderLeft: '2px solid var(--oro, #B0822E)', paddingLeft: 14 }}>
          {VOC(veredictoDeGarantia(c))}
        </p>

        {c.sinEvidencia.length > 0 && (
          <>
            {/* «Lo que quedó pendiente» mira hacia atrás; esta lista es para
                decidir qué sigue. La casa escribe hacia adelante. */}
            <p className="mt-5 text-[17px] font-semibold text-cream">Lo que queda por hacer</p>
            <ul className="mt-2 space-y-2">
              {c.sinEvidencia.slice(0, 8).map((j) => (
                <li key={j.clave} className="text-[17px] text-cream/75">
                  Día {j.dia} · {VOC(j.titulo)}
                </li>
              ))}
            </ul>
            {c.sinEvidencia.length > 8 && (
              <p className="mt-2 text-[15px] text-cream/60">y {c.sinEvidencia.length - 8} más</p>
            )}
          </>
        )}

        {waLink && (
          <a
            href={waLink}
            target="_blank"
            rel="noopener"
            className="mt-6 w-full min-h-[52px] rounded-[20px] text-[18px] font-semibold flex items-center justify-center"
            style={{ background: 'var(--tinta-boton, #2A2118)', color: 'var(--papel-boton, #FBF8F1)' }}
          >
            Hablar de lo que sigue
          </a>
        )}
      </section>

      {/*
        Los tres pases, debajo de su cierre de cuentas. Es el único momento en
        que tiene delante, al mismo tiempo, todo lo que construyó y la
        pregunta de qué hace con eso. Antes esa conversación dependía de que
        alguien se acordara de escribirle.
      */}
      <PasesDeRenovacion waLink={waLink} />
    </div>
  );
}
