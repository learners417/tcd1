# Sistema visual

Los tokens salen de la app que ya existe. **No se rediseña nada: se documenta lo
que hay y se completa lo que falta.**

Y una decisión que atraviesa todo el documento: **esta app se diseña para una
cabeza que se distrae.** No como accesibilidad agregada al final, sino como el
criterio que resuelve cada duda de diseño.

---

## 1 · Por qué el diseño se piensa para TDAH

El avatar es un profesional de salud con la agenda llena que llega a la app
después de atender, cansado, con el teléfono en la mano y ocho cosas pendientes.
Tenga o no un diagnóstico, **esa es una cabeza con la atención fragmentada.**

Lo que funciona para esa cabeza funciona para todas. Lo contrario no.

### Las doce reglas

**1 · Una sola cosa por pantalla.** La pantalla Hoy tiene un botón. No dos, no un
menú de sesiones. Si hay que elegir, ya se perdió.

**2 · La app recuerda, él no.** Nunca "acordate de cargar", nunca "no olvides".
Todo lo que hay que sostener en la cabeza lo sostiene el ADN, el Cuaderno o el
Espejo. **Una app que pide memoria de trabajo es una app que se abandona.**

**3 · Cero decisiones de navegación.** El día se abre solo. No hay que buscar
dónde quedó.

**4 · Reanudar exacto.** El estado se guarda por paso, no por sesión. Si lo
interrumpieron en el paso 3 de 6, vuelve al paso 3 con los tres anteriores
tildados.

**5 · Tiempo visible, nunca punitivo.** El chip de duración sí: saber que son 30
minutos es lo que permite empezar. La cuenta regresiva no: vigilar el reloj
mientras trabaja rompe la tarea.

**6 · Ninguna insignia roja.** Cero badges numéricos, cero puntos rojos, cero
"tenés 3 pendientes". La notificación ansiosa activa menos de lo que interrumpe.

**7 · Cierre inmediato.** Evidencia entregada es día terminado. Nada queda "casi
hecho" arrastrándose a mañana.

**8 · Fragmentado por defecto.** Los pasos son lista numerada con casilla, nunca
un párrafo con instrucciones adentro. **Un párrafo con cuatro instrucciones se
lee como cero instrucciones.**

**9 · Novedad controlada.** Nada cambia de color, de forma o de lugar sin
motivo. La única novedad visual programada es el cinturón: cuando sube, cambia
la tira. Eso vuelve la novedad una recompensa y no un ruido.

**10 · Las listas terminan.** Sin scroll infinito, sin carga progresiva. Ver el
final de una lista es lo que permite calcular el esfuerzo.

**11 · Piso de 15 píxeles.** Ningún texto de contenido por debajo. Contraste
mínimo AA en todo.

**12 · Una sola animación real en noventa días.** Los dos números del día 87,
apareciendo juntos. Todo lo demás son transiciones de estado de 120 ms o menos.

---

## 2 · Tokens

Los de la app actual, más lo semántico que faltaba.

```css
:root{
  /* superficie */
  --bg:        #FAF5EA;   /* fondo */
  --card:      #FFFDF7;   /* tarjeta */
  --card2:     #F5EFE1;   /* chip, tarjeta secundaria */

  /* líneas */
  --line:      #EBE1CF;
  --line2:     #DFD3BC;

  /* tinta */
  --ink:       #2A2118;   /* texto principal */
  --ink2:      #6E6252;   /* texto secundario */
  --ink3:      #9A8C78;   /* meta, etiquetas */

  /* oro */
  --oro:       #B0822E;
  --oro-d:     #8E6824;
  --oro-soft:  #F3EAD6;

  /* semántico — lo que faltaba */
  --tilde:     #4A7C59;   /* aprobado, tildado, entregado */
  --tacha:     #A33A2A;   /* tachado, retirado, freno */
  --ventana:   #7A6FA3;   /* grado en ventana, esperando */

  /* tipografía */
  --fd: 'Fraunces', Georgia, serif;      /* solo títulos */
  --fb: 'Sora', system-ui, sans-serif;   /* todo lo demás */

  /* forma */
  --r:  20px;   /* botón, tarjeta chica */
  --r2: 26px;   /* tarjeta principal */
  --r3: 99px;   /* chip, tira */
}
```

