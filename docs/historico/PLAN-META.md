# EL PLAN FINAL — antes de encender

Revisé todo con dos lentes: la del **operador** (¿se entiende? ¿se usa sin
preguntar?) y la del **que compra pauta** (¿los números dicen lo que hay que
hacer?).

Encontré seis cosas. Cuatro son huecos reales, dos son simplificaciones.

---

# PARTE 1 · LO QUE ENCONTRÉ

## 1.1 El país está guardado y nunca se usa

`profiles.pais` existe. **No entra en ningún diagnóstico.**

Y es la variable que más mueve los números en Meta. El mismo anuncio, con el
mismo creativo, cuesta:

| Mercado | CPM aproximado |
|---|---|
| Argentina, Venezuela | $2 – $4 |
| México, Colombia, Perú | $4 – $8 |
| Chile, Uruguay | $6 – $12 |
| España | $8 – $15 |
| Hispano en Estados Unidos | $12 – $25 |

**Hoy la app juzga a todos con la misma vara.** A una sanadora que le habla a
España le va a decir que su costo por conversación está alto cuando está
perfecto para su mercado. Y a una que le habla a Venezuela le va a decir que
está barato cuando en realidad está trayendo gente que no puede pagar $1.000.

**Y ese es el error más caro de todos**, porque no se ve: la campaña «funciona»
—conversaciones baratas— y no vende nunca.

## 1.2 Falta UN campo, y desbloquea dos diagnósticos de Meta

Hoy se carga: gasto, alcance, comentarios, conversaciones, agendas, llamadas,
ventas, cobrado.

**Falta: impresiones.** Un solo número, que está al lado de los otros en el
administrador. Y con él salen dos cosas que hoy no se pueden saber:

**CPM** = gasto ÷ impresiones × 1000 → *cuánto cuesta que te vean*
**Frecuencia** = impresiones ÷ alcance → *cuántas veces vio cada uno el mismo anuncio*

Con esos dos, el diagnóstico del anuncio deja de ser una adivinanza:

| Lo que se ve | Lo que significa | Qué hacer |
|---|---|---|
| CPM alto · pocos comentarios | El creativo no para el scroll | Cambiar el gancho |
| CPM alto · muchos comentarios | Audiencia cara pero funciona | Nada. Es el mercado. |
| CPM bajo · nada pasa | Le está hablando a la gente equivocada | Revisar país y avatar |
| **Frecuencia > 3 en una semana** | La audiencia se agotó | Ampliar el público o refrescar |

Esa última es la que más plata salva. Con presupuesto chico y público chico,
la frecuencia sube rapidísimo, el rendimiento cae, y **sin ese número parece
que el creativo se gastó cuando en realidad el público es muy angosto.**

## 1.3 El presupuesto está partido en tres y no debería

Con $136 por semana repartidos en tres anuncios, cada uno recibe **$6,50 por
día.**

Meta necesita unos 50 eventos por semana para salir de aprendizaje. A ese
presupuesto, cada anuncio va a producir 4 o 5 conversaciones semanales. **Los
tres se quedan aprendiendo para siempre**, y ninguno llega a rendir.

**Un solo conjunto de anuncios, con las tres piezas adentro.** El presupuesto
se concentra, el algoritmo aprende, y **igual se comparan las tres** porque
Meta reporta por creativo.

El Manual ya lo dice —campaña única, tres piezas— pero la app nunca se lo
recuerda, y armar tres campañas separadas es lo que sale natural.

## 1.4 Diego no deriva nada

Siete de los ocho entrenadores tienen reglas de derivación. **Diego —el de la
venta y el cierre— tiene cero.** Le preguntás de precio, de contenido o de
técnica y contesta igual.

Y hay un problema más de fondo: **cada uno tiene su propia lista**, escrita a
mano en su prompt. No hay un mapa compartido. Si mañana entra un entrenador
nuevo, nadie sabe qué le deriva a quién.

**Propongo un solo mapa de derivación, el mismo que usa la cola para los
micro-pasos**, inyectado en los ocho prompts. Una fuente de verdad para las
dos cosas.

