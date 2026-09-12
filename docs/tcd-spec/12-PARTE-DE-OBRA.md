# Parte de obra · deploy `mejoras`

Revisión de la app desplegada contra el paquete. Ordenado por gravedad, con la
causa de cada cosa y cómo se verifica que quedó arreglada.

**Cómo usar este archivo:** es lo que se le pasa al chat que construye. Cada
hallazgo dice qué se ve, contra qué regla del paquete va, qué hacer y cuándo se
da por cerrado.

---

## La causa raíz

**Tres de los cuatro problemas que se ven son el mismo: la app está corriendo el
seed viejo y la arquitectura vieja.** Los documentos se subieron al repo, pero la
etapa 0 de `MIGRACION.md` no se ejecutó.

La prueba está en la propia pantalla:

| Lo que muestra la app | Lo que dice el seed nuevo |
|---|---|
| Día 67 · "Tu Matriz ABC" · código **P2.3b** | Día 67 · "Las doce semanas escritas" · **P9.4** |
| La Matriz ABC como sesión propia | Sale de **P9.1**, día 61 |
| Cinturón **Amarillo** en el día 67 | **Rojo punta negra**, otorgado el día 55 |
| 20% de avance en el día 67 | 74% del calendario |
| Cinco tabs: Hoy · Camino · ADN · Mentor · Clínica | Hoy · Camino · **Dojo** · **Mando** · Clínica |
| Un solo Mentor | **Ocho agentes** |

**Hasta que no se reemplace `roadmapSeed.ts` y se siembre `roadmap.seed.json`,
cualquier otro arreglo es cosmético.** Ese es el primer trabajo y no lleva más de
un rato: no hay lógica nueva, hay datos nuevos.

---

# BLOQUEANTES

## B1 · Texto ilegible

**Qué se ve.** Al menos cuatro lugares con texto que no se lee sobre crema:

- "Tiempo de trabajo: 30:00 — puedes pausar cuando quieras, la app guarda todo"
- "Haces solo el paso esencial de hoy…" bajo el modo 15 minutos
- "TU GUÍA DEL CAMINO · CONOCE TU ADN COMPLETO" en el encabezado del Mentor
- El inicio de la lista del ADN, arriba de "Tu Historia"

**Causa.** Texto en blanco o en un token claro sobre `--bg` / `--card`. Medido:
**blanco sobre crema da 1,09:1.** El mínimo legible es 4,5:1.

**Qué hacer.** Buscar en el CSS todo `color:#fff`, `color:white` y
`color:var(--card)` aplicado a texto y reemplazar por el token que corresponda.

**Contraste real de los tokens**, medido sobre `--bg` y sobre `--card`:

| Token | sobre bg | sobre card | Uso permitido |
|---|---|---|---|
| `--ink` #2A2118 | 14,53 | 15,53 | Todo |
| `--ink2` #6E6252 | 5,47 | 5,85 | Todo |
| `--ink3` #9A8C78 | 3,02 | 3,23 | **Solo 15 px o más, y nunca para instrucciones** |
| `--oro` #B0822E | 3,18 | 3,40 | **Solo íconos, líneas y numerales. Nunca texto corrido** |
| `--oro-d` #8E6824 | 4,65 | 4,97 | Texto en oro |
| blanco | 1,09 | 1,02 | **Solo sobre el botón oro** |

**Regla que queda:** el único blanco de la app es el del texto adentro del botón
primario. En ningún otro lado.

**Cerrado cuando:** ningún texto de la app queda por debajo de 4,5:1, y `--oro`
no se usa para texto corrido en ninguna pantalla.

---

## B2 · El seed viejo

**Qué se ve.** Días, códigos, títulos y cinturones que no son los del paquete.

**Qué hacer.** Etapa 0 de `MIGRACION.md`:

```
src/lib/roadmap.seed.json   ← datos/roadmap.seed.json
src/lib/roadmapSeed.ts      ← datos/roadmapSeed.ts  (reemplaza el actual)
```

Y cambiar todo `.find()` sobre el array por `jornadaPorDia.get(dia)`.

**Cerrado cuando:** el día 67 muestra "Las doce semanas escritas", el día 61
muestra "Por qué la marca va última", y el cinturón del día 67 es rojo punta
negra.

---

## B3 · El ADN no se puede editar

