# LA CIRUGÍA FINAL — que la app cumpla las dos promesas

Dos promesas, una por lado:

> **Del lado del cliente:** que tenga TODO lo necesario para pasar de cero a
> **$10.000 en 90 días con diez pacientes de $1.000**. No un millón: diez
> pacientes.
>
> **Del lado tuyo:** que **no trabajes**. Que puedas delegar todo en un equipo
> organizado por **roles**, no por nombres. Que solo entres a los tickets altos.

---

# PARTE 1 · LOS CINCO ERRORES QUE LE MIENTEN AL CLIENTE

No los encontré leyendo código: **le pregunté a la app qué hace falta para
diez ventas de $1.000 en 90 días, y después corrí el viaje real semana por
semana.** Los cinco son de la misma clase — no rompen nada, y por eso nadie
los ve: le dicen algo falso a la persona que confía en ellos.

## 1.1 El presupuesto: se equivoca por veinte veces

`proyectar()` calcula la inversión con **$0,50 por conversación, escrito a
mano** — el benchmark de comercio electrónico que ya habíamos rechazado y
corregido en la cadena, pero que quedó vivo ahí.

| Costo por conversación | Semanal | 90 días | CAC |
|---|---|---|---|
| $0,50 — **el de hoy** | $7 | $88 | 1% |
| $5 | $75 | $973 | 10% |
| **$10 — el real** | **$136** | **$1.769** | **18%** |

**El cliente presupuesta $7, invierte $88 en tres meses, no vende nada, y
concluye que el sistema no funciona.** No abandona por falta de método:
abandona porque el método le dio un número imposible y él lo cumplió.

**La corrección no es cambiar un número: es invertir la derivación.** Si el
CAC tiene que estar entre el 10% y el 30% del precio y hacen falta catorce
conversaciones por venta, una conversación puede costar entre $7 y $21. La
cadena se dice a sí misma cuánto puede pagar. Y la proyección usa el extremo
**conservador**: una proyección es el piso que se cumple sí o sí, y proyectar
con el mejor caso da un piso que en realidad es un techo.

## 1.2 El dominó apunta a lo que no se puede arreglar

**Ninguno de los diecisiete indicadores exige una muestra mínima antes de
opinar.** Ninguno. Y el dominó es la salida principal de la app para el
cliente.

Corrí el viaje real:

| Semana | El dominó le dice | La realidad |
|---|---|---|
| 1 | *«Escucha una llamada entera»* | Tuvo **dos llamadas** |
| 3 | *«Traen un referido»* | Tiene **un cliente**, recién empezó |
| 8 | *«Traen un referido»* | Seis activos, **ninguno terminó** |
| Semana que **cumple el objetivo** | *«Renuevan al terminar»* | Nadie llegó al final todavía |

Juzgar una tasa de cierre sobre dos llamadas no es medir: es leer ruido. Y
señalar la retención a alguien cuyos clientes empiezan la semana que viene lo
manda a arreglar lo único que no está en sus manos.

**Es el error más dañino de la app**, porque se equivoca justo cuando el
cliente está más frágil: al principio.

**La corrección:** cada indicador declara cuántos datos necesita antes de
hablar. Sin eso, se muestra como «todavía sin datos» y **no puede ser el
dominó**. El principio ya existe en el código —la conversación a agenda espera
ocho conversaciones— pero nunca se aplicó al resto.

## 1.3 Le pide refrescar el ganador el día que lo encuentra

Al día dieciséis, el mismo día en que la app declara cuál anuncio funciona,
le dice: **«Tu ganador lleva 2 semanas. Refresca el creativo.»**

La causa: se le pasa `Math.floor(diasCampana / 7)` como semanas del ganador —
la edad de la campaña, no el tiempo que ese anuncio lleva ganando. Refrescar
un ganador el día que lo descubrís es exactamente lo contrario de lo que dice
el manual.

## 1.4 Corona un ganador entre tres anuncios idénticos

Al día dieciséis con tres anuncios de números iguales y **cero ventas**, la
app declara ganador al primero. No hay ganador: hay un empate. Decirle que
uno ganó es darle confianza falsa y hacerle apagar dos que estaban igual.

