# TCD · Documento maestro

Especificación completa de la app Tu Clínica Digital. Todo lo que sigue está
escrito para que se construya sin volver a preguntar.

**Versión:** definitiva · septiembre 2026
**Reemplaza:** toda versión anterior del camino, de los cinturones y del roadmap.

---

## 0. Qué es este producto

Una app donde un profesional de salud pasa, en noventa días, de vender sesiones
sueltas a tener una clínica digital que le trae diez consultantes a su precio
digno.

**Es un producto completo por sí mismo.** La mentoría es opcional y se vende
aparte. Si nadie contesta un solo mensaje, el cliente igual llega al final.
Cada vez que en la especificación aparezca algo que dependa de una persona,
está mal y hay que resolverlo con un agente, una regla o una evidencia
automática.

### El circuito de los tres sistemas

| Sistema | Qué es | Quién lo usa | Estado |
|---|---|---|---|
| **TCD** | La app del camino. Donde recorre, entrena y prueba. | El cliente, 90 días | Este documento |
| **Sistema** | GoHighLevel marca blanca en `sistema.tuclinica.digital`. Páginas, formularios, calendarios, pagos, conversaciones, automatizaciones. | El cliente, para siempre | Entregado por etapas |
| **MCD** | Mi Clínica Digital. La máscara de GHL: consultantes, agenda, cobros, números. | El cliente, para siempre | Se especifica después |

TCD enseña y entrena. El Sistema ejecuta. MCD dirige.
Las tres se tocan en tres puntos y solo en tres: el link de pago (día 9), el
circuito de captación (día 22 a 31) y la entrega (día 47 a 53).

---

## 1. Las tres salas y los cinco tabs

El cliente tiene que saber siempre en qué sala está y qué verbo le toca.

| Sala | Verbo | Qué contiene |
|---|---|---|
| **El Camino** | Recorrer | Los 90 días, las evidencias, los cinturones, los manuales, el cuaderno |
| **El Dojo** | Entrenar | El ADN y los ocho agentes. Se practica contra algo que responde |
| **Mi Clínica** | Dirigir | Consultantes, agenda, cobros, números (abre MCD) |

### Barra inferior · cinco tabs, nunca seis

```
[ Hoy ]  [ Camino ]  [ Dojo ]  [ Mando ]  [ Clínica ]
```

**Hoy** — la sesión del día, la jornada de cuatro horas, el marcador y el freno activo.
**Camino** — los cinco sistemas, los 90 días, evidencias, cinturón, biblioteca, cuaderno.
**Dojo** — el ADN arriba, los ocho agentes abajo, el Ring con el historial de sparring.
**Mando** — tres solapas: Creativos · Campañas · Números.
**Clínica** — abre MCD en ventana propia.

**Regla de navegación:** desde cualquier pantalla, dos toques para llegar a
cualquier lado. Si algo pide tres, está mal ubicado.

---

## 2. Pantalla Hoy · la más importante de la app

Es la única pantalla que el cliente abre sin pensar. Tiene que contestar cuatro
cosas en menos de tres segundos: **dónde estoy, qué hago hoy, cuánto me lleva,
qué me llevo.**

### Bloques, en orden

1. **Cabecera** — Día N de 90 · avatar · cinturón actual como tira de color
2. **Barra de progreso** — sistema actual y posición dentro del sistema
3. **Tarjeta de hoy** — kicker HOY · título de la sesión · una línea de qué es ·
   chip de duración · chip de qué sella · botón Empezar
4. **La jornada** — tres bloques de la jornada de 4 horas con el bloque actual
   marcado. Atender · Construir · Dirigir
5. **Mañana** — una línea, siempre visible, para que el día siguiente no sorprenda
6. **Marcador** — solo desde el día 31: gasto, entradas, agendas, costo por agenda
7. **Freno activo** — si hay un bloqueo, se muestra acá con su motivo y su fecha
   de apertura. Nunca un candado sin explicación

### Estados de la tarjeta de hoy