### El grano

La textura de ruido al 4,5% en `multiply` que ya tiene la app **se queda y no se
toca**. En una pantalla de crema plana, el ojo no encuentra dónde apoyarse. El
grano da superficie sin dar decoración, y eso baja la fatiga de mirar.

### El oro

Un solo oro, `#B0822E`, sobre crema. **Nunca degradé, nunca brillo, nunca
sombra dorada.** Se usa en: la barra de progreso, el botón primario, los íconos
del tab activo, las líneas de un píxel y los numerales.

Sobre fondo oscuro el oro mate se apaga y se ve sucio. **Por eso esta app es
clara y no tiene modo oscuro.** Es una decisión, no una falta.

---

## 3 · Tipografía

Dos familias, roles separados y sin excepción.

| Rol | Familia | Tamaño | Peso | Dónde |
|---|---|---|---|---|
| Título de sesión | Fraunces | 33 / 28 | 400 | Tarjeta de hoy, encabezados |
| Título de sección | Fraunces | 26 / 22 | 400 | Camino, Dojo, Mando |
| Cuerpo | Sora | 17,5 | 400 | Descripciones, pasos |
| Cuerpo fuerte | Sora | 17,5 | 600 | Lo que no se puede saltear |
| Botón | Sora | 18 | 700 | Primario |
| Chip y meta | Sora | 15 | 400 | Duración, qué sella |
| Kicker | Sora | 14 | 700 | HOY, versalita, `letter-spacing: .2em` |
| Etiqueta de tab | Sora | 14 | 400 / 700 | Barra inferior |

**Fraunces nunca escribe una frase larga.** Es de títulos. Un párrafo en serif
display se lee peor, y acá leer peor es abandonar.

**El piso son 15 píxeles.** La única excepción es la etiqueta del tab, a 14, y
solo porque va acompañada de un ícono. **Si algo no entra en 15, el problema es
el texto, no el tamaño.**

Ancho de línea: máximo 62 caracteres. En 430 px eso se da solo.

---

## 4 · Los cinco tabs

```
[ Hoy ]   [ Camino ]   [ Dojo ]   [ Mando ]   [ Clínica ]
```

### Lo que cambia respecto de la app actual

| Antes | Ahora | Por qué |
|---|---|---|
| ADN | **Dojo** | El ADN sube al encabezado del Dojo. Deja de ser un destino y pasa a ser lo que los agentes leen |
| Mentor | **Dojo** | El Mentor era un agente suelto. Ahora son ocho, y viven juntos |
| — | **Mando** | Creativos, Campañas y Números, con solapas |
| Hoy, Camino, Clínica | Igual | No se tocan |

**Ícono del Dojo:** el que hoy usa Mentor. **Ícono del Mando:** la casa/hexágono
que hoy usa Clínica, y Clínica pasa al ícono de agenda. Es el cambio mínimo que
mantiene el reconocimiento.

### Reglas de la barra

- Cinco, nunca seis. **Un sexto tab obliga a leer los cinco.**
- Ícono más etiqueta, siempre. Íconos solos obligan a recordar.
- El activo cambia el trazo del ícono a oro y el peso de la etiqueta a 700.
  **Nada más:** sin fondo, sin píldora, sin subrayado.
- Se oculta en modo rodaje y en el reproductor de audio del día 5.

---

## 5 · Componentes

### Tarjeta de hoy

La única que importa. Fondo `--card`, radio `--r2`, borde `--line`, sombra doble
muy suave.

