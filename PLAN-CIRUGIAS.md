# PLAN DE 5 CIRUGÍAS — la app al máximo nivel

**Objetivo de fondo:** que el cliente arme, publique, mida y corrija sus campañas **solo**, que Lupe trabaje una cola de excepciones sin ser experta, que Marcos herede una base que se pueda optimizar sin adivinar, y que Javo salga de la operación.

Cada cirugía son **5 turnos**. Cada turno termina con: `tsc` 0 · build ✓ · batería en verde · verificadores en verde. Ningún turno se cierra sin eso.

---

## Lo que encontré antes de escribir esto

Tres hallazgos que ordenan las prioridades:

**1. El chat de campañas no cobra créditos.** El tope que instalamos vive en `api/ai/generate.ts`, pero `NuevaCampanaChat` usa `streamText` → `api/ai/stream.ts`, que no descuenta nada. **Es un canal de IA gratis e ilimitado.** Un cliente puede generar todo el día por ahí.

**2. Un solo proveedor para todas las tareas.** Hoy todo el texto va a DeepSeek con Claude de respaldo, sin importar si es un guion de venta, una clasificación en JSON o una auditoría. Tareas distintas quieren modelos distintos: escribir con voz no es lo mismo que mapear columnas.

**3. El Admin no supervisa: espeja.** La tab de Campañas del Admin monta el **mismo componente del cliente** con su id. Ve lo que ve el cliente. No hay una lente de supervisión — ni comparativa entre cuentas, ni "qué le falta a este", ni cola.

Y el fondo: **20 componentes y ~6.400 líneas en Campañas, y solo 4 tocan la IA.** El resto es formulario y galería. La fábrica está a medio construir.

---

# CIRUGÍA 1 · El motor
### Qué modelo hace cada trabajo, y que nada salga gratis

Es la base. Todo lo demás corre encima.

**El enrutador por tarea.** Hoy hay una sola cadena. Va a haber un mapa explícito:

| Tarea | Modelo | Por qué |
|---|---|---|
| Guiones, carruseles, copy de venta | **Claude Sonnet** | Voz y matiz. Tiene que sostener reglas de estilo largas sin aplanarse |
| Chat del Mentor y de campañas | **DeepSeek v4-pro** (respaldo Claude) | Volumen alto y conversacional. Es donde más tokens se van |
| Estructurar y clasificar (JSON, etiquetas, mapeos) | **Claude Haiku** | Barato y rápido. No necesita voz, necesita obedecer un esquema |
| **Auditar** una pieza contra los 8 ingredientes | **Claude Sonnet, como crítico aparte** | Que el que juzga NO sea el que escribió. Un modelo aprueba su propio texto casi siempre |
| Mirar un carrusel o una portada y decir si sirve | **Gemini 2.5 Flash** | Visión barata, y ya está conectado en `describe-image` |
| Generar imágenes | **gpt-image-2** | Ya está |
| Diagnóstico de números y dominó | **Ninguno — es código** | Es determinista y ya está construido. La IA solo redacta el "dónde mirar", nunca decide |

Esa última fila es la más importante del plan: **la IA no diagnostica.** Un modelo que opina sobre números da respuestas distintas el martes y el jueves. La regla decide; la IA explica.

| Turno | Qué entrega |
|---|---|
| 1.1 | El enrutador: `tarea → modelo`, con respaldo y registro de qué modelo respondió y cuánto costó |
| 1.2 | Cerrar el agujero de créditos: `stream.ts` cobra igual que `generate.ts`, y una lente permanente que revienta la batería si aparece otro endpoint de IA sin cobro |
| 1.3 | Qué pasa cuando la IA falla: reintento, mensaje claro al cliente, nunca una pantalla colgada ni un crédito cobrado sin resultado |
| 1.4 | Techo de gasto por cliente y por día, visible. Que nadie pueda quemar la cuenta de la API sin que se vea |
| 1.5 | Observabilidad: panel en el Admin con modelo, costo, fallas y latencia por cliente. **Sin esto Marcos optimiza a ciegas** |

---

# CIRUGÍA 2 · La fábrica de anuncios
### De las 18 fórmulas a tres piezas listas para publicar, sin ayuda

Lo que hoy existe: el Constructor genera 3 guiones desde el brief. Lo que falta es todo lo que va del guion a la pieza publicable.

**El principio:** el cliente no elige entre opciones — el cliente responde y la app arma. Las opciones matan al principiante.

| Turno | Qué entrega |
|---|---|
| 2.1 | La elección de las 3 fórmulas deja de ser un menú: la app las **propone** desde el ADN (con prueba propia o sin ella, marca personal o corporativa) y explica por qué esas tres |
| 2.2 | **La auditoría se vuelve bloqueante con arreglo.** Hoy marca lo que falta; ahora ofrece corregirlo: "falta la aclaración honesta — la escribo, ¿la ves?". Y el crítico es otro modelo, no el que generó |
| 2.3 | Chequeo de políticas de Meta antes de que salga: nada de afirmar atributos personales, nada de promesas garantizadas, sin lenguaje médico. Las reglas ya están escritas; falta aplicarlas |
| 2.4 | Del guion al **carrusel completo**: texto por lámina, portada y pie, con la palabra clave adentro. Y la versión de historias |
| 2.5 | El paquete listo: guion + caption + palabra clave + DM automático + página, todo junto, con un botón de copiar por pieza. **Que no tenga que armar nada a mano** |

