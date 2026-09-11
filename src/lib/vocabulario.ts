/**
 * vocabulario.ts — Cómo se llama a quien el cliente atiende.
 *
 * El camino se escribe con tokens, no con palabras fijas: `{{consultante}}`.
 * Al leerlo, se reemplaza por la palabra de SU familia profesional.
 *
 * Un coach no tiene pacientes. Un entrenador tampoco. Un formador menos.
 * El campo `especialidad` del perfil ya existe: esto lo usa.
 */

export type FamiliaProfesional = 'clinica' | 'acompanamiento' | 'formacion';

interface Vocabulario {
  singular: string;
  plural: string;
  articulo: string;   // "tu paciente" vs "tu consultante"
}

const VOCABULARIOS: Record<FamiliaProfesional, Vocabulario> = {
  clinica:         { singular: 'paciente',    plural: 'pacientes',    articulo: 'tu paciente' },
  acompanamiento:  { singular: 'consultante', plural: 'consultantes', articulo: 'tu consultante' },
  formacion:       { singular: 'alumno',      plural: 'alumnos',      articulo: 'tu alumno' },
};

/** Especialidad declarada en el perfil → familia. */
const MAPA_ESPECIALIDAD: Record<string, FamiliaProfesional> = {
  'Psicólogo/a': 'clinica',
  'Psicóloga': 'clinica',
  'Psicólogo': 'clinica',
  'Médico/a': 'clinica',
  'Médica': 'clinica',
  'Médico': 'clinica',
  'Nutricionista': 'clinica',
  'Terapeuta': 'clinica',
  'Kinesiólogo/a': 'clinica',
  'Odontólogo/a': 'clinica',
  'Coach': 'acompanamiento',
  'Coach ontológico': 'acompanamiento',
  'Mentor/a': 'acompanamiento',
  'Guía': 'acompanamiento',
  'Consultor/a': 'acompanamiento',
  'Entrenador/a': 'formacion',
  'Personal trainer': 'formacion',
  'Docente': 'formacion',
  'Formador/a': 'formacion',
  'Profesor/a': 'formacion',
};

/** Devuelve la familia a partir de la especialidad. Por defecto, clínica. */
export function familiaDeEspecialidad(especialidad?: string | null): FamiliaProfesional {
  if (!especialidad) return 'clinica';
  const exacta = MAPA_ESPECIALIDAD[especialidad.trim()];
  if (exacta) return exacta;
  const e = especialidad.toLowerCase();
  if (/coach|mentor|guía|guia|consultor|acompañ/.test(e)) return 'acompanamiento';
  if (/entrenador|trainer|docente|profesor|formador|instructor/.test(e)) return 'formacion';
  return 'clinica';
}

/**
 * Reemplaza los tokens de un texto por el vocabulario de la familia.
 * Tokens: {{consultante}} {{consultantes}} {{tu_consultante}}
 * Respeta mayúscula inicial: {{Consultante}} → "Paciente".
 */
export function aplicarVocabulario(texto: string, familia: FamiliaProfesional = 'clinica'): string {
  if (!texto) return texto;
  const v = VOCABULARIOS[familia];
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  return texto
    .replace(/\{\{consultantes\}\}/g, v.plural)
    .replace(/\{\{Consultantes\}\}/g, cap(v.plural))
    .replace(/\{\{tu_consultante\}\}/g, v.articulo)
    .replace(/\{\{Tu_consultante\}\}/g, cap(v.articulo))
    .replace(/\{\{consultante\}\}/g, v.singular)
    .replace(/\{\{Consultante\}\}/g, cap(v.singular));
}

/** La palabra suelta, para armar frases en el Mentor. */
export function palabraDe(familia: FamiliaProfesional = 'clinica'): Vocabulario {
  return VOCABULARIOS[familia];
}

// ─── Estado del vocabulario en curso ────────────────────────────────────────
// Los componentes del Camino no reciben el perfil por props. La familia se fija
// una vez, cuando carga el perfil, y VOC() la usa en cada render.

let familiaActual: FamiliaProfesional = 'clinica';

/** Se llama una vez al cargar el perfil del cliente. */
export function setFamiliaActual(especialidad?: string | null): void {
  familiaActual = familiaDeEspecialidad(especialidad);
}

export function getFamiliaActual(): FamiliaProfesional {
  return familiaActual;
}

/** Traduce un texto del Camino al vocabulario de quien lo está leyendo. */
export function VOC(texto?: string | null): string {
  return texto ? aplicarVocabulario(texto, familiaActual) : '';
}