## 1.5 Lo que NO hay que agregar

Dos cosas que parecen faltar y no:

**La segmentación detallada.** A $136 por semana, el público amplio le gana al
segmentado por intereses: segmentar fragmenta un presupuesto que ya es chico y
Meta no llega a aprender. **País, edad y sexo, y nada más.** Es una decisión de
armado que va en el tutorial, no un dato que haya que cargar.

**El costo por API de Meta.** La carga manual son dos minutos y funciona. La
API necesita acceso de socio en cada portafolio: es trabajo de instalación.

---

# PARTE 2 · CÓMO SE VE, SIN CONFUNDIR

Tu preocupación de los botones. Tres reglas, y con eso alcanza.

## 2.1 Un solo botón principal por pantalla

En cada pantalla hay **una sola acción dorada**. Todo lo demás es texto
subrayado o un botón de borde. Si hay dos cosas doradas, hay que elegir cuál
es la importante y bajar la otra.

## 2.2 Las acciones viven donde está el problema

No hay una barra de botones arriba. **El botón está pegado a lo que soluciona:**

> **Rosana** · lanzada hace 12 días
> Conversa con 18 y agenda 2. El anuncio trae bien; se pierde en el mensaje.
> **→ Hablar con Sofi sobre esto**
> `Copiar el mensaje` · `Ya lo hice`

Uno dorado. Dos en gris. Nada más en esa tarjeta.

## 2.3 Lo que no es de vos no se dibuja

Ya está resuelto por rol, y se extiende a la cola: si un ítem es del dev, Lupe
ve **un solo botón** —«Pasar al dev»— y no las tres acciones que no le tocan.

---

# PARTE 3 · CUÁNDO SE ABRE CAMPAÑAS

**Con el pilar 4.** Verificado en el código: `campanas: 4`.

Y es coherente, aunque no se dijera así: para llegar al pilar 4 hay que haber
pasado el 0, 1, 2 y 3 — que es donde se sella el ADN, se cierra el método y se
fija el precio. **Cuando la tab se abre, el brief ya está lleno sin que el
sanador se haya dado cuenta.**

No hay que cambiarlo. Sí hay que **decirlo en la pantalla**, porque hoy el que
está en el pilar 2 no sabe por qué no la ve.

---

# PARTE 4 · EL PLAN DE CONSTRUCCIÓN

Seis piezas. **Las cuatro primeras antes de encender.**

### 1 · El país en el diagnóstico
Que `profiles.pais` entre en las referencias: las bandas de costo se ajustan
al mercado. Sin esto, once clientes en cinco países se miden con la misma vara.

### 2 · Impresiones, CPM y frecuencia
Un campo más en la carga semanal, y los dos diagnósticos que desbloquea. Con
el aviso de frecuencia alta, que es el que más plata salva.

### 3 · Un tablero, dos puertas, con firma en cada campo
Que el cliente y Lupe escriban en el mismo lugar y se vea quién cargó qué.
**Es lo que evita que la cola quede ciega.**

### 4 · Los micro-pasos con su entrenador
El mapa único: cada cuello va a su micro-paso, cada micro-paso a su entrenador,
**y el entrenador abre con el diagnóstico adentro.** El mismo mapa se inyecta
en los ocho prompts para que deriven bien — incluido Diego.

### 5 · Lanzado o instalando
El dato, el filtro, y las dos clases de ítem en la cola.

### 6 · Las agendas por webhook
Una URL más en GHL, con el mecanismo que ya funciona para el cobro.

---

## El consejo que la app le va a dar el primer día

Cuando el cliente arme su campaña, antes de encender:

> **Un solo conjunto de anuncios, con tus tres piezas adentro.**
> Si armás tres campañas separadas, cada una recibe un tercio del presupuesto
> y ninguna alcanza a aprender. Juntas, el algoritmo optimiza sobre el total
> y vos igual ves cuál pieza gana.
>
> **Público amplio: tu país, edad y sexo. Nada más.**
> Con este presupuesto, segmentar por intereses lo parte en pedazos.
>
> **Y no lo toques por catorce días.** El día malo es parte del promedio.
