# Los once cinturones

Los grados reales del taekwondo. El color cuenta la historia de una semilla que
se vuelve árbol, y esa es exactamente la historia del camino.

**En taekwondo cada grado tiene su poomsae: una forma que se ejecuta, no que se
explica.** Acá pasa lo mismo. Cada cinturón pide una forma, y la forma es la
evidencia.

---

## La progresión

| Grado | Cinturón | Día | Significado del color | La forma |
|---|---|---|---|---|
| 10.º gup | Blanco | 1 | La semilla bajo la nieve | Búnker abierto y pacto publicado |
| 9.º gup | Blanco punta amarilla | 3 | La semilla toca la tierra | Su hora real neta escrita a mano |
| 8.º gup | Amarillo | 12 | La tierra | Primer cobro a su cartera al precio nuevo |
| 7.º gup | Amarillo punta verde | 16 | Asoma el tallo | Método aprobado por el Crítico |
| 6.º gup | Verde | 19 | La planta en pie | Oferta completa en una página |
| 5.º gup | Verde punta azul | 25 | La planta busca el cielo | El enlace vivo de su página |
| 4.º gup | Azul | 28 | El cielo | Agendarse a sí mismo de punta a punta |
| 3.º gup | Azul punta roja | 31 | Se acerca el peligro | Campaña activa, con fecha y hora |
| 2.º gup | Rojo | 45 | El sol, y el aviso | Cobro de alguien que no lo conocía |
| 1.º gup | Rojo punta negra | 55 | Controla la fuerza | Captura desde el celular de su consultante |
| 1.er Dan | Negro | 90 | Lo que ya no se altera | Los dos números lado a lado |

---

## Reglas de los grados

**1 · El grado se gana, nunca se regala por fecha.** Si el día 12 no cobró, el
amarillo espera. El camino sigue igual.

**2 · Ningún grado bloquea el avance del camino.** Un cinturón que falta bloquea
agentes, no sesiones. Un mal mes no puede dejar a un cliente parado.

**3 · Los grados que dependen de otra persona tienen ventana, no fecha.** El
amarillo (día 12), el rojo (día 45) y el negro (día 90) dependen de que alguien
pague. Esos tres se muestran como "en ventana" y se otorgan cuando ocurre.

**4 · El grado se muestra como tira de color en la cabecera de Hoy**, siempre. Es
lo primero que ve cuando abre la app.

**5 · Ceremonia mínima.** Cuando se otorga: la tira cambia de color, aparece el
significado del color en una línea, y qué se desbloquea. Sin confeti, sin música,
sin pantalla completa. **La seriedad es la recompensa.**

---

## Validación, grado por grado

### 10.º gup · Blanco · día 1

| Evidencia | Tipo | Cómo se valida |
|---|---|---|
| Foto del búnker | `imagen` | Agente de visión: mesa, cuaderno visible, sin pantalla encendida |
| Pacto publicado | `imagen` | Se lee su nombre y una fecha |
| El por qué | `texto` | Mínimo 8 palabras, primera persona |

**Desbloquea:** el día 2.

---

### 9.º gup · Blanco punta amarilla · día 3

| Evidencia | Tipo | Cómo se valida |
|---|---|---|
| Hora real neta | `numero` | Mayor a cero, menor a 500. Coherente con los datos del día 2 (±20%) |
| El número a mano | `imagen` | Se lee un número escrito a mano |
| La palabra del cuerpo | `texto` | Una palabra de una lista abierta |

**Desbloquea:** El Espejo.

**Si el número no cierra con los datos del día 2**, la app no rechaza: pregunta
cuál de los dos está mal y le deja corregir el que quiera.

---

### 8.º gup · Amarillo · día 12 *(en ventana)*

| Evidencia | Tipo | Cómo se valida |
|---|---|---|
| Primer cobro | `evento` | Webhook del Sistema: pago recibido, monto ≥ `precio_digno` |

**No se sube captura: se detecta.**

Si el monto es menor al precio digno, se registra igual y muestra:
> *Este entró más barato. El cinturón amarillo espera al primero al precio nuevo.*

**Desbloquea:** nada nuevo. Es un grado de confirmación, y ese es su valor: el
primero que se gana con dinero real.

---

### 7.º gup · Amarillo punta verde · día 16

| Evidencia | Tipo | Cómo se valida |
|---|---|---|
| Método aprobado | `texto` | Veredicto `aprobado` del Crítico en los tres exámenes |

**Desbloquea:** el día 17.

**Puede reprobar las veces que haga falta.** A la tercera reprobación, la app
sugiere: *"El Crítico te marcó lo mismo tres veces. Volvé al panel CLI-1 de La
Clínica antes de presentar de nuevo."*

---

### 6.º gup · Verde · día 19

