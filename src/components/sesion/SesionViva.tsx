/**
 * SESIÓN VIVA — el orquestador (Cirugía T2).
 *
 * Envuelve el panel de trabajo de una meta con la liturgia de Javo:
 *   CHECK-IN (emoción + objetivo, cronómetro arranca)
 *   → TRABAJO (el componente de siempre, con cronómetro y pausa)
 *   → CHECK-OUT (emoción + compromisos, al completar la meta)
 *   → "HOY PRODUJISTE ESTO" (el cierre que consolida).
 *
 * Decisión de diseño: aplica a metas COACH y HERRAMIENTA (trabajo real).
 * Las VIDEO (5-8 min) van directas — un check-in para un video corto es
 * fricción sin valor. La sesión en curso sobrevive a cerrar la app
 * (localStorage) y se retoma donde quedó.
 */
import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import CheckInPanel from './CheckInPanel';
import CheckOutPanel from './CheckOutPanel';
import CronometroSesion from './CronometroSesion';
import {
  type EmocionSesion, type SesionEnCurso,
  getSesionEnCurso, setSesionEnCurso, segundosDeSesion,
  parseTiempoEstimado, formatoCrono,
  abrirSessionLog, cerrarSessionLog,
  EMOCIONES_ENTRADA, EMOCIONES_SALIDA,
} from '../../lib/sessionLog';

/** El Mentor lee esto para retomar los compromisos en la próxima conversación. */
const KEY_ULTIMA = 'tcd_ultima_sesion_v1';
export interface UltimaSesion {
  metaCodigo: string;
  metaTitulo: string;
  checkoutEmocion: EmocionSesion;
  compromisos: string[];
  fecha: string;
}
export function getUltimaSesion(): UltimaSesion | null {
  try {
    const raw = localStorage.getItem(KEY_ULTIMA);
    return raw ? (JSON.parse(raw) as UltimaSesion) : null;
  } catch {
    return null;
  }
}

type Fase = 'checkin' | 'trabajo' | 'checkout' | 'cerrada';

interface Props {
  metaKey: string; // `${pilarNumero}-${codigo}` — la misma clave del progreso
  metaCodigo: string;
  metaTitulo: string;
  descripcion?: string;
  tiempoEstimado?: string | null;
  isCompleted: boolean;
  userId?: string;
  children: React.ReactNode; // el panel de trabajo de siempre
}

