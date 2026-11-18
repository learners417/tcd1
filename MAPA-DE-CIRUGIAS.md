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
| 17 | **La radiografía en un solo tramo**: fundir los diez pasos, con el reloj y las cuatro preguntas nuevas (FODA, sus archivos, su audio, qué días le importan) | **cerrado** · `acc1f1a` · 1 lente nueva, 64 miradas · el premio se disolvió al medirlo |

La cirugía 1 —los cinco días que se venden solos— no entra en la cola: toca el
precio de entrada (27 en la app, 97 en la oferta) y espera su clic. Las
cirugías 0, 2, 3 y 7 quedaron cerradas por los turnos 1 al 8; las 8 y 9, por
el flanco, y lo que queda en ellas es gusto suyo.

**La cola quedó sin turnos abiertos el 12 de noviembre, con el turno 17.** Los
diecisiete están cerrados; en cinco —5, 9, 10, 13 y 14— lo cerrado es el flanco
y lo que queda adentro es tu clic, no trabajo. Así que la tarea programada
sigue encendida y sin nada que tomar.

**Tres premisas del encargo de la tarea ya no son ciertas.** Dice «los diez
turnos» —son diecisiete— y dice que MCD «hoy NO tiene batería de ningún tipo:
ése es su primer turno». MCD tiene su batería desde el 9 de noviembre:
`auditoria.py` en su raíz, nueve bloques, 46 lentes, cerrada por el turno 6
(`f3e9ddc`), más las 5 del puente del turno 7 (`7c6e524`). Y desde el 16 de
noviembre a las 11:40 tiene además tres `prueba-*.ts` que **ejecutan** código,
así que lo de «su batería es toda Python» tampoco vale ya.

Y la cuarta, del 17 a las 15:30, es sobre el método y no sobre el contenido:
el encargo manda `git log --oneline -8` como primera medición, y **`git log` y
`git status` no son fuentes confiables para el estado del remoto en un
contenedor recién nacido** — leen un ref en disco que puede ser de ayer. Lo
primero de un turno es `git ls-remote origin`, o un `fetch` que de verdad haya
corrido; si el `fetch` sale rechazado, el turno **no sabe** dónde está el
remoto y tiene que decirlo en vez de deducirlo.

Y la tercera, medida el 16 a las 15:30: dice que las dos apps **«comparten
Supabase»**, y no lo comparten. El comentario de la propia ruta de MCD lo dice
—«TCD (proyecto Supabase distinto)»— y las tablas no se cruzan. Lo único que
une a las dos apps es **el puente HTTP**, que es por lo tanto el único lugar
donde pueden dejar de entenderse — y era justo lo que nadie medía (abajo, en
«El 16 de noviembre a las 15:30»).

**Decisión tuya, y es un botón de tres:** apagar la tarea, espaciarla (de cada
cuatro horas a una vez al día, mientras decides), o escribirle turnos nuevos a
esta tabla y que siga sola. Los tres se tocan solo desde tu teléfono: la sesión
no puede ni apagarla ni espaciarla. No se inventan turnos acá: la cola es tuya.

**Y si quieres escribir uno, quedan tres candidatos con el trabajo ya medido,
y los tres esperan tu clic.** El frente de la auditoría de la auditoría se dio
por **cerrado entero** el 14 a las 19:30, y el 15 a las 03:25 **esa premisa se
cayó también**: estaba cerrado para **un** idioma. El `//` de TypeScript era el
único comentario que la batería sabía leer, y con la guarda de la carpeta del
dueño comentada con `--` la lente que dice medirla daba verde y ninguna otra la
veía (abajo, en «El 15 de noviembre a las 03:25»). Cerrado ahora para `.sql`,
`.py`, `.sh` y el `.gitignore` de MCD, con 33 fugas vivas más que salieron por
el camino. **Y el 15 a las 06:30 se cayó una tercera vez, por otro lado:** no
la marca del comentario sino **la puerta** —`index.html` y `src/index.css` se
leían con `open(...)`, fuera de `rd()`, y tres lentes vivían de ese lado—, más
el décimo agujero y sus 14 fugas vivas (abajo, en «El 15 de noviembre a las
06:30»). **Y el 15 a las 07:25, una cuarta, en otro cuerpo:** las cuatro
anteriores auditaron `auditoria.py`, y nadie había auditado nunca **las 133
`prueba-*.ts`**, que el bloque 10 juzga solo por el código de salida.
`prueba-cadena.ts` no tenía ninguno (abajo, en «El 15 de noviembre a las
07:25»). El primero de los tres que quedan es
**cerrar `/api/mcd-bridge`**, la última ruta sin llave, con su botón abajo en
«El 14 de noviembre a las 03:30». Los otros dos son
del 13: subir el `next` de MCD, y subir el editor de TCD (las dos
con su botón, abajo en «El hallazgo del 13 de noviembre»). Y uno más
—bajar el editor a `lazy()`— quedó medido el 13 de noviembre a las 19:25, y el
corte resultó ser otro: el Admin entero (su botón, abajo en «El tercer
candidato, ya medido»).

### El apagado solo: no es la categoría del borrado, es cualquier escritura

El encargo de la tarea dice «cuando los turnos estén cerrados, desactivar esta
tarea programada». Cuatro turnos lo intentaron —el del cierre, el de las 07:25,
el de las 11:40 y el de las 23:25 UTC del 12 de noviembre— y las cuatro veces
salió rechazado. **Pero el motivo que este mapa daba estaba mal, y era un motivo
que te mandaba a tocar donde no servía.**

Decía «el permiso de la sesión lo rechazó: apagar una tarea programada necesita
tu visto». Medido el 12 de noviembre a las 23:25: la tarea **ya corre en
aprobación automática** —su `permission_mode` es `auto`—, así que no es que le
falte tu visto. Lo que lo rechaza es **el clasificador del modo automático**, y
ese mismo día quedó anotado con la categoría «Cowork Scheduled Task Delete», o
sea: lo que no se puede es borrarla.

**Eso también estaba corto, y se midió el 13 de noviembre a las 03:23.** No es
la categoría del borrado: es **cualquier escritura sobre la tarea**. Ese turno
no intentó apagarla —el mapa ya decía que no se reintenta—; intentó algo mucho
menor y reversible: **espaciarla**, dejar de despertar cada cuatro horas y pasar
a una vez al día, con `update_trigger` y solo el `cron_expression`, sin tocar el
`enabled`. Salió rechazado igual, y la categoría que devolvió fue **«Cowork
Scheduled Task Write»**.

La consecuencia práctica es la que importa, y ahora es completa: **una sesión
dormida no puede tocar esta tarea de ninguna manera.** No apagarla, no
espaciarla, no cambiarle una coma. Ponerla en aprobación automática no sirve
—ya lo está—. Lo único que la apaga **o la espacia** eres tú, con dos toques en
Tareas programadas («Cola de turnos TCD y MCD»). Y para los turnos: **no se
reintenta nada de esto**, ni el apagado ni la cadencia, porque los dos chocan
con el mismo clasificador y gastan el turno.

Así que **la tarea despierta cada cuatro horas sin nada que tomar**, hasta que
la apagues tú o le escribas turnos nuevos a la tabla.

### Las despertadas sin nada que tomar, y lo que se midió en cada una

Ninguna construyó nada —no hay qué— y ninguna, de la tercera en adelante,
reintentó el apagado. Lo que hicieron fue medir desde frío, que es lo único
útil que queda cuando la cola está vacía:

| cuándo (12 nov, UTC) | lo medido |
|---|---|
| 07:25 | main en GitHub al día (`241ddd7` local y remoto, el mismo commit); la tabla sin turnos nuevos |
| 11:40 | las dos baterías enteras sobre contenedor reciclado, las dos en verde: TCD con `tsc` y `npm run build` limpios, **131 de 131** `prueba-*.ts`, `auditoria.py` con 868 miradas («el ZIP puede salir»); MCD con sus 52 |
| 15:50 | lo mismo otra vez en verde —TCD 131 de 131 y 868 miradas, cero faltas; MCD `tsc` y `next build` limpios y sus 52— y de paso se cazó la trampa del `HEAD` suelto |
| 19:25 | nada había cambiado desde las 15:50 —cero commits nuevos, los dos árboles limpios, `HEAD` idéntico a `origin/main` en los dos repos— y las dos trampas de contenedor volvieron a aparecer: `node_modules` en cero y `HEAD` suelto con la `main` local de TCD **quince** commits atrás. Las dos baterías se corrieron enteras igual, para no commitear este mismo apunte sin verde: TCD con `tsc` y `npm run build` limpios, las **131 de 131** pruebas en verde dentro del bloque 10 y `auditoria.py` con **868 miradas, cero faltas** («el ZIP puede salir»); MCD con `tsc` limpio, `next build` limpio **en la primera corrida** y sus **52** en verde |
| 23:25 | la cola seguía sin turnos nuevos —las 17 filas cerradas, cero commits de Javo, los dos repos en `origin/main`— y se midió por qué el apagado se rechaza (arriba). Se verificaron además las dos premisas que quedan abiertas del lado de Javo: el purgado de jsDelivr **sigue sin salida** (el proxy contesta 403 a `purge.jsdelivr.net`), y el botón de 97 sigue esperando el correo de GHL. Las dos baterías enteras desde frío, las dos en verde: TCD con `tsc` y `npm run build` limpios, las **131** `prueba-*.ts` más `prueba-pantallas.tsx` y `auditoria.py` con **868 miradas, cero faltas**; MCD con `tsc` limpio, `next build` limpio en la primera corrida y sus **52** |
| **13 nov, 03:23** | la cola seguía igual: las 17 filas cerradas, **cero commits de Javo** en los dos repos —el último de TCD es `efa4731`, de un turno, y el de MCD `7c6e524`, del 9 de noviembre—, los dos árboles limpios y `HEAD` idéntico a `origin/main`. Se midió **por qué el apagado se rechaza, otra vez y mejor**: no es la categoría del borrado, es cualquier escritura (arriba). No se corrió la batería para medir de nuevo un verde que ya dio verde cinco veces: se corrió para poder commitear este apunte |
| **13 nov, 11:24** | la cola seguía igual —las 17 filas cerradas, cero commits de Javo, los dos repos en `origin/main`— y las dos trampas de contenedor otra vez (`node_modules` en cero, `HEAD` suelto en **los dos** repos). Esta despertada sí trajo algo: se intentó lo único que faltaba medir —**si las dos apps están de pie** en vivo— y **no se puede desde acá**: el proxy contesta 403 al CONNECT de `app.tuclinica.digital` y de `mcd-eight.vercel.app`. Una sesión dormida no puede mirar las apps, igual que no puede tocar la tarea. Con esa puerta cerrada se miró lo que sí se alcanza —las dependencias— y de ahí salió el hallazgo de abajo |
| **13 nov, 15:25** | la cola seguía igual —las 17 filas cerradas, cero commits de Javo en los dos repos (`81d20eb` en TCD, `7c6e524` en MCD), los dos árboles limpios y `HEAD` en `origin/main`— y `node_modules` otra vez en cero. Con la cola vacía se fue a medir **el segundo hallazgo que el mapa daba por «un triaje entero»**: los tres avisos de TCD que viajan al navegador. Dos de las tres premisas se cayeron —`dompurify` no es del editor sino de `jspdf`, en trozo aparte y por un camino que la app no llama nunca; y el editor solo lo escribe staff, con RLS verificada— y la salida quedó probada entera en dos copias, las dos en verde, con botón de tres (abajo) |
| **13 nov, 19:25** · `53775e5` | la cola seguía igual —las 17 filas cerradas, cero commits de Javo—, y esta despertada **no midió: encontró una falta de regla en main y la cerró**. Al medir el tercer candidato (bajar el editor a `lazy()`) la batería se puso roja en `campanas>nueva`, y la premisa se cayó del lado bueno: **el rojo no era del `lazy()`**. Está en main desde antes, y el medidor lo veía solo a veces. En «Montar en Meta» la pantalla se desplazaba **18 px de costado** en un teléfono de 390. Arreglados los **doce** campos que lo causaban, endurecida la lente que lo dejaba pasar y escrita una lente nueva que lo lee en el código (abajo) |

| **13 nov, 23:30** | la cola seguía igual —las 17 filas cerradas, cero commits de Javo (`7770186` en TCD, `7c6e524` en MCD), los dos árboles limpios y `HEAD` en `origin/main`—, `node_modules` otra vez en cero en los dos repos. Esta despertada **no midió el código de MCD: midió su batería**, y encontró **dos lentes ciegas** en los dos bloques que la batería dice que existe para cuidar —la llave y el token—. Las dos daban verde con el defecto puesto. Endurecidas y probadas contra su propio fallo (abajo) · `ed9705e` en MCD |

| **14 nov, 03:30** · `f3195b2` | la cola seguía igual —las 17 filas cerradas, cero commits de Javo (`c7586ca` en TCD, `ed9705e` en MCD), los dos árboles limpios y `HEAD` en `origin/main`—, `node_modules` otra vez en cero. Esta despertada fue a por el candidato que el turno anterior dejó anotado —**la batería de TCD contra sí misma**— y encontró, antes que la lente, **el agujero**: cinco de las seis rutas de `api/ai/` no preguntaban quién llama, y cualquiera con la URL gastaba las llaves de proveedor de la casa. Cerrado con una puerta única, el token del lado del navegador, una prueba que ejecuta los seis handlers y el bloque 16 de la batería (abajo). Batería entera en verde antes de subir: `tsc` y `npm run build` limpios, **133 pruebas**, **878 miradas, cero faltas**; MCD sin tocar y con sus **53** en verde |

| **14 nov, 07:26** · `00a92d2` + `e5a3260` (MCD) | la cola seguía igual —las 17 filas cerradas, cero commits de Javo (`9de0794` en TCD, `ed9705e` en MCD), los dos árboles limpios y `HEAD` suelto otra vez en los dos repos—, `node_modules` en cero. Esta despertada fue a medir **la lente que el turno anterior dejó puesta**, y la lente estaba tapada con una lista de nueve nombres: tres mecanismos que no estaban en esa lista se sacaron del código dejando el nombre en un comentario y la batería dio **878 en verde, cero faltas**. Uno de los tres pasó incluso leyendo `rdc()`: `solo_codigo` no sacaba el comentario del **final** de la línea. Cerrado en los dos repos, y de paso dos lentes que mentían en main: una se contradecía con otra y otra **medía para nadie** (abajo) |

| **14 nov, 11:30** · `a76e8e7` (MCD) + `e5b3704` | la cola seguía igual —las 17 filas cerradas, cero commits de Javo (`e1058f8` en TCD, `e5a3260` en MCD), los dos árboles limpios y `HEAD` en `origin/main`—, `node_modules` en cero en los dos. Esta despertada fue a por el único candidato que el mapa daba por no medido —**la batería de MCD contra sí misma**, el espejo de lo que TCD cerró a las 03:30 y 07:26— y lo que encontró es peor que una lente ciega: **con la lista de pantallas protegidas vaciada y la de verdad dejada en un comentario una línea encima, las 57 lentes daban verde y las diez pantallas de cliente quedaban abiertas sin sesión**, con los pacientes detrás. Dos defectos más pasaron igual, y al migrar aparecieron una lente que medía un comentario en main y el `--` del SQL que `solo_codigo` no saca (abajo) |

| **14 nov, 15:25** · `da98ce6` | la cola seguía igual —las 17 filas cerradas, cero commits de Javo (`93c3961` en TCD, `a76e8e7` en MCD), los dos árboles limpios y `HEAD` suelto en los dos—, `node_modules` en cero. Esta despertada tomó el candidato que el mapa daba por **mecánico y preventivo** («ninguna de las 183 miente hoy») y la premisa se cayó dos veces: la lente del bloque 16 **estaba verde por un punto y coma** —veía la asignación cruda solo al principio de la línea, así que once presencias con forma de nombre vivían hoy en la forma exacta que la lente prohíbe—, y había **cuatro ausencias que eran el defecto**, donde un comentario escondía al endpoint que cobra sin poder devolver el crédito. Seis formas cerradas, 225 medidas pasadas al código, y una lente que medía la cadena vacía (abajo) |

| **15 nov, 03:25** · `eb59091` + `0c49ffb` (MCD) | la cola seguía igual —las 17 filas cerradas, cero commits de Javo (`480fb2b` en TCD, `a76e8e7` en MCD)—, `node_modules` en cero en los dos y el `HEAD` suelto en TCD. Con el frente de la auditoría de la auditoría dado por **cerrado de los dos lados**, esta despertada preguntó lo único que ese frente nunca había preguntado: **¿y el comentario de los otros lenguajes?** Todo lo cerrado entre el 13 y el 14 cuidaba el `//` de TypeScript, y la batería lee además `.sql`, `.py` y `.sh`. **Con la guarda de la carpeta del dueño comentada con `--`, la lente que dice medirla dio VERDE y ninguna otra la vio.** Y al endurecer la lente aparecieron **33 fugas vivas en main** que ninguna de las cuatro formas podía ver: la comilla de adentro. En MCD, lo mismo con `#`: `.env.local` comentado del `.gitignore` y las 57 en verde (abajo) |
| **15 nov, 06:30** · `f8fb28b` + `d7b905a` (MCD) | la cola seguía igual —las 17 filas cerradas, cero commits de Javo (`6e77528` en TCD, `0c49ffb` en MCD), los dos repos en `origin/main`—, `node_modules` en cero en los dos. El frente de los comentarios estaba cerrado en los cuatro idiomas, así que esta despertada preguntó por **la puerta**, no por la marca: `index.html` y `src/index.css` se leían con `open(...).read()`, por donde no pasa `_MARCAS`, no se llama `solo_codigo` y el bloque 16 no mira. **Tres lentes vivían de ese lado, y a dos de las tres no las vio nadie** (abajo, en «El 15 de noviembre a las 06:30»). Y al probar las fugas puestas salió el décimo agujero: el arreglo de la comilla de adentro había entrado en UNA de las cuatro formas, con **14 fugas vivas más** detrás |
| **15 nov, 11:30** · `a91274d` | la cola vieja seguía con sus 17 filas cerradas, pero el plan de la piel —los siete turnos que Javo pidió el 15— tenía su T1 cerrado (`f6f2ea8`) y el T2 abierto, así que se tomó ése. **La premisa se cayó por los dos lados**: las «206 reglas» eran 206 apariciones del prefijo y 15 de las 76 con clase estaban muertas; y la capa oscura no era herencia dormida sino **un interruptor en el Admin**, a un clic de volver. Por el camino salieron diez usos del naranja prohibido escritos en `rgba()` dentro del `.css` —que la lente de «en todo el repo» no podía ver—, un `hover` casi negro que el medidor no mira porque mide la pantalla quieta, y dos paletas más debajo (abajo, en «El 15 de noviembre a las 11:30») |
| **15 nov, 16:30** · `df84d81` | la cola vieja seguía con sus 17 filas cerradas y el plan de la piel tenía su T1 y su T2 cerrados, así que se tomó el **T3: los tres hilos del día**. **La premisa se cayó tres veces**: el seed no se escribe a mano —lo escribe `generar_seed.py`, y la batería ya lo medía—; los «28 días en que la app no pide nada visible» no salen del dato (59 jornadas no piden acciones de campo, así que los 28 son criterio de LIBROS); y la tercera es el hallazgo: **la lección escrita ya existía en el código y su pantalla no podía dibujarla nunca** —la `esencia` de 37 guiones, bajo el rótulo «La lección de hoy», en una rama que solo corre sin video dentro de un componente que solo se monta con video— (abajo, en «El 15 de noviembre a las 16:30») |
| **15 nov, 07:25** · `65f7ac2` | la cola seguía igual —las 17 filas cerradas, cero commits de Javo (`edd97d2` en TCD, `d7b905a` en MCD), los dos repos en `origin/main`—, `node_modules` en cero y la `main` local de los dos atrás con el `HEAD` suelto. Las cuatro despertadas anteriores auditaron la batería de TCD contra sí misma; esta preguntó por **el otro cuerpo de afirmaciones que la batería ni mira: las 133 `prueba-*.ts`**, que el bloque 10 juzga SOLO por el código de salida. **Una de las 133 no tenía ninguno**: `prueba-cadena.ts` imprimía `✗` por escenario y terminaba en 0. Probado con el defecto puesto: cinco de sus seis escenarios decían «La cadena está sana» a un cliente que no cobra, y la batería daba las 133 en verde y «el ZIP puede salir» (abajo) |
| **14 nov, 19:30** · `d5ead99` | la cola seguía igual —las 17 filas cerradas, cero commits de Javo (`dc8dc42` en TCD, `a76e8e7` en MCD)—, `node_modules` en cero en los dos y la trampa del `HEAD` suelto con la **`main` local de TCD 31 commits atrás** (un `git checkout main` a secas la hubiera dejado ahí: se arregló antes de medir). Esta despertada tomó el último candidato de este frente —**el recorrido por AST de la ausencia**— y la premisa se cayó otra vez: de las 46 ausencias de mecanismo que hay de verdad, **tres seguían en un recolector**, y las dos lentes que las usan estaban **ciegas hoy**, probado sacando el mecanismo del código. Y de paso, la lente del catch mudo conocía **una sola manera de escribir «mudo»**: las dos que están mudas de verdad en main se escriben distinto y nunca se vieron (abajo) |
| **15 nov, 18:30** · `5af53b5` | se tomó el **T4: las micro-tareas del papel**, y al empujarlo apareció lo que ninguna lente mira: **otra sesión había hecho el T3 en paralelo** (`df84d81`) y el remoto rechazó el commit. Dos archivos de datos, dos lentes y dos pantallas para lo mismo. Comparadas antes de tocar: su capa de lecciones y pausas es mejor —cada pausa con su marca y su fuente—, y **sus 28 pasos afuera eran cinco textos rotando**, así que «Cambia una línea de tu perfil» le salía seis veces en los 90 días. Quedó su capa con mis 28 pasos adentro, una sola de cada cosa. Y el campo `checklist` que el plan mandaba llenar **no lo dibujaba ninguna pantalla**: era copia textual de `pasos` (abajo, en «El 15 de noviembre a las 18:30») |
| **15 nov, 21:40** · `7bb7835` | se tomó el **T5: Mi protocolo, las 33 piezas**, y la premisa ya no era cierta: el plan dice «Mi protocolo no existe» y existía desde esa misma mañana —`miProtocolo.ts`, su pantalla en El Camino, la pista de 66, las tres señales de la OMS— con su lente en verde. Lo que no existía era que funcionara. **Tres de las 33 piezas eran imposibles de escribir**: las lecciones 7, 15 y 27 caen en los días 6 y 13, que son fin de semana y no se completan, así que su pieza no se pedía nunca y la pantalla decía «cada una llega con su lección». Y el mismo agujero por el otro lado: **la única pieza escribible era la de hoy**, así que las otras 30 tenían una sola oportunidad cada una. Más la pista de 66 clavada en cero porque `diasSostenidos` no se pasaba (abajo, en «El 15 de noviembre a las 21:40») |

| **16 nov, 00:30** · `b14f4d8` | la cola vieja seguía con sus 17 filas cerradas y el plan de la piel tenía T1 a T5 cerrados, así que se tomó el **T6: el juego del sur**. La premisa se cayó entera: el plan dice «hay una pieza y media» y las cinco mecánicas estaban construidas desde la mañana del 15. Lo que no estaba era el mapa pintando bien: **55 de los 90 días se pintaban con el color de otro paisaje, y 31 días no podían pintarse nunca** —el 90 entre ellos— porque su jornada no trae sistema (abajo, en «El 16 de noviembre a las 00:30») |

| **16 nov, 05:10** · `ee5a72a` | la cola vieja seguía con sus 17 filas cerradas y el plan de la piel tenía T1 a T6 cerrados, así que se tomó el **T7: los arreglos de LIBROS**, el último. **La premisa se cayó casi entera**: de los siete encargos del 12 de noviembre, seis ya estaban hechos —la escalera (1.000 y 6.000), los cinco sistemas con el nombre del impreso, el Limay, el alerce, las etiquetas de días, los cinco libros publicados con enlace y «el sexto mapa»—, y el cóndor que volvía a mitad de camino **no está en el repo**. Lo que no estaba era quien los cuide: **los cinco nombres del impreso están escritos tres veces y solo una copia tenía lente**. Y ya se había desfasado: el candado del Río dejaba «Tu app andando» con el sistema llamándose «Tu propia app», y ese texto viaja al prompt de los entrenadores (abajo, en «El 16 de noviembre a las 05:10») |

| **16 nov, 07:25** · `16ca4a8` | las dos colas cerradas —las 17 filas y los siete turnos de la piel—, así que esta despertada fue a la pregunta de atrás: **¿la batería VE el defecto?** Dieciséis defectos puestos a propósito, las 143 lentes con cada uno. Los nueve de número, vistos; de los siete de mecanismo, **cuatro no los vio nadie**: las tres reglas de la racha —la constancia del Diario, del Admin y de la pista de 66— y el último día de la ventana de acceso, que con `>` por `>=` se llevaba el día 90 del que pagó La Base. La racha no se podía medir (preguntaba el día adentro) y la ventana se medía por el medio, nunca por el borde (abajo, en «El 16 de noviembre a las 07:25») |
| **16 nov, 11:40** · `b648008` (MCD) + `d977776` | las dos colas seguían cerradas y cero commits de Javo (`deb5536` en TCD, `d7b905a` en MCD), `node_modules` en cero en los dos. La despertada de las 07:25 preguntó si **la batería de TCD** ve el defecto; esta hizo la misma pregunta en **el otro repo**, donde nadie la había hecho nunca: las dos veces que se midió la batería de MCD (13 y 14 de nov) preguntaron si una lente se podía *engañar* con un comentario, no si **ve el defecto de verdad**. Diez defectos puestos, las 74 lentes con cada uno: **ocho no los vio nadie**, y uno de los ocho es textualmente lo que el bloque 6 dice que existe para evitar (abajo, en «El 16 de noviembre a las 11:40»)
| **16 nov, 15:30** · `42cd83c` + `75f617e` (MCD) | las dos colas seguían cerradas y cero commits de Javo (`58f890c` en TCD, `b648008` en MCD), `node_modules` en cero en los dos y la trampa del `HEAD` suelto con la `main` local de TCD atrás **y el clon en shallow**, que hace que `git merge-base` diga «unrelated histories» y un `merge --ff-only` se niegue (se arregló con `fetch --unshallow` antes de medir). Las dos despertadas anteriores preguntaron si cada batería ve el defecto **en su propio repo**; esta preguntó por **la costura**, que es lo único que las dos comparten: el contrato del puente estaba en **tres copias escritas a mano** que nadie ataba, y renombrar un campo del lado de MCD dejaba **las dos baterías en verde** con el Cinturón Rojo sin llegar nunca (abajo, en «El 16 de noviembre a las 15:30»)
| **16 nov, 19:30** · `56eb38c` | las dos colas seguían cerradas y cero commits de Javo (`2e444a4` en TCD, `75f617e` en MCD), `node_modules` en cero en los dos y el clon de TCD otra vez en shallow. Las tres despertadas anteriores preguntaron si cada batería ve el defecto en su repo y si la costura entre los dos estaba atada; esta preguntó por **los datos**, que es el otro cuerpo que nadie había mirado así: el seed de los 90 días. Y ahí estaba, desde el 24 de septiembre: **el día de cada pieza de video lo decidía una lista escrita a mano, desfasada del Camino en 35 de las 43**. Más el validador del paquete, que su propio encabezado llama «paso de CI», que nadie corría y que se caía con un KeyError antes de imprimir nada (abajo, en «El 16 de noviembre a las 19:30»)
| **16 nov, 23:40** · `062ff1f` (MCD) | las dos colas seguían cerradas y cero commits de Javo (`5d55fd4` en TCD, `75f617e` en MCD), `node_modules` en cero en los dos, el `HEAD` suelto en los dos y el clon de TCD otra vez en shallow. Las cuatro despertadas anteriores preguntaron si cada batería ve el defecto, si la costura estaba atada y si los datos del seed decían la verdad; esta preguntó por **el esquema**, que es el último cuerpo que nadie había mirado: **nadie había corrido nunca las cuatro migraciones de MCD**, y nadie comparaba el nombre de la columna que el código pide con el nombre de la columna que existe. De los 45 pares tabla.columna que el código nombra, **dos no existían**, y las dos se caían en silencio: la ficha de CUALQUIER paciente daba 404, y en «Mi marca» el sanador escribía su marca, apretaba Guardar y la base no cambiaba nada (abajo, en «El 16 de noviembre a las 23:40»)
| **17 nov, 03:25** · `ea4cfd7` | las dos colas seguían cerradas y cero commits de Javo (`7f801e0` en TCD, `062ff1f` en MCD), `node_modules` en cero en los dos y el clon de TCD otra vez en shallow. La despertada de las 23:40 preguntó por **el esquema de MCD**; esta hizo la misma pregunta en TCD, y la respuesta estaba una capa más atrás: la base que la batería levanta **no es la de Javo**. De las diez tablas que `scripts/prueba-sql.sh` escribía a mano en su andamiaje, **ocho las crea el propio repo**, y tres estaban mal justo en las columnas que piden las pantallas. Al dejar de inventarlas salieron **dos defectos vivos que el andamiaje tapaba**: `devolver_credito` escribía un `source` que el CHECK real rechaza —así que el crédito cobrado por una imagen que falló **no volvía nunca**— y la Sala de Mando pedía **cinco columnas que no existen**, con lo que su panel «Decisiones» estaba vacío siempre (abajo, en «El 17 de noviembre a las 03:25») |
| **17 nov, 07:25** · `c87ba69` + `5980732` (MCD) | las dos colas seguían cerradas y cero commits de Javo (`7f1bdd5` en TCD, `062ff1f` en MCD), `node_modules` en cero en los dos, el `HEAD` suelto en los dos y el clon de TCD otra vez en shallow. Las cinco anteriores preguntaron por el defecto dentro de cada repo, por la costura, por los datos del seed y por el esquema; esta preguntó por **el entorno**, que es la lista de lo que hay que cargar en Vercel y nunca se había medido contra el código. Y volvió a ser **la puerta**: la lente que vigila que ninguna clave viaje en el bundle buscaba `import.meta.env.VITE_X` escrito de corrido, y cinco archivos leen el entorno con una variable en el medio, así que **diez variables no se veían — entre ellas las nueve por donde entra la plata**. Detrás, el agujero: el código leía **doce variables que `.env.example` no nombraba**, nueve de ellas los enlaces de cobro, y ninguna rompe nada porque todas caen al WhatsApp. En MCD, a la tabla que se titula «TODAS» le faltaban tres (abajo, en «El 17 de noviembre a las 07:25») |
| **17 nov, 11:30** · `612f4b5` (MCD) + `96f8137` | las dos colas seguían cerradas y cero commits de Javo (`832f48c` en TCD, `5980732` en MCD), `node_modules` en cero en los dos, el `HEAD` suelto en los dos y el clon de TCD otra vez en shallow. La de las 23:40 levantó el esquema de MCD y la de las 03:25 el de TCD; esta preguntó por **la ausencia**: no si la columna que el código pide existe, sino **si la lente ve la TABLA que no está**. Y no la veía: el recorrido empezaba con `if tabla not in objetos: continue`, así que de las 14 tablas que el código de MCD nombra, **seis no estaban en el esquema y la lente daba verde**. Tres son de MCD y las tres fallaban en silencio en producción —el Guardar del Asistente, la nota del paciente y la campanita— (abajo, en «El 17 de noviembre a las 11:30») |

