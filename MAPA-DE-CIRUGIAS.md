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
| 11 | **El Tablero guarda 34 códigos que el Camino no busca** | **el próximo** · medido el 9 nov |

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

### Lo que bloquea la venta y es de Javo

Ninguna de estas cuatro la puede hacer Claude. Van en cada parte que se le dé.

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
   mañana). Los títulos están más abajo en este mapa. **Esperar el turno 11**
   antes de cargarlos: hoy 34 de las 43 filas del Tablero guardan el enlace
   en un código que el Camino no lee.
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
esperando: es el turno 11, el próximo de la cola.

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

#### Lo que espera su clic, y por qué

Dos piezas del turno 5 no las toca Claude solo:

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