## 1.5 Cobra cuatro créditos donde prometió uno

Vos aprobaste: *«Tus 3 anuncios» = 1 crédito*. El Constructor recorre las tres
fórmulas y **cobra una por cada una**, más una por las historias. **Cuatro.**

Con treinta créditos al mes, el cliente hace siete tandas en vez de treinta.
No es solo el número: es que la app le cobra distinto de lo que le dice.

---

# PARTE 2 · LO QUE FALTA, DEL LADO DEL CLIENTE

## 2.1 Lo que ya tiene, y alcanza

No hace falta tocarlo:

- **El ADN** cierra su método, su avatar y su oferta.
- **El Camino** lo lleva paso a paso, con sesiones guiadas.
- **Los entrenadores** cubren los cuatro cuellos: el DM, la llamada, los
  números y el precio.
- **La fábrica de anuncios** elige sus fórmulas, las escribe, las audita
  contra los ingredientes y contra las políticas, y las entrega en láminas.
- **El creador de imágenes** produce las piezas.
- **El tablero** decide por él: qué apagar, qué escalar, cuándo no tocar.
- **La bitácora** le enseña qué fórmula funciona en su cuenta.

## 2.2 Lo que falta

### (a) El cliente no ve su propia cuenta hacia atrás

La proyección existe, pero **vive en el Admin**. El cliente nunca ve la
frase que ordena sus noventa días:

> Para diez ventas necesitas **catorce conversaciones por semana**.
> Esta semana llevas cuatro.

Sin eso, el número diario que carga no significa nada. Con eso, cada día
tiene un marcador.

### (b) Consigue diez pacientes y no tiene dónde sostenerlos

El objetivo es **diez pacientes**, no diez ventas. La retención es un tercio
de la cadena de valor y la app entera está construida para la atracción y la
conversación.

Cuando cierra al tercero, aparece la pregunta que hoy no tiene respuesta:
dónde ve a sus diez, quién está por terminar, quién no aparece hace dos
semanas, a quién pedirle el testimonio.

Esa es la función de MiClínica Digital, que hoy es **un enlace en el menú**.
No hace falta construir MCD entero: hace falta **el puente mínimo** — una
lista de sus pacientes con en qué semana va cada uno y quién está por
terminar. Sin eso, el cliente llega a diez y los pierde de a uno.

### (c) El libro no está en ningún lado

Lo pediste explícito y no existe en la app. Va en **El Método**, junto a los
videos, para el que quiere profundizar. Por capítulos, cada uno atado al
pilar que le corresponde: quien está en el pilar 2 ve los capítulos del 2
desbloqueados y el resto en gris, igual que los videos.

---

# PARTE 3 · QUE NO TRABAJES

## 3.1 Los roles existen pero no hacen casi nada

Hay tres — `owner`, `manager`, `staff` — usados **quince veces en todo el
código**, y casi siempre para lo mismo: **esconder una tab**.

Eso no es un modelo de roles: es un permiso. Un rol de verdad contesta tres
preguntas que hoy nadie contesta:

1. **Qué me toca a mí hoy**, de todo lo que hay para hacer.
2. **Qué NO me toca**, para no pisarme con otro.
3. **Cuánto puedo sostener** antes de que se me caiga.

## 3.2 Los dos roles que pediste

### **Acompañamiento** — el que sostiene a los clientes

Trabaja la cola de excepciones. **Ejecuta, no diagnostica**: la app le escribe
qué hacer y el mensaje que manda. Su trabajo es que ninguna cuenta se quede
frenada sin que alguien lo note.

*Lo que le toca:* la cola del día · el recorrido de las nueve etapas · las
sesiones de acompañamiento y su carga posterior · los avisos que la app no
pudo resolver sola.

*Lo que NO le toca:* decidir criterio nuevo. Si algo no está en la cola,
escala.

### **Desarrollo** — el que hace crecer la máquina

Su trabajo no es operar la app: es que la app haga cada vez más de lo que hoy
hace una persona. **El indicador de que va bien es uno solo: que los minutos
de humano por cliente bajen mes a mes con la misma cantidad de clientes.**