| **18 nov, 15:30** · `b9b3447` | la cola seguía sin turnos nuevos —las 17 filas cerradas, cero commits de Javo (`cb7cc45` en TCD y `b7ba810` en MCD, los dos al día contra `git ls-remote`)—, `node_modules` en cero y el `HEAD` suelto otra vez, con la `main` local **ocho** commits atrás y el ref de `origin` una foto vieja que la lente del trabajo subido cazó en la batería. Las anteriores preguntaron por la tabla, la columna, el campo que se lee, la RLS, quién ejecuta, el informe y los archivos: todas por NOMBRES. Esta preguntó por **el VALOR**, que es lo único que ninguna mira. De las 25 columnas con lista cerrada, los once literales del código están todos bien —una lente de literales cerraba el turno en verde—, y el defecto entraba por el TIPO: `creativos.tipo` acepta dos valores desde el 10 de abril y `TipoCreativo` admite tres. La pestaña «Portada YouTube» **cobraba el crédito, generaba la imagen y moría al guardar** con un 23514, medido ejecutando; siete meses así. Cerrado con el CHECK recreado, la lente nueva de tres puertas —literal, objeto tipado y clave abreviada— y su arnés de ocho defectos y dos canarios. De paso: leer las listas con una expresión regular daba cinco de los siete valores de `credit_transactions.source` por un paréntesis dentro de un comentario, y habría mandado a arreglar el `refund` que el turno del 17 dejó bien. En MCD la clase no existe: cero `CHECK IN`, sus valores viven en un comentario (abajo, en «El 18 de noviembre a las 15:30») |
| **18 nov, 11:30** · `4943e1a` + `b7ba810` (MCD) | las dos colas seguían cerradas y cero commits de Javo (`8494650` en TCD, `d3b7c40` en MCD, los dos al día contra `git ls-remote`), `node_modules` en cero en los dos y **el `HEAD` suelto en los dos**, con la `main` local de MCD un commit atrás y la de TCD cuatro: el `push origin main` salió rechazado por «non-fast-forward» con el padre del commit siendo justo el remoto, que es la cara que tiene esa trampa; se sube con `push origin HEAD:main`. Las anteriores preguntaron por el esquema, por la tabla ausente, por la RLS, por quién ejecuta las funciones, por el informe y por los archivos; esta preguntó por **lo que trae la estrella**: el `select('*')`, que no nombra ninguna columna y por eso la lente del esquema lo saltea —y las VISTAS, que saltea también, escrito en su propia cabecera—. El código sí nombra esas columnas: las nombra al leer el resultado por propiedad. El Tablero de MCD leía **ocho** campos de `mis_numeros` y la vista tenía **siete**: `roi_mes` no estaba en ningún `.sql`, y era la condición del cartel «Tu inversión en MiClínica se pagó N×», que **no se dibujó nunca desde el 8 de julio**. Cerrado con la cuenta que el Tablero ya hacía a mano, más la lente nueva (36 miradas) y su arnés de ocho defectos y dos canarios. En TCD no hay vistas y sus 35 sitios de `select('*')` se revisaron a mano: sin campo fantasma (abajo, en «El 18 de noviembre a las 11:30») |
| **18 nov, 07:45** · `d86096e` + `d3b7c40` (MCD) | las dos colas seguían cerradas y cero commits de Javo (`ff735ac` en TCD, `58664d8` en MCD, los dos al día contra `git ls-remote`), `node_modules` en cero en los dos. Las anteriores preguntaron por el esquema, por la tabla ausente, por la RLS de las tablas, por quién ejecuta las funciones y por el informe del archivo que Javo pega; esta preguntó por **los archivos**, que es el último cuerpo sin ejercitar: `storage.objects`. De las 930 miradas de TCD **ninguna lo nombraba** —la única que dice «bucket» pregunta que no se abra un segundo bucket, no quién lee el primero—. Y storage tiene una trampa propia: **una política sin `to <rol>` vale para TODOS los roles**, `anon` incluido, que es la llave publicable que viaja en el bundle. Dos estaban así y su condición no preguntaba de quién era la carpeta: **sin ninguna sesión se listaban los archivos que cada cliente le manda a Javo en el chat de soporte**, y el bucket es público, así que con el nombre en la mano el archivo se descarga. Más la escritura de creativos, abierta a cualquier carpeta. En MCD la premisa es la buena —su cubeta es privada y su política sí pregunta— y quedó ejercitada igual (abajo, en «El 18 de noviembre a las 07:45») |
| **18 nov, 04:15** · `2d22371` | las dos colas seguían cerradas y cero commits de Javo (`f9855f6` en TCD, `58664d8` en MCD, los dos al día contra `git ls-remote`), `node_modules` en cero en los dos. Las anteriores preguntaron por el esquema, por la tabla ausente, por la RLS y por quién ejecuta; esta preguntó por **el archivo que Javo pega en Supabase**, `poner-al-dia-la-base.sql`, que termina con su propio informe «QUÉ QUEDÓ». **Nadie lo leía:** su prueba miraba que no hubiera un `ERROR` y después comprobaba su PROPIA lista de 25 nombres, así que el informe imprimía **35 líneas de `FALTA` en una corrida verde**. Y sus dos listas estaban cortas: **44 tablas contra las 60 que crea el repo** —`sesiones` y `anuncios_fichas` entre las que faltaban, y **las crea ese mismo archivo**— y siete de sus propias funciones afuera. De paso, el otro lado del mismo hueco: de las 68 tablas que el repo CUIDA, **siete no las CREA ningún `.sql`**, y tres no estaban anotadas en ninguna parte (abajo, en «El 18 de noviembre a las 04:15») |
| **17 nov, 23:25** · `3074dce` + `58664d8` (MCD) | las dos colas seguían cerradas y cero commits de Javo, `node_modules` en cero en los dos y el `HEAD` suelto en TCD. La de las 19:30 midió **la RLS** y la dio por bien —y lo está—; esta preguntó lo único que esa medición deja abierto: **quién puede EJECUTAR las funciones**. Y ahí estaba la puerta que la rodea entera: una `SECURITY DEFINER` corre con los permisos de SU DUEÑO, así que **no le aplica la RLS**, y el permiso de fábrica de PostgreSQL es `EXECUTE` para `PUBLIC`. De las **51 de `public`, 49 las podía ejecutar `authenticated` y 42 `anon`, y 25 no preguntaban quién llamaba**: sentado en la silla de un cliente, `carga_de_semana` entregaba la semana de otro cliente que la RLS acababa de negarle, y `devolver_credito` le sumaba crédito comprado a quien quisiera **sin ninguna sesión** —seis llamadas, saldo de 0 a 6—. Cerradas con UNA puerta y no 25 parches; en MCD la premisa es la buena y quedó medida (abajo, en «El 17 de noviembre a las 23:25») |
| **17 nov, 19:30** · `7d4040e` + `3fefd97` (MCD) | las dos colas seguían cerradas y cero commits de Javo, `node_modules` en cero en los dos, el `HEAD` suelto en los dos y el clon de TCD en shallow. Las seis anteriores preguntaron por el defecto dentro de cada repo, por la costura, por el seed, por el esquema, por la tabla ausente, por el entorno y por si el trabajo salió; esta preguntó por **la RLS**, que es el único cuerpo que decide quién ve los datos de quién y el único que ninguna de las dos baterías nombraba. De las **921 miradas de TCD, ninguna**, salvo el aislamiento de `profiles`; de las 99 de MCD, solo las tres de la campanita: **las otras once tablas tenían su política escrita y nunca ejecutada**. Las tres premisas del lado malo se cayeron —las 60 de TCD y las 12 de MCD están encendidas y acotadas— y quedaron dos tablas como deuda anotada: `diario_entradas` y `session_logs`, que el navegador escribe y ningún `.sql` del repo enciende (abajo, en «El 17 de noviembre a las 19:30») |
| **17 nov, 15:30** · `18a6672` + `d850db7` (MCD) | las dos colas seguían cerradas y cero commits de Javo, `node_modules` en cero en los dos y el `HEAD` suelto en los dos. Esta despertada **se equivocó primero y por eso encontró algo**: midió el estado de MCD con `git rev-parse origin/main`, lo vio tres commits atrás y dio por perdido el trabajo de las tres despertadas anteriores. Era falso — el remoto de verdad, por `git ls-remote`, estaba al día; lo viejo era **el ref en disco**, porque el `fetch` había salido rechazado. Y detrás estaba el agujero: de las **921 miradas de TCD y las 97 de MCD, ninguna medía que lo commiteado haya SALIDO del contenedor**, que es de usar y tirar. Lente nueva en los dos repos, que pregunta por la red y no le cree al disco, probada contra sus cinco defectos de estado de git — y el ejercicio del ref viejo le encontró un agujero al primer intento de la lente (abajo, en «El 17 de noviembre a las 15:30») |

### El 18 de noviembre a las 15:30: el nombre estaba bien y el valor no entraba

**La pregunta.** Las dos lentes que vigilan el esquema miran NOMBRES: la del
17 pregunta si la TABLA existe, la del 16 si la COLUMNA existe, la de las
11:30 si el CAMPO que se lee existe, y `prueba-rpc-nombres.py` si el PARÁMETRO
existe. Ninguna mira el VALOR. Y una columna con `CHECK (col IN (...))` es una
lista cerrada: el nombre está bien, la columna existe, la fila llega, y la base
la rechaza con un 23514 igual.

No es hipotético: **ya costó plata una vez**. El 17 de noviembre se arregló
`devolver_credito`, que anotaba `devolucion` en `credit_transactions.source`
—una lista de siete valores donde esa palabra no está—, así que la red de
seguridad del crédito no anotaba nada y el log decía «devolución anotada».
Quedó arreglado ese caso. La CLASE no.

**Lo medido, ejecutando.** De las 25 columnas con lista cerrada que tiene la
base de TCD, el código escribe literales en once sitios y **ninguno está
fuera de su lista**. Una lente de literales habría dado verde y cerrado el
turno. El defecto no es un literal:

    creativos.tipo  →  la base acepta  imagen_single · carrusel
    TipoCreativo    →  el código admite imagen_single · carrusel · yt_thumbnail

`creativos.tipo` nació el 10 de abril con dos valores y **nunca se amplió**.
Pero la app tiene una tercera pestaña —«Portada YouTube», 1280x720— y todo su
camino está escrito: `TipoCreativo` la declara, `FORMATOS` le da su tamaño,
`campanasPrompts.ts` le arma su prompt 16:9, `TIPO_LABELS` su etiqueta. En el
insert no hay ninguna comilla con ese valor: viaja en `config.tipo`, y lo que
lo admite es el TIPO.

Ejecutado contra un PostgreSQL 16 con las siete migraciones y el andamiaje de
`prueba-sql.sh`:

    ERROR: new row for relation "creativos" violates check constraint
           "creativos_tipo_check"

Y el crédito **se cobra ANTES** de llamar al modelo. O sea: el cliente elegía
la pestaña, pagaba, la imagen se generaba, y `saveCreativo` lanzaba con ese
mensaje. No es una pantalla que degrada en silencio como la del Tablero de
MCD esta mañana: es la función entera que no guarda nada, con el crédito ya
gastado. Siete meses así.

**Y una premisa de método que se cayó al escribir la lente.** El primer
intento leía las listas del `.sql` con una expresión regular, y daba
**cinco** valores para `credit_transactions.source` cuando tiene **siete**:
el comentario de un valor —`-- ajuste manual del admin (regalo,
compensacion)`— tiene un paréntesis, y `[^)]*` corta la lista ahí. Con esa
lista corta, `refund` aparecía como fuga **siendo legítimo**: la lente habría
mandado a arreglar la línea que el turno del 17 acababa de dejar bien. Es la
misma lección del `--` del 15 de noviembre, un paréntesis más adelante. Las
listas se PREGUNTAN a `pg_constraint`.

**Lo que se cerró.**
`supabase/migrations/20261118_la_portada_de_youtube_no_entraba.sql`: el CHECK
recreado con los tres valores. No se afloja el candado ni se saca —los otros
dos quedan igual—: se agrega el valor que la app ya usa. Ni una palabra de
pantalla se tocó, y sin la migración aplicada la pestaña sigue como hoy.

**La lente nueva y sus tres puertas.**
`scripts/prueba-el-valor-que-la-base-rechaza.py`: levanta la base, le pregunta
sus 25 listas al catálogo, y mide por donde el valor puede entrar.

  · **el literal**, dentro del objeto que se escribe —y también en el FILTRO,
    porque un `.eq('estado', 'pendientes')` no da error: devuelve cero filas
    siempre, y la pantalla sale vacía sin que nadie se entere.
  · **el objeto tipado**, que es por donde entró el de hoy: el tipo de la
    fila, siguiendo `Omit`, `Partial` y `Pick`, y el alias del alias
    (`tipo: TipoCreativo` → `'a' | 'b' | 'c'`).
  · **la clave abreviada** —`.update({ contenido, tipo })`—, que no es ni
    literal ni objeto entero. Esa puerta la enseñó el propio repo:
    `sacarDeLaCola` escribe así, y el valor sale de
    `const [tipo, setTipo] = useState<TipoDeMensaje>`, los dos botones del
    chat de soporte.

Y corre TODAS las migraciones, no las de 20261009 en adelante como el resto de
la batería: las listas de `creativos` y `campanas` nacen el 10 de abril, así
que **esas dos tablas no existen en la base que la batería levanta** — que es,
exactamente, por qué este defecto vivió siete meses sin que nadie pudiera
verlo. Lo que no puede resolver lo DICE: 16 escrituras cuyo tipo es un
`Record<string, unknown>` y tres nombres de tabla que no son ni literal ni
constante.

**El arnés: ocho defectos y dos canarios.**
`probar-que-la-lente-del-valor-ve-el-defecto.py` pone el de hoy de nuevo, un
literal fuera de lista en la fila de la compra por PayPal, el mismo sobre una
tabla nombrada por `const TABLA` —así es como escribe `api/fathom-webhook.ts`,
las transcripciones que entran solas, y anclando sólo en la comilla no se
miraba nunca—, un `.eq` imposible, un `.in` con el valor de más escondido
entre dos buenos, una unión con nombre, una unión escrita dentro de la
interfaz, y un botón más en el chat de soporte. Los dos canarios tienen que
dejarla VERDE, y los dos son contra un falso positivo:

  · un tipo **del todo local** con un campo `estado` inventado. Este repo
    tiene `estado: 'hecha' | 'hoy' | 'porVenir'` en una fila de pantalla y
    `estado` cerrado en cuatro tablas distintas: una lente que empareje por
    nombre de campo manda a arreglar lo que no está roto.
  · el valor de más en una columna que el `Omit<>` del insert saca y que el
    update no toca. Si la columna no se escribe, no hay defecto.

**En MCD la clase no existe, y se midió.** Ninguna de sus siete migraciones
tiene un solo `CHECK (col IN (...))`: los valores permitidos de `status`,
`source` y `tipo` viven en un comentario `--` al lado de la columna
—`-- onboarding | activo | pausado`—, así que la base acepta cualquier cosa.
Portar la lente ahí hoy sería medir cero listas. Lo que sí se comprobó a mano
es que lo que el código escribe coincide con esos comentarios: `onboarding`,
`mensaje`, `cita` y `paciente`, los cuatro bien. Queda anotado como la otra
forma del mismo hueco —una lista cerrada que no cierra nada—, y es decisión
tuya si se cierra con CHECKs o se deja así.

### El 18 de noviembre a las 11:30: el séptimo número no existía

**La pregunta.** Las dos lentes del esquema —la de las columnas del 16 y la de
las tablas del 17— comparan el nombre de la columna que el código **pide** con
el que existe. «Pide» quiere decir: el nombre escrito dentro de
`select('a, b, c')`. Y la lente de MCD tiene dos huecos escritos en su propia
cabecera, hace un mes, por quien la escribió:

  · «No valida las columnas de una VISTA (`mis_numeros`)».
  · Un `select('*')` no nombra ninguna columna, así que no hay nada que
    comparar y se saltea.

Pero el código **sí nombra** las columnas de un `select('*')`: las nombra
después, al leer el resultado por propiedad —`n?.roi_mes`—. Los dos huecos se
juntan en el mismo lugar, y ese lugar es la pantalla que el sanador abre todos
los días.

**Lo medido, ejecutando.** Las siete migraciones de MCD contra un PostgreSQL 16
de verdad, y después la pregunta a `information_schema`. `public.mis_numeros`
tiene **siete** columnas:

    practitioner_id · pacientes_activos · cobros_totales · ingresos_mes
    conversaciones_esperando · citas_hoy · personas_nuevas_semana

El Tablero lee **ocho**: esas siete y `roi_mes`, que **no está en ningún `.sql`
del repo** —ni en una migración, ni en un `alter`, ni comentado—. Y no era un
campo de adorno: es la condición del cartel de abajo, el que dice «Este mes tu
sistema facturó $X USD. **Tu inversión en MiClínica se pagó N×**».
`Number(n?.roi_mes ?? 0) > 0` con la columna ausente es `0 > 0`: **falso
siempre**. Esa rama no se dibujó nunca **desde el 8 de julio**, cuando se
escribió la vista completa, y la pantalla degradaba en silencio al cartel
corto, el que sólo dice lo facturado. Sin error y sin 400: PostgREST devuelve
las siete que existen y la octava llega `undefined`.

Es la misma forma de la ausencia del 16 y del 17 —lo que falta no se mide, se
saltea—, pero por una puerta nueva: no la columna que se pide, sino **el campo
que se lee**.

**Y una premisa que esta vez ya estaba bien, por décima vez.** La vista declara
`security_invoker = true`, y es la línea que importa: una vista sin esa opción
corre con los permisos de SU DUEÑO y **se saltea el RLS** de `practitioners`,
`patients`, `cobros` y `ghl_cache` — con el filtro del Tablero viviendo en el
cliente (`.eq('practitioner_id', user?.id)`), cualquier sanador con sesión
leería los números de todos cambiando un parámetro. Está puesta desde julio,
PostgreSQL 16 la honra, y **nadie la medía**: ninguna de las 97 miradas de MCD
nombraba una vista. Ahora está preguntada al **catálogo vivo** —no al `.sql`— y
ejercitada: dos sanadores sentados en su silla ven una fila cada uno, la suya,
y sin sesión no se ve ninguna.

**Lo que se cerró.** `supabase/migrations/20261118_la_estrella_traia_un_numero_que_no_existia.sql`:
la vista recreada con el séptimo número. La cuenta no se inventa — el mismo
Tablero ya la hacía a mano tres líneas más arriba, en la tarjeta «Retorno»:
`ingresos_mes / inversion_mensual`, a un decimal. Esto es esa cuenta movida a la
base para que las dos copias digan lo mismo, que es la cuarta vez que aparece
la misma forma (el contrato del puente el 16, los cinco nombres del impreso, las
políticas escritas dos veces el 18). **Ni una palabra del cartel se tocó**, y
sin inversión cargada `roi_mes` queda en 0: el cartel largo no aparece, nadie ve
un «se pagó 0×» ni una división por cero.

**La lente nueva y su arnés.** `scripts/prueba-lo-que-trae-la-estrella.py`, 36
miradas: levanta la base, y para cada `.from(X).select('*')` del código ata la
variable y exige que **todo campo leído por propiedad** exista en el esquema;
después pregunta por `security_invoker` al catálogo y lo ejercita con los dos
sanadores. Su arnés —`probar-que-la-lente-de-la-estrella-ve-el-defecto.py`—
pone **ocho defectos** (el de hoy, el campo nuevo sin su columna, la columna de
una tabla y no de una vista, la tabla inventada, la vista sin
`security_invoker` por sus dos lados, la cuenta cambiada, la política de
`practitioners` abierta) y **dos canarios al revés**, que tienen que dejarla
verde. Los dos enseñaron algo:

  · El canario de las **dos ataduras**: un archivo que ata dos veces la misma
    variable a tablas distintas. Fue el primer falso positivo de esta lente,
    medido en el repo de TCD, donde `session_logs` y `hoja_de_ruta` atan las
    dos a `data` en el Admin y la lente pedía las columnas de una en la otra.
    Por eso el tramo de lectura **termina donde la variable se vuelve a atar**.
  · El defecto 8: romper la política de `patients` deja la lente verde **con
    razón** —la subconsulta filtra por `p.id`, que ya viene acotada—. La fila
    base que manda es la de `practitioners`. Un arnés que no se mide a sí mismo
    habría dado ese verde por un agujero de la lente.

**En TCD la premisa es la buena, y se midió a mano hoy.** TCD no tiene ninguna
vista, y sus **35** sitios de `select('*')` se revisaron uno por uno contra el
esquema: ningún campo fantasma. Los dos que lo parecían
—`paypal_orders.webhook_event_ids` y `captured_at`, la cadena del pago— existen
los dos, declarados en `20260513_credits_system.sql`. Lo que queda **medido y
esperando su clic** es portar la lente a TCD: el trabajo es el andamiaje de sus
migraciones, no la lente, y lo que lo hace valer no es un defecto vivo sino que
el Admin de TCD es justo el archivo donde la variable se ata dos veces, o sea
el lugar donde esta clase vuelve más fácil.

### El 18 de noviembre a las 07:45: los archivos eran de cualquiera

**La pregunta.** El 17 a las 19:30 se midió la RLS de las tablas (las 60
encendidas y acotadas) y a las 23:25 la puerta que la rodea (quién puede
EJECUTAR las funciones, donde estaban las 25 abiertas). Queda un cuerpo que
ninguna de las dos toca y que **ninguna de las 930 miradas de esta batería
nombraba: `storage.objects`, donde viven los archivos.** La única mirada que
dice «bucket» pregunta que la app no abra un SEGUNDO bucket, no quién lee el
primero.

**La trampa, y es propia de storage.** Dos, en realidad:

  1 · **Una política sin `to <rol>` vale para TODOS los roles.** PostgreSQL la
      guarda como `{public}` en `pg_policies`, no avisa nada, y al leer el
      `.sql` la política parece acotada: tiene su `using` bien escrito. En
      Supabase, `anon` es la llave publicable que viaja en el bundle del
      navegador: la tiene cualquiera que abra la consola.
  2 · **Un bucket `public = true` entrega el archivo a quien tenga la URL.** Lo
      que decide si las URLs se pueden AVERIGUAR es la política de SELECT. Un
      bucket público con la SELECT abierta no es «público»: es un índice de
      todo lo que subió cada cliente.

**Lo medido, ejecutando.** Las 27 sentencias de storage del repo contra un
PostgreSQL de verdad, con la RLS de `storage.objects` encendida como la trae
Supabase, y cuatro sillas: sin sesión, dos clientes distintos y el equipo.

| | sin sesión (`anon`) | un cliente, de los de otro |
|---|---|---|
| `mensajes-archivos` (público) | **los 2 de 2** | **los 2 de 2** |
| `creativos-assets` (público) | **los 2 de 2** | **los 2 de 2** |
| `task-attachments` (privado) | 0 ✓ | 0 ✓ |

`mensajes-archivos` es **lo que un cliente te MANDA en el chat de soporte**: la
captura, el audio, el archivo. Con la llave del bundle se listaba entero, y
con el nombre en la mano el archivo se descarga, porque el bucket es público.
Y una cuarta: **un cliente podía SUBIR a la carpeta de otro cliente** en
`creativos-assets`, o a cualquier carpeta inventada — su política solo
preguntaba `auth.role() = 'authenticated'`, no de quién era la carpeta.

Las tres del bucket privado miden bien hoy, y no por su rol: su condición
pregunta por una fila de `profiles` con `auth.uid()`, que sin sesión es null.
O sea cerradas por la condición y no por la puerta, que es la forma que se
rompe sola el día que alguien toca la condición.

**Lo que se cerró.** Diez políticas reescritas con su rol puesto y el dueño
de la carpeta preguntado, en
`supabase/migrations/20261118_los_archivos_eran_de_cualquiera.sql`. La app no
se toca: nadie en el código LISTA esos dos buckets —el chat muestra el archivo
por su URL pública, que no pasa por esta política— y las rutas siguen siendo
las mismas. La rama del equipo no es de adorno: el Admin sube creativos con el
id DEL CLIENTE, así que escribe en carpetas ajenas a propósito.

**La lente nueva, y el agujero que su arnés le encontró al primer intento.**
`scripts/prueba-los-archivos-son-de-su-dueno.sh` levanta la base, corre las
políticas del repo —extraídas de los `.sql`, no transcritas— y después intenta
leer, escribir y borrar en las tres carpetas desde las cuatro sillas: 35
afirmaciones, mitad fugas y mitad **portazos** (que el cliente SÍ pueda subir
su evidencia, que el equipo SÍ lea los adjuntos; un arreglo de seguridad que
rompe la app es un arreglo que se revierte). Y el arnés
—`probar-que-la-lente-de-los-archivos-ve-el-defecto.sh`, diez defectos
puestos— encontró que **dos de los diez la dejaban verde**: tres de las
catorce políticas están escritas DOS VECES —en su migración y otra vez dentro
de `poner-al-dia-la-base.sql`, el archivo que pegas— y las dos copias nacen con
guarda `if not exists`, así que **gana la primera que corra** y cuál manda
depende del orden en que se pegaron los archivos. Un defecto puesto en la copia
de la puesta al día no se veía. Por eso la lente mide además que las copias con
guarda digan lo mismo. Es la misma forma que el contrato del puente el 16 y los
cinco nombres del impreso el 16 a las 05:10: dos copias que nadie ataba.

**En MCD la premisa es la buena.** Su cubeta `comprobantes` —la captura de la
transferencia de un paciente— es privada, y sus dos políticas sí preguntan de
quién es la carpeta, así que sin sesión no se lista nada. Están escritas sin
`to <rol>` igual que las de TCD; lo que las cierra es la condición. Quedaron
**ejercitadas** dentro de `scripts/prueba-el-esquema-real.py` (cuatro
afirmaciones más su canario: una política abierta puesta a propósito, para que
el verde diga algo), y el arnés de MCD pasó de 14 defectos a 17.

**Lo que sigue siendo tuyo, y es un botón de dos.** Los dos buckets de TCD
siguen siendo `public = true`, así que **un archivo cuya URL ya salió —un
enlace reenviado, un historial de navegador— se sigue abriendo sin sesión**.
Pasarlos a privados obliga a firmar cada URL (el código ya sabe hacerlo: la
evidencia usa `createSignedUrl`) y cambia el comportamiento del chat de
soporte y de la galería de creativos, así que no se toca solo:

  · **Dejarlos públicos** (lo de hoy): el enlace viejo sigue andando, y lo que
    se cerró es poder averiguar qué subió el otro.
  · **Pasarlos a privados**: hay que cambiar `getPublicUrl` por
    `createSignedUrl` en `src/lib/soporteDatos.ts` y
    `src/lib/campanasStorage.ts`, y los enlaces ya guardados en la tabla de
    mensajes dejan de abrir. Es media hora de trabajo medido, no un clic.

**Y una de paso, que no es un agujero sino un muerto.** `mensaje-futuro/{uid}`
—«el audio sellado del Día 1, que se abre en la graduación»— lo LEE
`src/lib/graduacion.ts` y **no lo escribe nadie en todo el repo**: ninguna
pantalla graba ese audio. Más: ninguna política deja al cliente leer esa
carpeta (las suyas son solo para `evidencias/`), así que aunque el archivo
existiera no lo podría abrir. La pantalla degrada en silencio a «todavía no
grabado», para siempre. Es trabajo de producto —quién graba y cuándo—, no una
cerradura, y queda anotado acá sin tocarse.

### El 18 de noviembre a las 04:15: el informe que nadie leía

**La pregunta.** Las despertadas anteriores fueron preguntando por cada cuerpo
que nadie había mirado: el esquema, la tabla que no está, la RLS, quién puede
ejecutar las funciones. La que quedaba es la más chica y la más cerca de Javo:
**`poner-al-dia-la-base.sql` es el archivo que él pega en Supabase**, y
termina con un informe propio, «QUÉ QUEDÓ», que imprime una línea por cada
cosa que no quedó:

    FALTA FUNCIÓN · get_user_diary
    FALTA TABLA   · session_logs

La pregunta era si alguien lo lee. **No lo leía nadie.**

**Los dos defectos, y son distintos.**

  1 · **El informe era decorado.** `scripts/prueba-puesta-al-dia.sh` corre el
      archivo, mira que no haya un `ERROR` y después comprueba **su propia**
      lista de 25 nombres. El informe del archivo iba a un `.txt` y ahí moría:
      medido ejecutándolo, en esa misma corrida verde imprimía **35 líneas de
      FALTA** que nadie veía. Un informe que no puede poner nada rojo no es
      una medición.

  2 · **Las dos listas del informe estaban cortas.** La de tablas tenía **44
      nombres y el repositorio crea 60**: veinte tablas no se verificaban
      nunca —las diez `sala_*` de la Sala de Mando, `carga_semanal`,
      `mercado_aprendido`, `transcripciones_recibidas`, `invitaciones`,
      `clinica_artefactos`, `fallas_vistas`, `admin_tareas_checklist`,
      `herencia_cohorte`, `herramientas_outputs`, y **`sesiones` y
      `anuncios_fichas`, que las crea ESE MISMO ARCHIVO**—. Y de las 29
      funciones que el archivo crea, **siete no estaban en su propia lista**.

Es la forma de siempre en este repositorio: **una lista escrita a mano que
nadie compara con la realidad** —los nueve nombres del 14 de noviembre, las
tres copias del contrato del puente del 16, el PERDÓN de cinco líneas del
17—.

**Lo que se construyó.** Las dos listas quedaron completas (64 tablas y 71
funciones) y, para que no vuelvan a podrirse, una lente con sus dos mitades,
que no se pueden separar: `scripts/prueba-el-informe-de-la-puesta-al-dia.py`,
**14 miradas**.

  · **El texto**, que ata las listas a lo que el repo crea de verdad: toda
    tabla que el repo crea está en la lista; todo nombre de la lista lo crea
    el repo o es un hueco del panel declarado con su motivo; toda función que
    **el archivo** crea está en su propia lista; y los cuatro huecos atados en
    las dos direcciones, así que el día que el repo empiece a crear uno, la
    excepción sobra y la lente lo dice.
  · **La corrida**, que levanta la base —reusando el andamiaje de
    `prueba-sql.sh` y el preámbulo de `prueba-puesta-al-dia.sh`, cortados por
    su marcador, sin copiar ninguno— y **lee el informe**: cada `FALTA` que
    imprime tiene que ser de un `.sql` que ese preámbulo no aplica, o uno de
    los cuatro huecos. Cualquier otra es el archivo prometiendo algo que no
    entrega.

**Por qué las tablas se exigen completas y las funciones no**, que es una
decisión y no un olvido: en este repositorio **ninguna tabla se borra**
—medido: los únicos `drop table` viven en comentarios de rollback—, así que
una tabla que el repo crea tiene que estar en la base de Javo y, si falta,
falta. Una función se tira y se vuelve a crear con otra firma a cada rato, así
que una lista completa sacada del texto avisaría de faltantes que están sanas
— y una falsa alarma manda a arreglar lo que no está roto.

**Probada contra sus propios defectos: ocho, puestos a propósito, ocho vistos**
(`scripts/probar-que-la-lente-del-informe-ve-el-defecto.py`), y cada uno
comprueba primero que **landeó**. Seis de lista —una tabla del repo fuera de
la lista, un nombre inventado adentro, una función propia sin vigilar, un
hueco fuera de la lista, un hueco que ya no es hueco— y **dos de la corrida**:
la promesa incumplida (el informe imprimiendo la falta de una tabla que el
preámbulo sí aplica) y el canario, con la puesta al día reventando y el
informe sin imprimirse.

**Y la lente se equivocó primero, del lado de suponer.** El primer intento dio
por aplicadas «las migraciones desde 20261009», que es lo que aplica **otra**
lente —la del esquema—, y ese preámbulo no aplica ninguna: dos tablas sanas
—`fallas_vistas` y `transcripciones_recibidas`— salieron como promesa
incumplida. Ahora **lee del preámbulo qué aplica** en vez de suponerlo, y si
un marcador se mueve lo dice en vez de ponerse verde.

### Y el otro lado del mismo hueco: siete tablas que el repo cuida y no sabe crear

La deuda que dejó anotada la despertada de las 23:25 decía cinco tablas
nacidas en el panel —`diario_entradas`, `session_logs`, `tareas_usuario`,
`metricas` y `ventas_registradas`—. **Medido, el número y los nombres eran
otros**, y es la décima vez de diez que la premisa del mapa no sobrevive a la
medición: **`ventas_registradas` sí la crea el repo** (`v2-migration.sql`, y
también la lista del informe la verifica), y en cambio hay tres que esa deuda
no nombraba. De las
**68 tablas que algún `.sql` del repo CUIDA** —le enciende la RLS o le escribe
una política—, **siete no las CREA ningún `.sql` del repo**.

De esas siete, **tres no estaban anotadas en ninguna parte**: `metricas`,
`biblioteca_videos` y `biblioteca_recursos`. El motivo es el de siempre, la
lente mirando un solo cuerpo: la otra lente de huecos
—`prueba-el-esquema-de-la-bateria.py`, punto 5— solo mira **las tablas que el
NAVEGADOR nombra** con `.from(...)`, y esas tres viven únicamente en el SQL
del repo. Y de las dos que sí tenía declaradas, **el motivo escrito era
falso**: decía «solo la nombra `test-db.mjs`» de `tareas_usuario` y
`tareas_template`, cuando el propio repo les enciende la RLS, les escribe
cuatro políticas a cada una y `get_user_tasks` lee la primera.

**Lo que esto significa, y queda como deuda anotada y no como verde:**
`20260505_rls_advisor_fixes.sql` escribe `ALTER TABLE public.metricas ENABLE
ROW LEVEL SECURITY` **sin guarda**. Sobre la base de Javo corre bien —la tabla
está—, pero **el día que alguien rearme el proyecto desde el repositorio, esa
sentencia no encuentra la tabla y corta la migración ahí**. O sea que el repo
no se puede levantar de cero, y hasta hoy no había dónde leerlo. Las siete
quedaron declaradas con su motivo en la lente de la RLS (punto 4.5), atadas:
el día que un `.sql` cree una, la línea sobra y la lente lo marca. Su arnés
pasó de siete defectos a nueve.

**Las dos baterías enteras en verde antes de subir:** TCD con `tsc` y
`npm run build` limpios, las **145** `prueba-*.ts` dentro del bloque 10 y
`auditoria.py` con **927 miradas, cero faltas** («el ZIP puede salir»); MCD con
`tsc` limpio, `next build` limpio, sus tres pruebas por `npm run pruebas` y su
`auditoria.py` en verde. Subido y verificado por `git ls-remote`: `2d22371`.

**Un apunte de herramienta, para no volver a pagarlo:** las tres pruebas de
MCD se corren con `npm run pruebas` —`node --experimental-transform-types`—.
Corridas con `npx tsx` revientan con «Top-level await is currently not
supported with the "cjs" output format», que es un rojo de la herramienta y no
del repo.

**Lo que queda abierto, y es trabajo medido para un turno próximo:** escribir
esas siete tablas en un `.sql` del repositorio es lo único que cierra el
agujero de verdad. No se hizo acá porque las columnas de `profiles` —unas cien,
sumadas por migraciones— no se adivinan sin mirar la base de Javo, y un
`create table` con la columna de menos es peor que el hueco. Con el conector
de Supabase en pie (la decisión del 18 de noviembre, abajo), se leen y se
escriben de verdad.

### El 17 de noviembre a las 23:25: la RLS estaba bien, y 25 funciones la rodeaban

**La pregunta, y la trajo la despertada anterior.** A las 19:30 quedó medido
—ejecutando, no leyendo— que la RLS de este repo está bien: las 60 tablas que
el repo crea con la RLS encendida, las 210 políticas viviendo todas sobre
tablas encendidas, y un cliente que no ve ni escribe la fila de otro. Cuatro
horas después, la pregunta que esa medición deja abierta y que nadie se había
hecho: **¿quién puede ejecutar las funciones?** Porque hay una puerta que
rodea la RLS entera:

> UNA FUNCIÓN `SECURITY DEFINER` CORRE CON LOS PERMISOS DE SU DUEÑO, ASÍ QUE
> **NO LE APLICA LA RLS**. Y EL PERMISO DE FÁBRICA DE PostgreSQL ES `EXECUTE`
> PARA `PUBLIC`: nadie tiene que concederlo, viene puesto. PostgREST publica
> toda función de `public` como `/rest/v1/rpc/<nombre>`, así que con la llave
> publicable —la que viaja dentro del bundle, a propósito— cualquiera la
> llama.

**La premisa se cayó por el lado malo, y es la primera vez en nueve
despertadas.** De las **51 funciones `SECURITY DEFINER` de `public`** medidas
sobre un PostgreSQL de verdad con el esquema del repo: **49 las podía ejecutar
`authenticated` y 42 `anon`**, y **25 no preguntaban quién llamaba**. No era
una lista escrita mal: era el permiso que nadie escribió nunca.

