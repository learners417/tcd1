# El mapa de cirugías — de acá a la versión de venta

Escrito el sábado 7 de noviembre de 2026, contra el **Mapa del viaje
completo**: cinco estaciones —Lago, Montaña, Viento, Río, Bosque— cada una con
su libro, su tramo de días, lo que se hace en la app, sus tres piezas de
instalación y su logro con candado.

Reemplaza el plan de diez turnos. **La vara sigue siendo la tuya del 12 de
octubre:** «el mejor vehículo para que mis clientes en automático logren la
promesa, de punto A hacia B».

---

## Primero, la pregunta que ordena todo

**Si el cliente ya tiene Claude, ¿para qué la app?**

Si no se contesta bien, la app es un catálogo caro de cosas que Claude hace
mejor. Contestada bien, la app es lo único que hace que Claude le sirva.

**Claude es el taller. La app es el plano y el capataz.** Cinco cosas que
Claude solo no hace:

| | Por qué la app |
|---|---|
| **Sabe qué pedir hoy** | El encargo sale lleno con su ADN. Una conversación en blanco es donde se pierde: pasa 90 días construyendo en vez de vendiendo |
| **Guarda lo que sale** | Catorce piezas selladas con su fecha. Claude no recuerda entre conversaciones, y él no sabe armarse proyectos |
| **Mide** | La cuenta de los 10 —300 conversaciones, 57 agendas, 40 llamadas, 10 consultantes— con sus números reales adentro |
| **Frena** | El candado: sin su reset no pasa a Montaña, sin su primera venta no enciende pauta. Claude nunca le dice que no |
| **Avisa** | El riego de la mañana, el recordatorio, el viernes de los números. Claude espera a que él abra |

Las dos frases que lo resumen, y que valen para el copy: **la app no reemplaza
a Claude, lo apunta.** Y: **la máquina propone, tú decides, revisas y firmas.**

---

## CIRUGÍA 0 · La alineación — HECHA el 7 de noviembre

Las cinco estaciones son ahora una dimensión real de la app, en
`src/lib/estaciones.ts`: cada una con su libro, su tramo, su color, con qué
se abre y qué deja.

**Lo que el cliente veía:** «Días 48 a 90» como nombre de un tramo. Un rango
no dice dónde está, ni con qué libro, ni qué va a lograr.
**Lo que ve ahora:** «El Lago», «El Río», «Del Viento al Río» cuando cruza.

**No se partió el pilar P9B**, y a propósito: los ids de pilar están cableados
en el esquema del ADN, los cinturones, las compuertas de plan y las respuestas
del Mentor. Partirlo arrastraba seis archivos de plomería para cambiar algo
que el cliente nunca ve. La estación es una dimensión aparte, derivada del
día: el pilar es de la máquina, la estación es del cliente.

**Dos lugares donde el Camino le ganó al mapa, decididos el 7 de noviembre:**

| | Qué ganó |
|---|---|
| **El Río arranca el 37, no el 57** | El cliente arma su app cuando ya tiene a quién meter adentro: vende el 26, su primer consultante entra el 40. Esperar al 57 son 19 días atendiendo a mano a personas que ya pagaron |
| **El ecosistema se queda en el 85 y 86** | El día 85 trae su veredicto escrito: «sesenta días sin publicar fue a propósito; ahora tienes qué vender y cómo venderlo, recién ahora el contenido rinde» |

| Estación | Días | |
|---|---|---|
| El Lago | 1-7 | Tu reset · libertad mental |
| La Montaña | 8-14 | Tu programa · libertad financiera |
| El Viento | 15-36 | Tu captación · libertad emocional |
| El Río | 37-70 | Tu propia app · libertad energética |
| El Bosque | 71-84 | Tu ecosistema · libertad de tiempo |
| El Cierre | 85-90 | Tu trimestre que viene |

**La grilla volvió a tres.** «Tu Camino por dentro» tenía cinco casillas. Las
dos de más tenían otra puerta a lo mismo en la misma pantalla: la Hoja de Ruta
ahora cuelga del anillo de jornadas y los cobros del contador de consultantes.
Ningún panel se borró.

**La lente:** `prueba-las-cinco-estaciones.ts` — que los 90 días estén
cubiertos una sola vez, que los tramos se toquen sin pisarse, que cada estación
diga con qué se abre y qué deja, y que las jornadas comprometidas por el mapa
estén en su tramo.

### Lo que esta cirugía deja anotado

- **El Bosque se quedó sin contenido propio.** Sus catorce días (71-84) son
  operación. Le faltan su perfil, sus cinco alianzas, sus tres invitaciones
  —podcast, live y medio— y su libro, que el mapa pide y la app no tiene.
- **El subtítulo del tramo miente:** el pilar de los días 32 a 38 dice
  «Sistema 1 · Tu reset», que es el sistema del Lago. Va a la cirugía 7.

## CIRUGÍA 1 · Los cinco días que se venden solos

El Lago. Es la oferta de 97 USD y es el protocolo: quien compra esos 97 hace
exactamente estos cinco días.

| Día | Qué trabaja | Qué queda escrito |
|---|---|---|
| **1** | Sentido y propósito | Su frase propia |
| **2** | La rueda de 8 dimensiones + su protocolo de reemplazos | Su medición de entrada, y «si pasa X, hago Y» |
| **3** | Su creencia sobre el dinero | La creencia nueva |
| **4** | Su visión de empresa a 3 años | Su visión en una página |
| **5** | **Su precio nuevo y el valor de su hora** | El número |

**Lo que hace que quieran seguir, y hay que construirlo:**

- **El día 5 cierra con el número sellado y la puerta abierta**, no con un
  cartel de venta. La graduación ya existe; lo que falta es que muestre lo que
  dejó hecho —su precio, su Guardián, su rueda— y recién después lo que sigue.
- **El riego**: el audio de tu voz para cada mañana. No existe en la app
  todavía. Los cinco primeros son los que deciden si vuelve el día 2.
- **La rueda medida el día 2 es su foto de partida**, y vuelve el día 87 como
  foto de llegada. Ese par de números es su testimonio.

**Y la fuga:** la app cobra ese escalón a **27 USD con 21 días** de acceso.
La oferta son **97**. El precio y la ventana tienen que decir lo mismo.

---

## CIRUGÍA 2 · El onboarding que dictamina

Una sola sesión de unos 15 minutos, y entra al terminarla. Extiende las tres
siembras que ya existen —Foto de Partida, el origen en tres preguntas, la
rueda con su Para Qué— y les suma:

**Subir archivos y enlaces.** Un PDF, su libro, un documento, y el enlace de
su web o su Instagram, que la app lee sola. Lo que ya publicó dice más de su
negocio que lo que contesta en un formulario.

**El dictamen**, sobre los cinco ejes que ya están diseñados:

| Eje | Qué define |
|---|---|
| ¿Método propio? | **Avatar A** lo crea · **Avatar B** lo ordena y poda |
| ¿Avatar, oferta y precio? | Los arma, o los valida en versión corta |
| ¿Cuántos servicios? | Podar «mil servicios» a UNA oferta |
| ¿Su relación con el dinero? | Dosis del protocolo |
| ¿Cámara y tiempo? | Cuánto Caro, y el tamaño de cada día |

Avatar B —México y Ecuador— es el mercado principal.

**Termina con tres cosas en pantalla:** en qué etapa está · su ADN provisorio
con fecha de sellado · y su calendario de 90 días, día por día, con las cinco
estaciones a la vista. Ese tercer punto es donde la app se gana el precio.

Regla que se mantiene: nada se pregunta dos veces.

### Corrección del 8 de noviembre, después de leer el código

**Las preguntas ya existen, y son más de las que esta tabla acreditaba.** El
paso `diagnostico` de la bienvenida pregunta **diez** cosas, no cinco: método
propio · freno · nicho · qué pasa cuando dice su precio · tiempo real por día ·
de dónde llegan hoy · qué entrega entre sesiones · cada cuánto publica · cómo
quiere que le hable el Mentor · si el trabajo espiritual es parte de su vida. Y
el paso `situacion` pregunta su escalera.

El encabezado decía «Siete preguntas» con diez abajo. Corregido.

**Y la bienvenida borraba lo que el cliente acababa de escribir.** Los dos
pasos escribían la misma columna jsonb, cada uno con su lista de campos, y el
segundo —el diagnóstico— no incluía `situacion`. Un UPDATE de jsonb reemplaza
el valor entero: la escalera del cliente se perdía un minuto después de
escribirla. Arreglado con un solo compositor, más su lente, probada contra su
propio fallo. Queda anotado que `medir-guardado.py` no tiene bucle de la
bienvenida: es el próximo que le falta.

**Entonces lo que falta de esta cirugía son DOS cosas, las dos mías:**

1. **El dictamen en pantalla.** En qué etapa está · su ADN provisorio con fecha
   de sellado · su calendario de 90 días día por día. Hoy el cierre le promete
   lo mismo a todos: «10 consultantes a tu precio digno y 10 horas menos por
   semana».

2. ~~Que el dictamen sirva para algo: `avatar_tipo` se guarda y nadie lo lee.~~
   **Falso, corregido el 8 de noviembre.** Lo leí mal: busqué `dxAvatar`, el
   nombre de la variable del formulario, en vez de `avatar_tipo`, el de la
   columna. El Mentor **sí** lo lee y le cambia toda la postura — Avatar B
   recibe *«YA tiene años de práctica… tu trabajo es ORDENAR y ponerle nombre,
   no enseñarle desde cero; su dolor es el TECHO»* y Avatar A *«todavía no
   tiene método… acompañalo a construir; su dolor es el PRESENTE»*—, y además
   le pasa las diez respuestas crudas como «el espejo del wow inicial». Estaba
   bien hecho desde antes.

   Lo que **sí** falta: que la letra cambie el CAMINO, no solo el tono del
   Mentor. Hoy las jornadas que crean lo que el Avatar B ya tiene —su avatar,
   su método, su oferta— le salen iguales que al Avatar A. No existe mecanismo
   de «versión corta» en ninguna parte (verificado). Eso es trabajo de producto
   y de contenido: qué jornadas tienen versión corta y qué dice cada una.
   **Decisión de Javo**, anotada acá y no inventada.

Lo que sigue sin estar en ninguno de los dos pasos, y es decisión de producto:
**¿cuántos servicios tiene?** (podar «mil servicios» a UNA oferta) y **la
cámara** (la dosis de Caro). Si entran, entran como preguntas 11 y 12.

---

## LA COLA DE TURNOS — se corre sola, sin que Javo la empuje

Javo pidió el 8 de noviembre que los turnos sigan solos. Esta es la cola. Cada
turno que arranca toma **el primero que no esté cerrado**, lo termina, lo
empaqueta con la batería en verde y lo marca acá. Nada de elegir por gusto.

**La regla que no se negocia:** verificar la premisa ANTES de construir. Nueve
veces de nueve, lo que este mapa daba por faltante ya existía, o lo que daba
por andando estaba ciego. Medir, mirar la captura o los datos reales, y
después tocar. Cada lente nueva se prueba contra su propio fallo.

**Lo que NO se toca solo:** precios, promesas, garantías, y cualquier texto
que el cliente lea en un momento de venta. Eso se propone con opciones y
espera el clic.

