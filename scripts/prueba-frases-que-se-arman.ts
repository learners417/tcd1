/**
 * NINGUNA FRASE ARMADA A PEDAZOS DICE UNA INCOHERENCIA
 *
 * ═══ DE DÓNDE SALE ═══
 *
 * El semáforo de clientes —la pantalla que el equipo abre todas las mañanas—
 * mostraba esto en la tarjeta de cada persona:
 *
 *     entró todavía no entró · 23 días de acceso
 *
 * `fechaCorta()` devolvía dos cosas distintas con el mismo tipo: un pedazo
 * de fecha —«12 nov»— que necesita el «entró» adelante, y una frase entera
 * —«todavía no entró»— que no. El que llamaba le ponía el prefijo a las dos.
 *
 * Estuvo así vaya a saber cuánto, porque el visor del Admin no tenía
 * clientes: medía el estado vacío y esa línea no se dibujaba nunca.
 *
 * ═══ QUÉ MIRA ═══
 *
 * Arma las frases del semáforo con los casos de borde que de verdad pasan
 * —sin último ingreso, sin ventana de acceso— y busca las dos formas en que
 * una frase armada a pedazos se rompe: un verbo pegado a otro verbo, y un
 * pedazo que quedó vacío dejando un separador suelto.
 */
import { lineaDeEstado } from '../src/components/admin/SemaforoClientes';

let fallas = 0;
const casos = [
  { nombre: 'nunca entró, con acceso',    ultimoIngreso: null,         diasDeVentana: 23 },
  { nombre: 'nunca entró, sin acceso',    ultimoIngreso: null,         diasDeVentana: null },
  { nombre: 'entró, con acceso',          ultimoIngreso: '2026-11-02', diasDeVentana: 23 },
  { nombre: 'entró, sin acceso',          ultimoIngreso: '2026-11-02', diasDeVentana: null },
];

/* Dos verbos pegados es lo que pasó: «entró todavía no entró». */
const VERBO_DOBLE = /\b(entró|falta|queda|tiene)\s+(?:\w+\s+){0,2}\b(entró|falta|queda|tiene)\b/i;

for (const c of casos) {
  const linea = lineaDeEstado(c.ultimoIngreso, c.diasDeVentana);

  if (VERBO_DOBLE.test(linea)) {
    fallas += 1;
    console.log(`✗ ${c.nombre}: dos verbos en la misma frase → «${linea}»`);
  }
  if (/·\s*·|^\s*·|·\s*$/.test(linea) || /\s{2,}/.test(linea)) {
    fallas += 1;
    console.log(`✗ ${c.nombre}: un pedazo quedó vacío → «${linea}»`);
  }
  if (/undefined|null|NaN/.test(linea)) {
    fallas += 1;
    console.log(`✗ ${c.nombre}: se escapó un valor sin texto → «${linea}»`);
  }
}

if (!fallas) {
  console.log(`✓ las ${casos.length} frases del semáforo se leen enteras y sin repetir verbo`);
  for (const c of casos) console.log(`    ${c.nombre}: «${lineaDeEstado(c.ultimoIngreso, c.diasDeVentana)}»`);
}
process.exit(fallas ? 1 : 0);
