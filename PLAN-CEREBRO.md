# EL CEREBRO — que todo el trabajo viva en un solo lugar

Tenés razón en las tres cosas, y las tres son la misma.

---

# PARTE 1 · LO QUE ENCONTRÉ

## 1.1 El botón «Mandárselo en la app» no manda nada

Verificado: llama a `marcar()`, que solo tacha el ítem en la pantalla. **No
escribe ningún mensaje, no le llega nada al cliente, y no queda registro.**

Es la peor clase de error de interfaz: **el botón promete algo y quien lo toca
cree que pasó.**

## 1.2 La cola y las Tareas son dos sistemas que no se hablan

La cola detecta qué está roto y escribe la acción. **Y ahí se termina.** No
crea una tarea, no queda asignada, no se puede modificar, y desaparece al
recargar.

Mientras tanto, `admin_tareas` ya tiene todo lo que hace falta —dueño, cliente,
prioridad, vencimiento, estado— **y hasta una función `fetchTareasHoy` que
nadie usa.**

**La infraestructura está. Falta el cable.**

## 1.3 Por eso «no está claro por qué son esas tareas»

Porque son dos listas distintas: una que la app calculó y otra que alguien
escribió a mano. **Nunca se ven juntas, así que no hay forma de entender el
día completo.**

---

# PARTE 2 · EL CEREBRO

## La idea, en una línea

> **La cola no muestra trabajo: lo CREA.** Y todo el trabajo —venga de donde
> venga— vive en un solo lugar.

## Cómo funciona

```
   La cadena detecta un cuello
            ↓
   La cola propone una tarea, con su acción escrita
            ↓
   Se acepta → SE CREA una tarea real, con dueño y vencimiento
            ↓
   Aparece en HOY, junto a las que escribió Lupe y las que asignó Javo
            ↓
   Se toca → LLEVA A DONDE SE RESUELVE
            ↓
   Se cierra → se cierra de verdad, y el cierre del día la cuenta
```

**Y al revés también:** lo que Lupe crea en Tareas aparece en su Hoy. Es la
misma lista mirada desde dos lados — nunca dos listas.

## Cada tarea sabe a dónde lleva

Esto es lo que la vuelve útil en vez de una lista de recordatorios:

| Lo que hay que hacer | El botón lleva a | Y cuando vuelve |
|---|---|---|
| Mandarle un mensaje | **lo manda de verdad**, en la app | queda registrado y la tarea se cierra |
| Crear contenido | al Creador, con el brief cargado | la pieza queda atada a la tarea |
| Montar una campaña | al Constructor de ese cliente | — |
| Responder a un cliente | a su conversación | la respuesta cierra la tarea |
| Revisar sus números | a su tablero | — |
| Escalar | crea la tarea para Javo o el dev | y sale de su lista |

**Nunca «anda a buscarlo».** Siempre un botón que abre lo que hace falta.

## De dónde salen las tareas

Cinco fuentes, una sola lista:

1. **La cadena** — un cuello detectado
2. **El soporte** — un mensaje sin responder pasado el compromiso
3. **El recorrido** — un cliente trabado en su etapa
4. **Una persona** — Lupe, Javo o el dev escribiendo una
5. **Una sesión** — los pendientes que salen de una transcripción

Cada tarea guarda **de dónde vino**. Eso es lo que contesta *«¿por qué esta
tarea?»* sin que nadie tenga que preguntar.

## El orden lo decide la app, no el que mira

Ya está construido —dinero en riesgo, semanas repetidas, lo vencido primero—
y solo hay que aplicarlo a la lista unificada. **Con una regla nueva: lo que
tiene fecha vencida manda sobre todo lo demás**, porque una tarea vencida ya
falló una vez.

---

# PARTE 3 · LOS FRENOS DE ATENCIÓN

Dijiste que los checks de confirmación te gustaron. **Estoy de acuerdo, y hay
que usarlos con criterio: si aparecen siempre, dejan de frenar a nadie.**

Propongo **tres niveles, y nada más**:

### 🟡 Confirmar — para lo que se puede deshacer
> *«¿Confirmás que el comentario llegó al mensaje, el mensaje al link, y el
> checkout cobró de verdad?»*

El que ya existe. Un diálogo, y sigue.

### 🔴 Escribir para confirmar — para lo que cuesta dinero o no se deshace
Encender una campaña · subir el presupuesto · dar de baja a un cliente ·
borrar el ADN de alguien.

> Vas a encender la campaña de Rosana con **$140 por semana**.
> Escribí **ENCENDER** para confirmar.