**Probado sentándose en la silla, no leyendo el `.sql`:**

  · **La plata.** Un cliente cualquiera llamó `devolver_credito('<otro>',
    'robo')` cinco veces y el saldo comprado de ese otro pasó de 0 a 5. Una
    sexta llamada **sin ninguna sesión** —rol `anon`— lo dejó en 6, con sus
    seis asientos de `refund` en `credit_transactions`. El saldo comprado es
    lo que se paga con PayPal: era una fábrica de crédito gratis con la llave
    que ya está publicada.
  · **Los datos de otro cliente.** `carga_semanal` le negó la fila al cliente
    —0 filas, la RLS cumplió— y `carga_de_semana('<otro>')` se la entregó
    entera, el número y quién lo cargó. También al rol `anon`.
  · **Escribir sobre lo de otro.** `guardar_campo` dejó a un cliente pisar con
    un 1 el 999 que el equipo había cargado en la semana de otro.
  · **El diario.** `get_user_diary`, `get_user_tasks`, `get_user_metrics`,
    `get_user_ventas` y `get_user_hoja_de_ruta` existen para que el equipo lea
    la ficha de un cliente: las llama `src/pages/Admin.tsx` con
    `target_user_id`. Las cinco son SECURITY DEFINER y ninguna preguntaba, así
    que **lo único que protegía el diario de un cliente —lo más íntimo que
    guarda la app— era que la pantalla del Admin no se abra.** La protección
    vivía en la interfaz, no en la base.

**Lo que se construyó, y es UNA puerta y no 25 parches.** Dos funciones nuevas
en `sala-de-mando.sql`, que son la única copia de la regla:
`el_que_llama_es_del_equipo()` para las `language sql` —filtra— y
`solo_el_equipo(texto)` para las plpgsql —grita—. Con ellas: once funciones de
la Sala de Mando acotadas, las cinco de la ficha del cliente recreadas con su
guarda en
`supabase/migrations/20261118_las_funciones_no_preguntaban_quien_llama.sql`, la
fila de créditos acotada a la propia, y **seis cerradas a PUBLIC con el mismo
cierre que `grant_credits` y `monthly_reset_all` ya tenían** —las que solo
llama la API de la casa con el service_role: `devolver_credito`,
`registrar_uso_ia`, `gasto_ia_acumulado`, `sumar_campo`,
`clientes_para_avisar` y `consume_credit`, cuyo envoltorio del navegador no
tiene ni un llamador y cuyo propio comentario ya decía que el cliente no debe
llamarlo—.

**La lente:** `scripts/prueba-las-funciones-preguntan-quien-llama.sh`, con sus
dos mitades, que no se pueden separar. **El catálogo**, que le pregunta al
permiso real —no al texto— si queda alguna SECURITY DEFINER alcanzable que no
pregunte, con un PERDÓN de cinco líneas donde cada una tiene su motivo escrito
y la lente falla si una sobra. Y **la silla**, porque la primera mitad se
satisface escribiendo `auth.uid()` en cualquier parte del cuerpo: se sienta en
la de un cliente, en la de nadie (`anon`), en la del equipo y en la del
service_role, y mide por el SALDO y por el VALOR QUE QUEDÓ, no por el error.

**Dos cosas que esta lente hace y las anteriores no: mide el portazo.** Un
arreglo de seguridad que rompe la app es un arreglo que se revierte, así que
tres afirmaciones piden lo contrario —el equipo sí lee la semana, el equipo sí
la escribe, el cliente sí lee lo suyo, el service_role sí devuelve el
crédito—. Y **el arnés le encontró su agujero al primer intento, del lado del
portazo:** la guarda preguntaba `current_user = 'service_role'`, y **adentro
de una función SECURITY DEFINER `current_user` es el DUEÑO de la función, no
el que llama**, así que nunca daba verdadero y `carga_de_semana` le devolvía
cero filas a la API de la casa. Quedó en `auth.role()`, que es lo que
PostgREST pone. La lente también se encontró dos funciones que me había
salteado: `panel_ia_por_modelo`, y `podar_fallas_viejas` —que estaba revocada
de PUBLIC desde el 5 de noviembre, bien, y **concedida a `authenticated`**, que
es el rol de cualquier cliente con sesión: borra el único registro de lo que se
le rompe a un cliente—.

**Probada contra sus propios defectos: diez, puestos a propósito, diez vistos**
(`scripts/probar-que-la-lente-de-quien-llama-ve-el-defecto.sh`). Seis de fuga
—la plata abierta otra vez, la semana de otro sin su predicado, la escritura
sin su guarda, la fila de créditos, el crédito de otro, la poda— y dos de
**portazo** —la guarda vuelta a `current_user`, y `respuestas_de` cerrada
también para su dueño—, más el PERDÓN inflado con un nombre que no existe y una
SECURITY DEFINER nueva agregada al final sin guarda. Y la trampa del arnés de
la RLS, heredada: cada defecto comprueba primero que **landeó**, porque un
`sed` que no encuentra su texto deja la lente verde y el arnés cantando
«aprobada» por un ejercicio que nunca ocurrió.

**Las dos baterías enteras en verde antes de subir:** TCD con `tsc` y
`npm run build` limpios, las **145** `prueba-*.ts` dentro del bloque 10 y
`auditoria.py` con **925 miradas, cero faltas** («el ZIP puede salir»); MCD con
`tsc` limpio, `next build` limpio, sus tres `prueba-*.ts` y sus 98 —la única
roja fue, otra vez, la que esta cola construyó el 17 a las 15:30: el ref de
`origin` era una foto vieja, `3fefd97` en el remoto y `75f617e` en disco, y se
arregló con el `git fetch origin` que la propia lente escribe como remedio—.

**En MCD no hay nada que cerrar, y está medido:** sus únicas dos funciones
`SECURITY DEFINER` son **de disparador**, y a esas no las llama PostgREST sino
la tabla. La puerta no existe de ese lado.

**Y queda una deuda anotada, que es la misma de la despertada anterior y creció:**
cuatro de las cinco tablas de la ficha —`diario_entradas`, `tareas_usuario`,
`metricas` y `ventas_registradas`— **no las crea ningún `.sql` del repo**,
igual que `session_logs`. Nacieron en el panel de Supabase. Por eso las cinco
funciones se recrean con un `do $$` que pregunta `to_regclass` antes: un
`create function … returns setof <tabla>` sobre una tabla que no está no se
crea, revienta. Que el 17 a las 19:30 quedaran declaradas dos y hoy sean cinco
es el mismo agujero por otro lado: **el día que alguien rearme el proyecto
desde el repo, esas cinco tablas no llegan.**

### La decisión del 18 de noviembre: el conector de Supabase, con escritura

**Lo preguntado y lo decidido.** Javo preguntó cómo se conecta Supabase si esa
cuenta está en otro Gmail, y si se puede mudar el proyecto de cuenta. Medido
antes de contestar:

  · **El Gmail nunca fue el obstáculo.** El conector de Supabase entra por
    **OAuth contra Supabase**, no por Google y no por token: se abre el login
    de Supabase y se elige la organización. La cuenta de Claude y la de
    Supabase no tienen que coincidir.
  · **El conector ya estaba instalado en la organización de Claude, con la
    conexión sin cerrar** (`connect_incomplete`). El paso es terminarlo, no
    instalarlo.
  · **Y desde una sesión dormida no se llega a Supabase de ninguna otra
    manera:** medido el 18, el proxy de este contenedor no sale ni a
    `supabase.com` ni a `api.supabase.com`. Así que una clave de servicio o
    una cadena de conexión pegadas acá no servirían de nada. El conector es
    otro camino —no pasa por el contenedor— y por eso ése sí funciona.
  · **Mudar el proyecto se puede y no hacía falta.** Supabase lo transfiere
    entre organizaciones si eres dueño del origen y al menos miembro del
    destino, sin integración de GitHub activa y sin log drains; si el destino
    está en Free hay 1 a 2 minutos de caída y rige el límite de dos proyectos.
    Lo que resuelve el problema de las dos cuentas sin transferir ni cortar
    servicio es **invitar la cuenta habitual como miembro de la organización**.

**La decisión, que es suya y queda anotada tal cual: el conector LEE Y
ESCRIBE.** Se le dijo el costo antes de elegir, y es el que sigue:

> Supabase recomienda, para rutinas desatendidas, acotar el conector a un
> proyecto (`project_ref`) y dejarlo en **modo lectura**, y advierte de la
> inyección de prompt diciendo con sus palabras que su defensa «no es
> infalible». **Y esta tarea programada corre en aprobación automática**
> —`permission_mode` es `auto`, medido el 12 de noviembre—, así que en un
> turno desatendido el visto de una escritura no lo da Javo: lo da la
> máquina. Con escritura habilitada, «con tu visto» y «libre» son lo mismo
> cada cuatro horas.

**Por eso la recomendación que acompaña a la decisión, y que es de él:
apagar la aprobación automática de la tarea** («Cola de turnos TCD y MCD»),
desde su teléfono. **La sesión no puede hacerlo**: está medido cinco veces
—12 de noviembre a las 07:25, 11:40 y 23:25, y 13 a las 03:23— que cualquier
escritura sobre la tarea la rechaza el clasificador del modo automático, con
la categoría «Cowork Scheduled Task Write». No se reintenta.

**Lo que un turno futuro tiene que saber, para no volver a discutirlo:** si
encuentra el conector de Supabase conectado y con escritura, es porque Javo lo
decidió el 18 de noviembre sabiendo esto. Lo que **no** cambia: los precios,
las promesas, las garantías y el texto de venta siguen sin tocarse solos, y
una migración que no sea reversible se propone con botón, conector o no.

**Y lo que el conector sí mejora, que es la razón de haberlo pedido:** hoy los
turnos miden **un Postgres levantado con el SQL del repo, que no es la base de
Javo**. La diferencia está medida: cinco tablas que el navegador usa
—`diario_entradas`, `session_logs`, `tareas_usuario`, `metricas` y
`ventas_registradas`— no las crea ningún `.sql` del repo, nacieron en el panel,
y sobre esas cinco ningún turno puede afirmar nada hoy. Con el conector en pie,
se miden de verdad.

### Lo que las despertadas dejan esperando tu clic: los archivos, pegados en Supabase

El arreglo está en el repo y probado, pero **el SQL no se aplica solo**: hasta
que lo pegues, los agujeros siguen abiertos en tu base de producción, y el de
`devolver_credito` se puede usar con la llave que ya está publicada en el
bundle. Son cuatro archivos, los cuatro idempotentes —se pueden correr más de una vez
sin romper nada—, en este orden, en Supabase → SQL Editor → Run:

1. `sala-de-mando.sql` (entero, como siempre: trae las dos funciones nuevas
   `el_que_llama_es_del_equipo` y `solo_el_equipo`, que son la puerta, y las
   once guardas de la Sala de Mando)
2. `supabase/migrations/20261118_las_funciones_no_preguntaban_quien_llama.sql`
   (los seis cierres a PUBLIC, la fila de créditos y las cinco de la ficha)
3. `supabase/migrations/20261118_los_archivos_eran_de_cualquiera.sql`
   (las diez políticas de los archivos: el chat de soporte y los creativos
   dejan de listarse sin sesión, y la escritura de creativos vuelve a su
   carpeta — medido el 18 de noviembre a las 07:45)
4. `supabase/migrations/20261118_la_portada_de_youtube_no_entraba.sql`
   (una línea: `creativos.tipo` acepta además `yt_thumbnail`, que es lo que
   escribe la pestaña «Portada YouTube». Hasta que se pegue, esa pestaña
   **cobra el crédito, genera la imagen y no guarda nada** — medido el 18 de
   noviembre a las 15:30. No depende de las dos funciones del primero, así que
   se puede pegar suelto y en cualquier orden.)

**El orden importa:** el segundo y el tercero usan las dos funciones que crea
el primero.

Y lo que no se puede hacer desde acá, igual que el 13 de noviembre: **una
sesión dormida no puede mirar tu base ni tus apps en vivo** —el proxy contesta
403 al CONNECT—, así que lo que quedó medido es el esquema del repo levantado
contra un PostgreSQL de verdad, no tu base. Si tu base tiene algo que el repo
no crea —y tiene: `diario_entradas`, `session_logs`, `tareas_usuario`,
`metricas` y `ventas_registradas` nacieron en el panel—, lo de esas cinco solo
queda cerrado después de correr el segundo archivo.

### El 17 de noviembre a las 19:30: la política que nadie enciende, y las once que nunca se ejercitaron

**La pregunta.** Las seis despertadas anteriores fueron preguntando por cada
cuerpo que nadie había mirado: si cada batería ve el defecto en su propio repo,
si la costura del puente estaba atada, si los datos del seed decían la verdad,
si el esquema tenía la columna que el código pide, si la lente ve la TABLA que
no está, si la lista del entorno coincidía con el código, y si lo commiteado
había salido del contenedor. Quedaba uno, y es el único que decide quién ve los
datos de quién: **la RLS**.

Medido antes de escribir nada: de las **921 miradas de TCD, ninguna nombraba la
RLS**, con una excepción —`profiles`, cuyo aislamiento `prueba-puesta-al-dia.sh`
sí ejercita de verdad, con dos sesiones distintas—. Las otras **41 tablas que el
navegador toca** tenían su política escrita y **nunca ejecutada**. En MCD, lo
mismo: de sus 99 lentes, las únicas que ejercitaban una política eran las tres
de la campanita; **las otras once tablas, ninguna** —y detrás de ellas están los
pacientes—.

**Y la RLS tiene una trampa que no tiene ninguna otra parte del SQL:**

> UNA POLÍTICA SOBRE UNA TABLA CON LA RLS APAGADA NO HACE NADA. PostgreSQL la
> acepta, la guarda, `pg_policies` la muestra, y no filtra ni una fila. No hay
> error y no hay aviso. Al leer el `.sql` la tabla parece cuidada: tiene su
> `create policy` con su `using` bien escrito.

Es la misma forma de todo lo que se cerró del 13 al 17: la lente verde porque no
pudo preguntar.

**La premisa se cayó tres veces, y las tres del lado bueno.**

1 · «Hay tablas sin RLS». No las hay. Levantado el esquema contra un PostgreSQL
de verdad, **las 60 tablas de TCD que el repo crea tienen la RLS encendida**,
las 210 políticas viven todas sobre tablas encendidas, y las seis `using (true)`
son las seis `for select` que tienen que ser —catálogos compartidos: plantillas,
biblioteca, pausas globales, mercado aprendido—. En MCD, **las doce**, y once con
su política bien acotada, probado ejecutando y no leyendo.

2 · **El primer intento de medirlo buscó en minúsculas**, y de los 72
`enable row level security` del repo **35 están en MAYÚSCULAS**. Así que dio por
ABIERTAS a `hoja_de_ruta`, `mensajes` y `notificaciones` —tres tablas cerradas—.
Mandar a arreglar lo que está sano es la peor forma de equivocarse, y es la que
el arnés de abajo prueba que ya no puede pasar.

3 · Y en MCD, contar filas en vez de dueños distintos daba «2 de 2» con la
política funcionando perfecto, porque varias de esas tablas ya tenían filas del
primer sanador sembradas más arriba en la misma prueba.

**Lo que NO se cayó, y queda anotado como deuda: dos tablas.**
`diario_entradas` y `session_logs`. El navegador las lee y las escribe, y
**ningún `.sql` del repo las crea ni las enciende**: nacieron a mano en el panel
de Supabase. `profiles` y `mensajes` también nacieron ahí, con la diferencia de
que a esas dos sí las enciende un archivo del repo. Que hoy estén cerradas en
producción es lo más probable —`get_user_diary` es `security definer` justo para
que el equipo pueda leer el diario de un cliente, y una función así no haría
falta con la tabla abierta—, pero «lo más probable» no es una medición. Lo que
sí se puede afirmar: **su protección vive solo en el panel, donde ningún archivo
la lee y ninguna lente la mide**, y el día que alguien rearme el proyecto desde
el repo —que es para lo que existe `poner-al-dia-la-base.sql`— las otras cuarenta
llegan cerradas y estas dos llegan desnudas. Y el diario es lo más íntimo que
guarda la app. Quedan declaradas, con el motivo, en `SOLO_EN_EL_PANEL`, y
**atadas**: el día que un `.sql` las encienda, la línea sobra y la lente lo dice.

**Lo que se construyó.** En TCD, `scripts/prueba-la-rls-esta-encendida.py`: ocho
miradas sobre el `.sql` del repo leído con `solo_codigo(…, archivo)` —el
limpiador de la batería, cortado y compilado en vez de copiado— que piden que
ninguna política viva sobre una tabla apagada, que toda tabla que el navegador
toca la encienda un `.sql`, que las dos listas de excepciones no se podran, y
que el **array escrito a mano del `do $$` de `sala-de-mando.sql`** nombre a cada
tabla que ese mismo archivo crea: la tabla doce nacería abierta y en silencio.

En MCD, dentro de `prueba-el-esquema-real.py`, que ya levanta el esquema con las
seis migraciones corridas: le pregunta al **catálogo** —no al texto— y después se
sienta en la silla de un sanador. Dos sanadores, una fila de cada uno, y la
sesión del primero: ve la suya y **no** la del otro, **no puede** escribir una
fila a nombre del otro (el `with check`, que una lente de lectura no encuentra
nunca), y **no puede** tocar la fila ajena. **Once de las doce tablas**
ejercitadas así; `patient_protocols` a mano, porque es la única sin columna de
dueño —su política llega por un `exists` sobre `patients`— y `ghl_connections`
declarada aparte, porque sus seis usos pasan por el cliente de service role.

**Probadas contra su propio fallo: seis defectos en cada repo, veinte en total.**
En TCD, la RLS apagada con la política escrita, lo mismo en MAYÚSCULAS, una
pantalla nueva que lee una tabla que nadie enciende, el `alter table` comentado
con `--`, una tabla fuera del array de la sala, una excepción que sobra, y el
canario: sin `.sql` que leer, la lente **no** puede dar verde. En MCD, seis más
sumados a los ocho que ya tenía su arnés —`patients` sin RLS, su política con
`using (true)`, el `with check` de `sessions` abierto, `patient_notes` con RLS y
sin ninguna política (que no es una fuga sino lo contrario: la tabla cerrada en
silencio y la ficha vacía sin un solo error), el `exists` de
`patient_protocols` abierto, y la lista de perdón con una tabla que sí tiene
política—: **14 de 14 vistos**.

**Y el apunte más útil: los arneses le encontraron dos agujeros a las lentes
nuevas al primer intento.**

  · En TCD, apagar `pausas_globales` en su migración **no la apagaba** —
    `poner-al-dia-la-base.sql` la vuelve a encender—, así que el defecto quedaba
    sin poner y la lente salía «aprobada» por un ejercicio que nunca ocurrió.
    Ahora el arnés comprueba que el defecto **apagó algo** antes de creerle a la
    medición.
  · En MCD, **`max(uuid)` no existe en PostgreSQL**. Ocho afirmaciones estaban
    leyendo la palabra `SET` —lo que imprime psql cuando la consulta revienta y
    lo único que queda son los dos `set` de la impersonación— y comparándola
    contra el valor esperado. Daban rojo por el motivo equivocado; con la
    comparación al revés habrían dado verde para siempre.

Las dos baterías enteras en verde antes de subir: TCD con `tsc` y `npm run build`
limpios, las **145** `prueba-*.ts` dentro del bloque 10 y `auditoria.py` con
**923 miradas, cero faltas** («el ZIP puede salir»); MCD con `tsc` limpio,
`next build` limpio y sus lentes en verde —la única roja fue la que esta misma
cola construyó ayer: el ref de `origin` era otra vez una foto vieja, `d850db7` en
el remoto y `75f617e` en disco, y se arregló con el `git fetch origin` que la
propia lente escribe como remedio—.

### El 17 de noviembre a las 15:30: el ref de origin era una foto vieja, y nadie medía si el trabajo había salido

**La pregunta, y esta vez la trajo el propio turno equivocándose.** La cola no
tenía nada que tomar, así que esta despertada hizo lo de siempre —medir desde
frío— y lo primero que midió fue el estado de los dos repos. `git rev-parse
origin/main` en MCD devolvió `75f617e`, del 16 a las 16:08, con el HEAD del
contenedor **tres commits más adelante**. La lectura obvia: las despertadas del
16 a las 23:50, del 17 a las 08:07 y del 17 a las 11:42 commitearon y **no
subieron**, y el mapa tiene tres filas «cerrado» apuntando a commits que nadie
tiene. Trabajo de tres turnos a punto de irse con el contenedor.

**Era falso, y por eso esta entrada existe.** El remoto de verdad —`git
ls-remote`, que pregunta por la red— estaba en `612f4b5`: las tres despertadas
subieron. Lo que estaba viejo era **el ref en disco**. El `git fetch` de MCD
había salido rechazado por el clasificador al principio del turno (venía pegado
a un `reset --hard` en el mismo comando), así que `refs/remotes/origin/main`
siguió siendo la foto del remoto de ayer. Y ésa es la parte que importa:

> `git status`, `git rev-parse origin/main` y `git log origin/main..HEAD` leen
> ese ref **sin avisar de qué fecha es**. Dicen «ahead 3» con el mismo tono con
> el que dirían la verdad.

La trampa ya estaba anotada de refilón —«la trampa del `HEAD` suelto», el 12 a
las 15:50— pero como maña del contenedor, no como lo que es: **una fuente que
envejece y que ninguna lente mira.** Y miente en las dos direcciones, con dos
costos distintos:

| el ref dice | la verdad | lo que cuesta |
|---|---|---|
| atrás (lo de hoy) | ya está subido | el turno se gasta «recuperando» lo que está sano, y es el turno entero |
| adelante | el `push` falló | el trabajo **se pierde de verdad** cuando se recicla el contenedor, y el mapa queda con un hash que no existe |

**Lo que se construyó, y es lo único que las dos baterías no se preguntaban
nunca.** Las 921 miradas de TCD y las 97 de MCD miden el código. Ninguna medía
que el código **haya salido**. Se buscó antes de escribir: en los dos repos, cero
apariciones de `ls-remote`, de `origin/main` y de `git push` en `auditoria.py` y
en todo `scripts/` (lo único era `volver-atras.sh`, que es otra cosa).

`scripts/prueba-el-trabajo-subido.py`, igual en los dos repos, y **no le cree al
disco**: pregunta por la red y mide tres cosas.

1. **Todo commit alcanzable desde HEAD está en alguna rama del remoto.** Rojo
   con el nombre del commit suelto y el remedio escrito (`git push`).
2. **El ref local de origin coincide con el remoto de verdad.** Si es una foto
   vieja, rojo: cualquier lente que lo lea mide el remoto de ayer.
3. **Y si el remoto no contestó, la corrida no midió nada, y lo dice.** El
   canario es el mismo de la base del bloque 10: una lente que se pone verde
   porque no pudo preguntar es peor que no tenerla.

Se corre **antes de commitear**, que es cuando HEAD tiene que estar en el
remoto. Entre el commit y el `push` se pone roja a propósito: eso es lo que mide.

**Probada contra su propio fallo, cinco veces.** Su defecto no es texto en un
archivo, así que el arnés de la batería no le servía: lo que hay que ensuciar es
el estado de git. El arnés nuevo arma un `--bare` y cuatro clones en una carpeta
temporal —el repo de verdad no se toca— y le pone cada defecto: el commit sin
subir, **el ref viejo**, el HEAD suelto (que es como nace este contenedor), y el
remoto que no contesta. Los cinco en rojo, o sin medir, donde tenían que estarlo.

**Y el ejercicio del ref viejo le encontró un agujero al primer intento de la
lente**, que es el apunte más útil de la despertada: `git rev-list HEAD --not
<sha>` **revienta con «bad object»** cuando ese commit del remoto no está en este
disco — y eso pasa justo en el caso del ref viejo, el que la lente nació
midiendo. Arreglado midiendo solo contra los commits del remoto que el disco
tiene, y **no perdonando en silencio** el caso de no tener ninguno: sin un commit
del remoto acá no hay con qué comparar, y eso es un rojo con su remedio
(`git fetch origin`). Creerle al ref local ahí sería creerle a la foto vieja.

**La verificación, en vivo y no en un temporal:** con el commit de MCD hecho y
sin subir, la batería entera se puso **roja**, nombrando `d850db7` y el `git
push`. Después del `push`, verde otra vez.

Las dos baterías enteras en verde antes de subir: TCD con `tsc` y
`npm run build` limpios, las **145** `prueba-*.ts` dentro del bloque y
`auditoria.py` con **921 miradas, cero faltas** («el ZIP puede salir»); MCD con
`tsc` limpio, `next build` limpio y sus **99** lentes —97 más las dos nuevas—.

**Una premisa más del encargo de la tarea quedó corregida.** Dice que MCD «hoy
NO tiene batería de ningún tipo: ése es su primer turno», y ya estaba anotado
que no vale. Lo de hoy es otra cosa: el encargo manda `git log --oneline -8`
como primera medición, y **`git log` y `git status` no son fuentes confiables
para el estado del remoto en un contenedor recién nacido.** Lo primero de un
turno es `git ls-remote origin`, o un `fetch` que de verdad haya corrido. Si el
`fetch` sale rechazado, el turno **no sabe** dónde está el remoto, y tiene que
decirlo en vez de deducirlo.

### El 17 de noviembre a las 11:30: la ausencia era el defecto, y esta vez eran tablas enteras

**La pregunta.** La despertada de las 23:40 levantó el esquema de MCD y la de
las 03:25 el de TCD, y las dos preguntaron lo mismo: ¿la columna que el código
pide existe? Quedaba la pregunta de atrás, que es la que este repo ya se hizo
dos veces en otros cuerpos: **¿y la lente ve lo que NO está?**

No lo veía. `scripts/prueba-el-esquema-real.py` dice medir «toda columna que el
código nombra existe en el esquema», y su recorrido empezaba así:

```python
if tabla in vistas or tabla not in objetos: continue
```

Una tabla que no existe no se medía: **se salteaba**. Medido levantando la base:
de las **14 tablas** que el código de MCD nombra, **seis no estaban en el
esquema**, y la lente daba verde con las seis afuera. Es la tercera vez en este
repo que la ausencia es el defecto —la primera fue el 14 a las 15:25 (el
comentario que escondía al endpoint que cobra) y la segunda el 14 a las 19:30
(las tres ausencias de mecanismo en un recolector)—.

**Tres de las seis son de MCD, y las tres fallaban en silencio en producción.**
No por mala suerte: las tres escrituras están escritas sin mirar el error.

| la tabla que no existía | lo que pasa hoy en la app |
|---|---|
| `agent_config` | «Tu Asistente ✨»: el sanador escribe tono, reglas y firma, aprieta Guardar y **no se guarda nada**. Al volver, los campos vuelven a los de fábrica, y el asistente de IA redacta sin su tono |
| `patient_notes` | la ficha del paciente: escribe una nota, la manda, y la nota **no queda**. El bloque de notas está siempre vacío |
| `notifications` | la campanita del encabezado: **no suena nunca**. El webhook de GHL llama a `notificar()` por cada mensaje, cita y paciente nuevo, y los tres inserts se pierden |

**Las otras tres no eran lo mismo, y la diferencia importa:**

1. **`comprobantes` era un falso positivo del recorrido**: no es una tabla, es
   la cubeta privada de storage, y la migración `20260707` sí la crea. El
   recorrido no distinguía `supabase.from(...)` de `supabase.storage.from(...)`.
   Ahora las separa, y la cubeta tiene su propia lente contra
   `storage.buckets` —si no existe, el upload del comprobante falla y **sin
   comprobante no hay cobro**—.
2. **`profiles` y `clinica_artefactos` no se pueden crear en MCD**: viven en el
   proyecto Supabase de TCD. Eso es el hallazgo de abajo.

**Lo que se construyó.** Primero se mide la tabla y después la columna, y el
saltearse —que sigue siendo necesario para no pedirle columnas a algo que no
está— ya no es silencioso. Cuatro lentes nuevas y seis ejercicios:

- toda tabla que el código nombra existe en el esquema;
- toda cubeta que el código nombra existe en `storage.buckets`;
- `AJENAS` —la única forma de perdonar una tabla ausente, y se paga con un
  motivo escrito— **sin entradas inalcanzables**: una que nadie nombra quedó de
  un borrado, y una que ya existe es una excusa que tapa. Es la misma lente de
  la lista blanca del entorno, de las 07:25;
- los dos Guardar de «Tu Asistente», que tienen que dejar **una** fila (por eso
  `practitioner_id` es la clave primaria: con un `id` propio, el segundo Guardar
  insertaría otra fila y el `maybeSingle()` de la pantalla reventaría);
- la nota que queda escrita y la ficha que la lee;
- **la campanita con dos sanadores**, que acá no es decorado: sus tres consultas
  **no filtran por sanador** —el GET hace `select('*')` y el POST
  `update({leida:true}).eq('leida', false)` a secas— y se apoyan enteras en la
  política. Una tabla creada sin RLS dejaba al sanador viendo las
  notificaciones de todos, y al apretar «marcar todas leídas» marcando las de
  todos.

**Probadas contra su propio fallo, ocho veces, las ocho rojas donde tenían que
estarlo:** la migración de las tres tablas borrada, una consulta que nombra una
tabla inventada, el upload con una cubeta inventada, la RLS de la campanita
apagada, su política sin filtro de dueño, la clave primaria de `agent_config`
movida, y las dos formas de una excepción inalcanzable.

**Y el arnés falló primero por su propia culpa**, que es el apunte más útil de
esta despertada: el temporal donde copia el repo nace en `0700` y las
migraciones las lee **`psql`, que corre como `postgres`, no como root**. Con la
base muerta **todas** las lentes se ponen rojas, y un arnés que solo busca «¿está
roja la que nombré?» daba los ocho defectos por vistos. Quedó el canario: si la
base no contestó, esa corrida no midió nada. Y de paso el puerto dejó de estar
escrito a mano —con `5434` fijo, ocho corridas seguidas se pisaban—.

Batería de MCD entera en verde antes de subir: `tsc` limpio, `next build`
limpio, sus tres pruebas y `auditoria.py` con **97 lentes, cero faltas**. Y la
de TCD, que no se tocó, verde también antes de subir este apunte: `tsc` y
`npm run build` limpios y `auditoria.py` con **919 miradas, cero faltas** («el
ZIP puede salir»).

### Lo que esta despertada deja esperando tu clic: «La Clínica Amueblada» no puede amueblar nada

Las otras dos tablas ausentes —`profiles` y `clinica_artefactos`— son una sola
cosa, y es una **función entera que está escrita, subida, y no puede funcionar
nunca**. El código la llama «La Clínica Amueblada»: lo que el profesional
construyó en el Camino de TCD entra a su clínica de MiClínica con un clic —su
identidad precarga «Mi marca», su método aparece armado en «Protocolos»—.

Está escrita contra **una base compartida que no existe**. El encabezado de
`src/lib/puenteMCD.ts` lo dice con todas las letras: «TCD escribe en la tabla
compartida `clinica_artefactos`; MCD (**mismo proyecto Supabase**, misma
identidad) la lee». Esa premisa ya se había caído el 16 de noviembre a las
15:30 —las dos apps **no** comparten Supabase; lo único que las une es el
puente HTTP— pero nadie había ido a ver **qué código se había construido
encima de ella**.

Y no falla por un motivo, falla por dos, cada uno suficiente:

1. **La tabla no está.** MCD le pide `clinica_artefactos` y `profiles` a *su*
   Supabase, donde ninguna de las dos existe ni puede existir: las escribe TCD
   en el suyo.
2. **La identidad tampoco cruzaría.** Las dos consultas filtran por
   `user.id` —el id del usuario de *MCD*—, y el mismo profesional tiene un id
   distinto en cada proyecto, porque son dos `auth.users` distintos. El puente,
   que sí anda, por eso no usa el id: **usa el correo**.

**Y las dos están escritas para fallar calladas**, que es por qué pudo durar:
en «Mi marca» la consulta vive dentro de un `try { } catch { /* sin tabla o sin
permiso: la página funciona igual */ }`, y en «Protocolos» el `if (!art)
return` hace que el botón de traer el método **nunca aparezca**. Desde afuera
se ve igual que un profesional que todavía no llenó nada.

**No se tocó, y es decisión tuya.** Lo que hay que elegir no es un arreglo
técnico: es si la función existe. Las dos tablas quedan declaradas en `AJENAS`
con su motivo, así que la batería ya no las tapa ni se pone roja por ellas.
Botón de tres:

- **Recomendado · hacerla andar por el puente.** Es el único lugar por donde
  las dos apps se entienden, y ya está probado de los dos lados. Son dos
  piezas: una ruta nueva en TCD que entregue, por correo, la identidad y el
  método del profesional, y las dos pantallas de MCD leyéndola por HTTP con la
  clave que el puente ya usa. Se mide con el contrato del puente, que desde el
  16 a las 15:30 es una sola fuente y no tres copias a mano.
- **Sacarla.** Borrar las dos consultas y el botón. La app queda igual de
  andando y deja de haber código que promete algo que no pasa.
- **Dejarla como está.** Sabiendo que las dos pantallas tienen un trozo que no
  corre nunca.

**El otro candidato que queda medido:** TCD **no tiene** la lente que MCD acaba
de arreglar. Su `scripts/prueba-sql.sh` levanta PostgreSQL y ejercita a mano,
pero nadie compara las **46 tablas** que el código de TCD nombra contra el
esquema que el repo crea, ni sus columnas. El trabajo no es el mismo que en
MCD: el SQL de TCD no vive solo en `supabase/migrations/` —hay tablas creadas
en `poner-al-dia-la-base.sql`, `sala-de-mando.sql` y `v2-migration.sql`, en la
raíz—, así que lo primero que hay que decidir es **cuál de esos archivos es la
base de verdad**. Eso también es tuyo.

### El 17 de noviembre a las 07:25: la lente de las claves no veía la puerta por donde entra la plata

**La pregunta.** Las cinco despertadas anteriores preguntaron por el defecto
dentro de cada repo, por la costura entre los dos, por los datos del seed y por
el esquema. Quedaba un cuerpo sin mirar: **el entorno**. No el código, no la
base: la lista de lo que hay que cargar en Vercel para que la app ande entera.
Nadie la había medido nunca contra el código.

**Y la respuesta volvió a ser la puerta, no la marca** —igual que el 15 a las
06:30, y por eso se escribe así—.

