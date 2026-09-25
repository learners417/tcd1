/**
 * LO QUE YA DIJO AL ENTRAR.
 *
 * El onboarding pregunta una vez y el Camino lo usa. Nada se pregunta dos
 * veces: cuando llega el día de la captación, de la entrega o de la marca, la
 * sesión le muestra lo que él mismo contestó y arranca desde ahí.
 */
export interface BaseDeOnboarding {
  etiqueta: string;
  valor: string;
}

const CAMPO_POR_DIA: Record<number, { campo: string; etiqueta: string }> = {
  15: { campo: 'avatar', etiqueta: 'Al entrar dijiste sobre tu forma de trabajar' },
  22: { campo: 'llegan', etiqueta: 'Al entrar dijiste que hoy llegan' },
  23: { campo: 'llegan', etiqueta: 'Al entrar dijiste que hoy llegan' },
  47: { campo: 'entrega', etiqueta: 'Al entrar dijiste que entre sesiones das' },
  61: { campo: 'publica', etiqueta: 'Al entrar dijiste que publicas' },
};

export function baseDeOnboarding(dia: number | null | undefined): BaseDeOnboarding | null {
  if (dia === null || dia === undefined) return null;
  const mapa = CAMPO_POR_DIA[dia];
  if (!mapa) return null;
  try {
    const dx = JSON.parse(localStorage.getItem('tcd_diagnostico') ?? '{}') as Record<string, string>;
    const valor = (dx[mapa.campo] ?? '').trim();
    if (!valor) return null;
    return { etiqueta: mapa.etiqueta, valor };
  } catch { return null; }
}