| Evidencia | Tipo | Cómo se valida |
|---|---|---|
| Oferta en una página | `texto` | Promesa con resultado, plazo, entregables, precio ≥ día 9 |
| Garantía + 3 compromisos | `texto` | La garantía no promete resultado; cada compromiso tiene verbo y número |
| Escalera de 5 | `texto` | Cinco niveles con el tercero marcado |
| Rodaje agendado | `evento` | Fecha y hora bloqueadas |

**Desbloquea:** El Escriba y el sistema 3 completo.

---

### 5.º gup · Verde punta azul · día 25

| Evidencia | Tipo | Cómo se valida |
|---|---|---|
| Página publicada | `url` | Responde 200 · contiene su promesa · tiene botón de agenda o link de pago · carga en móvil |

**Desbloquea:** el día 26 (`F-PAGINA`).

---

### 4.º gup · Azul · día 28

| Evidencia | Tipo | Cómo se valida |
|---|---|---|
| Agenda de prueba | `evento` | Formulario respondido + calendario reservado + confirmación enviada, todo del mismo contacto |

**Desbloquea:** El Sparring.

**Es el grado que más se disfruta**, porque la evidencia es que su circuito
funcionó con él adentro.

---

### 3.º gup · Azul punta roja · día 31

| Evidencia | Tipo | Cómo se valida |
|---|---|---|
| Campaña activa | `evento` | Conexión con Meta: campaña en estado activo, un conjunto, tres anuncios |

**Desbloquea:** El Tablero (día 33).
**Activa:** `F-14DIAS` y `F-TABLERO`.

---

### 2.º gup · Rojo · día 45 *(en ventana)*

| Evidencia | Tipo | Cómo se valida |
|---|---|---|
| Cobro del sistema | `evento` | Pago recibido de un contacto cuyo origen es la campaña |

**Desbloquea:** El Arquitecto (día 47).

**El color rojo es el sol y también el aviso de peligro, y acá se usan los dos
sentidos.** Al otorgarlo, la app muestra el permiso del día 43 arriba de todo:

> *El primero da miedo. El segundo es donde la mayoría se negocia sola. Tu
> permiso está escrito, leelo.*

---

### 1.º gup · Rojo punta negra · día 55

| Evidencia | Tipo | Cómo se valida |
|---|---|---|
| Compra de prueba | `evento` | Pago propio registrado en su app |
| Consultante adentro | `imagen` | Captura desde el celular: su marca + una etapa visible |
| Su cadena | `texto` | Los cuatro números de la máquina, con datos propios del tablero |

**Desbloquea:** El Estratega (día 61).

---

### 1.er Dan · Negro · día 90 *(en ventana, sin vencimiento)*

| Evidencia | Tipo | Cómo se valida |
|---|---|---|
| Diez consultantes | `evento` | Contados desde MCD, todos al precio digno o mayor |
| Hora real neta final | `numero` | Cargada el día 87 |

**Si llega:** la app muestra su forma final —los dos números lado a lado, su
método con nombre, su página, su campaña, su app con consultantes adentro— y una
línea:

> *En taekwondo el cinturón negro no es el final: es el primer Dan, el punto
> donde empieza el aprendizaje real.*

**Si no llega el día 90:** el camino no se cierra. Muestra cuántos lleva, cuál es
su cuello, y deja el ciclo de la semana abierto sin fecha. El negro se otorga el
día que llega al décimo, sea el 90 o el 140.

---

## Pantalla del cinturón

Vive dentro de Camino. Tres bloques, en este orden:

**1 · Su tira.** El color actual, grande, con el grado y el significado.

**2 · La escalera.** Los once en columna. Los ganados en color, el actual
marcado, los que faltan en gris con su forma escrita. **Los de adelante se ven:
saber qué viene es parte del entrenamiento.**

**3 · Las formas pendientes.** Qué le falta exactamente para el próximo, con el
enlace a la sesión que lo produce.

**Lo que nunca muestra:** porcentaje de avance, puntos, medallas, comparación con
otros clientes. **Un dojo no tiene ranking.**

---

## Por qué once y no nueve

La versión anterior tenía nueve niveles inventados. Los once del taekwondo traen
tres cosas gratis:

**El significado del color ya está escrito** y coincide con el camino sin
forzarlo. Amarillo es la tierra y cae el día que cobra a su propia cartera. Rojo
es el sol y el aviso, y cae el día que más riesgo tiene de bajar el precio.

**Las puntas resuelven el medio paso.** Hay momentos que valen un grado pero no
un salto de color: la página publicada, el método aprobado, la campaña encendida.
Las puntas existen para eso y no hubo que inventarlas.

**El negro como primer Dan resuelve el día 88.** No hay que convencer a nadie de
seguir: hay que decirle lo que cualquiera que entrenó ya sabe.
