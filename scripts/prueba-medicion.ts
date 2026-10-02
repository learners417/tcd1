/**
 * prueba-medicion.ts — los seis números, al entrar y al salir.
 */
import { readFileSync } from 'node:fs';
import { CAMPOS, estaCompleta, loQueFalta, comparar, cuantosMejoraron,
         horaReal, lecturaDelCierre, type Medicion } from '../src/lib/medicion';

let fallas = 0;
const ok = (c: boolean, m: string, d = '') => { console.log(`${c ? '✓' : '✗'} ${m}${c || !d ? '' : ' — ' + d}`); if (!c) fallas++; };

const entrada: Medicion = {
  facturacion: 1200, precio_sesion: 30, consultantes: 20,
  horas_atendiendo: 25, horas_whatsapp: 8, sistemas: 0,
};
const salida: Medicion = {
  facturacion: 4000, precio_sesion: 120, consultantes: 12,
  horas_atendiendo: 14, horas_whatsapp: 2, sistemas: 5,
};

console.log('\n── los seis ──');
ok(CAMPOS.length === 6, `son ${CAMPOS.length} números`);
ok(CAMPOS.every((c) => c.pregunta && c.unidad && c.cuandoMejora), 'cada uno se pregunta en su idioma y dice qué significa mejorar');
ok(CAMPOS.filter((c) => c.mejor === 'menos').length === 2, 'dos son mejores cuando bajan: las horas');
ok(CAMPOS.every((c) => !/KPI|métrica|baseline/i.test(c.pregunta)), 'sin tecnicismos en las preguntas');

console.log('\n── obligatoria antes del ADN ──');
ok(estaCompleta(entrada), 'con los seis contestados, está completa');
ok(!estaCompleta({ facturacion: 1200 }), 'con cinco sin contestar, todavía no');
ok(estaCompleta({ ...entrada, facturacion: 0 }), 'un cero es una respuesta válida');
ok(loQueFalta({ facturacion: 1200 }).length === 5, 'y dice exactamente cuáles faltan');
ok(loQueFalta(null).length === 6, 'sin nada cargado, faltan los seis');

console.log('\n── el antes y después ──');
const pares = comparar(entrada, salida);
ok(pares.length === 6, 'seis pares, uno por número');
ok(pares.every((p) => p.entrada !== null && p.salida !== null), 'cada par trae los dos valores');
ok(cuantosMejoraron(pares) === 5, 'cinco de seis mejoraron', String(cuantosMejoraron(pares)));
const consultantes = pares.find((p) => p.campo.id === 'consultantes')!;
ok(!consultantes.mejoro && /Bajó/.test(consultantes.lectura), 'atender menos personas no se cuenta como mejora');
const horas = pares.find((p) => p.campo.id === 'horas_atendiendo')!;
ok(horas.mejoro && horas.diferencia === -11, 'bajar las horas sí es mejora', String(horas.diferencia));
ok(/Recuperaste horas/.test(horas.lectura), 'y se lo dice con sus palabras');

console.log('\n── el número que resume todo ──');
ok(horaReal(entrada) !== null && horaReal(salida) !== null, 'calcula lo que le queda por hora en los dos momentos');
ok((horaReal(salida) ?? 0) > (horaReal(entrada) ?? 0), 'y muestra que su hora vale más', `${horaReal(entrada)} → ${horaReal(salida)}`);
ok(/Tu hora pasó de/.test(lecturaDelCierre(entrada, salida)), 'la frase de cierre nombra ese cambio');
ok(/Carga los seis/.test(lecturaDelCierre(entrada, null)), 'sin la salida, dice qué falta');
ok(horaReal({ ...entrada, horas_atendiendo: 0, horas_whatsapp: 0 }) === null, 'sin horas cargadas no inventa una división');

console.log('\n── nada se pisa ──');
const iguales = comparar(entrada, entrada);
ok(cuantosMejoraron(iguales) === 0 && iguales.every((p) => /igual/i.test(p.lectura)), 'medir lo mismo dos veces no inventa progreso');
ok(comparar(null, salida).every((p) => p.entrada === null && /Falta medirlo/.test(p.lectura)), 'sin entrada, lo dice y no compara');

console.log('\n── dónde vive ──');
const wizard = readFileSync('src/components/WelcomeWizard.tsx', 'utf8');
ok(/'numeros'/.test(wizard) && /KEY_ENTRADA/.test(wizard), 'la entrada se pide en el onboarding');
ok(/disabled=\{!estaCompleta\(medicionEntrada\)\}/.test(wizard), 'y no deja seguir hasta que estén los seis');
ok(wizard.indexOf("'origen', 'numeros'") > 0, 'va después de su origen y antes de que se arme su ADN');

const roadmap = readFileSync('src/pages/Roadmap.tsx', 'utf8');
const pantalla = readFileSync('src/components/tasks/AntesYDespues.tsx', 'utf8');
ok(/AntesYDespues/.test(roadmap) && /codigoDelDia\(82\)/.test(roadmap), 'la salida se pide en la jornada del día 82');
ok(/adn_medicion_salida/.test(roadmap), 'y queda guardada en su perfil');
ok(/Corregir un número/.test(pantalla), 'se puede corregir un número después de verlo');
ok(!/text-xs|text-sm/.test(pantalla), 'sin letra chica');

const seed = JSON.parse(readFileSync('src/lib/roadmap.seed.json', 'utf8')) as { jornadas: Array<{ dia: number; minutos: number; titulo: string }> };
const d82 = seed.jornadas.find((j) => j.dia === 82)!;
ok(d82.minutos > 0 && /seis números/i.test(d82.titulo), 'el día 82 es una jornada con su tiempo');
ok((82 - 1) % 7 < 5, 'y cae en día hábil, como el resto del Camino');

console.log(fallas === 0 ? '\n✓ TODO EN VERDE\n' : `\n✗ ${fallas} FALLAS\n`);
process.exit(fallas === 0 ? 0 : 1);