| # | turno | estado |
|---|---|---|
| 1 | El dictamen al cerrar la bienvenida | **cerrado** · `d865bda` |
| 2 | El candado: la pauta espera la primera venta | **cerrado** · `906a020` |
| 3 | Mi Clínica nombrada como la casa, y los seis números una sola vez | **cerrado** · `197c789` |
| 4 | Los precios con fecha: enero sube solo | **cerrado** |
| 5 | La radiografía de 15 minutos, cronometrada | **el flanco cerrado** · `8036e01` · el reloj y el premio esperan su clic |
| 6 | MCD: su batería propia (hoy no tiene ninguna) | **cerrado** · `f3e9ddc` · 46 lentes |
| 7 | MCD: el puente verificado de los dos lados | **cerrado** · `817cb96` + `7c6e524` (MCD) · 15 + 5 lentes |
| 8 | El recorrido punta a punta del que paga la entrada y sube a 1.000 | **cerrado** · `4b3366b` · 19 lentes |
| 9 | Estética teléfono: jerarquía y aire | **el flanco cerrado** · `8dff8ab` · el cero era del teléfono vacío; la jerarquía y el aire esperan su clic |
| 10 | Estética computadora | **el flanco cerrado** · `8dff8ab` · 1440 entra al medidor, en cero; el gusto espera su clic |
| 11 | **Los cinco días, ejecutados en pantalla**: abrir, guardar y avanzar del 1 al 5 | **cerrado** · `b0d3ce6` · la pantalla final decía «queda registrado» sin estarlo |
| 12 | El Tablero guarda 34 códigos que el Camino no busca (los videos son extra) | **cerrado** · `8c11913` · 1 lente, 8 miradas |
| 13 | Cirugía 10 · Punta a punta: cliente y Admin, clic por clic, con datos de verdad | **el flanco del Admin cerrado** · la ventana de acceso daba tres números distintos |
| 14 | Cirugía 6 · **Fathom por webhook** — las otras tres fugas quedaron cerradas, medido el 9 nov | **el flanco de la app cerrado** · `ccf89ab` · 79 miradas · en Fathom, el destino del webhook es tuyo |
| 15 | Cirugía 4 · La app al lado de Claude | **cerrado** · `da9c71c` · 12 encargos, 1 lente, 60 miradas |
| 16 | Cirugía 5 · Lo que la app mide por él | **cerrado** · `cf99bcc` · 1 lente, 45 miradas · el 300 de la cadena espera su clic |
| 17 | **La radiografía en un solo tramo**: fundir los diez pasos, con el reloj y las cuatro preguntas nuevas (FODA, sus archivos, su audio, qué días le importan) | **el próximo** · las dos decisiones que la frenaban quedaron tomadas el 11 nov |

La cirugía 1 —los cinco días que se venden solos— no entra en la cola: toca el
precio de entrada (27 en la app, 97 en la oferta) y espera su clic. Las
cirugías 0, 2, 3 y 7 quedaron cerradas por los turnos 1 al 8; las 8 y 9, por
el flanco, y lo que queda en ellas es gusto suyo.

**La cola quedó sin turnos abiertos el 12 de noviembre, con el turno 16.** Los
dieciséis están cerrados; en cinco —5, 9, 10, 13 y 14— lo cerrado es el flanco
y lo que queda adentro es tu clic, no trabajo. Así que la tarea programada
sigue encendida y sin nada que tomar.

**Dos premisas del encargo de la tarea ya no son ciertas, y por eso no se
apagó sola:** dice «los diez turnos» —son dieciséis— y dice que MCD «hoy NO
tiene batería de ningún tipo: ése es su primer turno». MCD tiene su batería
desde el 9 de noviembre: `auditoria.py` en su raíz, nueve bloques, 46 lentes,
cerrada por el turno 6 (`f3e9ddc`), más las 5 del puente del turno 7
(`7c6e524`). Lo que MCD no tiene es `prueba-*.ts`: su batería es toda Python.

**Decisión tuya, y es un botón:** o se apaga la tarea, o le escribes turnos
nuevos a esta tabla y sigue sola. No se inventan turnos acá: la cola es tuya.

### Medía para nadie — turno 16, el 12 de noviembre

Commit `cf99bcc`. Una lente nueva, `scripts/prueba-los-diez-llegan.ts`, con
cuarenta y cinco miradas, y los tres caños que faltaban.

**La premisa decía que faltaba construir las tres patas. Dos ya estaban, y la
que no estaba no era la que el mapa nombraba.**

El pedido del viernes existe: `TableroNumeros` se pone el borde dorado los
viernes y le pide los tres números. El diagnóstico existe: `diagnosticar`
nombra volumen, filtro o cierre y escribe la acción de cada uno. Las tasas, la
cadena y la meta de los diez están medidas desde antes.

**Lo que faltaba es que algo de eso saliera de la pantalla donde estaba.**

**Uno: guardaba en el navegador y nada más.** `src/lib/tablero.ts` lo importaba
UN solo archivo —la tarjeta— y no tenía ninguna lente encima. Dos tarjetas más
arriba, en la MISMA pantalla de Hoy, `TableroDeLaSemana` lee la base: el
viernes a la tarde, con los tres números recién cargados, le seguía diciendo
«todavía no cargaste tus números». La cola del equipo lo marcaba sin datos
todas las semanas, el cron le mandaba el aviso de que faltaban, y su «X de 10»
arrancaba de cero el día que abría la app en el teléfono.

Y no era falta de cañería. La migración `20261021_sus_numeros_son_suyos` abrió
la tabla y el RPC **exactamente para esto** —«ahora cada uno lee y carga los
suyos»— y la pantalla que se lo pide nunca se cableó. Ni la llave coincidía: el
espejo decía «2026-11-09» y la base «2026-W46», así que las dos mitades del
mismo dato no podían ni reconocerse.

**Dos: escribir tres números borraba dieciocho.** `guardar_semana_cliente` es
un UPSERT que pisa las veintiuna columnas y pone en cero lo que no venga.
`subirNumerosDelCliente` le mandaba cuatro: cargar los números del Constructor
el viernes **borraba de esa semana** lo facturado y lo cobrado que había
anotado Lupe en la Mesa de plata, las llamadas, las ventas y los clientes
activos. Con éxito en la respuesta. Ahora los dos escritores pasan por
`losDiezEnLaBase.ts`, que trae la semana que está y le encima lo nuevo; nadie
escribe campos sueltos contra ese RPC, y la lente se pone roja si aparece un
tercer escritor que lo intente.

**Tres, y es la pata que el mapa pedía: el diagnóstico no cambiaba ningún
día.** `diagnosticar` no la llamaba nadie más que su propia tarjeta. El cliente
leía «tu cuello es el cierre» el viernes y el sábado la app abría igual que el
día 3. Ahora el cuello entra como un movimiento del día en Hoy, con el botón
que abre dónde se trabaja —Campañas para el volumen, Entrenadores para el
filtro y el cierre, que es donde ya mandan los avisos escritos para esos mismos
cuellos—. A quien va en ritmo no se le pone nada: la app acaba de decirle que
no cambie nada, y darle trabajo sería contradecirse en la misma pantalla.

**Y la cuenta no era la que decía.** Este mapa y el encabezado del archivo
dicen «300 conversaciones → 57 agendas → 40 llamadas → 10». La app muestra
**306 → 58 → 40 → 10**. Las 40 llamadas son exactas; las agendas dan 57,14 y la
cadena redondea para arriba, porque media agenda no agenda a nadie: 58. Y 58 /
0,19 da 306. Los números lindos salen de redondear las agendas para abajo —57 /
0,19 da 300 justo—, que es la cuenta de un folleto. Se midió: el 300 no estaba
escrito en ninguna pantalla ni en ninguna oferta, solo en ese comentario, así
que lo que el cliente lee hoy es 306 y el comentario se corrigió. **Si la
oferta tiene que decir 300, eso cambia un número que el cliente lee: espera tu
clic.**

**La lente, probada contra su propio fallo en diez formas:** se pone roja si la
tarjeta vuelve a guardar solo en el navegador, si Hoy la monta sin decirle de
quién son los números, si aparece un escritor que le manda campos sueltos al
RPC, si la fusión pisa la semana del equipo, si el espejo y la base vuelven a
nombrar distinto la misma semana, si un cuello apunta a una página que el
router no dibuja, si el diagnóstico vuelve a morir en su tarjeta, si el
encabezado cuenta una cadena distinta de la que corre, si se le inventa un
cuello a quien no cargó, y si uno de los tres se pide con un nombre que la
cadena no tiene.

**Y una falta mía que la lente tapaba.** Mandé el cuello del filtro y el del
cierre a `'agentes'`, que era la ruta vieja de Entrenadores y salió del router
al unificar las dos rutas: `setCurrentPage('agentes')` deja la pantalla en
blanco sin romper nada. La lente lo dejó pasar en verde, porque cosechaba los
nombres de página del bloque crudo de `VALID_PAGES` —y arriba hay un comentario
que nombra `'agentes'` entre comillas justo para contar que ya no existe. O
sea: la comprobación se agarraba del renglón que dice que la ruta no está. Es
el mismo defecto que mira la lente, una capa más arriba. Ahora se quitan los
comentarios antes de cosechar, y hay una mirada que pide expresamente que
«agentes» no entre por ahí.

**Lo que quedó anotado y no se tocó.** La cirugía 5 pide además las campañas
por Meta y las métricas adentro de la cuenta; y el eslabón de las **agendas**
no se le pide nunca —el formulario son tres números y la rama del filtro usa
las llamadas como si fueran las agendas, que es por qué su texto dice «solo
agendaste N llamadas»—. Pedir un cuarto número cambia lo que la pantalla le
pide al cliente: es decisión tuya si el viernes son tres datos o cuatro.

### El encargo existía y no lo vio nunca nadie — turno 15, el 11 de noviembre

Commit `da9c71c`. Doce encargos donde había tres, una lente nueva
—`scripts/prueba-el-encargo-llega.ts`, sesenta miradas— y el espejo que les
faltaba.

**La premisa decía «de 3 a 12». El número de partida no era tres: era cero.**

Hay dos juegos de códigos en el Camino y se parecen tanto que se pueden
confundir leyendo el archivo entero sin notarlo. Las **piezas** son los
cuarenta y tres videos a grabar: `P3.1`, `P4.2d`, `P4.4`. Las **metas** son
las noventa y un jornadas que el cliente abre: `P2.d10`, `P3.d16`, `P9B.d61`.
Se tocan en nueve códigos y en ninguno más.

Los tres encargos estaban escritos con el código del VIDEO. `SesionViva` le
pasa a `ElEncargo` el código de la JORNADA. O sea que `encargoDe()` devolvía
`null` los noventa y un días, el componente se iba sin pintar nada, y la
pantalla que existe para que el cliente no abra nunca una conversación en
blanco no se mostró ni una vez desde que se escribió.

**Y la lente estaba en verde.** Probaba `armarEncargo()` con datos puestos a
mano: la plantilla andaba, los huecos se nombraban, las reglas de redacción se
cumplían. Todo cierto, y ninguna de esas preguntas es «¿esto llega a una
pantalla?». Es el mismo defecto que el del Tablero en el turno 12: una lente
correcta que se agarra de lo que tiene a mano en vez de lo que el cliente ve.

**Lo segundo, que habría multiplicado por cuatro.** `datosDelCliente()` leía
cinco claves crudas del navegador. Llegaban dos —`nombre` y `especialidad`—.
`pais`, `promesa`, `nicho` y `precio` no existen como clave en `tcd_profile`,
y `adn_avatar` sí existe pero es un OBJETO —nombre ficticio, edad, dolores,
sueños—, así que el filtro de texto lo descartaba en silencio: a quién sirve
el cliente salía hueco aunque lo tuviera sellado hacía semanas. El encargo que
existe para salir lleno salía con cuatro huecos de seis, siempre, para todos.
Escribir nueve encargos más encima de ese caño era multiplicar el defecto.

**De dónde sale ahora cada dato, y por qué ese y no otro:**