**Qué se ve.** Cada tarjeta del ADN dice "Se completa en: Tu origen · el primer
día" con un botón **Ir** que lleva al Camino. Se pierde el hilo y no se puede
cambiar nada.

**Por qué está mal.** Va contra dos reglas del paquete: *nada se pide dos veces* y
*dos toques para llegar a cualquier lado*. Mandar al Camino es mandar a buscar.

**Qué hacer.**

1. **Todo campo del ADN se edita en su propia tarjeta**, ahí mismo, con un lápiz.
   Sin salir de la pantalla.
2. **"Ir" desaparece.** Lo reemplaza "Editar" en lo editable y "Se completa el
   día N" —como texto, sin botón— en lo que todavía no le tocó.
3. **El único campo sellado es el precio digno.** Y su tarjeta dice qué hacer:
   *"Sellado el día 9. Se cambia con el Espejo."* con el botón que abre al Espejo,
   no el Camino.
4. Si una sesión ya pasó y el campo quedó vacío, la tarjeta dice *"Quedó sin
   completar el día N"* y ofrece completarlo ahí.

**Cerrado cuando:** se puede editar cualquier campo del ADN sin cambiar de
pantalla, y ningún botón del ADN lleva al Camino.

---

# GRAVES

## G1 · La barra está a la izquierda

**Qué se ve.** Barra lateral fija con el nombre, el cinturón, cinco destinos y
"Contraer".

**Veredicto.** **Barra inferior en móvil, barra lateral en escritorio.** Mismos
cinco destinos, mismos nombres, en el mismo orden. El cliente abre la app entre
consultante y consultante, con el teléfono en una mano: los controles van en el
tercio inferior.

Punto de corte: 900 px. Abajo de eso, barra inferior y la barra lateral
desaparece. Arriba, barra lateral y la inferior desaparece.

**Y los destinos cambian**, que es lo que hoy no coincide:

| Hoy | Debe ser |
|---|---|
| Hoy | Hoy |
| Tu Camino | Tu Camino |
| **Tu ADN** | **Tu Dojo** — el ADN sube a su encabezado |
| **Tu Mentor** | *(se disuelve adentro del Dojo, con los ocho agentes)* |
| — | **Tu Mando** — Creativos · Campañas · Números |
| Tu Clínica | Tu Clínica |

**Cerrado cuando:** en un teléfono de 430 px la barra está abajo, son cinco, y
dicen Hoy · Tu Camino · Tu Dojo · Tu Mando · Tu Clínica.

---

## G2 · El Mentor arranca interpretando y culpando

**Qué se ve.** El Mentor abre con *"Javier, volviste. Me alegra verte de nuevo por
acá"* y sigue con *"No te voy a endulzar: el camino se retoma mejor si miramos la
pausa de frente. Si se ignora, después vuelve como culpa."*

**Por qué está mal.** Rompe tres reglas de `agentes/02-AGENTES.md` de una sola
vez: **ningún agente felicita al abrir**, **el Espejo nunca interpreta**, y
ninguno consuela ni nombra culpa. Alguien que volvió después de una pausa es
alguien que ya estaba por irse: la primera frase que lee no puede ser sobre la
pausa.

**Qué hacer.** El Mentor se reemplaza por el Dojo con los ocho agentes, cada uno
con el prompt de `agentes/prompts/`. Mientras eso llega, el Mentor actual arranca
en el trabajo:

> *Día 67. Hoy escribís tus doce semanas. ¿Por dónde querés empezar?*

Sin saludo, sin nombrar la ausencia, sin evaluar cómo viene.

**Cerrado cuando:** ningún agente saluda, felicita, interpreta ni menciona la
palabra culpa en su primer mensaje.

---

## G3 · No se ve qué falta grabar

**Qué se ve.** No hay forma de saber si una sesión tiene su video o si el archivo
todavía no existe.

**Qué hacer.** Estado explícito por pieza, visible en la sesión y en el Camino:

| Estado | Qué muestra la sesión |
|---|---|
| `disponible` | El reproductor |
| `pendiente` | Un bloque con el código de la pieza, su duración prevista y una línea: *"El video de esta sesión se está grabando. Los pasos y la evidencia funcionan igual."* |

**Y la sesión funciona sin el video.** Los pasos, la tarea y la evidencia se
completan igual, y el cinturón se otorga igual. El video es la mitad de la
sesión, no toda.