export default function SesionViva({
  metaKey, metaCodigo, metaTitulo, descripcion, tiempoEstimado, isCompleted, userId, children,
}: Props) {
  const [sesion, setSesion] = useState<SesionEnCurso | null>(() => {
    const s = getSesionEnCurso();
    return s && s.metaKey === metaKey ? s : null;
  });
  const [fase, setFase] = useState<Fase>(() => {
    if (isCompleted) return 'cerrada';
    const s = getSesionEnCurso();
    return s && s.metaKey === metaKey ? 'trabajo' : 'checkin';
  });
  const [cierre, setCierre] = useState<{
    emocionIn: EmocionSesion | null; emocionOut: EmocionSesion; compromisos: string[]; duracion: number;
  } | null>(null);
  const [cerrando, setCerrando] = useState(false);

  const segundosObjetivo = parseTiempoEstimado(tiempoEstimado);

  // Al completarse la meta durante la sesión → pasar al check-out.
  useEffect(() => {
    if (isCompleted && fase === 'trabajo') setFase('checkout');
  }, [isCompleted, fase]);

  const abrirSesion = async (checkin: { emocion: EmocionSesion; objetivo: string }) => {
    const nueva: SesionEnCurso = {
      metaKey, metaCodigo, metaTitulo,
      checkinEmocion: checkin.emocion,
      checkinObjetivo: checkin.objetivo,
      segundosAcumulados: 0,
      corriendoDesde: Date.now(),
      pausas: 0,
      iniciadaEn: new Date().toISOString(),
    };
    setSesionEnCurso(nueva);
    setSesion(nueva);
    setFase('trabajo');
    if (userId) {
      const logId = await abrirSessionLog(userId, { codigo: metaCodigo, titulo: metaTitulo }, checkin);
      if (logId) {
        const conLog = { ...nueva, logId };
        setSesionEnCurso(conLog);
        setSesion(conLog);
      }
    }
  };

  const cerrarSesion = async (checkout: { emocion: EmocionSesion; compromisos: string[] }) => {
    if (!sesion) return;
    setCerrando(true);
    const duracion = segundosDeSesion(sesion);
    await cerrarSessionLog(sesion.logId, {
      checkout_emocion: checkout.emocion,
      compromisos: checkout.compromisos,
      duracion_seg: duracion,
      pausas: sesion.pausas,
    });
    try {
      const ultima: UltimaSesion = {
        metaCodigo, metaTitulo,
        checkoutEmocion: checkout.emocion,
        compromisos: checkout.compromisos,
        fecha: new Date().toISOString(),
      };
      localStorage.setItem(KEY_ULTIMA, JSON.stringify(ultima));
    } catch { /* noop */ }
    setCierre({
      emocionIn: sesion.checkinEmocion, emocionOut: checkout.emocion,
      compromisos: checkout.compromisos, duracion,
    });
    setSesionEnCurso(null);
    setSesion(null);
    setCerrando(false);
    setFase('cerrada');
  };

  // Meta ya completada de antes (revisión) o sin usuario: panel directo.
  if (isCompleted && !cierre) return <>{children}</>;

  if (fase === 'checkin') {
    return (
      <CheckInPanel
        metaTitulo={metaTitulo}
        objetivoSugerido={descripcion?.split('.')[0]?.trim() || `Completar: ${metaTitulo}`}
        tiempoEstimado={tiempoEstimado}
        onAbrir={abrirSesion}
      />
    );
  }

  if (fase === 'trabajo' && sesion) {
    return (
      <div className="space-y-4">
        <CronometroSesion sesion={sesion} segundosObjetivo={segundosObjetivo} onSesionChange={setSesion} />
        {children}
      </div>
    );
  }

  if (fase === 'checkout' && sesion) {
    return (
      <CheckOutPanel
        metaTitulo={metaTitulo}
        duracionSeg={segundosDeSesion(sesion)}
        emocionEntrada={sesion.checkinEmocion}
        onCerrar={cerrarSesion}
        cerrando={cerrando}
      />
    );
  }

  // fase 'cerrada' con cierre reciente: "Hoy produjiste esto".
  if (cierre) {
    const inE = EMOCIONES_ENTRADA.find((e) => e.id === cierre.emocionIn);
    const outE = EMOCIONES_SALIDA.find((e) => e.id === cierre.emocionOut);
    return (
      <div className="rounded-2xl border border-[#22C55E]/25 bg-[#22C55E]/5 p-5 space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#22C55E] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Sesión consolidada
        </p>
        <h4 className="text-white font-bold">Hoy produjiste esto</h4>
        <div className="text-sm text-white/70 space-y-1.5">
          <p>✅ <span className="text-white">{metaTitulo}</span> — {formatoCrono(cierre.duracion)} de trabajo real.</p>
          {inE && outE && (
            <p>
              {inE.emoji} Llegaste {inE.label.toLowerCase()} <ArrowRight className="w-3 h-3 inline mx-1 text-white/40" />
              {outE.emoji} te vas {outE.label.toLowerCase()}.
            </p>
          )}
          {cierre.compromisos.length > 0 && (
            <div>
              <p className="text-white/50 text-xs mt-2 mb-1">Tus compromisos (tu mentor los recuerda):</p>
              <ul className="space-y-0.5">
                {cierre.compromisos.map((c, i) => (
                  <li key={i} className="text-white/80">• {c}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <p className="text-[11px] text-white/40">El registro quedó en tu historial. El Camino sigue mañana. 🥋</p>
      </div>
    );
  }

  return <>{children}</>;
}