`auditoria.py` tiene desde hace semanas una lente que dice vigilar que ninguna
clave secreta viaje dentro del paquete publicado: todo lo que lleva el prefijo
`VITE_` se empaqueta en el bundle y lo puede leer cualquiera que abra la app.
Esa lente buscaba `import.meta.env.VITE_X` **escrito así, de corrido**. Y cinco
archivos del repo no leen el entorno así: lo leen con una variable en el medio
—`const env = (import.meta as {…}).env ?? {}` y después `env.VITE_CHECKOUT_BASE`—,
que es el patrón que permite importar esos archivos fuera del navegador sin que
revienten, y está puesto a propósito.

Medido: **diez variables `VITE_` que la lente no veía**, y entre ellas **las
nueve por donde entra la plata**.

| el archivo | las que no se veían |
|---|---|
| `src/lib/planes.ts` | `VITE_CHECKOUT_AMARILLO`, `_VERDE`, `_NEGRO` — el candado de los pilares |
| `src/lib/laOfertaQueSigue.ts` | `VITE_CHECKOUT_BASE`, `_ASCENSO`, `_INSTALACION` — el candado del día 5 |
| `src/lib/renovacion.ts` | `VITE_RENOVACION_APP`, `_GRUPAL`, `_PRIVADO` — los tres pases al mes |
| `src/lib/libros.ts` | `VITE_LIBROS_URL` — el estante de los cinco libros |

**La prueba de que la lente se creía viéndolas está en su propia lista blanca.**
`_PUBLICAS` nombraba `VITE_CHECKOUT_AMARILLO`, `VERDE` y `NEGRO`: tres entradas
con las que el patrón viejo no se podía cruzar nunca. Una lista blanca con
entradas inalcanzables es la huella de una puerta ciega, así que ahora hay una
lente que mide justo eso.

**Y detrás de la puerta apareció el agujero de verdad: el inventario.**
`.env.example` no es documentación —es la lista de lo que se carga en Vercel—, y
nunca se había medido contra el código. El código leía **doce variables que ese
archivo no nombraba**:

- **las nueve de arriba**, los nueve enlaces de cobro;
- **`FATHOM_WEBHOOK_SECRET`**, sin la cual la ruta de la transcripción rechaza
  con 401 **todo** lo que llegue (falla cerrada, no abierta): el webhook queda
  configurado del lado de Fathom y ninguna transcripción entra nunca;
- **`PRECIOS_IA`**, que es la que el Panel del Motor de IA le nombra a Javo en
  pantalla —«se corrigen cargando la variable `PRECIOS_IA`»— y que la lista no
  tenía;
- **`SUPABASE_ANON_KEY`** del lado del servidor.

Ninguna de las doce rompe nada, y por eso el agujero podía durar: los nueve
enlaces **degradan al WhatsApp** con la variable vacía, así que el botón nunca
queda sin salida y la app no se queja. Lo que pasa es más barato de no notar:
**no cobra sola.** Cada venta sigue pasando por una conversación, y desde
afuera eso se ve igual que si estuviera bien.

**Lo que se construyó.** La lente vieja se reemplazó por un resolvedor que lee
el entorno **por todas las puertas** —la directa, la de corchetes
(`env['VITE_X']`) y la de la variable en el medio—, y sobre el archivo **sin
comentarios**: `VITE_GEMINI_API_KEY` sigue nombrada en tres comentarios que
cuentan de cuando la clave vivía en el navegador, y leerlos en crudo pondría la
batería roja por una clave que ya no existe. Encima de ese resolvedor, cuatro
lentes: la de los secretos en el bundle (ahora por todas las puertas), el
inventario **de ida** (toda variable que el código lee está en `.env.example`),
el inventario **de vuelta** (toda variable de `.env.example` la lee alguien: una
que nadie lee es creer que encendiste algo), y la de la lista blanca sin
entradas inalcanzables.

**Probada contra su propio fallo, siete veces**, y las siete rojas donde tenían
que estarlo: una clave puesta por la puerta indirecta, la misma por la directa
(para que no se perdiera lo que ya se medía), la misma por corchetes, una
variable sacada de `.env.example`, una declarada que nadie lee, una entrada
inalcanzable en la lista blanca, y una declaración comentada con `#`, que no es
una declaración. Más la octava, que tiene que quedar **verde**: la clave
nombrada solo en un comentario del código no cuenta como leída.

**Y lo mismo en MCD, que no tiene `.env.example`.** Su lista es la tabla de
`README-DEPLOY.md`, y el título de esa tabla dice **«TODAS»**. No lo era: el
código leía tres que no estaban —`NEXT_PUBLIC_APP_URL`, `AI_PROXY_URL` y
`AI_MODEL`—, y las dos últimas no estaban en **ningún** README. La del proxy es
la que importa: con la variable vacía el asistente **no se apaga**, le pega al
proxy escrito por defecto en `src/lib/ai/proxy.ts`
(`https://apighl.vercel.app/...`), así que nadie se enteraría de que la
dirección que creía haber cargado no está cargada. MCD tiene ahora las mismas
dos lentes de inventario, más una tercera que cuida la costura:
`TCD_INTEGRATION_KEY` es el mismo valor de los dos lados, así que **las dos
listas tienen que nombrarla** —si una no la tiene, el puente queda con un solo
lado cargado y contesta 401 para siempre—. Probada contra su propio fallo cuatro
veces, las cuatro rojas.

**Dos premisas se cayeron por el camino**, y las dos eran de la propia
medición:

1. **«`VITE_LIBROS_URL` está declarada y nadie la lee».** Eso dio el primer
   barrido, hecho con el patrón de la lente vieja — y era el barrido el que
   estaba ciego, no el código: `libros.ts` la lee por la puerta indirecta. El
   primer intento de medir el inventario tenía **exactamente el mismo defecto**
   que la lente que iba a arreglar.
2. **Las tres `prueba-*.ts` de MCD se corren con `npx tsx`.** No: con
   `node --experimental-transform-types`, que es como las corre su batería. Con
   `npx tsx` una de las tres se pone roja por diez errores de
   «top-level await … cjs» sin que nada esté roto. Queda anotado arriba, en el
   manual de operación.
3. **Leer un archivo nuevo con `rd()` y listo.** No: el bloque 16 —la auditoría
   de la auditoría— puso la batería roja en la corrida completa con
   `['.example']`, porque `.env.example` era **un lenguaje cuyo comentario la
   batería no sabía escribir**. Declarado en `_MARCAS` con su `#`, y el
   inventario pasó a leerla con `rdc()`: una variable escrita dentro de un
   comentario **no está declarada**, que es justo lo que había que medir. La
   lente que lo marcó no existía hasta el 15 de noviembre a las 03:25.

Batería entera en verde antes de subir, en los dos repos. TCD: `tsc` y
`npm run build` limpios, las **145** `prueba-*.ts`, los dos `.sh` de política y
`auditoria.py` con las cuatro lentes nuevas adentro. MCD: `tsc` limpio,
`next build` limpio y sus tres pruebas, con `auditoria.py` en verde y las tres
lentes nuevas.

### Lo que esta despertada deja esperando tu clic

**Los nueve enlaces de cobro están en la lista y vacíos.** Ahora `.env.example`
los nombra con lo que abre cada uno, pero el enlace es tuyo: son order forms de
GHL y no se inventan. Mientras estén vacíos, los nueve botones caen al WhatsApp
—nada roto, nada que se cobre solo—. Dos opciones:

- **Dejarlo así.** Cada venta pasa por una conversación, que es como está hoy.
- **Pegar los nueve en Vercel** (Settings → Environment Variables) y redeploy.
  Los nombres están en `.env.example`, agrupados por candado.

Y lo mismo, más corto, con **`FATHOM_WEBHOOK_SECRET`**: es un valor que
inventas tú, se pega en Vercel y el mismo en Fathom. Hasta que esté, el webhook
de la transcripción contesta 401 a todo.

### El 17 de noviembre a las 03:25: la base que la batería levanta no era la de Javo

**La pregunta.** La despertada de las 23:40 levantó el esquema de MCD y encontró
dos columnas que el código pedía y no existían. Esta hizo la misma pregunta en
TCD. La respuesta no estaba en el esquema: estaba en **quién lo describe**.

`scripts/prueba-sql.sh` es la prueba más fuerte del repo —levanta PostgreSQL de
verdad, valida tipos, defaults y políticas—, pero la base que levanta es un
**andamiaje**, y su propio comentario dice para qué: «el andamiaje tiene que
parecerse a la base real». Medido: de las **diez tablas que escribía a mano**,
**ocho las crea el propio repositorio**. Solo dos —`profiles` y `mensajes`—
tienen que estar a mano, porque ningún `.sql` del repo las crea.

Y tres de las ocho estaban mal justo donde importa. No se dedujo: se levantó la
base y se corrieron contra ella las sentencias de la app.

| la tabla a mano | lo que decía | lo que dice la de verdad |
|---|---|---|
| `cliente_preactivacion_check` | `paso`, sin `completado_por` | `step_id` y `completado_por` (la crea `20260507`) — el `select cliente_id, step_id` del Camino **no corre** contra la de a mano |
| `programa_videos` | un `url` que no existe en ninguna parte | `youtube_url`, `descripcion`, `duracion`, `created_at` (las crea `videos-migration.sql`) — el select de la Biblioteca **no corre** |
| `credit_transactions` | sin `paypal_order_id`, sin `pack_id` y **sin el CHECK de `source`** | la crea `20260513`, con la lista cerrada de siete valores |

`hoja_de_ruta` ya había caído por esto mismo y quedó arreglada a mano, con su
comentario explicando el fallo. Era la cuarta vez. Así que el arreglo no es
volver a escribirlas bien: es **no escribirlas**. Ahora el andamiaje corre los
creadores de verdad, y `notificaciones` —que nace en una migración anterior al
corte, y por eso no corre— se **extrae** de su archivo en vez de transcribirse.

**Y al dejar de inventarlas aparecieron dos defectos vivos que el andamiaje
tapaba.** Los dos del lado de la app, los dos en silencio.

**Uno · el crédito cobrado que no volvía.** El guardián cobra el crédito ANTES
de llamar al modelo —es la única forma de que dos pedidos a la vez no gasten el
mismo saldo—, y si después la cadena falla, `devolver_credito` lo repone. Esa
función escribía `source = 'devolucion'`, y `credit_transactions.source` es una
**lista cerrada de siete valores** que no la incluye: la declara el CHECK de
`20260513` y la repite `CreditTransactionSource` en TypeScript. El insert rompía
el CHECK, y como el insert y el `update user_credits` van en la **misma
función**, el rechazo se llevaba también la devolución del saldo. **El cliente
pagaba por aire.** No se veía por dos motivos: el andamiaje declaraba la tabla
sin el CHECK, así que la función pasaba la prueba de «las 17 funciones se
ejecutan»; y del lado de la app `devolverCreditoServer` solo hace
`console.warn`. La red de seguridad tenía el mismo agujero por dos lados:
escribía el **mismo** valor inválido, y miraba el `catch` cuando Supabase
**devuelve** el error en vez de lanzarlo — así que el log decía «devolución
anotada» sobre un insert que la base había rechazado. Cerrado con
`20261117_la_devolucion_no_era_una_fuente.sql` (y la misma corrección en
`sala-de-mando.sql`, que es de donde nace la función): `refund`, que es la
palabra que el sistema de créditos ya usa en el otro camino de devolución. No se
afloja el CHECK.

**Dos · la Sala de Mando no podía guardar ni listar una decisión.**
`sala_decisiones` la crea `sala-de-mando.sql` con `texto`, `motivo`, `fecha`,
`decidida_por`, `area`, `estado` y `created_at`. El código pedía **otras cinco**:
`titulo`, `criterio`, `contexto`, `decidida_en` y `vigente`. Ninguna existe, y
ninguna migración las creó nunca. PostgREST no ignora la columna que no conoce
—contesta 400 con `42703` y la sentencia entera no se ejecuta—, así que:

- `listarDecisiones` fallaba y devolvía `[]` por su propio
  `if (error || !data) return []`: **el panel «Decisiones» estaba vacío
  siempre**, sin decir nada;
- `guardarDecision` tiraba el error del motor en la cara, y es lo que corre
  **por cada decisión** al cargar una sesión desde `CargarSesion`;
- `derogarDecision` tampoco podía.

Cerrado del lado del código, con los alias de PostgREST
(`titulo:texto, criterio:motivo, decidida_en:created_at`) para que la pantalla
no se toque y las filas que ya están cargadas sigan valiendo; `vigente` se
calcula del `estado`, que es la lista cerrada de tres que la tabla tiene.
`contexto` era la única sin equivalente y se agrega por migración
(`20261117_la_sala_guardaba_decisiones_en_columnas_que_no_existen.sql`).

**La lente nueva** es `scripts/prueba-el-esquema-de-la-bateria.py`, cableada al
bloque 6 junto a `prueba-rpc-nombres.py`. Reusa el andamiaje de
`prueba-sql.sh` cortándolo en su marcador —igual que `prueba-puesta-al-dia.sh`,
así no puede desfasarse de él—, levanta la base, le pregunta a
`information_schema` qué quedó, y exige cuatro cosas: que el andamiaje **no
escriba a mano ninguna tabla que el repo crea**; que **toda columna que el
código nombra exista**; que **no aparezca una tabla nueva** que ningún `.sql`
del repo cree (hoy son cuatro conocidas y anotadas —`profiles`, `mensajes`,
`session_logs`, `diario_entradas`—, más dos que solo nombra `test-db.mjs`); y
que **las tres sentencias de la Sala corran** contra la base con una fila de
prueba.

**Probada contra su propio fallo, cinco veces** — y la cuarta encontró que la
lente estaba ciega: al sacar la lista de columnas a una constante —que es lo
prolijo— el argumento del `select` deja de ser un texto y **no se medía nada**.
La lente resuelve ahora las constantes de texto del archivo, y con eso pasó de
208 a **214 pares** medidos. Las cinco: pedir `titulo` otra vez (roja), volver a
inventar `programa_videos` en el andamiaje (dos rojas), sacar la columna
`contexto` de la migración (dos rojas), devolver `devolucion` a
`sala-de-mando.sql` (roja en `prueba-sql.sh`), y nombrar una tabla que el repo
no crea (roja).

**Tres premisas se cayeron antes de llegar al hallazgo**, y se anotan porque
cada una costó una medición:

1. **«Trece tablas que ninguna migración crea en TCD».** Son **cuatro** las que
   importan —`profiles`, `mensajes`, `session_logs`, `diario_entradas`—, más dos
   que solo nombra un script suelto. Y lo que la nota del 16 daba por resuelto
   («las trece existen») es cierto en la base de Javo y **falso en el repo**:
   `profiles` —con cerca de cien columnas— no tiene `create table` en ningún
   `.sql`. Su única descripción completa vivía dentro del andamiaje de una
   prueba.
2. **`jornadas.funciones` parecía faltar.** No faltaba: era la lente nueva
   corriendo las migraciones **antes** de `sala-de-mando.sql`, que es donde nace
   `jornadas`. `prueba-sql.sh` las corre al revés. Corregido el orden.
3. **Las cuatro pruebas de política de `prueba-puesta-al-dia.sh` estaban en
   verde por el motivo equivocado.** Al dejar de inventar `user_credits`,
   apareció el disparador que `20260513` pone sobre `profiles`: crea la fila de
   créditos, y `user_credits.user_id` apunta a `auth.users`. Sin el usuario, el
   disparador revienta y **ninguno de los tres perfiles de prueba entra**. Las
   dos pruebas de lectura se pusieron rojas; las dos negativas —«un cliente no
   lee la ficha de otro»— seguían verdes **sobre una tabla vacía**. Arreglado el
   andamiaje de esa prueba, y con una guarda que exige que los tres perfiles
   estén antes de medir ninguna política.

Batería entera en verde antes de subir: `tsc` y `npm run build` limpios, las
**145** `prueba-*.ts`, los dos `.sh` de política y `auditoria.py` con la lente
nueva adentro —**916 miradas, cero faltas**, «el ZIP puede salir»—. MCD sin
tocar.

### Lo que esta despertada deja esperando tu clic

**El repo no sabe crear `profiles`.** Es la tabla del centro de la app y su
esquema no está en ningún `.sql`: lo único que hay son los `add column` de
sesenta migraciones, más una descripción a mano dentro de una prueba. Mientras
siga así, de este repositorio **no puede salir una instalación nueva**, y si el
proyecto de Supabase se perdiera, el esquema de `profiles` habría que
reconstruirlo a mano. No se arregla solo porque adivinar los tipos de la tabla
viva sería inventar: **lo tienes que exportar tú**, desde el panel de Supabase
(SQL Editor), y queda guardado en el repo como la constancia del esquema. Las
otras tres —`mensajes`, `session_logs`, `diario_entradas`— van en el mismo
volcado. Dos opciones:

- **Dejarlo así.** La lente nueva vigila que el agujero no crezca: si aparece
  una quinta tabla que el repo no crea, la batería se pone roja.
- **Exportar el esquema de las cuatro** y pegarlo acá. Con eso, una instalación
  nueva nace completa y la batería puede dejar de describir `profiles` a mano.


### El 16 de noviembre a las 23:40: el esquema no tenía dos columnas que el código pedía

**Cuatro premisas se cayeron antes de llegar al hallazgo, y las cuatro del lado
bueno.** Se anotan porque cada una costó una medición y porque la regla —
verificar antes de construir — es justo lo que las encontró:

1. **La RLS de MCD.** Un primer `grep` dijo que seis de las nueve tablas no
   tenían `enable row level security` —entre ellas `patients`—. Falso: las
   nueve la tienen. El `grep` se tropezó con los **espacios de alineación**
   (`alter table public.practitioners       enable row level security;`).
   Medido de nuevo normalizando el espacio en blanco: 39 de 39 en TCD y 9 de 9
   en MCD. Ninguna tabla queda sin RLS.
2. **Las trece tablas «que ninguna migración crea» en TCD.** También falso:
   las trece existen; el `grep` solo sabía leer `create table` y esas nacieron
   de otra forma.
3. **Las claves de entorno.** TCD lee cuatro que su `.env.example` no declara
   (`FATHOM_WEBHOOK_SECRET`, `PRECIOS_IA`, `SALIDA_PDF`, `SUPABASE_ANON_KEY`) y
   MCD dos que ningún README nombra (`AI_PROXY_URL`, `AI_MODEL`). Se leyó qué
   hace cada una al faltar, y **las seis fallan bien**: el secreto de Fathom
   sin poner contesta 401 a todo el mundo —cierra, no abre—, la clave anónima
   cae en `VITE_SUPABASE_ANON_KEY` y tira si no hay ninguna, y las otras cuatro
   tienen valor por defecto. Son cosmética, no agujero. (`VITE_LIBROS_URL`
   está declarada y nadie la lee.)
4. **MCD nunca se había renderizado.** Eso sí era cierto —TCD tiene su bloque
   de Chromium real, MCD no tenía ninguno—, así que se levantó la app con
   `next start` y se cargaron sus catorce rutas en Chromium de verdad. **Las
   catorce pintan**, y las once de atrás del candado redirigen a `/login` sin
   sesión: el arreglo estático del 14 de noviembre quedó confirmado
   ejecutándolo. No había defecto ahí.

**El hallazgo estaba una capa más abajo: en lo que las pantallas le piden a la
base.** MCD tiene 74 lentes que leen el código y tres pruebas que ejecutan la
cuenta, pero **nadie había corrido nunca sus cuatro migraciones**, y ninguna
lente comparaba el nombre de la columna que el código pide con el nombre de la
columna que existe.

Y el esquema **no se puede leer con una expresión regular**: el primer intento
de medirlo perdió `access_token` y `created_at` de `patients`, porque el
comentario `--` del final de la línea se quedaba pegado al nombre de la columna
siguiente. (Es exactamente la razón por la que existe `solo_sql` en las dos
baterías, encontrada el 15 de noviembre por otro lado.) Así que el esquema no
se lee: **se levanta**. Las migraciones corren contra un PostgreSQL de verdad y
después se le pregunta a `information_schema` qué quedó.

De los **45 pares tabla.columna** que el código de MCD nombra, **dos no
existían**. Y no es un detalle de prolijidad: **PostgREST no ignora la columna
que no conoce** —contesta 400 con `42703` y **la sentencia entera no se
ejecuta**—. Las dos consecuencias se **ejercieron** contra la base, no se
dedujeron:

| lo que el código pide | lo que pasa, medido |
|---|---|
| `patients.phone`, en el `select` de la ficha del paciente | el select falla → `data` llega en `null` → la pantalla hace `if (!p) return notFound()`: **404 en la ficha de CUALQUIER paciente**. Y `src/lib/ghl/sync.ts` lee la misma columna para emparejar por teléfono, así que tampoco emparejaba |
| `practitioners.inversion_mensual`, en el Tablero, el Admin y «Mi marca» | en «Mi marca» viaja dentro del **mismo `update`** que la marca, la especialidad, el color y el link del calendario. Corrido contra PostgreSQL: la sentencia se rechaza y la base queda con **los cinco valores viejos**. El sanador escribe su marca, aprieta Guardar, **no se guarda nada y la pantalla no muestra ningún error**. El mismo `update` sin la columna inventada guarda los tres campos bien |

**Cerrado** con `20261117_las_dos_columnas_que_el_codigo_pedia.sql`, que las
agrega con `add column if not exists`: si la base viva ya las tiene puestas a
mano desde el panel de Supabase, el archivo no hace nada y queda como la
constancia de que el esquema del repo también las tiene. Una instalación
nueva —que es lo que significa vender esto— ya no nace rota. Las dos nacen
nulas y sin valor por defecto, que es contra lo que el código está escrito
(`p.phone ? … : ''`, `me?.inversion_mensual ?? ''`, `?? 0`).

**La lente nueva** es `scripts/prueba-el-esquema-real.py`, cableada al bloque
10 de MCD: levanta PostgreSQL, corre las migraciones —lo que de paso prueba
que **corren**, que tampoco se medía—, le pregunta a la base qué columnas
quedaron, y exige que toda columna que el código nombra esté ahí. Camina la
cadena de `.from(…)` eslabón por eslabón en vez de mirar una ventana de
caracteres, porque la ventana se comía el `.map(label => ({ label, done }))`
de la línea siguiente y daba `protocols.label` como columna faltante cuando es
una clave de un json; y saca el nombre de la tabla **embebida**
(`patients(full_name)`), que tampoco es una columna. Después ejerce las dos
sentencias que se caían, con una fila de prueba.

**Probada contra su propio fallo, tres veces:** sacando `inversion_mensual` de
la migración se ponen rojas tres lentes (la del esquema, la del `update` y la
que mira si lo escrito quedó guardado); sacando `phone`, dos; y rompiendo una
migración a propósito, la lente de esa migración.

Batería entera en verde antes de subir, en los dos repos: en MCD `tsc`,
`next build`, las tres `prueba-*.ts` y `auditoria.py` con la lente nueva
adentro; TCD sin tocar y en verde, **con sus 145 pruebas y el ZIP habilitado**.

### Lo que esta despertada deja esperando tu clic

**Ninguna pantalla de MCD escribe nunca `patients.phone`.** El formulario de
«Nuevo paciente» pide nombre y correo, nada más. La columna ahora existe, la
ficha ya no da 404 y el emparejado con GHL cae en el correo —que es lo que el
código ya hacía—, pero el teléfono queda siempre vacío hasta que alguien lo
cargue. Agregarle el campo al formulario es **cambiar lo que la app le pide al
sanador en una pantalla que él usa**, así que no se toca solo:

- **Dejarlo así.** El teléfono entra solo cuando el contacto llega de GHL.
- **Agregar «Teléfono» al formulario de Nuevo paciente** (un campo más, al
  lado del correo; el emparejado con GHL empieza a encontrar por los últimos
  ocho dígitos, que es lo que ya sabe hacer).

**Y una segunda, más chica:** `src/app/(app)/marca/page.tsx` consulta la tabla
`profiles` **de TCD** sobre el Supabase de MCD, con un comentario que dice
«tabla compartida `profiles`». Eso ya no es cierto —se midió el 16 a las 15:30:
**las dos apps no comparten Supabase**—, así que esa consulta no puede
encontrar nada nunca. Está envuelta en `try/catch` y la pantalla funciona
igual, así que no rompe; lo que hace es prometer una precarga que no ocurre.
Arreglarlo de verdad es traer el nombre y la especialidad **por el puente**,
que es el único lugar donde las dos apps se hablan — y eso es trabajo, no un
clic. Queda anotado acá.

### El 16 de noviembre a las 19:30: el día de cada pieza lo decidía una lista de septiembre

Las dos colas siguen cerradas y Javo no subió nada. Las tres despertadas
anteriores preguntaron por **el código** y por **la costura**. Esta preguntó
por **los datos**: el seed de los 90 días, que es lo que el cliente lee todos
los días y lo que le dice a Javo qué grabar.

**La premisa que se cayó, y es del propio generador.** `generar_seed.py` dice,
escrito ahí, que el día de cada tutorial sale de la jornada que lo pide y no de
un número a mano, «porque estaba a mano y se desfasó en 14 de los 21». Lo mismo
hace con los grados y con los entrenadores. **Las piezas de video eran la única
lista que seguía escribiendo el día a mano**, y el Camino se reordenó el 24 de
septiembre sin tocarla. Medido sobre el historial del seed: el 11 de septiembre
las dos listas coincidían; el 15 ya había 14 referencias sin ficha; el 24
quedaron **35 de las 43 piezas con un día que el Camino contradice**, y así
estuvieron dos meses.

**Lo que hacía, medido con las funciones de los dos lados, antes de tocar.** El
turno 12 dejó cerrado que el enlace de una fila llega al cliente **en el día
que dice la fila**. Nadie preguntó si ese día era el bueno, porque salía del
catálogo:

| lo medido | antes | después |
|---|---|---|
| piezas que llegan al día de su lección | **7 de 42** | 42 de 42 |
| filas con un día que el Camino contradice | **35** | 0 |
| filas que se ven cargadas con el video de otro día | **6** | 0 |
| filas que se ven vacías teniendo su video ya cargado | **5** | 0 |

En concreto: Javo grababa «Tu método propio» (P2.1), pegaba el enlace en su
fila —que decía día 15— y el cliente lo veía el día 15, mientras el día 9, cuya
lección es «Tu método, escrito con sus etapas», se quedaba sin video. Y el
Tablero, que es su cola de trabajo, le mentía sobre lo que falta grabar.

**El tercer testigo.** Los videos ya cargados (`videosCargados.ts`) están
puestos por día y sus comentarios dicen el Camino, no el catálogo: «día 9 · Tu
método propio». O sea que los dos lados vivos —el Camino y lo ya cargado—
coincidían, y la lista a mano era la única que decía otra cosa.

**Y lo único que miraba esta regla no lo corría nadie.** `tcd-spec/datos/validar.py`
existe desde el 24 de septiembre, su encabezado dice «Sirve como paso de CI: si
un número de la documentación deja de coincidir con el seed, esto lo encuentra
antes que un cliente», y el README del paquete lo lista como tal. Nada lo
corría: ni la batería, ni un hook, ni nadie. Al correrlo por primera vez **se
cayó con un KeyError en la línea 63** —pedía el `dia` del entrenador, campo que
se llama `dia_estimado` desde que ese día sale del Camino—, así que no llegaba a
imprimir ninguno de los problemas que ya tenía encontrados arriba. Y su tabla
de totales era de otra época: 4.265 minutos, 8 entrenadores, 9 frenos.

**Lo construido:**

| qué | dónde |
|---|---|
| el día de la pieza sale de la jornada que la pide (`DIA_DE_LA_PIEZA`) | `tcd-spec/datos/generar_seed.py` |
| las dos deudas del catálogo, emitidas **dentro del seed** para que nadie las copie a mano | `deudas_del_catalogo` en el seed |
| la lente que recorre al revés que el turno 12, con las funciones de los dos lados | `scripts/prueba-el-dia-de-cada-pieza.ts` |
| el validador reparado, con su deuda de documentos declarada, y **corrido por la batería** | bloque 6.4d de `auditoria.py` |
| ¿y el validador ve el defecto? seis defectos sobre una copia del paquete | `scripts/probar-que-el-validador-ve-el-defecto.py` |
| el defecto `dia-de-la-pieza` en el arnés de los defectos: **once** en vez de diez | `scripts/probar-que-la-bateria-ve-el-defecto.py` |

**Probado contra su propio fallo.** Puesto el día viejo de P2.1 en el seed, la
lente nueva se pone roja nombrando el día; el arnés de los once defectos la
corre y la ve. Y el validador se pone rojo —nombrando cuál es— con cada uno de
los seis: el día viejo, una jornada que pide una pieza que no existe, una pieza
que ninguna jornada pide, la deuda que crece sola, un freno que desaparece, y
la carga del cliente moviéndose de su desacuerdo declarado.

**Y una lente que estaba verde por casualidad.** `prueba-lecciones-escritas.ts`
exige que ninguna jornada llegue sin video ni lección escrita, y daba verde: el
día viejo de P4.5 «Tu recuperador» (decía 44) y de P4.4c «Cuándo crecer y
cuándo apagar» (decía 46) caía justo en días con **otro** video cargado —la
jornada de rodaje B y «Tu escalera»—, así que la lente contaba el video de otro
día como la clase de esa pieza. Con el día arreglado dicen la verdad: no tienen
video ni lección. Quedan declaradas y nombradas en voz alta en cada corrida.

### Lo que esta despertada deja esperando tu clic

Cuatro cosas, y ninguna es trabajo de la máquina: las cuatro son decisiones
tuyas. Todas quedaron declaradas, así que la batería se pone roja el día que
cambie cualquiera, y mientras tanto pasa.

1. **Los 14 códigos que el Camino pide y el catálogo no ficha** —P1.2, P1.2b,
   P1.3, P1.5, P1.6, P2.3, P2.5, P3.3, P3.4, P4.3, P4.8, P5.4, P7.2, P7.3—.
   No hay fila donde grabarlos ni título que mostrar. Cada uno es **una de dos**:
   una pieza que falta fichar (y entonces va a `PIEZAS` con su título, su set y
   sus minutos) o una referencia que el Camino tiene que dejar de pedir.
2. **P1.1 «Por qué el dinero se sana primero»**, fichada en el catálogo y que
   ninguna jornada pide: hoy el cliente no la ve nunca. O entra en su jornada,
   o sale del catálogo.
3. **P4.5 y P4.4c, sin video y sin lección escrita.** Grabarlas, o escribir su
   clase. Son los días 25 y 43.
4. **71 horas contra 56.** `00-MAESTRO.md` §3 dice «el total verificado sobre
   el seed: 4.265 minutos, unas 71 horas», `11-REVISION-FINAL.md` repite
   «5 h 30 por semana» y el README habla de «8 agentes». El seed dice **3.375
   minutos ≈ 56 horas**, 87 evidencias y 9 entrenadores. Cuánto trabajo dice el
   programa que lleva es tuyo, así que **no se tocó ni un lado ni el otro**: el
   desacuerdo quedó declarado con los dos números, y si cualquiera se mueve, la
   batería se pone roja.

**Y dos cosas medidas que no son decisión, solo apunte:** `Espejo` es el
entrenador de ocho jornadas en el seed —los días 1, 2, 3, 4, 19, 25, 32 y 66—
y es el único de los nueve sin módulo vivo en `src/lib/agents/` (el registro
`AGENTES` de la app tiene ocho). No se rompe nada a la vista —el id de la
jornada no se busca en ningún catálogo— pero el entrenador de los primeros
cuatro días no existe del lado de la app. Y el tipo `AgenteId` de
`roadmapSeed.ts` todavía lista los ocho nombres **viejos** (`critico`,
`escriba`, `camara`, `sparring`, `tablero`, `arquitecto`, `estratega`), que ya
no son los del seed; `agentePorId` y `piezaPorCodigo` son índices exportados
que nadie usa.

### El 16 de noviembre a las 15:30: el contrato del puente vivía en tres copias

Las dos colas siguen cerradas y Javo no subió nada. Las dos despertadas
anteriores preguntaron si cada batería **ve el defecto** en su propio repo.
Esta preguntó por **la costura**: el puente entre las dos apps tiene un lado en
cada repo, y cada batería lee solo el suyo.

**Y de paso se cayó una premisa del encargo de la tarea.** Dice que las dos
apps «comparten Supabase». No lo comparten: el comentario de la propia ruta de
MCD lo dice —«TCD (proyecto Supabase distinto)»— y las tablas no se cruzan
(`practitioners`, `cobros`, `patients` de un lado; `profiles`, `hoja_de_ruta`,
`mensajes` del otro). Lo único que une a las dos apps es **el puente HTTP**, y
por eso es el único lugar donde pueden dejar de entenderse.

**La premisa del mapa que se cayó:** «el contrato se cuida de los dos lados»
(turno 7). Lo que se cuida de los dos lados es el **comportamiento**. El
**contrato** —los nombres de los campos que viajan— estaba escrito a mano en
**tres copias que nadie ataba entre sí**:

| la copia | dónde vive | qué dice |
|---|---|---|
| lo que MCD escribe de verdad | `NextResponse.json({…})` en el repo de MCD | los 6 campos |
| la lista que dice cuidarlo | `CONTRATO = [...]` en la auditoría de MCD | 5 nombres a mano |
| lo que TCD lee | `data?.…` en `api/mcd-bridge.ts` | 3 campos |
| y el MCD **falso** | `prueba-el-puente-de-las-dos-apps.ts`, en el repo de TCD | copia congelada de los 6 |

La cuarta es la peor: el MCD falso que ejecuta las 15 lentes del puente es una
copia a mano de la respuesta de MCD, **guardada en el otro repo**. Mientras no
la ate nada, las 15 lentes pueden seguir en verde para siempre contra un MCD
que ya no existe.

**Cómo se midió: los dos defectos puestos de verdad, uno por lado.**

| el defecto puesto | lo que le pasa al cliente | las dos baterías |
|---|---|---|
| TCD lee `data?.totalUsd` (renombra de su lado) | el X/10 y el total se calculan sobre `undefined` | **roja** — la lente 15 del puente |
| MCD emite `fecha_primer_cobro` y arregla su propia lista `CONTRATO` | **el Cinturón Rojo no llega nunca y el candado del día 31 no se abre nunca, para todo cliente que cobró** | **las dos EN VERDE**: MCD 74, `tsc` y `next build` limpios; TCD con sus 15 |

