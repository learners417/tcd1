# EL CIRCUITO — de un número a una corrección

En cinco días se encienden las campañas de los once. A partir de ahí, todo el
negocio depende de que este circuito funcione:

> **entra el dato → la app dice qué micro-paso está roto → dice qué hacer y
> con quién → el entrenador abre sabiendo → se corrige → se vuelve a medir**

Tiene que funcionar con **el cliente que sube todo** y con **el que no sube
nada**. Y tiene que funcionar también con **el que ni siquiera lanzó** y lleva
cuatro semanas trabado en su método.

---

# PARTE 1 · LA CARGA — que nunca quede ciega

## 1.1 Un formulario, dos puertas, y cada campo sabe quién lo cargó

No hay «tablero del cliente» y «tablero del equipo». Hay **un solo lugar** con
los mismos campos, al que se entra desde dos lados: el cliente por Campañas,
Lupe por la ficha del cliente.

Y cada campo muestra su origen:

> **Gasto de la semana** · $340
> *lo cargó Lupe el lunes*
>
> **Conversaciones** · 18
> *las cargó Rosana el viernes*
>
> **Agendas** · —
> *nadie lo cargó todavía*

**Eso resuelve la carga a medias sin ninguna regla.** El que entra ve qué falta
y lo completa. No hay que coordinar nada ni preguntar quién hizo qué.

## 1.2 La app diagnostica con lo que hay, y dice qué le falta

Esta es la regla que evita el silencio:

> Con lo que tengo puedo decirte que **el anuncio está trayendo gente**.
> Para saber si el problema es el mensaje o la llamada, **me falta cuántas
> agendas hubo.**

Nunca se calla. Nunca inventa. **Dice hasta dónde llega y qué le falta para
llegar más lejos** — y eso convierte el dato faltante en una tarea concreta en
vez de un vacío.

## 1.3 Quién carga qué, por defecto

| Dato | Quién | Por qué |
|---|---|---|
| Conversaciones nuevas de hoy | El cliente, 30 segundos | Están en su DM |
| Gasto y alcance por anuncio | El equipo, 2 min semanales | Están en Meta, donde Lupe ya entra |
| **Agendas** | **Sola, por webhook** | Ver 4.2 |
| Llamadas tomadas y ventas | El cliente, al cerrar | Solo él sabe si vino y si pagó |

**«Por defecto» no significa «solamente».** Cualquiera puede cargar cualquier
campo. Lo que la tabla dice es de quién se espera, para que la app sepa a quién
recordarle.

---

# PARTE 2 · LOS SIETE MICRO-PASOS

Cada uno con su número, qué significa si falla, y **quién lo entrena**.

| # | El micro-paso | El número | Si falla, es que… | Entrenador |
|---|---|---|---|---|
| 0 | **El presupuesto** | gasto vs objetivo | invierte de menos para lo que quiere | **Ramiro** |
| 1 | **El anuncio** | alcance → comentarios | no para el scroll | **Mateo** (guion) · **Caro** (grabar) |
| 2 | **El mensaje** | comentarios → conversaciones | la palabra clave o la automatización | 🔧 **técnico** |
| 3 | **La conversación** | conversaciones → agendas | el setting: pregunta poco o cierra tarde | **Sofi** |
| 4 | **La confirmación** | agendas → llamadas tomadas | no confirma el mismo día | **Sofi** |
| 5 | **La llamada** | llamadas → ofertas | no llega a decir el precio | **Diego** |
| 6 | **El cierre** | ofertas → ventas | el closing | **Diego** |
| 7 | **El cobro** | ventas → cobrado | cómo ofrece el pago | **Bruno** |

**El diagnóstico va de arriba hacia abajo y se detiene en el primero que
falla.** Si el anuncio no trae gente, no tiene sentido hablar del cierre: no
hay a quién cerrarle. Eso es lo que hace que Lupe no tenga que priorizar — la
app ya lo hizo.

## Sobre la landing y el video

En la campaña que van a encender —comentario, mensaje, conversación— **no hay
landing intermedia**, así que no hay nada que medir ahí. El video vive dentro
del anuncio y se mide con el paso 1.

Si más adelante algún cliente usa landing, entra un paso más entre el 2 y el 3.
Lo dejo previsto, no construido: **medir algo que nadie usa es ruido.**

---

# PARTE 3 · DEL DIAGNÓSTICO AL ENTRENADOR

## 3.1 El entrenador abre sabiendo

Hoy, si el cliente entra a hablar con Sofi, empieza de cero: tiene que
explicarle su situación.

**Propongo que el entrenador reciba el diagnóstico antes de la primera
palabra.** No que el cliente le cuente: que Sofi ya lo sepa.

> **Sofi:** Vi tus números de esta semana: hablás con 18 personas y agendás 2.
> El anuncio está trayendo bien; el problema está en la conversación.
> Mostrame tres charlas completas, desde el primer mensaje hasta donde se
> enfriaron.

Eso cambia la sesión entera. El cliente no tiene que saber qué preguntar — y
**el que no sabe qué preguntar es justamente el que más ayuda necesita.**

## 3.2 Las capturas van con el entrenador

Tu pregunta de dónde suben las capturas de setting o de closing: **con el
entrenador, no en Campañas ni en Métricas.**

