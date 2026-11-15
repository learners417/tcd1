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

### Las trece reglas

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

**12 · El día corto siempre está disponible.** Un interruptor de modo 15 minutos
en cada jornada: muestra solo el paso que produce la evidencia. **La racha y el
avance cuentan igual.** Bajar la energía de activación vale más que completar el
día entero, porque un día corto sostiene la racha y un día cero la rompe.

**13 · Una sola animación real en noventa días.** Los dos números del día 87,
apareciendo juntos. Todo lo demás son transiciones de estado de 120 ms o menos.

---

## 2 · Tokens

**Una sola piel.** Hasta el 15 de noviembre de 2026 la app tenía dos: la paleta
oscura de fábrica en los tokens y, encima, 206 reglas con `[data-theme="light"]`
que la tapaban una por una. Lo que se veía era la segunda, y bastaba una regla
nueva sin ese prefijo —o el interruptor de tema del Admin— para que asomara la
primera. Ya no hay compuerta de tema en ningún lado: los tokens de abajo SON la
piel, declarados una sola vez en `src/index.css`.

Los valores salen de la home (tuclinica.digital, `src/paisaje.css` del repo
`learners417/landings`) y de las tapas de los libros. Manda la home: la app, los
libros y el video se alinean a ella (claude/ARQUITECTURA-COLECCION.md §10).

```css
:root{
  /* superficie — el papel de la banda con la ficha de nieve encima */
  --bg-root:     #F1EBE0;   /* la página */
  --bg-card:     #FAF8F4;   /* la tarjeta, lo que se apoya encima */
  --bg-surface2: #E9E1D3;   /* el chip, la tarjeta de segundo plano */

  /* líneas */
  --line:  rgba(35, 32, 29, 0.14);
  --line2: rgba(35, 32, 29, 0.24);

  /* tinta */
  --text-cream: #23201D;   /* el texto. El nombre quedó del tema oscuro */
  --ink2:       #5A534C;   /* texto secundario */
  --ink3:       #6B635A;   /* meta, etiquetas */

  /* oro */
  --oro:    #A8875A;   /* la LÍNEA de 1 px, el borde, el ícono */
  --oro-d:  #7A5F33;   /* el TEXTO: versalitas y numerales */
  --oro-t2: #74551C;   /* y el texto cuando apoya sobre relleno de oro */

  /* semántico */
  --tilde:   #2F5638;   /* aprobado, tildado, entregado */
  --tacha:   #9C3626;   /* tachado, retirado, freno */
  --ventana: #7A6FA3;   /* grado en ventana, esperando */
  --color-espera: #1F6E6E;  /* la pelota la tiene el cliente */

  /* el botón primario: el azul lago de la home, no el oro */
  --tinta-boton: #2B4E68;  --papel-boton: #FFFFFF;

  /* un color por libro, el de su tapa */
  --paisaje-lago:    #2B4E68;
  --paisaje-montana: #904932;
  --paisaje-viento:  #B48B3F;   /* para texto chico sobre crema: #7F5B19 */
  --paisaje-rio:     #46979E;   /* para texto chico sobre crema: #1F6E6E */
  --paisaje-bosque:  #294637;
  --paisaje-sanadores: #3F5450;

  /* la pieza impresa: la única paleta que no sigue al papel (§2.3) */
  --color-pieza:       #141210;
  --color-pieza-oro:   #B0822E;
  --color-pieza-papel: #EAE4D9;

  /* letras: tres, con un papel cada una */
  --font-body:    'Manrope Variable';            /* lo que se MIRA y se toca */
  --font-lectura: 'Literata Variable';           /* lo que se LEE */
  --font-cita:    'Cormorant Garamond Variable'; /* lo que se CITA, en itálica */

  /* forma: tres esquinas y no nueve */
  --r:  12px;    /* la ficha */
  --r2: 24px;    /* la tarjeta */
  --r3: 999px;   /* el botón y el punto */
}
```

**El nombre de un token no es su valor.** `--text-cream`, `text-cream`, `bg-ink`
y `bg-panel` se escribieron cuando la app era negra y hoy significan lo
contrario de lo que dicen: `text-cream` es la TINTA y `bg-ink` es el PAPEL. Son
4.500 lugares del código; renombrarlos es un turno aparte. Mientras tanto vale
la regla de siempre: **el color sale de un token, nunca escrito a mano.**

### El grano

La textura de ruido al 4,5% en `multiply` que ya tiene la app **se queda y no se
toca**. En una pantalla de crema plana, el ojo no encuentra dónde apoyarse. El
grano da superficie sin dar decoración, y eso baja la fatiga de mirar.

### El oro

Dos valores y un escalón, que son los mismos de la home y de los libros:

| Dónde | Valor | Medido |
|---|---|---|
| La línea de 1 px, el borde, el ícono | `--oro` #A8875A | — |
| El texto en oro sobre el papel | `--oro-d` #7A5F33 | 5,6:1 |
| El texto en oro sobre una ficha de oro (10–15%) | `--oro-t2` #74551C | 5,2:1 |

El escalón existe por una razón medida: sobre la ficha de oro de la pestaña
elegida, `--oro-d` cae a 4,4:1 y AA pide 4,5. Se declara UNA vez en la hoja de
estilos, para el par `bg-gold/* + text-gold`, en lugar de tocarlo a mano en las
cincuenta fichas donde aparece.

**Nunca degradé, nunca brillo, nunca sombra dorada. Y nunca de relleno:** el
botón primario es el azul lago de la home, redondo y de 58 px de alto.