---

# CIRUGÍA 3 · Encender y no tocar
### El montaje, la medición y las reglas que deciden por él

| Turno | Qué entrega |
|---|---|
| 3.1 | Los 8 candados del montaje, cada uno con **su herramienta al lado**: el que dice "DM automático listo" abre el generador de DM, no un tilde vacío |
| 3.2 | La carga diaria de 30 segundos y la semanal de 2 minutos, pensadas para el teléfono. Un número por pantalla, teclado numérico, sin scroll |
| 3.3 | Las reglas que ya decidimos, funcionando solas: 14 días sin tocar (según gasto), muerto a los 3 días sin conversaciones, ganador por costo por venta, refresco cada 2-4 semanas |
| 3.4 | **El testeo real:** 3 piezas, una campaña, y la app declara el ganador con su motivo. Cuando gana una, ofrece generar dos parecidas desde la misma fórmula |
| 3.5 | El historial: qué se probó, qué pasó con el número, ganador o perdedor. Sin esto nadie aprende de una semana a la otra |

---

# CIRUGÍA 4 · El puente
### Cómo llega la información y cómo trabaja Lupe sin ser experta

Acá está la parte que hoy no existe. **Lupe empezó hace dos meses.** El diseño tiene que asumir que no sabe de pauta y no tiene que aprender para servir.

| Turno | Qué entrega |
|---|---|
| 4.1 | La Mesa de plata **persiste**: correr el SQL, guardar la semana, historial por cliente y comparativa entre cuentas |
| 4.2 | La cola de excepciones: el trabajo del día ordenado por dinero en riesgo, con el veredicto y **la acción sugerida ya escrita**. Lupe ejecuta, no diagnostica |
| 4.3 | La lente de supervisión: dejar de espejar la vista del cliente. Una pantalla con los once en filas y su estado en columnas, lo rojo arriba |
| 4.4 | El camino de vuelta: cuando Lupe marca algo, que le llegue al cliente adentro de la app. Hoy eso pasa por WhatsApp y se pierde |
| 4.5 | Los avisos: qué se le manda al cliente solo (no subió historias, no contestó DMs) y qué escala a un humano. **La app empuja; Lupe solo atiende lo que la app no pudo** |

---

# CIRUGÍA 5 · Que aguante sin nosotros
### Robustez, traspaso y la base que hereda Marcos

| Turno | Qué entrega |
|---|---|
| 5.1 | Barrido de bugs con lentes nuevas sobre todo lo construido en las 4 cirugías anteriores |
| 5.2 | Los bordes: sin internet, con la sesión vencida, con Meta caído, con la IA caída, con datos a medias. Que ninguna de esas deje una pantalla muda |
| 5.3 | Móvil de verdad: recorrer los flujos completos en pantalla chica, que es donde vive el cliente |
| 5.4 | **La documentación de Marcos**: cómo funciona cada motor, dónde se toca, qué NO se toca y por qué. Con el mapa de las lentes de verificación |
| 5.5 | Verificación integral final sobre repo limpio, y el paquete de entrega |

---

## Actualización (26 jul) — el criterio confirmado

Javo cerró la duda: **el cliente es el operador siempre, Lupe es soporte.** La etapa actual es transición por ser el inicio; el destino es que Lupe y Marcos sostengan a todos.

Y fijó el criterio de costo: **si hace falta gastar más en API para que la app cueste más, se gasta** — porque reemplaza empleados. Un mes de una persona cuesta más que toda la IA de todos los clientes.

**Consecuencia para las cinco cirugías:** el techo de gasto de la cirugía 1 no es un freno, es un **medidor** — está para saber cuánto cuesta cada cliente, no para limitarlo. Y todo lo que hoy explica una persona tiene que entrar a la app, incluidos los tutoriales técnicos.

Ver `PLAN-OPERATIVO.md` para las dos poblaciones (los once actuales y los nuevos de $1.000 y $5.000) y la lista de lo que la app tiene que hacer sola antes de vender en volumen.

---

## Riesgos que veo, dichos antes de empezar

**El más grande: construir para Lupe en vez de para el cliente.** Vos pediste las dos cosas — que el cliente lo haga solo y que Lupe lo haga ahora. Si diseñamos para que Lupe opere, el cliente nunca se vuelve autónomo y el modelo no escala a veinte. **La regla que voy a seguir: el cliente es el operador, Lupe es quien atiende lo que se rompe.** Si en algún turno eso se me da vuelta, avisame.

**El segundo: la fecha.** Son 25 turnos. La ola 1 activa el 4 de agosto. Las cirugías 2 y 3 son las que tocan lo que esos clientes van a usar esa semana — **si hay que recortar, se recorta la 5, nunca la 2**.

**El tercero: el costo de la IA.** Todo lo de la cirugía 2 multiplica las llamadas por cliente. Por eso el enrutador y el techo de gasto van primero, en la cirugía 1, y no al final.

---

## El orden y por qué

1 → 2 → 3 → 4 → 5, sin saltos.

La **1** porque todo lo demás gasta IA y hoy hay un canal gratis abierto.
La **2** porque es lo que el cliente usa esta semana.
La **3** porque sin medición bien cargada, la 4 no tiene qué mostrar.
La **4** porque recién ahí hay datos que valga la pena poner en una cola.
La **5** al final porque endurece lo construido, no lo que falta construir.
