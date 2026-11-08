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

- **Fathom por webhook** — termina la sesión, entra la transcripción, salen los
  compromisos como pasos de su día.
- **El tageo del comprador** — sin el campo `plan` del workflow de GHL, quien
  paga 997 y quien paga 497 entran igual, con todo abierto.
- **El escalón de entrada a 97 USD** con su ventana de acceso.
- **La puerta del día 91** con los tres pases: 97 la app sola · 497 con
  mentorías grupales · 997 con 1 a 1.

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
- **El plan de Fathom** — confirmar que incluye webhooks.
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