**En el modo admin**, una pantalla con las 43 piezas y los 21 tutoriales en tres
columnas: grabado, en rodaje, falta. Es tu tablero de producción.

**Cerrado cuando:** se puede recorrer el camino entero sin un solo video cargado,
y en cada sesión se ve cuál falta.

---

# DE EXPERIENCIA

## E1 · La emoción antes de empezar

**Qué se ve.** Seis opciones de emoción antes del botón Empezar, todos los días.

**El problema.** Es una decisión más antes de la tarea, y una autoevaluación
diaria que en un día malo agrega vergüenza. Va contra *una sola cosa por
pantalla* y contra *cero decisiones antes de empezar*.

**Veredicto.** **Sale de las sesiones comunes.** Queda solo en las diez jornadas
de protocolo, donde el estado emocional es el material de trabajo y el Espejo lo
usa. En esos diez días no es fricción: es el ejercicio.

---

## E2 · "Arranca el reloj"

**Qué se ve.** El botón dice *"Empezar — arranca el reloj"*, y arriba
*"Tiempo de trabajo: 30:00"*.

**El problema.** Un reloj que corre mientras trabaja es exactamente lo que el
paquete descarta: *tiempo visible, nunca punitivo*. Saber que son treinta minutos
antes de empezar ayuda. Verlos correr, no.

**Qué hacer.** El botón dice **Empezar** y nada más. La duración vive en el chip
de arriba, quieta. Sin cuenta regresiva, sin cronómetro a la vista. Si se quiere
medir cuánto tardó de verdad, se mide en silencio y se guarda en `progreso`.

---

## E3 · El modo 15 minutos · esto está bien y entra al paquete

**Qué se ve.** Un interruptor: *"Hoy tengo poco tiempo — modo 15 minutos"*.

**Veredicto: se queda, y se define mejor.** Es lo mejor que tiene el deploy actual
y no estaba en el paquete. Baja la energía de activación, que es exactamente el
problema de la cabeza a la que le hablamos.

Lo que hay que definir para que funcione:

1. **Cada jornada declara cuál es su paso esencial.** Uno solo, el que produce la
   evidencia. Va en el seed como `paso_esencial`.
2. **En modo 15 minutos se muestra solo ese paso**, y la evidencia.
3. **La racha y el avance cuentan igual.** Un día corto es un día hecho.
4. **Nunca se ofrece solo.** Aparece siempre, y el cliente decide.
5. **Lo que no se hizo no desaparece:** queda como "pendiente del día N" en la
   tarjeta de campo siguiente, sin reto.

Y el texto de abajo se reescribe legible y en positivo:

> *Hacés el paso que produce el resultado de hoy. Cuenta igual: un día corto
> mantiene la racha.*

---

## E4 · Vocabulario

**Qué se ve.** "el lenguaje de tu paciente".

**Qué hacer.** En toda la app: **consultante**, nunca paciente. Y nunca la palabra
**gente**: personas o consultantes.

Los nombres del ADN también se revisan. "Tu Herida Sanada" funciona con una
terapeuta y expulsa a un traumatólogo. Va con el criterio del paquete: *las
fuentes se usan, no se nombran.* Propuesta: **Tu Historia · Lo que atravesaste ·
Tus Dones · Tu Precio Digno**.

---

## E5 · El cinturón y el avance no dicen la verdad

**Qué se ve.** "Amarillo · Día 67 de 90 · 20%".

**Qué hacer.** El cinturón sale del último grado otorgado por evidencia, nunca
del día. Y el porcentaje se calcula sobre **jornadas completadas**, no sobre
sesiones de un total viejo. Si en el día 67 lleva 20%, el número está bien y el
problema es real: **lo que hay que mostrar al lado es qué lo trabó**, no un
porcentaje solo.

---

## Orden de trabajo

```
1  B2 · sembrar el seed nuevo            ← primero, todo lo demás depende
2  B1 · contraste, buscar todo el blanco
3  B3 · ADN editable en su tarjeta
4  G1 · barra inferior en móvil + los cinco destinos nuevos
5  G3 · placeholders de video
6  G2 · el Dojo con los ocho agentes
7  E1 a E5 · experiencia
```

**Los tres primeros son de un día de trabajo entre los tres** y son los que hacen
que la app deje de contradecir a su propio contenido.