```
┌──────────────────────────────┐
│ HOY                          │  kicker, oro, versalita
│                              │
│ Tu Matriz ABC                │  Fraunces 33
│ El lenguaje exacto de tus    │  Sora 17,5 ink2
│ consultantes, en sus palabras│
│                              │
│ [⏱ 30 minutos] [✓ Sales con  │  chips
│  tu matriz sellada]          │
│                              │
│ [      Empezar      →    ]   │  botón oro, 20px de alto interior
└──────────────────────────────┘
```

**El segundo chip siempre dice qué se lleva, no qué va a hacer.** "Sales con tu
matriz sellada", no "vas a trabajar tu matriz". Saber el resultado antes de
empezar es lo que sostiene la tarea.

### Lista de pasos

Aparece al tocar Empezar. **Reemplaza a la tarjeta, no se agrega debajo.**

```
  ①  Elegí el lugar físico              ✓
  ②  Elegí la hora fija                 ✓
  ③  Sacá la foto con el cuaderno       ○  ← acá está
  ④  Escribí por qué empezaste          ·
  ⑤  Firmá el pacto                     ·
  ⑥  Publicá el pacto                   ·
```

- El paso actual en `--ink`, los hechos en `--ink3` con tilde verde, los que
  faltan en `--ink3` al 50%.
- **Solo el paso actual se puede tocar.** Los siguientes no son interactivos.
- Sin barra de porcentaje. La lista ya muestra dónde está.

### Bloque de evidencia

Cierra la sesión. Borde oro de un píxel, fondo `--oro-soft`.

```
┌──────────────────────────────┐
│ PARA CERRAR EL DÍA           │
│ Foto del búnker armado       │
│ [    Subir foto         ]    │
│                              │
│ Captura del pacto publicado  │
│ [    Subir captura      ]    │
└──────────────────────────────┘
```

Estados: `pendiente` neutro · `en_revision` con reloj y una línea de qué se está
mirando · `a_corregir` con borde `--tacha` y los tres puntos exactos ·
`aprobada` con tilde verde y qué se desbloqueó.

**El rechazo nunca dice "incorrecto".** Dice qué falta y dónde mirarlo.

### Tira de cinturón

En el encabezado de Hoy, a la derecha del día. 54 × 16, radio `--r3`, borde de un
píxel a 16% de negro. Si tiene punta, un rectángulo de 16 px del color de la
punta pegado al borde derecho.

**Al otorgarse:** la tira cambia de color con una transición de 400 ms, aparece
una línea con el significado del color y otra con qué se desbloqueó. **Sin
pantalla completa, sin confeti, sin sonido.** La seriedad es la recompensa.

### Tarjeta de campo

Borde punteado, fondo transparente. Tres acciones, cada una con guion de un píxel
en oro. **Nunca dice "día libre".**

### Panel de freno

Borde `--tacha`, fondo transparente. Tres líneas: qué está frenado, por qué, y
cuándo se abre.

```
La sesión de escalar está cerrada.
Tu campaña está aprendiendo quién es tu consultante.
Se abre el día 46 · faltan 9 días.
```

**Ningún candado sin las tres líneas.** Un candado mudo es lo que hace que alguien
cierre la app y no vuelva.

### Barra de la jornada

Tres bloques iguales, el actual con borde oro. Sin cronómetro, sin porcentaje.

---

## 6 · Movimiento

| Qué | Duración | Cuándo |
|---|---|---|
| Cambio de estado de un paso | 120 ms | Al tildar |
| Transición entre tabs | 0 | Instantáneo. **Sin deslizamiento** |
| Tarjeta a lista de pasos | 180 ms, fundido | Al tocar Empezar |
| Tira de cinturón | 400 ms, color | Al otorgar |
| Los dos números del día 87 | 1,2 s | **Única animación real de la app** |

`@media (prefers-reduced-motion: reduce)` desactiva las cinco. La app funciona
igual sin ninguna.

**Lo que no existe:** entradas con deslizamiento, aparición escalonada de
tarjetas, esqueletos que pulsan, contadores que suben solos, barras que se
llenan.

---