| | |
|---|---|
| `pais`, `nicho`, `posicionamiento`, `avatar_cliente` | estaban en la base y nadie los espejaba. Cuatro líneas en `auth.ts` |
| `promesa` | es su PUV, «la frase que te separa de todos los demás». Buscada por todo el repo: «promesa» no es columna de nada, y el PUV es exactamente lo que un encargo necesita |
| `precio` | sale de `tcd_el_numero`, su precio NUEVO, el del día 5. El viejo no sirve: el encargo arma lo que va a vender de ahora en adelante |
| `avatar` | prefiere el campo de texto; si solo está el objeto del ADN lo aplana a algo legible en vez de tirarlo |
| `dialecto` | no es un dato suyo: se DERIVA del país |

**El dialecto, que es el que nadie pide y cambia la salida entera.** Los tres
encargos pedían la salida «en castellano neutro». Pero lo que sale de ahí no
lo lee el cliente: lo leen SUS consultantes, en su país. `vozLocalizada.ts`
tiene eso resuelto desde que Sol reportó que la IA le escribía las landings en
voseo argentino — y el encargo no lo usaba. Un médico argentino pedía su
página y le volvía un texto que le habla de tú a pacientes que se hablan de
vos: se usa igual, se lee prestado. Ahora cada encargo lleva el trato de su
país adentro.

La frase quedó en `vozLocalizada.ts` y no en `elEncargo.ts`, aunque allá sea
donde se usa: ese archivo es el único exento de la lente de voseo, porque es
el que documenta los dos registros a propósito. Escrita en el otro, la lente
la marcaba —y con razón: nadie que la lea de paso puede saber que esas
palabras son para los consultantes del cliente y no para el cliente.

**Los doce, en la jornada que produce la cosa:** las instrucciones de su
proyecto en Claude (día 1), su método con etapas (9), su oferta de 1.000 en
una página (10), sus guiones (11), su página (16), el aviso a su entorno (18),
su recuperador (25), sus tres anuncios (30), su protocolo de entrega (39), sus
respuestas guardadas (61), su escalera (66) y sus carruseles (85). Los días de
pensar, decidir o practicar siguen sin encargo, y no hay pestaña ni catálogo:
cada uno vive adentro de su jornada y en ningún otro lado.

**La lente, probada contra su propio fallo en nueve formas:** se pone roja si
un encargo vuelve al código de un video, si cae en una jornada de tipo TAREA
—que no abre la sesión—, si la sesión pasa a montarse detrás de otro tipo, si
alguien apaga el encargo con un comentario, si un encargo pide un dato que
nada llena nunca, si el lector deja de devolver uno de los declarados, si el
espejo de `auth.ts` pierde un campo, y si se cuela un token de vocabulario
`{{…}}`, que el armador convierte en hueco justo donde iba la palabra
correcta. Los tipos de jornada que abren la sesión no se escriben a mano: se
leen de `Roadmap.tsx`, buscando hacia atrás desde cada montaje de
`SesionViva`, así que el día que eso cambie la lista cambia sola.

**Lo que quedó anotado y no se tocó.** El mapa pide además las herramientas
por estación —Meta conectado, Claude Code, GitHub, Vercel, Metricool— y las
campañas con criterio adentro. Eso es un encargo por herramienta y entra
cuando haya jornada que lo pida; hoy ninguna de las noventa y una lo nombra.

### La transcripción entra sola, y espera — turno 14, el 11 de noviembre

Commit `ccf89ab`. Una lente nueva, `scripts/prueba-fathom-entra.ts`, con setenta y nueve
miradas, y la ruta que faltaba: `api/fathom-webhook.ts`.

**La premisa era cierta a medias, y la mitad que faltaba cambiaba el turno.**
El mapa decía «no hay ninguna ruta en `api/` que reciba una transcripción».
Cierto: las once rutas de `api/` están y ninguna recibe una. Lo que el mapa no
decía —y decide qué había que construir— es que **toda la máquina de leerla ya
existía**: `src/lib/transcripcion.ts`, con su prompt de extracción y su lector
tolerante, y `CargarSesion.tsx`, la pantalla donde una persona revisa lo que
salió, desmarca lo mal leído y recién entonces se guarda. Con su regla escrita
en el encabezado, en mayúsculas:

> «NADA SE GUARDA SIN QUE UN HUMANO LO CONFIRME. Una transcripción mal leída
> que se guarda sola es peor que no tenerla: se vuelve un dato falso con
> apariencia de registro.»

Así que el turno NO era «que la app lea transcripciones»: eso estaba hecho. Era
conectar la entrada a esa revisión **sin saltearla**. Un webhook que extrajera
y guardara solo —que es lo que uno escribe si no mira antes— habría roto esa
regla justo en el lugar más caro: el registro de decisiones del negocio.

**Y lo que no existía en ninguna parte:** un lugar donde dejar la
transcripción. `sesiones` existe y es otra cosa —el registro de que la sesión
OCURRIÓ, de donde sale el «te dimos 3 de las 3 que te prometimos» del cierre
del Camino— y no tiene columna de transcripción. Buscada la palabra por todo el
repo: no aparece en un solo `.sql`.

**La trampa del formato, que es la mitad del trabajo.** El campo `transcript`
de Fathom no es un texto: es un arreglo de turnos de habla
—`{ speaker: { display_name }, text, timestamp }`—. Un `String(cuerpo.transcript)`
guarda la cadena `[object Object]`: quince caracteres que pasan cualquier
chequeo de «vino algo», y la sesión queda registrada como recibida y es
ilegible para siempre. Aplanarlo conserva quién dijo qué y tira las marcas de
tiempo, que gastarían el presupuesto de 24.000 caracteres del prompt en algo
que el modelo no usa.

**Las cuatro decisiones que no son obvias:**

1. **La que nadie reconoce entra igual.** Si el email de la invitación no
   coincide con ningún cliente, la transcripción queda con `cliente_id` en
   NULL y el equipo elige el cliente a mano. Descartarla sería perder la
   sesión por un email mal escrito, que es exactamente la fuga que esta ruta
   vino a tapar.
2. **El cliente es el de afuera.** En una sesión los dos lados tienen cuenta.
   Buscando en el orden en que vienen los invitados, en toda reunión que
   organiza Javo el primer email que existe en `profiles` es el de Javo, y la
   sesión queda colgada de la ficha de quien la dio. Se busca primero por
   `is_external`, y quien tiene `admin_rol` es equipo aunque su `rol` diga
   cliente.
3. **Si la base no puede guardar, contesta 5xx** — al revés que
   `ghl-webhook`, que contesta 200 con el motivo adentro. Esa ruta puede:
   el cobro queda registrado en GHL y se reconstruye. Acá el hecho es el único
   texto de una conversación que ya terminó, y un 2xx le dice a Fathom
   «recibido» y no vuelve a intentarlo nunca.
4. **Sale de la cola al confirmar, no al abrirla.** Marcarla al abrirla
   dejaría afuera de la cola una revisión que se interrumpe —se cierra la
   pestaña, se cae la red— sin que nadie haya guardado nada, y nadie volvería
   a verla.

**La lente, probada contra su propio fallo en seis formas:** se pone roja si se
vuelve al `String()` ingenuo (34 miradas), si se busca a los invitados en el
orden en que vienen, si se saca la pregunta de idempotencia que hace que el
reintento de Fathom no duplique, si el fallo de guardado contesta 200 en lugar
de 5xx, si la que nadie reconoce se descarta, y si la revisada no sale de la
cola. Y cuatro miradas afirman por el camino —no por suposición— que la ruta no
tocó `notificaciones`, ni el registro de decisiones, ni `sesiones`, ni ningún
modelo.

**Y de paso, lo que la batería encontró porque esto la empujó.** La lente de
imports de `api/` miraba sólo los archivos de `api/`. Alcanzaba hasta hoy por
casualidad: el único módulo de `src/` que una ruta tocaba —`laVentanaDeAcceso`—
no importa nada, así que la cadena terminaba en el primer salto. El de Fathom
importa dos, y al seguir la cadena entera apareció uno de verdad:
`src/lib/valueChain.ts` importaba `./mercados` sin extensión, y a ese módulo lo
carga `api/cron/alarmas-inactividad.ts`. En Node ESM puro eso es
ERR_MODULE_NOT_FOUND en el arranque frío — y al ser un cron, falla sin que
nadie lo vea. Arreglado. La lente ahora sigue el grafo y saltea los imports de
solo tipos, que el compilador borra: sin esa calibración daba nueve hallazgos
donde hay uno, y una lente que grita lobo enseña a ignorarla.

**Lo que NO se tocó, y es tuyo:** el destino del webhook en Fathom, la
migración y la variable de entorno. Las tres están arriba, en «lo que es
tuyo», en el orden en que van.

### El cero era del teléfono vacío — turnos 9 y 10, el 9 de noviembre

Commit `8dff8ab`. Dos lentes nuevas en `auditoria.py`, once vistas nuevas en
el medidor: de 87 a 98, todas en cero.

**La premisa de estos dos turnos era falsa por partida doble, y de la forma de
siempre.** La tabla decía «0 faltas de regla; lo que queda es gusto». Ese cero
tenía dos agujeros, y nadie podía verlos porque los dos están en lo que el
medidor NO mira:

1. **Las 22 lentes visuales se midieron siempre a 390 px.** Buscado por todo
   el repo: el único 1440 que existía era el de `medir-densidad.py`, que
   cuenta palabras y toques, no mira una sola regla, y ni siquiera está en la
   batería. El turno 10 —«lo mismo a 1440»— esperaba el clic de Javo sobre una
   medición que nunca se había hecho.
2. **El Diario se midió siempre vacío.** `CON_DATOS` afirmaba que su contenido
   «es el mismo con cuenta llena o vacía». Es al revés: vacío muestra el
   formulario; con la entrada de hoy guardada muestra otra pantalla entera
   —confirmación, puntaje, seis tarjetas de numerales y tres píldoras que
   vacío no existen—.

Medido el 9 de noviembre: **el Diario vacío daba cero faltas y el mismo Diario
con la semana escrita daba DIEZ.** A 1440, siete más. Es la pantalla que el
cliente toca todos los días.

**Lo que estaba roto, y por qué:**

1. **El párrafo que explica para qué sirve el Diario quedaba en 0 px de ancho
   y 461 de alto** — una letra por renglón, ilegible, en un teléfono. Es el
   MISMO bug que el encabezado ya tenía arreglado, con su comentario y todo:
   `flex-1 min-w-0` a la izquierda, `shrink-0` a la derecha. Ese arreglo se
   escribió cuando a la derecha había UN botón. Hoy hay tres píldoras de 44 px
   —energía, racha, Historial— que piden cerca de 300 px y no ceden ninguno,
   y `min-w-0` deja que la izquierda llegue a cero. Y sólo aparecen cuando el
   cliente TIENE racha: por eso el medidor, que lo abría vacío, nunca lo vio.
2. **Dos maneras de escribir el oro de texto se salteaban las reglas AA del
   tema claro.** `text-[var(--oro,#B0822E)]` —una clase entre corchetes— no la
   alcanza ninguna de las tres reglas que enderezan el oro, así que el valor
   crudo llegaba intacto: 3,09:1. Y `text-amber-*` apuntaba a `--oro-d`, que
   pasa AA sobre la tarjeta (4,52) y NO sobre los otros tres fondos de la casa
   (3,99 / 3,66 / 3,77). El ámbar casi nunca está sobre la tarjeta: está sobre
   un chip tintado. `--oro-t` existía desde antes y su comentario dice
   exactamente para qué —«el oro de TEXTO va un tono más oscuro… así también
   pasa AA sobre los fondos tintados»—. La regla estaba escrita; el amarillo
   nunca la había apuntado.