| Estado | Cuándo | Qué muestra |
|---|---|---|
| `pendiente` | Sesión sin abrir | Botón Empezar |
| `en_curso` | Abierta sin evidencia | Botón Continuar + barra de pasos |
| `evidencia` | Vista, falta subir | Botón Subir evidencia, destacado |
| `en_revision` | Evidencia subida | Reloj + qué se está validando |
| `a_corregir` | Evidencia rechazada | Motivo exacto y qué cambiar |
| `completa` | Sellada | Tilde + qué se desbloqueó |
| `campo` | Día sin sesión | Las tres acciones concretas del día |
| `frenada` | Bloqueo activo | Motivo, fecha de apertura, qué hacer mientras |

**Nunca existe el estado "libre".** Un día sin sesión es un día de campo con tres
acciones escritas.

---

## 3. La jornada de cuatro horas

El camino no se hace *además* del día del cliente. El camino **es** el día que va
a tener al final, ensayado desde el día 1.

| Bloque | Horas | Qué |
|---|---|---|
| 1 · Atender | 2 h | Sus consultantes. Lo único que ya hace bien y no cambia |
| 2 · Construir | 1 h | La sesión del camino y su tarea |
| 3 · Dirigir | 1 h | Llamadas, mensajes, números. Vacío al principio, lo que sostiene todo al final |

Lunes a viernes. Sábado y domingo el dojo cierra. Las únicas excepciones son las
cuatro jornadas largas, avisadas con fecha desde la bienvenida.

**El total verificado sobre el seed: 4.265 minutos, unas 71 horas en noventa
días.** Cinco horas y media por semana. Esa es la cifra que va en la bienvenida,
en vez de un promedio diario que se rompe en la semana 5.

**La aritmética que hay que mostrar en la bienvenida y repetir en el día 55:**
diez protocolos de doce semanas ocupan cerca de dos horas por día de atención
real, porque lo que antes eran cuarenta sesiones sueltas ahora es un recorrido
con estaciones y una parte grabada. Diez personas a su precio digno es diez mil.
No es trabajar más: es dejar de repartir las mismas horas entre cuarenta
personas que pagan poco.

---

## 4. Los cinco sistemas

Los 90 días viven adentro de cinco bloques. Las sesiones nunca se muestran todas
juntas: se muestran dentro de su sistema.

| # | Sistema | Días | Qué sale de acá |
|---|---|---|---|
| 1 | Tú | 1–12 | Su clínica cargada, su número, su precio digno, su cartera ordenada |
| 2 | Tu programa | 15–19 | Método probado, oferta, garantía, escalera |
| 3 | Tu sistema de venta | 22–46 | Circuito, página, VSL, formulario, campaña, llamada |
| 4 | Tu clínica adentro | 2 y 47–53 | Mi Clínica desde el día 2, y su app de entrega en el mes 2 |
| 5 | Tu plan de marca | 61–67 | Matriz ABC y las doce semanas escritas |

El sistema 4 es el único con dos momentos, y hay que decirlo: **se ordena el día
2 lo que ya tiene, y se arma en el mes 2 lo que va a entregar.**

---

## 5. Motor de frenos

Los frenos son lo que hace que esto funcione sin mentor. Son reglas duras, no
sugerencias. Cada freno tiene motivo visible y fecha o condición de apertura.

| ID | Freno | Condición de apertura | Motivo que se muestra |
|---|---|---|---|
| `F-ORDEN` | No se abre una sesión sin cerrar la anterior | Evidencia anterior aprobada | "El orden es el método. Terminá la de ayer." |
| `F-PAGINA` | El día 26 no abre sin el enlace de la página cargado | Campo `url_pagina` con http | "Sin página publicada, el guion del video no tiene dónde vivir." |
| `F-RODAJE` | La fecha de rodaje se bloquea en el día 19 | Fecha y hora elegidas | "Elegí el día. El rodaje que no tiene fecha no ocurre." |
| `F-14DIAS` | La sesión de escalar y apagar queda cerrada del 31 al 45 | Día 46 | "Faltan N días. Tu campaña está aprendiendo." |
| `F-TABLERO` | El Tablero responde "todavía no" a cualquier cambio entre el 31 y el 45 | Día 46 | — |
| `F-COMPRA` | No puede invitar a un consultante sin hacer la compra de prueba | Evidencia de compra propia | "Comprate a vos mismo antes de invitar a nadie." |
| `F-PRECIO` | El precio del día 17 no puede ser menor al del día 9 | Validación numérica | "Tu oferta no puede valer menos que lo que ya cobrás." |
| `F-ADN` | Ningún agente arranca con el ADN vacío en los campos que necesita | Campos requeridos del agente | "El Escriba necesita tu oferta. Volvé al día 17." |

