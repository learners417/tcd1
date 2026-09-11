# Las cinco salas de apoyo

Ninguna es un tab. Las cinco existen para que el producto funcione sin que nadie
conteste un mensaje.

**El criterio que las justifica:** cada una reemplaza un motivo concreto por el
que hoy el cliente escribe a Javo.

| Sala | Reemplaza | Vive en |
|---|---|---|
| La Biblioteca | "¿Dónde estaba esto que explicaste?" | Camino |
| El Cuaderno | "Perdí lo que escribí en la semana 1" | Camino |
| El Ring | "¿Estoy mejorando o no?" | Dojo |
| El Reloj | "No me alcanza el tiempo" | Hoy |
| SOS | "Estoy trabado" | Flotante |

---

# 1 · La Biblioteca

Los cuatro manuales adentro de la app, por paneles, con buscador.

**Por qué es obligatoria.** Cada video abre nombrando su panel: *"esto está
desarrollado en La Clínica, panel CLI-2B"*. Si ese panel no es un enlace vivo, la
frase es peor que no decir nada: le avisa que existe algo que no puede abrir.

### Los cuatro manuales

| Manual | Códigos | De qué |
|---|---|---|
| **El Liderazgo** | LID-1 a LID-n | Él. El búnker, el dinero, la valoración, el permiso |
| **La Clínica** | CLI-1 a CLI-6 | Su programa. Método, prueba, oferta, garantía, escalera, alta, entrega |
| **El Camino** | CAM-1 a CAM-n | Su sistema de venta. Circuito, página, VSL, campaña, tablero, máquina |
| **La Llamada** | LLA-1 a LLA-n | La venta. La W, el previo, la autopsia, las objeciones |

### Estructura de un panel

```
PANEL
  codigo           CLI-2B
  manual           La Clínica
  titulo           Tu garantía de extensión
  cuerpo           el texto del manual
  checkboxes[]     lo que hay que tildar
  campos[]         lo que hay que escribir, se guarda solo
  piezas[]         qué videos lo nombran
  sesion_dia       en qué día del camino se usa
  descargable      sí | no
```

### Reglas

1. **Se abre desde el video**, con un botón bajo el reproductor: "Ver el panel
   CLI-2B". No hay que buscarlo.
2. **Los campos se guardan solos** y escriben al ADN. Lo que escribe en el panel
   de la garantía **es** su garantía.
3. **Buscador por texto completo**, no por título. Busca "extensión" y llega.
4. **Los paneles que todavía no vio están disponibles.** La Biblioteca no se
   bloquea. El camino tiene orden; el material de consulta no.
5. **Descarga en PDF** de cada manual completo, con su marca. Es lo que va a
   mostrar cuando le pregunten qué compró.

---

# 2 · El Cuaderno

Donde viven las salidas del protocolo. Diez entradas en noventa días, y son las
diez cosas más privadas que escribe.

### Qué guarda

| Día | Entrada | Tipo |
|---|---|---|
| 3 | Su número y la palabra del cuerpo | texto + número |
| 4 | Las tres frases de "mientras cobre poco" | texto |
| 5 | Lo que apareció en el audio | imagen del cuaderno físico |
| 6 | Los tres que lo formaron y sus frases | texto |
| 7 | Los tres vendehumos y la capacidad elegida | texto |
| 20 | Las dos columnas de cobrar libera al otro | texto |
| 21 | El audio del ancla | archivo |
| 43 | El permiso, escrito y dicho | texto + archivo |
| 44 | La lista de deudas, tachada | imagen |
| 86 | Su día siguiente, en presente | texto |

### Reglas

1. **Es de él.** La app lo dice en la primera entrada: esto no lo ve nadie del
   equipo, ni aparece en ningún tablero.
2. **Es lo único que no se puede editar después.** Se puede agregar, nunca
   reescribir. Un cuaderno que se corrige no sirve de espejo.
3. **El Espejo lo lee y lo devuelve** en los días de examen. Textual, sin
   comentario.
4. **Se descarga entero al final**, en PDF, con las fechas. Es el registro de los
   noventa días que ninguna otra app le da.

### La pantalla

Línea de tiempo vertical. Una entrada por fila, con su fecha y su día del camino.
Sin carpetas, sin etiquetas, sin favoritos.

**Arriba de todo, siempre:** la entrada del día 3. Su número. Es lo que le
recuerda por qué empezó.

---

# 3 · El Ring

Historial de sparring. Vive dentro del Dojo, debajo del agente Sparring.

**Qué resuelve.** Después de dos llamadas perdidas, el cliente concluye que no
sabe vender y abandona. El Ring le muestra que sus cuatro números se están
moviendo aunque todavía no haya vendido.

### Qué guarda por sesión