3. **`text-success/NN` y `text-danger/NN` no tenían regla de contraste**, al
   revés que el crema, que la tiene dos líneas más arriba en el mismo archivo.
   Son 30 usos entre el cliente y el Admin. `text-success/70` da 3,61:1. Se
   enderezan al tono entero —verde 7,49, rojo 6,33, los dos AA sobre los
   cuatro fondos—, igual que el crema.
4. **El título del serif a 16 px leía más chico que su propia explicación.**
5. **El ícono de las seis tarjetas de numerales flotaba en el hueco** entre
   los dos renglones del rótulo, alineado a nada.

**Las dos lentes nuevas, probadas contra su propio fallo en siete formas:**

- *los destinos de la barra se miden con la cuenta llena, no vacíos* — se pone
  roja si sale `diario` de `CON_DATOS`, si sale cualquier destino de la barra
  de abajo, y si mañana aparece un destino nuevo que nadie mide.
- *y se miden también en la computadora, no sólo en el teléfono* — se pone
  roja si se borra la corrida de escritorio, si el ancho baja de 1280, si sale
  un destino de `ANCHAS`, y con el destino nuevo.

**Lo que NO se tocó, y es su clic:** la jerarquía y el aire. Con las faltas de
regla en cero otra vez —ahora en los dos anchos y con la cuenta adentro—, lo
que queda ahí sigue siendo gusto. Una sola cosa de forma, por si la quiere: a
390 px las tres píldoras del encabezado se reparten en dos renglones y el
«Historial» queda solo en el segundo. Entra en uno si se achica la sangría o
se acorta el rótulo, como se hizo con «Entrenadores → Entrenar». Ninguna regla
lo pide.

### Los cinco días, caminados en pantalla — turno 11, el 9 de noviembre

Commit `b0d3ce6`. Una lente nueva, `scripts/caminar-los-cinco-dias.py`, en
la batería. Es lo único que se le cobra a quien entra solo por la página —«los
8 libros y los cinco primeros días de mi app»— y hasta hoy nadie lo había
ejecutado nunca.

**La premisa era cierta por una vez, y por eso encontró algo.** De los cinco
días la batería medía dos cosas, y ninguna era ésta:

- `prueba-los-cinco-dias.ts` mide el **seed**: que los cinco existan, que el
  plan los abra, que ninguno se pise. Es aritmética sobre un archivo; no abre
  el navegador.
- `medir-guardado.py` **llega** a la jornada y la toca, y su propio comentario
  dice qué deja afuera: *«NO cubre cerrarla… Queda por cubrir, y es lo
  próximo.»* Esto es lo próximo.

**Lo que se encontró al caminarlo: la última pantalla de la sesión mentía.**

La sesión de una jornada son cinco pantallas —Te llevas · Mira · Haz · Sube ·
Listo— y a la última se llega con el botón «Siguiente» de abajo, que no pide
nada. Esa pantalla decía, con texto fijo y sin mirar nunca si la jornada se
había cerrado:

> **Listo** · *Queda registrado en tu Camino. Mañana sigue el paso que toca.*

**El día 4 terminaba así siempre.** De los cinco, es el único cuya evidencia
es un archivo —«sube la foto de tu protocolo pegado»—, así que «Marcar como
completado» queda apagado hasta subirla. El cliente recorre la sesión entera,
toca «Siguiente», lee que su jornada quedó registrada y cierra la app. No
quedó registrado nada: al otro día el día 4 lo espera abierto y el anillo
sigue diciendo 3 de 64. Y en los otros cuatro días alcanzaba con tocar
«Siguiente» dos veces en vez del botón verde para leer lo mismo.

Ahora esa pantalla dice lo que pasó: con la jornada cerrada, el texto de
siempre; sin cerrar, **«Todavía no · Esta jornada todavía no quedó registrada
en tu Camino»**, con el camino de vuelta al paso donde se cierra. Medido en
los dos temas.

**Lo que la lente recorre, día por día:** que la jornada del día sea la que el
Camino ofrece abierta · que la sesión se recorra entera —incluida la antesala
de tres toques del player guiado y los 2,1 segundos del ritual, que no son el
final aunque no haya ningún botón— · que lo escrito sobreviva a recargar · que
la pantalla final no mienta · que la jornada cerrada siga cerrada después de
recargar · y que, cerrada, mañana sea el día siguiente.

**Probada contra su propio fallo, en tres formas** (`--probarme`): se pone
roja si el día de hoy ya está cerrado y no hay nada que abrir; si una jornada
que pide un archivo se cierra igual sin adjuntar nada; y si se le devuelve a
la pantalla final la frase fija que tenía antes de este turno.

**Dos cosas que la sonda aprendió y quedan escritas para no repetirlas:** los
botones se buscan en el contenedor de más arriba —`SesionViva` va en z-[60] y
el player guiado en z-[70] encima— porque los de la Hoja de Ruta quedan
abajo, pintados y tapados, y una sonda que los ve «visibles» se cuelga
esperando tocar uno que nadie puede tocar. Y el orden de la lista de botones
es la lente: con «Siguiente» arriba de «Marcar como completado», el recorrido
pasaba de largo por el único botón que cierra la jornada y después culpaba a
la app.

**Lo que queda anotado y no se tocó:** el día 4 es el único de los cinco que
**necesita conexión para cerrarse**. Su evidencia vive en Storage de Supabase;
sin base no hay dónde subirla y el día no cierra. El resto del lado del
cliente anda sin conexión. Si alguna vez quieres que ese día cierre sin la
foto, es el campo `avanza_sin_evidencia` de esa jornada en el seed —y es
decisión tuya, no de la lente.

### Lo que bloquea la venta y es de Javo

Ninguna de estas la puede hacer Claude. Van en cada parte que se le dé.

0. **LO ÚNICO QUE FALTA PARA QUE ENTREN SOLOS.** El botón de 97 de la página
   hoy no cobra: `src/config.js` de `landings` termina con
   `if (!window.TCD.librosPorCorreo) window.TCD.pagos.obra = ''`, y
   `librosPorCorreo` está en `false` esperando el correo de entrega de los
   libros. Mientras siga así, el botón abre su WhatsApp y la venta la cierra
   él a mano.

   Cuando el correo de GHL que manda los ocho libros ande, son dos cosas:

   · `librosPorCorreo: true` en `src/config.js` (eso lo hace Claude).
   · En GHL, el producto «Tu nuevo precio» → workflow **Order Submitted** →
     acción Webhook:

   ```
   POST   https://app.tuclinica.digital/api/alta-numero
   Header x-alta-key: <ALTA_NUMERO_KEY, o la TCD_INTEGRATION_KEY del puente>
   Body   { "email": "{{contact.email}}", "nombre": "{{contact.name}}" }
   ```

   Con eso la app hace sola lo demás: crea el usuario, le manda el correo de
   «crea tu contraseña y entra», y le abre **exactamente los días 1 al 5 por
   21 días de calendario** — que es, palabra por palabra, lo que la página
   promete. Medido y congelado en `prueba-los-cinco-dias.ts`.

   El webhook de los escalones (`/api/ghl-webhook`) **no** sirve para esto:
   busca a un cliente que ya existe y no crea el usuario. Para la entrada va
   `/api/alta-numero`.

1. ~~Correr `supabase/migrations/20261105_donde_cae_lo_que_se_rompe.sql`.~~
   **HECHO el 9 de noviembre.** Era la única que ya estaba rota para alguien
   que pagara hoy.
2. El workflow de GHL que manda el campo `plan` (verde/negro). Sin él, quien
   paga 997 y quien paga 497 entran igual, con todo abierto. **No bloquea la
   venta:** el Admin escribe `plan_comercial` a mano, así que cada comprador
   se le puede abrir uno por uno hasta que el workflow exista.
3. ~~Los pasos del día 45.~~ **HECHO el 8 de noviembre:** las 91 jornadas
   tienen contenido.
4. Grabar: 12 videos a cámara (una tarde) y 8 tutoriales de pantalla (una
   mañana). Los títulos están más abajo en este mapa. **Ya se pueden cargar
   desde el Tablero:** el turno 12 lo arregló el 9 de noviembre.
5. Purgar jsDelivr de las nueve páginas del commit `3a6d0cd` de `landings`
   (esta sesión no tiene salida a `purge.jsdelivr.net`). Hasta que se purgue,
   jsDelivr puede seguir sirviendo la versión anterior de esas páginas.

### Los repos, ordenados el 8 de noviembre

| repo | qué es |
|---|---|
| `learners417/tcd1` | **TCD, el vivo** |
| `learners417/tuclinica-app` | TCD viejo — conviene archivarlo |
| `learners417/mcd` | **MCD, el real** |
| `learners417/miclinica-app` | ya archivado ✓ |
| `learners417/clinica-del-lider-app` | **CdL, el vivo** |
| `learners417/clinica-del-lider` | CdL viejo — conviene archivarlo |

La duda de los «dos repos» era de Clínica del Líder, no de MCD: el duplicado
de MCD ya estaba archivado.

**MCD se trabaja en la misma sesión que TCD**, no en un chat aparte: comparten
el mismo Supabase y el puente tiene un lado en cada repo —`api/mcd-bridge.ts`
en TCD y `/api/integrations/tcd` en MCD—. Tocar un lado a ciegas rompe el otro.

### La batería de MCD — turno 6, cerrado el 9 de noviembre

`auditoria.py` en la raíz de MCD, nueve bloques, 46 lentes. Se corre con
`npm run bateria` (o `bateria:rapida`, que saltea el build). Qué cuida y por
qué está en `README-BATERIA.md` del repo.

La premisa del mapa era cierta por una vez: MCD no tenía NADA. Tres scripts en
el `package.json` —dev, build, start— y ninguno miraba si el código es
correcto; ni `tsc --noEmit`. Lo que sí sorprendió es que, corriéndolo, **el
código ya estaba limpio**: `tsc` y `next build` pasan los dos. Lo que faltaba
no era arreglar MCD, era poder darse cuenta cuando se rompa.

**Tres cosas que la batería encontró al escribirse, y se arreglaron:**

1. **El puente comparaba su clave con `!==` pelado**, mientras el webhook —la
   otra puerta al mismo dato, los cobros de un cliente— usaba
   `timingSafeEqual`. Una comparación que corta en el primer carácter distinto
   se puede cronometrar desde afuera para adivinar la clave de a un carácter.
   Igualado.
2. **MCD no tenía `.gitignore`.** El primer commit con `git add -A` se llevó
   10.496 archivos —`node_modules` y `.next` enteros, packs de webpack de
   43 MB— y GitHub lo rechazó en el pre-receive. Ese rechazo fue la suerte:
   nada impedía que la próxima vez entrara el `.env.local`, y de git no vuelve
   —un `.env` subido una vez obliga a rotar todas las claves—. Ahora hay
   `.gitignore` y una lente que mira que nada de eso quede rastreado.
3. **La batería no estaba en el `package.json`**, que es exactamente cómo una
   batería se corre una vez y se olvida.

**Y una que quedó bien y conviene saber por qué:** `cobros_verificados`, el
número que viaja a TCD y dispara el cinturón Rojo, cuenta FILAS de `cobros`
sin filtrar por nada. Es honesto solo porque `receipt_path` es `not null`: una
fila no puede existir sin su comprobante. El día que alguien la vuelva
nullable, ese número empieza a mentir y el Rojo se otorga sin evidencia. Hay
una lente para cada mitad, y una tercera que mira que ninguna migración
posterior le saque el `not null`.

**Lo que espera su clic:** al instalar las dependencias apareció un
`package-lock.json`, que MCD nunca tuvo. **No se subió**, y queda ignorado.
Un lockfile es buena práctica, pero subir ESTE fija las versiones que se
resolvieron el 9 de noviembre y cambia lo que Vercel instala en el próximo
deploy respecto de lo que corre hoy. Si lo quiere: sacar la línea del
`.gitignore`, `npm install`, y subirlo.