## 7 · Estados vacíos

Cada uno es una invitación a hacer, nunca una disculpa.

| Pantalla | Cuándo | Qué dice |
|---|---|---|
| Mando · Campañas | Antes del día 31 | La lista de control de lo que falta para encender, con enlace a cada sesión |
| Mando · Creativos | Antes del día 26 | "Tu primera pieza se escribe el día 26 con el Escriba." |
| Dojo | Día 1 y 2 | "El Espejo se abre mañana, cuando tengas tu número." |
| Ring | Antes del día 28 | "Acá van a quedar tus llamadas. La primera es contra el Sparring." |
| Cuaderno | Día 1 y 2 | "Esto es tuyo y no lo ve nadie. La primera entrada es tu número." |
| Bloque Dirigir | Semana 1 | "Todavía no hay nada acá, y está bien." |

---

## 8 · Errores

Tres reglas, y ninguna excepción.

1. **Dicen qué pasó, no que algo salió mal.** "No pudimos leer tu campaña desde
   Meta", no "Ha ocurrido un error".
2. **Ofrecen la salida en el mismo lugar.** Si falla la conexión, aparece el campo
   para cargar el número a mano, ahí mismo.
3. **Nunca frenan el camino.** Ninguna pantalla puede depender de que un tercero
   esté disponible.

---

## 9 · Piso de calidad

- Objetivo táctil mínimo 44 × 44.
- Contraste AA en todo. `--ink3` sobre `--card` da 4,6:1; no se usa para texto
  por debajo de 15 px.
- Foco de teclado visible: contorno oro de 2 px.
- Todo funciona en 430 px de ancho. **Se diseña en móvil primero**, porque el
  cliente abre la app entre consultante y consultante.
- Sin almacenamiento del navegador para datos del camino: todo va al servidor,
  porque la app se abre desde el teléfono y desde la computadora el mismo día.
- La app entra completa en una mano: los controles del pulgar en el tercio
  inferior.

---

## 10 · Lo que hay que corregir en el mockup actual

Lista puntual contra la versión que está hoy.

| Qué | Ahora | Debería |
|---|---|---|
| Etiqueta de tab | 12,5 px | 14 px |
| Kicker HOY | 13 px | 14 px |
| Tab ADN | Existe | Pasa al encabezado del Dojo |
| Tab Mentor | Existe | Se convierte en Dojo, con ocho agentes |
| Tab Mando | No existe | Se agrega |
| "3 de 5" en la barra | Cuenta sistemas | Bien, se queda |
| "75 sesiones" | En la nota | Son **91 jornadas**: 42 sesiones, 6 de protocolo, 2 rodajes, 10 de campo, 29 de ciclo |
| "Tu app · se abre cuando cobres" | Día 53 | **Día 50**, y el texto cambia: Mi Clínica ya la usa desde el día 2 |
| "Tu marca · Día 53" | Día 53 | **Día 61** |
| Sistema 4 | "Tu app" | **"Tu clínica adentro"**, con sus dos momentos |
| Tira de cinturón | No está | Va en el encabezado, a la derecha del día |
| Barra de la jornada | No está | Va debajo de la tarjeta de hoy |

---

## 11 · La prueba de las tres pantallas

Antes de dar por buena cualquier pantalla nueva, se pasa por esto.

**1 · La prueba de los tres segundos.** Alguien cansado la abre: ¿sabe qué hacer
sin leer? Si tiene que leer dos frases para entender qué se espera de él, la
pantalla está mal.

**2 · La prueba de la interrupción.** Se cierra la app a mitad de la pantalla y se
vuelve a abrir: ¿está exactamente donde estaba? Si perdió un paso, está mal.

**3 · La prueba del único botón.** ¿Cuántas cosas se pueden tocar? Si son más de
tres y una no es obviamente la principal, está mal.

**Ninguna pantalla de esta app necesita más de un botón importante.** Cuando
aparezca una que sí, es que hay dos pantallas adentro de una.