---

## 6. Sala de evidencias y validación automática

Once grados, sesenta y nueve evidencias. Ninguna se valida con una tarea
tildada: todas piden una captura, un archivo, un número o un texto.

### Tipos de evidencia

| Tipo | Qué sube | Cómo se valida |
|---|---|---|
| `numero` | Un valor | Rango y formato |
| `texto` | Un escrito | El agente correspondiente lo juzga contra una rúbrica |
| `imagen` | Captura o foto | Agente de visión contra una lista de cosas que tienen que aparecer |
| `url` | Un enlace | Se visita: responde 200, contiene los elementos requeridos |
| `archivo` | Video o audio | Duración mínima, y transcripción juzgada contra rúbrica |
| `evento` | Algo que pasó en el Sistema | Webhook desde GHL. No se sube: se detecta |

### Estados

`pendiente` → `en_revision` → `aprobada` | `a_corregir`

**El rechazo nunca es genérico.** Devuelve qué falta, en una lista de como mucho
tres puntos, y qué sesión repasar. La tercera corrección seguida en la misma
evidencia abre un aviso: "esto lo resolvés más rápido en el Dojo con [agente]".

---

## 7. El ADN · fuente única de verdad

Vive arriba del Dojo. Todos los agentes lo leen. Se completa solo, sesión a
sesión: el cliente nunca lo llena de una vez.

```
adn = {
  identidad:   { nombre, profesion, anios_ejercicio, ciudad, pais },
  historia:    { por_que_empezo, los_tres_que_formaron, el_permiso },
  numeros:     { hora_real_neta_inicial, ingreso_mensual_actual,
                 precio_viejo, precio_digno, hora_real_neta_final },
  avatar:      { a_quien, dolor, deseo, obstaculo, por_que_ahora,
                 matriz_abc },
  metodo:      { nombre, siglas, etapas[], punto_inicial, punto_final,
                 como_se_mide, aprobado_por_critico },
  oferta:      { promesa, plazo, entregables[], precio, escalera[5] },
  garantia:    { frase, compromisos[3], que_pasa_si_no_cumple },
  transicion:  { suben[], terminan[], derivan[] },
  voz:         { frases_propias[], palabras_prohibidas[], muestras_audio[] },
  sistema:     { url_pagina, url_vsl, url_formulario, url_agenda,
                 link_pago, whatsapp, pixel_id, cuenta_ads },
  trafico:     { audiencia_contada, rama },  // "frio" | "tibio"
  entrega:     { estaciones[], que_va_grabado[], que_va_en_vivo[],
                 linea_base[], alta_7_pasos[], tres_limites[] },
  cuaderno:    { salidas_protocolo[] }
}
```

**Regla:** cada sesión declara qué campos del ADN escribe. Si una sesión no
escribe ninguno, sobra.

---

## 8. Los ocho agentes del Dojo

Ninguno está disponible el día 1. Cada uno se abre con una evidencia, y esa
evidencia es exactamente lo que el agente necesita para servir de algo.

| Agente | Día | Se abre con | Qué hace |
|---|---|---|---|
| El Espejo | 3 | Hora real neta cargada | Acompaña las tres aperturas del protocolo. Pregunta, no interpreta |
| El Crítico | 15 | Método escrito | Juzga contra los tres exámenes. Puede reprobar |
| El Escriba | 22 | Oferta, garantía y escalera selladas | Escribe página, VSL y anuncios con su voz |
| La Cámara | 24 | Perfil cerrado | Arma el set, corrige luz y encuadre, marca las pausas del guion |
| El Sparring | 28 | Agenda de prueba completada | Actúa al consultante, objeta, devuelve los cuatro números |
| El Tablero | 33 | Campaña activa | Lee sus cuatro números, dice el cuello y la acción |
| El Arquitecto | 47 | Primer cobro del sistema | Arma la cinta, las estaciones y la línea base |
| El Estratega | 61 | Cinturón rojo | Matriz ABC y las doce semanas. Solo escribe |