**Lo que esta batería todavía NO probaba:** el puente de punta a punta. Eso
fue el turno 7, acá abajo.

### El puente de los dos lados — turno 7, cerrado el 9 de noviembre

`scripts/prueba-el-puente-de-las-dos-apps.ts` en TCD (15 lentes) y cinco
lentes nuevas en el bloque 8 de la batería de MCD. Commits: `817cb96` en TCD y
`7c6e524` en MCD.

**La premisa del mapa era cierta, y peor de lo que decía.** No es que el lado
de TCD estuviera sin probar: **nadie había ejecutado nunca ese handler**. Lo
único que lo miraba era una línea de `prueba-el-candado-por-hecho.ts` que
comprobaba que el Camino escribiera la palabra `mcd-bridge` en algún lado. Se
medía que el cable estuviera enchufado, nunca que pasara corriente. La prueba
nueva corre la ruta de verdad contra un MCD falso que decide igual que el real
—clave por header, 404 si el cliente no está, los cinco campos del contrato—,
en las nueve formas en que la ida y vuelta puede terminar.

**Cuatro cosas que aparecieron al ejecutarlo, y se arreglaron:**

1. **Todo fallo del otro lado se veía igual que «no vendió».** Con la clave
   distinta en los dos entornos —o sin poner en uno—, MCD contesta 401, y acá
   eso era indistinguible de un cliente que no cobró: el Cinturón Rojo no
   llega nunca y el día 31 no se abre nunca, en silencio y para siempre. El
   200 se queda —MCD caído no debe romper TCD—, pero ahora `mcd_status` viaja
   SIEMPRE, también con `'ok'` cuando salió bien, y el 401 y el 404 tienen
   nombre propio: `clave_rechazada` y `cliente_no_esta_en_mcd`.
2. **La búsqueda del cliente en MCD distinguía mayúsculas.** El índice que
   existe para eso es `practitioners(lower(email))`, del 8 de julio, y la
   consulta era un `.eq('email', …)` pelado que no lo usa ni respeta su
   intención. Una sola mayúscula guardada y el endpoint contesta 404 — que,
   por lo de arriba, se leía como «no vendió». Ahora el camino normal sigue
   siendo el exacto y la barrida sin mayúsculas corre sólo si el exacto no
   encontró nada, verificando en JS lo que vuelve (`ilike` trata `_` y `%`
   como comodines, y el `_` es legal en un email).
3. **El contador y el cinturón podían contradecirse.** `cobros_verificados`
   cuenta filas; el Rojo miraba sólo `primer_cobro`. Una fila sin fecha hacía
   que el X/10 dijera «2» y el cinturón «nunca vendió», los dos leyendo la
   misma fila. Hoy no puede pasar —`paid_at` es `not null`—; ahora tampoco el
   día que alguien la vuelva nullable.
4. **El entorno se leía al cargar el módulo.** Eso fijaba la clave en el
   primer arranque —rotarla exigía redeploy— y dejaba la ruta imposible de
   ejecutar en una prueba. Es, literalmente, por qué nadie la había corrido.

**Cómo saber hoy si el puente está vivo**, sin abrir nada:

```
curl 'https://<dominio-de-TCD>/api/mcd-bridge?email=<un-cliente>'
```

`mcd_status: "ok"` → el puente anda. `"clave_rechazada"` → las dos claves no
coinciden. `"sin_integration_key"` → falta en el entorno de TCD.
`"cliente_no_esta_en_mcd"` → ese cliente no tiene cuenta en MiClínica.
`"mcd_caido"` → MCD no contesta.

**Lo que espera su clic:** al instalar las dependencias de MCD, npm avisa que
`next@14.2.15` tiene una vulnerabilidad conocida y pide subir de versión.
Subir Next cambia lo que Vercel compila en el próximo deploy respecto de lo
que corre hoy, así que no se tocó. Es un `npm i next@latest` más una corrida
de la batería, y conviene hacerlo con tiempo, no antes de una venta.

### La cadena del pago, ejecutada — turno 8, cerrado el 9 de noviembre

`scripts/prueba-el-recorrido-del-que-paga.ts`, 19 lentes, registrada en la
batería. Commit `4b3366b`. Corre las dos rutas que convierten a un desconocido en cliente y
después en cliente de $1.000 —`/api/alta-numero` y `/api/ghl-webhook`— contra
un Supabase falso que decide como el real, y lee lo que queda escrito en la
fila con las MISMAS funciones que lee la app.

**La premisa del mapa era cierta, y por la misma razón que el turno 7.** Nadie
había ejecutado nunca esas dos rutas. Lo que las miraba era grep sobre su
propio texto —dos lentes de `auditoria.py` buscando cadenas dentro del
archivo— y `prueba-sube-de-escalon.ts`, que **replica a mano** lo que el
webhook supuestamente escribe:

```ts
const yaPago = { plan_comercial: 'amarillo', servicio_contratado: 'base' };
```

Esa línea es una copia, no una medición: el día que el webhook escribiera otra
cosa, esa prueba seguiría verde para siempre. Y acá costaba más que en el
puente, porque esta cadena ES la venta.

**Cinco cosas que aparecieron al ejecutarla, y se arreglaron:**

1. **El que pagaba el escalón de entrada se llevaba los noventa días
   GRATIS.** El trigger `on_auth_user_created` —el de `fix-supabase.sql`—
   inserta el perfil con `plan = 'DWY'` en el mismo instante en que se crea el
   usuario. El alta preguntaba «¿ya tiene plan?» y se abstenía de pisarlo: ese
   resguardo era para el cliente viejo y le caía a TODOS los compradores
   nuevos. `planDe('DWY')` devuelve `'completo'`, que son noventa y nueve
   pilares. Sin ventana de vencimiento, y sin nada que ofrecerle a $1.000: el
   escalón siguiente no existía para él. **Era el turno 8 roto en su primer
   paso.** La pregunta correcta no es qué dice la columna, es quién la
   escribió: si el usuario lo acabamos de crear nosotros, lo que haya en
   `plan` es el default del trigger y no lo compró nadie.
2. **El pago escribía el QUÉ y no el CUÁNDO.** `topeDelEscalon` apaga el tope
   entero cuando `servicio_marcado_el` está vacío —a propósito, para no
   cerrarles los días 13 al 90 a los clientes de hoy, que están en `'base'`
   sólo porque nadie los marcó—. El webhook escribía `servicio_contratado` y
   dejaba la fecha en null, o sea que la venta automática producía exactamente
   la ficha que el tope ignora: el de La Base abría los noventa días, la
   puerta de su primera etapa no aparecía nunca, y **las entregas del equipo
   no se disparaban para el que pagó La Instalación.** El pago es el momento
   en que una persona lo habría marcado a mano.
3. **Un cobro podía BAJARLE el acceso a quien ya había pagado más arriba.**
   `plan_comercial` y `acceso_hasta` se pisaban sin mirar qué había: ganaba el
   último webhook, no el escalón más alto. Un producto viejo de GHL que manda
   `plan: "blanco"`, un workflow que se dispara doble sobre un order bump, o
   un reenvío de un cobro de hace meses, dejaba al cliente de $3.000 con los
   cinco días abiertos y un vencimiento a 21. Pagó y la app le cerró el
   Camino, sin error en ninguna pantalla. La regla que quedó: **un cobro sólo
   puede querer decir «pagó esto», nunca «pagó menos»** — bajar un acceso es
   del Admin, donde lo hace una persona que sabe por qué.
4. **El perfil que crea el alta no guardaba su email**, que es justo la columna
   por la que el webhook del pago busca al cliente cuando sube. Lo obligaba a
   caer en su respaldo —paginar `auth.users`— para los clientes que la venta
   automática crea, que son todos los que importan.
5. **El entorno se leía al cargar el módulo**, igual que en el puente: la
   clave quedaba fijada en el primer arranque —rotarla exigía redeploy— y la
   ruta era imposible de ejecutar en una prueba. Es, otra vez, por qué nadie
   la había corrido.

**Y una sutileza que el arreglo 2 trajo, resuelta antes de salir:** sellar la
fecha ENCIENDE el tope, así que sellarla de más quita días. A un cliente de
siempre —`'completo'`— al que le entrara un cobro de La Base por un order bump
mal apuntado, el Camino se le habría cortado en el día 12. Por eso el escalón
se sella **sólo cuando ese cobro también le movió el acceso**, o sea cuando de
verdad es el escalón que compró: un cobro que no le abre nada no puede
cerrarle nada. Tiene su lente.

**Las dos lentes de texto de `auditoria.py` se re-apuntaron a la propiedad**,
no a la cadena literal que buscaban. Buscar `"if (ticket) cambios…"` dentro de
un archivo es exactamente la clase de lente que este turno vino a corregir.

**Qué cambia para un cliente que compre mañana**, dicho sin rodeos: el que
paga La Base ahora tiene el Camino **hasta el día 12**, que es lo que compró y
lo que la pantalla del candado le ofreció. Hasta hoy se le abría entero por el
agujero del punto 2. Si en algún momento preferís que La Base siga abriendo
los noventa días, es una línea —y es decisión tuya, no de la prueba.

**Lo que sigue siendo tuyo y no se tocó:** la app cobra el escalón de entrada
a **27 USD con 21 días** de acceso y la oferta son **97** (está anotado arriba,
en la CIRUGÍA 1, como «la fuga»). Es un precio y un texto de venta, así que
espera tu clic. Las lentes de este turno no miran el monto: miran que lo que
se cobra abra lo que se vendió, cualquiera sea el número.

---

### Lo que se resolvió el 11 de noviembre, con «resolvé todo»

Javo pidió que se resolvieran los cinco clics pendientes. Tres se resolvieron,
uno se disolvió al medirlo y uno sigue siendo suyo porque no es medible.

**El precio de entrada: no había ningún conflicto.** El mapa decía «la app
cobra 27 y la oferta son 97». Medido: ni el 27 ni el 97 están en ninguna
pantalla de la app. Los catorce «$27» que había estaban todos en comentarios,
en siete archivos, y eran el precio de la entrada de hace tiempo. **La app no
cobra: abre acceso.** El precio lo pone la página que la vende —hoy 97 USD, con
su línea «los 8 libros y los cinco primeros días de mi app»— y vive en el repo
`landings`. Los comentarios ahora nombran la entrada por su nombre, el valor
guardado `plan = 'ELNUMERO'` quedó intacto —está en la base de clientes
reales— y `prueba-los-cinco-dias.ts` se pone roja si el número vuelve al
código, en sus tres formas de escribirse.

**La cuenta de los 10: queda 306, y el mapa estaba equivocado.** Este mapa
decía que el 300 «no estaba escrito en ninguna pantalla». Sí estaba:
`TableroCupos.tsx` le decía al cliente «~5 conversaciones por día te dan las
~300 del mes», y los dos números estaban mal. La cadena real da 306 —el 300
sale de redondear las agendas para abajo, y media agenda no agenda a nadie— y
5 por día dan 150, no 300. Ahora el número sale de `cadenaPara` y la pantalla
no dice cuántas por día: 306 entre 30 da 10,2, así que cualquier entero redondo
vuelve a no cerrar. El mes sí cierra. La auditoría se pone roja si el número
escrito a mano vuelve.

**El reloj y el premio de la radiografía: tomados.** Están arriba, en la
cirugía 2, con su razón. El trabajo que destraban es el turno 17.

**La estética sigue siendo suya, y es lo único que no se resolvió.** El
medidor da cero faltas de regla en las 98 vistas: no hay nada medible que
arreglar. Lo que queda es gusto, y adivinarlo sería rehacer su identidad
visual a ciegas. Alcanza con que señale una pantalla y diga qué le molesta.