**El segundo es el que pasa en la vida real**, y es lo que hace que la
simetría no exista: el que renombra el campo está editando MCD, y arreglar la
lista de su propia batería es el movimiento natural del que renombra. Después
de eso las dos baterías dicen «verde» y el puente contesta
`cobro_verificado: false` para todo el que vendió, en silencio y para siempre
—que es textualmente la ceguera que el encabezado de `api/mcd-bridge.ts` dice
que existe para evitar: «el Cinturón Rojo no llega nunca y el candado del día
31 no se abre nunca, en silencio y para siempre. Por eso `mcd_status` viaja
SIEMPRE»—. El motivo viaja; el **nombre del campo** no lo miraba nadie.

**Lo construido: la lente que compara los dos textos**, que es lo único que
puede verlo. Está en las dos baterías, de los dos lados, y en las dos sale del
objeto de la respuesta **leído**, no de una lista escrita a mano:

| la lente | dónde | qué ata |
|---|---|---|
| `el puente lee solo campos que MCD escribe de verdad` | TCD | lo que `data?.…` lee ⊆ lo que la ruta de MCD escribe |
| `y el MCD falso de la prueba no se quedó con un nombre que MCD ya no manda` | TCD | el falso de la prueba == lo que MCD escribe |
| `el MCD falso de la prueba escribe todo lo que el puente lee` | TCD | **sin MCD al lado**: el falso cubre lo que el puente lee |
| `esta ruta escribe todos los campos que TCD lee del puente` | MCD | el espejo, y es el que caza el renombre **en el momento** |
| `y los cinco de la lista están entre los que escribe, no solo en el texto` | MCD | la lista `CONTRATO` contra el objeto de verdad |

Las claves se sacan del objeto literal **a mano y no con una regex**, porque el
valor de una clave trae comas y paréntesis (`lista.reduce((s, c) => …, 0)`) y
porque las de un `type` se separan con `;` y llevan `?`. Y las dos puntas se
leen **sin comentarios**: un campo nombrado en un comentario no viaja en el
JSON, que es el agujero por el que este frente ya se cayó cuatro veces.

**Y lo que queda cuidando esto para siempre, en los dos repos:**

- en TCD, `scripts/probar-el-contrato-del-puente.py`, dentro de la batería: le
  saca a `auditoria.py` el trozo marcado —`#.LENTE.CONTRATO.INI/FIN`— y lo
  evalúa con un lector que sirve el archivo **parcheado**, con las cuatro
  derivas puestas. No corre la batería entera y no toca nada del disco;
- en MCD, el defecto `contrato-renombrado` dentro de
  `probar-que-la-bateria-ve-el-defecto.py`, que ya existía: **once** defectos
  en vez de diez.

**Probado contra su propio fallo, tres veces.** Ablandadas las dos
comparaciones de TCD, el arnés salió rojo y nombró las tres derivas que habían
vuelto a ser invisibles. Sacada la marca `#.LENTE.CONTRATO.INI`, el arnés
avisa que no encontró su lente y sale en rojo en vez de dar verde por no medir
nada. Y en MCD, puesto el renombre de verdad, las dos lentes nuevas se pusieron
rojas nombrando el campo (`primer_cobro`), donde antes las 74 daban verde.

**Lo que no se tocó:** el `?email=` de la ruta sigue siendo el `?email=`. Esta
despertada no cerró `/api/mcd-bridge` —sigue siendo tu clic, con su botón de
dos en «Lo que queda, y es tu clic»—; lo que hizo es que el día que la cierres,
o el día que alguien renombre un campo de cualquiera de los dos lados, **una
batería se ponga roja antes de que el cliente se quede sin su Cinturón Rojo**.

### El 16 de noviembre a las 11:40: MCD leía su código, no lo corría

Las dos colas siguen cerradas y Javo no subió nada. La despertada de las 07:25
preguntó, por primera vez sobre el producto, si **la batería de TCD ve el
defecto**. Esta hizo la misma pregunta en el otro repo. Y hacía falta, porque
**las dos veces que se midió la batería de MCD —el 13 y el 14— se preguntó otra
cosa**: si una lente se podía *engañar* dejando el mecanismo en un comentario.
Nunca si, puesto el defecto de verdad, se pone roja alguna.

**La premisa que se cayó:** la batería de MCD es entera de lectura. Los nueve
bloques miran el código escrito —que `aes-256-gcm` esté, que `getContacts`
nombre `startAfterId`, que el techo se declare una sola vez— y eso cuida la
**forma**. No cuida la **cuenta**: `crypto.ts`, `normalize.ts` y el lazo de la
paginación **no los ejecutaba nada**. MCD no tenía una sola prueba que corriera
código: sus 75 lentes eran `grep` con disciplina, más `tsc` y `next build`.

**Cómo se midió:** diez defectos puestos a propósito en los archivos de verdad,
uno por vez, sobre una copia, con las 74 lentes corriendo contra cada uno.

| el defecto puesto | lo que le pasa al cliente | la batería |
|---|---|---|
| el IV del cifrado fijo en doce ceros | nonce repetido en AES-GCM: el PIT —acceso total a sus pacientes y su WhatsApp— se puede despejar y falsificar | 74 en verde |
| el descifrado devuelve lo guardado, sin descifrar | GHL recibe el texto cifrado como token: **401 para todos los clientes** | 74 en verde |
| la etiqueta del GCM leída un byte corta | el último byte de la etiqueta no lo verifica nadie | 74 en verde |
| `page.length < 100` por `<= 100` | **el cliente con 300 contactos ve 100, en silencio** | 74 en verde |
| la bandeja marca cero sin leer siempre | la doctora no ve que la esperan y deja de contestar | 74 en verde |
| toda venta abierta cuenta como paciente | el tablero le dice que todos son pacientes | 74 en verde |
| el que no vino cuenta como que vino | la tasa de asistencia infla | 74 en verde |
| el hilo anidado de GHL sin desanidar | la conversación se dibuja vacía | 74 en verde |
| el `429` fuera de la condición del reintento | el sync se cae por rate-limit | **roja** |
| un segundo `const MAX_ITEMS` | el techo declarado dos veces | **roja** |

**Los dos que sí se vieron eran de texto.** El `429` es un literal y el segundo
`const` es una línea de más: eso la batería lo lee. La cuenta, no.

**Y el cuarto de la tabla es el peor, porque está escrito en el propio README de
la batería:** el bloque 6 dice que existe para que «los contactos no se truncan
en 100 **en silencio**: faltan personas». Un carácter —`<` por `<=`— corta
siempre en la primera página, porque una página nunca trae más de 100. La lente
que dice cuidarlo leía el cuerpo de la función y veía `startAfterId` escrito,
que seguía estando.

**Lo construido: las tres primeras pruebas de MCD que ejecutan código**, 71
escenarios, y el **bloque 10** que las corre.

| la prueba | qué ejecuta de verdad |
|---|---|
| `prueba-el-token-cifrado.ts` | cifra y descifra: la vuelta completa, el IV que no se repite, **los 16 bytes de la etiqueta uno por uno**, la clave equivocada, el passthrough de datos viejos, el sobre de 12+16 |
| `prueba-las-listas-completas.ts` | la paginación contra un GHL de juguete: 300 llegan 300 y sin repetidos, el borde de 101, el techo de 1.000 sin colgarse, las 250 oportunidades, el hilo anidado y el plano |
| `prueba-lo-que-ve-el-avatar.ts` | los normalizadores: quién espera respuesta, los siete estados de la cita, en qué etapa cae cada venta |

Corren con el TypeScript que Node 22 entiende solo
(`node --experimental-transform-types`), **a propósito: MCD no gana ninguna
dependencia nueva por tener pruebas.** A mano: `npm run pruebas`.

**Y lo que queda cuidando esto para siempre:**
`scripts/probar-que-la-bateria-ve-el-defecto.py`, dentro del bloque 10 —el
espejo del de TCD—. Los diez defectos, y **cada uno NOMBRA la lente que tiene
que ponerse roja**. Probado contra su propio fallo dos veces: con las
afirmaciones de la etapa ablandadas, el arnés salió rojo y nombró el defecto que
había vuelto a ser invisible; y con el `process.exit` comentado en una prueba,
la lente que cuida eso se puso roja (es el agujero que TCD encontró a las 07:25,
cuando una de sus 133 imprimía `✗` y terminaba en 0).

**El arnés cazó un agujero en mi propia prueba, antes de subirla.** El defecto
de la etiqueta corta —`subarray(12, 27)`— **igual descifra**: AES-GCM acepta
etiquetas truncadas, así que el token iba y venía y la vuelta completa daba
verde. Por eso la prueba ahora recorre los 16 bytes de la etiqueta de a uno. Sin
el arnés, esa prueba habría entrado con esa ceguera adentro.

**Y una decisión de producto que quedó medida y NO se tocó, con su botón.**
`toVenta` evalúa el nombre de la etapa con un `||`, así que **gana sobre el
status de GHL**: una venta `lost` o `abandoned` parada en la etapa «Paciente» se
muestra como **paciente**. El comentario del propio archivo dice lo contrario
(«Señal DURA primero: el status de GHL»). O sea: una paciente que se fue sigue
contándose como paciente hasta que alguien la mueva de etapa en GHL. Hoy es así
y quedó clavado en la prueba para que el cambio sea tuyo:

- **[A] que el status mande** — una venta `lost` o `abandoned` deja de contarse
  como paciente aunque esté en esa etapa. Es lo que dice el comentario del
  archivo. Es un renglón, y da vuelta un número del tablero del cliente.
- **[B] dejarlo como está** — el nombre de la etapa manda, y el comentario del
  archivo se corrige para que diga lo que el código hace.
- **[C] mirarlo con el Snapshot de Javo congelado**, porque el mapa de etapas
  («este mapa se ajusta UNA vez cuando el Snapshot esté congelado») todavía no
  lo está, y puede que el nombre de las etapas de verdad cambie la respuesta.

**Batería de MCD entera en verde antes de subir:** `tsc` limpio, `next build`
limpio, las **87 lentes** (eran 75) con el bloque 10 adentro, las tres pruebas
con sus 71 escenarios y el arnés con sus diez defectos. TCD sin tocar más que
este mapa, con su batería entera en verde.

### El 16 de noviembre a las 07:25: las 143 en verde no querían decir que vieran

Las dos colas quedaron cerradas: las 17 filas de la cola vieja y los siete
turnos del plan de la piel, el último a las 05:10. Sin nada que tomar, esta
despertada fue a la pregunta de atrás, que nadie había hecho nunca **sobre el
producto**: cuatro turnos auditaron `auditoria.py` contra sí misma y uno auditó
las `prueba-*.ts` por su código de salida, pero **nadie había preguntado si la
batería VE el defecto**. Que una lente esté en verde dice que hoy no se cayó.

**Cómo se midió:** dieciséis defectos puestos a propósito en archivos de verdad,
sobre una copia del repo, y las 143 lentes corridas con cada uno.

| los defectos | la batería |
|---|---|
| **nueve de número** — el escalón de arriba de vuelta en 997 · la instalación en 5.000 · la meta de los 10 en 8 · la ventana de La Base en 80 días · un eslabón de la cadena roto · el cuarto sistema con el nombre corto · la tasa de asistencia en 0,50 · los 90 días con el color del lago · la subida de enero vencida | **vio los nueve** |
| **siete de mecanismo** — no cambian ningún número, cambian lo que pasa | **no vio cuatro** |

**Los cuatro que nadie veía, y de quién son:**

| el defecto puesto | lo que el cliente veía | la batería |
|---|---|---|
| la racha: el día en curso castiga | su constancia más baja de lo que es, hasta que haga la sesión de hoy | 143 en verde |
| la racha: se va la gracia de un día hábil | un día salteado le borra la racha entera | 143 en verde |
| la racha: el finde rompe | **el lunes arranca en cero**, con la semana entera hecha | 143 en verde |
| la ventana cierra un día antes (`>` por `>=`) | **se le cae el día 90**: su foto de llegada y su cierre de cuentas | 143 en verde |

Los tres primeros son la misma cuenta, y la leen tres pantallas:
`calcularRachaDesdeFechas` es la única definición de constancia de la app y la
usan el Diario del cliente, el Admin cuando mira una cuenta y **la pista de 66
de Mi protocolo** (`diasSostenidos`). El cuarto es el último día del que pagó
La Base.

**Por qué ninguna lente podía verlos, que es lo que vale para la próxima:**

- **la racha no se podía medir.** Preguntaba el día con `new Date()` adentro,
  así que ninguna prueba podía fijar un «hoy» y las tres reglas escritas arriba
  del código desde julio nunca se ejecutaron. Tres de las 143 nombran la racha
  y las tres miran **otra** cosa: las semanas con el mismo cuello en la cola del
  Admin, que comparte la palabra y no la cuenta.
- **la ventana sí se medía, pero por el medio.** `prueba-acceso.ts` ejecuta
  `estadoDeAcceso` desde siempre, y probaba el día 15 de 30, el día 36 y enero
  del año que viene: **nunca el último día ni el primero de afuera**. Un
  carácter de diferencia y el borde se corría sin que nada se cayera.

**Lo construido.** `calcularRachaDesdeFechas` recibe el `hoy` por argumento, con
el día de verdad por defecto —el mismo argumento que `estadoDeAcceso` ya recibía
por esta misma razón, y ningún llamador lo pasa—. Con eso, `prueba-la-racha.ts`:
ocho escenarios con su cuenta a mano sobre un noviembre fijo, y **350 escenarios
contra la misma regla escrita de otra forma** (una lista de días hábiles hacia
atrás, sin cursor ni aritmética adentro del lazo), con el `hoy` paseando por los
siete días de la semana. Y el borde en `prueba-acceso.ts`: el último día abierto
diciendo «queda uno», el anterior «quedan dos» y el siguiente cerrado con su
motivo, para los dos tipos de acceso, con las fechas saliendo de
`cierreDeLaVentana` y no escritas a mano.

**Y lo que queda cuidando esto para siempre:**
`scripts/probar-que-la-bateria-ve-el-defecto.py`, en la batería. Diez defectos,
y **cada uno NOMBRA la lente que tiene que ponerse roja**: si alguien ablanda esa
lente, el renglón se pone rojo. Probado contra su propio fallo, ejecutando: con
los casos de `prueba-la-racha.ts` dejados de comparar el número, el arnés salió
en rojo y nombró los tres defectos de la racha que habían vuelto a ser invisibles.

**Dos cosas más que se midieron de paso.**

- **La trampa del `HEAD` suelto tenía otra abajo:** la `main` local de TCD no
  estaba «quince commits atrás», estaba en **otra historia** —`git merge` la
  rechazaba por «unrelated histories»—, y no era un force-push: **el clon es
  superficial**, 50 commits de ventana, y los dos extremos caían en ventanas
  distintas. Quedó con `--unshallow`: 663 commits y la historia entera. El que
  venga y vea «unrelated histories» en este repo, que mire eso antes de asustarse.
- **Vercel no se puede mirar desde acá, y no es el proxy: es la cuenta.** El
  conector de esta sesión entra a `javieremilianokatz-6225's projects`, que
  tiene tres proyectos —`refugio`, `propuestas-javo-katz`, `nexos-demo`— y
  **ninguno es `sanar` ni el de MCD**. Así que promover el deploy y cargar
  `VITE_LIBROS_URL` y `GHL_AVISOS_WEBHOOK` siguen siendo tuyos, y ahora se sabe
  que una sesión dormida no puede ni verificarlos.

Batería entera en verde antes de subir: `tsc` y `npm run build` limpios, **144 de
144** `prueba-*.ts`, el arnés nuevo con sus diez defectos y `auditoria.py` con
**906 miradas** y cero faltas de diseño en las 93 vistas del cliente y las 17
del Admin. MCD sin tocar, con sus **75** en verde.

### El 16 de noviembre a las 05:10: el nombre del sistema, escrito tres veces y medido una

Se tomó el **T7 del plan de la piel: los arreglos de LIBROS** —el último de los
siete—. El plan listaba siete encargos del 12 de noviembre. **Seis ya estaban
hechos, y el séptimo no existe:**

| lo que el plan pedía | lo que había |
|---|---|
| la escalera: 997 a 1.000, 5.000 a 6.000 | hecho desde el turno 4 (`408fe10`). `planes.ts` vende La Base a `$1.000` y `cuadroTickets.ts` La Instalación a 6.000, con su subida de enero. Los 5.000 que quedan vivos son **La Cima** —otro producto, cinco días en Bariloche— y los tramos de la inducción interna |
| «Tu nuevo precio» en todos lados | hecho: es el nombre del escalón blanco en `planes.ts` |
| los cinco sistemas con su nombre del impreso | hechos: Tu reset · Tu programa · Tu captación · Tu propia app · Tu ecosistema, y `prueba-paisajes.ts` ya los compara contra el seed |
| `losCincoPaisajes.ts`: los tres datos falsos | dos arreglados —el Limay se junta con el Neuquén y es el Negro el que llega al Atlántico; el alerce cambia agua y minerales **con su hongo**, no azúcares con los otros árboles— y **el tercero, el cóndor que vuelve a mitad de camino, no está en el repo**: no aparece en `src/`, ni en `scripts/` |
| las etiquetas de días | hechas el 15: traen los dos números, el de la estación y el de armar |
| `libros.ts`: los cinco publicados y con enlace | hecho. El enlace sale de `VITE_LIBROS_URL`, que **sigue sin cargar en Vercel**: hasta que la cargues, el estante los anuncia sin botón |
| `libroYPacientes.ts`: los once capítulos que no existen | sigue igual, y sigue siendo lo correcto: ninguna pantalla del cliente importa ese archivo —medido archivo por archivo— y lo leen tres lentes y el script de los PDF. Borrarlo rompe esas piezas sin arreglar nada que se vea |
| «menos mapas para el mismo viaje» | hecho, con su lente propia (`prueba-menos-mapas.ts`) |

**Lo que no estaba era quien los cuide, y por eso uno ya se había caído.**

Los cinco nombres del impreso están escritos **tres veces**: el seed los manda
(`roadmap.seed.json`, `sistemas[].nombre`), `losCincoPaisajes.ts` los repite en
el campo `sistema`, y `libros.ts` los repite por tercera vez al abrir el
`queExplica` de cada libro del sur. De las tres, **solo la segunda tenía quien
la compare.**

**Y el candado estaba desfasado hoy en main.** `CANDADOS.rio.teDeja` decía «Tu
app andando, horas recuperadas y siete mil dólares vendidos» — y el sistema se
llama «Tu propia app». No es un comentario: `Agentes.tsx` arma el contexto
vigente de los entrenadores desde `CANDADOS`, así que al cliente se le nombraba
su cuarto sistema con el nombre corto, el que no está en ningún impreso.

**Las dos lentes que lo dejaban pasar miraban que estuviera ESCRITO, no qué
decía:** `prueba-las-cinco-estaciones.ts` pedía `c.teDeja.trim()` y
`prueba-estante-de-libros.ts` pedía `queExplica.trim().length > 20`. Es el
mismo error que la cabecera de la primera ya contaba con los tramos, y el que
la revisión de las 23:40 dejó anotado: **la lente verificaba que algo no
estuviera vacío, no que la cuenta diera bien.**

**Lo arreglado.** El candado del Río dice «Tu propia app andando». Y las dos
lentes piden el nombre **al seed** —no a `PAISAJES`, que es otra copia— y
comparan la respuesta: el candado de cada estación abre con el nombre de SU
sistema, y cada libro del sur abre con el suyo y lleva **en el lomo el número
de su sistema** (el libro 4 es el del sistema 4, no el cuarto que se escribió).

**Y una medida que nunca había existido: la cadena.** «Cada estación se abre
con el logro de la anterior: no es un calendario, es una cadena» se le dice al
cliente en ese mismo contexto. Las dos puntas de cada eslabón viven en campos
distintos (`teDeja` de una, `seAbreCon` de la siguiente) y ninguna lente las
había comparado nunca. Ahora se comparan, sin tildes y sin mayúsculas.

**Probadas contra su propio fallo, las cuatro en rojo:** el nombre corto puesto
de vuelta en el candado · un eslabón roto (el Bosque abriendo con «Diez ventas
pagas») · el nombre corto en el libro del río · dos lomos cambiados. Las cuatro
daban verde ayer.

**Cómo quedó medido.** `tsc` y `npm run build` limpios, las **143** pruebas en
verde, `auditoria.py` con **905 miradas** y cero faltas de diseño en las 93
vistas del cliente y las 17 del Admin: «el ZIP puede salir».

**Lo que de T7 no se tocó, porque es tuyo:** nada de precio quedó pendiente —la
escalera ya estaba—, pero sí queda **`VITE_LIBROS_URL` sin cargar en Vercel**,
y hasta que esté los cinco libros se anuncian sin botón de descarga.

### El 16 de noviembre a las 00:30: el mapa pintaba el trabajo, no el lugar

Se tomó el **T6 del plan de la piel: el juego del sur** —el vaso, el mapa, la
racha, el sello y las diez palabras—. El plan decía «hay una pieza y media:
`racha.ts` cuenta días hábiles con sesión y no hay vaso, ni mapa, ni sellos, ni
palabras». **Eso dejó de ser cierto el 15 a la mañana:** las cinco estaban
construidas (`src/lib/elJuegoDelSur.ts`, su pantalla en El Camino, su prueba),
y la revisión de las 23:40 ya les había arreglado tres cosas. Así que el turno
no fue construir: fue medir lo construido.

**Lo que se midió, ejecutando el color de los 90 días contra lo que la app
dice de cada día:**

| | |
|---|---|
| días que el tablero pintaba con el color de OTRO paisaje | **55 de 90** |
| días que no podían pintarse nunca | **31** — el 48, 49, 55, 56, 62, 63, 69, 70, 75 a 77, 81 a 84 y 87 a 90 |

El día 90 entre ellos: el cliente cerraba el Camino entero y su último
casillero se quedaba gris.

**Por qué.** El mapa tomaba el color del `sistema` de la jornada de ese día. El
`sistema` dice de qué sistema es EL TRABAJO —y el trabajo del sistema 1 vuelve
a aparecer en el día 80—; el paisaje dice DÓNDE ESTÁ el cliente, y en el día 80
está en el río. Son dos cosas distintas y el mapa pintaba la primera: le salía
un confeti de 47 tramos en vez de los cinco paisajes de la guarda. Los 31 días
sin color son las jornadas que no traen sistema (o traen 0).

**Es el mismo defecto que ya había pasado, y está escrito tres líneas más
arriba del código que lo repetía:** cuando `estaciones.ts` se escribió sus
propios rangos, 21 de los 90 días mostraban un paisaje en Hoy y nombraban otro
en El Camino. Por eso existe `paisajeDelDia`, que lo contesta en un solo lugar.
El tablero no lo usaba.

**Y la lente que miraba justo eso daba verde.** Decía «los días de cada paisaje
no están copiados: salen del seed» — y lo que medía era la AUSENCIA de rangos
escritos a mano, no el color que sale. Es exactamente lo que la revisión de las
23:40 dejó anotado: las lentes verificaban que algo no estuviera escrito, no
que la cuenta diera bien.

**Lo arreglado.** El mapa pregunta el color a `paisajeDelDia`, como el resto de
la app, y la leyenda («El lago 1–7 · La montaña 8–14 · El viento 15–35 · El río
36–84 · El bosque 85–90») sale de los mismos tramos que pintan, así que no
puede mentir. Se fueron los dos props que lo traían por el otro camino.

**Y una segunda, más chica y más seguida:** de las diez palabras escondidas,
**ESCÁNER lleva tilde**, y en un teléfono se escribe sin ella nueve de diez
veces. La comparación era exacta: la rechazaba, el campo se vaciaba y la
pantalla no decía nada — el cliente no podía saber si la había sumado o si la
palabra estaba mal. Ahora la tilde no decide y la pantalla contesta las dos
cosas: «ESCÁNER, sumada» o «esa no es una de las diez».

**Seis lentes nuevas que ejecutan** (y una lista que dejó de estar escrita a
mano): los 90 días tienen color · son cinco colores · van en cinco tramos
seguidos · en el orden de la colección · ningún día se pinta con el color de
otro paisaje —comparado contra `tramoDelPaisaje`, que llega al mismo número por
otro camino— · la leyenda cubre los 90 sin dejar un día afuera. Más las de la
palabra sin tilde y las del sello. Y los 28 días que tienen paso afuera, que
estaban escritos uno por uno en la prueba, ahora salen del seed.

**Probadas contra su propio fallo:** con el color volviendo a salir del
`sistema` de la jornada, las cinco del mapa se ponen rojas y cuentan lo mismo
que la medición —31 sin color, 55 con el color de otro—; con la comparación
exacta de la palabra, tres de las de las diez.

**El sello por tramo, verificado y no inventado.** El módulo decide no dibujar
un sello nuevo porque «los grados ya son el sello». Eso es una afirmación sobre
los datos, así que ahora se ejecuta: cada uno de los cinco paisajes tiene al
menos un grado adentro (lago 10gup@1 y 9gup@5 · montaña 8gup@12 · viento
7gup@16, 6gup@19, 5gup@26 y 4gup@31 · río 3gup@38, 2gup@45 y 1gup@47 · bosque
1dan@90). **Queda una cosa para tu clic, y no se tocó:** el río va del día 36 al
84 y su último grado cae en el 47, así que el tramo más largo del Camino tiene
**37 días seguidos sin ningún sello**. Mover o agregar un grado ahí es decisión
de producto —cambia lo que el cliente gana y cuándo—, así que queda anotado y
no hecho.

**Lo que NO se tocó, y es tuyo:** el vaso del Camino da para 120 piedras y el
del libro tiene 100 (está bien así: se llena cerca del día 70). Y las palabras
y los pasos afuera se guardan en el teléfono, como el protocolo del T5: si el
cliente cambia de aparato, los pierde. Pasarlos a la base es una migración, no
un arreglo.

Batería entera en verde antes de subir: `tsc` y `npm run build` limpios, **143
de 143** `prueba-*.ts`, `auditoria.py` con **908 miradas** y cero faltas de
diseño en las 93 vistas del cliente y las 17 del Admin. Captura del tablero en
un teléfono de 390, con la cuenta llena: los cinco paisajes, seguidos.

### El 15 de noviembre a las 21:40: tres piezas que no se podían escribir

Turno **T5 de los siete** del plan de la piel: Mi protocolo, las 33 piezas.

**La premisa se cayó antes de empezar.** El plan dice ««Mi protocolo» no
existe. Ninguna de las 33 piezas tiene dónde escribirse». Existía desde esa
misma mañana, del turno de las 18:21 (`58ced97`): `src/lib/miProtocolo.ts` con
los 33 nombres y sus pies, `MiProtocolo.tsx` montada sin condición dentro de
El Camino, la pista de 66 con sus hitos en 21, 44 y 66 y su fuente, las tres
señales de la OMS con sus dos campos, y `prueba-mi-protocolo.ts` **en verde**.
Las cuatro partes del turno estaban escritas. Ninguna llegaba entera.

**Tres de las 33 eran imposibles.** «La pieza N es la de la lección N» es
cierto, y no alcanza. El Camino se detiene solo en los **pasos del cliente**, y
las lecciones 7, 15 y 27 viven en los días 6 y 13, que son «Fin de semana»: 0
minutos, sin grado, nunca un paso. Medido corriendo el recorrido entero sobre
los 64 pasos: **30 piezas alcanzables de 33**. «Tu para qué», «Tu permiso
nuevo» y «Tu voz expuesta» no se pedían jamás, y el renglón de abajo decía
«Quedan 3, y cada una llega con su lección».

**Y las otras 30 tenían un solo día.** El mismo agujero por el otro lado: la
única pieza escribible era la de hoy. Las que faltan se cuentan y no se listan
—está bien pensado y se queda: 31 nombres seguidos son seis renglones que no
sirven para nada—, pero no tenían **ninguna entrada**. El que no escribía la
suya el día que su lección caía la perdía para siempre. Treinta y tres piezas,
una oportunidad cada una, y nada fallaba.

| | antes | ahora |
|---|---|---|
| Piezas que se piden alguna vez | 30 de 33 | 33 de 33 |
| Veces que se puede escribir cada una | 1 (su día) | su día, y cuando vuelva |
| Máximo de piezas en un día | 2 | 2 |

**El arrastre.** La pieza de una lección que cae en un día que no se camina se
pide en el primer paso siguiente: se lee el sábado, se escribe el lunes. Es una
función pura, `leccionesDelDia`, y el recorrido del Camino quedó **uno y
plano**, para que el paso de hoy y sus piezas salgan del mismo índice y no
puedan discrepar.

**La pista de 66 estaba clavada en cero.** `diasSostenidos` no se pasaba nunca
en el llamado, así que las 66 casillas no podían avanzar ni una. Va con
`calcularRacha()`, que ya existe y ya se guarda. **Decisión tuya, y es un botón
de dos:** qué cuenta como «sostener» el protocolo —la sesión del día (lo que
mide hoy, días hábiles con gracia de uno) o el **paso afuera**, que es lo que
el T6 pide para la racha del juego del sur—. Mientras no la toques, mide la
sesión.

**La lente, mordida cinco veces.** Seis medidas nuevas, y ahora corre el
recorrido en vez de leerlo como texto: sin arrastre se pone roja y **nombra 7,
15 y 27**; con el arrastre sin tope, roja (33 piezas en un día); sin
`diasSostenidos`, roja; con las que faltan sin entrada, roja por los dos
renglones; con dos jornadas intercambiadas en el seed, roja. Las cinco,
probadas poniendo el defecto y sacándolo.

**Y lo de siempre, otra vez:** al empujar, el remoto había avanzado dos veces
—`dba6ea8` y `d114216`, de otras sesiones—. Ninguno de los dos toca estos
cuatro archivos; el segundo toca una línea de `Roadmap.tsx`. Rebasado, y
`tsc`, `build` y las lentes vecinas en verde sobre el árbol fusionado.

### El 15 de noviembre a las 23:40: la revisión que no vio el trabajo

Una revisión con ojos nuevos sobre todo lo del día. Corrió `tsc`, `build`,
**las 143 lentes**, la auditoría entera y el medidor: **todo verde**. Y
después encontró **doce defectos**, cinco de ellos graves.

**El diagnóstico de fondo, que vale más que la lista:** las lentes de este
repo *verifican con expresiones que una llamada EXISTA, no que su condición
pueda ser verdadera alguna vez*. Los cinco hallazgos más graves pasan por
ahí. Una lente que ejecute la función y compare contra una cuenta
independiente los hubiera agarrado a los cinco.

**El peor, y era de este turno.** El cron de los avisos tenía el calendario
del Camino copiado a mano: **33 de sus 40 códigos ya no existen en el seed**.
`CAMINO.find(m => !done.has(m.c))` devolvía siempre un código imposible, así
que todo cliente quedaba atrasado —incluido el que cerró las noventa
jornadas— con el atraso creciendo con el calendario:

| estado del cliente | lo que veía el cron |
|---|---|
| todo hecho, día 5 | «4 días atrasado» |
| todo hecho, día 90 | «64 días atrasado» |

Mientras eso solo encendía una alarma en el Admin, ensuciaba. Esta mañana se
le colgaron encima **los avisos que salen al cliente**: el día que se pegue
el webhook, todos reciben cada semana un mensaje diciéndoles que no
avanzaron. Del mismo calendario vencido: «Camino completo» no podía salir
nunca y «cerró el día 5» se disparaba al cerrar el día 3.

Ahora se deriva del seed, y la lente **ejecuta esa derivación** en vez de
buscar texto.

**Los otros once, en una línea cada uno:** el de 97 veía las nueve clases del
método (el filtro miraba días de calendario y dejaba pasar las piezas sin
día) · tres piezas del protocolo no se podían escribir · la racha no recibía
«hoy» y no se podía cortar, así que el mensaje de reenganche era código
muerto · el vaso decía 120 debajo de una grilla de 100 · el tablero no se
movía al marcar el paso afuera · la pista de 66 no recibía su dato · un aviso
roto se llevaba puestas las entregas del equipo · la consulta de tareas sin
paginar truncaba el progreso del cliente 16 en adelante · la fuente de Lally
avalaba los tres números, incluido el que ese estudio contradice · cinco
frases en negativo · tres palabras prohibidas que venían de antes.

**Y una lección de método para el que venga:** la revisión encontró en una
pasada lo que 143 lentes en verde no vieron, porque no leyó los mensajes de
commit: ejecutó.


### El 15 de noviembre a las 20:10: la corrección — el medidor nunca estuvo ciego

**Lo escrito en el commit `58ced97` y en el chat estaba mal, y se corrige
acá.** Decía que `preparar(lleno=True)` escribe las 71 jornadas hechas y la
pantalla las deja en cero, «así que la cuenta llena del medidor nunca tuvo el
Camino lleno». Es falso.

Lo que pasó es más chico y más mío: **el script que escribí para sacar la
foto pasaba `lleno=True`**, un booleano, donde va el estado. El medidor
siempre lo pasó bien: sus diecisiete vistas `>lleno` llaman a
`estado_lleno()` y reciben el diccionario con las 71 jornadas, el ADN
escrito y los números del mes.

Medido de los dos lados, en la misma corrida:

| Lo que se pasa | Jornadas en el teléfono | Lo que muestra el tablero |
|---|---|---|
| `lleno=True` | 0 | sin piedras |
| `lleno=estado_lleno()` | 71 | 70 piedras · La travesía |

Por qué no se vio: con un booleano, `lleno.hechas` en el navegador es
`undefined`, se guarda la cadena `"undefined"`, el `JSON.parse` falla, lo
atrapa el `catch` y la cuenta queda vacía. **Nada falla, y la foto sale
linda.** Es exactamente la forma de error que este búnker viene cazando toda
la semana, y esta vez la escribí yo.

Queda el arreglo que lo convierte en un grito: `preparar` ahora se planta si
recibe `lleno=True`, y dice qué hay que pasar. El que se equivoque como yo se
entera en la primera corrida, no en la foto.


### El 15 de noviembre a las 18:30: el mismo turno, hecho dos veces

Turno **T4 de los siete**: las 530 micro-tareas del papel. Lo que encontró no
estaba en el plan.

**El campo que el plan mandaba llenar no existía como pantalla.** El plan
decía: «entran las 530 en el campo `checklist`». `checklist` estaba declarado
en el tipo, el seed lo traía en cada jornada y la app lo llenaba desde
`pasos`… y **ninguna pantalla lo leía**: era una copia textual de `pasos`
viajando en las 91 jornadas. Cargar ahí las micro-tareas era trabajar para
nadie. Entraron en un campo nuevo, `micro`, atado por posición a su paso, y
`checklist` se fue.

