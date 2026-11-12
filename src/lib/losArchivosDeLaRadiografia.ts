/**
 * LOS ARCHIVOS DE LA RADIOGRAFÍA — lo que el cliente ya publicó.
 *
 * El mapa lo pide con su razón escrita: «un PDF, su libro, un documento, y el
 * enlace de su web o su Instagram. Lo que ya publicó dice más de su negocio
 * que lo que contesta en un formulario».
 *
 * ═══ POR QUÉ ESTO NO ES UN SEGUNDO SUBIDOR ═══
 *
 * La casa ya tiene uno, probado y en uso: `evidencia.ts` sube al bucket
 * `task-attachments` bajo `evidencias/{userId}/{codigo}/`, con el tope de 50 MB
 * y los mensajes de falla ya escritos para el cliente. Escribir un segundo
 * subidor sería tener dos topes, dos mensajes y dos buckets que se van
 * separando — el error que este repo ya pagó con los paisajes y con el día del
 * programa.
 *
 * Así que esto no sube nada: elige la carpeta y delega. Lo único propio es el
 * nombre de la carpeta, y es reservado: `CARPETA` no es el código de ninguna
 * jornada del seed —las jornadas son códigos tipo `P1-D3`— así que lo que el
 * cliente sube acá no puede aparecer nunca como evidencia de una jornada, ni
 * al revés.
 */
import { subirEvidencia, urlEvidencia, type Evidencia } from './evidencia';

/**
 * La carpeta reservada. Con guiones bajos porque `evidencia.ts` reemplaza todo
 * lo que no sea alfanumérico, punto, guión o guión bajo: escribirla ya
 * saneada es lo que hace que el camino sea el que se lee acá.
 */
export const CARPETA = '__radiografia__';

/** Sube un archivo de la radiografía. Mismo tope y mismos mensajes que la evidencia. */
export function subirArchivoDeLaRadiografia(
  userId: string,
  file: File,
): Promise<{ ok: true; evidencia: Evidencia } | { ok: false; motivo: string }> {
  return subirEvidencia(userId, CARPETA, file);
}

/** URL firmada para mirar lo que subió. La misma que usa la evidencia. */
export function urlDelArchivo(path: string): Promise<string | null> {
  return urlEvidencia(path);
}