**La tarea programada queda encendida**, con el turno 17 para tomar. Apagarla
ahora habría dejado ese trabajo esperando a que él lo empuje, que es
exactamente lo que pidió no tener que hacer.

### El Admin daba una ventana de acceso distinta a la de las rutas de pago

Turno 13, la mitad del Admin. El acceso se abre desde tres lugares y cada uno
tenía su propio número escrito a mano:

|  | las rutas de pago | el botón del Admin |
|---|---|---|
| blanco | 21 días | **7 días** |
| amarillo | sin vencimiento | 45 días |
| verde y negro | sin vencimiento | 90 días |

Y el botón del Admin es el ÚNICO camino que se usa hoy: mientras el workflow
de GHL no exista, cada comprador se abre a mano. O sea que la entrada de 97
venía dando siete días en vez de veintiuno —con siete no entra ni el viernes
en vivo si compró un sábado— y a un cliente que paga se le ponía una fecha de
corte que la ruta automática no le pone.

Ahora hay una sola declaración, `laVentanaDeAcceso.ts`, y la leen las dos
rutas de pago y el Admin. Javo eligió el 9 de noviembre que los escalones
pagos no vencen: el Camino termina solo el día 90 porque se le acaba el
contenido, y Mi Clínica sigue siendo suya el día 91.

En el mismo barrido: los botones de reserva del Admin decían «La Instalación ·
$5.000» meses después de que el precio pasara a $6.000, porque el nombre y el
precio estaban escritos a mano. Salen de `cuadroTickets`, que es donde vive lo
que Javo vende, así que en enero suben solos.

Dos lentes re-apuntadas, las dos por la misma razón de siempre: cuidaban una
regla correcta agarrándose de un texto literal. La de los cinco días contaba
el número en cada ruta —y pasaba en verde justo porque no miraba el tercer
lugar—; la de la auditoría pedía el literal «La Base · $1.000», que era
exactamente el problema que quería evitar.

### La revisión del 9 de noviembre — libro, app y landings

Javo preguntó si los tres hablaban de lo mismo: mismas letras, método, pasos,
sistemas. Se midió, no se opinó: se clonó `learners417/landings`, se leyeron
las 43 páginas publicadas y los primeros capítulos de los ocho libros, y se
comparó contra el seed.

**Lo que ya estaba alineado, palabra por palabra.** Las cinco estaciones, sus
cinco libros, las cinco libertades y los candados —con qué se abre cada una y
qué deja— coinciden entre la app y `/camino`. «Se abre con tres ventas pagas»
está igual en los dos lados. Los ocho libros y las siete libertades de
`/libros` tampoco se contradicen con la app: las cinco del Camino son cinco de
esas siete.

**Lo que no coincidía, y se corrigió.**

1. **Los días de tres de las cinco estaciones.** Las landings publicaban el
   viento hasta el 56, el río del 57 al 70 y el bosque del 71 al 84; la app,
   15-35, 36-84 y 85-90. Para decidir quién tenía razón se miró el contenido
   de las 91 jornadas: el día 38 es «Tu app, con tu marca» —que es el río, y
   la landing lo ponía en el viento— y los días 85 a 90 son el ecosistema, la
   foto de llegada y el plan de 180 días, que es el bosque y la landing
   llamaba «el cierre». Javo eligió corregir las landings. Commit `3a6d0cd`
   del repo `landings`: nueve páginas, el bosque absorbe el cierre, y
   desaparece el bloque aparte del día 85 al 90.
2. **La app contaba otra arquitectura en los cuatro lugares donde HABLA.** El
   Mentor —con quien el cliente conversa todos los días—, la voz de Javo de
   los agentes, el panel del método y el guion del video de bienvenida decían
   «Método CLINICA, 7 etapas, 9 cinturones». Nadie más lo dice: las landings
   nunca nombraron CLINICA y el seed tiene once grados, no nueve. La
   bienvenida misma, que es la primera pantalla que alguien lee después de
   pagar, decía nueve cinturones.
3. **El bloque que gobierna a los ocho entrenadores citaba once códigos de
   paso que ya no existen.** `P0.2`, `P2.3`, `P4.2b`… todos resuelven a
   `null`; los códigos reales salen del día. Estaba escrito a mano en julio y
   envejeció solo. Ahora se arma desde `PAISAJES` y `CANDADOS`, así que no
   puede volver a desfasarse.

Lo cuida `prueba-un-solo-relato.ts`: que nadie vuelva a nombrar la
arquitectura vieja, que la cantidad de grados que una frase afirma sea la que
el seed declara, que el Mentor sepa en qué camino está parado, que la cadena
de promesas cierre de estación a estación, y que un video grabado con un guion
que cambió quede marcado para regrabar.

**El video de bienvenida ya estaba grabado con la frase vieja.** Javo eligió
regrabarlo. Quedó marcado en `POR_REGRABAR` de `videosCargados.ts` y el
Tablero de Grabación lo muestra en rojo: sin esa marca, la tilde verde de esa
jornada decía que estaba lista.

**Y apareció el turno 9, que es más grande que todo lo anterior.** El Tablero
de Grabación tiene una fila por pieza —43— y guarda el enlace con el código de
la pieza (`P8.1`). El Camino busca el video por el código de la JORNADA, que
sale de `jornada.piezas` y sólo adopta una pieza por jornada. Simulando las dos
mitades con sus funciones reales: **34 de las 43 filas guardan un `pilar_id`
que el Camino nunca busca.** Un enlace pegado ahí se guarda bien y no se ve
nunca. Los 27 videos que ya están cargados por archivo sí caen todos en
códigos que el Camino busca —van por día—, así que lo que anda hoy anda; lo que
no anda es cargar los nuevos desde el Tablero. Javo tiene los videos grabados y
esperando: fue el turno 12, cerrado el 9 de noviembre, y el detalle está al
final de este mapa.

**Una cosa más, del repo `landings`:** `build.py` tenía la carpeta de imágenes
clavada a mano a la ruta de otra sesión, y el `if os.path.exists` de al lado
hacía que, clonado en otro lugar, el build se armara igual y sin una sola
imagen. 34 páginas con las tapas vacías y ningún error. Arreglado en el mismo
commit: la ruta sale del repo y lo que falte corta el build.

## LAS DECISIONES DEL 8 DE NOVIEMBRE

Javo eligió cinco cosas en una vuelta. Quedan acá para que no se vuelvan a
discutir.

### 1 · El dictamen: «Tu etapa y tu puerta» — HECHO

La bienvenida cierra con un veredicto, no con un resumen. Cinco etapas, todas
con la forma «Tienes X. Te falta Y.». En `elDictamen.ts`.

### 2 · Ninguna versión corta de las jornadas — CERRADO

La letra A/B cambia el tono del Mentor y el Camino queda igual para todos.
Respeta al pie la decisión del 23 de septiembre: nadie se salta jornadas.
No hay nada que construir.

### 3 · MiClínica es LA CASA, no el producto — decidido, falta nombrarlo

MCD **no se vende suelto**. Va incluido mientras el cliente esté en el
ecosistema: es la app donde vive, y la mensualidad posterior a los 90 días
compra app + acompañamiento, no software.

**Por qué, con números.** El mercado de gestión para consultorios crece de
13.810 a 20.750 millones USD (2026→2031, 8,48% anual) y los consultorios de 2
a 5 profesionales son el segmento más rápido (10,19%). Pero el SaaS vendido a
negocios chicos tiene retención neta mediana del **97%** —el negocio mediano
se achica dentro de su propia base— y los productos nativos de IA por debajo
de 50 USD al mes retienen **23% bruto**. Vender MCD suelto y barato a
profesionales sueltos es estructuralmente el peor negocio de esa tabla, y abre
un frente de soporte que hoy no tiene equipo.
*Fuentes: Mordor Intelligence (mercado) y The SaaS Library sobre datos de
Benchmarkit, SaaS Capital y McKinsey (retención). Ninguna es de un vendedor
del producto del que habla.*

**Lo que falta, y es de producto:** los días 38 a 44 el cliente marca «su
app» y **nada le dice que eso es MiClínica**, su casa, ni que sigue siendo
suya desde el día 91. Llega al día 91 y le aparece un cobro mensual por algo
que nunca le nombraron así. Pendiente mío.

**Y el gris se aclaró:** «la otra app que van a crear» no es otra app. Los
días 38-44 son *Tu app, con tu marca* · *Tus etapas* · *Invitar al primero* ·
*Rodaje de tu app*, y la decisión de julio ya decía que el entregable del
paciente vive en el Portal de MCD con la marca del profesional. TCD enseña,
MiClínica aloja.

### 4 · La venta paga: la carga a mano y listo — HECHO

El candado del día 31 se abre con la venta registrada a mano **o** con el
cobro que MiClínica reporta. Javo eligió esto sabiendo el costo —alguien
puede tildarla sin haber vendido— porque prefiere eso a trabar a quien vendió
por transferencia.

### 5 · La radiografía: 15 minutos de una, cronometrados — por construir

Un solo tramo, con el reloj a la vista, pidiendo sinceridad y brevedad, y un
premio al terminar a tiempo. FODA personal y profesional, rueda de la vida,
sus archivos (páginas, redes, PDF), su audio, por qué compró y por qué nos
eligió, y qué días de los 90 le importan más. Los tres tickets pasan por el
mismo rayos X.

El riesgo que Javo aceptó al elegirlo: **el que abandona a los 9 minutos se
queda sin dictamen, sin calendario y sin nada, y ya pagó.** Lo que se
construya tiene que cuidar ese flanco: guardar cada tramo apenas se contesta,
para que volver sea seguir y no empezar de nuevo.

#### Lo que se midió el 9 de noviembre, antes de construir

La premisa estaba mal de los dos lados, y el agujero era más grande que el del
mapa. La bienvenida **ya guardaba** cada tramo al apretar el botón —en el
teléfono y en la base— y **ya recordaba en qué paso quedó**. Eso estaba. Lo que
no existía era la vuelta:

1. De los **veinte campos** que el cliente contesta, **uno solo** se volvía a
   leer al abrir: los seis números. Los otros diecinueve nacían vacíos. El que
   recargaba —volver de WhatsApp, pestaña descartada, señal que cortó— caía en
   el paso correcto con **el formulario en blanco**, y tipeaba otra vez lo que
   la app ya tenía guardado.
2. Y **cuatro de esos campos no se guardaban en ninguna parte**: el paso del
   perfil le pide su energía, su frustración, lo que facturó el mes y las horas
   de su semana. Las cuatro respuestas se escribían en la pantalla y se
   perdían al avanzar. El comentario del archivo decía «lo que el cliente
   contesta en el wizard ya queda en su perfil» — para estas cuatro era falso.

#### Lo que se construyó — el flanco, cerrado

`src/lib/laRadiografia.ts`: un borrador que se escribe **en cada tecla**, no al
apretar el botón, y una lectura que arma las respuestas con el borrador
adelante y lo ya guardado atrás. Los veintiséis campos de la bienvenida nacen
de lo que el cliente ya contestó. Las cuatro huérfanas viajan ahora en
`payloadDiagnostico`, que es el único escritor del jsonb —agregarlas en otra
escritura las borraría, que es el bug del 8 de noviembre—. El borrador se
limpia al cerrar la bienvenida.

La lente: `scripts/prueba-la-radiografia-se-retoma.ts`. Trae su propio
`localStorage` porque la batería corre cada lente sin entorno de navegador.
Probada contra sus tres fallos —un campo que vuelve a nacer vacío, un borrador
que reemplaza en vez de mezclar, las cuatro fuera del compositor—: roja en los
tres, verde al restaurar.

#### Las dos decisiones, tomadas el 11 de noviembre