*Lo que le toca:* el panel del motor (costo, fallas, latencia) · los errores
que reporta la cola · el puente con MiClínica · las herramientas nuevas.

*Lo que NO le toca:* atender clientes. Cada vez que lo hace, deja de construir
lo que evitaría atenderlos.

### **Dirección** — vos

Solo dos cosas: **el criterio** (que ya vive en el código) y **los tickets
altos**. Todo lo demás entra por la cola de otro.

## 3.3 Lo que falta para que los roles funcionen

**El rol tiene que decidir la cola, no esconder tabs.** Hoy la cola es la
misma para todos. Debería ser: entro, veo lo mío, y lo de los demás no me
distrae.

**El techo de carga tiene que ser visible.** Doce horas semanales de soporte
para veinte clientes es la cuenta que sostiene el modelo. Si el rol de
acompañamiento pasa de ahí, el aviso no es "trabajá más": es que subió el
porcentaje de cuentas en rojo y hay que arreglar lo que las rompe.

**El traspaso tiene que estar escrito.** Cuando entre alguien nuevo al rol,
que herede una lista y no una conversación.

## 3.4 Las transcripciones: el agujero más caro del lado tuyo

**Hoy no existe nada.** Cero.

Y esto es lo que hace que sigas siendo necesario: después de cada sesión —tuya,
de acompañamiento, de quien sea— lo que se dijo **vive en la cabeza de quien
la dio**. El que sigue no sabe qué se acordó. El cliente vuelve a explicar lo
mismo. Y vos sos el único que tiene el mapa completo.

**Cómo tiene que funcionar:**

1. Termina la sesión. Fathom (o quien sea) deja la transcripción.
2. **Se pega en la ficha del cliente.** Un campo, un botón.
3. La app extrae tres cosas —y solo tres—: **qué se decidió**, **qué queda
   pendiente y de quién**, y **qué cambió en su situación**.
4. Lo decidido va al registro de decisiones. Lo pendiente se convierte en
   tarea con dueño. Lo que cambió actualiza su ficha.
5. **El cliente ve un resumen de lo que acordaron**, dentro de la app.

Eso no es una función más: es lo que convierte cada sesión en algo que el
equipo hereda en vez de perderse.

La extracción usa la tarea `estructura` del enrutador —Haiku, barato,
temperatura cero— porque no necesita voz: necesita obedecer un esquema y no
inventar. **Nada se guarda sin que un humano lo revise**: la app propone los
tres bloques y quien cargó la sesión confirma o corrige. Una transcripción mal
leída que se guarda sola es peor que no tenerla.

## 3.5 El cuadro de validación, para todos los tickets

Ya existe: **catorce bloques, sesenta y dos ítems**, con responsable y cuatro
estados, y trece se tildan solos desde El Camino. Es la matriz de
preactivación.

Lo que falta es que **sirva para los cuatro tickets**, no solo para los once
que vienen de la instalación acompañada:

| Ticket | Qué ítems le aplican | Quién los hace |
|---|---|---|
| **$1.000** | El subconjunto que el cliente puede hacer solo, con los tutoriales adentro | Él |
| **$2.000** | Lo mismo, con revisión en los puntos que se rompen | Él, revisa el equipo |
| **$5.000** | Los 62, repartidos | Cliente + agencia |
| **$10.000** | Los 62, con prioridad y con vos en las sesiones | Cliente + agencia + vos |

Y los **clientes viejos, los de antes de la app**: entran por el mismo cuadro,
con lo que ya tienen hecho marcado como listo. No arrancan de cero: arrancan
de donde están. Eso es lo que convierte el cuadro en la herramienta única para
gestionar a todos.

---

# PARTE 4 · LA CIRUGÍA FINAL — CUATRO TURNOS

Cuatro. Los conté buscando el mínimo real, no el mínimo que suena bien: lo
que se puede hacer junto sin que se degrade la calidad, y nada más.

El orden no es negociable en el primero.

---

## **F.1 — La verdad de los números**