Sobre fondo oscuro el oro mate se apaga y se ve sucio. **Por eso esta app es
clara y no tiene modo oscuro.** Es una decisión, no una falta — y desde el 15 de
noviembre es también lo que dice el código: no queda ni un token oscuro debajo,
ni un interruptor que los despierte.

### La excepción: la pieza impresa

El certificado y la foto del día 90 no son pantallas: son piezas oscuras con
letra de oro, como un diploma, pensadas para sacarles captura y compartirlas.
Esas dos **no siguen al papel** y tienen sus tres tokens propios
(`--color-pieza*`). Medido: dentro de una de ellas, el oro de la app da 3,7:1 y
el de la pieza 5,4:1 sobre el mismo fondo.

---

## 3 · Tipografía

Tres familias, un papel cada una, sin excepción (ARQUITECTURA §10):

| Rol | Familia | Tamaño | Peso | Dónde |
|---|---|---|---|---|
| Título de sesión | Manrope | 33 / 28 | 700 | Tarjeta de hoy, encabezados |
| Título de sección | Manrope | 26 / 22 | 700 | Camino, Entrenadores, Campañas |
| Cuerpo | Literata | 17,5 | 400 | Descripciones, pasos |
| Cuerpo fuerte | Literata | 17,5 | 600 | Lo que no se puede saltear |
| Botón | Manrope | 18 | 700 | Primario |
| Chip y meta | Manrope | 15 | 400 | Duración, qué sella |
| Kicker | Manrope | 15 | 700 | HOY, versalita, `letter-spacing: .2em` |
| Etiqueta de tab | Manrope | 15 | 400 / 700 | Barra inferior |
| Cita | Cormorant Garamond itálica | 20 o más | 400 | Epígrafes y frases de página entera |

**Manrope no tiene itálica.** La que dibuja el navegador es falsa y se ve
barata: por eso los títulos van derechos y la cursiva vive en `.cita`, que nunca
baja de 20 px.

**Literata escribe lo que se lee; Manrope, lo que se mira.** Un párrafo largo en
la letra de interfaz se lee peor, y acá leer peor es abandonar.

**El único blanco de la app es el del texto adentro del botón primario.** Blanco
sobre crema da 1,09:1 y no se lee. Y `--oro` no se usa para texto corrido: para
eso está `--oro-d`.

**El piso son 15 píxeles**, y lo que dice qué hacer no baja de 17. En este repo
`text-xs` son 15 y `text-sm` son 17: la escala de Tailwind está redefinida en
`index.css`, y quien lea el nombre de la clase sin pasar por ahí va a "arreglar"
algo que está bien.

Ancho de línea: máximo 62 caracteres. En 430 px eso se da solo.

---

## 4 · Los cinco tabs

```
[ Hoy ]   [ Camino ]   [ Entrenadores ]   [ Campañas ]   [ Clínica ]
```

### Lo que cambia respecto de la app actual

| Antes | Ahora | Por qué |
|---|---|---|
| ADN | **Entrenadores** | El ADN sube al encabezado de Entrenadores. Deja de ser un destino y pasa a ser lo que los agentes leen |
| Mentor | **Entrenadores** | El Mentor era un agente suelto. Ahora son ocho, y viven juntos |
| — | **Campañas** | Creativos, Campañas y Números, con solapas |
| Hoy, Camino, Clínica | Igual | No se tocan |

**Ícono de Entrenadores:** el que hoy usa Mentor. **Ícono del Campañas:** la casa/hexágono
que hoy usa Clínica, y Clínica pasa al ícono de agenda. Es el cambio mínimo que
mantiene el reconocimiento.

### Dónde va la barra

**Abajo en móvil, al costado en escritorio.** Punto de corte 900 px. Mismos cinco
destinos, mismos nombres, mismo orden en los dos. El cliente abre la app entre
consultante y consultante con el teléfono en una mano: los controles van en el
tercio inferior.

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
│ Tu Matriz ABC                │  Manrope 33
│ El lenguaje exacto de tus    │  Literata 17,5 ink2
│ consultantes, en sus palabras│
│                              │
│ [⏱ 30 minutos] [✓ Sales con  │  chips
│  tu matriz sellada]          │
│                              │
│ [      Empezar      →    ]   │  botón azul lago, 58px de alto
└──────────────────────────────┘
```

**El segundo chip siempre dice qué se lleva, no qué va a hacer.** "Sales con tu
matriz sellada", no "vas a trabajar tu matriz". Saber el resultado antes de
empezar es lo que sostiene la tarea.

### Lista de pasos

Aparece al tocar Empezar. **Reemplaza a la tarjeta, no se agrega debajo.**

```
  ①  Elige el lugar físico              ✓
  ②  Elige la hora fija                 ✓
  ③  Saca la foto con el cuaderno       ○  ← aquí está
  ④  Escribe por qué empezaste          ·
  ⑤  Firma el pacto                     ·
  ⑥  Publica el pacto                   ·
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
| Campañas · Campañas | Antes del día 31 | La lista de control de lo que falta para encender, con enlace a cada sesión |
| Campañas · Creativos | Antes del día 26 | "Tu primera pieza se escribe el día 26 con Mateo." |
| Entrenadores | Día 1 y 2 | "El Espejo se abre mañana, cuando tengas tu número." |
| Ring | Antes del día 28 | "Acá van a quedar tus llamadas. La primera es contra Lucas." |
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
| Tab ADN | Existe | Pasa al encabezado de Entrenadores |
| Tab Mentor | Existe | Se convierte en Entrenadores, con nueve entrenadores |
| Tab Campañas | No existe | Se agrega |
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
