# Revisión final

Auditoría cruzada del paquete completo, antes de cerrar. Cada documento contra el
seed, y el seed contra sí mismo.

**Fecha:** septiembre 2026 · **Versión:** 2026.09 · **Estado:** cerrado.

---

## 1 · Lo que se corrigió en esta revisión

| Dónde | Decía | Dice |
|---|---|---|
| `00-MAESTRO.md` §6 | "Nueve grados, cuarenta y tres evidencias" | **Once grados, sesenta y nueve evidencias** |
| `00-MAESTRO.md` §12 | "las 90 jornadas" | **91 jornadas, día 0 al 90** |
| `00-MAESTRO.md` §3 | Sin cifra total de carga | **4.265 minutos ≈ 71 horas**, verificado sobre el seed |
| `camino/MES-1.md` | Días 6 y 7 aparecían como sesión y como campo | **Son sesiones de protocolo.** Si caen fin de semana, se mueven al lunes |
| Índice | Faltaban `10-DISENO.md` y `generar_seed.py` | Agregados |

**El número de horas era el error más caro.** Se venía diciendo ochenta; el seed
da setenta y uno. Ochenta era una estimación a ojo, setenta y uno es la suma de
las noventa y una jornadas. **Cinco horas y media por semana** es la cifra que va
en la bienvenida.

---

## 2 · Verificación cruzada

Corrida con script contra `roadmap.seed.json`.

| Control | Resultado |
|---|---|
| Piezas del seed presentes en `01-PIEZAS.md` | 43 de 43 ✅ |
| Tutoriales presentes | 21 de 21 ✅ |
| Cinturones presentes en `03-CINTURONES.md` | 11 de 11 ✅ |
| Agentes presentes en `02-AGENTES.md` | 8 de 8 ✅ |
| Días de cinturón coincidentes | 11 de 11 ✅ |
| JSON válido y parseable | ✅ |
| Jornadas sin hueco, día 0 al 90 | 91 de 91 ✅ |

Para repetir la verificación después de cualquier cambio:

```bash
cd tcd-spec && python3 datos/generar_seed.py
```

**Si un número de la documentación no coincide con lo que imprime el script, el
script tiene razón.**

---

## 3 · El producto, en una tabla

| | |
|---|---|
| Duración | 90 días · 91 jornadas |
| Carga del cliente | 4.265 min ≈ **71 horas** · 5 h 30 por semana |
| Jornada objetivo | 4 horas, lunes a viernes |
| Sesiones con video | 42 |
| Sesiones de protocolo | 6 |
| Jornadas de rodaje del cliente | 2 |
| Días de campo | 10 |
| Días de ciclo | 29 |
| Piezas de video de Javo | 43 · **279 minutos** · 4 jornadas de rodaje |
| Tutoriales de Lupe | 21 · 106 minutos |
| Evidencias | 69 |
| Cinturones | 11 · los del taekwondo |
| Agentes | 8 |
| Frenos | 9 |
| Tabs | 5 |
| Salas de apoyo | 5 |

---

## 4 · Las diez decisiones que definen el producto

Si algo se discute más adelante, que se discuta contra esta lista.

**1 · Mi Clínica entra el día 2, no el 45.** Carga sus consultantes actuales antes
de construir nada, y eso le libera la cabeza para lo que viene.

**2 · La primera plata sale de su cartera, no de la pauta.** Cobra al precio nuevo
el día 12. Esa plata financia la campaña del día 31.

**3 · El embudo se bifurca por audiencia, con una pregunta con número.** Página,
video y formulario son los mismos en las dos ramas. Lo único que cambia es a
quién se le muestra el anuncio.

**4 · El Dojo es una sala, no la app.** Recorrer, entrenar, dirigir: tres verbos,
tres lugares.

**5 · Ocho agentes que se ganan.** Cada uno se abre con la evidencia que necesita
para servir de algo.

**6 · El protocolo interior se reparte en tres aperturas**, nunca a más de dos días
de la situación real que lo prueba.

**7 · Las fuentes se usan, no se nombran.** Mismo ejercicio, castellano común,
cero deserción por el envase.

**8 · Los once grados del taekwondo**, con el color contando la historia. El negro
es el primer Dan, no el final.

**9 · TCD no escribe en GHL.** Salvo plantillas de mensaje. Si la app construye
por él, el día 91 depende para siempre.

**10 · Ningún grado bloquea el camino**, solo bloquea agentes. Un mal mes no puede
dejar a nadie parado.

---

## 5 · Lo que queda abierto, a propósito

Tres cosas que no se cierran acá porque dependen de una decisión tuya o de un
paquete siguiente.

**El alcance del manual de anuncios dentro del producto.** Entró la parte que
sirve al embudo de página con VSL. Quedó afuera todo lo de campañas de mensajes,
cupos por DM y motores de recuperación. **Si se abre entero, se regala lo que
después se vende en el programa siguiente.** Se cambia en una línea de
`05-MANDO-CREATIVOS.md`.

**MCD.** Acá está el contrato —qué necesita TCD de MCD y qué no hace MCD— pero no
la especificación. Va en el paquete siguiente.

**Los paneles de los cuatro manuales.** La Biblioteca está especificada; los
códigos de panel de El Liderazgo, El Camino y La Llamada están nombrados como
`LID-n`, `CAM-n`, `LLA-n`. **La Clínica ya tiene sus seis códigos reales.** Los
otros tres se numeran cuando se carguen los manuales.

---

## 6 · Orden de construcción sugerido

Para el chat que construye. Cinco etapas, cada una usable por sí sola.

**Etapa 1 · el esqueleto.** `00-MAESTRO` + `datos/09-ESQUEMA` + el seed. Cinco
tabs, pantalla Hoy, máquina de estados, motor de frenos. **Con esto ya se puede
recorrer el camino completo sin agentes.**

**Etapa 2 · evidencias.** Los seis tipos, la validación por regla, los estados de
rechazo. Los cinturones. Acá el producto empieza a ser un dojo y no un curso.

**Etapa 3 · los agentes.** Primero el Crítico y el Sparring, que son los dos que
más cambian el resultado. Después el Espejo, que es el más delicado. El resto en
orden de día.

**Etapa 4 · el Mando.** Creativos, Campañas y Números. Conexión con Meta de
lectura primero, las tres acciones de escritura después.

**Etapa 5 · las salas de apoyo.** Biblioteca, Cuaderno, Ring, Reloj, SOS.

**El diseño (`10-DISENO.md`) se aplica desde la etapa 1.** No es una capa final:
las doce reglas para TDAH cambian cómo se arma cada pantalla, no cómo se pinta.

---

## 7 · Criterio para agregar cualquier cosa de acá en adelante

Tres preguntas. Si alguna da que no, no entra.

**¿Reemplaza un motivo por el que hoy te escriben?** La tabla del final de
`07-BIBLIOTECA-CUADERNO.md` tiene los doce motivos. Si aparece uno nuevo que no
está, falta una sala. Si no reemplaza ninguno, sobra.

**¿Cambia lo que el cliente hace hoy?** Un número que no habilita ni deshabilita
una acción es entretenimiento. La pantalla de Campañas no muestra alcance ni CTR
por esta regla, y la de Creativos no muestra vistas.

**¿Pasa las tres pruebas de pantalla?** Tres segundos, interrupción, un solo
botón. Están en `10-DISENO.md` §11.