**No es burocracia: es que el gasto empieza en ese momento** y quien lo aprueba
tiene que estar mirando.

### ⚫ Con testigo — para lo que afecta a un tercero
Cambiar el precio de un cliente · tocar su método · mandar algo a nombre de él.

> Esto cambia lo que Rosana le cobra a sus pacientes.
> **Queda registrado con tu nombre** y ella lo va a ver.

**El registro no es control: es que el que decide sepa que decide.**

---

# PARTE 4 · LA CASA, COMO TIENE QUE SER

Tenés razón: hoy es una lista de títulos. Le falta todo lo que la hace valer.

## Lo que va en cada sesión

**Un video corto** — de tres a cinco minutos. El lugar está; lo que falta es
que exista el espacio para pegarlo y que se vea bien en el teléfono.

**Un diagrama** — el embudo de siete pasos dibujado, la cadena de valor con
sus tramos, el mapa de quién resuelve qué.

**Datos concretos** — no «el presupuesto importa» sino *«$136 por semana en
tres anuncios da $6,50 por día cada uno, y Meta necesita cincuenta eventos
semanales para salir de aprendizaje»*.

**La acción real** — ya está.

## Y tres bloques nuevos que hoy no existen

### **Por qué Javo**
Tu historia. **Y esto no lo puedo escribir yo**: necesito que me la cuentes.
Por qué un abogado que dirigió un centro cultural terminó armando esto, y qué
vio que los demás no.

Sin eso, el equipo vende un sistema. Con eso, vende una convicción.

### **El sistema por dentro**
Cómo funciona el mecanismo completo, en un solo lugar: qué mide la app, cómo
decide, por qué un cuello y no tres, de dónde salen las bandas, por qué una
regla y no un modelo.

**Es lo que hace que alguien pueda defender una decisión de la app frente a un
cliente que la cuestiona.**

### **Los valores, con su costo**
Los siete principios ya están escritos. Lo que falta es lo que los vuelve
reales: **qué se deja de ganar por sostener cada uno.**

> *No retenemos con descuento.* Eso significa que algunos meses se va alguien
> que se podría haber quedado. Lo aceptamos porque el descuento arruina el
> precio para los otros diez.

---

# PARTE 5 · LAS TABS

Los cuatro momentos se quedan. **Lo que cambia es lo de adentro.**

| | Qué contiene | Cambio |
|---|---|---|
| **Hoy** | tu día, tu lista única, mi rol, la casa | la lista pasa a ser una sola |
| **La Semana** | marcador, funciones, trabas, decisiones | — |
| **Clientes** | la lista con filtros, y la ficha completa | la ficha se arma por etapa |
| **El Negocio** | tu motor, el equipo, la IA, el contenido | — |

**Y la tab «Tareas» desaparece**, porque las tareas ya están en Hoy. Tener una
tab aparte es lo que hizo que fueran dos listas.

---

# PARTE 6 · LOS TURNOS

Cuatro, y el orden importa porque cada uno depende del anterior.

### **1 · El cerebro** — la lista única
La cola crea tareas de verdad · las cinco fuentes con su origen · el orden
aplicado a la lista completa · y **el botón de mensaje que manda de verdad**.

### **2 · Los destinos** — que cada tarea lleve a algún lado
El creador con el brief cargado, la conversación, el tablero, el constructor.
Y el escalado que crea la tarea del otro y saca la tuya.

### **3 · Los frenos y la casa**
Los tres niveles de confirmación, y La Casa con videos, diagramas, datos, tu
historia, el sistema por dentro y los valores con su costo.

### **4 · El lado del cliente**
Lo mismo hacia el otro lado: que sus tareas también salgan de un solo lugar,
con el mismo criterio de «esto lleva a donde se resuelve».

---

# LO QUE NECESITO DE VOS

Tres cosas que no puedo inventar:

**1 · Tu historia.** Para el bloque «Por qué Javo». Contámela como se la
contarías a alguien que entra a trabajar mañana: por qué esto y no otra cosa,
qué viste, qué te hartó.

**2 · Los videos.** ¿Los tenés grabados, los vas a grabar, o dejo el espacio
listo y vacío? Si es lo último, La Casa igual funciona — pero conviene que el
espacio exista desde ahora.

**3 · Una decisión.** Cuando la cola propone una tarea, ¿se crea **sola** o
alguien la acepta?

> **Mi recomendación: sola.** Si hay que aceptarlas, se acumula una bandeja de
> propuestas que nadie mira, y eso es exactamente el problema que estamos
> resolviendo. Que se creen solas y se puedan descartar en un toque.

Con eso arranco por el cerebro.