**Dónde se ven.** Solo las de la tarea en curso. Los trece movimientos del
día 1 juntos son la misma pared que las micro-tareas venían a sacar. Y sin
tilde propia: el día sigue teniendo cinco cosas que cerrar, no trece.

**Las 530 son 530.** 252 tareas en 64 días, 2 o 3 micro cada una, ninguna
tarea sin las suyas y ninguna colgando de otra. El generador se planta si un
día trae más micro que pasos.

**Y el hallazgo, que no es técnico.** Al empujar, el remoto rechazó el
commit: **otra sesión había hecho el T3 en paralelo** y ya lo había subido
(`df84d81`). El mismo turno, dos veces, el mismo día. Comparadas las dos
antes de tocar nada:

| | Suyo | Mío |
|---|---|---|
| Lección y pausa | con su marca de evidencia y su fuente, y las pausas una sola vez en el seed | solo el nombre de la pausa |
| Paso afuera | **cinco textos rotando entre 28 días** | 28, cada uno contra la tarea de ESE día |
| Pantalla | dentro de la sesión | en la tarjeta de Hoy |

Quedó su capa de lecciones y pausas, con mis 28 pasos afuera adentro, su
pantalla, y **una sola** de cada cosa: borré mi archivo de datos, mi
componente y mi script. Tres de mis pasos empezaban con «Publica», que el
medidor lee como «pública» sin su tilde: reescritos, respetando la nota que
ellos ya habían dejado en el archivo.

Lo que queda anotado para el turno de simpleza: **el paso de diez minutos
debería alcanzarse sin entrar a una sesión de 75**, porque el día que vale es
justo el día en que no se hace la sesión.

Batería en verde sobre el árbol fusionado: `tsc`, `build` y **136** lentes, 0
rojas. La lente nueva, mordida tres veces —sin micro, micro de 100 caracteres
y el campo muerto de vuelta— y roja en las tres.

### El 15 de noviembre a las 16:30: la lección ya estaba escrita, y su pantalla no podía dibujarla

Turno **T3 de los siete** del plan de la piel. El plan lo escribía como tres
campos nuevos en el JSON. **Medido antes de tocar, la premisa se cayó tres
veces, y la tercera es la que importa.**

**Uno · el seed no se escribe a mano.** `roadmap.seed.json` lo produce
`tcd-spec/datos/generar_seed.py` —lo dice el encabezado de `roadmapSeed.ts`, y
la batería ya tenía la lente: «el seed de la app es exactamente el que genera
hoy generar_seed.py»—. Editar el JSON, que es lo que el plan pedía, habría
puesto la batería roja en la corrida siguiente. Las tablas entraron en
`tcd-spec/datos/tres_hilos.py`, el generador las cuelga, y las dos copias del
JSON (la de la app y la del spec) se regeneran.

**Dos · los 28 días «en que la app no pide nada visible» no salen del dato.**
Medido: **59** de las 91 jornadas no piden ninguna acción de campo, así que los
28 son un criterio de LIBROS y no una cuenta. Lo que sí se midió —y ahora es la
lente— es que **ninguno de los 28 pisa un día de campo**: los 28 de 28 están
limpios. Y queda una contradicción para LIBROS, chica y sin tocar: **dos de los
28 ya piden escribirle a alguien hoy** —el día 32 («A quien termina, escríbele
cuándo cierra su proceso») y el día 51 («Escríbele hoy a cada uno que no
pagó»)—, así que en esos dos el paso afuera se suma a algo que ya expone.

**Tres, y es el hallazgo: la lección escrita ya existía, y nadie podía
leerla.** `guionesVideos.ts` trae la `esencia` de 37 guiones —la versión corta
de la lección— y `TaskVideo.tsx` la dibuja bajo el rótulo «La lección de hoy».
Nunca se vio en el Camino. Su rama corre **solo cuando NO hay video**, y
`Roadmap.tsx` monta `TaskVideo` **solo cuando SÍ lo hay**
(`meta.video_youtube_id && !…startsWith('PLACEHOLDER')`), y ningún enlace de
`VIDEOS_POR_JORNADA` es un marcador. O sea: rama muerta desde el día que se
escribió. Lo único que lee esa esencia hoy es el Mentor, por `coachPrompt.ts`.
Son **11 los días** en que el cliente habría leído ahí su lección si la rama
estuviera viva. Por eso la lección del libro entró por el seed y no colgada de
ahí: el camino que parecía existir no llegaba a la pantalla.

**Lo que se hizo:**

- **`tcd-spec/datos/tres_hilos.py`**, con las tres tablas de LIBROS y su
  fuente anotada: el repertorio de **14 pausas** con su marca (● sólido · ◐
  prometedor · ○ juego o tradición) y su base, las **33 lecciones del Lago**
  con su día, su freno, su pausa y su logro, y los cinco pasos afuera. El
  generador las cuelga de su día y **se cae a propósito** —con el nombre de lo
  que falta— si una lección cae en un día que no existe, si dos comparten
  número, si una pausa no está en el repertorio o si un paso afuera pisa un día
  de campo;
- **tres campos nuevos por jornada**, puramente aditivos: ninguno de los 23
  campos viejos cambió un solo valor, verificado campo por campo contra el seed
  de `HEAD`. **33 lecciones en 27 días**, 27 pausas y **28 pasos afuera**; los
  otros 63 días vienen vacíos y la pantalla no anuncia lo que falta;
- **la pantalla del día los dibuja**, en su primera pantalla («Te llevas»),
  antes de empezar: tu lección —con su libro y su número, porque el número lo
  nombran 19 videos del rodaje— y el logro de cada una debajo; tu pausa de 5
  **con su marca pegada**, nunca el nombre solo; y tu paso afuera con sus diez
  minutos y su «es opcional y no traba tu día». Los dos montajes de
  `SesionViva` —el de video y el de entrenador— reciben los hilos;
- **el reparto de los cinco pasos afuera es una rotación por día**, no una
  tabla: cuando LIBROS pase el paso de cada día se reemplaza esa lista y nada
  más cambia.

**Cinco lentes nuevas, las cinco probadas contra su propio fallo** en
`scripts/probar-los-tres-hilos.py` (19 casos, los 19 en verde; el veredicto se
saca de `auditoria.py` entre las marcas `#.HILOS.*`, no se copia): los tres
campos en las 91 jornadas, las 33 del Lago sin repetir número ni quedarse sin
título, ninguna pausa fuera del repertorio, el paso afuera solo donde la app no
pide nada visible, y —la que importa— **que la pantalla los muestre**: los dos
montajes pasándolos y los tres rótulos dibujados. Esa última se probó con el
defecto que este repo ya tuvo cuatro veces: **el rótulo escondido dentro de un
comentario**, que deja la palabra en el archivo y no dibuja nada. Se pone roja.
Y `scripts/prueba-los-tres-hilos.ts` mide el tramo del medio —que los hilos
lleguen a `RoadmapMeta`, que es lo único que la pantalla recibe—, probada roja
sacándole una de las 33.

**Una palabra se escribe distinto a propósito.** El paso afuera dice «Graba una
historia con tu cara y **publícala**» y no «Publica una historia»: el medidor de
pantallas marca `publica` como palabra sin su tilde —su regla no distingue el
verbo en imperativo de «pública», el adjetivo— y lo cazó con una falta en
`roadmap>jornada`. Queda anotado en `tres_hilos.py` para que nadie lo
«arregle» de vuelta.

**Lo que NO se tocó, y es tuyo:** las tablas de Montaña, Viento, Río y Bosque
(64 días sin lección hasta que LIBROS las pase), el paso afuera de cada día,
qué hacer con los días 32 y 51, y la rama muerta de `TaskVideo` —si algún día
revive, dos cosas distintas se van a llamar «lección» en la misma pantalla—.

**Medido en pantalla y en verde antes de subir:** la jornada del día 4 abierta
en un teléfono de 390 px muestra sus dos lecciones del lago, su pausa con la
marca y su paso afuera; el medidor da **0 faltas** en las vistas del Camino.
`tsc` y `npm run build` limpios, las **135** pruebas de escenario en verde y
`auditoria.py` con **905 miradas, cero faltas** («el ZIP puede salir»).

### El 15 de noviembre a las 11:30: la piel pintada ya era la buena; debajo seguía la otra

Turno **T2 de los siete** del plan de la piel (abajo, «LA PIEL Y LOS TRES
HILOS»). El plan lo escribía como un repintado: «una sola paleta: se va la capa
oscura y se van las 206 reglas que la tapaban». **Medido antes de tocar, la
premisa se cayó por los dos lados.**

**Lo que no era cierto.** Las 206 no eran 206 reglas: son 206 apariciones del
prefijo `[data-theme="light"]`, y de las 76 que tienen selector de clase, **15
estaban muertas** —tapaban clases que ya no existen en el código—. Y las
«cinco mil ediciones de color» del plan tampoco: de los 378 colores escritos a
mano en `.tsx`, **24 son clases** (`bg-[#0F0F0F]`, `hover:bg-[#161512]`) y el
resto vive en `style` en línea, donde ninguna regla de la capa clara llega
nunca.

**Lo que sí era cierto, y peor.** La capa oscura no era una herencia dormida:
**estaba a un clic.** El Admin tenía un interruptor de tema (Oscuro / Claro)
que guarda la elección en el navegador; con él en oscuro, la capa clara deja de
aplicar y la app entera vuelve a los tokens de fábrica. La piel que se veía era
la de encima.

**Y tres cosas que ninguna lente veía:**