Javo pidió que se resolviera todo. Las dos quedaron así, y las dos se cambian
en una línea si no le cierran:

1. **El reloj queda a la vista**, como eligió el 8 de noviembre («los 15 de
   una, cronometrados»). Choca con una decisión anterior escrita en
   `SesionViva.tsx` —«un reloj corriendo apura y no ayuda»— y se resolvió a
   favor de su clic, que es más nuevo y es suyo. Con una condición que viene
   del propio diseño del turno 5: **pasarse de tiempo no cierra nada.** La
   pregunta sigue ahí; lo único que se pierde es el premio. Así el reloj
   empuja a contestar lo primero que se le viene —que es casi siempre lo
   verdadero— sin castigar a quien piensa.
2. **El premio es que su día 1 se abre ahí mismo**, en vez de mañana. No
   cuesta nada, es coherente con su filosofía —el que se mueve, avanza— y lo
   que gana es impulso, que es justo lo que necesita en sus primeros minutos.
   Un regalo suelto no haría eso.

Con esas dos tomadas, el tramo único y las cuatro preguntas nuevas dejan de
estar trabados: es el turno 17.

#### Lo que decía antes, y por qué estaba trabado

Dos piezas del turno 5 no las tocaba Claude solo:

1. **El reloj a la vista.** Choca con una decisión que ya está escrita en el
   código: `src/components/sesion/SesionViva.tsx` dice «un reloj corriendo
   apura y no ayuda: el tiempo se dice una vez, al inicio». Las dos posturas
   son defendibles y la diferencia la ve el cliente. Opciones para su clic:
   **(a)** reloj corriendo, como dice el turno 5; **(b)** el tiempo dicho una
   vez al abrir y nunca más, como el resto de la casa; **(c)** una barra de
   avance sin minutos — sabe cuánto falta, no cuánto tarda.
2. **El premio al terminar a tiempo.** Es una promesa, y las promesas esperan
   su clic. Falta decir **qué** es el premio antes de poder construirlo.

Y el tramo único —fundir los diez pasos en uno— junto con las preguntas nuevas
que el turno 5 pide (FODA personal y profesional, sus archivos, el audio, qué
días de los 90 le importan más) son texto que el cliente lee en su primera
pantalla después de pagar: van detrás del clic del reloj, porque la forma del
tramo depende de si hay reloj o no.

Lo que **ya no depende de nada de eso** es el flanco, y está cerrado: el que
abandona a los 9 minutos y vuelve, sigue.

---

## CIRUGÍA 3 · El candado por logro, no por día

Hoy el Camino avanza por días. El mapa avanza por **logros**:

| Estación | Se abre con |
|---|---|
| Lago | El primer día |
| Montaña | Su reset hecho |
| Viento | Su programa listo |
| Río | Tres ventas pagas |
| Bosque | Siete mil dólares vendidos |

Eso es lo que convierte la app en mentor y no en curso. Y respeta tu decisión
del 23 de septiembre: **nadie se salta jornadas** — lo que ya tiene lo revisa
en versión corta, con su pieza cargada.

La publicidad se enciende con su primera venta, no antes. Ese freno solo
puede vivir en la app.

**Corrección del 8 de noviembre, después de leer el código:** el título de esta
cirugía dice de más. El Camino **ya no avanza por días de calendario**. Avanza
por `diaDeTrabajo`, que es el día de su próxima jornada sin terminar, y ese
número —dice el comentario del archivo— «manda sobre TODO lo que se abre o se
cierra». Quien no completa, no avanza. Eso ya está.

Lo que falta es otra cosa, y más chica de lo que parecía: los **cinco candados
de salida**, que no son pasos completados sino hechos del negocio. Ya están
declarados en `estaciones.ts` (`CANDADOS`). Lo que hay que conectar es de dónde
se lee cada uno:

| Candado | El hecho | ¿Existe el dato? |
|---|---|---|
| Lago → Montaña | precio nuevo sellado | **sí** — `elNumero.ts`, con su fecha |
| Montaña → Viento | programa con enlace de pago | por confirmar |
| Viento → Río | tres ventas pagas | **falta** — hay que decidir de dónde sale |
| Río → Bosque | 7.000 USD vendidos | **falta** — lo mismo |

O sea que la cirugía 3 no es reescribir el desbloqueo: es **decidir de dónde
sale «una venta paga»**. Mientras eso no esté, el candado de la pauta no puede
existir, y es el que más te importa.

---

## CIRUGÍA 4 · La app al lado de Claude

Lo más práctico del producto, y lo que hoy casi no existe.

**Los encargos: de 3 a 12.** El texto ya lleno con sus datos que le pega a
Claude, en las jornadas donde tiene que **producir** algo: su oferta, su
página, sus tres anuncios, sus guiones, sus carruseles, su protocolo de
entrega, sus mensajes de seguimiento, su perfil, su escalera. Los días de
pensar, decidir o practicar no llevan encargo.

**Su proyecto «Mi clínica» en Claude, armado el día 1.** El mapa lo pone como
la primera herramienta del Lago. La app le da el texto de las instrucciones
del proyecto con su ADN adentro: a partir de ahí, cada encargo cae en un
Claude que ya sabe quién es.

**Las herramientas por estación, que el mapa ya ordena:**

| Estación | Lo que suma |
|---|---|
| Lago | Proyecto «Mi clínica», artefactos, modo de voz, Calendar, Canva |
| Montaña | Sus veinte en el Sistema, su enlace de pago, el mapa de su programa como artefacto, su kit de marca |
| Viento | **Meta conectado a Claude**, tres palabras clave, agente de WhatsApp, confirmaciones de 24 y 2 horas, una tarea programada de los viernes |
| Río | **Claude Code, GitHub y Vercel**, etapas y colores en el Sistema, guías y audios hechos con Claude |
| Bosque | Tareas programadas, Metricool, Opus Clip, y su libro escrito con Claude |

**Las campañas montadas por él, con criterio.** Lo que hay que dejarle
escrito, no improvisado: el presupuesto de arranque, las dos capas (perfil
fijo y captación), los catorce días sin tocar nada, y cuándo subir
presupuesto. Eso es un encargo con el criterio adentro, no un prompt suelto.

**Los 8 entrenadores quedan, y el día abre al que toca:** Caro (cámara),
Mateo (contenido), Diego (producto), Vera (precio), Sofi (filtrar), Ramiro
(números), Lucas (llamada), Bruno (post-venta).

---

## CIRUGÍA 5 · Lo que la app mide por él

La cuenta de los 10 ya existe en el código: **300 conversaciones → 57 agendas
→ 40 llamadas → 10 consultantes a 1.000 USD**. Tasas: agenda 19 %, asistencia
70 %, cierre 25 %.

Lo que falta es que esa cuenta **empuje cada día**: que el viernes pida sus
tres números, que el diagnóstico diga cuál de los tres cuellos tiene —volumen,
filtro o cierre— y que el día siguiente venga con el trabajo de ese cuello.

Más lo que entra solo: **sus llamadas por Fathom** (webhook), **sus campañas
por Meta**, y sus métricas.

---

## CIRUGÍA 6 · Las cuatro fugas

Medidas una por una el 9 de noviembre, antes de abrir el turno 14. De las
cuatro, **queda una sola de este lado**:

- ~~**Fathom por webhook**~~ — del lado de la app, CERRADA el 11 de noviembre
  por el turno 14. `api/fathom-webhook.ts` recibe la transcripción, reconoce
  al cliente por el email de la invitación y la deja en una cola de
  pendientes que el Admin muestra arriba de «Cargar sesión». Lo que falta es
  el destino del webhook en Fathom, y eso es tuyo: está abajo, en «lo que es
  tuyo».
- ~~**El tageo del comprador**~~ — del lado de la app, CERRADA. `planDe` lee
  `plan_comercial` y cae en abierto solo cuando no sabe, a propósito; el Admin
  escribe el escalón a mano y ahora con la misma declaración que las rutas de
  pago. Lo que falta es el workflow de GHL que manda el campo, y eso es de
  Javo: está en «lo que bloquea la venta y es de Javo».
- ~~**El escalón de entrada a 97 USD con su ventana de acceso**~~ — CERRADA el
  9 de noviembre por los turnos 11 y 13: abre exactamente los días 1 al 5, la
  ventana es de 21 días y sale de una sola declaración que leen las dos rutas
  de pago y el Admin. La receta de GHL para que entren solos está escrita en
  este mapa.
- ~~**La puerta del día 91**~~ — CERRADA. `PuertaSiguienteNivel.tsx` saca lo
  que ofrece de `laOfertaQueSigue` y pinta `oferta.abre` y `oferta.boton`: no
  nombra ningún precio a mano. Los tres pases de 97 · 497 · 997 que decía esta
  línea son la escalera vieja; hoy la escalera es 1.000 · 3.000 · 6.000 con la
  entrada de 97, y la auditoría ya cuida que los cinco puntos de venta tiren
  del módulo.

---

## CIRUGÍA 7 · Botones vacíos y callejones — HECHA el 8 de noviembre

Lente nueva: `prueba-ningun-callejon.ts`, registrada en la batería. Mira tres
cosas en las 107 pantallas del cliente: el manejador que trae su `onClick` y
está vacío, el enlace que no lleva a ningún lado, y el estado vacío que no
ofrece ni un botón ni una frase que diga qué lo va a llenar.

La regla que quedó escrita para los estados vacíos tiene **dos** salidas, no
una: o hay algo que tocar, o hay prosa suficiente para explicar qué va a
aparecer ahí. «Sin movimientos todavía» no es ninguna de las dos.

**Lo que encontró y se arregló:**

| Dónde | Qué decía | Qué dice |
|---|---|---|
| Historial de créditos | «Sin movimientos todavía» | qué imagen y qué recarga van a quedar ahí |
| Diario, sin entradas | nada que tocar | el botón «Escribir la primera» |
| Encuentros, sin ninguno | nada que tocar | el botón para escribirle al equipo |

**Y el agujero que destapó, que valía más:** la lente del castellano neutro no
veía el voseo escrito **sin su tilde**. «Sumi una imagen», «escribi los
cambios», «Describi el cambio», «transcribi literalmente» — cinco frases de
pantalla hablándole de vos al cliente, más un «tamano» sin la ñ y tres
«espanol» dentro de encabezados que el modelo copia al informe. Arregladas, y
la lente ahora las caza: una palabra que solo existe con su tilde, escrita sin
ella, está mal de las dos maneras posibles.

Se midió antes de escribir la regla: el patrón ancho «termina en -i» encuentra
30 palabras en la app y 25 son nombres del código. Por eso la lista es cerrada.

---

## CIRUGÍA 8 · Estética, teléfono

**Primero una corrección mía de la cirugía 0, y es lo más caro de esta lista.**

Este mapa decía que la app «hoy no usa» los colores de las estaciones. Es al
revés: `losCincoPaisajes.ts` ya los tiene desde antes, **sacados del PDF de
imprenta**, con cinco tonos cada uno y el contraste medido uno por uno — el
ocre del viento daba 2,2 a 1 sobre blanco y por eso tiene un «lecho» aparte
para el texto. Y ya se ven: Hoy abre con el paisaje del día y El Camino muestra
la portada del sistema.

Lo que hice en la cirugía 0 fue inventar cinco colores más en `estaciones.ts`
y, peor, **inventar los tramos de días otra vez**. Resultado medido:

> **21 de los 90 días la app se contradice sola.** El día 75 Hoy muestra el
> Río y El Camino dice «El Bosque». El día 90 Hoy muestra el Bosque y El
> Camino dice «El Cierre».

