/**
 * radarPrecios.ts — Idea #16 · el argumento del shopping, automatizado.
 * Rangos reales de programas high-ticket por familia de especialidad en
 * el mercado hispano (LATAM + España + hispanos US). Curado a mano;
 * actualizable sin tocar código de UI.
 */

export interface RangoPrecio {
  familia: string;
  match: string[]; // palabras clave para detectar la especialidad del perfil
  rango: string;
  ejemplos: string;
}

export const RADAR_PRECIOS: RangoPrecio[] = [
  { familia: 'Psicología y terapia', match: ['psic', 'terap', 'mental', 'ansiedad', 'trauma'], rango: '$600 – $2.500 USD', ejemplos: 'Programas de ansiedad en 8-12 semanas · procesos de trauma · terapia intensiva de pareja' },
  { familia: 'Nutrición y salud metabólica', match: ['nutri', 'aliment', 'metab', 'peso', 'diabet'], rango: '$500 – $2.000 USD', ejemplos: 'Transformación metabólica 90 días · protocolos de descenso con seguimiento · salud hormonal' },
  { familia: 'Medicina y especialidades', match: ['medic', 'doctor', 'dermat', 'endocrin', 'ginec', 'oncol', 'kinesi', 'fisio'], rango: '$800 – $3.500 USD', ejemplos: 'Programas de acompañamiento integral · protocolos post-tratamiento · medicina funcional' },
  { familia: 'Coaching y desarrollo personal', match: ['coach', 'desarrollo', 'lider', 'bienestar', 'mindful', 'espiritual'], rango: '$500 – $3.000 USD', ejemplos: 'Procesos de 90 días 1:1 · programas grupales de transformación · mentorías temáticas' },
  { familia: 'Salud física y movimiento', match: ['entren', 'fitness', 'yoga', 'pilates', 'deport'], rango: '$400 – $1.500 USD', ejemplos: 'Programas de recomposición corporal · rehabilitación guiada · hábitos de movimiento' },
];

const DEFAULT: RangoPrecio = {
  familia: 'Profesionales de salud y transformación',
  match: [],
  rango: '$500 – $2.500 USD',
  ejemplos: 'Programas de transformación de 8-12 semanas con acompañamiento cercano',
};

export function radarPara(especialidad?: string | null): RangoPrecio {
  const esp = (especialidad ?? '').toLowerCase();
  return RADAR_PRECIOS.find((r) => r.match.some((m) => esp.includes(m))) ?? DEFAULT;
}