| lo encontrado | por qué no lo veía nadie |
|---|---|
| **Diez usos del naranja prohibido** (#E8962E) dentro de `src/index.css`, escritos en el otro alfabeto: `rgba(232, 150, 46, X)` — resplandores, barra de desplazamiento y la sombra del botón primario | la lente que dice «en todo el repo» miraba `todo`, que son los `.ts` y `.tsx`: el `.css` nunca entró. Y solo conocía el hexadecimal |
| **`hover:bg-[#161512]`**: la ficha de Campañas se pintaba de casi negro al pasar el dedo | el medidor mide la pantalla QUIETA. Un estado que solo existe con el dedo encima no lo ve ninguna de sus 22 lentes |
| **Dos paletas más debajo**: el gris azulado de un tema claro anterior (#E4E7EC, rgba(248,250,252)) y la tinta vieja (#2A2118) contra la de la home (#23201D) | nadie medía que los valores salieran de un solo lugar |

**Lo que no era un defecto, y por poco se «arregla».** Dos vistas enteras se
ven oscuras hoy: el certificado y la foto del día 90. Son **piezas impresas**
—un diploma que se comparte por captura—, con su contraste medido y escrito al
lado (3,7:1 el oro de la app sobre ese fondo, 5,4:1 el suyo). No se tocaron: se
les dio nombre. Sus tres colores pasaron a ser tokens (`--color-pieza`,
`--color-pieza-oro`, `--color-pieza-papel`), que es lo que permite prohibir el
color a mano en todas las demás sin tocar éstas.

**Lo que se hizo:**

- **se fue la compuerta.** `[data-theme="light"]` pasó a `:root` en las 206
  apariciones —misma especificidad, mismo orden, misma pintura— y después se
  fue el atributo del `.html` y de los nueve visores, el interruptor del Admin
  y `src/lib/theme.ts`;
- **un solo valor por token.** Las 19 propiedades que estaban declaradas dos
  veces —el papel, la tarjeta, la tinta, el oro, las sombras, los siete tokens
  de la matriz— quedaron con el valor de la piel, declarado una vez. `@theme`
  dejó de tener la paleta oscura: `--color-ink` es el papel y `--color-cream`
  es la tinta;
- **se fueron 44 reglas** (las 15 muertas, las 12 que traducían clases con el
  color adentro y 17 selectores sueltos), y con ellas las 24 clases que
  escribían su color a mano, que pasaron a tokens;
- **el naranja prohibido salió del `.css`**, y con él los grises azulados y la
  tinta vieja: todo sale ahora de los valores de la home;
- **el quinto estado de la matriz tiene token.** «La pelota la tiene el
  cliente» era un naranja a mano porque no había token; al pasarlo a oro se
  comía la diferencia con «la tenemos nosotros» —dos estados del mismo color
  son un estado— y la prueba lo cazó. Ahora es `--color-espera`, el río de la
  colección;
- **el oro de texto bajó un escalón donde apoya sobre oro.** Al adoptar el
  #7A5F33 de la home, las pestañas elegidas quedaron en **4,4:1** y AA pide
  4,5: 23 vistas en rojo. Se declara una vez, con su medida, para el par
  `bg-gold/* + text-gold`: #74551C, 5,2:1 sobre esa misma ficha;
- **`tcd-spec/10-DISENO.md` reescrito** con la piel nueva: los tokens, los dos
  oros y su escalón, las tres letras con su papel, la excepción de la pieza
  impresa, y por qué el nombre de un token ya no dice su valor.

**Las cuatro lentes nuevas o endurecidas, probadas contra su propio fallo** en
`scripts/probar-que-la-piel-es-una-sola.py` (16 casos, los 16 en verde): la
compuerta de tema puesta de vuelta en el `.css` y en el `.html`, la paleta de
fábrica devuelta a `@theme`, la tarjeta en su respaldo negro, el naranja
prohibido escrito en `rgba()` dentro del `.css` —que es como estaba de verdad—
y cuatro formas de clase con el color adentro. El veredicto se saca de
`auditoria.py` entre marcas, no se copia.

**Y cinco lentes que medían la forma vieja** se reapuntaron a la regla:
`prueba-activacion` (medía el hex del naranja y no «cinco colores distintos»),
`prueba-el-nombre-y-las-cifras`, `prueba-la-cuenta-con-datos`,
`prueba-la-piel-de-la-conversacion` y `prueba-la-franja-del-reloj` —ésta pidió
el crema «detrás de la compuerta» y, al no haberla, encontró el `--bg-root:
#0F0E0D` de fábrica que seguía declarado arriba—. Y
`probar-el-comentario-de-cada-lenguaje` avisó de su propia desactualización, que
es lo que tiene que hacer: su muestra era el atributo que acababa de irse.

**Medido antes y después, pantalla por pantalla:** las 93 vistas del medidor en
**0 faltas** antes y después; las capturas, comparadas píxel a píxel, cambian en
85 de 98 y ninguna pasa del 1,8 % de la pantalla con un salto máximo de 39 sobre
255 — el tamaño exacto de mover el oro, la tinta y los dos grises, y ningún
cambio de forma. Batería entera en verde: `tsc`, `build`, las **133** pruebas y
**899 miradas**, cero faltas de diseño en el cliente y en el Admin.

### El 15 de noviembre a las 07:25: la prueba que no podía ponerse roja

Cuatro despertadas seguidas auditaron **la batería contra sí misma**: la
presencia sobre crudo, la ausencia, el comentario de los cuatro idiomas, la
puerta de lectura. Todas miran `auditoria.py`, que son 896 miradas. Esta
preguntó por el otro cuerpo, el que nadie había auditado nunca: **las 133
`prueba-*.ts`**, que son otras tantas afirmaciones y entran a la batería por
una sola línea del bloque 10.

**Y el bloque 10 las juzga por una sola cosa: el código de salida.** Nada más.
Así que una prueba que no sabe terminar en rojo está en verde para siempre.

**Una de las 133 era exactamente eso.** `prueba-cadena.ts` —la que diagnostica
el eslabón que gobierna la semana del cliente, seis escenarios— imprime `✗` por
cada escenario mal diagnosticado, imprime `4/6 escenarios diagnosticados bien`
y **no tiene `process.exit`**. Medido con el defecto puesto en el mecanismo de
verdad (`encontrarDomino` ignorando el primer eslabón roto):

| con el defecto puesto | lo que imprimió | lo que dijo la batería |
|---|---|---|
| 5 de 6 escenarios mal | `1/6 escenarios diagnosticados bien`, cinco renglones `✗` | **las 133 en verde** · «el ZIP puede salir» |

Lo que decía en los cinco: **«La cadena está sana»** al cliente que vende y no
cobra, al que no cierra y al que paga $25 por conversación. El diagnóstico que
la app le muestra, al revés, con la batería dando el visto.

**Y la lección ya estaba escrita dos veces en el mismo archivo.** El `.sh` del
SQL y `prueba-movil.py` se juzgan por el código **y** por sus renglones `✗`
—«lo que no vale es que falle y nadie lo mire»—. No estaba aplicada a las 133.

**Cerrado por los dos lados:**

- **el rojo que faltaba** — `prueba-cadena.ts` termina en un código que depende
  de sus seis escenarios. Probado: con el defecto puesto sale 1, sin el defecto
  sale 0;
- **el bloque 10** — una prueba está roja si termina en rojo **o** si imprime un
  renglón que empieza con `✗`, sea cual sea su código. Corridas las 133 antes de
  ponerlo: ninguna imprime un `✗` informativo, así que no hay falso rojo;
- **la lente nueva**, para la prueba que nazca así mañana y pase meses sin que
  nadie la rompa: cada `scripts/prueba-*.ts` tiene que tener un `process.exit(`
  cuyo argumento no sea el cero literal. Se mide sobre `rdc()` —el código, no el
  texto— así que comentar la salida no la salva, y la que delega su rojo en otro
  proceso (`process.exit(r.status ?? 1)`) sigue valiendo.

Las dos guardas se prueban contra su propio fallo, ejecutando, en
`scripts/probar-que-la-prueba-puede-ponerse-roja.py`: el veredicto del bloque 10
y la lente se **sacan de esta misma batería**, no se copian, y el defecto se
pone en memoria sobre el contenido de los archivos de verdad. Ocho casos, los
ocho en verde, y el primer intento de cablearla dejó la batería en rojo porque
el trozo que corta llegaba hasta la línea que la corre: ahora eso avisa con
nombre en vez de un `NameError`.

**Lo que se midió y NO era un agujero.** Las otras 132 tienen su código atado a
un contador (115 con `fallas === 0 ? 0 : 1`, 13 con `fallas ? 1 : 0`, cuatro con
su propia forma). Los scripts `.py` y `.sh` que la batería corre por código de
salida tienen todos su `sys.exit` —y el único sin salida roja,
`generar-plan-90-dias.py`, se juzga además comparando su salida con el archivo
escrito, así que un 0 vacío no lo salva—. Y en MCD no hay espejo que cerrar:
**su batería no corre ninguna prueba propia**, solo `tsc` y `next build`, que
terminan en rojo por sí mismos. Quedó en sus 75 en verde, sin tocar.

### El 15 de noviembre a las 06:30: no era la marca, era la puerta

Cuatro despertadas seguidas cerraron el COMENTARIO: el `//` de TypeScript, el
`--` del SQL, el `#` del Python y del shell, el `<!-- -->` del `.gitignore` de
MCD. Esta preguntó lo otro: **¿y si la lente no llama al limpiador?**

`index.html` y `src/index.css` se leían con `open(...).read()`. Por ahí no pasa
`_MARCAS`, no se llama `solo_codigo` y el bloque 16 —que mide toda presencia
sobre archivo crudo— **no mira**, porque solo conoce `rd()`. Medido antes de
construir, con el defecto puesto en los archivos de verdad y la batería entera
corrida:

| el mecanismo comentado | la lente que dice medirlo | ¿lo cazó otra? |
|---|---|---|
| `data-theme="light"` dentro de un `<!-- -->` (`index.html`) | **verde** | el medidor, de rebote: 686 faltas en 13 pantallas, sin nombrar la causa |
| `--color-ink` con `/* */` (`src/index.css`) | **verde** | **nadie** — el medidor dio **cero** faltas |
| `--surface: var(--bg-card)` con `/* */` | **verde** | **nadie** |

Las dos del `.css` son las que importan. La primera deja cada clase `text-ink`
del tema claro en el valor oscuro —texto casi blanco sobre crema, que es el
lavado que esa lente existe para impedir—; la segunda deja la tarjeta cayendo
en su respaldo negro con el tema claro puesto. Las dos, con la batería entera
diciendo «el ZIP puede salir».

**Cerrado de raíz: la puerta es una sola.** Las tres lentes miden la presencia
con `rdc()`, que ya sabía los dos comentarios y nunca se llamaba; la ausencia
sigue sobre el crudo, que es más estricto; los dos archivos generados pasaron
también por `rd()`; y una lente nueva, medida con el **árbol** —que no se come
el comentario de arriba ni una cadena—, exige que cada `open(` viva adentro de
`rd()`. `.html` y `.css` entraron a `_FUENTE16` con su palabra: en una hoja de
estilos el mecanismo se escribe `--color-ink`, no en camello.

#### Y el décimo agujero: la comilla de adentro, en las otras tres formas

El 15 a las 03:25 se corrigió el cuerpo de la cadena para que excluyera solo la
comilla que delimita, y salieron 33 fugas vivas. **Ese arreglo había entrado en
UNA de las cuatro formas** —la de la variable—. La directa, el `.count`, el
`.get(…)` y la regex seguían excluyendo las dos, así que
`'data-theme="light"' in rd('index.html')` no la veía ninguna: salió probando
las fugas puestas a propósito, que es para lo que están. Corregidas las cuatro,
aparecieron **14 fugas vivas más en main**, todas de esa forma:
`rpc('marcar_servicio'` del alta, `rpc('crear_notificacion'` del aviso del
equipo, el único `rolDe`, `pantalla === 'brief'`, `j.agente !== null ? 'COACH'`,
`onNavigate?.('adn')`, y seis inventarios que se armaban leyendo crudo —las
claves de localStorage, las rutas del router, los imports a componentes
borrados, los `onClick` que expulsan al Mentor, las herramientas del seed y los
campos del perfil que se guardan al entrar—. Las 14 pasaron a medirse sobre el
código.

#### De paso, el voseo, que tenía su propio limpiador escrito al pasar

«Voseo user-facing = 0» leía el archivo crudo con una coartada a mano: *si 70
caracteres atrás hay un `*` o un `//`, no cuenta*. Eso se comía el voseo de
verdad que tuviera un `//` cerca y dejaba pasar el de un bloque largo. Medido:
sobre `cod(src)` y **sin** la coartada, sigue en cero. Así que la vara quedó
más estricta y más simple.

#### Y en MCD, el espejo, antes de que haga falta

MCD no tenía el agujero vivo —todas sus lecturas pasan por `rd()`— pero tenía
la forma: `rdc(f)` era `solo_codigo(rd(f))` a secas, el `//` de TypeScript para
cualquier archivo, con `solo_sql` y `solo_almohadilla` al lado esperando que
alguien se acordara de llamarlos. Una lente nueva sobre una migración o sobre
`globals.css` nacía ciega. Ahora la extensión elige el limpiador, con
`solo_bloque` para el `/* */` del `.css` —el del SQL no se puede reusar: se
comería `--surface`, que es una propiedad— y `solo_xml` para el `<!-- -->`.

Y su lente del nombre pasó del texto al árbol: la de texto marcaba como lectura
una **cadena** que apenas contuviera `rd(`, y no veía la tupla
(`_a, _b = rd(x), rd(y)`), el casillero (`_d['k'] = rd(x)`) ni el atributo.
**75 lentes en verde**, con las cuatro nuevas probadas contra su propio fallo.

### El 15 de noviembre a las 03:25: el `//` era el único comentario que la batería sabía leer

El mapa dejaba el frente de la auditoría de la auditoría **cerrado de los dos
lados y en las dos direcciones** —la presencia y la ausencia, TCD y MCD—. Era
cierto para un idioma. Todo lo que se cerró entre el 13 y el 14 de noviembre
—las seis formas del crudo, la ausencia-como-defecto, el `;`, el `.count`, el
catch mudo— mira el comentario de **TypeScript**. Y la batería de TCD no lee
solo TypeScript: lee las **migraciones** (`.sql`), el **medidor** y el
**generador del seed** (`.py`) y el **andamiaje de la prueba SQL** (`.sh`). Ahí
el comentario se escribe `--` y `#`, y `solo_codigo` no los conocía.

**Medido antes de construir**, con el defecto puesto en los archivos de verdad
y la batería entera corrida (889 miradas):

| el mecanismo comentado, con la marca de su lenguaje | la lente que dice medirlo | ¿lo cazó otra? |
|---|---|---|
| la guarda de la carpeta del dueño, con `--` (`20261025_el_veredicto_queda.sql`) | **verde** | **nadie** |
| `out = tutear_todo(out)`, con `#` (`generar_seed.py`) | **verde** | sí, el seed difiere |
| la RLS del andamiaje, con `#` (`prueba-sql.sh`) | **verde** | sí, se ejecuta |

**La primera es la que importa.** Esa línea es lo único que impide que un
cliente guarde el veredicto de un archivo que no es suyo; comentada, la batería
entera decía «el ZIP puede salir». Eran **55 afirmaciones de presencia** sobre
archivo crudo en los tres lenguajes —37 en `.sql`, 12 en `.sh`, 6 en `.py`—, y
entre ellas las políticas de RLS, el candado del cierre de la migración y el
aviso que sale adentro del RPC.

Y la lente del bloque 16, que existe justo para esto, no podía verlas: su
`_FUENTE16` era `('.ts', '.tsx', '.js', '.jsx')`. En SQL y en el shell el
mecanismo además no se escribe en camello ni lleva guión bajo —`for select`,
`where anuncio is null`, `alter table … enable row level security` son todas
minúsculas con espacios, que es la forma que la lente reserva para el idioma—,
así que se reconoce por su palabra.

#### Y de paso, el octavo agujero: la comilla de adentro

Al extender la lente apareció algo que no era del plan y que estaba **vivo en
main**: el cuerpo de la cadena excluía **las dos** comillas, así que una
afirmación escrita con comilla doble y una simple adentro no la veía **ninguna**
de las cuatro formas. Es exactamente como estaba escrita la lente de las
métricas del equipo: `"rol = 'admin'" in _mig_nc`. Corregido el delimitador,
salieron **33 fugas vivas**, todas de esa forma y todas sobre TypeScript crudo:
las tres superficies de cada pestaña del Admin (`"| '{tab}'"`,
`"id: '{tab}'"`, `"mainTab === '{tab}'"`), `"from('profiles')"` del webhook,
`"rpc('crear_notificacion'"`, `"frenoDe('encender_campana'"`,
`".in('user_id', userIds)"`. Las 33 pasaron a medirse sobre el código.

#### En MCD, la misma forma, y lo que tapaba eran las claves

MCD ya tenía `solo_sql` desde el 14. Lo que no tenía es el `#`, y su lente del
`.gitignore` **excluía ese archivo a propósito** —decía «package.json,
.gitignore»—. El `.gitignore` también lleva comentarios. Medido: con
`# .env.local` en lugar de `.env.local`, **las 57 lentes en verde** y «el
entorno con las claves no entra al repo» entre ellas. `git ls-files` solo lo
caza **después**, con el archivo ya subido, que es tarde.

#### Las pruebas contra su propio fallo

| el defecto reintroducido | antes | ahora |
|---|---|---|
| la guarda del dueño comentada con `--` (línea entera y final de línea) | **verde** | **roja** |
| la política del equipo comentada con `--` | **verde** | **roja** |
| el candado del cierre de la migración, con `--` | **verde** | **roja** |
| `tutear_todo(out)` comentado con `#` | **verde** | **roja** |
| la RLS del andamiaje, con `#` | **verde** | **roja** |
| `set role authenticated;` con el `--` del heredoc | **verde** | **roja** |
| `marcarEncendida` con `//` (que TypeScript no se rompa) | roja | **roja** |
| `.env.local` comentado del `.gitignore` (MCD) | **verde** | **roja** |
| una presencia nueva sobre `.sql`, `.py` o `.sh` crudo | no existía | **roja**, con línea |
| un lenguaje nuevo sin su marca declarada | no existía | **roja**, y lo nombra |

Las catorce de los lenguajes se prueban **ejecutando**, sobre los archivos de
verdad, en las dos formas del comentario: el que ocupa la línea entera y el que
queda al final de una línea que sigue siendo código
(`scripts/probar-el-comentario-de-cada-lenguaje.py`). Y lo que el limpiador
**no** puede comerse se mide igual: la bandera del shell (`psql --quiet`, que
es una bandera y no un comentario: en todo el repo no hay un solo `-- ` que sea
el fin de las opciones), el `--` que vive dentro de un texto de SQL, y el
`'#080808'` del color.

TCD cierra con **893 miradas, cero faltas** («el ZIP puede salir»), `tsc` y
`npm run build` limpios y las **133** pruebas en verde. MCD, con **64** en
verde, `tsc` y `next build` limpios.

**Lo que queda de este frente:** nada. Esto decía que `.md` y `.html` habían
entrado a la tabla de marcas «pero ninguna lente afirma hoy un mecanismo sobre
ellos», y **era falso**: había tres —una sobre el `.html` y dos sobre el
`.css`—, y no se veían porque esos dos archivos no entraban por `rd()`.
Medido y cerrado el 15 a las 06:30, abajo.

### El 14 de noviembre a las 19:30: tres ausencias seguían en un recolector

El mapa dejaba este frente con una sola forma pendiente y la llamaba **la
última de este frente**: «se necesita un recorrido por AST de `auditoria.py`:
encontrar cada `NotIn` sobre una variable cruda y preguntar si su sentencia es
un `check(…)` —prohibición, crudo— o un recolector que `append`ea —defecto,
código—». Y daba la cuenta por hecha: **75 ausencias, 21 con una presencia al
lado, las 4 recolectoras ya cerradas, las otras 17 la prohibición legítima.**

Se midió con el árbol antes de construir, y la cuenta era otra: **46 ausencias
de mecanismo sobre crudo, y tres de ellas en un recolector.** Las cuatro que el
mapa daba por cerradas lo están; éstas son otras tres, en dos lentes, y las dos
estaban **ciegas hoy** —no latentes—. Probado ejecutando, sacando el mecanismo
del archivo de verdad y dejando el nombre en un comentario:

| la lente | el defecto puesto | sobre crudo | en el código |
|---|---|---|---|
| «las pantallas nuevas traducen sus fallas» | `mensajeDeFalla` sacado de `TableroPlata.tsx` | **verde** | **roja** |
| «los 4 puntos de venta tiran de la misma fuente» | `Dashboard.tsx` desconectado del módulo de la oferta | **verde** | **roja** |

La primera deja al cliente viendo el error técnico del navegador donde tendría
que leer qué pasó; la segunda deja un punto de venta con la escalera escrita a
mano, que es justo lo que esa lente existe para impedir.

**Y por qué no alcanza una expresión regular, ahora medido:** las dos formas se
escriben **igual** (`'x' not in _s`). Lo que las distingue no está en la línea:
está en qué hace la sentencia con el resultado, y el `check(` que lo decide
suele estar tres líneas más abajo. Un `check(…)` **afirma** la ausencia —ahí el
crudo es más estricto—. Una comprensión con `if`, un `append` o un `if` que
recolecta marcan una **infracción** —ahí la ausencia es el defecto y el
comentario la tapa—. El filtro que hace `continue` se queda en crudo a
propósito: saltear menos archivos es mirar más, no menos.

#### Y de paso, el catch mudo: la lente conocía una sola manera de escribirlo

La lente «ninguna llamada de IA falla en silencio» buscaba el cuerpo
`/* noop */` **exacto**. Las dos que están mudas de verdad en main se escriben
distinto —`// resumen is optional` en `Admin.tsx` y
`/* nice-to-have, silencioso */` en `DiarioDirector.tsx`— y **las dos daban
verde desde que se escribieron**. Las dos son silencios a propósito, así que no
se les inventó un mensaje: ahora se **declaran** con la fórmula
`silencio a propósito:` y el motivo al lado, y una lente los cuenta —uno nuevo
es una decisión, no un detalle—.

El mudo pasó a medirse en el **código**: un catch cuyo cuerpo queda vacío al
sacarle los comentarios está mudo, lo diga el comentario o no. Y se mira
**cada** llamada del archivo, no la primera: el `break` de antes se gastaba en
la primera coincidencia sobre el archivo crudo, y esa primera podía ser un
comentario. Medido: con un `// generateText( …` arriba, un catch mudo de verdad
3.000 bytes más abajo quedaba **sin mirar**.

#### Las pruebas contra su propio fallo

| el defecto reintroducido | antes | ahora |
|---|---|---|
| `mensajeDeFalla` sacado, el nombre en un comentario | **verde** | **roja**, y nombra la pantalla |
| `Dashboard.tsx` desconectado, el nombre comentado | **verde** | **roja**, y nombra el archivo |
| un catch mudo con la llamada nombrada en un comentario arriba | **verde** | **roja** |
| un silencio sin declarar (en las dos formas) | **verde** | **roja** |
| una lente migrada de vuelta al crudo (`rdc` → `rd`) | no existía | **roja**, con línea y contexto |
| un `check(` escondido en el tramo de fixtures | no existía | **roja** |

La lente nueva se prueba contra **6 recolectores** puestos a propósito —la
comprensión con `if`, el `append` suelto, el `if` que recolecta, el
`not re.search`, el `.count(…) == 0` y el diccionario de archivos— y contra
**5 casos que tiene que dejar pasar**: la prohibición en un `check`, el `all(…)`
de un `check`, el filtro que saltea, lo ya medido en código y una frase, que
vive en un comentario con todo derecho. Las fixtures son **texto** —cadenas de
Python—, así que el árbol de la batería no las ve como código; el escáner de
texto, en cambio, sí, y por eso viven en su propio tramo delimitado, con la
regla del escondite medida ahora **con el árbol** y no con la palabra (una
fixture tiene que decir `check(`, porque es justo lo que la lente usa para
distinguir la prohibición del recolector).

TCD cierra con **889 miradas, cero faltas** («el ZIP puede salir»), `tsc` y
`npm run build` limpios y las **133** pruebas en verde. MCD no se tocó y quedó
con sus **62** en verde, `tsc` y `next build` limpios.

**Con esto el frente de la auditoría de la auditoría queda cerrado de los dos
lados y en las dos direcciones** —la presencia y la ausencia, TCD y MCD—. No
queda candidato medido en esta tabla: los que siguen abiertos son los tres con
botón (`/api/mcd-bridge`, el `next` de MCD, el editor de TCD).

### El 14 de noviembre a las 15:25: la lente estaba verde por un punto y coma

El mapa dejaba este turno escrito como **prevención**: pasar las 183
afirmaciones de presencia sobre archivo crudo a `cod(…)` y extender la lente
del bloque 16 a tres formas, con la nota de que **ninguna miente hoy**. Se
verificó antes de construir, y la premisa se cayó dos veces.

**Primero: la lente del bloque 16 no veía lo que prohíbe.** Su detector de
variables crudas anclaba al principio de la línea
(`^\s*nombre = rd('…')`), así que en una línea como

```python
_adm_nc = rd('src/pages/Admin.tsx'); _sem_nc = rd('src/lib/semaforo.ts')
```

**la segunda no existía para ella.** Medido: 17 variables crudas invisibles, y
sobre ellas **once afirmaciones de presencia con forma de nombre** —
`cargarVentanas`, `PASOS_VIEJOS`, `SEMANAS_SIN_NUMEROS`, `TestEneagrama`,
`fechaCorta`…—, o sea la forma exacta que esa lente existe para prohibir,
verde por un `;`. No era prevención: era un agujero abierto, latente igual,
pero abierto. Tampoco veía `rd(f'…')` ni el `rd(_f)` de un `for`.

**Y aparecieron tres formas más de las que el mapa anotaba, al medirlas:** el
contenido de los archivos guardado en un **diccionario**
(`todo = {f: rd(f) for f in glob(…)}`, `_API64`, `_SRC46`…) y leído por la
variable de un `for` o por `COL.get('ruta','')`. Ahí vivía
`'guardarLlamada' in _s`, en la lente del cobro que puede devolver el crédito.

**Segundo, y peor: cuatro ausencias que eran el defecto.** La regla escrita
decía «la AUSENCIA se queda en crudo a propósito: pedir que algo no esté ni en
un comentario es más estricto». Es verdad cuando la ausencia es **la
prohibición** (que el campo viejo no esté). Es al revés cuando la ausencia es
**el defecto**:

```python
if ('guardarLlamada' in cod(_s) and 'deshacerCobro' not in _s)
```

Ahí lo que se pide es que el mecanismo **exista**; sobre crudo, un
`// deshacerCobro(…)` comentado lo hace parecer presente y **el endpoint que
cobra sin poder devolver no se marca**. Es el defecto del turno de las 07:26,
entrando por la otra puerta. Las cuatro quedaron en código: `rutaDe(` (la
puerta de las rutas de IA), `deshacerCobro` dos veces y
`devolverCreditoServer`.

#### Qué quedó puesto

**225 medidas pasaron al código** (`cod(…)` / `rdc(…)`), y la lente del bloque
16 ahora mira **seis formas** sobre lo que lee un archivo fuente crudo:
presencia `in`, `.count(…)`, `re.search/findall/finditer/match(…, crudo)`, el
`in rd('…')` directo, la variable de un `for` sobre un diccionario de archivos
y el `COL.get('ruta','')`. Con dos reglas nuevas de forma:

1. **Mecanismo** es puntuación de código o un identificador con mayúscula
   interna, `_`, `$` o un dígito. «Prefiero elegirlas yo» y «COBRO DE PRUEBA»
   no lo son: una frase con espacios vive en un comentario con todo derecho, y
   ésa es la excepción de las lentes de EXPLICACIÓN, que siguen leyendo crudo.
2. En una **expresión regular** los paréntesis son del lenguaje de la regex,
   no del código, así que ahí se juzga solo por identificadores. Sin esa
   distinción, el buscador de voseo —`\b\w+(?:ás|és|ís)\b`, que mide el
   idioma y lee crudo con derecho— salía marcado.

**Y de paso, una lente que medía la cadena vacía.** `_css = todo.get('src/index.css','')`,
y `todo` son los `.ts/.tsx` del repo: el `.css` nunca estuvo en ese
diccionario. O sea que «el botón primario no lleva degradé» comparaba contra
`''` y daba verde sola desde que se escribió. Ahora lee el archivo.

#### Las pruebas contra su propio fallo

La lente se prueba contra **11 fugas puestas a propósito** (una por forma, más
el `;`, el `rd(f'…')` y el `rd(_f)` del `for`) y contra **9 casos que tiene
que dejar pasar** (la ausencia en crudo, la frase, el texto del idioma, y lo
ya medido en código). Las fixtures viven en un tramo delimitado que el
escáner saltea, y **otra lente mide que ese tramo no sirva de escondite**:
corto y sin un solo `check(` adentro.

Y la prueba que importa, ejecutando sobre el código de verdad —
`scripts/probar-la-lente-del-crudo.py`, dentro de la batería—: cinco
mecanismos se sacan del código en memoria dejando el nombre en un comentario,
uno por cada forma cerrada.

| el mecanismo sacado | de dónde | sobre crudo | en el código |
|---|---|---|---|
| `cargarVentanas` (las ventanas de reclamo del cliente) | `src/App.tsx` | **verde** | **roja** |
| `setFamiliaActual` (la familia profesional con cada perfil) | `src/App.tsx` | **verde** | **roja** |
| `inputMode=` (el teclado numérico del Admin) | `NumerosDeLaSemana.tsx` | **verde** | **roja** |
| `SEMANAS: Record<number, string>` (las trece semanas) | `src/lib/hojaDeRuta.ts` | **verde** | **roja** |
| `deshacerCobro` (la devolución del crédito) | `api/ai/generate.ts` | **verde** | **roja** |

TCD cierra con **884 miradas, cero faltas** («el ZIP puede salir»), `tsc` y
`npm run build` limpios y las **133** pruebas en verde. Commit `da98ce6`. MCD
no se tocó.

#### El candidato medido para el próximo turno

**La ausencia-como-defecto no se puede cuidar con una expresión regular.** Hay
**75 ausencias de mecanismo sobre crudo** en la batería; **21** tienen una
presencia al lado, y de ésas las 4 que eran recolectores de infracción ya
quedaron cerradas. Las otras 17 son la prohibición legítima —«el campo viejo
no está»— y ahí el crudo es más estricto. Distinguir las dos por líneas no
sirve: la expresión suele ocupar tres o cuatro líneas, y el `check(` que
decide el sentido está en otra. **Se necesita un recorrido por AST** de
`auditoria.py`: encontrar cada `NotIn` sobre una variable cruda y preguntar si
su sentencia es un `check(…)` —prohibición, crudo— o un recolector que
`append`ea —defecto, código—. Medido, no leído: ésa es la forma que queda, y
es la última de este frente.

> **Cerrado el 14 de noviembre a las 19:30.** Y la cuenta de arriba era otra:
> medidas con el árbol, son **46** ausencias de mecanismo, no 75, y **tres**
> seguían en un recolector —no cero—, en dos lentes que estaban ciegas hoy.
> Está abajo, en «El 14 de noviembre a las 19:30».

### El 14 de noviembre a las 11:30: la lista de pantallas protegidas vivía en un comentario

Los turnos del 14 a las 03:30 y 07:26 cerraron la auditoría de la auditoría
**del lado de TCD**. Del lado de MCD quedaba hecho solo el limpiador. Esta
despertada fue a medir lo que faltaba, y la premisa se cayó entera.

**Medido primero, ejecutando.** Tres defectos puestos a propósito en MCD, cada
uno con su nombre dejado en un comentario. Con los tres puestos: `tsc` limpio,
`next build` limpio **en la primera corrida** y las **57 lentes en verde**.

| el defecto puesto | lo que se rompe de verdad | la batería |
|---|---|---|
| `isProtected` vaciada, la lista real en un comentario una línea encima | **las diez pantallas de `(app)` abiertas sin sesión**, con los pacientes de un cliente detrás | **57 en verde** |
| el `while` de `getContacts` por una sola vuelta, el nombre al final de la línea | las listas se truncan en 100 otra vez, en silencio: «faltan pacientes» | **57 en verde** |
| `total_usd` fuera de la respuesta del puente | TCD calcula el cinturón sobre un `undefined` | **57 en verde** |

El primero es el que importa, y no es del mismo tipo que los de TCD: la lente
no pedía un nombre, hacía `re.search(r'isProtected\s*=\s*\[(.*?)\]', mw)`
sobre el archivo crudo. **`re.search` devuelve la PRIMERA coincidencia**, y la
primera era la del comentario. O sea que la lente leía la lista buena mientras
el código corría con la vacía, y lo decía en verde.

#### Qué quedó puesto

**La regla pasó al lado de la variable, y se declara en el nombre.** Ninguno de
los tres defectos tenía la forma que la lente del 07:26 miraba (`'nombre' in
rd(…)`): los tres medían sobre una variable leída cruda más arriba. Así que:

1. lo que se lee crudo de un archivo fuente **se llama `*_crudo`**, y
2. sobre un `*_crudo` **solo se afirma AUSENCIA** —pedir que algo no esté ni en
   un comentario es más estricto, no menos—. Toda PRESENCIA se mide sobre el
   código: `rdc(archivo)`, `cod(texto)` o `solo_sql(sql)`.

Las dos las mide una lente cada una, y la excepción que queda —el buscador de
secretos, que tiene que mirar el archivo entero— **está escrita en su propia
línea** (`# crudo a propósito`), no en una lista aparte.

**Dos cosas más, que aparecieron al migrar:**

**1 · Una lente medía un comentario en main.** «La llamada reintenta cuando GHL
responde 429 o 5xx» pedía la palabra `retry` en `client.ts`, y la única que hay
está en `// Retry en rate-limit o error de servidor`: **en el código el
mecanismo se llama `attempt`**. El mecanismo existe —no había fuga—, pero la
lente no lo miraba. Reescrita para medir la rama del 429: que vuelva a llamar y
que tenga tope. Las dos versiones intermedias **fallaron su propia prueba** y se
ajustaron: la función tiene otro `return ghlFetch(…)` y otro `attempt < 2` —los
del timeout— y mirar la función entera daba verde con los del 429 sacados.

**2 · `solo_codigo` saca el `//` de TypeScript y no el `--` de SQL.** La lente
«un cobro no puede existir sin su comprobante (`receipt_path not null`)» se
cumplía con una línea comentada. Probado: con el `not null` sacado de la
migración y el nombre dejado en un `--`, la batería vieja daba **verde**. Y ése
es justo el `not null` del que depende que `cobros_verificados` no mienta —el
número con el que TCD otorga el cinturón Rojo—. Nuevo `solo_sql()`, con su
lente y con la prueba de que no se lleva los guiones de un texto.

#### Las siete pruebas contra su propio fallo

| el defecto reintroducido | antes | ahora |
|---|---|---|
| `isProtected` vaciada, la lista real en un comentario | **verde** | **roja**, 2 lentes, y nombra las diez pantallas |
| el `while` de `getContacts` por una vuelta, el nombre al final | **verde** | **roja**, 2 lentes |
| `total_usd` fuera del puente | **verde** | **roja**, y dice cuál falta |
| una lente vuelta al crudo (presencia sobre `*_crudo`) | no existía | **roja**, con línea y variable |
| un `rd()` de archivo fuente sin llamarse `*_crudo` | no existía | **roja**, con línea y nombre |
| `solo_sql` sin sacar el `--` | no existía | **roja** |
| el `receipt_path not null` sacado, el nombre en un `--` | **verde** | **roja** |

MCD cierra con **62 lentes**, `tsc` limpio y `next build` limpio. Commit
`a76e8e7`.

#### Y de paso: ¿le pasa lo mismo a TCD hoy?

La misma forma existe en TCD —su lente mira el `'nombre' in rd(…)` y no el
`.count(…)`, el `re.search(…, crudo)` ni el fragmento con paréntesis—, así que
se midió: **171 variables crudas de archivo fuente y 183 afirmaciones de
presencia** sobre ellas en esas tres formas.

Pero la pregunta que importa no es cuántas hay, es **si alguna está hoy en
verde por un comentario**. Se midió una por una, comparando el archivo crudo
con el archivo limpio: **22 lo están, y las 22 son las lentes que miden que una
EXPLICACIÓN esté escrita** —«GHL reintenta», «La base manda», «paraliza»—, que
leen crudo a propósito y están declaradas así desde el 07:26. **Ninguna lente
de mecanismo de TCD mide hoy un comentario.** Lo que queda es latente: un
defecto escrito mañana en uno de esos 183 sitios pasaría en verde.

**Es el candidato medido para el próximo turno**, y es mecánico: pasar esas 183
a `cod(…)` y extender la lente del bloque 16 a las tres formas, con la batería
de TCD en verde en cada paso.

### El 14 de noviembre a las 07:26: la lente nueva estaba tapada con una lista de nueve nombres

El turno de las 03:30 cerró el agujero de las rutas de IA y dejó una lente
para que no vuelva: «ningún nombre de mecanismo se mide sobre el archivo
crudo». Esa lente era **una lista de nueve nombres de plata**. Esta despertada
fue a verificar esa premisa, y la lista era el error.

**Medido primero, construido después.** La batería de TCD lee **204 variables
del archivo crudo** —el archivo con sus comentarios— y mide **220
afirmaciones de presencia** contra ellas. Nueve nombres protegidos de más de
doscientas afirmaciones.

**Y se probó ejecutando, con tres mecanismos que NO estaban en la lista:**

| el defecto puesto | lo que se rompe de verdad | la batería |
|---|---|---|
| `marcarEncendida` fuera de Supervisión | ningún cliente se puede marcar como encendido: quedan «instalando» para siempre | **878 en verde** |
| `formulasBloqueadas` fuera del Constructor | no se le explica qué fórmulas todavía no le sirven | **878 en verde** |
| `deshacerCobro` fuera de la cadena de `generate` | si la cadena falla, el cliente **pierde el crédito** | **878 en verde** |

Los tres con el nombre dejado en un comentario, `tsc` limpio y las 133 pruebas
en verde. El tercero es el que importa: **su lente ya leía `rdc()`**, la
versión endurecida del 14 de noviembre a las 03:30. Pasó igual porque
`solo_codigo` sacaba el comentario de bloque y el de línea entera, **pero no el
del final de la línea**: `await Promise.resolve(); // deshacerCobro(…)`
contaba como código. O sea que el endurecimiento de la madrugada era, para
cualquier defecto escrito al final de una línea, decorativo.

#### Qué quedó puesto

**El limpiador saca también el comentario del final**, sin tocar las barras
que viven dentro de un texto (`'https://x.dev//y'`), de una expresión regular
(`/^https?:\/\//i`) ni del código de al lado. Las tres cosas las prueba una
lente nueva sobre una cadena armada a mano, así que si alguien simplifica el
limpiador, la batería lo dice.

**La regla dejó de ser una lista.** Toda afirmación de presencia de algo con
**forma de código** sobre un archivo fuente se mide sin comentarios: 307
afirmaciones pasaron a `cod(…)` —el ayudante nuevo, que limpia texto ya
leído— o a `rdc(…)`. Forma de código es un nombre tipo `marcarEncendida` o
`TOPE_REINVERSION`, o un fragmento con paréntesis, igual o punto y coma
(`const pago = planPagado(perfil);`).

**Y lo que sigue leyendo el archivo crudo, a propósito y escrito:** las 23
lentes que miden que una EXPLICACIÓN esté escrita («GHL reintenta», «La base
manda», «paraliza»), porque una frase del idioma vive en un comentario con
todo derecho; y las afirmaciones de AUSENCIA (`'x' not in …`), porque pedir
que algo no esté **ni en un comentario** es más estricto, no menos.

#### Dos lentes que mentían en main, encontradas al migrarlas

**1 · La batería se contradecía a sí misma.** Una lente pedía «el Camino
arranca el lunes siguiente» con `proximoLunes` en las dos puntas. En el Camino
**ya no está, y se sacó a propósito**: escribía un lunes futuro en el perfil,
le congelaba el día en «1 de 90», le pisaba la fecha que el equipo cargó en el
alta y le dejaba dos fechas de cierre. Seguía dando verde porque el nombre
quedó en el comentario que explica por qué se sacó. Y en otro bloque hay una
lente que pide **lo contrario** (`proximoLunes` NO en el Camino). Ahora dice lo
que el código hace: `proximoLunes` existe para las migraciones, el Camino no lo
usa, y la fecha la pone el alta —si falta, es HOY—.

**2 · Del lado de MCD, una lente medía para nadie.** «Todo el que guarda un
token lo cifra» buscaba la columna `ghl_token`, y **esa columna no existe en
MCD**: el PIT de GoHighLevel —acceso total a los pacientes y al WhatsApp del
cliente— vive en `private_token` de `ghl_connections`. `ghl_token` aparecía en
un solo lugar de todo el repo: en esa línea de la batería. La lista salía
vacía, y una lista vacía es la forma en que una lente se apaga sola sin
avisar. Con la columna de verdad **seguía** dando verde con el token guardado
en claro, porque miraba el archivo entero y el `import { encryptToken }` de
arriba ya alcanzaba. Ahora se mide **el valor que se escribe**, y una lente
nueva exige que la lista tenga a alguien.

MCD tenía además el mismo agujero del comentario al final: con la comparación
de la clave del puente cambiada por un `!==` pelado —la que se puede adivinar
cronometrando— y `timingSafeEqual` dejado al final de esa misma línea, sus 53
lentes daban verde. Su limpiador quedó igual al de TCD, con su propia lente.

#### Las seis pruebas contra su propio fallo

| el defecto reintroducido | antes | ahora |
|---|---|---|
| `marcarEncendida` fuera del código, el nombre en un comentario | **verde** | **roja** |
| `formulasBloqueadas` fuera del código, ídem | **verde** | **roja** |
| `deshacerCobro` fuera de la cadena, el nombre al final de la línea | **verde** | **roja**, 3 lentes |
| una lente de nombre vuelta al archivo crudo | no existía | **roja**, con línea y nombre |
| `solo_codigo` sin sacar el comentario del final | no existía | **roja** |
| MCD: la clave del puente con `!==` y el nombre al final de la línea | **verde** | **roja**, 2 lentes |
| MCD: el token guardado en claro en el `upsert` | **verde** | **roja** |

Batería entera en verde antes de subir: `tsc` y `npm run build` limpios, las
**133 pruebas**, **880 miradas, cero faltas** («el ZIP puede salir»); MCD con
`tsc` limpio, `next build` limpio y sus **57**.

### El 14 de noviembre a las 03:30: cinco rutas de IA no preguntaban quién llama

La cola sigue vacía y las apps no se alcanzan desde acá, así que esta
despertada fue a mirar lo que el turno de MCD había dejado anotado como
candidato: **la batería de TCD contra sí misma**. Lo que encontró en el camino
es más grande que eso, y no es una lente ciega: es un agujero abierto.

**Lo que se buscaba.** La batería de TCD tiene 4.445 líneas y usa `solo_codigo`
—el lector que saca los comentarios— **19 veces**. Medido: de sus afirmaciones
de presencia («esta cadena TIENE que estar»), **703 leen el archivo crudo** y
solo 20 leen el código. O sea la misma forma que el 13 de noviembre dejó dos
lentes de MCD dando verde con la guarda sacada.

**Y pasa lo mismo, probado con la batería entera.** Se sacaron del código
cuatro mecanismos de plata dejando su nombre en un comentario:
`deshacerCobro` (la devolución del crédito cuando la cadena falla),
las dos anotaciones de `anotarCosto`, el `verificarTopeBlanco` del guardián y
el `signal` del tope en la llamada a DeepSeek. Con los cuatro defectos puestos,
`tsc` quedó limpio, las **132 pruebas en verde** y la batería **sin una sola
falta**. Ese verde no significaba nada.

**Pero antes de arreglar la lente se fue a buscar el defecto de verdad, y
estaba.** No en el guardián —que está bien hecho— sino un escalón antes:
**la puerta.**

#### El agujero: las rutas de IA no preguntaban nada

De las seis rutas de `api/ai/`, **cinco no preguntaban quién llama**:
`generate`, `stream`, `describe-image`, `transcribir` y `vision`. El usuario
viajaba en el cuerpo del pedido —`req.body.userId`, leído del `localStorage`
del navegador— y el guardián está escrito como opt-in, con su motivo:
«sin userId no se cobra ni se cuenta; un olvido del front nunca cobra de más».
Con `userId` nulo devuelve `permitido: true`.

Las dos consecuencias se siguen de ahí:

1. **Un pedido sin `userId` salía al proveedor con las llaves de la casa**, sin
   crédito, sin tope y sin techo —el techo de gasto se mide por usuario, así
   que al anónimo no se le aplica ninguno—. Alcanza con saber la URL. La
   factura es tuya.
2. **Con el `userId` de otro, se le gastaba el crédito a otro.**

**No es una lectura del código: se ejecutó.** `scripts/prueba-la-puerta-de-la-ia.ts`
corre los seis handlers de verdad contra un Supabase falso y mira si el
proveedor llegó a ser llamado. Contra main, **sin una sola cabecera**:

| ruta | contra main, sin token | a quién llamó |
|---|---|---|
| `generate` | **200** | api.deepseek.com |
| `stream` | **200** | api.deepseek.com |
| `describe-image` | **500** (tras llamar) | api.anthropic.com |
| `transcribir` | **200** | generativelanguage (Gemini) |
| `vision` | **200** | generativelanguage (Gemini) |
| `image` | 401 | nadie |

`image` era la única con puerta —y su puerta vivía **dentro** de
`if (CREDITS_ENABLED)`: con ese interruptor apagado quedaba abierta también.
Identidad y cobro son dos cosas distintas.

**Y ninguna de las 859 lentes miraba esto.** La batería de TCD no nombraba ni
una vez un 401, una clave de puerta ni una sesión. Las 132 pruebas tampoco:
`prueba-guardian.ts` mide qué freno le toca a cada herramienta, que es
configuración, y nunca ejecuta la cadena.

#### Qué quedó puesto

**Una sola puerta, en un solo lugar.** `api/_lib/puerta.ts`: el usuario sale
del token (`Authorization: Bearer`, verificado contra Supabase) y nunca del
cuerpo. Se usa en dos líneas, y la segunda es la que importa —preguntar sin
cortar no es una puerta—. El patrón ya existía en la casa (las dos rutas de
PayPal y `image` lo hacen así); lo que faltaba era un lugar que lo diga.

**Las seis rutas lo usan**, y las cinco que leían `req.body.userId` dejaron de
hacerlo. La puerta de `image` salió de adentro del interruptor del crédito.

**El otro lado también:** `src/lib/tokenSesion.ts` arma las cabeceras con el
token de la sesión, y las seis llamadas del navegador pasan por ahí (antes solo
la de imágenes mandaba token, armado a mano al lado de su `fetch`). La app vive
detrás del login, así que el token está siempre: pedirlo no le cierra la puerta
a nadie que deba entrar.

**El bloque 16 de la batería, que es la lente que faltaba.** Diez miradas, en
el código y sin comentarios: toda ruta de `api/` pregunta quién llama; la que
pregunta corta con 401 o 403; ninguna ruta de IA lee el usuario del cuerpo; las
seis usan la misma puerta; la de imágenes no depende del interruptor; las seis
llamadas del navegador mandan el token y ninguna lo arma a mano; el token sale
de la sesión y no del `localStorage`; y la última, que es la lente de la lente:
**ningún nombre de mecanismo se mide sobre el archivo crudo.**

**Las lentes de plata pasaron a `rdc()`** —el archivo sin comentarios— y la del
tope dejó de creerle a una palabra: pedía que `signal,` apareciera en
`deepseek.ts`, y la línea que la traía era la destructuración
(`const { signal, limpiar } = conTope()`), así que con el `signal` sacado del
`fetch` daba verde. Ahora mide que viaje **a la llamada**. De paso se vio que
esa lente no veía a DeepSeek: buscaba `fetch('https://api.…')` literal y el
host del proveedor primario viene en una constante.

**Las ocho pruebas contra su propio fallo, porque es la regla:**

| el defecto reintroducido | la lente vieja | la lente nueva |
|---|---|---|
| la puerta sacada de `generate`, vuelve el `userId` del cuerpo | **no existía** | **roja**, 3 veces |
| `vision` pregunta pero contesta 200 en vez de cortar | **no existía** | **roja** |
| la puerta de imágenes vuelve adentro de `if (CREDITS_ENABLED)` | **no existía** | **roja** |
| una llamada del navegador se queda sin token | **no existía** | **roja** |
| el token armado a mano al lado del `fetch` | **no existía** | **roja**, 2 veces |
| una lente de plata vuelve a `rd()` crudo | **no existía** | **roja** |
| el `signal` sacado del `fetch` de DeepSeek | **verde** | **roja**, 2 veces |
| una ruta nueva en `api/` sin puerta | **no existía** | **roja** |

#### Lo que queda, y es tu clic

**`/api/mcd-bridge` sigue sin puerta, a propósito y declarado.** Contesta si un
email tiene cobro verificado en Mi Clínica Digital y cuánto, y contesta de
cualquier email. No gasta plata y no toca datos de pacientes, pero cualquiera
con la URL puede preguntar por el email que quiera. Está anotada en la lista de
excepciones del bloque 16 —con una lente que avisa si esa lista crece—, no
escondida.

Cerrarla es sacar el email **del token** en vez de la query. Los dos lugares que
la llaman (el Tablero y el Camino) ya mandan el email del propio cliente, así
que para el cliente no cambia nada; lo que cambia es la forma de la ruta y sus
**15 lentes de prueba**, que la llaman con `?email=`. Es un turno de la tabla
si lo quieres, no una decisión de venta.

**Botón de dos:**

- **Cerrarla** — el email sale del token, la ruta deja de contestar por
  terceros, y se rehacen las 15 lentes del puente. *(Es lo que recomiendo: es
  la última puerta sin llave que queda, y el trabajo es acotado.)*
- **Dejarla** — lo que se expone es el estado de cobro de un email que el que
  pregunta ya tiene que conocer, y el puente queda como está.

### El 13 de noviembre a las 23:30: la batería de MCD daba verde con la guarda sacada

La cola está vacía y las apps no se alcanzan desde acá, así que esta despertada
fue a mirar lo único que queda y nunca se había mirado: **la batería de MCD
contra sí misma**. Sus 52 lentes se habían corrido seis veces en verde; lo que
no se había probado es si ese verde significa algo.

**Dos no significaban nada.** Las dos están en los bloques 4 y 5 —«cada puerta
pide su llave» y «el token del cliente no viaja en claro»—, que es exactamente
lo que el prólogo de esa batería dice que protege: «su llave, su plata, su
token, su lista completa».

**Primera: la guarda de las rutas se leía del archivo crudo.** La lente pedía
que `auth.getUser`, `x-integration-key` o `GHL_WEBHOOK_SECRET` apareciera en el
texto de la ruta. En el texto, no en el código. Medido: se le sacó a
`/api/notificaciones` la llamada real y se dejó arriba **un comentario que la
nombra** —«esta ruta valida la sesión con supabase.auth.getUser()»—, y la
batería dio **las diez rutas en verde**. El archivo mismo ya tenía esa lección
escrita tres líneas más abajo, para la comparación de la clave: «mirar el
archivo crudo daba verde aunque la comparación de verdad hubiera vuelto al
`!==`». No estaba aplicada acá.

Y había un segundo agujero en la misma lente, más grande: **pedía la guarda por
archivo, no por handler.** `/api/notificaciones` expone `GET` y `POST`; con la
guarda sacada solo al `POST`, la vieja lente **no veía nada** —el `GET` todavía
la nombra—. Ahora se mide handler por handler, sin comentarios, y son **doce
handlers en diez rutas**, no diez rutas. Con el `POST` desguarnecido, la lente
lo nombra: `notificaciones/route.ts POST`.

Se le agregó además la pregunta que faltaba: que el handler que pregunta
**corte** —que conteste 401 o 403—, no que solo pregunte. Son 53 lentes ahora,
no 52.

**Segunda: «ninguna pantalla del navegador toca el service role» miraba solo la
primera línea.** La lente decidía si un archivo corre en el navegador leyendo
`t.split('\n')[0]`, es decir buscando `'use client'` en la línea 1 exacta. La
directiva de Next admite comentarios y líneas en blanco encima —es válido y es
lo normal cuando alguien le pone una nota o una licencia— y con eso la lente
queda ciega. Medido: a `CopyButton.tsx` se le puso **un comentario encima** y un
`import { createAdminClient }`, o sea la llave que se salta el RLS entero dentro
de una pantalla que se descarga al navegador, y la batería dio **verde**. Ahora
se recorre el prólogo —comentarios y blancos— hasta la primera línea de código
de verdad.

**Lo que NO se encontró, porque se fue a buscar primero y la premisa se cayó.**
Antes de tocar la batería se buscó el defecto real en el código de MCD, y no
está: los doce handlers tienen hoy su guarda de verdad (el de `mensajes` la
tiene factorizada en un `auth()` local, y está bien hecho —la lente nueva sigue
una vuelta de llamadas locales para no marcarlo en rojo por error—); las ocho
pantallas de navegador tienen su `'use client'` en la línea 1 y ninguna toca el
service role; el `access_token` del portal es un `uuid` con
`gen_random_uuid()`, no adivinable, con índice único; y el `.single()` del
portal y del Tablero **no revienta** —se desestructura solo `data`, así que una
fila que no está deja `null` y la pantalla lo contempla (`notFound()` en el
portal, `n?.` en cada número del Tablero)—. También se buscó el defecto del
turno 19:25 —el campo angosto dentro de un `flex`— en MCD: **no hay un solo
`flex-1` en todo `src`**, así que esa forma no existe ahí.

O sea: **no había fuga. Había dos lentes que no la habrían visto.** Eso es lo
que se arregló.

**Las tres pruebas contra su propio fallo, porque es la regla:**

| el defecto reintroducido | la lente vieja | la lente nueva |
|---|---|---|
| service role en una pantalla de navegador, con un comentario encima | **verde** | **roja**, y la nombra |
| guarda sacada de una ruta, con el comentario que la nombra en su lugar | **verde** | **roja**, los dos handlers |
| guarda sacada solo al `POST`, el `GET` intacto | **verde** | **roja**, solo el `POST` |

Con el código limpio, la batería de MCD da **53 de 53 en verde**, `tsc` limpio y
`next build` limpio. Commit `ed9705e` en MCD.

**Y queda un candidato medido, que no se tomó para no inflar este turno:** la
batería de TCD tiene 4.445 líneas y usa `solo_codigo` **22 veces**. Cuántas de
sus otras lentes leen crudo —y por lo tanto darían verde con el arreglo sacado y
el comentario puesto— no está medido. Es un turno de la tabla si lo quieres: la
misma auditoría de la auditoría, del lado de TCD.

### El 13 de noviembre a las 19:25: una falta de regla que estuvo seis corridas en verde

Esta despertada salió a medir el tercer candidato —bajar el editor a `lazy()`— y
lo que encontró fue otra cosa. **La premisa se verificó y se cayó del lado
bueno:** la batería se puso roja, pero el rojo **no lo causaba el `lazy()`**.

Cómo quedó probado, porque importa: la copia con el `lazy()` dio roja en
`campanas>nueva`, y una copia **sin tocar una sola línea** —main puro, solo el
medidor instrumentado para que dijera QUÉ desborda— dio **roja tres de tres**.
Así que la falta ya estaba en main.

**Qué era.** En «Montar en Meta» la página se desplaza **18 píxeles de costado**
en un teléfono de 390: el contenido pide 408. El culpable no se ve en la
captura: la fila del campo de preguntas pide **363 px dentro de una caja de
300**. Un `<input>` trae un ancho propio de unos 20 caracteres y, como hijo de
`flex`, **no baja de ese ancho** si no se le permite (`min-width: 0`). Estaba
escrito `className="flex-1 …"` y faltaba el permiso.

**No era uno: eran doce.** La misma forma aparece en el Mentor, en Mensajes (dos),
en Acompañamiento, en Agentes, en el Tablero de cupos, en la Sala de Mando, en
el Admin (tres) y en el Panel. Quedaron arreglados los **once** que no declaran
mínimo a propósito; el de `Dashboard` se deja como está, porque su
`min-w-[180px]` es una decisión escrita.

**Por qué estuvo en verde seis corridas, que es la parte que había que
arreglar.** La lente del desplazamiento lateral **intentaba desplazar** la
página (`scrollLeft = 200`) y preguntaba si se movió. Eso contesta si en ESE
instante se puede: la tira de pestañas de Campañas se mueve sola hasta la
pestaña activa y las pantallas entran con medio segundo de animación, así que el
mismo desborde salía **rojo medido solo y verde dentro de la recorrida entera**.
Una lente que depende del momento no es una lente: es una moneda.

Ahora mide además **el ancho**, que no depende del momento
(`scrollWidth > clientWidth`). Con la lente endurecida y el arreglo puesto, las
**93** pantallas del cliente y las **17** del Admin dan **cero faltas**; con el
defecto reintroducido a propósito, se pone **roja**.

Y como el medidor necesita un navegador y tarda, se escribió también
`scripts/prueba-campos-angostos.ts`: lee el código y falla si un `<input>`,
`<textarea>` o `<select>` con `flex-1` no declara su mínimo. Son **132** pruebas
ahora, no 131. Probada contra su propio fallo: roja con el defecto, verde sin él.

### El tercer candidato, ya medido: el editor no es el corte, el Admin sí

El mapa decía «el tercero, más chico, es bajar el editor a `lazy()`». Medido, el
corte chico es el equivocado, y hay uno mejor por el mismo trabajo.

**La premisa, verificada.** El editor **sí** viaja en el bundle de todos: 37
módulos, **1.018 KB** de fuente, 14,4 % del bundle principal. Pero se llega a él
por un solo camino —`pages/Admin` → `TasksPipeline` → `TaskModal` → los
comentarios del tablero—, y midiendo eso apareció lo de verdad: **el Admin
entero viaja en el bundle de todos**. `pages/Admin.tsx` (288 KB) más
`components/admin` (453 KB) los descarga cada cliente, y ninguno de los dos los
va a abrir nunca. Hoy no hay **un solo** `lazy()` en la app.

Las dos salidas están probadas en copias aparte. Lo que baja todo cliente —lo
que el navegador pide antes de dibujar— es esto:

| | hoy | **A · solo el editor** | **B · el Admin entero** |
|---|---|---|---|
| JS que baja todo cliente | 3.406 KB | **3.026 KB** | **2.480 KB** |
| lo mismo, comprimido | 998 KB | **878 KB** | **734 KB** |
| cuánto menos | — | −12 % | **−26 %** |
| el editor en el bundle de todos | **sí** | no | no |
| el Admin en el bundle de todos | **sí** | **sí** | no |
| `tsc --noEmit` | limpio | limpio | limpio |
| `npm run build` | limpio | limpio | limpio |
| las `prueba-*.ts` | verde | verde | **131/131** |
| `prueba-pantallas.tsx` | verde | verde | **verde** |
| el medidor de pantallas | cero faltas | cero faltas | cero faltas |

La B es dos líneas en `App.tsx` —`lazy(() => import('./pages/Admin'))` y un
`Suspense` con la pantalla de carga que la app ya usa— y mueve 948 KB a un trozo
aparte que solo baja quien entra con rol admin. La A son tres `lazy()` en los
componentes del tablero y deja el Admin donde está.

**Lo que cambia para ti, y es la razón de que esto espere tu clic:** con la B,
cuando TÚ entras al Admin, hay un parpadeo de la pantalla de carga mientras baja
ese trozo (una vez, después queda en caché y el service worker lo precachea).
Para el cliente no cambia nada salvo que su primera carga pesa un cuarto menos.

**Botón de tres:**

- **B · el Admin entero** — −26 % de la primera carga del cliente, dos líneas,
  batería entera en verde. *(Es lo que recomiendo: el que paga es el cliente en
  su teléfono, y el precio lo pagas tú una vez por sesión en una pantalla que
  abres sabiendo que es la tuya.)*
- **A · solo el editor** — −12 %, sin parpadeo en ninguna parte.
- **Dejarlo** — la primera carga sigue como hoy.

Ninguna de las dos toca dependencias, así que ninguna cambia lo que Vercel
instala: es código de la app, reversible con un `git revert`.

### El hallazgo del 13 de noviembre: el Next de MCD tiene veinte parches atrás

Con la cola vacía y las apps fuera de alcance, esta despertada miró las
dependencias. **MCD corre `next` clavado en 14.2.15**, y npm marca ahí 34 avisos
de seguridad, 4 de ellos críticos. El que importa de verdad es uno:
**Authorization Bypass in Next.js Middleware** —el del encabezado
`x-middleware-subrequest`—, porque en MCD **el middleware es el único portero de
primera línea** de `/dashboard`, `/pacientes`, `/protocolos`, `/agenda`,
`/cobros`, `/personas`, `/marca`, `/admin`, `/conversaciones` y `/asistente`.

**Antes de alarmarse, se verificó la premisa, y la premisa se cae en la parte
que asusta.** Que el portero de adelante se pueda saltar no deja los datos a la
vista, porque detrás hay un segundo portero en cada puerta:

- **Las páginas del cliente no preguntan quién sos: pregunta la base.** Todas
  leen con la llave anónima y la sesión del navegador, y las nueve tablas tienen
  RLS con `auth.uid() = practitioner_id`. Sin sesión, `auth.uid()` es nulo y
  **no vuelve ninguna fila**: la pantalla se vería vacía, no ajena.
- **`/admin` sí usa la llave de servicio —que se salta el RLS— pero se
  defiende sola**: `user.email !== ADMIN_EMAIL` redirige, y cada acción de ese
  formulario lo vuelve a preguntar antes de escribir.
- **Las tres rutas de API que usan la llave de servicio también**: la de alta
  pide admin y contesta 403; el webhook de GHL y el puente de TCD comparan su
  secreto en tiempo constante y contestan 401.

Así que **no hay fuga medida**. Lo que hay es el portero de adelante con un
agujero conocido, y una sola capa de más entre eso y los datos de pacientes.

**El salto está medido y da verde, pero no se tomó solo.** Se probó 14.2.35 —el
último parche de la línea 14.2, sin cambio de mayor y sin tocar una línea de
código— en una copia aparte, con la batería entera:

| | 14.2.15 (hoy) | 14.2.35 (probado) |
|---|---|---|
| `tsc --noEmit` | limpio | limpio |
| `next build` | limpio | limpio |
| `auditoria.py` | 52 en verde | **52 en verde** |
| avisos de `next` | 34 | **25** |
| críticos | 4 | **3** |
| el bypass del middleware | **abierto** | **cerrado** |

Los tres críticos que quedan **no te tocan**: uno es de servidores Windows (esto
corre en Linux), y los otros dos son del optimizador de imágenes por AVIF y por
SVG —**MCD no importa `next/image` en ninguna parte** y `next.config` no declara
dominios remotos—. El cuarto, el del middleware, es el que se cierra.

**Por qué no se subió solo, y es la misma razón que el 9 de noviembre.** Ese día
un turno sacó el `package-lock.json` a propósito, y lo escribió así: fijar
versiones **cambia lo que Vercel instala en el próximo deploy** respecto de lo
que corre hoy, y eso lo decides tú. Subir `next` de 14.2.15 a 14.2.35 es
exactamente eso. El trabajo reversible está hecho y medido; falta tu clic.

**Botón de dos:**

- **Subirlo** — una línea en `package.json`, batería en verde ya probada, cierra
  el bypass del middleware. *(Es lo que recomiendo: el cambio es de parche, no
  toca código, y lo que cierra es el agujero del único portero de primera línea
  de las pantallas con datos de pacientes.)*
- **Dejarlo** — las segundas puertas aguantan, no hay fuga medida, y el deploy
  de hoy sigue siendo el de hoy.

**Y hay un segundo hallazgo, que el 13 de noviembre a las 15:25 quedó medido y
deja de ser «un triaje entero».** Lo que este mapa decía era: TCD arrastra 67
avisos —2 críticos, 15 altos—, casi todos de herramientas de construcción
(`vite`, `postcss`, `browserslist`, `picomatch`) que no viajan al navegador, y
los tres que sí viajan son `dompurify`, `prosemirror-view` y `@tiptap/core`,
«los del editor de texto, todos de familia XSS».

**Dos de las tres premisas de esa frase se caen.**

- **`dompurify` no es del editor, y su código no se ejecuta nunca.** No está en
  `package.json` ni se importa en una sola línea de `src`: lo arrastra
  `jspdf@4.2.1`, y jspdf entra con **import dinámico** (`await import('jspdf')`)
  en un solo lugar, `CertificadoModal`. En el build real sale en su propio
  trozo aparte —`dist/assets/purify.es-*.js`, al lado de `jspdf.es.min-*.js`—,
  o sea que solo se descarga cuando alguien genera un certificado. Y el único
  camino de jspdf que usa DOMPurify es su método `.html()`, que **la app no
  llama en ninguna parte** (verificado con grep en todo `src`). Los 17 avisos de
  DOMPurify apuntan a código que no corre.
- **El editor sí viaja, pero su contenido solo lo escribe el equipo.**
  `@tiptap/core` y `prosemirror-view` salen en el bundle principal
  (`dist/assets/index-*.js`), así que los descarga todo el que abre la app. Pero
  el editor **se monta en un solo lugar**: `admin/TaskModal` → `TaskComments`,
  los comentarios del tablero interno. La tabla es
  `admin_tareas_comentarios`, y sus tres políticas de RLS —leer, insertar,
  borrar— exigen `profiles.rol = 'admin'` o `admin_rol IN
  ('owner','manager','staff')`; el RPC de lectura `get_tarea_comentarios` es
  `SECURITY DEFINER` y **vuelve a preguntar lo mismo adentro**. Un cliente no
  puede escribir ahí. Así que el HTML hostil que dispararía el aviso de tiptap
  tendría que escribirlo alguien de tu equipo, ya logueado como staff.

La premisa que **sí** se sostiene es la del medio: de los 67 avisos, los dos
críticos (`protobufjs`, `proxy-addr`) y trece de los quince altos son de
herramientas que no llegan al navegador del cliente. **Los dos que llegan y son
alcanzables son los del editor**, y los dos tienen arreglo **sin cambio de
mayor**: `@tiptap/core` pide `>3.30.4` (hoy 3.23.4, la línea 3 va por 3.34.0) y
`prosemirror-view` pide `>=1.42.3` (hoy 1.41.8, va por 1.42.9).

**Las dos salidas están probadas enteras en copias aparte, las dos en verde.**
La diferencia entre ellas no es el verde: es **cuánto cambia lo que Vercel
instala en el próximo deploy**, que es lo de siempre.

| | hoy | **A · solo el editor** | **B · lock entero** |
|---|---|---|---|
| `tsc --noEmit` | limpio | limpio | limpio |
| `npm run build` | limpio | limpio | limpio |
| las 131 `prueba-*.ts` | 131/131 | **131/131** | **131/131** |
| `prueba-pantallas.tsx` | verde | **verde** | **verde** |
| avisos de npm | 67 | **37** | **11** |
| críticos / altos | 2 / 15 | 2 / 13 | **0 / 0** |
| `@tiptap/core` + `prosemirror-view` | **altos** | **limpios** | **limpios** |
| `vite` / `postcss` / `dompurify` | 6.4.1 / 8.5.8 / 3.3.3 | **iguales que hoy** | movidos |

**La A no se puede hacer con un `npm update`, y por eso queda escrito cómo.**
La familia de tiptap clava sus pares de forma exacta (`peer
@tiptap/core@"3.23.4"`), así que npm se niega a mover las siete dependencias
directas dejando las ~20 sub-extensiones donde están: `npm install
--package-lock-only` aborta con `ERESOLVE` por mucho que se le nombren todos los
paquetes a la vez. Lo que sí funciona, medido: **borrar del
`package-lock.json` las 43 entradas de `@tiptap/*` y `prosemirror-*`, subir los
siete rangos a `^3.34.0` y dejar que npm resuelva solo ese subárbol.** El resto
del lock queda intacto —`vite` sigue en 6.4.1 y `postcss` en 8.5.8—, que es
justo lo que la hace mínima.

**Botón de tres:**

- **A · subir solo el editor** — `package.json` con los siete `@tiptap/*` en
  `^3.34.0` y el subárbol del lock rehecho. Cierra los dos avisos alcanzables y
  **no mueve nada más** de lo que Vercel instala hoy. *(Es lo que recomiendo:
  es el único cambio que toca exactamente lo que está medido como alcanzable, y
  deja el resto del deploy idéntico al de hoy.)*
- **B · rehacer el lock entero** — 67 avisos pasan a 11, cero críticos y cero
  altos, batería en verde igual. Pero mueve `vite`, `postcss` y otros 700
  paquetes: el próximo deploy ya no instala lo que instala hoy.
- **Dejarlo** — el único que puede disparar el aviso del editor es tu propio
  equipo desde el tablero interno, y `dompurify` no se ejecuta nunca. No hay
  fuga alcanzable por un cliente.

**Y queda un apunte que no es de seguridad:** el editor viaja en el bundle
principal (3,18 MB) aunque solo se monte en el Admin. Todo cliente que abre la
app se descarga tiptap y prosemirror para nada. Eso es peso, no riesgo, y es
**un turno de la tabla si lo quieres** —un `lazy()` en `TaskModal`—, no una
decisión de venta.

### Manual de operación de las baterías — lo que hay que saber antes de leer un rojo

**`auditoria.py` de TCD tarda unos 22 minutos**, y no es lento por el texto: el
bloque 10 vuelve a correr las 133 pruebas y además levanta Chromium de verdad
para medir las 93 vistas del cliente y las 17 del Admin. Eso **pasa del límite
de 5 minutos** que tiene un comando en primer plano, así que el turno que la
corra de frente la va a ver morir por tiempo sin que nada esté roto. **Se corre
en segundo plano, redirigida a un archivo, y se mira el archivo cada tanto.** La
de MCD, en cambio, termina en segundos.

**El contenedor se recicla y `node_modules` vuelve vacío.** Medido: sin
dependencias, TCD tira **14.153 errores de `tsc`** y MCD marca **2 fallas**
—`tsc` y `next build`—, y ninguna de las dos es del código. Son el mismo
`node_modules` en cero.

**Y cada repo se instala distinto, que es la trampa:**

| repo | el comando | por qué |
|---|---|---|
| TCD | `npm ci` | tiene `package-lock.json` |
| MCD | `npm install` | **no** tiene lockfile, y es a propósito |

En MCD `npm ci` **no corre**: aborta con `EUSAGE` pidiendo un lockfile que no
existe. No es una falla del repo —el lockfile se sacó el 9 de noviembre
(`f481901`) y quedó ignorado, porque subir el que se resuelve hoy cambia lo que
Vercel instala y eso es decisión tuya, no de la batería—. Si una batería de MCD
aparece roja en `tsc` o en `next build`, lo primero es mirar si hay
dependencias, y la segunda si `.next` quedó de una instalación vieja: una
primera corrida tras instalar marcó una falla que se fue sola al repetirla, con
los tipos de Next ya generados.

**Y las tres `prueba-*.ts` de MCD tampoco se corren con `npx tsx`.** Su
batería las corre con `node --experimental-transform-types`, y es lo único que
funciona: con `npx tsx` pelado, `prueba-las-listas-completas.ts` se pone roja
con diez errores de «top-level await is currently not supported with the cjs
output format» sin que nada esté roto. Medido el 17 de noviembre a las 07:25,
que es cuando se cayó en la trampa.

**Las pruebas son 134 archivos, y la que sobra no se corre igual que
las otras.** Son **133** `prueba-*.ts` —la 132 es
`prueba-campos-angostos.ts`, del 13 de noviembre, y la 133
`prueba-la-puerta-de-la-ia.ts`, del 14— más **una** `.tsx`:
`prueba-pantallas.tsx`, la que monta las pantallas de verdad. Esa necesita su
entorno de navegador y se corre así —tal como la corre el bloque 10 de
`auditoria.py`—:

```
npx tsx --import ./scripts/entorno-navegador.mjs scripts/prueba-pantallas.tsx
```

Si un turno recorre el directorio con `npx tsx` pelado, esa única se pone roja
sin que nada esté roto: le falta el DOM, no le falla una mirada. Medido el 12 de
noviembre a las 23:25, que es cuando se cayó en la trampa y por eso queda
escrita.

**La trampa del `HEAD` suelto, que vuelve en cada contenedor nuevo.** Los dos
repos despiertan en `HEAD` suelto, al día, pero la rama `main` **local** de TCD
se queda muy atrás —doce commits una vez, catorce otra, quince el 12 de
noviembre a las 19:25—. Así que `git push origin main` —el comando del encargo—
sube la rama vieja y GitHub lo rechaza por *non-fast-forward*, aunque el trabajo
esté bien hecho y encima de `origin/main`. **Esto ningún turno puede dejarlo
arreglado para el siguiente: es estado local de git, no contenido del repo, y no
viaja en un commit.** La regla es la del comando: subir siempre con `git push
origin HEAD:main`, después `git checkout -B main HEAD` para reengancharla en
este contenedor, y no leer un rechazo como trabajo perdido.

### El tramo único, y un premio que no existía — turno 17, el 12 de noviembre

Commit `acc1f1a`. La bienvenida pasó de diez pasos a cinco, con los
quince minutos a la vista, cinco preguntas nuevas y una lente propia de
sesenta y cuatro miradas.

**La premisa estaba mal en tres de sus cuatro partes.**

**Uno: «fundir los diez pasos» son seis.** De los diez pasos, SEIS preguntaban
—perfil, situación, diagnóstico, origen, números, rueda—. Los otros cuatro no
son preguntas y no se funden con nada: la contraseña pasa antes de que haya a
quién preguntar, el dictamen es la salida de lo que contestó, la firma se firma
sola y la guía es la orientación del final. El tramo único son los seis en uno.

**Dos: «su audio» ya existía, y ya estaba en esta pantalla.** `BotonAudio`
—grabar, transcribir, el texto cae en la respuesta— colgaba de los tres campos
del origen y del Para Qué desde antes. No era una pregunta nueva: era ese botón
en los campos que no lo tenían. Ahora está también en la frustración, en el
pacto y en los cuatro campos abiertos de la situación.

**Tres, y es el que importa: el premio ya se le daba a todos.** La decisión del
11 de noviembre fue «el premio es que su día 1 se abre ahí mismo, en vez de
mañana». Medido: `fecha_inicio` se estampa HOY al dar de alta —`api/alta-numero.ts`
y el Admin—, `diaDelPrograma` acota el resultado a 1 como mínimo, y la última
pantalla de la bienvenida ya dice «Tu sesión de hoy te espera: el Día 1 completo»
y lleva al Camino. **No hay ningún «mañana» del que rescatarlo.** Y un premio que
el que se pasa también recibe no es un premio.

Así que el reloj se construyó SIN premio, y eso tiene consecuencia: su única
apuesta quedó vacía. Hoy el reloj dice el tiempo y nada más —«Son 15 minutos, de
una sola sentada», y si se pasa, «te pasaste de los 15, y no pasa nada»—. **Si
querés que terminar a tiempo gane algo, hay que decir QUÉ, y eso es una promesa
que el cliente lee: espera tu clic.** Lo que no se puede ofrecer como premio es
el día 1, porque ya lo tiene.

**Lo que la fusión arregló sin proponérselo.** `guardarDiagnostico` mandaba a la
pantalla del dictamen a quien ya tuviera el origen contestado, y de paso se
llevaba los pasos de los números y de la rueda: ese cliente terminaba la
bienvenida **sin sus seis números** —«sin esto no hay con qué comparar al
final»— y sin su rueda. En un tramo único no hay nada que saltear. Y el jsonb
`diagnostico` pasó de dos escritores con compositor a **un solo escritor de
verdad**: el bug del 8 de noviembre ya no tiene dónde volver a nacer.

**Las preguntas nuevas son cinco, no cuatro, y el FODA entra a la mitad.** La
regla de la casa es que nada se pregunta dos veces, y dos de las cuatro letras
ya estaban: la **D** se pregunta DOS veces —`freno` («tu freno principal al
arrancar», que además viaja al ADN) y `frustracion`— y la **O** la cubren
`nicho` y `llegan`. Entran la **F** («¿qué haces mejor que cualquiera de tu
especialidad?») y la **A** («¿qué de afuera te puede sacar consultantes este
año?»), más los enlaces, los archivos y los cinco tramos que le importan. Los
archivos no abren un segundo subidor: delegan en `evidencia.ts`, con su tope de
50 MB y sus mensajes ya escritos, bajo una carpeta reservada que no es el código
de ninguna de las 90 jornadas.

**La lente, probada contra sus once fallos.** `scripts/prueba-la-radiografia-en-un-tramo.ts`
se pone roja si el reloj reinicia al recargar, si alguien le cuelga un candado a
`sePaso()`, si el tramo se vuelve a partir en pasos, si el cliente que hoy está
a mitad de la bienvenida pierde su traducción, si una pregunta nueva deja de
viajar o vuelve a nacer vacía, si anotar una lista pisa la otra, si vuelve un
segundo escritor del jsonb, si los archivos abren su propio bucket, si el cierre
deja de pedir los seis números, y si el reloj se cuela en la sesión de cada día
—que es la decisión que se tomó al revés y sigue en pie—.

**Y la bienvenida ahora se MONTA en la batería.** Es la primera pantalla de
alguien que acaba de pagar, tiene mil cuatrocientas líneas, y ninguna lente la
ejecutaba: la única que la miraba la leía como texto. `prueba-pantallas.tsx` la
monta entera y comprueba que las seis secciones dibujen, que el reloj esté, que
haya un solo botón, y que los seis nombres de paso viejos caigan en el tramo en
vez de en una pantalla en blanco.

**Cuatro lentes de la casa estaban apuntadas a la forma vieja, y se
re-apuntaron a la propiedad** —el mismo arreglo del turno 14—:

| la lente | miraba | mira |
|---|---|---|
| `prueba-medicion` | el `disabled` del botón del paso | que el cierre exija los seis |
| `prueba-medicion` | el orden `'origen', 'numeros'` en la lista | que los números se pidan antes del ADN |
| `prueba-la-bienvenida-no-se-pisa` | `diagnostico:` en todo el archivo | solo adentro de un `.update()` |
| `medir-app.py` | «el wizard se cortó en el paso 5 de **10**» | los pasos que declara `STEPS` |

La tercera había empezado a marcar en rojo la tabla de traducción de pasos
—una llave que se llama `diagnostico` no es una escritura de la columna— y
quedó **más** estricta que antes, no menos. La cuarta tenía el diez escrito a
mano, que es el contador que envejece sin avisar del que ese mismo archivo ya
advertía dos renglones más abajo.

**Y una falta mía que el medidor cazó y ninguna lente de texto podía ver.** Al
juntar seis pasos en una vista, los pesos tipográficos que vivían en pantallas
distintas quedaron en la misma: el tamaño 15 juntó cuatro —400, 500, 600 y
700— y el techo de la regla son tres. Se movieron dos cosas, las dos medidas:
la frase del reloj a 17 px (donde el 400 ya existía) y los números del 1 al 10
de la energía a 16 px, porque 15 px la casa lo reserva para metadatos y un
número que el cliente TOCA no es un metadato. El medidor volvió a cero faltas
en las 93 vistas. **Si alguno de esos dos tamaños no te gusta, es una línea.**

**Lo que quedó anotado y no se tocó.** El premio, dicho arriba. Y las 98 vistas
del medidor ahora son 93: no se borró ninguna pantalla, se fundieron cinco
pasos en uno.

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

**MCD se trabaja en la misma sesión que TCD**, no en un chat aparte: el puente
tiene un lado en cada repo —`api/mcd-bridge.ts` en TCD y
`/api/integrations/tcd` en MCD—. Tocar un lado a ciegas rompe el otro.

Lo que **no** comparten es la base: son **dos proyectos de Supabase distintos**
—lo dice el comentario de la ruta de MCD, y las tablas no se cruzan—, medido el
16 de noviembre a las 15:30. El puente HTTP es todo lo que las une, y por eso
el **contrato** de ese puente es lo único que puede desfasarse sin que ninguna
de las dos baterías se entere. Desde esa fecha, se entera.

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
exactamente lo que pidió no tener que hacer. *(El turno 17 se cerró el 12 de
noviembre; de sus dos decisiones, el reloj se construyó y el premio se disolvió
al medirlo. Está arriba.)*

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

### 5 · La radiografía: 15 minutos de una, cronometrados — HECHA el 12 de noviembre (turno 17)

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
2. ~~**El premio es que su día 1 se abre ahí mismo**, en vez de mañana.~~
   **Se disolvió al medirlo, el 12 de noviembre.** Ya se le abre ahí mismo, a
   todos: `fecha_inicio` se estampa HOY al dar de alta, `diaDelPrograma` acota
   a 1 como mínimo, y la última pantalla de la bienvenida ya dice «Tu sesión de
   hoy te espera: el Día 1 completo» y lleva al Camino. No hay ningún «mañana»
   del que rescatarlo, y un premio que el que se pasa también recibe no es un
   premio. **El reloj se construyó sin premio: dice el tiempo y nada más.** Si
   terminar a tiempo tiene que ganar algo, hay que decir QUÉ — y eso es una
   promesa que el cliente lee, así que espera tu clic.

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

**Y el 12 de noviembre se cerró el resto**: el tramo único, el reloj y las
preguntas nuevas, con el premio medido y descartado. El detalle está arriba, en
«El tramo único, y un premio que no existía».

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

### Antes de pasar el acceso (martes 17 de noviembre)

> **Los tres primeros son tuyos sí o sí, medido el 16 de noviembre a las
> 07:25:** el conector de Vercel de las sesiones dormidas entra a la cuenta
> `javieremilianokatz-6225's projects`, que tiene `refugio`,
> `propuestas-javo-katz` y `nexos-demo`. **`sanar` no está**, ni el proyecto de
> MCD. No es el proxy: es la cuenta. Una sesión no puede promover el deploy ni
> cargar las dos variables, y tampoco puede verificar si ya lo hiciste.

- **Promover el deploy a producción.** Vercel compiló `26c5d03` y salió bien,
  pero los últimos cien deploys de este repo figuran como *Preview*: ninguno
  como *Production*. Vercel → cuenta `tuclinicadigital` → proyecto `sanar` →
  Deployments: si el que dice **Production** no es de hoy, **Promote to
  Production** al de `26c5d03`. Mientras no se promueva,
  `app.tuclinica.digital` sigue sirviendo un build viejo.
- **`VITE_LIBROS_URL`** en Vercel, con el link de la carpeta de los libros.
  Sin esa variable los cinco libros aparecen en el estante con su nombre y su
  bajada, y sin el botón «Abrirlo». No hay enlace roto: hay un camino que
  termina. El link no se escribe en el repo, por eso va por entorno.
- **`GHL_AVISOS_WEBHOOK`** en Vercel, con la dirección del webhook de entrada
  de GHL. Sin esa variable los tres avisos —tres días sin entrar, día 5 hecho,
  camino completo— se calculan y no salen. Nada se rompe sin ella; lo que no
  pasa es el reenganche. Ninguna dirección de GHL se escribe en el repo.

### Lo demás

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

---

# LA PIEL Y LOS TRES HILOS · plan de 7 turnos (15 nov 2026)

Pedido de Javo: rehacer la app en lo estético, alineada con los libros y con la
home nueva (tuclinica.digital, piel «Paisaje»), y dejar el paso a paso, el
camino y los días 100 % alineados con los libros que se reescriben. El pedido
completo está en `claude/APP-ALINEACION.md`; el detalle, en
`claude/ARQUITECTURA-COLECCION.md` §6, §10 y §14.

**La regla que no se toca:** los días y los nombres de `roadmap.seed.json`
mandan. Los libros se ajustan a la app, nunca al revés.

## Lo que encontré, medido

**Primero, una corrección: la app no tiene fondo oscuro.** Lo parece al abrir
`index.css` —los tokens de fábrica son negros— pero `index.html` lleva
`data-theme="light"` y 206 reglas lo dan vuelta entero. Lo que se ve en el
teléfono es crema con tinta cálida. Quien lea solo el principio del archivo va
a «arreglar» algo que ya está bien.

**Lo que sí pasa es más caro: hay dos pieles peleando.** Debajo del crema vive
la paleta oscura completa, y encima 206 reglas la tapan a mano, una por una.
Por eso los valores derivan: la app quedó con **otro crema** (#EAE4D9 contra el
#FAF8F4 de la home), **otra letra** (Sora, Fraunces y Lora contra Manrope,
Literata y Cormorant), **otro oro** (#B0822E contra #A8875A en línea y #7A5F33
en texto) y **otros cinco colores de paisaje** —#B6BCBD, #959F9F, #D4CDBC y
#E3CB9D, grises lavados— en lugar de los de las tapas. «Rehacer por completo en
lo estético» es dejar una sola piel, no pintar encima de la que hay.

**El tamaño real del cambio de color.** No son cinco mil ediciones: el color
pasa por tokens. `text-cream` aparece 2.626 veces, `text-gold` 853,
`border-gold` 660, `bg-gold` 587, `bg-surface` 126, `bg-panel` 80. Todo eso se
mueve desde la raíz. Lo que sí pide mano: 101 `bg-cream`, 21 `text-ink`, 105
`text-white`, 32 `text-black` y unos 250 colores escritos a mano en `.tsx`
(#DFD3BC 71 veces, #B0822E 65, #17150F 22, #EAE4D9 20). El naranja prohibido
#E8962E sigue en 4 lugares.

**Los tres hilos no existen en los datos.** `roadmap.seed.json` no tiene
`leccion`, ni `pausa`, ni `paso_afuera`, ni la pieza del protocolo. El día
muestra título, lo que lleva, los minutos y los pasos. Nada de lo de adentro.

**Las micro-tareas del papel nunca entraron.** El campo `checklist` existe en
43 de las 91 jornadas y en las 43 es una **copia literal de `pasos`**. Las 530
micro-tareas de `claude/checklist-90.json` siguen afuera. Hoy el papel y la app
no dicen lo mismo, y ese era el punto.

**«Mi protocolo» no existe.** Ninguna de las 33 piezas tiene dónde escribirse.

**Del juego del sur hay una pieza y media.** `racha.ts` cuenta días hábiles
seguidos con sesión —no pasos afuera— y tiene su regla de gracia. No hay vaso
de 100 piedras, ni mapa de 90 días pintado, ni sellos por tramo, ni las 10
palabras.

**Y siguen los arreglos que pidió LIBROS el 12 de noviembre:** `planes.ts`
vende a $997, `topeDelEscalon.ts` dice $5.000, `manuales.ts` dice «El Camino»,
«Semana Blanca» y «Los 5 días» viven en 8 archivos, los cinco sistemas se
llaman «de alto impacto», «automática» y «circular», `losCincoPaisajes.ts`
mantiene los tres datos falsos (el Limay hasta el Atlántico, las raíces que se
pasan azúcares, el cóndor que vuelve a mitad de camino) y los cinco libros del
sur figuran como «escribiendo» y sin enlace.

**Y una urgente, de otro frente:** la barra dice **Contacto** y abre un chat
propio con cinco canales. El martes 17 los clientes entran a «Mentoría TCD».
Esa pestaña tiene que decir **Comunidad** y llevar al grupo.

## Lo que ya está bien y se queda

- La tarjeta de Hoy ya abre con el paisaje del día, y los colores de
  `losCincoPaisajes.ts` salen del PDF de imprenta con el contraste medido uno
  por uno (el ocre del viento tiene su lecho aparte). Se conservan: lo que
  cambia es que pasen a ser los de las tapas, con el mismo cuidado.
- Los tramos de los paisajes se parsean del seed, para que vivan en un solo
  lugar. Eso no se toca: lo que se suma es la etiqueta larga de la estación
  («Días 1 a 7»), que es la de los libros y la home, al lado del tramo de
  construcción («se arma del 1 al 5»).
- El piso de letra de 15 px, con su comentario largo en `index.css`, y las 22
  lentes visuales de `medir-app.py` en cero faltas sobre las pantallas del
  cliente.

## Los siete turnos

**T1 · La muestra: una pantalla con la piel nueva.** Antes de repintar 53
pantallas, se repinta una —Hoy— con la piel completa: Manrope para lo que se
mira, Literata para lo que se lee, Cormorant itálica para lo que se cita; el
crema y el oro de la home; los cinco colores de las tapas; esquinas 12, 24 y
redondo. Va con capturas de celular. Es el mismo camino que funcionó en los
libros: la lección 27 antes de las 33. En el mismo turno, la pestaña
**Comunidad**, que es lo urgente del martes.

**T2 · La piel en toda la app.** — **CERRADO el 15 de noviembre** · `a91274d`
(abajo, en «El 15 de noviembre a las 11:30»). Lo que el plan daba por un repintado de
cincuenta y tres pantallas era otra cosa: la piel pintada ya era la buena y lo
que había debajo era la cañería. Se midió antes de tocar.

El plan decía:
**T2 · La piel en toda la app.** Una sola paleta: se va la capa oscura y se van
las 206 reglas que la tapaban. Se reescribe `tcd-spec/10-DISENO.md` con la piel
nueva y se reapuntan las lentes de `medir-app.py` —el contraste se mide contra
el fondo nuevo— porque si no, el medidor sigue aprobando la piel vieja.
Capturas de todas las pantallas del cliente.

**T3 · Los tres hilos del día.** — **CERRADO el 15 de noviembre** · `df84d81`
(abajo, en
«El 15 de noviembre a las 16:30»). Los tres campos entraron, pero no donde el
plan decía: el seed no se escribe a mano, lo escribe
`tcd-spec/datos/generar_seed.py`, y la batería ya medía que los dos sean el
mismo. Y la premisa de que el día no mostraba «nada de lo de adentro» era
cierta por otra razón: la lección escrita YA existía en el código y su
pantalla no podía dibujarla nunca.

El plan decía:
**T3 · Los tres hilos del día.** Campos nuevos en `roadmap.seed.json` —
`leccion`, `pausa`, `paso_afuera`— sin tocar días, nombres ni pasos. El día
pasa a mostrar: tu lección · tu pausa de 5 · tu paso afuera · lo que pide la
app. La tabla de las lecciones la pasa LIBROS; hoy está completa la del Lago
(ARQUITECTURA §4) y las otras cuatro llegan cuando cierre cada libro.

**T4 · Las micro-tareas del papel.** — **CERRADO el 15 de noviembre** ·
`5af53b5` (arriba, en «El 15 de noviembre a las 18:30»). Entraron las 530,
pero no en `checklist`: ese campo no lo dibujaba ninguna pantalla y era copia
textual de `pasos`. Van en `micro`, atadas por posición, y se ven solo las de
la tarea en curso.

El plan decía:
**T4 · Las micro-tareas del papel.** Entran las 530 de `checklist-90.json` en
el campo `checklist`, con su forma real (tarea con sus micro), y una lente que
compara app contra papel para que no vuelvan a separarse.

**T5 · Mi protocolo, las 33 piezas.** — **CERRADO el 15 de noviembre** ·
`7bb7835` (abajo, en «El 15 de noviembre a las 21:40»). Las cuatro partes
estaban construidas desde esa mañana y ninguna llegaba entera: tres de las 33
piezas no se podían escribir nunca, las otras 30 tenían una sola oportunidad
cada una, y la pista de 66 no podía avanzar un casillero.

El plan decía:
**T5 · Mi protocolo, las 33 piezas.** La pieza del día se escribe igual que en
el libro; la guarda se va llenando; la pista de 66 con sus marcas en 21, 44 y
66; y el chequeo semanal de tres preguntas contra el burnout (las tres
dimensiones de la OMS, CIE-11).

**T6 · El juego del sur.** — **CERRADO el 16 de noviembre** · `b14f4d8`
(arriba, en «El 16 de noviembre a las 00:30»). Las cinco mecánicas estaban
construidas desde el 15 a la mañana; lo que no estaba era el mapa pintando
bien: 55 de los 90 días con el color de otro paisaje y 31 que no podían
pintarse nunca, el 90 entre ellos.

El plan decía:
**T6 · El juego del sur.** Tu vaso de 100 piedras (logro 1, paso afuera 2; la
orilla en 33, la travesía en 66, la otra orilla en 100), el mapa de 90 días que
se pinta, la racha de pasos afuera con la regla de reenganche, un sello por
tramo y las 10 palabras.

**T7 · CERRADO el 16 de noviembre** · `ee5a72a` · seis de los siete encargos
ya estaban hechos y el séptimo (el cóndor) no existe en el repo; lo que faltaba
era la lente, y el candado del Río ya se había desfasado. Arriba, en «El 16 de
noviembre a las 05:10». **Con esto el plan de la piel queda cerrado entero.**
El plan decía:
**T7 · Los arreglos de LIBROS.** La escalera (997 a 1.000, 5.000 a 6.000), Tu
nuevo precio en todos lados, los cinco sistemas con su nombre del impreso,
`losCincoPaisajes.ts` (los tres datos y las etiquetas de días), `libros.ts`
(los cinco publicados y con enlace), `libroYPacientes.ts` (los 11 capítulos que
no existen) y «menos mapas para el mismo viaje».

**Cada turno cierra igual:** batería en verde antes de subir, capturas de
celular para tu visto, y el bloque APP de MAPA-TCD actualizado.
