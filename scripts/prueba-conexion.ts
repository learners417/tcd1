/**
 * Pruebas de la lectura de fallas.
 *
 * Lo que se juega: confundir «no hay internet» con «el servidor falló» hace
 * que el cliente reintente veinte veces o que abandone cuando solo tenía que
 * caminar media cuadra.
 *
 * Correr con: npx tsx scripts/prueba-conexion.ts
 */
import { causaDe, mensajeDeFalla, hayInternet } from '../src/lib/conexion';

let fallas = 0;
const linea = (ok: boolean, txt: string) => {
  if (!ok) fallas++;
  console.log(`${ok ? '✓' : '✗'} ${txt}`);
};

const err = (msg: string, status?: number) => {
  const e = new Error(msg) as Error & { status?: number };
  if (status) e.status = status;
  return e;
};

console.log('══ de qué es la culpa ══');
linea(causaDe(err('Failed to fetch')) === 'sin_internet',
  'el error típico del navegador sin red se lee como falta de internet');
linea(causaDe(err('NetworkError when attempting to fetch resource')) === 'sin_internet',
  'y su variante también');
linea(causaDe(err('The operation was aborted')) === 'sin_internet',
  'un pedido abortado cuenta como problema de red');
linea(causaDe(err('invalid JWT', 401)) === 'permiso',
  'un 401 es sesión vencida, no red caída');
linea(causaDe(err('forbidden', 403)) === 'permiso', 'un 403 también');
linea(causaDe(err('boom', 500)) === 'servidor', 'un 500 es del servidor');
linea(causaDe(err('rpc guardar_semana_cliente failed')) === 'servidor',
  'un error de la base es del servidor, no del cliente');
linea(causaDe(err('cualquier otra cosa')) === 'desconocida',
  'lo que no se reconoce no se inventa: queda como desconocida');

console.log('\n══ lo que ve el sanador ══');
const m1 = mensajeDeFalla(err('Failed to fetch'), 'guardar');
linea(!m1.includes('fetch') && !m1.includes('Error'),
  'nunca se le muestra el error técnico');
linea(m1.includes('no se perdió'),
  'sin internet se le dice que su trabajo sigue ahí');
linea(m1.includes('guardar'), 'y qué era lo que estaba haciendo');

const m2 = mensajeDeFalla(err('jwt expired', 401));
linea(m2.includes('sesión') && m2.includes('sigue donde estabas'),
  'con la sesión vencida, la acción es volver a entrar');

const m3 = mensajeDeFalla(err('boom', 500), 'cargar');
linea(m3.includes('No es tu conexión'),
  'con el servidor caído se le aclara que NO es su conexión');
linea(m3.includes('cargar'), 'y respeta lo que estaba haciendo');

console.log('\n══ bordes ══');
linea(typeof hayInternet() === 'boolean', 'la detección funciona sin navegador');
linea(!!mensajeDeFalla(null), 'un error nulo igual da un mensaje');
linea(!!mensajeDeFalla(undefined), 'y uno indefinido también');
linea(!mensajeDeFalla(err('x')).includes('undefined'),
  'sin decir "undefined" en la cara del cliente');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