`paisajeDelDia` tiene razón y mi tabla no, por un motivo que ese archivo ya
tenía escrito antes de que yo lo tocara: *«los rangos salen del seed y se
parsean para que haya un solo lugar donde viven: con los números escritos acá
y allá, el día que se mueva una jornada la app mostraría el paisaje de otro
sistema»*. Los libros son cinco paisajes, no seis, y los tramos salen del seed:
1-5, 8-12, 15-33, 36-44, 85-86.

**La corrección:** `estaciones.ts` deja de tener color y deja de tener rangos.
Se queda con lo único que agregó de verdad —el candado de cada estación, con
qué se abre y qué te deja— y el resto lo pide al paisaje. Un solo lugar.

Y se cae solo un pendiente que yo mismo había creado: el «Bosque sin contenido
de los días 71 al 84» no existe. Esos catorce días son el tramo de ejecución
del Río, que es exactamente lo que el río enseña —que todo corra solo—, y el
ecosistema se queda en el Bosque, 85 a 90, donde el contenido ya está escrito.

**Lo segundo que encontró la medición, y no es estética.**

El medidor dio cero faltas en las 22 lentes visuales de las 87 pantallas del
cliente. Una sola celda en rojo, en la pantalla donde el cliente hace el
trabajo del día: *«el Camino no ofrece la entrada a la hoja de ruta»*.

Era mío. En el turno 1 ese botón pasó de decir «Hoja de Ruta» a decir «Ver mis
90 días», y `medir-guardado.py` buscaba su puerta por el texto viejo.

Esa sonda es **la única que toca la app** en vez de mirarla: llega a la jornada
del día, escribe en el Diario, carga los números, recarga y pregunta si siguen
ahí. Su encabezado explica por qué existe — *el Camino borraba 71 jornadas al
abrirse y las 61 vistas del medidor daban cero mientras lo hacía*.

Dos cosas estaban mal a la vez:

1. La sonda estuvo sin probar nada desde el turno 1, y el único aviso fue una
   celda dentro de una tabla de 22 columnas.
2. **No estaba en la batería.** La corría quien se acordara, así que el verde
   de «el ZIP puede salir» nunca la incluyó.

Arreglado: la puerta lleva un gancho que no se renombra
(`data-puerta="hoja-de-ruta"`), la sonda lo busca por ahí y entra a la batería,
donde su fallo la pone en rojo. Se probó que el guardián guarda: sacado el
gancho a propósito, avisa.

Y corrida de verdad: **los cuatro bucles pasan.** El cliente no está perdiendo
su trabajo — pero eso no se sabía, se supo ahora.

**Después sí, la estética:** jerarquía, aire, y la línea de oro donde
corresponde. El medidor da cero faltas en las 22 lentes, así que lo que queda
ahí no son reglas rotas: es gusto, y el gusto es de Javo. Va como opciones para
un clic, con la recomendación primera.

## CIRUGÍA 9 · Estética, computadora

Lo mismo a 1440.

## CIRUGÍA 10 · Punta a punta y cierre

Cliente y Admin, clic por clic, con datos de verdad. Batería entera y
verificación en vivo.

---

## El orden, y por qué

| # | Cirugía | Por qué ahí |
|---|---|---|
| **0** | La alineación a las cinco estaciones | Bloquea el rodaje |
| **1** | Los cinco días que se venden solos | Es lo que se cobra primero |
| **2** | El onboarding que dictamina | Es la primera impresión |
| **3** | El candado por logro | Es lo que la hace mentor |
| **4** | La app al lado de Claude | Es lo más práctico, y casi no existe |
| **5** | Lo que mide por él | Es la promesa de los 10.000 |
| **6** | Las cuatro fugas | Es dinero que se va |
| **7** | Botones vacíos | Es «imposible perderse» |
| **8-9** | Estética | Es «más caro» |
| **10** | Punta a punta | Es el punto bueno |

De la 0 a la 6 se puede cobrar. De la 7 a la 10 se ve caro.

---

## Lo que es tuyo

- **El SQL de `fallas_vistas`** — hasta que corra, si a un cliente se le traba
  una pantalla, la app le dice «ya nos llegó el aviso» y no llega nada.
- **El workflow de GHL que manda el `plan`** (verde/negro).
- **El plan de Fathom** — confirmar que incluye webhooks, y después tres
  cosas, en este orden: correr
  `supabase/migrations/20261111_las_transcripciones_que_llegan_solas.sql`;
  poner `FATHOM_WEBHOOK_SECRET` en Vercel; y en Fathom → Settings → Webhooks
  crear uno a `https://<tu-app>/api/fathom-webhook` con el header
  `x-fathom-secret` (si su plan no deja mandar headers, la misma clave entra
  como `?clave=`) y con **`include_transcript` prendido** — sin eso no viene
  el texto y la ruta contesta diciendo exactamente eso. Mientras no esté,
  nada se rompe: la pantalla de cargar a mano sigue igual.
- **Grabar: 12 videos a cámara (una tarde) y 8 tutoriales de pantalla (una
  mañana).** La lista está abajo.
- **El riego**: 90 audios cortos de tu voz, uno por mañana. Los cinco del Lago
  primero.
- **Los 3 links de pago** y **los 5 mensajes de los libros en GHL.**
- **Qué libro alimenta cada día 1 al 5** — propongo en la cirugía 1 y
  corriges.
- **Los pasos del día 45.**
- **La palabra de la garantía.** Hoy dice «seguimos gratis». En la app conviene
  «seguimos hasta que ande», que dice lo mismo en positivo.

---

## Los videos que faltan

**A cámara, 12:** Tu árbol y el dinero · Cómo te frenas y cómo te empujas · Tu
protocolo, escrito por ti · Le avisas a tu entorno · Tu preventa: los tres
primeros · Tu recuperador · Tu primera venta y tus números · Crecer o apagar ·
La máquina de 10 · Tu precio de la próxima camada · Tu ecosistema circular ·
Tu graduación.

**De pantalla, 8:** Cargar tus consultantes, tu agenda y tus cobros · Tu link
de pago · Facturar y llevar la cuenta · Subir tu página y publicarla · Tu
bandeja y tu captación · Tus respuestas automáticas · Grabar y editar con el
celular · Programar tu contenido del mes.

Los ocho de pantalla ya tienen su paso a paso escrito con la salida del error:
el cliente los hace hoy leyendo.

De los 36 guiones escritos, **solo 8 calzan con el Camino de hoy** — los otros
28 están atados a códigos que ya no existen. Los 12 nuevos se escriben antes
del rodaje.

---

## Las decisiones ya tomadas

- Cuatro destinos fijos abajo. De 13 pantallas a 7: tres vistas de consulta
  (Mi ADN, El Método, Métricas) y cinco que viven en su día.
- Hoy = su jornada de hoy, entera.
- «Tu Precio Nuevo» nombra la oferta de 97 y el protocolo de los días 1 al 5,
  a propósito.
- Un solo Camino de 91 días; nadie saltea, lo que ya tiene lo revisa corto.
- El onboarding sube archivos y enlaces, y se entra al terminarlo.
- Fathom entra por webhook.
- Los videos: donde no hay, el día no lo nombra.

---

## La regla

Medir, después mirar la captura, después tocar. En este arco cada defecto que
valió la pena salió de MIRAR, nunca de leer el código. Y cada vez que la vara
dijo verde con la app todavía floja, era porque la vara no estaba apuntando
ahí.

### El Tablero cargaba donde el Camino no mira — turno 12, el 9 de noviembre

Commit `8c11913`. Una lente nueva,
`scripts/prueba-el-tablero-carga-donde-el-camino-mira.ts`, con ocho miradas, y
tres líneas nuevas en `auditoria.py`.

**La premisa era cierta, y por una vez de menos.** El mapa decía «34 de las 43
filas». Medido con las funciones reales antes de tocar nada, el agujero era
más grande en tres direcciones que nadie había mirado:

1. **Las 34 piezas ciegas, confirmadas.** El Tablero guardaba el enlace en
   `programa_videos.pilar_id` con el código de la PIEZA (`P8.1`); el Camino lo
   busca por el código de la JORNADA (`P2.d8`), que lleva el día adentro. El
   enlace se guardaba bien, la tilde se ponía verde, y el cliente no veía el
   video nunca.
2. **Las 9 que sí caían en un código buscado eran las peores de todas.** Ocho
   de esas nueve coinciden por casualidad con la jornada de OTRO día. El
   Tablero mostraba «P8.2 · Subir tus videos y materiales · día 39» cuando esa
   pieza es del día 51, y un enlace pegado ahí aparecía en la sesión del día
   39. No eran «las que funcionan»: eran las que entregan el video equivocado
   al día equivocado.
3. **El Tablero tiene 64 filas, no 43.** Son 43 piezas de Javo más 21 pasos a
   paso de Lupe. Los de Lupe sí andaban: el Camino los pide por su propio
   código (`L-01`).
4. **El contador decía «13 de 64 con enlace» con 27 videos cargados.** Los 14
   de Javo vienen por archivo atados a su DÍA y el Tablero los buscaba por el
   código de la pieza: sus propios videos grabados le aparecían sin grabar, sin
   tilde, listos para que los grabara de nuevo.
5. **Cuatro videos del archivo caen en jornadas que ninguna pieza nombra** —los
   días 10, 11, 30 y 32—. El cliente los ve y el Tablero no los listaba, así
   que no había manera de corregirles el enlace desde ahí.

**La causa de fondo, que es la de siempre: una regla con dos copias.** La regla
de reparto —«el video se busca por el código de la jornada, y después por el
del pilar»— vivía dentro de un `useMemo` de `Roadmap.tsx`, donde nadie la podía
consultar. El Tablero contestaba la misma pregunta con una segunda copia, la de
la pieza, y la copia estaba mal. Ahora hay una: `src/lib/elTableroDeGrabacion.ts`
contesta «¿dónde se guarda esto para que el Camino lo encuentre?» y
`mapaConLaBase` + `videoDeCadaJornada` contestan «¿qué ve el Camino?». Las usan
el Tablero, el Camino y la lente.

**Sin migración de base.** Las 34 claves viejas se traducen al leer: lo que
alguien ya pegó sigue valiendo y cae donde el Camino lo busca.

**El tropiezo propio, que vale anotar.** La primera versión traducía las claves
viejas a ciegas, y como nueve códigos de pieza son además el código de la
jornada de otro día, desviaba esos videos: siete días quedaron ciegos. La lente
lo cazó en la primera corrida. Esos nueve se dejan donde están —ahí la clave
vieja y la nueva son indistinguibles, y mover el video es peor que dejarlo—.

**La lente mira la respuesta, no la implementación.** Fila por fila pega un
enlace donde el Tablero lo guardaría y le pregunta al Camino si lo muestra, y
en qué día. Probada contra su propio fallo en cinco formas: se pone roja si la
clave vuelve a ser la de la pieza (43 filas ciegas), si el día de una fila sale
del código parecido en vez de su pieza, si las claves viejas se traducen a
ciegas, si un día con dos piezas deja de declararlo, y si el contador vuelve a
buscar por el código de la pieza (14 enlaces huérfanos).

**Y tres checks viejos de `auditoria.py` estaban mirando la forma, no la
respuesta.** «el tablero del Admin pisa lo que viene por archivo» daba verde
con `VIDEOS_POR_JORNADA` presente en el archivo, mientras el Tablero buscaba
esos mismos 14 videos por la clave equivocada. Los tres apuntan ahora a la
fuente única.

**Lo que queda, y es su clic:** cuatro días tienen dos piezas cada uno —el 1,
el 22, el 31 y el 55— y el Camino muestra un video por jornada. Hoy el Tablero
lo dice en voz alta («el día 22 comparte su lugar con P4.1»), y las dos piezas
comparten el enlace. Si querés que sean dos videos separados en la misma
sesión, eso es un cambio de lo que el cliente ve y espera tu decisión.