```
SESIÓN DE RING
  fecha
  tipo               simulada | real
  duracion
  minuto_precio
  preguntas_antes
  segundos_silencio
  pidio_decision     sí | no
  resultado          solo en reales: vendió | no ahora | no califica
  una_cosa           lo que eligió cambiar
```

### La pantalla

**Arriba: las cuatro curvas.** Una por número, en la misma escala de tiempo,
chiquitas y juntas. Lo que se ve de un vistazo es la forma: el minuto del precio
bajando, las preguntas subiendo, el silencio alargándose.

**Abajo: la línea de tiempo.** Cada sesión con sus cuatro números y la cosa que
eligió cambiar. Las simuladas en gris, las reales en color.

### Reglas

1. **Las simuladas cuentan igual que las reales** para las curvas. Practicar es
   entrenar.
2. **"Una cosa" es obligatoria y es una sola.** Si elige tres, la app le pide que
   elija una. Nadie corrige tres cosas a la vez en una llamada.
3. **El Ring no muestra tasa de cierre hasta la quinta llamada real.** Antes de
   eso el número miente y desmoraliza.
4. **Desde la quinta, la tasa de cierre alimenta el objetivo de costo por agenda**
   del tab Campañas. Es el único dato que cruza salas.

---

# 4 · El Reloj

La jornada de cuatro horas, en la pantalla Hoy. Tres bloques y nada más.

```
┌─────────────┬─────────────┬─────────────┐
│  ATENDER    │  CONSTRUIR  │   DIRIGIR   │
│    2 h      │     1 h     │     1 h     │
│             │   ← ahora   │             │
└─────────────┴─────────────┴─────────────┘
```

### Reglas

1. **No es un cronómetro.** No cuenta minutos, no suena, no penaliza. Marca en
   qué bloque está según la hora del día que él configuró el día 1.
2. **La sesión del camino vive en Construir**, siempre. Si la abre fuera de ese
   bloque, no pasa nada: el Reloj es un marco, no una regla.
3. **El bloque Dirigir arranca casi vacío y se llena solo.** En la semana 1 dice
   "todavía no hay nada acá, y está bien". Desde el día 31 muestra las agendas del
   día. **Ver ese bloque llenarse es la prueba visual de que el negocio cambió.**
4. **El día 87 muestra la comparación:** cómo se repartían sus horas el día 2 y
   cómo se reparten hoy.

---

# 5 · SOS

Un botón flotante, presente en todas las pantallas menos en modo rodaje.

**La respuesta correcta a "estoy trabado" es un agente, no una persona.**

### Qué hace al tocarlo

Abre una hoja con **tres opciones y ninguna más**:

```
¿Qué te pasa?

  → No entiendo qué hacer hoy
  → Lo intenté y no me sale
  → Algo no funciona
```

| Elección | A dónde va |
|---|---|
| No entiendo qué hacer hoy | El panel del manual de la sesión de hoy, abierto |
| Lo intenté y no me sale | El agente que corresponde al día, con el contexto cargado |
| Algo no funciona | Diagnóstico técnico: qué conexión falló, y el tutorial de Lupe correspondiente |

### Reglas

1. **Nunca un formulario, nunca un mail, nunca "te respondemos en 24 horas".**
2. **El agente arranca sabiendo dónde está.** No pregunta "¿en qué te ayudo?":
   abre diciendo qué sesión es y qué debería estar produciendo.
3. **Si el cliente tiene mentoría contratada**, aparece una cuarta opción abajo,
   separada: "Llevarlo a la sesión con Javo". **Sin mentoría, esa opción no
   existe** — y la app funciona igual.
4. **Se registra qué eligió y en qué día.** Tres SOS del mismo tipo en el mismo
   día del camino, en clientes distintos, significa que esa sesión está mal
   explicada. **Es el mejor dato de producto que vas a tener.**

---

## La tabla que cierra el producto

Cada motivo por el que hoy te escriben, y dónde se resuelve solo.

| Motivo | Se resuelve en |
|---|---|
| "¿Cómo era esto que explicaste?" | La Biblioteca, desde el video |
| "¿Qué hago hoy?" | Hoy, siempre hay una sola cosa |
| "No me sale el método" | El Crítico |
| "No sé qué escribir" | El Escriba |
| "Me da miedo grabar" | La Cámara |
| "Se me cayó la llamada" | El Sparring y el Ring |
| "No me funciona la campaña" | El Tablero, con su cuello |
| "¿Está bien así?" | La evidencia, con validación automática |
| "¿Estoy avanzando?" | El cinturón y el Ring |
| "Perdí lo que escribí" | El Cuaderno |
| "No me alcanza el tiempo" | El Reloj |
| "Algo no anda" | SOS, opción tres |

**Si aparece un motivo nuevo que no está en esta tabla, falta una sala.** Ese es el
criterio para agregar cualquier cosa al producto de acá en adelante.