Los cinco errores de la Parte 1, juntos, porque son el mismo problema: la app
le dice algo falso al cliente. Arreglarlos por separado sería tocar los mismos
tres archivos cuatro veces.

1. **El presupuesto** — derivar el costo por conversación del CAC objetivo, y
   proyectar con el extremo conservador.
2. **La muestra mínima** — cada indicador declara cuántos datos necesita antes
   de opinar. Sin ellos: «todavía sin datos», y **no puede ser el dominó**.
3. **El refresco** — contar las semanas desde que el anuncio fue declarado
   ganador, no desde que arrancó la campaña.
4. **El empate** — con números iguales no hay ganador, y se dice.
5. **El cobro** — una tanda de anuncios cuesta un crédito, como está prometido.

Y lo que hace que todo eso le sirva: **su marcador de los 90 días dentro de la
app.** Hoy la proyección vive en tu Admin.

> Para diez ventas necesitas **catorce conversaciones por semana**.
> Esta semana llevas **cuatro**.

*Sin este turno, los otros tres se construyen sobre un presupuesto que no
alcanza y un diagnóstico que apunta mal.*

---

## **F.2 — Los roles y la carga**

De tres permisos a tres roles con **cola propia**: acompañamiento, desarrollo
y dirección. Cada uno entra y ve lo suyo; lo de los demás no lo distrae.

Más el **techo de carga visible** —doce horas semanales es la cuenta que
sostiene veinte clientes— y el **traspaso escrito**, para que quien entre
herede una lista y no una conversación.

---

## **F.3 — Las transcripciones**

Se pega la transcripción en la ficha. La app extrae **tres cosas y solo tres**
—qué se decidió, qué queda pendiente y de quién, qué cambió en su situación—
y cada una aterriza donde corresponde: el registro de decisiones, una tarea
con dueño, la ficha del cliente. Y **el cliente ve el resumen de lo acordado**
dentro de la app.

Con revisión humana antes de guardar. Una transcripción mal leída que se
guarda sola es peor que no tenerla.

---

## **F.4 — El cuadro para todos, el libro y el puente**

Tres cosas contenidas que cierran los frentes que quedan:

**El cuadro de validación para los cuatro tickets.** Los 62 ítems ya existen;
falta que cada uno declare a qué tickets aplica, y que los **clientes viejos**
entren con lo que ya tienen hecho marcado — no arrancan de cero, arrancan de
donde están.

**El libro en El Método**, por capítulos, atado al pilar que le corresponde:
quien está en el pilar 2 ve los capítulos del 2, igual que los videos.

**El puente mínimo con MiClínica:** la lista de sus pacientes, en qué semana
va cada uno, quién está por terminar. No MCD entero — lo mínimo para que el
cliente pueda **sostener** los diez que consiguió.

---

## Por qué cuatro y no seis

**Los cinco errores van juntos** porque tocan los mismos tres archivos y son
el mismo problema. Separarlos sería repetir el trabajo de verificación cuatro
veces.

**Los roles y las transcripciones van separados** porque el primero cambia
quién ve qué en toda la app y el segundo agrega un flujo nuevo con extracción
por IA. Juntarlos es donde aparecen los errores que estamos sacando.

**El último junta tres cosas contenidas** —una tabla de datos, un contenido
por capítulos y una vista de lectura— que no se pisan entre sí.

## Por qué no menos

Podría prometerte tres. No lo voy a hacer: **los errores que encontramos hoy
son exactamente los que aparecen cuando se apura un turno.** El de los $7 por
semana estuvo ahí durante toda la construcción de la Mesa de plata, verde en
cada batería, porque nadie le preguntó a la app qué pasaba si un cliente real
la usaba para su objetivo real.

---

## Lo que NO entra, y por qué

**La conexión con Meta.** La carga manual funciona y toma dos minutos. La API
necesita acceso de socio en cada portafolio: es trabajo de instalación.

**MiClínica completa.** El puente mínimo resuelve el problema real sin
construir un producto entero.

**Las vistas de reuniones y equipo de la Sala.** Se resuelven hoy con el
calendario y con la matriz.