Porque en Campañas y Métricas están **los números**, y un número dice *dónde*
mirar pero nunca *qué* arreglar. Para eso hay que ver la conversación real.

**Y esto ya se puede hacer:** `api/ai/vision.ts` existe y lee imágenes. Sofi
puede recibir la captura del DM y decir qué se rompió, línea por línea. Diego
puede recibir las notas de la llamada.

## 3.3 El botón que cierra el círculo

En la tarjeta de la cola, y en el tablero del cliente:

> **→ Hablar con Sofi sobre esto**

Un toque. Sin explicar nada. El diagnóstico viaja solo.

---

# PARTE 4 · LO QUE HAY QUE AGREGAR

## 4.1 El estado de campaña, en primera línea

Un dato nuevo: **encendida desde cuándo**. Con eso:

- La lista se parte en dos: **lanzados** e **instalando**
- La ficha abre en la conversación que corresponde
- **Y la cola trata distinto a cada uno** (ver 4.3)

## 4.2 Las agendas por webhook de GHL

El mecanismo ya funciona en producción: `api/ghl-webhook.ts` recibe el aviso de
«pago recibido» y activa el plan del comprador.

**Una URL más, para «cita agendada».** Se pega una vez por cliente en su
workflow. Sin API, sin tokens.

**Por qué importa más que ningún otro dato:** la agenda es lo que separa «el
mensaje falla» de «la llamada falla». Sin ella, el diagnóstico se corta justo
en el medio del embudo. Y es el número que nadie carga bien a mano, porque pasa
en cualquier momento.

## 4.3 Los que todavía no lanzaron

Un cliente trabado hace cuatro semanas en su método **no tiene un problema de
números: tiene un problema de decisión.** Y no se destraba con un mensaje.

La cola tiene que tratarlo distinto:

> **Marina** · instalando · semana 4 en «Método y oferta»
> Abrió la sesión del método tres veces y no la cerró. No le faltan datos:
> está trabada en decidir.
> **→ Agendar 30 minutos con Javo. Esto no se resuelve por mensaje.**

**Dos clases de ítem en la misma cola:**

| Lanzados | Instalando |
|---|---|
| El problema es un número | El problema es un avance |
| Se corrige con un ajuste | Se destraba con una decisión |
| Va al entrenador | Va a una sesión |

Y el orden entre las dos: **primero los lanzados**, porque hay dinero
corriendo. Salvo que un instalando lleve más de dos semanas trabado — ahí sube,
porque cada semana trabado es una semana sin vender.

---

# PARTE 5 · CÓMO SE VE EN LA PRÁCTICA

## El cliente autónomo

Carga su número todos los días. El viernes ve su tablero:

> **Esta semana: 18 conversaciones, 2 agendas.**
> El anuncio está trayendo bien. **Donde se pierde es en la conversación.**
> → *Hablar con Sofi sobre esto*

Entra a Sofi, que ya sabe, sube tres capturas, sale con qué cambiar. Nadie del
equipo tuvo que intervenir.

## El cliente que no carga nada

Lupe carga el gasto el lunes, dos minutos. La app diagnostica lo que puede:

> Con el gasto y el alcance puedo decirte que **el anuncio está trayendo
> gente**. Para saber dónde se pierde, **faltan las conversaciones y las
> agendas.**

Aparece en la cola de Lupe con la acción escrita:

> **Rosana** · lanzada hace 12 días
> Gastó $340 y trajo 40 comentarios, pero no sabemos qué pasó después.
> **→ Pedirle los dos números de la semana.** *[Mandárselo en la app]*

Cuando responde, el diagnóstico se completa solo.

## El cliente a medias

Cargó las conversaciones pero no las ventas. Lupe abre su ficha, ve **«ventas:
nadie lo cargó todavía»**, le pregunta por WhatsApp, lo carga ella. El campo
queda con su nombre.

## El atrasado

No aparece con números. Aparece con:

> **Marina** · semana 4 en «Método y oferta»
> **→ Agendar 30 minutos con Javo.**

---

# PARTE 6 · LO QUE HAY QUE CONSTRUIR

Seis piezas. En este orden, y las tres primeras son las que hacen falta para
los cinco días.

### 1 · Un tablero, dos puertas, con firma en cada campo
Que el cliente y Lupe escriban en el mismo lugar, y que cada campo diga quién
lo cargó y cuándo. **Es lo que resuelve la carga a medias.**

### 2 · El diagnóstico parcial
Que la app diga hasta dónde puede opinar y qué le falta para opinar más. Nunca
callarse, nunca inventar.

### 3 · Los siete micro-pasos con su entrenador
Traducir cada cuello a su micro-paso, con el botón que lleva al entrenador
correspondiente **con el diagnóstico adentro**.

### 4 · Lanzado o instalando
El dato, el filtro, y las dos clases de ítem en la cola.

### 5 · Las capturas con el entrenador
Que Sofi y Diego puedan recibir una imagen y analizarla.

### 6 · El webhook de agendas
Una URL más en GHL.

---

## Mi recomendación sobre el orden

**Las tres primeras antes de encender.** Sin ellas, el primer viernes con once
campañas corriendo va a ser once conversaciones de WhatsApp preguntando cómo
viene cada uno — que es exactamente lo que estamos sacando.

**Las tres últimas en la primera semana de campaña**, cuando ya haya números
reales y se vea qué falta de verdad.