Detalle completo, prompts y límites: `agentes/02-AGENTES.md`.

---

## 9. Los once cinturones

Los reales del taekwondo. El color cuenta la historia de una semilla que se
vuelve árbol, y esa es exactamente la historia del camino.

| Grado | Cinturón | Día | Forma (evidencia) |
|---|---|---|---|
| 10.º gup | Blanco | 1 | Búnker abierto y pacto publicado |
| 9.º gup | Blanco punta amarilla | 3 | Su hora real neta escrita a mano |
| 8.º gup | Amarillo | 12 | Captura del primer cobro a su cartera |
| 7.º gup | Amarillo punta verde | 16 | Método aprobado por el Crítico |
| 6.º gup | Verde | 19 | Oferta completa en una página |
| 5.º gup | Verde punta azul | 25 | El enlace vivo de su página |
| 4.º gup | Azul | 28 | Agendarse a sí mismo de punta a punta |
| 3.º gup | Azul punta roja | 31 | Campaña activa con fecha y hora |
| 2.º gup | Rojo | 45 | El cobro de alguien que no lo conocía |
| 1.º gup | Rojo punta negra | 55 | Captura desde el celular de su consultante |
| 1.er Dan | Negro | 90 | Los dos números lado a lado |

**El negro no es el final: es el primer Dan.** Eso resuelve el día 88 sin que
suene a venta.

Detalle: `03-CINTURONES.md`.

---

## 10. Lo que se suma y no existía

Seis cosas que faltaban para que el producto sea autónomo.

**La Biblioteca.** Los cuatro manuales adentro de la app, por paneles, con
buscador. Cada video abre nombrando su panel y ese panel es un enlace vivo. Sin
esto, cada duda termina en un mensaje a Javo.

**El Cuaderno.** Donde viven las salidas del protocolo: las frases, las listas,
el permiso, el audio del ancla. El Espejo se lo devuelve el día del examen.

**El Ring.** Historial de sparring: cada llamada practicada con sus cuatro
números, en línea de tiempo. Es lo que hace visible que está mejorando.

**El Mando.** Creativos, Campañas y Números en un solo lugar, con solapas.

**El Reloj.** La jornada de cuatro horas con sus tres bloques, en la pantalla Hoy.

**SOS.** Un botón único que abre el agente correcto según dónde está parado.
Nunca un formulario de contacto, nunca un mail. La respuesta correcta a "estoy
trabado" es un agente, no una persona.

---

## 11. Reglas de producto que no se negocian

1. **El orden se respeta.** Una puerta por día, y no se abren dos.
2. **Sin evidencia no hay avance.** Ninguna captura, ningún grado.
3. **Ningún candado sin motivo.** Todo bloqueo dice por qué y hasta cuándo.
4. **Ningún día vacío.** El día sin sesión tiene tres acciones concretas.
5. **Las fuentes se usan, no se nombran.** Ver `04-PROTOCOLO.md`.
6. **Esto no es terapia y se dice una vez, el día 3.**
7. **Toda duda va a un agente antes que a una persona.**
8. **Nada se pide dos veces.** Si un dato ya está en el ADN, no se vuelve a preguntar.

---

## 12. Índice del paquete

```
00-MAESTRO.md                  este documento
01-PIEZAS.md                   las 43 piezas de video y los 21 tutoriales
03-CINTURONES.md               los 11 grados y sus evidencias
04-PROTOCOLO.md                mindset y bodyset, las 3 aperturas
camino/MES-1.md                días 0 a 33, micro paso a paso
camino/MES-2.md                días 34 a 60
camino/MES-3.md                días 61 a 90
agentes/02-AGENTES.md          los 8 agentes con sus prompts
salas/05-MANDO-CREATIVOS.md    el tab de creativos
salas/06-MANDO-CAMPANAS.md     el tab de campañas
salas/07-BIBLIOTECA-CUADERNO.md
salas/08-SISTEMA-Y-MCD.md      contrato con GHL y con MCD
datos/09-ESQUEMA.md            modelo de datos
datos/roadmap.seed.json        las 91 jornadas en JSON (día 0 al 90)
datos/generar_seed.py          genera el seed · fuente de verdad de los números
10-DISENO.md                   sistema visual y reglas de diseño
```
