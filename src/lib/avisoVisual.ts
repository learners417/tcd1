/**
 * CÓMO SE VE CADA AVISO — en un solo lugar.
 *
 * Estaban dos veces, idénticos: en el Topbar y en la campana. Lo descubrió el
 * compilador al entrar un tipo nuevo —`evidencia`—, que quedó dibujado en una
 * pantalla y con la campana genérica en la otra.
 *
 * Es el patrón de siempre: la copia no falla el día que se hace, falla el día
 * que alguien cambia una de las dos.
 */
import type React from 'react';
import { Bell, CheckCircle2, MessageSquare, Trophy, Shield, ClipboardCheck } from 'lucide-react';
import type { TipoNotificacion } from './notifications';

export const ICONO_DEL_AVISO: Record<TipoNotificacion, React.ElementType> = {
  hito: Trophy,
  tarea: CheckCircle2,
  mensaje: MessageSquare,
  sistema: Bell,
  admin: Shield,
  evidencia: ClipboardCheck,
};

export const COLOR_DEL_AVISO: Record<TipoNotificacion, { text: string; bg: string }> = {
  hito: { text: 'text-gold', bg: 'bg-gold/10' },
  tarea: { text: 'text-success', bg: 'bg-success/10' },
  mensaje: { text: 'text-gold', bg: 'bg-gold/10' },
  sistema: { text: 'text-gold', bg: 'bg-gold/10' },
  admin: { text: 'text-gold', bg: 'bg-gold/10' },
  evidencia: { text: 'text-success', bg: 'bg-success/10' },
};

/** El icono y el color de un tipo, con salida para el tipo que no conocemos. */
export function comoSeVeElAviso(tipo: string): {
  Icono: React.ElementType; color: { text: string; bg: string };
} {
  const t = tipo as TipoNotificacion;
  return {
    Icono: ICONO_DEL_AVISO[t] ?? Bell,
    color: COLOR_DEL_AVISO[t] ?? COLOR_DEL_AVISO.sistema,
  };
}
