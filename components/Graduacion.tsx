/**
 * Graduacion.tsx — El FINAL del viaje (T3 · auditoría troncal, jul 2026)
 * Se muestra UNA vez, cuando el Sanador llega a las 10 ventas registradas.
 * El clímax emocional del programa + las dos puertas: MCD y el Nivel 2.
 */
import { useEffect, useState } from 'react';
import { Trophy, ArrowRight, MessageSquare, Camera, Award, Film } from 'lucide-react';
import type { ProfileV2 } from '../lib/supabase';
import type { ComparacionDia45 as Comparacion } from '../lib/diaValidator';
import FotoDia90 from './FotoDia90';
import CertificadoModal from './CertificadoModal';
import GraduacionComprobantes from './GraduacionComprobantes';
import MensajeFuturoPlayer from './MensajeFuturoPlayer';

interface GraduacionProps {
  nombre?: string;
  ventas: number;
  onClose: () => void;
  onIrAlChat?: () => void;
  userId?: string;
  perfil?: Partial<ProfileV2>;
  comparacion?: Comparacion;
}

/** Slot: pega acá la URL de tu video de graduación (VOZ MAESTRO). */
const GRADUACION_VIDEO_URL = '';

export default function Graduacion({ nombre, ventas, onClose, onIrAlChat, userId, perfil, comparacion }: GraduacionProps) {
  const [visible, setVisible] = useState(false);
  const [verFoto, setVerFoto] = useState(false);
  const [verCert, setVerCert] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
    /*
     * El telón era `bg-black/90` y la tarjeta un degradé de panel a tinta: dos
     * cosas que la casa no usa, en la pantalla que corona los noventa días. El
     * telón ahora oscurece con la tinta del tema y la tarjeta es el panel,
     * plano, con su línea de oro.
     */
    <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-sm p-4 overflow-y-auto"
         style={{ background: 'color-mix(in srgb, var(--color-ink, #080808) 86%, transparent)' }}>
      <div
        className={`max-w-lg w-full my-8 rounded-2xl border border-gold/30 card-panel p-8 text-center transition-all duration-700 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        {/* Decía «Cinturón negro» dos veces seguidas, en dos tamaños y dos
            tonos de oro. Va una. */}
        <p className="mb-4 text-[15px] font-bold uppercase tracking-[0.22em]" style={{ color: 'var(--oro-d, #8E6824)' }}>
          Cinturón negro
        </p>
        <h2
          className="text-3xl font-semibold text-cream mb-2"
          style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}
        >
          {nombre ? `${nombre}, eres` : 'Eres'} un Sanador Libre
        </h2>
        <p className="text-sm italic text-cream/65 mb-6">
          El árbol que da semillas
        </p>

        <div className="rounded-xl border border-cream/10 bg-[var(--bg-card,#17150F)] p-5 mb-6 text-left">
          <p className="text-sm text-cream/80 leading-relaxed">
            <span className="text-gold font-semibold">{ventas} pacientes</span> cobrados
            con tu precio digno, por un sistema que construiste tú. Hace 90 días eras el
            profesional que perseguía pacientes. Hoy eres el director de tu clínica digital.
            <span className="block mt-2 text-cream/75">
              El mártir quedó atrás. Y esto recién empieza.
            </span>
          </p>
        </div>

        {/* T11 · La Foto del Día 90 (antes/después) */}
        {comparacion?.tieneFotoPartida && (
          <button
            onClick={() => setVerFoto(true)}
            className="w-full rounded-xl border border-gold/25 bg-gold/[0.05] p-4 mb-4 text-left hover:border-gold/45 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-gold" />
                <p className="text-sm font-bold uppercase tracking-widest text-gold">
                  Tu Foto del Día 90
                </p>
              </div>
              <span className="text-xs font-mono text-cream/75">
                {comparacion.promedioDia1.toFixed(1)} →{' '}
                <span className="text-gold font-bold">{comparacion.promedioDia45.toFixed(1)}</span>
              </span>
            </div>
            <p className="text-xs text-cream/55 mt-1">
              Mira y comparte el antes y el después de estos 90 días.
            </p>
          </button>
        )}

        {/* T11 · Los comprobantes de los 10 */}
        <div className="mb-4">
          <GraduacionComprobantes userId={userId} />
        </div>

        {/* T11 · Tu video de graduación */}
        {GRADUACION_VIDEO_URL ? (
          <div className="mb-4 rounded-xl overflow-hidden border border-gold/20 aspect-video bg-black">
            <video src={GRADUACION_VIDEO_URL} controls className="w-full h-full" />
          </div>
        ) : (
          /* `items-start` y el ícono con su `mt`: el texto ocupa tres renglones
             y centrado el ícono quedaba flotando en el medio del bloque, sin
             alinear a nada. Y al 45% era una nota al pie. */
          <div className="mb-4 rounded-xl border border-cream/10 bg-[var(--bg-card,#17150F)] p-4 flex items-start gap-2.5 text-left">
            <Film className="w-4 h-4 mt-1 text-gold/70 shrink-0" />
            <p className="text-sm text-cream/75">
              Tu video de graduación (la palabra de Javo para este momento) aparece acá.
            </p>
          </div>
        )}

        {/* T11 · El Mensaje al Futuro */}
        <div className="mb-4">
          <MensajeFuturoPlayer userId={userId} />
        </div>

        {/* T11 · El Certificado que trabaja */}
        <button
          onClick={() => setVerCert(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gold/30 text-gold text-xs font-bold uppercase tracking-wider hover:bg-gold/10 transition-colors mb-6"
        >
          <Award className="w-4 h-4" /> Ver mi certificado de Cinturón Negro
        </button>

        {/* Las dos puertas */}
        <div className="space-y-3 mb-6 text-left">
          <div className="rounded-xl border border-gold/25 bg-gold/[0.05] p-4">
            <p className="text-sm font-bold uppercase tracking-widest text-gold mb-1">
              Puerta 1 · Tu clínica sigue operando
            </p>
            <p className="text-xs text-cream/70 leading-relaxed">
              {/* «MiClínica Digital» sin espacio era un quinto nombre: pegaba
                  el destino «Mi Clínica» con «Tu Clínica Digital», que es como
                  se llama la app. El sistema vive en el destino. */}
              Tu sistema ahora vive en <span className="text-cream font-semibold">Mi Clínica</span>:
              tus pacientes, tu agenda, tu protocolo y tus cobros — en piloto automático, todos los meses.
            </p>
          </div>
          <div className="rounded-xl border border-cream/15 bg-[var(--bg-card,#17150F)] p-4">
            <p className="text-sm font-bold uppercase tracking-widest text-cream/65 mb-1">
              Puerta 2 · El Nivel 2 existe
            </p>
            <p className="text-xs text-cream/70 leading-relaxed">
              De $10K en 90 días a <span className="text-cream font-semibold">$25K por mes</span>.
              El cinturón negro tiene grados — y el 1er dan es la puerta, no el techo.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            onIrAlChat?.();
            onClose();
          }}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gold text-black text-sm font-semibold hover:bg-goldhi transition-colors mb-3"
        >
          <MessageSquare className="w-4 h-4" />
          Hablar con el equipo sobre mi siguiente paso
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={onClose}
          className="text-xs text-cream/55 hover:text-cream/70 transition-colors"
        >
          Quedarme un rato más acá, mirando lo que logré
        </button>

        {/*
          La firma de la casa en la pantalla del día 90, y estaba casi
          invisible: `opacity-60` en el contenedor por `text-cream/55` adentro
          da un 33% efectivo — dos opacidades anidadas que se multiplican sin
          que ninguna de las dos parezca baja. Y el trofeo iba centrado contra
          un texto que a 390 píxeles ocupa dos renglones, así que quedaba
          flotando en el hueco entre el primero y el segundo.

          Una sola opacidad, el trofeo en la línea del primer renglón.
        */}
        <div className="flex items-start justify-center gap-2 mt-6">
          <Trophy className="w-4 h-4 mt-0.5 shrink-0 text-gold" />
          <span className="text-sm uppercase tracking-widest text-cream/70">
            Tu Clínica Digital · Sanadores Libres
          </span>
        </div>
      </div>
    </div>
    <FotoDia90 open={verFoto} onClose={() => setVerFoto(false)} comparacion={comparacion} nombre={nombre} dia={90} />
    <CertificadoModal open={verCert} onClose={() => setVerCert(false)} nombre={nombre} metodoNombre={perfil?.metodo_nombre} ventas={ventas} />
    </>
  );
}
